// tools/smoke/preflight.mjs — 收尾自检统一入口（V0.9 P0.7 起）
// 一条命令跑完静态三查，P1-P7 每个批次收尾必跑：
//   ① tools/check-esm.mjs   真 ESM 解析 + import 图链接 + sw.js 经典脚本解析
//   ② tools/check-data.mjs  JSON Schema 校验 + data/ 全量中文编码守卫
//      （UTF-8 无 BOM / U+FFFD / mojibake 指纹 / 讲解文件 CJK 占比）
//   ③ sw.js 登记核对        新增的 data/grammar/gXX.json、data/reader/**/rXXX.json
//                            不需要登记（走运行时缓存）；但新增 JS 模块必须在 SHELL_URLS 里
//   ④ ketLessonMap 核对     index.json 里的 ketLessonMap 只是副本，唯一事实源是
//                            assets/js/utils/ket-hall-map.js；两处必须逐课一致（P2b 补丁）
//
// 之后再跑浏览器两件套（需起 verify-server）：/_smoke.html 路由回归、/_swcheck.html SW 行为。
//
// 用法：node tools/smoke/preflight.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.chdir(ROOT);
let failed = 0;

function run(name, args) {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) { failed++; console.error(`✘ ${name} 未通过`); }
}

run('check-esm', ['--experimental-vm-modules', 'tools/check-esm.mjs']);
run('check-data', ['tools/check-data.mjs']);

// ③ sw.js 登记核对：assets/js 下每个 .js 都应出现在 sw.js 里（壳文件全量预缓存）
const sw = readFileSync('sw.js', 'utf8');
const missing = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = path.join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) {
      const rel = './' + p.replace(/\\/g, '/');
      if (!sw.includes(`'${rel}'`)) missing.push(rel);
    }
  }
})('assets/js');
if (missing.length) {
  failed++;
  missing.forEach((m) => console.error(`✘ sw.js 未登记 JS 模块: ${m}（登记进 SHELL_URLS 并 bump 版本号）`));
} else {
  console.log('✔ sw.js 登记核对：assets/js 全部在列');
}

// ④ ketLessonMap 单一事实源核对：data/grammar/index.json 的副本必须与 ket-hall-map.js 一致。
//    （本仓库没有 package.json，.js 会被当 CJS，所以不能直接 import 那个浏览器模块，
//     改用 data: URL 以 ESM 方式加载源码——它是零 import 的纯常量模块，加载没有副作用。）
const MAP_FILE = 'assets/js/utils/ket-hall-map.js';
try {
  const src = readFileSync(MAP_FILE, 'utf8');
  const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
  const index = JSON.parse(readFileSync('data/grammar/index.json', 'utf8'));
  const norm = (v) => (Array.isArray(v) && v.length ? [...v].sort().join('+') : '(无)');
  const bad = [];
  for (const l of index.lessons || []) {
    const want = norm(mod.ketLessonsForHall(l.id));
    const got = norm(l.ketLessonMap);
    if (want !== got) bad.push(`${l.id}: index.json ${got} ≠ ${MAP_FILE} ${want}`);
  }
  // 反向：映射表里出现的大厅课号必须在索引里存在（防手滑写错课号）
  for (const id of Object.keys(mod.HALL_TO_KET)) {
    if (!(index.lessons || []).some((l) => l.id === id)) bad.push(`${id}: 映射表里有，但 index.json 没这一课`);
  }
  if (bad.length) {
    failed++;
    bad.forEach((b) => console.error(`✘ ketLessonMap 不一致 ${b}`));
    console.error(`  → 唯一事实源是 ${MAP_FILE}；改它之后同步 index.json 的 ketLessonMap（无映射写 null）`);
  } else {
    console.log(`✔ ketLessonMap 核对：index.json 与 ${MAP_FILE} 逐课一致（${index.lessons.length} 课）`);
  }
} catch (e) {
  failed++;
  console.error(`✘ ketLessonMap 核对失败: ${e.message}`);
}

if (failed) { console.error(`\npreflight 未通过（${failed} 项）`); process.exit(1); }
console.log('\n✔ preflight 全部通过（接下来跑浏览器两件套：_smoke.html / _swcheck.html）');
