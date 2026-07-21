// app.js - 主应用入口、路由
import * as storage from './storage.js';
import { checkBadges, getCurrentRank, getRankProgress, getLeaderboard, BADGES } from './gamification.js';
import { speak, playSound } from './speech.js';
import { renderWordsPage } from './modules/words.js';
import { renderLevelMap } from './modules/levels.js';
import { renderReinforce } from './modules/reinforce.js';
import { renderGrammarPage } from './modules/grammar.js';
import { renderReadingPage } from './modules/reading.js';
import { renderWritingPage } from './modules/writing.js';
import { renderPetTopicMap, collectPetWordsById } from './modules/pet.js';
import { trackPage } from './study-time.js'; // V0.7 学习时长计时（前台停留，路由打点）
// V0.4 剑桥备考中心：模块按需动态 import（减小首屏体积），路由见 navigate()

// 全局状态
const state = {
  page: 'home',
  data: {} // 缓存加载过的数据
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
export function showModal(html, options = {}) {
  const root = document.getElementById('modalRoot');
  const closeOnBackdrop = options.closeOnBackdrop !== false;

  root.innerHTML = `
    <div class="modal-backdrop fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 fade-in">
      <div class="modal-content bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto bounce-in">
        ${html}
      </div>
    </div>
  `;

  const backdrop = root.querySelector('.modal-backdrop');
  if (closeOnBackdrop) {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal();
    });
  }
  return backdrop;
}

export function closeModal() {
  document.getElementById('modalRoot').innerHTML = '';
}

// === 工具：加载 JSON ===
export async function loadJSON(path) {
  if (state.data[path]) return state.data[path];
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.data[path] = data;
    return data;
  } catch (e) {
    console.error('加载失败:', path, e);
    toast('数据加载失败', 'error');
    return null;
  }
}

// === 顶部导航更新 ===
function updateTopNav() {
  const profile = storage.getProfile();
  const coins = storage.getCoins();
  const streak = storage.getStreak();

  document.getElementById('gradeLabel').textContent = gradeLabel(profile.grade);
  document.getElementById('coinDisplay').textContent = coins;
  document.getElementById('streakDisplay').textContent = streak.count || 0;
}

function gradeLabel(g) {
  if (g === 'PET') return 'PET 备考';
  if (g === 'KET') return 'KET 备考';
  const map = { 1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级', 7: '七年级', 8: '八年级', 9: '九年级' };
  return map[g] || `${g}年级`;
}

// === 路由 ===
async function navigate(page, params = {}) {
  state.page = page;
  state.params = params;
  // 更新底部导航激活态
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.dataset.page === page) {
      b.classList.add('text-primary');
      b.classList.remove('text-gray-400');
    } else {
      b.classList.remove('text-primary');
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
    case 'leaderboard':renderLeaderboard(app); break;
    case 'me':         renderMe(app); break;
    case 'words':      await renderWordsPage(app, params); break;
    case 'levels':     await renderLevelMap(app); break;
    case 'reinforce':  await renderReinforce(app); break;
    case 'grammar':    await renderGrammarPage(app, params); break;
    case 'reading':    await renderReadingPage(app, params); break;
    case 'writing':    await renderWritingPage(app, params); break;
    case 'petlevels':  await renderPetTopicMap(app, params.topic); break;
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

    <!-- 每日任务 -->
    <div class="card-cartoon mb-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-bold flex items-center gap-1"><span>📋</span> 今日任务</h3>
        <span class="text-xs text-gray-500">${tasksData.tasks.filter(t=>t.done).length}/${tasksData.tasks.length}</span>
      </div>
      ${tasksData.tasks.map(t => `
        <div class="flex items-center justify-between py-1.5 ${t.done ? 'opacity-50 line-through' : ''}">
          <div class="flex-1">
            <div class="text-sm font-medium">${t.title}</div>
            <div class="text-xs text-gray-500">${t.current}/${t.target}</div>
          </div>
          <div class="text-xs bg-yellow-100 text-orange-600 px-2 py-1 rounded-full font-bold">+${t.reward}🪙</div>
        </div>
      `).join('')}
    </div>

    <!-- 4 个学习入口 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <button data-action="goto-words" class="card-cartoon tap-bounce text-left bg-gradient-to-br from-orange-100 to-orange-50">
        <div class="text-4xl">🚀</div>
        <div class="font-bold mt-2">单词大冒险</div>
        <div class="text-xs text-gray-500 mt-1">玩游戏背单词</div>
      </button>
      <button data-action="goto-grammar" class="card-cartoon tap-bounce text-left bg-gradient-to-br from-cyan-100 to-cyan-50">
        <div class="text-4xl">🎓</div>
        <div class="font-bold mt-2">语法学院</div>
        <div class="text-xs text-gray-500 mt-1">边学边练</div>
      </button>
      <button data-action="goto-reading" class="card-cartoon tap-bounce text-left bg-gradient-to-br from-green-100 to-green-50">
        <div class="text-4xl">📖</div>
        <div class="font-bold mt-2">阅读乐园</div>
        <div class="text-xs text-gray-500 mt-1">点词查义、跟读评分</div>
      </button>
      <button data-action="goto-writing" class="card-cartoon tap-bounce text-left bg-gradient-to-br from-pink-100 to-pink-50">
        <div class="text-4xl">✍️</div>
        <div class="font-bold mt-2">写作工坊</div>
        <div class="text-xs text-gray-500 mt-1">AI 智能批改</div>
      </button>
    </div>

    <!-- 数据概览 -->
    <div class="card-cartoon">
      <h3 class="font-bold mb-2">📊 学习统计</h3>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <div class="text-2xl font-bold text-primary">${learned}</div>
          <div class="text-xs text-gray-500">已学单词</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-secondary">${storage.getStreak().count || 0}</div>
          <div class="text-xs text-gray-500">连续天数</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-orange-500">${storage.getBadges().length}</div>
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
  ['words','grammar','reading','writing'].forEach(p => {
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
            <div class="text-xs text-gray-400 mt-0.5">${w.petTopic ? 'PET · ' + w.petTopic : w.ketTopic ? 'KET · ' + w.ketTopic : gradeLabel(w.grade)}</div>
          </div>
          <button data-act="speak" class="p-2 text-primary text-2xl">🔊</button>
          <button data-act="remove" class="p-2 text-green-500 text-xl">✓</button>
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

// === 排行榜 ===
function renderLeaderboard(app) {
  const players = getLeaderboard();
  const myRank = players.findIndex(p => p.isUser) + 1;

  app.innerHTML = `
    <h2 class="text-xl font-bold mb-1">🏆 排行榜</h2>
    <div class="text-xs text-gray-500 mb-4">显示包括 10 个虚拟玩家在内的本地排名（每天更新）</div>
    <div class="card-cartoon mb-4 text-center bg-gradient-to-br from-orange-100 to-yellow-50">
      <div class="text-sm">我的排名</div>
      <div class="text-3xl font-bold text-primary">#${myRank}</div>
    </div>
    <div class="space-y-2">
      ${players.map((p, i) => `
        <div class="card-cartoon flex items-center gap-3 ${p.isUser ? 'ring-2 ring-primary' : ''}">
          <div class="w-8 text-center font-bold ${i < 3 ? 'text-orange-500' : 'text-gray-400'}">
            ${['🥇','🥈','🥉'][i] || (i + 1)}
          </div>
          <div class="text-3xl">${p.avatar}</div>
          <div class="flex-1">
            <div class="font-bold ${p.isUser ? 'text-primary' : ''}">${p.name}${p.isUser ? ' (我)' : ''}</div>
          </div>
          <div class="text-right">
            <div class="font-bold">${p.coins}</div>
            <div class="text-xs text-gray-400">🪙</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// === 我的 ===
function renderMe(app) {
  const profile = storage.getProfile();
  const badges = storage.getBadges();
  const learned = Object.keys(storage.getLearnedWords()).length;
  const streak = storage.getStreak();
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
          <div class="text-2xl font-bold text-primary">${learned}</div>
          <div class="text-xs text-gray-600">已学单词</div>
        </div>
        <div class="bg-cyan-50 rounded-2xl p-3">
          <div class="text-2xl font-bold text-secondary">${streak.count || 0}</div>
          <div class="text-xs text-gray-600">连续打卡</div>
        </div>
        <div class="bg-yellow-50 rounded-2xl p-3">
          <div class="text-2xl font-bold text-orange-500">${badges.length}</div>
          <div class="text-xs text-gray-600">勋章</div>
        </div>
        <div class="bg-pink-50 rounded-2xl p-3">
          <div class="text-2xl font-bold text-pink-500">${cards.length}</div>
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
              <div class="text-[10px] mt-1 font-medium">${b.name}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-3">⚙️ 数据管理</h3>
      <div class="space-y-2">
        <button id="exportBtn" class="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm">📤 导出我的数据</button>
        <label class="block w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm cursor-pointer">
          📥 从文件恢复数据
          <input type="file" id="importInput" accept=".json" class="hidden" />
        </label>
        <button id="resetBtn" class="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-500">🗑️ 清空全部数据</button>
      </div>
    </div>

    <div class="text-center text-xs text-gray-400 mt-6">
      英语奇遇记 v0.3 · PET 备考框架版<br>
      数据全部保存在本机，不上传任何信息
    </div>
  `;

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
function showGradePicker() {
  const profile = storage.getProfile();
  showModal(`
    <div class="p-6">
      <h3 class="font-bold text-lg text-center mb-4">选择你的年级</h3>
      <div class="grid grid-cols-3 gap-2">
        ${[1,2,3,4,5,6,7,8,9].map(g => {
          const stage = g <= 2 ? '学前' : g <= 6 ? '小学' : '初中';
          const icon = g <= 2 ? '🌱' : g <= 6 ? '📗' : '📘';
          return `
            <button data-grade="${g}" class="card-cartoon tap-bounce ${profile.grade===g?'ring-2 ring-primary':''}" style="padding:10px 6px">
              <div class="text-2xl text-center">${icon}</div>
              <div class="text-center font-bold mt-1 text-sm">${gradeLabel(g)}</div>
              <div class="text-center text-[10px] text-gray-500">${stage}</div>
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
          <div class="text-[11px] text-gray-500">45 天备考中心 · 目标 2027 春季 140+</div>
        </div>
      </button>
      <button data-grade="PET" class="w-full card-cartoon tap-bounce mt-2 flex items-center gap-3 text-left ${profile.grade==='PET'?'ring-2 ring-primary':''}"
        style="padding:12px 14px;background:linear-gradient(135deg,#FFE3C2,#FFD0E0)">
        <div class="text-3xl">🎓</div>
        <div class="flex-1">
          <div class="font-bold text-sm">PET (B1 Preliminary)</div>
          <div class="text-[11px] text-gray-500">B1 话题词汇 + 阅读，KET 拿证后再来</div>
        </div>
      </button>
    </div>
  `);
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
  `, { closeOnBackdrop: false });
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
        <div style="font-size:48px;text-align:center">😣</div>
        <h3 style="font-size:18px;font-weight:bold;margin:12px 0;color:#C53030;text-align:center">启动失败</h3>
        <p style="font-size:13px;color:#666;text-align:center;margin-bottom:12px">如果你是直接双击 HTML 打开,请改用 HTTP 服务器访问 (见 README)</p>
        <pre style="background:#fff;padding:12px;border-radius:8px;font-size:11px;color:#555;overflow:auto;white-space:pre-wrap;word-break:break-all">${(err && (err.stack || err.message)) || err}</pre>
      </div>
    `;
  }
}
