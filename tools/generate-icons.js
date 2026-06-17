// generate-icons.js — 纯 Node 生成 PWA 图标 PNG（无第三方依赖，使用内置 zlib）
// 画一只简洁的狐狸脸 + 橙色背景，输出 4 个图标到 assets/images/
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ---- PNG 编码（RGBA -> PNG buffer）----
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // 每行前加 filter byte 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- 绘图原语 ----
function makeCanvas(size) {
  return { size, buf: Buffer.alloc(size * size * 4) }; // 默认透明
}
function setPx(c, x, y, [r, g, b, a = 255]) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 4;
  // alpha over 合成
  const sa = a / 255, da = c.buf[i + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa === 0) return;
  for (let k = 0; k < 3; k++) {
    const sc = [r, g, b][k];
    c.buf[i + k] = Math.round((sc * sa + c.buf[i + k] * da * (1 - sa)) / oa);
  }
  c.buf[i + 3] = Math.round(oa * 255);
}
function fillRoundRect(c, x0, y0, x1, y1, radius, color) {
  for (let y = Math.floor(y0); y < y1; y++) {
    for (let x = Math.floor(x0); x < x1; x++) {
      let inside = true;
      const corners = [[x0 + radius, y0 + radius], [x1 - radius, y0 + radius],
                       [x0 + radius, y1 - radius], [x1 - radius, y1 - radius]];
      // 仅在角落区域用圆判定
      if (x < x0 + radius && y < y0 + radius) inside = dist(x, y, corners[0]) <= radius;
      else if (x >= x1 - radius && y < y0 + radius) inside = dist(x, y, corners[1]) <= radius;
      else if (x < x0 + radius && y >= y1 - radius) inside = dist(x, y, corners[2]) <= radius;
      else if (x >= x1 - radius && y >= y1 - radius) inside = dist(x, y, corners[3]) <= radius;
      if (inside) setPx(c, x, y, color);
    }
  }
}
function dist(x, y, [cx, cy]) { return Math.hypot(x - cx, y - cy); }
function fillCircle(c, cx, cy, r, color) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r) setPx(c, x, y, color);
      else if (d <= r + 1) setPx(c, x, y, [color[0], color[1], color[2], Math.round((color[3] ?? 255) * (r + 1 - d))]);
    }
}
function edge(ax, ay, bx, by, px, py) { return (bx - ax) * (py - ay) - (by - ay) * (px - ax); }
function fillTriangle(c, p0, p1, p2, color) {
  const minX = Math.floor(Math.min(p0[0], p1[0], p2[0]));
  const maxX = Math.ceil(Math.max(p0[0], p1[0], p2[0]));
  const minY = Math.floor(Math.min(p0[1], p1[1], p2[1]));
  const maxY = Math.ceil(Math.max(p0[1], p1[1], p2[1]));
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      const w0 = edge(p1[0], p1[1], p2[0], p2[1], x + 0.5, y + 0.5);
      const w1 = edge(p2[0], p2[1], p0[0], p0[1], x + 0.5, y + 0.5);
      const w2 = edge(p0[0], p0[1], p1[0], p1[1], x + 0.5, y + 0.5);
      if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) setPx(c, x, y, color);
    }
}

// ---- 颜色 ----
const ORANGE = [255, 138, 76];
const ORANGE_DARK = [231, 111, 51];
const WHITE = [255, 255, 255];
const CREAM = [255, 248, 240];
const DARK = [60, 42, 33];

// 在 [ox,oy] 起点、边长 S 的方形区域内画狐狸（局部坐标 0..1）
function drawFox(c, ox, oy, S) {
  const L = (x, y) => [ox + x * S, oy + y * S];
  // 耳朵（外）
  fillTriangle(c, L(0.10, 0.46), L(0.30, 0.04), L(0.45, 0.40), ORANGE_DARK);
  fillTriangle(c, L(0.90, 0.46), L(0.70, 0.04), L(0.55, 0.40), ORANGE_DARK);
  // 耳朵（内）
  fillTriangle(c, L(0.20, 0.42), L(0.31, 0.16), L(0.40, 0.40), CREAM);
  fillTriangle(c, L(0.80, 0.42), L(0.69, 0.16), L(0.60, 0.40), CREAM);
  // 头顶（橙圆）
  fillCircle(c, ...L(0.5, 0.46), 0.30 * S, ORANGE);
  // 下巴（橙三角）
  fillTriangle(c, L(0.20, 0.50), L(0.80, 0.50), L(0.5, 0.94), ORANGE);
  // 白色脸颊 / 口鼻
  fillTriangle(c, L(0.29, 0.56), L(0.71, 0.56), L(0.5, 0.90), WHITE);
  // 眼睛
  fillCircle(c, ...L(0.37, 0.47), 0.05 * S, DARK);
  fillCircle(c, ...L(0.63, 0.47), 0.05 * S, DARK);
  // 眼睛高光
  fillCircle(c, ...L(0.385, 0.455), 0.018 * S, WHITE);
  fillCircle(c, ...L(0.645, 0.455), 0.018 * S, WHITE);
  // 鼻子
  fillTriangle(c, L(0.44, 0.74), L(0.56, 0.74), L(0.5, 0.84), DARK);
}

function makeIcon(size, maskable) {
  const c = makeCanvas(size);
  if (maskable) {
    // 全幅橙色背景（安卓会裁切边缘）
    fillRoundRect(c, 0, 0, size, size, 0, ORANGE);
    // 狐狸缩到约 60% 居中，四周留 ~20% 安全边距
    drawFox(c, size * 0.20, size * 0.18, size * 0.60);
  } else {
    // 圆角方形橙色背景
    fillRoundRect(c, 0, 0, size, size, size * 0.22, ORANGE);
    drawFox(c, size * 0.10, size * 0.08, size * 0.80);
  }
  return encodePNG(size, size, c.buf);
}

const outDir = path.join(__dirname, '..', 'assets', 'images');
fs.mkdirSync(outDir, { recursive: true });
const targets = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-192-maskable.png', 192, true],
  ['icon-512-maskable.png', 512, true],
];
for (const [name, size, maskable] of targets) {
  const png = makeIcon(size, maskable);
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`generated ${name} (${size}x${size}, ${png.length} bytes)`);
}
console.log('done');
