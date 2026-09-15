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

// ============================================================
// PL0 听力训练：英文语音清单 + 双声道对话朗读（Web Speech 实时合成，不入库任何音频）
// ============================================================

export function isTTSSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
}

// 直接取当前可用的英文语音（不走 voicesCache，语音检查页要看最新状态）
export function listEnglishVoices() {
  if (!isTTSSupported()) return [];
  try {
    return window.speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang || ''));
  } catch (e) { return []; }
}

// Chrome/Android 的 getVoices() 首次可能为空，要等 voiceschanged；最多等 timeout 毫秒
export function waitForVoices(timeout = 1500) {
  return new Promise(resolve => {
    if (!isTTSSupported()) return resolve([]);
    const now = listEnglishVoices();
    if (now.length) return resolve(now);
    let done = false;
    const finish = () => { if (done) return; done = true; resolve(listEnglishVoices()); };
    try { window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true }); } catch (e) { /* 旧实现无 addEventListener */ }
    setTimeout(finish, timeout);
  });
}

// 按名字猜性别（各平台命名不统一，只做优先级，猜不到就按顺序取两个不同的声音）
const MALE_RE = /male|\b(david|daniel|mark|george|james|alex|fred|ryan|guy|arthur|aaron|thomas|tom|rishi|eddy|oliver|liam|william|brian|christopher|matthew|andrew|jamie|ravi|prabhat|sonoo|kevin|lee|bruce|ralph|junior|reed|rocko|grandpa|jacques)\b/i;
const FEMALE_RE = /female|\b(samantha|karen|moira|zira|susan|hazel|libby|sonia|victoria|fiona|tessa|kate|serena|allison|ava|nicky|martha|emma|jenny|aria|ana|natasha|catherine|clara|mia|sara|sarah|linda|susan|joanna|amy|kendra|kimberly|salli|olivia|heera|neerja|ivy|molly|maisie|abbi|bella|hollie|libby|ella|zoe|flo|shelley|sandy|grandma|kathy|princess|whisper)\b/i;
function guessSex(v) {
  const n = String(v.name || '');
  if (/\bfemale\b/i.test(n)) return 'f';
  if (/\bmale\b/i.test(n)) return 'm';
  if (FEMALE_RE.test(n)) return 'f';
  if (MALE_RE.test(n)) return 'm';
  // Google 的两个默认声：US English 是女声，UK English Male/Female 已由上面覆盖
  if (/google us english/i.test(n)) return 'f';
  return '?';
}

// 挑两个声音分饰对话双方：优先一男一女；不够就取两个不同的英文声；只有一个时用音调差异区分。
// 返回 { m:{voice,pitch}, f:{voice,pitch}, single:boolean, count }
export function pickDialogueVoices(voices) {
  const list = voices || listEnglishVoices();
  const withSex = list.map(v => ({ v, sex: guessSex(v), local: v.localService !== false }));
  // 本机语音优先（离线可用、延迟低）
  withSex.sort((a, b) => (b.local - a.local));
  const male = withSex.find(x => x.sex === 'm');
  const female = withSex.find(x => x.sex === 'f');
  if (male && female) {
    return { m: { voice: male.v, pitch: 1 }, f: { voice: female.v, pitch: 1 }, single: false, count: list.length };
  }
  if (list.length >= 2) {
    // 至少两个不同声音：第一个给 A（男/第一说话人），第二个给 B
    const a = (male || female || withSex[0]).v;
    const b = withSex.find(x => x.v !== a).v;
    return male
      ? { m: { voice: a, pitch: 1 }, f: { voice: b, pitch: 1.1 }, single: false, count: list.length }
      : { m: { voice: b, pitch: 0.9 }, f: { voice: a, pitch: 1 }, single: false, count: list.length };
  }
  if (list.length === 1) {
    // 只有一个声：低音调当男声、高音调当女声
    return { m: { voice: list[0], pitch: 0.75 }, f: { voice: list[0], pitch: 1.25 }, single: true, count: 1 };
  }
  return { m: { voice: null, pitch: 0.75 }, f: { voice: null, pitch: 1.25 }, single: true, count: 0 };
}

// 逐 turn 朗读对话：turns = [{ sex:'m'|'f', text }]，turn 之间停 gap 毫秒（默认 700，规范 0.6-0.8 秒）。
// 只提供「播放 / 取消」——iOS 的 speechSynthesis.pause/resume 不可靠，故意不做拖动与暂停。
// 返回 { cancel() }；onTurn(i) 每段开始时回调，onEnd(finished:boolean) 结束或取消时回调一次。
let dialogueSeq = 0;
const utterKeep = []; // Chrome 会在 utterance 被 GC 后不触发 onend，先攥住引用
export function speakDialogue(turns, options = {}) {
  const seq = ++dialogueSeq;
  const rate = options.rate || 0.9;
  const gap = options.gap == null ? 700 : options.gap;
  const voices = options.voices || pickDialogueVoices();
  let ended = false, timer = null, guard = null;
  const finish = (finished) => {
    if (ended) return;
    ended = true;
    clearTimeout(timer); clearTimeout(guard);
    utterKeep.length = 0;
    if (options.onEnd) { try { options.onEnd(finished); } catch (e) { console.error(e); } }
  };
  const cancel = () => {
    if (ended) return;
    clearTimeout(timer); clearTimeout(guard);
    if (isTTSSupported()) { try { window.speechSynthesis.cancel(); } catch (e) { /* 忽略 */ } }
    finish(false);
  };
  if (!isTTSSupported() || !turns || !turns.length) {
    setTimeout(() => finish(false), 0);
    return { cancel };
  }
  try { window.speechSynthesis.cancel(); } catch (e) { /* 忽略 */ }

  const playTurn = (i) => {
    if (ended || seq !== dialogueSeq) return;
    if (i >= turns.length) return finish(true);
    const t = turns[i];
    const slot = t.sex === 'm' ? voices.m : voices.f;
    const u = new SpeechSynthesisUtterance(t.text);
    u.lang = (slot.voice && slot.voice.lang) || 'en-GB';
    if (slot.voice) u.voice = slot.voice;
    u.rate = rate;
    u.pitch = slot.pitch;
    u.volume = 1;
    let moved = false;
    const next = () => {
      if (moved || ended) return;
      moved = true;
      clearTimeout(guard);
      timer = setTimeout(() => playTurn(i + 1), gap);
    };
    u.onend = next;
    u.onerror = (ev) => {
      // 用户取消（cancel()）会触发 interrupted/canceled，此时已 finish；其余错误跳到下一段
      if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) return;
      if (options.onError) { try { options.onError(ev); } catch (e) { /* 忽略 */ } }
      next();
    };
    // 兜底：个别平台不触发 onend（无声音/合成失败），按字数估时长后强制推进，避免播放态卡死
    const est = Math.min(20000, Math.max(2500, t.text.length * 90 / rate)) + 2500;
    guard = setTimeout(next, est);
    utterKeep.push(u);
    if (options.onTurn) { try { options.onTurn(i, t); } catch (e) { /* 忽略 */ } }
    try { window.speechSynthesis.speak(u); } catch (e) { next(); }
  };
  // cancel() 之后立刻 speak 在部分 Chrome 版本会被吞掉，稍等再开口
  timer = setTimeout(() => playTurn(0), 120);
  return { cancel };
}
