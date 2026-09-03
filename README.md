# 个人主页

一个**纯静态**的个人主页，无需后端，可直接托管到 GitHub Pages 等任意静态空间。

包含功能：

- 🧑 **个人信息展示**：昵称、个人格言、简介、头像、爱好标签
- 🗂 **作品库**：自动拉取并展示你的 GitHub 公开仓库
- 🎵 **音乐播放器**：本地音频文件自托管播放（播放列表、进度、音量）
- 🧩 **小功能入口**：为后续上线的小游戏、图片生成等工具预留

## 目录结构

```
├── index.html         主页
├── css/
│   └── style.css      样式（简约风格）
├── js/
│   ├── config.js      ★ 集中配置（改这个文件即可）
│   ├── main.js        渲染个人信息 / 爱好 / 小功能
│   ├── github.js      作品库（GitHub API）
│   └── player.js      音乐播放器
├── music/
│   └── README.md      如何添加音乐
└── README.md          本文档
```

## 快速开始

### 本地预览

因为作品库需要请求 GitHub API、音乐需要同源加载，建议用本地服务器预览（直接双击打开 `index.html` 也能看，但部分功能会受限）：

```bash
# 任选其一
python -m http.server 8000
# 或
npx serve .
```

然后浏览器打开 `http://localhost:8000`。

### 部署到 GitHub Pages

1. 把项目推到一个 GitHub 仓库。
2. 仓库 Settings → Pages → Source 选 `main` 分支根目录（或 `gh-pages`）。
3. 稍等片刻，访问 `https://<你的用户名>.github.io/<仓库名>/`。

## 如何修改

所有个人内容都集中在 **`js/config.js`** 一个文件里，改完保存刷新即可。

### 1. 改昵称 / 格言 / 简介 / 头像

```js
const SITE = {
  nickname: "你的昵称",
  motto: "你的个人格言",
  intro: "一句话自我介绍……",
  avatar: "assets/avatar.jpg",   // 头像图路径；留空显示昵称首字
};
```

### 2. 改爱好

```js
const HOBBIES = [
  { name: "编程", icon: "💻" },
  { name: "音乐", icon: "🎵" },
  // 增删即可
];
```

### 3. 接入 GitHub 作品库

把 `GITHUB_USERNAME` 填上你的 GitHub 用户名：

```js
const GITHUB_USERNAME = "你的用户名";
```

作品库会自动拉取你的公开仓库（排除 fork、按更新时间排序、最多 12 个）。

### 4. 添加音乐（本地文件）

见 [`music/README.md`](music/README.md)。核心就两步：

1. 把音频文件放进 `music/` 文件夹；
2. 在 `MUSIC` 数组里登记路径：

```js
const MUSIC = [
  { title: "我的歌", artist: "歌手", cover: "", src: "music/我的歌.mp3" },
];
```

### 5. 上线小功能（小游戏 / 图片生成等）

1. 新建一个页面文件，例如 `games/snake.html`。
2. 在 `FEATURES` 里登记：

```js
const FEATURES = [
  { name: "贪吃蛇", desc: "小游戏", link: "games/snake.html", done: true },
  { name: "模板图片生成", desc: "在线生成模板图片", link: "", done: false },
];
```

`done: true` 且 `link` 非空时，首页会渲染成可点击链接；否则显示「敬请期待」。

## 技术说明

- **纯静态**：HTML + CSS + 原生 JavaScript，无框架、无构建步骤、无后端。
- **作品库**：调用 GitHub 公开 REST API（`api.github.com/users/<name>/repos`），无鉴权但有请求频率限制（每小时 60 次/未鉴权）。
- **音乐**：`<audio>` 标签同源加载项目内的音频文件，稳定可控，无需第三方接口。

## 常见问题

**Q：为什么不能直接播放我电脑里的本地音乐？**
A：浏览器安全限制，网页无法读取电脑任意路径的文件。把音频放进项目里托管即可，这就是「本地播放」的正确实现方式。

**Q：想用网易云等第三方音乐接口可以吗？**
A：可以，但静态页面直连第三方接口通常会有 CORS 跨域问题，一般需要后端代理。本项目默认采用本地文件方案，最稳定。

**Q：GitHub 作品库加载失败？**
A：检查 `GITHUB_USERNAME` 是否填对、网络是否可达；未鉴权的 API 有频率限制，短时间多次刷新可能触发。

**Q：想加暗色模式 / 更多样式？**
A：样式都在 `css/style.css`，配色集中在文件顶部的 `:root` 变量里，改 `--bg`、`--accent` 等即可整体换肤。
