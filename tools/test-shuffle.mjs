// tools/test-shuffle.mjs — V0.8 洗牌正确性自动测试
// 用法：node tools/test-shuffle.mjs
// 核心验证：① 选项洗牌后 answer 指向的选项文本 100% 不变（跑 200 轮）
//           ② noShuffle 题选项顺序不被动
//           ③ pickQuiz 抽样数量正确、错题加权生效、无重复题
//           ④ 真实数据全量过一遍（语法八课/阅读/听力/模考/1-9年级）
import { shuffle, shuffleOptions, pickQuiz, questionKey, presentQuestion } from '../assets/js/utils/shuffle.js';
import { readFileSync } from 'node:fs';

let failed = 0;
function check(name, ok, detail = '') {
  if (!ok) { failed++; console.error(`✘ ${name} ${detail}`); }
}

// ① 合成题：200 轮洗牌，answer 指向文本必须一致
for (let round = 0; round < 200; round++) {
  const q = { q: 'test', options: ['A文', 'B文', 'C文', 'D文'], answer: round % 4 };
  const truth = q.options[q.answer];
  const v = shuffleOptions(q);
  check('answer 重算', v.options[v.answer] === truth, `round=${round}`);
  check('选项集合不变', [...v.options].sort().join() === [...q.options].sort().join());
  check('原题不被改动', q.options[0] === 'A文' && q.answer === round % 4);
}

// ② noShuffle 题不被洗
for (let round = 0; round < 50; round++) {
  const q = { q: '下列哪项正确？', options: ['甲', '乙', '以上都对'], answer: 2, noShuffle: true };
  const v = shuffleOptions(q);
  check('noShuffle 保序', v.options.join() === '甲,乙,以上都对' && v.answer === 2);
}

// 文本型 answer（老题型按文本判分）：洗选项但 answer 不动
{
  const q = { q: 'x', options: ['am', 'is', 'are'], answer: 'is' };
  for (let i = 0; i < 30; i++) {
    const v = shuffleOptions(q);
    check('文本 answer 不动', v.answer === 'is' && v.options.includes('is'));
  }
}

// 布尔/无选项题：原样返回
{
  const tf = { q: 'tf', answer: true };
  const v = shuffleOptions(tf);
  check('无选项题原样', v.options === undefined && v.answer === true);
}

// ③ pickQuiz：数量/去重/加权
{
  const bank = Array.from({ length: 24 }, (_, i) => ({ q: `Q${i}`, options: ['a', 'b', 'c'], answer: i % 3 }));
  const r = pickQuiz('t', bank, 16, {});
  check('抽样数量', r.questions.length === 16);
  check('抽样无重复', new Set(r.questions.map(x => x.q)).size === 16);
  const r2 = pickQuiz('t', bank, 99, {});
  check('抽样封顶', r2.questions.length === 24);

  // 加权：把 Q0-Q3 标记为"上次做错"，抽 8 题跑 300 轮，错题应几乎每轮都进
  const stats = {};
  for (let i = 0; i < 4; i++) stats[questionKey('t', bank[i])] = { r: 0, w: 2, lw: true };
  let hitAll = 0;
  for (let round = 0; round < 300; round++) {
    const rr = pickQuiz('t', bank, 8, stats);
    const names = new Set(rr.questions.map(x => x.q));
    if (['Q0', 'Q1', 'Q2', 'Q3'].every(n => names.has(n))) hitAll++;
    check('focusedWrong 标记', rr.focusedWrong === true);
  }
  check('错题优先(300轮中≥80%全中)', hitAll >= 240, `hitAll=${hitAll}`);

  // 题序确实会变：两次全量抽取顺序至少一次不同
  let diff = false;
  const base = pickQuiz('t', bank, 24, {}).questions.map(x => x.q).join();
  for (let i = 0; i < 10; i++) {
    if (pickQuiz('t', bank, 24, {}).questions.map(x => x.q).join() !== base) { diff = true; break; }
  }
  check('题序会变', diff);
}

// presentQuestion：带指纹 + 洗好选项，同题指纹稳定
{
  const q = { q: 'p', options: ['x', 'y', 'z'], answer: 1 };
  const a = presentQuestion('s', q), b = presentQuestion('s', q);
  check('指纹稳定', a.__qk === b.__qk && a.__qk.startsWith('s#'));
  check('present answer 正确', a.options[a.answer] === 'y');
  // 对已洗过的副本再 present（错题重练场景）：指纹不变、answer 仍指向同一文本
  const c = presentQuestion('s', a);
  check('二次 present 指纹不变', c.__qk === a.__qk);
  check('二次 present answer 正确', c.options[c.answer] === 'y');
}

// ④ 真实题库全量验证：所有带 options+数字 answer 的题洗 20 轮
function collectQuestions() {
  const out = [];
  const push = (arr) => Array.isArray(arr) && arr.forEach(q => {
    if (q && Array.isArray(q.options) && typeof q.answer === 'number') out.push(q);
  });
  const gl = JSON.parse(readFileSync('data/exam/ket/grammar-lessons.json', 'utf8'));
  gl.lessons.forEach(l => {
    push(l.exercises);
    (l.stages || []).forEach(s => push(s.questions));
  });
  const rd = JSON.parse(readFileSync('data/exam/ket/reading-drills.json', 'utf8'));
  Object.values(rd.parts).forEach(p => p.sets.forEach(s => { push(s.items); push(s.questions); push(s.gaps); }));
  const lis = JSON.parse(readFileSync('data/exam/ket/listening.json', 'utf8'));
  (lis.sets || []).forEach(s => s.parts.forEach(p => push(p.questions)));
  ['mock-01', 'mock-02', 'mock-03'].forEach(m => {
    const mk = JSON.parse(readFileSync(`data/exam/ket/mocks/${m}.json`, 'utf8'));
    if (mk.parts) Object.values(mk.parts).forEach(s => { if (s) { push(s.items); push(s.questions); push(s.gaps); } });
  });
  ['kindergarten', 'primary', 'junior'].forEach(lv => {
    const g = JSON.parse(readFileSync(`data/grammar/${lv}.json`, 'utf8'));
    g.topics.forEach(t => push(t.quiz));
    const r = JSON.parse(readFileSync(`data/reading/${lv}.json`, 'utf8'));
    r.articles.forEach(a => push(a.questions));
  });
  return out;
}
{
  const qs = collectQuestions();
  console.log(`真实题库带选项题：${qs.length} 道`);
  let bad = 0;
  qs.forEach((q, qi) => {
    if (q.options[q.answer] === undefined) { bad++; console.error(`  ⚠ 数据自身 answer 越界 idx=${qi}: ${JSON.stringify(q).slice(0, 120)}`); return; }
    const truth = q.options[q.answer];
    for (let i = 0; i < 20; i++) {
      const v = shuffleOptions(q);
      if (v.options[v.answer] !== truth) { failed++; console.error(`✘ 真实题洗坏: ${JSON.stringify(q).slice(0, 120)}`); break; }
    }
  });
  check('数据自身 answer 全部有效', bad === 0, `越界=${bad}`);
}

if (failed) { console.error(`\n共 ${failed} 处失败`); process.exit(1); }
console.log('✔ 洗牌测试全部通过');
