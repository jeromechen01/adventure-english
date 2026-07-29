// tools/smoke/verify-server.mjs — 浏览器实跑自检用的本地服务器（V0.9 P0 起）
//
// 为什么不用 npx http-server：本机 python 是商店 stub，而 http-server 又没法「一键断网」，
// 无法验证 Service Worker 的离线能力。这个服务器多了三个开关：
//   GET  /__offline  → 之后所有静态请求直接断开连接（等价 DevTools 的 Offline）
//   GET  /__online   → 恢复联网
//   POST /__result   → 页面把自检结果回传，落盘成 JSON（无头浏览器读不到 console，走这条路）
//
// 两个自检页放在本目录，但对外映射到站点根 URL（/_smoke.html、/_swcheck.html），
// 这样页面里的相对路径与 Service Worker 的作用域都跟线上一致。
//
// 用法：
//   node tools/smoke/verify-server.mjs <结果文件路径>        # 后台起，默认端口 8100
//   chrome --headless=new --user-data-dir=%TEMP%\eap http://127.0.0.1:8100/_smoke.html
//
// ⚠️ 坑：--user-data-dir 必须用**短路径**（如 %TEMP%\eap）。放在很深的临时目录下，
//    Chrome 的 CacheStorage 目录会超 MAX_PATH，表现为 caches.put 抛
//    "Entry already exists" / "Unexpected internal error"，看起来像 sw.js 的 bug，其实不是。
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = process.argv[2] || path.join(HERE, 'result.json');
const PORT = Number(process.argv[3] || 8100);
let offline = false;

// 自检页映射到根 URL，保证相对路径与 SW 作用域和线上一致
const ALIAS = {
  '/_smoke.html': 'tools/smoke/smoke.html',
  '/_swcheck.html': 'tools/smoke/sw-check.html',
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const p = decodeURIComponent(url.pathname);

  if (p === '/__offline') { offline = true; console.log('[verify] 断网'); res.writeHead(200).end('offline'); return; }
  if (p === '/__online') { offline = false; console.log('[verify] 恢复'); res.writeHead(200).end('online'); return; }
  if (p === '/__result') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      await writeFile(OUT, body);
      res.writeHead(200).end('ok');
      console.log('[verify] 结果已写入', OUT);
    });
    return;
  }

  if (offline) { req.socket.destroy(); return; }

  const rel = ALIAS[p] || (p === '/' ? 'index.html' : p.replace(/^\//, ''));
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  try {
    const buf = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    }).end(buf);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`[verify] http://127.0.0.1:${PORT}  结果 → ${OUT}`));
