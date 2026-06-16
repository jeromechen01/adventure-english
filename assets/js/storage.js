// storage.js - 本地存储封装
// 所有学习数据持久化到 localStorage

const KEY_PREFIX = 'ea_'; // english adventure 简写

const KEYS = {
  PROFILE: 'profile',         // 昵称、头像、年级
  PROGRESS: 'progress',       // 学过的单词、做过的题
  MISTAKES: 'mistakes',       // 错词、错题
  COINS: 'coins',             // 金币
  STREAK: 'streak',           // 连续打卡
  PET: 'pet',                 // 宠物状态
  CARDS: 'cards',             // 收集的卡牌
  BADGES: 'badges',           // 解锁的勋章
  REVIEW_QUEUE: 'reviewQueue',// 艾宾浩斯复习队列
  DAILY_TASKS: 'dailyTasks',  // 每日任务
  LAST_VISIT: 'lastVisit',    // 最后访问日期
  // === V0.2 新增 ===
  LEVELS: 'levels',           // 闯关进度 { [grade]: { [lv]: {stars,cleared,bestScore,maxCombo,firstClear} } }
  WORD_DEX: 'wordDex',        // 单词图鉴 { [grade]: [wordId,...] }
  DAILY_FIRST_CLEAR: 'dailyFirstClear', // 每日首关加成 { date }
  STATS: 'stats',             // 杂项统计 { bossKills, threeStars, comboMax, regionClears, reinforceGrads }
  RECITATION: 'recitation'    // 背诵成绩 { [articleId]: bestScore }
};

// 通用读写
function get(key, defaultVal = null) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    if (raw === null) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[storage] read failed:', key, e);
    return defaultVal;
  }
}

function set(key, value) {
  try {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('[storage] write failed:', key, e);
    return false;
  }
}

function remove(key) {
  localStorage.removeItem(KEY_PREFIX + key);
}

// === 用户档案 ===
export function getProfile() {
  return get(KEYS.PROFILE, {
    nickname: '英语探险家',
    avatar: '🦊',
    grade: 3,
    createdAt: Date.now()
  });
}

export function setProfile(profile) {
  return set(KEYS.PROFILE, profile);
}

export function setGrade(grade) {
  const p = getProfile();
  p.grade = grade;
  return setProfile(p);
}

// === 进度: 已学单词 ===
export function getLearnedWords() {
  return get(KEYS.PROGRESS, {});
  // 结构: { wordId: { learnedAt, reviewCount, correctCount, wrongCount, nextReview } }
}

export function markWordLearned(wordId) {
  const p = getLearnedWords();
  if (!p[wordId]) {
    p[wordId] = {
      learnedAt: Date.now(),
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      nextReview: Date.now() + 24 * 3600 * 1000 // 24小时后第一次复习
    };
  }
  set(KEYS.PROGRESS, p);
  return p[wordId];
}

export function recordWordResult(wordId, correct) {
  const p = getLearnedWords();
  if (!p[wordId]) {
    p[wordId] = { learnedAt: Date.now(), reviewCount: 0, correctCount: 0, wrongCount: 0, consecutiveCorrect: 0, nextReview: 0 };
  }
  if (p[wordId].consecutiveCorrect === undefined) p[wordId].consecutiveCorrect = 0; // 旧数据兜底
  p[wordId].reviewCount++;
  if (correct) {
    p[wordId].correctCount++;
    p[wordId].consecutiveCorrect++;
    // 艾宾浩斯间隔：1, 2, 4, 7, 15 天
    const intervals = [1, 2, 4, 7, 15];
    const idx = Math.min(p[wordId].correctCount - 1, intervals.length - 1);
    p[wordId].nextReview = Date.now() + intervals[idx] * 24 * 3600 * 1000;
  } else {
    p[wordId].wrongCount++;
    p[wordId].consecutiveCorrect = 0; // 连对中断
    p[wordId].nextReview = Date.now() + 60 * 60 * 1000; // 1小时后再来
    // 错误多于3次进入错词本
    if (p[wordId].wrongCount >= 1) {
      addMistake(wordId);
    }
  }
  set(KEYS.PROGRESS, p);
}

// === 错题本 ===
export function getMistakes() {
  return get(KEYS.MISTAKES, []);
}

export function addMistake(wordId) {
  const list = getMistakes();
  if (!list.includes(wordId)) {
    list.push(wordId);
    set(KEYS.MISTAKES, list);
  }
}

export function removeMistake(wordId) {
  let list = getMistakes();
  list = list.filter(id => id !== wordId);
  set(KEYS.MISTAKES, list);
}

// === 错词智能强化 (V0.2 模块2) ===
const REINFORCE_GRADUATE = 3; // 连对 3 次毕业

// 待强化错词队列，按优先级降序：priority = wrongCount*2 - consecutiveCorrect
export function getReinforceQueue() {
  const learned = getLearnedWords();
  return getMistakes()
    .map(id => {
      const p = learned[id] || { wrongCount: 1, consecutiveCorrect: 0 };
      const wrongCount = p.wrongCount || 0;
      const cc = p.consecutiveCorrect || 0;
      return { id, wrongCount, consecutiveCorrect: cc, priority: wrongCount * 2 - cc };
    })
    .sort((a, b) => b.priority - a.priority);
}

export function getReinforceCount() {
  return getMistakes().length;
}

// 强化练习一次，返回 { graduated, consecutiveCorrect, remaining }
export function recordReinforceResult(wordId, correct) {
  recordWordResult(wordId, correct);
  const p = getLearnedWords()[wordId] || { consecutiveCorrect: 0 };
  const cc = p.consecutiveCorrect || 0;
  let graduated = false;
  if (correct && cc >= REINFORCE_GRADUATE) {
    removeMistake(wordId);
    graduated = true;
    const stats = getStats();
    stats.reinforceGrads = (stats.reinforceGrads || 0) + 1;
    setStats(stats);
  }
  return { graduated, consecutiveCorrect: cc, remaining: getMistakes().length };
}

// === 金币 ===
export function getCoins() {
  return get(KEYS.COINS, 0);
}

export function addCoins(amount) {
  const c = getCoins() + amount;
  set(KEYS.COINS, c);
  return c;
}

export function spendCoins(amount) {
  const c = getCoins();
  if (c < amount) return false;
  set(KEYS.COINS, c - amount);
  return true;
}

// === 打卡 ===
export function getStreak() {
  return get(KEYS.STREAK, { count: 0, lastDate: null, history: [] });
}

export function checkInToday() {
  const today = new Date().toDateString();
  const streak = getStreak();

  if (streak.lastDate === today) {
    return streak; // 今天已经打过卡
  }

  const yesterday = new Date(Date.now() - 24*3600*1000).toDateString();
  if (streak.lastDate === yesterday) {
    streak.count += 1; // 连续
  } else {
    streak.count = 1; // 中断重新开始
  }

  streak.lastDate = today;
  if (!streak.history.includes(today)) {
    streak.history.push(today);
  }
  set(KEYS.STREAK, streak);
  return streak;
}

// === 宠物 ===
export function getPet() {
  return get(KEYS.PET, {
    name: 'Foxy',
    level: 1,         // 1-5
    exp: 0,           // 经验值
    hunger: 100,      // 饱食度
    mood: 100,        // 心情
    lastFed: Date.now()
  });
}

export function setPet(pet) {
  return set(KEYS.PET, pet);
}

export function feedPet(amount = 20) {
  const pet = getPet();
  pet.hunger = Math.min(100, pet.hunger + amount);
  pet.mood = Math.min(100, pet.mood + 10);
  pet.lastFed = Date.now();
  setPet(pet);
  return pet;
}

export function addPetExp(exp) {
  const pet = getPet();
  pet.exp += exp;
  // 升级阈值: 50, 150, 350, 700
  const thresholds = [0, 50, 150, 350, 700, Infinity];
  for (let i = 5; i >= 1; i--) {
    if (pet.exp >= thresholds[i - 1]) {
      pet.level = i;
      break;
    }
  }
  setPet(pet);
  return pet;
}

// === 卡牌 ===
export function getCards() {
  return get(KEYS.CARDS, []);
  // 结构: [{ wordId, rarity, drawnAt }]
}

export function addCard(card) {
  const cards = getCards();
  cards.push(card);
  set(KEYS.CARDS, cards);
}

// === 勋章 ===
export function getBadges() {
  return get(KEYS.BADGES, []);
}

export function unlockBadge(badgeId) {
  const list = getBadges();
  if (!list.includes(badgeId)) {
    list.push(badgeId);
    set(KEYS.BADGES, list);
    return true; // 新解锁
  }
  return false;
}

// === 每日任务 ===
export function getDailyTasks() {
  const today = new Date().toDateString();
  let data = get(KEYS.DAILY_TASKS, null);
  if (!data || data.date !== today) {
    // 生成今天的任务
    data = {
      date: today,
      tasks: [
        { id: 'words10', title: '今日学习 10 个新单词', target: 10, current: 0, reward: 30, done: false },
        { id: 'reading1', title: '完成 1 篇阅读', target: 1, current: 0, reward: 20, done: false },
        { id: 'grammar3', title: '答对 3 道语法题', target: 3, current: 0, reward: 20, done: false }
      ]
    };
    set(KEYS.DAILY_TASKS, data);
  }
  return data;
}

export function progressDailyTask(taskId, delta = 1) {
  const data = getDailyTasks();
  const t = data.tasks.find(x => x.id === taskId);
  if (!t || t.done) return null;
  t.current = Math.min(t.target, t.current + delta);
  if (t.current >= t.target) {
    t.done = true;
    addCoins(t.reward);
  }
  set(KEYS.DAILY_TASKS, data);
  return t;
}

// === 最后访问 ===
export function recordVisit() {
  set(KEYS.LAST_VISIT, Date.now());
}

export function getLastVisit() {
  return get(KEYS.LAST_VISIT, 0);
}

// ============================================================
// === V0.2 单词闯关系统：关卡进度 / 图鉴 / 每日加成 / 统计 ===
// ============================================================

// 取某年级全部关卡进度对象，{} 兜底
export function getLevelProgress(grade) {
  const all = get(KEYS.LEVELS, {});
  return (all && all[grade]) || {};
}

// 保存一次过关结果，只取最高星；返回 { isNew, isFirstClear, prevStars }
// extra: { score, maxCombo, isBoss }
export function saveLevelResult(grade, lv, stars, extra = {}) {
  const all = get(KEYS.LEVELS, {}) || {};
  if (!all[grade]) all[grade] = {};
  const prev = all[grade][lv] || { stars: 0, cleared: false, bestScore: 0, maxCombo: 0, firstClear: false };
  const isFirstClear = !prev.cleared && stars >= 1;

  const rec = {
    stars: Math.max(prev.stars, stars),
    cleared: prev.cleared || stars >= 1,
    bestScore: Math.max(prev.bestScore || 0, extra.score || 0),
    maxCombo: Math.max(prev.maxCombo || 0, extra.maxCombo || 0),
    firstClear: true
  };
  all[grade][lv] = rec;
  set(KEYS.LEVELS, all);

  // 顺带更新统计（用于勋章）
  const stats = getStats();
  if (isFirstClear && extra.isBoss) stats.bossKills = (stats.bossKills || 0) + 1;
  // 三星关数量：重新统计该年级（避免重复计数）
  stats.threeStars = countThreeStars();
  stats.comboMax = Math.max(stats.comboMax || 0, extra.maxCombo || 0);
  stats.regionClears = countRegionClears();
  stats.clearedTotal = countClearedLevels();
  setStats(stats);

  return { isNew: isFirstClear, isFirstClear, prevStars: prev.stars };
}

export function isLevelUnlocked(grade, lv) {
  if (lv <= 1) return true; // 第一关默认解锁
  const prog = getLevelProgress(grade);
  const before = prog[lv - 1];
  return !!(before && before.cleared);
}

export function getMaxUnlockedLevel(grade) {
  const prog = getLevelProgress(grade);
  let max = 1;
  // 找到连续已通关的最高关，下一关即可挑战
  for (let lv = 1; lv < 999; lv++) {
    if (prog[lv] && prog[lv].cleared) {
      max = lv + 1;
    } else {
      break;
    }
  }
  return max;
}

export function getTotalStars(grade) {
  const prog = getLevelProgress(grade);
  return Object.values(prog).reduce((sum, r) => sum + (r.stars || 0), 0);
}

// 每日首关加成：今天还没领过返回 true（不消费）
export function getDailyFirstClearDone() {
  const today = new Date().toDateString();
  const d = get(KEYS.DAILY_FIRST_CLEAR, null);
  return !!(d && d.date === today);
}

// 消费每日首关加成：今天第一次调用返回 true 并标记，之后返回 false
export function consumeDailyFirstClear() {
  if (getDailyFirstClearDone()) return false;
  set(KEYS.DAILY_FIRST_CLEAR, { date: new Date().toDateString() });
  return true;
}

// === 单词图鉴 ===
export function getWordDex(grade) {
  const all = get(KEYS.WORD_DEX, {});
  return (all && all[grade]) || [];
}

export function addToWordDex(grade, wordId) {
  const all = get(KEYS.WORD_DEX, {}) || {};
  if (!all[grade]) all[grade] = [];
  if (!all[grade].includes(wordId)) {
    all[grade].push(wordId);
    set(KEYS.WORD_DEX, all);
    return true; // 新收录
  }
  return false;
}

// === 杂项统计（勋章用）===
export function getStats() {
  return get(KEYS.STATS, { bossKills: 0, threeStars: 0, comboMax: 0, regionClears: 0, reinforceGrads: 0 });
}

export function setStats(stats) {
  return set(KEYS.STATS, stats);
}

// 统计所有年级的三星关总数
function countThreeStars() {
  const all = get(KEYS.LEVELS, {}) || {};
  let n = 0;
  Object.values(all).forEach(gradeObj => {
    Object.values(gradeObj).forEach(r => { if (r.stars >= 3) n++; });
  });
  return n;
}

// 统计所有年级已通关的关卡总数
function countClearedLevels() {
  const all = get(KEYS.LEVELS, {}) || {};
  let n = 0;
  Object.values(all).forEach(gradeObj => {
    Object.values(gradeObj).forEach(r => { if (r.cleared) n++; });
  });
  return n;
}

// 统计完整通关的大区数（每 5 关一个大区，全部 cleared 才算）
function countRegionClears() {
  const all = get(KEYS.LEVELS, {}) || {};
  let n = 0;
  Object.values(all).forEach(gradeObj => {
    const levels = Object.keys(gradeObj).map(Number);
    const maxLv = levels.length ? Math.max(...levels) : 0;
    const regions = Math.ceil(maxLv / 5);
    for (let r = 0; r < regions; r++) {
      let full = true;
      for (let lv = r * 5 + 1; lv <= r * 5 + 5; lv++) {
        if (!(gradeObj[lv] && gradeObj[lv].cleared)) { full = false; break; }
      }
      if (full) n++;
    }
  });
  return n;
}

// === 背诵成绩 (V0.2 模块4) ===
export function getRecitationScore(articleId) {
  const all = get(KEYS.RECITATION, {});
  return (all && all[articleId]) || 0;
}

export function saveRecitationScore(articleId, score) {
  const all = get(KEYS.RECITATION, {}) || {};
  all[articleId] = Math.max(all[articleId] || 0, score); // 取最高分
  set(KEYS.RECITATION, all);
  return all[articleId];
}

// === 数据导入导出 ===
export function exportAllData() {
  const all = {};
  Object.values(KEYS).forEach(k => {
    all[k] = get(k);
  });
  return all;
}

export function importAllData(data) {
  if (typeof data !== 'object' || !data) return false;
  Object.entries(data).forEach(([k, v]) => {
    if (v !== null && v !== undefined) set(k, v);
  });
  return true;
}

export function resetAll() {
  Object.values(KEYS).forEach(k => remove(k));
}

// 检查是否首次访问
export function isFirstLaunch() {
  return localStorage.getItem(KEY_PREFIX + KEYS.PROFILE) === null;
}
