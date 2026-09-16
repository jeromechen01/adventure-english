// modules/exam/listening.js —— KET 听力训练营（PL0-2 引擎）
// 课结构固定四步：① 听前热身 → ② 盲听答题 → ③ 对答案 + tapescript → ④ 跟读（LCS 词级打分）。
// 题型严格对齐 KET 真考五部分（不自创）：
//   Part 1 三图单选（SVG 图标）/ Part 2 填空（拼写必须全对，数字可写阿拉伯数字或英文数字词，时间 7.30/7:30/half past seven 等价）/
//   Part 3·4 三选一 / Part 5 匹配（5 项配 A-H 8 选项）。
// ★ 两遍机制：每段录音重放上限 2 次（模拟模式）；练习模式放宽到 3 次并标注「练习模式」。
// ★ 播放器只做播放/重放，不做拖动暂停（iOS speechSynthesis.pause/resume 不可靠）。
// ★ 答题态接 0.9.33 防误触（enterFocus + 不 bindBack）；任何离开路径都取消朗读（cleanup）。
// 音频 100% 由 Web Speech API 实时合成，不入库任何音频文件；脚本 100% 原创。
import { loadJSON, toast, enterFocus, exitFocus, requestLeaveFocus } from '../../app.js';
import * as storage from '../../storage.js';
import { speakDialogue, pickDialogueVoices, waitForVoices, stopSpeaking, recognize, alignWords, isSpeechRecognitionSupported, playSound } from '../../speech.js';
import { examLevel, headerHtml, bindBack, esc } from './exam-common.js';

const INDEX_FILE = 'data/exam/ket/listening/index.json';
const ICON_DIR = './assets/img/listening/';
const PART_NAMES = { 1: 'Part 1 · 听对话选图', 2: 'Part 2 · 听独白填空', 3: 'Part 3 · 听对话三选一', 4: 'Part 4 · 听短篇选主旨', 5: 'Part 5 · 听对话做匹配' };
const PART_TIPS = {
  1: '听一段短对话，从三张图里选出正确的一张。',
  2: '听一段独白，把笔记里的空补上（每空一个词或一个数字，拼写要对）。',
  3: '听一段对话，每题从 A / B / C 里选一个。',
  4: '听一段短对话或独白，选出说话人在说什么。',
  5: '听一段对话，把左边 5 个项目和右边 A-H 配起来（有 3 个多余）。'
};
const LETTERS = 'ABCDEFGH';

let player = null; // 当前朗读控制器（任何离开路径都要 cancel）
function stopPlayer() { if (player) { player.cancel(); player = null; } stopSpeaking(); }

// 练习/模拟模式 → 每段重放上限
function maxPlaysFor(mode) { return mode === 'mock' ? 2 : 3; }

// ============================================================
// 训练营首页
// ============================================================
export async function renderListeningCourse(app, params = {}) {
  stopPlayer();
  const level = examLevel();
  const index = await loadJSON(INDEX_FILE);
  if (!index) {
    app.innerHTML = `${headerHtml('🎧 听力训练营')}<div class="card-cartoon empty-state"><span class="empty-emoji">🎧</span><div class="empty-text">听力课程加载失败</div><div class="empty-sub">请检查网络后刷新重试</div></div>`;
    bindBack(app, 'exam-hub');
    return;
  }
  if (params.lesson) {
    const meta = (index.lessons || []).find(l => l.id === params.lesson);
    const lesson = meta && meta.status === 'ready' ? await loadJSON(meta.file) : null;
    if (lesson) return runLesson(app, level, index, meta, lesson, params);
    toast('这一课还没上线', 'warn');
  }

  const prefs = storage.getListeningPrefs();
  const results = storage.getDrillResults(level);
  const lessons = index.lessons || [];
  const stages = index.stages || [];
  const readyN = lessons.filter(l => l.status === 'ready').length;

  app.innerHTML = `
    ${headerHtml('🎧 听力训练营')}
    <div class="card-cartoon mb-3 bg-purple-50 text-xs text-gray-600">
      每课四步：<b>听前热身 → 盲听答题 → 对答案看原文 → 跟读</b>。对话由设备实时朗读，每段录音和真考一样只放两遍。
    </div>

    <div class="card-cartoon mb-3">
      <div class="flex items-center justify-between mb-2">
        <div class="font-bold text-sm">🎚️ 模式</div>
        <span class="text-cap text-gray-400">${prefs.mode === 'mock' ? '模拟：每段 2 遍' : '练习：每段最多 3 遍'}</span>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button data-mode="practice" class="opt-btn text-sm ${prefs.mode !== 'mock' ? 'ring-2 ring-primary' : ''}" style="min-height:48px">🧸 练习模式<div class="text-cap font-normal text-gray-500">可放 3 遍</div></button>
        <button data-mode="mock" class="opt-btn text-sm ${prefs.mode === 'mock' ? 'ring-2 ring-primary' : ''}" style="min-height:48px">📝 模拟模式<div class="text-cap font-normal text-gray-500">严格 2 遍</div></button>
      </div>
      <button id="voiceLink" class="w-full text-left text-xs mt-3 rounded-2xl px-3 py-2 ${prefs.voiceOk ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-orange-700'}" style="min-height:48px">
        ${prefs.voiceOk ? '✅ 语音已检查过 · 再看一眼 ›' : '🔊 还没检查过这台设备的英文语音 · 去检查 ›'}
      </button>
    </div>

    ${stages.map(st => {
      const ls = lessons.filter(l => l.stage === st.stage);
      return `
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold">${esc(st.name)}</h3>
          <span class="text-cap text-gray-400">语速 ${st.rate}x · ${esc(st.range || '')}</span>
        </div>
        ${st.desc ? `<div class="text-xs text-gray-500 mb-2">${esc(st.desc)}</div>` : ''}
        ${ls.length === 0 ? '<div class="card-cartoon text-center py-6 text-sm text-gray-400">这一阶段的课还在准备中</div>' : `
        <div class="space-y-2">
          ${ls.map(l => {
            const r = results['lis-' + l.id];
            const ready = l.status === 'ready';
            return `
            <button data-lesson="${l.id}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3 ${ready ? '' : 'opacity-60'}" style="padding:12px 14px" ${ready ? '' : 'disabled'}>
              <span class="text-2xl">${r ? '✅' : ready ? '🎧' : '🚧'}</span>
              <div class="flex-1" style="min-width:0">
                <div class="font-bold text-sm">${esc(l.id)} · ${esc(l.titleZh || l.title)}</div>
                <div class="text-xs text-gray-500 font-en">${esc(l.title)}</div>
                <div class="text-xs mt-1 ${r ? 'text-green-700' : 'text-gray-400'}">${(l.parts || []).map(p => 'Part ' + p).join(' + ')} · ${l.questionCount || 5} 题${r ? ` · 最好 ${r.best}%（练过 ${r.tries} 次）` : ready ? '' : ' · 准备中'}</div>
              </div>
              <span class="text-xl text-gray-300">›</span>
            </button>`;
          }).join('')}
        </div>`}
      </div>`;
    }).join('')}

    <div class="text-cap text-gray-400 text-center mb-2">已上线 ${readyN} 课 · 全部脚本原创、设备实时朗读</div>
    <button id="oldSetsBtn" class="w-full card-cartoon tap-bounce flex items-center gap-3 text-left" style="padding:12px 14px">
      <span class="text-2xl">📚</span>
      <div class="flex-1"><div class="font-bold text-sm">听力套题（5 部分 25 题）</div><div class="text-xs text-gray-500">整套连做，模考也用它</div></div>
      <span class="text-xl text-gray-300">›</span>
    </button>
  `;
  bindBack(app, 'exam-hub');
  app.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    storage.setListeningPrefs({ mode: b.dataset.mode });
    renderListeningCourse(app, {});
  }));
  app.querySelector('#voiceLink').addEventListener('click', () => window.__nav('voice-check'));
  app.querySelector('#oldSetsBtn').addEventListener('click', () => window.__nav('exam-reading', { tab: 'listening' }));
  app.querySelectorAll('[data-lesson]').forEach(b => b.addEventListener('click', () => renderListeningCourse(app, { lesson: b.dataset.lesson })));
}

// ============================================================
// 一课四步
// ============================================================
function runLesson(app, level, index, meta, lesson, params) {
  const prefs = storage.getListeningPrefs();
  const mode = prefs.mode === 'mock' ? 'mock' : 'practice';
  const maxPlays = maxPlaysFor(mode);
  const stageMeta = (index.stages || []).find(s => s.stage === (lesson.stage || meta.stage)) || {};
  const rate = lesson.rate || stageMeta.rate || 1.0;
  const lessonLabel = `${lesson.id} · ${lesson.titleZh || lesson.title}`;
  const sections = lesson.sections || [];
  const allQs = [];
  sections.forEach((s, si) => (s.questions || []).forEach((q, qi) => allQs.push({ s, si, q, qi })));
  const goHome = () => { stopPlayer(); renderListeningCourse(app, {}); };
  let voices = null; // 首次播放时挑选（等 voiceschanged）

  async function getVoices() {
    if (voices) return voices;
    const list = await waitForVoices(1500);
    voices = pickDialogueVoices(list);
    return voices;
  }

  // -------- ① 听前热身 --------
  function stepWarmup() {
    stopPlayer();
    exitFocus();
    const words = lesson.warmup || [];
    app.innerHTML = `
      ${headerHtml(`🎧 ${esc(lessonLabel)}`)}
      <div class="flex items-center gap-2 text-cap text-gray-400 mb-3">
        <span class="px-2 py-1 rounded-full bg-orange-100 text-primary-ink font-bold">① 听前热身</span>
        <span>② 盲听答题</span><span>③ 对答案</span><span>④ 跟读</span>
      </div>
      <div class="card-cartoon mb-3 bg-purple-50">
        <div class="font-bold text-sm mb-1">${esc(lesson.title)}${lesson.theme ? ` · ${esc(lesson.theme)}` : ''}</div>
        <div class="text-xs text-gray-600">${esc(lesson.intro || '先把这几个词听熟，等会儿对话里会出现。点 🔊 听发音。')}</div>
        <div class="text-cap text-gray-400 mt-1">语速 ${rate}x · ${mode === 'mock' ? '模拟模式：每段放 2 遍' : '练习模式：每段最多放 3 遍'}</div>
      </div>
      <div class="card-cartoon mb-3">
        <div class="text-xs text-gray-400 mb-2">🔑 本课词汇（${words.length}）</div>
        <div class="space-y-1">
          ${words.map((w, i) => `
            <button data-wu="${i}" class="w-full flex items-center gap-3 text-left rounded-2xl px-3 py-2 tap-bounce hover:bg-gray-50" style="min-height:48px;flex-wrap:wrap">
              <span class="text-xl">🔊</span>
              <span class="font-bold font-en text-base">${esc(w.word)}</span>
              ${w.phonetic ? `<span class="text-cap text-gray-400 font-en" style="min-width:0;overflow-wrap:anywhere">${esc(w.phonetic)}</span>` : ''}
              <span class="text-sm text-gray-600 flex-1 text-right" style="min-width:0">${esc(w.meaning)}</span>
            </button>`).join('')}
        </div>
      </div>
      <button id="startBtn" class="w-full btn-cartoon">▶️ 开始盲听答题（${allQs.length} 题）</button>
    `;
    bindBack(app, 'exam-listening');
    app.querySelector('#examBackBtn').onclick = goHome;
    app.querySelectorAll('[data-wu]').forEach(b => b.addEventListener('click', async () => {
      const w = words[Number(b.dataset.wu)];
      stopPlayer();
      player = speakDialogue([{ sex: 'f', text: w.word }], { rate: 0.9, voices: await getVoices(), onEnd: () => { player = null; } });
    }));
    app.querySelector('#startBtn').addEventListener('click', () => stepAnswer());
  }

  // -------- ② 盲听答题（不给对错，交卷后统一看）--------
  function stepAnswer() {
    const answers = {}; // qid → picked（index 或字符串）
    const plays = sections.map(() => 0); // 每段已播次数
    let si = 0, confirmEmpty = false;
    const unanswered = () => allQs.filter(x => answers[x.q.id] == null || answers[x.q.id] === '').length;
    const leave = () => goHome();

    async function drawSection() {
      stopPlayer();
      const s = sections[si];
      const part = s.part;
      const left = maxPlays - plays[si];
      app.innerHTML = `
        ${headerHtml(`🎧 ${esc(lesson.id)} · 第 ${si + 1}/${sections.length} 段`)}
        <div class="progress-bar mb-3"><div class="progress-bar-fill" style="width:${si / sections.length * 100}%"></div></div>
        <div class="card-cartoon mb-3 text-center bg-purple-50">
          <div class="text-xs text-gray-500 mb-1">${esc(PART_NAMES[part] || 'Part ' + part)}${mode === 'practice' ? ' · <span class="text-orange-700">练习模式</span>' : ''}</div>
          <div class="text-xs text-gray-600 mb-2">${esc(s.intro || PART_TIPS[part] || '')}</div>
          <button id="playBtn" class="btn-cartoon w-full" ${left <= 0 ? 'disabled style="opacity:.5"' : ''}>${playLabel(plays[si], left)}</button>
          <div id="playState" class="text-cap text-gray-400 mt-2">${left <= 0 ? '真考每段只放两遍，这里也一样' : `已听 ${plays[si]} 遍 · 还可以听 ${left} 遍`}</div>
          <div id="noVoiceHint" class="text-xs text-orange-700 mt-2" hidden>这台设备还没有英文语音，先去「我的 → 听力语音检查」装一个再来听。</div>
        </div>
        ${sectionQuestionsHtml(s, answers)}
        <button id="nextBtn" class="w-full btn-cartoon mt-3">${si + 1 >= sections.length ? '📝 交卷看结果' : '下一段 ›'}</button>
      `;
      enterFocus({
        remain: unanswered, leave,
        note: '录音会停下来，下次从这一课的开头重新听。',
        cleanup: stopPlayer
      });
      app.querySelector('#examBackBtn').onclick = () => requestLeaveFocus(leave);
      bindAnswerInputs(s, answers);

      const playBtn = app.querySelector('#playBtn');
      const state = app.querySelector('#playState');
      playBtn.addEventListener('click', async () => {
        if (plays[si] >= maxPlays || player) return;
        const v = await getVoices();
        if (v.count === 0) { app.querySelector('#noVoiceHint').hidden = false; }
        plays[si]++;
        const n = plays[si];
        playBtn.disabled = true;
        playBtn.textContent = `🔊 第 ${n} 遍 · 正在播放…`;
        player = speakDialogue(s.script, {
          rate, voices: v,
          onTurn: (i, t) => { if (document.contains(state)) state.textContent = `第 ${n} 遍 · ${t.who || (t.sex === 'm' ? '男' : '女')} 在说话（${i + 1}/${s.script.length}）`; },
          onEnd: () => {
            player = null;
            if (!document.contains(playBtn)) return;
            const rest = maxPlays - plays[si];
            playBtn.disabled = rest <= 0;
            if (rest <= 0) playBtn.style.opacity = '.5';
            playBtn.textContent = playLabel(plays[si], rest);
            state.textContent = rest <= 0 ? '真考每段只放两遍，这里也一样' : `已听 ${plays[si]} 遍 · 还可以听 ${rest} 遍`;
          }
        });
      });

      app.querySelector('#nextBtn').addEventListener('click', () => {
        stopPlayer();
        if (si + 1 < sections.length) { si++; drawSection(); return; }
        const n = unanswered();
        if (n > 0) { toast(`还有 ${n} 题没作答，也可以直接交卷`, 'warn'); }
        // 允许空着交卷（真考也可以空），空题按错处理
        if (n > 0 && !confirmEmpty) { confirmEmpty = true; app.querySelector('#nextBtn').textContent = '📝 确定交卷'; return; }
        stepReview(answers);
      });
    }
    drawSection();
  }

  function playLabel(done, left) {
    if (left <= 0) return `已听 ${done} 遍`;
    return done === 0 ? '▶️ 播放录音（第 1 遍）' : `🔁 再听一遍（第 ${done + 1} 遍）`;
  }

  // 一段里的题目（Part 1 三图 / Part 2 填空 / Part 3·4 三选一 / Part 5 匹配）
  function sectionQuestionsHtml(s, answers) {
    const part = s.part;
    if (part === 5) {
      const opts = s.options || [];
      return `
        <div class="card-cartoon mb-3">
          <div class="text-xs text-gray-400 mb-2">右边选项 A-H（有 3 个用不上）</div>
          <div class="grid grid-cols-2 gap-1 mb-3">
            ${opts.map((o, i) => `<div class="text-sm font-en"><b>${LETTERS[i]}</b> ${esc(o)}</div>`).join('')}
          </div>
          <div class="space-y-2">
            ${s.questions.map(q => `
              <label class="flex items-center gap-2" style="min-height:48px">
                <span class="font-bold font-en text-sm flex-1" style="min-width:0">${esc(q.q)}</span>
                <select data-q="${esc(q.id)}" class="border-2 border-gray-200 rounded-2xl px-3 font-en text-base bg-white" style="min-height:48px;min-width:96px">
                  <option value="">—</option>
                  ${opts.map((o, i) => `<option value="${i}" ${String(answers[q.id]) === String(i) ? 'selected' : ''}>${LETTERS[i]}</option>`).join('')}
                </select>
              </label>`).join('')}
          </div>
        </div>`;
    }
    return s.questions.map((q, qi) => `
      <div class="card-cartoon mb-3">
        <div class="font-bold text-base font-en mb-3" style="word-break:break-word">${s.questions.length > 1 ? `${qi + 1}. ` : ''}${esc(q.q)}</div>
        ${part === 1 ? `
          <div class="grid grid-cols-3 gap-2">
            ${q.options.map((o, i) => `
              <button data-q="${esc(q.id)}" data-opt="${i}" class="opt-btn p-2 ${String(answers[q.id]) === String(i) ? 'ring-2 ring-primary' : ''}" style="min-height:48px;display:flex;flex-direction:column;align-items:center;gap:4px">
                <img src="${ICON_DIR}${esc(o.icon)}.svg" alt="${esc(o.alt || o.icon)}" style="width:100%;max-width:120px;height:auto;aspect-ratio:1;display:block" draggable="false" />
                <b class="text-sm">${LETTERS[i]}</b>
              </button>`).join('')}
          </div>` : part === 2 ? `
          <input data-q="${esc(q.id)}" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="一个词或一个数字" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(answers[q.id] || '')}" style="min-height:48px" />` : `
          <div class="space-y-2">
            ${q.options.map((o, i) => `<button data-q="${esc(q.id)}" data-opt="${i}" class="opt-btn w-full text-left font-en ${String(answers[q.id]) === String(i) ? 'ring-2 ring-primary' : ''}" style="min-height:48px"><b>${LETTERS[i]}</b>. ${esc(o)}</button>`).join('')}
          </div>`}
      </div>`).join('');
  }

  function bindAnswerInputs(s, answers) {
    app.querySelectorAll('[data-q][data-opt]').forEach(b => b.addEventListener('click', () => {
      answers[b.dataset.q] = Number(b.dataset.opt);
      app.querySelectorAll(`[data-q="${CSS.escape(b.dataset.q)}"][data-opt]`).forEach(x => x.classList.remove('ring-2', 'ring-primary'));
      b.classList.add('ring-2', 'ring-primary');
      playSound('click');
    }));
    app.querySelectorAll('input[data-q]').forEach(inp => inp.addEventListener('input', () => { answers[inp.dataset.q] = inp.value; }));
    app.querySelectorAll('select[data-q]').forEach(sel => sel.addEventListener('change', () => { answers[sel.dataset.q] = sel.value === '' ? null : Number(sel.value); }));
  }

  // -------- ③ 对答案 + tapescript（错题落盘）--------
  function stepReview(answers) {
    stopPlayer();
    exitFocus();
    let correct = 0;
    const rows = allQs.map(({ s, q }) => {
      const picked = answers[q.id];
      const ok = judge(s.part, q, picked);
      if (ok) correct++;
      const qKey = `lis:${lesson.id}:${q.id}`;
      storage.recordQuizAnswer(qKey, ok);
      const pickedText = pickedToText(s, q, picked);
      const correctText = correctToText(s, q);
      if (!ok) storage.recordQuizMistake(qKey, {
        src: 'listen', kind: 'choice', lesson: lesson.id, lessonTitle: lesson.titleZh || lesson.title,
        stage: `Part ${s.part}`, q: mistakeSummary(s, q), options: optionsToText(s, q),
        picked: pickedText, correct: correctText, explain: q.explain || ''
      });
      return { s, q, ok, pickedText, correctText };
    });
    const total = allQs.length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    storage.saveDrillResult(level, 'lis-' + lesson.id, pct);

    app.innerHTML = `
      ${headerHtml(`🎧 ${esc(lessonLabel)}`)}
      <div class="flex items-center gap-2 text-cap text-gray-400 mb-3">
        <span>① 热身</span><span>② 盲听</span>
        <span class="px-2 py-1 rounded-full bg-orange-100 text-primary-ink font-bold">③ 对答案 + 原文</span><span>④ 跟读</span>
      </div>
      <div class="card-cartoon text-center mb-3 ${pct >= 60 ? 'bg-green-50' : 'bg-yellow-50'}">
        <div class="text-5xl mb-1">${pct >= 60 ? '🎉' : '💪'}</div>
        <div class="text-2xl font-black">${correct} / ${total}</div>
        <div class="text-xs text-gray-500 mt-1">${mode === 'mock' ? '模拟模式' : '练习模式'} · 语速 ${rate}x${correct < total ? ' · 错题已收进错题本「听力」分区' : ''}</div>
      </div>
      ${rows.map(({ s, q, ok, pickedText, correctText }, i) => `
        <div class="card-cartoon mb-3 ${ok ? 'border-2 border-green-200' : 'border-2 border-red-200'}">
          <div class="text-xs text-gray-400 mb-1">${i + 1} · ${esc(PART_NAMES[s.part] || '')}</div>
          <div class="font-bold text-sm font-en" style="word-break:break-word">${esc(q.q)}</div>
          ${s.part === 1 ? `<div class="grid grid-cols-3 gap-2 mt-2">${q.options.map((o, oi) => `
            <div class="rounded-2xl p-1 ${oi === q.answer ? 'bg-green-50 ring-2 ring-green-300' : ''}" style="text-align:center">
              <img src="${ICON_DIR}${esc(o.icon)}.svg" alt="${esc(o.alt || o.icon)}" style="width:100%;max-width:96px;height:auto;aspect-ratio:1;display:inline-block" />
              <div class="text-cap font-bold">${LETTERS[oi]}${oi === q.answer ? ' ✓' : ''}</div>
            </div>`).join('')}</div>` : ''}
          <div class="text-sm mt-2">${ok ? '✅' : '❌'} <span class="${ok ? 'text-green-700' : 'text-red-600'}">我的答案：</span><span class="font-en">${esc(pickedText || '（没作答）')}</span></div>
          ${ok ? '' : `<div class="text-sm"><span class="text-green-700">正确答案：</span><span class="font-en">${esc(correctText)}</span></div>`}
          ${q.explain ? `<div class="text-xs text-gray-600 mt-1">🔎 ${esc(q.explain)}</div>` : ''}
          ${q === s.questions[s.questions.length - 1] ? tapescriptHtml(s, sections.indexOf(s)) : ''}
        </div>`).join('')}
      <button id="followBtn" class="w-full btn-cartoon mb-2">🎤 第 ④ 步：跟读原文</button>
      <button id="redoBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-2">🔁 再练一次这一课</button>
      <button id="homeBtn" class="w-full btn-cartoon btn-cartoon-secondary">返回训练营</button>
    `;
    bindBack(app, 'exam-listening');
    app.querySelector('#examBackBtn').onclick = goHome;
    app.querySelectorAll('[data-replay]').forEach(b => b.addEventListener('click', async () => {
      stopPlayer();
      const s = sections[Number(b.dataset.replay)];
      b.disabled = true;
      player = speakDialogue(s.script, { rate, voices: await getVoices(), onEnd: () => { player = null; if (document.contains(b)) b.disabled = false; } });
    }));
    app.querySelector('#followBtn').addEventListener('click', () => stepFollow());
    app.querySelector('#redoBtn').addEventListener('click', () => stepWarmup());
    app.querySelector('#homeBtn').addEventListener('click', goHome);
  }

  function tapescriptHtml(s, secIdx) {
    return `
      <div class="bg-gray-50 rounded-2xl p-3 mt-2">
        <div class="flex items-center justify-between mb-1">
          <div class="text-cap text-gray-400">📜 原文 tapescript（第 ${secIdx + 1} 段）</div>
          <button data-replay="${sections.indexOf(s)}" class="text-cap px-3 rounded-full bg-white border-2 border-gray-200 tap-bounce" style="min-height:44px">🔊 再听（不限次）</button>
        </div>
        ${s.script.map(t => `<div class="flex gap-2 py-1 text-sm"><span class="font-bold text-cap" style="min-width:52px;color:${t.sex === 'm' ? 'var(--c-sky-ink)' : 'var(--c-pink-ink)'}">${esc(t.who || (t.sex === 'm' ? 'Man' : 'Woman'))}</span><span class="font-en text-gray-700" style="min-width:0;word-break:break-word">${esc(t.text)}</span></div>`).join('')}
      </div>`;
  }

  // -------- ④ 跟读：逐 turn 示范 → 录音 → LCS 词级对齐打分 --------
  function stepFollow() {
    const turns = [];
    sections.forEach((s, si) => (s.script || []).forEach(t => turns.push({ ...t, si })));
    let idx = 0, passed = 0;
    const back = goHome; // 对答案页已经看过，‹ 直接回训练营

    function drawOne() {
      if (idx >= turns.length) return drawDone();
      stopPlayer();
      const t = turns[idx];
      // ★ 级轻场景：只藏导航，‹ 直接退不弹确认
      enterFocus({ confirm: false, cleanup: stopPlayer });
      app.innerHTML = `
        ${headerHtml(`🎤 跟读 · ${idx + 1}/${turns.length}`)}
        <div class="progress-bar mb-3"><div class="progress-bar-fill" style="width:${idx / turns.length * 100}%"></div></div>
        ${!isSpeechRecognitionSupported() ? '<div class="card-cartoon mb-3 bg-yellow-50 text-sm text-orange-700">这个浏览器不支持语音识别，跟读打分用不了；可以只听示范自己读。换手机自带浏览器或 Chrome 就可以打分。</div>' : ''}
        <div class="card-cartoon mb-3 text-center recite-text">
          <div class="text-xs text-gray-400 mb-1">第 ${t.si + 1} 段 · ${esc(t.who || '')}</div>
          <div class="font-en text-lg leading-relaxed mb-3" style="word-break:break-word">${esc(t.text)}</div>
          <button id="demoBtn" class="text-3xl tap-bounce" style="min-width:48px;min-height:48px">🔊</button>
        </div>
        <button id="recBtn" class="w-full btn-cartoon record-btn">🎤 点击跟读</button>
        <button id="skipBtn" class="w-full btn-cartoon btn-cartoon-secondary mt-3">跳过这句</button>
        <div id="result" class="mt-4"></div>
      `;
      app.querySelector('#examBackBtn').onclick = back;
      const demo = async () => { stopPlayer(); player = speakDialogue([t], { rate, voices: await getVoices(), onEnd: () => { player = null; } }); };
      app.querySelector('#demoBtn').addEventListener('click', demo);
      setTimeout(() => { if (document.contains(app.querySelector('#demoBtn'))) demo(); }, 300);
      app.querySelector('#skipBtn').addEventListener('click', () => { idx++; drawOne(); });
      const recBtn = app.querySelector('#recBtn');
      recBtn.addEventListener('click', async () => {
        if (!isSpeechRecognitionSupported()) { toast('当前浏览器不支持语音识别', 'warn'); return; }
        stopPlayer();
        recBtn.textContent = '🎤 录音中…开始读吧';
        recBtn.disabled = true;
        try {
          const handle = recognize();
          const results = await handle.promise;
          const best = results.map(r => alignWords(t.text, r.transcript)).sort((a, b) => b.score - a.score)[0];
          showResult(best);
        } catch (e) {
          toast('没听清，再试一次', 'warn');
          recBtn.textContent = '🎤 点击跟读';
          recBtn.disabled = false;
        }
      });
      function showResult(res) {
        const pass = res.score >= 75;
        if (pass) { passed++; playSound('correct'); storage.addCoins(2); } else playSound('wrong');
        const box = app.querySelector('#result');
        box.innerHTML = `
          <div class="card-cartoon text-center ${pass ? 'bg-green-50' : 'bg-orange-50'}">
            <div class="text-2xl font-bold ${pass ? 'text-green-700' : 'text-orange-700'}">${res.score} 分</div>
            <div class="text-cap text-gray-400">完整度 ${res.completeness}% · 准确度 ${res.accuracy}%</div>
            <div class="font-en text-sm mt-2" style="line-height:1.9">${res.tokens.map(tk => `<span class="${tk.status === 'correct' ? 'text-green-700' : tk.status === 'missing' ? 'text-red-600' : 'text-gray-400'}" style="${tk.status === 'missing' ? 'text-decoration:underline' : tk.status === 'extra' ? 'text-decoration:line-through' : ''}">${esc(tk.word)}</span>`).join(' ')}</div>
            <div class="text-sm mt-1">${pass ? '🎉 很标准，过关！' : '差一点，可以再读一遍～'}</div>
            <div class="flex gap-3 mt-3">
              <button id="retryBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">再读一遍</button>
              <button id="nextBtn" class="flex-1 btn-cartoon">${idx + 1 >= turns.length ? '完成' : '下一句 →'}</button>
            </div>
          </div>`;
        box.querySelector('#retryBtn').addEventListener('click', () => drawOne());
        box.querySelector('#nextBtn').addEventListener('click', () => { idx++; drawOne(); });
      }
    }

    function drawDone() {
      stopPlayer();
      exitFocus();
      playSound('levelup');
      storage.addPetExp(10);
      app.innerHTML = `
        ${headerHtml('🎤 跟读完成')}
        <div class="text-center pt-4">
          <div class="text-6xl mb-3">🎧</div>
          <div class="card-cartoon my-4 bg-gradient-to-br from-cyan-50 to-blue-50">
            <div class="text-sm text-gray-600">达标句数</div>
            <div class="text-2xl font-bold text-secondary-ink my-1">${passed}<span class="text-lg text-gray-400"> / ${turns.length}</span></div>
            <div class="text-xs text-gray-500">耳朵只能听懂嘴能说出的东西——今天这一课完整走完了四步。</div>
          </div>
          <button id="doneBtn" class="w-full btn-cartoon">返回训练营</button>
        </div>`;
      bindBack(app, 'exam-listening');
      app.querySelector('#examBackBtn').onclick = goHome;
      app.querySelector('#doneBtn').addEventListener('click', goHome);
    }
    drawOne();
  }

  stepWarmup();
}

// ============================================================
// 判分与文本化
// ============================================================
const NUM_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };

// 英文数字词 → 阿拉伯数字（"twenty-five" / "twenty five" / "a hundred"）；不是数字词原样返回
function numberize(s) {
  const words = s.replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.length || !words.every(w => w in NUM_WORDS || w === 'a' || w === 'and')) return null;
  let total = 0, cur = 0, any = false;
  for (const w of words) {
    if (w === 'a' || w === 'and') continue;
    const n = NUM_WORDS[w];
    any = true;
    if (n === 100) { cur = (cur || 1) * 100; } else { cur += n; }
    if (n === 100) { total += cur; cur = 0; }
  }
  if (!any) return null;
  return String(total + cur);
}

// 时间写法归一（P-L2）："7.30" / "7:30" / "7 30" / "half past seven" / "seven thirty" / "quarter to eight" / "7 o'clock"
// → 统一成 "7:30" 形；整点去掉 ":00"（"7:00" / "seven o'clock" / "7" 等价，对齐真考 key 的 7 / 7.00 写法）。不是时间返回 null
const HOUR_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };
const MIN_WORDS = { five: 5, ten: 10, quarter: 15, twenty: 20, 'twenty-five': 25, half: 30 };
function timeize(s) {
  const t = s.replace(/\b(am|pm|a\.m|p\.m|in the (morning|afternoon|evening))\b\.?/g, ' ').replace(/\s+/g, ' ').trim();
  const fmt = (h, m) => (h < 0 || h > 24 || m < 0 || m > 59) ? null : (m === 0 ? String(h) : `${h}:${String(m).padStart(2, '0')}`);
  const hourOf = (x) => (/^\d/.test(x) ? Number(x) : HOUR_WORDS[x]);
  let m;
  if ((m = t.match(/^(\d{1,2})\s*[.:h ]\s*(\d{2})$/))) return fmt(Number(m[1]), Number(m[2]));           // 7.30 / 7:30 / 7 30
  if ((m = t.match(/^(\d{1,2}|[a-z]+) o'?clock$/))) { const h = hourOf(m[1]); return h == null ? null : fmt(h, 0); }
  if ((m = t.match(/^(half|quarter|five|ten|twenty|twenty[- ]five) (past|to) (\d{1,2}|[a-z]+)$/))) {      // half past seven / quarter to eight
    const mins = MIN_WORDS[m[1].replace(' ', '-')]; let h = hourOf(m[3]);
    if (mins == null || h == null) return null;
    if (m[2] === 'to') { h = h === 1 ? 12 : h - 1; return fmt(h, 60 - mins); }
    return fmt(h, mins);
  }
  if ((m = t.match(/^([a-z]+) ([a-z]+(?:[- ][a-z]+)?)$/)) && HOUR_WORDS[m[1]] != null) {                    // seven thirty / eight forty-five
    const mins = numberize(m[2]); return mins == null ? null : fmt(HOUR_WORDS[m[1]], Number(mins));
  }
  return null;
}

// Part 2 填空规范化：大小写不敏感、首尾空格容错、内部多空格合一、去掉句末句号；★ 拼写必须完全正确
// 数字词 ↔ 阿拉伯数字互认（seven = 7），时间三种写法互认（7.30 = 7:30 = half past seven）
export function normalizeGap(s) {
  const t = String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.。]+$/, '').trim();
  const tm = timeize(t); // 先认时间："seven thirty" 是 7:30，不能被数字词加法吃成 37
  if (tm != null) return tm;
  const n = numberize(t);
  return n != null ? n : t;
}

function judge(part, q, picked) {
  if (picked == null || picked === '') return false;
  if (part === 2) {
    const user = normalizeGap(picked);
    if (!user) return false;
    return [q.answer].concat(q.alt || []).map(normalizeGap).includes(user);
  }
  return Number(picked) === Number(q.answer);
}

function pickedToText(s, q, picked) {
  if (picked == null || picked === '') return '';
  if (s.part === 2) return String(picked);
  const i = Number(picked);
  if (s.part === 5) return `${LETTERS[i]}. ${(s.options || [])[i] || ''}`;
  if (s.part === 1) return `${LETTERS[i]}. ${(q.options[i] && (q.options[i].alt || q.options[i].icon)) || ''}`;
  return `${LETTERS[i]}. ${q.options[i] || ''}`;
}
function correctToText(s, q) {
  if (s.part === 2) return String(q.answer);
  return pickedToText(s, q, q.answer);
}
function optionsToText(s, q) {
  if (s.part === 2) return null;
  if (s.part === 5) return (s.options || []).map((o, i) => `${LETTERS[i]}. ${o}`);
  if (s.part === 1) return q.options.map((o, i) => `${LETTERS[i]}. ${o.alt || o.icon}`);
  return q.options.map((o, i) => `${LETTERS[i]}. ${o}`);
}
// 错题本题面摘要：题干 + 题型标注（B4 口径：q 是给孩子和 AI 看的题面）
function mistakeSummary(s, q) {
  const kind = s.part === 1 ? '三图选一' : s.part === 2 ? '填空' : s.part === 5 ? '匹配' : '三选一';
  return `[听力 Part ${s.part} ${kind}] ${q.q}`;
}
