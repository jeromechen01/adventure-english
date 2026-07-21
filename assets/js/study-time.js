// study-time.js —— V0.7 学习时长计时器
// 原理：只记「页面前台可见」的停留时长。visibilitychange 切走/息屏即暂停，
// 15 秒心跳落盘防意外关闭丢数据。诚实统计，不猜测"是否真的在学"。
// 定位：给家长看分布和趋势的中性工具，与 120 分钟健康护栏一条心。
import * as storage from './storage.js';

const HEARTBEAT_MS = 15000;      // 心跳间隔
const MAX_GAP_SEC = 45;          // 单次累加上限（防休眠等异常大跳变）

// 模块元信息：id → { label, icon }（学习时长页展示用）
export const STUDY_MODULES = {
  'vocab':         { label: '词汇闯关', icon: '🧗' },
  'grammar':       { label: '语法', icon: '🧩' },
  'reading':       { label: '阅读', icon: '📖' },
  'writing':       { label: '写作', icon: '✍️' },
  'pet-vocab':     { label: 'PET 词库', icon: '🎓' },
  'pet-reading':   { label: 'PET 阅读', icon: '📰' },
  'ket-vocab':     { label: 'KET 词汇', icon: '🎯' },
  'ket-knowledge': { label: 'KET 知识点', icon: '💡' },
  'ket-grammar':   { label: 'KET 语法课', icon: '🎼' },
  'ket-reading':   { label: 'KET 阅读训练', icon: '📖' },
  'ket-writing':   { label: 'KET 写作', icon: '✍️' },
  'ket-mock':      { label: 'KET 模考', icon: '📝' }
};

// 非学习页不计时（首页/我的/榜单/统计页本身/备考中心的打卡·资源·报告·计划·Dashboard）
const NON_LEARNING = new Set([
  'home', 'me', 'leaderboard', 'timestats',
  'exam-hub', 'exam-plan', 'exam-checkin', 'exam-resources', 'exam-report'
]);

// 路由页面 → 学习模块 id（null = 不计时）。颗粒度到大模块，不细到每一关。
export function moduleForPage(page, grade) {
  if (!page || NON_LEARNING.has(page)) return null;
  const examMap = {
    'exam-knowledge': 'ket-knowledge',
    'exam-grammar': 'ket-grammar',
    'exam-reading': 'ket-reading',
    'exam-writing': 'ket-writing',
    'exam-mock': 'ket-mock'
  };
  if (examMap[page]) return examMap[page];
  if (page === 'petlevels') return 'pet-vocab';
  if (['words', 'levels', 'reinforce', 'mistakes', 'learn'].includes(page)) {
    return grade === 'PET' ? 'pet-vocab' : grade === 'KET' ? 'ket-vocab' : 'vocab';
  }
  if (page === 'grammar') return 'grammar';
  if (page === 'reading') return grade === 'PET' ? 'pet-reading' : 'reading';
  if (page === 'writing') return 'writing';
  return null; // 未知页面不计，宁可少记不多记
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let currentModule = null;
let lastTick = null; // 上次累加时间戳；null = 暂停中

// 把 lastTick 到现在的时长累加到当前模块（带上限防跳变）
function accumulate() {
  if (!currentModule || lastTick === null) return;
  const now = Date.now();
  const sec = Math.min(Math.round((now - lastTick) / 1000), MAX_GAP_SEC);
  if (sec > 0) {
    try { storage.recordStudyTime(todayISO(), currentModule, sec); } catch (e) { /* 计时绝不影响功能 */ }
  }
  lastTick = now;
}

// 路由切换打点：navigate() 每次调用
export function trackPage(page, grade) {
  accumulate();
  currentModule = moduleForPage(page, grade);
  lastTick = (currentModule && document.visibilityState === 'visible') ? Date.now() : null;
}

// —— 自动初始化（模块加载即挂监听，开销极小）——
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    accumulate();       // 切走/息屏：结算并暂停
    lastTick = null;
  } else if (currentModule) {
    lastTick = Date.now(); // 回到前台：重新起表
  }
});

// 页面关闭/跳转前尽量落盘
window.addEventListener('pagehide', accumulate);

// 轻量心跳：15 秒落盘一次，防止意外关闭丢数据
setInterval(() => {
  if (document.visibilityState === 'visible') accumulate();
}, HEARTBEAT_MS);
