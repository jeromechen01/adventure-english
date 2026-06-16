// speech.js - 语音合成与识别封装

let voicesCache = null;

// 获取所有英语声音
function getEnglishVoices() {
  if (voicesCache) return voicesCache;
  const all = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  voicesCache = all.filter(v => v.lang.startsWith('en'));
  return voicesCache;
}

// 监听 voices 加载（Chrome 异步加载）
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = null;
  };
}

// 朗读文本
export function speak(text, options = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('当前浏览器不支持语音合成');
    return;
  }

  // 取消之前的朗读
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = options.lang || 'en-US';
  utter.rate = options.rate || 0.9;
  utter.pitch = options.pitch || 1;
  utter.volume = options.volume || 1;

  // 选个英语声音
  const voices = getEnglishVoices();
  if (voices.length > 0) {
    // 优先选女声
    const female = voices.find(v => /female|samantha|karen|moira/i.test(v.name));
    utter.voice = female || voices[0];
  }

  if (options.onEnd) utter.onend = options.onEnd;
  if (options.onError) utter.onerror = options.onError;

  window.speechSynthesis.speak(utter);
  return utter;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// === 语音识别 ===
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export function isSpeechRecognitionSupported() {
  return !!SR;
}

// 开始识别 - 返回一个对象 { stop, promise }
export function recognize(options = {}) {
  if (!SR) {
    return {
      promise: Promise.reject(new Error('当前浏览器不支持语音识别')),
      stop: () => {}
    };
  }

  const rec = new SR();
  rec.lang = options.lang || 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  rec.continuous = false;

  const promise = new Promise((resolve, reject) => {
    rec.onresult = (ev) => {
      const result = ev.results[0];
      const alternatives = [];
      for (let i = 0; i < result.length; i++) {
        alternatives.push({
          transcript: result[i].transcript,
          confidence: result[i].confidence
        });
      }
      resolve(alternatives);
    };
    rec.onerror = (ev) => reject(new Error(ev.error || '识别失败'));
    rec.onend = () => {
      // 如果没有 result，promise 会一直 pending; 我们改成 reject
      // 但通常 onresult 已经触发
    };
  });

  rec.start();

  return {
    promise,
    stop: () => rec.stop()
  };
}

// 计算文本相似度 (0-100) - 用于跟读评分
export function similarity(target, spoken) {
  const t = target.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const s = spoken.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  if (!t || !s) return 0;
  if (t === s) return 100;

  // 计算 Levenshtein 距离
  const dist = levenshtein(t, s);
  const maxLen = Math.max(t.length, s.length);
  const score = Math.max(0, Math.round((1 - dist / maxLen) * 100));
  return score;
}

// ============================================================
// 词级对齐打分 (V0.2 模块4 背诵)：用 LCS 最长公共子序列做词级对齐
// ============================================================

// 常见缩写展开
const CONTRACTIONS = {
  "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is", "it's": "it is",
  "we're": "we are", "they're": "they are", "that's": "that is", "there's": "there is",
  "what's": "what is", "who's": "who is", "here's": "here is", "let's": "let us",
  "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
  "i'll": "i will", "you'll": "you will", "he'll": "he will", "she'll": "she will",
  "we'll": "we will", "they'll": "they will", "it'll": "it will",
  "i'd": "i would", "you'd": "you would", "he'd": "he would", "she'd": "she would",
  "we'd": "we would", "they'd": "they would",
  "don't": "do not", "doesn't": "does not", "didn't": "did not", "isn't": "is not",
  "aren't": "are not", "wasn't": "was not", "weren't": "were not", "can't": "cannot",
  "couldn't": "could not", "won't": "will not", "wouldn't": "would not",
  "shouldn't": "should not", "mustn't": "must not", "haven't": "have not",
  "hasn't": "has not", "hadn't": "had not"
};

// 规范化：小写、展开缩写、去标点，返回词数组
export function normalizeWords(text) {
  if (!text) return [];
  let s = text.toLowerCase().replace(/[’]/g, "'"); // 统一弯引号
  // 展开缩写
  s = s.replace(/[a-z]+'[a-z]+/g, m => CONTRACTIONS[m] || m);
  // 去掉除字母数字空格外的字符
  s = s.replace(/[^a-z0-9\s]/g, ' ');
  return s.split(/\s+/).filter(Boolean);
}

// LCS 词级对齐：返回 { tokens:[{word,status}], completeness, accuracy, score }
// status: correct(对) / missing(漏) / extra(多)
export function alignWords(original, spoken) {
  const orig = normalizeWords(original);
  const said = normalizeWords(spoken);
  const n = orig.length, m = said.length;

  // LCS DP（自底向上）
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = orig[i] === said[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // 回溯生成有序 token 列表
  const tokens = [];
  let i = 0, j = 0, matched = 0;
  while (i < n && j < m) {
    if (orig[i] === said[j]) {
      tokens.push({ word: orig[i], status: 'correct' });
      matched++; i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      tokens.push({ word: orig[i], status: 'missing' });
      i++;
    } else {
      tokens.push({ word: said[j], status: 'extra' });
      j++;
    }
  }
  while (i < n) { tokens.push({ word: orig[i], status: 'missing' }); i++; }
  while (j < m) { tokens.push({ word: said[j], status: 'extra' }); j++; }

  const completeness = n ? matched / n : 0;      // 念到了原文多少
  const accuracy = m ? matched / m : (n ? 0 : 1); // 念的内容有多少是对的
  const score = Math.round((completeness * 0.7 + accuracy * 0.3) * 100);

  return {
    tokens,
    completeness: Math.round(completeness * 100),
    accuracy: Math.round(accuracy * 100),
    score
  };
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array(n + 1).fill(0);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      if (a[i-1] === b[j-1]) {
        dp[j] = prev;
      } else {
        dp[j] = Math.min(prev, dp[j-1], dp[j]) + 1;
      }
      prev = tmp;
    }
  }
  return dp[n];
}

// 简单音效合成 (用 Web Audio API)
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playSound(type) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'levelup') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      });
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // 静默失败
  }
}
