// sw.js — 英语奇遇记 Service Worker
// 注意：所有路径用相对路径，兼容 GitHub Pages 子目录部署。
// 更新内容时，修改下面的版本号即可触发缓存刷新。
//
// V0.9 架构变更（P0）：由「全量预缓存」改为「壳预缓存 + 内容运行时缓存」。
//   原因：语法大厅 50 课（约 3200 题）与四阶读本 304 篇即将入库，若继续把 data/
//   下的内容文件全部塞进 install 阶段的预缓存清单，PWA 安装体积会爆炸、首次加载
//   会超时，手机上可能直接装不上。
//   现在：install 只装应用壳（HTML/CSS/JS/图标/manifest + 各 index.json 元信息），
//   data/ 下的内容文件改为 cache-first 的运行时缓存——访问过一次即写入，之后离线可读。
const CACHE_VERSION = 'ea-v0.9.33';
const SHELL_CACHE = `english-adventure-${CACHE_VERSION}`;
const CONTENT_CACHE = `english-adventure-content-${CACHE_VERSION}`;

// ① 应用壳：install 阶段全量预缓存（相对于 sw.js 所在目录，即项目根）
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/icon-192-maskable.png',
  './assets/images/icon-512-maskable.png',
  './assets/js/app.js',
  './assets/js/gamification.js',
  './assets/js/speech.js',
  './assets/js/storage.js',
  './assets/js/study-time.js',
  './assets/js/utils/shuffle.js',
  './assets/js/utils/lazy-data.js',
  './assets/js/utils/exam-season.js',
  './assets/js/utils/ket-hall-map.js',
  './assets/js/games/card-collect.js',
  './assets/js/games/level-play.js',
  './assets/js/games/match-game.js',
  './assets/js/games/pet-game.js',
  './assets/js/games/shoot-game.js',
  './assets/js/modules/grammar.js',
  './assets/js/modules/grammar-hall/hall.js',
  './assets/js/modules/grammar-hall/lesson.js',
  './assets/js/modules/levels.js',
  './assets/js/modules/pet.js',
  './assets/js/modules/reading.js',
  './assets/js/modules/recite.js',
  './assets/js/modules/reinforce.js',
  './assets/js/modules/study-stats.js',
  './assets/js/modules/words.js',
  './assets/js/modules/writing.js',
  './assets/js/modules/exam/exam-common.js',
  './assets/js/modules/exam/exam-hub.js',
  './assets/js/modules/exam/plan.js',
  './assets/js/modules/exam/knowledge.js',
  './assets/js/modules/exam/grammar-course.js',
  './assets/js/modules/exam/reading-drill.js',
  './assets/js/modules/exam/writing-lab.js',
  './assets/js/modules/exam/mock-exam.js',
  './assets/js/modules/exam/checkin.js',
  './assets/js/modules/exam/resources.js',
  './assets/js/modules/exam/report.js',
];

// ② 索引文件：体积小、每次进模块都要读，随壳一起预缓存，保证首次离线也能看见目录。
//    正文/题库一律不进这里（走运行时缓存）。
const INDEX_URLS = [
  './data/exam/index.json',
  './data/exam/exam-config.json', // P0.5 考试关键日期与目标分（三时钟读它，每次进备考中心都要）
  './data/exam/ket/words/index.json',
  './data/exam/ket/mocks/index.json',
  './data/exam/pet/mocks/index.json',
  './data/pet/reading/index.json',
  './data/pet/topics.json',       // PET 话题目录，功能上等同 index
  './data/grammar/index.json',    // V0.9 语法大厅索引
  './data/reader/index.json',     // V1.0 四阶读本索引
];

const PRECACHE_URLS = [...SHELL_URLS, ...INDEX_URLS];

// data/ 下的内容文件判定（索引除外——索引在壳缓存里）
const INDEX_PATHS = INDEX_URLS.map((u) => u.replace('./', '/'));
function isContentRequest(url) {
  if (!url.pathname.includes('/data/')) return false;
  return !INDEX_PATHS.some((p) => url.pathname.endsWith(p));
}

// install：预缓存应用壳。单个文件失败不应让整体 install 失败，逐个容错。
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW] 预缓存失败:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// activate：清理旧版本缓存（壳与内容两套都按前缀清）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('english-adventure-') && k !== SHELL_CACHE && k !== CONTENT_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch：
//   · data/ 内容文件 → 内容缓存 cache-first，未命中则联网并写入内容缓存
//   · 应用壳与 CDN   → 壳缓存 cache-first，行为同 V0.8
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  // CDN（Tailwind、Lucide 等）走运行时缓存
  const isCDN = /tailwindcss\.com|unpkg\.com|jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.hostname);

  if (isSameOrigin && isContentRequest(url)) {
    event.respondWith(handleContent(req));
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // 同源成功响应或 CDN 的可缓存响应才写入缓存
          const shouldCache =
            (isSameOrigin && res && res.status === 200 && res.type === 'basic') ||
            (isCDN && res && (res.ok || res.type === 'opaque'));
          if (shouldCache) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // 离线降级：导航请求回退到首页
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
    })
  );
});

// 内容文件：cache-first（命中即用），未命中联网并写入内容缓存；离线且无缓存返回 504。
async function handleContent(req) {
  const contentCache = await caches.open(CONTENT_CACHE);
  const hit = await contentCache.match(req);
  if (hit) return hit;

  // 兼容：旧版本可能把内容文件预缓存在壳缓存里
  const shellHit = await caches.match(req);
  if (shellHit) return shellHit;

  try {
    const res = await fetch(req);
    if (res && res.status === 200 && res.type === 'basic') {
      contentCache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

// 调试入口（开发用，不暴露在正式 UI）：
//   在控制台执行 window.__clearContentCache()（见 assets/js/utils/lazy-data.js），
//   或直接 navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CONTENT_CACHE' })
//   即可清空 data/ 内容缓存而不动应用壳，用于验证新内容是否真的被加载到。
self.addEventListener('message', (event) => {
  const msg = event.data || {};
  const reply = (payload) => {
    if (event.ports && event.ports[0]) event.ports[0].postMessage(payload);
  };

  if (msg.type === 'SKIP_WAITING') {
    self.skipWaiting();
    reply({ ok: true });
    return;
  }

  if (msg.type === 'CLEAR_CONTENT_CACHE') {
    event.waitUntil(
      caches.delete(CONTENT_CACHE).then((deleted) => {
        console.info('[SW] 内容缓存已清除:', deleted);
        reply({ ok: true, deleted, cache: CONTENT_CACHE });
      })
    );
    return;
  }

  if (msg.type === 'CACHE_INFO') {
    event.waitUntil(
      (async () => {
        const shell = await caches.open(SHELL_CACHE);
        const content = await caches.open(CONTENT_CACHE);
        reply({
          version: CACHE_VERSION,
          shellCount: (await shell.keys()).length,
          contentCount: (await content.keys()).length,
        });
      })()
    );
  }
});
