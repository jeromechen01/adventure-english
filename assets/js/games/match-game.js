// games/match-game.js - 单词消消乐 / 拼字母
import * as storage from '../storage.js';
import { speak, playSound } from '../speech.js';
import { toast, enterFocus, exitFocus } from '../app.js';
import { shuffle } from '../utils/shuffle.js';

export function renderMatchGame(app, data, grade) {
  // 把所有单词扁平化
  const allWords = data.units.flatMap(u => u.words);
  // 过滤掉太长的单词 (大于10个字母)
  const playable = allWords.filter(w => /^[a-zA-Z]+$/.test(w.word) && w.word.length <= 10);

  if (playable.length === 0) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">🦊📚</span><div class="empty-text">这里还没有可玩的单词</div><div class="empty-sub">先去学习几个新单词再来挑战吧！</div></div>';
    return;
  }

  let queue = shuffle([...playable]).slice(0, 10);
  let idx = 0;
  let score = 0;
  let combo = 0;


  function renderRound() {
    if (idx >= queue.length) return renderEnd();
    // ★ 级轻场景：只隐藏导航防误触（金币逐词入账，中途退不弹确认）
    enterFocus({ confirm: false });
    const w = queue[idx];
    const letters = shuffle(w.word.split(''));
    let chosen = []; // 当前已点击的字母索引

    app.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <div class="flex gap-3 text-sm">
          <span>题目: ${idx + 1}/${queue.length}</span>
          <span class="text-primary font-bold">⭐ ${score}</span>
          ${combo >= 2 ? `<span class="text-orange-500 font-bold">🔥${combo}连击</span>` : ''}
        </div>
      </div>

      <div class="card-cartoon text-center mb-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div class="text-xs text-gray-400">看中文，点字母拼出英语</div>
        <div class="text-3xl font-bold text-primary my-3">${w.meaning}</div>
        <div class="text-xs text-gray-400">${w.pos || ''}</div>
      </div>

      <!-- 答案区 -->
      <div id="answerArea" class="card-cartoon min-h-[80px] flex items-center justify-center mb-4">
        <div id="answerSlots" class="flex flex-wrap justify-center"></div>
      </div>

      <!-- 字母池 -->
      <div id="letterPool" class="flex flex-wrap justify-center"></div>

      <div class="grid grid-cols-3 gap-2 mt-4">
        <button id="hintBtn" class="btn-cartoon btn-cartoon-secondary text-sm">💡 提示 (-2🪙)</button>
        <button id="clearBtn" class="btn-cartoon btn-cartoon-secondary text-sm">↩️ 清空</button>
        <button id="skipBtn" class="btn-cartoon btn-cartoon-secondary text-sm">跳过</button>
      </div>
    `;

    const answerSlots = app.querySelector('#answerSlots');
    const letterPool = app.querySelector('#letterPool');

    // 渲染字母池
    letters.forEach((letter, i) => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile';
      tile.textContent = letter;
      tile.dataset.idx = i;
      tile.addEventListener('click', () => {
        if (tile.classList.contains('used')) return;
        chosen.push(i);
        const slot = document.createElement('div');
        slot.className = 'letter-tile';
        slot.style.background = '#FF8A4C';
        slot.style.boxShadow = '0 3px 0 #E76F33';
        slot.textContent = letter;
        slot.dataset.poolIdx = i;
        slot.addEventListener('click', () => {
          // 反向移除
          slot.remove();
          chosen = chosen.filter(x => x !== parseInt(slot.dataset.poolIdx));
          tile.classList.remove('used');
        });
        answerSlots.appendChild(slot);
        tile.classList.add('used');
        playSound('click');

        // 检查是否完成
        const built = chosen.map(i => letters[i]).join('');
        if (built.length === w.word.length) {
          if (built.toLowerCase() === w.word.toLowerCase()) {
            handleCorrect(w);
          } else {
            handleWrong(w);
          }
        }
      });
      letterPool.appendChild(tile);
    });

    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
    app.querySelector('#clearBtn').addEventListener('click', () => {
      chosen = [];
      answerSlots.innerHTML = '';
      letterPool.querySelectorAll('.letter-tile').forEach(t => t.classList.remove('used'));
    });
    app.querySelector('#skipBtn').addEventListener('click', () => {
      combo = 0;
      idx++;
      renderRound();
    });
    app.querySelector('#hintBtn').addEventListener('click', () => {
      if (storage.spendCoins(2)) {
        toast(`提示: ${w.word}`, 'info');
        speak(w.word);
      } else {
        toast('金币不足', 'warn');
      }
    });
  }

  function handleCorrect(w) {
    combo++;
    const reward = 5 + Math.min(combo - 1, 5);
    score += reward;
    storage.addCoins(reward);
    storage.markWordLearned(w.id);
    storage.recordWordResult(w.id, true);
    storage.addPetExp(2);
    storage.progressDailyTask('words10', 1);
    playSound('correct');
    speak(w.word);

    // 爆炸特效
    const card = app.querySelector('#answerArea');
    card.classList.add('bounce-in');
    showFloatingText(card, `+${reward} 🪙 ${combo >= 2 ? '🔥连击!' : ''}`, '#48BB78');

    setTimeout(() => {
      idx++;
      renderRound();
    }, 900);
  }

  function handleWrong(w) {
    combo = 0;
    storage.recordWordResult(w.id, false);
    playSound('wrong');
    const card = app.querySelector('#answerArea');
    card.classList.add('shake');
    setTimeout(() => {
      card.classList.remove('shake');
      app.querySelector('#answerSlots').innerHTML = '';
      app.querySelectorAll('.letter-tile').forEach(t => t.classList.remove('used'));
    }, 500);
  }

  function showFloatingText(parent, text, color) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `position:absolute; left:50%; top:0; transform:translateX(-50%); color:${color}; font-weight:700; font-size:18px; pointer-events:none; z-index:5;`;
    parent.style.position = 'relative';
    parent.appendChild(el);
    let y = 0;
    const t = setInterval(() => {
      y += 3;
      el.style.transform = `translate(-50%, -${y}px)`;
      el.style.opacity = 1 - y / 60;
      if (y > 60) { clearInterval(t); el.remove(); }
    }, 16);
  }

  function renderEnd() {
    exitFocus(); // 本轮结束
    app.innerHTML = `
      <div class="text-center py-12 fade-in">
        <div class="text-6xl mb-4 bounce-in">🎊</div>
        <h2 class="text-2xl font-bold mb-2">本轮结束！</h2>
        <div class="card-cartoon my-4">
          <div class="text-sm">总得分</div>
          <div class="text-4xl font-bold text-primary my-2">${score}</div>
          <div class="text-sm">🪙 已存入金币库</div>
        </div>
        <div class="flex gap-3">
          <button id="againBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">再来一局</button>
          <button id="doneBtn" class="flex-1 btn-cartoon">返回</button>
        </div>
      </div>
    `;
    app.querySelector('#againBtn').addEventListener('click', () => {
      queue = shuffle([...playable]).slice(0, 10);
      idx = 0; score = 0; combo = 0;
      renderRound();
    });
    app.querySelector('#doneBtn').addEventListener('click', () => window.__nav('words'));
    playSound('levelup');
  }

  renderRound();
}
