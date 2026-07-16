// modules/exam/knowledge.js —— 模块 2：核心知识点（卡片式，四组）
// 2.1 KET 是什么 / 2.2 三张卷 / 2.3 分数等级 / 2.4 投入产出比 / 2.5 自然拼读
import { loadJSON } from '../../app.js';
import { examLevel, headerHtml, bindBack } from './exam-common.js';

export async function renderKnowledge(app, params = {}) {
  const level = examLevel();
  const dir = level.toLowerCase();
  const [facts, know] = await Promise.all([
    loadJSON(`data/exam/${dir}/facts.json`),
    level === 'KET' ? loadJSON(`data/exam/${dir}/knowledge.json`) : Promise.resolve(null) // PET 无拼读/听说卡
  ]);
  if (!facts) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">💡</span><div class="empty-text">知识点数据加载失败</div></div>';
    return;
  }

  // 拼读卡片子页（计划六格②直达）
  if (params.card === 'phonics' && know) return renderPhonics(app, know);

  app.innerHTML = `
    ${headerHtml('💡 核心知识点')}

    <!-- 2.1 KET 是什么 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">🗝️ ${facts.fullName} 是什么</h3>
      <ul class="text-sm text-gray-700 space-y-1.5">
        <li>· ${facts.overview.papers} 张卷，${facts.overview.totalTime}</li>
        <li>· ${facts.overview.listeningTwice}</li>
        <li>· ${facts.overview.speakingExaminers}</li>
        <li>· ${facts.overview.paperVsComputer}</li>
      </ul>
    </div>

    <!-- 2.2 三张卷 -->
    <h3 class="font-bold mb-2">📄 三张卷</h3>
    ${facts.papers.map(p => `
      <div class="card-cartoon mb-3">
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold">${p.name}</span>
          <span class="text-xs bg-orange-100 text-orange-600 rounded-full px-2 py-0.5 font-bold">${p.weight}</span>
        </div>
        <div class="text-xs text-gray-500 mb-2">${p.time} · ${p.structure} · ${p.timing}</div>
        <div class="text-xs text-gray-500 mb-2">计分：${p.scoring}</div>
        <div class="space-y-1">
          ${p.parts.map(pt => `
            <div class="flex gap-2 text-sm">
              <span class="font-bold text-primary" style="min-width:32px">P${pt.part}</span>
              <span class="flex-1"><b>${pt.name}</b>${pt.questions ? ` ×${pt.questions}` : ''} — <span class="text-gray-600 text-xs">${pt.desc}</span></span>
            </div>`).join('')}
        </div>
        ${p.tip ? `<div class="text-xs bg-yellow-50 text-orange-700 rounded-xl px-3 py-2 mt-2">⚠️ ${p.tip}</div>` : ''}
      </div>`).join('')}

    <!-- 2.3 分数与等级 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">🏅 分数与等级（${facts.scale.name}）</h3>
      ${facts.scale.rows.map(r => `
        <div class="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 ${r.highlight ? 'bg-amber-50 rounded-xl px-2' : ''}">
          <span class="font-bold font-en" style="min-width:80px">${r.range}</span>
          <span class="text-sm" style="min-width:72px">${r.grade}</span>
          <span class="text-xs text-gray-600 flex-1">${r.cert}</span>
        </div>`).join('')}
      <div class="text-xs text-gray-500 mt-2">${facts.scale.note}</div>
    </div>

    ${facts.grammarDiff ? `
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">🎼 ${facts.grammarDiff.title}</h3>
      ${facts.grammarDiff.items.map(i => `<p class="text-sm text-gray-700 mb-1">· ${i}</p>`).join('')}
    </div>` : ''}

    ${facts.roi && facts.roi.length ? `
    <!-- 2.4 投入产出比策略卡 -->
    <div class="card-cartoon mb-4 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
      <h3 class="font-bold mb-2">💰 投入产出比策略</h3>
      ${facts.roi.map(r => `<p class="text-sm text-gray-700 mb-1.5">· ${r}</p>`).join('')}
    </div>` : ''}

    ${know ? `
    <!-- 2.5 自然拼读入口 -->
    <button id="phonicsBtn" class="w-full card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-br from-cyan-50 to-blue-50 mb-3">
      <div class="text-4xl">🔤</div>
      <div class="flex-1">
        <div class="font-bold">自然拼读速修</div>
        <div class="text-xs text-gray-500">W1-W2 每天 10 分钟 · 回报最高的一格</div>
      </div>
      <div class="text-2xl text-gray-300">›</div>
    </button>` : ''}

    ${know ? `
    <div class="card-cartoon mb-3">
      <h3 class="font-bold mb-2">🎧 ${know.listeningSteps.title}</h3>
      ${know.listeningSteps.steps.map(s => `<p class="text-sm text-gray-700 mb-1">${s}</p>`).join('')}
      <div class="text-xs text-gray-400 mt-1">${know.listeningSteps.note}</div>
    </div>
    <div class="card-cartoon mb-3">
      <h3 class="font-bold mb-2">🗣️ ${know.speakingTopics.title}</h3>
      <div class="flex flex-wrap gap-1.5 mb-2">
        ${know.speakingTopics.topics.map(t => `<span class="text-xs bg-gray-100 rounded-full px-3 py-1">${t}</span>`).join('')}
      </div>
      <div class="text-xs bg-green-50 text-green-700 rounded-xl px-3 py-2">💡 ${know.speakingTopics.tip}</div>
    </div>` : ''}
  `;
  bindBack(app);
  const pb = app.querySelector('#phonicsBtn');
  if (pb) pb.addEventListener('click', () => renderKnowledge(app, { card: 'phonics' }));
}

// 拼读卡片翻页
function renderPhonics(app, know) {
  const ph = know.phonics;
  let idx = 0;

  function draw() {
    const c = ph.cards[idx];
    app.innerHTML = `
      ${headerHtml('🔤 自然拼读速修')}
      <div class="text-xs text-gray-500 mb-3">${ph.why}</div>
      <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-cyan-50 to-blue-50" style="min-height:220px">
        <div class="text-xs text-gray-400 mb-2">卡片 ${idx + 1} / ${ph.cards.length}</div>
        <div class="text-2xl font-black mb-2 font-en">${c.rule}</div>
        <p class="text-sm text-gray-700 mb-3">${c.tip}</p>
        <div class="flex flex-wrap justify-center gap-2">
          ${c.examples.map(w => `<span class="pet-chip font-en text-base">${w}</span>`).join('')}
        </div>
      </div>
      <div class="flex gap-3">
        <button id="prevBtn" class="flex-1 btn-cartoon btn-cartoon-secondary" ${idx === 0 ? 'disabled style="opacity:.4"' : ''}>‹ 上一张</button>
        <button id="nextBtn" class="flex-1 btn-cartoon" ${idx === ph.cards.length - 1 ? 'disabled style="opacity:.4"' : ''}>下一张 ›</button>
      </div>
      <div class="text-xs text-gray-400 text-center mt-3">${ph.howto}</div>
    `;
    bindBack(app);
    app.querySelector('#prevBtn').addEventListener('click', () => { if (idx > 0) { idx--; draw(); } });
    app.querySelector('#nextBtn').addEventListener('click', () => { if (idx < ph.cards.length - 1) { idx++; draw(); } });
  }
  draw();
}
