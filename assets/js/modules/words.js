// modules/words.js - 单词模块
import { loadJSON, toast } from '../app.js';
import * as storage from '../storage.js';
import { speak, playSound, recognize, similarity, isSpeechRecognitionSupported } from '../speech.js';
import { rollCardRarity, checkBadges } from '../gamification.js';
import { renderMatchGame } from '../games/match-game.js';
import { renderShootGame } from '../games/shoot-game.js';
import { renderPetGame } from '../games/pet-game.js';
import { renderCardCollect } from '../games/card-collect.js';
import { renderPetWordsHome } from './pet.js';

// 趣味记忆类型标签（V0.2 模块3）
const MNEMONIC_TYPES = {
  root: '词根词缀', assoc: '联想记忆', sound: '谐音', split: '拆解', image: '图像联想'
};

// 渲染"💡 趣味记忆"卡片；无 mnemonic 字段则返回空（向后兼容）
export function mnemonicHtml(w) {
  if (!w || !w.mnemonic || !w.mnemonic.tip) return '';
  const label = MNEMONIC_TYPES[w.mnemonic.type] || '趣味记忆';
  return `
    <div class="mnemonic-card">
      <div class="mn-head">💡 趣味记忆 · ${label}</div>
      <div class="mn-tip">${w.mnemonic.tip}</div>
    </div>`;
}

export async function renderWordsPage(app, params) {
  const profile = storage.getProfile();

  // PET 级别：走话题闯关分支
  if (profile.grade === 'PET') {
    return renderPetWordsHome(app);
  }

  const data = await loadJSON(`data/words/grade${profile.grade}.json`);
  if (!data) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">数据加载失败</div>';
    return;
  }

  if (params.mode === 'match') return renderMatchGame(app, data, profile.grade);
  if (params.mode === 'shoot') return renderShootGame(app, data, profile.grade);
  if (params.mode === 'pet')   return renderPetGame(app);
  if (params.mode === 'cards') return renderCardCollect(app);
  if (params.mode === 'browse')return renderBrowse(app, data, profile.grade);
  if (params.mode === 'study') return renderStudyFlow(app, data, profile.grade, params.unitId);

  // 默认: 单词大冒险首页
  const grade = profile.grade;
  const learned = storage.getLearnedWords();
  const totalWords = data.units.reduce((sum, u) => sum + u.words.length, 0);
  const learnedInGrade = data.units.flatMap(u => u.words).filter(w => learned[w.id]).length;
  const reviewDue = Object.values(learned).filter(p => p.nextReview && p.nextReview <= Date.now()).length;

  // 闯关概况
  const numLevels = Math.max(1, Math.ceil(totalWords / 8));
  const levelProg = storage.getLevelProgress(grade);
  const clearedLevels = Object.values(levelProg).filter(r => r.cleared).length;
  const nextLevel = Math.min(storage.getMaxUnlockedLevel(grade), numLevels);
  const totalStars = storage.getTotalStars(grade);
  const reinforceCount = storage.getReinforceCount();

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl">‹</button>
      <h2 class="text-xl font-bold">🚀 单词大冒险</h2>
    </div>

    <!-- 进度 -->
    <div class="card-cartoon mb-3 bg-gradient-to-r from-orange-50 to-yellow-50">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold">本年级进度</span>
        <span class="text-sm text-gray-500">${learnedInGrade}/${totalWords}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width:${totalWords ? (learnedInGrade/totalWords)*100 : 0}%"></div>
      </div>
      ${reviewDue > 0 ? `<div class="mt-2 text-xs text-orange-600">⏰ ${reviewDue} 个单词到了复习时间</div>` : ''}
    </div>

    <!-- ★ 闯关地图主入口（最醒目）★ -->
    <button data-go="levels" class="w-full card-cartoon tap-bounce text-left mb-4 relative overflow-hidden"
      style="background:linear-gradient(135deg,#FFE3C2,#FFD0E0);padding:22px">
      <div class="absolute right-3 top-3 text-5xl opacity-30">🗺️</div>
      <div class="text-xs font-bold text-orange-600 mb-1">🔥 单词闯关 · 探险旅程</div>
      <div class="text-2xl font-extrabold mb-1">第 ${nextLevel} 关</div>
      <div class="text-xs text-gray-600 mb-3">已通关 ${clearedLevels}/${numLevels} · ⭐${totalStars} 星</div>
      <div class="inline-block btn-cartoon" style="padding:8px 22px;pointer-events:none">▶ 继续闯关</div>
    </button>

    <!-- 🔥 错词突击入口（红色醒目） -->
    <button data-go="reinforce" class="w-full card-cartoon tap-bounce flex items-center gap-3 mb-4 text-left"
      style="background:linear-gradient(135deg,#FFE0E0,#FFD0C2)">
      <div class="text-4xl">🔥</div>
      <div class="flex-1">
        <div class="font-bold text-red-600">错词突击</div>
        <div class="text-xs text-gray-600">连对 3 次让错词毕业</div>
      </div>
      <span class="text-sm font-bold ${reinforceCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'} px-3 py-1 rounded-full">${reinforceCount} 待强化</span>
    </button>

    <!-- 自由练习（小入口） -->
    <h3 class="font-bold mb-2 text-sm text-gray-500">🎮 自由练习</h3>
    <div class="grid grid-cols-4 gap-2 mb-4">
      <button data-mode="match" class="card-cartoon tap-bounce text-center bg-gradient-to-br from-purple-100 to-pink-50" style="padding:12px 6px">
        <div class="text-2xl">🧩</div>
        <div class="text-[11px] font-bold mt-1">消消乐</div>
      </button>
      <button data-mode="shoot" class="card-cartoon tap-bounce text-center bg-gradient-to-br from-green-100 to-cyan-50" style="padding:12px 6px">
        <div class="text-2xl">🎯</div>
        <div class="text-[11px] font-bold mt-1">打地鼠</div>
      </button>
      <button data-mode="pet" class="card-cartoon tap-bounce text-center bg-gradient-to-br from-yellow-100 to-orange-50" style="padding:12px 6px">
        <div class="text-2xl">🦊</div>
        <div class="text-[11px] font-bold mt-1">宠物</div>
      </button>
      <button data-mode="cards" class="card-cartoon tap-bounce text-center bg-gradient-to-br from-blue-100 to-indigo-50" style="padding:12px 6px">
        <div class="text-2xl">🃏</div>
        <div class="text-[11px] font-bold mt-1">卡牌</div>
      </button>
    </div>

    <!-- 学习入口 -->
    <h3 class="font-bold mb-2">📖 单元学习</h3>
    <div class="space-y-2">
      ${data.units.map(u => {
        const total = u.words.length;
        const done = u.words.filter(w => learned[w.id]).length;
        return `
          <button data-unit="${u.unitId}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3">
            <div class="text-3xl">📕</div>
            <div class="flex-1">
              <div class="font-bold text-sm">${u.unitName}</div>
              <div class="progress-bar mt-1"><div class="progress-bar-fill" style="width:${total?(done/total)*100:0}%"></div></div>
            </div>
            <div class="text-xs text-gray-500">${done}/${total}</div>
          </button>
        `;
      }).join('')}
    </div>

    <button data-mode="browse" class="w-full mt-4 btn-cartoon btn-cartoon-secondary">📋 浏览全部单词</button>
  `;

  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('home'));
  app.querySelector('[data-go="levels"]').addEventListener('click', () => window.__nav('levels'));
  app.querySelector('[data-go="reinforce"]').addEventListener('click', () => window.__nav('reinforce'));
  app.querySelectorAll('[data-mode]').forEach(b => {
    b.addEventListener('click', () => window.__nav('words', { mode: b.dataset.mode }));
  });
  app.querySelectorAll('[data-unit]').forEach(b => {
    b.addEventListener('click', () => window.__nav('words', { mode: 'study', unitId: b.dataset.unit }));
  });
}

// === 单元学习流程 ===
function renderStudyFlow(app, data, grade, unitId) {
  const unit = data.units.find(u => u.unitId === unitId);
  if (!unit) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">单元未找到</div>';
    return;
  }

  let idx = 0;
  let learnedCount = 0;

  function renderCurrent() {
    if (idx >= unit.words.length) return renderComplete();
    const w = unit.words[idx];
    const wasLearned = !!storage.getLearnedWords()[w.id];

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <div class="flex-1">
          <div class="text-sm font-bold">${unit.unitName}</div>
          <div class="text-xs text-gray-500">${idx + 1} / ${unit.words.length}</div>
        </div>
      </div>

      <div class="progress-bar mb-4">
        <div class="progress-bar-fill" style="width:${((idx)/unit.words.length)*100}%"></div>
      </div>

      <div class="card-cartoon text-center bounce-in">
        <div class="text-xs text-gray-400 mb-1">${w.pos || ''}</div>
        <div class="text-4xl font-en font-bold mb-2">${w.word}</div>
        <div class="text-sm text-gray-500 mb-3">${w.phonetic || ''}</div>
        <button id="speakBtn" class="text-3xl mb-3 tap-bounce">🔊</button>
        <div class="text-2xl text-primary font-bold mb-4">${w.meaning}</div>

        ${w.examples && w.examples.length ? `
          <div class="bg-orange-50 rounded-2xl p-3 text-left mt-2">
            <div class="text-xs text-gray-500 mb-1">例句</div>
            ${w.examples.map(ex => `
              <div class="mb-2 last:mb-0">
                <div class="font-en text-sm">${ex.en}</div>
                <div class="text-xs text-gray-500">${ex.zh}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(w.synonyms && w.synonyms.length) ? `<div class="mt-3 text-xs"><span class="text-gray-400">近义</span>: <span class="font-en">${w.synonyms.join(', ')}</span></div>` : ''}
        ${(w.antonyms && w.antonyms.length) ? `<div class="text-xs"><span class="text-gray-400">反义</span>: <span class="font-en">${w.antonyms.join(', ')}</span></div>` : ''}

        ${mnemonicHtml(w)}
      </div>

      <div class="grid grid-cols-2 gap-3 mt-4">
        <button id="hardBtn" class="btn-cartoon" style="background:#F56565;box-shadow:0 4px 0 #C53030">😣 还不熟</button>
        <button id="easyBtn" class="btn-cartoon">😊 记住了</button>
      </div>
      ${isSpeechRecognitionSupported() ? `
        <button id="readAloudBtn" class="w-full mt-3 btn-cartoon btn-cartoon-secondary">🎤 跟读这个单词</button>
      ` : ''}
    `;

    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
    app.querySelector('#speakBtn').addEventListener('click', () => speak(w.word));

    // 进入卡片自动朗读
    setTimeout(() => speak(w.word), 300);

    app.querySelector('#easyBtn').addEventListener('click', () => {
      storage.markWordLearned(w.id);
      storage.recordWordResult(w.id, true);
      storage.addCoins(5);
      storage.addPetExp(2);
      storage.progressDailyTask('words10', 1);
      learnedCount++;
      playSound('correct');
      idx++;
      renderCurrent();
    });

    app.querySelector('#hardBtn').addEventListener('click', () => {
      storage.markWordLearned(w.id);
      storage.recordWordResult(w.id, false);
      playSound('wrong');
      toast('已加入错词本，下次再练习', 'warn');
      idx++;
      renderCurrent();
    });

    const readBtn = app.querySelector('#readAloudBtn');
    if (readBtn) {
      readBtn.addEventListener('click', async () => {
        readBtn.textContent = '🎤 请说: ' + w.word;
        readBtn.disabled = true;
        try {
          const handle = recognize();
          const results = await handle.promise;
          const score = Math.max(...results.map(r => similarity(w.word, r.transcript)));
          if (score >= 80) {
            toast(`👍 发音很标准！${score} 分`, 'success');
            storage.addCoins(3);
          } else if (score >= 50) {
            toast(`不错！${score} 分，可以更好`, 'info');
          } else {
            toast(`再试一次，${score} 分`, 'warn');
          }
        } catch (e) {
          toast('未识别，请重试', 'error');
        }
        readBtn.textContent = '🎤 跟读这个单词';
        readBtn.disabled = false;
      });
    }
  }

  function renderComplete() {
    // 触发卡牌掉落
    const droppedCards = unit.words.filter(w => Math.random() < 0.6).map(w => {
      const rarity = rollCardRarity(w.difficulty || 1);
      const card = { wordId: w.id, word: w.word, meaning: w.meaning, rarity, drawnAt: Date.now() };
      storage.addCard(card);
      return card;
    });

    const newBadges = checkBadges();

    app.innerHTML = `
      <div class="text-center py-12 fade-in">
        <div class="text-6xl mb-4 bounce-in">🎉</div>
        <h2 class="text-2xl font-bold mb-2">单元完成！</h2>
        <div class="text-gray-500 mb-6">${unit.unitName}</div>
        <div class="card-cartoon mb-4 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div class="text-sm">本次学习</div>
          <div class="text-3xl font-bold text-primary my-2">${learnedCount}</div>
          <div class="text-sm">个单词，奖励 ${learnedCount * 5} 🪙</div>
        </div>

        ${droppedCards.length ? `
          <div class="card-cartoon mb-4">
            <div class="font-bold mb-2">🃏 抽到了 ${droppedCards.length} 张卡牌</div>
            <div class="flex flex-wrap justify-center gap-2">
              ${droppedCards.map(c => `
                <div class="card-rarity-${c.rarity} rounded-xl p-2 text-center" style="min-width:70px">
                  <div class="font-en text-sm font-bold">${c.word}</div>
                  <div class="text-[10px] text-gray-500">${c.meaning}</div>
                  <div class="text-[10px] font-bold mt-1">${c.rarity}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${newBadges.length ? `
          <div class="card-cartoon mb-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div class="font-bold mb-2">🎖️ 新解锁的勋章</div>
            ${newBadges.map(b => `<div>${b.icon} ${b.name}</div>`).join('')}
          </div>
        ` : ''}

        <div class="flex gap-3">
          <button id="againBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">再来一遍</button>
          <button id="doneBtn" class="flex-1 btn-cartoon">返回</button>
        </div>
      </div>
    `;
    app.querySelector('#againBtn').addEventListener('click', () => { idx = 0; learnedCount = 0; renderCurrent(); });
    app.querySelector('#doneBtn').addEventListener('click', () => window.__nav('words'));
    playSound('levelup');
  }

  renderCurrent();
}

// === 浏览全部 ===
function renderBrowse(app, data, grade) {
  const learned = storage.getLearnedWords();

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl">‹</button>
      <h2 class="text-xl font-bold">📋 全部单词</h2>
    </div>
    <div class="space-y-2">
      ${data.units.flatMap(u => u.words).map(w => {
        const isLearned = !!learned[w.id];
        return `
          <div class="card-cartoon flex items-center gap-3" data-word-id="${w.id}">
            <div class="flex-1">
              <div class="font-en font-bold">${w.word} <span class="text-xs font-sans text-gray-400">${w.phonetic || ''}</span></div>
              <div class="text-sm text-gray-600">${w.pos || ''} ${w.meaning}</div>
            </div>
            ${isLearned ? '<span class="text-green-500 text-sm">✓ 已学</span>' : ''}
            <button class="speak-btn p-2 text-2xl text-primary">🔊</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
  app.querySelectorAll('[data-word-id]').forEach(card => {
    const w = data.units.flatMap(u => u.words).find(x => x.id === card.dataset.wordId);
    card.querySelector('.speak-btn').addEventListener('click', () => speak(w.word));
  });
}
