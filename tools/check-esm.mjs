// tools/check-esm.mjs — 真·ESM 校验（V0.8.1 起替代 node --check 做 JS 自检）
// 用法：node --experimental-vm-modules tools/check-esm.mjs
// ① 每个文件按 ES Module 完整解析（node --check 对 ESM 检查不完整，会漏括号类错误）
// ② 从各入口 link 整张 import 图：模拟浏览器的模块解析——路径能否找到、
//    import 的具名导出在目标模块里是否存在。只解析+链接，不执行（无 DOM 也能跑）。
import vm from 'node:vm';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

if (typeof vm.SourceTextModule !== 'function') {
  console.error('请用 node --experimental-vm-modules tools/check-esm.mjs 运行');
  process.exit(2);
}

const files = [];
(function walk(d) {
  readdirSync(d).forEach(f => {
    const p = path.join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js')) files.push(p);
  });
})('assets/js');

const context = vm.createContext({});
const cache = new Map();
let failed = 0;

// ① 逐文件 ESM 语法解析
function load(file) {
  const key = path.resolve(file);
  if (cache.has(key)) return cache.get(key);
  const src = readFileSync(key, 'utf8');
  const mod = new vm.SourceTextModule(src, { identifier: pathToFileURL(key).href, context });
  cache.set(key, mod);
  return mod;
}

for (const f of files) {
  try {
    load(f);
  } catch (e) {
    failed++;
    console.error(`✘ 语法错误 ${f}: ${e.message}`);
    cache.set(path.resolve(f), null);
  }
}
console.log(`① ESM 语法解析：${files.length} 个文件，${failed ? failed + ' 个失败' : '全部通过'}`);

// ② 全图 link（解析 import 路径 + 校验具名导出存在）
function linker(specifier, referencingModule) {
  const target = fileURLToPath(new URL(specifier, referencingModule.identifier));
  const mod = load(target);
  if (!mod) throw new Error(`依赖有语法错误: ${specifier}`);
  return mod;
}

let linkFailed = 0;
for (const f of files) {
  const mod = cache.get(path.resolve(f));
  if (!mod) continue;
  if (mod.status !== 'unlinked') continue; // 已随其他入口链接过
  try {
    await mod.link(linker);
  } catch (e) {
    linkFailed++;
    console.error(`✘ 模块链接失败（入口 ${f}）: ${e.message}`);
  }
}
console.log(`② import 图链接：${linkFailed ? linkFailed + ' 处失败' : '全部通过（路径与具名导出均有效）'}`);

// ③ sw.js 是经典脚本（非模块），单独做普通解析
try {
  new vm.Script(readFileSync('sw.js', 'utf8'), { filename: 'sw.js' });
  console.log('③ sw.js 经典脚本解析：通过');
} catch (e) {
  failed++;
  console.error(`✘ sw.js 语法错误: ${e.message}`);
}

if (failed + linkFailed) { console.error(`共 ${failed + linkFailed} 处问题`); process.exit(1); }
console.log('✔ ESM 校验全部通过');
