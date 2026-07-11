// games/card-collect.js - 单词卡牌收集
import * as storage from '../storage.js';
import { speak } from '../speech.js';

const RARITY_INFO = {
  N:   { label: '普通',   color: '#A0AEC0', glow: 'rgba(160,174,192,0.3)', power: 50 },
  R:   { label: '稀有',   color: '#4299E1', glow: 'rgba(66,153,225,0.4)', power: 80 },
  SR:  { label: '史诗',   color: '#9F7AEA', glow: 'rgba(159,122,234,0.5)', power: 120 },
  SSR: { label: '传说',   color: '#F6AD55', glow: 'rgba(246,173,85,0.6)', power: 200 }
};

export function renderCardCollect(app) {
  const cards = storage.getCards();

  // 统计
  const counts = { N: 0, R: 0, SR: 0, SSR: 0 };
  cards.forEach(c => counts[c.rarity] = (counts[c.rarity] || 0) + 1);

  // 按稀有度倒序: SSR -> SR -> R -> N
  const order = ['SSR', 'SR', 'R', 'N'];
  const sorted = [...cards].sort((a, b) => order.indexOf(a.rarity) - order.indexOf(b.rarity));

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl">‹</button>
      <h2 class="text-xl font-bold">🃏 卡牌收集</h2>
    </div>

    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-3">📊 收集统计</h3>
      <div class="grid grid-cols-4 gap-2 text-center">
        ${order.map(r => `
          <div class="rounded-2xl p-3" style="background:${RARITY_INFO[r].glow}">
            <div class="text-2xl font-bold" style="color:${RARITY_INFO[r].color}">${counts[r] || 0}</div>
            <div class="text-xs">${r} ${RARITY_INFO[r].label}</div>
          </div>
        `).join('')}
      </div>
      <div class="text-center text-xs text-gray-500 mt-2">总计 ${cards.length} 张卡牌</div>
    </div>

    ${cards.length === 0 ? `
      <div class="card-cartoon empty-state">
        <span class="empty-emoji">🃏✨</span>
        <div class="empty-text">还没有卡牌哦</div>
        <div class="empty-sub">完成单词学习单元，就有机会抽到稀有卡牌！</div>
      </div>
    ` : `
      <div class="grid grid-cols-2 gap-3">
        ${sorted.map(c => `
          <div class="card-rarity-${c.rarity} rounded-2xl p-3 text-center bg-white relative" data-word="${c.word}">
            <div class="absolute top-1 right-2 text-[10px] font-bold" style="color:${RARITY_INFO[c.rarity].color}">${c.rarity}</div>
            <div class="text-3xl my-2">🃏</div>
            <div class="font-en font-bold">${c.word}</div>
            <div class="text-xs text-gray-500">${c.meaning}</div>
            <div class="text-[10px] mt-2" style="color:${RARITY_INFO[c.rarity].color}">⚔️ 威力 ${RARITY_INFO[c.rarity].power}</div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));
  app.querySelectorAll('[data-word]').forEach(card => {
    card.addEventListener('click', () => speak(card.dataset.word));
  });
}
