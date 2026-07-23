// modules/exam/grammar-course.js —— 模块 3：语法八课（乐队比喻）
// 视图：主页(课程树+错误分区+考纲+动词闯关入口) / 课程详情(讲解+例句+练习) / 不规则动词(接入闯关)
import { loadJSON, toast } from '../../app.js';
import * as storage from '../../storage.js';
import { renderLevelMap } from '../levels.js';
import { shuffle, pickQuiz, presentQuestion } from '../../utils/shuffle.js';
import { examLevel, headerHtml, bindBack, esc } from './exam-common.js';

const ZONE_STYLE = {
  red: { badge: '🔴', cls: 'border-red-300 bg-red-50' },
  yellow: { badge: '🟡', cls: 'border-yellow-300 bg-yellow-50' },
  gray: { badge: '⚪', cls: 'border-gray-200 bg-gray-50' },
  none: { badge: '🚫', cls: 'border-gray-200 bg-gray-50' }
};

export async function renderGrammarCourse(app, params = {}) {
  const level = examLevel();
  const dir = level.toLowerCase();
  const [lessons, inventory, errors, verbs] = await Promise.all([
    loadJSON(`data/exam/${dir}/grammar-lessons.json`),
    loadJSON(`data/exam/${dir}/grammar-inventory.json`),
    loadJSON(`data/exam/${dir}/grammar-errors.json`),
    loadJSON(`data/exam/${dir}/irregular-verbs.json`)
  ]);
  if (!lessons) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">🎼</span><div class="empty-text">语法数据加载失败</div></div>';
    return;
  }

  if (params.lesson) {
    const l = lessons.lessons.find(x => x.id === params.lesson);
    if (l) return renderLesson(app, level, lessons, l);
  }
  if (params.view === 'verbs' && verbs) return renderVerbs(app, level, verbs);
  if (params.view === 'errors' && errors) return renderErrors(app, errors);
  if (params.view === 'inventory' && inventory) return renderInventory(app, inventory);

  // === 主页 ===
  const prog = storage.getLessonProgress(level);
  const doneN = lessons.lessons.filter(l => prog[l.id] === 'done').length;

  app.innerHTML = `
    ${headerHtml('🎼 语法学院 · 乐队八课')}

    <!-- 乐队比喻总卡 -->
    <div class="card-cartoon mb-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <h3 class="font-bold mb-1">${lessons.bandIntro.title}</h3>
      <p class="text-xs text-gray-600 mb-2">${lessons.bandIntro.note}</p>
      <div class="space-y-1">
        ${lessons.bandIntro.roles.map(r => `
          <div class="flex gap-2 text-xs">
            <span class="font-bold" style="min-width:88px">${r.role}</span>
            <span class="text-gray-600 flex-1">${r.band}</span>
            <span class="text-gray-400">${r.lesson}</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- 八课知识树 -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-bold">📚 八课（${doneN}/8 已掌握）</h3>
    </div>
    <div class="space-y-2 mb-4">
      ${lessons.lessons.map(l => {
        const st = prog[l.id];
        const badge = st === 'done' ? '✅ 已掌握' : st === 'learning' ? '📖 学习中' : '⬜ 未学';
        return `
        <button data-lesson="${l.id}" class="w-full card-cartoon tap-bounce flex items-center gap-3 text-left" style="padding:12px 14px">
          <span class="font-black text-primary" style="min-width:36px">${l.id}</span>
          <div class="flex-1">
            <div class="font-bold text-sm">${l.title}${l.hiddenLine ? ' <span title="暗线">🧵</span>' : ''}</div>
            <div class="text-xs text-gray-500">${l.minutes}′ · ${badge}</div>
          </div>
          <span class="text-xl text-gray-300">›</span>
        </button>`;
      }).join('')}
    </div>
    <div class="text-xs text-gray-400 mb-4">🧵 = 暗线出现处：「越常用的词，越不规则」在 L1 / L3 / L8 各出现一次</div>

    <!-- 功能入口 -->
    <div class="grid grid-cols-1 gap-2 mb-4">
      <button data-view="verbs" class="card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-r from-orange-50 to-amber-50">
        <span class="text-3xl">🔁</span>
        <div class="flex-1"><div class="font-bold text-sm">40 个不规则动词 · 六组闯关</div><div class="text-xs text-gray-500">一天一组，六天背完，第七天混查</div></div>
        <span class="text-xl text-gray-300">›</span>
      </button>
      <button data-view="errors" class="card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-r from-red-50 to-pink-50">
        <span class="text-3xl">🚦</span>
        <div class="flex-1"><div class="font-bold text-sm">8 类中式错误 · 三色分区</div><div class="text-xs text-gray-500">只有红区会挡意思，只打红区</div></div>
        <span class="text-xl text-gray-300">›</span>
      </button>
      <button data-view="inventory" class="card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-r from-cyan-50 to-blue-50">
        <span class="text-3xl">📜</span>
        <div class="flex-1"><div class="font-bold text-sm">考纲语法项 + Part 5 速成 + 满分档事实</div><div class="text-xs text-gray-500">语法值多少分，一张表看清</div></div>
        <span class="text-xl text-gray-300">›</span>
      </button>
    </div>
  `;
  bindBack(app);
  app.querySelectorAll('[data-lesson]').forEach(b => b.addEventListener('click', () => renderGrammarCourse(app, { lesson: b.dataset.lesson })));
  app.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => renderGrammarCourse(app, { view: b.dataset.view })));
}

// === 课程详情 ===
function renderLesson(app, level, lessonsData, l) {
  // 进入即标记「学习中」（若未掌握）
  const prog = storage.getLessonProgress(level);
  if (!prog[l.id]) storage.markLessonDone(level, l.id, 'learning');

  // V0.6：有增强讲解+四环节的课走新渲染；老数据兜底走原流程
  if (l.teaching && Array.isArray(l.stages) && l.stages.length) {
    return renderLessonV2(app, level, lessonsData, l);
  }

  let exIdx = 0, correctN = 0, answered = false;
  let exercises = l.exercises; // V0.8：开始练习时洗牌（题序+选项；老题型按文本判分，选项直接洗）
  function reshuffleExercises() {
    exercises = shuffle(l.exercises).map(e => e.type === 'choice' && !e.noShuffle ? { ...e, options: shuffle(e.options) } : e);
  }

  function drawIntro() {
    app.innerHTML = `
      ${headerHtml(`${l.id} · ${l.title}`)}
      ${l.sections.map(s => `
        <div class="card-cartoon mb-3">
          <div class="font-bold text-sm mb-1">🎵 ${s.h}</div>
          <p class="text-sm text-gray-700">${s.text}</p>
        </div>`).join('')}

      <div class="card-cartoon mb-3 bg-gradient-to-br from-green-50 to-emerald-50">
        <div class="font-bold text-sm mb-2">📖 原创例句</div>
        ${l.examples.map(e => `
          <div class="mb-2 pb-2 border-b border-green-100 last:border-0">
            <div class="font-en text-sm font-bold">${e.en}</div>
            <div class="text-xs text-gray-600">${e.zh} <span class="text-green-600">· ${e.note}</span></div>
          </div>`).join('')}
      </div>

      ${l.hiddenLine ? `
      <div class="card-cartoon mb-3 border-2 border-purple-300 bg-purple-50">
        <div class="font-bold text-sm mb-1">🧵 暗线时刻</div>
        <p class="text-sm text-gray-700">${l.hiddenLineNote}</p>
        <p class="text-xs text-purple-500 mt-2">${lessonsData.hiddenLineText}</p>
      </div>` : ''}

      <div class="card-cartoon mb-3 bg-blue-50">
        <div class="font-bold text-sm mb-1">🎯 ${l.accept.startsWith('验收') ? '' : '验收：'}${l.accept}</div>
      </div>
      <div class="card-cartoon mb-4 bg-amber-50">
        <p class="text-xs text-gray-700">👪 ${l.parentScript}</p>
      </div>

      <button id="startExBtn" class="w-full btn-cartoon">✏️ 开始练习（${l.exercises.length} 题）</button>
    `;
    bindBack(app, 'exam-grammar');
    app.querySelector('#examBackBtn').onclick = () => renderGrammarCourse(app, {});
    app.querySelector('#startExBtn').addEventListener('click', () => { exIdx = 0; correctN = 0; reshuffleExercises(); drawExercise(); });
  }

  function drawExercise() {
    if (exIdx >= exercises.length) return drawResult();
    const ex = exercises[exIdx];
    answered = false;
    const typeLabel = { choice: '选择', fill: '填空', fix: '改错', transform: '句型转换' }[ex.type] || '练习';

    app.innerHTML = `
      ${headerHtml(`${l.id} 练习 ${exIdx + 1}/${exercises.length}`)}
      <div class="progress-bar mb-4"><div class="progress-bar-fill" style="width:${exIdx / exercises.length * 100}%"></div></div>
      <div class="card-cartoon mb-4">
        <div class="text-xs text-gray-400 mb-2">${typeLabel}</div>
        <div class="text-base font-bold mb-3">${esc(ex.q)}</div>
        ${ex.type === 'choice' ? `
          <div class="space-y-2">
            ${ex.options.map(o => `<button data-opt="${esc(o)}" class="opt-btn w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-left font-en tap-bounce" style="min-height:48px">${esc(o)}</button>`).join('')}
          </div>` : `
          <input id="ansInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="${ex.type === 'fill' ? '填一个词/短语' : '写出正确的整句'}" autocomplete="off" />
          <button id="submitBtn" class="w-full btn-cartoon mt-3">提交</button>`}
      </div>
      <div id="feedback"></div>
    `;
    bindBack(app, 'exam-grammar');
    app.querySelector('#examBackBtn').onclick = () => drawIntro();

    function judge(userRaw) {
      if (answered) return;
      answered = true;
      const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]$/, '');
      const ok = norm(userRaw) === norm(ex.answer);
      if (ok) correctN++;
      const fb = app.querySelector('#feedback');
      fb.innerHTML = `
        <div class="card-cartoon ${ok ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'} mb-3">
          <div class="font-bold text-sm mb-1">${ok ? '✅ 对啦！' : '❌ 再看看'}</div>
          ${ok ? '' : `<div class="text-sm font-en mb-1">正确答案：<b>${esc(ex.answer)}</b></div>`}
          <div class="text-xs text-gray-600">${esc(ex.explain)}</div>
        </div>
        <button id="nextBtn" class="w-full btn-cartoon">${exIdx + 1 >= exercises.length ? '看结果' : '下一题 ›'}</button>`;
      fb.querySelector('#nextBtn').addEventListener('click', () => { exIdx++; drawExercise(); });
    }

    app.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => {
      b.classList.add('ring-2', 'ring-primary');
      judge(b.dataset.opt);
    }));
    const sub = app.querySelector('#submitBtn');
    if (sub) sub.addEventListener('click', () => judge(app.querySelector('#ansInput').value));
  }

  function drawResult() {
    const total = exercises.length;
    const pass = correctN / total >= 0.7;
    if (pass) storage.markLessonDone(level, l.id, 'done');
    app.innerHTML = `
      ${headerHtml(`${l.id} · 练习结果`)}
      <div class="card-cartoon text-center mb-4 ${pass ? 'bg-green-50' : 'bg-yellow-50'}">
        <div class="text-6xl mb-2">${pass ? '🎉' : '💪'}</div>
        <div class="text-2xl font-black">${correctN} / ${total}</div>
        <p class="text-sm text-gray-600 mt-2">${pass ? '这课掌握了！记得今天把它「用出来」——只做题不输出＝没学。' : '没关系，回讲解再看一遍，明天再来一次。'}</p>
      </div>
      <button id="againBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-3">再练一遍</button>
      <button id="homeBtn" class="w-full btn-cartoon">回语法学院</button>
    `;
    bindBack(app, 'exam-grammar');
    app.querySelector('#examBackBtn').onclick = () => renderGrammarCourse(app, {});
    app.querySelector('#againBtn').addEventListener('click', () => { exIdx = 0; correctN = 0; reshuffleExercises(); drawExercise(); });
    app.querySelector('#homeBtn').addEventListener('click', () => renderGrammarCourse(app, {}));
  }

  drawIntro();
}

// === V0.6 课程详情（增强讲解 + 四环节练习）===
const STAGE_PASS = 0.7; // 环节通过线
const STAGE_TAKE = 16;  // 每次实际做的题数（题库超量时随机抽这么多，预留扩容空间）

function stageKey(lessonId, stage) { return `grammar-${lessonId}-s${stage}`; }

function renderLessonV2(app, level, lessonsData, l) {
  const t = l.teaching;

  function stageBest(stage) {
    const rec = storage.getDrillResults(level)[stageKey(l.id, stage)];
    return rec ? rec.best : null;
  }
  function stagePassed(stage) {
    const s = l.stages.find(x => x.stage === stage);
    const best = stageBest(stage);
    // 分母用单次实际做的题数（题库可能超量），而不是题库总量
    return best !== null && s && best / Math.min(STAGE_TAKE, s.questions.length) >= STAGE_PASS;
  }

  // --- 讲解页 ---
  function drawIntro() {
    app.innerHTML = `
      ${headerHtml(`${l.id} · ${l.title}`)}

      <!-- 一句话抓住本质 -->
      <div class="card-cartoon mb-3 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div class="font-bold text-sm mb-1">🎼 一句话抓住本质</div>
        <p class="text-sm text-gray-800 font-bold">${t.essence}</p>
      </div>

      <!-- 为什么 -->
      <div class="card-cartoon mb-3">
        <div class="font-bold text-sm mb-1">🤔 为什么是这样</div>
        <p class="text-sm text-gray-700">${t.why}</p>
      </div>

      <!-- 规则拆解 -->
      ${t.rules.map((r, i) => `
        <div class="card-cartoon mb-3">
          <div class="font-bold text-sm mb-1">🎵 规则 ${i + 1} · ${r.point}</div>
          ${r.detail ? `<p class="text-sm text-gray-700 mb-2">${r.detail}</p>` : ''}
          ${(r.examples || []).map(e => `
            <div class="mb-1.5 pb-1.5 border-b border-gray-50 last:border-0">
              <div class="font-en text-sm font-bold">${e.en}</div>
              <div class="text-xs text-gray-600">${e.zh}</div>
            </div>`).join('')}
        </div>`).join('')}

      <!-- 注意事项 -->
      <div class="card-cartoon mb-3 bg-amber-50 border-2 border-amber-300">
        <div class="font-bold text-sm mb-2">⚠️ 注意事项</div>
        ${t.notes.map(n => `<p class="text-sm text-gray-700 mb-1.5">· ${n}</p>`).join('')}
      </div>

      <!-- 易错点红黑榜 -->
      <div class="card-cartoon mb-3 border-2 border-red-300">
        <div class="font-bold text-sm mb-2">🚦 易错点红黑榜</div>
        ${t.commonErrors.map(e => {
          const z = ZONE_STYLE[e.zone] || ZONE_STYLE.gray;
          return `
          <div class="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
            <div class="text-sm font-en mb-1">❌ <s class="text-red-400">${esc(e.wrong)}</s></div>
            <div class="text-sm font-en mb-1">✅ <b class="text-green-600">${esc(e.right)}</b></div>
            <p class="text-xs text-gray-600 mb-1">${e.why}</p>
            <div class="flex flex-wrap gap-1.5 text-[11px]">
              <span class="rounded-full px-2 py-0.5 border ${z.cls}">${z.badge} ${e.zone === 'red' ? '红区' : e.zone === 'yellow' ? '黄区' : '灰区'}</span>
              <span class="rounded-full px-2 py-0.5 bg-gray-100">挡意思：${e.impedes ? '会' : '通常不会'}</span>
              <span class="rounded-full px-2 py-0.5 bg-gray-100">考点：${e.ketPart}</span>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- 家长话术 -->
      <div class="card-cartoon mb-3 bg-amber-50">
        <p class="text-xs text-gray-700">👪 家长话术：${t.parentTip}</p>
      </div>

      <!-- 暗线 -->
      ${t.darkline ? `
      <div class="card-cartoon mb-3 border-2 border-purple-300 bg-purple-50">
        <div class="font-bold text-sm mb-1">🧵 暗线时刻</div>
        <p class="text-sm text-gray-700">${t.darkline}</p>
        <p class="text-xs text-purple-500 mt-2">${lessonsData.hiddenLineText}</p>
      </div>` : ''}

      ${l.accept ? `
      <div class="card-cartoon mb-4 bg-blue-50">
        <div class="text-sm text-gray-700">🎯 ${l.accept}</div>
      </div>` : ''}

      <button id="toStagesBtn" class="w-full btn-cartoon">✏️ 四环节闯练（${l.stages.length} 环节 × 16 题）</button>
    `;
    bindBack(app, 'exam-grammar');
    app.querySelector('#examBackBtn').onclick = () => renderGrammarCourse(app, {});
    app.querySelector('#toStagesBtn').addEventListener('click', drawStageSelect);
  }

  // --- 环节选择页 ---
  function drawStageSelect() {
    const passedAll = l.stages.every(s => stagePassed(s.stage));
    app.innerHTML = `
      ${headerHtml(`${l.id} · 练习环节`)}
      <p class="text-xs text-gray-500 mb-3">每环节 16 题，答对 70% 通过并解锁下一环节。做完当天记得把这课「用出来」。</p>
      <div class="space-y-2 mb-4">
        ${l.stages.map((s, i) => {
          const best = stageBest(s.stage);
          const passed = stagePassed(s.stage);
          const locked = i > 0 && !stagePassed(l.stages[i - 1].stage);
          const stars = '★'.repeat(s.difficulty) + '<span class="text-gray-300">' + '★'.repeat(4 - s.difficulty) + '</span>';
          return `
          <button data-stage="${s.stage}" ${locked ? 'data-locked="1"' : ''} class="w-full card-cartoon tap-bounce text-left ${locked ? 'opacity-50' : ''} ${passed ? 'border-2 border-green-300 bg-green-50' : ''}" style="padding:14px;min-height:48px">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${locked ? '🔒' : passed ? '✅' : ['🌱', '🎯', '⚔️', '🏆'][i] || '📝'}</span>
              <div class="flex-1">
                <div class="font-bold text-sm">环节 ${s.stage} · ${s.name} <span class="text-amber-500">${stars}</span></div>
                <div class="text-xs text-gray-500">${best !== null ? `最好成绩 ${best}/${Math.min(STAGE_TAKE, s.questions.length)}${passed ? ' · 已通过' : ''}` : locked ? '先通过上一环节解锁' : `${Math.min(STAGE_TAKE, s.questions.length)} 题 · 未挑战`}</div>
              </div>
              <span class="text-xl text-gray-300">›</span>
            </div>
          </button>`;
        }).join('')}
      </div>
      ${passedAll ? `<div class="card-cartoon mb-3 bg-green-50 border-2 border-green-300 text-center"><p class="text-sm font-bold">🎉 四个环节全部通过，这课真的掌握了！</p></div>` : ''}
      <button id="backIntroBtn" class="w-full btn-cartoon btn-cartoon-secondary">📖 回看讲解</button>
    `;
    bindBack(app, 'exam-grammar');
    app.querySelector('#examBackBtn').onclick = drawIntro;
    app.querySelector('#backIntroBtn').addEventListener('click', drawIntro);
    app.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.locked) { toast('先通过上一环节（答对 70%）再来挑战这关！'); return; }
      const s = l.stages.find(x => x.stage === Number(b.dataset.stage));
      runQuiz(s, s.questions, false);
    }));
  }

  // --- 练习引擎（支持 choice / tf / fill / correct / transform）---
  // V0.8：每次进入重新洗牌——题池抽样(错题加权) + 题序打乱 + 选项洗牌(answer 同步重算)。
  // 同一次作答过程中顺序固定（进场时一次性生成展示副本）。
  function runQuiz(s, srcQuestions, isRetry) {
    const scope = `${level}:${l.id}:s${s.stage}`;
    let questions;
    if (isRetry) {
      questions = shuffle(srcQuestions).map(q => presentQuestion(scope, q));
    } else {
      const picked = pickQuiz(scope, srcQuestions, STAGE_TAKE, storage.getQuizStats());
      questions = picked.questions.map(q => presentQuestion(scope, q));
      if (picked.focusedWrong) toast('🎯 本次重点安排了你之前做错的题');
    }
    let idx = 0, correctN = 0, answered = false;
    const wrongList = [];

    function norm(x) {
      return String(x).trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').replace(/[.!?。！？]+$/, '');
    }

    function draw() {
      if (idx >= questions.length) return drawQuizResult();
      const q = questions[idx];
      answered = false;
      const typeLabel = { choice: '选择', tf: '判断对错', fill: '填空', correct: '改错', transform: '句型转换' }[q.type] || '练习';
      const stars = '★'.repeat(s.difficulty);

      let body = '';
      if (q.type === 'choice') {
        // 选项已在 presentQuestion 时洗好（answer 同步重算），这里按序渲染即可
        body = `<div class="text-base font-bold mb-3">${esc(q.q)}</div>
          <div class="space-y-2">
            ${q.options.map((o, oi) => `<button data-oi="${oi}" class="opt-btn w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-left font-en tap-bounce" style="min-height:48px">${esc(o)}</button>`).join('')}
          </div>`;
      } else if (q.type === 'tf') {
        body = `<div class="text-base font-bold mb-3">${esc(q.q)}</div>
          <div class="grid grid-cols-2 gap-2">
            <button data-tf="true" class="border-2 border-gray-200 rounded-2xl px-4 py-3 font-bold tap-bounce" style="min-height:56px">⭕ 对</button>
            <button data-tf="false" class="border-2 border-gray-200 rounded-2xl px-4 py-3 font-bold tap-bounce" style="min-height:56px">❌ 错</button>
          </div>`;
      } else if (q.type === 'correct') {
        body = `<div class="text-xs text-gray-500 mb-1">下面这句有错，写出正确的整句：</div>
          <div class="text-base font-bold font-en mb-3">❌ ${esc(q.wrong)}</div>
          <input id="ansInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="写出正确的整句" autocomplete="off" autocapitalize="off" />
          <button id="submitBtn" class="w-full btn-cartoon mt-3" style="min-height:48px">提交</button>`;
      } else if (q.type === 'transform') {
        body = `<div class="text-xs text-gray-500 mb-1">把下面的句子改成【${esc(q.to_type)}】：</div>
          <div class="text-base font-bold font-en mb-3">${esc(q.from)}</div>
          <input id="ansInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="写出改好的整句" autocomplete="off" autocapitalize="off" />
          <button id="submitBtn" class="w-full btn-cartoon mt-3" style="min-height:48px">提交</button>`;
      } else { // fill
        body = `<div class="text-base font-bold font-en mb-1">${esc(q.q)}</div>
          ${q.hint ? `<div class="text-xs text-blue-500 mb-2">${esc(q.hint)}</div>` : ''}
          <input id="ansInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="填一个词/短语" autocomplete="off" autocapitalize="off" />
          <button id="submitBtn" class="w-full btn-cartoon mt-3" style="min-height:48px">提交</button>`;
      }

      app.innerHTML = `
        ${headerHtml(`${isRetry ? '错题重练' : `环节 ${s.stage} · ${s.name}`} ${idx + 1}/${questions.length}`)}
        <div class="progress-bar mb-4"><div class="progress-bar-fill" style="width:${idx / questions.length * 100}%"></div></div>
        <div class="card-cartoon mb-4">
          <div class="text-xs text-gray-400 mb-2">${typeLabel} · <span class="text-amber-500">${stars}</span></div>
          ${body}
        </div>
        <div id="feedback"></div>
      `;
      bindBack(app, 'exam-grammar');
      app.querySelector('#examBackBtn').onclick = drawStageSelect;

      function finish(ok, correctShown) {
        if (answered) return;
        answered = true;
        storage.recordQuizAnswer(q.__qk, ok); // 题目级统计：下次抽题时错题优先
        if (ok) correctN++; else wrongList.push(q);
        const fb = app.querySelector('#feedback');
        fb.innerHTML = `
          <div class="card-cartoon ${ok ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'} mb-3">
            <div class="font-bold text-sm mb-1">${ok ? '✅ 对啦！' : '❌ 再看看'}</div>
            ${ok ? '' : `<div class="text-sm font-en mb-1">正确答案：<b>${esc(correctShown)}</b></div>`}
            <div class="text-xs text-gray-600">${esc(q.explain || '')}</div>
          </div>
          <button id="nextBtn" class="w-full btn-cartoon" style="min-height:48px">${idx + 1 >= questions.length ? '看结果' : '下一题 ›'}</button>`;
        fb.querySelector('#nextBtn').addEventListener('click', () => { idx++; draw(); });
        fb.querySelector('#nextBtn').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (q.type === 'choice') {
        app.querySelectorAll('[data-oi]').forEach(b => b.addEventListener('click', () => {
          b.classList.add('ring-2', 'ring-primary');
          finish(Number(b.dataset.oi) === q.answer, q.options[q.answer]);
        }));
      } else if (q.type === 'tf') {
        app.querySelectorAll('[data-tf]').forEach(b => b.addEventListener('click', () => {
          b.classList.add('ring-2', 'ring-primary');
          finish((b.dataset.tf === 'true') === q.answer, q.answer ? '对' : '错');
        }));
      } else {
        const judgeText = () => {
          const user = app.querySelector('#ansInput').value;
          if (!user.trim()) { toast('先写一写再提交哦'); answered = false; return; }
          const cands = [q.answer].concat(q.alt || []);
          finish(cands.some(c => norm(c) === norm(user)), q.answer);
        };
        app.querySelector('#submitBtn').addEventListener('click', judgeText);
        app.querySelector('#ansInput').addEventListener('keydown', e => { if (e.key === 'Enter') judgeText(); });
      }
    }

    function drawQuizResult() {
      const total = questions.length;
      const pass = correctN / total >= STAGE_PASS;
      let unlockedMsg = '';
      if (!isRetry) {
        storage.saveDrillResult(level, stageKey(l.id, s.stage), correctN);
        if (pass) {
          const i = l.stages.findIndex(x => x.stage === s.stage);
          if (i >= 0 && i < l.stages.length - 1) unlockedMsg = `环节 ${l.stages[i + 1].stage} · ${l.stages[i + 1].name} 已解锁！`;
          if (l.stages.every(x => stagePassed(x.stage))) {
            storage.markLessonDone(level, l.id, 'done');
            unlockedMsg = '四环节全部通过，这课标记为已掌握！';
          }
        }
      }
      app.innerHTML = `
        ${headerHtml(`${isRetry ? '错题重练' : `环节 ${s.stage}`} · 结果`)}
        <div class="card-cartoon text-center mb-4 ${pass ? 'bg-green-50' : 'bg-yellow-50'}">
          <div class="text-6xl mb-2">${pass ? '🎉' : '💪'}</div>
          <div class="text-2xl font-black">${correctN} / ${total}</div>
          <p class="text-sm text-gray-600 mt-2">${pass ? (unlockedMsg || '通过！记得今天把它「用出来」——只做题不输出＝没学。') : '差一点点，看看下面的错题，重练一遍就能过。'}</p>
        </div>
        ${wrongList.length ? `<button id="retryWrongBtn" class="w-full btn-cartoon mb-3" style="min-height:48px">🔁 错题重练（${wrongList.length} 题）</button>` : ''}
        <button id="againBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-3" style="min-height:48px">🎲 换一批重做（题目会变）</button>
        <button id="stagesBtn" class="w-full btn-cartoon" style="min-height:48px">回环节列表</button>
      `;
      bindBack(app, 'exam-grammar');
      app.querySelector('#examBackBtn').onclick = drawStageSelect;
      const rw = app.querySelector('#retryWrongBtn');
      if (rw) rw.addEventListener('click', () => runQuiz(s, wrongList.slice(), true));
      app.querySelector('#againBtn').addEventListener('click', () => runQuiz(s, s.questions, false));
      app.querySelector('#stagesBtn').addEventListener('click', drawStageSelect);
    }

    draw();
  }

  drawIntro();
}

// === 不规则动词 · 六组闯关（复用现有 levels 闯关系统）===
function renderVerbs(app, level, verbs) {
  app.innerHTML = `
    ${headerHtml('🔁 40 个不规则动词')}
    <div class="card-cartoon mb-3 border-2 border-purple-300 bg-purple-50">
      <div class="font-bold text-sm mb-1">🧵 为什么它们不规则？</div>
      <p class="text-sm text-gray-700">${verbs.hiddenLine}</p>
    </div>
    <div class="text-xs text-gray-500 mb-3">📅 ${verbs.method}</div>
    <div class="space-y-2 mb-4">
      ${verbs.groups.map((g, i) => `
        <button data-group="${g.id}" class="w-full card-cartoon tap-bounce text-left" style="padding:12px 14px">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${g.icon}</span>
            <div class="flex-1">
              <div class="font-bold text-sm">第${i + 1}组 · ${g.name} <span class="text-xs font-normal text-gray-400">${g.verbs.length} 个</span></div>
              <div class="text-xs text-gray-500">${g.shape}</div>
            </div>
            <span class="text-xl text-gray-300">›</span>
          </div>
          <div class="flex flex-wrap gap-1 mt-2">
            ${g.verbs.slice(0, 8).map(v => `<span class="text-[11px] bg-gray-100 rounded-full px-2 py-0.5 font-en">${v.base}→${v.past}</span>`).join('')}${g.verbs.length > 8 ? `<span class="text-[11px] text-gray-400">+${g.verbs.length - 8}</span>` : ''}
          </div>
        </button>`).join('')}
    </div>
    <button id="mixBtn" class="w-full btn-cartoon">🎲 第七天 · 混合抽查闯关</button>
  `;
  bindBack(app, 'exam-grammar');
  app.querySelector('#examBackBtn').onclick = () => renderGrammarCourse(app, {});

  // 把动词组转成闯关用的"单词"对象（word=原形，meaning=中文+过去式，考记忆配对）
  const toWords = (g) => g.verbs.map(v => ({
    id: `irr-${v.base}`,
    word: `${v.base} → ${v.past}`,
    phonetic: '',
    pos: 'v.',
    meaning: v.zh,
    examples: []
  }));

  verbs.groups.forEach(g => {
    app.querySelector(`[data-group="${g.id}"]`).addEventListener('click', () => {
      renderLevelMap(app, {
        words: toWords(g),
        progressKey: `${level}:irr-${g.id}`,
        title: `🔁 ${g.name}`,
        onBack: () => renderVerbs(app, level, verbs)
      });
    });
  });
  app.querySelector('#mixBtn').addEventListener('click', () => {
    const all = verbs.groups.flatMap(toWords);
    // 混查：打乱顺序
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    renderLevelMap(app, {
      words: all,
      progressKey: `${level}:irr-mix`,
      title: '🎲 不规则动词混查',
      onBack: () => renderVerbs(app, level, verbs)
    });
  });
}

// === 8 类中式错误 · 三色分区 ===
function renderErrors(app, errors) {
  app.innerHTML = `
    ${headerHtml('🚦 8 类中式错误 · 三色分区')}
    <div class="card-cartoon mb-4 border-2 border-amber-300 bg-amber-50">
      <div class="font-bold text-sm mb-2">读表关键</div>
      ${errors.readingKey.map(k => `<p class="text-sm text-gray-700 mb-1.5">· ${k}</p>`).join('')}
    </div>
    <div class="space-y-2 mb-4">
      ${errors.errors.map(e => {
        const z = ZONE_STYLE[e.zone];
        return `
        <div class="card-cartoon border-2 ${z.cls}" style="padding:12px 14px">
          <div class="flex items-center gap-2 mb-1">
            <span>${z.badge}</span>
            <span class="font-bold text-sm flex-1">${e.no}. ${e.name}</span>
            <span class="text-[11px] text-gray-500">挡意思：${e.impedes}</span>
          </div>
          <div class="text-sm font-en"><s class="text-red-400">${e.wrong}</s> → <b class="text-green-600">${e.right}</b></div>
          <div class="text-[11px] text-gray-400 mt-1">在哪考：${e.where}</div>
        </div>`;
      }).join('')}
    </div>
    <h3 class="font-bold mb-2">🪜 三级优先级</h3>
    <div class="space-y-2 mb-4">
      ${errors.priorities.map(p => `
        <div class="card-cartoon" style="padding:12px 14px">
          <div class="font-bold text-sm mb-1">${p.level}</div>
          <div class="text-sm text-gray-700">${p.items}</div>
          ${p.accept ? `<div class="text-xs text-blue-600 mt-1">${p.accept}</div>` : ''}
        </div>`).join('')}
    </div>
    <div class="card-cartoon bg-amber-50">
      <div class="font-bold text-sm mb-2">👪 ${errors.parentGuide.title}</div>
      ${errors.parentGuide.rules.map(r => `<p class="text-sm text-gray-700 mb-1.5">${r}</p>`).join('')}
    </div>
  `;
  bindBack(app, 'exam-grammar');
  app.querySelector('#examBackBtn').onclick = () => renderGrammarCourse(app, {});
}

// === 考纲清单 + Part5 速成 + 满分档事实卡 ===
function renderInventory(app, inv) {
  app.innerHTML = `
    ${headerHtml('📜 考纲语法项与分值')}

    <!-- 满分档事实卡 -->
    <div class="card-cartoon mb-4 border-2 border-green-300 bg-green-50">
      <div class="font-bold text-sm mb-2">${inv.bandFact.title}</div>
      ${inv.bandFact.points.map(p => `<p class="text-sm text-gray-700 mb-1.5">${p}</p>`).join('')}
      <div class="mt-2 bg-white rounded-2xl p-3">
        <div class="text-xs text-gray-500 mb-1">${inv.bandFact.originalExample.intro}</div>
        <p class="font-en text-sm mb-1">${inv.bandFact.originalExample.text}</p>
        <div class="text-[11px] text-gray-400">${inv.bandFact.originalExample.note}</div>
      </div>
    </div>

    <!-- 语法值多少分 -->
    <div class="card-cartoon mb-4">
      <div class="font-bold text-sm mb-2">💰 ${inv.scoreTable.title}</div>
      ${inv.scoreTable.rows.map(r => `
        <div class="flex gap-2 py-2 border-b border-gray-50 last:border-0 text-sm ${r.highlight ? 'bg-amber-50 rounded-xl px-2' : ''}">
          <span class="font-bold" style="min-width:96px">${r.where}</span>
          <span style="min-width:80px">${r.score}</span>
          <span class="text-xs text-gray-500 flex-1">${r.note}</span>
        </div>`).join('')}
    </div>

    <!-- Part 5 速成 -->
    <div class="card-cartoon mb-4 bg-gradient-to-br from-cyan-50 to-blue-50">
      <div class="font-bold text-sm mb-2">⚡ ${inv.part5Method.title}</div>
      <div class="flex flex-wrap gap-1.5 mb-2">${inv.part5Method.steps.map(s => `<span class="text-xs bg-white rounded-full px-3 py-1">${s}</span>`).join('')}</div>
      ${inv.part5Method.shapes.map(s => `
        <div class="flex gap-2 py-1.5 border-b border-cyan-100 last:border-0 text-sm">
          <span class="text-gray-600 flex-1">${s.shape}</span>
          <span class="font-bold text-primary">${s.fill}</span>
        </div>`).join('')}
    </div>

    <!-- 考纲清单 -->
    <div class="card-cartoon mb-2">
      <div class="font-bold text-sm mb-2">📜 ${inv.title}</div>
      <p class="text-xs text-blue-600 mb-3">${inv.lowLevelNote}</p>
      ${inv.groups.map(g => `
        <div class="mb-3 ${g.highlight ? 'bg-amber-50 rounded-2xl p-2' : ''}">
          <div class="font-bold text-xs mb-1">${g.highlight ? '★ ' : ''}${g.name}</div>
          <div class="flex flex-wrap gap-1">${g.items.map(i => `<span class="text-[11px] bg-gray-100 rounded-full px-2 py-0.5">${i}</span>`).join('')}</div>
        </div>`).join('')}
      <div class="text-[11px] text-gray-400">${inv.note}</div>
    </div>
  `;
  bindBack(app, 'exam-grammar');
  app.querySelector('#examBackBtn').onclick = () => renderGrammarCourse(app, {});
}
