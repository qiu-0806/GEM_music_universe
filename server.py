# -*- coding: utf-8 -*-
"""
G.E.M. 本地服务器：托管静态文件，并额外提供 /__list 接口动态列出文件夹图片；
同时对所有「背景图册 / 图集图片」里的图片在返回时自动缩放处理（含磁盘缓存），
因此你直接往文件夹里增删/替换图片，刷新网页即已更新且尺寸适配。

用法：
    python server.py            # 默认 8000 端口
    python server.py 8080       # 指定端口
"""
import os
import sys
import io
import json
import tempfile
import hashlib
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
IMAGE_EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif')
CACHE_DIR = os.path.join(tempfile.gettempdir(), 'gem_image_cache')
BG_MAX_EDGE = 1920      # 背景图：长边固定缩放至 1920（过小放大、过大缩小）
GALLERY_MAX_EDGE = 1400 # 图集图片：长边不超过 1400（仅缩小，保留原比例与透明）


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self._cache = 'no-store'
        super().__init__(*args, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/__list':
            self._cache = 'no-store'
            qs = urllib.parse.parse_qs(parsed.query)
            folder = qs.get('folder', [''])[0]
            base = os.path.join(ROOT, folder) if folder else ROOT
            files = []
            if os.path.isdir(base):
                for f in sorted(os.listdir(base)):
                    if f.lower().endswith(IMAGE_EXTS) and not f.startswith('.'):
                        rel = os.path.join(folder, f) if folder else f
                        files.append(rel.replace('\\', '/'))
            body = json.dumps(files, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(body)
            return

        # 图片自动处理：仅在两个图库目录内
        try:
            fs_path = self.translate_path(self.path)
        except Exception:
            fs_path = None
        if fs_path and os.path.isfile(fs_path) and fs_path.lower().endswith(IMAGE_EXTS):
            rel = os.path.relpath(fs_path, ROOT).replace('\\', '/')
            if rel.startswith('背景图册/') or rel.startswith('图集图片/'):
                self.serve_processed(fs_path, rel)
                return

        self._cache = 'no-store'
        super().do_GET()

    def serve_processed(self, fs_path, rel):
        is_bg = rel.startswith('背景图册/')
        max_edge = BG_MAX_EDGE if is_bg else GALLERY_MAX_EDGE
        ext = os.path.splitext(fs_path)[1].lower()
        cache_ext = '.jpg' if is_bg else ('.jpg' if ext in ('.jpg', '.jpeg') else '.png')
        key = hashlib.md5(rel.encode('utf-8')).hexdigest()
        cache_path = os.path.join(CACHE_DIR, key + cache_ext)

        data = None
        ctype = 'image/jpeg' if cache_ext == '.jpg' else 'image/png'
        # 磁盘缓存命中且原图未更新则直接返回
        if os.path.exists(cache_path) and os.path.getmtime(cache_path) >= os.path.getmtime(fs_path):
            with open(cache_path, 'rb') as f:
                data = f.read()

        if data is None:
            try:
                src = Image.open(fs_path)
                has_alpha = src.mode in ('RGBA', 'LA') or (src.mode == 'P' and 'transparency' in (src.info or {}))
                im = src.convert('RGBA' if has_alpha else 'RGB')
                w, h = im.size
                long = max(w, h)
                if is_bg:
                    im = im.convert('RGBA')
                    if long != max_edge:
                        s = max_edge / long
                        im = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
                    # 背景图：合成深色底，避免透明 PNG 全屏露洞
                    base = Image.new('RGBA', im.size, (9, 10, 16, 255))
                    im = Image.alpha_composite(base, im).convert('RGB')
                    buf = io.BytesIO()
                    im.save(buf, 'JPEG', quality=82)
                    data = buf.getvalue()
                    ctype = 'image/jpeg'
                else:
                    if long > max_edge:
                        s = max_edge / long
                        im = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
                    if has_alpha:
                        buf = io.BytesIO()
                        im.save(buf, 'PNG')
                        data = buf.getvalue()
                        ctype = 'image/png'
                    else:
                        im = im.convert('RGB')
                        buf = io.BytesIO()
                        im.save(buf, 'JPEG', quality=82)
                        data = buf.getvalue()
                        ctype = 'image/jpeg'
                os.makedirs(CACHE_DIR, exist_ok=True)
                with open(cache_path, 'wb') as f:
                    f.write(data)
            except Exception:
                with open(fs_path, 'rb') as f:
                    data = f.read()
                ctype = 'image/png' if ext == '.png' else 'image/jpeg'

        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        self.send_header('Cache-Control', self._cache)
        super().end_headers()

    def log_message(self, *args):
        pass  # 静默日志


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(ROOT)
    print(f'Serving {ROOT} at http://127.0.0.1:{port}/  (auto-resize 背景图册/图集图片)')
    try:
        ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
    except KeyboardInterrupt:
        pass
