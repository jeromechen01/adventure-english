// tools/check-data.mjs — 数据文件 Schema 校验（V0.9 P0 起）
// 用法：
//   node tools/check-data.mjs                 校验两个索引文件
//   node tools/check-data.mjs data/grammar/g01.json   按 id 前缀自动选 schema 校验单个文件
//
// 实现了 JSON Schema draft-07 的常用子集（type / required / properties / items /
// enum / const / pattern / minimum / maximum / minItems / maxItems / minLength /
// maxLength / $ref 同文档内引用）。不引第三方依赖，本机无需 npm install。
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const errors = [];

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

if (errors.length) {
  errors.forEach((e) => console.error('✘ ' + e));
  console.error(`共 ${errors.length} 处问题`);
  process.exit(1);
}
console.log(`✔ 数据校验通过（${checked} 个文件）`);
