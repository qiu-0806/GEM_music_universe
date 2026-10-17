# G.E.M 音乐宇宙

邓紫棋（G.E.M.）主题音乐图册网站。

## 功能
- 音乐专辑图册展示（背景图册 / 图集图片）
- 本地静态站点，含 `index.html`、`app.js`、`albums.js`、`style.css`
- `server.py` 提供本地预览服务
- `process_assets.py` 用于资源处理

## 本地运行
```bash
python server.py
# 然后浏览器打开 http://localhost:8000
```

## 目录结构
- `index.html` 页面入口
- `style.css` 样式
- `app.js` / `albums.js` 前端逻辑
- `背景图册/`、`图集图片/` 图片资源
- `server.py` 本地服务器
- `process_assets.py` 资源处理脚本
