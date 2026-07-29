// modules/grammar-hall/hall.js —— 语法大厅（V0.9 P1a）
// 定位：1-9 年级全量 50 课的「能力全景地图」，与 KET 备考中心的「语法八课」并列——
// 八课是考试最短路径（不动它一个字），大厅是把地基一块块补齐的全景图，两边只跳转不合并。
// 四层：基石 G01-12 / 骨架 G13-26 / 进阶 G27-42 / 精修 G43-50；比喻主线「英语句子 = 一支乐队」。
// 数据：data/grammar/index.json（元信息，随壳预缓存）+ gXX.json（正文，懒加载）。
import { loadIndex } from '../../utils/lazy-data.js';
import * as storage from '../../storage.js';
import { headerHtml, bindBack, esc } from '../exam/exam-common.js';
import { renderHallLesson, hallGuardHTML, HALL_LEVEL } from './lesson.js';

export async function renderGrammarHall(app, params = {}) {
  if (params.lesson) return renderHallLesson(app, params.lesson);

  const index = await loadIndex('grammar');
  if (!index) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">🏛️</span><div class="empty-text">语法大厅数据加载失败</div><div class="empty-sub">检查网络后刷新重试</div></div>';
    return;
  }

  const prog = storage.getLessonProgress(HALL_LEVEL);
  const byId = new Map((index.lessons || []).map(l => [l.id, l]));
  const openN = (index.lessons || []).filter(l => l.status === 'done').length;
  const doneN = (index.lessons || []).filter(l => prog[l.id] === 'done').length;

  app.innerHTML = `
    ${headerHtml('🏛️ 语法大厅')}
    ${hallGuardHTML()}

    <div class="card-cartoon mb-4 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
      <div class="font-bold text-sm mb-1">🎼 英语句子 = 一支乐队</div>
      <p class="text-sm text-gray-700">这里是 1-9 年级 50 课语法的全景地图，每一课认识乐队的一位新成员。它和 KET 备考中心的「语法八课」不冲突——八课是考前最短路径，大厅是把地基一块块补齐的长期地图。</p>
      <div class="text-xs text-gray-500 mt-2">已开放 ${openN}/50 课 · 已掌握 ${doneN} 课 · ★ = KET 相关度（0-3 星）</div>
    </div>

    ${(index.tiers || []).map(t => tierHTML(t, byId, prog)).join('')}
  `;
  bindBack(app, 'learn');
  app.querySelectorAll('[data-lesson]').forEach(b =>
    b.addEventListener('click', () => renderHallLesson(app, b.dataset.lesson)));
}

// "G01-G12" → ['G01', ..., 'G12']
function idsOfRange(range) {
  const m = /^G(\d{2})-G(\d{2})$/.exec(String(range || ''));
  if (!m) return [];
  const out = [];
  for (let i = Number(m[1]); i <= Number(m[2]); i++) out.push('G' + String(i).padStart(2, '0'));
  return out;
}

function tierHTML(tier, byId, prog) {
  const ids = idsOfRange(tier.range);
  const cards = ids.map(id => {
    const meta = byId.get(id);
    if (!meta || meta.status === 'planned') return placeholderHTML(id);
    return lessonCardHTML(meta, prog[meta.id], tier.color);
  }).join('');
  return `
    <div class="mb-5">
      <div class="flex items-center gap-2 mb-2">
        <span class="rounded-full text-white text-xs font-bold px-3 py-1" style="background:${tier.color}">${esc(tier.name)}</span>
        <span class="font-bold text-sm">${esc(tier.range)}</span>
        <span class="text-xs text-gray-400 flex-1">${esc(tier.stage || '')} · ${esc(tier.cefr || '')}</span>
      </div>
      <div class="space-y-2">${cards}</div>
    </div>`;
}

// 每课卡片：课号 / 标题 / 比喻一句话 / KET 相关度星级 / 完成状态
function lessonCardHTML(meta, status, color) {
  const badge = status === 'done' ? '✅ 已掌握' : status === 'learning' ? '📖 学习中' : '⬜ 未学';
  const stars = meta.ketRelevance > 0
    ? `<span class="text-amber-500">${'★'.repeat(meta.ketRelevance)}</span><span class="text-gray-300">${'★'.repeat(3 - meta.ketRelevance)}</span>`
    : '<span class="text-gray-300 text-[11px]">不考</span>';
  return `
    <button data-lesson="${meta.id}" class="w-full card-cartoon tap-bounce text-left" style="padding:12px 14px;min-height:48px;border-left:6px solid ${color}">
      <div class="flex items-center gap-2.5">
        <span class="font-black" style="min-width:40px;color:${color}">${meta.id}</span>
        <div class="flex-1" style="min-width:0">
          <div class="font-bold text-sm">${esc(meta.title)} <span class="text-xs font-normal text-gray-400">${badge}</span></div>
          <div class="text-xs text-gray-500 mt-0.5">🎼 ${esc(meta.metaphor)}</div>
        </div>
        <div class="text-right" style="flex-shrink:0">
          <div class="text-[10px] text-gray-400">KET</div>
          <div class="text-xs">${stars}</div>
        </div>
        <span class="text-xl text-gray-300">›</span>
      </div>
    </button>`;
}

function placeholderHTML(id) {
  return `
    <div class="card-cartoon flex items-center gap-2.5 opacity-55" style="padding:10px 14px">
      <span class="font-black text-gray-300" style="min-width:40px">${id}</span>
      <span class="text-xs text-gray-400 flex-1">🔒 待开放 · 内容制作中</span>
    </div>`;
}
