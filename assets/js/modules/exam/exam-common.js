// modules/exam/exam-common.js —— 备考中心公共工具（V0.4）
// ★ 两个时钟解耦：
//   考试倒计时 D-XXX = 日历驱动（examDate - 今天）
//   计划进度 Day N   = 完成度驱动（storage.getPlanDay，只在完成一天时 +1）
import { loadJSON } from '../../app.js';
import * as storage from '../../storage.js';

// 当前备考级别（默认 KET）
export function examLevel() {
  const p = storage.getProfile();
  return (p.grade === 'KET' || p.grade === 'PET') ? p.grade : (p.examLevel || 'KET');
}

// ============================================================
// V0.9 P0.5：考试信息配置化
//   默认值 data/exam/exam-config.json ⊕ 用户覆盖 localStorage.examConfig
//   三个日历时钟（报名开放 / 报名截止 / 考试日）全部读这份合并结果。
//   ⚠️ 计划进度 Day N 依旧只由完成度驱动，与这里的任何日期无关。
// ============================================================
const CONFIG_FALLBACK = {
  examDate: '', regOpenDate: '', regCloseDate: '', targetScore: 140, editable: true,
  examDateNote: '', regOpenNote: '', registerTip: '',
};
let cachedConfig = null;

export async function loadExamConfig(force = false) {
  if (cachedConfig && !force) return cachedConfig;
  const file = (await loadJSON('data/exam/exam-config.json')) || {};
  const override = storage.getExamConfigOverride();

  // 迁移：P0.5 之前用户设过的考试目标日存在 examProfile 里，第一次合并时接过来，
  // 免得升级后倒计时被默认值顶掉。
  const ep = storage.getExamProfile();
  if (!override.examDate && ep.examDate) override.examDate = ep.examDate;

  cachedConfig = { ...CONFIG_FALLBACK, ...file, ...override };
  return cachedConfig;
}

// 同步取当前配置（须先 await 过 loadExamConfig；没加载过时给保底值）
export function examConfig() {
  return cachedConfig || CONFIG_FALLBACK;
}

// 保存用户改动：写 localStorage 覆盖层 + 同步 examProfile.examDate（老代码仍在读它）
export function saveExamConfig(patch) {
  storage.setExamConfigOverride(patch);
  if (patch.examDate) {
    storage.setExamProfile({ ...storage.getExamProfile(), examDate: patch.examDate });
  }
  cachedConfig = { ...examConfig(), ...patch };
  return cachedConfig;
}

// 距某个日期还有几天：未来为正，今天为 0，已过为负；日期为空返回 null
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  if (isNaN(target)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

// 考试倒计时（日历时钟）：返回剩余天数，已过返回 0
export function daysToExam() {
  const d = daysUntil(examConfig().examDate);
  return d == null ? null : Math.max(0, d);
}

// 三个日历时钟。报名两个节点过期后自动从列表里消失，只留考试日。
// 只报事实，不做「还剩 X 天你却只学了 Y 小时」这类评价（健康护栏）。
export function examClocks() {
  const c = examConfig();
  const clocks = [];
  const toOpen = daysUntil(c.regOpenDate);
  const toClose = daysUntil(c.regCloseDate);

  if (toOpen != null && toOpen > 0) {
    clocks.push({ key: 'regOpen', label: '报名开放', days: toOpen, date: c.regOpenDate, note: c.regOpenNote, tone: 'amber' });
  } else if (toClose != null && toClose >= 0) {
    clocks.push({ key: 'regClose', label: '报名截止', days: toClose, date: c.regCloseDate, note: '', tone: 'red' });
  }

  const toExam = daysUntil(c.examDate);
  if (toExam != null) {
    clocks.push({ key: 'exam', label: '考试日', days: Math.max(0, toExam), date: c.examDate, note: c.examDateNote, tone: 'orange' });
  }
  return clocks;
}

// 今天的 ISO 日期（打卡热力图用真实日期）
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 载入 45 天计划
export async function loadPlan(level) {
  return loadJSON(`data/exam/${level.toLowerCase()}/plan-45day.json`);
}

// 取 Day N 的任务（计划的第 N 天，不是日历的今天）
export async function getTodayTasks(level) {
  const plan = await loadPlan(level);
  if (!plan) return null;
  const day = storage.getPlanDay(level);
  const d = plan.days.find(x => x.day === day) || plan.days[0];
  return { plan, day, dayData: d, doneMap: storage.getPlanTaskState(level, day) };
}

// 健康护栏：勾选任务时累计分钟数；超 120 分钟返回 true（调用方弹温和提示）
export function addMinutesWithGuard(level, minutes) {
  const total = storage.addDailyMinutes(level, minutes);
  return total > 120;
}

// 页面头部（返回按钮 + 标题）
export function headerHtml(title, backId = 'examBackBtn') {
  return `
    <div class="flex items-center gap-2 mb-3">
      <button id="${backId}" class="text-2xl tap-bounce" style="min-width:48px;min-height:48px">‹</button>
      <h2 class="text-xl font-bold flex-1">${title}</h2>
    </div>`;
}

export function bindBack(app, target = 'exam-hub', backId = 'examBackBtn') {
  const btn = app.querySelector(`#${backId}`);
  if (btn) btn.addEventListener('click', () => window.__nav(target));
}

// 简单转义（原创题目文本里可能含引号）
export function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
