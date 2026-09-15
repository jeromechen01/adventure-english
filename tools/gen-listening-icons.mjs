// tools/gen-listening-icons.mjs — 听力 Part 1 SVG 图标库生成器（PL0-3）
// 用法：node tools/gen-listening-icons.mjs
// 产出：assets/img/listening/<类别>-<细项>.svg（44 个）+ data/exam/ket/listening/icons.json（清单 + alt 文本）
//
// 命名规范（写进 CHECKLIST）：
//   文件名 = <类别>-<细项>.svg，全小写，只用 a-z0-9 与连字符；类别 ∈ clock/price/weather/transport/food/activity/place
//   时钟：clock-HHMM（24 小时制补零，如 clock-0730 = 7:30）；价格：price-<整数>[-<小数两位>]（price-2-50 = £2.50）
//   统一 viewBox 0 0 120 120，正方形；自带米色底 #FFF8F0 + 浅橙描边（同记忆卡 SVG，深浅模式都清晰）
//   每个 SVG 内含 <title>（英文 alt），清单 icons.json 里再带中文说明；课文件 options[].icon 只写 id（不带 .svg）
//   风格：粗描边（4-5）、圆角、少细节，96px 以下也能一眼认出；颜色只用设计系统色板（豁免③记忆卡 SVG 内部色值）
import { writeFileSync, mkdirSync } from 'node:fs';

const C = { bg: '#FFF8F0', line: '#FFD9C2', ink: '#5A4A42', orange: '#FF8A4C', teal: '#4ECDC4', sky: '#6BCBFF', lemon: '#FFD93D', pink: '#FF8FB1', grape: '#A88BEB', green: '#48BB78', red: '#F56565', white: '#FFFFFF', gray: '#D3C4B8', brown: '#B08968' };

const icons = [];
function add(id, cat, alt, zh, body) { icons.push({ id, cat, alt, zh, body }); }

// ---------- 时钟（表盘 + 时针分针） ----------
function clock(h, m) {
  const hh = String(h).padStart(2, '0'), mm = String(m).padStart(2, '0');
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  const hand = (deg, len, w, col) => {
    const r = (deg - 90) * Math.PI / 180;
    return `<line x1="60" y1="60" x2="${(60 + len * Math.cos(r)).toFixed(1)}" y2="${(60 + len * Math.sin(r)).toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  };
  const ticks = [0, 90, 180, 270].map(d => { const r = (d - 90) * Math.PI / 180; return `<circle cx="${(60 + 36 * Math.cos(r)).toFixed(1)}" cy="${(60 + 36 * Math.sin(r)).toFixed(1)}" r="3" fill="${C.ink}"/>`; }).join('');
  const words = m === 0 ? `${numWord(h)} o'clock` : m === 30 ? `half past ${numWord(h)}` : m === 15 ? `quarter past ${numWord(h)}` : m === 45 ? `quarter to ${numWord(h + 1)}` : `${numWord(h)} ${mm}`;
  add(`clock-${hh}${mm}`, 'clock', `a clock showing ${words} (${h}:${mm})`, `时钟 ${h}:${mm}（${zhTime(h, m)}）`,
    `<circle cx="60" cy="60" r="44" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>${ticks}${hand(ha, 22, 6, C.ink)}${hand(ma, 32, 4, C.orange)}<circle cx="60" cy="60" r="4" fill="${C.ink}"/>`);
}
function numWord(n) { return ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'][n % 12]; }
function zhTime(h, m) { return m === 0 ? `${h} 点整` : m === 30 ? `${h} 点半` : m === 15 ? `${h} 点一刻` : m === 45 ? `${h + 1} 点差一刻` : `${h} 点 ${m} 分`; }
[[7, 0], [7, 30], [8, 0], [8, 15], [8, 45], [3, 30]].forEach(([h, m]) => clock(h, m));

// ---------- 价格牌 ----------
function price(txt, id) {
  add(`price-${id}`, 'price', `a price tag showing £${txt}`, `价格牌 £${txt}`,
    `<path d="M30 22 L88 22 L104 60 L88 98 L30 98 Z" fill="${C.lemon}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><circle cx="40" cy="60" r="5" fill="${C.ink}"/><text x="74" y="69" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${txt.length > 3 ? 19 : txt.length > 1 ? 24 : 28}" font-weight="bold" fill="${C.ink}">£${txt}</text>`);
}
price('2.50', '2-50'); price('5', '5'); price('10', '10'); price('15', '15');

// ---------- 天气 ----------
const sun = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.lemon}" stroke="${C.orange}" stroke-width="4"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map(d => { const a = d * Math.PI / 180; return `<line x1="${(cx + (r + 8) * Math.cos(a)).toFixed(1)}" y1="${(cy + (r + 8) * Math.sin(a)).toFixed(1)}" x2="${(cx + (r + 16) * Math.cos(a)).toFixed(1)}" y2="${(cy + (r + 16) * Math.sin(a)).toFixed(1)}" stroke="${C.orange}" stroke-width="4" stroke-linecap="round"/>`; }).join('');
const cloud = (x, y, s, fill = C.white) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M20 40 a14 14 0 0 1 4 -27 a18 18 0 0 1 34 -4 a13 13 0 0 1 14 22 a10 10 0 0 1 -6 9 Z" fill="${fill}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/></g>`;
add('weather-sunny', 'weather', 'sunny weather, a bright sun', '晴天（太阳）', sun(60, 60, 22));
add('weather-cloudy', 'weather', 'cloudy weather, clouds', '多云', cloud(20, 30, 1.1) + cloud(48, 52, 0.9, C.gray));
add('weather-rainy', 'weather', 'rainy weather, a cloud with rain', '下雨', cloud(24, 18, 1.1, C.gray) + [40, 56, 72, 88].map((x, i) => `<line x1="${x}" y1="${76 + (i % 2) * 6}" x2="${x - 6}" y2="${94 + (i % 2) * 6}" stroke="${C.sky}" stroke-width="5" stroke-linecap="round"/>`).join(''));
add('weather-windy', 'weather', 'windy weather, wind blowing', '刮风', ['M18 40 h56 a10 10 0 1 0 -10 -10', 'M18 62 h72 a10 10 0 1 1 -10 10', 'M18 84 h44 a8 8 0 1 0 -8 -8'].map(d => `<path d="${d}" fill="none" stroke="${C.sky}" stroke-width="6" stroke-linecap="round"/>`).join(''));
add('weather-snowy', 'weather', 'snowy weather, a cloud with snowflakes', '下雪', cloud(24, 16, 1.1, C.white) + [[38, 82], [60, 92], [82, 82]].map(([x, y]) => `<g stroke="${C.sky}" stroke-width="4" stroke-linecap="round"><line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}"/><line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}"/><line x1="${x - 6}" y1="${y - 6}" x2="${x + 6}" y2="${y + 6}"/><line x1="${x - 6}" y1="${y + 6}" x2="${x + 6}" y2="${y - 6}"/></g>`).join(''));
add('weather-stormy', 'weather', 'stormy weather, a cloud with lightning', '雷雨（闪电）', cloud(24, 14, 1.1, C.gray) + `<path d="M64 62 L48 86 H62 L54 108 L78 78 H64 Z" fill="${C.lemon}" stroke="${C.orange}" stroke-width="4" stroke-linejoin="round"/>`);

// ---------- 交通工具 ----------
const wheel = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.ink}"/><circle cx="${x}" cy="${y}" r="${r / 2.5}" fill="${C.white}"/>`;
add('transport-bus', 'transport', 'a bus', '公共汽车', `<rect x="14" y="30" width="92" height="58" rx="10" fill="${C.orange}" stroke="${C.ink}" stroke-width="5"/><rect x="24" y="40" width="20" height="18" rx="4" fill="${C.sky}"/><rect x="50" y="40" width="20" height="18" rx="4" fill="${C.sky}"/><rect x="76" y="40" width="20" height="18" rx="4" fill="${C.sky}"/><rect x="14" y="66" width="92" height="6" fill="${C.ink}" opacity=".25"/>${wheel(36, 92)}${wheel(84, 92)}`);
add('transport-car', 'transport', 'a car', '小汽车', `<path d="M16 76 V60 L32 40 H84 L104 60 V76 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M40 44 H80 L92 58 H30 Z" fill="${C.sky}"/><rect x="10" y="74" width="100" height="10" rx="4" fill="${C.ink}"/>${wheel(36, 86)}${wheel(84, 86)}`);
add('transport-bike', 'transport', 'a bicycle', '自行车', `<circle cx="32" cy="80" r="20" fill="none" stroke="${C.ink}" stroke-width="5"/><circle cx="88" cy="80" r="20" fill="none" stroke="${C.ink}" stroke-width="5"/><path d="M32 80 L52 46 H76 L88 80 M52 46 L64 80 L32 80 M44 40 H60 M76 46 L70 34 H84" fill="none" stroke="${C.teal}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
add('transport-train', 'transport', 'a train', '火车', `<rect x="18" y="26" width="84" height="62" rx="12" fill="${C.teal}" stroke="${C.ink}" stroke-width="5"/><rect x="30" y="38" width="24" height="20" rx="4" fill="${C.sky}"/><rect x="66" y="38" width="24" height="20" rx="4" fill="${C.sky}"/><rect x="18" y="66" width="84" height="6" fill="${C.ink}" opacity=".25"/><circle cx="40" cy="80" r="5" fill="${C.lemon}"/><circle cx="80" cy="80" r="5" fill="${C.lemon}"/>${wheel(36, 96, 7)}${wheel(60, 96, 7)}${wheel(84, 96, 7)}<path d="M12 104 H108" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`);
add('transport-plane', 'transport', 'an aeroplane', '飞机', `<path d="M14 66 L52 58 L52 22 L64 22 L74 58 L106 64 L106 74 L74 72 L66 92 L74 100 L60 100 L52 92 L44 100 L30 100 L38 92 L30 72 L14 76 Z" fill="${C.sky}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><circle cx="58" cy="40" r="4" fill="${C.white}"/><circle cx="58" cy="52" r="4" fill="${C.white}"/>`);
add('transport-boat', 'transport', 'a boat', '船', `<path d="M14 74 H106 L92 96 H28 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M58 22 V74 M58 26 L92 62 H58 M58 30 L32 62 H58" fill="${C.white}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M10 104 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="${C.sky}" stroke-width="5" stroke-linecap="round"/>`);

// ---------- 食物 ----------
add('food-apple', 'food', 'an apple', '苹果', `<path d="M60 40 C40 26 18 40 22 66 C26 92 44 104 60 98 C76 104 94 92 98 66 C102 40 80 26 60 40 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/><path d="M60 40 V22" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/><path d="M60 30 C68 18 84 20 84 22 C82 32 70 36 60 30 Z" fill="${C.green}" stroke="${C.ink}" stroke-width="4"/>`);
add('food-banana', 'food', 'a banana', '香蕉', `<path d="M24 34 C30 70 60 98 96 90 C100 88 100 82 96 80 C66 82 46 62 40 30 C38 26 30 26 24 34 Z" fill="${C.lemon}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M24 34 L18 40" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`);
add('food-pizza', 'food', 'a slice of pizza', '披萨', `<path d="M60 108 L20 30 Q60 14 100 30 Z" fill="${C.lemon}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M20 30 Q60 14 100 30 L96 40 Q60 26 24 40 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/><circle cx="60" cy="56" r="7" fill="${C.red}"/><circle cx="46" cy="72" r="6" fill="${C.red}"/><circle cx="72" cy="76" r="6" fill="${C.red}"/>`);
add('food-sandwich', 'food', 'a sandwich', '三明治', `<path d="M14 44 L60 22 L106 44 L106 56 L14 56 Z" fill="${C.lemon}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M14 56 H106 V68 H14 Z" fill="${C.green}" stroke="${C.ink}" stroke-width="4"/><path d="M14 68 H106 V80 H14 Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="4"/><path d="M14 80 H106 V96 Q60 104 14 96 Z" fill="${C.lemon}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`);
add('food-pasta', 'food', 'a plate of pasta (spaghetti)', '意面', `<ellipse cx="60" cy="74" rx="48" ry="22" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><path d="M24 70 q12 -30 24 -6 t24 -6 t24 6" fill="none" stroke="${C.lemon}" stroke-width="7" stroke-linecap="round"/><path d="M28 78 q14 -26 26 -4 t26 -4 t16 6" fill="none" stroke="${C.orange}" stroke-width="6" stroke-linecap="round"/><path d="M36 62 q12 -22 22 -2 t22 -2 t14 8" fill="none" stroke="${C.lemon}" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="56" r="8" fill="${C.red}" stroke="${C.ink}" stroke-width="3"/><path d="M96 22 V52 M90 22 V36 M102 22 V36 M90 36 H102" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`);
add('food-cake', 'food', 'a cake with a candle', '蛋糕', `<rect x="20" y="58" width="80" height="40" rx="8" fill="${C.pink}" stroke="${C.ink}" stroke-width="5"/><path d="M20 66 q10 12 20 0 t20 0 t20 0 t20 0" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/><rect x="56" y="30" width="8" height="26" rx="3" fill="${C.sky}" stroke="${C.ink}" stroke-width="3"/><ellipse cx="60" cy="24" rx="5" ry="8" fill="${C.lemon}" stroke="${C.orange}" stroke-width="3"/>`);
add('food-ice-cream', 'food', 'an ice cream', '冰淇淋', `<path d="M40 60 L60 106 L80 60 Z" fill="${C.lemon}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M46 70 L74 70 M50 80 L70 80" stroke="${C.orange}" stroke-width="3"/><circle cx="60" cy="42" r="22" fill="${C.pink}" stroke="${C.ink}" stroke-width="5"/><circle cx="48" cy="34" r="4" fill="${C.white}"/>`);
add('food-milk', 'food', 'a glass of milk', '牛奶', `<path d="M34 24 H86 L80 100 H40 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M38 52 H82 L79 100 H41 Z" fill="${C.sky}" opacity=".6"/><rect x="30" y="18" width="60" height="10" rx="4" fill="${C.teal}" stroke="${C.ink}" stroke-width="4"/>`);

// ---------- 活动 ----------
const person = (x, y, col, pose = '') => `<g transform="translate(${x} ${y})"><circle cx="0" cy="-30" r="10" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/><path d="M0 -18 V14" stroke="${col}" stroke-width="8" stroke-linecap="round"/>${pose}</g>`;
add('activity-football', 'activity', 'playing football', '踢足球', person(46, 60, C.teal, `<path d="M0 -12 L-18 4 M0 -12 L16 0 M0 14 L-12 38 M0 14 L20 30" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`) + `<circle cx="84" cy="92" r="14" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/><path d="M84 80 L92 88 L88 98 H80 L76 88 Z" fill="${C.ink}"/>`);
add('activity-swimming', 'activity', 'swimming', '游泳', `<path d="M10 84 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0 M10 100 q10 -10 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="${C.sky}" stroke-width="6" stroke-linecap="round"/><circle cx="76" cy="58" r="11" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/><path d="M26 70 Q46 56 64 66 M40 66 L30 46" stroke="${C.orange}" stroke-width="8" stroke-linecap="round" fill="none"/>`);
add('activity-reading', 'activity', 'reading a book', '看书', `<path d="M18 36 Q40 28 60 40 Q80 28 102 36 V92 Q80 84 60 96 Q40 84 18 92 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M60 40 V96" stroke="${C.ink}" stroke-width="4"/><path d="M28 50 H50 M28 62 H50 M28 74 H50 M70 50 H92 M70 62 H92 M70 74 H92" stroke="${C.teal}" stroke-width="4" stroke-linecap="round"/>`);
add('activity-painting', 'activity', 'painting a picture', '画画', `<path d="M62 22 C30 22 16 46 20 66 C24 86 44 92 52 84 C58 78 50 70 58 66 C70 60 100 74 100 50 C100 34 84 22 62 22 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><circle cx="40" cy="44" r="7" fill="${C.red}"/><circle cx="60" cy="36" r="7" fill="${C.lemon}"/><circle cx="80" cy="46" r="7" fill="${C.sky}"/><circle cx="36" cy="64" r="7" fill="${C.green}"/><path d="M104 20 L72 62 L66 72 L76 66 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`);
add('activity-music', 'activity', 'playing music, a guitar', '弹吉他', `<path d="M44 58 C30 58 22 74 30 88 C36 100 58 102 66 88 C72 78 62 70 66 62 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><circle cx="48" cy="80" r="8" fill="${C.ink}"/><path d="M62 64 L96 24" stroke="${C.brown}" stroke-width="10" stroke-linecap="round"/><path d="M62 64 L96 24" stroke="${C.ink}" stroke-width="3"/><rect x="90" y="14" width="16" height="12" rx="4" fill="${C.ink}" transform="rotate(-45 98 20)"/>`);
add('activity-dancing', 'activity', 'dancing', '跳舞', person(60, 60, C.pink, `<path d="M0 -12 L-22 -26 M0 -12 L22 -24 M0 14 L-16 40 M0 14 L18 36" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`) + `<text x="90" y="40" font-size="26" fill="${C.grape}">♪</text><text x="18" y="50" font-size="22" fill="${C.grape}">♫</text>`);
add('activity-running', 'activity', 'running', '跑步', person(56, 62, C.green, `<path d="M0 -12 L-20 -2 M0 -12 L18 -24 M0 14 L-18 34 M0 14 L22 24 L22 42" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`) + `<path d="M10 90 H30 M6 100 H22" stroke="${C.sky}" stroke-width="4" stroke-linecap="round"/>`);
add('activity-computer', 'activity', 'using a computer', '用电脑', `<rect x="18" y="26" width="84" height="54" rx="8" fill="${C.ink}"/><rect x="24" y="32" width="72" height="42" rx="4" fill="${C.sky}"/><path d="M34 44 H70 M34 54 H86 M34 64 H60" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/><rect x="44" y="82" width="32" height="8" fill="${C.ink}"/><rect x="26" y="90" width="68" height="10" rx="4" fill="${C.gray}" stroke="${C.ink}" stroke-width="3"/>`);

// ---------- 场所 ----------
const house = (x, y, w, h, roofCol, wallCol) => `<path d="M${x} ${y + h * 0.4} L${x + w / 2} ${y} L${x + w} ${y + h * 0.4} Z" fill="${roofCol}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><rect x="${x + 4}" y="${y + h * 0.4}" width="${w - 8}" height="${h * 0.6}" fill="${wallCol}" stroke="${C.ink}" stroke-width="5"/>`;
add('place-school', 'place', 'a school building', '学校', house(14, 22, 92, 80, C.orange, C.lemon) + `<rect x="50" y="70" width="20" height="32" fill="${C.ink}"/><rect x="28" y="62" width="12" height="12" fill="${C.sky}"/><rect x="80" y="62" width="12" height="12" fill="${C.sky}"/><path d="M60 22 V8 H80 L74 13 L80 18 H60" fill="${C.red}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`);
add('place-library', 'place', 'a library with books', '图书馆', `<rect x="14" y="40" width="92" height="62" rx="4" fill="${C.teal}" stroke="${C.ink}" stroke-width="5"/><path d="M8 40 L60 16 L112 40 Z" fill="${C.orange}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>` + [[24, C.red], [38, C.lemon], [52, C.sky], [66, C.pink], [80, C.green]].map(([x, c]) => `<rect x="${x}" y="54" width="12" height="36" rx="2" fill="${c}" stroke="${C.ink}" stroke-width="3"/>`).join('') + `<rect x="94" y="60" width="8" height="30" rx="2" fill="${C.grape}" stroke="${C.ink}" stroke-width="3" transform="rotate(12 98 75)"/>`);
add('place-park', 'place', 'a park with a tree and a bench', '公园', `<circle cx="44" cy="44" r="24" fill="${C.green}" stroke="${C.ink}" stroke-width="5"/><rect x="39" y="62" width="10" height="26" fill="${C.brown}" stroke="${C.ink}" stroke-width="3"/><rect x="70" y="70" width="36" height="8" rx="3" fill="${C.orange}" stroke="${C.ink}" stroke-width="3"/><rect x="70" y="58" width="36" height="8" rx="3" fill="${C.orange}" stroke="${C.ink}" stroke-width="3"/><path d="M74 78 V92 M102 78 V92" stroke="${C.ink}" stroke-width="4"/><path d="M8 98 H112" stroke="${C.green}" stroke-width="8" stroke-linecap="round"/>`);
add('place-shop', 'place', 'a shop', '商店', `<rect x="18" y="48" width="84" height="52" fill="${C.lemon}" stroke="${C.ink}" stroke-width="5"/><path d="M12 48 L20 24 H100 L108 48 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M28 48 V36 M44 48 V36 M60 48 V36 M76 48 V36 M92 48 V36" stroke="${C.white}" stroke-width="5"/><rect x="50" y="68" width="20" height="32" fill="${C.sky}" stroke="${C.ink}" stroke-width="3"/><rect x="26" y="60" width="16" height="16" fill="${C.sky}" stroke="${C.ink}" stroke-width="3"/><rect x="78" y="60" width="16" height="16" fill="${C.sky}" stroke="${C.ink}" stroke-width="3"/>`);
add('place-cinema', 'place', 'a cinema, a film screen', '电影院', `<rect x="14" y="26" width="92" height="56" rx="6" fill="${C.ink}"/><rect x="20" y="32" width="80" height="44" rx="3" fill="${C.sky}"/><path d="M44 42 L70 54 L44 66 Z" fill="${C.white}"/>` + [[30, 96], [50, 96], [70, 96], [90, 96]].map(([x, y]) => `<rect x="${x - 7}" y="${y - 8}" width="14" height="12" rx="4" fill="${C.red}" stroke="${C.ink}" stroke-width="3"/>`).join(''));
add('place-beach', 'place', 'a beach with the sea and a sun umbrella', '海滩', `<path d="M8 70 H112 V104 H8 Z" fill="${C.lemon}"/><path d="M8 70 q14 -10 28 0 t28 0 t28 0 t20 0 V40 H8 Z" fill="${C.sky}"/>${sun(92, 30, 12)}<path d="M20 54 A26 26 0 0 1 72 54 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/><path d="M33 54 A13 26 0 0 1 59 54" fill="${C.white}" opacity=".7"/><path d="M46 54 V96" stroke="${C.ink}" stroke-width="4"/>`);

// ---------- 写文件 ----------
const OUT_DIR = 'assets/img/listening';
mkdirSync(OUT_DIR, { recursive: true });
for (const ic of icons) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${ic.alt}"><title>${ic.alt}</title><rect x="3" y="3" width="114" height="114" rx="22" fill="${C.bg}" stroke="${C.line}" stroke-width="3"/>${ic.body}</svg>\n`;
  writeFileSync(`${OUT_DIR}/${ic.id}.svg`, svg, 'utf8');
}
const manifest = {
  $comment: '听力 Part 1 图标清单（PL0-3）。由 tools/gen-listening-icons.mjs 生成，改图标改脚本不手改 SVG。命名 <类别>-<细项>.svg，viewBox 0 0 120 120。课文件里 options[].icon 只写 id。',
  version: '1.0',
  dir: 'assets/img/listening/',
  viewBox: '0 0 120 120',
  categories: ['clock', 'price', 'weather', 'transport', 'food', 'activity', 'place'],
  count: icons.length,
  icons: icons.map(({ id, cat, alt, zh }) => ({ id, category: cat, file: `${id}.svg`, alt, zh }))
};
writeFileSync('data/exam/ket/listening/icons.json', JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`✔ 生成 ${icons.length} 个图标 → ${OUT_DIR}/，清单 → data/exam/ket/listening/icons.json`);
