// modules/ai-settings.js —— AI 助手设置页（B6a，入口在「我的」，不进首页防孩子误触）
//
// 只做三件事：让家长粘贴/清除 API key、选服务商与模型、测试连通。
// ★ 安全红线见 utils/ai-key.js 头注释：key 只存本机、UI 只显示后 4 位、
//   任何日志与错误信息不回显 key。这是可选功能，不填不影响现有全部功能。
import { PROVIDERS, hasKey, getKey, setKey, clearKey, keyTail4, getAiConfig, setAiConfig } from '../utils/ai-key.js';
import { toast } from '../app.js';

export function renderAiSettings(app) {
  const cfg = getAiConfig();

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-4">
      <button id="aiBackBtn" class="text-2xl tap-bounce" style="min-width:48px;min-height:48px">‹</button>
      <h2 class="text-xl font-bold">🤖 AI 助手设置</h2>
    </div>
    <p class="text-xs text-gray-400 mb-4">这一页是给家长设置的。<b>这是可选功能：不设置，现有的全部功能照常使用，一点不受影响。</b></p>

    <!-- 给家长的说明 -->
    <div class="card-cartoon mb-4">
      <h3 class="font-bold mb-2">这是什么？</h3>
      <p class="text-sm text-gray-700 mb-2">给孩子的学习配一位「AI 小助教」：以后做错题时，它能针对孩子的错法讲讲错在哪（下个版本开通具体功能，本页先把钥匙配好）。</p>
      <h3 class="font-bold mb-2 mt-3">怎么开通？</h3>
      <p class="text-sm text-gray-700 mb-2">需要一把「钥匙」（叫 API key）：</p>
      <p class="text-sm text-gray-700 mb-1">① 打开 <a href="${PROVIDERS.deepseek.applyUrl}" target="_blank" rel="noopener" class="underline text-secondary-ink">DeepSeek 开放平台</a>（手机号注册）；</p>
      <p class="text-sm text-gray-700 mb-1">② 在「API keys」页面点「创建」，得到一串 sk- 开头的字符；</p>
      <p class="text-sm text-gray-700 mb-2">③ 复制它，粘贴到下面的输入框，点保存。</p>
      <h3 class="font-bold mb-2 mt-3">要花多少钱？</h3>
      <p class="text-sm text-gray-700 mb-2">按实际用量计费，需要在 DeepSeek 官网充值。孩子日常学习的用量很小，一般每月几块钱以内；具体价格以官网为准。</p>
      <h3 class="font-bold mb-2 mt-3">安全吗？</h3>
      <p class="text-sm text-gray-700">钥匙只保存在<b>这台设备的浏览器里</b>，不会上传到任何地方；换设备或清理了浏览器数据后需要重新粘贴。请家长自己保管，不要发给别人。</p>
    </div>

    <!-- 设置表单 -->
    <div class="card-cartoon mb-4">
      <label class="block text-sm font-bold mb-1">服务商</label>
      <select id="aiProvider" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm mb-3 bg-white">
        ${Object.entries(PROVIDERS).map(([id, p]) => `<option value="${id}" ${cfg.provider === id ? 'selected' : ''}>${p.label}</option>`).join('')}
      </select>

      <label class="block text-sm font-bold mb-1">API Key</label>
      <div class="flex gap-2 mb-1" style="min-width:0">
        <input id="aiKeyInput" type="password" autocomplete="off" spellcheck="false"
          class="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm" style="min-width:0"
          placeholder="${hasKey() ? '已保存，粘贴新的可替换' : '粘贴 sk- 开头的 key'}" />
        <button id="aiEyeBtn" class="tap-bounce text-xl" style="min-width:48px;min-height:48px" title="临时查看">👁</button>
      </div>
      <div id="aiKeyState" class="text-xs text-gray-500 mb-3">${hasKey() ? `已保存（尾号 ${keyTail4()}）` : '还没有保存 key'}</div>

      <label class="block text-sm font-bold mb-1">模型名</label>
      <input id="aiModelInput" class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm mb-1 font-en" value="${cfg.model}" />
      <div class="text-xs text-gray-400 mb-3">不确定就保持默认（${PROVIDERS[cfg.provider].defaultModel}）</div>

      <button id="aiSaveBtn" class="w-full btn-cartoon mb-2">💾 保存设置</button>
      <button id="aiTestBtn" class="w-full btn-cartoon btn-cartoon-secondary mb-2">🔌 测试连接</button>
      <button id="aiClearBtn" class="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-600" style="min-height:48px">🗑️ 清除已保存的 key</button>
      <div id="aiTestState" class="text-sm mt-2" hidden></div>
    </div>
  `;

  app.querySelector('#aiBackBtn').onclick = () => window.__nav('me');

  // 👁 按住期间临时明文，松开复原（默认遮蔽）
  const keyInput = app.querySelector('#aiKeyInput');
  const eye = app.querySelector('#aiEyeBtn');
  const show = () => { keyInput.type = 'text'; };
  const hide = () => { keyInput.type = 'password'; };
  eye.addEventListener('pointerdown', show);
  eye.addEventListener('pointerup', hide);
  eye.addEventListener('pointerleave', hide);

  app.querySelector('#aiSaveBtn').addEventListener('click', () => {
    setAiConfig({ provider: app.querySelector('#aiProvider').value, model: app.querySelector('#aiModelInput').value });
    const raw = keyInput.value.trim();
    if (raw) {
      if (!setKey(raw)) { toast('保存失败：浏览器禁用了本地存储', 'error'); return; }
      keyInput.value = '';
      keyInput.placeholder = '已保存，粘贴新的可替换';
    } else if (!hasKey()) {
      toast('先粘贴 key 再保存哦', 'warn');
      return;
    }
    app.querySelector('#aiKeyState').textContent = `已保存（尾号 ${keyTail4()}）`;
    toast('设置已保存', 'success');
  });

  app.querySelector('#aiClearBtn').addEventListener('click', () => {
    clearKey();
    keyInput.value = '';
    keyInput.placeholder = '粘贴 sk- 开头的 key';
    app.querySelector('#aiKeyState').textContent = '还没有保存 key';
    toast('key 已从本机清除', 'success');
  });

  bindTestBtn(app);
}

// —— 连通性测试（B6a-3）——
// 最小请求验证 key 有效；15 秒超时保护不卡 UI；三态结果文案平静。
// ★ 任何结果与错误信息都不回显 key；getKey() 只在这里（发请求时）被调用。
const TEST_TIMEOUT_MS = 15000;

async function runTest() {
  if (!hasKey()) return { cls: 'text-orange-700', text: '还没有保存 key——先粘贴并点「保存设置」。' };
  const cfg = getAiConfig();
  const p = PROVIDERS[cfg.provider];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TEST_TIMEOUT_MS);
  try {
    const res = await fetch(p.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getKey() },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: '请只回复一个字：好' }],
        max_tokens: 5,
        stream: false,
      }),
      signal: ctrl.signal,
    });
    if (res.ok) return { cls: 'text-green-700', text: '✅ 连接成功，key 可以用。AI 功能会在下个版本开通。' };
    if (res.status === 401 || res.status === 403) return { cls: 'text-orange-700', text: 'key 没有通过验证：检查是不是复制完整了（sk- 开头整串），或到官网重新创建一个。' };
    if (res.status === 402) return { cls: 'text-orange-700', text: 'key 是对的，但账户余额不足——到 DeepSeek 官网充值后就能用了。' };
    if (res.status === 404 || res.status === 400) return { cls: 'text-orange-700', text: '服务商不认识这个模型名——改回默认值再试试。' };
    return { cls: 'text-orange-700', text: `服务那边暂时没接住（状态码 ${res.status}），过一会儿再试一次就好。` };
  } catch (e) {
    return ctrl.signal.aborted
      ? { cls: 'text-orange-700', text: '等了 15 秒没有回应——网络可能不通，检查网络后再试。' }
      : { cls: 'text-orange-700', text: '网络不通：检查一下网络连接再试（有些校园网/公共网络会拦这类请求）。' };
  } finally {
    clearTimeout(timer);
  }
}

function bindTestBtn(app) {
  const btn = app.querySelector('#aiTestBtn');
  const state = app.querySelector('#aiTestState');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = '⏳ 测试中…（最多等 15 秒）';
    state.hidden = true;
    const r = await runTest();
    btn.disabled = false;
    btn.textContent = label;
    state.hidden = false;
    state.className = 'text-sm mt-2 ' + r.cls;
    state.textContent = r.text;
  });
}
