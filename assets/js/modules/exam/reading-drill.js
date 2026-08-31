// modules/exam/reading-drill.js —— 模块 4：阅读训练 + 听力训练 + 分级读物
// Part 1-5 题型专项（全原创题）/ 分级读物（复用 recite.js 跟读背诵）/ 限时合练 40 分钟
import { loadJSON, toast, enterFocus, exitFocus, requestLeaveFocus } from '../../app.js';
import * as storage from '../../storage.js';
import { speak, stopSpeaking } from '../../speech.js';
import { renderRecite } from '../recite.js';
import { pickQuiz, presentQuestion } from '../../utils/shuffle.js';
import { examLevel, headerHtml, bindBack, esc } from './exam-common.js';

let timedTimer = null; // 限时模式计时器（离开页面要清）

export async function renderReadingDrill(app, params = {}) {
  if (timedTimer) { clearInterval(timedTimer); timedTimer = null; }
  const level = examLevel();
  const drills = await loadJSON('data/exam/ket/reading-drills.json');
  if (!drills) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">📖</span><div class="empty-text">阅读数据加载失败</div></div>';
    return;
  }

  if (params.tab === 'readers') return renderReaders(app, level);
  if (params.tab === 'listening') return renderListening(app, level, params);
  if (params.tab === 'timed') return renderTimed(app, level, drills);
  if (params.part && drills.parts[params.part]) return renderPartSets(app, level, drills, params.part);

  // === 主页 ===
  const results = storage.getDrillResults(level);
  app.innerHTML = `
    ${headerHtml('📖 阅读与听力训练')}
    <h3 class="font-bold mb-2">📄 阅读 Part 1-5 专项（原创题）</h3>
    <div class="space-y-2 mb-4">
      ${Object.entries(drills.parts).map(([key, p]) => {
        const doneN = p.sets.filter(s => results[s.id]).length;
        return `
        <button data-part="${key}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3" style="padding:12px 14px">
          <span class="font-black text-primary-ink" style="min-width:38px">P${key.slice(4)}</span>
          <div class="flex-1">
            <div class="font-bold text-sm">${p.name}</div>
            <div class="text-xs text-gray-500">${p.desc}</div>
            <div class="text-xs text-green-700 mt-1">${p.sets.length} 套 · 已练 ${doneN}</div>
          </div>
          <span class="text-xl text-gray-300">›</span>
        </button>`;
      }).join('')}
    </div>
    <div class="grid grid-cols-1 gap-2">
      <button data-tab="listening" class="card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-r from-purple-50 to-indigo-50">
        <span class="text-3xl">🎧</span>
        <div class="flex-1"><div class="font-bold text-sm">听力训练</div><div class="text-xs text-gray-500">原创对话朗读 · 每段两遍 · 三步法</div></div>
        <span class="text-xl text-gray-300">›</span>
      </button>
      <button data-tab="readers" class="card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-r from-green-50 to-emerald-50">
        <span class="text-3xl">📚</span>
        <div class="flex-1"><div class="font-bold text-sm">分级读物</div><div class="text-xs text-gray-500">蓝思 200-500L · 几乎不查词 · 可跟读背诵打分</div></div>
        <span class="text-xl text-gray-300">›</span>
      </button>
      <button data-tab="timed" class="card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-r from-orange-50 to-amber-50">
        <span class="text-3xl">⏱️</span>
        <div class="flex-1"><div class="font-bold text-sm">限时模式</div><div class="text-xs text-gray-500">Part 1-5 合练 · 倒计时 40 分钟</div></div>
        <span class="text-xl text-gray-300">›</span>
      </button>
    </div>
  `;
  bindBack(app);
  app.querySelectorAll('[data-part]').forEach(b => b.addEventListener('click', () => renderReadingDrill(app, { part: b.dataset.part })));
  app.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => renderReadingDrill(app, { tab: b.dataset.tab })));
}

// === 某 Part 的套题列表 ===
function renderPartSets(app, level, drills, partKey) {
  const p = drills.parts[partKey];
  const results = storage.getDrillResults(level);
  app.innerHTML = `
    ${headerHtml(p.name)}
    <div class="text-xs text-gray-500 mb-3">${p.desc}</div>
    ${p.sets.length === 0 ? '<div class="card-cartoon empty-state"><span class="empty-emoji">🚧</span><div class="empty-text">题库补充中</div></div>' : `
    <div class="space-y-2">
      ${p.sets.map((s, i) => {
        const r = results[s.id];
        return `
        <button data-set="${s.id}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3" style="padding:12px 14px">
          <span class="text-2xl">${r ? '✅' : '📝'}</span>
          <div class="flex-1">
            <div class="font-bold text-sm">第 ${i + 1} 套${s.topic ? ' · ' + s.topic : ''}</div>
            ${r ? `<div class="text-xs text-green-700">最好成绩 ${r.best}%（练过 ${r.tries} 次）</div>` : '<div class="text-xs text-gray-400">未练过</div>'}
          </div>
          <span class="text-xl text-gray-300">›</span>
        </button>`;
      }).join('')}
    </div>`}
  `;
  bindBack(app, 'exam-reading');
  app.querySelector('#examBackBtn').onclick = () => renderReadingDrill(app, {});
  p.sets.forEach(s => {
    const btn = app.querySelector(`[data-set="${s.id}"]`);
    if (btn) btn.addEventListener('click', () => {
      runDrillSet(app, level, partKey, s, () => renderPartSets(app, level, drills, partKey));
    });
  });
}

// === 通用套题运行器（P1-P5 结构不同，统一渲染）===
// 完成回调 onDone(correct, total)；onBack 返回列表
// focus：答题态选项（V0.9.33）——模考/限时模式传 { note, cleanup }，
//   note 进离开确认文案（如「计时作废」），cleanup 在任何离开路径清计时器。
export function runDrillSet(app, level, partKey, set, onBack, onFinish, focus = {}) {
  const isOpen = partKey === 'part5'; // 开放完形：输入题
  // 统一把题目展开成 [{stem?, passage?, q, options?, answer, explain, ...}]
  let items;
  if (partKey === 'part1') items = set.items;
  else if (partKey === 'part2') items = set.questions;
  else if (partKey === 'part3' || partKey === 'part4') items = set.questions || set.gaps;
  else items = set.gaps;

  // V0.8 每次进入重新洗牌：
  // - Part 4/5 的空格按文章顺序编号（第 N 空对应文中第 N 个空），题序不能乱，只洗选项
  // - 其余 Part 题序打乱 + 错题加权；选项洗牌 answer 同步重算（presentQuestion 一次生成，作答中固定）
  const scope = `drill:${set.id}`;
  const positional = partKey === 'part4' || partKey === 'part5';
  if (!positional) {
    const picked = pickQuiz(scope, items, items.length, storage.getQuizStats());
    items = picked.questions;
    if (picked.focusedWrong) toast('🎯 本次重点安排了你之前做错的题');
  }
  items = items.map(it => presentQuestion(scope, it));

  let idx = 0, correct = 0;
  const total = items.length;

  function contextHtml() {
    if (partKey === 'part2') {
      return `<div class="card-cartoon mb-3 bg-gray-50" style="padding:12px">
        ${set.profiles.map(pr => `<div class="mb-2"><span class="font-black text-primary-ink">${pr.label}</span> <b class="text-sm">${esc(pr.title)}</b><p class="font-en text-sm text-gray-700 mt-1">${esc(pr.text)}</p></div>`).join('')}
      </div>`;
    }
    if (partKey === 'part3' || partKey === 'part4' || partKey === 'part5') {
      const txt = set.passage || '';
      return `<div class="card-cartoon mb-3 bg-gray-50" style="padding:12px">
        ${set.title ? `<div class="font-bold text-sm mb-1">${esc(set.title)}</div>` : ''}
        <p class="font-en text-sm text-gray-700" style="white-space:pre-wrap">${esc(txt)}</p>
      </div>`;
    }
    return '';
  }

  function draw() {
    if (idx >= total) return done();
    const it = items[idx];
    let answered = false;
    app.innerHTML = `
      ${headerHtml(`${set.topic || set.title || partKey.toUpperCase()} · ${idx + 1}/${total}`)}
      <div class="progress-bar mb-3"><div class="progress-bar-fill" style="width:${idx / total * 100}%"></div></div>
      ${contextHtml()}
      <div class="card-cartoon mb-3">
        ${partKey === 'part1' && it.context ? `<div class="text-xs text-gray-400 mb-1">📍 ${esc(it.context)}</div>` : ''}
        ${partKey === 'part1' && it.text ? `<div class="bg-yellow-50 rounded-2xl p-3 mb-2 font-en text-sm" style="white-space:pre-wrap">${esc(it.text)}</div>` : ''}
        <div class="font-bold text-base mb-3 font-en">${esc(it.q || `第 (${idx + 1}) 空`)}</div>
        ${it.shape ? `<div class="text-xs bg-cyan-50 text-cyan-700 rounded-xl px-3 py-2 mb-2">💡 形状提示：${esc(it.shape)}</div>` : ''}
        ${isOpen || !it.options ? `
          <input id="ansInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="每空填一词，拼写要对" autocomplete="off" autocapitalize="off" />
          <button id="submitBtn" class="w-full btn-cartoon mt-3">提交</button>` : `
          <div class="space-y-2">
            ${it.options.map((o, i) => `<button data-opt="${i}" class="opt-btn w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-left font-en tap-bounce" style="min-height:48px"><b>${'ABC'[i] || i + 1}</b>. ${esc(o)}</button>`).join('')}
          </div>`}
      </div>
      <div id="feedback"></div>
    `;
    // 答题态：‹/Esc 先确认再走 onBack（不 bindBack，避免绕过确认）
    enterFocus({ remain: () => total - idx, leave: onBack, note: focus.note, cleanup: focus.cleanup });
    app.querySelector('#examBackBtn').onclick = () => requestLeaveFocus(onBack);

    function judge(user) {
      if (answered) return;
      answered = true;
      let ok;
      if (isOpen || !it.options) {
        const norm = s => String(s).trim().toLowerCase();
        const answers = [it.answer].concat(it.alt || []).map(norm);
        ok = answers.includes(norm(user));
      } else {
        ok = Number(user) === it.answer;
      }
      storage.recordQuizAnswer(it.__qk, ok);
      if (ok) correct++;
      const fb = app.querySelector('#feedback');
      fb.innerHTML = `
        <div class="card-cartoon ${ok ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'} mb-3">
          <div class="font-bold text-sm mb-1">${ok ? '✅ 对啦！' : '❌ 记下来'}</div>
          ${ok ? '' : `<div class="text-sm mb-1">正确答案：<b class="font-en">${esc(it.options ? `${'ABC'[it.answer]}. ${it.options[it.answer]}` : it.answer)}</b></div>`}
          ${it.category ? `<div class="text-xs text-gray-500 mb-1">考点：${esc(it.category)}</div>` : ''}
          <div class="text-xs text-gray-600">${esc(it.explain || '')}</div>
        </div>
        <button id="nextBtn" class="w-full btn-cartoon">${idx + 1 >= total ? '看结果' : '下一题 ›'}</button>`;
      fb.querySelector('#nextBtn').addEventListener('click', () => { idx++; draw(); });
    }

    app.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => { b.classList.add('ring-2', 'ring-primary'); judge(b.dataset.opt); }));
    const sub = app.querySelector('#submitBtn');
    if (sub) {
      const inp = app.querySelector('#ansInput');
      sub.addEventListener('click', () => judge(inp.value));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') judge(inp.value); });
    }
  }

  function done() {
    const pct = Math.round(correct / total * 100);
    storage.saveDrillResult(level, set.id, pct);
    storage.progressDailyTask('reading1', 1); // 首页任务：KET 阅读专项完成一组算一篇阅读（B2 模式适配；听力不算）
    if (onFinish) return onFinish(correct, total); // 模考/限时流程继续，答题态不退
    exitFocus();
    app.innerHTML = `
      ${headerHtml('结果')}
      <div class="card-cartoon text-center mb-4 ${pct >= 70 ? 'bg-green-50' : 'bg-yellow-50'}">
        <div class="text-6xl mb-2">${pct >= 70 ? '🎉' : '💪'}</div>
        <div class="text-2xl font-black">${correct} / ${total}</div>
        <div class="text-sm text-gray-600 mt-1">正确率 ${pct}%${partKey === 'part5' ? '（验收线：4/6 以上）' : ''}</div>
      </div>
      <button id="redoBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-2">🎲 换一批重做（题目会变）</button>
      <button id="backBtn2" class="w-full btn-cartoon">返回题目列表</button>
    `;
    bindBack(app, 'exam-reading');
    app.querySelector('#examBackBtn').onclick = onBack;
    app.querySelector('#redoBtn').addEventListener('click', () => runDrillSet(app, level, partKey, set, onBack, onFinish));
    app.querySelector('#backBtn2').addEventListener('click', onBack);
  }

  draw();
}

// === 分级读物（复用 recite.js 跟读/背诵/LCS 打分）===
async function renderReaders(app, level) {
  const data = await loadJSON('data/exam/ket/readers.json');
  const articles = (data && data.articles) || [];
  app.innerHTML = `
    ${headerHtml('📚 分级读物')}
    <div class="card-cartoon mb-3 bg-green-50 text-xs text-gray-600">
      起点蓝思 200-400L，45 天内爬到 400-500L。读物必须「几乎不用查词」才有效——查词太多说明超纲了，先退一档。
    </div>
    ${articles.length === 0 ? '<div class="card-cartoon empty-state"><span class="empty-emoji">🚧</span><div class="empty-text">读物补充中</div></div>' : `
    <div class="space-y-2">
      ${articles.map(a => {
        const best = storage.getRecitationScore(a.id);
        return `
        <button data-art="${a.id}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3" style="padding:12px 14px">
          <span class="text-2xl">${a.icon || '📖'}</span>
          <div class="flex-1">
            <div class="font-bold text-sm font-en">${esc(a.title)}</div>
            <div class="text-xs text-gray-500">${a.lexile}L · ${a.wordCount} 词 · ${a.topicZh || ''}</div>
          </div>
          ${best ? `<span class="text-xs font-bold text-primary-ink">背诵 ${best} 分</span>` : ''}
          <span class="text-xl text-gray-300">›</span>
        </button>`;
      }).join('')}
    </div>`}
  `;
  bindBack(app, 'exam-reading');
  app.querySelector('#examBackBtn').onclick = () => renderReadingDrill(app, {});
  articles.forEach(a => {
    app.querySelector(`[data-art="${a.id}"]`).addEventListener('click', () => renderReaderArticle(app, level, a, articles));
  });
}

function renderReaderArticle(app, level, a, articles) {
  app.innerHTML = `
    ${headerHtml(esc(a.title))}
    <div class="text-xs text-gray-400 mb-2">${a.lexile}L · ${a.wordCount} 词</div>
    <div class="card-cartoon mb-3">
      <p class="font-en text-base leading-relaxed" style="white-space:pre-wrap">${esc(a.content)}</p>
    </div>
    <div class="card-cartoon mb-3 bg-gray-50">
      <div class="text-xs text-gray-400 mb-1">中文对照</div>
      <p class="text-sm text-gray-600">${esc(a.translation)}</p>
    </div>
    ${a.keyWords && a.keyWords.length ? `
    <div class="card-cartoon mb-3">
      <div class="text-xs text-gray-400 mb-1">🔑 关键词</div>
      <div class="flex flex-wrap gap-2">${a.keyWords.map(k => `<span class="pet-chip font-en text-sm">${esc(k.en)} <span class="text-gray-400 font-sans">${esc(k.zh)}</span></span>`).join('')}</div>
    </div>` : ''}
    <div class="flex gap-3">
      <button id="listenBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">🔊 听全文</button>
      <button id="reciteBtn" class="flex-1 btn-cartoon">🎤 跟读 / 背诵</button>
    </div>
  `;
  bindBack(app, 'exam-reading');
  app.querySelector('#examBackBtn').onclick = () => { stopSpeaking(); renderReaders(app, level); };
  app.querySelector('#listenBtn').addEventListener('click', () => speak(a.content));
  // 复用 recite.js：文章对象需要 id/title/content
  app.querySelector('#reciteBtn').addEventListener('click', () => {
    stopSpeaking();
    renderRecite(app, { id: a.id, title: a.title, content: a.content }, () => renderReaderArticle(app, level, a, articles));
  });
}

// === 听力训练（Web Speech API 朗读原创文本，每段两遍）===
async function renderListening(app, level, params) {
  const data = await loadJSON('data/exam/ket/listening.json');
  const sets = (data && data.sets) || [];
  if (params.set) {
    const s = sets.find(x => x.id === params.set);
    if (s) return runListeningSet(app, level, s, () => renderListening(app, level, {}));
  }
  const results = storage.getDrillResults(level);
  app.innerHTML = `
    ${headerHtml('🎧 听力训练')}
    <div class="card-cartoon mb-3 bg-purple-50 text-xs text-gray-600">
      三步法：① 盲听 → ② 对答案+看原文 → ③ 跟读。真考每段放两遍，这里也一样（自动读两遍）。
    </div>
    ${sets.length === 0 ? '<div class="card-cartoon empty-state"><span class="empty-emoji">🚧</span><div class="empty-text">听力题库补充中</div></div>' : `
    <div class="space-y-2">
      ${sets.map((s, i) => {
        const r = results[s.id];
        return `
        <button data-set="${s.id}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3" style="padding:12px 14px">
          <span class="text-2xl">${r ? '✅' : '🎧'}</span>
          <div class="flex-1">
            <div class="font-bold text-sm">听力套题 ${i + 1}${s.name ? ' · ' + s.name : ''}</div>
            <div class="text-xs text-gray-500">5 部分 25 题${r ? ` · 最好 ${r.best}%` : ''}</div>
          </div>
          <span class="text-xl text-gray-300">›</span>
        </button>`;
      }).join('')}
    </div>`}
  `;
  bindBack(app, 'exam-reading');
  app.querySelector('#examBackBtn').onclick = () => renderReadingDrill(app, {});
  sets.forEach(s => {
    const b = app.querySelector(`[data-set="${s.id}"]`);
    if (b) b.addEventListener('click', () => renderListening(app, level, { set: s.id }));
  });
}

// 听力套题运行器（导出供模考复用）：onFinish(correct,total) 提供时接管结算
// focus 同 runDrillSet：{ note, cleanup }
export function runListeningSet(app, level, set, onBackFn, onFinish, focus = {}) {
  // 展平：每部分的题目带上 script
  // V0.8：听力题序跟录音脚本顺序走（不能乱），只洗每题选项（answer 同步重算）
  const lisScope = `lis:${set.id}`;
  const flat = [];
  set.parts.forEach(p => p.questions.forEach(q => flat.push(presentQuestion(lisScope, { ...q, partNo: p.part, partName: p.name, script: q.script || p.script }))));
  let idx = 0, correct = 0;

  let secondReadT = null; // 第二遍朗读的定时器：离开时必须清，否则会在别的页面开口
  function playTwice(text) {
    stopSpeaking();
    clearTimeout(secondReadT);
    speak(text, { rate: 0.9 });
    // 第二遍：估算首遍时长后再读（简单按字数估）
    const ms = Math.min(30000, Math.max(4000, text.length * 65)) + 1200;
    secondReadT = setTimeout(() => speak(text, { rate: 0.9 }), ms);
  }

  function draw() {
    if (idx >= flat.length) return done();
    const it = flat[idx];
    let answered = false;
    app.innerHTML = `
      ${headerHtml(`🎧 Part ${it.partNo} · ${idx + 1}/${flat.length}`)}
      <div class="progress-bar mb-3"><div class="progress-bar-fill" style="width:${idx / flat.length * 100}%"></div></div>
      <div class="card-cartoon mb-3 text-center bg-purple-50">
        <div class="text-xs text-gray-500 mb-2">${esc(it.partName || '')} · 每段自动读两遍</div>
        <button id="playBtn" class="btn-cartoon">▶️ 播放（读两遍）</button>
      </div>
      <div class="card-cartoon mb-3">
        <div class="font-bold text-base mb-3">${esc(it.q)}</div>
        ${it.options ? `
          <div class="space-y-2">
            ${it.options.map((o, i) => `<button data-opt="${i}" class="opt-btn w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-left font-en tap-bounce" style="min-height:48px"><b>${'ABCDEFGH'[i]}</b>. ${esc(o)}</button>`).join('')}
          </div>` : `
          <input id="ansInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="听到什么写什么，拼写要对" autocomplete="off" autocapitalize="off" />
          <button id="submitBtn" class="w-full btn-cartoon mt-3">提交</button>`}
      </div>
      <div id="feedback"></div>
    `;
    // 答题态：‹/Esc 先确认；任何离开路径都停掉正在读的语音
    const leaveListening = () => { clearTimeout(secondReadT); stopSpeaking(); onBackFn(); };
    enterFocus({
      remain: () => flat.length - idx,
      leave: leaveListening,
      note: focus.note,
      cleanup: () => { clearTimeout(secondReadT); stopSpeaking(); if (focus.cleanup) focus.cleanup(); }
    });
    app.querySelector('#examBackBtn').onclick = () => requestLeaveFocus(leaveListening);
    app.querySelector('#playBtn').addEventListener('click', () => playTwice(it.script));

    function judge(user) {
      if (answered) return;
      answered = true;
      stopSpeaking();
      let ok;
      if (it.options) ok = Number(user) === it.answer;
      else {
        const norm = s => String(s).trim().toLowerCase().replace(/[.\s]+/g, '');
        ok = [it.answer].concat(it.alt || []).map(norm).includes(norm(user));
      }
      storage.recordQuizAnswer(it.__qk, ok);
      if (ok) correct++;
      const fb = app.querySelector('#feedback');
      fb.innerHTML = `
        <div class="card-cartoon ${ok ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'} mb-3">
          <div class="font-bold text-sm mb-1">${ok ? '✅ 对啦！' : '❌ 看原文再听一遍'}</div>
          ${ok ? '' : `<div class="text-sm mb-1">正确答案：<b class="font-en">${esc(it.options ? `${'ABCDEFGH'[it.answer]}. ${it.options[it.answer]}` : it.answer)}</b></div>`}
          <div class="bg-white rounded-xl p-2 mt-1"><div class="text-cap text-gray-400 mb-1">📜 原文（三步法第②步）</div><p class="font-en text-xs text-gray-600">${esc(it.script)}</p></div>
          ${it.explain ? `<div class="text-xs text-gray-600 mt-1">${esc(it.explain)}</div>` : ''}
        </div>
        <button id="nextBtn" class="w-full btn-cartoon">${idx + 1 >= flat.length ? '看结果' : '下一题 ›'}</button>`;
      fb.querySelector('#nextBtn').addEventListener('click', () => { idx++; draw(); });
    }

    app.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => judge(b.dataset.opt)));
    const sub = app.querySelector('#submitBtn');
    if (sub) {
      const inp = app.querySelector('#ansInput');
      sub.addEventListener('click', () => judge(inp.value));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') judge(inp.value); });
    }
  }

  function done() {
    const pct = Math.round(correct / flat.length * 100);
    storage.saveDrillResult(level, set.id, pct);
    if (onFinish) return onFinish(correct, flat.length); // 模考流程继续
    exitFocus();
    app.innerHTML = `
      ${headerHtml('听力结果')}
      <div class="card-cartoon text-center mb-4 ${pct >= 60 ? 'bg-green-50' : 'bg-yellow-50'}">
        <div class="text-6xl mb-2">${pct >= 60 ? '🎉' : '💪'}</div>
        <div class="text-2xl font-black">${correct} / ${flat.length}</div>
        <div class="text-sm text-gray-600 mt-1">正确率 ${pct}%</div>
      </div>
      <button id="backBtn2" class="w-full btn-cartoon">返回听力列表</button>
    `;
    bindBack(app, 'exam-reading');
    app.querySelector('#examBackBtn').onclick = onBackFn;
    app.querySelector('#backBtn2').addEventListener('click', onBackFn);
  }

  draw();
}

// === 限时模式：Part 1-5 各取一套合练，倒计时 40 分钟 ===
function renderTimed(app, level, drills) {
  // 组卷：每个 part 随机取一套
  const pick = k => {
    const sets = drills.parts[k].sets;
    return sets.length ? sets[Math.floor(Math.random() * sets.length)] : null;
  };
  const paper = ['part1', 'part2', 'part3', 'part4', 'part5'].map(k => ({ key: k, set: pick(k) })).filter(x => x.set);
  if (!paper.length) {
    app.innerHTML = `${headerHtml('⏱️ 限时模式')}<div class="card-cartoon empty-state"><span class="empty-emoji">🚧</span><div class="empty-text">题库补充中</div></div>`;
    bindBack(app, 'exam-reading');
    app.querySelector('#examBackBtn').onclick = () => renderReadingDrill(app, {});
    return;
  }

  let remain = 40 * 60; // 秒
  let pi = 0;
  const scores = [];

  function tick() {
    remain--;
    const bar = document.getElementById('timedBar');
    if (bar) bar.textContent = `⏱️ ${String(Math.floor(remain / 60)).padStart(2, '0')}:${String(remain % 60).padStart(2, '0')}`;
    if (remain <= 0) { clearInterval(timedTimer); timedTimer = null; finish(); }
  }

  // 任何离开路径（确认离开 / 路由兜底）都清计时器和倒计时条，
  // 否则 40′ 到点的 finish() 会把当前无关页面的 DOM 整个覆盖掉
  function timedCleanup() {
    if (timedTimer) { clearInterval(timedTimer); timedTimer = null; }
    document.body.querySelectorAll('#timedBar').forEach(e => e.remove());
  }

  function runNext() {
    if (pi >= paper.length) return finish();
    const { key, set } = paper[pi];
    runDrillSet(app, level, key, set, () => { timedCleanup(); renderReadingDrill(app, {}); },
      (correct, total) => { scores.push({ key, correct, total }); pi++; runNext(); },
      { note: '离开后本次计时结束，这一轮的成绩不保存。', cleanup: timedCleanup });
    // 在顶部插入倒计时条
    const bar = document.createElement('div');
    bar.id = 'timedBar';
    bar.className = 'fixed top-14 right-4 bg-orange-500 text-white text-sm font-bold rounded-full px-4 py-1 shadow-lg z-40';
    bar.textContent = '⏱️ --:--';
    document.body.querySelectorAll('#timedBar').forEach(e => e.remove());
    document.body.appendChild(bar);
  }

  function finish() {
    timedCleanup();
    exitFocus(); // 合练结束，恢复导航
    const c = scores.reduce((s, x) => s + x.correct, 0);
    const t = scores.reduce((s, x) => s + x.total, 0) || 1;
    app.innerHTML = `
      ${headerHtml('⏱️ 限时合练结果')}
      <div class="card-cartoon text-center mb-3">
        <div class="text-5xl mb-2">${c / t >= 0.6 ? '🎉' : '💪'}</div>
        <div class="text-2xl font-black">${c} / ${t}</div>
        <div class="text-xs text-gray-500 mt-1">用时 ${40 - Math.ceil(remain / 60)} 分钟</div>
      </div>
      <div class="card-cartoon mb-3">
        ${scores.map(s => `<div class="flex justify-between text-sm py-1"><span>Part ${s.key.slice(4)}</span><b>${s.correct}/${s.total}</b></div>`).join('')}
      </div>
      <button id="backBtn2" class="w-full btn-cartoon">返回</button>
    `;
    bindBack(app, 'exam-reading');
    app.querySelector('#examBackBtn').onclick = () => renderReadingDrill(app, {});
    app.querySelector('#backBtn2').addEventListener('click', () => renderReadingDrill(app, {}));
  }

  app.innerHTML = `
    ${headerHtml('⏱️ 限时模式')}
    <div class="card-cartoon mb-4 text-center">
      <div class="text-5xl mb-2">⏱️</div>
      <p class="text-sm text-gray-600 mb-1">Part 1-5 各一套连着做，倒计时 40 分钟（官方建议阅读配时）。</p>
      <p class="text-xs text-gray-400">中途退出不保存成绩。</p>
    </div>
    <button id="goBtn" class="w-full btn-cartoon">开始！</button>
  `;
  bindBack(app, 'exam-reading');
  app.querySelector('#examBackBtn').onclick = () => renderReadingDrill(app, {});
  app.querySelector('#goBtn').addEventListener('click', () => {
    timedTimer = setInterval(tick, 1000);
    runNext();
  });
}
