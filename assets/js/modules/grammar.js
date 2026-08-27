// modules/grammar.js - 语法学院
import { loadJSON, toast, enterFocus, exitFocus, requestLeaveFocus } from '../app.js';
import * as storage from '../storage.js';
import { playSound } from '../speech.js';
import { pickQuiz, presentQuestion } from '../utils/shuffle.js';

export async function renderGrammarPage(app, params) {
  const profile = storage.getProfile();
  const level = profile.grade <= 2 ? 'kindergarten' : profile.grade <= 6 ? 'primary' : 'junior';
  const data = await loadJSON(`data/grammar/${level}.json`);
  if (!data) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">数据加载失败</div>';
    return;
  }

  if (params.topicId) {
    return renderTopic(app, data, params.topicId);
  }

  // 列表
  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl">‹</button>
      <h2 class="text-xl font-bold">🎓 语法学院</h2>
    </div>
    <div class="text-xs text-gray-500 mb-3">${level === 'kindergarten' ? '启蒙句型' : level === 'primary' ? '小学语法' : '初中语法'} · 共 ${data.topics.length} 个语法点</div>

    <div class="space-y-2">
      ${data.topics.map(t => `
        <button data-topic="${t.id}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3">
          <div class="text-3xl">📖</div>
          <div class="flex-1">
            <div class="font-bold text-sm">${t.title}</div>
            <div class="text-xs text-gray-500 line-clamp-1">${t.summary}</div>
          </div>
          <div class="text-2xl text-gray-300">›</div>
        </button>
      `).join('')}
    </div>
  `;
  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('home'));
  app.querySelectorAll('[data-topic]').forEach(btn => {
    btn.addEventListener('click', () => window.__nav('grammar', { topicId: btn.dataset.topic }));
  });
}

function renderTopic(app, data, topicId) {
  const topic = data.topics.find(t => t.id === topicId);
  if (!topic) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">语法点未找到</div>';
    return;
  }

  let mode = 'study'; // study | quiz
  let qIdx = 0;
  let qScore = 0;
  let quizList = topic.quiz;

  // V0.8 每次开始练习重新洗牌：题序打乱+错题加权抽样+选项洗牌(answer 同步重算)
  function prepareQuiz() {
    const scope = `g19:${topicId}`;
    const picked = pickQuiz(scope, topic.quiz, topic.quiz.length, storage.getQuizStats());
    quizList = picked.questions.map(q => presentQuestion(scope, q));
    if (picked.focusedWrong) toast('🎯 本次重点安排了你之前做错的题');
  }

  function render() {
    if (mode === 'study') renderStudy();
    else renderQuiz();
  }

  function renderStudy() {
    exitFocus(); // 讲解页不是答题态
    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-xl font-bold">${topic.title}</h2>
      </div>

      <div class="card-cartoon mb-3 bg-gradient-to-br from-cyan-50 to-blue-50">
        <h3 class="font-bold mb-2">📌 概要</h3>
        <p class="text-sm">${topic.summary}</p>
      </div>

      <div class="card-cartoon mb-3">
        <h3 class="font-bold mb-2">📋 规则</h3>
        <ul class="space-y-1 text-sm">
          ${topic.rules.map(r => `<li class="flex gap-2"><span class="text-primary-ink">▸</span><span>${r}</span></li>`).join('')}
        </ul>
      </div>

      <div class="card-cartoon mb-4">
        <h3 class="font-bold mb-2">💡 例句</h3>
        ${topic.examples.map(ex => `
          <div class="mb-2 last:mb-0 pb-2 last:pb-0 border-b last:border-0 border-gray-100">
            <div class="font-en text-sm">${ex.en}</div>
            <div class="text-xs text-gray-500">${ex.zh}</div>
          </div>
        `).join('')}
      </div>

      <button id="quizBtn" class="w-full btn-cartoon">🎯 开始练习 (${topic.quiz.length} 题)</button>
    `;
    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('grammar'));
    app.querySelector('#quizBtn').addEventListener('click', () => {
      mode = 'quiz'; qIdx = 0; qScore = 0;
      prepareQuiz();
      render();
    });
  }

  function renderQuiz() {
    if (qIdx >= quizList.length) return renderQuizResult();

    const q = quizList[qIdx];
    let answered = false;

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-base font-bold">${topic.title}</h2>
        <span class="ml-auto text-sm text-gray-500">${qIdx + 1}/${quizList.length}</span>
      </div>

      <div class="progress-bar mb-4">
        <div class="progress-bar-fill" style="width:${(qIdx / quizList.length) * 100}%"></div>
      </div>

      <div class="card-cartoon mb-4">
        <div class="text-xs text-gray-400 mb-2">第 ${qIdx + 1} 题</div>
        <div class="font-en text-lg mb-4">${q.question}</div>
        <div class="space-y-2" id="optsArea">
          ${q.options.map((opt, i) => `
            <button data-opt="${i}" class="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-left font-en hover:border-primary tap-bounce">${String.fromCharCode(65+i)}. ${opt}</button>
          `).join('')}
        </div>
      </div>

      <div id="explainArea"></div>
    `;
    // 答题态：‹/Esc 先确认再回讲解
    const leaveQuiz = () => { mode = 'study'; render(); };
    enterFocus({ remain: () => quizList.length - qIdx, leave: leaveQuiz });
    app.querySelector('#backBtn').addEventListener('click', () => requestLeaveFocus(leaveQuiz));

    app.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.opt);
        const correct = idx === q.answer;

        app.querySelectorAll('[data-opt]').forEach((b, i) => {
          b.disabled = true;
          if (i === q.answer) {
            b.style.borderColor = '#48BB78';
            b.style.background = '#F0FFF4';
          } else if (i === idx) {
            b.style.borderColor = '#F56565';
            b.style.background = '#FFF5F5';
          }
        });

        storage.recordQuizAnswer(q.__qk, correct);
        playSound(correct ? 'correct' : 'wrong');
        if (correct) {
          qScore++;
          storage.addCoins(5);
          storage.progressDailyTask('grammar3', 1);
        }

        const explainArea = app.querySelector('#explainArea');
        explainArea.innerHTML = `
          <div class="card-cartoon ${correct ? 'bg-green-50' : 'bg-red-50'} fade-in">
            <div class="font-bold mb-1">${correct ? '✅ 答对了！' : '❌ 答错了'}</div>
            <div class="text-sm">${q.explanation}</div>
            <button id="nextBtn" class="btn-cartoon mt-3 w-full">${qIdx + 1 >= quizList.length ? '查看结果' : '下一题 →'}</button>
          </div>
        `;
        app.querySelector('#nextBtn').addEventListener('click', () => {
          qIdx++;
          render();
        });
      });
    });
  }

  function renderQuizResult() {
    exitFocus(); // 已出结果
    const total = quizList.length;
    const percent = Math.round((qScore / total) * 100);

    app.innerHTML = `
      <div class="text-center py-8 fade-in">
        <div class="text-6xl mb-4 bounce-in">${percent === 100 ? '🏆' : percent >= 60 ? '🎉' : '💪'}</div>
        <h2 class="text-2xl font-bold mb-2">练习完成！</h2>
        <div class="card-cartoon my-4 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div class="text-sm">${topic.title}</div>
          <div class="text-2xl font-bold text-primary-ink my-2">${qScore} / ${total}</div>
          <div class="text-sm">${percent === 100 ? '满分！知识点掌握得很扎实' : percent >= 60 ? '通过了，再练几遍会更好' : '建议再回去复习一下规则'}</div>
        </div>
        <button id="redoBtn" class="w-full btn-cartoon btn-cartoon-secondary mt-6">🎲 换一批重做（题目会变）</button>
        <div class="flex gap-3 mt-3">
          <button id="reviewBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">回顾规则</button>
          <button id="doneBtn" class="flex-1 btn-cartoon">完成</button>
        </div>
      </div>
    `;
    app.querySelector('#redoBtn').addEventListener('click', () => { mode = 'quiz'; qIdx = 0; qScore = 0; prepareQuiz(); render(); });
    app.querySelector('#reviewBtn').addEventListener('click', () => { mode = 'study'; render(); });
    app.querySelector('#doneBtn').addEventListener('click', () => window.__nav('grammar'));
    if (percent === 100) playSound('levelup');
  }

  render();
}
