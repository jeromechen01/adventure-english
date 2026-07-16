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
  RECITATION: 'recitation',   // 背诵成绩 { [articleId]: bestScore }
  // === V0.4 剑桥备考中心 ===
  EXAM_PROFILE: 'examProfile',   // { level:'KET'|'PET', examDate:'2027-04-15', started:true }
  EXAM_PLAN: 'examPlan',         // { [level]: { day:N, slots:{ [day]:{ [slotId]:true } } } }
  EXAM_CHECKIN: 'examCheckin',   // { [level]: { [dateISO]: doneSlotCount } }  真实日期热力图
  EXAM_MINUTES: 'examMinutes',   // { [level]: { [dateISO]: minutes } }  健康护栏用
  EXAM_LESSONS: 'examLessons',   // { [level]: { [lessonId]: 'learning'|'done' } }
  EXAM_MOCKS: 'examMocks',       // { [level]: { [mockId]: {reading,writing,listening,scaled,date} } }
  EXAM_WRITING: 'examWriting',   // { [level]: { [taskId]: { text, updatedAt } } }
  EXAM_RESOURCES: 'examResources', // [resourceId,...] 已访问资源
  EXAM_DRILLS: 'examDrills'      // { [level]: { [drillId]: { best, tries } } } 专项练习成绩
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
  // V0.4：剑桥备考级别与数字年级并存，examLevel 冗余记录方便备考模块读取
  p.examLevel = (grade === 'KET' || grade === 'PET') ? grade : null;
  const ok = setProfile(p);
  if (p.examLevel) {
    const ep = getExamProfile();
    ep.level = p.examLevel;
    setExamProfile(ep);
  }
  return ok;
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

// ============================================================
// === V0.4 剑桥备考中心 ===
// ★★ 核心设计：两个时钟解耦 ★★
//   计划进度 Day N —— 只由「完成度」驱动（advancePlanDay 时才 +1），
//                     绝不用日期差计算；跳过一天进度原地等，不惩罚不欠账。
//   考试倒计时 D-XXX —— 由「日历」驱动（examDate - 今天）。
//   打卡日历 —— 记录「真实日期」，哪天学了哪天没学如实显示。
// ============================================================

const PLAN_MAX_DAY = 45; // 45 天核心期

// 备考档案：级别 + 考试目标日（注意：没有 planStartDate，进度不靠日期）
export function getExamProfile() {
  return get(KEYS.EXAM_PROFILE, { level: null, examDate: '2027-04-15', started: false });
}

export function setExamProfile(p) {
  return set(KEYS.EXAM_PROFILE, p);
}

// 内部：取某级别的计划状态（默认 Day 1，全部未完成）
function getExamPlanState(level) {
  const all = get(KEYS.EXAM_PLAN, {}) || {};
  return all[level] || { day: 1, slots: {} };
}

function setExamPlanState(level, state) {
  const all = get(KEYS.EXAM_PLAN, {}) || {};
  all[level] = state;
  return set(KEYS.EXAM_PLAN, all);
}

// 当前 Day N（完成度驱动，1-45，默认 1）
export function getPlanDay(level) {
  const s = getExamPlanState(level);
  return Math.min(Math.max(s.day || 1, 1), PLAN_MAX_DAY);
}

// 完成一天 → Day +1（封顶 45）。这是 Day N 前进的唯一途径。
export function advancePlanDay(level) {
  const s = getExamPlanState(level);
  s.day = Math.min((s.day || 1) + 1, PLAN_MAX_DAY);
  setExamPlanState(level, s);
  return s.day;
}

// 某一天六格的勾选状态 { slotId: true }
export function getPlanTaskState(level, day) {
  const s = getExamPlanState(level);
  return (s.slots && s.slots[day]) || {};
}

// 勾选/取消某格；完成时顺带写入真实日期打卡
export function markPlanTask(level, day, slotId, done) {
  const s = getExamPlanState(level);
  if (!s.slots) s.slots = {};
  if (!s.slots[day]) s.slots[day] = {};
  if (done) s.slots[day][slotId] = true;
  else delete s.slots[day][slotId];
  setExamPlanState(level, s);
  return s.slots[day];
}

// === 打卡（真实日期，热力图用）===
function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// 记录某真实日期完成的格数（取当日最大值）
export function recordCheckin(level, dateISO, slotCount) {
  const all = get(KEYS.EXAM_CHECKIN, {}) || {};
  if (!all[level]) all[level] = {};
  const day = dateISO || todayISO();
  all[level][day] = Math.max(all[level][day] || 0, slotCount);
  return set(KEYS.EXAM_CHECKIN, all);
}

// 热力图数据：{ dateISO: doneSlotCount }
export function getCheckinCalendar(level) {
  const all = get(KEYS.EXAM_CHECKIN, {}) || {};
  return all[level] || {};
}

// 本周学习天数（周一为一周起点）——替代 streak，不做断签焦虑
export function getWeekStudyDays(level) {
  const cal = getCheckinCalendar(level);
  const now = new Date();
  const monday = new Date(now);
  const wd = (now.getDay() + 6) % 7; // 周一=0
  monday.setDate(now.getDate() - wd);
  monday.setHours(0, 0, 0, 0);
  let n = 0;
  Object.keys(cal).forEach(dateISO => {
    const d = new Date(dateISO + 'T00:00:00');
    if (d >= monday && d <= now && cal[dateISO] > 0) n++;
  });
  return n;
}

// === 学习时长（健康护栏：单日超 120 分钟温和劝停）===
export function getDailyMinutes(level, dateISO) {
  const all = get(KEYS.EXAM_MINUTES, {}) || {};
  return (all[level] && all[level][dateISO || todayISO()]) || 0;
}

export function addDailyMinutes(level, minutes) {
  const all = get(KEYS.EXAM_MINUTES, {}) || {};
  if (!all[level]) all[level] = {};
  const day = todayISO();
  all[level][day] = (all[level][day] || 0) + minutes;
  set(KEYS.EXAM_MINUTES, all);
  return all[level][day];
}

// === 语法课进度（三态：未学(无记录) / learning / done）===
export function getLessonProgress(level) {
  const all = get(KEYS.EXAM_LESSONS, {}) || {};
  return all[level] || {};
}

export function markLessonDone(level, lessonId, status = 'done') {
  const all = get(KEYS.EXAM_LESSONS, {}) || {};
  if (!all[level]) all[level] = {};
  all[level][lessonId] = status;
  return set(KEYS.EXAM_LESSONS, all);
}

// === 模考成绩 ===
export function saveMockResult(level, mockId, result) {
  const all = get(KEYS.EXAM_MOCKS, {}) || {};
  if (!all[level]) all[level] = {};
  all[level][mockId] = { ...result, date: todayISO() };
  return set(KEYS.EXAM_MOCKS, all);
}

export function getMockResults(level) {
  const all = get(KEYS.EXAM_MOCKS, {}) || {};
  return all[level] || {};
}

// 报考决策：按最近一次模考的估算量表分给建议（目标 2027 春）
export function getExamDecision(level) {
  const mocks = getMockResults(level);
  const list = Object.entries(mocks).sort((a, b) => (a[1].date || '').localeCompare(b[1].date || ''));
  if (!list.length) return null;
  const last = list[list.length - 1][1];
  const scaled = last.scaled || 0;
  if (scaled >= 134) return { scaled, verdict: '超预期', action: '报 2027 春并冲 A（140+）→ 证书直接认定 B1！' };
  if (scaled >= 120) return { scaled, verdict: '已过 A2 线', action: '报 2027 春，冲 B（133+）' };
  if (scaled >= 110) return { scaled, verdict: '接近及格', action: '报 2027 春，争 120+' };
  return { scaled, verdict: '尚未到位', action: '延后，先补基本盘，考虑 2027 秋' };
}

// === 写作草稿 ===
export function saveWritingDraft(level, taskId, text) {
  const all = get(KEYS.EXAM_WRITING, {}) || {};
  if (!all[level]) all[level] = {};
  all[level][taskId] = { text, updatedAt: Date.now() };
  return set(KEYS.EXAM_WRITING, all);
}

export function getWritingDrafts(level) {
  const all = get(KEYS.EXAM_WRITING, {}) || {};
  return all[level] || {};
}

// === 资源已访问标记 ===
export function markResourceVisited(id) {
  const list = get(KEYS.EXAM_RESOURCES, []) || [];
  if (!list.includes(id)) {
    list.push(id);
    set(KEYS.EXAM_RESOURCES, list);
  }
}

export function getVisitedResources() {
  return get(KEYS.EXAM_RESOURCES, []) || [];
}

// === 专项练习成绩（阅读/听力 drill）===
export function saveDrillResult(level, drillId, score) {
  const all = get(KEYS.EXAM_DRILLS, {}) || {};
  if (!all[level]) all[level] = {};
  const rec = all[level][drillId] || { best: 0, tries: 0 };
  rec.best = Math.max(rec.best, score);
  rec.tries++;
  all[level][drillId] = rec;
  return set(KEYS.EXAM_DRILLS, all);
}

export function getDrillResults(level) {
  const all = get(KEYS.EXAM_DRILLS, {}) || {};
  return all[level] || {};
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
