/**
 * ============================================================
 *  个人主页配置文件 —— 日常修改只需动这个文件
 * ============================================================
 *  1. SITE             个人信息（昵称 / 格言 / 简介 / 头像）
 *  2. HOBBIES          爱好列表
 *  3. GITHUB_USERNAME  GitHub 用户名（用于作品库）
 *  4. MUSIC            音乐清单（本地音频文件）
 *  5. FEATURES         小功能入口（后续上线的小工具）
 */

/* ---------- 个人信息 ---------- */
const SITE = {
  nickname: "你的昵称",                 // 显示在顶栏和 Hero 区
  motto: "你的个人格言",                 // 一句格言，展示在昵称下方
  intro: "一句话自我介绍，介绍你是谁、在做什么。",  // 可选，留空则不显示
  avatar: "",                            // 头像图片路径，如 "assets/avatar.jpg"，留空则显示昵称首字
};

/* ---------- 爱好 ---------- */
const HOBBIES = [
  { name: "编程", icon: "💻" },
  { name: "音乐", icon: "🎵" },
  { name: "阅读", icon: "📚" },
  { name: "摄影", icon: "📷" },
];

/* ---------- GitHub（作品库） ---------- */
// 填你的用户名，如 "torvalds"；留空时作品库会显示提示
const GITHUB_USERNAME = "";

/* ---------- 音乐清单（本地音频文件） ----------
 * 把 mp3 等音频文件放进 music/ 文件夹，
 * 每首歌的 src 指向对应文件路径，例如 "music/song1.mp3"。
 * cover 是封面图路径，留空则显示占位符号。
 * 详见 music/README.md
 */
const MUSIC = [
  { title: "示例歌曲一", artist: "示例歌手", cover: "", src: "music/song1.mp3" },
  { title: "示例歌曲二", artist: "示例歌手", cover: "", src: "music/song2.mp3" },
];

/* ---------- 小功能入口 ----------
 * 后续上线小游戏、图片生成等工具时，在这里登记即可出现在首页。
 *   link：页面路径（如 "games/snake.html"）
 *   done：false 显示"敬请期待"，上线后改成 true
 */
const FEATURES = [
  { name: "小游戏",       desc: "简单小游戏合集",     link: "", done: false },
  { name: "模板图片生成", desc: "在线生成模板图片",   link: "", done: false },
];
