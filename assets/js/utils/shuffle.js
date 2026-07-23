// utils/shuffle.js — V0.8 通用洗牌/抽题工具（全站复用，不要各处再写一套）
// 四层变化：① 题序洗牌 ② 选项洗牌+answer 同步重算 ③ 题池抽样 ④ 错题加权
// 纯函数设计：不依赖 storage/DOM，错题统计由调用方传入，node 可直接测试。

// Fisher-Yates 洗牌（非原地，返回新数组）。
// 不要用 sort(()=>Math.random()-0.5)，那个分布不均。
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// djb2 字符串哈希 → base36，题目稳定指纹用
function hashText(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// 题目稳定指纹：scope + 题干/选项内容哈希。
// 注意不含数字型 answer（选项洗牌后会变），文本型 answer 参与（区分同题干不同空）。
export function questionKey(scope, q) {
  const parts = [
    q.q || q.question || q.wrong || q.from || '',
    Array.isArray(q.options) ? q.options.join('~') : '',
    typeof q.answer === 'string' ? q.answer : (typeof q.answer === 'boolean' ? String(q.answer) : '')
  ];
  return scope + '#' + hashText(parts.join('|'));
}

// ② 选项洗牌：返回 { options, answer }（原对象不动）。
// - q.noShuffle 为真（题干依赖选项顺序，如"以上都对"）→ 原样返回
// - answer 是数字下标 → 洗后同步重算；answer 是文本（按文本判分的老题型）→ 洗选项、answer 不动
export function shuffleOptions(q) {
  if (q.noShuffle || !Array.isArray(q.options) || q.options.length < 2) {
    return { options: q.options, answer: q.answer };
  }
  const order = shuffle(q.options.map((_, i) => i));
  const options = order.map(i => q.options[i]);
  const answer = (typeof q.answer === 'number' && q.options[q.answer] !== undefined)
    ? order.indexOf(q.answer)
    : q.answer;
  return { options, answer };
}

// ③+④ 题池抽样 + 智能加权：错过的题 > 没做过的题 > 做对过的题。
// stats：{ [questionKey]: { r:对次数, w:错次数, lw:最近一次是否答错 } }（storage.getQuizStats()）
// 返回 { questions: 抽样并打乱后的新数组, focusedWrong: 是否优先抽中了错题 }
export function pickQuiz(scope, questions, count, stats = {}) {
  const n = Math.min(count || questions.length, questions.length);
  // 分层：上次做错(8) > 错多对少(6) > 没做过(3) > 做对过(1)；层内随机，按层从高到低取满
  const tiers = { 8: [], 6: [], 3: [], 1: [] };
  questions.forEach(q => {
    const s = stats[questionKey(scope, q)];
    if (s && s.lw) tiers[8].push(q);
    else if (s && s.w > s.r) tiers[6].push(q);
    else if (!s) tiers[3].push(q);
    else tiers[1].push(q);
  });
  const picked = [];
  let focusedWrong = false;
  for (const w of [8, 6, 3, 1]) {
    if (picked.length >= n) break;
    const take = shuffle(tiers[w]).slice(0, n - picked.length);
    if (take.length && w >= 6) focusedWrong = true;
    picked.push(...take);
  }
  return { questions: shuffle(picked), focusedWrong };
}

// 便捷：把一题变成"进场即洗好选项"的展示副本，并带上稳定指纹 __qk（供记错题统计）。
// 同一次作答过程中用这个副本，顺序就固定了；下次进入重新调用即重新洗。
export function presentQuestion(scope, q) {
  const key = questionKey(scope, q);
  const v = shuffleOptions(q);
  return { ...q, options: v.options, answer: v.answer, __qk: key };
}
