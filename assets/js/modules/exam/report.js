// modules/exam/report.js —— 模块 9：学习报告 / 弱项诊断
// 三次模考三项趋势（纯 CSS 柱状，避免 Canvas 高清屏问题）+ 弱项诊断一键跳专项 + 本周小结（不做批评）
import * as storage from '../../storage.js';
import { examLevel, headerHtml, bindBack } from './exam-common.js';

const MOCK_ORDER = ['mock-01', 'mock-02', 'mock-03'];
const PART_NAMES = { part1: 'Part 1 主旨', part2: 'Part 2 匹配', part3: 'Part 3 长文', part4: 'Part 4 完形', part5: 'Part 5 小词' };

export async function renderReport(app) {
  const level = examLevel();
  const mocks = storage.getMockResults(level);
  const done = MOCK_ORDER.filter(id => mocks[id]).map(id => ({ id, ...mocks[id] }));
  const learned = Object.keys(storage.getLearnedWords()).length;
  const vocabNow = Math.min(800 + learned, 3500);
  const weekDays = storage.getWeekStudyDays(level);
  const day = storage.getPlanDay(level);
  const mistakes = storage.getMistakes().length;

  // 弱项诊断：汇总最近一次模考各 Part 正确率 + 专项成绩，找最低的
  let weakest = null;
  const last = done[done.length - 1];
  if (last && last.byPart) {
    let minPct = 101;
    Object.entries(last.byPart).forEach(([k, v]) => {
      const pct = v.total ? v.correct / v.total * 100 : 100;
      if (pct < minPct) { minPct = pct; weakest = { part: k, pct: Math.round(pct) }; }
    });
  }

  // 三项趋势柱状
  const trendHtml = done.length === 0
    ? '<div class="text-sm text-gray-400 text-center py-4">还没有模考记录——Day 1 的模考 1 做完就有了</div>'
    : `
    <div class="flex items-end gap-4 justify-around" style="height:150px">
      ${done.map(m => {
        const bars = [
          { label: '读', pct: m.readingPct || 0, color: '#F97316' },
          { label: '写', pct: m.writingPct || 0, color: '#06B6D4' },
          { label: '听', pct: m.listeningPct == null ? 0 : m.listeningPct, color: '#8B5CF6', na: m.listeningPct == null }
        ];
        return `
        <div class="flex flex-col items-center gap-1">
          <div class="flex items-end gap-2" style="height:110px">
            ${bars.map(b => `
              <div class="flex flex-col items-center justify-end" style="height:110px">
                <span class="text-cap text-gray-500">${b.na ? '—' : b.pct + ''}</span>
                <div style="width:20px;height:${Math.max(3, b.pct)}px;background:${b.na ? '#E5E7EB' : b.color};border-radius:6px 6px 0 0"></div>
                <span class="text-cap text-gray-400">${b.label}</span>
              </div>`).join('')}
          </div>
          <div class="text-xs font-bold">${m.id.replace('mock-0', '模考')}</div>
          <div class="text-cap text-gray-400">量表≈${m.scaled}</div>
        </div>`;
      }).join('')}
    </div>`;

  app.innerHTML = `
    ${headerHtml('📊 学习报告')}

    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">📈 三次模考 · 三项趋势（%）</h3>
      ${trendHtml}
    </div>

    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">🔍 弱项诊断</h3>
      ${weakest ? `
        <p class="text-sm text-gray-700 mb-2">最近一次模考里，<b>${PART_NAMES[weakest.part] || weakest.part}</b> 正确率最低（${weakest.pct}%）——先补它，性价比最高。</p>
        <button id="weakBtn" class="w-full btn-cartoon">直达 ${PART_NAMES[weakest.part] || weakest.part} 专项 ›</button>
      ` : '<p class="text-sm text-gray-400">做过模考后，这里会告诉你先补哪个 Part。</p>'}
      ${mistakes > 0 ? `
      <button id="mistakeBtn" class="w-full btn-cartoon btn-cartoon-secondary mt-2">错词突击（${mistakes} 个待毕业）›</button>` : ''}
    </div>

    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">📚 词汇增长</h3>
      <div class="flex items-end gap-2" style="height:90px">
        ${[['起点', 800], ['当前', vocabNow], ['KET线', 1700], ['PET线', 3500]].map(([lb, v]) => `
          <div class="flex-1 flex flex-col items-center justify-end" style="height:90px">
            <span class="text-cap text-gray-500">${v}</span>
            <div style="width:100%;max-width:56px;height:${Math.max(4, v / 3500 * 60)}px;background:${lb === '当前' ? '#F97316' : '#E5E7EB'};border-radius:8px 8px 0 0"></div>
            <span class="text-cap text-gray-400 mt-1">${lb}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">🗓️ 本周小结</h3>
      <div class="text-sm text-gray-700 mb-1">已完成 <b class="text-primary-ink">Day ${day}/45</b> · 本周学习 <b class="text-green-700">${weekDays}</b> 天 · 词汇约 <b>${vocabNow}</b></div>
      <p class="text-sm text-green-700 mt-2">${encourage(day, weekDays)}</p>
    </div>

    <button id="checkinBtn" class="w-full btn-cartoon btn-cartoon-secondary">查看打卡热力图 ›</button>
  `;
  bindBack(app);
  const wb = app.querySelector('#weakBtn');
  if (wb) wb.addEventListener('click', () => window.__nav('exam-reading', { part: weakest.part }));
  const mb = app.querySelector('#mistakeBtn');
  if (mb) mb.addEventListener('click', () => window.__nav('reinforce'));
  app.querySelector('#checkinBtn').addEventListener('click', () => window.__nav('exam-checkin'));
}

// 一句鼓励（不做批评、不提欠账）
function encourage(day, weekDays) {
  if (day >= 45) return '45 天核心期走完了！你已经把 KET 的路全部走过一遍——接下来是巩固期，节奏可以松一点。🎉';
  if (day >= 30) return '走到 Day ' + day + '，最难的坡已经爬过去了。保持这个节奏就够了。🌟';
  if (day >= 15) return '三分之一啦。你现在会的，比 Day 1 的你多得多——不信去看模考 1 的分数。💪';
  if (weekDays >= 3) return '这周学了 ' + weekDays + ' 天，节奏很好。学了就前进，没学就休息，都对。🌱';
  return '每完成一天，进度就往前一格。慢慢来，比较快。🐢';
}
