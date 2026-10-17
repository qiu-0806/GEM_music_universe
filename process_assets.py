# -*- coding: utf-8 -*-
"""一次性预处理（完成后可删除本脚本）：
- 背景图册 1~5：缩放至长边 1920，透明区域合成深色底，避免全屏露洞
- 图集图片 6~：长边不超过 1400（仅缩小，不放大），透明 PNG 保留透明
直接双击网页也能以合适尺寸显示，无需服务器运行时处理。
运行：python process_assets.py
"""
from PIL import Image
import os

BG_DIR = '背景图册'
GAL_DIR = '图集图片'
BG_EDGE = 1920
GAL_EDGE = 1400
DARK = (9, 10, 16, 255)
IMG_EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')


def is_transparent(im):
    return im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in (im.info or {}))


def process_bg():
    for name in sorted(os.listdir(BG_DIR)):
        if not name.lower().endswith(IMG_EXTS):
            continue
        p = os.path.join(BG_DIR, name)
        im = Image.open(p).convert('RGBA')
        w, h = im.size
        long = max(w, h)
        if long != BG_EDGE:
            s = BG_EDGE / long
            im = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
        base = Image.new('RGBA', im.size, DARK)
        im = Image.alpha_composite(base, im).convert('RGB')
        im.save(p, quality=88 if name.lower().endswith(('.jpg', '.jpeg')) else None)
        print('BG ', name, '->', im.size)


def process_gallery():
    for name in sorted(os.listdir(GAL_DIR)):
        if not name.lower().endswith(IMG_EXTS):
            continue
        p = os.path.join(GAL_DIR, name)
        im = Image.open(p)
        trans = is_transparent(im)
        im = im.convert('RGBA' if trans else 'RGB')
        w, h = im.size
        long = max(w, h)
        if long > GAL_EDGE:
            s = GAL_EDGE / long
            im = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
        if trans:
            im.save(p)
        else:
            im.convert('RGB').save(p, quality=88)
        print('GAL', name, '->', im.size)


if __name__ == '__main__':
    process_bg()
    process_gallery()
    print('done')
