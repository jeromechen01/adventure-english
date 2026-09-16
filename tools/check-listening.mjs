// tools/check-listening.mjs — 听力训练营课文件专项校验（PL0-4 起，preflight ⑤）
// 用法：node tools/check-listening.mjs            校验索引里全部 status=ready 的课
//       node tools/check-listening.mjs L01        只校验某一课
//
// 查什么（Schema 由 check-data.mjs 负责，这里查内容口径）：
//   ① 题型对齐 KET 真考：Part 1 每段 1 题 3 图；Part 2 一段 5 空；Part 3 一段 5 题各 3 选项；
//      Part 4 每段 1 题 3 选项；Part 5 一段 5 项配 8 选项（A-H）
//   ② Part 1 图标 id 必须在 icons.json 清单里；每段对话 4-6 句（阶段一规格）
//   ③ ★ 词汇边界：脚本+题干+选项的词 ≥95% 落在 KET A2 词表（data/exam/ket/words/*.json，1416 词）；
//      超出词表的词必须出现在 warmup 里；warmup 里的词自身也必须在词表内（多词条目按短语整体匹配）
//   ④ names 里登记的人名不计入词汇统计（大写开头才认）
import { readFileSync, existsSync } from 'node:fs';

const errors = [], warnings = [];
const err = (m) => errors.push(m);

// ---------- KET A2 词表（含多词条目）+ 简易词形还原 ----------
const widx = JSON.parse(readFileSync('data/exam/ket/words/index.json', 'utf8'));
const LEX = new Set();
for (const t of widx.topics) {
  const d = JSON.parse(readFileSync(`data/exam/ket/words/${t.file}`, 'utf8'));
  d.words.forEach(w => { const lw = String(w.word).toLowerCase().trim(); LEX.add(lw); LEX.add(deaccent(lw)); });
}
function deaccent(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } // café → cafe（脚本与词表两边都去音符再比）
const PHRASES = [...LEX].filter(w => w.includes(' '));
// 词表之外但 A2 听力材料里必然出现的功能词/称呼/极高频词（Cambridge A2 词表本身收录，本地话题词库未单列）
const FUNCTION_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'so', 'if', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'about', 'after', 'before', 'because', 'then', 'than', 'as', 'not', 'no', 'yes', 'ok', 'okay', 'oh', 'hi', 'hello', 'please', 'thanks', 'thank', 'sorry',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'this', 'that', 'these', 'those', 'there', 'here', 'who', 'what', 'where', 'when', 'why', 'how', 'which', 'whose',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'have', 'has', 'had', 'can', 'cannot', 'could', 'will', 'would', 'shall', 'should', 'must', 'may', 'might', 'let',
  'very', 'too', 'also', 'just', 'only', 'again', 'always', 'never', 'sometimes', 'usually', 'often', 'still', 'really', 'well', 'all', 'some', 'any', 'every', 'each', 'much', 'many', 'more', 'most', 'other', 'another', 'both', 'few', 'little', 'lot', 'lots',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'hundred', 'first', 'second', 'third',
  'tv', // Cambridge A2 词表收录 TV，本地话题词库只收 television
  'mum', 'dad', 'mr', 'mrs', 'miss', 'sir', 'madam', 'everyone', 'everybody', 'something', 'anything', 'nothing', 'someone', 'anyone', 'today', 'tomorrow', 'yesterday', 'tonight', 'now', 'later', 'soon', 'up', 'down', 'out', 'off', 'over', 'back', 'away', 'into', 'onto', 'next', 'last', 'same', 'right', 'left', 'new', 'old', 'big', 'good', 'great', 'nice', 'fine', 'bad', 'best', 'better']);
const CONTRACTIONS = { "i'm": 'i am', "i'll": 'i will', "i've": 'i have', "i'd": 'i would', "you're": 'you are', "you'll": 'you will', "you've": 'you have', "you'd": 'you would', "she'll": 'she will', "he'll": 'he will', "it'll": 'it will', "that'll": 'that will', "we'd": 'we would', "they'd": 'they would', "he'd": 'he would', "she'd": 'she would', "we're": 'we are', "we'll": 'we will', "we've": 'we have', "they're": 'they are', "they'll": 'they will', "he's": 'he is', "she's": 'she is', "it's": 'it is', "that's": 'that is', "there's": 'there is', "what's": 'what is', "where's": 'where is', "who's": 'who is', "here's": 'here is', "let's": 'let us', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'cannot', "couldn't": 'could not', "won't": 'will not', "wouldn't": 'would not', "shouldn't": 'should not', "haven't": 'have not', "hasn't": 'has not', "o'clock": "o'clock" };

// 不规则动词过去式/过去分词 → 原形（P-L1：脚本里的叙述会用到 fell / went / bought 等）
const IRREGULAR = { fell: 'fall', fallen: 'fall', went: 'go', gone: 'go', got: 'get', bought: 'buy', made: 'make', saw: 'see', seen: 'see', came: 'come', took: 'take', taken: 'take', had: 'have', said: 'say', told: 'tell', ate: 'eat', eaten: 'eat', drank: 'drink', drunk: 'drink', ran: 'run', wore: 'wear', worn: 'wear', brought: 'bring', forgot: 'forget', forgotten: 'forget', lost: 'lose', found: 'find', gave: 'give', given: 'give', left: 'leave', sat: 'sit', slept: 'sleep', spent: 'spend', stood: 'stand', swam: 'swim', swum: 'swim', thought: 'think', won: 'win', wrote: 'write', written: 'write', broke: 'break', broken: 'break', chose: 'choose', chosen: 'choose', drove: 'drive', driven: 'drive', fed: 'feed', felt: 'feel', flew: 'fly', flown: 'fly', heard: 'hear', kept: 'keep', knew: 'know', known: 'know', met: 'meet', paid: 'pay', rode: 'ride', ridden: 'ride', sold: 'sell', sent: 'send', taught: 'teach', threw: 'throw', thrown: 'throw', woke: 'wake', woken: 'wake', began: 'begin', begun: 'begin', built: 'build', caught: 'catch', cost: 'cost', cut: 'cut', did: 'do', done: 'do', grew: 'grow', grown: 'grow', held: 'hold', hid: 'hide', hit: 'hit', hurt: 'hurt', learnt: 'learn', lent: 'lend', lit: 'light', meant: 'mean', put: 'put', read: 'read', rang: 'ring', rung: 'ring', rose: 'rise', sang: 'sing', sung: 'sing', shone: 'shine', shut: 'shut', spoke: 'speak', spoken: 'speak', stuck: 'stick', swept: 'sweep', understood: 'understand', wound: 'wind', children: 'child', feet: 'foot', teeth: 'tooth', men: 'man', women: 'woman', mice: 'mouse', people: 'person' };

function inLex(w) {
  if (LEX.has(w) || FUNCTION_WORDS.has(w)) return true;
  if (IRREGULAR[w] && (LEX.has(IRREGULAR[w]) || FUNCTION_WORDS.has(IRREGULAR[w]))) return true;
  if (/^\d+([.:]\d+)?$/.test(w)) return true;
  const c = [];
  if (w.endsWith('ies')) c.push(w.slice(0, -3) + 'y');
  if (w.endsWith('es')) c.push(w.slice(0, -2));
  if (w.endsWith('s')) c.push(w.slice(0, -1));
  if (w.endsWith('ed')) { c.push(w.slice(0, -2), w.slice(0, -1)); if (/([a-z])\1ed$/.test(w)) c.push(w.slice(0, -3)); }
  if (w.endsWith('ing')) { c.push(w.slice(0, -3), w.slice(0, -3) + 'e'); if (/([a-z])\1ing$/.test(w)) c.push(w.slice(0, -4)); }
  if (w.endsWith('er')) c.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith('est')) c.push(w.slice(0, -3), w.slice(0, -2));
  if (w.endsWith('ly')) c.push(w.slice(0, -2));
  if (w.endsWith('ier')) c.push(w.slice(0, -3) + 'y');   // easier → easy
  if (w.endsWith('iest')) c.push(w.slice(0, -4) + 'y');  // easiest → easy
  if (w.endsWith('y')) c.push(w.slice(0, -1));           // stormy → storm
  return c.some(x => x.length >= 2 && (LEX.has(x) || FUNCTION_WORDS.has(x)));
}

// 文本 → 词元数组（先吃掉多词条目，再逐词）；names 里的人名跳过
function tokenize(text, names) {
  let s = ' ' + deaccent(String(text)).replace(/[’]/g, "'").replace(/[^A-Za-z0-9' .:-]/g, ' ') + ' ';
  const nameSet = new Set((names || []).map(n => n.toLowerCase()));
  s = s.toLowerCase().replace(/[a-z]+'[a-z]+/g, m => CONTRACTIONS[m] || m);
  const found = [];
  for (const ph of PHRASES) {
    const re = new RegExp(`(?<![a-z])${ph.replace(/[-\s]+/g, '[- ]')}(?![a-z])`, 'g');
    if (re.test(s)) { found.push(ph); s = s.replace(re, ' '); }
  }
  const words = s.split(/[\s.:,!?]+/).map(w => w.replace(/^'+|'+$/g, '').replace(/'s$/, '')).filter(w => w && !/^[-']+$/.test(w));
  return found.concat(words.filter(w => !nameSet.has(w)));
}

// ---------- 逐课校验 ----------
const only = process.argv[2];
const index = JSON.parse(readFileSync('data/exam/ket/listening/index.json', 'utf8'));
const icons = new Set(JSON.parse(readFileSync('data/exam/ket/listening/icons.json', 'utf8')).icons.map(i => i.id));
const minCov = (index.rules && index.rules.vocabCoverageMin) || 0.95;
let checked = 0;

for (const meta of index.lessons || []) {
  if (only && meta.id !== only) continue;
  if (meta.status !== 'ready') continue;
  if (!existsSync(meta.file)) { err(`${meta.id}: 课文件不存在 ${meta.file}`); continue; }
  const L = JSON.parse(readFileSync(meta.file, 'utf8'));
  const at = (s) => `${meta.id}: ${s}`;
  if (L.id !== meta.id) err(at(`id ${L.id} ≠ 索引 ${meta.id}`));
  if (L.stage !== meta.stage) err(at(`stage ${L.stage} ≠ 索引 ${meta.stage}`));
  const stageRate = ((index.stages || []).find(s => s.stage === L.stage) || {}).rate;
  if (stageRate && L.rate !== stageRate) err(at(`rate ${L.rate} ≠ 阶段规定 ${stageRate}`));
  const partsInLesson = [...new Set((L.sections || []).map(s => s.part))].sort();
  if (JSON.stringify(partsInLesson) !== JSON.stringify([...(meta.parts || [])].sort())) err(at(`实际 parts ${JSON.stringify(partsInLesson)} ≠ 索引 ${JSON.stringify(meta.parts)}`));
  const qTotal = (L.sections || []).reduce((n, s) => n + (s.questions || []).length, 0);
  if (qTotal !== meta.questionCount) err(at(`题数 ${qTotal} ≠ 索引 questionCount ${meta.questionCount}`));

  // ① 题型口径
  const byPart = {};
  (L.sections || []).forEach(s => { (byPart[s.part] = byPart[s.part] || []).push(s); });
  for (const [p, secs] of Object.entries(byPart)) {
    const part = Number(p);
    const qs = secs.flatMap(s => s.questions);
    if (part === 1 || part === 4) {
      secs.forEach(s => { if (s.questions.length !== 1) err(at(`Part ${part} ${s.id}: 每段应 1 题，实为 ${s.questions.length}`)); });
      if (qs.length !== 5) err(at(`Part ${part}: 应 5 题，实为 ${qs.length}`));
    } else {
      if (secs.length !== 1) err(at(`Part ${part}: 应只有 1 段录音，实为 ${secs.length}`));
      if (qs.length !== 5) err(at(`Part ${part}: 应 5 题，实为 ${qs.length}`));
    }
    qs.forEach(q => {
      if (part === 1) {
        if (!Array.isArray(q.options) || q.options.length !== 3) err(at(`${q.id}: Part 1 应 3 张图`));
        else q.options.forEach(o => { if (!o || !icons.has(o.icon)) err(at(`${q.id}: 图标 ${o && o.icon} 不在 icons.json 清单`)); });
        if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 2)) err(at(`${q.id}: answer 应为 0-2`));
      } else if (part === 2) {
        if (typeof q.answer !== 'string' || !q.answer.trim()) err(at(`${q.id}: Part 2 answer 应为字符串`));
        if (q.options) err(at(`${q.id}: Part 2 不该有 options`));
      } else if (part === 3 || part === 4) {
        if (!Array.isArray(q.options) || q.options.length !== 3 || q.options.some(o => typeof o !== 'string')) err(at(`${q.id}: Part ${part} 应 3 个文字选项`));
        if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 2)) err(at(`${q.id}: answer 应为 0-2`));
      } else if (part === 5) {
        if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 7)) err(at(`${q.id}: Part 5 answer 应为 0-7`));
      }
    });
    if (part === 5) secs.forEach(s => {
      if (!Array.isArray(s.options) || s.options.length !== 8) err(at(`Part 5 ${s.id}: 应 8 个选项 A-H`));
      const ans = s.questions.map(q => q.answer);
      if (new Set(ans).size !== ans.length) err(at(`Part 5 ${s.id}: 5 项的答案不能重复`));
    });
  }

  // ② 阶段一 Part 1 每段 4-6 句：「句」= 对话轮次（turn），每轮最多 2 个句子（超出只告警）
  (L.sections || []).forEach(s => {
    if (s.part !== 1) return;
    if (s.script.length < 4 || s.script.length > 6) err(at(`${s.id}: 对话 ${s.script.length} 轮（规格 4-6 轮）`));
    s.script.forEach((t, i) => {
      const n = (t.text.match(/[.!?]+/g) || []).length;
      if (n > 2) warnings.push(at(`${s.id} 第 ${i + 1} 轮有 ${n} 个句子（建议每轮 ≤2 句）`));
    });
  });

  // ③ 词汇边界
  const names = L.names || [];
  const warm = new Set((L.warmup || []).map(w => w.word.toLowerCase()));
  (L.warmup || []).forEach(w => {
    const lw = w.word.toLowerCase();
    if (!(LEX.has(lw) || inLex(lw) || lw.split(' ').every(x => inLex(x)))) err(at(`warmup「${w.word}」不在 KET A2 词表`));
  });
  const texts = [];
  (L.sections || []).forEach(s => {
    s.script.forEach(t => texts.push(t.text));
    (s.options || []).forEach(o => texts.push(o));
    s.questions.forEach(q => {
      texts.push(q.q);
      (q.options || []).forEach(o => texts.push(typeof o === 'string' ? o : (o.alt || '')));
      if (s.part === 2) texts.push(q.answer);
    });
  });
  const tokens = texts.flatMap(t => tokenize(t, names));
  const out = new Map();
  let ok = 0;
  tokens.forEach(w => { if (inLex(w)) ok++; else out.set(w, (out.get(w) || 0) + 1); });
  const cov = tokens.length ? ok / tokens.length : 1;
  const notWarm = [...out.keys()].filter(w => !warm.has(w) && ![...warm].some(p => p.split(' ').includes(w)));
  if (cov < minCov) err(at(`词汇覆盖率 ${(cov * 100).toFixed(1)}% < ${minCov * 100}%（超纲：${[...out.keys()].join(', ')}）`));
  if (notWarm.length) err(at(`超出 A2 词表且未进 warmup：${notWarm.join(', ')}`));
  console.log(`✔ ${meta.id}《${L.titleZh}》：${qTotal} 题 / ${(L.sections || []).length} 段 / warmup ${warm.size} 词 / 词汇覆盖 ${(cov * 100).toFixed(1)}%（${ok}/${tokens.length}${out.size ? '，超纲进 warmup：' + [...out.keys()].join(', ') : ''}）`);
  checked++;
}

warnings.forEach(w => console.warn('⚠ ' + w));
if (errors.length) { errors.forEach(e => console.error('✘ ' + e)); console.error(`共 ${errors.length} 处问题`); process.exit(1); }
console.log(`✔ 听力课校验通过（${checked} 课）`);
