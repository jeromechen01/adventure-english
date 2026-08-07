// modules/exam/mock-exam.js —— 模块 6：模拟考试
// 原创全真卷：7 部分 32 题（Q1-30 各 1 分 + Q31/Q32 各 15 分 = 60）+ 60 分钟倒计时 + 自动交卷
// P1-5 自动判分；P6/P7 用自评清单打分或跳 Write & Improve；三项（阅读/写作/听力）分开记。
import { loadJSON, toast } from '../../app.js';
import * as storage from '../../storage.js';
import { runDrillSet, runListeningSet } from './reading-drill.js';
import { examLevel, headerHtml, bindBack, esc, loadExamConfig, fillSeason } from './exam-common.js';

let mockTimer = null;

export async function renderMockExam(app, params = {}) {
  if (mockTimer) { clearInterval(mockTimer); mockTimer = null; removeBar(); }
  const level = examLevel();
  await loadExamConfig(); // 决策矩阵文案里的 {本考季}/{下一考季} 靠它派生（P0.6）
  const idx = await loadJSON(`data/exam/${level.toLowerCase()}/mocks/index.json`);
  if (!idx) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">📝</span><div class="empty-text">模考数据加载失败</div></div>';
    return;
  }

  if (params.mock) {
    const m = idx.mocks.find(x => x.id === params.mock && !x.external);
    if (m) return startFlow(app, level, idx, m);
  }

  const results = storage.getMockResults(level);
  const decision = storage.getExamDecision(level);

  app.innerHTML = `
    ${headerHtml('📝 模拟考试')}
    <div class="card-cartoon mb-4 bg-blue-50">
      ${idx.explainCard.map(l => `<p class="text-sm text-gray-700 mb-1.5">${l}</p>`).join('')}
      <div class="text-xs text-gray-500 mt-1">${idx.scoring}</div>
    </div>

    <div class="space-y-2 mb-4">
      ${idx.mocks.map(m => {
        const r = results[m.id];
        if (m.external) {
          return `
          <a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer" class="block card-cartoon tap-bounce border-2 border-amber-300 bg-amber-50" style="padding:12px 14px">
            <div class="font-bold text-sm">${m.name} <span class="text-xs font-normal text-gray-400">${m.when}</span> ↗</div>
            <div class="text-xs text-gray-600 mt-1">${fillSeason(m.preNote)}</div>
          </a>`;
        }
        return `
        <button data-mock="${m.id}" class="w-full card-cartoon tap-bounce text-left" style="padding:12px 14px">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${r ? '✅' : '📝'}</span>
            <div class="flex-1">
              <div class="font-bold text-sm">${m.name} <span class="text-xs font-normal text-gray-400">${m.when} · ${m.difficulty}</span></div>
              ${r ? `<div class="text-xs text-green-600">已考：阅读 ${r.readingPct}% · 写作 ${r.writingRaw}/30 · 听力 ${r.listeningPct == null ? '—' : r.listeningPct + '%'} · 估算量表 ${r.scaled}</div>`
                  : `<div class="text-xs text-gray-500">${fillSeason(m.preNote)}</div>`}
            </div>
            <span class="text-xl text-gray-300">›</span>
          </div>
        </button>`;
      }).join('')}
    </div>

    ${decision ? `
    <div class="card-cartoon mb-4 border-2 ${decision.scaled >= 120 ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}">
      <div class="font-bold text-sm mb-1">🧭 当前报考建议（按最近一次模考）</div>
      <div class="text-sm">估算量表分 <b>${decision.scaled}</b> · ${decision.verdict} → ${decision.action}</div>
    </div>` : ''}

    <div class="card-cartoon">
      <div class="font-bold text-sm mb-2">${fillSeason(idx.decisionMatrix.title)}</div>
      ${idx.decisionMatrix.rows.map(r => `
        <div class="flex gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0 ${r.highlight ? 'bg-amber-50 rounded-xl px-2' : ''}">
          <span class="font-bold font-en" style="min-width:72px">${r.range}</span>
          <span style="min-width:80px">${r.verdict}</span>
          <span class="text-xs text-gray-600 flex-1">${fillSeason(r.action)}</span>
        </div>`).join('')}
      <div class="text-xs text-gray-400 mt-2">${idx.decisionMatrix.petNote} · ${idx.estimateNote}</div>
    </div>
  `;
  bindBack(app);
  idx.mocks.filter(m => !m.external).forEach(m => {
    app.querySelector(`[data-mock="${m.id}"]`).addEventListener('click', () => startFlow(app, level, idx, m));
  });
}

function removeBar() { document.body.querySelectorAll('#mockBar').forEach(e => e.remove()); }

// === 模考流程：说明 → RW 卷（60′ 倒计时）→ 写作自评 → 听力（可选）→ 报告 ===
async function startFlow(app, level, idx, meta) {
  const paper = await loadJSON(meta.file);
  if (!paper || !paper.parts) {
    app.innerHTML = `${headerHtml('📝 ' + meta.name)}<div class="card-cartoon empty-state"><span class="empty-emoji">🚧</span><div class="empty-text">这套卷还在填充中</div></div>`;
    bindBack(app, 'exam-mock');
    app.querySelector('#examBackBtn').onclick = () => renderMockExam(app, {});
    return;
  }

  const state = {
    reading: { correct: 0, total: 0, byPart: {} },
    writing: { p6: null, p7: null, drafts: {} },
    listeningPct: null, listeningCorrect: null
  };
  let remain = 60 * 60;

  // 开考前说明（模考1 必须显示「基线不是审判」）
  app.innerHTML = `
    ${headerHtml('📝 ' + meta.name)}
    <div class="card-cartoon mb-4 ${meta.id === 'mock-01' ? 'border-2 border-green-300 bg-green-50' : 'bg-blue-50'}">
      <p class="text-sm text-gray-700">${fillSeason(meta.preNote)}</p>
    </div>
    <div class="card-cartoon mb-4">
      <div class="text-sm text-gray-700 mb-1">· 7 部分 32 题，限时 <b>60 分钟</b>，倒计时结束自动交卷</div>
      <div class="text-sm text-gray-700 mb-1">· Q1-30 各 1 分；Q31(P6)、Q32(P7) 各 15 分（写完按清单自评）</div>
      <div class="text-sm text-gray-700">· 交卷后可接着做配套听力（25 题），三项分开记</div>
    </div>
    <button id="goBtn" class="w-full btn-cartoon">开考！</button>
  `;
  bindBack(app, 'exam-mock');
  app.querySelector('#examBackBtn').onclick = () => renderMockExam(app, {});
  app.querySelector('#goBtn').addEventListener('click', begin);

  function begin() {
    // 倒计时条
    removeBar();
    const bar = document.createElement('div');
    bar.id = 'mockBar';
    bar.className = 'fixed top-14 right-4 bg-red-500 text-white text-sm font-bold rounded-full px-4 py-1 shadow-lg z-40';
    document.body.appendChild(bar);
    mockTimer = setInterval(() => {
      remain--;
      bar.textContent = `⏱️ ${String(Math.floor(remain / 60)).padStart(2, '0')}:${String(remain % 60).padStart(2, '0')}`;
      if (remain <= 0) { toast('时间到，自动交卷', 'warn'); finishRW(); }
    }, 1000);
    runReadingParts(0);
  }

  // 依次跑 P1-P5
  const partKeys = ['part1', 'part2', 'part3', 'part4', 'part5'];
  function runReadingParts(i) {
    if (i >= partKeys.length) return runWriting('p6');
    const key = partKeys[i];
    const set = paper.parts[key];
    if (!set) return runReadingParts(i + 1);
    runDrillSet(app, level, key, set, () => abort(),
      (correct, total) => {
        state.reading.correct += correct;
        state.reading.total += total;
        state.reading.byPart[key] = { correct, total };
        runReadingParts(i + 1);
      });
  }

  // P6/P7 写作 + 自评
  function runWriting(which) {
    const task = paper.parts[which];
    if (!task) return which === 'p6' ? runWriting('p7') : finishRW();
    const minWords = which === 'p6' ? 25 : 35;
    app.innerHTML = `
      ${headerHtml(`${which === 'p6' ? 'Part 6 · 短邮件（Q31）' : 'Part 7 · 三图故事（Q32）'}`)}
      <div class="card-cartoon mb-3 bg-gray-50">
        ${which === 'p6' ? `
          <p class="font-en text-sm mb-2" style="white-space:pre-wrap">${esc(task.prompt)}</p>
          ${task.points.map(p => `<div class="text-xs text-gray-600">· ${esc(p)}</div>`).join('')}
        ` : task.scenes.map((s, i) => `<div class="flex gap-2 mb-1"><span>${['1️⃣', '2️⃣', '3️⃣'][i]}</span><span class="text-sm text-gray-700 flex-1">${esc(s)}</span></div>`).join('')}
        <div class="text-xs text-orange-600 mt-1">写 ${minWords} 词以上</div>
      </div>
      <textarea id="draft" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base mb-3" rows="6" placeholder="${which === 'p6' ? 'Hi …,' : 'One day, …'}"></textarea>
      <button id="doneBtn" class="w-full btn-cartoon">写完了，自评打分</button>
    `;
    bindBack(app, 'exam-mock');
    app.querySelector('#examBackBtn').onclick = () => abort();
    app.querySelector('#doneBtn').addEventListener('click', () => {
      const text = app.querySelector('#draft').value;
      state.writing.drafts[which] = text;
      storage.saveWritingDraft(level, `${meta.id}-${which}`, text);
      selfScore(which, text);
    });
  }

  // 自评：三档引导 → 0-15 分
  function selfScore(which, text) {
    const words = (text.trim().match(/[A-Za-z']+/g) || []).length;
    app.innerHTML = `
      ${headerHtml('自评打分（可让家长按清单判）')}
      <div class="card-cartoon mb-3">
        <div class="text-xs text-gray-400 mb-1">你写了 ${words} 词</div>
        <p class="font-en text-sm" style="white-space:pre-wrap">${esc(text) || '（空白）'}</p>
      </div>
      <div class="card-cartoon mb-3 text-xs text-gray-600">
        打分参考（要点转述）：<br>
        · <b>12-15</b>：要点全回应/三图全写到，意思全程清楚（有小错没关系）<br>
        · <b>8-11</b>：缺一个要点，或个别句子要猜才懂<br>
        · <b>4-7</b>：只写了一半，或多处看不懂<br>
        · <b>0-3</b>：几乎没写或完全跑题<br>
        更准的办法：贴到 Write & Improve 看机器评分。
      </div>
      <div class="grid grid-cols-4 gap-2 mb-3">
        ${[15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(n => `<button data-score="${n}" class="btn-cartoon btn-cartoon-secondary" style="padding:10px 0">${n}</button>`).join('')}
      </div>
    `;
    bindBack(app, 'exam-mock');
    app.querySelector('#examBackBtn').onclick = () => abort();
    app.querySelectorAll('[data-score]').forEach(b => b.addEventListener('click', () => {
      state.writing[which] = Number(b.dataset.score);
      if (which === 'p6') runWriting('p7');
      else finishRW();
    }));
  }

  // RW 卷结束 → 问是否接着做听力
  async function finishRW() {
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    removeBar();
    const lisData = await loadJSON('data/exam/ket/listening.json');
    const lisSet = lisData && (lisData.sets || []).find(s => s.id === meta.listeningSet);
    app.innerHTML = `
      ${headerHtml('阅读写作卷完成 ✔')}
      <div class="card-cartoon mb-4 text-center">
        <div class="text-5xl mb-2">🎧</div>
        <p class="text-sm text-gray-600">接着做配套听力（25 题，约 30 分钟）吗？三项分开记，听力也可以改天单独做。</p>
      </div>
      ${lisSet ? '<button id="lisBtn" class="w-full btn-cartoon mb-2">继续做听力</button>' : '<div class="text-xs text-gray-400 text-center mb-2">配套听力题库补充中，可先交卷</div>'}
      <button id="skipBtn" class="w-full btn-cartoon btn-cartoon-secondary">先交卷看报告</button>
    `;
    bindBack(app, 'exam-mock');
    app.querySelector('#examBackBtn').onclick = () => report();
    const lb = app.querySelector('#lisBtn');
    if (lb) lb.addEventListener('click', () => {
      runListeningSet(app, level, lisSet, () => report(), (c, t) => {
        state.listeningCorrect = c;
        state.listeningPct = Math.round(c / t * 100);
        report();
      });
    });
    app.querySelector('#skipBtn').addEventListener('click', () => report());
  }

  function abort() {
    if (mockTimer) { clearInterval(mockTimer); mockTimer = null; }
    removeBar();
    renderMockExam(app, {});
  }

  // === 交卷报告：三项分开记 + 量表估算 + 决策 ===
  function report() {
    const readingPct = state.reading.total ? Math.round(state.reading.correct / state.reading.total * 100) : 0;
    const writingRaw = (state.writing.p6 || 0) + (state.writing.p7 || 0); // /30
    const writingPct = Math.round(writingRaw / 30 * 100);
    const rwPct = Math.round((state.reading.correct + writingRaw) / 60 * 100);
    // 量表粗估：60% ≈ 120（及格线附近），85% ≈ 140（A 区）——线性内插，仅供参考
    const overallPct = state.listeningPct == null ? rwPct : Math.round((rwPct + state.listeningPct) / 2);
    const scaled = Math.max(82, Math.min(150, Math.round(72 + 0.8 * overallPct)));

    storage.saveMockResult(level, meta.id, {
      readingCorrect: state.reading.correct, readingTotal: state.reading.total, readingPct,
      writingRaw, writingPct,
      listeningPct: state.listeningPct, listeningCorrect: state.listeningCorrect,
      scaled, byPart: state.reading.byPart
    });
    const decision = storage.getExamDecision(level);

    app.innerHTML = `
      ${headerHtml('📊 ' + meta.name + ' · 交卷报告')}
      <div class="card-cartoon mb-4 text-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div class="text-xs text-gray-500">估算量表分（粗估，精确换算见官方指南）</div>
        <div class="text-4xl font-black text-primary my-1">${scaled}</div>
        <div class="text-xs text-gray-400">约 60% ≈ 及格线附近 · 约 85% ≈ A 等区间</div>
      </div>

      <!-- 三项分开记（合成一个数字会把短板藏起来） -->
      <div class="card-cartoon mb-4">
        <div class="font-bold text-sm mb-2">三项成绩（分开看才能看到短板）</div>
        <div class="flex justify-between text-sm py-2 border-b border-gray-50"><span>📖 阅读 P1-5（${state.reading.total} 题）</span><b>${state.reading.correct} 对 · ${readingPct}%</b></div>
        <div class="flex justify-between text-sm py-2 border-b border-gray-50"><span>✍️ 写作 P6+P7（自评）</span><b>${writingRaw} / 30</b></div>
        <div class="flex justify-between text-sm py-2"><span>🎧 听力（25 题）</span><b>${state.listeningPct == null ? '未做（可改天单独做）' : state.listeningCorrect + ' 对 · ' + state.listeningPct + '%'}</b></div>
      </div>

      <div class="card-cartoon mb-4">
        <div class="font-bold text-sm mb-2">各部分明细</div>
        ${Object.entries(state.reading.byPart).map(([k, v]) => `<div class="flex justify-between text-sm py-1"><span>Part ${k.slice(4)}</span><b>${v.correct}/${v.total}</b></div>`).join('')}
      </div>

      ${meta.id === 'mock-03' && decision ? `
      <div class="card-cartoon mb-4 border-2 border-amber-400 bg-amber-50">
        <div class="font-bold text-sm mb-1">🧭 ${fillSeason("报考决策建议（目标{本考季}）")}</div>
        <div class="text-sm">${decision.verdict} → <b>${decision.action}</b></div>
      </div>` : ''}
      ${meta.id === 'mock-01' ? '<div class="card-cartoon mb-4 bg-green-50 text-sm text-gray-700">记住：这是起点坐标，不是审判。45 天后的模考 3 才是验收。</div>' : ''}

      <button id="reportBtn" class="w-full btn-cartoon mb-2">看学习报告（三次模考趋势）</button>
      <button id="backBtn2" class="w-full btn-cartoon btn-cartoon-secondary">返回模考中心</button>
    `;
    bindBack(app, 'exam-mock');
    app.querySelector('#examBackBtn').onclick = () => renderMockExam(app, {});
    app.querySelector('#reportBtn').addEventListener('click', () => window.__nav('exam-report'));
    app.querySelector('#backBtn2').addEventListener('click', () => renderMockExam(app, {}));
  }
}
