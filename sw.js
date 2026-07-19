// sw.js — 英语奇遇记 Service Worker（离线缓存）
// 注意：所有路径用相对路径，兼容 GitHub Pages 子目录部署。
// 更新内容时，修改下面的版本号即可触发缓存刷新。
const CACHE_VERSION = 'ea-v0.4.0'; // V0.4 剑桥备考中心：版本必须 +1，否则前端永远拿旧缓存
const CACHE_NAME = `english-adventure-${CACHE_VERSION}`;

// 预缓存的核心文件（相对于 sw.js 所在目录，即项目根）
const PRECACHE_URLS = [
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
  './assets/js/games/card-collect.js',
  './assets/js/games/level-play.js',
  './assets/js/games/match-game.js',
  './assets/js/games/pet-game.js',
  './assets/js/games/shoot-game.js',
  './assets/js/modules/grammar.js',
  './assets/js/modules/levels.js',
  './assets/js/modules/pet.js',
  './assets/js/modules/reading.js',
  './assets/js/modules/recite.js',
  './assets/js/modules/reinforce.js',
  './assets/js/modules/words.js',
  './assets/js/modules/writing.js',
  './data/grammar/junior.json',
  './data/grammar/kindergarten.json',
  './data/grammar/primary.json',
  './data/reading/junior.json',
  './data/reading/kindergarten.json',
  './data/reading/primary.json',
  './data/words/grade1.json',
  './data/words/grade2.json',
  './data/words/grade3.json',
  './data/words/grade4.json',
  './data/words/grade5.json',
  './data/words/grade6.json',
  './data/words/grade7.json',
  './data/words/grade8.json',
  './data/words/grade9.json',
  './data/writing/samples.json',
  './data/writing/topics.json',
  './data/pet/topics.json',
  './data/pet/words/pet-food.json',
  './data/pet/words/pet-travel.json',
  './data/pet/words/pet-education.json',
  './data/pet/words/pet-work.json',
  './data/pet/words/pet-family.json',
  './data/pet/words/pet-health.json',
  './data/pet/words/pet-sport.json',
  './data/pet/words/pet-shopping.json',
  './data/pet/words/pet-weather.json',
  './data/pet/words/pet-environment.json',
  './data/pet/words/pet-technology.json',
  './data/pet/words/pet-entertainment.json',
  './data/pet/words/pet-house.json',
  './data/pet/words/pet-clothes.json',
  './data/pet/words/pet-feelings.json',
  './data/pet/words/pet-animals.json',
  './data/pet/words/pet-hobbies.json',
  './data/pet/words/pet-city.json',
  './data/pet/words/pet-money.json',
  './data/pet/words/pet-communication.json',
  './data/pet/words/pet-nature.json',
  './data/pet/words/pet-time.json',
  './data/pet/reading/index.json',
  './data/pet/reading/pet-reading-1.json',
  './data/pet/reading/pet-reading-2.json',
  './data/pet/reading/pet-reading-3.json',
  // === V0.4 剑桥备考中心 ===
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
  './data/exam/index.json',
  './data/exam/ket/facts.json',
  './data/exam/ket/plan-45day.json',
  './data/exam/ket/plan-longterm.json',
  './data/exam/ket/knowledge.json',
  './data/exam/ket/grammar-lessons.json',
  './data/exam/ket/grammar-inventory.json',
  './data/exam/ket/grammar-errors.json',
  './data/exam/ket/irregular-verbs.json',
  './data/exam/ket/reading-drills.json',
  './data/exam/ket/readers.json',
  './data/exam/ket/writing-guide.json',
  './data/exam/ket/listening.json',
  './data/exam/ket/mocks/index.json',
  './data/exam/ket/mocks/mock-01.json',
  './data/exam/ket/mocks/mock-02.json',
  './data/exam/ket/mocks/mock-03.json',
  './data/exam/ket/resources.json',
  './data/exam/ket/words/index.json',
  './data/exam/ket/words/ket-personal.json',
  './data/exam/ket/words/ket-home.json',
  './data/exam/ket/words/ket-school.json',
  './data/exam/ket/words/ket-food.json',
  './data/exam/ket/words/ket-shopping.json',
  './data/exam/ket/words/ket-clothes.json',
  './data/exam/ket/words/ket-body-health.json',
  './data/exam/ket/words/ket-daily.json',
  './data/exam/ket/words/ket-freetime.json',
  './data/exam/ket/words/ket-travel.json',
  './data/exam/ket/words/ket-places.json',
  './data/exam/ket/words/ket-weather-nature.json',
  './data/exam/ket/words/ket-animals.json',
  './data/exam/pet/facts.json',
  './data/exam/pet/mocks/index.json',
  './data/exam/pet/mocks/mock-01.json',
];

// install：预缓存核心文件。单个文件失败不应让整体 install 失败，逐个容错。
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
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

// activate：清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('english-adventure-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch：cache-first，未命中走网络并写入缓存；离线降级。
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // 只处理 GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  // CDN（Tailwind、Lucide 等）走运行时缓存
  const isCDN = /tailwindcss\.com|unpkg\.com|jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.hostname);

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
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
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
