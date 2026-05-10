# 一二年级（学龄前/启蒙阶段）完整内容扩充提示词

## 这份文档用法

`english-adventure` 项目已经新增了 1-2 年级支持，但目前每个年级只有 30 词作为骨架。这份文档包含 **5 个独立提示词**，让你在 web 版 Claude 里把 1-2 年级内容扩充到符合启蒙教学需求的水平。

每条提示词在新对话里独立运行。Claude 输出 JSON 后，你保存到本地对应文件覆盖即可。

---

## ⚠️ 关于 1-2 年级英语的真实情况

教育部 2022 年新课标**没有强制规定** 1-2 年级英语必须开设；只有部分一二线城市学校自行开课。教材版本极度分散：上海版、北师大版、外研社一起点版、PEP 一年级起点版、深圳朗文版……

本提示词以 **"上海版义务教育牛津英语 1A/1B/2A/2B" + "北师大版小学英语 1-2 年级" 的高频共性词** 为基础，挑出 6-7 岁孩子最容易接受的核心 100 词。这是个"普适教学版本"，不严格对应任何单一教材。

**核心设计原则**：
- 词汇极度具象（cat/red/eat），避免抽象词
- 例句最多 5 词
- 句型只有 6 种最基础的（I am / It is / I have / I like / I can / This is）
- 不教时态、不教从句、不教比较级
- 阅读文章 30-50 词，简单陈述

---

## 第 1 轮：一年级单词 80 词

```
你正在为一款面向中国大陆 1-2 年级英语启蒙学习的 Web 应用生成数据。我需要一年级单词 JSON 文件,词汇要适合 6-7 岁初学英语的孩子。

【目标文件】data/words/grade1.json
【目标词量】80 个真实英语单词
【教学依据】上海版牛津英语 1A/1B + 北师大版一年级共性高频词
【单元划分】8 个 unit,每单元 10 词
【单元话题】
- Unit 1 Hello (问候/I/you/打招呼)
- Unit 2 Numbers 1-10 (数字)
- Unit 3 Colors (颜色)
- Unit 4 Animals (动物)
- Unit 5 Body (身体)
- Unit 6 Family (家人称呼)
- Unit 7 Fruits (水果)
- Unit 8 Toys (玩具)

【严格的 JSON Schema】每个 word 对象必须包含:
- id: g1w001 到 g1w080 顺序编号
- word: 真实英语单词,小写
- phonetic: 国际音标,斜杠包裹
- pos: 词性 n. v. adj. pron. num. int. 等
- meaning: 1 个简洁中文释义(1-3 字)
- examples: 必须 2 个例句,且每句【最多 5 词】,符合 6-7 岁认知
- synonyms: 数组,无则 []
- antonyms: 数组,无则 []
- difficulty: 全部用 1
- tags: 1-2 个英文小写标签

【例句难度严格要求】
✅ 好例句: "I have a cat." / "It is red." / "Three apples." / "Mom is here."
❌ 差例句: "I have a beautiful black cat at home." (太长太复杂)

【禁止的内容】
- 不要教抽象词(weather/season/transportation 等留给三年级以上)
- 不要用复杂动词时态(只用一般现在时)
- 不要造词,所有单词必须是真实英语词

【参考词表】(从中精选 80 个)
Unit 1: hi, hello, bye, I, you, he, she, it, we, am, are, is, my, your, name, what
Unit 2: one, two, three, four, five, six, seven, eight, nine, ten, number, count
Unit 3: red, blue, yellow, green, pink, white, black, orange, purple, brown, color
Unit 4: cat, dog, bird, fish, duck, pig, cow, sheep, rabbit, mouse, animal, panda
Unit 5: eye, ear, nose, mouth, hand, foot, head, hair, leg, arm, body, face
Unit 6: mom, dad, baby, brother, sister, family, boy, girl, friend, kid, child
Unit 7: apple, banana, pear, orange, grape, lemon, peach, fruit, juice, sweet
Unit 8: toy, ball, doll, kite, car, train, plane, block, robot, bear

【完整外层结构】
{
  "grade": 1,
  "totalWords": 80,
  "units": [
    { "unitId": "g1-u1", "unitName": "Unit 1 Hello", "words": [...] },
    ...
  ]
}

请直接生成完整的 grade1.json,放在 markdown JSON 代码块里。不要省略任何字段,每个 word 对象都要完整。
```

完成后：复制 JSON → 保存为 `data/words/grade1.json` 覆盖。

---

## 第 2 轮：二年级单词 100 词

```
继续生成二年级英语启蒙单词文件。二年级比一年级稍难,但仍以具象词和短句为主。

【目标文件】data/words/grade2.json
【目标词量】100 个真实英语单词
【教学依据】上海版牛津英语 2A/2B + 北师大版二年级共性高频词
【单元划分】10 个 unit,每单元 10 词
【单元话题】
- Unit 1 Greetings (问候,如 good morning/thank you/please/sorry/yes/no)
- Unit 2 Numbers 11-20 + 大小 (eleven 到 twenty + big/small/long/short)
- Unit 3 Food & Drinks (rice/bread/milk/water/cake/egg)
- Unit 4 Toys & Things (toy/ball/doll/car/book/pen/bag)
- Unit 5 Classroom (desk/chair/blackboard/door/window/floor)
- Unit 6 Actions (run/jump/sing/dance/eat/drink/sleep/walk/swim/read)
- Unit 7 Weather (sunny/rainy/windy/cloudy/hot/cold/warm/cool)
- Unit 8 Clothes (shirt/pants/dress/shoes/hat/socks)
- Unit 9 Places (home/school/park/zoo/garden)
- Unit 10 Feelings (happy/sad/hungry/tired/scared/funny)

【JSON Schema】(与一年级一致,id 用 g2w001 到 g2w100,difficulty 全部 1)

【例句要求】
- 每句不超过 5 词
- 全部用一般现在时,简单陈述/简单疑问
- 例句中可以引入二年级的句型: I have... / I like... / I can... / It is... / This is... / I am...
- ✅ 好例句: "I can swim." / "It is sunny." / "Mom is happy."
- ❌ 不要: "I can swim very well in summer."

【词性使用】
- 名词 n. 占大头(约 50%)
- 形容词 adj. 适量(20%)
- 动词 v. 简单动作(20%)
- 其他 num./adv./prep./int. (10%)

请直接输出完整的 grade2.json,共 10 unit 100 词。
```

完成后：保存为 `data/words/grade2.json`。

---

## 第 3 轮：启蒙阶段语法/句型 12 个

```
为 1-2 年级启蒙阶段生成基础句型 JSON 文件。1-2 年级不应该教真正的"语法",而是教 6 个最基础的句型,让孩子能开口说简单句。

【目标文件】data/grammar/kindergarten.json
【现状】文件已有 6 个句型,你需要在末尾再追加 6 个新句型,共 12 个。

【现有的 6 个句型,id gk-001 到 gk-006】
- gk-001: I am ... 我是...
- gk-002: It is a ... 这是一个...
- gk-003: I have ... 我有...
- gk-004: I like ... 我喜欢...
- gk-005: I can ... 我会...
- gk-006: This is ... 这是...

【需要新增的 6 个句型,id gk-007 到 gk-012】
- gk-007: 复数 (一个 a/an,两个 two,三个 three: a cat / two cats)
- gk-008: 颜色描述 The X is + color (The apple is red.)
- gk-009: How many...? 数数: How many apples? Five apples.
- gk-010: What's this? 这是什么 (回答 It's a ...)
- gk-011: Look at ... / Listen to ... 看/听 (祈使句)
- gk-012: Yes/No 一般疑问 Are you ... ? Yes, I am. / No, I'm not.

【每个句型必须包含的字段】
{
  "id": "gk-007",
  "title": "复数: 一个和很多个",
  "grade": [1, 2],
  "summary": "一句话讲清楚",
  "rules": ["规则 1", "规则 2", ...],
  "examples": [
    {"en": "...", "zh": "..."},  // 必须 3 个例句,简单
    ...
  ],
  "quiz": [
    // 必须 5 道选择题
    {"question": "...", "options": ["A","B","C","D"], "answer": 0, "explanation": "..."}
  ]
}

【题目要求】
- 题目和选项要简单,适合 6-7 岁孩子,题干不超过 6 词
- 解析用最简单的中文,1 句话讲清楚
- 选择题难度从易到难,前 2 题最简单的填空,后 3 题略难的辨析

【输出方式】
请输出完整的 kindergarten.json,包含我已有的 6 个 + 你新增的 6 个 = 12 个。我把现有 6 个的内容贴在下面,请保留并追加。

[把当前 data/grammar/kindergarten.json 完整内容粘贴到这里]

直接输出完整的最终 JSON。
```

⚠️ **关键步骤**：发送这条提示词前，**先打开本地的 `data/grammar/kindergarten.json`**，**全文复制粘贴到提示词最后那个标记位置**。Claude 才知道现有内容是什么样。

---

## 第 4 轮：启蒙阅读 15 篇

```
为 1-2 年级启蒙阶段生成 JSON 阅读文件。文章必须极度简单,每篇 25-50 词,符合 6-7 岁初学者的认知。

【目标文件】data/reading/kindergarten.json
【现状】文件已有 5 篇文章,需要追加 10 篇,共 15 篇。

【现有的 5 篇,id rk-001 到 rk-005】
- rk-001: My Cat (我的猫)
- rk-002: My Family (我的家人)
- rk-003: I Can Do Many Things (我能做很多事)
- rk-004: Colors I Like (我喜欢的颜色)
- rk-005: My Toys (我的玩具)

【需要追加的 10 篇,id rk-006 到 rk-015】
- rk-006: My Dog (我的狗)
- rk-007: Apples Are Red (苹果是红的)
- rk-008: I Like Animals (我喜欢动物)
- rk-009: A Day at School (在学校的一天)
- rk-010: My Mom (我的妈妈)
- rk-011: Numbers I Know (我会的数字)
- rk-012: I Can Run (我能跑)
- rk-013: A Sunny Day (晴朗的一天)
- rk-014: My Bag (我的书包)
- rk-015: Big and Small (大和小)

【每篇要求】
- 字数 25-50 词
- 仅用一般现在时
- 句子最长不超过 5 词
- 用 I/it/this/the 开头的短句
- 必须原创,不要照搬任何儿童读物
- 必须有完整中文翻译
- 3 道选择题,题目简单,主要测细节理解

【每篇文章字段】
{
  "id": "rk-006",
  "title": "...",
  "grade": 1,  // 1 或 2
  "lexile": 100,  // 90-150 之间
  "wordCount": 35,
  "category": "story",  // story/life/nature
  "content": "...",
  "translation": "...",
  "questions": [
    {"type": "choice", "q": "...", "options": [...], "answer": 0},
    ...
  ],
  "keyWords": [3-5个]
}

【风格示例】(仿照这样的难度写)
"I have a dog. It is brown. It is big. It can run fast. It can jump high. I love my dog. My dog loves me."

请输出完整的 kindergarten.json,保留我已有的 5 篇,追加新的 10 篇,共 15 篇。

[把当前 data/reading/kindergarten.json 完整内容粘贴到这里]

直接输出完整最终 JSON。
```

⚠️ 同样需要把 `data/reading/kindergarten.json` 现有内容贴进去。

---

## 第 5 轮（可选）：1-2 年级写作话题

> ⚠️ 1-2 年级一般不要求写作。如果你想做这个模块,得先想清楚:6-7 岁孩子用应用写作,实际上是看图识词、抄写、连词成句,而不是真正的"创作"。
> 现有写作模块的 4 维度批改引擎不太适合这个学龄段。**建议先不做**,等 1-2 年级用户用一段时间后再决定。

如果一定要做,可以加 5 个写作话题(实际是连词成句练习):

```
为 1-2 年级启蒙阶段追加 5 个简单写作话题到现有 data/writing/topics.json。

注意:1-2 年级孩子不会真的"写作文",这些"话题"实际是【看图选词造句】的形式。但保持现有 schema 兼容性。

【追加的 5 个话题,id wt-011 到 wt-015】
- wt-011: My Family (10-20 词,只用 This is my... I love my...)
- wt-012: My Pet (10-20 词,只用 I have a... It is...)
- wt-013: I Can (10-20 词,只用 I can... I cannot...)
- wt-014: My Toys (10-20 词,只用 I have a... It is + color)
- wt-015: I Like Food (10-20 词,只用 I like... I don't like...)

【每个话题字段】
{
  "id": "wt-011",
  "title": "My Family",
  "grade": [1, 2],
  "level": "kindergarten",
  "type": "narrative",
  "wordCount": [10, 20],
  "tips": [
    "用 This is my mom. 介绍家人",
    "用 I love my family. 表达情感",
    "句子越短越好"
  ],
  "keyWords": ["family", "mom", "dad", "love"]
}

需要追加 5 个话题,保留现有 10 个。

[把现有 data/writing/topics.json 的 topics 数组粘贴到这里]

请输出完整的 topics.json (15 个 topics)。

然后再输出 5 个对应的 samples 范文(单独的 JSON 数组),每篇 10-15 词,极度简单,例如:
"This is my dad. He is tall. This is my mom. She is kind. I love my family."

samples 也要保留现有内容,追加新的。
```

---

## 📊 完成检查

每个文件做完之后，跑这条命令确认：

```bash
cd english-adventure
python -c "
import json
print('=== 一二年级数据完整性 ===')
g1 = json.load(open('data/words/grade1.json', encoding='utf-8'))
g2 = json.load(open('data/words/grade2.json', encoding='utf-8'))
print(f'  Grade 1: {sum(len(u[\"words\"]) for u in g1[\"units\"])} 词')
print(f'  Grade 2: {sum(len(u[\"words\"]) for u in g2[\"units\"])} 词')
gk = json.load(open('data/grammar/kindergarten.json', encoding='utf-8'))
print(f'  启蒙句型: {len(gk[\"topics\"])} 个')
rk = json.load(open('data/reading/kindergarten.json', encoding='utf-8'))
print(f'  启蒙阅读: {len(rk[\"articles\"])} 篇')
"
```

预期输出：

```
=== 一二年级数据完整性 ===
  Grade 1: 80 词
  Grade 2: 100 词
  启蒙句型: 12 个
  启蒙阅读: 15 篇
```

---

## 🚦 整体执行建议

完整跑下来约 1-1.5 小时，分 4 轮（写作模块跳过）。建议顺序：

1. **第 1 轮** (一年级 80 词) → 测试一下应用打开一年级看看 ✓
2. **第 2 轮** (二年级 100 词) → 同上 ✓
3. **第 3 轮** (12 个句型) → 测试语法模块在一年级状态下能正常显示
4. **第 4 轮** (15 篇阅读) → 测试阅读模块

每完成一轮就部署一次到 GitHub Pages，避免一次性改太多东西出问题不知道在哪。

---

## ⚠️ 1-2 年级使用应用的提醒

应用本身的 UI 还是面向 3-9 年级设计的，1-2 年级孩子用：

- **大量中文按钮和说明文字**对刚识字的小孩偏复杂，需要家长辅助操作
- **写作工坊的 4 维度智能批改**对 1-2 年级**没有意义**（孩子还不会写英语句子），最好让 1-2 年级隐藏写作入口
- **跟读评分**的容错率对小孩可能太严苛
- **错题本**的概念对小孩偏难

如果你 1-2 年级用户量起来，建议未来做一个**学龄前专用 UI**（按钮巨大、文字图标化、简化交互流程）。这一步现在不用做，先把内容补上看看实际反馈。
