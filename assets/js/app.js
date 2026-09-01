// app.js - 主应用入口、路由
import * as storage from './storage.js';
import { checkBadges, getCurrentRank, getRankProgress, BADGES } from './gamification.js';
import { speak, playSound } from './speech.js';
import { renderWordsPage } from './modules/words.js';
import { renderLevelMap } from './modules/levels.js';
import { renderReinforce } from './modules/reinforce.js';
import { renderGrammarPage } from './modules/grammar.js';
import { renderReadingPage } from './modules/reading.js';
import { renderWritingPage } from './modules/writing.js';
import { renderPetTopicMap, collectPetWordsById } from './modules/pet.js';
import { trackPage } from './study-time.js'; // V0.7 学习时长计时（前台停留，路由打点）
import { loadData } from './utils/lazy-data.js'; // V0.9 分片懒加载器（loadJSON 的底座）
// V0.4 剑桥备考中心：模块按需动态 import（减小首屏体积），路由见 navigate()

// 全局状态
const state = {
  page: 'home'
  // 数据缓存已上移到 utils/lazy-data.js（V0.9 P0）
};

// === 工具：toast 提示 ===
export function toast(text, type = 'info') {
  const root = document.getElementById('toastRoot');
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warn: 'bg-orange-500',
    error: 'bg-red-500'
  };
  const div = document.createElement('div');
  div.className = `${colors[type] || colors.info} text-white px-5 py-2 rounded-full shadow-lg pointer-events-auto fade-in font-semibold text-sm`;
  div.textContent = text;
  root.appendChild(div);
  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s';
    setTimeout(() => div.remove(), 300);
  }, 1800);
}

// === 工具：modal ===
// 点遮罩不关闭：孩子看内容时误触屏幕会把弹窗关掉、被迫重新点开（V0.9.32 起仅手动关闭 + Esc）。
// 因此每个调用方必须自带可见的关闭入口（× / 取消 / 知道了）；
// closeOnEsc: false 供「必须做出选择」的弹窗使用（如首次启动选年级）。
let onModalEsc = null;
export function showModal(html, options = {}) {
  const root = document.getElementById('modalRoot');
  const closeOnEsc = options.closeOnEsc !== false;

  root.innerHTML = `
    <div class="modal-backdrop fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 fade-in">
      <div class="modal-content bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto bounce-in">
        ${html}
      </div>
    </div>
  `;

  if (onModalEsc) document.removeEventListener('keydown', onModalEsc);
  onModalEsc = closeOnEsc ? (e => { if (e.key === 'Escape') closeModal(); }) : null;
  if (onModalEsc) document.addEventListener('keydown', onModalEsc);
  return root.querySelector('.modal-backdrop');
}

export function closeModal() {
  document.getElementById('modalRoot').innerHTML = '';
  if (onModalEsc) {
    document.removeEventListener('keydown', onModalEsc);
    onModalEsc = null;
  }
}

// === 答题态（V0.9.33 防误触退出）===
// 进行中（闯练/模考/闯关/写作等）隐藏底部导航 + 年级切换（隐藏而非禁用），
// 左上 ‹ 返回是唯一出口；confirm 页面（#1-13）离开前弹确认，★ 级轻场景只隐藏不拦。
// cleanup 在任何离开路径（确认离开 / navigate 兜底）都会执行，用来清倒计时等，
// 防止孤儿计时器在跳走后继续跑、把别的页面 DOM 覆盖掉。
let focusState = null;

export function enterFocus(opts = {}) {
  focusState = {
    remain: opts.remain || null,        // () => 剩余题数；null 用通用文案（如写作）
    leave: opts.leave || null,          // Esc/确认「离开」后执行的真正退出动作
    cleanup: opts.cleanup || null,
    confirm: opts.confirm !== false,
    note: opts.note || '',
    stayLabel: opts.stayLabel || '继续做题'
  };
  const nav = document.getElementById('bottomNav');
  if (nav) nav.style.display = 'none';
  const gb = document.getElementById('gradeBtn');
  if (gb) gb.style.display = 'none';
  document.body.classList.remove('has-bottom-nav');
}

export function exitFocus() {
  if (!focusState) return;
  const fs = focusState;
  focusState = null;
  if (fs.cleanup) {
    try { fs.cleanup(); } catch (e) { console.error('答题态 cleanup 失败:', e); }
  }
  const nav = document.getElementById('bottomNav');
  if (nav) nav.style.display = '';
  const gb = document.getElementById('gradeBtn');
  if (gb) gb.style.display = '';
  document.body.classList.add('has-bottom-nav');
}

// 请求离开答题态：confirm 页面先弹确认，其余直接走。
// fallback：不在答题态时的兜底动作（如结算页的 ✕ 直接退出）。
export function requestLeaveFocus(fallback) {
  if (!focusState) { if (typeof fallback === 'function') fallback(); return; }
  const fs = focusState;
  const doLeave = () => { exitFocus(); if (fs.leave) fs.leave(); else if (typeof fallback === 'function') fallback(); };
  if (!fs.confirm) { doLeave(); return; }
  const n = fs.remain ? fs.remain() : null;
  showModal(`
    <div class="p-6">
      <div class="text-5xl text-center mb-3">🐾</div>
      <h3 class="font-bold text-center mb-2">${n != null && n > 0 ? `还有 ${n} 题没做完，确定要离开吗？` : '确定要离开吗？'}</h3>
      <p class="text-sm text-gray-600 text-center mb-5">${fs.note || '随时可以再回来。'}</p>
      <div class="flex gap-3">
        <button id="focusStayBtn" class="flex-1 btn-cartoon">${fs.stayLabel}</button>
        <button id="focusLeaveBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">离开</button>
      </div>
    </div>
  `);
  document.getElementById('focusStayBtn').addEventListener('click', closeModal);
  document.getElementById('focusLeaveBtn').addEventListener('click', () => { closeModal(); doLeave(); });
}

// === 工具：加载 JSON ===
// V0.9 P0：统一走 utils/lazy-data.js（带并发合并 + 失败重试 1 次 + 内存缓存），
// 这里只保留「失败弹 toast」这一层适配，现有模块的调用方式与返回值完全不变。
export async function loadJSON(path) {
  const data = await loadData(path);
  if (data === null) toast('数据加载失败', 'error');
  return data;
}

// === 顶部导航更新 ===
function updateTopNav() {
  const profile = storage.getProfile();
  const coins = storage.getCoins();

  document.getElementById('gradeLabel').textContent = gradeLabel(profile.grade);
  document.getElementById('coinDisplay').textContent = coins;
  document.getElementById('daysDisplay').textContent = totalStudyDays();
}

// 累计学习天数（history 只增不清零）——替代连续 streak，漏一天不惩罚
function totalStudyDays() {
  return (storage.getStreak().history || []).length;
}

function gradeLabel(g) {
  if (g === 'PET') return 'PET 备考';
  if (g === 'KET') return 'KET 备考';
  const map = { 1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级', 7: '七年级', 8: '八年级', 9: '九年级' };
  return map[g] || `${g}年级`;
}

// === 路由 ===
async function navigate(page, params = {}) {
  // 答题态兜底：任何路由切换都恢复导航并执行 cleanup（防孤儿计时器覆盖新页面）
  exitFocus();
  state.page = page;
  state.params = params;
  // 更新底部导航激活态
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.dataset.page === page) {
      b.classList.add('text-primary-ink');
      b.classList.remove('text-gray-400');
    } else {
      b.classList.remove('text-primary-ink');
      b.classList.add('text-gray-400');
    }
  });

  const app = document.getElementById('app');
  app.className = 'max-w-3xl mx-auto px-4 py-4 fade-in';

  // V0.4：KET 级别时，学习/语法/阅读/写作入口统一映射到备考中心对应模块
  const profile = storage.getProfile();
  if (profile.grade === 'KET') {
    const map = { learn: 'exam-hub', grammar: 'exam-grammar', reading: 'exam-reading', writing: 'exam-writing' };
    if (map[page]) page = map[page];
  } else if (profile.grade === 'PET' && page === 'learn') {
    // PET：学习页进备考中心（轻量版）；词库闯关/阅读等原有入口不变
    page = 'exam-hub';
  }

  // V0.7：学习时长打点（按最终页面归类到大模块；非学习页自动暂停计时）
  trackPage(page, profile.grade);

  // 备考中心模块：动态加载 exam 目录下的模块
  if (page.startsWith('exam-')) {
    state.page = page;
    try {
      const mod = await examModule(page);
      await mod(app, params);
    } catch (e) {
      console.error('备考模块加载失败:', page, e);
      app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">😣</span><div class="empty-text">模块加载失败</div><div class="empty-sub">请刷新重试</div></div>';
    }
    updateTopNav();
    return;
  }

  switch (page) {
    case 'home':       await renderHome(app); break;
    case 'learn':      renderLearn(app); break;
    case 'mistakes':   await renderMistakes(app); break;
    case 'me':         renderMe(app); break;
    case 'words':      await renderWordsPage(app, params); break;
    case 'levels':     await renderLevelMap(app); break;
    case 'reinforce':  await renderReinforce(app); break;
    case 'grammar':    await renderGrammarPage(app, params); break;
    case 'reading':    await renderReadingPage(app, params); break;
    case 'writing':    await renderWritingPage(app, params); break;
    case 'petlevels':  await renderPetTopicMap(app, params.topic); break;
    case 'grammar-hall': await (await import('./modules/grammar-hall/hall.js')).renderGrammarHall(app, params); break;
    case 'timestats':  (await import('./modules/study-stats.js')).renderStudyStats(app); break;
    default:           await renderHome(app);
  }

  updateTopNav();
}

// 暴露给其他模块
window.__nav = navigate;

// V0.4：备考中心路由表（页面名 → 动态 import 后的渲染函数）
async function examModule(page) {
  switch (page) {
    case 'exam-hub':       return (await import('./modules/exam/exam-hub.js')).renderExamHub;
    case 'exam-plan':      return (await import('./modules/exam/plan.js')).renderPlan;
    case 'exam-knowledge': return (await import('./modules/exam/knowledge.js')).renderKnowledge;
    case 'exam-grammar':   return (await import('./modules/exam/grammar-course.js')).renderGrammarCourse;
    case 'exam-reading':   return (await import('./modules/exam/reading-drill.js')).renderReadingDrill;
    case 'exam-writing':   return (await import('./modules/exam/writing-lab.js')).renderWritingLab;
    case 'exam-mock':      return (await import('./modules/exam/mock-exam.js')).renderMockExam;
    case 'exam-checkin':   return (await import('./modules/exam/checkin.js')).renderCheckin;
    case 'exam-resources': return (await import('./modules/exam/resources.js')).renderResources;
    case 'exam-report':    return (await import('./modules/exam/report.js')).renderReport;
    default: throw new Error('未知备考模块: ' + page);
  }
}

// === 首页 ===
// B3-1：首页四张入口卡按模式如实标注去向（KET 的语法/阅读/写作会被 navigate 改道到备考模块）
function homeCardsHtml(grade) {
  const mode = grade === 'KET' ? 'KET' : grade === 'PET' ? 'PET' : 'NUM';
  const cards = {
    NUM: [
      ['goto-words', '🚀', '单词大冒险', '玩游戏背单词', 'from-orange-100 to-orange-50'],
      ['goto-grammar', '🎓', '语法学院', '边学边练', 'from-cyan-100 to-cyan-50'],
      ['goto-reading', '📖', '阅读乐园', '点词查义、跟读评分', 'from-green-100 to-green-50'],
      ['goto-writing', '✍️', '写作工坊', '智能批改', 'from-pink-100 to-pink-50']
    ],
    KET: [
      ['goto-words', '🗝️', 'KET 单词闯关', '20 话题 · 识词 + 闯关', 'from-orange-100 to-orange-50'],
      ['goto-grammar', '🎼', 'KET 语法八课', '考前最短路径 L1-L8', 'from-cyan-100 to-cyan-50'],
      ['goto-reading', '📖', 'KET 阅读听力', 'Part 1-5 专项 + 听力', 'from-green-100 to-green-50'],
      ['goto-writing', '✍️', 'KET 写作实验室', 'Part 6-7 任务', 'from-pink-100 to-pink-50']
    ],
    PET: [
      ['goto-words', '🎓', 'PET 单词闯关', '22 话题 · 识词 + 闯关', 'from-orange-100 to-orange-50'],
      ['goto-grammar', '🎓', '语法学院', 'PET 暂用初中语法打底', 'from-cyan-100 to-cyan-50'],
      ['goto-reading', '📰', 'PET 阅读', 'B1 文章 · 点词查义', 'from-green-100 to-green-50'],
      ['goto-writing', '✍️', '写作工坊', '话题写作 + 批改', 'from-pink-100 to-pink-50']
    ]
  };
  return cards[mode].map(([action, icon, title, sub, bg]) => `
      <button data-action="${action}" class="card-cartoon tap-bounce text-left bg-gradient-to-br ${bg}">
        <div class="text-4xl">${icon}</div>
        <div class="font-bold mt-2">${title}</div>
        <div class="text-xs text-gray-500 mt-1">${sub}</div>
      </button>`).join('');
}

async function renderHome(app) {
  const profile = storage.getProfile();
  const pet = storage.getPet();
  const rank = getCurrentRank();
  const rankProg = getRankProgress();
  const tasksData = storage.getDailyTasks();
  const learned = Object.keys(storage.getLearnedWords()).length;

  const petStages = ['🥚', '🐣', '🐤', '🦊', '🦁'];
  const petEmoji = petStages[Math.min(pet.level - 1, 4)];

  app.innerHTML = `
    <!-- 宠物展示 -->
    <div class="card-cartoon mb-4 text-center bg-gradient-to-br from-orange-50 to-yellow-50">
      <div class="text-7xl float">${petEmoji}</div>
      <div class="font-bold mt-1">${pet.name} <span class="text-xs text-gray-500">Lv.${pet.level}</span></div>
      <div class="flex justify-center gap-3 mt-2 text-xs">
        <span>🍖 ${pet.hunger}</span>
        <span>😊 ${pet.mood}</span>
        <span>⭐ ${pet.exp}</span>
      </div>
      <div class="mt-3 px-4">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="rank-badge ${rank.cls}">${rank.icon} ${rank.name}</span>
          <span class="text-gray-500">${rankProg.current} ${rankProg.next === '满级' ? '' : '/ ' + rankProg.next}</span>
        </div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width: ${rankProg.percent}%"></div></div>
      </div>
    </div>

    <!-- 今日建议（护栏：可选目标不催促——无完成度计数、无金币预告，未完成不施加视觉压力） -->
    <div class="card-cartoon mb-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold flex items-center gap-1"><span>🧭</span> 今天可以做的事</h3>
        <span class="text-cap text-gray-400">选着做就好</span>
      </div>
      ${tasksData.tasks.map(t => `
        <div class="flex items-center justify-between py-2">
          <div class="text-sm font-medium ${t.done ? 'text-gray-400' : ''}">${t.title}</div>
          ${t.done
            ? '<span class="text-xs text-green-700">✓ 做到啦</span>'
            : (t.current > 0 ? `<span class="text-xs text-gray-400">已做 ${t.current}</span>` : '')}
        </div>
      `).join('')}
    </div>

    <!-- 5 个学习入口（语法大厅为顶层入口，不依赖年级/KET 模式，见护栏修复-1）
         B3-1：KET/PET 下 navigate 会改道（app.js V0.4 映射），卡片文案必须如实标注实际去向——
         不允许「入口叫语法学院、落地是八课」的静默改道。文案随模式动态生成。 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      ${homeCardsHtml(profile.grade)}
      <button data-action="goto-grammar-hall" class="card-cartoon tap-bounce text-left bg-gradient-to-br from-sky-100 to-sky-50 col-span-2 md:col-span-4 flex items-center gap-3">
        <div class="text-4xl">🏛️</div>
        <div class="flex-1">
          <div class="font-bold">语法大厅</div>
          <div class="text-xs text-gray-500 mt-1">1-9 年级全景 50 课 (G01-G50) · 英语句子 = 一支乐队</div>
        </div>
        <div class="text-2xl text-gray-300">›</div>
      </button>
    </div>

    <!-- 数据概览 -->
    <div class="card-cartoon">
      <h3 class="font-bold mb-2">📊 学习统计</h3>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <div class="text-2xl font-bold text-primary-ink">${learned}</div>
          <div class="text-xs text-gray-500">已学单词</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-secondary-ink">${totalStudyDays()}</div>
          <div class="text-xs text-gray-500">累计学习天数</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-orange-700">${storage.getBadges().length}</div>
          <div class="text-xs text-gray-500">勋章</div>
        </div>
      </div>
    </div>
  `;

  // 绑定首页跳转
  app.querySelector('[data-action="goto-words"]').addEventListener('click', () => navigate('words'));
  app.querySelector('[data-action="goto-grammar"]').addEventListener('click', () => navigate('grammar'));
  app.querySelector('[data-action="goto-reading"]').addEventListener('click', () => navigate('reading'));
  app.querySelector('[data-action="goto-writing"]').addEventListener('click', () => navigate('writing'));
  app.querySelector('[data-action="goto-grammar-hall"]').addEventListener('click', () => navigate('grammar-hall'));
}

// === 学习页 (4 个模块入口) ===
function renderLearn(app) {
  app.innerHTML = `
    <h2 class="text-xl font-bold mb-4">📚 学习中心</h2>
    <div class="space-y-3">
      <button data-action="words" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left">
        <div class="text-5xl">🚀</div>
        <div class="flex-1">
          <div class="font-bold">单词大冒险</div>
          <div class="text-xs text-gray-500">消消乐 / 打地鼠 / 卡牌收集 / 宠物养成</div>
        </div>
        <div class="text-2xl text-gray-300">›</div>
      </button>
      <button data-action="grammar" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left">
        <div class="text-5xl">🎓</div>
        <div class="flex-1">
          <div class="font-bold">语法学院</div>
          <div class="text-xs text-gray-500">规则讲解 + 即时练习</div>
        </div>
        <div class="text-2xl text-gray-300">›</div>
      </button>
      <button data-action="grammar-hall" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left">
        <div class="text-5xl">🏛️</div>
        <div class="flex-1">
          <div class="font-bold">语法大厅</div>
          <div class="text-xs text-gray-500">1-9 年级 50 课全景地图 · 英语句子 = 一支乐队</div>
        </div>
        <div class="text-2xl text-gray-300">›</div>
      </button>
      <button data-action="reading" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left">
        <div class="text-5xl">📖</div>
        <div class="flex-1">
          <div class="font-bold">阅读乐园</div>
          <div class="text-xs text-gray-500">分级阅读 + 点词查义 + 跟读评分</div>
        </div>
        <div class="text-2xl text-gray-300">›</div>
      </button>
      <button data-action="writing" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left">
        <div class="text-5xl">✍️</div>
        <div class="flex-1">
          <div class="font-bold">写作工坊</div>
          <div class="text-xs text-gray-500">智能批改 + 范文学习</div>
        </div>
        <div class="text-2xl text-gray-300">›</div>
      </button>
    </div>
  `;
  ['words','grammar','grammar-hall','reading','writing'].forEach(p => {
    app.querySelector(`[data-action="${p}"]`).addEventListener('click', () => navigate(p));
  });
}

// === 错题本 ===
async function renderMistakes(app) {
  const profile = storage.getProfile();
  const mistakes = storage.getMistakes();

  if (mistakes.length === 0) {
    app.innerHTML = `
      <h2 class="text-xl font-bold mb-4">📝 错题本</h2>
      <div class="card-cartoon empty-state">
        <span class="empty-emoji">🦊🎉</span>
        <div class="empty-text">太棒啦，一道错题都没有！</div>
        <div class="empty-sub">继续保持，你超厉害的，加油！💪</div>
      </div>
    `;
    return;
  }

  // 加载所有年级的词找出错词
  const wordMap = {};
  for (let g = 1; g <= 9; g++) {
    const data = await loadJSON(`data/words/grade${g}.json`);
    if (!data) continue;
    data.units.forEach(u => u.words.forEach(w => { wordMap[w.id] = { ...w, grade: g }; }));
  }
  // PET 话题词也纳入，错词本才能显示 PET 单词
  await collectPetWordsById(wordMap);

  const items = mistakes.map(id => wordMap[id]).filter(Boolean);

  app.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">📝 错题本</h2>
      <span class="text-sm text-gray-500">${items.length} 个待巩固</span>
    </div>
    <div class="space-y-2">
      ${items.map(w => `
        <div class="card-cartoon flex items-center gap-3" data-word-id="${w.id}">
          <div class="flex-1">
            <div class="font-bold font-en">${w.word} <span class="text-xs text-gray-400 font-sans">${w.phonetic}</span></div>
            <div class="text-sm text-gray-600">${w.pos} ${w.meaning}</div>
            <div class="text-xs text-gray-400 mt-1">${w.petTopic ? 'PET · ' + w.petTopic : w.ketTopic ? 'KET · ' + w.ketTopic : gradeLabel(w.grade)}</div>
          </div>
          <button data-act="speak" class="p-2 text-primary-ink text-2xl">🔊</button>
          <button data-act="remove" class="p-2 text-green-700 text-xl">✓</button>
        </div>
      `).join('')}
    </div>
  `;

  app.querySelectorAll('[data-word-id]').forEach(card => {
    const wid = card.dataset.wordId;
    const word = wordMap[wid];
    card.querySelector('[data-act="speak"]').addEventListener('click', () => {
      speak(word.word);
      playSound('click');
    });
    card.querySelector('[data-act="remove"]').addEventListener('click', () => {
      storage.removeMistake(wid);
      card.remove();
      toast('已移出错题本', 'success');
      const remaining = app.querySelectorAll('[data-word-id]').length;
      if (remaining === 0) renderMistakes(app);
    });
  });
}

// === 我的 ===
function renderMe(app) {
  const profile = storage.getProfile();
  const badges = storage.getBadges();
  const learned = Object.keys(storage.getLearnedWords()).length;
  const cards = storage.getCards();
  const rank = getCurrentRank();

  app.innerHTML = `
    <div class="card-cartoon mb-4 text-center bg-gradient-to-br from-orange-100 to-cyan-50">
      <button id="avatarBtn" class="text-6xl tap-bounce">${profile.avatar}</button>
      <div class="mt-2">
        <input id="nicknameInput" class="text-center font-bold bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-primary" value="${profile.nickname}" />
      </div>
      <div class="mt-1">
        <span class="rank-badge ${rank.cls}">${rank.icon} ${rank.name}</span>
        <span class="text-xs text-gray-500 ml-2">${gradeLabel(profile.grade)}</span>
      </div>
    </div>

    <!-- 数据 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-3">📊 学习数据</h3>
      <div class="grid grid-cols-2 gap-3 text-center">
        <div class="bg-orange-50 rounded-2xl p-3">
          <div class="text-2xl font-bold text-primary-ink">${learned}</div>
          <div class="text-xs text-gray-600">已学单词</div>
        </div>
        <div class="bg-cyan-50 rounded-2xl p-3">
          <div class="text-2xl font-bold text-secondary-ink">${totalStudyDays()}</div>
          <div class="text-xs text-gray-600">累计学习天数</div>
        </div>
        <div class="bg-yellow-50 rounded-2xl p-3">
          <div class="text-2xl font-bold text-orange-700">${badges.length}</div>
          <div class="text-xs text-gray-600">勋章</div>
        </div>
        <div class="bg-pink-50 rounded-2xl p-3">
          <div class="text-2xl font-bold text-pink-700">${cards.length}</div>
          <div class="text-xs text-gray-600">收集卡牌</div>
        </div>
      </div>
    </div>

    <!-- 勋章墙 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-3">🎖️ 勋章墙 (${badges.length}/${BADGES.length})</h3>
      <div class="grid grid-cols-4 md:grid-cols-6 gap-3">
        ${BADGES.map(b => {
          const unlocked = badges.includes(b.id);
          return `
            <div class="text-center ${unlocked ? '' : 'opacity-25 grayscale'}" title="${b.name}: ${b.desc}">
              <div class="text-3xl">${b.icon}</div>
              <div class="text-cap mt-1 font-medium">${b.name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- V0.7 学习时长入口（家长了解工具，放"我的"不进首页） -->
    <button id="timeStatsBtn" class="w-full card-cartoon tap-bounce flex items-center gap-3 text-left mb-4" style="min-height:48px">
      <span class="text-3xl">⏱</span>
      <div class="flex-1">
        <div class="font-bold text-sm">学习时长</div>
        <div class="text-xs text-gray-500">今天学了多久、时间花在哪（给家长看的）</div>
      </div>
      <span class="text-xl text-gray-300">›</span>
    </button>

    <!-- 数据管理 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-3">⚙️ 数据管理</h3>
      <div class="space-y-2">
        <button id="exportBtn" class="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm">📤 导出我的数据</button>
        <label class="block w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm cursor-pointer">
          📥 从文件恢复数据
          <input type="file" id="importInput" accept=".json" class="hidden" />
        </label>
        <button id="resetBtn" class="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-600">🗑️ 清空全部数据</button>
      </div>
    </div>

    <div class="text-center text-xs text-gray-400 mt-6">
      英语奇遇记 v0.3 · PET 备考框架版<br>
      数据全部保存在本机，不上传任何信息
    </div>
  `;

  // V0.7 学习时长入口
  app.querySelector('#timeStatsBtn').addEventListener('click', () => navigate('timestats'));

  // 切换头像
  app.querySelector('#avatarBtn').addEventListener('click', () => {
    const avatars = ['🦊','🐱','🐶','🐰','🐯','🐼','🦁','🐵','🐨','🐧'];
    const idx = avatars.indexOf(profile.avatar);
    profile.avatar = avatars[(idx + 1) % avatars.length];
    storage.setProfile(profile);
    renderMe(app);
  });

  // 修改昵称
  app.querySelector('#nicknameInput').addEventListener('change', e => {
    profile.nickname = e.target.value || '英语探险家';
    storage.setProfile(profile);
    toast('昵称已更新', 'success');
  });

  // 导出
  app.querySelector('#exportBtn').addEventListener('click', () => {
    const data = storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english-adventure-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('数据已下载', 'success');
  });

  // 导入
  app.querySelector('#importInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        storage.importAllData(data);
        toast('数据已恢复', 'success');
        setTimeout(() => location.reload(), 1000);
      } catch (e) {
        toast('文件格式错误', 'error');
      }
    };
    reader.readAsText(file);
  });

  // 重置
  app.querySelector('#resetBtn').addEventListener('click', () => {
    showModal(`
      <div class="p-6">
        <div class="text-5xl text-center mb-3">⚠️</div>
        <h3 class="font-bold text-center mb-2">确认清空全部数据？</h3>
        <p class="text-sm text-gray-600 text-center mb-5">此操作不可撤销，所有学习记录、金币、宠物状态都会丢失。</p>
        <div class="flex gap-3">
          <button id="cancelReset" class="flex-1 btn-cartoon btn-cartoon-secondary">取消</button>
          <button id="confirmReset" class="flex-1 btn-cartoon" style="background:#F56565;box-shadow:0 4px 0 #C53030">确认清空</button>
        </div>
      </div>
    `);
    document.getElementById('cancelReset').addEventListener('click', closeModal);
    document.getElementById('confirmReset').addEventListener('click', () => {
      storage.resetAll();
      closeModal();
      toast('数据已清空', 'success');
      setTimeout(() => location.reload(), 800);
    });
  });
}

// === 年级选择 ===
async function showGradePicker() {
  const profile = storage.getProfile();
  // KET 那行的日期与目标分读配置（V0.9 P0.5），避免和备考中心里的三时钟对不上
  let examCfg = { examDate: '', targetScore: 140 };
  try {
    examCfg = await (await import('./modules/exam/exam-common.js')).loadExamConfig();
  } catch (e) { /* 配置读不到就退回不带日期的文案 */ }
  showModal(`
    <div class="p-6 relative">
      <button id="gradePickerClose" aria-label="关闭" class="tap-bounce"
        style="position:absolute;top:0;right:0;width:48px;height:48px;font-size:var(--fs-h2);line-height:1;color:var(--c-ink-400)">×</button>
      <h3 class="font-bold text-lg text-center mb-4">选择你的年级</h3>
      <div class="grid grid-cols-3 gap-2">
        ${[1,2,3,4,5,6,7,8,9].map(g => {
          const stage = g <= 2 ? '学前' : g <= 6 ? '小学' : '初中';
          const icon = g <= 2 ? '🌱' : g <= 6 ? '📗' : '📘';
          return `
            <button data-grade="${g}" class="card-cartoon tap-bounce ${profile.grade===g?'ring-2 ring-primary':''}" style="padding:10px 6px">
              <div class="text-2xl text-center">${icon}</div>
              <div class="text-center font-bold mt-1 text-sm">${gradeLabel(g)}</div>
              <div class="text-center text-cap text-gray-500">${stage}</div>
            </button>
          `;
        }).join('')}
      </div>
      <div class="mt-4 mb-1 text-xs font-bold text-gray-400">🎓 剑桥备考</div>
      <button data-grade="KET" class="w-full card-cartoon tap-bounce flex items-center gap-3 text-left ${profile.grade==='KET'?'ring-2 ring-primary':''}"
        style="padding:12px 14px;background:linear-gradient(135deg,#FFF3C2,#FFE0B0)">
        <div class="text-3xl">🗝️</div>
        <div class="flex-1">
          <div class="font-bold text-sm">KET (A2 Key for Schools)</div>
          <div class="text-cap text-gray-500">45 天备考中心${examCfg.examDate ? ' · ' + examCfg.examDate : ''} · 目标 ${examCfg.targetScore}+</div>
        </div>
      </button>
      <button data-grade="PET" class="w-full card-cartoon tap-bounce mt-2 flex items-center gap-3 text-left ${profile.grade==='PET'?'ring-2 ring-primary':''}"
        style="padding:12px 14px;background:linear-gradient(135deg,#FFE3C2,#FFD0E0)">
        <div class="text-3xl">🎓</div>
        <div class="flex-1">
          <div class="font-bold text-sm">PET (B1 Preliminary)</div>
          <div class="text-cap text-gray-500">B1 话题词汇 + 阅读，KET 拿证后再来</div>
        </div>
      </button>
    </div>
  `);
  document.getElementById('gradePickerClose').addEventListener('click', closeModal);
  document.querySelectorAll('[data-grade]').forEach(btn => {
    btn.addEventListener('click', () => {
      const raw = btn.dataset.grade;
      const g = (raw === 'PET' || raw === 'KET') ? raw : parseInt(raw);
      storage.setGrade(g);
      closeModal();
      updateTopNav();
      // 备考级别与数字年级页面结构不同，切换后回各自主页，避免停留在不兼容的子页
      if (g === 'KET') navigate('exam-hub');
      else if (g === 'PET') navigate('words');
      else navigate(state.page.startsWith('exam-') ? 'home' : state.page);
      toast(`已切换至 ${gradeLabel(g)}`, 'success');
    });
  });
}

// === 启动 ===
async function bootstrap() {
  // 检查首次访问
  if (storage.isFirstLaunch()) {
    storage.setProfile(storage.getProfile()); // 写入默认 profile
    showFirstLaunchWelcome();
  }

  // 打卡
  storage.checkInToday();
  storage.recordVisit();

  // 检查勋章
  const newBadges = checkBadges();
  if (newBadges.length > 0) {
    setTimeout(() => {
      newBadges.forEach((b, i) => {
        setTimeout(() => toast(`🎉 解锁勋章: ${b.icon} ${b.name}`, 'success'), i * 1500);
      });
    }, 600);
  }

  // 绑定底部导航
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // 绑定年级切换
  document.getElementById('gradeBtn').addEventListener('click', showGradePicker);

  // 答题态 Esc = 请求离开（仅 confirm 页面）；有弹窗开着时让弹窗自己的 Esc 处理
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!focusState || !focusState.confirm) return;
    if (document.getElementById('modalRoot').firstElementChild) return;
    requestLeaveFocus();
  });

  // 初始页
  navigate('home');
}

function showFirstLaunchWelcome() {
  showModal(`
    <div class="p-6 text-center">
      <div class="text-6xl mb-3">🦊</div>
      <h3 class="font-bold text-xl mb-2">欢迎来到英语奇遇记！</h3>
      <p class="text-sm text-gray-600 mb-4">先告诉我你在读几年级，我会帮你匹配最合适的内容</p>
      <div class="grid grid-cols-3 gap-2 mb-2">
        ${[1,2,3,4,5,6,7,8,9].map(g => {
          const icon = g <= 2 ? '🌱' : g <= 6 ? '📗' : '📘';
          return `
            <button data-grade="${g}" class="card-cartoon tap-bounce" style="padding:10px 4px">
              <div class="text-xl">${icon}</div>
              <div class="font-bold text-xs">${gradeLabel(g)}</div>
            </button>
          `;
        }).join('')}
      </div>
      <button data-grade="KET" class="w-full card-cartoon tap-bounce mb-2 flex items-center gap-2 text-left" style="padding:10px 12px;background:linear-gradient(135deg,#FFF3C2,#FFE0B0)">
        <div class="text-2xl">🗝️</div>
        <div class="font-bold text-xs flex-1">KET 剑桥备考 (A2 Key for Schools)</div>
      </button>
      <button data-grade="PET" class="w-full card-cartoon tap-bounce mb-4 flex items-center gap-2 text-left" style="padding:10px 12px;background:linear-gradient(135deg,#FFE3C2,#FFD0E0)">
        <div class="text-2xl">🎓</div>
        <div class="font-bold text-xs flex-1">PET 剑桥备考 (B1)</div>
      </button>
      <p class="text-xs text-gray-400">之后可以在右上角随时切换</p>
    </div>
  `, { closeOnEsc: false });
  document.querySelectorAll('[data-grade]').forEach(btn => {
    btn.addEventListener('click', () => {
      const raw = btn.dataset.grade;
      storage.setGrade((raw === 'PET' || raw === 'KET') ? raw : parseInt(raw));
      closeModal();
      updateTopNav();
      navigate(raw === 'KET' ? 'exam-hub' : 'home');
      toast('🎉 欢迎，开始你的英语奇遇吧！', 'success');
    });
  });
}

// 等 DOM 就绪
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrap().catch(showBootError));
} else {
  bootstrap().catch(showBootError);
}

function showBootError(err) {
  console.error('启动失败:', err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="max-width:480px;margin:40px auto;padding:24px;background:#FFF5F5;border-radius:24px;border:2px solid #FCA5A5">
        <div style="font-size:var(--emoji-md);text-align:center">😣</div>
        <h3 style="font-size:var(--fs-h2);font-weight:bold;margin:12px 0;color:var(--c-danger-700);text-align:center">启动失败</h3>
        <p style="font-size:var(--fs-body-sm);color:var(--c-ink-600);text-align:center;margin-bottom:12px">如果你是直接双击 HTML 打开,请改用 HTTP 服务器访问 (见 README)</p>
        <pre style="background:#fff;padding:12px;border-radius:var(--r-xs);font-size:var(--fs-cap);color:var(--c-ink-600);overflow:auto;white-space:pre-wrap;word-break:break-all">${(err && (err.stack || err.message)) || err}</pre>
      </div>
    `;
  }
}
