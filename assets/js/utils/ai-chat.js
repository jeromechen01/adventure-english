// utils/ai-chat.js —— AI 小助教的请求与提示词（B6b）
//
// ★ AI 定位红线：AI 做增强，不做替代——
//   绝不让 AI 现场生成语法讲解（50 课经过考纲边界验证，AI 自由发挥会越界或讲错）。
//   AI 只做静态内容做不到的三件事：针对这一次错法的解释 / 换个说法重讲 / 判定开放式改法。
//   所有提示词都以本课已有内容为上下文约束：只在本课范围内讲，不引入课外语法概念。
// ★ 安全：getKey() 只在 askAI() 组装请求头这一处调用；任何返回值/错误都不含 key；
//   SW 只拦 GET，这里的 POST 不经过 Service Worker（离线时直接走 network 失败分支）。
// ★ 护栏：只在孩子主动点击时调用；失败一律平静降级回静态体验，不弹窗不空白。
import { hasKey, getKey, getAiConfig, PROVIDERS } from './ai-key.js';

export { hasKey as aiEnabled };

const TIMEOUT_MS = 20000;

// —— B6c-1 离线即时感知 ——
// navigator.onLine 为 false 时不发请求、不等 20 秒；但它报 true 不代表真通
// （有网卡没网络的情况），所以 20 秒超时兜底保留，两层都在。
export function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
// 网络恢复时执行一次回调（用于把「联网后可用」的按钮复原）；只触发一次自动解绑
export function onBackOnline(cb) {
  const h = () => { window.removeEventListener('online', h); cb(); };
  window.addEventListener('online', h);
}

// —— B6c-2 连败退避（只在本次会话内生效，刷新即重置，不写持久状态）——
// 只有 key 类失败（401/403/402）计入连败；网络类/超时/服务端抖动不计，
// 避免一次临时故障把功能长期锁死。
const FAIL_LIMIT = 3;
let keyFailStreak = 0;
export function aiSuspended() { return keyFailStreak >= FAIL_LIMIT; }
export function aiRestText() { return '😴 AI 助手暂时休息——可以请家长去「我的 → AI 助手设置」检查一下，刷新页面后可再试。'; }

// 统一请求入口。返回 { ok:true, text } 或 { ok:false, reason }
// reason: nokey | suspended | offline | badkey | nobalance | timeout | network | server
export async function askAI({ system, user, maxTokens = 350 }) {
  if (!hasKey()) return { ok: false, reason: 'nokey' };
  if (aiSuspended()) return { ok: false, reason: 'suspended' };
  if (isOffline()) return { ok: false, reason: 'offline' };
  const cfg = getAiConfig();
  const p = PROVIDERS[cfg.provider];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(p.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getKey() },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        max_tokens: maxTokens,
        temperature: 0.5,
        stream: false,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const reason = (res.status === 401 || res.status === 403) ? 'badkey'
        : res.status === 402 ? 'nobalance' : 'server';
      if (reason === 'badkey' || reason === 'nobalance') keyFailStreak++; // B6c-2：key 类失败计连败
      return { ok: false, reason };
    }
    const data = await res.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text || !String(text).trim()) return { ok: false, reason: 'server' };
    keyFailStreak = 0; // 成功即清零
    return { ok: true, text: String(text).trim() };
  } catch (e) {
    return { ok: false, reason: ctrl.signal.aborted ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

// 失败文案：平静，指回静态内容，不吓人、不回显任何技术细节
export function aiFailText(reason) {
  switch (reason) {
    case 'nokey': return 'AI 助手还没开通——家长可以在「我的 → AI 助手设置」里配置。';
    case 'suspended': return aiRestText();
    case 'offline': return '现在没有网络——联网后再试就好，现有讲解不受影响。';
    case 'badkey': return 'AI 的钥匙没通过验证——请家长到「我的 → AI 助手设置」检查。先看考点解析，一样能弄懂。';
    case 'nobalance': return 'AI 账户余额用完了——请家长充值后再用。先看考点解析，一样能弄懂。';
    case 'timeout': return 'AI 这会儿想得太久没回话——先看现有讲解，过一会儿再试。';
    case 'network': return '网络这会儿不通——先看现有讲解，联网后再试。';
    default: return 'AI 这会儿没接上——先看现有讲解，过一会儿再试。';
  }
}

// —— 错因解释的本地缓存（同一道题的解释存下来，避免重复调用花钱）——
// 独立裸键、上限 FIFO；只是生成内容的缓存，不进 KEYS 枚举、不随导出走。
const K_CACHE = 'eaAiExplainCache';
const CACHE_MAX = 200; // B6c-3：最近 200 条，超出淘汰最旧（离线也能读到之前的解释）

export function getCachedExplain(qKey) {
  try {
    const all = JSON.parse(localStorage.getItem(K_CACHE) || '{}');
    return (all[qKey] && all[qKey].text) || '';
  } catch (e) { return ''; }
}
export function setCachedExplain(qKey, text) {
  try {
    const all = JSON.parse(localStorage.getItem(K_CACHE) || '{}');
    all[qKey] = { text: String(text), t: Date.now() };
    const keys = Object.keys(all);
    if (keys.length > CACHE_MAX) {
      keys.sort((a, b) => (all[a].t || 0) - (all[b].t || 0))
        .slice(0, keys.length - CACHE_MAX)
        .forEach(k => { delete all[k]; });
    }
    localStorage.setItem(K_CACHE, JSON.stringify(all));
  } catch (e) { /* 存不进就算了，下次再问一遍 */ }
}

// —— 提示词构造（三个接入点共用一套约束口径）——

const KID = '你是儿童英语学习应用「英语奇遇记」里的 AI 小助教，对象是小学高年级、正在备考剑桥 KET（A2）的中国孩子。';
const BOUND = '严格规则：只围绕给你的这份材料讲，绝不引入材料之外的语法概念或术语（这门课严格按 KET 考纲边界编写，讲多了会超纲）；用孩子听得懂的中文；语气温和鼓励，绝不批评；不用列表不用标题，直接说话。';

// 接入点1：错因解释。e = QUIZ_MISTAKES 条目（B4 口径：src/kind/lesson/lessonTitle/stage/q/options/picked/correct/explain）
export function buildExplainPrompt(e) {
  const isDet = e.kind === 'detective';
  const user = [
    e.lesson ? `这道题来自语法课 ${e.lesson}《${e.lessonTitle || ''}》${e.stage ? `环节 ${e.stage}` : ''}。` : '',
    isDet ? `病句改写题。原病句:${e.q}` : `题目:${e.q}`,
    e.options && e.options.length ? `选项:${e.options.join(' / ')}` : '',
    `孩子${isDet ? '的改法' : '选了'}:${e.picked || '（未作答）'}`,
    `${isDet ? '参考改法' : '正确答案'}:${e.correct}`,
    e.explain ? `本题考点:${e.explain}` : '',
    `请用 3-4 句话解释:①孩子为什么容易这么${isDet ? '改' : '选'}（哪一步想岔了）②下次怎么想才对。只在本题考点范围内讲。`,
  ].filter(Boolean).join('\n');
  return { system: KID + BOUND, user, maxTokens: 300 };
}

// 接入点2：换个说法重讲。l = 大厅课 JSON（带 sections 九段）
export function buildRetellPrompt(l) {
  const s = l.sections;
  const cap = (x, n) => String(x || '').slice(0, n);
  const rules = (s.rules && s.rules.cards || []).map(c => c.rule).join('；');
  const user = [
    `这一课是 ${l.id}《${l.title}》，主比喻：${l.metaphor || '乐队'}。以下是本课已有讲解的要点——`,
    `【一句话本质】${s.essence}`,
    `【为什么英语要这样】${cap(s.why, 400)}`,
    `【乐队里的故事】${cap(s.metaphorStory, 400)}`,
    rules ? `【规则要点】${rules}` : '',
    '孩子看完说「没听懂」。请你换一个说法、换一个具体场景，把同一个知识点重讲一遍：可以用乐队里的新场景，也可以用孩子生活里的例子；只能重讲上面材料里已有的内容，一条新语法都不能加；200 字以内。',
  ].filter(Boolean).join('\n');
  return { system: KID + BOUND, user, maxTokens: 400 };
}

// 接入点4（B6c-4）：写作点评。规则写死：不打分、不改写全文、不代写、先肯定再建议。
export function buildWritingPrompt({ taskDesc, text }) {
  const system = KID +
    '现在点评孩子的英语作文。严格规则：绝不打分（分数由官方工具或家长判，你只给方向）；绝不改写全文、不替她写句子（最多示范改一个短语）；开头必须先真诚地肯定作文里具体的一处好，绝不用「你写得不好」这类否定开头；然后按 KET 写作的三个维度——内容 Content（有没有回应题目要求）、组织 Organisation（句子连接与顺序）、语言 Language（用词与语法）——各给一句话反馈；最后指出 1-2 处最值得改的地方：说清在哪里、为什么、往哪个方向改，但把改的机会留给她自己。只针对这篇作文里实际出现的内容讲，不展开系统语法课；用孩子听得懂的中文（英文原词可引用）；温和鼓励；180 字以内。';
  const user = [
    `写作任务:${taskDesc}`,
    `孩子的作文:`,
    String(text || '').slice(0, 2000),
    '请按规则点评。',
  ].join('\n');
  return { system, user, maxTokens: 450 };
}

// 接入点3：侦探关判定她的改法。
export function buildDetectivePrompt({ sentence, clue, fixed, answer }) {
  const system = KID +
    '现在请你判定孩子对病句的改写。判定规则：同一个病句常有多种正确改法——只要孩子把病因改掉了，即使和参考答案写法不同也算改对；拿不准时倾向于认可孩子的改法，并说明参考答案也可以，绝不武断判错。' +
    BOUND + '第一句必须先给结论：「✅ 改对了」或「还差一点」。总共 3-4 句。';
  const user = [
    `病句:${sentence}`,
    `病因:${clue || '（见参考改法）'}`,
    `参考改法:${fixed}`,
    `孩子的改法:${answer}`,
    '请判定孩子的改法有没有把病因改对：改对了就确认并说说她的改法好在哪；没改对就温和指出还差在哪。',
  ].join('\n');
  return { system, user, maxTokens: 300 };
}
