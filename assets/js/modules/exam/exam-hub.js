// modules/exam/exam-hub.js —— 模块 0：备考中心 Dashboard（V0.4）
// 一屏四件事：双时钟 / 今日任务六格 / 进度环 / 九宫格入口。
// ⚠️ 今日任务 = 计划的 Day N（完成度时钟），不是日历的今天。
//    昨天没学 → 今天打开仍是同一个 Day N：不跳号、不补作业、不提醒欠账。
import { toast, showModal, closeModal } from '../../app.js';
import * as storage from '../../storage.js';
import { examLevel, daysToExam, todayISO, getTodayTasks, addMinutesWithGuard } from './exam-common.js';

const KET_VOCAB_START = 800;   // 起点词汇量（家长评估）
const KET_VOCAB_TARGET = 1700; // KET 词汇线

export async function renderExamHub(app) {
  const level = examLevel();
  const ep = storage.getExamProfile();

  // PET：轻量 Dashboard（跨度说明 + 入口），完整备考中心是 KET 的
  if (level === 'PET') return renderPetHub(app);

  // 首次进入：设考试目标日 + 点「开始第 1 天」（不设起始日期——Day N 由完成度推进）
  if (!ep.started) return renderSetup(app, level, ep);

  const t = await getTodayTasks(level);
  if (!t) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">📚</span><div class="empty-text">计划数据加载失败</div><div class="empty-sub">请检查网络后刷新</div></div>';
    return;
  }
  const { plan, day, dayData, doneMap } = t;
  const dday = daysToExam();
  const doneCount = dayData.slots.filter(s => doneMap[s.id]).length;
  const minDone = plan.minDoneSlots || 4;
  const week = plan.weeks.find(w => w.week === dayData.week);
  const learned = Object.keys(storage.getLearnedWords()).length;
  const vocabNow = Math.min(KET_VOCAB_START + learned, 3500);
  const vocabPct = Math.min(100, Math.round((vocabNow - KET_VOCAB_START) / (KET_VOCAB_TARGET - KET_VOCAB_START) * 100));
  const weekDays = storage.getWeekStudyDays(level);
  const dayPct = Math.round(day / plan.totalDays * 100);

  // 报名提醒：2026-12 起显示（日历判断只用于提醒外部报名节点，不影响 Day N）
  const showRegisterHint = new Date() >= new Date('2026-12-01T00:00:00');

  app.innerHTML = `
    <!-- 双时钟 -->
    <div class="card-cartoon mb-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-500">${level} · 2027 春季 · 考试倒计时（日历）</div>
          <div class="text-3xl font-black text-orange-500">D-${dday == null ? '?' : dday}</div>
          <button id="editDateBtn" class="text-[11px] text-gray-400 underline">目标日 ${ep.examDate}（可改）</button>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">计划进度（完成度）</div>
          <div class="text-3xl font-black text-primary">Day ${day} <span class="text-base text-gray-400">/ ${plan.totalDays}</span></div>
          <div class="text-[11px] text-gray-400">学了就前进，没学就原地等你</div>
        </div>
      </div>
    </div>

    ${showRegisterHint ? `
    <div class="card-cartoon mb-4 bg-yellow-50 border-2 border-yellow-300">
      <div class="font-bold text-sm">📮 报名窗口提醒</div>
      <div class="text-xs text-gray-600 mt-1">目标 2027 春季（3-4 月）→ 现在就联系考点问考期、先占位（考前 3 个月开放、2 个月截止）。详见「资源」页报名七步。</div>
    </div>` : ''}

    <!-- 今日任务：Day N 的六格 -->
    <div class="card-cartoon mb-4">
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-bold">📋 今日任务 · Day ${day}</h3>
        <span class="text-xs text-gray-500">${doneCount}/${dayData.slots.length} 格</span>
      </div>
      <div class="text-xs text-gray-500 mb-2">第 ${dayData.week} 周 · ${dayData.theme}${week && week.milestone ? ` · ⭐ ${week.milestone}` : ''}</div>
      ${dayData.note ? `<div class="text-xs bg-blue-50 text-blue-600 rounded-xl px-3 py-2 mb-2">💡 ${dayData.note}</div>` : ''}
      <div class="space-y-2">
        ${dayData.slots.map(s => {
          const done = !!doneMap[s.id];
          return `
          <div class="flex items-center gap-2 rounded-2xl border-2 ${done ? 'border-green-200 bg-green-50' : 'border-gray-100'} p-2">
            <button data-check="${s.id}" class="tap-bounce text-2xl" style="min-width:48px;min-height:48px">${done ? '✅' : '⬜'}</button>
            <button data-goto="${s.id}" class="flex-1 text-left tap-bounce" style="min-height:48px">
              <div class="font-bold text-sm ${done ? 'line-through opacity-60' : ''}">${s.icon} ${s.title} <span class="text-xs font-normal text-gray-400">${s.minutes}′</span></div>
              <div class="text-xs text-gray-500">${s.detail}</div>
            </button>
            <span class="text-xl text-gray-300">›</span>
          </div>`;
        }).join('')}
      </div>
      ${doneCount >= dayData.slots.length ? `
        <button id="finishDayBtn" class="w-full btn-cartoon mt-3">🎉 完成今天 → 进入 Day ${Math.min(day + 1, plan.totalDays)}</button>
      ` : doneCount >= minDone ? `
        <button id="finishDayBtn" class="w-full btn-cartoon btn-cartoon-secondary mt-3">已完成 ${doneCount} 格，也可以收工 → Day ${Math.min(day + 1, plan.totalDays)}</button>
      ` : ''}
    </div>

    <!-- 进度环（用进度条呈现，窄屏更稳） -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">📈 进度一览</h3>
      <div class="text-xs mb-1 flex justify-between"><span>词汇 ${vocabNow} / ${KET_VOCAB_TARGET}（KET 线）</span><span>${vocabPct}%</span></div>
      <div class="progress-bar mb-3"><div class="progress-bar-fill" style="width:${vocabPct}%"></div></div>
      <div class="text-xs mb-1 flex justify-between"><span>计划 Day ${day} / ${plan.totalDays}</span><span>${dayPct}%</span></div>
      <div class="progress-bar mb-3"><div class="progress-bar-fill" style="width:${dayPct}%"></div></div>
      <div class="text-sm">🗓️ 本周学习 <b class="text-primary">${weekDays}</b> 天</div>
    </div>

    <!-- 九宫格入口 -->
    <div class="grid grid-cols-3 gap-3">
      ${[
        ['exam-plan', '🗺️', '规划'], ['exam-knowledge', '💡', '知识点'], ['exam-grammar', '🎼', '语法'],
        ['exam-reading', '📖', '阅读'], ['exam-writing', '✍️', '写作'], ['exam-mock', '📝', '模考'],
        ['exam-checkin', '📅', '打卡'], ['exam-resources', '🔗', '资源'], ['exam-report', '📊', '报告']
      ].map(([page, icon, name]) => `
        <button data-nav="${page}" class="card-cartoon tap-bounce text-center" style="padding:14px 6px;min-height:48px">
          <div class="text-3xl">${icon}</div>
          <div class="font-bold text-sm mt-1">${name}</div>
        </button>`).join('')}
    </div>
  `;

  // 九宫格与六格跳转
  app.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => window.__nav(b.dataset.nav)));
  dayData.slots.forEach(s => {
    const go = app.querySelector(`[data-goto="${s.id}"]`);
    if (go) go.addEventListener('click', () => window.__nav(s.nav, s.params || {}));
    const chk = app.querySelector(`[data-check="${s.id}"]`);
    if (chk) chk.addEventListener('click', () => {
      const wasDone = !!storage.getPlanTaskState(level, day)[s.id];
      storage.markPlanTask(level, day, s.id, !wasDone);
      const nowDone = Object.keys(storage.getPlanTaskState(level, day)).length;
      storage.recordCheckin(level, todayISO(), nowDone); // 打卡记真实日期
      if (!wasDone) {
        const over = addMinutesWithGuard(level, s.minutes);
        // 健康护栏：超 120 分钟温和劝停，不鼓励继续刷
        if (over) toast('今天已经够了，明天再来 💪', 'warn');
        else toast(`${s.title} 完成！`, 'success');
      }
      renderExamHub(app);
    });
  });

  // 完成今天 → Day +1（这是 Day N 前进的唯一途径）
  const finBtn = app.querySelector('#finishDayBtn');
  if (finBtn) finBtn.addEventListener('click', () => {
    const newDay = storage.advancePlanDay(level);
    toast(`🎉 Day ${day} 完成！明天从 Day ${newDay} 继续`, 'success');
    renderExamHub(app);
  });

  // 修改考试目标日
  const dateBtn = app.querySelector('#editDateBtn');
  if (dateBtn) dateBtn.addEventListener('click', () => showDatePicker(app, level));
}

// PET 轻量 Dashboard：跨度说明卡 + 现有词库/阅读入口 + 体验卷/资源
async function renderPetHub(app) {
  const { loadJSON } = await import('../../app.js');
  const facts = await loadJSON('data/exam/pet/facts.json');
  const gap = facts && facts.gapCard;
  app.innerHTML = `
    <div class="card-cartoon mb-4 text-center bg-gradient-to-br from-orange-50 to-pink-50">
      <div class="text-5xl mb-2">🎓</div>
      <h2 class="text-xl font-bold">PET (B1 Preliminary)</h2>
      <p class="text-xs text-gray-500 mt-1">排在 KET 拿证之后（2027 下半年起）——现在的任务是攒词汇</p>
    </div>
    ${gap ? `
    <div class="card-cartoon mb-4 border-2 border-red-300 bg-red-50">
      <div class="font-bold text-sm mb-2">📏 ${gap.title}</div>
      ${gap.rows.map(r => `
        <div class="flex gap-2 text-xs py-1.5 border-b border-red-100 last:border-0">
          <span class="font-bold" style="min-width:44px">${r.item}</span>
          <span class="text-gray-600 flex-1">KET: ${r.ket}</span>
          <span class="text-gray-800 flex-1">PET: ${r.pet}</span>
        </div>`).join('')}
      <div class="text-xs text-red-600 mt-2">${gap.conclusion}</div>
    </div>` : ''}
    <div class="space-y-2">
      ${[
        ['words', '🚀', 'PET 话题词库闯关', '22 个话题，主线任务'],
        ['reading', '📖', 'PET 阅读', '15 篇 B1 阅读'],
        ['exam-knowledge', '💡', 'PET 考试知识点', '4 张卷 / 量表 153+ 目标'],
        ['exam-mock', '📝', 'PET 体验卷', '感受 B1 跨度（KET 后再正式练）'],
        ['exam-resources', '🔗', '官方资源', 'PET 样卷/词表/评分标准外链']
      ].map(([page, icon, name, desc]) => `
        <button data-nav="${page}" class="w-full card-cartoon tap-bounce flex items-center gap-3 text-left" style="padding:12px 14px">
          <span class="text-3xl">${icon}</span>
          <div class="flex-1"><div class="font-bold text-sm">${name}</div><div class="text-xs text-gray-500">${desc}</div></div>
          <span class="text-xl text-gray-300">›</span>
        </button>`).join('')}
    </div>
  `;
  app.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => window.__nav(b.dataset.nav)));
}

// 首次进入的起始设置
function renderSetup(app, level, ep) {
  app.innerHTML = `
    <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <div class="text-6xl mb-2">🗝️</div>
      <h2 class="text-xl font-bold mb-1">KET 备考中心</h2>
      <p class="text-sm text-gray-600">45 天核心期 · 每天 90 分钟 · 目标 2027 春季 140+（A 等 = 证书认定 B1）</p>
    </div>
    <div class="card-cartoon mb-4">
      <div class="font-bold text-sm mb-2">① 考试目标日（可以随时改）</div>
      <input id="examDateInput" type="date" value="${ep.examDate || '2027-04-15'}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base" />
      <div class="text-xs text-gray-400 mt-1">2027 春季约在 3-4 月，具体考期 2026 年 12 月起问考点</div>
    </div>
    <div class="card-cartoon mb-4 bg-blue-50">
      <div class="text-sm text-gray-700">② 没有「起始日期」这回事——计划进度由完成度推进：<b>学了就前进，没学就原地等你，永远不欠账。</b></div>
    </div>
    <button id="startBtn" class="w-full btn-cartoon">🚀 开始第 1 天</button>
  `;
  app.querySelector('#startBtn').addEventListener('click', () => {
    const date = app.querySelector('#examDateInput').value || '2027-04-15';
    storage.setExamProfile({ ...ep, level, examDate: date, started: true });
    toast('出发！Day 1 见 🎉', 'success');
    renderExamHub(app);
  });
}

// 修改考试目标日弹窗
function showDatePicker(app, level) {
  const ep = storage.getExamProfile();
  showModal(`
    <div class="p-6">
      <h3 class="font-bold text-center mb-3">修改考试目标日</h3>
      <input id="mExamDate" type="date" value="${ep.examDate}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base mb-4" />
      <div class="flex gap-3">
        <button id="mCancel" class="flex-1 btn-cartoon btn-cartoon-secondary">取消</button>
        <button id="mSave" class="flex-1 btn-cartoon">保存</button>
      </div>
    </div>
  `);
  document.getElementById('mCancel').addEventListener('click', closeModal);
  document.getElementById('mSave').addEventListener('click', () => {
    const v = document.getElementById('mExamDate').value;
    if (v) storage.setExamProfile({ ...ep, examDate: v });
    closeModal();
    renderExamHub(app);
  });
}
