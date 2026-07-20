// modules/pet.js - 剑桥话题词库模块（PET B1 + KET A2 双源：话题词库 + 复用闯关 + 识词卡片）
// profile.grade === 'PET' 或 'KET' 时启用，按档位选择词库来源。
import { loadJSON, toast } from '../app.js';
import * as storage from '../storage.js';
import { speak, playSound } from '../speech.js';
import { renderLevelMap } from './levels.js';
import { mnemonicHtml } from './words.js';

// 双词库来源：进度键前缀与数字年级/彼此隔离
const SOURCES = {
  PET: {
    key: 'PET',
    topicsPath: 'data/pet/topics.json',
    wordsDir: 'data/pet/words/',
    title: '🎓 PET 单词闯关',
    intro: '剑桥 PET · B1 词汇',
    backPage: 'home'
  },
  KET: {
    key: 'KET',
    topicsPath: 'data/exam/ket/words/index.json',
    wordsDir: 'data/exam/ket/words/',
    title: '🗝️ KET 单词闯关',
    intro: '剑桥 KET · A2 词汇',
    backPage: 'exam-hub'
  }
};

// 当前档位对应的词库来源（KET 备考档读 KET 库，其余读 PET 库）
function currentSource() {
  return storage.getProfile().grade === 'KET' ? SOURCES.KET : SOURCES.PET;
}

// 话题词库进度键：如 "KET:personal" / "PET:travel"
function progressKey(src, topicId) { return `${src.key}:${topicId}`; }

// 载入话题清单（含 ready / pending 状态）
async function loadTopics(src) {
  const data = await loadJSON(src.topicsPath);
  return (data && Array.isArray(data.topics)) ? data.topics : [];
}

// 载入某话题词库文件 → 返回 words 数组（失败返回 null）
async function loadTopicWords(src, topic) {
  if (!topic || !topic.file) return null;
  const data = await loadJSON(`${src.wordsDir}${topic.file}`);
  if (!data || !Array.isArray(data.words)) return null;
  return data;
}

// 词条的考试字段（petExam / ketExam 二选一，见词库数据约定）
function examInfo(w) {
  if (!w) return { field: null, tag: '' };
  if (w.ketExam) return { field: w.ketExam, tag: 'KET' };
  if (w.petExam) return { field: w.petExam, tag: 'PET' };
  return { field: null, tag: '' };
}

// 常见搭配小卡片
function collocationsHtml(w) {
  const info = examInfo(w).field;
  const col = info && Array.isArray(info.collocations) ? info.collocations : [];
  if (!col.length) return '';
  return `
    <div class="pet-collo">
      <div class="pet-collo-head">🔗 常见搭配</div>
      <div class="pet-collo-chips">
        ${col.map(c => `<span class="pet-chip font-en">${c}</span>`).join('')}
      </div>
    </div>`;
}

// 频率标签
function freqBadge(w) {
  const { field, tag } = examInfo(w);
  const f = field && field.frequency;
  const map = { high: { t: '高频', c: 'pet-freq-high' }, medium: { t: '中频', c: 'pet-freq-mid' }, low: { t: '低频', c: 'pet-freq-low' } };
  const m = map[f];
  return m ? `<span class="pet-freq ${m.c}">${tag} ${m.t}</span>` : '';
}

// ============================================================
// PET 单词主页：话题列表
// ============================================================
export async function renderPetWordsHome(app) {
  const src = currentSource();
  const topics = await loadTopics(src);

  if (!topics.length) {
    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-xl font-bold">${src.title}</h2>
      </div>
      <div class="card-cartoon empty-state">
        <span class="empty-emoji">📚</span>
        <div class="empty-text">话题清单加载失败</div>
        <div class="empty-sub">请检查网络或稍后再试</div>
      </div>`;
    app.querySelector('#backBtn').addEventListener('click', () => window.__nav(src.backPage));
    return;
  }

  const readyCount = topics.filter(t => t.status === 'ready').length;

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
      <h2 class="text-xl font-bold flex-1">${src.title}</h2>
    </div>

    <div class="card-cartoon mb-4 bg-gradient-to-r from-orange-50 to-yellow-50">
      <div class="font-bold mb-1">${src.intro}</div>
      <div class="text-sm text-gray-600">按话题分组，选一个话题开始闯关记词。已开放 ${readyCount} / ${topics.length} 个话题。</div>
    </div>

    <div class="pet-topic-grid">
      ${topics.map(t => {
        const ready = t.status === 'ready';
        return `
          <button class="pet-topic-card tap-bounce ${ready ? '' : 'pet-topic-locked'}" data-topic="${t.id}" data-ready="${ready ? 1 : 0}">
            <div class="pet-topic-icon">${t.icon || '📘'}</div>
            <div class="pet-topic-name">${t.name}</div>
            <div class="pet-topic-status">${ready ? '▶ 开始' : '🔒 敬请期待'}</div>
          </button>`;
      }).join('')}
    </div>
  `;

  app.querySelector('#backBtn').addEventListener('click', () => window.__nav(src.backPage));
  app.querySelectorAll('[data-topic]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.ready === '1') {
        window.__nav('petlevels', { topic: btn.dataset.topic });
      } else {
        playSound('click');
        toast('这个话题正在准备中，敬请期待～', 'info');
      }
    });
  });
}

// ============================================================
// PET 话题落地页：识词学习 + 闯关入口
// ============================================================
export async function renderPetTopicMap(app, topicId) {
  if (!topicId) return window.__nav('words'); // 兜底：无话题回列表

  const src = currentSource();
  const topics = await loadTopics(src);
  const topic = topics.find(t => t.id === topicId);
  if (!topic || topic.status !== 'ready') {
    toast('该话题暂未开放', 'info');
    return window.__nav('words');
  }

  const data = await loadTopicWords(src, topic);
  if (!data) {
    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl">‹</button>
        <h2 class="text-xl font-bold">${topic.icon} ${topic.name}</h2>
      </div>
      <div class="card-cartoon empty-state">
        <span class="empty-emoji">📭</span>
        <div class="empty-text">该话题词库还在准备中</div>
        <div class="empty-sub">敬请期待后续更新</div>
      </div>`;
    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
    return;
  }

  const words = data.words;
  const key = progressKey(src, topicId);
  const learned = storage.getLearnedWords();
  const learnedCount = words.filter(w => learned[w.id]).length;
  const numLevels = Math.max(1, Math.ceil(words.length / 8));
  const prog = storage.getLevelProgress(key);
  const cleared = Object.values(prog).filter(r => r.cleared).length;
  const stars = storage.getTotalStars(key);

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
      <h2 class="text-lg font-bold flex-1">${topic.icon} ${topic.name}</h2>
    </div>

    <div class="card-cartoon mb-4 bg-gradient-to-r from-orange-50 to-yellow-50">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold">本话题进度</span>
        <span class="text-sm text-gray-500">${learnedCount}/${words.length} 词 · ⭐${stars}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width:${words.length ? (learnedCount/words.length)*100 : 0}%"></div>
      </div>
    </div>

    <button id="studyBtn" class="w-full card-cartoon tap-bounce flex items-center gap-4 text-left mb-3 bg-gradient-to-br from-cyan-50 to-blue-50">
      <div class="text-5xl">📖</div>
      <div class="flex-1">
        <div class="font-bold">识词学习</div>
        <div class="text-xs text-gray-500">看词卡、记忆法和常见搭配</div>
      </div>
      <div class="text-2xl text-gray-300">›</div>
    </button>

    <button id="levelBtn" class="w-full card-cartoon tap-bounce text-left relative overflow-hidden"
      style="background:linear-gradient(135deg,#FFE3C2,#FFD0E0);padding:22px">
      <div class="absolute right-3 top-3 text-5xl opacity-30">🗺️</div>
      <div class="text-xs font-bold text-orange-600 mb-1">🔥 话题闯关</div>
      <div class="text-2xl font-extrabold mb-1">${numLevels} 关 · 已通 ${cleared}</div>
      <div class="text-xs text-gray-600 mb-3">每关 8 个单词，闯关记单词</div>
      <div class="inline-block btn-cartoon" style="padding:8px 22px;pointer-events:none">▶ 开始闯关</div>
    </button>
  `;

  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
  app.querySelector('#studyBtn').addEventListener('click', () => renderPetStudy(app, topic, words));
  app.querySelector('#levelBtn').addEventListener('click', () => {
    renderLevelMap(app, {
      words,
      progressKey: key,
      title: `🗺️ ${topic.icon} ${topic.name}`,
      onBack: () => renderPetTopicMap(app, topicId)
    });
  });
}

// ============================================================
// PET 识词学习：逐词卡片（复用记忆法卡片 + 常见搭配）
// ============================================================
function renderPetStudy(app, topic, words) {
  let idx = 0;

  function renderCurrent() {
    if (idx >= words.length) return renderDone();
    const w = words[idx];

    app.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
        <div class="flex-1">
          <div class="text-sm font-bold">${topic.icon} ${topic.name}</div>
          <div class="text-xs text-gray-500">识词 ${idx + 1} / ${words.length}</div>
        </div>
      </div>

      <div class="progress-bar mb-4">
        <div class="progress-bar-fill" style="width:${(idx/words.length)*100}%"></div>
      </div>

      <div class="card-cartoon text-center bounce-in">
        <div class="flex items-center justify-center gap-2 mb-1">
          <span class="text-xs text-gray-400">${w.pos || ''}</span>
          ${freqBadge(w)}
        </div>
        <div class="word-main font-en text-primary" style="word-break:break-word">${w.word}</div>
        <div class="text-sm text-gray-500 mb-2">${w.phonetic || ''}</div>
        <button id="speakBtn" class="text-3xl mb-2 tap-bounce">🔊</button>
        <div class="word-meaning text-primary font-bold mb-3">${w.meaning}</div>

        ${w.examples && w.examples.length ? `
          <div class="bg-orange-50 rounded-2xl p-3 text-left mt-2">
            <div class="text-xs text-gray-500 mb-1">例句</div>
            ${w.examples.map(ex => `
              <div class="mb-2 last:mb-0">
                <div class="font-en text-sm">${ex.en}</div>
                <div class="text-xs text-gray-500">${ex.zh}</div>
              </div>`).join('')}
          </div>` : ''}

        ${mnemonicHtml(w)}
        ${collocationsHtml(w)}
      </div>

      <div class="grid grid-cols-2 gap-3 mt-4">
        <button id="prevBtn" class="btn-cartoon btn-cartoon-secondary" ${idx === 0 ? 'style="opacity:.5;pointer-events:none"' : ''}>‹ 上一个</button>
        <button id="nextBtn" class="btn-cartoon">${idx === words.length - 1 ? '完成 ✓' : '下一个 ›'}</button>
      </div>
    `;

    app.querySelector('#backBtn').addEventListener('click', () => window.__nav('petlevels', { topic: topic.id }));
    app.querySelector('#speakBtn').addEventListener('click', () => speak(w.word));
    setTimeout(() => speak(w.word), 300);

    app.querySelector('#prevBtn').addEventListener('click', () => { if (idx > 0) { idx--; renderCurrent(); } });
    app.querySelector('#nextBtn').addEventListener('click', () => {
      storage.markWordLearned(w.id);
      idx++;
      renderCurrent();
    });
  }

  function renderDone() {
    playSound('levelup');
    app.innerHTML = `
      <div class="text-center py-12 fade-in">
        <div class="text-6xl mb-4 bounce-in">🎉</div>
        <h2 class="text-2xl font-bold mb-2">识词完成！</h2>
        <div class="text-gray-500 mb-6">${topic.name} · 共 ${words.length} 词</div>
        <div class="flex gap-3">
          <button id="againBtn" class="flex-1 btn-cartoon btn-cartoon-secondary">再看一遍</button>
          <button id="playBtn" class="flex-1 btn-cartoon">去闯关 🗺️</button>
        </div>
      </div>`;
    app.querySelector('#againBtn').addEventListener('click', () => { idx = 0; renderCurrent(); });
    app.querySelector('#playBtn').addEventListener('click', () => window.__nav('petlevels', { topic: topic.id }));
  }

  renderCurrent();
}

// 双源全量词缓存（sw 已预缓存全部词库文件，首次构建后驻留内存）
let allWordsCache = null;
async function loadAllExamWords() {
  if (allWordsCache) return allWordsCache;
  const out = [];
  for (const src of [SOURCES.KET, SOURCES.PET]) {
    try {
      const topics = await loadTopics(src);
      for (const t of topics.filter(x => x.status === 'ready')) {
        const data = await loadTopicWords(src, t);
        if (data && Array.isArray(data.words)) {
          data.words.forEach(w => out.push({ word: w, topic: t, srcKey: src.key }));
        }
      }
    } catch (e) { /* 单源失败不拖垮另一源 */ }
  }
  allWordsCache = out;
  return out;
}

// 供错题本/错词突击使用：把 ready 话题的 KET+PET 词按 id 收集（附带 topic 标签）
export async function collectPetWordsById(mapObj) {
  const all = await loadAllExamWords();
  all.forEach(({ word: w, topic: t, srcKey }) => {
    mapObj[w.id] = srcKey === 'KET' ? { ...w, ketTopic: t.name } : { ...w, petTopic: t.name };
  });
  return mapObj;
}

// 供阅读模块的"点词查义"使用：把 ready 话题的 KET+PET 词并入词库索引
export async function collectPetWordsForIndex(indexObj) {
  const all = await loadAllExamWords();
  all.forEach(({ word: w }) => {
    const k = (w.word || '').toLowerCase();
    if (k && !indexObj[k]) indexObj[k] = w;
  });
  return indexObj;
}
