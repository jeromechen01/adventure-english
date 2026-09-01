// utils/ai-key.js —— AI 助手的 key 与配置存取（B6a）
//
// ★ 安全红线（本项目是公开的 GitHub Pages 静态站，源码任何人可见）：
//   - key 只由家长在设置页手动粘贴，只存本机 localStorage，绝不上传。
//   - 用独立裸键名，绝不进 storage.js 的 KEYS 枚举——
//     exportAllData / importAllData / resetAll 都碰不到它，导出文件里永远没有 key。
//   - getKey() 只允许在真正发请求的地方调用；任何日志/状态/UI 展示一律用 keyTail4()。
//   - key 绝不写入源码、sw.js 的任何清单、console.log 或错误信息。

const K_KEY = 'eaAiKey'; // 裸 localStorage 键，独立于 storage.js 的 ea_ 前缀体系
const K_CFG = 'eaAiCfg';

// 服务商注册表（本期只做 DeepSeek；以后加服务商 = 在这里加一条记录）
export const PROVIDERS = {
  deepseek: {
    label: 'DeepSeek（深度求索）',
    endpoint: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    applyUrl: 'https://platform.deepseek.com/',
  },
};
export const DEFAULT_CFG = { provider: 'deepseek', model: PROVIDERS.deepseek.defaultModel };

// localStorage 可能被浏览器策略禁用（隐私模式等），所有读写都兜 try/catch
export function hasKey() { try { return !!localStorage.getItem(K_KEY); } catch (e) { return false; } }
export function getKey() { try { return localStorage.getItem(K_KEY) || ''; } catch (e) { return ''; } }
export function setKey(k) {
  const v = String(k || '').trim();
  if (!v) return false;
  try { localStorage.setItem(K_KEY, v); return true; } catch (e) { return false; }
}
export function clearKey() { try { localStorage.removeItem(K_KEY); return true; } catch (e) { return false; } }
// UI 只展示后 4 位，永不回显完整 key
export function keyTail4() { const k = getKey(); return k ? k.slice(-4) : ''; }

export function getAiConfig() {
  try {
    const raw = localStorage.getItem(K_CFG);
    const cfg = raw ? JSON.parse(raw) : {};
    const provider = PROVIDERS[cfg.provider] ? cfg.provider : DEFAULT_CFG.provider;
    const model = String(cfg.model || PROVIDERS[provider].defaultModel).trim();
    return { provider, model };
  } catch (e) { return { ...DEFAULT_CFG }; }
}
export function setAiConfig({ provider, model }) {
  const p = PROVIDERS[provider] ? provider : DEFAULT_CFG.provider;
  const m = String(model || PROVIDERS[p].defaultModel).trim();
  try { localStorage.setItem(K_CFG, JSON.stringify({ provider: p, model: m })); return true; } catch (e) { return false; }
}
