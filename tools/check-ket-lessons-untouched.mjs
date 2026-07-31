// tools/check-ket-lessons-untouched.mjs —— KET 八课「一个字不动」守卫（V0.9 P2b 起）
//
// 背景：语法八课是家长反复确认的考试最短路径，任何批次都不允许改它的讲解/例句/练习/措辞。
// 本脚本把当前数据与开工前的备份做**逐字段深比对**（不只比 hash），任何差异都列出路径。
//
// 用法：node tools/check-ket-lessons-untouched.mjs [备份目录]
//   默认备份目录：tools/backup/ket-lessons-before-p2b
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);
const BACKUP = process.argv[2] || 'tools/backup/ket-lessons-before-p2b';
const LIVE = 'data/exam/ket';

if (!existsSync(BACKUP)) { console.error(`✘ 备份目录不存在：${BACKUP}`); process.exit(1); }

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

// 深比对：返回差异路径列表（含类型/新增/删除/值变化）
function diff(a, b, at = '', out = []) {
  if (a === b) return out;
  const ta = Array.isArray(a) ? 'array' : a === null ? 'null' : typeof a;
  const tb = Array.isArray(b) ? 'array' : b === null ? 'null' : typeof b;
  if (ta !== tb) { out.push(`${at || '(root)'}: 类型 ${ta} → ${tb}`); return out; }
  if (ta === 'array') {
    if (a.length !== b.length) out.push(`${at}: 数组长度 ${a.length} → ${b.length}`);
    for (let i = 0; i < Math.max(a.length, b.length); i++) diff(a[i], b[i], `${at}[${i}]`, out);
    return out;
  }
  if (ta === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a)) { out.push(`${at}.${k}: 新增字段`); continue; }
      if (!(k in b)) { out.push(`${at}.${k}: 字段被删`); continue; }
      diff(a[k], b[k], `${at}.${k}`, out);
    }
    return out;
  }
  out.push(`${at}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
  return out;
}

// 讲解类字段统计（比对通过时打印规模，证明比的是真内容而不是空对象）
function countText(node, acc = { fields: 0, chars: 0 }) {
  if (typeof node === 'string') { acc.fields++; acc.chars += node.length; }
  else if (Array.isArray(node)) node.forEach((x) => countText(x, acc));
  else if (node && typeof node === 'object') Object.values(node).forEach((x) => countText(x, acc));
  return acc;
}

let failed = 0;
for (const f of readdirSync(BACKUP).filter((x) => x.endsWith('.json'))) {
  const before = path.join(BACKUP, f);
  const after = path.join(LIVE, f);
  if (!existsSync(after)) { console.error(`✘ ${f}：线上文件不存在`); failed++; continue; }
  const hashSame = sha(before) === sha(after);
  const ds = diff(readJSON(before), readJSON(after));
  const n = countText(readJSON(after));
  if (ds.length) {
    failed++;
    console.error(`✘ ${f}：${ds.length} 处字段差异`);
    ds.slice(0, 40).forEach((d) => console.error(`   · ${d}`));
    if (ds.length > 40) console.error(`   · …还有 ${ds.length - 40} 处`);
  } else {
    console.log(`✔ ${f}：逐字段 100% 一致（${n.fields} 个文本字段 / ${n.chars} 字；字节级 sha256 ${hashSame ? '一致' : '不一致⚠'}）`);
    if (!hashSame) { failed++; console.error(`✘ ${f}：字段相同但字节不同（格式/编码被改写），按未通过处理`); }
  }
}

if (failed) { console.error(`\n✘ KET 八课守卫未通过（${failed} 项）——立即回滚，不要提交`); process.exit(1); }
console.log('\n✔ KET 八课守卫通过：讲解内容零改动');
