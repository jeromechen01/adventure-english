/* 英语奇遇记 · 设计系统 Tailwind 映射（B1 / V0.9.6）
 * 唯一事实源之一：与 assets/css/style.css 的 :root token 配套。
 * 所有页面（index.html 与 tools/smoke 的测量页）都必须引用本文件，
 * 否则 Tailwind class 落回默认字号/默认灰阶，渲染与测量都会失真。
 *
 * 规则（CHECKLIST「设计系统规范」）：
 * - 字号 8 级：display/h1/h2/body-lg/body/body-sm/cap/micro，全站只准取这 8 个值
 * - text-xs..text-2xl 已整体重映射到 token（比旧值大 2~7px），禁止再写 text-[Npx] 任意值
 * - text-3xl..text-6xl 是 emoji/插图专用尺寸，禁止用于任何需要阅读的文字
 * - 灰阶重映射为暖棕灰：gray-400 起对白/米底对比度 ≥4.5:1（WCAG AA）
 * - 这是经典脚本（非 ESM），必须在 tailwind CDN <script> 之后、页面内容之前加载
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* 品牌橙：500 是品牌识别色（大面积底/装饰）；
         * 600 按钮填充（白字 3.55:1，大号粗体 AA）；700 浅底上的橙色文字（4.9:1） */
        primary: '#FF8A4C',
        'primary-dark': '#E76F33',      /* 兼容旧 class；新代码用 primary-ink */
        'primary-btn': '#E2601A',
        'primary-ink': '#C2410C',
        /* 品牌青：500 装饰；600 按钮填充；ink 浅底文字 */
        secondary: '#4ECDC4',
        'secondary-dark': '#38B2AC',
        'secondary-btn': '#1F8F88',
        'secondary-ink': '#1B7470',
        cream: '#FFF8F0',
        /* 暖棕灰阶：300 及以下是装饰/边框，400 起是可读文字（AA 达标） */
        gray: {
          50: '#FAF5EF',
          100: '#F3ECE6',
          200: '#E7DCD3',
          300: '#D3C4B8',
          400: '#7D6A5E',
          500: '#6E5A4B',
          600: '#5D4B3F',
          700: '#4A3B31',
          800: '#46372C',
          900: '#3D2E24'
        }
      },
      fontSize: {
        /* 8 级字号标尺（值定义在 style.css :root，clamp 响应式，手机端不缩水） */
        micro: ['var(--fs-micro)', { lineHeight: '1.4' }],
        cap: ['var(--fs-cap)', { lineHeight: '1.5' }],
        xs: ['var(--fs-body-sm)', { lineHeight: '1.6' }],
        sm: ['var(--fs-body)', { lineHeight: '1.65' }],
        base: ['var(--fs-body-lg)', { lineHeight: '1.6' }],
        lg: ['var(--fs-h2)', { lineHeight: '1.4' }],
        xl: ['var(--fs-h1)', { lineHeight: '1.3' }],
        '2xl': ['var(--fs-display)', { lineHeight: '1.2' }],
        /* emoji / 插图尺寸（非文字！文字禁止使用 3xl 及以上） */
        '3xl': ['var(--emoji-sm)', { lineHeight: '1.15' }],
        '4xl': ['var(--emoji-md)', { lineHeight: '1.1' }],
        '5xl': ['var(--emoji-lg)', { lineHeight: '1.1' }],
        '6xl': ['var(--emoji-xl)', { lineHeight: '1.1' }]
      }
    }
  }
};
