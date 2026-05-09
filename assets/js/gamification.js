// gamification.js - 游戏化激励系统
import { getCoins, getBadges, unlockBadge, getStreak, getLearnedWords } from './storage.js';

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
  { id: 'words_100',  name: '百词斩',   icon: '🎓', desc: '累计学习 100 个单词' },
  { id: 'streak_3',   name: '坚持三日', icon: '🔥', desc: '连续打卡 3 天' },
  { id: 'streak_7',   name: '一周达人', icon: '⚡', desc: '连续打卡 7 天' },
  { id: 'streak_30',  name: '持之以恒', icon: '🌟', desc: '连续打卡 30 天' },
  { id: 'reading_5',  name: '小书虫',   icon: '🐛', desc: '完成 5 篇阅读' },
  { id: 'grammar_master', name: '语法大师', icon: '🧠', desc: '答对 50 道语法题' },
  { id: 'rank_silver',  name: '白银晋升', icon: '🥈', desc: '达到白银段位' },
  { id: 'rank_gold',    name: '黄金晋升', icon: '🥇', desc: '达到黄金段位' },
  { id: 'rank_diamond', name: '钻石晋升', icon: '💎', desc: '达到钻石段位' },
  { id: 'first_essay',  name: '挥毫泼墨', icon: '✍️', desc: '完成第一篇作文' }
];

// 检查并解锁勋章 (每次进度更新时调用)
export function checkBadges() {
  const newBadges = [];
  const learned = getLearnedWords();
  const learnedCount = Object.keys(learned).length;
  const streak = getStreak();
  const rank = getCurrentRank();

  if (learnedCount >= 1 && unlockBadge('first_word'))   newBadges.push('first_word');
  if (learnedCount >= 10 && unlockBadge('words_10'))    newBadges.push('words_10');
  if (learnedCount >= 50 && unlockBadge('words_50'))    newBadges.push('words_50');
  if (learnedCount >= 100 && unlockBadge('words_100'))  newBadges.push('words_100');
  if (streak.count >= 3 && unlockBadge('streak_3'))    newBadges.push('streak_3');
  if (streak.count >= 7 && unlockBadge('streak_7'))    newBadges.push('streak_7');
  if (streak.count >= 30 && unlockBadge('streak_30'))  newBadges.push('streak_30');
  if (rank.id === 'silver' && unlockBadge('rank_silver'))   newBadges.push('rank_silver');
  if (rank.id === 'gold' && unlockBadge('rank_gold'))       newBadges.push('rank_gold');
  if (rank.id === 'diamond' && unlockBadge('rank_diamond')) newBadges.push('rank_diamond');

  return newBadges.map(id => BADGES.find(b => b.id === id)).filter(Boolean);
}

// === 虚拟排行榜 ===
const VIRTUAL_PLAYERS = [
  { name: 'Tom', coins: 0, avatar: '🐯' },
  { name: '小明',  coins: 0, avatar: '🐶' },
  { name: 'Lisa', coins: 0, avatar: '🐱' },
  { name: '李雷',  coins: 0, avatar: '🦁' },
  { name: 'Mike', coins: 0, avatar: '🐼' },
  { name: '韩梅梅',coins: 0, avatar: '🐰' },
  { name: 'Anna', coins: 0, avatar: '🦊' },
  { name: '王伟',  coins: 0, avatar: '🐻' },
  { name: 'Bob',  coins: 0, avatar: '🐵' },
  { name: '张华',  coins: 0, avatar: '🐧' }
];

// 基于种子的伪随机，让虚拟玩家分数稳定
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getLeaderboard() {
  const userCoins = getCoins();
  const today = new Date();
  const seed = today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate();

  const players = VIRTUAL_PLAYERS.map((p, idx) => ({
    ...p,
    coins: Math.round(seededRandom(seed + idx) * Math.max(userCoins * 1.5, 800)),
    isUser: false
  }));

  players.push({
    name: '我',
    coins: userCoins,
    avatar: '🦊',
    isUser: true
  });

  players.sort((a, b) => b.coins - a.coins);
  return players;
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
