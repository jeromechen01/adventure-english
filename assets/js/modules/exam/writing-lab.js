// modules/exam/writing-lab.js —— 模块 5：写作学习和训练
// Part 6/7 讲解+模板+题库+原创范文+自评清单+草稿保存+一键跳 Write & Improve
// 不在 app 内自建 AI 批改（纯静态无后端，官方 W&I 更准更免费）
import { loadJSON, toast, enterFocus, exitFocus, requestLeaveFocus } from '../../app.js';
import * as storage from '../../storage.js';
import { speak } from '../../speech.js';
import { examLevel, headerHtml, bindBack, esc } from './exam-common.js';

export async function renderWritingLab(app, params = {}) {
  const level = examLevel();
  const g = await loadJSON('data/exam/ket/writing-guide.json');
  if (!g) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">✍️</span><div class="empty-text">写作数据加载失败</div></div>';
    return;
  }

  if (params.tab === 'speaking') return renderSpeaking(app, g);
  if (params.task) {
    const t6 = g.part6.tasks.find(t => t.id === params.task);
    if (t6) return renderTask(app, level, g, t6, 'part6');
    const t7 = g.part7.tasks.find(t => t.id === params.task);
    if (t7) return renderTask(app, level, g, t7, 'part7');
  }

  const drafts = storage.getWritingDrafts(level);

  app.innerHTML = `
    ${headerHtml('✍️ 写作实验室')}

    <div class="card-cartoon mb-4 border-2 border-amber-300 bg-amber-50">
      <div class="font-bold text-sm mb-1">💰 ${g.whyCard.title}</div>
      ${g.whyCard.lines.map(l => `<p class="text-sm text-gray-700 mb-1">${l}</p>`).join('')}
    </div>

    ${['part6', 'part7'].map(pk => {
      const p = g[pk];
      return `
      <div class="card-cartoon mb-4">
        <div class="font-bold mb-1">${pk === 'part6' ? '📮' : '🖼️'} ${p.name}</div>
        <div class="text-xs text-gray-500 mb-2">${p.rule}</div>
        <div class="bg-gray-50 rounded-2xl p-3 mb-2">
          <div class="text-xs font-bold mb-1">${p.template.title}</div>
          ${p.template.steps.map(s => `<div class="text-xs text-gray-600 mb-0.5">${s}</div>`).join('')}
          <div class="text-[11px] text-cyan-600 mt-1">🔗 ${p.template.connectors}</div>
        </div>
        ${p.tips.map(t => `<div class="text-xs text-orange-600 mb-0.5">⚠️ ${t}</div>`).join('')}
        <div class="mt-2 space-y-1.5">
          ${p.tasks.length === 0 ? '<div class="text-xs text-gray-400">题库补充中…</div>' :
            p.tasks.map((t, i) => `
            <button data-task="${t.id}" class="w-full tap-bounce flex items-center gap-2 border-2 border-gray-100 rounded-2xl p-2 text-left" style="min-height:48px">
              <span>${drafts[t.id] ? '📝' : '⬜'}</span>
              <span class="text-sm font-bold flex-1">第 ${i + 1} 题 · ${esc(t.topic || '')}</span>
              <span class="text-gray-300">›</span>
            </button>`).join('')}
        </div>
      </div>`;
    }).join('')}

    <!-- 评分三维 -->
    <div class="card-cartoon mb-4">
      <div class="font-bold text-sm mb-2">📏 ${g.scoring.title}</div>
      ${g.scoring.dims.map(d => `
        <div class="flex gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0">
          <span class="font-bold" style="min-width:130px">${d.name} <span class="text-xs text-gray-400">0-${d.max}</span></span>
          <span class="text-xs text-gray-600 flex-1">${d.desc}</span>
        </div>`).join('')}
      <div class="text-xs bg-green-50 text-green-700 rounded-xl px-3 py-2 mt-2">${g.scoring.bandNote}</div>
    </div>

    <!-- W&I -->
    <a href="${esc(g.wi.url)}" target="_blank" rel="noopener noreferrer" class="block card-cartoon tap-bounce mb-4 bg-gradient-to-r from-cyan-50 to-blue-50">
      <div class="font-bold text-sm">🚀 ${g.wi.title} ↗</div>
      <p class="text-xs text-gray-600 mt-1">${g.wi.blurb}</p>
    </a>

    <button data-tab="speaking" class="w-full card-cartoon tap-bounce flex items-center gap-3 text-left bg-gradient-to-r from-pink-50 to-rose-50">
      <span class="text-3xl">🗣️</span>
      <div class="flex-1"><div class="font-bold text-sm">口语练习角</div><div class="text-xs text-gray-500">Part 1 面谈 + Part 2 喜好讨论（隔日 15′）</div></div>
      <span class="text-xl text-gray-300">›</span>
    </button>
  `;
  bindBack(app);
  app.querySelectorAll('[data-task]').forEach(b => b.addEventListener('click', () => renderWritingLab(app, { task: b.dataset.task })));
  app.querySelector('[data-tab="speaking"]').addEventListener('click', () => renderWritingLab(app, { tab: 'speaking' }));
}

// === 单个写作任务：题目 + 写作区 + 自评清单 + 范文 ===
function renderTask(app, level, g, task, partKey) {
  const p = g[partKey];
  const minWords = partKey === 'part6' ? 25 : 35;
  const drafts = storage.getWritingDrafts(level);
  let saved = drafts[task.id] ? drafts[task.id].text : '';
  let showSample = false;
  let draftT = null; // 自动草稿防抖（V0.9.33）：手动保存按钮保留，误触退出也不丢字
  if (saved.trim()) setTimeout(() => toast('上次写到这里，接着写就好', 'info'), 400);

  function countWords(s) { return (s.trim().match(/[A-Za-z']+/g) || []).length; }

  function draw() {
    app.innerHTML = `
      ${headerHtml(`${partKey === 'part6' ? '📮 Part 6' : '🖼️ Part 7'} · ${esc(task.topic || '')}`)}

      <div class="card-cartoon mb-3 bg-gray-50">
        ${partKey === 'part6' ? `
          <p class="font-en text-sm mb-2" style="white-space:pre-wrap">${esc(task.prompt)}</p>
          <div class="text-xs font-bold mb-1">必须回应的三个要点：</div>
          ${task.points.map(pt => `<div class="text-xs text-gray-600">· ${esc(pt)}</div>`).join('')}
          <div class="text-xs text-orange-600 mt-2">写 ${minWords} 词以上</div>
        ` : `
          <div class="text-xs font-bold mb-2">三幅图（文字描述的原创场景）：</div>
          ${task.scenes.map((s, i) => `
            <div class="flex gap-2 mb-1.5">
              <span class="text-2xl">${['1️⃣', '2️⃣', '3️⃣'][i]}</span>
              <span class="text-sm text-gray-700 flex-1">${esc(s)}</span>
            </div>`).join('')}
          <div class="text-xs text-orange-600 mt-1">写 ${minWords} 词以上 · 时态全程一致（过去调）</div>
        `}
      </div>

      <div class="card-cartoon mb-3">
        <textarea id="draft" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-en text-base" rows="6"
          placeholder="${partKey === 'part6' ? 'Hi …,' : 'One day, …'}">${esc(saved)}</textarea>
        <div class="flex items-center justify-between mt-2">
          <span id="wc" class="text-xs text-gray-400">0 词 / 至少 ${minWords}</span>
          <button id="saveBtn" class="btn-cartoon btn-cartoon-secondary" style="padding:8px 18px">💾 保存草稿</button>
        </div>
      </div>

      <div class="card-cartoon mb-3">
        <div class="font-bold text-sm mb-2">✅ ${g.checklist.title}</div>
        ${g.checklist.items.map((c, i) => `
          <label class="flex items-center gap-2 py-1.5 text-sm" style="min-height:40px">
            <input type="checkbox" class="w-5 h-5"> <span>${c}</span>
          </label>`).join('')}
      </div>

      <a href="${esc(g.wi.url)}" target="_blank" rel="noopener noreferrer" class="block btn-cartoon text-center mb-3" style="text-decoration:none">🚀 复制到 Write & Improve 批改 ↗</a>

      <button id="sampleBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-2">${showSample ? '收起范文' : '👀 看原创范文（先自己写完再看）'}</button>
      <div id="sampleBox">${showSample && task.sample ? `
        <div class="card-cartoon bg-green-50">
          <div class="text-xs text-gray-400 mb-1">原创范文（${countWords(task.sample.text)} 词）</div>
          <p class="font-en text-sm mb-2" style="white-space:pre-wrap">${esc(task.sample.text)}</p>
          <button id="readSampleBtn" class="text-sm text-primary font-bold">🔊 听范文</button>
          <div class="text-xs text-gray-600 mt-1">${esc(task.sample.note || '')}</div>
        </div>` : ''}</div>
    `;
    const ta = app.querySelector('#draft');
    const wc = app.querySelector('#wc');
    const updateWc = () => {
      const n = countWords(ta.value);
      wc.textContent = `${n} 词 / 至少 ${minWords}`;
      wc.className = `text-xs ${n >= minWords ? 'text-green-600 font-bold' : 'text-gray-400'}`;
      saved = ta.value;
      clearTimeout(draftT);
      draftT = setTimeout(() => storage.saveWritingDraft(level, task.id, ta.value), 500);
    };
    ta.addEventListener('input', updateWc);
    updateWc();

    // 答题态：写作中 ‹/Esc 先确认（不 bindBack，避免绕过确认）；任何离开路径都落盘草稿
    enterFocus({
      leave: () => renderWritingLab(app, {}),
      stayLabel: '继续写',
      note: '写到一半的内容已自动保存，下次进来接着写。',
      cleanup: () => { clearTimeout(draftT); storage.saveWritingDraft(level, task.id, saved); }
    });
    app.querySelector('#examBackBtn').onclick = () => requestLeaveFocus(() => renderWritingLab(app, {}));

    app.querySelector('#saveBtn').addEventListener('click', () => {
      storage.saveWritingDraft(level, task.id, ta.value);
      toast('草稿已保存', 'success');
    });
    app.querySelector('#sampleBtn').addEventListener('click', () => {
      // 看范文前顺手保存草稿，避免丢字
      storage.saveWritingDraft(level, task.id, ta.value);
      showSample = !showSample;
      draw();
    });
    const rs = app.querySelector('#readSampleBtn');
    if (rs) rs.addEventListener('click', () => speak(task.sample.text));
  }
  draw();
}

// === 口语练习角 ===
function renderSpeaking(app, g) {
  const sp = g.speaking;
  app.innerHTML = `
    ${headerHtml('🗣️ 口语练习角')}
    <div class="card-cartoon mb-3 bg-pink-50 text-xs text-gray-600">${sp.note}</div>

    <h3 class="font-bold mb-2">Part 1 · 面谈问题（点 🔊 听考官问法）</h3>
    <div class="space-y-2 mb-4">
      ${sp.part1Questions.map((q, i) => `
        <div class="card-cartoon flex items-center gap-2" style="padding:12px 14px">
          <div class="flex-1">
            <div class="font-en font-bold text-sm">${esc(q.q)}</div>
            <div class="text-xs text-gray-500 mt-0.5">💡 ${esc(q.hint)}</div>
          </div>
          <button data-say="${i}" class="text-2xl tap-bounce" style="min-width:48px;min-height:48px">🔊</button>
        </div>`).join('')}
    </div>

    <h3 class="font-bold mb-2">Part 2 · 喜好讨论练习</h3>
    <div class="card-cartoon mb-3">
      <p class="text-sm text-gray-600 mb-2">${esc(sp.part2Practice.desc)}</p>
      ${sp.part2Practice.topics.map(t => `<div class="text-sm text-gray-700 mb-1">· ${esc(t)}</div>`).join('')}
      <div class="text-xs bg-green-50 text-green-700 rounded-xl px-3 py-2 mt-2">句型：${esc(sp.part2Practice.frame)}</div>
    </div>
  `;
  bindBack(app, 'exam-writing');
  app.querySelector('#examBackBtn').onclick = () => renderWritingLab(app, {});
  app.querySelectorAll('[data-say]').forEach(b => b.addEventListener('click', () => speak(sp.part1Questions[Number(b.dataset.say)].q)));
}
