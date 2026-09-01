// gamification.js - 游戏化激励系统
import { getCoins, getBadges, unlockBadge, getStreak, getLearnedWords, getStats } from './storage.js';

// === 段位系统 ===
export const RANKS = [
  { id: 'bronze',  name: '青铜', icon: '🥉', min: 0,    max: 100,  cls: 'rank-bronze' },
  { id: 'silver',  name: '白银', icon: '🥈', min: 100,  max: 300,  cls: 'rank-silver' },
  { id: 'gold',    name: '黄金', icon: '🥇', min: 300,  max: 700,  cls: 'rank-gold' },
  { id: 'diamond', name: '钻石', icon: '💎', min: 700,  max: 1500, cls: 'rank-diamond' },
  { id: 'king',    name: '王者', icon: '👑', min: 1500, max: Infinity, cls: 'rank-king' }
];

export function getCurrentRank() {
  const coins = getCoins();
  for (const r of RANKS) {
    if (coins >= r.min && coins < r.max) return r;
  }
  return RANKS[RANKS.length - 1];
}

export function getRankProgress() {
  const r = getCurrentRank();
  const coins = getCoins();
  if (r.max === Infinity) {
    return { percent: 100, current: coins, next: '满级' };
  }
  const percent = Math.round(((coins - r.min) / (r.max - r.min)) * 100);
  return {
    percent: Math.min(100, percent),
    current: coins,
    next: r.max,
    pointsToNext: r.max - coins
  };
}

// === 勋章定义 ===
export const BADGES = [
  { id: 'first_word', name: '初学乍练', icon: '🌱', desc: '学会第一个单词' },
  { id: 'words_10',   name: '小有所成', icon: '📖', desc: '累计学习 10 个单词' },
  { id: 'words_50',   name: '词汇能手', icon: '📚', desc: '累计学习 50 个单词' },
  { id: 'words_100',  name: '词汇达人', icon: '🎓', desc: '累计学习 100 个单词' },
  { id: 'streak_3',   name: '学满三天', icon: '🌱', desc: '累计学习 3 天' },
  { id: 'streak_7',   name: '学满七天', icon: '⚡', desc: '累计学习 7 天' },
  { id: 'streak_30',  name: '持之以恒', icon: '🌟', desc: '累计学习 30 天' },
  { id: 'reading_5',  name: '小书虫',   icon: '🐛', desc: '完成 5 篇阅读' },
  { id: 'grammar_master', name: '语法大师', icon: '🧠', desc: '答对 50 道语法题' },
  { id: 'rank_silver',  name: '白银晋升', icon: '🥈', desc: '达到白银段位' },
  { id: 'rank_gold',    name: '黄金晋升', icon: '🥇', desc: '达到黄金段位' },
  { id: 'rank_diamond', name: '钻石晋升', icon: '💎', desc: '达到钻石段位' },
  { id: 'first_essay',  name: '小小作家', icon: '✍️', desc: '完成第一篇作文' },
  // === V0.2 闯关 / 强化 / 背诵 新增勋章 ===
  { id: 'level_10',         name: '过关斩将', icon: '🗺️', desc: '通关 10 个单词关卡' },
  { id: 'level_three_star', name: '完美主义', icon: '🌟', desc: '获得 10 个三星关卡' },
  { id: 'boss_slayer',      name: '屠龙勇士', icon: '🐉', desc: '击败 3 个 Boss 关' },
  { id: 'combo_master',     name: '连击大师', icon: '🔥', desc: '单关达成 10 连击' },
  { id: 'region_clear',     name: '探险家',   icon: '🧭', desc: '通关一个完整大区' },
  { id: 'reinforce_master', name: '攻克难关', icon: '💪', desc: '让 20 个错词毕业' },
  { id: 'recite_perfect',   name: '背诵达人', icon: '🏆', desc: '获得一次 95 分以上背诵' }
];

// 检查并解锁勋章 (每次进度更新时调用)
export function checkBadges() {
  const newBadges = [];
  const learned = getLearnedWords();
  const learnedCount = Object.keys(learned).length;
  // 累计学习天数（history 只增不清零），不用 streak.count——漏一天不清零、不制造断签焦虑
  const totalDays = (getStreak().history || []).length;
  const rank = getCurrentRank();

  if (learnedCount >= 1 && unlockBadge('first_word'))   newBadges.push('first_word');
  if (learnedCount >= 10 && unlockBadge('words_10'))    newBadges.push('words_10');
  if (learnedCount >= 50 && unlockBadge('words_50'))    newBadges.push('words_50');
  if (learnedCount >= 100 && unlockBadge('words_100'))  newBadges.push('words_100');
  if (totalDays >= 3 && unlockBadge('streak_3'))    newBadges.push('streak_3');
  if (totalDays >= 7 && unlockBadge('streak_7'))    newBadges.push('streak_7');
  if (totalDays >= 30 && unlockBadge('streak_30'))  newBadges.push('streak_30');
  if (rank.id === 'silver' && unlockBadge('rank_silver'))   newBadges.push('rank_silver');
  if (rank.id === 'gold' && unlockBadge('rank_gold'))       newBadges.push('rank_gold');
  if (rank.id === 'diamond' && unlockBadge('rank_diamond')) newBadges.push('rank_diamond');

  // === V0.2 闯关相关勋章 ===
  const stats = getStats();
  if ((stats.clearedTotal || 0) >= 10 && unlockBadge('level_10'))        newBadges.push('level_10');
  if ((stats.threeStars || 0) >= 10 && unlockBadge('level_three_star'))  newBadges.push('level_three_star');
  if ((stats.bossKills || 0) >= 3 && unlockBadge('boss_slayer'))         newBadges.push('boss_slayer');
  if ((stats.comboMax || 0) >= 10 && unlockBadge('combo_master'))        newBadges.push('combo_master');
  if ((stats.regionClears || 0) >= 1 && unlockBadge('region_clear'))     newBadges.push('region_clear');
  if ((stats.reinforceGrads || 0) >= 20 && unlockBadge('reinforce_master')) newBadges.push('reinforce_master');

  return newBadges.map(id => BADGES.find(b => b.id === id)).filter(Boolean);
}

// === 卡牌稀有度 ===
export function rollCardRarity(difficulty = 1) {
  // 难度 1-4，难度越高 SSR 概率越高
  const r = Math.random() * 100;
  // base: N 60, R 25, SR 12, SSR 3
  let ssrThreshold = 3 + difficulty * 2; // 5,7,9,11
  let srThreshold = 12 + difficulty * 1;
  let rThreshold = 25;
  if (r < ssrThreshold) return 'SSR';
  if (r < ssrThreshold + srThreshold) return 'SR';
  if (r < ssrThreshold + srThreshold + rThreshold) return 'R';
  return 'N';
}
