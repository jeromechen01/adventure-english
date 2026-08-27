// modules/exam/exam-hub.js —— 模块 0：备考中心 Dashboard（V0.4）
// 一屏四件事：时钟区 / 今日任务六格 / 进度环 / 九宫格入口。
// ⚠️ 今日任务 = 计划的 Day N（完成度时钟），不是日历的今天。
//    昨天没学 → 今天打开仍是同一个 Day N：不跳号、不补作业、不提醒欠账。
// V0.9 P0.5：日历时钟由「考试日」一个升级为三个（报名开放 / 报名截止 / 考试日），
//    日期与目标分全部读 data/exam/exam-config.json，可在「考试信息」面板改；
//    报名两个节点过期后自动消失。三个时钟只报事实，不加评价（健康护栏）。
import { toast, showModal, closeModal } from '../../app.js';
import * as storage from '../../storage.js';
import { examLevel, daysToExam, todayISO, getTodayTasks, addMinutesWithGuard,
         loadExamConfig, examConfig, saveExamConfig, examClocks, esc, fillSeason } from './exam-common.js';

const KET_VOCAB_START = 800;   // 起点词汇量（家长评估）
const KET_VOCAB_TARGET = 1700; // KET 词汇线

export async function renderExamHub(app) {
  const level = examLevel();
  const ep = storage.getExamProfile();
  await loadExamConfig(); // 三个时钟与目标分都靠它

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

  const cfg = examConfig();
  // 三个日历时钟：报名开放 → 报名截止 → 考试日。前两个过期自动消失，只留考试日。
  const regClock = examClocks().find(c => c.key === 'regOpen' || c.key === 'regClose');

  app.innerHTML = `
    <!-- 时钟区：日历时钟（报名节点 + 考试日）+ 完成度时钟（Day N） -->
    <div class="card-cartoon mb-4 bg-gradient-to-br from-amber-50 to-orange-50">
      ${regClock ? `
      <button data-nav="exam-resources" class="w-full flex items-center gap-3 text-left tap-bounce rounded-2xl px-3 py-2 mb-3 border-2 ${
        regClock.tone === 'red' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
      }" style="min-height:48px">
        <span class="text-2xl">📮</span>
        <div class="flex-1 min-w-0">
          <div class="text-cap text-gray-500">${regClock.label} · ${esc(regClock.date)}</div>
          <div class="text-2xl font-black ${regClock.tone === 'red' ? 'text-red-600' : 'text-yellow-700'}">D-${regClock.days}</div>
          ${regClock.note ? `<div class="text-cap text-gray-600 mt-1">${esc(regClock.note)}</div>` : ''}
        </div>
        <span class="text-xs text-gray-400 whitespace-nowrap">报名七步 ›</span>
      </button>` : ''}
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="text-xs text-gray-500">${level} · 考试倒计时（日历）</div>
          <div class="text-2xl font-black text-orange-700">D-${dday == null ? '?' : dday}</div>
        </div>
        <div class="text-right min-w-0">
          <div class="text-xs text-gray-500">计划进度（完成度）</div>
          <div class="text-2xl font-black text-primary-ink">Day ${day} <span class="text-base text-gray-400">/ ${plan.totalDays}</span></div>
          <div class="text-cap text-gray-400">学了就前进，没学就原地等你</div>
        </div>
      </div>
      <!-- 考试日与目标分独占一行：窄屏放进左列会把右边的 Day N 挤出屏幕 -->
      ${cfg.editable !== false
        ? `<button id="examInfoBtn" class="w-full text-left text-cap text-gray-500 underline mt-1" style="min-height:44px">考试日 ${esc(cfg.examDate || '未设置')} · 目标 ${cfg.targetScore}+（可改）</button>`
        : `<div class="text-cap text-gray-500 mt-2">考试日 ${esc(cfg.examDate || '未设置')} · 目标 ${cfg.targetScore}+</div>`}
      ${cfg.examDateNote ? `<div class="text-cap text-gray-400">ℹ️ ${esc(cfg.examDateNote)}</div>` : ''}
    </div>

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
              <div class="text-xs text-gray-500">${fillSeason(s.detail)}</div>
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
      <div class="text-sm">🗓️ 本周学习 <b class="text-primary-ink">${weekDays}</b> 天</div>
    </div>

    <!-- 词汇主线入口 -->
    <button data-nav="words" class="w-full card-cartoon tap-bounce text-left mb-4 relative overflow-hidden"
      style="background:linear-gradient(135deg,#FFE3C2,#FFD0E0);padding:18px">
      <div class="absolute right-3 top-3 text-5xl opacity-30">🚀</div>
      <div class="text-xs font-bold text-orange-700 mb-1">🔥 主线任务</div>
      <div class="text-xl font-extrabold mb-1">KET 单词闯关</div>
      <div class="text-xs text-gray-600">20 个话题 · 1416 词 · 识词 + 闯关 + 错词突击</div>
    </button>

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

  // 考试信息面板（日期与目标分）
  const infoBtn = app.querySelector('#examInfoBtn');
  if (infoBtn) infoBtn.addEventListener('click', () => showExamInfoPanel(app));
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
      <p class="text-xs text-gray-500 mt-1">排在 KET 拿证之后——现在的任务是攒词汇</p>
    </div>
    ${gap ? `
    <div class="card-cartoon mb-4 border-2 border-red-300 bg-red-50">
      <div class="font-bold text-sm mb-2">📏 ${gap.title}</div>
      ${gap.rows.map(r => `
        <div class="flex gap-2 text-xs py-2 border-b border-red-100 last:border-0">
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

// 首次进入的起始设置（日期与目标分来自 data/exam/exam-config.json）
function renderSetup(app, level, ep) {
  const c = examConfig();
  app.innerHTML = `
    <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-amber-50 to-orange-50">
      <div class="text-6xl mb-2">🗝️</div>
      <h2 class="text-xl font-bold mb-1">KET 备考中心</h2>
      <p class="text-sm text-gray-600">45 天核心期 · 每天 90 分钟 · 目标 ${c.targetScore}+（A 等 = 证书认定 B1）</p>
    </div>
    <div class="card-cartoon mb-4">
      <div class="font-bold text-sm mb-2">① 考试日期（可以随时改）</div>
      <input id="examDateInput" type="date" value="${esc(ep.examDate || c.examDate)}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base" />
      ${c.examDateNote ? `<div class="text-xs text-gray-400 mt-1">${esc(c.examDateNote)}</div>` : ''}
      <div class="text-xs text-gray-500 mt-2">📍 ${esc(c.registerTip || '')}</div>
    </div>
    <div class="card-cartoon mb-4 bg-blue-50">
      <div class="text-sm text-gray-700">② 没有「起始日期」这回事——计划进度由完成度推进：<b>学了就前进，没学就原地等你，永远不欠账。</b></div>
    </div>
    <button id="startBtn" class="w-full btn-cartoon">🚀 开始第 1 天</button>
  `;
  app.querySelector('#startBtn').addEventListener('click', () => {
    const date = app.querySelector('#examDateInput').value || c.examDate;
    storage.setExamProfile({ ...ep, level, examDate: date, started: true });
    saveExamConfig({ examDate: date });
    toast('出发！Day 1 见 🎉', 'success');
    renderExamHub(app);
  });
}

// 「考试信息」面板：四个字段可改，存 localStorage，保存后三个时钟即时刷新。
// 只改日期与目标分，不碰 45 天计划——计划进度依旧是完成度制，与日历解耦。
export function showExamInfoPanel(app) {
  const c = examConfig();
  showModal(`
    <div class="p-6">
      <h3 class="font-bold text-center text-lg mb-1">🗓️ 考试信息</h3>
      <p class="text-cap text-gray-400 text-center mb-4">改完立即生效；只影响上面三个倒计时，不影响 45 天计划进度</p>

      <label class="block text-sm font-bold mb-1">考试日期</label>
      <input id="cfgExamDate" type="date" value="${esc(c.examDate)}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base mb-1" />
      ${c.examDateNote ? `<div class="text-cap text-gray-400 mb-3">${esc(c.examDateNote)}</div>` : '<div class="mb-3"></div>'}

      <label class="block text-sm font-bold mb-1">报名开放日</label>
      <input id="cfgRegOpen" type="date" value="${esc(c.regOpenDate)}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base mb-3" />

      <label class="block text-sm font-bold mb-1">报名截止日</label>
      <input id="cfgRegClose" type="date" value="${esc(c.regCloseDate)}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base mb-3" />

      <label class="block text-sm font-bold mb-1">目标分</label>
      <input id="cfgTarget" type="number" min="0" max="160" step="1" value="${Number(c.targetScore) || 140}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base mb-4" />

      <div class="text-xs text-gray-600 bg-blue-50 rounded-2xl px-3 py-2 mb-4">📍 ${esc(c.registerTip || '报名走考点，不能自己上官网报。cambridgeenglish.cn → Find a centre')}</div>

      <div class="flex gap-3">
        <button id="cfgCancel" class="flex-1 btn-cartoon btn-cartoon-secondary">取消</button>
        <button id="cfgSave" class="flex-1 btn-cartoon">保存</button>
      </div>
    </div>
  `);
  document.getElementById('cfgCancel').addEventListener('click', closeModal);
  document.getElementById('cfgSave').addEventListener('click', () => {
    const num = parseInt(document.getElementById('cfgTarget').value, 10);
    saveExamConfig({
      examDate: document.getElementById('cfgExamDate').value || c.examDate,
      regOpenDate: document.getElementById('cfgRegOpen').value,
      regCloseDate: document.getElementById('cfgRegClose').value,
      targetScore: Number.isFinite(num) ? Math.min(160, Math.max(0, num)) : c.targetScore,
    });
    closeModal();
    toast('考试信息已更新', 'success');
    renderExamHub(app);
  });
}
