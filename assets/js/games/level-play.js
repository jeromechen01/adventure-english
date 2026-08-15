// games/level-play.js - 单关游戏流程
// 这是闯关系统的"游戏核心"：开场仪式、HUD（生命/连击/倍率）、
// 5 种关卡玩法、即时反馈（金币飞行/连击弹跳/暴击/宠物欢呼）、结算（星星点亮/金币滚动/开宝箱）。
import * as storage from '../storage.js';
import { speak, playSound } from '../speech.js';
import { toast, enterFocus, exitFocus, requestLeaveFocus } from '../app.js';
import { rollCardRarity, checkBadges } from '../gamification.js';
import { shuffle } from '../utils/shuffle.js';

const PET_STAGES = ['🥚', '🐣', '🐤', '🦊', '🦁'];

// ---------- 通用小工具 ----------
const speechOK = typeof window !== 'undefined' && 'speechSynthesis' in window;

// ============================================================
// 入口：开始一关
// opts = { grade, lv, totalLevels, isBoss, region, words, allWords, onBack }
// ============================================================
export function startLevel(app, opts) {
  const { grade, lv, isBoss, region, words, allWords, onBack } = opts;

  // ---- 关卡状态 ----
  let hp = 3;
  const maxHp = 3;
  let combo = 0;
  let maxCombo = 0;
  let correctCount = 0;
  let coinsEarned = 0;       // 本关实时获得的金币（不含结算星奖）
  let qIndex = 0;
  let bossHp = 100;
  const timers = [];

  // ---- 出题：8 题，混入 1-2 个错词，分配玩法 ----
  const questions = buildQuestions();
  const totalQ = questions.length;

  function buildQuestions() {
    let qWords = [...words];
    // 混入该年级未毕业的错词（替换部分新词）
    const mistakeWords = storage.getMistakes()
      .map(id => allWords.find(w => w.id === id))
      .filter(Boolean)
      .filter(w => !qWords.some(q => q.id === w.id));
    const inject = Math.min(2, mistakeWords.length, qWords.length - 1);
    const picks = shuffle(mistakeWords).slice(0, inject);
    const slots = shuffle(qWords.map((_, i) => i)).slice(0, inject);
    picks.forEach((mw, i) => { qWords[slots[i]] = mw; });

    // 玩法分配
    if (isBoss) {
      return qWords.map(w => ({ word: w, type: 'boss' }));
    }
    let pool = ['choice', 'spell', 'react'];
    if (speechOK) pool.push('listen');
    pool = shuffle(pool).slice(0, 3); // 本关用 2-3 种轮换
    return qWords.map((w, i) => ({ word: w, type: pool[i % pool.length] }));
  }

  // ---- 计时器封装（便于统一清理）----
  function later(fn, ms) { const t = setTimeout(fn, ms); timers.push(t); return t; }
  function every(fn, ms) { const t = setInterval(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers.length = 0; }

  function quit() { clearTimers(); onBack(); }

  // 答题态：隐藏导航；HUD ✕ / Esc 先确认；任何离开路径都 clearTimers
  // （否则 8 秒倒计时在跳走后超时会记一次错词 + 播错误音效）
  function focusOn() {
    enterFocus({
      remain: () => Math.min(totalQ, totalQ - qIndex + 1),
      leave: quit,
      cleanup: clearTimers
    });
  }

  // ---- 倍率 ----
  function multiplier() {
    if (combo >= 6) return 3;
    if (combo >= 3) return 2;
    return 1;
  }

  // ============================================================
  // 渲染：HUD 外壳
  // ============================================================
  function renderShell() {
    const petEmoji = PET_STAGES[Math.min(storage.getPet().level - 1, 4)];
    app.innerHTML = `
      <div class="level-hud" id="hud">
        <button id="quitBtn" class="hud-chip" style="font-size:20px;min-width:36px" title="退出">✕</button>
        <span class="hud-chip" id="hudHearts">${heartsHtml()}</span>
        <span class="hud-chip" id="hudCombo">🔥 <span>${combo}</span></span>
        <span class="hud-chip hud-mult" id="hudMult">×${multiplier()}</span>
        <span class="hud-chip" id="hudScore">🪙 <span>${coinsEarned}</span></span>
      </div>
      <div style="position:fixed;right:10px;bottom:88px;font-size:40px;z-index:25" id="petCorner">${petEmoji}</div>
      <div id="playArea" class="pt-4"></div>
    `;
    // 答题中先确认；结算/失败页（已退答题态）✕ 直接退出
    app.querySelector('#quitBtn').addEventListener('click', () => requestLeaveFocus(quit));
  }

  function heartsHtml() {
    let s = '';
    for (let i = 0; i < maxHp; i++) {
      s += `<span class="hud-heart ${i >= hp ? 'lost' : ''}">${i >= hp ? '💔' : '❤️'}</span>`;
    }
    return s;
  }
  function updateHud() {
    const h = app.querySelector('#hudHearts'); if (h) h.innerHTML = heartsHtml();
    const c = app.querySelector('#hudCombo'); if (c) c.querySelector('span').textContent = combo;
    const m = app.querySelector('#hudMult'); if (m) m.textContent = '×' + multiplier();
    const s = app.querySelector('#hudScore'); if (s) s.querySelector('span').textContent = coinsEarned;
  }

  // ============================================================
  // 即时反馈特效
  // ============================================================
  function flyCoins(fromEl, amount) {
    const target = document.getElementById('coinDisplay');
    if (!fromEl || !target) return;
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const coin = document.createElement('div');
    coin.className = 'coin-fly';
    coin.textContent = '🪙';
    coin.style.left = (a.left + a.width / 2) + 'px';
    coin.style.top = (a.top + a.height / 2) + 'px';
    document.body.appendChild(coin);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    requestAnimationFrame(() => {
      coin.style.transition = 'transform 0.7s cubic-bezier(.5,-0.3,.7,1), opacity 0.7s';
      coin.style.transform = `translate(${dx}px, ${dy}px) scale(0.6)`;
      coin.style.opacity = '0.2';
    });
    setTimeout(() => coin.remove(), 750);
    // 顶部金币数字刷新（纯展示，独立于关卡计时器）
    setTimeout(() => { target.textContent = storage.getCoins(); }, 700);
  }

  function bumpCombo() {
    const c = app.querySelector('#hudCombo');
    if (c) { c.classList.remove('combo-pop'); void c.offsetWidth; c.classList.add('combo-pop'); }
    const m = app.querySelector('#hudMult');
    if (m) { m.classList.add('bump'); later(() => m.classList.remove('bump'), 200); }
  }
  function petCheer() {
    const p = app.querySelector('#petCorner');
    if (p) { p.classList.remove('pet-cheer'); void p.offsetWidth; p.classList.add('pet-cheer'); }
  }
  function critFlash() {
    const f = document.createElement('div');
    f.className = 'crit-flash';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 500);
  }
  function confetti() {
    const colors = ['#FF6B9D', '#FFD700', '#4ECDC4', '#FF8A4C', '#9F7AEA', '#48BB78'];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.background = colors[i % colors.length];
      p.style.left = Math.random() * 100 + 'vw';
      document.body.appendChild(p);
      const dx = (Math.random() - 0.5) * 200;
      const dy = window.innerHeight + 40;
      const rot = Math.random() * 720;
      requestAnimationFrame(() => {
        p.style.transition = `transform ${1 + Math.random()}s ease-in, opacity 1.4s`;
        p.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 1800);
    }
  }

  // ============================================================
  // 答题结果处理（所有玩法共用）
  // fromEl: 触发金币飞行的来源元素；speedBonus: 限时玩法答得快的额外分
  // ============================================================
  function onAnswer(correct, word, fromEl, speedBonus = 0) {
    if (correct) {
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      correctCount++;

      const crit = Math.random() < 0.1;
      let reward = (5 + speedBonus) * multiplier() * (crit ? 2 : 1);
      reward = Math.round(reward);
      coinsEarned += reward;
      storage.addCoins(reward);
      storage.recordWordResult(word.id, true);
      storage.markWordLearned(word.id);
      storage.addToWordDex(grade, word.id);
      storage.progressDailyTask('words10', 1);

      playSound('correct');
      bumpCombo();
      petCheer();
      if (fromEl) flyCoins(fromEl, reward);
      if (crit) { critFlash(); toast('💥 暴击 ×2！', 'warn'); }
      if (combo === 5 || combo === 10) { confetti(); toast(`🔥${combo}连击！太棒了！`, 'success'); }
      updateHud();
    } else {
      combo = 0;
      hp--;
      storage.recordWordResult(word.id, false); // 自动进错词本
      playSound('wrong');
      const hud = app.querySelector('#hud');
      if (hud) { hud.classList.add('shake'); later(() => hud.classList.remove('shake'), 400); }
      updateHud();
    }
  }

  // 鼓励文案
  const ENCOURAGE = ['没关系，记住它就好！', '差一点点，下次就对啦！', '再看一眼，记住它～', '加油，你可以的！'];
  function encourage() { return ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]; }

  // ============================================================
  // 取干扰项
  // ============================================================
  function distractors(word, key, n) {
    const pool = shuffle(allWords.filter(w => w.id !== word.id && w[key] !== word[key]));
    return pool.slice(0, n);
  }

  // ============================================================
  // 进入下一题 / 结束
  // ============================================================
  function next() {
    clearTimers();
    if (hp <= 0) return renderFail();
    if (isBoss && bossHp <= 0) return renderSettlement();
    if (qIndex >= totalQ) {
      if (isBoss && bossHp > 0) return renderFail(); // Boss 没打完
      return finishNormal();
    }
    const q = questions[qIndex];
    qIndex++;
    const render = {
      choice: renderChoice,
      listen: renderListen,
      spell: renderSpell,
      react: renderReact,
      boss: renderBoss
    }[q.type] || renderChoice;
    render(q.word);
  }

  function finishNormal() {
    const rate = correctCount / totalQ;
    if (rate < 0.5) return renderFail();
    renderSettlement();
  }

  // ============================================================
  // 玩法 1：⚡ 闪电选择（限时 4 选 1，中↔英）
  // ============================================================
  function renderChoice(word) {
    const playArea = app.querySelector('#playArea');
    const zhToEn = Math.random() < 0.5; // 方向随机
    const promptText = zhToEn ? word.meaning : word.word;
    const promptHint = zhToEn ? '选出对应的英文' : '选出对应的中文';
    const key = zhToEn ? 'word' : 'meaning';
    const opts = shuffle([word, ...distractors(word, key, 3)]);

    playArea.innerHTML = `
      <div class="text-center text-xs text-gray-400 mb-1">⚡ 闪电选择 · ${qIndex}/${totalQ}</div>
      <div class="timer-bar-track mb-4"><div class="timer-bar-fill" id="timerBar" style="width:100%"></div></div>
      <div class="card-cartoon text-center mb-5 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div class="text-xs text-gray-400 mb-1">${promptHint}</div>
        <div class="big-title text-primary">${promptText}</div>
        ${zhToEn ? '' : `<button id="hearBtn" class="mt-2 text-2xl tap-bounce">🔊</button>`}
      </div>
      <div class="opt-grid" id="opts">
        ${opts.map((o, i) => `<button class="opt-btn ${zhToEn ? 'font-en' : ''}" data-i="${i}">${zhToEn ? o.word : o.meaning}</button>`).join('')}
      </div>
    `;
    if (!zhToEn) { const hb = playArea.querySelector('#hearBtn'); if (hb) hb.addEventListener('click', () => speak(word.word)); }

    // 8 秒倒计时
    const duration = 8000;
    const start = Date.now();
    const bar = playArea.querySelector('#timerBar');
    const tick = every(() => {
      const left = Math.max(0, 1 - (Date.now() - start) / duration);
      if (bar) bar.style.width = (left * 100) + '%';
      if (left <= 0) { clearTimers(); handlePick(-1); }
    }, 80);

    function handlePick(i) {
      clearTimers();
      const btns = playArea.querySelectorAll('.opt-btn');
      btns.forEach(b => b.disabled = true);
      const correct = opts[i] && opts[i].id === word.id;
      const elapsed = Date.now() - start;
      const speedBonus = correct && elapsed < 3000 ? 3 : 0;
      const correctIdx = opts.findIndex(o => o.id === word.id);
      if (correct) {
        btns[i].classList.add('correct');
        speak(word.word);
        onAnswer(true, word, btns[i], speedBonus);
      } else {
        if (i >= 0 && btns[i]) btns[i].classList.add('wrong');
        if (btns[correctIdx]) btns[correctIdx].classList.add('correct');
        onAnswer(false, word, null);
        toast(`${word.word} = ${word.meaning} · ${encourage()}`, 'info');
      }
      later(next, correct ? 850 : 1500);
    }
    playArea.querySelectorAll('.opt-btn').forEach(b => {
      b.addEventListener('click', () => handlePick(parseInt(b.dataset.i)));
    });
  }

  // ============================================================
  // 玩法 2：🧩 字母拼拼乐（拼对爆炸）
  // ============================================================
  function renderSpell(word) {
    const playArea = app.querySelector('#playArea');
    // 太长的词降级为选择题，避免拼写太难
    if (!/^[a-zA-Z]+$/.test(word.word) || word.word.length > 10) return renderChoice(word);

    const letters = shuffle(word.word.split(''));
    let chosen = [];

    playArea.innerHTML = `
      <div class="text-center text-xs text-gray-400 mb-3">🧩 字母拼拼乐 · ${qIndex}/${totalQ}</div>
      <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div class="text-xs text-gray-400 mb-1">看中文，点字母拼出英语</div>
        <div class="big-title text-primary">${word.meaning}</div>
        <button id="hearBtn" class="mt-1 text-2xl tap-bounce">🔊</button>
      </div>
      <div id="answerArea" class="card-cartoon min-h-[72px] flex items-center justify-center mb-4">
        <div id="answerSlots" class="flex flex-wrap justify-center"></div>
      </div>
      <div id="letterPool" class="flex flex-wrap justify-center"></div>
      <div class="grid grid-cols-2 gap-3 mt-4">
        <button id="clearBtn" class="btn-cartoon btn-cartoon-secondary">↩️ 清空</button>
        <button id="hintBtn" class="btn-cartoon btn-cartoon-secondary">💡 提示</button>
      </div>
    `;
    playArea.querySelector('#hearBtn').addEventListener('click', () => speak(word.word));
    const answerSlots = playArea.querySelector('#answerSlots');
    const letterPool = playArea.querySelector('#letterPool');

    letters.forEach((letter, i) => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile';
      tile.textContent = letter;
      tile.addEventListener('click', () => {
        if (tile.classList.contains('used')) return;
        chosen.push(i);
        const slot = document.createElement('div');
        slot.className = 'letter-tile';
        slot.style.background = '#FF8A4C';
        slot.style.boxShadow = '0 3px 0 #E76F33';
        slot.textContent = letter;
        slot.addEventListener('click', () => {
          slot.remove();
          chosen = chosen.filter(x => x !== i);
          tile.classList.remove('used');
        });
        answerSlots.appendChild(slot);
        tile.classList.add('used');
        playSound('click');

        const built = chosen.map(c => letters[c]).join('');
        if (built.length === word.word.length) {
          if (built.toLowerCase() === word.word.toLowerCase()) {
            // 拼对爆炸特效
            answerSlots.querySelectorAll('.letter-tile').forEach(t => t.classList.add('tile-burst'));
            speak(word.word);
            onAnswer(true, word, answerSlots);
            later(next, 850);
          } else {
            onAnswer(false, word, null);
            const aa = playArea.querySelector('#answerArea');
            aa.classList.add('shake');
            toast(`正确拼写：${word.word} · ${encourage()}`, 'info');
            later(next, 1500);
          }
        }
      });
      letterPool.appendChild(tile);
    });

    playArea.querySelector('#clearBtn').addEventListener('click', () => {
      chosen = [];
      answerSlots.innerHTML = '';
      letterPool.querySelectorAll('.letter-tile').forEach(t => t.classList.remove('used'));
    });
    playArea.querySelector('#hintBtn').addEventListener('click', () => { speak(word.word); toast(`💡 ${word.word}`, 'info'); });
  }

  // ============================================================
  // 玩法 3：👂 听音辨词
  // ============================================================
  function renderListen(word) {
    const playArea = app.querySelector('#playArea');
    const opts = shuffle([word, ...distractors(word, 'word', 3)]);

    playArea.innerHTML = `
      <div class="text-center text-xs text-gray-400 mb-3">👂 听音辨词 · ${qIndex}/${totalQ}</div>
      <div class="card-cartoon text-center mb-5 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div class="text-xs text-gray-400 mb-2">听发音，选出正确的单词</div>
        <button id="playBtn" class="text-6xl tap-bounce">🔊</button>
        <div class="text-xs text-gray-400 mt-2">点喇叭再听一次</div>
      </div>
      <div class="opt-grid" id="opts">
        ${opts.map((o, i) => `<button class="opt-btn font-en" data-i="${i}">${o.word}</button>`).join('')}
      </div>
    `;
    const play = () => speak(word.word);
    playArea.querySelector('#playBtn').addEventListener('click', play);
    later(play, 350);

    playArea.querySelectorAll('.opt-btn').forEach(b => {
      b.addEventListener('click', () => {
        const i = parseInt(b.dataset.i);
        const btns = playArea.querySelectorAll('.opt-btn');
        btns.forEach(x => x.disabled = true);
        const correct = opts[i].id === word.id;
        const correctIdx = opts.findIndex(o => o.id === word.id);
        if (correct) { b.classList.add('correct'); onAnswer(true, word, b); }
        else {
          b.classList.add('wrong'); btns[correctIdx].classList.add('correct');
          onAnswer(false, word, null);
          toast(`正确：${word.word} = ${word.meaning} · ${encourage()}`, 'info');
        }
        later(next, correct ? 850 : 1500);
      });
    });
  }

  // ============================================================
  // 玩法 4：🎯 快速反应（限时点击闪现的正确词）
  // ============================================================
  function renderReact(word) {
    const playArea = app.querySelector('#playArea');
    const opts = shuffle([word, ...distractors(word, 'word', 4)]);

    playArea.innerHTML = `
      <div class="text-center text-xs text-gray-400 mb-1">🎯 快速反应 · ${qIndex}/${totalQ}</div>
      <div class="timer-bar-track mb-3"><div class="timer-bar-fill" id="timerBar" style="width:100%"></div></div>
      <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-green-50 to-cyan-50">
        <div class="text-xs text-gray-400 mb-1">快速点出这个词的英文！</div>
        <div class="big-title text-primary">${word.meaning}</div>
      </div>
      <div id="flashField" class="flex flex-wrap justify-center items-center" style="min-height:160px">
        ${opts.map((o, i) => `<span class="flash-word" data-i="${i}" style="opacity:0">${o.word}</span>`).join('')}
      </div>
    `;
    // 逐个闪现
    const words_ = playArea.querySelectorAll('.flash-word');
    words_.forEach((el, i) => later(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '1'; }, 150 + i * 220));

    const duration = 7000;
    const start = Date.now();
    const bar = playArea.querySelector('#timerBar');
    const tick = every(() => {
      const left = Math.max(0, 1 - (Date.now() - start) / duration);
      if (bar) bar.style.width = (left * 100) + '%';
      if (left <= 0) { clearTimers(); pick(-1); }
    }, 80);

    function pick(i) {
      clearTimers();
      words_.forEach(x => x.style.pointerEvents = 'none');
      const correct = opts[i] && opts[i].id === word.id;
      const elapsed = Date.now() - start;
      if (correct) {
        words_[i].classList.add('target');
        speak(word.word);
        onAnswer(true, word, words_[i], elapsed < 2500 ? 3 : 0);
      } else {
        onAnswer(false, word, null);
        toast(`正确：${word.word} = ${word.meaning} · ${encourage()}`, 'info');
      }
      later(next, correct ? 800 : 1400);
    }
    words_.forEach(el => el.addEventListener('click', () => pick(parseInt(el.dataset.i))));
  }

  // ============================================================
  // 玩法 5：🐉 Boss 战（血条 + 受击 + 反击）
  // ============================================================
  function renderBoss(word) {
    const playArea = app.querySelector('#playArea');
    const bossEmojis = ['🐉', '👹', '🦖'];
    const bossEmoji = bossEmojis[(lv / 5 | 0) % bossEmojis.length];
    const zhToEn = Math.random() < 0.5;
    const promptText = zhToEn ? word.meaning : word.word;
    const key = zhToEn ? 'word' : 'meaning';
    const opts = shuffle([word, ...distractors(word, key, 3)]);
    const dmg = 15; // 每击伤害（6 题左右可击败）

    playArea.innerHTML = `
      <div class="text-center text-xs text-gray-400 mb-1">🐉 Boss 战 · ${qIndex}/${totalQ}</div>
      <div class="text-center mb-1">
        <div class="text-7xl" id="bossEl">${bossEmoji}</div>
      </div>
      <div class="px-6 mb-4">
        <div class="text-xs text-center text-red-500 font-bold mb-1">Boss 血量</div>
        <div class="progress-bar" style="background:#FED7D7">
          <div id="bossBar" style="height:100%;border-radius:999px;background:linear-gradient(90deg,#F56565,#C53030);width:${bossHp}%;transition:width .4s"></div>
        </div>
      </div>
      <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-red-50 to-orange-50">
        <div class="text-xs text-gray-400 mb-1">答对攻击 Boss！</div>
        <div class="big-title text-primary">${promptText}</div>
      </div>
      <div class="opt-grid" id="opts">
        ${opts.map((o, i) => `<button class="opt-btn ${zhToEn ? 'font-en' : ''}" data-i="${i}">${zhToEn ? o.word : o.meaning}</button>`).join('')}
      </div>
    `;
    const bossEl = playArea.querySelector('#bossEl');
    const bossBar = playArea.querySelector('#bossBar');

    playArea.querySelectorAll('.opt-btn').forEach(b => {
      b.addEventListener('click', () => {
        const i = parseInt(b.dataset.i);
        const btns = playArea.querySelectorAll('.opt-btn');
        btns.forEach(x => x.disabled = true);
        const correct = opts[i].id === word.id;
        const correctIdx = opts.findIndex(o => o.id === word.id);
        if (correct) {
          b.classList.add('correct');
          bossHp = Math.max(0, bossHp - dmg);
          if (bossBar) bossBar.style.width = bossHp + '%';
          if (bossEl) { bossEl.classList.add('boss-hit'); later(() => bossEl.classList.remove('boss-hit'), 350); }
          speak(word.word);
          onAnswer(true, word, b);
        } else {
          b.classList.add('wrong'); btns[correctIdx].classList.add('correct');
          onAnswer(false, word, null); // Boss 反击 = 扣心（已在 onAnswer 扣 hp）
          toast(`Boss 反击！正确：${word.word} · ${encourage()}`, 'warn');
        }
        later(next, correct ? 850 : 1400);
      });
    });
  }

  // ============================================================
  // 结算（过关）
  // ============================================================
  function renderSettlement() {
    clearTimers();
    exitFocus(); // 关卡完成，恢复导航
    const rate = correctCount / totalQ;
    let stars = 0;
    if (rate >= 0.9) stars = 3;
    else if (rate >= 0.7) stars = 2;
    else stars = 1;
    if (isBoss) stars = Math.max(stars, bossHp <= 0 ? 2 : 1);

    const prevRec = storage.getLevelProgress(grade)[lv] || { cleared: false };
    const firstClear = !prevRec.cleared;

    // 星奖励
    let bonus = stars === 3 ? 60 : stars === 2 ? 40 : 20;
    let expGain = stars >= 3 ? 20 : stars === 2 ? 10 : 0;
    if (isBoss) bonus *= 2;
    if (firstClear) bonus += 30;
    // 每日首关加成 ×2
    const dailyBoost = storage.consumeDailyFirstClear();
    if (dailyBoost) bonus *= 2;

    storage.addCoins(bonus);
    const petBefore = storage.getPet().level;
    if (expGain) storage.addPetExp(expGain);
    const petAfter = storage.getPet().level;
    const leveledUp = petAfter > petBefore;

    // 保存进度（取最高星）
    storage.saveLevelResult(grade, lv, stars, { score: coinsEarned + bonus, maxCombo, isBoss });

    const showChest = stars === 3 || isBoss;
    const totalCoinThisLevel = coinsEarned + bonus;

    playSound('levelup');
    const playArea = app.querySelector('#playArea');
    playArea.innerHTML = `
      <div class="text-center pt-6 fade-in">
        <div class="big-title bounce-in mb-3">🎉 关卡完成！</div>
        <div id="starRow" class="text-5xl mb-4" style="letter-spacing:6px;min-height:56px"></div>
        <div class="card-cartoon mb-3 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div class="text-sm">获得金币</div>
          <div class="text-4xl font-bold text-primary my-1"><span id="coinRoll">0</span> 🪙</div>
          ${dailyBoost ? '<div class="text-xs text-orange-500 font-bold">每日首关加成 ×2！</div>' : ''}
          ${isBoss ? '<div class="text-xs text-red-500 font-bold">Boss 奖励翻倍！</div>' : ''}
          ${firstClear ? '<div class="text-xs text-green-600">首通奖励 +30</div>' : ''}
        </div>
        <div class="text-sm text-gray-600 mb-2">最高连击 🔥${maxCombo} · 答对 ${correctCount}/${totalQ}</div>
        ${leveledUp ? `<div class="card-cartoon mb-3 bg-gradient-to-br from-purple-50 to-pink-50"><div class="font-bold">🎊 宠物升级到 Lv.${petAfter}！</div></div>` : (expGain ? `<div class="text-xs text-gray-500 mb-2">宠物经验 +${expGain}</div>` : '')}
        <div id="chestSlot" class="mb-3"></div>
        <div id="badgeSlot" class="mb-3"></div>
        <div class="flex gap-3 mt-2">
          <button id="retryBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">🎲 换一批再玩</button>
          <button id="mapBtn" class="flex-1 btn-cartoon">🗺️ 回地图</button>
        </div>
      </div>
    `;

    // 星星逐颗点亮
    const starRow = playArea.querySelector('#starRow');
    for (let i = 0; i < stars; i++) {
      later(() => {
        const s = document.createElement('span');
        s.className = 'star-pop';
        s.textContent = '⭐';
        starRow.appendChild(s);
        playSound('correct');
      }, 400 + i * 450);
    }

    // 金币滚动累加
    later(() => {
      const el = playArea.querySelector('#coinRoll');
      let cur = 0;
      const step = Math.max(1, Math.round(totalCoinThisLevel / 30));
      const roll = setInterval(() => {
        cur = Math.min(totalCoinThisLevel, cur + step);
        if (el) el.textContent = cur;
        if (cur >= totalCoinThisLevel) clearInterval(roll);
      }, 30);
      timers.push(roll);
    }, 400 + stars * 450);

    // 宝箱
    if (showChest) {
      later(() => renderChest(playArea.querySelector('#chestSlot')), 800 + stars * 450);
    }

    // 勋章
    later(() => {
      const newBadges = checkBadges();
      if (newBadges.length) {
        const slot = playArea.querySelector('#badgeSlot');
        if (slot) slot.innerHTML = `
          <div class="card-cartoon bg-gradient-to-br from-purple-50 to-pink-50">
            <div class="font-bold mb-1">🎖️ 新勋章</div>
            ${newBadges.map(b => `<div>${b.icon} ${b.name}</div>`).join('')}
          </div>`;
      }
    }, 1000);

    playArea.querySelector('#retryBtn').addEventListener('click', () => restart());
    playArea.querySelector('#mapBtn').addEventListener('click', quit);
  }

  function renderChest(slot) {
    if (!slot) return;
    slot.innerHTML = `
      <div class="card-cartoon text-center bg-gradient-to-br from-yellow-50 to-orange-100">
        <div class="text-xs text-gray-500 mb-1">通关宝箱！点击打开</div>
        <button id="chestBtn" class="text-6xl chest-wobble">🎁</button>
      </div>`;
    slot.querySelector('#chestBtn').addEventListener('click', function open() {
      const btn = this;
      btn.classList.remove('chest-wobble');
      btn.textContent = '✨';
      playSound('levelup');
      later(() => {
        const drop = openChestReward();
        slot.innerHTML = `
          <div class="card-cartoon text-center bounce-in bg-gradient-to-br from-yellow-50 to-orange-100">
            <div class="text-5xl mb-2">${drop.icon}</div>
            <div class="font-bold">${drop.title}</div>
          </div>`;
        confetti();
      }, 400);
    });
  }

  function openChestReward() {
    const r = Math.random();
    if (isBoss || r < 0.4) {
      // 必掉/优先卡牌
      const w = questions[Math.floor(Math.random() * questions.length)].word;
      const rarity = rollCardRarity(w.difficulty || 1);
      storage.addCard({ wordId: w.id, word: w.word, meaning: w.meaning, rarity, drawnAt: Date.now() });
      return { icon: '🃏', title: `卡牌 [${rarity}] ${w.word}` };
    } else if (r < 0.7) {
      const c = 10 + Math.floor(Math.random() * 21);
      storage.addCoins(c);
      coinsEarned += c;
      return { icon: '🪙', title: `额外金币 +${c}` };
    } else if (r < 0.9) {
      storage.feedPet(20);
      return { icon: '🍖', title: '宠物食物 ×1（已喂食）' };
    }
    return { icon: '🎀', title: '限定装饰 ×1' };
  }

  // ============================================================
  // 失败（不打击，鼓励重试）
  // ============================================================
  function renderFail() {
    clearTimers();
    exitFocus(); // 本关结束，恢复导航
    storage.addPetExp(2); // 玩了就有一点点收获
    playSound('wrong');
    const playArea = app.querySelector('#playArea') || app;
    if (!app.querySelector('#playArea')) renderShell();
    app.querySelector('#playArea').innerHTML = `
      <div class="text-center pt-10 fade-in">
        <div class="text-7xl mb-3 float">💪</div>
        <div class="big-title mb-2">就差一点点！</div>
        <div class="card-cartoon my-4 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div class="text-sm text-gray-600">这次答对了</div>
          <div class="text-4xl font-bold text-secondary my-1">${correctCount}<span class="text-lg text-gray-400"> / ${totalQ}</span></div>
          <div class="text-sm text-gray-600">个单词，金币照样到账 🪙${coinsEarned}</div>
        </div>
        <div class="text-sm text-gray-500 mb-5">再试一次说不定就过了！</div>
        <div class="flex gap-3">
          <button id="retryBtn" class="flex-1 btn-cartoon">🔄 重新挑战（题目会变）</button>
          <button id="mapBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">回地图</button>
        </div>
      </div>
    `;
    app.querySelector('#retryBtn').addEventListener('click', () => restart());
    app.querySelector('#mapBtn').addEventListener('click', quit);
  }

  // ============================================================
  // 重新开始本关
  // ============================================================
  function restart() {
    clearTimers();
    hp = maxHp; combo = 0; maxCombo = 0; correctCount = 0; coinsEarned = 0;
    qIndex = 0; bossHp = 100;
    // 重新分配题目（重新洗牌玩法/错词）
    questions.length = 0;
    buildQuestions().forEach(q => questions.push(q));
    focusOn(); // 结算/失败页退出过答题态，重开要再进
    renderShell();
    startCountdown();
  }

  // ============================================================
  // 开场仪式 3-2-1
  // ============================================================
  function startCountdown() {
    const overlay = document.createElement('div');
    overlay.className = 'countdown-overlay';
    overlay.innerHTML = `
      <div class="text-2xl font-bold mb-2">第 ${lv} 关${isBoss ? ' · Boss 战 🐉' : ''}</div>
      <div class="text-base mb-1">${region.icon} ${region.name}</div>
      <div class="text-lg mb-6">准备好了吗？</div>
      <div class="count-num" id="countNum">3</div>
    `;
    document.body.appendChild(overlay);
    const numEl = overlay.querySelector('#countNum');
    let n = 3;
    playSound('click');
    const iv = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(iv);
        overlay.remove();
        next();
        return;
      }
      numEl.textContent = n;
      numEl.classList.remove('count-num'); void numEl.offsetWidth; numEl.classList.add('count-num');
      playSound('click');
    }, 900);
    timers.push(iv);
  }

  // ---- 启动 ----
  focusOn();
  renderShell();
  startCountdown();
}
