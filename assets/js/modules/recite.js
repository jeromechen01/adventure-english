// modules/recite.js - 🎤 跟读背诵 + 精准打分（V0.2 模块4）
// 逐句跟读：按 .!? 拆句，逐句示范→跟读→similarity 打分。
// 背诵挑战：预备→挖空(20/50/全)→录音→LCS 词级对齐打分。
import { toast, enterFocus, exitFocus } from '../app.js';
import * as storage from '../storage.js';
import {
  speak, stopSpeaking, recognize, similarity, alignWords,
  isSpeechRecognitionSupported, playSound
} from '../speech.js';

// 入口：跟读背诵菜单
export function renderRecite(app, article, onBack) {
  exitFocus(); // 菜单页不是答题态（从跟读/背诵回来时恢复导航）
  const best = storage.getRecitationScore(article.id);

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
      <h2 class="text-base font-bold flex-1 font-en truncate">🎤 ${article.title}</h2>
    </div>
    ${!isSpeechRecognitionSupported() ? `
      <div class="card-cartoon mb-3 bg-yellow-50 text-sm text-orange-700">
        ⚠️ 当前浏览器不支持语音识别，跟读和背诵打分用不了；换手机或电脑版 Chrome 就可以。
      </div>` : ''}
    <div class="space-y-3">
      <button id="followBtn" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left bg-gradient-to-br from-cyan-50 to-blue-50">
        <div class="text-5xl">👂</div>
        <div class="flex-1">
          <div class="font-bold">逐句跟读</div>
          <div class="text-xs text-gray-500">一句一句示范，跟读评分 ≥75 过关</div>
        </div>
        <div class="text-2xl text-gray-300">›</div>
      </button>
      <button id="challengeBtn" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left bg-gradient-to-br from-purple-50 to-pink-50">
        <div class="text-5xl">🧠</div>
        <div class="flex-1">
          <div class="font-bold">背诵挑战</div>
          <div class="text-xs text-gray-500">挖空记忆 + 录音背诵，词级精准打分</div>
        </div>
        ${best > 0 ? `<div class="text-right"><div class="font-bold text-primary-ink">${best}</div><div class="text-cap text-gray-400">最高分</div></div>` : '<div class="text-2xl text-gray-300">›</div>'}
      </button>
    </div>
  `;
  app.querySelector('#backBtn').addEventListener('click', () => { stopSpeaking(); onBack(); });
  app.querySelector('#followBtn').addEventListener('click', () => renderFollow(app, article, onBack));
  app.querySelector('#challengeBtn').addEventListener('click', () => renderChallengePrep(app, article, onBack));
}

// 拆句：按 . ! ? 拆，保留非空
function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.replace(/[^a-zA-Z]/g, '').length > 0);
}

// ============================================================
// 逐句跟读
// ============================================================
function renderFollow(app, article, onBack) {
  const sentences = splitSentences(article.content);
  let idx = 0;
  let passed = 0;

  function renderOne() {
    if (idx >= sentences.length) return renderDone();
    // ★ 级轻场景：只隐藏导航防误触，‹ 直接退不弹确认（每句金币已实时入账）
    enterFocus({ confirm: false, cleanup: stopSpeaking });
    const sentence = sentences[idx];

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
        <h2 class="text-base font-bold flex-1">👂 逐句跟读</h2>
        <span class="text-xs text-gray-500">${idx + 1}/${sentences.length}</span>
      </div>
      <div class="progress-bar mb-4"><div class="progress-bar-fill" style="width:${(idx / sentences.length) * 100}%"></div></div>

      <div class="card-cartoon mb-4 text-center recite-text">
        <div class="text-xs text-gray-400 mb-2">先听示范，再跟读</div>
        <div class="font-en text-lg leading-relaxed mb-3">${sentence}</div>
        <button id="demoBtn" class="text-3xl tap-bounce">🔊</button>
      </div>

      <button id="recBtn" class="w-full btn-cartoon record-btn">🎤 点击跟读</button>
      <button id="skipBtn" class="w-full btn-cartoon btn-cartoon-secondary mt-3">跳过这句</button>
      <div id="result" class="mt-4"></div>
    `;

    app.querySelector('#backBtn').addEventListener('click', () => { stopSpeaking(); renderRecite(app, article, onBack); });
    const demo = () => speak(sentence, { rate: 0.85 });
    app.querySelector('#demoBtn').addEventListener('click', demo);
    setTimeout(demo, 350);
    app.querySelector('#skipBtn').addEventListener('click', () => { idx++; renderOne(); });

    const recBtn = app.querySelector('#recBtn');
    recBtn.addEventListener('click', async () => {
      if (!isSpeechRecognitionSupported()) { toast('当前浏览器不支持语音识别', 'error'); return; }
      recBtn.textContent = '🎤 录音中…开始读吧';
      recBtn.disabled = true;
      try {
        const handle = recognize();
        const results = await handle.promise;
        const score = Math.max(...results.map(r => similarity(sentence, r.transcript)));
        showResult(score);
      } catch (e) {
        toast('没听清，再试一次', 'warn');
        recBtn.textContent = '🎤 点击跟读';
        recBtn.disabled = false;
      }
    });

    function showResult(score) {
      const pass = score >= 75;
      if (pass) { passed++; playSound('correct'); storage.addCoins(3); }
      else playSound('wrong');
      const box = app.querySelector('#result');
      box.innerHTML = `
        <div class="card-cartoon text-center ${pass ? 'bg-green-50' : 'bg-orange-50'}">
          <div class="text-2xl font-bold ${pass ? 'text-green-700' : 'text-orange-700'}">${score} 分</div>
          <div class="text-sm mt-1">${pass ? '🎉 很标准，过关！' : '差一点，可以再读一遍～'}</div>
          <div class="flex gap-3 mt-3">
            <button id="retryBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">再读一遍</button>
            <button id="nextBtn" class="flex-1 btn-cartoon">${idx + 1 >= sentences.length ? '完成' : '下一句 →'}</button>
          </div>
        </div>
      `;
      box.querySelector('#retryBtn').addEventListener('click', () => renderOne());
      box.querySelector('#nextBtn').addEventListener('click', () => { idx++; renderOne(); });
    }
  }

  function renderDone() {
    exitFocus(); // 跟读完成
    playSound('levelup');
    storage.addPetExp(10);
    app.innerHTML = `
      <div class="text-center pt-8 fade-in">
        <div class="text-7xl mb-3 bounce-in">🎤</div>
        <div class="big-title mb-2">跟读完成！</div>
        <div class="card-cartoon my-4 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div class="text-sm text-gray-600">达标句数</div>
          <div class="text-2xl font-bold text-secondary-ink my-1">${passed}<span class="text-lg text-gray-400"> / ${sentences.length}</span></div>
        </div>
        <button id="doneBtn" class="w-full btn-cartoon">返回</button>
      </div>
    `;
    app.querySelector('#doneBtn').addEventListener('click', () => renderRecite(app, article, onBack));
  }

  renderOne();
}

// ============================================================
// 背诵挑战：预备 → 选难度
// ============================================================
function renderChallengePrep(app, article, onBack) {
  exitFocus(); // 预备页不是答题态
  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
      <h2 class="text-base font-bold flex-1">🧠 背诵挑战 · 预备</h2>
      <button id="readBtn" class="text-2xl">🔊</button>
    </div>
    <div class="card-cartoon mb-4 recite-text">
      <div class="text-xs text-gray-400 mb-2">先读熟下面的短文，准备好后选择难度开始背诵</div>
      <div class="font-en text-base leading-loose">${article.content}</div>
    </div>
    <div class="text-sm font-bold mb-2">选择挖空难度</div>
    <div class="grid grid-cols-3 gap-2">
      <button data-mask="0.2" class="card-cartoon tap-bounce text-center" style="padding:14px 6px">
        <div class="text-2xl">🟢</div><div class="font-bold text-sm mt-1">简单</div><div class="text-cap text-gray-500">挖空 20%</div>
      </button>
      <button data-mask="0.5" class="card-cartoon tap-bounce text-center" style="padding:14px 6px">
        <div class="text-2xl">🟡</div><div class="font-bold text-sm mt-1">中等</div><div class="text-cap text-gray-500">挖空 50%</div>
      </button>
      <button data-mask="1" class="card-cartoon tap-bounce text-center" style="padding:14px 6px">
        <div class="text-2xl">🔴</div><div class="font-bold text-sm mt-1">全背</div><div class="text-cap text-gray-500">全部遮住</div>
      </button>
    </div>
  `;
  app.querySelector('#backBtn').addEventListener('click', () => { stopSpeaking(); renderRecite(app, article, onBack); });
  app.querySelector('#readBtn').addEventListener('click', () => speak(article.content, { rate: 0.85 }));
  app.querySelectorAll('[data-mask]').forEach(b => {
    b.addEventListener('click', () => renderChallengeRecite(app, article, parseFloat(b.dataset.mask), onBack));
  });
}

// 背诵挑战：挖空 + 录音
function renderChallengeRecite(app, article, maskRatio, onBack) {
  // ★ 级轻场景：只隐藏导航防误触（单次录音，没有可丢的累积进度）
  enterFocus({ confirm: false, cleanup: stopSpeaking });
  // 挖空：对内容里的"词"按比例遮成 ____（伪随机但稳定）
  const parts = article.content.split(/(\s+)/);
  let wi = 0;
  const masked = parts.map(tok => {
    if (/^\s+$/.test(tok) || !/[a-zA-Z]/.test(tok)) return tok;
    wi++;
    // 全遮：全部挖；否则按比例（用下标做稳定伪随机）
    const hide = maskRatio >= 1 || (Math.sin(wi * 12.9898) * 43758.5453 % 1 + 1) % 1 < maskRatio;
    if (hide) {
      const lead = tok.match(/^[^a-zA-Z]*/)[0];
      const trail = tok.match(/[^a-zA-Z]*$/)[0];
      const core = tok.slice(lead.length, tok.length - trail.length);
      return lead + '<span class="recite-blank">' + '＿'.repeat(Math.min(core.length, 6)) + '</span>' + trail;
    }
    return tok;
  }).join('');

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
      <h2 class="text-base font-bold flex-1">🧠 背诵挑战</h2>
    </div>
    <div class="card-cartoon mb-4 recite-text">
      <div class="text-xs text-gray-400 mb-2">看着挖空的提示，把整段背出来</div>
      <div class="font-en text-base leading-loose">${masked}</div>
    </div>
    <button id="recBtn" class="w-full btn-cartoon record-btn">🎤 点击开始背诵</button>
    <div id="result" class="mt-4"></div>
  `;
  app.querySelector('#backBtn').addEventListener('click', () => { stopSpeaking(); renderChallengePrep(app, article, onBack); });

  const recBtn = app.querySelector('#recBtn');
  recBtn.addEventListener('click', async () => {
    if (!isSpeechRecognitionSupported()) { toast('当前浏览器不支持语音识别', 'error'); return; }
    recBtn.textContent = '🎤 录音中…背完会自动结束';
    recBtn.disabled = true;
    recBtn.classList.add('pulse-glow');
    try {
      const handle = recognize();
      const results = await handle.promise;
      const spoken = results[0] ? results[0].transcript : '';
      const res = alignWords(article.content, spoken);
      showScore(res);
    } catch (e) {
      toast('没听清，再试一次', 'warn');
      recBtn.textContent = '🎤 点击开始背诵';
      recBtn.disabled = false;
      recBtn.classList.remove('pulse-glow');
    }
  });

  function showScore(res) {
    exitFocus(); // 打分结果页不是答题态
    const score = res.score;
    let grade, gradeCls;
    if (score >= 95) { grade = '完美 🏆'; gradeCls = 'text-yellow-700'; }
    else if (score >= 80) { grade = '熟练 😃'; gradeCls = 'text-green-700'; }
    else if (score >= 60) { grade = '基本 🙂'; gradeCls = 'text-blue-600'; }
    else { grade = '继续加油 💪'; gradeCls = 'text-orange-700'; }

    // 奖励
    let reward = 0, exp = 0;
    if (score >= 95) { reward = 100; exp = 30; }
    else if (score >= 80) { reward = 60; exp = 10; }
    else if (score >= 60) { reward = 30; }
    if (reward) storage.addCoins(reward);
    if (exp) storage.addPetExp(exp);
    const prevBest = storage.getRecitationScore(article.id);
    storage.saveRecitationScore(article.id, score);

    // 背诵达人勋章
    let badgeMsg = '';
    if (score >= 95 && storage.unlockBadge('recite_perfect')) {
      badgeMsg = '<div class="text-sm font-bold text-yellow-700 mt-2">🎖️ 解锁勋章：背诵达人 🏆</div>';
    }

    playSound(score >= 60 ? 'levelup' : 'wrong');

    // 逐词高亮
    const highlight = res.tokens.map(t => {
      const cls = t.status === 'correct' ? 'text-green-700'
        : t.status === 'missing' ? 'text-gray-300 line-through'
        : 'text-red-600';
      return `<span class="${cls}">${t.word}</span>`;
    }).join(' ');

    app.querySelector('#result').innerHTML = `
      <div class="card-cartoon text-center bounce-in">
        <div class="text-2xl font-extrabold ${gradeCls}">${score}</div>
        <div class="text-lg font-bold ${gradeCls} mb-1">${grade}</div>
        ${reward ? `<div class="text-sm text-orange-700 font-bold">+${reward}🪙 ${exp ? '· 经验+' + exp : ''}</div>` : ''}
        ${score > prevBest && prevBest > 0 ? '<div class="text-xs text-green-700">🎉 刷新最高分！</div>' : ''}
        ${badgeMsg}
        <div class="flex justify-center gap-4 text-xs text-gray-500 mt-3">
          <span>完整度 <b class="text-gray-700">${res.completeness}%</b></span>
          <span>准确度 <b class="text-gray-700">${res.accuracy}%</b></span>
        </div>
      </div>
      <div class="card-cartoon mt-3 recite-text">
        <div class="text-xs text-gray-400 mb-2">逐词对照：<span class="text-green-700">对</span> / <span class="text-gray-300">漏</span> / <span class="text-red-600">多</span></div>
        <div class="font-en leading-relaxed">${highlight}</div>
      </div>
      <div class="flex gap-3 mt-4">
        <button id="retryBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">再背一次</button>
        <button id="doneBtn" class="flex-1 btn-cartoon">完成</button>
      </div>
    `;
    app.querySelector('#retryBtn').addEventListener('click', () => renderChallengeRecite(app, article, maskRatio, onBack));
    app.querySelector('#doneBtn').addEventListener('click', () => renderRecite(app, article, onBack));
  }
}
