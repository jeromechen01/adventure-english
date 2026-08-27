// modules/study-stats.js —— V0.7 学习时长页（家长了解工具）
// 定位：中性、诚实的数据呈现——今天学没学、时间花在哪、哪个模块被冷落。
// 红线：与 120 分钟健康护栏一条心。无排行榜、无攀比、无连续天数焦虑、无刷时长诱导。
import * as storage from '../storage.js';
import { STUDY_MODULES } from '../study-time.js';

function fmtMin(seconds) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} 分钟`;
  return `${Math.floor(m / 60)} 小时 ${m % 60} 分`;
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 护栏状态：与备考中心 120 分钟护栏同一口径、同一话术方向（超时=劝休息，绝不鼓励继续）
function guardStatus(totalMin) {
  if (totalMin > 150) return { cls: 'border-orange-300 bg-orange-50', text: '今天时间已经很长了，请一定休息 🌿 记忆效率在下降，明天再学效果更好。' };
  if (totalMin > 120) return { cls: 'border-orange-300 bg-orange-50', text: '今天已经够了，该休息啦 💪 明年还愿意学，比这个月学到饱重要。' };
  if (totalMin >= 90) return { cls: 'border-yellow-300 bg-yellow-50', text: '今天学得不错，注意劳逸结合，到 120 分钟就收。' };
  return { cls: 'border-gray-200', text: '每天 90 分钟是合理节奏，120 分钟是上限。' };
}

// 横向分布条（纯展示分布，不排名不奖励）
function barsHtml(byModule, totalSec) {
  const entries = Object.entries(byModule).filter(([, s]) => s >= 30).sort((a, b) => b[1] - a[1]);
  if (!entries.length || totalSec <= 0) return '<p class="text-sm text-gray-400">还没有记录</p>';
  return entries.map(([id, sec]) => {
    const meta = STUDY_MODULES[id] || { label: id, icon: '📚' };
    const pct = Math.max(4, Math.round(sec / totalSec * 100));
    return `
      <div class="mb-2">
        <div class="flex justify-between text-xs mb-1">
          <span>${meta.icon} ${meta.label}</span>
          <span class="text-gray-500">${fmtMin(sec)}</span>
        </div>
        <div class="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div class="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('');
}

export function renderStudyStats(app) {
  const profile = storage.getProfile();
  const level = profile.examLevel || (profile.grade === 'KET' || profile.grade === 'PET' ? profile.grade : null);

  const today = todayISO();
  const todayByModule = storage.getDailyByModule(today);
  const todaySec = storage.getDailyTotal(today);
  const todayMin = Math.round(todaySec / 60);
  // 与护栏对齐：备考中心打卡任务的估算分钟也纳入判断口径，取两者较大值（宁可早劝停，绝不晚劝停）
  const planMin = level ? storage.getDailyMinutes(level) : 0;
  const guardMin = Math.max(todayMin, planMin);
  const guard = guardStatus(guardMin);

  const week = storage.getWeekTotals();
  const weekMax = Math.max(...week.map(d => d.seconds), 1);
  const WEEK_CAP = 150 * 60; // 柱高上限封顶在 150 分钟，高数字不给"冲顶"视觉刺激
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  const totals30 = storage.getModuleTotals(30);
  const totals30Sum = Object.values(totals30).reduce((a, b) => a + b, 0);
  const totals7 = storage.getModuleTotals(7);

  // 帮家长发现盲区：当前学段的主要模块里，近 7 天没打开过的（中性措辞，不催不吓）
  const gradeModules = profile.grade === 'KET'
    ? ['ket-vocab', 'ket-grammar', 'ket-reading', 'ket-writing', 'ket-knowledge']
    : profile.grade === 'PET'
      ? ['pet-vocab', 'pet-reading']
      : ['vocab', 'grammar', 'reading', 'writing'];
  const coldModules = gradeModules.filter(id => !(totals7[id] > 0));

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-4">
      <button id="statsBackBtn" class="text-2xl tap-bounce" style="min-width:48px;min-height:48px">‹</button>
      <h2 class="text-xl font-bold">⏱ 学习时长</h2>
    </div>
    <p class="text-xs text-gray-400 mb-4">给家长的了解工具：看时间分布和趋势，不比多、不比快。</p>

    <!-- 今日概览 + 护栏状态 -->
    <div class="card-cartoon mb-4 border-2 ${guard.cls}">
      <div class="flex items-end gap-2 mb-1">
        <span class="text-2xl font-black">${todayMin}</span>
        <span class="text-sm text-gray-500 mb-1">分钟 · 今天</span>
      </div>
      ${planMin > 0 && planMin !== todayMin ? `<div class="text-cap text-gray-400 mb-1">另：备考打卡任务估算约 ${planMin} 分钟，护栏按两者较大值判断</div>` : ''}
      <p class="text-sm text-gray-700">🌿 ${guard.text}</p>
    </div>

    <!-- 今日模块分布 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold text-sm mb-3">📊 今天的时间花在哪</h3>
      ${barsHtml(todayByModule, todaySec)}
    </div>

    <!-- 本周趋势：没学的天自然留白，不标"断签" -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold text-sm mb-3">📅 近 7 天</h3>
      <div class="flex items-end justify-between gap-1" style="height:96px">
        ${week.map(d => {
          const h = d.seconds > 0 ? Math.max(6, Math.round(Math.min(d.seconds, WEEK_CAP) / Math.min(Math.max(weekMax, 45 * 60), WEEK_CAP) * 88)) : 0;
          const over = d.seconds > 120 * 60;
          return `
          <div class="flex-1 flex flex-col items-center justify-end" style="height:96px">
            ${d.seconds > 0 ? `<div class="text-cap text-gray-500 mb-1">${Math.round(d.seconds / 60)}</div>
            <div class="w-full max-w-[28px] rounded-t-lg ${over ? 'bg-orange-300' : 'bg-cyan-300'}" style="height:${h}px"></div>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div class="flex justify-between gap-1 mt-1">
        ${week.map(d => {
          const dt = new Date(d.date + 'T00:00:00');
          const isToday = d.date === today;
          return `<div class="flex-1 text-center text-cap ${isToday ? 'font-bold text-primary-ink' : 'text-gray-400'}">${isToday ? '今天' : '周' + weekdays[dt.getDay()]}</div>`;
        }).join('')}
      </div>
      <p class="text-cap text-gray-400 mt-2">数字为分钟；橙色表示超过 120 分钟（提醒休息，不是成就）。</p>
    </div>

    <!-- 近 30 天模块累计：帮家长发现盲区 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold text-sm mb-3">🗂 近 30 天各模块投入</h3>
      ${barsHtml(totals30, totals30Sum)}
      ${coldModules.length && totals30Sum > 0 ? `
      <div class="mt-3 bg-gray-50 rounded-2xl p-3">
        <div class="text-xs text-gray-600">💡 最近 7 天还没打开过：${coldModules.map(id => (STUDY_MODULES[id] || { label: id }).label).join('、')}。不用着急补，安排时顺带看一眼就好。</div>
      </div>` : ''}
    </div>

    <!-- 诚实声明 -->
    <p class="text-cap text-gray-400 text-center mb-4">统计的是页面前台停留时长，仅供参考，不代表"有效学习时间"。<br>数据仅存本设备，不上传。</p>
  `;

  app.querySelector('#statsBackBtn').addEventListener('click', () => window.__nav('me'));
}
