// modules/exam/plan.js —— 模块 1：学习进度规划（长期弧线 + 45 天计划总览）
import { loadJSON } from '../../app.js';
import * as storage from '../../storage.js';
import { examLevel, headerHtml, bindBack, loadPlan, loadExamConfig, fillSeason } from './exam-common.js';

const PHASE_BG = {
  orange: 'from-orange-50 to-amber-50', cyan: 'from-cyan-50 to-blue-50',
  yellow: 'from-yellow-50 to-amber-50', pink: 'from-pink-50 to-rose-50',
  gold: 'from-amber-100 to-yellow-50', green: 'from-green-50 to-emerald-50'
};

export async function renderPlan(app) {
  const level = examLevel();
  await loadExamConfig(); // 考季占位符（P0.6）
  const [longterm, plan] = await Promise.all([
    loadJSON(`data/exam/${level.toLowerCase()}/plan-longterm.json`),
    loadPlan(level)
  ]);
  if (!longterm || !plan) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">🗺️</span><div class="empty-text">规划数据加载失败</div></div>';
    return;
  }
  const day = storage.getPlanDay(level);

  app.innerHTML = `
    ${headerHtml('🗺️ 学习进度规划')}

    <!-- 捷径卡（金色，全案最有价值） -->
    <div class="card-cartoon mb-4 border-2 border-amber-400 bg-gradient-to-br from-amber-100 to-yellow-50">
      <div class="font-bold mb-2">${longterm.shortcutCard.title}</div>
      ${longterm.shortcutCard.lines.map(l => `<p class="text-sm text-gray-700 mb-1">${l}</p>`).join('')}
    </div>

    <!-- 排除项卡（红色） -->
    <div class="card-cartoon mb-4 border-2 border-red-300 bg-red-50">
      <div class="font-bold mb-2 text-red-600">${longterm.excludeCard.title}</div>
      ${longterm.excludeCard.lines.map(l => `<p class="text-sm text-gray-700 mb-1">${l}</p>`).join('')}
    </div>

    <!-- 长期弧线时间轴 -->
    <h3 class="font-bold mb-2">📅 长期弧线</h3>
    <div class="space-y-2 mb-5">
      ${longterm.phases.map(p => `
        <div class="card-cartoon bg-gradient-to-r ${PHASE_BG[p.color] || 'from-gray-50 to-gray-50'} ${p.highlight ? 'border-2 border-amber-300' : ''}" style="padding:12px 14px">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${p.icon}</span>
            <span class="font-bold">${p.name}</span>
            <span class="text-xs text-gray-500 flex-1 text-right">${fillSeason(p.trigger)}</span>
          </div>
          <div class="text-xs text-gray-600 mt-1 pl-8">
            ${p.daily !== '—' ? `每日 ${p.daily} · ` : ''}${p.vocab !== '—' ? `词汇 ${p.vocab} · ` : ''}${fillSeason(p.milestone)}
          </div>
        </div>`).join('')}
    </div>

    <!-- 45 天计划周表 -->
    <h3 class="font-bold mb-1">🔥 核心期 45 天（进度制 · 当前 Day ${day}）</h3>
    <div class="text-xs text-gray-500 mb-2">${plan.note}</div>
    <div class="space-y-2 mb-5">
      ${plan.weeks.map(w => `
        <div class="card-cartoon" style="padding:12px 14px">
          <div class="flex items-center gap-2">
            <span class="font-bold text-primary-ink">W${w.week}</span>
            <span class="text-xs text-gray-400">${w.days}</span>
            <span class="text-sm font-bold flex-1">${w.theme}</span>
          </div>
          <div class="text-xs text-gray-600 mt-1">语法主线：${w.grammar}${w.milestone ? ` · ⭐ ${w.milestone}` : ''}</div>
        </div>`).join('')}
    </div>

    <!-- 每日 90 分钟六格说明 -->
    <h3 class="font-bold mb-2">⏱️ 每日 90 分钟 · 六格</h3>
    <div class="card-cartoon mb-4">
      ${[
        ['📚 词汇', '25′', '20 新 + 40 复现（45×20=+900 → 800→1700，正好跨 KET 线）'],
        ['🔤 自然拼读', '10′', '仅 W1-W2；拼读不牢会同时卡住听力和背词，这一格最划算。W3 起这 10′ 并入听力'],
        ['🎯 题型精练+语法', '15′', '语法主线塞这格，不额外加时'],
        ['🎧 听力', '20′→30′', '短板不可省。三步法：盲听→对答案+看原文→跟读'],
        ['✍️/🗣️ 口语/写作（隔日）', '15′', '既是短板，性价比又最高。写作用 Write & Improve 批改'],
        ['📖 分级读物+复盘', '5′', '蓝思 200-400L（几乎不查词才有效）；错题每天只记 3 条']
      ].map(([t, m, d]) => `
        <div class="flex gap-2 py-2 border-b border-gray-50 last:border-0">
          <div class="font-bold text-sm" style="min-width:150px">${t} <span class="text-xs font-normal text-gray-400">${m}</span></div>
          <div class="text-xs text-gray-600 flex-1 wrap-any">${d}</div>
        </div>`).join('')}
      <div class="text-xs text-gray-400 mt-2">合计：W1-W2 = 90′；W3 起 = 90′（拼读 10′ 转给听力）</div>
    </div>

    <button data-nav="exam-hub" class="w-full btn-cartoon">回到今日任务 · Day ${day}</button>
  `;
  bindBack(app);
  app.querySelector('[data-nav]').addEventListener('click', () => window.__nav('exam-hub'));
}
