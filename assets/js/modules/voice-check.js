// modules/voice-check.js —— 「我的」→ 听力语音检查（PL0-1）
// 给家长用的一页：这台设备有几个英文语音、听力训练营会用哪两个声音分饰对话双方、
// 试听一句、确认能用。没有英文语音时给平静提示 + 系统语音包安装指引（不弹警告、不催促）。
// 只做「播放」不做拖动/暂停：iOS 的 speechSynthesis.pause/resume 不可靠。
import { toast } from '../app.js';
import * as storage from '../storage.js';
import { isTTSSupported, waitForVoices, pickDialogueVoices, speakDialogue, stopSpeaking } from '../speech.js';

// 试听样句（原创，两个人各一句）
const SAMPLE = [
  { sex: 'm', text: 'Hi, Anna! What time does the school bus leave tomorrow?' },
  { sex: 'f', text: 'At half past seven. So we must get up early!' }
];

let current = null; // 正在试听的对话控制器（离开页面要取消）

function platformGuide() {
  const ua = navigator.userAgent || '';
  if (/iphone|ipad|ipod/i.test(ua)) {
    return ['iPhone / iPad', '设置 → 辅助功能 → 朗读内容 → 声音 → 英语 → 下载一个声音（如 Samantha、Daniel），下载完回到这里点「重新检测」。'];
  }
  if (/android/i.test(ua)) {
    return ['安卓手机', '设置 → 系统（或「更多设置」）→ 语言和输入法 → 文字转语音（TTS）输出 → 选择「Google 语音服务」或手机自带引擎 → 安装语音数据 → 英语。装好后回到这里点「重新检测」。'];
  }
  if (/macintosh/i.test(ua)) {
    return ['Mac', '系统设置 → 辅助功能 → 朗读内容 → 系统声音 → 管理声音 → 下载一个英语声音。'];
  }
  return ['Windows 电脑', '设置 → 时间和语言 → 语音 → 「添加语音」→ 选择 English（United States / United Kingdom）安装。装好后重新打开浏览器再点「重新检测」。'];
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function renderVoiceCheck(app) {
  if (current) { current.cancel(); current = null; }
  stopSpeaking();
  const prefs = storage.getListeningPrefs();
  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="vcBackBtn" class="text-2xl tap-bounce" style="min-width:48px;min-height:48px">‹</button>
      <h2 class="text-xl font-bold flex-1">🎧 听力语音检查</h2>
    </div>
    <div class="card-cartoon text-center py-8 text-sm text-gray-500">正在检测这台设备的英文语音…</div>`;
  app.querySelector('#vcBackBtn').addEventListener('click', () => { if (current) current.cancel(); stopSpeaking(); window.__nav('me'); });

  const supported = isTTSSupported();
  const voices = supported ? await waitForVoices(2000) : [];
  const pick = pickDialogueVoices(voices);
  const [platName, guide] = platformGuide();

  const voiceRow = (label, slot) => `
    <div class="flex items-center gap-2 py-2">
      <span class="text-cap font-bold px-2 py-1 rounded-full bg-orange-100 text-primary-ink" style="white-space:nowrap">${label}</span>
      <span class="text-sm font-en flex-1" style="min-width:0;word-break:break-word">${slot.voice ? esc(slot.voice.name) : '—'}${pick.single ? `<span class="text-cap text-gray-400 font-sans">（音调 ${slot.pitch > 1 ? '偏高' : '偏低'}）</span>` : ''}</span>
    </div>`;

  app.innerHTML = `
    <div class="flex items-center gap-2 mb-3">
      <button id="vcBackBtn" class="text-2xl tap-bounce" style="min-width:48px;min-height:48px">‹</button>
      <h2 class="text-xl font-bold flex-1">🎧 听力语音检查</h2>
    </div>
    <div class="card-cartoon mb-3 text-xs text-gray-600 bg-purple-50">
      听力训练营的对话由这台设备自己朗读（不下载任何音频）。这里看一眼它有没有英文语音、两个说话人分别用哪个声音，试听一句确认能用就行。
    </div>

    ${!supported ? `
    <div class="card-cartoon mb-3">
      <div class="font-bold text-sm mb-1">这个浏览器暂时不支持语音朗读</div>
      <p class="text-sm text-gray-600">换成手机自带浏览器、Chrome 或 Safari 再试试就可以了。</p>
    </div>` : voices.length === 0 ? `
    <div class="card-cartoon mb-3">
      <div class="text-4xl text-center mb-2">🔇</div>
      <div class="font-bold text-sm text-center mb-1">这台设备还没有英文语音</div>
      <p class="text-sm text-gray-600 text-center mb-3">不着急，装一个系统语音包就能用，几分钟的事。</p>
      <div class="bg-gray-50 rounded-2xl p-3">
        <div class="text-cap font-bold text-gray-500 mb-1">📲 ${esc(platName)} 安装指引</div>
        <p class="text-sm text-gray-700" style="line-height:1.8">${esc(guide)}</p>
      </div>
      <button id="vcRetryBtn" class="w-full btn-cartoon btn-cartoon-secondary mt-3">🔄 重新检测</button>
    </div>` : `
    <div class="card-cartoon mb-3">
      <div class="flex items-center justify-between mb-2">
        <div class="font-bold text-sm">检测到 <span class="text-primary-ink">${voices.length}</span> 个英文语音</div>
        <span class="text-cap text-gray-400">${pick.single ? '只有 1 个 · 用音调区分两人' : '两人各用一个声音'}</span>
      </div>
      ${voiceRow('说话人 A', pick.m)}
      ${voiceRow('说话人 B', pick.f)}
      ${pick.single ? '<div class="text-xs text-gray-500 mt-1">只有一个英文语音也能练：男声用低音调、女声用高音调来区分。想更自然，可按下面的指引再装一个声音。</div>' : ''}
      <button id="vcPlayBtn" class="w-full btn-cartoon mt-3">▶️ 试听一句对话</button>
      <div id="vcPlayHint" class="text-cap text-gray-400 text-center mt-2" hidden>正在朗读…（听不到声音请检查音量与静音键）</div>
    </div>
    <div class="card-cartoon mb-3">
      <div class="font-bold text-sm mb-2">${prefs.voiceOk ? `✅ 已确认能用${prefs.voiceCheckedAt ? '（' + new Date(prefs.voiceCheckedAt).toLocaleDateString() + '）' : ''}` : '听完觉得清楚，就点一下确认'}</div>
      <button id="vcOkBtn" class="w-full btn-cartoon ${prefs.voiceOk ? 'btn-cartoon-secondary' : ''}">${prefs.voiceOk ? '再确认一次' : '👍 能听清，确认能用'}</button>
    </div>
    <details class="card-cartoon mb-3">
      <summary class="text-sm font-bold" style="cursor:pointer;min-height:48px;display:flex;align-items:center">全部英文语音（${voices.length}）</summary>
      <div class="mt-2">
        ${voices.map(v => `<div class="flex items-center gap-2 py-1 text-xs"><span class="font-en flex-1" style="min-width:0;word-break:break-word">${esc(v.name)}</span><span class="text-gray-400" style="white-space:nowrap">${esc(v.lang)} · ${v.localService === false ? '在线' : '本机'}</span></div>`).join('')}
      </div>
      <div class="bg-gray-50 rounded-2xl p-3 mt-2">
        <div class="text-cap font-bold text-gray-500 mb-1">想再装一个声音？（${esc(platName)}）</div>
        <p class="text-xs text-gray-600" style="line-height:1.8">${esc(guide)}</p>
      </div>
    </details>`}
  `;

  app.querySelector('#vcBackBtn').addEventListener('click', () => { if (current) current.cancel(); stopSpeaking(); window.__nav('me'); });
  const retry = app.querySelector('#vcRetryBtn');
  if (retry) retry.addEventListener('click', () => renderVoiceCheck(app));

  const playBtn = app.querySelector('#vcPlayBtn');
  if (playBtn) playBtn.addEventListener('click', () => {
    if (current) current.cancel();
    const hint = app.querySelector('#vcPlayHint');
    playBtn.disabled = true;
    playBtn.textContent = '🔊 正在朗读…';
    if (hint) hint.hidden = false;
    current = speakDialogue(SAMPLE, {
      rate: 0.9, voices: pick,
      onEnd: () => {
        current = null;
        if (!document.contains(playBtn)) return;
        playBtn.disabled = false;
        playBtn.textContent = '▶️ 再听一遍';
        if (hint) hint.hidden = true;
      }
    });
  });

  const okBtn = app.querySelector('#vcOkBtn');
  if (okBtn) okBtn.addEventListener('click', () => {
    storage.setListeningPrefs({ voiceOk: true, voiceCheckedAt: Date.now(), voiceNames: [pick.m.voice && pick.m.voice.name, pick.f.voice && pick.f.voice.name].filter(Boolean) });
    toast('已记下：这台设备的语音能用', 'success');
    renderVoiceCheck(app);
  });
}
