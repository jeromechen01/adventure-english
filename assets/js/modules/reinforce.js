// modules/reinforce.js - 🔥 错词突击（错词智能强化 V0.2 模块2）
// 针对错词本里的词快速练习，连对 3 次毕业，毕业给奖励+特效。
import { loadJSON, toast, enterFocus, exitFocus } from '../app.js';
import * as storage from '../storage.js';
import { speak, playSound } from '../speech.js';
import { checkBadges } from '../gamification.js';
import { collectPetWordsById } from './pet.js';
import { shuffle } from '../utils/shuffle.js';

let wordIndexCache = null;
async function buildWordIndex() {
  if (wordIndexCache) return wordIndexCache;
  const idx = {};
  for (let g = 1; g <= 9; g++) {
    const data = await loadJSON(`data/words/grade${g}.json`);
    if (!data) continue;
    data.units.forEach(u => u.words.forEach(w => { idx[w.id] = w; }));
  }
  // KET/PET 话题词也纳入，备考档的错词才能进突击队列
  await collectPetWordsById(idx);
  wordIndexCache = idx;
  return idx;
}

export async function renderReinforce(app) {
  const idx = await buildWordIndex();
  const allWords = Object.values(idx);

  // 解析待强化队列为词对象（过滤掉词库里找不到的）
  let queue = storage.getReinforceQueue()
    .map(item => ({ ...item, word: idx[item.id] }))
    .filter(x => x.word);

  if (queue.length === 0) {
    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
        <h2 class="text-xl font-bold">🔥 错词突击</h2>
      </div>
      <div class="card-cartoon text-center py-12">
        <div class="text-5xl mb-3">🎉</div>
        <div class="font-bold mb-1">太棒了，没有待强化的错词！</div>
        <div class="text-sm text-gray-500">继续闯关，遇到难词会自动收集到这里</div>
      </div>
    `;
    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
    return;
  }

  const startTotal = queue.length;
  let graduatedThisSession = 0;
  let ptr = 0;

  function renderQuestion() {
    if (queue.length === 0) return renderDone();
    // ★ 级轻场景：只隐藏导航防误触（每题结果实时落盘，中途退几乎不丢）
    enterFocus({ confirm: false });
    if (ptr >= queue.length) ptr = 0; // 循环
    const cur = queue[ptr];
    const word = cur.word;
    const cc = cur.consecutiveCorrect || 0;

    // 4 选 1（中文 → 英文）
    const distract = shuffle(allWords.filter(w => w.id !== word.id && w.word !== word.word)).slice(0, 3);
    const opts = shuffle([word, ...distract]);

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
        <h2 class="text-xl font-bold flex-1">🔥 错词突击</h2>
        <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">待强化 ${queue.length}</span>
      </div>

      <div class="card-cartoon mb-4 text-center bg-gradient-to-br from-red-50 to-orange-50">
        <div class="text-xs text-gray-400 mb-1">选出正确的英文 · 连对 3 次毕业</div>
        <div class="big-title text-primary">${word.meaning}</div>
        <div class="text-xs text-gray-500 mt-2">本词进度：${'🟢'.repeat(cc)}${'⚪'.repeat(Math.max(0, 3 - cc))}</div>
      </div>

      <div class="opt-grid" id="opts">
        ${opts.map((o, i) => `<button class="opt-btn font-en" data-i="${i}">${o.word}</button>`).join('')}
      </div>
    `;

    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));

    app.querySelectorAll('.opt-btn').forEach(b => {
      b.addEventListener('click', () => {
        const i = parseInt(b.dataset.i);
        const btns = app.querySelectorAll('.opt-btn');
        btns.forEach(x => x.disabled = true);
        const correct = opts[i].id === word.id;
        const correctIdx = opts.findIndex(o => o.id === word.id);

        if (correct) {
          b.classList.add('correct');
          speak(word.word);
          playSound('correct');
          const res = storage.recordReinforceResult(word.id, true);
          cur.consecutiveCorrect = res.consecutiveCorrect;
          if (res.graduated) {
            graduatedThisSession++;
            storage.addCoins(15);
            queue.splice(ptr, 1); // 移出队列
            celebrateGraduation(word);
            checkBadges(); // 可能解锁"攻克难关"
            setTimeout(renderQuestion, 1400);
            return;
          }
          storage.addCoins(3);
          ptr++;
          setTimeout(renderQuestion, 750);
        } else {
          b.classList.add('wrong');
          btns[correctIdx].classList.add('correct');
          playSound('wrong');
          storage.recordReinforceResult(word.id, false);
          cur.consecutiveCorrect = 0;
          toast(`正确：${word.word} = ${word.meaning} · 别灰心！`, 'info');
          ptr++;
          setTimeout(renderQuestion, 1500);
        }
      });
    });
  }

  function celebrateGraduation(word) {
    toast(`🎓 「${word.word}」毕业啦！+15🪙`, 'success');
    playSound('levelup');
    const banner = document.createElement('div');
    banner.className = 'countdown-overlay';
    banner.innerHTML = `
      <div class="bounce-in text-center">
        <div class="text-7xl mb-3">🎓</div>
        <div class="big-title" style="color:#fff">毕业啦！</div>
        <div class="text-lg mt-1 font-en">${word.word}</div>
      </div>`;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 1300);
  }

  function renderDone() {
    exitFocus(); // 突击完成
    playSound('levelup');
    app.innerHTML = `
      <div class="text-center pt-10 fade-in">
        <div class="text-7xl mb-3 bounce-in">🏆</div>
        <div class="big-title mb-2">突击完成！</div>
        <div class="card-cartoon my-4 bg-gradient-to-br from-green-50 to-cyan-50">
          <div class="text-sm text-gray-600">本次毕业错词</div>
          <div class="text-4xl font-bold text-secondary my-1">${graduatedThisSession}<span class="text-lg text-gray-400"> / ${startTotal}</span></div>
          <div class="text-sm text-gray-600">个，已从错词本移除</div>
        </div>
        <button id="doneBtn" class="w-full btn-cartoon">返回</button>
      </div>
    `;
    app.querySelector('#doneBtn').addEventListener('click', () => window.__nav('words'));
  }

  renderQuestion();
}
