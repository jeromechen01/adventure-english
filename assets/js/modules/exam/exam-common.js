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

// 考试倒计时（日历时钟）：返回剩余天数，已过返回 0
export function daysToExam() {
  const ep = storage.getExamProfile();
  if (!ep.examDate) return null;
  const target = new Date(ep.examDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target - now) / 86400000));
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
