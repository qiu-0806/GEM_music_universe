/* ===== G.E.M. Music Universe - Interactive Layer ===== */
/* 数据来自 albums.js：9 张专辑完整曲目 + 完整歌词 + QQ 音乐链接 */

const ALBUMS = window.GEM_ALBUMS || [];

// 背景图：简单编号 1~5（背景图册/1 ~ 5）；图集：编号 6~30，可少于 30（图集图片/6 ~ 30）。
// 直接双击 html 即可打开，无需服务器；缺失的编号会自动跳过。
const BG_IMAGES = [
  '背景图册/1.jpeg', '背景图册/2.jpeg', '背景图册/3.jpeg',
  '背景图册/4.jpeg', '背景图册/5.jpeg'
];

// 图集按编号 6..30 生成，加载时依次尝试常见扩展名，全部失败（编号不存在）则隐藏
const GALLERY_EXTS = ['.jpeg', '.jpg', '.png', '.webp', '.gif'];
const GALLERY_BASES = Array.from({ length: 25 }, (_, i) => String(6 + i)); // '6'..'30'
let FALLBACK_COVERS = BG_IMAGES;

// 图集图片加载失败（扩展名不对或该编号不存在）时，尝试下一个扩展名，全失败则隐藏
function gemImgNext(img, idx) {
  const n = GALLERY_BASES[idx];
  const cur = '.' + img.src.split('.').pop().split(/[#?]/)[0];
  const k = GALLERY_EXTS.indexOf(cur);
  if (k >= 0 && k < GALLERY_EXTS.length - 1) {
    img.src = `图集图片/${n}` + GALLERY_EXTS[k + 1];
  } else if (img.parentElement) {
    img.parentElement.style.display = 'none';
  }
}

const HIT_TITLES = [
  '泡沫', '来自天堂的魔鬼', '多远都要在一起', '句号', '倒数',
  'GLORIA', '天空没有极限', '再见', '夜的尽头', '你不是第一个离开的人'
];

/* 巡演数据：整理自公开报道（百度百科 / 灯塔专业版 / 歌手工作室公告） */
const TOUR_MILESTONES = [
  { date: '2023.12.07', title: '广州启程', desc: '巡演首站在广州天河体育场开唱，最初仅排期三场。' },
  { date: '2024 全年', title: '69 场体育场', desc: '全年完成 69 场体育场演出，动员观众近 300 万，成为中国演唱会市场年度票房冠军。' },
  { date: '2025.05.10', title: '2.0 温州首站', desc: '巡演 2.0 于温州奥体中心体育场起航，连唱两晚累计 7.2 万人。' },
  { date: '2025.08-09', title: '上海 12 连场', desc: '上海虹口足球场 8/29-31、9/5-7、9/12-14、9/19-21，最终连唱 12 场。' },
  { date: '2026.10.05', title: '深圳收官 · 吉尼斯', desc: '收官之夜获吉尼斯世界纪录现场认证，182 场刷新单轮巡演纪录。' }
];

const TOUR_CITIES = [
  { name: '广州', stage: 'first', note: '首站' },
  { name: '深圳', stage: 'first', note: '收官站' },
  { name: '上海', stage: 'first' },
  { name: '成都', stage: 'first' },
  { name: '长沙', stage: 'first' },
  { name: '佛山', stage: 'first' },
  { name: '天津', stage: 'first' },
  { name: '大连', stage: 'first' },
  { name: '太原', stage: 'first' },
  { name: '青岛', stage: 'first' },
  { name: '南京', stage: 'first' },
  { name: '郑州', stage: 'first' },
  { name: '福州', stage: 'first' },
  { name: '哈尔滨', stage: 'first' },
  { name: '台州', stage: 'first' },
  { name: '呼和浩特', stage: 'first' },
  { name: '合肥', stage: 'first' },
  { name: '温州', stage: 'v2', note: '2.0 首站' },
  { name: '衡阳', stage: 'v2' },
  { name: '贵阳', stage: 'v2' },
  { name: '石家庄', stage: 'v2' },
  { name: '常州', stage: 'v2' },
  { name: '烟台', stage: 'v2' },
  { name: '沈阳', stage: 'v2' },
  { name: '赣州', stage: 'v2' },
  { name: '上海', stage: 'v2', note: '12 连场' },
  { name: '成都', stage: 'v2' },
  { name: '徐州', stage: 'v2' },
  { name: '武汉', stage: 'v2' },
  { name: '福州', stage: 'v2' },
  { name: '南宁', stage: 'v2' },
  { name: '三亚', stage: 'v2' },
  { name: '广州', stage: 'v2' },
  { name: '厦门', stage: 'v2' },
  { name: '杭州', stage: 'v2' },
  { name: '新加坡', stage: 'v2', note: '海外' }
];

const QQ_SINGER = 'https://y.qq.com/n/ryqq/singer/001fNHEf1SFEFN';

/* ===== 工具 ===== */
const escapeHtml = str => String(str).replace(/[&<>"']/g, m => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
));

// 官方封面外链加载失败时，回退到本地图片
window.gemImgFallback = function (img) {
  img.onerror = null;
  img.src = FALLBACK_COVERS[Math.floor(Math.random() * FALLBACK_COVERS.length)];
};

// 小尺寸封面（用于列表头像，减少流量）
const thumb = url => String(url).replace('500x500', '300x300');

const ALL_TRACKS = ALBUMS.flatMap(album =>
  album.tracks.map(track => ({
    albumId: album.id,
    albumTitle: album.title,
    albumYear: album.year,
    albumCover: album.cover,
    title: track.title,
    qq: track.qq,
    lyric: track.lyric || ''
  }))
);

/* ===== 音乐库（专辑 / 歌词 双视图） ===== */
let currentView = 'albums';

function initLibraryFilters() {
  const select = document.getElementById('libraryAlbumFilter');
  select.innerHTML = '<option value="all">全部专辑</option>' +
    ALBUMS.map(a => `<option value="${a.id}">${escapeHtml(a.title)}（${a.year}）</option>`).join('');
}

function renderAlbumsView(albums) {
  const grid = document.getElementById('albumGrid');
  grid.innerHTML = albums.map(album => `
    <article class="album-card glass" data-id="${album.id}" tabindex="0" role="button" aria-label="打开专辑：${escapeHtml(album.title)}">
      <div class="album-cover">
        <img src="${album.cover}" alt="${escapeHtml(album.title)} 封面" loading="lazy" onerror="gemImgFallback(this)" />
        <div class="album-play" aria-hidden="true"><span>▶</span></div>
      </div>
      <div class="album-info">
        <div class="album-meta">
          <span class="album-year">${album.year}</span>
          <span class="album-type">${album.type === 'album' ? '录音室专辑' : 'EP'}</span>
        </div>
        <h3 class="album-title">${escapeHtml(album.title)}</h3>
        <p class="album-desc">${escapeHtml(album.desc)}</p>
        <div class="album-tags">${album.tags.map(t => `<span class="album-tag">${escapeHtml(t)}</span>`).join('')}</div>
        <div class="album-foot">
          <span>${album.tracks.length} 首曲目</span>
          <a href="${album.qqAlbum}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">QQ 音乐 ↗</a>
        </div>
      </div>
    </article>
  `).join('');
}

function renderLyricsView(tracks) {
  const grid = document.getElementById('lyricGrid');
  grid.innerHTML = tracks.map(t => `
    <article class="lyric-card glass">
      <div class="lyric-card-head">
        <img src="${thumb(t.albumCover)}" alt="" loading="lazy" onerror="gemImgFallback(this)" />
        <div>
          <div class="lyric-card-title">${escapeHtml(t.title)}</div>
          <div class="lyric-card-sub">${escapeHtml(t.albumTitle)} · ${t.albumYear}</div>
        </div>
      </div>
      <p class="lyric-preview">${escapeHtml(t.lyric || '暂无歌词')}</p>
      <div class="lyric-card-foot">
        <a class="link-btn rose" href="${t.qq}" target="_blank" rel="noopener noreferrer">在 QQ 音乐播放 ↗</a>
        <button class="link-btn" data-action="toggle">展开完整歌词</button>
      </div>
    </article>
  `).join('');
}

function renderLibrary() {
  const term = document.getElementById('librarySearch').value.trim().toLowerCase();
  const albumId = document.getElementById('libraryAlbumFilter').value;
  const category = document.querySelector('#albumFilters .filter-btn.active')?.dataset.filter || 'all';

  const albumGrid = document.getElementById('albumGrid');
  const lyricGrid = document.getElementById('lyricGrid');
  const empty = document.getElementById('libraryEmpty');
  const count = document.getElementById('libraryCount');
  const filterTags = document.getElementById('albumFilters');

  if (currentView === 'albums') {
    albumGrid.style.display = '';
    lyricGrid.style.display = 'none';
    filterTags.style.display = '';

    const albums = ALBUMS.filter(album => {
      const matchCategory = category === 'all' ||
        (category === 'hot' ? album.tags.includes('热门') : album.type === category);
      const matchAlbum = albumId === 'all' || album.id === albumId;
      const haystack = [album.title, album.year, album.desc, album.tags.join(' '),
        album.tracks.map(t => t.title).join(' ')].join(' ').toLowerCase();
      return matchCategory && matchAlbum && (!term || haystack.includes(term));
    });
    renderAlbumsView(albums);
    const songs = albums.reduce((n, a) => n + a.tracks.length, 0);
    count.textContent = `共 ${albums.length} 张专辑 · ${songs} 首曲目`;
    empty.style.display = albums.length ? 'none' : 'block';
  } else {
    albumGrid.style.display = 'none';
    lyricGrid.style.display = '';
    filterTags.style.display = 'none';

    const tracks = ALL_TRACKS.filter(t => {
      const matchAlbum = albumId === 'all' || t.albumId === albumId;
      const haystack = (t.title + ' ' + t.albumTitle + ' ' + t.lyric).toLowerCase();
      return matchAlbum && (!term || haystack.includes(term));
    });
    renderLyricsView(tracks);
    count.textContent = `共 ${tracks.length} 首歌曲`;
    empty.style.display = tracks.length ? 'none' : 'block';
  }
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('#viewSwitch .view-btn').forEach(btn => {
    const active = btn.dataset.view === view;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  renderLibrary();
}

/* ===== 专辑详情弹窗（完整曲目 + 完整歌词） ===== */
const modal = document.getElementById('albumModal');
const modalHeader = document.getElementById('modalHeader');
const modalBody = document.getElementById('modalBody');

function openAlbumModal(album) {
  modalHeader.innerHTML = `
    <div class="modal-cover">
      <img src="${album.cover}" alt="${escapeHtml(album.title)} 封面" onerror="gemImgFallback(this)" />
      <div class="modal-meta">
        <h3 id="modalTitle">${escapeHtml(album.title)}</h3>
        <p>${album.year} · ${album.type === 'album' ? '录音室专辑' : 'EP'} · ${album.tracks.length} 首曲目</p>
        <p style="margin-top:6px;">${escapeHtml(album.desc)}</p>
        <div class="modal-actions">
          <a class="btn btn-primary" href="${album.qqAlbum}" target="_blank" rel="noopener noreferrer">在 QQ 音乐播放专辑</a>
          <a class="btn btn-secondary" href="${album.wikiUrl}" target="_blank" rel="noopener noreferrer">维基百科</a>
        </div>
      </div>
    </div>
  `;

  modalBody.innerHTML = `
    <ul class="track-list" aria-label="${escapeHtml(album.title)} 曲目">
      ${album.tracks.map((track, idx) => `
        <li class="track-item" data-idx="${idx}">
          <div class="track-head" role="button" tabindex="0" aria-expanded="false">
            <span class="track-name"><span>${String(idx + 1).padStart(2, '0')}</span>${escapeHtml(track.title)}</span>
            <span class="track-actions">
              <button class="track-btn lyric" data-action="lyric">歌词</button>
              <a class="track-btn qq" href="${track.qq}" target="_blank" rel="noopener noreferrer">QQ 播放</a>
            </span>
          </div>
          <div class="track-lyric">${escapeHtml(track.lyric || '暂无歌词')}</div>
        </li>
      `).join('')}
    </ul>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modal.addEventListener('click', e => {
  if (e.target.id === 'modalBackdrop' || e.target.closest('#modalClose')) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

modalBody.addEventListener('click', e => {
  if (e.target.closest('a')) return;
  const item = e.target.closest('.track-item');
  if (!item) return;
  const open = item.classList.toggle('open');
  item.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', String(open));
});

modalBody.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const head = e.target.closest('.track-head');
  if (!head) return;
  e.preventDefault();
  head.click();
});

/* ===== 热门单曲 ===== */
function renderHits() {
  const items = HIT_TITLES
    .map(title => ALL_TRACKS.find(t => t.title === title || t.title.includes(title)))
    .filter(Boolean);

  document.getElementById('hitList').innerHTML = items.map((t, i) => `
    <li class="hit-item glass">
      <span class="hit-rank">${String(i + 1).padStart(2, '0')}</span>
      <img src="${thumb(t.albumCover)}" alt="" loading="lazy" onerror="gemImgFallback(this)" />
      <span class="hit-meta">
        <span class="hit-title">${escapeHtml(t.title)}</span>
        <span class="hit-album">${escapeHtml(t.albumTitle)} · ${t.albumYear}</span>
      </span>
      <a class="link-btn rose" href="${t.qq}" target="_blank" rel="noopener noreferrer">QQ 播放</a>
    </li>
  `).join('');
}

/* ===== 巡演 ===== */
const STAGE_LABEL = { first: '首轮', v2: '2.0' };

function renderMilestones() {
  document.getElementById('tourMilestones').innerHTML = TOUR_MILESTONES.map(m => `
    <article class="milestone glass">
      <span class="milestone-date">${escapeHtml(m.date)}</span>
      <h4 class="milestone-title">${escapeHtml(m.title)}</h4>
      <p class="milestone-desc">${escapeHtml(m.desc)}</p>
    </article>
  `).join('');
}

function renderCities() {
  const term = document.getElementById('tourSearch').value.trim().toLowerCase();
  const stage = document.querySelector('#tourStageFilter .filter-btn.active')?.dataset.stage || 'all';

  const filtered = TOUR_CITIES.filter(c => {
    const matchStage = stage === 'all' || c.stage === stage;
    return matchStage && (!term || c.name.toLowerCase().includes(term));
  });

  // 合并同名城市（同一城市可能横跨两个阶段）
  const map = new Map();
  filtered.forEach(c => {
    if (!map.has(c.name)) map.set(c.name, { name: c.name, note: c.note || '', stages: [] });
    const item = map.get(c.name);
    if (!item.stages.includes(c.stage)) item.stages.push(c.stage);
    if (c.note) item.note = c.note;
  });
  const list = [...map.values()];

  document.getElementById('cityWall').innerHTML = list.map(c => `
    <span class="city-chip">
      <span class="city-name">${escapeHtml(c.name)}</span>
      <span class="city-tags">
        ${c.stages.map(s => `<em>${STAGE_LABEL[s]}</em>`).join('')}
        ${c.note ? `<em class="hot">${escapeHtml(c.note)}</em>` : ''}
      </span>
    </span>
  `).join('');

  document.getElementById('tourCount').textContent = `共 ${list.length} 座城市（公开报道部分场次）`;
  document.getElementById('tourEmpty').style.display = list.length ? 'none' : 'block';
}

/* ===== 图集 ===== */
function renderGallery() {
  document.getElementById('galleryGrid').innerHTML = GALLERY_BASES.map((n, i) => `
    <div class="gallery-item">
      <img src="图集图片/${n}.jpeg" alt="G.E.M. 瞬间 ${n}" loading="lazy" onerror="gemImgNext(this,${i})" />
      <div class="gallery-overlay"><span>#${n}</span></div>
    </div>
  `).join('');
}

/* ===== 留言板 ===== */
const STORAGE_KEY = 'gem-guestbook';

function getGuestbook() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function renderGuestbook() {
  document.getElementById('guestbookList').innerHTML = getGuestbook().map(item => `
    <li class="guestbook-item">
      <div class="guestbook-author">${escapeHtml(item.name)}</div>
      <div class="guestbook-time">${new Date(item.time).toLocaleString('zh-CN')}</div>
      <div class="guestbook-text">${escapeHtml(item.message)}</div>
    </li>
  `).join('');
}

/* ===== 滚动渐变背景 ===== */
let bgIndex = -1;
let bgSlides = [];

function initBgSlides() {
  const container = document.getElementById('bgSlides');
  if (!container || !BG_IMAGES.length) return;
  container.innerHTML = BG_IMAGES.map((src, i) =>
    `<img src="${src}" alt="" loading="lazy" class="${i === 0 ? 'active' : ''}" />`).join('');
  bgSlides = [...container.querySelectorAll('img')];
  bgIndex = 0;

  const TH = 750; // 每滚动 750px 切换一张
  let ticking = false;
  const update = () => {
    const idx = ((Math.floor(window.scrollY / TH) % bgSlides.length) + bgSlides.length) % bgSlides.length;
    if (idx !== bgIndex) {
      bgSlides[bgIndex] && bgSlides[bgIndex].classList.remove('active');
      bgSlides[idx].classList.add('active');
      bgIndex = idx;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* ===== 导航 ===== */
function initNav() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  const btn = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('mobileDrawer');
  const toggle = () => {
    const open = drawer.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    btn.textContent = open ? '✕' : '☰';
  };
  btn.addEventListener('click', toggle);
  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => drawer.classList.contains('open') && toggle());
  });
}

/* ===== 初始化 ===== */
document.addEventListener('DOMContentLoaded', () => {
  // 概览
  document.getElementById('librarySummary').textContent =
    `${ALBUMS.length} 张专辑 · ${ALL_TRACKS.length} 首完整曲目 · 完整歌词，点击歌曲即可展开歌词并在 QQ 音乐播放。`;

  initLibraryFilters();
  renderLibrary();
  renderHits();
  renderMilestones();
  renderCities();
  renderGuestbook();
  initNav();
  renderGallery();
  initBgSlides();

  // 视图切换
  document.getElementById('viewSwitch').addEventListener('click', e => {
    const btn = e.target.closest('.view-btn');
    if (btn) setView(btn.dataset.view);
  });

  // 搜索与筛选
  document.getElementById('librarySearch').addEventListener('input', renderLibrary);
  document.getElementById('libraryAlbumFilter').addEventListener('change', renderLibrary);
  document.getElementById('albumFilters').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#albumFilters .filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    if (currentView !== 'albums') setView('albums');
    else renderLibrary();
  });

  // 专辑卡片 -> 弹窗
  document.getElementById('albumGrid').addEventListener('click', e => {
    const card = e.target.closest('.album-card');
    if (!card) return;
    const album = ALBUMS.find(a => a.id === card.dataset.id);
    if (album) openAlbumModal(album);
  });

  // 歌词卡片展开
  document.getElementById('lyricGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="toggle"]');
    if (!btn) return;
    const card = btn.closest('.lyric-card');
    const expanded = card.classList.toggle('expanded');
    btn.textContent = expanded ? '收起歌词' : '展开完整歌词';
  });

  // 巡演筛选
  document.getElementById('tourSearch').addEventListener('input', renderCities);
  document.getElementById('tourStageFilter').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#tourStageFilter .filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    renderCities();
  });

  // 随机歌词
  const lyricText = document.getElementById('lyricText');
  const lyricSong = document.getElementById('lyricSong');
  const qqLink = document.getElementById('lyricQQLink');

  document.getElementById('drawLyric').addEventListener('click', () => {
    const t = ALL_TRACKS[Math.floor(Math.random() * ALL_TRACKS.length)];
    if (!t) return;
    lyricText.textContent = (t.lyric || '').split('\n').slice(0, 4).join('\n') || '（暂无歌词）';
    lyricSong.textContent = `— 《${t.title}》· ${t.albumTitle}`;
    qqLink.href = t.qq;
  });

  // 留言
  document.getElementById('guestbookForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim() || '匿名棋士';
    const message = form.message.value.trim();
    if (!message) return;
    const list = getGuestbook();
    list.unshift({ name, message, time: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    renderGuestbook();
    form.reset();
  });
});
