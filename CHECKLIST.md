# 功能完成清单 · 英语奇遇记

> 逐项功能明细（按 V0.1 → V0.7 时间线）。高层进度速览见 [progress.md](./progress.md)。

---

## ✅ V0.1 — 基础学习平台

### 数据层
- [x] 3–9 年级 7 个年级各 30 高频词（共 210 词）
- [x] 小学 10 + 初中 10 语法点（各含 5 题）
- [x] 小学 5 + 初中 5 篇分级阅读（含翻译和理解题）
- [x] 10 写作话题 + 10 优秀范文（含亮点标注）

### 基础设施
- [x] localStorage 封装（storage.js）
- [x] 语音合成 + 识别封装（speech.js）
- [x] Web Audio 音效合成 + Levenshtein 文本相似度

### 单词模块
- [x] 单元卡片学习 · 消消乐（字母拼接）· 打地鼠（60 秒限时）
- [x] 宠物养成（5 进化阶段）· 卡牌收集（N/R/SR/SSR）
- [x] 艾宾浩斯复习曲线 · 错词本自动收集 · 朗读 · 跟读评测

### 语法 / 阅读 / 写作模块
- [x] 语法：级别分类 + 规则例句 + 选择题即时批改解析 + 完成度反馈
- [x] 阅读：文章列表（难度/字数/时长）+ 点词查义 + 全文朗读 + 跟读评分 + 翻译切换 + 理解题批改
- [x] 写作：话题推荐 + 提示关键词 + 字数统计 + 4 维伪 AI 批改 + 词汇升级建议 + 范文对比

### 游戏化 / 辅助 / 部署
- [x] 金币 · 段位（青铜→王者）· 每日任务 · 连续打卡 · 勋章（13）· 虚拟排行（10 NPC）
- [x] 首页宠物概览 · 错题本 · 个人中心 · 数据导出/导入/重置 · 首访选年级 · 多年级切换
- [x] 单 HTML 入口 + CDN（Tailwind/Lucide）+ .nojekyll + 中文 README + MIT License

---

## ✅ V0.2 — 单词闯关 + 智能强化

### ⭐ 单词闯关系统（核心）
- [x] SVG 贝塞尔蜿蜒地图 + 圆形徽章节点（zigzag 布局）
- [x] 三态节点（已通关⭐ / 当前关呼吸+宠物📍 / 锁定🔒）+ 自动滚到当前关 + resize 重算
- [x] 主题大区（草原/海边/雪山/太空）+ 每 5 关 Boss🐉 + 开场 3-2-1 动画
- [x] 关内 HUD：生命❤️×3 / 连击🔥 / 倍率⚡ / 实时金币
- [x] 即时反馈：金币飞顶 + 连击弹跳 + 音效 + 宠物欢呼 + 暴击 + 连击彩带
- [x] 5 种玩法：闪电选择 / 字母拼拼乐 / 听音辨词 / 快速反应 / Boss 战
- [x] 结算：星星点亮 + 金币滚动 + 宝箱掉落 + 宠物升级；失败安慰不打击
- [x] 长期激励：每日首关×2 / 图鉴收集 / 首通奖励 / Boss 翻倍必掉卡

### 错词智能强化
- [x] recordWordResult 记 wrongCount + consecutiveCorrect，连对 3 次毕业
- [x] 🔥 错词突击入口（显示待强化数）+ 优先级排序 + 毕业奖励特效

### 跟读背诵 + 精准打分
- [x] speech.js alignWords（LCS 词级对齐 + 缩写展开/去标点规范化）
- [x] 综合分 = 完整度×0.7 + 准确度×0.3，逐词高亮（对绿/漏灰/多红）
- [x] 逐句跟读（≥75 过）+ 挖空背诵挑战（20%/50%/全遮）+ 分档奖励

### 其他
- [x] 趣味记忆法：单词卡可选 mnemonic 黄色卡片（1–6 年级注入 47 条，宁缺毋滥）
- [x] 7 新勋章（累计 20）+ 响应式适配（刘海安全区 + ≥44px 触控 + clamp 字号）

---

## 🆕 V0.3 — 视觉升级 + PET 备考模块

### ① 卡通化视觉 + 移动端自适应（缓存 `v0.3.0`，纯样式层）
- [x] clamp() 响应式字号系统（body/title/word/meaning/option/btn/small），正文最小 16px 起
- [x] 手机 ≤640px 放大偏小文字，输入框 ≥16px 防 iOS 缩放；三档断点（手机/平板/桌面限宽 1100px）+ 触控 ≥48px
- [x] 马卡龙点缀色（柠檬黄/粉红/天蓝/葡萄紫，正文深棕 #5A4A42）+ 圆角 26px 卡片 + 胶囊按钮 + 柔和投影
- [x] 圆体字体（PingFang/鸿蒙圆体 + Baloo 2/Fredoka CDN，失败降级）+ 底部导航弹跳高亮 + 进度条发光
- [x] 空状态可爱化（错题本/卡牌/消消乐 浮动 emoji + 鼓励语）+ breathe 微动效（尊重 reduce-motion）
- [x] 自检：git 已备份；18 JS `node --check` 过 / 18 JSON 有效 / style.css 括号平衡；http-server 全 200；业务逻辑零改动

### ② 任务 A — PET (B1) 框架 + 移动端字号
- [x] 新增 `data/pet/{words,reading}/` + 话题清单 `topics.json`（22 话题，前 2 ready 其余 pending）
- [x] 示例词库 `pet-food` / `pet-travel`（各 25 原创 B1 词）；schema 扩展 level / mnemonic / petExam.{frequency,collocations}
- [x] 示例阅读 `pet-reading-1`（3 篇原创，notice/story/email + choice/truefalse 题）
- [x] 级别选择器「🎓 PET 剑桥备考」入口（`grade='PET'`，顶部标签「PET 备考」）
- [x] storage 兼容字符串级别（进度按 `PET:话题id` 键隔离，不影响数字年级）
- [x] PET 单词模块话题卡片（ready 闯关 / pending「敬请期待」）；复用闯关（8 词/关，renderLevelMap 泛化）
- [x] 识词卡展示 mnemonic + petExam 搭配 + 频率标签；阅读复用点词查义/跟读/背诵，归一化支持 truefalse
- [x] 点词查义/错题本并入 PET 话题词；语法/写作在 PET 复用初中内容不白屏；无数据路由优雅兜底
- [x] 移动端字号整体 +3 号 + 长单词换行 + 长文正文 ≥19px/行高 1.85 + 话题网格（2/3/4 列）emoji 图标

### ③ 任务 B — PET 全量词库 + 阅读填充（缓存 `v0.3.3`）
- [x] 20 pending 话题全部填充 `ready`，加样例共 **22 topics / 792 词 / 0 pending**
- [x] 五类记忆法（联想/词根词缀/谐音/拆解/场景）+ petExam.collocations + 2 例句 + 音标
- [x] **15 篇**原创 B1 阅读（reading-1/2/3 = 3+6+6）；题材 notice/email/story/article/advert；choice+truefalse + petSkills
- [x] `index.json` 清单驱动，reading.js 按清单合并多文件（新建文件登记即生效）
- [x] 每话题独立 commit；每 4–5 话题跑质检 + 乱码扫描（防西里尔/损坏字符），发现即改
- [x] 自检：22 词库 + 3 阅读 JSON 全有效；792 条记忆法无过短/废话；17 JS `node --check` 过
- [ ] 后续可选：各话题从 ~34–40 词加密到 150–180 词，冲刺 3500 总量
- [ ] 后续可选：阅读续填至 30–50 篇（新建 pet-reading-N.json 并登记 index.json）

### ④ 修复 — PET 阅读只显示 3 篇（缓存 `v0.3.4`，2026-07-12）
- [x] 病因：SW cache-first 命中早期只列第一组的旧 `index.json` → 仅加载 3 篇
- [x] 修复：PET 阅读改用带版本号 query 的 fetch（`fetchPetReadingJSON`）绕过陈旧缓存，离线回退无 query 地址
- [x] 缓存版本 `v0.3.3 → v0.3.4`；仅改 PET 阅读加载，未动 1–9 年级逻辑
- [x] 验证：node --check 过；http-server 模拟合并加载 = 15 篇（pet-r-001…015）

---

## 🆕 V0.4 — KET 备考中心（缓存 `v0.4.0`，2026-07-16，目标 2027 春季 KET 140+）

### ① 架构：级别选择器 + 两个时钟 + 路由
- [x] 级别选择器重构：1-9 年级不动 + 「🎓 剑桥备考」组（KET / PET），首访欢迎弹窗同步
- [x] storage 备考扩展：examProfile / 计划 / 打卡 / 时长 / 课程 / 模考 / 草稿 / 资源 / 专项，全部默认值兜底
- [x] ★ 两个时钟解耦：Day N 只由完成度驱动（advancePlanDay 唯一途径，无日期运算）；D-XXX 由日历驱动；打卡热力图记真实日期；跳过一天不惩罚、不断签、无「欠账」提示（最终自检含专项静态检查）
- [x] exam-* 动态路由（10 个页面）；KET 下 learn/grammar/reading/writing 自动映射到备考模块；KET/PET 共用剑桥话题词库闯关
- [x] `data/exam/index.json` 级别清单 + 模块开关 + 文件清单

### ② 九大模块（assets/js/modules/exam/，11 个 JS）
- [x] 模块 0 Dashboard：双时钟卡 + 今日六格（点格直达/勾选回填打卡/≥4 格可收工/全勾进 Day+1）+ 进度条 + 九宫格 + 2026-12 起报名提醒 + 首次设置（考试日可改，无起始日期）
- [x] 模块 1 规划：金色捷径卡（KET 140+=B1）+ 红色排除卡（PET 后置）+ 长期弧线 6 阶段时间轴 + 45 天周表 + 六格说明
- [x] 模块 2 知识点：三张卷题型分值配时 / 量表 100-150 对照 / ROI 策略卡 / 14 张原创拼读卡（翻卡式）/ 听力三步法 / 口语话题卡
- [x] 模块 3 语法：乐队比喻总卡 + 八课（比喻讲解+原创例句+练习+验收+家长话术；三态进度）+ 🧵 暗线组件在 L1/L3/L8 各出现 + 8 类中式错误三色分区 + 三级优先级 + 家长四条 + 考纲清单 + Part5 速成形状表 + 满分档事实卡（原创等效示例）+ 40 不规则动词 6 组接入闯关 + 第七天混查
- [x] 模块 4 阅读：Part1-5 专项引擎（形状提示/考点/解析）+ 分级读物（复用 recite.js 跟读/背诵/LCS 打分 + 听全文）+ 听力训练（Web Speech 自动读两遍 + 看原文 + 拼写判分）+ 限时 40 分钟合练
- [x] 模块 5 写作：why 卡 + P6/P7 模板与雷区 + 评分三维（要点转述）+ 8 项自评清单 + 草稿本地保存 + 一键跳 Write & Improve（不自建 AI 批改）+ 口语练习角（Part1 8 问朗读 + Part2 喜好讨论框架）
- [x] 模块 6 模考：60 分钟倒计时自动交卷 + P1-5 自动判分 + P6/P7 写作自评（0-15 档位引导）+ 配套听力可选 + 三项分开记 + 量表粗估（60%≈120 / 85%≈140）+ 模考1 开考前显示「基线不是审判」+ 模考3 自动报考决策（矩阵四档，目标 2027 春）+ 模考4 官方样卷外链
- [x] 模块 7 打卡：六格 checklist + 12 周热力图（真实日期、留白不是红色）+ 词汇 800→3500 进度条 + ★ 健康护栏卡 + 单日超 120 分钟温和劝停 + 无 streak/无攀比
- [x] 模块 8 资源：41 条官方外链（五星必下/答案原文/评分/口语示范/自学方案/考生须知机考/PET 后期/两个免费工具），每条一句导读 + 已访问标记 + URL 指纹全量核对；报名七步 + 会咬人规则表 + 双减合规提示
- [x] 模块 9 报告：三次模考三项趋势（纯 CSS 柱状避开 dpr 坑）+ 弱项诊断一键跳专项 + 错词强化入口 + 词汇增长图 + 本周小结（只鼓励不批评）

### ③ 原创题库（B1-B12 全部完成）
- [x] B1 Part5 开放完形 **8 套×6 空**（原创邮件，答案全小词，形状提示+考点+解析+拼写提醒）
- [x] B2 Part6 **12 题+12 范文**（25-40 词，含 2 篇带不挡意思小错的 Band 5 示例）
- [x] B3 Part7 **10 题+10 范文**（文字描述三图原创场景；范文 35-60 词时态全程一致）
- [x] B10 全真卷 **mock-01/02/03**（7 部分 32 题 / Q1-30 各 1 分 + Q31/32 各 15 分 = 60 / 难度递进 / 每题解析）
- [x] B4 分级读物 **20 篇**（210→500L 递进，60-110 词 + 中译 + 关键词；音乐题材 5 篇）
- [x] B5-B8 阅读专项 Part1-4 各 **5 套**（P3 长文 161-192 词）
- [x] B9 听力 **3 套 75 题**（原创对话/独白脚本，自动读两遍；P2 填空拼写判分含 alt 容错）
- [x] B11 语法练习补至 **每课 16 题**（选择/填空/改错/句型转换 + 验收题；改错句取自 8 类错误）
- [x] B12 PET 镜像：facts（4 卷/量表/153+ 目标）+ KET→PET 跨度卡（8-15 个月依据）+ 语法差异 7 条 + 体验卷 mock-01 + PET 轻量 Dashboard（原词库/阅读入口零改动）

### ④ 基础设施与自检
- [x] sw.js 登记全部 31 个新文件（11 JS + 20 JSON），缓存版本 **v0.3.4 → v0.4.0**
- [x] 最终自检：65 JSON 全效 / 全部 JS `node --check` 过 / 无西里尔与替换符乱码 / 94 个题库 id 全局唯一 / 相对 import 路径全部有效 / 16 端点冒烟全 200（后台起服务测完即停）
- [x] 版权红线：git 零 pdf/zip/mp3 跟踪（本地官方参考资料已 gitignore）；全部练习内容原创；官方资源只外链；评分描述只做要点转述 + 原创示例

## 🔄 V0.5 — KET/PET 双词库扩充（进行中，KET 已完成）

### ① KET 词库（已完成）
- [x] KET 彻底完成：**1416 词 / 1410 唯一 / 20 话题**（含 ket-extra 补遗 150 词），index + sw 已登记
- [x] shared-a2-words.json 清单更新至 1410
- [x] KET 前端联动：pet.js 泛化双源（KET A2 / PET B1）+ 备考中心词汇主线入口 + 错词本/错词突击/点词查义纳入 KET 词 + levels.js KET 守卫

### ② PET 词库扩充（17/22 话题已扩，批 12–28）
- [x] 已扩 17 话题至 ~100–150 词/话题，现 **2143 词**：food 152 / travel 145 / education 142 / work 132 / environment·shopping·technology 112–113 / entertainment 111 / house·health 110 / family 109 / city 106 / clothes·hobbies·animals 105 / weather 102 / sport 94
- [x] 数据质量清理：165 条弱记忆法自动重写 + mnemonic type 归一化 742 条（中文→英文，修复前端标签降级）+ inKet 交叉标记
- [ ] 剩余 5 话题待扩至 ~105：feelings 36 / money 36 / communication 36 / nature 36 / time 34（预计 +340 → ~2480）
- [ ] 新增 6–7 个 B1 话题（abstract-concepts/society/science-tech/arts-culture/media/law-rules 等，各 ~130 词）冲 ~3400，新文件登记 sw.js PRECACHE + topics.json
- [ ] 收尾：sw 缓存版本 +1 → 后台冒烟 → 回归 → 总报告

---

## ✅ V0.6 — KET 语法增强（缓存 `ea-v0.6.0`）

### 数据层（data/exam/ket/grammar-lessons.json）
- [x] 8 课新讲解各 **7 段结构**：本质比喻 / 为什么学 / 规则 / 注意事项 / 红黑榜 / 家长话术 / 🧵 暗线
- [x] 8 课 × 4 环节 × 16 题 = **512 题**（基础选择 / 判断题 / 改错 / 句型转换），每题含解析
- [x] 3 轮质检共修 4 处（L2 题干歧义 / L5 翻译备选答案 / L6 选项表述 / L8 比较方向颠倒）

### 前端（grammar-course.js）
- [x] 新讲解七段式渲染；四环节闯练：洗牌选项 + 判断题 + 改错 + 转换 + 错题重练 + 环节解锁
- [x] sw 缓存版本 v0.4.0 → **ea-v0.6.0**

---

## ✅ V0.7 — 学习时长统计（缓存 `ea-v0.7.0`）

- [x] ① storage 时长 API：recordStudyTime / 按天按模块记录 / 周趋势 / 30 天累计 / 今日分钟，90 天自动清理
- [x] ② 计时器 `study-time.js`：visibilitychange 暂停 + 15s 心跳 + 单次跳变上限 45s（防挂机虚计），路由打点归类 12 大模块，挂入 navigate
- [x] ③ 学习时长页 `study-stats.js`：今日时长 + 120 分钟健康护栏状态 / 模块分布 / 7 天趋势 / 30 天累计 / 统计盲区提示 / 诚实声明（只测在页时长）
- [x] ④ 我的页入口 + checkin 护栏对齐（取实测与六格估算的较大值，劝停口径一致）
- [x] ⑤ sw 登记 study-time.js + study-stats.js，缓存版本 → **ea-v0.7.0**
- [x] 自检：31 JS `node --check` 全过 / 87 JSON 全有效 / 后台冒烟核心端点全 200（测完即停）

---

## ✅ V0.8 — 练习/试卷随机化 + 语法特殊单词表（缓存 `ea-v0.8.0`）

### 目标 1：重做不重样（四层变化叠加，非实时 AI 出题）
- [x] ① 通用工具 `assets/js/utils/shuffle.js`：Fisher-Yates 题序洗牌 / 选项洗牌 answer 同步重算 / `noShuffle` 跳过（依赖选项顺序的题）/ 题池抽样（预留扩容 STAGE_TAKE=16）/ 分层错题加权（上次做错 > 错多对少 > 没做过 > 做对过）；纯函数可 node 测试
- [x] ② storage 题目级统计：`recordQuizAnswer` / `getQuizStats`（内容哈希指纹，选项顺序无关；4000 条上限自动清理）
- [x] ③ 接入范围：KET 语法八课 4 环节（含老课兜底路径）/ 阅读 P1-P5 专项 / 听力 / 模拟卷 mock-01~03（经 runDrillSet/runListeningSet 复用自动生效，7 Part 结构与题数不变）/ 1-9 年级语法 quiz / 阅读乐园做题 / 词汇闯关与错词突击（原有随机保留，shuffle 统一到工具）
- [x] ④ 顺序保护：P4/P5 完形空格按文章顺序编号 → 只洗选项不乱题序；听力题跟录音脚本顺序 → 只洗选项；判断题（真/假）标 noShuffle
- [x] ⑤ 体验：重做入口文案改「🎲 换一批重做（题目会变）」（语法环节/阅读专项/1-9 语法/闯关结算）；错题被优先抽中时轻提示「本次重点安排了你之前做错的题」；同一次作答过程中顺序固定（进场一次性生成展示副本）
- [x] ⑥ 自动测试 `tools/test-shuffle.mjs`：合成题 200 轮 answer 指向文本一致 + noShuffle 保序 + 加权抽样 300 轮验证 + **733 道真实题 ×20 轮全量洗牌验证** 全过

### 目标 2：语法八课「⚡ 特殊单词表」
- [x] 数据：八课全部注入 `specialWords`（**41 组 / 247 词**，注入脚本 `tools/add-special-words.mjs` 幂等可重跑）——L1 be 全形态+人称对应+肯定/否定缩写；L2 do/does/did+缩写+情态动词否定（won't 拼写、mustn't 读音）；L3 三单 +s/-es/-ies/has + **不规则过去式六组 40 词**（接现有 irregular-verbs）；L4 -ing 四规则（直接加/去e/双写/ie→y）；L5 at 点/on 面/in 盒子 + by 交通 + 固定短语；L6 代词五套全表 + a/an 看音不看字母（an hour / a university）；L7 考纲 7 连接词带例句；L8 比较级四规则+不规则 + 不可数名词 + 量词搭配 + 名词复数不规则（man→men 等 9 词）
- [x] 每词含 原形→变化形 + 音标 + 中文，KET 高频 ★ 标注；每组有大白话规则说明（延续乐队比喻）
- [x] 前端：讲解页 ⚡ 入口 + 分组卡片 + 点行朗读（Web Speech）+ 单组「练这组」/ 全部混合一键闯关（复用 levels 闯关系统）+ 窄屏两行式布局不溢出、触控 ≥48px
- [x] 向后兼容：无 specialWords/noShuffle 字段的老数据正常运行不报错

### 收尾
- [x] sw 登记 utils/shuffle.js，缓存版本 → **ea-v0.8.0**
- [x] 自检：全部 JS `node --check` 过 / 全部 JSON 有效 / 洗牌测试全过 / 后台冒烟核心端点全 200（测完即停）
- [x] **V0.8.1 热修**：grammar-course.js 特殊词表「练这组」绑定漏一个右括号 → 线上 `SyntaxError: missing ) after argument list`、语法模块打不开，已修复。教训：`node --check` 对 ESM 检查不完整（本错未拦住），自检升级为 `tools/check-esm.mjs`（vm.SourceTextModule 逐文件 ESM 完整解析 + 全图 link 校验 import 路径与具名导出，不执行副作用），以后 JS 自检一律用它；缓存版本 → **ea-v0.8.1**（坏文件已被 v0.8.0 缓存，必须 bump 才能刷掉）
---

## V0.9 P0：数据层前置改造（为语法大厅 50 课 + 读本 304 篇承载）

本批次**不加任何内容数据**，只改承载结构。

### 单元 1 · sw.js 壳预缓存 + 运行时内容缓存
- [x] 预缓存清单拆成 `SHELL_URLS`（HTML/CSS/JS/图标/manifest，40 项）+ `INDEX_URLS`（8 个 index，含新建的 grammar/reader 索引）
- [x] `data/` 内容文件改走 `CONTENT_CACHE`（`english-adventure-content-ea-v0.9.0`）运行时 cache-first，访问过即离线可读；未缓存且离线时优雅降级 504，不抛异常
- [x] 双缓存分离，`activate` 按 `english-adventure-` 前缀清理旧版本；旧版把内容预缓存在壳里的情况有兼容分支
- [x] 调试入口：`postMessage({type:'CLEAR_CONTENT_CACHE'})` / `CACHE_INFO`，前端封装成控制台的 `__clearContentCache()` / `__cacheInfo()`，**不进正式 UI**
- [x] 缓存版本 `ea-v0.8.1` → **`ea-v0.9.0`**
- **实测预缓存体积：3,313 KB → 450 KB（壳 435 + 索引 15），降 86%**；后续 50 课 + 304 篇入库不会再撑大安装包

### 单元 2 · 数据分片目录与索引规范
- [x] `data/grammar/index.json`（四层 tiers + 空 lessons）、`data/reader/index.json`（四卷 volumes + 空 pieces），只存元信息
- [x] 四份 JSON Schema：`data/grammar/_schema.index.json` / `_schema.lesson.json`（九段讲解 + 记忆卡 SVG + 4×16=64 题 + 6-8 题侦探关）、`data/reader/_schema.index.json` / `_schema.piece.json`
- [x] reader 的 `source` 字段 `minLength:1`，**版权来源强制可追溯**（"original" 或 "adapted: 底本"）
- [x] `data/reader/v1/` 分片目录就位
- [x] 新增 `tools/check-data.mjs`：无第三方依赖的 draft-07 子集校验器 + 「索引登记的 file 是否真的存在」交叉检查（负例测试能准确报出 5 类错误）

### 单元 3 · 懒加载器
- [x] `assets/js/utils/lazy-data.js`：`loadIndex` / `loadGrammarLesson` / `loadReaderPiece` / `loadData`
- [x] 课文件 LRU 上限 8（索引常驻不淘汰）、同路径并发请求合并、失败重试 1 次、骨架屏 `skeletonHTML()` / `isLoading()`
- [x] 适配层：`app.js` 的 `loadJSON` 底座换成 `loadData`，只保留失败 toast，**现有模块调用方式与返回值零改动**（`state.data` 手写缓存已移除）
- [x] 本模块零 import，避免与 app.js 循环依赖

### 单元 4 · 回归与验证（浏览器实跑）
- [x] `tools/check-esm.mjs`：32 个 JS 文件 ESM 解析 + 全图 link + sw.js 经典脚本解析，全过
- [x] `tools/check-data.mjs`：两个索引全过
- [x] **在线 29 个页面全部渲染成功、0 报错**：1-9 年级（三年级 12 页 + 八年级 3 页）/ PET（4 页）/ KET 备考中心九模块（10 页）
- [x] **离线 18 个页面全部可用、0 新增报错**：清空内存缓存 → 服务器切断网 → 三条线复跑，全靠 SW 缓存
- [x] SW 实测：预缓存 48 项、**壳里 0 个内容文件**、内容文件按访问写入内容缓存、清内容缓存不动壳
- [x] 控制台唯一 error 是自检故意探测未来文件 `data/grammar/g01.json`（404 → 返回 null 不抛），符合预期

### 新增自检工具（P1-P7 每次收尾复用）
- `tools/smoke/verify-server.mjs`：本地静态服务器 + **一键断网开关**（`/__offline`、`/__online`）+ 结果回传落盘（`/__result`）
- `tools/smoke/smoke.html`：三条线路由全量回归（在线 + 离线两轮）
- `tools/smoke/sw-check.html`：Service Worker 缓存行为与离线降级验证
- 跑法：`node tools/smoke/verify-server.mjs <结果文件> 8100` 后台起，再
  `chrome --headless=new --user-data-dir=%TEMP%\eap http://127.0.0.1:8100/_smoke.html`
- ⚠️ **坑（踩过一次，别再踩）**：Chrome 的 `--user-data-dir` 必须用**短路径**。放在很深的临时目录下，CacheStorage 目录会超 MAX_PATH，症状是 `caches.put` 抛 `Entry already exists` / `Unexpected internal error`，看着像 sw.js 的 bug，其实是路径长度。
- ⚠️ 本机 Chrome 扩展未连接，浏览器验证走的是无头 Chrome + 结果回传，不是 DevTools 手点

---

## V0.9 P0.5：考试日期配置化 + 三时钟

### 配置源
- [x] 新建 `data/exam/exam-config.json`：`examDate` / `regOpenDate` / `regCloseDate` / `targetScore` / `editable` + 三段文案（`examDateNote` / `regOpenNote` / `registerTip`）
- [x] 默认值：考试日 **2026-12-13**（占位，实际以考点答复为准）、报名开放 2026-09-13、报名截止 2026-10-13、目标分 140、可编辑
- [x] 合并顺序：JSON 默认值 ⊕ `localStorage.ea_examConfig` 用户覆盖；升级迁移——老用户存在 `examProfile.examDate` 里的目标日会被接管，不会被默认值顶掉
- [x] `exam-hub.js` 里的「2027 春季 140+」硬编码全部清除；`app.js` 年级选择器那行也改成读配置，避免和备考中心对不上

### 三时钟（`exam-common.js` 的 `examClocks()`）
- [x] ① 报名开放倒计时：未开放时显示，配文案「北京考位常年秒空，开放即占位」，黄色
- [x] ② 报名截止倒计时：开放后显示，红色高优先级
- [x] ③ 考试日倒计时：一直显示
- [x] 报名两个节点过期后自动消失，只留考试日；实测三种时点 `[regOpen,exam]` / `[regClose,exam]` / `[exam]` 全部正确
- [x] 报名时钟整条可点 → 跳「资源」页报名七步（替代原来写死 2026-12 才出现的提醒卡）
- [x] **Day N 完成度时钟不受影响**：45 天计划仍与日历完全解耦，学了就前进没学就原地等

### 考试信息面板
- [x] 点时钟卡下方「考试日 … · 目标 …+（可改）」打开，四个字段可改，存 localStorage，保存后三时钟即时刷新
- [x] 目标分限幅 0-160；`editable: false` 时该行降级为纯文本不可点
- [x] 面板底部静态提示（不做倒计时压迫感）：「报名走考点，不能自己上官网报。cambridgeenglish.cn → Find a centre」

### 健康护栏
- [x] 三个时钟只报事实（标签 + 日期 + D-x），没有「还剩 X 天你却只学了 Y 小时」这类评价文案

### 收尾
- [x] `sw.js` 登记 `exam-config.json`（进索引层预缓存，每次开备考中心都要读），版本 → **ea-v0.9.05**；实测壳预缓存 48 → 49 项
- [x] 回归：在线 32 页 / 离线 18 页全过、0 报错；KET 备考中心九模块全部正常（自检里把 `started` 置真，这次走的是完整 Dashboard 而不是首次设置页）
- [x] 窄屏版式：新增 `tools/smoke/shot.html`（`/_shot.html?page=&w=`）实测元素右边界，模拟 360 / 320 宽均无溢出
- ⚠️ 顺手修掉一个自己引入的版式回归：编辑按钮文案变长后会把右侧 Day N 挤出屏幕 → 改成独占一行，两列时钟恢复原样
- ⚠️ 无头 Chrome 窗口有最小宽度（viewport 卡在 ~492px），截图会被裁切看着像溢出，**别用截图判断窄屏**，用 `?w=` 实测

> P0.5 遗留的那批「仍写着 2027」的地方，已在 P0.6 全部清除。

---

## V0.9 P0.6：消灭硬编码考季

原则：**考试季不是独立事实，是 examDate 的派生结果**。全项目只允许 `data/exam/exam-config.json` 一个数据源。

### 新增派生层
- [x] `data/exam/exam-config.json` 补 `nextExamDate: "2027-03-14"`（占位，待考点确认）+ `nextExamLabel: ""`（留空则自动生成）
- [x] 新建 `assets/js/utils/exam-season.js`（叶子模块，零 import，避免与 storage.js/app.js 循环依赖）：
  `seasonOf(月)` / `seasonLabel(日期)` / `getCurrentSeason()` / `getNextSeason()` / `fillSeason(文案)` / `setSeasonConfig()`
- [x] 归季规则：12-2 月→冬季 / 3-5 月→春季 / 6-8 月→夏季 / 9-11 月→秋季；输出 `2026年12月（冬季）`
- [x] 配置由 `exam-common.js` 的 `loadExamConfig()` 与 `saveExamConfig()` 推给它——改了考试日，全站考季文案立刻跟着变
- [x] 兜底：配置未就位时退化为「本考季」「下一考季」，文案照样通顺

### 数据文件：季名一律写占位符
- [x] 约定：JSON 里要提考季，写 `{本考季}` / `{下一考季}`，渲染前过一道 `fillSeason()`
- [x] 已改：`mocks/index.json`（决策矩阵标题 + 4 行 action + mock-03 preNote）、`plan-45day.json`（2 处）、`plan-longterm.json`（考试期 trigger、考后 trigger、报名期 milestone、PET 说明）、`resources.json`（报名节奏）、`pet/facts.json`
- [x] **删除** `data/exam/index.json` 的 `targetSeason`（KET/PET 各一处）；连带删掉同样是重复数据源的 `defaultExamDate`

### 决策矩阵 4 条文案（相对表述 + 运行时填充）
- [x] `<110` →「暂不报{本考季}，目标{下一考季}」
- [x] `110-119` →「报{本考季}，争 120+」
- [x] `120-133` →「报{本考季}，冲 B（133+）」
- [x] `≥134` →「报{本考季}并冲 A（140+）→ 认定 B1」
- [x] `storage.js` 的 `getExamDecision()` 直接返回填好的文案（内部调 `fillSeason`），消费方无需记得填

### 渲染点接线
- [x] `mock-exam.js`（决策卡标题、矩阵标题/行、三处 preNote）、`plan.js`（trigger/milestone）、`resources.js`（报名节奏）、`exam-hub.js` 与 `checkin.js`（今日任务 slot detail）
- [x] 四个模块补 `await loadExamConfig()`，保证 fillSeason 有数据
- [x] `checkin.js` 鼓励文案去年份、无倒计时无数量压迫：「这是一场要打很久的仗——一年后还愿意学的孩子，比这个月被榨干的孩子走得远得多。」
- [x] `exam-hub.js` PET 卡「排在 KET 拿证之后」（去掉「2027 下半年起」）

### grep 校验（`assets/js` + `data`，排除日期字段值与 version）
命令：`grep -rn "20[2-3][0-9]" assets/js data --include=*.js --include=*.json | grep -vE '"(examDate|regOpenDate|regCloseDate|nextExamDate|updated|date)"\s*:' | grep -v '"version"'`

**表示考季的字面量：0 处。** 剩余命中全部为合法非考季内容：

| 位置 | 内容 | 判定 |
|---|---|---|
| `utils/exam-season.js` 4/42 行 | 注释与 docstring 里的示例 | 说明文字，保留 |
| `exam-config.json` `$comment` | 规则说明 | 说明文字，保留 |
| `grammar-lessons.json` 2275/4607/4769/5588/5590 | `in 2020` / `in 2027` / `in 2026` | 介词教学例句，与考季无关 |
| `resources.json` 12/77/78 | 官方 PDF 文件名里的版本年（2020 / 2025.08） | 外链资源版本号 |
| `resources.json` 106/128 | 2025 年官网关闭个人报名通道、2026 年 7 月暑期培训政策 | 外部事实，有确切年份才准确 |

### 收尾
- [x] `sw.js` 登记 `utils/exam-season.js`，版本 → **ea-v0.9.06**；实测壳预缓存 49 → 50 项
- [x] 回归：在线 32 页 / 离线 18 页全过、0 报错；KET 备考中心九模块正常
- [x] **年级选择器回归**（自检点开 `#gradeBtn` 验模态框）：九个年级 + KET + PET 齐全，KET 行显示配置里的考试日与目标分，无硬编码考季
- [x] 考季派生自检：归季 `冬季/春季/夏季/秋季/冬季`、`2026年12月（冬季）` / `2027年3月（春季）`、占位符替换正确；把考试日改成 2027-06-12 后决策文案自动变成「报2027年6月（夏季）…」

---

## V0.9 P0.7：中文编码守卫

背景：P1-P7 将生成约 10 万字中文内容；PowerShell 管道会把 UTF-8 按系统码页（GBK）静默转坏，
**乱码后仍是合法字符串、能通过 Schema 校验**，必须专门检测。

- [x] `tools/check-data.mjs` 增加编码守卫，对 `data/` 下**全部 .json** 扫描（本次实测 94 个）：
  - a) UTF-8 无 BOM（开头 EF BB BF → 报错）
  - b) 替换字符 U+FFFD → 报错并输出文件名+行号
  - c) mojibake 指纹（Ã/Â 连串、ä¸/æ˜ 类三字节拆读、ï¼/ï»¿ 全角标点、璇硶/閿欒 类 GBK 误读）→ 报错+行号
  - d) CJK 占比 <5% 告警——**收窄到 `data/grammar/` 与 `data/reader/` 的讲解类文件**（词表/题库英文本来占大头，实测 2-5%，全局开会有 19 条误报把真问题淹掉）
- [x] 验证：故意写坏的 5 个样本（BOM / U+FFFD / GBK 指纹 / Latin-1 拆读 / 低 CJK）全部拦截，exit=1；样本已删除；干净跑 94 文件 0 错 0 警
- [x] 写入约定：内容文件一律 `fs.writeFileSync(path, str, 'utf8')`，读验证用 node，不经 PowerShell 管道
- [x] 新增 `tools/smoke/preflight.mjs` 收尾统一入口：check-esm + check-data（含编码守卫）+ **sw.js 登记核对**（assets/js 下每个 .js 必须在 SHELL_URLS 里，漏登记直接报错）。P1-P7 每批收尾先跑它，再跑浏览器两件套

---

## V0.9 P1a：语法大厅框架 + G01 样课（缓存 `ea-v0.9.07`，2026-07-30，⏸ 等家长验收）

> 本批次**故意只做一课**：G01-G12 的比喻语感与家长话术要先定调，后面 38 课都跟着走。
> 家长看过 G01 满意后再放开 P1b 批量生产，**不要一路跑到 G12**。

### 单元 1 · 模块框架（assets/js/modules/grammar-hall/）
- [x] `hall.js`：四层分层视图（基石/骨架/进阶/精修，按 index.json tiers 渲染，分层色条），每课卡片 = 课号 + 标题 + 比喻一句话 + KET 相关度星级(0-3★) + 完成状态（✅已掌握/📖学习中/⬜未学）；未开放课显示「🔒 待开放」占位
- [x] `lesson.js`：九段讲解渲染 + 记忆卡 SVG + 四环节闯练（16 题/环节，70% 通过解锁下一环节，接 utils/shuffle.js 题池抽样/错题加权/选项洗牌 answer 同步）+ 侦探关（找病句改正：自动比对 + 改法不同时亮参考答案由学生自评病灶）
- [x] 接入：学习中心「🏛️ 语法大厅」入口 + `grammar-hall` 动态路由；study-time 独立模块归类（🏛️ 语法大厅）；**120 分钟温和劝停卡**在大厅/课内页/环节页生效（只提醒不锁功能）
- [x] 进度存储 level=`'HALL'`，与 KET 八课同 API 不同档，互不干扰；KET 八课未动一个字（双向跳转留给 P2）
- [x] sw.js SHELL_URLS 登记 2 个新 JS（壳预缓存 50 → 52 项）

### 单元 2 · G01 名词：可数与不可数（data/grammar/g01.json，status: done）
- [x] 九段全齐：①本质 29 字 ②为什么 229 字（中文量词系统 vs 英语名词自己报数）③乐团故事 296 字（乐务老师清点行李：乐器数得清，空气/勇气/汗水数不清，借瓶子才能数）④规则卡 5 张 + 例句梯 基础5/进阶5/易错6（易错档带坑点注释）⑤红黑榜 12 组（🔴挡意思 2 / 🟡KET 考 8 / ⚪不考 2）⑥中英差异 5 行 ⑦5 秒判断法（「能一个一个摆出来的进乐器队」+5 步）⑧家长话术（乐器队/空气队互考游戏 + 3 问）⑨暗线回响（news 的化石 s + 古英语词尾磨损，呼应「越常用越不规则」）
- [x] 记忆卡：纯 SVG 单图（自带底色，深浅色场景都清晰；viewBox 自适应可截图）
- [x] 练习 4 环节 × 16 = 64 题（认一认分队 → 选一选形式 → 改一改 many/much → 用一用语境陷阱），难度 1-4 递进，全原创
- [x] 侦探关 8 个病句（每题配「病在哪」一句话）
- [x] index.json 登记：KET 相关度 ★★★，映射八课 L8

### 单元 3 · 自检（全过）
- [x] preflight：35 个 JS ESM 解析+链接 / Schema+编码守卫 95 个 JSON / sw 登记核对
- [x] 题目抽查：64 题 + 侦探 8 句题干无重复；64 题 × 200 轮选项洗牌 answer 全部同步；解析/难度/选项查重全过
- [x] 浏览器实跑：**在线 34 页 / 离线 20 页全过 0 报错**（大厅与 G01 课内页在线、离线各验一遍）；闯练引擎 DOM 实跑（四环节列表 → 环节1 答满 16 题 → 结果页；侦探关提交 + 自评兜底）；三时钟/考季派生/年级选择器回归全绿
- [x] 窄屏 `shot.html` 实测：大厅 360 / G01 360 与 320 / 学习中心 360 均无元素溢出
- [x] sw 版本 → **ea-v0.9.07**
- [x] 顺手修掉 4 个自检基建自身的坑（都不是业务代码问题）：
  1. smoke.html 的 `iso()` 用 `toISOString()`（UTC）造日期，东八区早上 8 点前 `daysToExam` 必差一天 → 改本地日期拼串
  2. sw-check.html 硬编码 `v0.9.06` 缓存名，版本一 bump 全部探空 → 改为运行时发现（内容缓存是懒创建的，由壳缓存名推导）
  3. `/__offline` `/__online` 断网开关会被 sw.js 同源运行时缓存拦下（**复用 Chrome profile 时断网形同虚设**，测试假绿）→ 开关请求加随机参数
  4. shot.html 支持 `?page=grammar-hall&lesson=G01` 截课内页

### 📌 P1b 续跑说明（家长验收 G01 后再开工）
- 范围：G02-G12 共 11 课。**比喻锚点表在用户的《V0.9-V1.0 扩容方案》总纲里（方案文件在用户手上，开工时请用户贴当批锚点，不要自创比喻）**
- 做法完全照 G01：每课写 `data/grammar/gXX.json`（九段 + SVG 记忆卡 + 4×16=64 题 + 侦探关 6-8）→ index.json 追加登记（status: done）→ 一课一 commit
- 内容 JSON **不登记** sw.js（走运行时内容缓存）；只有新增 JS 模块才进 SHELL_URLS
- 每课收尾：`node tools/smoke/preflight.mjs` + 题干查重/洗牌 200 轮抽查（脚本见 P1a-2 提交信息）+ smoke/shot 浏览器两件套（跑法见环境坑清单）
- G01-G12 全齐后 sw → ea-v0.9.1，基石层整体交付

---

## V0.9 P1b：基石层 G02-G12（缓存 `ea-v0.9.1`，2026-07-30，✅ 基石层 12 课完成）

### 内容（11 课，一课一 commit，规格与 G01 完全一致）
- [x] 比喻锚点严格按总纲：G02 冠词（a 前世 one / the 前世 that）· G03 代词（谁在台上、谁的乐器）· G04 be（英语的等号）· G05 There be（报幕）· G06 一般现在+三单（每周固定的排练）· G07 进行时（此刻正在演奏）· G08 祈使句（指挥的口令）· G09 数词（第几声部、第几小节）· G10 形副（音色 vs 演奏方式）· G11 介词（点/面/盒子）· G12 助动词 do（起拍手势）
- [x] **五课与八课共用比喻，写前读 L 课原文逐字对齐**：G02/G03↔L6、G04↔L1、G11↔L5、G12↔L2（八课内容零改动）
- [x] 每课：九段 + SVG 记忆卡 + 4 环节×16=64 题 + 侦探关 7 病句；红黑榜 12 组统一三色配比（🔴2 / 🟡8 / ⚪2）
- [x] KET 星级与八课映射写入 index.json：G02★★ G03★★ G04★★ G05★ G06★ G07★ G08★ G09★ G10★ G11★★ G12★★★
- [x] 暗线「越常用的词，越不规则」按要求三处主打：G04（be 三词根缝合 es-/wes-/bheu-）、G09（first 是 fore 最高级、second 拉丁外援，与 one/two 不同源）、G10（good/better/best 异源 bat- 词根）；G03/G06/G12 词源侧面呼应（代词变格幸存、三单 -s 幸存、be/情态守住搬家特权）

### 自检（全过）
- [x] 新工具 `tools/check-lesson.mjs`：课内+跨课题干查重 / 选项洗牌 200 轮 answer 同步 / explain·level·选项抽查（P2-P4 每课复用）
- [x] preflight 全过；14 文件 Schema + 106 文件编码守卫全过
- [x] 12 课 768 题 + 85 侦探句：**全局题干无重复（853 个）**；每题 ×200 轮洗牌 answer 全同步
- [x] 浏览器实跑（全新 profile，`serverReallyDown=true` 真断网）：**在线 35 页 / 离线 20 页 0 报错**；闯练引擎 DOM 实跑通过；SW 升级路径实测（v0.9.07 旧缓存被 activate 正确清理，只剩 v0.9.1 双缓存）
- [x] 窄屏实测：大厅 12 课列表 360 / G12 课内页 360 / G04 课内页 320 均无溢出
- [x] smoke.html 更新：加 G12 课内页覆盖；懒加载 404 探针 g02 → g13（P2 写到 G13 后改成 G27）
- [x] sw 版本 → **ea-v0.9.1**（壳 52 项不变——本批只加数据不加 JS，内容走运行时缓存）

## V0.9 P2a：骨架层 G13 样课（缓存 `ea-v0.9.15`，2026-07-30，⏸ 等家长验收）

> 本批次**故意只做一课**：G13（40 不规则动词，信息量最大）是骨架层标杆课，
> 家长验收通过后再放开 G14-G26 其余 13 课，**不要一路跑下去**。

### 单元 1 · 模块适配
- [x] 核查 hall.js / lesson.js：四层视图按 index.json tiers 数据驱动渲染，骨架层无需改任何 JS
- [x] smoke.html 懒加载 404 探针 g13 → g27（G13 已有真内容）；在线/离线各加 G13 课内页覆盖 + g13Loaded 结构探针

### 单元 2 · G13 一般过去时与 40 个不规则动词（data/grammar/g13.json，status: done）
- [x] 比喻与八课 L3 字面一致：「中文动词是没日期的照片，英文动词自带日期戳」（L3 原文逐字对齐，L3 零改动）
- [x] 40 不规则动词沿用六组分形状记法（🪨完全不变 / 🔄i→a / 🎣-ought / ✂️尾巴变t / 🌬️-ew / 🤠独行侠），与 data/exam/ket/irregular-verbs.json 同源，不按字母表排
- [x] 九段全齐：乐团故事「-ed 公章 vs 四十位老团员的私章」；红黑榜 12 组（🔴2 / 🟡8 / ⚪2）；「了」≠过去戳写进中英差异；did 时间戳只盖一次（联动 G12）
- [x] 暗线主打：40 个最常用动词恰好最不规则 + went 借自 wend 不还（与 L3 hiddenLineNote 同口径）
- [x] 记忆卡 SVG 换骨架层蓝（#38BDF8）；4 环节×16=64 题 + 侦探关 7 病句
- [x] index.json 登记：KET 相关度 ★★★，映射 L3；version → 0.9.15

### 单元 3 · 自检（全过）
- [x] check-lesson 全量 13 课：924 个题干全局无重复；G13 64 题 ×200 轮洗牌 answer 全同步
- [x] preflight：35 JS ESM / Schema + 编码守卫 107 文件 / sw 登记核对 全过
- [x] 浏览器实跑（全新 profile，serverReallyDown=true 真断网）：在线 36 页 / 离线 21 页（G13 课内页在线离线各一遍）
- [x] 窄屏 shot.html：G13 课内页 360 / 320 无溢出
- [x] sw 版本 → **ea-v0.9.15**

### 📌 P2 续跑说明（已完成，见下节 P2a 续批）
- 范围：**骨架层 G13-G26（14 课）+ KET 八课双向跳转**（大厅课内页按 ketLessonMap 链到八课、八课列表页链回大厅；八课内容仍一字不动，只加入口）
- **G13-G26 比喻锚点表在用户总纲里，开工时请用户贴出来，不要自创**；如有与八课共用的比喻，先读八课原文对齐再写
- 做法照 P1b：一课一 commit；`node tools/check-lesson.mjs data/grammar/g*.json` 全量跑（防跨课重复题干）；每课过 check-data
- smoke.html 的 404 探针改 G27；收尾 sw → ea-v0.9.2；回归三条线 + 窄屏

## V0.9 P2a 续批：骨架层 G14-G26（缓存 `ea-v0.9.2`，2026-07-31，✅ 骨架层 14 课完成，⏸ 等家长验收）

### 内容（13 课，一课一 commit，规格与 G13 完全一致：九段 + SVG 记忆卡 + 4×16=64 题 + 侦探关 7 病句）
- [x] 比喻锚点严格按用户所贴锚点表：G14 过去进行时（昨晚八点，我们正在演）· G15 叙事时态一致（别在半路转调）· G16 will/be going to（已排好的曲目单 vs 临时起意）· G17 情态动词一（力度记号 f/p/mf）· G18 比较级最高级（beautifuler 念不出来→语言是懒的）· G19 量词与不可数搭配（中文认为万物不可数）· G20 连词七个（连奏线）· G21 五种基本句型（五种编制：独奏/二重奏/三重奏）· G22 句子成分识别（谁是主奏、谁是伴奏、谁是装饰）· G23 感叹句（全体强奏）· G24 反义疑问句（返场时确认一句「对吧？」）· G25 主谓一致（声部对齐，不能一个人抢拍）· G26 现在完成时（延音线）
- [x] **五课与八课共用比喻，写前读 L 课原文逐字对齐**：G14/G15↔L4（两件套 be+-ing / G大调转降E / 圈动词自查法）、G18/G19↔L8（beautifuler 念不出来 / 万物不可数借杯子袋子）、G20↔L7（连奏线 / 考纲 7 连词）；八课内容零改动
- [x] **G26 严守 KET 考纲边界**：只讲 just/yet/already/never/ever/for/since 七搭配；been vs gone、过去完成时全部不碰，末尾一句「留在进阶层 G27」带过；全课题目避开 been/gone
- [x] G18 内容边界落实：good/better/best、bad/worse/worst 恰是最高频词——「越常用越不规则」暗线主打落点（与 L8 hiddenLineNote 同口径）
- [x] KET 星级写入 index.json：G14★ G15★★★ G16★★ G17★★ G18★★ G19★★ G20★★★ G21★★ G22★ G23★ G24★ G25★★ G26★★；映射：G14/G15→L4，G17/G24→L2，G18/G19→L8，G20→L7，G21→L1，G25→L1+L3
- [x] 暗线「越常用的词，越不规则」本层主打两次正面出场（G18 换脸四大家 / G25 be 五副面孔）+ 多处侧写（G14 was/were、G16 will/gonna 语法化、G17 preterite-present、G20 because 熔合与 &、G24 innit、G26 have 语法化）；词源只用语言学通行结论

### 自检（全过）
- [x] check-lesson 全量 26 课：**1847 个题干全局无重复**；13 新课 832 题 ×200 轮选项洗牌 answer 全同步；解析/难度/选项查重全过
- [x] preflight：35 JS ESM 解析+链接 / Schema + 编码守卫 120 文件 / sw 登记核对 全过
- [x] 浏览器实跑（全新短路径 profile，`serverReallyDown=true` 真断网确认不假绿）：**在线 36 页 / 离线 22 页 0 报错**（G26 课内页在线离线各一遍 + g26Loaded 结构探针）；闯练引擎 DOM 实跑（环节1 答满 16 题 + 侦探关提交）全过；三时钟/考季派生/年级选择器回归全绿；唯一 console error 是预期的 g27.json 404 探针
- [x] sw-check：壳/内容双缓存均为 ea-v0.9.2；内容文件 0 个进壳；清内容缓存不动壳
- [x] 窄屏 shot.html 实测：大厅 26 课列表 360 / G26 课内页 360 与 320 / G20 课内页 360 均无元素溢出
- [x] smoke.html 更新：加 G26 在线/离线课内页覆盖 + g26Loaded 探针（404 探针维持 G27，P3 写到 G27 后改 G43）
- [x] sw 版本 → **ea-v0.9.2**；index.json version → 0.9.2（本批只加数据不加 JS，内容走运行时缓存，壳不变）

### 📌 P2b 续跑说明（已完成，见下节）
- 范围：**KET 八课双向跳转**——大厅课内页按 ketLessonMap 显示「八课里的亲戚」入口（跳 exam-grammar 对应 L 课）；八课列表页/课内页加「语法大厅详解」回链（按 index.json 反查 ketLessonMap）。**八课内容一字不动，只加入口**
- 涉及 JS：grammar-hall/lesson.js（去程）+ exam/grammar-course.js（回程）——改了线上 JS 必须 bump sw 版本（→ ea-v0.9.25 或按当时序号）
- 双向跳转做完回归：三条线 + 大厅↔八课往返实点 + 窄屏；CHECKLIST 补 P3（进阶层 G27-G42）续跑说明
- P3 进阶层 G27-G42 比喻锚点表在用户总纲里，开工时请用户贴出，不要自创

## V0.9 P2b：KET 八课 ⇄ 语法大厅 双向跳转（缓存 `ea-v0.9.25`，2026-07-31，✅ 完成，⏸ 等家长验收跳转体验）

> 本批**零内容创作**，只做两个模块之间的入口。**八课内容一个字不动**是最高约束。

### 映射表（家长核定，唯一事实源 `assets/js/utils/ket-hall-map.js`）
- L1→G04+G05 · L2→G12+G24 · L3→G06+G13 · L4→G07+G14+G15 · L5→G11 · L6→G02+G03 · L7→G20 · L8→G18+G19+G01
- 回程由去程**反推**（`HALL_TO_KET`），不手写第二张表，两个方向永不打架
- **`ketLessonMap` 的唯一事实源就是这个模块**；`data/grammar/index.json` 里每课的 `ketLessonMap` 只是给读索引的功能用的副本，改了模块必须同步索引（无映射写 `null`），**preflight 第 ④ 项会逐课核对，不一致直接报错**（同「版本号单一来源」那条教训）

### 单元 1 · 八课 → 大厅「深挖」方向
- [x] 八课每课讲解页**底部追加**卡片「🏛️ 想更深入？」，内含「语法大厅 GXX：课名（+ 比喻一句话）」按钮，一课对多课的全部列出
- [x] 课名/比喻取自 `data/grammar/index.json`（随壳预缓存，离线也在），只链 `status: done` 的课
- [x] 跳转带 `fromKet`，大厅课内页顶部显示「‹ 返回 KET 备考中心 LX」，返回路径不断
- [x] **只在渲染层追加 UI，不读也不改八课任何讲解字段**

### 单元 2 · 大厅 → 八课「考不考」方向
- [x] 有映射的 16 课（G01-G07 / G11-G15 / G18-G20 / G24）顶部挂「🎯 KET 考点 · 对应备考中心 LX」标签，点击跳回八课
- [x] 无映射的 10 课（G08/G09/G10/G16/G17/G21/G22/G23/G25/G26）不挂标签，保留原有「KET 相关度 ★★」星级一行（读 index.json）
- [x] 从八课跳来的那一课不重复挂同一标签；PET 级别不挂（那边没有八课数据）

### 单元 3 · 自检（全过）
- [x] ★ **八课零改动证明**：新工具 `tools/check-ket-lessons-untouched.mjs` 与开工前备份 `tools/backup/ket-lessons-before-p2b/` 逐字段深比对——grammar-lessons.json **5154 个文本字段 / 94444 字 100% 一致**，errors/inventory 同样一致，三个文件字节级 sha256 也一致；git 层 `git diff 1d07b8a..HEAD -- data/` 为空（本批根本没碰 data/）
- [x] preflight 全过：36 JS ESM 解析+链接 / Schema + 编码守卫 120 文件 / sw 登记核对（新模块已进 SHELL_URLS）
- [x] 浏览器实跑：**在线 36 页 / 离线 25 页 0 报错**，唯一 console error 是预期的 g27.json 404 探针
- [x] smoke.html 加 P2b 探针：八课 8 课的深挖目标**逐课比对映射表全对**；往返实点 L4→G07→返回 L4、G13→标签→L3→再跳回 G13 全通；G17/G26 确认不挂标签且星级仍在；离线三项（深挖按钮 / 返回入口 / 回链标签）全在
- [x] sw-check（全新 profile）：只剩 `ea-v0.9.25` 一套缓存，壳 53 项含新模块 `ket-hall-map.js`，内容文件 0 个进壳，未缓存内容离线 504 优雅降级，`serverReallyDown=true` 确认不假绿
- [x] 窄屏 shot.html（新增 `&fromKet=` 参数）：八课 L4/L8 的 360 与 320、大厅 G07（带返回入口）/G13 的 360、G15 的 320 —— 全部 0 元素溢出
- [x] 回归三条线：1-9 年级 11 页 + PET 4 页 + KET 备考中心 10 页全绿；闯练引擎 DOM 实跑（16 题 + 侦探关）仍通过
- [x] sw 版本 → **ea-v0.9.25**（改了 grammar-course.js / hall.js / lesson.js 三个线上 JS + 新增 1 个模块，必须 bump）

### 补丁 · ketLessonMap 对齐唯一事实源（缓存 `ea-v0.9.26`，2026-07-31）
- [x] `data/grammar/index.json` 删掉与映射表冲突的 4 处：G10→L8 / G17→L2 / G21→L1 / G25→L1+L3 一律改 `null`（这 4 课在家长核定表里本就没有八课对应），其余与 `ket-hall-map.js` 完全一致；index `version` → 0.9.26
- [x] preflight 加第 ④ 项防回归：以 `assets/js/utils/ket-hall-map.js` 为准逐课核对 index.json 的 `ketLessonMap`，并反查映射表里的课号在索引里都存在；不一致直接 exit 1（本仓库无 package.json，.js 会被当 CJS，所以用 data: URL 以 ESM 方式读那个零 import 的纯常量模块）
- [x] 防回归有效性实测：把 G10 改回 `["L8"]` → preflight 报「G10: index.json L8 ≠ ket-hall-map.js (无)」并未通过；还原后复跑全绿
- [x] G24 挂 L2 标签保持不动（反义疑问属疑问句体系）
- [x] 浏览器实跑复验：在线 36 页 / 离线 25 页 0 报错，P2b 双向跳转全部探针仍全绿，无 404（除预期的 g27 探针）；sw → **ea-v0.9.26**

### 📌 P3 续跑说明（家长验收跳转体验后再开工）
- 范围：**进阶层 G27-G42 共 16 课**，规格与骨架层完全一致：九段 + SVG 记忆卡（进阶层换色）+ 4 环节×16=64 题 + 侦探关 7 病句
- **比喻锚点表在用户的《V0.9-V1.0 扩容方案》总纲里，开工时请用户贴出当批锚点，不要自创比喻**
- 与八课共用比喻的课，写前先读 L 课原文逐字对齐；**八课仍然一个字不动**（每批开工前照 P2b 做备份，收尾跑 `node tools/check-ket-lessons-untouched.mjs`）
- 做法照 P2a：一课一 commit；`node tools/check-lesson.mjs data/grammar/g*.json` 全量跑（防跨课重复题干，现已 1847 题干基数）；每课过 preflight
- 新课若与八课有考点对应关系，**只需在 `assets/js/utils/ket-hall-map.js` 加一行**，两个方向的跳转自动生效（回程是反推的）；忘了加不会报错，只是没有跳转入口
- 内容 JSON **不登记** sw.js（走运行时内容缓存）；本批只加数据不加 JS 的话壳不变，但仍要 bump 版本号发新内容
- smoke.html：404 探针维持 G27，**写到 G27 后改成 G43**；加进阶层首尾课的在线/离线覆盖 + 结构探针
- 收尾 sw → ea-v0.9.3 或按当时序号（**全局单调递增，见环境坑 9**）；回归三条线 + 大厅↔八课往返 + 窄屏

## V0.9 P3：进阶层 G29 样课（缓存 `ea-v0.9.30`，2026-08-05，⏸ 等家长验收）

> 本批次**故意只做一课**：G29 被动语态是进阶层第一个「大件」，「聚光灯换人」比喻能否扛住
> 初中语法难度，家长先看过再放开其余 15 课（G27/G28/G30-G42），**不要一路跑下去**。

### 单元 1 · G29 被动语态（各时态与情态动词）（data/grammar/g29.json，status: done）
- [x] 比喻锚点按用户所贴：「聚光灯换人：不管谁在弹，琴被弹响了」；记忆卡换进阶层绿（#34D399）
- [x] 进阶层内容边界落实：ketRelevance 1、ketLessonMap null（ket-hall-map.js 不加行）；ketNote 据实写「KET 不直接考被动，为初中/PET 打底，学到就是赚到」，不制造焦虑
- [x] 九段全齐：两件套 be+过去分词 / be 管报时分词冻结（五时态+情态）/ by 可留可省 / happen 类无被动；中英差异含意念被动（票卖完了）与「被」的倒霉味 vs 英语中性
- [x] 暗线转向「英语的规律性」：一人报时（be）、其余冻结（分词）的分工规律 + 预告 G30-G32 非谓语同一条规律；状态牌 done/made/taken/written 又落回 G13 那批最常用最不规则的老团员
- [x] 4 环节×16=64 题（认一认聚光灯→选一选 be 报时→改一改换灯纠错→用一用混合时态/一句两盏灯）+ 侦探关 7 病句（was wrote / was happened / was steal / must be wash / is building / was+复数 / were ate，全是初中易错）
- [x] index.json 登记 G29（version → 0.9.30）；smoke.html 加 G29 在线/离线覆盖 + g29Loaded 探针（404 探针维持 G27，批量写到 G27 后改 G43）

### 单元 2 · 自检（全过）
- [x] 八课零改动：开工前备份 `tools/backup/ket-lessons-before-p3-g29/`，check-ket-lessons-untouched 逐字段 100% 一致（5154 字段/94444 字 + sha256）
- [x] check-lesson 全量 27 课：**1918 个题干全局无重复**（唯一一处与 G26 撞题已改）；G29 64 题×200 轮洗牌 answer 全同步
- [x] preflight 四项全过：36 JS ESM / Schema+编码守卫 121 文件 / sw 登记核对 / ketLessonMap 逐课一致（27 课）
- [x] 浏览器实跑（全新短路径 profile，`serverReallyDown=true` 真断网确认不假绿）：**在线 37 页 / 离线 26 页 0 报错**（G29 课内页在线离线各一遍）；闯练引擎 DOM 实跑、P2b 双向跳转全部探针、三时钟/考季/年级选择器回归全绿；唯一 console error 是预期的 g27.json 404 探针
- [x] sw-check（全新 profile）：只剩 `ea-v0.9.30` 一套缓存，壳 53 项，内容 0 个进壳，未缓存内容离线 504 优雅降级
- [x] 窄屏 shot.html：G29 课内页 360 与 320、大厅 27 课列表 360——均 0 元素溢出
- [x] sw 版本 → **ea-v0.9.30**（内容批次不加 JS，壳不变，bump 版本发新内容）

### 📌 P3 续批说明（家长验收 G29 后再开工）
- 范围：G27/G28/G30-G42 共 15 课，规格与 G29 一致；**锚点表用户已贴过（也存在记忆里），星级 G27★★ 其余★，本层 ketLessonMap 全部 null**
- G27 承接 G26：只在 G26 的七搭配之上展开 been vs gone / since-for 深辨 / 与一般过去时对比，开头一句「G26 学过的延音线，这里加长」
- G30/G31/G32 非谓语只讲初中层面辨析，三课末尾统一指向精修层 G46 合流预告
- 做法照旧：一课一 commit；每课 check-lesson 全量 + preflight；开工前备份八课收尾跑 untouched；写到 G27 后 smoke.html 404 探针改 G43
- 全层齐后 sw 按当时序号 +1（全局单调递增），回归三条线 + 窄屏

---

## V0.9.33：学习/测试进行中防误触退出（两层防护，2026-08-15）

> 问题：练习整页路由进行中，底部导航仍可点，误点直接跳走丢全部进度。范围按排查表确认：
> ★★★+★★（#1-13）层1+层2；★ 级（跟读/错词突击/消消乐/打地鼠/识词）只做层1。

### 单元 1 · 答题态核心（assets/js/app.js）
- [x] `enterFocus / exitFocus / requestLeaveFocus`：进入答题态隐藏底部导航 + 顶部年级切换（隐藏非禁用），移除 `has-bottom-nav` 收回 80px padding；左上 ‹ 始终是唯一出口
- [x] 离开确认框复用 showModal（点外部不关/Esc=继续）：「还有 N 题没做完，确定要离开吗？」→【继续做题】/【离开】；文案平静无施压
- [x] `navigate()` 顶部兜底 exitFocus：任何路由切换都恢复导航并执行 cleanup（孤儿计时器的总闸）
- [x] 全局 Esc：答题态（仅 confirm 页）按 Esc 弹同一确认框；有弹窗开着时让位给弹窗自身的 Esc

### 单元 2 · #1-13 接入（层1+层2）
- [x] 语法大厅闯练/侦探关（lesson.js）、KET 八课两套练习引擎（grammar-course.js）、单词闯关含 Boss（level-play.js）、KET 阅读 P1-5 / 听力 / 限时 40′（reading-drill.js）、模拟考（mock-exam.js）、语法学院（grammar.js）、阅读理解（reading.js）、写作工坊/写作实验室（writing.js / writing-lab.js）
- [x] mock-exam 只包三处 abort 入口（P1-5 onBack / P6-P7 写作 / 自评），开考说明页返回不动；确认文案说明「计时作废、成绩不保存、重考从头计时」
- [x] ⚠️ 答题视图移除 `bindBack` 双绑定：原来 addEventListener（直接导航）与 onclick（内部视图切换）同时触发互相竞争，会绕过确认框——确认框页面一律只留单一 handler

### 单元 3 · ★ 级（仅层1）+ 写作自动草稿
- [x] 跟读/背诵（recite.js）、错词突击（reinforce.js）、消消乐（match-game.js）、打地鼠（shoot-game.js）、识词（pet.js）：`enterFocus({confirm:false})` 只藏导航，‹ 直接退不弹框
- [x] 写作工坊：userText 防抖 500ms 自动存草稿（storage.saveWritingDraft，level='FREE' 与 KET 互不串档），进入回填 + 平静提示「上次写到这里」；离开路径 cleanup 同步落盘
- [x] 写作实验室：同上（复用既有 level 草稿键，手动保存按钮保留）；顺带修掉「看范文折叠再展开时文本回退到进入时版本」的旧问题（saved 随 input 更新）

### 单元 4 · 次生 bug（本批一并修）
- [x] 模考 60′ / 限时 40′ / 打地鼠 60″ 计时器与倒计时条：跳走后不再残留（此前会在到点时把当前无关页面的 DOM 整个覆盖）
- [x] level-play 8 秒答题倒计时：跳走后不再超时误记一次错词 + 播错误音效
- [x] 听力「第二遍朗读」的 setTimeout：离开即清，不再在别的页面开口说话
- [x] 计时器专项验证：modal-check 包了 setInterval/clearInterval 记账——打地鼠开局跳走后活跃计时器数回到基线

### 单元 5 · 自检（全过）
- [x] preflight 四项全过（36 JS ESM / Schema+编码 125 文件 / sw 登记 / ketLessonMap 31 课一致）
- [x] modal-check 新增 ⑥答题态 ⑦孤儿计时器 ⑧写作草稿三个专项：默认宽 + ?w=360 双跑全绿——进行中导航/年级键确实隐藏、‹ 在视口内可点、‹ 与 Esc 均弹确认、遮罩不关、「继续做题」回原题不丢、「离开」正确退出且导航恢复、答题页与确认框 0 溢出、无死弹窗
- [x] smoke 路由回归：在线 37 页 / 离线 26 页 0 失败；闯练引擎 16 题实跑 + 侦探关、P2b 双向跳转、三时钟/考季/年级选择器全绿（唯一 error 为预期 g43 404 探针）
- [x] sw-check（全新短路径 profile，真断网确认）：只剩 `ea-v0.9.33` 一套缓存，壳 53 项，离线 504 优雅降级
- [x] shot.html?w=360：grammar-hall 课内页 / exam-mock / writing 均 0 元素溢出
- [x] sw → **ea-v0.9.33**

### 📌 待办（单独一批）
- [ ] **浏览器后退拦截（history 哨兵）**：应用无 history 路由，浏览器后退=直接离开整站、无确认可拦。做法：进入答题态 `pushState` 哨兵条目，`popstate` 时弹同一离开确认；集中改 app.js 约 30 行。注意 PWA standalone 下 Android 返回键行为要实机验证。
- [ ] 闯练/模考进度快照（localStorage「上次做到第 N 题，继续/重开」）：涉及抽题+洗牌副本序列化，成本高暂缓；层1+层2 已消除误触主因

---

## V0.9 P3 续批：进阶层 G32-G42（缓存 `ea-v0.9.4`，2026-08-18，✅ 进阶层 16 课完成，⏸ 等家长验收）

### 内容（11 课，一课一 commit，规格与 G29 完全一致：九段 + SVG 记忆卡（进阶绿）+ 4×16=64 题 + 侦探关 7 病句）
- [x] 比喻锚点严格按存档：G32 分词作定语表语（interesting 是发声者，interested 是听众）· G33 宾语从句（塞进「宾语」座位，进座位就要坐正）· G34 定语从句（装饰音必须紧贴）· G35 状语从句一（舞台提示：何时进、什么条件下进）· G36 状语从句二（演出说明的其余四类）· G37 主语从句与表语从句（整段当主奏上台）· G38 情态动词二（力度记号的高级用法：弱奏里的言外之意）· G39 used to/had better/would rather/be used to（三个最容易混的和弦指法）· G40 直接引语与间接引语（转述：人称、时态、时空三样各退一步）· G41 短语动词与固定搭配（和弦：两个音一起响才是那个意思）· G42 构词法（造词工厂）
- [x] KET 相关度诚实标注：11 课全部 ★（ketRelevance 1）、ketLessonMap 全 null（ket-hall-map.js 零改动），ketNote 一律「为初中/PET 打底，学到就是赚到」口径，不制造焦虑
- [x] 内容边界落实：G32 收官非谓语三课，与 G30/G31 统一指向精修层 G46 合流预告；从句四课（G33-G37）只讲初中层面，定语从句不碰 whose/非限制性/关系副词/介词提前（明确留口 G48 长难句拆解）；G38 不碰 must have done 完成推测
- [x] 暗线「英语的规律性」贯穿：坐正=位置认身份（G33/G37）、一句一个领队与一张报时执照同族（G35/G36）、距离产生礼貌（G38）、use 的语法化三分身（G39）、指示语换圆心（G40）、造词四车间 vs 高频词手工孤品（G42）；**G41 主打**——get/take/put/come 恰恰搭配最多最不讲理，「越常用越多义」与 G13 不规则动词同一条定律
- [x] 跨课查重全量跑并抓到 2 处撞题（G38↔G17 mustn't 题、G41↔G39 介词门找错题），均已改写复检通过

### 自检（全过）
- [x] 八课零改动：开工前备份 `tools/backup/ket-lessons-before-p3-g32-g42/`，check-ket-lessons-untouched 逐字段 100% 一致（5154 字段 / 94444 字 + sha256）
- [x] check-lesson 全量 42 课：**2983 个题干全局无重复**（2688 题 + 295 侦探句）；11 新课 704 题 ×200 轮选项洗牌 answer 全同步；解析/难度/选项查重全过
- [x] preflight 四项全过：36 JS ESM / Schema + 编码守卫 136 文件 / sw 登记核对 / ketLessonMap 逐课一致（42 课）
- [x] 浏览器实跑（全新短路径 profile）：**在线 39 页 / 离线 28 页 0 失败 0 新增报错**（G32/G42 课内页在线离线各一遍 + g32Loaded/g42Loaded 结构探针）；闯练引擎 16 题实跑 + 侦探关、P2b 双向跳转全部探针、三时钟/考季派生/年级选择器回归全绿；唯一 console error 是预期的 g43.json 404 探针
- [x] modal-check 防误触专项（0.9.33 新增）默认宽 + ?w=360 双跑全绿：答题态导航/年级键隐藏、‹ 与 Esc 弹确认、孤儿计时器清零、写作草稿回填、无死弹窗、0 溢出——未改坏
- [x] sw-check（全新 profile，`serverReallyDown=true` 真断网确认不假绿）：只剩 `ea-v0.9.4` 一套缓存，壳 53 项，内容 0 个进壳，未缓存内容离线 504 优雅降级，清内容缓存不动壳
- [x] 窄屏 shot.html 实测（limit=forceW 实量右边界）：大厅 42 课列表 360 / G42 360 / G32 320 / G37 360——全部 0 元素溢出
- [x] smoke.html 更新：加 G32/G42 在线离线覆盖 + 结构探针（404 探针维持 G43，P4 写到 G43 后改 G51 或移除）
- [x] ★ index.json 变动走壳缓存 cache-first（环境坑 11）：CACHE_VERSION **ea-v0.9.33 → ea-v0.9.4**（家长指定号，全局未用过，不复用已发布号）；index.json version → 0.9.4

### 📌 P4 续跑说明（家长验收进阶层后再开工）
- 范围：**精修层 G43-G50 共 8 课**，规格与进阶层完全一致：九段 + SVG 记忆卡（**精修层换紫 #C084FC**，参考 index.json tiers 配色）+ 4 环节×16=64 题 + 侦探关 6-8 病句
- **比喻锚点表在用户的《V0.9-V1.0 扩容方案》总纲里，开工时请用户贴出当批锚点，不要自创**；星级与 ketLessonMap 按总纲/据实标注（精修层预计多为 ★ 或 ★★，如有八课对应关系需同步 ket-hall-map.js + index.json 两处，preflight 第④项会核对）
- 已知留口必须兑现：**G46 非谓语综合辨析**（G30/G31/G32 三课末尾已统一预告「三张脸合流对比」）；**G48 长难句拆解**（G33-G37 从句四课 + G34 的 whose/非限制性/关系副词等「不碰」项全部在此收口）
- 做法照 P3：开工前备份八课到 `tools/backup/ket-lessons-before-p4/`，收尾跑 untouched；一课一 commit；每课 `node tools/check-lesson.mjs data/grammar/g*.json` 全量（防跨课重复，现有 2983 题干基数）+ preflight
- 内容 JSON 不登记 sw.js（走运行时内容缓存）；index.json 变动必须 bump CACHE_VERSION（→ ea-v0.9.5 或按当时序号，全局单调递增）
- smoke.html：写到 G43 后 404 探针改 G51（或移除，50 课齐后无未来课可探）；加精修层首尾课覆盖 + 结构探针
- 全层齐后即 50 课满编：回归三条线 + 大厅四层视图 + 双向跳转 + 答题态导航隐藏 + 窄屏；CHECKLIST 写 V1.0 读本批次（reader P5-P7）衔接说明

---

## V0.9 P4：精修层 G43-G50（缓存 `ea-v0.9.5`，2026-08-19，✅ 语法大厅 50 课全部完工，⏸ 等家长验收）

### 内容（8 课，一课一 commit，规格与 G29 完全一致：九段 + SVG 记忆卡（精修紫 #C084FC）+ 4×16=64 题 + 侦探关 6-8 病句）
- [x] 比喻锚点严格按用户所贴：G43 虚拟语气初步（排练时「假设走一遍」，不是真演出）· G44 倒装（变奏换序：谁先出声换了个人）· G45 强调句（打聚光灯：把某个乐手单独照亮）· G46 非谓语综合辨析（同一乐手换三种乐器，认乐器不认人）· G47 时态十二格（一张总时间表：调×时刻的坐标系）· G48 长难句拆解（拆总谱：先找主奏，再一层层剥声部）· G49 标点大小写（谱面上的休止符与小节线）· G50 中式英语专项（最后一次总排练）
- [x] KET 相关度诚实标注：8 课全部 ★（ketRelevance 1）、ketLessonMap 全 null（ket-hall-map.js 零改动），ketNote 一律「为初中/PET 打底，学到就是赚到」口径
- [x] ★ **三笔债全部兑现**：① G46 开头回指 G30/G31/G32 的合流预告，给出可操作判断路径（第零步找主奏 + 认乐器三问：朝前拿号 to do／打包提箱 doing／挨动作挂牌 done + 介词后只收箱 + 双接法），不是三课复述；② G48 兑现 G34 全部留口——whose（后不加 his/her）、非限制性定语从句（逗号=顺便一提，不用 that 不能省，逗号有无改变意思）、关系副词 when/where/why（从句缺不缺成分判断法 + =介词+which 轻讲），并给出拆谱三步法（找主句主谓→圈接头词折叠→逐层还原）；③ G50 以备考知识库 8 类错误表为底升级 16 类（红4：缺助动词/缺be/时态跳/主被动颠倒；黄9：介词/代词格/冠词/双重连词/从句语序/时态呼应/非谓语/very like/There has；灰3：三单-s/单复数/冗余），三色分区逻辑与「只打会挡意思那几类、灰区不反复纠正（满分范文也有此类错照样 15/15）」的关键判断原样保留
- [x] ★ **暗线收束**（G50 echo）：be 五副面孔 / went 借用 / better 异源 / get·take·put 多义 / I 独家大写 / were 虚拟礼服——同一条规律反复现身「越常用的词磨得越圆」，平静收尾不说教；G43-G49 各自呼应（were 虚拟式化石、V2 老语序、it/that 兼职账本、双接法、be/have/will 撑起十二格、whose 变格阵地、I 独享大写）
- [x] G47 诚实边界：十二格 = 4 时刻 × 3 状态，罕见三格（will have done 等）标灰认识即可；G43/G44 高中内容（过去的空想、部分倒装）点到为止

### 自检（全过）
- [x] 八课零改动：开工前备份 `tools/backup/ket-lessons-before-p4/`，check-ket-lessons-untouched 逐字段 100% 一致（5154 字段 / 94444 字 + sha256）
- [x] check-lesson 全量 50 课：**3552 个题干全局无重复**（3200 题 + 352 侦探句）；8 新课 512 题 ×200 轮选项洗牌 answer 全同步；解析/难度/选项查重全过
- [x] preflight 四项全过：36 JS ESM / Schema + 编码守卫 144 文件 / sw 登记核对 / ketLessonMap 逐课一致（50 课）
- [x] 浏览器实跑（全新短路径 profile）：**在线 41 页 / 离线 30 页 0 失败 0 新增报错**（G43/G50 课内页在线离线各一遍 + g43Loaded/g50Loaded 结构探针）；闯练引擎 16 题实跑 + 侦探关、P2b 双向跳转全部探针、三时钟/考季派生/年级选择器回归全绿；唯一 console error 是预期的 g51.json 404 探针
- [x] modal-check 防误触专项默认宽 + ?w=360 双跑全绿（0 false / 0 溢出）——0.9.33 答题态防误触未被改坏
- [x] sw-check（全新 profile，`serverReallyDown=true` 真断网确认不假绿）：只剩 `ea-v0.9.5` 一套缓存，壳 53 项，内容 0 个进壳，未缓存内容离线 504 优雅降级，清内容缓存不动壳
- [x] 窄屏 shot.html 实测（limit=forceW 实量右边界）：大厅 50 课列表 360 / G43 360 / G50 360 / G46 320——全部 0 元素溢出
- [x] smoke.html 更新：404 探针 G43 → **G51**（50 课满编后无未来课，G51 恒 404 用于验证懒加载优雅降级）；加 G43/G50 在线离线覆盖 + 结构探针
- [x] ★ index.json 变动走壳缓存 cache-first（环境坑 11）：CACHE_VERSION **ea-v0.9.4 → ea-v0.9.5**（全局单调递增不复用）；index.json version → 0.9.5
- ⚠️ 环境坑补充：无头 Chrome 测完必须确认进程真的退光（`Get-Process chrome`）——残留的无头实例会占住 `--user-data-dir` 锁，下一轮启动只是把 URL 递给旧实例然后退出，页面根本没加载，结果文件永远等不到（本批 modal-check ?w=360 因此空跑三次）

### 📌 P5 续跑说明（家长验收精修层后再开工）
- 范围：**四阶读本 · 卷 I**（reader 数据层 P0 已就位：`data/reader/index.json` 四卷 volumes + `_schema.piece.json` + `v1/` 分片目录 + 懒加载器 loadReaderPiece）
- **批次详情、选篇与分级方案在用户的《V0.9-V1.0 扩容方案》总纲里，开工时请用户贴出当批说明，不要自创**；`source` 字段强制可追溯（"original" 或 "adapted: 底本"，改编仅限 1929 年前出版英文文学 / 美国联邦政府作品——版权红线）
- 语法大厅侧已完工封版：G01-G50 内容与 KET 八课同为「一个字不动」基线，后续批次动手前照例备份 + untouched 复跑
- 做法沿用：内容 JSON 不登记 sw.js（运行时内容缓存）；index 变动必 bump CACHE_VERSION（→ ea-v0.9.6 或按当时序号，全局单调递增）；新答题页如有，必须接 enterFocus 且不 bindBack（V0.9.33 规矩）；收尾 preflight + smoke/sw-check/modal-check/shot 全套

---

## B2：全站体检后高危 Bug 修复 4 项（缓存 `ea-v0.9.7`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> 依据 2026-09-01 全站只读体检报告。只碰渲染层 JS；大厅 50 课与八课数据零改动（untouched 守卫对 `tools/backup/B2/` 全过）。

- [x] **B2-1 双绑定返回竞态 12 处**：`bindBack`(addEventListener) 与 `onclick` 并存，异步 `navigate(模块根)` 覆盖同步局部返回 → 中间层 ‹ 必跳层。统一为 onclick 单一路径（与 V0.9.33 答题页 requestLeaveFocus 写法对齐）。跳层高危 6 处：大厅环节选择/闯练结果/侦探结案（lesson.js）+ 八课特殊单词表/环节选择/结果页（grammar-course.js）；同目标重复渲染 6 处：八课老流程各返回站点。**规矩升级：`bindBack` 之后禁止再赋 `#examBackBtn.onclick`——要局部返回就只用 onclick，不叠 bindBack**
- [x] **B2-2 PET 语法兜底**：`'PET' <= 6` 恒 false 静默落 junior → 显式判定 + PET 模式列表页说明卡（初中语法打底）+ 语法大厅直达按钮（grammar.js）
- [x] **B2-3 KET/PET 错词突击入口**：话题词库主页补数字年级同款 🔥 入口（含待强化角标，pet.js）——此前 PET 完全不可达、KET 需绕报告页 4 步；reinforce 词索引本就含话题词
- [x] **B2-4 首页任务模式适配**：grammar3 只有年级语法推进（KET 被改道永不可完成）→ 大厅闯练/八课新旧判分挂 `progressDailyTask('grammar3')`；reading1 在 KET 阅读专项结算处补挂（听力不算阅读）。三项任务现在 1-9/KET/PET 全模式可完成
- [x] 回归：preflight 四项 ✔；八课 untouched（字节级 sha256）✔；smoke 在线 41 + 离线 30 路由零失败（console 仅预期 g51 探针）✔；sw-check（缓存名 `english-adventure-ea-v0.9.7`、离线 504 兜底、清缓存）✔；modal-check 双跑（默认宽 + w=360，真实时钟、全新短路径 profile）全绿——0.9.33 答题态 17 项 / 孤儿计时器 / 写作草稿回填 / 无死弹窗 ✔；大厅闯练 + 八课⇄大厅双向跳转（含离线）✔
- [x] 行为级定向验证（临时检查页，跑完已删）：大厅「环节选择 ‹→讲解页」「结果页 ‹→环节选择」、八课「环节选择 ‹→讲解页」等 700ms 后仍停在正确层，9/9 全真
- CACHE_VERSION **ea-v0.9.65 → ea-v0.9.7**（全局单调递增不复用）

---

## B3：模式感知 + 术语统一（缓存 `ea-v0.9.75`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> 依据全站体检报告与家长拍板术语表。八课数据零改动（untouched 对 `tools/backup/B3/` 全过）；大厅数据仅动 60 处「乐团→乐队」+ g50 两条 clue 补类名（改前备份 `tools/backup/B3/hall/g50.before.json`，diff 审计仅预期字段）。

- [x] **B3-1 修复 navigate 静默改道**：首页四张入口卡文案随模式动态生成（`homeCardsHtml`）——KET 下语法/阅读/写作卡如实标注改道去向（KET 语法八课 / KET 阅读听力 / KET 写作实验室），PET 语法卡标注「暂用初中语法打底」。原则固化：**不允许「入口叫 A、落地是 B」的静默改道**
- [x] **B3-2 八课让出「语法学院」**：页面标题→「🎼 KET 语法八课」、结果页按钮→「回语法八课」、九宫格「语法」→「语法八课」；「语法学院」归年级模块独占；「语法大厅」16 处引用保留
- [x] **B3-3 模式感知**：首页顶部模式横幅（年级橙 / KET 青 / PET 紫三态，标注当前模式 + 哪些入口内容随之切换 + 右上角可切换提示）
- [x] **B3-4 术语统一（家长拍板）**：①→错题本（toast 2 处+注释 4 处）②乐团→乐队 61 处（50 课数据+schema+PET 词库 band 语境+lesson.js 栏目名及模板注释；**红线 KET 数据 6 处保留；checkin.js「乐团练习」=孩子现实排练，明确排除**）③闯练→闯关 11 处 ④错词强化→错词突击 ⑤待巩固→待强化 ⑥时长标签「词汇闯关→单词大冒险」「KET 词汇→KET 词库」；g50 侦探 clue 🟡12/🟡13 补类名（**不改编号**，KET 8 类表在红线内一字未动）。全程 node utf8 读写，check-data 编码守卫过
- [x] 工具增强：shot.html 加 `&grade=3/KET/PET` 参数（测模式相关页面）
- [x] 回归：preflight 四项 ✔；八课 untouched ✔；smoke 41+30 路由零失败 ✔；sw-check（`english-adventure-ea-v0.9.75`）✔；modal-check 双跑全绿（0.9.33 答题态未被改坏）✔；行为级检查 19/19（B2 返回 5 项复跑 + 模式横幅/卡片 7 项 + 改名 2 项 + 术语渲染 2 项）✔；窄屏 shot 7 页（home×3 模式×360 + KET 320 + hub/八课/words）零溢出零小热区 ✔
- CACHE_VERSION **ea-v0.9.7 → ea-v0.9.75**
- ⚠️ 排查笔记：innerHTML 会带出模板里的 HTML 注释——术语替换必须连 `<!-- -->` 注释一起扫（本批 lesson.js「③ 乐团比喻」注释即漏网后补）

### 📌 B4 续跑说明（学习闭环，家长验收 B3 后开工）
- 目标：把「学→练→错→复习」在「错」这环接通。体检结论：MISTAKES 只存 wordId 无课程引用；QUIZ_STATS 的 qKey 含课号（`HALL:G01:s1` 等）但被哈希化、无 UI、无反查
- 建议动作：① `recordQuizAnswer` 落盘时另存题面摘要+课号（新 key，不动现有 QUIZ_STATS 结构）② 错题本分「错词/错题」两区，语法错题带「回看本课讲解」直达链（qKey→lessonId 反查）③ 错词突击结束回来路（当前写死回 words）④ 侦探关成绩落盘
- 红线照旧：八课/大厅数据零改动（错题引用只存渲染层新 key）；新答题页接 enterFocus 且不 bindBack；bindBack 之后禁止再赋 onclick（B2 规矩）
- 收尾照旧：备份+untouched、preflight、三件套真实时钟全新 profile、行为级返回检查复跑、sw → ea-v0.9.8

---

## B4：学习闭环打通（缓存 `ea-v0.9.8`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> 学→练→错→复习 在「错」这环接通：做错的题不再消失。八课/大厅数据零改动（untouched 对 `tools/backup/B4/` 全过），全部在渲染层+存储层实现。

- [x] **B4-1 错题落盘**：新 `KEYS.QUIZ_MISTAKES`（qKey 与 QUIZ_STATS 同源；上限 200 FIFO；随导出/导入/重置走既有规范）。埋点：大厅闯关、侦探关（自评「还没改对」落盘；改对/自评改对自动毕业）、八课三题型（choice/tf/text，finish 增 pickedText）、年级/PET 阅读、KET 专项与模考（`onFinish` 存在与否区分 mock/read）。`recordQuizAnswer` 答对同 qKey 自动从错题本毕业
- [x] **B4-2 错题本分区**：五分区 chips（单词/语法大厅/KET八课/阅读/模考）；题目卡=题面+来自哪课（GXX·课名·环节）+我的答案+正确答案+考点解析+错过次数+✓移除；`?src=` 指定分区、`?lesson=` 只看某课；空状态平静化（不催促）
- [x] **B4-3 回课直达与反向**：错题卡「回看本课讲解→GXX」跳大厅课内**并定位规则段**（scrollTo=rules 只滚一次）/八课课内；课内 fromMistakes 显示「返回错题本·对应分区」（与 fromKet 同款琥珀按钮，onclick 单一路径）；反向：讲解页「本课你有 N 道错题」→ 错题本该课过滤视图
- [x] **B4-4 突击回来路**：renderReinforce 接 `params.back`，空态/中途‹/练完统一 goBack——错题本进来回单词区、报告页进来回报告；错题本单词区并入突击按钮
- [x] 回归：preflight ✔ 八课 untouched ✔ smoke 41+30 零失败 ✔ sw-check（ea-v0.9.8）✔ modal 双跑全绿（0.9.33 答题态/孤儿计时器/写作草稿/死弹窗未改坏）✔
- [x] 行为级验证 **30/30**：B4 闭环 13 项（答错落盘字段完整→答对自动毕业→侦探关自评落盘→错题本分区显示→回课直达落 G01 规则段→返回回分区→反向 chip→只看 G01 过滤→突击进出回单词区）+ 错题本 360 窄屏零溢出 + B2 返回 5 项 + B3 模式/改名/术语 9 项
- CACHE_VERSION **ea-v0.9.75 → ea-v0.9.8**

### 📌 B6 可直接使用的错题字段（B4 已备好，勿改口径）
`QUIZ_MISTAKES[qKey] = { src:'hall'|'ket'|'read'|'mock', kind:'choice'|'detective', lesson:'G01'|'L1'|null, lessonTitle, stage, q:题干/病句, options:数组|null, picked:她选的/她的改法, correct:正确答案/参考答案, explain:考点解析/病在哪, t:时间戳, n:错误次数 }`——「针对这次错法解释」所需上下文齐备；配合 `data/grammar/gXX.json` 的九段讲解即为完整 prompt 素材。

### 📌 B5 续跑说明（文案清扫，家长验收 B4 后开工）
- 依据 2026-09-01 体检报告第三节，总量 ≈390 处，其中约 2/3 可脚本化：
  ① 词库 tips 中英标点 ~260 处（`data/pet/words/*.json` + `data/exam/ket/words/*.json`，写正则转换脚本：中文间半角逗号/冒号/分号/引号→全角、三点省略号→……，**node utf8 读写 + check-data 编码守卫**，改前备份）
  ② UI 层 28 处（体检报告 UI 实例表 20 条 + 余项；含 app.js:559 版本号 v0.3 陈旧）
  ③ 三个早期文件标点/英文语病 ~34 处（grammar/kindergarten|junior|primary.json、reading/kindergarten.json 的 What does I do 类）
  ④ 点状硬伤：g33.json:583 语义反转题、g50.json:1019 自相矛盾选项、g26.json:239 缺谓语、writing-lab.js:116「过去调」、讲解层网络语 7 处（送命题/躺平/断气 等）、话术层 14 条
- 红线照旧：KET 八课数据一字不动（其中 6 处「乐团」与半角标点也**不修**）；大厅数据可改但逐文件 diff 审计；版权红线不碰
- 收尾照旧：备份+untouched、preflight、三件套、sw → ea-v0.9.85 或按当时序号

---

## B5a：词库 tips 标点脚本批量修正（缓存 `ea-v0.9.82`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> 范围仅 `data/pet/words` + `data/exam/ket/words` 的 `mnemonic.tip` 字段。全程 node `fs.writeFileSync(utf8)`，零 PowerShell 管道；每批跑 check-data 编码守卫。

- [x] 只读扫描分类（43 文件 / 2066 条 tip）：C1 中文,中文 184｜C2 中文,英文 3｜C3 英文,中文 109｜S 分号 13｜K 冒号 1｜E 三点省略号 8｜补充 R1 括号后 159｜R2 英文后分号 6 —— **共替换 483 处，落在 370 条 tip / 15 个文件（全部为 PET 词库；KET 词库 V0.5 制作时已规范，零命中）**
- [x] 正则保守三原则：只动 tip 字段值（`\"` 先占位再还原，写盘前 JSON.parse 验结构）；标点两侧必须有中文语境证据；英文短语内标点（`Say cheese!` 等 14 条）一律不碰
- [x] 全量字段审计（对 git HEAD 逐词条比对）：**非 tip 字段零字节变化**（例句/词义/音标/搭配全未动）；抽查 30 条无误伤
- [x] 回归：preflight 四项 ✔ 八课守卫（对 tools/backup/B5a）✔ smoke 41+30 零失败 ✔ sw-check（ea-v0.9.82）✔ 渲染 probe：PET/KET 各抽 3 话题识词页零 U+FFFD、全角标点正常显示 ✔
- CACHE_VERSION **ea-v0.9.8 → ea-v0.9.82**（词库 JSON 走内容缓存，bump 保证老客户端拿到新 tips）

### 📌 交给 B5b 的人工清单（正则不安全/需拍板，B5a 未改）
1. **英文字符间标点 5 条**（中文句内但两侧都是拉丁字符，机改有误伤风险）：
   - pet-environment.json`只有一个 s,dessert(甜点)`、pet-sport.json`一个 o,loose(松的)`（letter,letter）
   - pet-entertainment.json`amusing;amusement park`、pet-clothes.json`(过去式 wore);put on`（letter;letter）
   - pet-shopping.json`/kjuː/,后面四个字母`（音标斜杠后逗号）
2. **半角引号包中文 900 处**（`谐音"给他"`类）：与半角括号同属全站既有排版风格，体检判"内部一致不算错"；是否统一改「」属风格决策，**请家长拍板后再动**（改则 tips/讲解/题目全站一起改，工作量大）
3. 英文短语自带标点 14 条（`Brilliant!`/`a sheep, two sheep` 等）——**正确英文标点，非问题，永不修**

---

## B5b：UI 与讲解文案人工打磨（缓存 `ea-v0.9.85`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> 四类一类一 commit（移交清单 / 讲解话术 / UI / 早期文件）。KET 八课数据零改动（untouched 对 `tools/backup/B5b/` 全过）；大厅 8 课改动逐行 diff 审计仅预期字段。全程 node utf8 定点替换 + 唯一性校验 + JSON.parse 验结构。

- [x] **B5b-1 B5a 移交 5 条**：英文字符间标点逐条人工判读，确认全属中文语境 → 全角（wear 分号 / desert 逗号 / amusing 分号 / lose 逗号 / queue 音标后逗号）
- [x] **B5b-2 讲解与话术点状 12 处 / 8 课**：网络语 7 处清除（送命题×2→最容易听混丢分、躺平×2→名词不用动/收了工、断气→唱不完（贴乐队比喻）、翻车×2→双重否定的病句）；g26 家长话术缺谓语「只把→只管一条门规」；g33 语义反转题 he is wrong→right（与讲解正文 I don't think he is right 对齐，explain 重写）；g50 自相矛盾选项重写（红：缺 was＋三动词时态跳；黄：双领队；灰无——与 explain 红2/红3/黄8 类号口径一致）；check-lesson 50 课 3552 题干全局无重复
- [x] **B5b-3 UI 层 111 处 / 28 文件**：①硬伤 6——writing-lab 生造词「过去调」→时态全程用过去时；knowledge「三张卷」写死（PET 实为 4 张）→考卷构成、「速修」→速成×2；report 术语漏网「待毕业」→待强化；app.js 陈旧尾注 v0.3→KET/PET 备考版；年级选择器 1-2 年级误标「学前」→低年级 ②语句不通/成分残缺 21 处重写（「可让家长按清单判」「短板+性价比最高」「先通关前一关解锁哦」等） ③翻译腔/公文腔 19 处（「本次重点安排了…」5 处统一口语化、「敬请期待」×3、「未找到」系列 4 处补出路、「今日已投入」「点击即」） ④护栏软化——checkin 家长卡「打很久的仗/被榨干×2」不恐吓、去写死年龄「11 岁」、mock「不是审判」→不是成绩单、「只做题不输出＝没学」×3 改正向 ⑤勋章名 4——百词斩（竞品商标）→词汇达人、坚持三日/一周达人（连续暗示违背无断签原则）→学满三天/七天、挥毫泼墨→小小作家 ⑥半角标点 14 处全角化
- [x] **B5b-4 早期文件 60 处 / 4 文件**（grammar/kindergarten|primary|junior + reading/kindergarten）：英文语病 8 处（What does I do / How old is I / Where is I / Who loves me → the writer 系，与 rk-004 既有问法一致）；坏题 2 道（gk-004 to sing/singing 双正确、gk-006「this's(不常用)」缩写怪题重做为 This/That 远近辨析）；解析残缺 5 处（「I 不喜欢用」、gp-002 就近原则自相矛盾、「书 是被读」等）；中文标签后半角冒号/问号等 45 处全角化、gj-008 irregular→不规则
- [x] 回归全绿：preflight 四项 ✔ 八课 untouched（对 tools/backup/B5b）✔ smoke 在线 41 + 离线 30 零失败（唯一 console error 为预期 g51 探针；考季派生带出新决策文案且无写死年份）✔ sw-check（唯一缓存 `ea-v0.9.85`、壳 54 项、离线 504 兜底、serverReallyDown 真断网、清内容缓存不动壳）✔ modal-check 双跑（默认宽 + w=360，0.9.33 答题态/孤儿计时器/写作草稿/无死弹窗）✔
- [x] 行为级回归 **20/20**（临时检查页 b5b-check.html，跑完已删）：B2 返回 5 项（大厅环节选择‹/结果页‹、八课环节选择‹/特殊单词表‹、错词突击 back=mistakes）+ B3 模式术语 9 项（三态横幅/KET 卡如实标注/八课改名/闯练·错词本·待巩固·待毕业零残留/乐队不乐团）+ B4 闭环 6 项（答错落盘字段完整→分区显示→回看本课讲解→fromMistakes 返回→反向 chip）
- [x] 窄屏 shot 13 页 `w=360`（错题本另加 320）零元素溢出：错题本长课名卡实测（复用行为检查种下的 G01 错题）、home×3 模式、checkin 新家长卡、exam-hub 收工长按钮、八课 L1、大厅 G01、PET 词库页、错词突击空态、PET 语法说明卡、模考页
- CACHE_VERSION **ea-v0.9.82 → ea-v0.9.85**
- ⚠️ 写行为断言的教训：结果页 ‹ 的正确落点是**环节选择**、特殊单词表 ‹ 的正确落点是**课内讲解**（都是 B2 修复后的既定层级，别想当然断言回讲解页/八课主页）；「乐团」扫描必须排除 KET 八课渲染页——红线数据 6 处保留是设计不是漏网

### 📌 需家长拍板清单（B5b 识别但未动）
1. **引号包中文 900 处**（B5a 移交项 2，风格决策）：`谐音"给他"`类是否统一改「」——改则 tips/讲解/题目全站一起改
2. **「智能批改」命名**（writing.js 提交按钮等）：实为规则引擎（代码注释自称「伪 AI」），对家长有过度承诺之嫌。建议改「写作体检」，或等 B6 真 AI 接入后名实相符再保留
3. **Part5 验收线口径**（reading-drill.js:226）：文案写「验收线 4/6 以上」但通过判定是 70%（4/6=67% 会显示未通过）——改文案为 5/6 还是把阈值调到 0.66，属行为决策
4. **checkin 家长卡年龄**：原写死「11 岁」（疑似从方案文档搬运），本批改为「这个年纪的孩子」——如需明确写 9 岁请指示
5. **两处刻意比喻是否保留**：G19 家长话术「借家什」（方言词）、resources「🦈 会咬人的规则」（报名合规区的鲨鱼记忆点）——语感风格请定
6. 勋章「持之以恒」（累计学习 30 天）保留未改：语义是累计、无断签暗示，与另两枚改名的不同

## B5c：六项拍板落地（缓存 `ea-v0.9.9`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> 家长对 B5b 六项拍板全部落地。KET 八课数据零改动（untouched 对 `tools/backup/B5c/` 全过）。

- [x] **①引号 900 处 → 全站「」**（实测 1418 处）：机改 1410 处 / 45 文件（规则：成对 `\"X\"` 且 X 含汉字；排除八课红线 3 文件 + `_schema` 记法文件）+ 中文语境包英文词人工定点 8 处（zip——/cheese/Q/cheap cheap/note/get on/fit/V）+ JS 显示文本 1 处（study-stats「有效学习时间」）。**不动**：英文直接引语 35 处（g15/g40/g47/g49 的 `Mum said, "…"` 系——正确英文标点；g49 本身教引号，一字不碰）、纯英文语境 100 处、schema `"original"/"adapted:…"` 记法、HTML 属性/JS 字符串定界符/代码注释。**全字段审计**对 git HEAD：57071 字段中变化 1164 个全部仅为引号替换，英文 en 例句字段零字节变化；抽样 30 处人工过目无误伤
- [x] **②「智能批改」命名：本批不改**，留给 B6 一并定——B6 可能把真 AI 接到这个位置，现在改名可能返工（B6 开工时定夺：接真 AI 则名实相符可保留，不接则改「写作体检」）
- [x] **③Part5 验收线：改阈值不改文案**（依据备考知识库第二级验收标准原文「Part 5 格式填空 4/6 以上」）：reading-drill done() 增 `passed` 判定——part5 按 `correct/total >= 4/6`，其余题型维持 70%；结果卡绿黄底与 🎉/💪 随 passed，4/6=67% 现在如文案所说算通过
- [x] **④家长卡年龄：保持「这个年纪的孩子」不写死**（孩子已 12 岁，app 面向 1-9 年级）
- [x] **⑤两处比喻保留**：G19「借家什」（方言词是记忆钩子）、报名页「🦈 会咬人的规则」（这节最该被记住的就是真会咬人的规则）
- [x] **⑥勋章「持之以恒」保留**（累计 30 天、无断签暗示）；不与「学满三天/七天」统一措辞——三者都是累计口径即可
- [x] 回归全绿：preflight 四项 ✔ 八课 untouched ✔ smoke 41+30 零失败（唯一 console error 为预期 g51 探针）✔ sw-check（唯一缓存 `ea-v0.9.9`、真断网 504 兜底、清内容缓存不动壳）✔ modal 双跑一次全绿（0.9.33 答题态 17 项）✔ 行为级 20/20（B2 返回 5 + B3 模式术语 9 + B4 闭环 6，临时页跑完已删）+ 引号渲染探针（PET 话题页正常、全采样零 U+FFFD）✔
- [x] 窄屏 shot 13 页 `w=360` 零新溢出（引号全角化略增宽度专项：幼/小/初语法点详情、3/8 年级词卡单元详情、PET 词库页、exam-knowledge 全过）
- CACHE_VERSION **ea-v0.9.85 → ea-v0.9.9**

### 📌 B6 续跑说明（AI 增强 MVP，家长验收 B5b 后开工）
- 挂点已盘好（0901 体检报告）：lesson.js:310 错因解释 / lesson.js:198 换说法 / lesson.js:412 侦探判定（行号为体检时点位，开工时重新定位）
- 错题上下文字段口径见 B4 记录（`QUIZ_MISTAKES` 12 字段，勿改）；配合 `data/grammar/gXX.json` 九段讲解即完整 prompt 素材
- API key 存独立键**勿进 KEYS 枚举**（防 exportAllData 泄漏）；SW 只拦 GET，POST API 不受缓存影响
- 红线照旧：八课数据零改动（备份+untouched）、新答题页接 enterFocus 且不 bindBack、中文一律 node utf8
- **B6 顺带定夺「智能批改」命名**（B5c 拍板②）：接真 AI 到写作批改位则名实相符可保留；不接则改「写作体检」
- 收尾照旧：preflight 四项、三件套真实时钟全新 profile、行为级回归复跑、sw → ea-v0.9.95 或按当时序号（全局单调递增；0.9.9 已被 B5c 用掉）

---

## B6a：AI 设置页 + key 存储（缓存 `ea-v0.9.95`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> 只做设置页/key 存储/连通性测试，不接任何 AI 功能点（B6b）、不做离线降级（B6c）。八课零改动（untouched 对 `tools/backup/B5c/` 复跑全过，本批未碰任何数据文件）。

- [x] **B6a-2 key 存储接口**（依赖序先做）：`utils/ai-key.js`——独立裸键 `eaAiKey`/`eaAiCfg`，**不进 KEYS 枚举**，exportAllData/importAllData/resetAll 均触及不到（「清空全部数据」不清 key——key 是家长设置，设置页有专属清除按钮）；`hasKey()/getKey()/setKey()/clearKey()/keyTail4()`（UI 只显示后 4 位）+ 服务商注册表（本期 DeepSeek，加服务商=加一条记录）+ `getAiConfig()/setAiConfig()`；全部读写兜 try/catch 防隐私模式
- [x] **B6a-1 设置页**：`modules/ai-settings.js`，入口在「我的」页（不进首页防孩子误触，标注「可选 · 家长设置」）；服务商选择/密码型 key 输入（👁 按住临时明文，松开复原）/模型名（默认 deepseek-chat）/保存/清除；家长向说明卡：哪里申请（链官网+三步图文）、费用量级（按量计费月几元内、以官网为准）、只存本机不上传、换设备重填、**可选功能不填不影响现有全部功能**
- [x] **B6a-3 连通性测试**：最小请求（让模型只回一个字，max_tokens=5），15 秒 AbortController 超时不卡 UI，测试中按钮禁用防连点；结果三态+增值态：成功 / key 未通过验证(401/403) / 网络不可达（fetch 失败与超时分开提示）/ 402 余额不足指向充值 / 400/404 模型名不对指向默认值；文案平静，零 key 回显
- [x] **★ 安全红线六项全过**：①key 只由家长手动粘贴、只存本机 ②源码/配置/注释/测试零 key（真实 key 模式 `sk-[A-Za-z0-9]{20+}` 全仓库扫描零命中）③sw.js 仅登记模块文件本身，key 不在任何 URL 枚举（且 SW `req.method !== 'GET'` 直接放行——DeepSeek POST 完全不经过 SW）④新模块零 console.log、错误信息零 key 回显 ⑤.gitignore 复核（结果文件已忽略、无含 key 本地文件风险）⑥本批 3 个 commit 的 diff 全文扫描零可疑串
- [x] 回归全绿：preflight 四项 ✔ 八课 untouched ✔ smoke 41+30 零失败（全新 profile 无 key 状态跑完全程 = 与 0.9.9 行为等价的实证）✔ sw-check（唯一缓存 `ea-v0.9.95`、壳 54→56 两个新模块入壳、真断网 504、清内容缓存不动壳）✔ modal 双跑全绿（0.9.33 答题态 17 项；设置页无弹层无死弹窗风险）✔
- [x] 行为级 **20/20 + B6a 专项 9/9**（临时页跑完已删）：B2 返回 5 + B3 模式术语 9 + B4 闭环 6 全部在**无 key 状态**下通过；B6a：keyless 基线 ✓ 我的页入口 ✓ 设置页渲染 ✓ key 存→尾号 abcd→清除往返 ✓ exportAllData 不含 key 与键名 ✓ 重渲染 UI 不回显完整 key ✓ 无 key 点测试平静提示不发请求 ✓ 配置默认值 ✓
- [x] 窄屏 shot：ai-settings 360/320 + me 360 + home 360 零溢出（key 输入框 flex-1+min-width:0，长 key 不撑破；已存 key 时 UI 只显示尾号更不会溢出）
- CACHE_VERSION **ea-v0.9.9 → ea-v0.9.95**

### 📌 B6b 续跑说明（三个 AI 接入点，家长验收 B6a 后开工）
- **可调用的 key 接口**（`assets/js/utils/ai-key.js`）：`hasKey()` 判断是否启用 AI 增强；`getKey()` **只准在组装 fetch 请求头时调用**（`Authorization: Bearer`）；`getAiConfig()` 取 `{provider, model}`；`PROVIDERS[provider].endpoint` 取接口地址。UI/日志一律 `keyTail4()`
- **三个接入点**（0901 体检盘好，行号会漂移，开工时以内容定位）：语法大厅 `lesson.js` ①闯关答错处「AI 解释我这个错法」②讲解页「换个说法再讲一遍」③侦探关自评处「AI 帮我判改得对不对」
- **错题上下文**：`storage.getQuizMistakes()` 的 `QUIZ_MISTAKES[qKey] = { src,kind,lesson,lessonTitle,stage,q,options,picked,correct,explain,t,n }`（B4 口径**勿改**）；配 `data/grammar/gXX.json` 九段讲解即完整 prompt 素材（版权红线：prompt 里只用自家原创内容）
- **健康护栏**：AI 回复是增强不是依赖——无 key/请求失败时静默隐藏 AI 按钮或平静降级（详细降级逻辑属 B6c）；不打断答题态（0.9.33），不加流式打字机效果制造停留
- 红线照旧：八课零改动、新增答题交互接 enterFocus 不 bindBack、`bindBack` 后禁再赋 onclick、中文 node utf8；「智能批改」命名在 B6b 一并定
- 收尾照旧：preflight、三件套全新 profile、行为级回归（B2/B3/B4/B6a 全复跑）、key 泄漏 grep、sw → ea-v0.9.96 或按当时序号

---

## B6b：三个 AI 接入点（缓存 `ea-v0.9.96`，2026-09-01，✅ 完成，⏸ 硬停机等家长验收）

> AI 做增强不做替代：绝不现场生成语法讲解（50 课过了考纲边界验证），只做静态内容做不到的三件事。所有提示词都带本课/本题已有内容作硬上下文，写死「只在材料范围内讲、不引入课外语法概念、3-4 句、温和不批评」。八课零改动（untouched 对 tools/backup/B5c 复跑全过）。

- [x] **底座 `utils/ai-chat.js`**：askAI（20 秒 AbortController 超时；getKey 全站仅两处调用且都在组装请求头/尾号函数，本批复核 ✔）+ aiFailText 六态平静降级（nokey/badkey/nobalance/timeout/network/server，一律指回静态内容，不弹窗不空白）+ eaAiExplainCache 错因缓存（裸键、100 条 FIFO、不进 KEYS、同题不重复花钱）+ 三接入点提示词构造
- [x] **B6b-1 错因解释**（最优先）：错题本每条题目卡 +「大厅闯关结果页做错的题」逐题（两处共用同一缓存）；prompt 用 B4 字段原口径（src/kind/lesson/lessonTitle/stage/q/options/picked/correct/explain 一字未改），要求解释「她为什么会这么选＋怎么想才对」，侦探形态错题自动切「改法」措辞
- [x] **B6b-2 换个说法**：讲解页乐队故事卡下「没听懂？让 AI 换个说法再讲一遍」；prompt 带九段要点（本质/为什么/乐队故事限流 400 字＋规则条目）作硬上下文，一条新语法不能加、保持乐队比喻调性、200 字以内；可反复「再换一个说法」
- [x] **B6b-3 侦探判定**：改法与参考不一致时「拿不准？让 AI 帮你看看你的改法」；判定规则写死保守倾向（多种正确改法/病因改掉即算对/拿不准倾向认可/绝不武断判错/第一句先给结论）；**AI 只给参考意见，selfOk/selfNo 自评与 B4 落盘逻辑零改动，最终孩子定夺**（输出尾注「最后由你来定」）
- [x] 健康护栏：三处都只在主动点击时调用，不打断答题态（错因在结果页/错题本、判定在提交后）；加载态「想一想…」平静、按钮禁用防连点；无效率压迫文案
- [x] **行为级 53/53**（临时页 mock 网关实测后已删）：B2 返回 5 + B3 术语 9 + B4 闭环 6 + B6a keyless 9 + **B6b 24**——keyless 三面按钮全部不渲染（讲解页/结果页/错题本，且全程零 AI 请求=与 0.9.95 等价实证）；错因全链路（按钮→请求→渲染）+ prompt 内容断言（含题面/选项/她选/课号/「只在本题考点范围内」/「绝不引入材料之外的语法概念」）+ 缓存命中零新请求；**四异常路径实测**：401→「钥匙没通过验证」、402→「余额」、断网→「网络不通」、挂起 20 秒→「想得太久」，失败后按钮恢复可重试、恢复后成功；换说法（prompt 含九段要点+硬约束、再换一个、**600 字长回复+超长英文词实测零横向溢出**）；侦探判定（保守 prompt 断言、自评按钮保留、结论前置）
- [x] 回归全绿：preflight 四项 ✔ 八课 untouched ✔ smoke 41+30 keyless 零失败 ✔ sw-check（唯一缓存 ea-v0.9.96、壳 57、真断网 504）✔ modal 双跑（0.9.33 答题态 17 项）✔ 窄屏 shot 4 页 360 零溢出 ✔
- [x] 安全复核：真实 key 模式全仓扫描零命中；本批 diff 零可疑串；新文件零 console；AI 请求为 POST 不经 SW（`req.method !== 'GET'` 直接放行）
- ⚠️ 真实模型输出验收：本机自动化用 mock 网关验的是「请求组装/渲染/降级」全链路；**真实 AI 回答质量需家长在已配 key 的设备上各点一次**（错题本任一题的 🤖 按钮 / 任一课讲解页 🤖 按钮 / 侦探关改错后 🤖 按钮），见报告验收指引
- CACHE_VERSION **ea-v0.9.95 → ea-v0.9.96**

### 📌 B6c 续跑说明（离线降级完善，家长验收 B6b 后开工）
- 现状（B6b 已做的基础降级）：无 key 按钮不渲染；请求失败六态平静文案指回静态内容；超时 20 秒保护；失败后可重试
- B6c 待做：①离线感知——`navigator.onLine === false` 时按钮直接以「离线」态呈现或隐藏，不用等 20 秒 fetch 失败 ②连续失败退避——同会话连续 N 次失败后本次会话内收起 AI 按钮，避免孩子反复点反复失败 ③缓存查看——已缓存的错因解释在离线时也能看（eaAiExplainCache 已存本机，只差离线时读取展示的 UI 态）④「智能批改」命名定夺落地（B5c 拍板②：写作位不接真 AI 则改「写作体检」）
- 接口就绪：`aiEnabled()`（utils/ai-chat.js 转出）/ `askAI` 返回 `{ok:false, reason}` 六态已可区分离线场景；缓存读取 `getCachedExplain(qKey)` 离线可用
- 红线照旧：八课零改动、key 安全六项、AI 定位红线（增强不替代）、中文 node utf8
- 收尾照旧：preflight、三件套全新 profile、行为级回归（B2/B3/B4/B6a/B6b 全复跑）、key 泄漏 grep、sw → ea-v0.9.97 或按当时序号

---

## B6c：AI 离线降级完善 + 写作 AI 批改（缓存 `ea-v1.0.0`，2026-09-02，✅ 完成，⏸ 硬停机等家长验收）

> B 系列收官批。八课零改动（untouched 对 tools/backup/B5c 复跑全过）。
> commit 结构说明：单元 3「离线读缓存」的两块拼图分别落在 B6c-1（缓存上限 100→200）和 B6c-2（离线读取+「离线 · 上次的解释」标注）——三态在四个站点是同一处模板的分支，拆三次提交会重复改同一批行，故按内聚落盘、commit message 各自注明。

- [x] **B6c-1 离线即时感知**：askAI 先查 `navigator.onLine`，离线立即返回不发请求不等 20 秒；onLine 不完全可靠 → 20 秒 AbortController 兜底保留（两层都在）；`onBackOnline()` 一次性 online 监听供按钮自动复原
- [x] **B6c-2 连败退避**：key 类失败（401/403/402）计连败，满 3 次会话内挂起——渲染期灰字「AI 助手暂时休息…」替代按钮、点击期即时休息提示；网络/超时/服务端抖动**不计**（防临时故障锁死）；成功清零；纯内存态刷新即重置、零持久化
- [x] **B6c-3 离线读缓存**：已缓存的错因解释离线照常可读＋「（离线 · 上次的解释）」小字；未缓存按钮呈「联网后可用」禁用态，联网自动复原；缓存上限 200 条 FIFO
- [x] **B6c-4 写作 AI 批改（B5c 拍板②落地：接真 AI，「智能批改」名实相符保留命名）**：两处——年级写作工坊批改结果页（规则引擎四维评分照旧，AI 只补方向）+ KET 写作实验室 Part 6/7（自评清单与 Write & Improve 照旧，prompt 带任务要点/三图场景）。护栏写死进 prompt：**不打分**（分数交 W&I 或家长）、**不改写全文不代写**（最多示范一个短语）、**必须先肯定具体一处**绝不否定开头、KET 三维度 Content/Organisation/Language 各一句、1-2 处可改只指方向、180 字内；写不满 10 词先不点评
- [x] **行为级 76/76**（临时页 mock 网关 + onLine 可控覆盖，跑完已删）：B2 返回 5 + B3 术语 9 + B4 闭环 6 + B6a keyless 9 + B6b 25 + **B6c 22**——写作两处全链路（按钮→请求→渲染 + prompt 护栏断言「绝不打分/不替她写句子/先真诚地肯定/Organisation」+ 作文与任务要点进 prompt）；离线：askAI 即时返回（<1.5 秒且零请求）、未缓存按钮禁用「联网后可用」、已缓存照读＋离线标注、换说法按钮离线态、online 事件自动复原、重渲染回正常；退避：网络失败×2 不计连败、402×3 挂起、挂起后点击休息提示＋按钮隐藏、重渲染两站点灰字替代、零持久化断言
- [x] 回归全绿：preflight 四项 ✔ 八课 untouched ✔ smoke 41+30 keyless 零失败（=与 0.9.96 等价）✔ sw-check（唯一缓存 `ea-v1.0.0`、真断网 504）✔ modal 双跑 ✔ 窄屏 5 页 360 零溢出（含两个写作页）✔
- [x] 安全复核：真实 key 模式全仓零命中；getKey() 仍仅两处请求头；新增代码零 console；AI POST 不经 SW；缓存内容仅存 AI 回复文本不含 key
- ⚠️ 真实模型输出验收（同 B6b）：mock 验的是全链路与护栏，**真实回答质量需家长在已配 key 设备上实测**——新增第 4 个点位：写作工坊写一篇 → 智能批改 → 「🤖 让 AI 老师点评几句（不打分）」
- CACHE_VERSION **ea-v0.9.96 → ea-v1.0.0**（B 系列收官，V0.9 优化全部完成）

---

## 🏁 B 系列总结（2026-09-01 ~ 09-02，V0.9.65 → V1.0.0）

依据 0901 全站只读体检报告，按「高危 bug → 信息架构 → 学习闭环 → 文案 → AI 增强」顺序推进，每批硬停机等家长验收：

| 批次 | 内容 | 线上版本 |
|---|---|---|
| B1 | 设计系统：token 唯一事实源（style.css :root + tw-config.js）、字号 8 级/色板 46/间距 8 级，禁止硬编码 | ea-v0.9.65 |
| B2 | 高危 bug 4 项：双绑定返回竞态 12 处、PET 语法兜底、错词突击入口、首页任务全模式可完成 | ea-v0.9.7 |
| B3 | 模式感知 + 术语统一：首页卡随模式如实标注（消灭静默改道）、三态模式横幅、七组术语按拍板表落地 | ea-v0.9.75 |
| B4 | 学习闭环：QUIZ_MISTAKES 错题落盘（12 字段口径）、错题本五分区、回课直达定位规则段、反向 chip、突击回来路 | ea-v0.9.8 |
| B5a/b/c | 文案清扫：词库 tips 标点脚本 483 处、UI/讲解人工打磨 188 处、六项拍板落地（引号 1418 处全站「」、Part5 阈值 4/6 等） | ea-v0.9.82/85/9 |
| B6a/b/c | AI 增强：设置页+key 安全存储（六项红线）、三接入点（错因/换说法/侦探判定）、离线降级+连败退避+写作 AI 批改 | ea-v0.9.95/96/**1.0.0** |

**遗留待办（V1.0 后按优先级）**：
1. **浏览器后退 history 哨兵**——体检 IA 根因之一「无 history 栈」只做了 onclick 单一路径治理，浏览器物理后退键仍直接退出应用；需 pushState 哨兵方案
2. **闯练/模考进度快照**——大厅闯关与模考中途退出不保存进度（答题态确认弹窗已防误触，但确认离开后本轮作废）；可做每题落盘的会话快照
3. **PET 词库补完到 3500**——现 2571 词/22 话题（V0.5-PET-s1 第 1 会话：feelings/money/communication/nature 已扩，余 time + 新增 B1 话题）；PET 阅读 15 篇同步扩
4. 内容主线（V0.9~1.0 扩容总纲）：四阶读本 P5-P7（reader 数据层 P0 已就位）
5. 真实模型输出质量调优——家长实测四个 AI 点位后，按反馈迭代提示词（提示词全部集中在 utils/ai-chat.js）

---

## V0.5-PET-s1：PET 词库补完 · 第 1 会话（缓存 `ea-v1.0.1`，2026-09-02 开工 / 2026-09-15~16 续跑，✅ 第 1 会话完成，⏸ 硬停机等家长验收）

> B 系列总结遗留待办 ③ 开工。范围：五个未扩话题 feelings / money / communication / nature（本会话）+ time 与新增 3 个 B1 话题（第 2 会话）。
> 规则：官方 B1 词表不入库不粘贴，音标/中文/例句/记忆法/搭配 100% 原创；与 A2 重叠标 inKet（shared-a2-words.json 只读）；跨话题重复基线 54 只降不升；Schema 与既有 22 话题完全对齐不新增字段。

- [x] **开工（1b0c8cf）**：五个未扩话题 inKet 背填 104 处（补齐 shared-a2 机制存量欠账）+ check-data.mjs 增 PET 词库常驻校验（字段口径/id 连号/totalWords/inKet 一致性/跨话题重复基线 54，preflight ② 项内生效）
- [x] **feelings 36→152（fe62ee1）**：情绪形容词/名词化、-ed·-ing 辨析对 5 对、身体反应动词、情绪短语 9 条、情绪副词 6 个
- [x] **money 36→127（a2d82a6）**：银行动作链/财务名词/价格变动/金钱短语 12 条/财富形容词；博彩词条配审慎文案
- [x] 2026-09-15 进度文件对齐磁盘：PET 全库累计 **2350 词**（22 话题，跨话题重复 54=基线，check-data 全绿）
- [x] **communication 36→151（+115）**：言语行为动词(announce·inform·warn·remind·persuade·convince·recommend·interrupt·admit·deny·claim·insist·beg·blame)/名词化(warning·reminder·recommendation·response·invitation·apology·misunderstanding)/电话动作链(dial·call back·put through·hold on·get through·leave a message·engaged·voicemail·landline)/联系短语(get·keep·lose in touch·in person·face to face)/邮政(postbox·postcode·sender·receiver·package)/书写符号(capital letter·comma·full stop·question mark·exclamation mark·alphabet·signature)/非语言(sign·body language·nod·shake hands·eye contact)/口语形容副词(fluent·chatty·talkative·aloud·bilingual·native·briefly·frankly)/沟通短语(speak up·point out·make sense·small talk·catch up·get across·bring up)；Schema+编码+去重全过（跨话题重复 54=基线），累计 2465
- [x] **nature 36→142（+106）**：地貌水体(volcano·lava·erupt·canyon·gorge·peak·summit·slope·ridge·mountain range·bay·shore·tide·current·seabed·coral·rock pool·sand dune·oasis·swamp·marsh·meadow·landscape·horizon·wilderness·nature reserve)/石头化石(pebble·boulder·crystal·fossil·dinosaur)/植物部件与种类(bush·hedge·trunk·twig·blossom·petal·bud·stem·thorn·moss·fern·weed·vine·pine·oak·palm tree·bamboo·cactus·rose·tulip·daisy·sunflower·acorn·pine cone·berry)/农事动词(harvest·bloom·grow·dig·pick·water·farmer·orchard)/天象(shadow·fog·dusk·universe·moonlight·full moon)/户外活动(camp·go camping·go hiking·trail·footpath·explorer·climber·viewpoint·hut·cottage·log·firewood·footprint·in the open air·in the wild)/地形形容词(rocky·sandy·steep·shallow·deep·leafy·shady)；Schema+编码+去重全过（跨话题重复 54=基线），累计 2571
- [x] **全库校验**：check-data PET 常驻校验 22 话题 **2571 词**、跨话题重复 **54 = 基线**（四话题新词零引入重复）；Schema 全过；编码守卫 144 文件全过；四话题 inKet 与 shared-a2 只读清单一致（money 15 / communication 32 / nature 35）
- [x] **PET 页面实跑**（临时页 _petcheck.html，真实时钟全新短路径 profile，跑完已删）：话题网格 22/22 ready 且四话题在列；四话题落地页词数 = 文件 totalWords = words.length（152/127/151/142），关数 = ⌈n/8⌉（19/16/19/18）；词卡：nature 第 1 词 mountain → 连点 36 次到第 37 词 volcano（本批首个新词）释义/例句/记忆法/搭配 chips×2/频率标签全渲染，进卡自动发音 + 🔊 手动发音均触发真实 speechSynthesis（非桩）；闯关引擎：communication 地图 19 节点、第 1 关 #playArea/#hud 加载、答错落盘 pet-communication-001、✕→确认→离开回地图且导航恢复；错题本：闯关错词 + 直接落盘的 pet-nature-100 都以「PET · 话题名」标签显示，单词分区计数 2，卡内 🔊 可发音
- [x] **sw → ea-v1.0.1**（依据两条，任一都够）：① topics.json 在壳预取清单 sw.js:76（本批未改它，因为它没有词数字段，词数只在各 pet-*.json 的 totalWords）；② 词库 pet-*.json 走内容缓存 **cache-first**（sw.js handleContent 命中即回，不回源），不 bump 则访问过这四个话题的老客户端永远读 36 词旧文件——这是必须 bump 的真正原因，上一会话 feelings/money 扩完未 bump 也一并由本次覆盖
- [x] 八课零改动守卫（对 tools/backup/v05-pet-s1，逐字段 + sha256）✔ preflight 四项 ✔（ESM 40 文件 / Schema+编码 / sw 登记 / ketLessonMap）
- [x] **行为级回归**：B4 闭环 **6/6**（G01 环节 1 答 16 题→10 条 hall 错题 12 字段齐全→错题本 hall 分区显示→回看本课讲解落 G01 且带返回按钮→返回回 hall 分区→反向 chip「本课你有 10 道错题」→只看 G01 过滤视图）；modal-check 双跑（默认宽 + ?w=360）**0 false / 0 溢出 / 无死弹窗**（0.9.33 答题态 17 项、孤儿计时器、写作草稿回填未改坏）
- [x] smoke **41 在线 + 30 离线零失败**（唯一 console error 为预期 g51 探针）；sw-check：唯一缓存 `english-adventure-ea-v1.0.1`、壳 57 项、真断网 504 兜底、清内容缓存不动壳 ✔
- [x] 窄屏 shot ?w=360：PET 话题落地页（petlevels·nature）与词卡页（communication·识词）**零溢出零小热区**；话题网格页在默认无头窗口（viewport 970 触发 4 列媒体查询）报 4 列右缘 385——属坑 6/13 同族伪差，改 --window-size=500 让 2 列规则生效后复测 **零溢出**（真机 360 走 2 列）
- 本批 commit：cf8b1e6 进度对齐 → bd8ec89 communication → 43b3f3f nature → 收尾 sw+CHECKLIST；连同上一会话 1b0c8cf/fe62ee1/a2d82a6 一次 push

### 📌 第 2 会话续跑说明（家长验收本批后开工）
- 范围：**time 34→~110** + **新增 3 个 B1 话题**（候选 society / science-tech / arts-culture / media / law-rules / abstract-concepts 中选 3，各 ~130 词）→ 目标累计 ~3100
- 新话题要做的登记：新建 `data/pet/words/pet-<id>.json`（topic 字段 = 文件名，id 连号 pet-<id>-001 起）+ `data/pet/topics.json` 追加 {id,name,icon,file,status:'ready'}；check-data 按文件名 pet-*.json 自动纳入校验；topics.json 在壳预取清单 → 收尾必 bump sw（ea-v1.0.2 或按当时序号）
- 去重：跨话题重复基线 54 只降不升；候选先过全库词表再写（communication 剔 67 处、nature 剔 130 处候选冲突，命中率高，务必先筛）；A2 重叠由 merge 自动打 inKet
- 工艺：scratchpad petlib.mjs（globalMap / W() 构造式 / validate / merge 自动 id·inKet·totalWords）+ run.mjs；例句 8-15 词贴 11-13 岁生活；谐音「」内纯汉字；弱谐音宁改 root/assoc；一话题一 commit 同步 CHECKLIST 与 memory 进度文件；★ 改 CHECKLIST 用脚本文件 + replace 函数替换器（字符串里的 $ 与反引号会被 String.replace 当特殊模式，本批踩过一次）
- 收尾照旧：check-data + preflight + untouched + 三件套（真实时钟、全新短路径 profile、测完杀光 eap 进程）+ PET 页面实跑 + B4 闭环 6 + 窄屏 shot（网格页记得 --window-size=500 复测）+ push 后硬停机

---

## P-L0：KET 听力训练引擎 + L01 样课（缓存 `ea-v1.1.0`，2026-09-16，✅ 完成，⏸ 硬停机等家长手机验收 L01）

> 新模块「听力训练营」：50 课规划、本批只做引擎 + 一课样课，不批量产课。版权红线：官方听力音频/tapescript/样卷一字不读不参考（Docs 下 pdf/zip/mp3 仅供家长自用，.gitignore 已拦）；脚本 100% 原创；音频只用 Web Speech API 实时合成，不入库任何音频文件。八课数据零改动（untouched 对 `tools/backup/pl0/` 全过）。

### 单元 1 · 语音检查页 + 双声道 TTS（4797f3a）
- [x] `speech.js` 新增：`isTTSSupported / listEnglishVoices / waitForVoices(等 voiceschanged，最多 1.5s) / pickDialogueVoices / speakDialogue`。选声：按名字猜性别优先一男一女、本机语音优先；只有两个不同声但猜不出性别就各占一个；★只有一个英文声时用音调 0.75（男）/1.25（女）区分
- [x] `speakDialogue(turns,{rate,gap,voices,onTurn,onEnd})`：按 turn 拆多段 utterance，turn 之间停 700ms（规范 0.6-0.8s，实测 700/700）；只提供播放/取消——★ iOS 的 pause/resume 不可靠，故意不做拖动暂停；onend 不触发时按字数估时长强制推进（防播放态卡死）；攥住 utterance 引用防 Chrome GC 丢 onend；cancel 后延迟 120ms 再开口（部分 Chrome 会吞掉 cancel 后立刻的 speak）
- [x] `storage.js` 新增 `KEYS.LISTENING`（voiceOk / voiceCheckedAt / voiceNames / mode），随导出导入重置走既有规范；课程成绩仍走 `EXAM_DRILLS`（id = `lis-LXX`）
- [x] 新模块 `modules/voice-check.js`（路由 `voice-check`，入口在「我的」）：检测英文语音数、列出说话人 A/B 各用哪个声音、试听原创两句对话、「能听清，确认能用」落盘；全部语音折叠列表带本机/在线标注。无英文语音：平静提示 + 按平台（iPhone/iPad · 安卓 · Mac · Windows）给系统语音包安装指引 + 重新检测；浏览器不支持 speechSynthesis 也有单独文案

### 单元 2 · 听力引擎（9eb53ab）
- [x] 新模块 `modules/exam/listening.js`（路由 `exam-listening`）。课结构固定四步：**① 听前热身**（词表逐词 🔊）→ **② 盲听答题**（逐段播放 + 作答，不给对错；允许空题交卷，二次点击确认）→ **③ 对答案 + tapescript**（逐题 ✅/❌ + 我的/正确答案 + 解析 + 逐 turn 原文 + 🔊 再听不限次）→ **④ 跟读**（逐 turn 示范 → 🎤 录音 → `alignWords` LCS 词级对齐，≥75 过关，漏词下划线/多词删除线）
- [x] 题型严格对齐 KET 五部分，不自创：Part 1 三图单选（SVG 图标 grid-3、按钮 ≥48px）/ Part 2 填空（`normalizeGap`：大小写不敏感、首尾空格容错、内部多空格合一、去句末句号；★拼写必须完全正确；英文数字词 ↔ 阿拉伯数字互认，twenty-five/twenty five/25 等价；`alt` 备选答案）/ Part 3·4 三选一 / Part 5 匹配（5 项配 A-H 8 选项下拉，≥48px）
- [x] ★ 两遍机制：模拟模式每段严格 2 遍；练习模式 3 遍并在段头标注「练习模式」；用完后按钮禁用并提示「真考每段只放两遍」；模式开关在训练营首页（存 `LISTENING.mode`）
- [x] ★ 答题态接 0.9.33：`enterFocus`（不 bindBack，‹/Esc 先确认，remain = 未作答题数，note 说明录音会停）；cleanup 与所有离开路径都 `stopPlayer()` 取消朗读；跟读为 ★ 级 `confirm:false`
- [x] 错题落盘：`src:'listen'`，口径对齐 B4 12 字段（q = `[听力 Part N 题型] 题干` 摘要、lesson = L01、stage = Part 1、options/picked/correct 用 `A. 7:30` 文本）；答对同 qKey 自动毕业。错题本新增「🎧 听力」分区 + 「回到这一课再听 → L01」直达；meta 行 Part 标注不再套「环节」前缀
- [x] 入口：备考中心 hub 新增「听力训练营」整行卡；阅读听力页拆成「听力训练营」+「听力套题（旧 3 套 25 题，模考仍用）」两入口；旧套题页顶部加回训练营链接

### 单元 3 · SVG 图标库（6e1dbda）
- [x] `assets/img/listening/` **44 个**：时钟 6（0700/0730/0800/0815/0845/0330）· 价格牌 4（£2.50/5/10/15）· 天气 6 · 交通 6 · 食物 8 · 活动 8 · 场所 6；生成器 `tools/gen-listening-icons.mjs`（**改图标改脚本再生成，不手改 SVG**）；清单 `data/exam/ket/listening/icons.json`（id / category / file / 英文 alt / 中文说明），SVG 内含 `<title>` + `aria-label`
- [x] **命名规范**：文件名 `<类别>-<细项>.svg`，全小写，只用 a-z0-9 与连字符；类别 ∈ clock / price / weather / transport / food / activity / place；时钟 `clock-HHMM`（24 小时制补零）；价格 `price-<整数>[-<小数两位>]`（price-2-50 = £2.50）；统一 `viewBox 0 0 120 120` 正方形；自带米色底 #FFF8F0 + 浅橙描边（同记忆卡 SVG，属设计系统豁免③）；粗描边 4-5、圆角、少细节，96px 以下可辨；课文件 `options[].icon` 只写 id 不带扩展名
- [x] 白底/深底两张 contact sheet 目测清晰（价格牌文字与孔位、意面图第一版不佳已改）

### 单元 4 · L01 样课（d73904b）
- [x] `data/exam/ket/listening/l01.json`《学校的一天 A Day at School》：阶段一 · 只练 Part 1 · 5 题，每题 4 轮原创短对话（校车几点出发 / 怎么去学校 / 午饭吃什么 / 下午做什么 / 放学在哪见）+ 3 张图；考点覆盖时间·交通·食物·活动·地点；解析写清 usually…but / going to / first·after that 等干扰规律；语速 0.8x；热身 10 词全在 A2 表
- [x] 索引 `data/exam/ket/listening/index.json`（三阶段规格：一 0.8x L01-L10 Part 1 / 二 0.9x L11-L30 +Part 2·3 / 三 1.0x L31-L50 +Part 4·5；rules 两遍/三遍与 95% 词汇线）+ Schema 两份（`_schema.index.json / _schema.lesson.json`）；`data/exam/index.json` files 补登记
- [x] 新工具 `tools/check-listening.mjs`（preflight ⑤）：题型口径逐 Part 校验（Part 1/4 每段 1 题 3 选项、Part 2/3/5 一段 5 题、Part 5 8 选项答案不重复）、图标 id 必须在清单、Part 1 每段 4-6 轮（每轮 >2 句告警）、★ A2 词汇覆盖 ≥95%（KET 1416 词 + 多词条目短语匹配 + 简易词形还原 + 功能词/称呼白名单，`names` 登记的人名不计）且超纲词必须进 warmup、warmup 自身必须在表内——**L01 实测 297/297 = 100%**；`check-data.mjs` 登记听力 index/lXX Schema 并默认全量校验

### 收尾（本 commit）
- [x] preflight 五项 ✔（ESM 42 文件 / Schema 4 + 编码 149 文件 / 听力课 / sw 登记 / ketLessonMap 50 课）；八课 untouched 对 `tools/backup/pl0` ✔
- [x] **行为级 L01 全流程**（临时页 `_pl0check.html`，mock speechSynthesis 两个假英文声 + fetch 覆盖合成一课 L99 验 Part 2/5，跑完已删）：默认宽与 ?w=360 双跑 **0 false / 0 错误**——双声道分配（男/女声各一、单声时音调 0.75/1.25）· turn 间隔实测 700ms · cancel 后不再开口 · Part 2 判分 8 例（数字词/连字符/句号/大小写/拼错不过）· 热身 10 词逐词发音 · 盲听三图并排 + 练习模式 3 遍上限到点禁用（4 turn × 3 = 12 utterance）· 第 2 段 ‹ 弹「还有 3 题没做完」继续留原题 · 交卷 2/5 · 5 段 tapescript + 5 条解析 + 再听 · 3 条错题 12 字段齐全（src=listen · Part 1 · `A. 7:00` / `B. 7:30`）· 跟读 20 轮示范自动播 → 完成 → 回首页显示「最好 40%」· 错题本「🎧 听力 3」分区 → 回课直达 → 再做全对自动毕业且 best 100/tries 2 · 模拟模式无「练习模式」标且 2 遍禁用 · 「离开」真正退出并取消朗读 · Part 2 五个输入框 / Part 5 五个下拉 + 8 选项 / 长 tapescript 在 360 宽零溢出零小热区 · 判分 8/10（拼错 hats、匹配错 1）· ★无英文语音降级（getVoices 返回空）：语音检查页给 🔇 + 安装指引 + 重新检测且不渲染试听键，课内播放给提示且流程不卡 · 有声音时检测到 2 个 / 说话人 A·B / 试听两句用不同声 / 确认落盘 / 「我的」入口文案跟着变
- [x] modal-check 双跑（默认宽 + ?w=360）**0 false / 无死弹窗**，新增 ⑨ 听力答题态专项（导航与年级键隐藏 / 三图 / ‹ 弹确认 / 遮罩不关 / 继续留原题 / Esc 弹 / 离开回训练营且导航恢复）；虚拟时钟下 gradePicker hot48 伪差按坑 13 真实时钟复测为 true
- [x] smoke **45 在线 + 32 离线零失败**（新增 exam-listening / L01 热身 / 旧套题 / voice-check 在线 + 训练营与 L01 离线两条，唯一 console error 为预期 g51 探针）；sw-check（全新短路径 profile，真断网）：唯一缓存 `english-adventure-ea-v1.1.0`、壳 61 项、离线 504 兜底、清内容缓存不动壳 ✔
- [x] 窄屏 shot ?w=360：训练营首页 / L01 热身 / 盲听三图页 / 语音检查 / exam-hub / 阅读听力页 / 「我的」**全部零溢出零小热区**（填空 / 匹配下拉 / 长 tapescript 由行为级页在 360 宽实测零溢出）
- [x] sw → **ea-v1.1.0**（新模块 2 个 JS + 听力索引/图标清单进壳预取清单）
- 本批 commit：4797f3a PL0-1 → 9eb53ab PL0-2 → 6e1dbda PL0-3 → d73904b PL0-4 → 收尾（sw + smoke/modal 用例 + CHECKLIST + 交接文档）

### 📌 P-L1 续跑说明（L02-L10，家长在手机上验收 L01 后开工）
- 范围：阶段一余下 9 课，全部 **Part 1 · 5 题 · 0.8x**，题材轮转（爱好 / 购物 / 旅行 / 家庭 / 天气 / 食物 / 运动 / 假期 / 动物），每课一个专抓点（数字 · 时间 · 地点 · 价格 各至少两课）
- 工艺：复制 `l01.json` 结构（id/title/titleZh/stage/rate/parts/theme/names/intro/warmup 8-10 词/sections×5）；每段 4-6 轮、每轮 ≤2 句、干扰项三个都要在对话里出现、答案在 but / then / going to 之后；人名写进 `names`；跑 `node tools/check-listening.mjs L0X` 到 ≥95% 且超纲词全进 warmup；索引 `index.json` 追加 `{id,…,status:'ready'}` + questionCount；需要新图标就在 `tools/gen-listening-icons.mjs` 里加一条再生成（清单自动更新），命名按上面规范
- ★ 索引与图标清单都在 sw 壳预取清单 → 收尾必 bump（ea-v1.1.1 或按当时序号）；一课一 commit
- 收尾照旧：preflight（含 ⑤）+ untouched + 三件套 + 窄屏 shot（三图页用 `&click=%23startBtn`）+ 行为级页（本批 `_pl0check.html` 写法：mock speechSynthesis + fetch 覆盖；★测播放按钮要先等它进入 disabled 再等它恢复——handler 里先 await 语音清单才置 disabled，直接轮询会假失败）+ push 后硬停机
- 阶段二起才需要的引擎能力已就位（Part 2 填空 / Part 3·4 三选一 / Part 5 匹配、0.9x/1.0x 由 stage.rate 决定），L11 起只需产数据

---

## P-L1：听力阶段一 L02-L10（缓存 `ea-v1.1.1`，2026-09-16，✅ 阶段一 10 课完成，⏸ 硬停机等家长手机验收）

> 只产数据不改引擎（引擎唯一改动是 L03 暴露的热身页音标溢出修复）。规则同 P-L0：脚本 100% 原创、官方 tapescript 一字不读；音频只用 Web Speech 实时合成不入库；每课 `tools/check-listening.mjs` A2 覆盖 **9 课全部 100%**（超纲词全进 warmup）。八课数据零改动（untouched 对 `tools/backup/pl1/` 全过）。

### 单元 0 · 图标补充 37 个 + 校验器增强（01608f0）
- [x] `tools/gen-listening-icons.mjs` 新增 37 条，图标 **44 → 81**，新类别 **clothes / object / body**（`icons.json` 的 categories 同步）；全部由生成器产出、同规范同风格（viewBox 120、米色底、粗描边），白底/深底 contact sheet 目测清晰；body 类用红色虚线标不舒服处
- [x] `check-listening.mjs` 增强：不规则动词/复数还原表（fell→fall 等 90 条）、-ier/-iest/-y 还原、更多缩写、café 去音符匹配、TV 白名单；lesson Schema 的 `warmup.word` 允许大写与重音（T-shirt / café）
- 完整 81 图标清单见下方「★ 图标清单」

### 单元 1 · 九课数据（一课一 commit，规格与 L01 完全一致：Part 1 · 5 题 · 每题 4 轮原创对话 + 3 图 · 0.8x · warmup 9-10 词）
难度坡度分三档，专抓点（时间 · 数字/价格 · 地点 · 交通 · 食物 · 活动）每类至少两课：

| 课 | 题材 | 难度档 | 五题答案要点 | commit |
|---|---|---|---|---|
| L02 | A Weekend at Home 家里的周末 | 直给型 | 先做什么 / 早餐喝什么 / 奶奶带蛋糕 / 几点到 / 下午桌游 | e1b6160 |
| L03 | At the Supermarket 去超市 | 直给型 | 买鸡蛋 / 香蕉 £2.50 / 选香蕉 / 8 点关门 / 打车回家 | dc1d322 |
| L04 | Weather and Clothes 天气和穿衣 | 直给型 | 刮风 / 穿靴子 / 带伞 / 海边晴 / 穿毛衣 | d506cf0 |
| L05 | After-School Clubs 课外活动 | 一步推断 + 改口 | 舞蹈社 / 4:30 / 带鸡蛋 / 博物馆 / 免费 | 678d9e7 |
| L06 | A Birthday Party 生日聚会 | 一步推断 + 改口 | 送足球 / 3 点 / 三明治 / 公园 / 步行 | 26f8240 |
| L07 | A Day in the Park 去公园 | 一步推断 + 改口 | 带球 / 咖啡店碰头 / 现在晴 / 8 点关门 / 买果汁 | 8487310 |
| L08 | Holiday Plans 假期计划 | 三选项全出现，靠最终决定 | 去城市 / 坐火车 / 带书 / 8:45 发车 / 周末晴 | d6e55b4 |
| L09 | At the Doctor's 看病和身体 | 三选项全出现 | 肚子疼 / 3:30 看医生 / 只能看书 / 买药 / 骑车摔的 | fbe766e |
| L10 | The School Trip 学校旅行 | 接近真考 | 去城堡 / 8:15 发车 / 必带三明治 / 穿运动鞋 / £8 | b790618 |

- **直给型**（L02-L04）：答案句直接说出，干扰项靠 not / but 排除；**一步推断 + 改口**（L05-L07）：先说一个再改口，或要从两句拼出答案；**三选项全出现**（L08-L09）：三个选项都在对话里出现，只有最终决定是答案；**接近真考**（L10）：干扰更密、改口更晚，为阶段二 0.9x 做铺垫
- [x] 每课 `index.json` 追加登记 `status: ready` + questionCount 5；人名进 `names`；干扰项三个都在对话里出现，答案落在 but / then / going to 之后

### 单元 2 · L03 暴露的引擎小修（本收尾 commit，`modules/exam/listening.js`）
- [x] 热身页词表一行 = 🔊 + 单词 + 音标 + 中文；L03 的 supermarket 音标 `/ˈsuːpəmɑːkɪt/` 在 360 宽把整行撑出屏幕。修法：行容器加 `flex-wrap:wrap`，音标 span 加 `min-width:0; overflow-wrap:anywhere`，长音标折到下一行而不是溢出；其他课不受影响（单词 + 短音标仍一行）
- [x] 改了线上 JS → sw bump **ea-v1.1.1**（索引 `index.json` 与 `icons.json` 都在壳预取清单，加课也必须 bump）

### ★ 图标清单（81 个，P-L2 起先查这张表再决定是否加图标）
文件 `assets/img/listening/<id>.svg`，清单 `data/exam/ket/listening/icons.json`；「首用」= 第一次用到的课，「复用」= 其他也用到的课，空 = 至今未用。**加图标只改 `tools/gen-listening-icons.mjs` 再生成，不手改 SVG**；新图标标 ★（P-L1 新增 37 个）。

**clock 时钟（10）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| clock-0700 | 7:00 | L01 | L07 |
| clock-0730 | 7:30 | L01 | L03 L07 |
| clock-0800 | 8:00 | L01 | L03 L07 L08 L10 |
| clock-0815 | 8:15 | L08 | L10 |
| clock-0845 | 8:45 | L03 | L08 |
| clock-0330 | 3:30 | L02 | L05 L06 L09 |
| ★ clock-0300 | 3:00 | L02 | L06 L09 |
| ★ clock-0400 | 4:00 | L02 | L05 L06 L09 |
| ★ clock-0430 | 4:30 | L05 | — |
| ★ clock-0830 | 8:30 | L10 | — |

**price 价格牌（7）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| price-2-50 | £2.50 | L03 | — |
| price-5 | £5 | L03 | L05 |
| price-10 | £10 | L05 | L10 |
| price-15 | £15 | L10 | — |
| ★ price-3 | £3 | L03 | — |
| ★ price-8 | £8 | L10 | — |
| ★ price-free | FREE 免费 | L05 | — |

**weather 天气（6）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| weather-sunny | 晴 | L04 | L07 L08 |
| weather-cloudy | 多云 | L04 | L07 L08 |
| weather-rainy | 下雨 | L04 | L07 L08 |
| weather-windy | 刮风 | L04 | — |
| weather-snowy | 下雪 | （未用） | — |
| weather-stormy | 雷雨 | L04 | — |

**transport 交通（8）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| transport-bus | 公共汽车 | L01 | L03 |
| transport-car | 小汽车 | L01 | L06 L08 |
| transport-bike | 自行车 | L01 | L06 L07 L09 |
| transport-train | 火车 | L08 | — |
| transport-plane | 飞机 | L08 | — |
| transport-boat | 船 | （未用） | — |
| ★ transport-taxi | 出租车 | L03 | — |
| ★ transport-walk | 步行 | L03 | L06 |

**food 食物（11）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| food-apple | 苹果 | L03 | L05 |
| food-banana | 香蕉 | L03 | — |
| food-pizza | 披萨 | L01 | L06 L10 |
| food-sandwich | 三明治 | L01 | L02 L06 L10 |
| food-pasta | 意面 | L01 | L06 |
| food-cake | 蛋糕 | L02 | L03 L07 L10 |
| food-ice-cream | 冰淇淋 | L02 | L03 L07 |
| food-milk | 牛奶 | L02 | L03 L05 |
| ★ food-egg | 鸡蛋 | L03 | L05 |
| ★ food-juice | 果汁 | L02 | L07 L09 |
| ★ food-tea | 一杯茶 | L02 | L09 |

**activity 活动（11）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| activity-football | 踢足球 | L01 | L02 L09 |
| activity-swimming | 游泳 | L01 | — |
| activity-reading | 看书 | L06 | L08 L09 |
| activity-painting | 画画 | L01 | L05 |
| activity-music | 弹吉他 | L05 | — |
| activity-dancing | 跳舞 | L05 | — |
| activity-running | 跑步 | L09 | — |
| activity-computer | 用电脑 | L02 | L09 |
| ★ activity-cleaning | 打扫房间 | L02 | — |
| ★ activity-boardgame | 玩桌游 | L02 | L06 |
| ★ activity-tv | 看电视 | L02 | — |

**place 场所（13）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| place-school | 学校 | L06 | — |
| place-library | 图书馆 | L01 | — |
| place-park | 公园 | L01 | L02 L05 L06 |
| place-shop | 商店 | L01 | — |
| place-cinema | 电影院 | L06 | L07 |
| place-beach | 海滩 | L05 | L08 |
| ★ place-museum | 博物馆 | L05 | L10 |
| ★ place-cafe | 咖啡店 | L07 | — |
| ★ place-lake | 湖 | L07 | — |
| ★ place-mountains | 山 | L08 | — |
| ★ place-city | 大城市 | L08 | — |
| ★ place-zoo | 动物园 | L10 | — |
| ★ place-castle | 城堡 | L10 | — |

**clothes 衣物（6，P-L1 新类别）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| ★ clothes-boots | 靴子 | L04 | L10 |
| ★ clothes-trainers | 运动鞋 | L04 | L10 |
| ★ clothes-shoes | 皮鞋 | L04 | L10 |
| ★ clothes-jacket | 夹克 | L04 | — |
| ★ clothes-jumper | 毛衣 | L04 | — |
| ★ clothes-t-shirt | T 恤 | L04 | — |

**object 物品（6，P-L1 新类别）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| ★ object-umbrella | 雨伞 | L04 | — |
| ★ object-kite | 风筝 | L07 | — |
| ★ object-ball | 足球（实物） | L06 | L07 |
| ★ object-camera | 相机 | L08 | — |
| ★ object-tablet | 平板电脑 | L08 | — |
| ★ object-medicine | 药瓶 | L09 | — |

**body 身体（3，P-L1 新类别，红色虚线标不舒服处）**

| id | 说明 | 首用 | 复用 |
|---|---|---|---|
| ★ body-head | 头（头疼） | L09 | — |
| ★ body-arm | 胳膊（胳膊疼） | L09 | — |
| ★ body-stomach | 肚子（肚子疼） | L09 | — |

- 复用提示：weather-snowy / transport-boat 至今未用；阶段二起 Part 2/3/4 不用图标，Part 1 若仍编入则优先从上表选，价格牌与时钟缺什么值再加

### 收尾（本 commit）
- [x] preflight 五项 ✔（ESM 42 文件 / Schema + 编码 158 文件 / 听力课 10 课 A2 覆盖 100% / sw 登记 / ketLessonMap 50 课）；八课 untouched 对 `tools/backup/pl1` ✔；三份文档（CHECKLIST / 交接文档 / MEMORY）编码守卫（BOM + 乱码特征）✔
- [x] smoke 用例 +2：在线 `exam-listening?lesson=L10`、离线 L10 热身页 `#startBtn`（阶段一末课；本收尾会话未复跑浏览器三件套，家长验收前如需复核按环境坑 4/5/6/12/13 跑）
- [x] sw → **ea-v1.1.1**
- 本批 commit：01608f0 PL1-0 图标 → e1b6160 L02 → dc1d322 L03 → d506cf0 L04 → 678d9e7 L05 → 26f8240 L06 → 8487310 L07 → d6e55b4 L08 → fbe766e L09 → b790618 L10 → 收尾（sw + L03 修复 + smoke 用例 + 三份文档）

### 📌 P-L2 续跑说明（L11-L20 阶段二，家长在手机上验收阶段一后开工）
- 范围：阶段二前 10 课 **L11-L20，语速 0.9x（由 `stage.rate` 决定）**，题型 = **Part 4 主旨三选一 + Part 2 填空**（家长定）。★ 注意 `index.json` 的 stages[1].desc 现写「加入 Part 2 填空与 Part 3 三选一」，与本说明不一致，开工时请家长拍板是否把 desc 改成 Part 4 + Part 2（index 在壳预取清单，改了要 bump）
- ★ **填空题型首次投入（P-L0 只用合成课 L99 验过判分，没有真课）：先做 L11 一课样课，push 后停机等家长手机验收，验收通过再批量 L12-L20**。样课要覆盖的判分点：数字词 ↔ 阿拉伯数字互认、连字符、`alt` 备选答案、大小写；一课内每空答案在 A2 表内且拼写唯一
- 工艺：课结构仍复制 `l01.json` 骨架（id/title/titleZh/stage/rate/parts/theme/names/intro/warmup/sections）；Part 4 每段一题三选一（口径：一段独白或对话问主旨/态度/原因），Part 2 一段独白 5 空（口径见 P-L0 单元 2）；题型题数选项严格对齐真考不自创；每课跑 `node tools/check-listening.mjs L1X` 到 ≥95% 且超纲词全进 warmup；索引追加 `status: ready` + questionCount；一课一 commit
- 图标：Part 2/4 不用图标；若某课编入 Part 1 段，先查上面「★ 图标清单」，缺的再在 `tools/gen-listening-icons.mjs` 加条再生成
- 收尾照旧：preflight（含 ⑤）+ untouched（开工先备份八课到 `tools/backup/pl2/`）+ 三件套 + 窄屏 shot（填空页与 Part 4 页各一张）+ 行为级页（`_pl0check.html` 写法：mock speechSynthesis + fetch 覆盖；★测播放按钮先等 disabled 再等恢复）+ sw bump + push 后硬停机
- 阶段二/三引擎能力已就位（Part 2 填空 / Part 3·4 三选一 / Part 5 匹配、0.9x/1.0x 由 stage.rate 决定），只需产数据

---

## P-L2：听力阶段二 L11 样课（缓存 `ea-v1.1.2`，2026-09-16，✅ 索引修正 + L11 一课完成，⏸ 硬停机等家长手机验收填空题型，禁止继续 L12-L20）

> 阶段二 = **Part 4 主旨三选一 + Part 2 笔记填空**，语速 0.9x（家长拍板：Part 4 抓大意是从 Part 1 往上最平缓的一步；Part 3 观点态度最抽象留阶段三）。★ 填空题型第一次投入真课，只做 L11 一课，拼写判分 / 逐字母 TTS / 输入框体验都要家长在手机上先看过。规则同前批：脚本 100% 原创、官方音频/tapescript/样卷一字不读；音频只用 Web Speech 实时合成不入库；A2 覆盖 ≥95%（L11 实测 100%）。八课数据零改动（untouched 对 `tools/backup/pl2/` 全过）。

### 单元 0 · 索引修正 + 填空判分/拼读 TTS 引擎补齐（PL2-0）
- [x] `index.json` stages[1].desc → 「加入 Part 4 主旨三选一与 Part 2 笔记填空。语速 0.9x。」；stages[2].desc → 「Part 3 观点态度与 Part 5 匹配，五部分连做。语速 1.0x。」（index 在壳预取清单 → 本批 bump）
- [x] `listening.js` `normalizeGap`：新增 `timeize` **时间三写法互认** —— `7.30` / `7:30` / `7 30` / `half past seven` / `seven thirty` / `quarter to eight`（→ 7:45）/ `7 o'clock`（整点归一为 `7`，与 `7:00`、`seven` 等价，对齐真考 key 的 7 / 7.00 写法）；★ 先认时间再认数字词（否则 `seven thirty` 会被数字词加法吃成 37）；原有规则不变：大小写不敏感、首尾空格容错、去句末句号、数字词 ↔ 阿拉伯数字（`twenty-one` = `twenty one` = 21）、**拼写必须完全正确**、`alt` 备选。node 单测 43 例全过（含 `Brwon` ≠ `Brown`、`405 990` 原样保留）
- [x] `speech.js` `speakDialogue`：**拼读串逐字母朗读** —— 文本里 `B-R-O-W-N` 形（单字母连字符串起 ≥2 个，`SPELL_RE`）拆成单字母 utterance（`"B."` 形，句号让 TTS 按字母名读），字母之间停 `letterGap` 350ms，同一 turn 内正文↔拼读串之间也只停 350ms，turn 之间仍 700ms；拼读串后面残留的逗号不单独开口；`onTurn` 仍按 turn 回调一次（播放态「(6/6)」计数不变）。行为级实测：s6 第 1 轮拆成 `Hello, this is Sam Brown, that's` + `B. R. O. W. N.` + `with the weather for the weekend.` 共 7 段，字母间隔实测 355-362ms，turn 间隔 704-716ms
- [x] `tools/check-listening.mjs`：拼读串整串不计入词汇统计；连字符复合词按各部分认（`twenty-one`）
- [x] `check-esm` 全过；三处均为「只加不改」的向后兼容改动，阶段一 10 课行为不变（smoke L01/L10 在线离线仍绿）

### 单元 1 · L11《天气预报 The Weather Report》（PL2-L11）
- [x] `l11.json`：阶段二 · 0.9x · `parts: [4, 2]` · 10 题。**Part 4 × 5 段**（每段 1 题 3 文字选项，主旨直白）：s1 电台今日天气（女声独白）→ 在讲今天的天气 / s2 Dan·Lucy 明天穿什么（4 轮对话）/ s3 Ben 的海边假期全在下雨（男声独白）→ 天气糟糕 / s4 老师通知野餐改到体育馆里（女声独白）→ 地点变了、日期时间没变 / s5 Alex·Amy 下雪了（4 轮对话）→ 午饭后可以出去堆雪人。**Part 2 一段独白 5 空**（周末天气预报，Sam Brown，本课只填数字和时间）：q6 周六 14 度（14 / fourteen）· q7 雨 3:30 开始（3.30 / 3:30 / half past three，three o'clock 是干扰）· q8 周日 21 度（twenty-one，twenty 是上周干扰）· q9 沙滩游戏 10:15（quarter past ten，海报上的 ten o'clock 被 not 否定）· q10 天气热线 405 990（英式读法 four oh five, nine nine oh，重复一遍）。★ 第 1 轮 `this is Sam Brown, that's B-R-O-W-N` 让家长在手机上先听到逐字母停顿效果（本课按坡度不出拼写空，L14 起才出）
- [x] 热身 10 词全在 A2 表（weather / cloudy / degree / temperature / windy / storm / umbrella / picnic / snowman / poster）；`check-listening L11`：540/540 = **100%**；`forecast` 不在 A2 表故全课不用（标题用 Weather Report）；`names`：Kate / Dan / Lucy / Ben / Amy / Alex / Sam / Brown
- [x] 索引登记 `L11 … parts [4,2] questionCount 10 status ready`

### 收尾（本 commit）
- [x] preflight 五项 ✔（ESM 42 / Schema 14 + 编码 159 文件 / 听力 11 课 A2 覆盖 100% / sw 登记 / ketLessonMap 50 课）；八课 untouched 对 `tools/backup/pl2` ✔
- [x] **行为级 L11 全流程 + 填空专项**（临时页 `_pl2check.html`：mock speechSynthesis 两个假英文声 + 假 `SpeechSynthesisUtterance` 类——真类的 voice 属性只收真 SpeechSynthesisVoice；跑完已删）默认宽 + ?w=360 双跑 **0 错误**：热身 10 词逐词发音 · 开始按钮「10 题」· Part 4 五段各 3 文字选项无图、播放先 disabled 再恢复、2 段女声 turn 间隔 707ms · Part 2 五个输入框（autocapitalize=off，360 宽右边界 322、高 66）· 播放 12 utterance 含 B/R/O/W/N 五个单字母（男声）· 第 2 遍计数「已听 2 遍」· ‹ 弹确认且留在原题输入不丢 · **四轮判分**：① fourteen / half past three / 21 / 10.15 / 405990 + Part 4 故意错 s3 → 9/10、红卡正是 s3；② `forteen`（错一个字母）/ 3:30 / twenty-one / quarter past ten / 405 990 → 9/10、红卡正是 q6；③ ` FOURTEEN ` / 3.30 / twenty one / quarter past 10 / 405-990 → 10/10；④ 14 / half past 3 / Twenty-One / 10:15 / 405 990 → 10/10 · 空题交卷二次确认「确定交卷」→ 0/10 · 对答案页 6 段 tapescript 原文显示 `B-R-O-W-N`、「再听」也走逐字母 · 训练营首页阶段二/三新描述 + L11 行「最好 100%（练过 5 次）」· 错题本「听力」分区有条目
- [x] smoke（全新 profile，真实时钟）**47 在线 + 34 离线零失败**（+2：在线 L11、离线 L11 热身页 `#startBtn`），唯一 console error 为预期 g51 探针；sw-check：唯一缓存 `english-adventure-ea-v1.1.2`、壳 61 项、离线内容/索引/壳 JS 命中、未缓存 504、清内容缓存不动壳 ✔；modal-check 默认宽 + ?w=360 **0 false**（默认宽首跑 gradePicker xBtn hot48 false → 全新 profile 复跑 true，与 B1/P-L0 同族伪差，本次真实时钟下首跑也会偶发）；⑨ 听力答题态 L01 专项全绿
- [x] 窄屏 shot ?w=360：训练营首页 / L11 热身 / Part 4 答题页（`&click=%23startBtn`）/ Part 2 笔记页（`&click=%23startBtn,%23nextBtn×5`）**全部零溢出零小热区**
- [x] sw → **ea-v1.1.2**（索引 desc + 新课 + 两个 JS 改动）
- 本批 commit：PL2-0（索引 desc + 引擎三处）→ PL2-L11 → 收尾（sw + smoke 用例 + CHECKLIST + 交接文档）

### 📌 P-L2 续跑说明（L12-L20，家长在手机上验收 L11 填空题型后开工；验收要点：拼读停顿听得清、手机键盘不自动大写、三种时间写法都判对、错一个字母判错）
- 规格不变：每课 `parts: [4, 2]` · 10 题 · 0.9x · Part 4 五段各 1 题 3 文字选项（主旨/话题/大意）· Part 2 一段独白 5 空。题材：L12 学校广播 / L13 商店促销 / L14 旅行安排 / L15 电话留言 / L16 俱乐部活动 / L17 图书馆通知 / L18 生日计划 / L19 体育比赛 / L20 博物馆参观
- 坡度：**L12-L13** Part 4 主旨直白、Part 2 只填数字和时间；**L14-L17** Part 4 引入相似话题干扰、Part 2 加入姓名拼读和地名；**L18-L20** Part 4 段落含转折、Part 2 五种类型（数字/时间/电话/姓名拼写/地名）混合，接近真考
- ★ 拼写题工艺：脚本里必须逐字母拼读，写法固定 `That's B-R-O-W-N`（大写单字母、连字符、≥2 个字母；`speech.js` 按 `SPELL_RE` 拆读，`check-listening` 整串跳过）；answer 写词本身（`"Brown"`），不需要 alt；人名/地名登记进 `names`（Schema 限单词 `^[A-Z][a-z]+$`，地名用单词的原创名，不用真实地名生僻词）；一课内每空答案拼写唯一
- ★ 其他答案写法：数字 answer 写阿拉伯数字（`"14"`，数字词自动等价，alt 可不写）；时间 answer 写 `"3:30"`（7.30 / half past three 自动等价，整点写 `"7"`）；电话号码 answer 带空格 `"405 990"` + `alt: ["405990", "405-990"]`；价格 answer 写纯数字 `"8"` + `alt: ["£8", "8 pounds", "eight pounds"]`（normalizeGap 不去 £ 符号）；日期 answer `"12 May"` + `alt: ["May 12", "12th May"]`
- 工艺同 L11：复制 `l11.json` 骨架；Part 4 独白 2 轮 / 对话 4 轮，同一 turn ≤2 句；干扰项要在段里出现；Part 2 独白 5-6 轮、每空前后有一个干扰数字/时间；跑 `node tools/check-listening.mjs L1X` 到 ≥95% 且超纲词全进 warmup；索引追加 `status: ready` + questionCount 10；一课一 commit
- 收尾照旧：preflight（含 ⑤）+ untouched（开工先备份八课到 `tools/backup/pl3/`）+ 三件套 + 窄屏 shot（Part 2 页 `&click=%23startBtn,%23nextBtn×5`）+ 行为级页（`_pl2check.html` 写法：mock speechSynthesis + **假 SpeechSynthesisUtterance 类** + 播放先等 disabled 再等恢复；拼写课加「错一个字母判错 / 大小写」两轮）+ sw bump + push 后硬停机

---

## ⚙️ 环境坑清单（每次开工前扫一眼）

1. **本机 python 是 Windows 商店 stub，不可运行**。起服务用 `npx http-server`，或本项目自带的 `node tools/smoke/verify-server.mjs`（多了断网开关）。一律后台跑，绝不前台阻塞。
2. **`node --check` 不能验证 ES Module**（V0.8 因此漏过一个括号错误导致线上事故）。JS 自检一律 `node --experimental-vm-modules tools/check-esm.mjs`。
3. **改了线上 JS 必须 bump `sw.js` 版本号**，否则 cache-first 会让用户端永远拿旧文件。
4. **Chrome `--user-data-dir` 必须用短路径**（如 `%TEMP%\eap`）。放在很深的临时目录下，CacheStorage 目录会超 MAX_PATH，症状是 `caches.put` 抛 `Entry already exists` / `Unexpected internal error`——看着像 sw.js 的 bug，其实是路径长度。
5. **无头 Chrome 加 `--virtual-time-budget` 会把 Service Worker 线程挂住**（页面永远停在 PENDING）。验证 SW 时改用 `Start-Process` + `Start-Sleep` + `Stop-Process`。
6. **无头 Chrome 的 viewport 有最小宽度（实测卡在 ~492px，`--window-size` 压不下去），截图会被裁切，看着像元素溢出其实不是。判断窄屏版式必须用 `tools/smoke/shot.html?page=xxx&w=360` 实测元素右边界**，不要靠眼睛看截图。
7. **PowerShell 读 UTF-8 结果文件会乱码**（`ConvertFrom-Json` 直接报错）。自检结果用 `node -e` 或 Bash 的 `cat` 读。
   **中文内容文件一律 node 读写，UTF-8 无 BOM。PowerShell 管道会静默损坏编码，且乱码能通过 Schema 校验——check-data.mjs 已加编码守卫（P0.7），不要绕过。**
8. 所有路径用相对路径 `./xxx`，绝不用绝对路径（GitHub Pages 子目录部署）。
9. **并行会话禁止同时改 `sw.js` CACHE_VERSION**——两个会话各自 bump 会互相覆写，且低版本覆写高版本能触发一次刷新（不立即报错），但会埋下日后版本号重名、缓存静默失效的雷。规则：UI 批次与内容批次要么串行，要么约定只有一个会话碰 sw.js；CACHE_VERSION 必须全局单调递增，绝不复用已发布过的号。
10. **KET 八课（`data/exam/ket/grammar-lessons.json` 等）是「一个字不动」的红线**（P2b 起）。任何批次动手前先把它复制到 `tools/backup/<批次名>/`，收尾跑 `node tools/check-ket-lessons-untouched.mjs [备份目录]` 逐字段深比对（比 hash 严：字段相同但被重新格式化/换编码也会被抓出来）。要给八课加入口，只改渲染层 `assets/js/modules/exam/grammar-course.js`，绝不碰数据文件。
11. **`data/grammar/index.json` 在 sw 壳缓存预取清单里（sw.js:73），走 cache-first。** 凡是新增/修改课程导致 index.json 变动，必须同时 bump CACHE_VERSION，否则老客户端读到旧索引、新课在目录里根本不出现（课文件已上线也看不到），是静默失效，不报错。
12. **无头 Chrome 测完必须确认进程真的退光**（`Get-CimInstance Win32_Process` 按 CommandLine 里的 `eap` 过滤）——残留的无头实例会占住 `--user-data-dir` 锁，下一轮启动只是把 URL 递给旧实例然后退出，页面根本没加载，结果文件永远等不到。bash 里 `kill $!` 只杀得掉启动壳，杀不掉 Chrome 子进程树。
13. **虚拟时钟跑法（`--virtual-time-budget` + shot.html/modal-check）速度快、自动退出，但会产生几何测量伪差**——热区/尺寸类断言（如 hot48）报 false 时必须用真实时钟（`Start-Process` + 轮询结果文件）单页复测确认，不能直接采信（B1 中 gradePicker hot48:false 即为伪差，真实时钟为 true）。同族坑：测量页不带 Tailwind 会几何失真（坑 6 注）、无头 Chrome viewport 最小约 492px（坑 6）、virtual-time-budget 挂住 SW 线程（坑 5，验 SW 时禁用虚拟时钟）。
14. **无头 Chrome 收尾 Stop-Process 必须同时过滤 `Name -eq 'chrome.exe'`**——只按 CommandLine 含 profile 名过滤会把正在跑这条命令的 shell/pwsh 自己也杀掉（它的命令行里就有那个 profile 名），表现为工具直接退出码 255、一行输出都没有、Chrome 反而留下来（P-L0 踩过三次）。真实时钟跑法在本环境用 PowerShell `Start-Process` + 轮询 result.json + 上述过滤杀进程最稳；bash 里 `( chrome … & )` 子壳后台偶发根本没起来。

---

## 🎨 设计系统规范（B1 / V0.9.6 起，全站唯一标准）

**此后全站禁止硬编码字号 / 颜色 / 间距 / 圆角 / 阴影，只准引用 token 变量。**
两个配套事实源（改一处必须同步另一处）：`assets/css/style.css` 的 `:root`（token 定义）+ `assets/js/tw-config.js`（Tailwind class 映射；index.html 与 tools/smoke 测量页都必须引用它，否则渲染与测量失真）。

- **字号 8 级**（clamp 响应式，手机端不缩水；可读文字只准取这 8 值，不许中间值）：
  `--fs-display`(34-44) / `--fs-h1`(26-33) / `--fs-h2`(23-28) / `--fs-body-lg`(21-24) / `--fs-body`(19-21) / `--fs-body-sm`(17-18) / `--fs-cap`(15-16) / `--fs-micro`(13-14)。
  Tailwind 映射：`text-2xl→display, xl→h1, lg→h2, base→body-lg, sm→body, xs→body-sm, text-cap, text-micro`。
  ★ cap/micro 只准用于徽标/角标/时间戳/频率标签等辅助信息，**禁止用于任何需要阅读的正文**；`text-[Npx]` 任意值全站禁止（现存 0 处）。
  `text-3xl~6xl` = emoji/插图尺寸（`--emoji-sm/md/lg/xl` 32/40/52/64），禁止用于文字。
- **色板**（46 个 `--c-*`，语义化；文字色全部对白/米底实测 ≥4.5:1 WCAG AA）：
  品牌橙 `--c-primary-50..700`（500 品牌识别装饰用、600 按钮填充白字、700 浅底文字）；品牌青 `--c-secondary-*` 同构；语义 success/danger/warning/info 各 50/500/600/700；糖果点缀 lemon/pink/sky/grape（配 `-ink` 可读文字色）；暖棕灰阶 `--c-ink-900..400` + `--c-line-300/200` + `--c-fill-100/50`（300 及以下仅装饰/边框，400 起才可做文字）。
  Tailwind `gray-*` 已重映射为暖棕灰阶；`text-primary/secondary` 已全站改为 `text-primary-ink/secondary-ink`（brand 500 色对比度不足，不做文字）。
- **间距 8 级**：`--sp-1..6, --sp-8, --sp-12`（4/8/12/16/20/24/32/48px）；Tailwind 半档（-0.5/-1.5/-2.5）已归一，不再新增。
- **圆角 6 级**：`--r-xs/sm/md/lg/xl/pill`（8/12/16/22/28/999px）；**阴影 4 个**：`--shadow-card/card-hover/pop/soft`；**触控**：`--tap-min: 48px`。
- 豁免记录（仅此三类，新增豁免须在此登记）：①装饰插画渐变（段位/稀有度/大区/关卡节点）②瞬时动效大数字（.count-num 90px）③记忆卡 SVG 内部色值（自带 #FFF8F0 底，深浅模式自含）。
- 记忆卡 SVG：50 课字号已放大（最小 14px、主体 17-23px），渲染层 `.memory-card-wrap` 横滑容器（窄屏保有效字号）；新增课卡片沿用该字号带宽 + 逐框防溢出。

---

## 🔴 内容版权红线

- [x] PET 词汇释义/例句/记忆法/阅读文章 100% 原创，未碰任何官方词表/真题/样题原文
- [x] 不使用「剑桥官方」「真题选段」等表述；新增 PET 内容须继续遵守

## ⚠️ 已知限制

- 词库为样本量级：1–9 年级各 30 词、PET 各话题 ~34–40 词，均可继续扩充（关卡数随词量自动增长）
- 趣味记忆法暂覆盖 1–6 年级 47 词；7–9 年级待补
- 跟读/背诵打分依赖浏览器原生 SpeechRecognition，部分浏览器（如桌面 Firefox）不支持
- 伪 AI 写作批改对复杂句式判断有限

## 📊 统计

- JS 模块：**42 个**（assets/js，check-esm 计数；P-L0 新增 modules/voice-check.js + modules/exam/listening.js，全部 check-esm 通过）+ `sw.js`
- 数据文件：**159 个 JSON**（P-L0 +5：听力索引/图标清单/L01/两份 Schema；P-L1 +9：L02-L10；P-L2 +1：L11）（含 KET 备考 + PET 镜像 + exam 清单 + V0.6 语法增强 + 语法大厅 50 课）
- 语法大厅：**50/50 课全部完工**（基石 G01-G12 + 骨架 G13-G26 + 进阶 G27-G42 + 精修 G43-G50，共 3200 题 + 352 侦探病句 = 3552 个题干全局无重复）
- KET 词库：**1416 词 / 20 话题**；PET 词库：**2571 词 / 22 话题**（V0.5-PET-s1 第 1 会话后，第 2 会话续扩 time + 新话题）；PET 阅读：**15 篇**
- 听力训练营（P-L0 ~ P-L2）：**11/50 课**（阶段一 L01-L10 全部 · Part 1 · 每课 5 题，共 50 题；阶段二 L11 样课 · Part 4 + Part 2 填空 · 10 题）+ SVG 图标 **81 个 / 10 类**（tools/gen-listening-icons.mjs 生成，清单见 P-L1「★ 图标清单」）+ check-listening 词汇守卫（A2 覆盖 ≥95%，11 课实测 100%）
- KET 题库：Part5×8 套 / P1-P4 各 5 套 / 全真卷 3 套 / 听力 3 套 75 题 / 读物 20 篇 / 写作 22 题 22 范文 / 语法 8 课 512 题（V0.6 四环节）+ 特殊单词表 41 组 247 词（V0.8）
- 勋章：20 个；Service Worker 缓存版本：**ea-v1.1.2**（P-L2 索引阶段描述修正 + L11 样课 + 填空时间判分/拼读 TTS；壳预缓存架构；0.9.2 为并行会话覆写产生的倒退号，已更正，见环境坑 9）
- 预缓存体积：**452 KB**（壳 44 项 + 索引 9 项；P2b 新增 `utils/ket-hall-map.js` 2 KB）；`data/` 内容 2,878 KB 走运行时缓存
- 模块互链：KET 八课 ⇄ 语法大厅 双向跳转（P2b，映射表 `assets/js/utils/ket-hall-map.js`，八课内容零改动）
- 离线可用：应用壳与索引开箱即用；内容文件访问过一次后离线可读
