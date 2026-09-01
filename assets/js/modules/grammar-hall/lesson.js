// modules/grammar-hall/lesson.js —— 语法大厅课内页（V0.9 P1a）
// 按 data/grammar/_schema.lesson.json 的九段结构渲染讲解，另有：
//   · 记忆卡（纯 SVG，可截图）
//   · 四环节闯关：16 题/环节，答对 70% 解锁下一环节；接 utils/shuffle.js 四层随机
//     （题池抽样 + 错题加权 + 题序洗牌 + 选项洗牌 answer 同步重算）
//   · 侦探关：找病句并改正，自动比对 + 病灶自评兜底
// 进度存储与 KET 八课同一套 storage API，但 level 固定为 'HALL'，两边互不串档。
import { toast, enterFocus, exitFocus, requestLeaveFocus } from '../../app.js';
import * as storage from '../../storage.js';
import { loadGrammarLesson, skeletonHTML } from '../../utils/lazy-data.js';
import { shuffle, pickQuiz, presentQuestion, questionKey } from '../../utils/shuffle.js';
import { ketLessonLabel, ketLessonsForHall } from '../../utils/ket-hall-map.js';
import { examLevel, headerHtml, bindBack, esc } from '../exam/exam-common.js';

export const HALL_LEVEL = 'HALL';
const STAGE_PASS = 0.7;  // 环节通过线（与 KET 八课口径一致）
const STAGE_TAKE = 16;   // 每环节单次实际做题数
const GUARD_MINUTES = 120;

// 健康护栏：单日超 120 分钟温和劝停——只提醒，不锁功能、不倒计时、不施压
export function hallGuardHTML() {
  const mins = storage.getStudyTodayMinutes();
  if (mins <= GUARD_MINUTES) return '';
  return `
    <div class="card-cartoon mb-4 bg-blue-50 border-2 border-blue-200">
      <div class="font-bold text-sm mb-1">🌙 今天已经学了 ${mins} 分钟啦</div>
      <p class="text-xs text-gray-600">学习是长跑，休息也是训练的一部分。剩下的留给明天，效果反而更好。</p>
    </div>`;
}

const ZONE = {
  blocks: { badge: '🔴 会挡住意思', cls: 'border-red-300 bg-red-50' },
  tested: { badge: '🟡 不挡意思但 KET 考', cls: 'border-yellow-300 bg-yellow-50' },
  minor: { badge: '⚪ 不挡也基本不考', cls: 'border-gray-200 bg-gray-50' }
};
const STAGE_ICONS = ['🌱', '🎯', '⚔️', '🏆'];

// P2b：大厅 → 八课「考不考」回链标签。
// 只有在映射表里的课才挂标签；没映射的课保留原来的「KET 相关度 ★★」星级一行（读 index.json，不另加标签）。
// PET 级别不挂（备考中心那边没有对应的八课数据）。
function ketBackLinkHTML(hallId, exclude) {
  if (examLevel() === 'PET') return '';
  // 从八课跳来的那一课不重复挂标签——顶部已有「返回 KET 备考中心 LX」入口
  const kets = ketLessonsForHall(hallId).filter(k => k !== exclude);
  if (!kets.length) return '';
  return `
    <div class="flex flex-wrap gap-2 mb-3">
      ${kets.map(k => `
        <button data-ket="${k}" class="tap-bounce rounded-2xl border-2 border-amber-300 bg-amber-50 text-left px-3 py-2" style="min-height:48px">
          <span class="text-xs font-bold text-amber-700">🎯 KET 考点 · 对应备考中心 ${esc(ketLessonLabel(k))}</span>
          <span class="text-gray-400">›</span>
        </button>`).join('')}
    </div>`;
}

/**
 * @param {HTMLElement} app
 * @param {string} id 课号 G01-G50
 * @param {{fromKet?: string}} opts P2b：从 KET 八课「深挖」跳来时带上来路（L1-L8），用于显示返回入口
 */
export async function renderHallLesson(app, id, opts = {}) {
  app.innerHTML = skeletonHTML(6);
  const l = await loadGrammarLesson(id);
  if (!l) {
    app.innerHTML = `
      ${headerHtml('🏛️ 语法大厅')}
      <div class="card-cartoon empty-state"><span class="empty-emoji">😣</span><div class="empty-text">这一课加载失败</div><div class="empty-sub">检查网络后刷新重试</div></div>`;
    bindBack(app, 'grammar-hall');
    return;
  }
  // 进入即标记「学习中」（未掌握时）
  const prog = storage.getLessonProgress(HALL_LEVEL);
  if (!prog[l.id]) storage.markLessonDone(HALL_LEVEL, l.id, 'learning');
  lessonViews(app, l, opts).drawIntro();
}

// 一课的全部视图闭包：讲解页 / 环节选择 / 闯关 / 侦探关
function lessonViews(app, l, opts = {}) {
  const s = l.sections;

  function stageDrillKey(i) { return `hall-${l.id}-s${i + 1}`; }
  function stageBest(i) {
    const rec = storage.getDrillResults(HALL_LEVEL)[stageDrillKey(i)];
    return rec ? rec.best : null;
  }
  function stagePassed(i) {
    const st = l.practice.stages[i];
    const best = stageBest(i);
    return best !== null && st && best / Math.min(STAGE_TAKE, st.questions.length) >= STAGE_PASS;
  }

  // ============ 讲解页：九段 + 记忆卡 ============
  function drawIntro() {
    exitFocus(); // 讲解页不是答题态，恢复导航（从闯关/侦探关回来时）
    const stars = l.ketRelevance > 0
      ? `<span class="text-amber-700">${'★'.repeat(l.ketRelevance)}</span><span class="text-gray-300">${'★'.repeat(3 - l.ketRelevance)}</span>`
      : '不考';
    app.innerHTML = `
      ${headerHtml(`${l.id} · ${esc(l.title)}`)}
      ${hallGuardHTML()}
      ${opts.fromKet ? `
      <button id="backKetBtn" class="w-full card-cartoon tap-bounce flex items-center gap-2 text-left mb-3 bg-amber-50 border-2 border-amber-200" style="padding:10px 12px;min-height:48px">
        <span class="text-xl text-amber-700">‹</span>
        <span class="flex-1 text-sm font-bold" style="min-width:0">返回 KET 备考中心 ${esc(ketLessonLabel(opts.fromKet))}</span>
      </button>` : ''}
      ${opts.fromMistakes ? `
      <button id="backMistakesBtn" class="w-full card-cartoon tap-bounce flex items-center gap-2 text-left mb-3 bg-amber-50 border-2 border-amber-200" style="padding:10px 12px;min-height:48px">
        <span class="text-xl text-amber-700">‹</span>
        <span class="flex-1 text-sm font-bold" style="min-width:0">返回错题本 · 语法大厅分区</span>
      </button>` : ''}
      ${mistakeChipHTML()}
      <div class="text-xs text-gray-400 mb-3">${esc(l.tier)}层 · KET 相关度 ${stars}</div>
      ${ketBackLinkHTML(l.id, opts.fromKet)}

      <!-- ① 一句话本质 -->
      <div class="card-cartoon mb-3 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div class="font-bold text-sm mb-1">🎯 一句话本质</div>
        <p class="text-base text-gray-800 font-bold">${esc(s.essence)}</p>
      </div>

      <!-- ② 为什么英语要这样 -->
      <div class="card-cartoon mb-3">
        <div class="font-bold text-sm mb-1">🤔 为什么英语要这样</div>
        <p class="text-sm text-gray-700" style="line-height:1.85">${esc(s.why)}</p>
      </div>

      <!-- ③ 乐队比喻 -->
      <div class="card-cartoon mb-3 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
        <div class="font-bold text-sm mb-1">🎻 乐队里的故事</div>
        <p class="text-sm text-gray-700" style="line-height:1.85">${esc(s.metaphorStory)}</p>
      </div>

      <!-- ④ 规则卡 + 例句梯 -->
      <div class="card-cartoon mb-3" id="rulesCard">
        <div class="font-bold text-sm mb-2">🎵 规则卡</div>
        ${s.rules.cards.map((c, i) => `
          <div class="mb-3 pb-3 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
            <div class="font-bold text-sm text-primary-ink">${i + 1}. ${esc(c.rule)}</div>
            <p class="text-sm text-gray-700 mt-1">${esc(c.detail)}</p>
            ${c.example ? `<div class="text-xs font-en text-gray-500 mt-1 bg-gray-50 rounded-xl px-3 py-2">${esc(c.example)}</div>` : ''}
          </div>`).join('')}
      </div>
      ${ladderHTML('🌱 例句梯 · 基础', s.rules.ladder.basic, 'from-green-50 to-emerald-50 border-green-200')}
      ${ladderHTML('🎯 例句梯 · 进阶', s.rules.ladder.mid, 'from-cyan-50 to-blue-50 border-cyan-200')}
      ${ladderHTML('⚠️ 例句梯 · 易错（注意每句的坑）', s.rules.ladder.trap, 'from-amber-50 to-yellow-50 border-amber-300')}

      <!-- ⑤ 红黑榜 -->
      <div class="card-cartoon mb-3 border-2 border-red-200">
        <div class="font-bold text-sm mb-1">🚦 红黑榜 ❌→✅</div>
        <p class="text-xs text-gray-500 mb-2">三色分区：🔴 会挡住意思（最优先改）· 🟡 不挡但 KET 要考 · ⚪ 不挡也不考（先放一放）</p>
        ${s.redBlack.map(e => {
          const z = ZONE[e.zone] || ZONE.minor;
          return `
          <div class="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
            <div class="text-sm font-en">❌ <s class="text-red-600">${esc(e.bad)}</s></div>
            <div class="text-sm font-en">✅ <b class="text-green-700">${esc(e.good)}</b></div>
            <p class="text-xs text-gray-600 mt-1">${esc(e.why)}</p>
            <span class="inline-block rounded-full px-2 py-1 border text-cap mt-1 ${z.cls}">${z.badge}</span>
          </div>`;
        }).join('')}
      </div>

      <!-- ⑥ 中英对照差异表 -->
      <div class="card-cartoon mb-3">
        <div class="font-bold text-sm mb-2">🔀 中英差异对照</div>
        ${s.contrast.map(r => `
          <div class="mb-3 pb-3 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0 text-sm">
            <div><span class="text-cap text-gray-400" style="min-width:52px;display:inline-block">中文</span>${esc(r.cn)}</div>
            <div class="font-en"><span class="text-cap text-gray-400 font-sans" style="min-width:52px;display:inline-block">英语</span>${esc(r.en)}</div>
            <div class="text-xs text-primary-ink mt-1"><span class="text-cap text-gray-400" style="min-width:52px;display:inline-block">差在哪</span>${esc(r.diff)}</div>
          </div>`).join('')}
      </div>

      <!-- ⑦ 5 秒判断法 -->
      <div class="card-cartoon mb-3 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
        <div class="font-bold text-sm mb-1">⚡ 5 秒判断法（考场直接用）</div>
        <p class="text-sm font-bold text-gray-800 mb-2">「${esc(s.quickJudge.mnemonic)}」</p>
        <ol class="space-y-1">
          ${s.quickJudge.steps.map((st, i) => `<li class="text-sm text-gray-700 flex gap-2"><span class="font-black text-cyan-700" style="min-width:20px">${i + 1}</span><span class="flex-1 wrap-any">${esc(st)}</span></li>`).join('')}
        </ol>
      </div>

      <!-- 记忆卡（可截图） -->
      <div class="card-cartoon mb-3">
        <div class="font-bold text-sm mb-2">🖼 记忆卡</div>
        <div class="memory-card-wrap" role="img" aria-label="${esc(l.memoryCard.alt || l.title + ' 记忆卡')}"><div class="memory-card-inner">${l.memoryCard.svg}</div></div>
        <p class="text-cap text-gray-400 mt-2 text-center"><span class="memory-card-hint hidden">👈 卡片可以左右滑动看全图 · </span>📸 截图存进相册，考前翻一翻</p>
      </div>

      <!-- ⑧ 家长话术 -->
      <div class="card-cartoon mb-3 bg-amber-50 border-2 border-amber-200">
        <div class="font-bold text-sm mb-1">👪 家长话术（不懂英语也能带孩子玩）</div>
        <p class="text-sm text-gray-700" style="line-height:1.85">${esc(s.parentScript.script)}</p>
        <div class="font-bold text-xs mt-2 mb-1">今晚可以这样问：</div>
        ${s.parentScript.questions.map((q, i) => `<p class="text-sm text-gray-700 mb-1">${i + 1}. ${esc(q)}</p>`).join('')}
      </div>

      <!-- ⑨ 暗线回响 -->
      <div class="card-cartoon mb-4 border-2 border-purple-300 bg-purple-50">
        <div class="font-bold text-sm mb-1">🧵 暗线回响</div>
        <p class="text-sm text-gray-700" style="line-height:1.85">${esc(s.echo)}</p>
      </div>

      <button id="detectiveBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-3" style="min-height:48px">🕵️ 侦探关（${l.detective.length} 个病句等你来治）</button>
      <button id="toStagesBtn" class="w-full btn-cartoon" style="min-height:48px">✏️ 四环节闯关（4 × 16 题）</button>
    `;
    bindBack(app, 'grammar-hall');
    const mcWrap = app.querySelector('.memory-card-wrap');
    if (mcWrap && mcWrap.scrollWidth > mcWrap.clientWidth + 4) {
      const hint = app.querySelector('.memory-card-hint');
      if (hint) hint.classList.remove('hidden');
    }
    app.querySelector('#toStagesBtn').addEventListener('click', drawStageSelect);
    app.querySelector('#detectiveBtn').addEventListener('click', () => drawDetective());
    const backKet = app.querySelector('#backKetBtn');
    if (backKet) backKet.addEventListener('click', () => window.__nav('exam-grammar', { lesson: opts.fromKet }));
    // B4：错题本来路返回 + 反向入口 + 定位到规则段（只在首次进入滚动，环节返回不再跳）
    const backMis = app.querySelector('#backMistakesBtn');
    if (backMis) backMis.addEventListener('click', () => window.__nav('mistakes', { src: 'hall' }));
    const misChip = app.querySelector('#lessonMistakesBtn');
    if (misChip) misChip.addEventListener('click', () => window.__nav('mistakes', { src: 'hall', lesson: l.id }));
    if (opts.scrollTo === 'rules') {
      opts.scrollTo = null;
      const rc = app.querySelector('#rulesCard');
      if (rc) setTimeout(() => rc.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
    app.querySelectorAll('[data-ket]').forEach(b => b.addEventListener('click', () =>
      window.__nav('exam-grammar', { lesson: b.dataset.ket })));
  }

  // B4 反向入口：本课在错题本里有几条（闯关+侦探关）
  function mistakeChipHTML() {
    const n = Object.values(storage.getQuizMistakes()).filter(e => e.src === 'hall' && e.lesson === l.id).length;
    if (!n) return '';
    return `
      <button id="lessonMistakesBtn" class="w-full card-cartoon tap-bounce flex items-center gap-2 text-left mb-3 bg-red-50 border-2 border-red-200" style="padding:10px 12px;min-height:48px">
        <span class="text-xl">📝</span>
        <span class="flex-1 text-sm font-bold" style="min-width:0">本课你有 ${n} 道错题</span>
        <span class="text-xl text-gray-300">›</span>
      </button>`;
  }

  function ladderHTML(title, list, tone) {
    return `
      <div class="card-cartoon mb-3 bg-gradient-to-br ${tone} border-2">
        <div class="font-bold text-sm mb-2">${title}</div>
        ${list.map(x => `
          <div class="mb-2 pb-2 border-b border-white last:border-0 last:mb-0 last:pb-0">
            <div class="font-en text-sm font-bold">${esc(x.en)}</div>
            <div class="text-xs text-gray-600">${esc(x.cn)}</div>
            ${x.note ? `<div class="text-xs text-amber-700 mt-1">💡 ${esc(x.note)}</div>` : ''}
          </div>`).join('')}
      </div>`;
  }

  // ============ 环节选择 ============
  function drawStageSelect() {
    exitFocus(); // 环节列表不是答题态
    const passedAll = l.practice.stages.every((_, i) => stagePassed(i));
    app.innerHTML = `
      ${headerHtml(`${l.id} · 四环节闯关`)}
      ${hallGuardHTML()}
      <p class="text-xs text-gray-500 mb-3">每环节 16 题，答对 70% 通过并解锁下一环节。重做会换题目、换顺序，背答案没用哦。</p>
      <div class="space-y-2 mb-4">
        ${l.practice.stages.map((st, i) => {
          const best = stageBest(i);
          const passed = stagePassed(i);
          const locked = i > 0 && !stagePassed(i - 1);
          const stars = '★'.repeat(i + 1) + '<span class="text-gray-300">' + '★'.repeat(3 - i) + '</span>';
          return `
          <button data-stage="${i}" ${locked ? 'data-locked="1"' : ''} class="w-full card-cartoon tap-bounce text-left ${locked ? 'opacity-50' : ''} ${passed ? 'border-2 border-green-300 bg-green-50' : ''}" style="padding:14px;min-height:48px">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${locked ? '🔒' : passed ? '✅' : STAGE_ICONS[i] || '📝'}</span>
              <div class="flex-1">
                <div class="font-bold text-sm">环节 ${i + 1} · ${esc(st.name)} <span class="text-amber-700">${stars}</span></div>
                <div class="text-xs text-gray-500">${best !== null ? `最好成绩 ${best}/${Math.min(STAGE_TAKE, st.questions.length)}${passed ? ' · 已通过' : ''}` : locked ? '通过上一环节才能解锁' : `${Math.min(STAGE_TAKE, st.questions.length)} 题 · 未挑战`}</div>
              </div>
              <span class="text-xl text-gray-300">›</span>
            </div>
          </button>`;
        }).join('')}
      </div>
      ${passedAll ? '<div class="card-cartoon mb-3 bg-green-50 border-2 border-green-300 text-center"><p class="text-sm font-bold">🎉 四个环节全部通过，这课真的掌握了！</p></div>' : ''}
      <button id="backIntroBtn" class="w-full btn-cartoon btn-cartoon-secondary" style="min-height:48px">📖 回看讲解</button>
    `;
    // ‹ 只走 onclick 单一路径：叠加 bindBack 会双绑定竞态、异步跳回大厅列表（B2 修复）
    app.querySelector('#examBackBtn').onclick = drawIntro;
    app.querySelector('#backIntroBtn').addEventListener('click', drawIntro);
    app.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.locked) { toast('先通过上一环节（答对 70%）再来挑战这关！'); return; }
      runQuiz(Number(b.dataset.stage), null, false);
    }));
  }

  // ============ 闯关引擎（choice 题型，接 shuffle.js 四层随机）============
  function runQuiz(stageIdx, retryQuestions, isRetry) {
    const st = l.practice.stages[stageIdx];
    const scope = `${HALL_LEVEL}:${l.id}:s${stageIdx + 1}`;
    let questions;
    if (isRetry) {
      questions = shuffle(retryQuestions).map(q => presentQuestion(scope, q));
    } else {
      const picked = pickQuiz(scope, st.questions, STAGE_TAKE, storage.getQuizStats());
      questions = picked.questions.map(q => presentQuestion(scope, q));
      if (picked.focusedWrong) toast('🎯 这一轮多放了几道你之前做错的题');
    }
    let idx = 0, correctN = 0, answered = false;
    const wrongList = [];

    function draw() {
      if (idx >= questions.length) return drawQuizResult();
      const q = questions[idx];
      answered = false;
      app.innerHTML = `
        ${headerHtml(`${isRetry ? '错题重练' : `环节 ${stageIdx + 1} · ${esc(st.name)}`} ${idx + 1}/${questions.length}`)}
        <div class="progress-bar mb-4"><div class="progress-bar-fill" style="width:${idx / questions.length * 100}%"></div></div>
        <div class="card-cartoon mb-4">
          <div class="text-xs text-gray-400 mb-2">选一选 · 难度 <span class="text-amber-700">${'★'.repeat(q.level || stageIdx + 1)}</span></div>
          <div class="text-base font-bold mb-3">${esc(q.q)}</div>
          <div class="space-y-2">
            ${q.options.map((o, oi) => `<button data-oi="${oi}" class="opt-btn w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-left font-en tap-bounce" style="min-height:48px">${esc(o)}</button>`).join('')}
          </div>
        </div>
        <div id="feedback"></div>
      `;
      // 答题态：隐藏导航，‹/Esc 先确认再回环节列表。
      // 不再 bindBack——它的 addEventListener 会绕过确认直接跳走（双绑定竞争）。
      enterFocus({ remain: () => questions.length - idx, leave: drawStageSelect });
      app.querySelector('#examBackBtn').onclick = () => requestLeaveFocus(drawStageSelect);

      app.querySelectorAll('[data-oi]').forEach(b => b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        b.classList.add('ring-2', 'ring-primary');
        const ok = Number(b.dataset.oi) === q.answer;
        storage.recordQuizAnswer(q.__qk, ok); // 题目级统计：下次抽题时错题优先（答对会自动从错题本毕业）
        if (ok) correctN++; else wrongList.push(q);
        if (ok) storage.progressDailyTask('grammar3', 1); // 首页任务：大厅闯关也算语法题（B2 模式适配）
        // B4：错题落盘（题面摘要+课号+环节，字段口径供 B6 AI 复用）
        if (!ok) storage.recordQuizMistake(q.__qk, {
          src: 'hall', kind: 'choice', lesson: l.id, lessonTitle: l.title || '', stage: stageIdx + 1,
          q: q.q, options: q.options, picked: q.options[Number(b.dataset.oi)],
          correct: q.options[q.answer], explain: q.explain || ''
        });
        const fb = app.querySelector('#feedback');
        fb.innerHTML = `
          <div class="card-cartoon ${ok ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'} mb-3">
            <div class="font-bold text-sm mb-1">${ok ? '✅ 对啦！' : '❌ 再看看'}</div>
            ${ok ? '' : `<div class="text-sm font-en mb-1">正确答案：<b>${esc(q.options[q.answer])}</b></div>`}
            <div class="text-xs text-gray-600">${esc(q.explain || '')}</div>
          </div>
          <button id="nextBtn" class="w-full btn-cartoon" style="min-height:48px">${idx + 1 >= questions.length ? '看结果' : '下一题 ›'}</button>`;
        fb.querySelector('#nextBtn').addEventListener('click', () => { idx++; draw(); });
        fb.querySelector('#nextBtn').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }));
    }

    function drawQuizResult() {
      exitFocus(); // 已出结果，不再是进行中
      const total = questions.length;
      const pass = correctN / total >= STAGE_PASS;
      let msg = '';
      if (!isRetry) {
        storage.saveDrillResult(HALL_LEVEL, stageDrillKey(stageIdx), correctN);
        if (pass) {
          if (stageIdx < l.practice.stages.length - 1) msg = `环节 ${stageIdx + 2} · ${l.practice.stages[stageIdx + 1].name} 已解锁！`;
          if (l.practice.stages.every((_, i) => stagePassed(i))) {
            storage.markLessonDone(HALL_LEVEL, l.id, 'done');
            msg = '四个环节全部通过，这课真的掌握了！';
          }
        }
      }
      app.innerHTML = `
        ${headerHtml(`${isRetry ? '错题重练' : `环节 ${stageIdx + 1}`} · 结果`)}
        <div class="card-cartoon text-center mb-4 ${pass ? 'bg-green-50' : 'bg-yellow-50'}">
          <div class="text-6xl mb-2">${pass ? '🎉' : '💪'}</div>
          <div class="text-2xl font-black">${correctN} / ${total}</div>
          <p class="text-sm text-gray-600 mt-2">${pass ? (msg || '通过！记得今天把它「用出来」——说一句、写一句，用出来才算真的会。') : '差一点点，看看错题讲解，重练一遍就能过。'}</p>
        </div>
        ${wrongList.length ? `<button id="retryWrongBtn" class="w-full btn-cartoon mb-3" style="min-height:48px">🔁 错题重练（${wrongList.length} 题）</button>` : ''}
        <button id="againBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-3" style="min-height:48px">🎲 换一批重做（题目会变）</button>
        <button id="stagesBtn" class="w-full btn-cartoon" style="min-height:48px">回环节列表</button>
      `;
      // ‹ 只走 onclick 单一路径（同 drawStageSelect，防双绑定竞态）
      app.querySelector('#examBackBtn').onclick = drawStageSelect;
      const rw = app.querySelector('#retryWrongBtn');
      if (rw) rw.addEventListener('click', () => runQuiz(stageIdx, wrongList.slice(), true));
      app.querySelector('#againBtn').addEventListener('click', () => runQuiz(stageIdx, null, false));
      app.querySelector('#stagesBtn').addEventListener('click', drawStageSelect);
    }

    draw();
  }

  // ============ 侦探关：找病句并改正 ============
  function drawDetective() {
    const cases = shuffle(l.detective);
    let idx = 0, solved = 0;

    function norm(x) {
      return String(x).trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').replace(/[.!?。！？]+$/, '');
    }

    function draw() {
      if (idx >= cases.length) return drawResult();
      const c = cases[idx];
      app.innerHTML = `
        ${headerHtml(`🕵️ 侦探关 ${idx + 1}/${cases.length}`)}
        <div class="progress-bar mb-4"><div class="progress-bar-fill" style="width:${idx / cases.length * 100}%"></div></div>
        <div class="card-cartoon mb-4">
          <div class="text-xs text-gray-500 mb-2">这句话生病了——找出病灶，写出健康的整句：</div>
          <div class="text-base font-bold font-en mb-3">🤒 ${esc(c.sentence)}</div>
          <input id="fixInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" placeholder="写出改正后的整句" autocomplete="off" autocapitalize="off" />
          <button id="submitBtn" class="w-full btn-cartoon mt-3" style="min-height:48px">提交诊断</button>
        </div>
        <div id="feedback"></div>
      `;
      // 答题态：‹/Esc 先确认再回讲解（不 bindBack，避免绕过确认）
      enterFocus({ remain: () => cases.length - idx, leave: drawIntro });
      app.querySelector('#examBackBtn').onclick = () => requestLeaveFocus(drawIntro);

      let answered = false;
      function next(label) {
        return `<button id="nextBtn" class="w-full btn-cartoon" style="min-height:48px">${label}</button>`;
      }
      function bindNext(fb) {
        fb.querySelector('#nextBtn').addEventListener('click', () => { idx++; draw(); });
        fb.querySelector('#nextBtn').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      function submit() {
        if (answered) return;
        const user = app.querySelector('#fixInput').value;
        if (!user.trim()) { toast('先写一写再提交哦'); return; }
        answered = true;
        const fb = app.querySelector('#feedback');
        const nextLabel = idx + 1 >= cases.length ? '看结案报告' : '下一个病人 ›';
        // B4：侦探关落盘用的稳定指纹（病句+参考答案哈希，与 QUIZ_STATS 同一套 key 风格）
        const detKey = questionKey(`det:${l.id}`, { q: c.sentence, answer: c.fixed });
        if (norm(user) === norm(c.fixed)) {
          solved++;
          storage.removeQuizMistake(detKey); // 这次改对了 → 毕业
          fb.innerHTML = `
            <div class="card-cartoon bg-green-50 border-2 border-green-300 mb-3">
              <div class="font-bold text-sm mb-1">✅ 破案！病人痊愈</div>
              <div class="text-xs text-gray-600">🔎 病在哪：${esc(c.clue)}</div>
            </div>${next(nextLabel)}`;
          bindNext(fb);
        } else {
          // 与参考答案不一致：亮出参考 + 病因，让学生自评病灶是否改对（改法可以不止一种）
          fb.innerHTML = `
            <div class="card-cartoon bg-amber-50 border-2 border-amber-300 mb-3">
              <div class="font-bold text-sm mb-1">🔎 和参考答案对一对</div>
              <div class="text-sm font-en mb-1">参考答案：<b class="text-green-700">${esc(c.fixed)}</b></div>
              <div class="text-xs text-gray-600 mb-2">病在哪：${esc(c.clue)}</div>
              <div class="text-xs text-gray-500">你的改法和参考不一样。只要病灶改对了（写法不同没关系），也算破案。</div>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button id="selfOk" class="btn-cartoon" style="min-height:48px">✅ 病灶改对了</button>
              <button id="selfNo" class="btn-cartoon btn-cartoon-secondary" style="min-height:48px">😅 还没改对</button>
            </div>
            <div id="afterSelf"></div>`;
          fb.querySelector('#selfOk').addEventListener('click', () => { solved++; storage.removeQuizMistake(detKey); goNext(fb); });
          fb.querySelector('#selfNo').addEventListener('click', () => {
            // B4：自评没改对 → 病句进错题本（病句+她的改法+参考+病在哪）
            storage.recordQuizMistake(detKey, {
              src: 'hall', kind: 'detective', lesson: l.id, lessonTitle: l.title || '', stage: null,
              q: c.sentence, options: null, picked: user, correct: c.fixed, explain: c.clue || ''
            });
            goNext(fb);
          });
          function goNext(fbEl) {
            fbEl.innerHTML = next(nextLabel);
            bindNext(fbEl);
          }
        }
      }
      app.querySelector('#submitBtn').addEventListener('click', submit);
      app.querySelector('#fixInput').addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    }

    function drawResult() {
      exitFocus(); // 结案报告不是进行中
      const all = solved === cases.length;
      app.innerHTML = `
        ${headerHtml('🕵️ 侦探关 · 结案报告')}
        <div class="card-cartoon text-center mb-4 ${all ? 'bg-green-50' : 'bg-yellow-50'}">
          <div class="text-6xl mb-2">${all ? '🏆' : '🕵️'}</div>
          <div class="text-2xl font-black">${solved} / ${cases.length} 个病人痊愈</div>
          <p class="text-sm text-gray-600 mt-2">${all ? '名侦探！每个病灶都逃不过你的眼睛。' : '还没治好的病人，回讲解翻翻红黑榜找找病因，再来一轮。'}</p>
        </div>
        <button id="againBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-3" style="min-height:48px">🔁 再查一轮（顺序会变）</button>
        <button id="introBtn" class="w-full btn-cartoon" style="min-height:48px">回讲解</button>
      `;
      // ‹ 只走 onclick 单一路径（同 drawStageSelect，防双绑定竞态）
      app.querySelector('#examBackBtn').onclick = drawIntro;
      app.querySelector('#againBtn').addEventListener('click', () => drawDetective());
      app.querySelector('#introBtn').addEventListener('click', drawIntro);
    }

    draw();
  }

  return { drawIntro };
}
