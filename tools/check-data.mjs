// tools/check-data.mjs — 数据文件 Schema 校验 + 中文编码守卫（V0.9 P0 起，P0.7 加编码检测）
// 用法：
//   node tools/check-data.mjs                 校验两个索引文件 + data/ 全量编码扫描
//   node tools/check-data.mjs data/grammar/g01.json   按 id 前缀自动选 schema 校验单个文件（编码扫描仍是全量）
//
// 实现了 JSON Schema draft-07 的常用子集（type / required / properties / items /
// enum / const / pattern / minimum / maximum / minItems / maxItems / minLength /
// maxLength / $ref 同文档内引用）。不引第三方依赖，本机无需 npm install。
//
// ⚠️ 编码守卫（P0.7）为什么必须有：PowerShell 管道/重定向会把 UTF-8 按系统码页（GBK）
// 静默转坏，乱码后仍是合法 JSON 字符串、能通过 Schema 校验——只有专门检测才能拦住。
// 中文内容文件一律 node 读写（fs.writeFileSync(path, str, 'utf8')，无 BOM）。
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const errors = [];
const warnings = [];

function typeOk(v, t) {
  if (Array.isArray(t)) return t.some((x) => typeOk(v, x));
  switch (t) {
    case 'object': return v !== null && typeof v === 'object' && !Array.isArray(v);
    case 'array': return Array.isArray(v);
    case 'string': return typeof v === 'string';
    case 'integer': return Number.isInteger(v);
    case 'number': return typeof v === 'number';
    case 'boolean': return typeof v === 'boolean';
    case 'null': return v === null;
    default: return true;
  }
}

function resolveRef(ref, root) {
  // 只支持 #/a/b 形式的同文档引用
  return ref.replace(/^#\//, '').split('/').reduce((acc, k) => (acc ? acc[k] : undefined), root);
}

function validate(value, schema, root, at) {
  if (!schema) return;
  if (schema.$ref) return validate(value, resolveRef(schema.$ref, root), root, at);

  const err = (msg) => errors.push(`${at}: ${msg}`);

  if (schema.const !== undefined && value !== schema.const) err(`应为常量 ${JSON.stringify(schema.const)}，实为 ${JSON.stringify(value)}`);
  if (schema.enum && !schema.enum.includes(value)) err(`应为 ${JSON.stringify(schema.enum)} 之一，实为 ${JSON.stringify(value)}`);
  if (schema.type && !typeOk(value, schema.type)) { err(`类型应为 ${schema.type}，实为 ${Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value}`); return; }

  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) err(`不匹配 /${schema.pattern}/：${JSON.stringify(value)}`);
    if (schema.minLength !== undefined && value.length < schema.minLength) err(`长度 ${value.length} < minLength ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) err(`长度 ${value.length} > maxLength ${schema.maxLength}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) err(`${value} < minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) err(`${value} > maximum ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) err(`元素数 ${value.length} < minItems ${schema.minItems}`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) err(`元素数 ${value.length} > maxItems ${schema.maxItems}`);
    if (schema.items) value.forEach((v, i) => validate(v, schema.items, root, `${at}[${i}]`));
  }
  if (typeOk(value, 'object')) {
    (schema.required || []).forEach((k) => {
      if (!(k in value)) err(`缺少必填字段 "${k}"`);
    });
    Object.entries(schema.properties || {}).forEach(([k, sub]) => {
      if (k in value) validate(value[k], sub, root, `${at}.${k}`);
    });
  }
}

function readJSON(f) {
  try {
    return JSON.parse(readFileSync(f, 'utf8'));
  } catch (e) {
    errors.push(`${f}: JSON 解析失败 — ${e.message}`);
    return null;
  }
}

// 按文件路径挑 schema
function schemaFor(file) {
  const p = file.replace(/\\/g, '/');
  if (p.endsWith('data/grammar/index.json')) return 'data/grammar/_schema.index.json';
  if (p.endsWith('data/reader/index.json')) return 'data/reader/_schema.index.json';
  if (/data\/grammar\/g\d{2}\.json$/.test(p)) return 'data/grammar/_schema.lesson.json';
  if (/data\/reader\/v[1-4]\/r\d{3}\.json$/.test(p)) return 'data/reader/_schema.piece.json';
  return null;
}

// ============================================================
// 编码守卫（P0.7）：data/ 下所有 .json 全量扫描
// ============================================================

// 典型 mojibake 特征串：UTF-8 字节被按 Latin-1 / GBK 再解读后的产物。
//  - UTF-8 中文三字节 E4-E9 开头 → Latin-1 里变成 ä å æ ç è é 后跟杂符；
//    全角标点（EF BC/BD 开头）→ ï¼ / ï½；BOM → ï»¿
//  - Ã/Â 连串是「UTF-8 当 Latin-1 读」的通用指纹
const MOJIBAKE_PATTERNS = [
  { re: /[ÃÂ][-¿Œœ‘’“”†‡ˆ‰Š‹š›Ÿ]/, why: 'UTF-8 被按 Latin-1 解读（Ã/Â 指纹）' },
  { re: /[äåæçèé][¸-¿][-ÿ]/, why: 'UTF-8 中文三字节被拆读' },
  { re: /ï¼|ï½|ï»¿/, why: 'UTF-8 全角标点/BOM 被按 Latin-1 解读' },
  { re: /æ˜|ä¸|å­|è¯|ç»|é¢˜/, why: 'UTF-8 中文被按 Latin-1/GBK 解读的高频指纹' },
  { re: /鐨д|鎴戔|閿欒|涓枃|璇硶/, why: 'UTF-8 被按 GBK 解读的高频指纹' },
];

function walkJSON(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walkJSON(p, out);
    else if (f.endsWith('.json')) out.push(p);
  }
  return out;
}

function lineOf(str, index) {
  let line = 1;
  for (let i = 0; i < index && i < str.length; i++) if (str[i] === '\n') line++;
  return line;
}

function checkEncoding(file) {
  const buf = readFileSync(file);

  // a) UTF-8 必须无 BOM
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    errors.push(`${file}: 开头有 UTF-8 BOM（EF BB BF）——用 node 写入（fs.writeFileSync(…,'utf8') 不带 BOM），别用 PowerShell 重定向`);
  }

  const text = buf.toString('utf8');

  // b) 替换字符 U+FFFD：字节流已不是合法 UTF-8（多半被按 GBK 存过一轮）
  const fffd = text.indexOf('�');
  if (fffd !== -1) {
    errors.push(`${file}:${lineOf(text, fffd)} 行: 含替换字符 U+FFFD（�）——文件字节已损坏，需从源头重新生成`);
  }

  // c) mojibake 特征串
  for (const { re, why } of MOJIBAKE_PATTERNS) {
    const m = re.exec(text);
    if (m) {
      errors.push(`${file}:${lineOf(text, m.index)} 行: 疑似乱码「${m[0]}」——${why}`);
      break; // 一个文件报一次就够定位了
    }
  }

  // d) 中文占比异常 → 告警（不计入 errors）。
  //    只查 data/grammar/ 与 data/reader/（P1-P7 的成段中文讲解内容，CJK 占比理应远超 5%）；
  //    词表/题库类文件英文本来就占大头（实测 2-5%），全局开这条会有一屏误报把真问题淹掉。
  const p = file.replace(/\\/g, '/');
  const isChineseContent = /data\/(grammar|reader)\//.test(p) && !/_schema|index\.json$/.test(p);
  if (isChineseContent) {
    const cjk = (text.match(/[一-鿿]/g) || []).length;
    const declaresChinese = /"(cn|zh|meaning|cnNotes|titleCn|essence|why|explain|clue|note)"\s*:/.test(text) || cjk > 0;
    if (declaresChinese && text.length > 2000 && cjk / text.length < 0.05) {
      warnings.push(`${file}: CJK 字符占比 ${(cjk / text.length * 100).toFixed(1)}%（<5%）——讲解类文件应含成段中文，检查是否被转码丢失`);
    }
  }
}

const targets = process.argv.slice(2);
const files = targets.length ? targets : ['data/grammar/index.json', 'data/reader/index.json'];

let checked = 0;
for (const f of files) {
  if (!existsSync(f)) { errors.push(`${f}: 文件不存在`); continue; }
  const schemaPath = schemaFor(f);
  if (!schemaPath) { errors.push(`${f}: 没有匹配的 schema（文件名不符合分片命名规范）`); continue; }
  const schema = readJSON(schemaPath);
  const data = readJSON(f);
  if (!schema || !data) continue;
  validate(data, schema, schema, path.basename(f));
  checked++;
}

// 索引与分片文件的交叉一致性：index 里登记的 file 必须真实存在
for (const idx of files.filter((f) => f.replace(/\\/g, '/').endsWith('index.json'))) {
  const data = readJSON(idx);
  if (!data) continue;
  (data.lessons || data.pieces || []).forEach((it) => {
    const rel = String(it.file || '').replace(/^\.\//, '');
    if (rel && !existsSync(rel)) errors.push(`${idx}: ${it.id} 登记的 file 不存在 — ${it.file}`);
  });
}

// 编码守卫全量扫描（无论校验目标是什么，data/ 下所有 .json 都过一遍）
const encFiles = existsSync('data') ? walkJSON('data') : [];
encFiles.forEach(checkEncoding);

warnings.forEach((w) => console.warn('⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✘ ' + e));
  console.error(`共 ${errors.length} 处问题`);
  process.exit(1);
}
console.log(`✔ 数据校验通过（Schema ${checked} 个文件；编码扫描 ${encFiles.length} 个文件${warnings.length ? `，${warnings.length} 条告警` : ''}）`);
