// modules/exam/resources.js —— 模块 8：资源链接
// ⚠️ 全部外链跳转，app 内不存放任何官方文件（版权红线）。
import { loadJSON } from '../../app.js';
import * as storage from '../../storage.js';
import { headerHtml, bindBack, esc, loadExamConfig, fillSeason } from './exam-common.js';

export async function renderResources(app) {
  await loadExamConfig(); // 考季占位符（P0.6）
  const data = await loadJSON('data/exam/ket/resources.json');
  if (!data) {
    app.innerHTML = '<div class="card-cartoon empty-state"><span class="empty-emoji">🔗</span><div class="empty-text">资源清单加载失败</div></div>';
    return;
  }
  const visited = storage.getVisitedResources();
  const reg = data.registration;

  app.innerHTML = `
    ${headerHtml('🔗 官方资源中心')}
    <div class="card-cartoon mb-4 bg-blue-50 text-xs text-gray-600">
      ${data.note} 点击即在新窗口打开官方页面；访问过的会打 ✓。
    </div>

    ${data.groups.map(g => `
      <h3 class="font-bold mb-2 mt-4">${g.icon} ${g.name}</h3>
      <div class="space-y-2">
        ${g.items.map(it => {
          const seen = visited.includes(it.id);
          return `
          <a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer" data-res="${it.id}"
             class="block card-cartoon tap-bounce ${seen ? 'opacity-70' : ''}" style="padding:12px 14px">
            <div class="flex items-center gap-2">
              <span class="font-bold text-sm flex-1">${it.star ? '⭐ ' : ''}${esc(it.name)}</span>
              ${seen ? '<span class="text-green-700 font-bold">✓ 已看</span>' : '<span class="text-gray-300">↗</span>'}
            </div>
            <div class="text-xs text-gray-500 mt-1">${esc(it.why)}</div>
          </a>`;
        }).join('')}
      </div>`).join('')}

    <!-- 报名操作 -->
    <h3 class="font-bold mb-2 mt-5">📮 ${reg.title}</h3>
    <div class="card-cartoon mb-3 border-2 border-red-300 bg-red-50">
      ${reg.warnings.map(w => `<p class="text-sm text-gray-700 mb-2">⚠️ ${w}</p>`).join('')}
    </div>
    <div class="card-cartoon mb-3">
      ${reg.steps.map((s, i) => `
        <div class="flex gap-2 py-2 border-b border-gray-50 last:border-0">
          <span class="font-black text-primary-ink" style="min-width:24px">${i + 1}</span>
          <span class="text-sm text-gray-700 flex-1" style="word-break:break-all">${s}</span>
        </div>`).join('')}
    </div>

    <!-- 会咬人的规则 -->
    <h3 class="font-bold mb-2">🦈 会咬人的规则</h3>
    <div class="card-cartoon mb-3">
      ${reg.bitingRules.map(r => `
        <div class="py-2 border-b border-gray-50 last:border-0">
          <div class="flex gap-2">
            <span class="font-bold text-sm" style="min-width:76px">${r.item}</span>
            <span class="text-sm text-gray-700 flex-1">${r.rule}</span>
          </div>
          <div class="text-xs text-orange-700 mt-1 pl-[84px]">→ ${fillSeason(r.meaning)}</div>
        </div>`).join('')}
    </div>

    <!-- 合规提示 -->
    <div class="card-cartoon bg-gray-50">
      <h3 class="font-bold text-sm mb-2">⚖️ ${reg.compliance.title}</h3>
      ${reg.compliance.lines.map(l => `<p class="text-xs text-gray-600 mb-2">${l}</p>`).join('')}
    </div>
  `;
  bindBack(app);
  // 点击记「已访问」（链接本身用 <a target=_blank> 原生打开）
  app.querySelectorAll('[data-res]').forEach(a => {
    a.addEventListener('click', () => {
      storage.markResourceVisited(a.dataset.res);
      // 稍后刷新打勾状态（不打断新窗口打开）
      setTimeout(() => renderResources(app), 400);
    });
  });
}
