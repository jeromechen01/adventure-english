// utils/exam-season.js — 考季派生（V0.9 P0.6）
//
// 原则：**考试季不是一个独立事实，是 examDate 的派生结果。**
// 全项目只有 data/exam/exam-config.json 一个数据源；任何地方都不许再写死「2027 春」这类字面量。
//
// 用法：
//   · 配置由 exam-common.js 的 loadExamConfig() 合并后推进来（setSeasonConfig）
//   · 代码里要季名 → getCurrentSeason() / getNextSeason()
//   · 数据文件（JSON）里要季名 → 写占位符 {本考季} / {下一考季}，渲染前过一道 fillSeason()
//
// 本模块是叶子模块：不 import 任何东西，避免与 storage.js / app.js 形成循环依赖。

// 按月份归季
const SEASONS = [
  { name: '冬季', months: [12, 1, 2] },
  { name: '春季', months: [3, 4, 5] },
  { name: '夏季', months: [6, 7, 8] },
  { name: '秋季', months: [9, 10, 11] },
];

// 配置没就位时的兜底：用相对说法，读起来仍然通顺
const FALLBACK_CURRENT = '本考季';
const FALLBACK_NEXT = '下一考季';

let cfg = { examDate: '', nextExamDate: '', nextExamLabel: '' };

/** 由 exam-common.js 在合并完配置后调用 */
export function setSeasonConfig(c) {
  cfg = {
    examDate: (c && c.examDate) || '',
    nextExamDate: (c && c.nextExamDate) || '',
    nextExamLabel: (c && c.nextExamLabel) || '',
  };
}

/** 月份（1-12）→ 季名 */
export function seasonOf(month) {
  const s = SEASONS.find(x => x.months.includes(Number(month)));
  return s ? s.name : '';
}

/** 'YYYY-MM-DD' → '2026年12月（冬季）'；日期无效返回空串 */
export function seasonLabel(dateStr) {
  const m = /^(\d{4})-(\d{2})/.exec(String(dateStr || ''));
  if (!m) return '';
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!(month >= 1 && month <= 12)) return '';
  return `${year}年${month}月（${seasonOf(month)}）`;
}

/** 本考季：由 examDate 派生 */
export function getCurrentSeason() {
  const label = seasonLabel(cfg.examDate);
  return { date: cfg.examDate || '', label: label || FALLBACK_CURRENT };
}

/** 下一考季：nextExamLabel 优先，留空则由 nextExamDate 自动生成 */
export function getNextSeason() {
  const label = cfg.nextExamLabel || seasonLabel(cfg.nextExamDate);
  return { date: cfg.nextExamDate || '', label: label || FALLBACK_NEXT };
}

/** 把文案里的 {本考季} / {下一考季} 占位符替换成真实季名 */
export function fillSeason(text) {
  if (text == null) return text;
  return String(text)
    .replace(/\{本考季\}/g, getCurrentSeason().label)
    .replace(/\{下一考季\}/g, getNextSeason().label);
}
