// tools/check-lesson.mjs — 语法大厅单课题目抽查（P1b 起固化，替代 P1a 的内联脚本）
// 用法：node tools/check-lesson.mjs data/grammar/g01.json data/grammar/g02.json ...
//   ① 题干查重：课内 64 题 + 侦探句不重复；跨文件全局不重复（一次传多课才有意义）
//   ② 选项洗牌 200 轮：presentQuestion 后 answer 指向的文本必须不变
//   ③ 结构抽查：每题有 explain、level 与环节号一致（环节 i 的题 level=i+1）、选项无重复
import { readFileSync } from 'node:fs';
import { presentQuestion } from '../assets/js/utils/shuffle.js';

const files = process.argv.slice(2);
if (!files.length) { console.error('用法: node tools/check-lesson.mjs data/grammar/gXX.json ...'); process.exit(1); }

let fail = 0;
const globalStems = new Map(); // 题干 → 首次出现的课号

for (const f of files) {
  const l = JSON.parse(readFileSync(f, 'utf8'));
  const stems = l.practice.stages.flatMap(s => s.questions.map(q => q.q)).concat(l.detective.map(d => d.sentence));
  const dup = stems.filter((s, i) => stems.indexOf(s) !== i);
  if (dup.length) { fail++; console.error(`✘ ${l.id} 课内重复题干:`, dup); }
  for (const s of stems) {
    if (globalStems.has(s)) { fail++; console.error(`✘ 跨课重复题干（${globalStems.get(s)} 与 ${l.id}）: ${s}`); }
    else globalStems.set(s, l.id);
  }

  let n = 0;
  for (const [si, st] of l.practice.stages.entries()) {
    for (const q of st.questions) {
      const truth = q.options[q.answer];
      if (truth === undefined) { fail++; console.error(`✘ ${l.id} answer 越界:`, q.q); continue; }
      for (let i = 0; i < 200; i++) {
        const p = presentQuestion('t', q);
        if (p.options[p.answer] !== truth) { fail++; console.error(`✘ ${l.id} 洗牌后 answer 错位:`, q.q); break; }
      }
      if (!q.explain) { fail++; console.error(`✘ ${l.id} 缺解析:`, q.q); }
      if (q.level !== si + 1) { fail++; console.error(`✘ ${l.id} level 与环节不符:`, q.q); }
      if (new Set(q.options).size !== q.options.length) { fail++; console.error(`✘ ${l.id} 选项重复:`, q.q); }
      n++;
    }
  }
  console.log(`✔ ${l.id}「${l.title}」${n} 题 + 侦探 ${l.detective.length} 句：查重 / 洗牌200轮 / 解析 / 难度 全过`);
}

if (fail) { console.error(`\n✘ 共 ${fail} 处问题`); process.exit(1); }
console.log(`\n✔ ${files.length} 课全部通过（全局题干无重复，共 ${globalStems.size} 个）`);
