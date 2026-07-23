// games/shoot-game.js - 单词打地鼠 (限时 60 秒)
import * as storage from '../storage.js';
import { speak, playSound } from '../speech.js';
import { shuffle } from '../utils/shuffle.js';

export function renderShootGame(app, data, grade) {
  const allWords = data.units.flatMap(u => u.words);
  if (allWords.length < 6) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">单词数量不足</div>';
    return;
  }

  let timeLeft = 60;
  let score = 0;
  let combo = 0;
  let lives = 3;
  let timer = null;
  let countdownTimer = null;
  let currentTarget = null;
  let activeMoles = []; // 当前在屏幕上的字
  let isStarted = false;


  function pickNewTarget() {
    const others = shuffle(allWords).slice(0, 5);
    const target = shuffle(allWords)[0];
    currentTarget = target;
    activeMoles = shuffle([target, ...others.filter(w => w.id !== target.id).slice(0, 5)]);
    return target;
  }

  function renderStart() {
    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-xl font-bold">🎯 单词打地鼠</h2>
      </div>
      <div class="card-cartoon text-center py-12 bg-gradient-to-br from-green-50 to-cyan-50">
        <div class="text-7xl mb-4 float">🎯</div>
        <h3 class="text-xl font-bold mb-2">60 秒挑战</h3>
        <p class="text-sm text-gray-600 mb-1">屏幕显示中文，点击正确的英文单词</p>
        <p class="text-sm text-gray-600 mb-1">每答对一个 +10 🪙，连击有奖励</p>
        <p class="text-sm text-gray-600 mb-6">错 3 次或时间到游戏结束</p>
        <button id="startBtn" class="btn-cartoon">🚀 开始挑战</button>
      </div>
    `;
    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
    app.querySelector('#startBtn').addEventListener('click', () => {
      isStarted = true;
      startGame();
    });
  }

  function renderHUD() {
    return `
      <div class="flex items-center justify-between mb-3 sticky top-16 bg-cream py-2 z-10">
        <button id="quitBtn" class="text-sm text-gray-500">退出</button>
        <div class="flex gap-3 text-sm font-bold">
          <span>⏱️ ${timeLeft}s</span>
          <span class="text-primary">⭐ ${score}</span>
          <span>${'❤️'.repeat(lives)}</span>
          ${combo >= 2 ? `<span class="text-orange-500">🔥${combo}</span>` : ''}
        </div>
      </div>
    `;
  }

  function startGame() {
    pickNewTarget();
    renderRound();

    countdownTimer = setInterval(() => {
      timeLeft--;
      const tEl = app.querySelector('#timeBadge');
      if (tEl) tEl.textContent = `⏱️ ${timeLeft}s`;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function renderRound() {
    if (!isStarted) return;
    const target = currentTarget;

    app.innerHTML = `
      <div class="flex items-center justify-between mb-3 sticky top-16 bg-cream py-2 z-10">
        <button id="quitBtn" class="text-sm text-gray-500">退出</button>
        <div class="flex gap-3 text-sm font-bold">
          <span id="timeBadge">⏱️ ${timeLeft}s</span>
          <span class="text-primary">⭐ ${score}</span>
          <span>${'❤️'.repeat(lives)}</span>
          ${combo >= 2 ? `<span class="text-orange-500">🔥${combo}</span>` : ''}
        </div>
      </div>

      <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-green-50 to-cyan-50">
        <div class="text-xs text-gray-400">点击下方正确的英文</div>
        <div class="text-3xl font-bold text-primary my-3">${target.meaning}</div>
        <div class="text-xs text-gray-400">${target.pos || ''}</div>
      </div>

      <div id="moleField" class="grid grid-cols-2 gap-3" style="min-height:300px"></div>
    `;

    app.querySelector('#quitBtn').addEventListener('click', endGame);

    const field = app.querySelector('#moleField');
    activeMoles.forEach((w, i) => {
      const mole = document.createElement('button');
      mole.className = 'card-cartoon text-center py-5 tap-bounce font-en text-lg font-bold bounce-in';
      mole.style.animationDelay = (i * 0.05) + 's';
      mole.textContent = w.word;
      mole.addEventListener('click', () => {
        if (w.id === target.id) handleHit(target, mole);
        else handleMiss(w, mole, target);
      });
      field.appendChild(mole);
    });
  }

  function handleHit(target, moleEl) {
    combo++;
    const reward = 10 + Math.min(combo - 1, 10);
    score += reward;
    storage.addCoins(reward);
    storage.markWordLearned(target.id);
    storage.recordWordResult(target.id, true);
    storage.addPetExp(1);
    storage.progressDailyTask('words10', 1);
    playSound('correct');
    speak(target.word);
    moleEl.style.background = '#48BB78';
    moleEl.style.color = 'white';
    moleEl.classList.add('bounce-in');

    setTimeout(() => {
      pickNewTarget();
      renderRound();
    }, 400);
  }

  function handleMiss(picked, moleEl, target) {
    combo = 0;
    lives--;
    storage.recordWordResult(target.id, false);
    playSound('wrong');
    moleEl.style.background = '#F56565';
    moleEl.style.color = 'white';
    moleEl.classList.add('shake');

    if (lives <= 0) {
      setTimeout(endGame, 600);
    } else {
      setTimeout(() => renderRound(), 700);
    }
  }

  function endGame() {
    isStarted = false;
    clearInterval(countdownTimer);

    app.innerHTML = `
      <div class="text-center py-10 fade-in">
        <div class="text-6xl mb-4 bounce-in">${score >= 100 ? '🏆' : '🎯'}</div>
        <h2 class="text-2xl font-bold mb-2">游戏结束</h2>
        <div class="card-cartoon my-4 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div class="text-sm">最终得分</div>
          <div class="text-4xl font-bold text-primary my-2">${score}</div>
          <div class="text-xs text-gray-500">${score >= 200 ? '🎉 单词大师！' : score >= 100 ? '👍 不错的成绩！' : '加油，下次更好！'}</div>
        </div>
        <div class="flex gap-3 mt-6">
          <button id="againBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">再来一局</button>
          <button id="doneBtn" class="flex-1 btn-cartoon">返回</button>
        </div>
      </div>
    `;
    app.querySelector('#againBtn').addEventListener('click', () => {
      timeLeft = 60; score = 0; combo = 0; lives = 3;
      renderStart();
    });
    app.querySelector('#doneBtn').addEventListener('click', () => window.__nav('words'));
    playSound('levelup');
  }

  renderStart();
}
