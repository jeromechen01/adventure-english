// utils/ket-hall-map.js —— KET 语法八课 ⇄ 语法大厅 跳转映射（V0.9 P2b）
//
// 唯一事实源：家长核定的对照表。去程（八课→大厅「深挖」）与回程（大厅→八课「考不考」）
// 共用这一张表反推，两个方向永远不会打架。
//
// ⚠️ data/grammar/index.json 里每课的 ketLessonMap 是本表的**副本**（给读索引的功能用，
//    如日后的学习报告/弱项诊断），不是第二份事实源。改了本表就要同步它（无映射写 null），
//    `node tools/smoke/preflight.mjs` 会逐课核对，不一致直接报错。
//    P2b 补丁已把索引里多出来的 G10→L8 / G17→L2 / G21→L1 / G25→L1+L3 四处删掉对齐。
// ⚠️ 本模块只提供「入口」，不触碰 KET 八课的任何讲解内容。

/** 八课 → 语法大厅（一课可对多课，按讲解顺序列出） */
export const KET_TO_HALL = {
  L1: ['G04', 'G05'],
  L2: ['G12', 'G24'],
  L3: ['G06', 'G13'],
  L4: ['G07', 'G14', 'G15'],
  L5: ['G11'],
  L6: ['G02', 'G03'],
  L7: ['G20'],
  L8: ['G18', 'G19', 'G01'],
};

/** 八课短名（家长对照表用词，仅用于跳转按钮标签；八课正文标题不动） */
export const KET_LESSON_LABEL = {
  L1: 'be 动词',
  L2: '疑问句与助动词',
  L3: '一般现在 vs 过去',
  L4: '现在进行 + 时态一致',
  L5: '介词',
  L6: '代词 + 限定词',
  L7: '连接词',
  L8: '量词 + 比较级',
};

/** 回程：大厅课号 → 八课课号（由 KET_TO_HALL 反推，不手写第二张表） */
export const HALL_TO_KET = Object.keys(KET_TO_HALL).reduce((map, ket) => {
  KET_TO_HALL[ket].forEach((hall) => {
    (map[hall] = map[hall] || []).push(ket);
  });
  return map;
}, {});

/** @param {string} ketId L1-L8 @returns {string[]} 对应的大厅课号 */
export function hallLessonsForKet(ketId) {
  return KET_TO_HALL[ketId] || [];
}

/** @param {string} hallId G01-G50 @returns {string[]} 对应的八课课号（无映射为空数组） */
export function ketLessonsForHall(hallId) {
  return HALL_TO_KET[hallId] || [];
}

/** 标签用文案：'L1 be 动词' */
export function ketLessonLabel(ketId) {
  return KET_LESSON_LABEL[ketId] ? `${ketId} ${KET_LESSON_LABEL[ketId]}` : ketId;
}
