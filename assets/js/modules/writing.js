// modules/writing.js - 写作工坊 + 伪 AI 批改
import { loadJSON, toast, enterFocus, exitFocus, requestLeaveFocus } from '../app.js';
import * as storage from '../storage.js';
import { playSound } from '../speech.js';
import { aiEnabled, askAI, aiFailText, buildWritingPrompt, isOffline, aiSuspended, aiRestText, onBackOnline } from '../utils/ai-chat.js'; // B6c-4 AI 老师点评（增强不替代：规则引擎照旧，AI 只给方向不打分）

// 词汇升级建议表 (低级→高级)
const WORD_UPGRADES = {
  'good':       ['excellent', 'wonderful', 'outstanding', 'superb'],
  'bad':        ['terrible', 'awful', 'poor'],
  'big':        ['huge', 'enormous', 'massive'],
  'small':      ['tiny', 'little', 'mini'],
  'happy':      ['delighted', 'cheerful', 'joyful'],
  'sad':        ['sorrowful', 'unhappy', 'depressed'],
  'nice':       ['lovely', 'pleasant', 'charming'],
  'beautiful':  ['gorgeous', 'stunning', 'attractive'],
  'fun':        ['enjoyable', 'entertaining', 'delightful'],
  'like':       ['enjoy', 'love', 'adore'],
  'a lot':      ['plenty of', 'a great deal of'],
  'really':     ['truly', 'genuinely', 'extremely'],
  'very':       ['extremely', 'remarkably', 'incredibly'],
  'said':       ['mentioned', 'remarked', 'stated'],
  'thing':      ['matter', 'item', 'object'],
  'go':         ['head', 'travel', 'venture']
};

// 简单"已知"词集合 (内置一个高频词表，用于拼写检查)
const COMMON_WORDS = new Set([
  'a','an','the','and','but','or','if','of','in','on','at','to','for','with','from',
  'is','am','are','was','were','be','been','being','have','has','had','do','does','did',
  'will','would','can','could','may','might','must','should','shall',
  'i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','our','their',
  'this','that','these','those','what','which','who','whom','whose','where','when','why','how',
  'not','no','yes','too','also','very','really','so','quite','just','only','even','still',
  'some','any','many','much','few','little','more','most','less','least','all','each','every',
  'one','two','three','four','five','six','seven','eight','nine','ten','first','second','third','last',
  'time','day','year','month','week','today','yesterday','tomorrow','morning','afternoon','evening','night',
  'good','bad','big','small','happy','sad','nice','beautiful','tall','short','old','young','new','fun',
  'go','come','see','look','watch','say','tell','speak','talk','make','do','get','give','take','find','put',
  'eat','drink','sleep','play','run','walk','jump','sit','stand','live','love','like','want','need','know','think','feel',
  'school','classroom','student','teacher','class','book','pen','pencil','homework','exam','study','learn','read','write',
  'family','father','mother','brother','sister','parent','friend','people','boy','girl','man','woman','child',
  'home','house','room','bed','door','window','table','chair','kitchen','bedroom','bathroom',
  'food','rice','bread','milk','water','tea','coffee','apple','banana','egg','fish','meat',
  'cat','dog','bird','animal','tree','flower','sun','moon','star','sky','sea','mountain','river',
  'red','yellow','blue','green','black','white','orange','pink','purple','color','colour',
  'hello','hi','goodbye','bye','please','thank','thanks','sorry','welcome',
  'monday','tuesday','wednesday','thursday','friday','saturday','sunday',
  'spring','summer','autumn','winter','season','weather','sunny','rainy','windy','snowy','cold','hot','warm','cool',
  'sport','football','basketball','tennis','swim','swimming','run','running','game','exercise',
  'music','song','sing','dance','draw','paint','picture','movie','film','tv','television',
  'park','library','hospital','shop','store','market','street','road','city','town','country','world',
  'every','always','usually','often','sometimes','never','here','there',
  'best','better','worst','worse','than','too','also','about','because','since','while','during','before','after','until',
  'as','into','through','over','under','above','below','between','among','around','behind','beside',
  'his','its','him',"i'm","you're","he's","she's","it's","we're","they're","don't","doesn't","didn't","can't","won't","isn't","aren't","wasn't","weren't",
  'lets',"let's",'me','am','our','ours','yours','hers','theirs',
  'play','playing','played','plays','reading','reads','read','wrote','written','writing','writes',
  'going','went','gone','coming','came','saw','seen','given','gave','taken','took','made','done','got','found','put','left',
  'name','dream','goal','future','past','hobby','vacation','holiday','trip','travel','visit',
  'health','healthy','important','interesting','difficult','easy','hard','simple','clever','kind','helpful','careful',
  'morning','noon','night','o','clock','minute','hour','second',
  'really','actually','probably','maybe','perhaps','definitely','certainly',
  'first','second','third','then','next','finally','last','also','besides',
  'because','though','although','however','therefore','moreover','also','besides','instead','indeed',
  'protect','protection','environment','pollution','plastic','rubbish','trash','green','clean','dirty',
  'help','helped','helping','helpful','start','started','starting','begin','began','begun',
  'eat','ate','eaten','drank','drunk','slept','slept','sat','sit','stand','stood',
  'tom','jerry','lily','mike','jim','jack','bob','anna','lucy','john','mary','helen','peter','sarah','smith','green','brown',
  'beijing','shanghai','china','english','chinese','american','british','japan','japanese','french','german',
  'mom','dad','grandma','grandpa','grandfather','grandmother','aunt','uncle','cousin',
  'pet','dog','cat','rabbit','panda','tiger','lion','bear','fox',
  'dinner','breakfast','lunch','snack',
  'much','many','some','any','few','little','several','enough'
]);

export async function renderWritingPage(app, params) {
  const data = await loadJSON('data/writing/topics.json');
  const samplesData = await loadJSON('data/writing/samples.json');
  if (!data) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">数据加载失败</div>';
    return;
  }

  const profile = storage.getProfile();

  if (params.topicId) {
    return renderTopic(app, data.topics.find(t => t.id === params.topicId), samplesData);
  }

  // 列表 (按是否匹配年级分组)
  const myGradeTopics = data.topics.filter(t => t.grade.includes(profile.grade));
  const otherTopics = data.topics.filter(t => !t.grade.includes(profile.grade));

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl">‹</button>
      <h2 class="text-xl font-bold">✍️ 写作工坊</h2>
    </div>

    ${myGradeTopics.length ? `
      <div class="text-sm font-bold mb-2">推荐给你的话题</div>
      <div class="space-y-2 mb-4">
        ${myGradeTopics.map(t => topicCard(t)).join('')}
      </div>
    ` : ''}

    ${otherTopics.length ? `
      <div class="text-sm font-bold mb-2 text-gray-500">其他话题</div>
      <div class="space-y-2">
        ${otherTopics.map(t => topicCard(t)).join('')}
      </div>
    ` : ''}
  `;
  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('home'));
  app.querySelectorAll('[data-topic]').forEach(btn => {
    btn.addEventListener('click', () => window.__nav('writing', { topicId: btn.dataset.topic }));
  });
}

function topicCard(t) {
  return `
    <button data-topic="${t.id}" class="w-full card-cartoon tap-bounce text-left flex items-center gap-3">
      <div class="text-3xl">📝</div>
      <div class="flex-1">
        <div class="font-bold font-en text-sm">${t.title}</div>
        <div class="text-xs text-gray-500">${t.wordCount[0]}-${t.wordCount[1]} 词 · ${t.type}</div>
      </div>
      <div class="text-2xl text-gray-300">›</div>
    </button>
  `;
}

function renderTopic(app, topic, samplesData) {
  if (!topic) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">没找到这个话题，回列表重新选一个吧</div>';
    return;
  }

  // 自动草稿（V0.9.33）：复用备考中心的草稿存储，level 固定 'FREE' 与 KET/PET 互不串档。
  // 进入时回填上次写到一半的内容，input 防抖落盘——误触退出也不丢字。
  const savedDraft = (storage.getWritingDrafts('FREE')[topic.id] || {}).text || '';
  let userText = savedDraft;
  let result = null;
  let draftT = null;
  if (savedDraft.trim()) setTimeout(() => toast('上次写到这里，接着写就好', 'info'), 400);

  function render() {
    if (result) return renderResult();

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-base font-bold flex-1 font-en">${topic.title}</h2>
      </div>

      <div class="card-cartoon mb-3 bg-gradient-to-br from-pink-50 to-orange-50">
        <div class="text-xs text-gray-400 mb-1">写作要求</div>
        <div class="text-sm">字数 ${topic.wordCount[0]}-${topic.wordCount[1]} 词 · ${topic.type}</div>
      </div>

      <div class="card-cartoon mb-3">
        <h3 class="font-bold mb-2">💡 写作提示</h3>
        <ul class="space-y-1 text-sm">
          ${topic.tips.map(t => `<li class="flex gap-2"><span class="text-primary-ink">▸</span><span>${t}</span></li>`).join('')}
        </ul>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="text-xs text-gray-400 mb-1">参考词汇</div>
          <div class="flex flex-wrap gap-1">
            ${topic.keyWords.map(w => `<span class="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-en">${w}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="card-cartoon mb-3">
        <textarea id="writeArea" class="w-full min-h-[200px] p-3 rounded-2xl border-2 border-gray-200 focus:border-primary outline-none font-en text-sm leading-relaxed resize-none" placeholder="开始你的英文写作...">${userText.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</textarea>
        <div class="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span id="wordCount">0 词</span>
          <span class="text-gray-300">建议 ${topic.wordCount[0]}-${topic.wordCount[1]} 词</span>
        </div>
      </div>

      <button id="submitBtn" class="w-full btn-cartoon">🎯 智能批改</button>
    `;

    const ta = app.querySelector('#writeArea');
    const wc = app.querySelector('#wordCount');
    function updateCount() {
      const text = ta.value.trim();
      const count = text ? text.split(/\s+/).filter(w => w).length : 0;
      wc.textContent = count + ' 词';
      userText = ta.value;
      // 防抖自动存草稿
      clearTimeout(draftT);
      draftT = setTimeout(() => storage.saveWritingDraft('FREE', topic.id, ta.value), 500);
    }
    ta.addEventListener('input', updateCount);
    updateCount();

    // 答题态：写作中 ‹/Esc 先确认（草稿已自动保存，确认只防误触打断）
    enterFocus({
      leave: () => window.__nav('writing'),
      stayLabel: '继续写',
      note: '写到一半的内容已自动保存，下次进来接着写。',
      cleanup: () => { clearTimeout(draftT); storage.saveWritingDraft('FREE', topic.id, userText); }
    });
    app.querySelector('#backBtn').addEventListener('click', () => requestLeaveFocus(() => window.__nav('writing')));
    app.querySelector('#submitBtn').addEventListener('click', () => {
      const text = ta.value.trim();
      if (!text || text.split(/\s+/).length < 10) {
        toast('请至少写 10 个词哦', 'warn');
        return;
      }
      result = grade(text, topic);
      // 解锁成就
      storage.unlockBadge && storage.unlockBadge('first_essay');
      storage.addCoins(20);
      playSound('correct');
      render();
    });
  }

  function renderResult() {
    exitFocus(); // 批改结果页不是答题态
    const sample = samplesData?.samples.find(s => s.topicId === topic.id);

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-base font-bold flex-1">批改结果</h2>
      </div>

      <!-- 总分 -->
      <div class="card-cartoon text-center bg-gradient-to-br from-orange-100 to-pink-50 mb-3">
        <div class="text-sm text-gray-500">总分</div>
        <div class="text-2xl font-bold text-primary-ink my-2">${result.total}</div>
        <div class="text-sm">${result.totalComment}</div>
      </div>

      <!-- 4 维度 -->
      <div class="card-cartoon mb-3">
        <h3 class="font-bold mb-3">📊 四维评分</h3>
        ${[
          { key: 'spelling', name: '拼写', icon: '🔤' },
          { key: 'grammar',  name: '语法', icon: '📐' },
          { key: 'vocab',    name: '词汇', icon: '📚' },
          { key: 'structure',name: '结构', icon: '🏗️' }
        ].map(d => {
          const score = result.dimensions[d.key].score;
          return `
            <div class="mb-3 last:mb-0">
              <div class="flex items-center justify-between text-sm mb-1">
                <span>${d.icon} ${d.name}</span>
                <span class="font-bold">${score}/25</span>
              </div>
              <div class="progress-bar"><div class="progress-bar-fill" style="width:${(score/25)*100}%"></div></div>
              <div class="text-xs text-gray-500 mt-1">${result.dimensions[d.key].feedback}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 你的作文 + 标注 -->
      <div class="card-cartoon mb-3">
        <h3 class="font-bold mb-2">📝 你的作文</h3>
        <div class="font-en text-sm leading-relaxed bg-gray-50 p-3 rounded-2xl">${result.markedHtml}</div>
        ${result.issues.length ? `
          <div class="mt-3 pt-3 border-t border-gray-100">
            <div class="text-xs font-bold text-gray-600 mb-2">问题清单 (${result.issues.length})</div>
            <ul class="space-y-1 text-xs">
              ${result.issues.map(i => `<li class="flex gap-2">
                <span class="${i.type === 'error' ? 'text-red-600' : i.type === 'warn' ? 'text-orange-700' : 'text-blue-600'}">●</span>
                <span>${i.message}</span>
              </li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <!-- 词汇升级建议 -->
      ${result.upgrades.length ? `
        <div class="card-cartoon mb-3 bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 class="font-bold mb-2">⬆️ 词汇升级建议</h3>
          <div class="space-y-1 text-sm">
            ${result.upgrades.map(u => `
              <div class="flex items-center gap-2">
                <span class="font-en text-gray-500 line-through">${u.from}</span>
                <span>→</span>
                <span class="font-en text-primary-ink font-bold">${u.to.join(' / ')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- B6c-4 AI 老师点评（主动点击；不打分不改写不代写；无 key 不渲染） -->
      ${aiEnabled() ? (aiSuspended()
        ? `<div class="text-xs text-gray-400 mb-3">${aiRestText()}</div>`
        : `
      <button id="aiReviewBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-3" style="min-height:48px" ${isOffline() ? 'data-ai-off="1" disabled' : ''}>${isOffline() ? '🤖 联网后可用' : '🤖 让 AI 老师点评几句（不打分）'}</button>
      <div id="aiReviewOut" class="card-cartoon mb-3 text-sm text-gray-700" style="line-height:1.85;white-space:pre-wrap;word-break:break-word" hidden></div>`) : ''}

      <!-- 范文对比 -->
      ${sample ? `
        <div class="card-cartoon mb-3 bg-gradient-to-br from-green-50 to-cyan-50">
          <h3 class="font-bold mb-2">📖 优秀范文</h3>
          <div class="font-en text-sm leading-relaxed">${highlightSample(sample)}</div>
          <div class="mt-3 pt-3 border-t border-green-200 text-xs text-gray-600 leading-relaxed">${sample.translation}</div>
          ${sample.highlights && sample.highlights.length ? `
            <div class="mt-3 pt-3 border-t border-green-200">
              <div class="text-xs font-bold mb-2">💎 亮点表达</div>
              <ul class="space-y-1 text-xs">
                ${sample.highlights.map(h => `<li><span class="font-en font-bold">${h.phrase}</span>: ${h.comment}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="flex gap-3 mt-4">
        <button id="reviseBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">修改重交</button>
        <button id="doneBtn" class="flex-1 btn-cartoon">完成</button>
      </div>
    `;

    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('writing'));
    app.querySelector('#reviseBtn').addEventListener('click', () => { result = null; render(); });
    app.querySelector('#doneBtn').addEventListener('click', () => window.__nav('writing'));

    // B6c-4 AI 老师点评：规则引擎结果照旧在上面，AI 只补方向性反馈
    const arBtn = app.querySelector('#aiReviewBtn');
    if (arBtn && arBtn.dataset.aiOff) onBackOnline(() => {
      if (document.contains(arBtn)) { arBtn.disabled = false; arBtn.removeAttribute('data-ai-off'); arBtn.textContent = '🤖 让 AI 老师点评几句（不打分）'; }
    });
    if (arBtn) arBtn.addEventListener('click', async () => {
      if (arBtn.disabled) return;
      const out = app.querySelector('#aiReviewOut');
      arBtn.disabled = true;
      const label = arBtn.textContent;
      arBtn.textContent = '🤖 认真读一读你的作文…';
      const r = await askAI(buildWritingPrompt({
        taskDesc: `话题「${topic.title}」的自由写作（建议 ${topic.wordCount[0]}-${topic.wordCount[1]} 词）`,
        text: userText,
      }));
      arBtn.disabled = false;
      out.hidden = false;
      if (r.ok) {
        out.textContent = '🤖 ' + r.text;
        arBtn.hidden = true;
      } else {
        arBtn.textContent = label;
        out.className = 'text-xs text-gray-500 mb-3';
        out.textContent = aiFailText(r.reason);
        if (r.reason === 'suspended') arBtn.hidden = true;
      }
    });
  }

  render();
}

function highlightSample(sample) {
  let html = sample.content;
  if (sample.highlights) {
    sample.highlights.forEach(h => {
      const re = new RegExp(escapeRegex(h.phrase), 'gi');
      html = html.replace(re, m => `<span class="bg-yellow-200 px-1 rounded">${m}</span>`);
    });
  }
  return html;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// === 核心：伪 AI 批改引擎 ===
function grade(text, topic) {
  const issues = [];
  const upgrades = [];

  // 维度 1: 拼写 (满分 25)
  const tokens = text.match(/[a-zA-Z']+/g) || [];
  const totalWords = tokens.length;
  const suspicious = [];
  tokens.forEach(tk => {
    const lower = tk.toLowerCase().replace(/'/g, '');
    if (!lower) return;
    // 跳过专有名词 (大写开头)
    if (/^[A-Z]/.test(tk) && tk.length > 1) return;
    // 检查是否在常用词或可升级词中
    if (!COMMON_WORDS.has(lower) && !WORD_UPGRADES[lower] && lower.length >= 2) {
      suspicious.push(tk);
    }
  });
  const spellingErrorRate = suspicious.length / Math.max(totalWords, 1);
  let spellingScore = Math.round(25 * (1 - Math.min(spellingErrorRate * 3, 1)));
  spellingScore = Math.max(0, spellingScore);
  if (suspicious.length > 0 && suspicious.length <= 5) {
    issues.push({ type: 'warn', message: `这几个词可能拼错了：${suspicious.slice(0,5).join(', ')}` });
  } else if (suspicious.length > 5) {
    issues.push({ type: 'error', message: `可能有较多拼写错误，仔细检查一下：${suspicious.slice(0,5).join(', ')}...` });
  }

  // 维度 2: 语法 (满分 25)
  let grammarScore = 25;
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s);

  // 句首大写检查
  let lowercaseStarts = 0;
  sentences.forEach(s => {
    if (s && /^[a-z]/.test(s)) {
      lowercaseStarts++;
    }
  });
  if (lowercaseStarts > 0) {
    grammarScore -= Math.min(lowercaseStarts * 2, 6);
    issues.push({ type: 'error', message: `${lowercaseStarts} 个句子句首没有大写` });
  }

  // 句末标点检查
  if (!/[.!?]$/.test(text.trim())) {
    grammarScore -= 2;
    issues.push({ type: 'warn', message: '文章末尾缺少标点符号' });
  }

  // 时态混乱: yesterday/last 等过去时间词 + 一般现在时动词
  const pastIndicators = /\b(yesterday|last\s+\w+|ago|in\s+\d{4})\b/i;
  if (pastIndicators.test(text)) {
    // 简单检查是否有大量第三人称单数 -s
    const has3rdSingS = /\b(he|she|it)\s+\w+s\b/i.test(text);
    if (has3rdSingS && !/\bwas\b|\bwere\b|\bdid\b|ed\b/i.test(text)) {
      grammarScore -= 4;
      issues.push({ type: 'warn', message: '文章里有表示过去的时间词，但有些动词还没改成过去式' });
    }
  }

  // 第三人称单数 -s 简单检查
  const thirdPersonRegex = /\b(he|she|it)\s+(\w+)/gi;
  let m;
  let thirdSingErrors = 0;
  const verbExceptions = new Set(['is','was','has','had','does','did','can','could','will','would','should','must','may','might','am','are']);
  while ((m = thirdPersonRegex.exec(text)) !== null) {
    const verb = m[2].toLowerCase();
    if (verbExceptions.has(verb)) continue;
    if (/^[a-z]+$/.test(verb) && !/(s|ed|ing)$/.test(verb) && verb.length > 2 && COMMON_WORDS.has(verb)) {
      // he go / she like 这种
      thirdSingErrors++;
    }
  }
  if (thirdSingErrors > 0) {
    grammarScore -= Math.min(thirdSingErrors * 2, 6);
    issues.push({ type: 'warn', message: `${thirdSingErrors} 处可能漏掉了第三人称单数 -s` });
  }
  grammarScore = Math.max(0, grammarScore);

  // 维度 3: 词汇 (满分 25)
  let vocabScore = 15; // 基础分
  const lowerText = text.toLowerCase();
  // 词汇升级机会
  Object.entries(WORD_UPGRADES).forEach(([k, v]) => {
    const re = new RegExp(`\\b${escapeRegex(k)}\\b`, 'gi');
    const count = (lowerText.match(re) || []).length;
    if (count > 0) {
      upgrades.push({ from: k, to: v });
    }
  });
  // 关键词使用情况
  const keyWordHits = topic.keyWords.filter(k => new RegExp(`\\b${escapeRegex(k)}\\b`, 'i').test(text)).length;
  vocabScore += Math.min(keyWordHits * 2, 8);
  // 用了升级词的话加分
  const advancedWords = ['excellent','wonderful','outstanding','enjoy','adore','extremely','incredibly','plenty'];
  const advHits = advancedWords.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(text)).length;
  vocabScore += Math.min(advHits * 2, 4);
  // 重复词检查
  const wordFreq = {};
  tokens.forEach(t => {
    const l = t.toLowerCase();
    if (l.length > 3 && !COMMON_WORDS.has(l)) {
      wordFreq[l] = (wordFreq[l] || 0) + 1;
    }
  });
  const repetitive = Object.entries(wordFreq).filter(([,c]) => c >= 4);
  if (repetitive.length > 0) {
    vocabScore -= 2;
    issues.push({ type: 'info', message: `这几个词用得有点多：${repetitive.slice(0,3).map(([w])=>w).join(', ')}，可以换成近义词` });
  }
  vocabScore = Math.min(25, Math.max(0, vocabScore));

  // 维度 4: 结构 (满分 25)
  let structureScore = 0;
  // 字数符合
  if (totalWords >= topic.wordCount[0] && totalWords <= topic.wordCount[1] * 1.3) {
    structureScore += 10;
  } else if (totalWords < topic.wordCount[0] * 0.7) {
    issues.push({ type: 'warn', message: `字数偏少，建议至少 ${topic.wordCount[0]} 词` });
    structureScore += 4;
  } else if (totalWords > topic.wordCount[1] * 1.5) {
    issues.push({ type: 'info', message: `字数偏多，注意精简` });
    structureScore += 7;
  } else {
    structureScore += 7;
  }
  // 句子数
  if (sentences.length >= 4) structureScore += 5;
  else { structureScore += sentences.length; issues.push({ type: 'warn', message: '句子有点少，可以再多写几句' }); }
  // 连接词
  const connectors = ['first','second','third','then','finally','however','therefore','because','also','besides','moreover','in addition','for example','but','and'];
  const connectorHits = connectors.filter(c => new RegExp(`\\b${escapeRegex(c)}\\b`, 'i').test(text)).length;
  structureScore += Math.min(connectorHits * 2, 8);
  if (connectorHits === 0) {
    issues.push({ type: 'info', message: '建议使用连接词 (first, then, but, however) 让文章更连贯' });
  }
  // 段落
  if (text.includes('\n\n') || text.includes('\n')) structureScore += 2;
  structureScore = Math.min(25, structureScore);

  const total = spellingScore + grammarScore + vocabScore + structureScore;

  let totalComment = '';
  if (total >= 90) totalComment = '🌟 写得非常出色！';
  else if (total >= 75) totalComment = '👍 整体表现不错，继续保持';
  else if (total >= 60) totalComment = '✊ 已经及格啦，还可以更好';
  else totalComment = '💪 多读多写，下次会更好';

  // 标注 HTML
  let markedHtml = escapeHTML(text);
  // 标红可疑拼写
  suspicious.slice(0, 8).forEach(s => {
    markedHtml = markedHtml.replace(new RegExp(`\\b${escapeRegex(s)}\\b`, 'g'),
      `<span class="bg-red-100 text-red-600 px-1 rounded underline decoration-wavy decoration-red-400">${s}</span>`);
  });
  // 标黄可升级词
  upgrades.forEach(u => {
    markedHtml = markedHtml.replace(new RegExp(`\\b${escapeRegex(u.from)}\\b`, 'gi'),
      m => `<span class="bg-yellow-100 text-yellow-700 px-1 rounded" title="可升级">${m}</span>`);
  });

  return {
    total,
    totalComment,
    dimensions: {
      spelling: { score: spellingScore, feedback: spellingErrorRate < 0.05 ? '拼写很准确' : spellingErrorRate < 0.15 ? '少数单词需要确认' : '建议仔细检查拼写' },
      grammar:  { score: grammarScore, feedback: grammarScore >= 22 ? '语法基本无误' : grammarScore >= 15 ? '有少量语法问题' : '需要加强语法' },
      vocab:    { score: vocabScore, feedback: vocabScore >= 20 ? '词汇丰富多样' : vocabScore >= 14 ? '词汇基础够用' : '可以使用更高级的词' },
      structure:{ score: structureScore, feedback: structureScore >= 20 ? '结构清晰流畅' : structureScore >= 14 ? '结构基本完整' : '注意段落和连接词' }
    },
    issues,
    upgrades,
    markedHtml
  };
}

function escapeHTML(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
