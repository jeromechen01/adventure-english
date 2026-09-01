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

- JS 模块：**36 个**（assets/js，含 exam/ 11 个 + grammar-hall/ 2 个 + utils/ 4 个，全部 check-esm 通过）+ `sw.js`
- 数据文件：**144 个 JSON**（含 KET 备考 + PET 镜像 + exam 清单 + V0.6 语法增强 + 语法大厅 50 课）
- 语法大厅：**50/50 课全部完工**（基石 G01-G12 + 骨架 G13-G26 + 进阶 G27-G42 + 精修 G43-G50，共 3200 题 + 352 侦探病句 = 3552 个题干全局无重复）
- KET 词库：**1416 词 / 20 话题**；PET 词库：**2143 词 / 22 话题**（V0.5 扩充中）；PET 阅读：**15 篇**
- KET 题库：Part5×8 套 / P1-P4 各 5 套 / 全真卷 3 套 / 听力 3 套 75 题 / 读物 20 篇 / 写作 22 题 22 范文 / 语法 8 课 512 题（V0.6 四环节）+ 特殊单词表 41 组 247 词（V0.8）
- 勋章：20 个；Service Worker 缓存版本：**ea-v0.9.5**（壳预缓存架构；0.9.2 为并行会话覆写产生的倒退号，已更正，见环境坑 9）
- 预缓存体积：**452 KB**（壳 44 项 + 索引 9 项；P2b 新增 `utils/ket-hall-map.js` 2 KB）；`data/` 内容 2,878 KB 走运行时缓存
- 模块互链：KET 八课 ⇄ 语法大厅 双向跳转（P2b，映射表 `assets/js/utils/ket-hall-map.js`，八课内容零改动）
- 离线可用：应用壳与索引开箱即用；内容文件访问过一次后离线可读
