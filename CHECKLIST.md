# 功能完成清单 (V0.3 PET 备考框架版)

## 🆕 V0.3 任务 B (PET 全量词库 + 阅读填充 · 20 话题全部完成 ✅)

### 词库填充 (20 个 pending 话题全部 ready，加样例共 22 topics)
- [x] education 40 / work 40 / family 40 / health 40 / sport 38 / shopping 38
- [x] weather 32 / environment 38 / technology 38 / entertainment 38 / house 38 / clothes 36
- [x] feelings 36 / animals 36 / hobbies 36 / city 36 / money 36 / communication 36 / nature 36 / time 34
- [x] 加任务 A 样例 food 25 / travel 25 → **PET 词库累计 792 词，22 topics 全部 status=ready，0 pending**
- [x] 全部沿用任务 A schema：mnemonic 记忆法(联想/词根词缀/谐音/拆解/场景) + petExam.collocations + 2 例句 + 音标
- [x] 每话题独立 git commit（便于回溯）；每 4-5 话题跑质检脚本 + 乱码扫描，发现问题即改
- [ ] 后续可选：各话题从 ~34-40 词加密到 150-180 词，冲刺 3500 总量（当前为全话题高质量打底）

### 阅读填充 (15 篇原创 B1 文章)
- [x] pet-reading-1 (3篇) + pet-reading-2 (6篇) + pet-reading-3 (6篇) = **15 篇原创 B1 文章**
- [x] 题材含 notice / email / story / article / advert；题型 choice + truefalse；petSkills 标注
- [x] `data/pet/reading/index.json` 清单驱动，reading.js 按清单合并加载多文件（新建文件登记即生效）
- [ ] 后续可选：继续填至 30-50 篇（新建 pet-reading-N.json 并登记 index.json 即自动加载）

### 自检
- [x] 每话题 node 校验 schema 完整 + 词量达标 + id/词形去重；22 词库 + 3 阅读 JSON 全有效
- [x] 乱码字符扫描（防串入西里尔/损坏字符）全过；记忆法无过短/废话（792 条自动扫描）
- [x] 全 17 个 JS node --check 通过；reading 多文件加载逻辑已验证；sw.js 缓存版本 → ea-v0.3.3
- [x] 版权：词汇释义/例句/记忆法/阅读文章 100% 原创，未碰任何官方原文

## 🆕 V0.3 新增 (任务 A：PET 框架 + 移动端字号/界面)

### 🎓 剑桥 PET (B1) 备考模块框架
- [x] 新增数据目录 `data/pet/{words,reading}/` + 话题清单 `data/pet/topics.json`
- [x] 话题清单列出 22 个 PET 常考话题，前 2 个 status=ready，其余 pending（供任务 B 分批填）
- [x] 示例词库 2 个话题：`pet-food.json` / `pet-travel.json`，各 25 个原创 B1 词
- [x] 单词 schema 扩展 PET 字段：level / mnemonic 记忆法 / petExam.{frequency,collocations}
- [x] 示例阅读 `pet-reading-1.json`：3 篇原创 B1 文章（notice/story/email）+ choice/truefalse 题
- [x] 级别选择器新增「🎓 PET 剑桥备考」入口，profile.grade='PET'，顶部标签显示「PET 备考」
- [x] storage 兼容字符串级别（进度按 `PET:话题id` 键隔离，不影响数字年级）
- [x] PET 单词模块：话题列表卡片 → ready 可闯关，pending 优雅提示「敬请期待」
- [x] 复用闯关系统：话题词按 8 词/关切分，renderLevelMap 泛化支持传入 words/progressKey/title/onBack
- [x] PET「识词学习」卡片展示 mnemonic 记忆法 + petExam.collocations 常见搭配 + 频率标签
- [x] PET 阅读复用点词查义/逐句跟读/背诵 LCS 打分；reading 引擎归一化支持 truefalse 题
- [x] 点词查义、错题本均并入 PET 话题词（id/词形索引），PET 错词可显示
- [x] 语法/写作在 PET 级别复用初中(junior)内容，不白屏不报错
- [x] 路由兜底：PET 无 words 的 levels、无 topic 的 petlevels 均优雅回退，不加载不存在的 gradePET.json

### ✏️ 移动端字号整体放大 + 界面优化
- [x] 字号变量整体 +3 号：body 16→19 / title 22→25 / word 28→34 / meaning 18→21 / option 16→19 / btn→19 / small 13→15
- [x] 手机 ≤640px Tailwind text-* 覆盖同步放大 (xs 13.5→15 / sm 15→17 / base 16.5→18.5 / lg→21 / xl→23 / 2xl→27)
- [x] 长单词优雅换行 (overflow-wrap:break-word)，长英文单词/选项/词卡小屏不溢出
- [x] PET 阅读长文章正文 ≥19px、行高 1.85、限宽舒适
- [x] PET 话题列表卡片式网格 (2/3/4 列自适应) + 话题 emoji 图标 + 触控 ≥48px，卡通风格统一

## 🆕 V0.2 新增

### ⭐ 单词闯关系统 (本次核心)
- [x] 闯关地图: SVG 贝塞尔蜿蜒小路 + 圆形徽章节点 + zigzag 布局
- [x] 三状态节点 (已通关⭐ / 当前关呼吸+宠物📍 / 锁定🔒)
- [x] 主题大区 (草原🌳/海边🌊/雪山⛄/太空🚀) + 每 5 关 Boss🐉 里程碑
- [x] 进入自动滚到当前关 + 窗口 resize 重算坐标 (响应式)
- [x] 开场 3-2-1 仪式动画
- [x] 关内 HUD: 生命值❤️×3 / 连击🔥 / 倍率⚡(×1/×2/×3) / 实时金币
- [x] 即时反馈: 金币飞向顶部 + 连击弹跳 + 音效 + 宠物欢呼 + 10% 暴击 + 5/10 连击彩带
- [x] 5 种玩法: 闪电选择(限时) / 字母拼拼乐 / 听音辨词 / 快速反应 / Boss 战(血条+受击+反击)
- [x] 每关混入 1-2 个错词强化复现
- [x] 结算: 星星逐颗点亮 + 金币滚动 + 宝箱随机掉落(卡牌/金币/食物/装饰) + 宠物升级
- [x] 失败不打击 (就差一点点 + 安慰金币 + 重新挑战)
- [x] 长期激励: 每日首关×2 / 单词图鉴收集 / 首通奖励 / Boss 翻倍必掉卡

### 错词智能强化
- [x] recordWordResult 记 wrongCount + consecutiveCorrect, 连对 3 次毕业
- [x] 🔥 错词突击入口 (红色醒目, 显示待强化数)
- [x] 优先级排序 (wrongCount*2 - consecutiveCorrect), 毕业奖励 + 毕业特效

### 趣味记忆法
- [x] 单词卡支持可选 mnemonic 字段, 显示 💡 趣味记忆黄色卡片 (无则隐藏, 向后兼容)
- [x] 1-6 年级注入 47 条高质量记忆法 (词根词缀/联想/谐音/拆解/图像, 宁缺毋滥)

### 跟读背诵 + 精准打分
- [x] speech.js 新增 alignWords (LCS 词级对齐 + 缩写展开/去标点规范化)
- [x] 综合分 = 完整度×0.7 + 准确度×0.3, 逐词高亮 (对绿/漏灰/多红)
- [x] 逐句跟读 (按 .!? 拆句, similarity ≥75 过)
- [x] 背诵挑战 (预备 → 挖空 20%/50%/全遮 → 录音 → 打分)
- [x] 等级 (95+完美/80+熟练/60+基本) + 分档奖励 + 背诵达人勋章

### 其他
- [x] 7 个新勋章 (过关斩将/完美主义/屠龙勇士/连击大师/探险家/攻克难关/背诵达人)
- [x] 响应式适配 (viewport 修正 + 刘海安全区 + ≥44px 触控 + clamp 字号 + 选项 2×2/正文限宽)

## ✅ 已完成 (V0.1)

### 数据层
- [x] 三年级到九年级 7 个年级各 30 个真实高频词 (共 210 词)
- [x] 小学 10 个语法点 + 初中 10 个语法点 (各含 5 道题)
- [x] 小学 5 篇 + 初中 5 篇分级阅读文章 (含翻译和理解题)
- [x] 10 个写作话题 + 10 篇优秀范文 (含亮点标注)

### 基础设施
- [x] localStorage 封装 (storage.js)
- [x] 语音合成 + 语音识别封装 (speech.js)
- [x] 简单音效合成 (Web Audio API)
- [x] 文本相似度算法 (Levenshtein)

### 单词模块
- [x] 单元学习流程 (一张张卡片记忆)
- [x] 单词消消乐 (字母拼接游戏)
- [x] 单词打地鼠 (60 秒限时挑战)
- [x] 宠物养成 (5 个进化阶段)
- [x] 卡牌收集 (N/R/SR/SSR 四个稀有度)
- [x] 艾宾浩斯复习曲线
- [x] 错词本自动收集
- [x] 朗读功能
- [x] 跟读评测

### 语法模块
- [x] 按级别分类 (小学/初中)
- [x] 规则讲解 + 例句展示
- [x] 选择题练习 + 即时批改 + 解析
- [x] 完成度反馈

### 阅读模块
- [x] 文章列表 (难度星级、字数、阅读时间)
- [x] 点词查义 (本地词库)
- [x] 全文朗读
- [x] 跟读评分
- [x] 翻译切换
- [x] 阅读理解题 + 批改

### 写作模块
- [x] 话题列表 (按年级推荐)
- [x] 写作提示 + 关键词
- [x] 字数统计
- [x] 4 维度伪 AI 批改 (拼写/语法/词汇/结构)
- [x] 词汇升级建议
- [x] 范文对比 + 亮点标注

### 游戏化系统
- [x] 金币系统 (答对 +5~+20)
- [x] 段位系统 (青铜/白银/黄金/钻石/王者)
- [x] 每日任务 (每天 3 个)
- [x] 连续打卡 (自动检测)
- [x] 勋章系统 (13 个勋章)
- [x] 虚拟排行榜 (10 个 NPC)

### 辅助功能
- [x] 首页宠物展示 + 数据概览
- [x] 错题本管理
- [x] 个人中心 (昵称、头像、统计)
- [x] 数据导出 / 导入 / 重置
- [x] 首次访问年级选择
- [x] 多年级随时切换

### 部署
- [x] 单 HTML 入口
- [x] CDN 引入 Tailwind 和 Lucide
- [x] .nojekyll 文件
- [x] 完整中文 README + 部署教程
- [x] MIT License

## ⚠️ 已知限制

- 词库每年级仅含 30 词作为样本，需后续扩充至 80-600 词 (关卡数随词量自动增长)
- 趣味记忆暂覆盖 1-6 年级共 47 词 (重质量, 宁缺毋滥)，7-9 年级及更多词待补
- 阅读文章每个级别仅 5 篇，可继续扩充
- 跟读/背诵打分依赖浏览器原生 SpeechRecognition，部分浏览器 (如桌面 Firefox) 不支持
- 伪 AI 批改的语法检查比较基础，对复杂句式判断不够准确
- 排行榜为虚拟数据 (无服务器无法做真实跨用户排行)

## 🆕 V0.3 移动端自适应 + 卡通化视觉升级 (纯样式层，未改业务逻辑)

### 移动端可读性 / 自适应
- [x] clamp() 响应式字号系统 (--fs-body/title/word/meaning/option/btn/small)，正文最小 16px 起
- [x] 手机 ≤640px 放大偏小文字 (text-xs 12→13.5 / text-sm 14→15 / text-[10px]→12)，输入框统一 ≥16px 防 iOS 缩放
- [x] 三档断点：手机单列大字 / 平板舒展放大 / 桌面居中限宽 1100px
- [x] 触控目标 ≥48px (按钮/导航/选项)

### 卡通化视觉
- [x] 配色扩展：在橙色主题上增加柠檬黄/粉红/天蓝/葡萄紫马卡龙点缀色，正文改深棕 #5A4A42
- [x] 圆润形状：卡片圆角 26px + 柔和彩色投影，按钮全圆角胶囊 + 立体厚度阴影
- [x] 圆体字体：中文 PingFang/鸿蒙圆体优先，英文 Google Fonts Baloo 2/Fredoka (CDN，失败自动降级系统字体)
- [x] 底部导航选中态图标放大弹跳高亮，进度条发光，顶部栏柔和投影
- [x] 空状态可爱化 (错题本🦊🎉 / 卡牌🃏✨ / 消消乐🦊📚 浮动大 emoji + 鼓励语)
- [x] breathe 呼吸微动效 + 尊重 prefers-reduced-motion 无障碍
- [x] PWA 字体 CDN 已加入 sw.js 离线缓存，缓存版本 → ea-v0.3.0

### 自检
- [x] git 已备份 (commit「视觉升级前备份」)
- [x] 18 个 JS 全部 node --check 通过；18 个 JSON 全部有效；style.css 括号平衡 (216/216)
- [x] npx http-server 后台起服务，index/css/manifest/sw/icon/js/json 全部 200，新 CSS/字体已确认生效
- [x] 现有功能逻辑零改动 (仅改 CSS + 三处空状态模板 + 字体 link)

## 📊 统计

- 新增文件: levels.js / level-play.js / reinforce.js / recite.js
- JS 模块: 16 个 (全部通过 node --check)
- 数据文件: 17 个 JSON (全部校验有效)
- 勋章总数: 20 个 (13 + V0.2 新增 7)
- 目标加载时间: < 3 秒
- 完整离线可用 (除 CDN 资源)
