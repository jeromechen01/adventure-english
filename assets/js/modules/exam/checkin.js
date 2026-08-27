// modules/exam/checkin.js —— 模块 7：进度打卡
// ★ 进度与日期解耦：热力图记「真实日期」；Day N 由完成度推进。
//   跳过一天 → 日历留白、进度原地等，不惩罚、不断签、无「欠账/你已 X 天没学」提示。
//   弱化 streak：只显示「已完成 Day N/45」和「本周学习 X 天」。
import { toast } from '../../app.js';
import * as storage from '../../storage.js';
import { examLevel, todayISO, getTodayTasks, addMinutesWithGuard, loadExamConfig, fillSeason } from './exam-common.js';

const VOCAB_MARKS = [
  { at: 800, label: '起点 800' },
  { at: 1700, label: 'KET 线 1700' },
  { at: 2300, label: '巩固 2300' },
  { at: 3500, label: 'PET 线 3500' }
];

export async function renderCheckin(app) {
  const level = examLevel();
  await loadExamConfig(); // 考季占位符（P0.6）
  const t = await getTodayTasks(level);
  if (!t) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">📅</span><div class="empty-text">数据加载失败</div></div>';
    return;
  }
  const { plan, day, dayData, doneMap } = t;
  const cal = storage.getCheckinCalendar(level);
  const weekDays = storage.getWeekStudyDays(level);
  const todayMin = storage.getDailyMinutes(level);
  const learned = Object.keys(storage.getLearnedWords()).length;
  const vocabNow = Math.min(800 + learned, 3500);
  const vocabPct = Math.min(100, Math.round((vocabNow - 800) / (3500 - 800) * 100));

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="examBackBtn" class="text-2xl tap-bounce" style="min-width:48px;min-height:48px">‹</button>
      <h2 class="text-xl font-bold flex-1">📅 进度打卡</h2>
    </div>

    <!-- 状态卡：不做连续天数，不做欠账 -->
    <div class="card-cartoon mb-4 bg-gradient-to-br from-green-50 to-emerald-50">
      <div class="grid grid-cols-2 gap-3 text-center">
        <div><div class="text-2xl font-black text-primary-ink">Day ${day}/${plan.totalDays}</div><div class="text-xs text-gray-500">已完成进度（学了才前进）</div></div>
        <div><div class="text-2xl font-black text-green-700">${weekDays} 天</div><div class="text-xs text-gray-500">本周学习</div></div>
      </div>
    </div>

    <!-- 每日六格 checklist -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">✅ Day ${day} 六格（约 90 分钟）</h3>
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
          </div>`;
        }).join('')}
      </div>
      <div class="text-xs text-gray-400 mt-2">今日已投入约 ${Math.max(todayMin, storage.getStudyTodayMinutes())} 分钟${Math.max(todayMin, storage.getStudyTodayMinutes()) > 120 ? ' · 今天已经够了，明天再来 💪' : ''} · <button id="toTimeStatsBtn" class="underline">查看时长分布</button></div>
    </div>

    <!-- 热力图日历（真实日期，如实显示） -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">🗓️ 学习日历（最近 12 周）</h3>
      ${heatmapHtml(cal)}
      <div class="flex items-center gap-2 mt-2 text-cap text-gray-400">
        <span>少</span>
        ${[0, 1, 3, 5, 6].map(n => `<span class="inline-block rounded" style="width:14px;height:14px;background:${heatColor(n)}"></span>`).join('')}
        <span>多（格数）</span>
      </div>
      <div class="text-xs text-gray-400 mt-1">留白的日子就是没学的日子——进度在原地等你，没有欠账。</div>
    </div>

    <!-- 词汇进度条 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">📚 词汇进度</h3>
      <div class="progress-bar mb-1"><div class="progress-bar-fill" style="width:${vocabPct}%"></div></div>
      <div class="flex justify-between text-cap text-gray-400">
        ${VOCAB_MARKS.map(m => `<span>${m.label}</span>`).join('')}
      </div>
      <div class="text-sm mt-1">当前约 <b class="text-primary-ink">${vocabNow}</b> 词</div>
    </div>

    <!-- ★ 健康护栏（刚性需求，不是装饰） -->
    <div class="card-cartoon border-2 border-green-300 bg-green-50">
      <h3 class="font-bold mb-2">🌿 健康护栏</h3>
      <p class="text-sm text-gray-700 mb-2">每天 90 分钟、每周建议至少休一天，是 11 岁孩子的合理节奏。</p>
      <p class="text-sm text-gray-700 mb-2">再往上加，三件事会同时发生：记忆效率下降、对英语产生抵触、生活被榨干。</p>
      <p class="text-sm text-gray-700 mb-2">这是一场要打很久的仗——<b>一年后还愿意学的孩子，比这个月被榨干的孩子走得远得多。</b></p>
      <p class="text-sm text-gray-700">乐团练习、每天户外、充足睡眠，一样都别砍。</p>
    </div>
  `;

  app.querySelector('#examBackBtn').addEventListener('click', () => window.__nav('exam-hub'));
  const tsBtn = app.querySelector('#toTimeStatsBtn');
  if (tsBtn) tsBtn.addEventListener('click', () => window.__nav('timestats'));
  dayData.slots.forEach(s => {
    const go = app.querySelector(`[data-goto="${s.id}"]`);
    if (go) go.addEventListener('click', () => window.__nav(s.nav, s.params || {}));
    const chk = app.querySelector(`[data-check="${s.id}"]`);
    if (chk) chk.addEventListener('click', () => {
      const wasDone = !!storage.getPlanTaskState(level, day)[s.id];
      storage.markPlanTask(level, day, s.id, !wasDone);
      storage.recordCheckin(level, todayISO(), Object.keys(storage.getPlanTaskState(level, day)).length);
      if (!wasDone) {
        const over = addMinutesWithGuard(level, s.minutes);
        if (over) toast('今天已经够了，明天再来 💪', 'warn');
        else toast(`${s.title} 完成！`, 'success');
      }
      renderCheckin(app);
    });
  });
}

// 热力图颜色（绿色深浅 = 完成格数；0 = 留白，不是红色——没学不是错）
function heatColor(n) {
  if (!n) return '#F3F4F6';
  if (n <= 1) return '#BBF7D0';
  if (n <= 3) return '#4ADE80';
  if (n <= 5) return '#22C55E';
  return '#15803D';
}

// 最近 12 周热力图：列 = 周，行 = 周一到周日
function heatmapHtml(cal) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 找到本周周一
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - (today.getDay() + 6) % 7);
  const weeks = [];
  for (let w = 11; w >= 0; w--) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(thisMonday);
      dt.setDate(thisMonday.getDate() - w * 7 + d);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      col.push({ iso, future: dt > today, n: cal[iso] || 0, isToday: dt.getTime() === today.getTime() });
    }
    weeks.push(col);
  }
  return `
    <div style="overflow-x:auto">
      <div style="display:flex;gap:3px">
        ${weeks.map(col => `
          <div style="display:flex;flex-direction:column;gap:3px">
            ${col.map(c => `<span title="${c.iso}${c.n ? ' · ' + c.n + ' 格' : ''}" style="width:14px;height:14px;border-radius:4px;background:${c.future ? 'transparent' : heatColor(c.n)};${c.isToday ? 'outline:2px solid #F97316;outline-offset:1px' : ''}"></span>`).join('')}
          </div>`).join('')}
      </div>
    </div>`;
}
