// utils/lazy-data.js — 分片数据懒加载器（V0.9 P0）
//
// 背景：sw.js 已改为「壳预缓存 + data/ 运行时缓存」，内容文件不再随安装包下发。
// 语法大厅 50 课、读本 304 篇都是一课/一篇一个 JSON，进哪课才拉哪课。
//
// 职责：
//   ① fetch + JSON 解析，失败自动重试 1 次
//   ② 内存级 LRU（默认上限 8 个课文件），避免来回翻课时反复解析大 JSON
//   ③ 同一路径的并发请求合并成一次网络往返
//   ④ 加载中对外暴露骨架屏状态（isLoading / skeletonHTML）
//
// 本模块不 import 任何其他模块（app.js 反过来依赖它），避免循环依赖。

const MAX_LESSONS = 8;          // LRU 上限：只限制课/篇这类大文件
const lru = new Map();          // path -> data（Map 迭代序即插入序，用来淘汰最旧的）
const permanent = new Map();    // 索引等小文件常驻，不参与淘汰
const inflight = new Map();     // path -> Promise，并发合并
const loading = new Set();      // 正在加载的 path，供骨架屏判断

// === 基础 fetch（失败重试 1 次）===
async function fetchJSON(path, retried = false) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    if (!retried) return fetchJSON(path, true);
    throw e;
  }
}

/**
 * 通用加载：命中缓存直接返回，否则联网。
 * @param {string} path 相对项目根的路径，如 data/grammar/g01.json
 * @param {{lru?: boolean}} opts lru=true 走 8 个上限的淘汰池（课/篇），否则常驻（索引）
 * @returns {Promise<any|null>} 失败返回 null（不抛，由调用方决定怎么提示）
 */
export async function loadData(path, opts = {}) {
  const useLru = opts.lru === true;
  const store = useLru ? lru : permanent;

  if (store.has(path)) {
    if (useLru) {                       // 命中即刷新为最近使用
      const v = store.get(path);
      store.delete(path);
      store.set(path, v);
    }
    return store.get(path);
  }
  if (inflight.has(path)) return inflight.get(path);

  loading.add(path);
  const task = fetchJSON(path)
    .then((data) => {
      store.set(path, data);
      if (useLru && store.size > MAX_LESSONS) {
        store.delete(store.keys().next().value); // 淘汰最旧的一个
      }
      return data;
    })
    .catch((e) => {
      console.error('[lazy-data] 加载失败:', path, e);
      return null;
    })
    .finally(() => {
      loading.delete(path);
      inflight.delete(path);
    });

  inflight.set(path, task);
  return task;
}

// === 索引 ===
const INDEX_PATHS = {
  grammar: 'data/grammar/index.json',
  reader: 'data/reader/index.json',
};

/**
 * 加载索引（只含元信息，随应用壳预缓存，离线首次也能读）。
 * @param {'grammar'|'reader'} type
 */
export function loadIndex(type) {
  const path = INDEX_PATHS[type];
  if (!path) return Promise.reject(new Error('未知索引类型: ' + type));
  return loadData(path);
}

// === 语法大厅单课 ===
/**
 * @param {string} id 课号 G01-G50（大小写不敏感）
 * @returns {Promise<object|null>}
 */
export async function loadGrammarLesson(id) {
  const key = normalizeId(id, 'G', 2);
  if (!key) return null;
  const index = await loadIndex('grammar');
  const meta = index && (index.lessons || []).find((l) => l.id === key);
  const file = meta ? stripDot(meta.file) : `data/grammar/${key.toLowerCase()}.json`;
  return loadData(file, { lru: true });
}

// === 读本单篇 ===
/**
 * @param {string} id 篇号 r001-r304（大小写不敏感）
 * @returns {Promise<object|null>}
 */
export async function loadReaderPiece(id) {
  const key = normalizeId(id, 'r', 3);
  if (!key) return null;
  const index = await loadIndex('reader');
  const meta = index && (index.pieces || []).find((p) => p.id === key);
  if (!meta) return null; // 读本不做路径猜测：篇号必须在索引里登记（source 字段随索引一起可追溯）
  return loadData(stripDot(meta.file), { lru: true });
}

function normalizeId(id, prefix, digits) {
  const m = String(id || '').match(/^([A-Za-z])?(\d+)$/);
  if (!m) return null;
  return prefix + String(m[2]).padStart(digits, '0');
}

function stripDot(p) {
  return String(p).replace(/^\.\//, '');
}

// === 骨架屏 ===
/** 某个路径是否正在加载中 */
export function isLoading(path) {
  return loading.has(path);
}

/**
 * 加载中的占位 HTML（卡通风格，与 card-cartoon 一致）。
 * @param {number} rows 骨架条数
 */
export function skeletonHTML(rows = 3) {
  const bars = Array.from({ length: rows }, (_, i) => {
    const w = [92, 76, 84, 68][i % 4];
    return `<div style="height:14px;width:${w}%;border-radius:8px;background:#EEE;margin:10px 0;animation:lazySkeleton 1.2s ease-in-out ${i * 0.12}s infinite"></div>`;
  }).join('');
  return `
    <style>@keyframes lazySkeleton{0%,100%{opacity:.45}50%{opacity:.9}}</style>
    <div class="card-cartoon" aria-busy="true" aria-live="polite">
      <div style="height:20px;width:44%;border-radius:8px;background:#FFE0CC;margin-bottom:14px;animation:lazySkeleton 1.2s ease-in-out infinite"></div>
      ${bars}
      <div class="text-xs text-gray-400 mt-2">正在加载…</div>
    </div>
  `;
}

// === 缓存管理 ===
/** 清空内存缓存（不动 Service Worker 的磁盘缓存） */
export function clearMemoryCache() {
  lru.clear();
  permanent.clear();
}

export function cacheStats() {
  return { lessons: lru.size, permanent: permanent.size, loading: [...loading] };
}

// 调试入口（仅开发用，不出现在正式 UI）：控制台执行 __clearContentCache()
// 会清掉 SW 的 data/ 内容缓存 + 本模块内存缓存，用于验证新内容确实被重新拉取。
if (typeof window !== 'undefined') {
  window.__clearContentCache = function () {
    clearMemoryCache();
    const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (!sw) {
      console.info('[lazy-data] 内存缓存已清，未检测到 Service Worker');
      return Promise.resolve({ ok: true, sw: false });
    }
    return new Promise((resolve) => {
      const ch = new MessageChannel();
      ch.port1.onmessage = (e) => { console.info('[lazy-data] 内容缓存已清:', e.data); resolve(e.data); };
      sw.postMessage({ type: 'CLEAR_CONTENT_CACHE' }, [ch.port2]);
    });
  };
  window.__cacheInfo = function () {
    const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (!sw) return Promise.resolve({ memory: cacheStats(), sw: false });
    return new Promise((resolve) => {
      const ch = new MessageChannel();
      ch.port1.onmessage = (e) => resolve({ memory: cacheStats(), ...e.data });
      sw.postMessage({ type: 'CACHE_INFO' }, [ch.port2]);
    });
  };
}
