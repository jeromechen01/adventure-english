# 英语奇遇记 English Adventure

> 一款为中国大陆 3-9 年级学生设计的免费英语学习 Web 应用。

🦊 **测试版 V0.1** | 纯静态部署 | 零成本 | 数据本地保存

---

## ✨ 主要功能

- 🚀 **单词大冒险**：消消乐、打地鼠、卡牌收集、宠物养成 4 种游戏化记词玩法
- 🎓 **语法学院**：小学+初中共 20 个语法点，每个含规则、例句、5 道练习
- 📖 **阅读乐园**：分级阅读 + 点词查义 + 全文朗读 + 跟读评分
- ✍️ **写作工坊**：智能批改 (拼写/语法/词汇/结构 4 维度) + 范文学习
- 🏆 **激励系统**：金币、段位 (青铜→王者)、勋章、连续打卡、排行榜
- 📝 **错题本**：自动收集错词，一键复习
- 💾 **数据本地化**：全部进度存在浏览器，可导出/导入

## 🚀 五分钟部署到 GitHub Pages

无需任何编程基础，按下面的步骤跟着做就行。

### 第 1 步：注册 GitHub 账号

1. 打开 https://github.com/
2. 点击右上角 **Sign up**
3. 邮箱 + 密码 + 用户名（用户名只能包含字母、数字、连字符）
4. 收到激活邮件后激活账号

> 💡 用户名会出现在网址里，建议用英文小写好记的名字，比如 `lily-2026`

### 第 2 步：创建仓库

1. 登录后点击右上角 **+** → **New repository**
2. **Repository name** 填 `english-adventure`
3. 选择 **Public**（公开），不勾选 README
4. 点 **Create repository**

### 第 3 步：上传项目文件（两种方式选一种）

#### 方式 A：网页拖拽（推荐零基础用户）

1. 在新建好的空仓库页面，点击 **uploading an existing file** 链接
2. 把整个 `english-adventure` 文件夹**里面的所有文件和文件夹**拖进上传区
   - ⚠️ 注意：是把文件夹**里面的内容**拖进去，不是拖整个文件夹
   - 必须包括隐藏的 `.nojekyll` 文件（Mac 用户用 Cmd+Shift+. 显示隐藏文件）
3. 等所有文件都上传完，下方填写提交信息（随便写比如 "first commit"）
4. 点 **Commit changes**

#### 方式 B：Git 命令行（懂点命令的用户）

```bash
cd english-adventure
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/<你的用户名>/english-adventure.git
git push -u origin main
```

### 第 4 步：开启 GitHub Pages

1. 进入仓库后，点 **Settings** (⚙️ 在仓库导航栏)
2. 左侧菜单找到 **Pages**
3. **Source** 选 **Deploy from a branch**
4. **Branch** 选 `main`，文件夹选 `/ (root)`
5. 点 **Save**

### 第 5 步：访问网站

等 1-2 分钟，回到 Pages 页面会看到：

> ✅ Your site is live at `https://<你的用户名>.github.io/english-adventure/`

复制这个网址，就可以在手机/电脑/微信里打开使用了！

> ⚠️ **重要**：不要删除项目里的 `.nojekyll` 这个空文件，删了会导致部署失败。

### 第 6 步（可选）：绑定自定义域名

如果你有自己的域名（比如 `myschool.com`）：

1. 进入仓库 Settings → Pages
2. 在 **Custom domain** 输入你的域名
3. 在你的域名 DNS 后台添加一条 CNAME 记录指向 `<你的用户名>.github.io`
4. 等 DNS 生效（5-30 分钟）

## 🛠️ 本地预览

```bash
cd english-adventure
python3 -m http.server 8000
```

然后浏览器访问 http://localhost:8000

> 注意：直接双击 `index.html` 用 file:// 打开会有部分功能（fetch JSON）失败，必须用 HTTP 服务器。

## 📁 目录结构

```
english-adventure/
├── index.html            # 主入口
├── .nojekyll             # GitHub Pages 必需
├── assets/
│   ├── css/style.css     # 自定义样式
│   └── js/
│       ├── app.js        # 路由 + 主流程
│       ├── storage.js    # localStorage 封装
│       ├── speech.js     # 语音合成/识别
│       ├── gamification.js  # 段位/勋章/排行榜
│       ├── modules/      # 4 大学习模块
│       └── games/        # 4 个小游戏
└── data/                 # 学习内容 JSON
    ├── words/grade{3-9}.json   # 7 个年级单词库
    ├── grammar/             # 小学+初中语法
    ├── reading/             # 分级阅读
    └── writing/             # 写作话题与范文
```

## 🔧 内容扩充指引

测试版每个年级先填了 30 个高频词，可以按 `data/words/grade{N}.json` 的格式继续扩充：

```json
{
  "id": "g3w031",
  "word": "...",
  "phonetic": "/.../",
  "pos": "n.",
  "meaning": "中文",
  "examples": [{"en": "...", "zh": "..."}],
  "synonyms": [],
  "antonyms": [],
  "difficulty": 1,
  "tags": []
}
```

新增内容后重新上传 JSON 文件就生效，不用改任何代码。

## ⚠️ 浏览器兼容

- ✅ Chrome / Edge / Safari / 移动端微信浏览器 / QQ 浏览器（最新两个版本）
- 🔊 语音朗读功能要求浏览器支持 SpeechSynthesis API（绝大多数现代浏览器都支持）
- 🎤 跟读评分功能要求浏览器支持 SpeechRecognition API（Chrome / Safari / Edge 支持）

## 📜 许可证

MIT License - 可自由用于学习、研究、教育用途。

## 🙏 关于内容

- 单词内容基于人教版 PEP 小学英语和 Go for it! 初中英语高频词
- 不包含任何盗版教材原文
- 不收集任何个人信息，所有数据都保存在用户本地浏览器

---

**Made with ❤️ for English learners in China**
