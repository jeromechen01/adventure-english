// modules/reading.js - 阅读乐园
import { loadJSON, toast } from '../app.js';
import * as storage from '../storage.js';
import { speak, playSound, recognize, similarity, isSpeechRecognitionSupported, stopSpeaking } from '../speech.js';

// 缓存所有单词的本地词库 (用于点词查义)
let wordIndex = null;

async function buildWordIndex() {
  if (wordIndex) return wordIndex;
  wordIndex = {};
  for (let g = 1; g <= 9; g++) {
    const data = await loadJSON(`data/words/grade${g}.json`);
    if (!data) continue;
    data.units.forEach(u => u.words.forEach(w => {
      const key = w.word.toLowerCase();
      if (!wordIndex[key]) wordIndex[key] = w;
    }));
  }
  return wordIndex;
}

export async function renderReadingPage(app, params) {
  const profile = storage.getProfile();
  const level = profile.grade <= 2 ? 'kindergarten' : profile.grade <= 6 ? 'primary' : 'junior';
  const data = await loadJSON(`data/reading/${level}.json`);
  if (!data) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">数据加载失败</div>';
    return;
  }

  if (params.articleId) {
    return renderArticle(app, data, params.articleId);
  }

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl">‹</button>
      <h2 class="text-xl font-bold">📖 阅读乐园</h2>
    </div>
    <div class="text-xs text-gray-500 mb-3">${level === 'kindergarten' ? '启蒙阅读' : level === 'primary' ? '小学' : '初中'}阅读 · 共 ${data.articles.length} 篇</div>

    <div class="space-y-2">
      ${data.articles.map(a => {
        const stars = '⭐'.repeat(Math.min(5, Math.ceil(a.lexile / 200)));
        return `
          <button data-article="${a.id}" class="w-full card-cartoon tap-bounce text-left">
            <div class="flex items-center gap-3">
              <div class="text-3xl">📄</div>
              <div class="flex-1">
                <div class="font-bold text-sm font-en">${a.title}</div>
                <div class="text-xs text-gray-500 mt-1">
                  <span>${stars}</span>
                  <span class="ml-2">📝 ${a.wordCount} 词</span>
                  <span class="ml-2">⏱️ ${Math.ceil(a.wordCount / 50)} 分钟</span>
                </div>
              </div>
              <div class="text-2xl text-gray-300">›</div>
            </div>
          </button>
        `;
      }).join('')}
    </div>
  `;
  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('home'));
  app.querySelectorAll('[data-article]').forEach(btn => {
    btn.addEventListener('click', () => window.__nav('reading', { articleId: btn.dataset.article }));
  });
}

async function renderArticle(app, data, articleId) {
  const article = data.articles.find(a => a.id === articleId);
  if (!article) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">文章未找到</div>';
    return;
  }

  await buildWordIndex();
  let showTranslation = false;
  let mode = 'read'; // read | quiz

  function render() {
    if (mode === 'quiz') return renderQuiz();

    // 把内容拆词，每个单词包成 span 以支持点击
    const words = article.content.split(/(\s+|[,.!?;:])/);
    const html = words.map(token => {
      const clean = token.replace(/[^a-zA-Z]/g, '');
      if (clean) {
        return `<span class="inline-word cursor-pointer hover:bg-yellow-100 rounded px-0.5" data-word="${clean.toLowerCase()}">${token}</span>`;
      }
      return token;
    }).join('');

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-base font-bold flex-1 font-en truncate">${article.title}</h2>
        <button id="speakAllBtn" class="text-2xl">🔊</button>
      </div>

      <div class="card-cartoon mb-3">
        <div class="text-xs text-gray-400 mb-3">📌 点击任意单词可查看释义</div>
        <div class="font-en text-base leading-relaxed" id="articleContent">${html}</div>

        ${showTranslation ? `<div class="mt-4 pt-4 border-t border-dashed text-sm text-gray-600 leading-relaxed">${article.translation}</div>` : ''}
      </div>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <button id="toggleTransBtn" class="btn-cartoon btn-cartoon-secondary text-sm">${showTranslation ? '隐藏翻译' : '显示翻译'}</button>
        ${isSpeechRecognitionSupported() ? `<button id="recBtn" class="btn-cartoon text-sm">🎤 跟读评分</button>` : '<div></div>'}
      </div>

      <button id="quizBtn" class="w-full btn-cartoon">📝 完成阅读后做题 (${article.questions.length} 题)</button>
    `;

    app.querySelector('#backBtn').addEventListener('click', () => { stopSpeaking(); window.__nav('reading'); });
    app.querySelector('#speakAllBtn').addEventListener('click', () => speak(article.content, { rate: 0.85 }));
    app.querySelector('#toggleTransBtn').addEventListener('click', () => { showTranslation = !showTranslation; render(); });
    app.querySelector('#quizBtn').addEventListener('click', () => { mode = 'quiz'; render(); });

    const recBtn = app.querySelector('#recBtn');
    if (recBtn) {
      recBtn.addEventListener('click', async () => {
        recBtn.textContent = '🎤 录音中...请朗读全文';
        recBtn.disabled = true;
        try {
          const handle = recognize();
          const results = await handle.promise;
          const score = Math.max(...results.map(r => similarity(article.content, r.transcript)));
          if (score >= 75) {
            toast(`🎉 朗读得分: ${score} - 非常流利！`, 'success');
            storage.addCoins(15);
          } else if (score >= 50) {
            toast(`朗读得分: ${score} - 还不错，再练习几次`, 'info');
            storage.addCoins(8);
          } else {
            toast(`朗读得分: ${score} - 多听多练`, 'warn');
            storage.addCoins(3);
          }
        } catch (e) {
          toast('未识别，请重试', 'error');
        }
        recBtn.textContent = '🎤 跟读评分';
        recBtn.disabled = false;
      });
    }

    // 点词查义
    app.querySelectorAll('.inline-word').forEach(span => {
      span.addEventListener('click', e => {
        e.stopPropagation();
        const word = span.dataset.word;
        const info = wordIndex[word];
        showWordPopup(span, word, info);
      });
    });
  }

  function showWordPopup(target, word, info) {
    // 移除之前的
    document.querySelectorAll('.word-popup').forEach(p => p.remove());

    speak(word);

    const popup = document.createElement('div');
    popup.className = 'word-popup fade-in';
    popup.innerHTML = info ? `
      <div class="font-en font-bold">${info.word} <button class="text-base ml-1">🔊</button></div>
      <div class="text-xs text-gray-400 mb-1">${info.phonetic || ''}</div>
      <div class="text-sm">${info.pos || ''} ${info.meaning}</div>
    ` : `
      <div class="font-en font-bold">${word}</div>
      <div class="text-xs text-gray-500 mt-1">该词不在本地词库中</div>
    `;

    document.body.appendChild(popup);

    // 定位
    const rect = target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - popupRect.width / 2;
    let top = rect.bottom + 8;
    if (left < 8) left = 8;
    if (left + popupRect.width > window.innerWidth - 8) left = window.innerWidth - popupRect.width - 8;
    if (top + popupRect.height > window.innerHeight - 8) top = rect.top - popupRect.height - 8;
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';

    // 点击其他地方关闭
    setTimeout(() => {
      const onDismiss = () => {
        popup.remove();
        document.removeEventListener('click', onDismiss);
      };
      document.addEventListener('click', onDismiss);
    }, 100);

    // 点击 popup 中的喇叭
    const speakBtn = popup.querySelector('button');
    if (speakBtn) {
      speakBtn.addEventListener('click', e => {
        e.stopPropagation();
        speak(word);
      });
    }
  }

  function renderQuiz() {
    let answers = new Array(article.questions.length).fill(null);
    let submitted = false;

    function paint() {
      app.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
          <button id="backBtn" class="text-2xl">‹</button>
          <h2 class="text-base font-bold flex-1 font-en truncate">${article.title} - 阅读理解</h2>
        </div>

        <div class="space-y-3">
          ${article.questions.map((q, qi) => `
            <div class="card-cartoon">
              <div class="text-xs text-gray-400 mb-1">第 ${qi+1} 题</div>
              <div class="font-en mb-3">${q.q}</div>
              <div class="space-y-2">
                ${q.options.map((opt, oi) => {
                  let cls = 'border-gray-200';
                  if (submitted) {
                    if (oi === q.answer) cls = 'border-green-500 bg-green-50';
                    else if (oi === answers[qi]) cls = 'border-red-500 bg-red-50';
                  } else if (answers[qi] === oi) {
                    cls = 'border-primary bg-orange-50';
                  }
                  return `<button data-q="${qi}" data-o="${oi}" class="w-full px-4 py-2 rounded-2xl border-2 ${cls} text-left font-en text-sm tap-bounce">${String.fromCharCode(65+oi)}. ${opt}</button>`;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <button id="${submitted ? 'doneBtn' : 'submitBtn'}" class="w-full btn-cartoon mt-4">
          ${submitted ? '完成 →' : '提交答案'}
        </button>
      `;

      app.querySelector('#backBtn').addEventListener('click', () => { mode = 'read'; render(); });

      if (!submitted) {
        app.querySelectorAll('[data-q]').forEach(btn => {
          btn.addEventListener('click', () => {
            answers[parseInt(btn.dataset.q)] = parseInt(btn.dataset.o);
            paint();
          });
        });
        app.querySelector('#submitBtn').addEventListener('click', () => {
          if (answers.includes(null)) {
            toast('还有题没答完哦', 'warn');
            return;
          }
          submitted = true;
          // 计分
          const correct = answers.filter((a, i) => a === article.questions[i].answer).length;
          const reward = correct * 5;
          storage.addCoins(reward);
          storage.progressDailyTask('reading1', 1);
          playSound(correct === article.questions.length ? 'levelup' : 'correct');
          toast(`答对 ${correct}/${article.questions.length} 题，+${reward}🪙`, 'success');
          paint();
        });
      } else {
        app.querySelector('#doneBtn').addEventListener('click', () => window.__nav('reading'));
      }
    }

    paint();
  }

  render();
}
