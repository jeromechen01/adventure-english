// modules/levels.js - 单词闯关地图（探险旅程）
// 把年级单词按 8 个一关切分，用 SVG 蜿蜒小路串联圆形关卡节点，
// 每 5 关一个主题大区，每 5 关末是 Boss 关。
import * as storage from '../storage.js';
import { loadJSON, toast } from '../app.js';
import { startLevel } from '../games/level-play.js';

const WORDS_PER_LEVEL = 8;

// 主题大区（每 5 关循环一次）
const REGIONS = [
  { cls: 'region-grass', name: '草原', icon: '🌳', deco: ['🌳', '🌸', '🦋', '🌿', '🐰', '🍄'] },
  { cls: 'region-sea',   name: '海边', icon: '🌊', deco: ['🌊', '🐚', '🐠', '⛵', '🦀', '🏖️'] },
  { cls: 'region-snow',  name: '雪山', icon: '⛄', deco: ['⛄', '❄️', '🏔️', '🧊', '🐧', '🎿'] },
  { cls: 'region-space', name: '太空', icon: '🚀', deco: ['🚀', '⭐', '🪐', '🌙', '👽', '☄️'] }
];

const PET_STAGES = ['🥚', '🐣', '🐤', '🦊', '🦁'];

// 稳定的伪随机（同一 seed 永远相同，装饰不抖动）
function rnd(seed) {
  const x = Math.sin(seed * 99.7 + 13.1) * 10000;
  return x - Math.floor(x);
}

function regionOf(lv) {
  return REGIONS[Math.floor((lv - 1) / 5) % REGIONS.length];
}
function isBossLevel(lv) {
  return lv % 5 === 0;
}

export async function renderLevelMap(app) {
  const profile = storage.getProfile();
  const grade = profile.grade;
  const data = await loadJSON(`data/words/grade${grade}.json`);
  if (!data || !data.units) {
    app.innerHTML = '<div class="text-center py-12 text-gray-400">数据加载失败</div>';
    return;
  }

  const words = data.units.flatMap(u => u.words);
  const numLevels = Math.max(1, Math.ceil(words.length / WORDS_PER_LEVEL));

  // 收集每关元信息
  const prog = storage.getLevelProgress(grade);
  const maxUnlocked = storage.getMaxUnlockedLevel(grade);
  const totalStars = storage.getTotalStars(grade);
  const clearedCount = Object.values(prog).filter(r => r.cleared).length;
  const pet = storage.getPet();
  const petEmoji = PET_STAGES[Math.min(pet.level - 1, 4)];
  const currentRegion = regionOf(Math.min(maxUnlocked, numLevels));

  const levels = [];
  for (let lv = 1; lv <= numLevels; lv++) {
    const rec = prog[lv] || { stars: 0, cleared: false };
    const unlocked = storage.isLevelUnlocked(grade, lv);
    levels.push({
      lv,
      stars: rec.stars || 0,
      cleared: !!rec.cleared,
      unlocked,
      isCurrent: unlocked && !rec.cleared && lv === maxUnlocked,
      boss: isBossLevel(lv),
      region: regionOf(lv)
    });
  }
  // 若全部通关，把最后一关标为 current 以便定位
  if (!levels.some(l => l.isCurrent)) {
    const firstUncleared = levels.find(l => l.unlocked && !l.cleared);
    if (firstUncleared) firstUncleared.isCurrent = true;
  }

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-2">
      <button id="backBtn" class="text-2xl tap-bounce" style="min-width:44px">‹</button>
      <h2 class="text-xl font-bold flex-1">🗺️ 单词闯关</h2>
    </div>
    <div class="card-cartoon mb-3 py-3 bg-gradient-to-r from-orange-50 to-yellow-50">
      <div class="flex items-center justify-between text-sm font-bold">
        <span>已通关 ${clearedCount}/${numLevels}</span>
        <span class="text-orange-500">⭐ ${totalStars} 星</span>
        <span>${currentRegion.icon} ${currentRegion.name}</span>
      </div>
    </div>
    <div id="mapWrap" class="level-map-wrap"></div>
  `;

  app.querySelector('#backBtn').addEventListener('click', () => window.__nav('words'));

  const wrap = app.querySelector('#mapWrap');

  // 进入某关
  function enterLevel(lv) {
    if (!storage.isLevelUnlocked(grade, lv)) {
      toast('先通关前一关解锁哦', 'warn');
      return;
    }
    const levelWords = words.slice((lv - 1) * WORDS_PER_LEVEL, lv * WORDS_PER_LEVEL);
    startLevel(app, {
      grade,
      lv,
      totalLevels: numLevels,
      isBoss: isBossLevel(lv),
      region: regionOf(lv),
      words: levelWords,
      allWords: words,
      onBack: () => renderLevelMap(app)
    });
  }

  // === 布局与绘制（响应容器宽度，resize 重算）===
  function layout() {
    if (!document.body.contains(wrap)) {
      window.removeEventListener('resize', onResize);
      return;
    }
    const W = wrap.clientWidth || 360;
    const isTablet = W >= 641;
    const isDesktop = W >= 1025;
    const nodeSize = isTablet ? 68 : 54;
    const ROW = isTablet ? 132 : 112;
    const topPad = 64;
    const bottomPad = 70;
    const cx = W / 2;
    // 振幅：桌面/平板更夸张，手机收敛防溢出
    const ampPct = isDesktop ? 0.34 : isTablet ? 0.30 : 0.25;
    const amp = W * ampPct;
    const H = topPad + numLevels * ROW + bottomPad;
    wrap.style.height = H + 'px';

    // 节点坐标（第 1 关在顶部，向下延伸）
    const pos = levels.map((l, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return { x: cx + side * amp, y: topPad + i * ROW + ROW / 2 };
    });

    // 主路径（灰）+ 已通关路径（暖色）
    function buildPath(from, to) {
      if (to < from) return '';
      let d = `M ${pos[from].x.toFixed(1)} ${pos[from].y.toFixed(1)}`;
      for (let i = from + 1; i <= to; i++) {
        const p0 = pos[i - 1], p1 = pos[i];
        const my = (p0.y + p1.y) / 2;
        d += ` C ${p0.x.toFixed(1)} ${my.toFixed(1)}, ${p1.x.toFixed(1)} ${my.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      }
      return d;
    }
    // 最后一个已通关节点的索引（用于暖色路径长度）
    let lastCleared = -1;
    levels.forEach((l, i) => { if (l.cleared) lastCleared = i; });

    const basePath = buildPath(0, numLevels - 1);
    const litPath = lastCleared > 0 ? buildPath(0, lastCleared) : '';

    // 大区主题背景带
    let bands = '';
    const numRegions = Math.ceil(numLevels / 5);
    for (let r = 0; r < numRegions; r++) {
      const startI = r * 5;
      const endI = Math.min(startI + 4, numLevels - 1);
      const top = topPad + startI * ROW;
      const height = (endI - startI + 1) * ROW;
      const reg = REGIONS[r % REGIONS.length];
      const inset = Math.min(14, W * 0.03);
      bands += `<div class="region-band ${reg.cls}" style="top:${top}px;height:${height - 12}px;left:${inset}px;right:${inset}px"></div>`;
      bands += `<div class="region-label" style="top:${top + 6}px">${reg.icon} ${reg.name}</div>`;
      // 装饰 emoji（每区固定 4 个位置）
      for (let k = 0; k < 4; k++) {
        const seed = r * 17 + k * 3 + 1;
        const dx = (0.12 + rnd(seed) * 0.76) * W;
        const dy = top + 30 + rnd(seed + 0.5) * (height - 50);
        const sz = isTablet ? 26 : 18;
        const emoji = reg.deco[Math.floor(rnd(seed + 0.7) * reg.deco.length)];
        bands += `<div class="map-deco" style="left:${dx.toFixed(0)}px;top:${dy.toFixed(0)}px;font-size:${sz}px">${emoji}</div>`;
      }
    }

    // SVG 路径
    const svg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0;z-index:1">
        <path d="${basePath}" fill="none" stroke="#d8d2cb" stroke-width="${isTablet ? 14 : 11}" stroke-linecap="round" stroke-dasharray="2 18" stroke-linejoin="round"/>
        ${litPath ? `<path d="${litPath}" fill="none" stroke="#FF8A4C" stroke-width="${isTablet ? 14 : 11}" stroke-linecap="round" stroke-dasharray="2 18" stroke-linejoin="round"/>` : ''}
      </svg>
    `;

    // 节点
    let nodes = '';
    levels.forEach((l, i) => {
      const p = pos[i];
      let cls;
      if (l.cleared) cls = 'is-cleared is-unlocked';
      else if (l.unlocked) cls = 'is-unlocked';
      else cls = 'is-locked';
      if (l.isCurrent) cls += ' is-current';
      if (l.boss) cls += ' is-boss';

      let label;
      if (!l.unlocked) label = '🔒';
      else if (l.boss) label = '🐉';
      else label = l.lv;

      const stars = l.cleared && l.stars > 0
        ? `<div class="node-stars">${'⭐'.repeat(l.stars)}</div>` : '';
      const pet = l.isCurrent ? `<div class="node-pet float">${petEmoji}📍</div>` : '';

      nodes += `
        <div class="level-node ${cls}" data-lv="${l.lv}"
          style="left:${p.x.toFixed(1)}px;top:${p.y.toFixed(1)}px;width:${l.boss ? nodeSize + 12 : nodeSize}px;height:${l.boss ? nodeSize + 12 : nodeSize}px">
          ${stars}${pet}<span>${label}</span>
        </div>`;
    });

    wrap.innerHTML = bands + svg + nodes;

    // 绑定节点点击
    wrap.querySelectorAll('.level-node').forEach(node => {
      node.addEventListener('click', () => {
        const lv = parseInt(node.dataset.lv);
        enterLevel(lv);
      });
    });

    // 自动滚动到当前关
    const cur = levels.find(l => l.isCurrent);
    if (cur && !wrap._scrolled) {
      const curPos = pos[levels.indexOf(cur)];
      const target = wrap.offsetTop + curPos.y - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
      wrap._scrolled = true;
    }
  }

  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  }
  window.addEventListener('resize', onResize);

  // 首帧布局（等容器拿到宽度）
  requestAnimationFrame(layout);
}
