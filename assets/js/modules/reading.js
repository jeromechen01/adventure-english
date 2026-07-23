// modules/reading.js - 阅读乐园
import { loadJSON, toast } from '../app.js';
import * as storage from '../storage.js';
import { speak, playSound, recognize, similarity, isSpeechRecognitionSupported, stopSpeaking } from '../speech.js';
import { renderRecite } from './recite.js';
import { pickQuiz, presentQuestion } from '../utils/shuffle.js';
import { collectPetWordsForIndex } from './pet.js';

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
  // PET 话题词也并入索引（供点词查义）
  await collectPetWordsForIndex(wordIndex);
  return wordIndex;
}

// PET 阅读内容会随任务持续增补。Service Worker 采用 cache-first，若沿用普通
// loadJSON，老浏览器会一直命中早期缓存里的旧 index.json（只列了第一组），导致
// 新增文章不显示。这里改用带版本号 query 的 fetch 绕过陈旧缓存，保证新文章立即
// 出现；离线或请求失败时回退到无 query 的地址（可命中 SW 预缓存，离线仍可用）。
// 新增/修改阅读文件后，请把此版本号 +1（与 sw.js 的 CACHE_VERSION 保持同步递增）。
const PET_READING_VERSION = '0.3.4';

async function fetchPetReadingJSON(path) {
  try {
    const res = await fetch(`${path}?v=${PET_READING_VERSION}`, { cache: 'no-cache' });
    if (res.ok) return await res.json();
  } catch (e) { /* 网络失败/离线，走回退 */ }
  try {
    const res = await fetch(path); // 回退：命中 SW 预缓存，保证离线可用
    if (res.ok) return await res.json();
  } catch (e) { /* ignore */ }
  return null;
}

// 载入并合并所有 PET 阅读文件（按 index.json 清单；缺失则回退到第一组）
async function loadPetReading() {
  let files = ['pet-reading-1.json'];
  const idx = await fetchPetReadingJSON('data/pet/reading/index.json');
  if (idx && Array.isArray(idx.files) && idx.files.length) files = idx.files;
  const articles = [];
  for (const f of files) {
    const d = await fetchPetReadingJSON(`data/pet/reading/${f}`);
    if (d && Array.isArray(d.articles)) articles.push(...d.articles);
  }
  return { level: 'B1', articles };
}

// 归一化题目：把 truefalse 题转成两个选项的选择题，复用现有做题引擎
function normalizeQuestions(article) {
  return (article.questions || []).map(q => {
    if (q.type === 'truefalse' && !Array.isArray(q.options)) {
      // noShuffle：对/错的展示顺序固定，洗了反而添乱
      return { ...q, options: ['正确 (True)', '错误 (False)'], answer: (q.answer === true || q.answer === 0) ? 0 : 1, noShuffle: true };
    }
    return q;
  });
}

export async function renderReadingPage(app, params) {
  const profile = storage.getProfile();
  const isPet = profile.grade === 'PET';
  const level = isPet ? 'pet' : (profile.grade <= 2 ? 'kindergarten' : profile.grade <= 6 ? 'primary' : 'junior');
  let data;
  if (isPet) {
    data = await loadPetReading();
  } else {
    data = await loadJSON(`data/reading/${level}.json`);
  }
  if (!data || !data.articles) {
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
    <div class="text-xs text-gray-500 mb-3">${level === 'kindergarten' ? '启蒙阅读' : level === 'primary' ? '小学阅读' : level === 'pet' ? 'PET (B1) 阅读' : '初中阅读'} · 共 ${data.articles.length} 篇</div>

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
  const quizQuestions = normalizeQuestions(article); // 归一化(支持 truefalse)
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
        <button id="reciteBtn" class="btn-cartoon text-sm">🎤 跟读背诵</button>
      </div>

      <button id="quizBtn" class="w-full btn-cartoon">📝 完成阅读后做题 (${quizQuestions.length} 题)</button>
    `;

    app.querySelector('#backBtn').addEventListener('click', () => { stopSpeaking(); window.__nav('reading'); });
    app.querySelector('#speakAllBtn').addEventListener('click', () => speak(article.content, { rate: 0.85 }));
    app.querySelector('#toggleTransBtn').addEventListener('click', () => { showTranslation = !showTranslation; render(); });
    app.querySelector('#quizBtn').addEventListener('click', () => { mode = 'quiz'; render(); });
    app.querySelector('#reciteBtn').addEventListener('click', () => { stopSpeaking(); renderRecite(app, article, render); });

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
    // V0.8 每次进入重新洗牌：题序打乱+错题加权+选项洗牌(answer 同步重算)；作答过程中固定
    const scope = `read:${article.id}`;
    const picked = pickQuiz(scope, quizQuestions, quizQuestions.length, storage.getQuizStats());
    const qs = picked.questions.map(q => presentQuestion(scope, q));
    if (picked.focusedWrong) toast('🎯 本次重点安排了你之前做错的题');
    let answers = new Array(qs.length).fill(null);
    let submitted = false;

    function paint() {
      app.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
          <button id="backBtn" class="text-2xl">‹</button>
          <h2 class="text-base font-bold flex-1 font-en truncate">${article.title} - 阅读理解</h2>
        </div>

        <div class="space-y-3">
          ${qs.map((q, qi) => `
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
          // 计分 + 题目级统计（错题下次优先出）
          const correct = answers.filter((a, i) => a === qs[i].answer).length;
          qs.forEach((q, i) => storage.recordQuizAnswer(q.__qk, answers[i] === q.answer));
          const reward = correct * 5;
          storage.addCoins(reward);
          storage.progressDailyTask('reading1', 1);
          playSound(correct === qs.length ? 'levelup' : 'correct');
          toast(`答对 ${correct}/${qs.length} 题，+${reward}🪙`, 'success');
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
