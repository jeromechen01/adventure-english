// games/pet-game.js - 宠物养成
import * as storage from '../storage.js';
import { playSound } from '../speech.js';
import { toast } from '../app.js';

const PET_STAGES = [
  { name: '蛋',     emoji: '🥚', minExp: 0,    desc: '一颗小小的蛋，里面孕育着希望' },
  { name: '小宝宝', emoji: '🐣', minExp: 50,   desc: '刚刚孵化的小生命' },
  { name: '幼年',   emoji: '🐤', minExp: 150,  desc: '可爱的小家伙，已经能跑能跳了' },
  { name: '青年',   emoji: '🦊', minExp: 350,  desc: '英气勃发的少年' },
  { name: '成年',   emoji: '🦁', minExp: 700,  desc: '威风凛凛的成年伙伴！' }
];

export function renderPetGame(app) {
  let pet = storage.getPet();

  // 计算时间衰减 (距离上次喂食越久饥饿值下降)
  const hoursSinceFed = (Date.now() - pet.lastFed) / (1000 * 60 * 60);
  const decay = Math.floor(hoursSinceFed * 5);
  pet.hunger = Math.max(0, pet.hunger - decay);
  pet.mood = Math.max(0, pet.mood - Math.floor(decay / 2));
  storage.setPet(pet);

  const stage = PET_STAGES[Math.min(pet.level - 1, PET_STAGES.length - 1)];
  const nextStage = PET_STAGES[pet.level];
  const expToNext = nextStage ? nextStage.minExp - pet.exp : 0;
  const expProgress = nextStage
    ? Math.round((pet.exp - stage.minExp) / (nextStage.minExp - stage.minExp) * 100)
    : 100;

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="backBtn" class="text-2xl">‹</button>
      <h2 class="text-xl font-bold">🦊 我的宠物</h2>
    </div>

    <div class="card-cartoon text-center bg-gradient-to-br from-yellow-50 to-orange-50 mb-4">
      <div class="text-9xl float my-4">${stage.emoji}</div>
      <div class="font-bold text-lg">${pet.name}</div>
      <div class="text-sm text-gray-500 mb-1">Lv.${pet.level} · ${stage.name}</div>
      <div class="text-xs text-gray-400 mb-3">${stage.desc}</div>

      <!-- 状态条 -->
      <div class="space-y-2 text-left max-w-xs mx-auto">
        <div>
          <div class="flex justify-between text-xs"><span>🍖 饱食度</span><span>${pet.hunger}/100</span></div>
          <div class="progress-bar mt-1"><div class="progress-bar-fill" style="width:${pet.hunger}%; background:linear-gradient(90deg,#F6AD55,#F56565)"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs"><span>😊 心情</span><span>${pet.mood}/100</span></div>
          <div class="progress-bar mt-1"><div class="progress-bar-fill" style="width:${pet.mood}%; background:linear-gradient(90deg,#4ECDC4,#48BB78)"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-xs">
            <span>⭐ 经验</span>
            <span>${pet.exp}${nextStage ? ' / ' + nextStage.minExp : ' (满级)'}</span>
          </div>
          <div class="progress-bar mt-1"><div class="progress-bar-fill" style="width:${expProgress}%"></div></div>
        </div>
      </div>
    </div>

    <!-- 操作 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-3">🎁 互动</h3>
      <div class="grid grid-cols-2 gap-2">
        <button id="feedBtn" class="card-cartoon tap-bounce text-center bg-orange-50">
          <div class="text-3xl">🍞</div>
          <div class="text-xs font-bold mt-1">单词面包</div>
          <div class="text-[10px] text-gray-500">5🪙 +20饱食</div>
        </button>
        <button id="playBtn" class="card-cartoon tap-bounce text-center bg-cyan-50">
          <div class="text-3xl">🎾</div>
          <div class="text-xs font-bold mt-1">陪它玩</div>
          <div class="text-[10px] text-gray-500">免费 +10心情</div>
        </button>
      </div>
    </div>

    <!-- 进化路径 -->
    <div class="card-cartoon">
      <h3 class="font-bold mb-3">🌱 进化路径</h3>
      <div class="flex justify-between items-center">
        ${PET_STAGES.map((s, i) => `
          <div class="text-center ${i + 1 === pet.level ? 'scale-110' : ''} ${i + 1 > pet.level ? 'opacity-30' : ''}">
            <div class="text-3xl">${s.emoji}</div>
            <div class="text-[10px] mt-1">${s.name}</div>
          </div>
          ${i < PET_STAGES.length - 1 ? '<div class="text-gray-300">→</div>' : ''}
        `).join('')}
      </div>
      <div class="text-xs text-gray-500 text-center mt-3">
        ${nextStage ? `还差 ${expToNext} 经验进化为 ${nextStage.name}` : '已达到最终形态！'}
      </div>
      <div class="text-xs text-gray-400 text-center mt-1">每学一个新单词宠物 +2 经验</div>
    </div>
  `;

  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));

  app.querySelector('#feedBtn').addEventListener('click', () => {
    if (!storage.spendCoins(5)) {
      toast('金币不足！多学单词赚金币吧', 'warn');
      return;
    }
    storage.feedPet(20);
    playSound('correct');
    toast('🍞 好吃！宠物开心地吃了起来', 'success');
    renderPetGame(app);
  });

  app.querySelector('#playBtn').addEventListener('click', () => {
    pet = storage.getPet();
    pet.mood = Math.min(100, pet.mood + 10);
    storage.setPet(pet);
    playSound('correct');
    toast('🎾 宠物玩得很开心！', 'success');
    renderPetGame(app);
  });
}
