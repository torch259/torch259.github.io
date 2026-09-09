/* 渲染个人信息与首页/关于/小工具内容（昵称 / 格言 / 简介 / 头像 / 爱好 / 模块入口 / 小功能）
 * 小工具仅渲染已上线（done: true）的内容；未上线时整块隐藏，上线后自动显示。
 */

/* ---------- 通用工具函数（供其它脚本复用） ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function fmtTime(t) {
  if (!isFinite(t) || t < 0) return "0:00";
  t = Math.floor(t);
  var m = Math.floor(t / 60);
  var s = t % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}

(function () {
  /* ---------- 顶栏 / 页脚 / 页面标题 ---------- */
  document.querySelector(".brand").textContent = "· " + SITE.nickname;
  document.getElementById("footer-name").textContent = SITE.nickname;

  /* ---------- 首页名片 ---------- */
  document.getElementById("nickname").textContent = SITE.nickname;
  document.getElementById("motto").textContent = SITE.motto || "";

  var introEl = document.getElementById("intro");
  if (SITE.intro) {
    introEl.textContent = SITE.intro;
  } else {
    introEl.style.display = "none";
  }

  // 头像：有图用图，无图显示昵称首字
  var avatarEl = document.getElementById("avatar");
  if (SITE.avatar) {
    avatarEl.innerHTML = '<img src="' + escapeHtml(SITE.avatar) + '" alt="头像" />';
  } else {
    avatarEl.textContent = SITE.nickname.trim().charAt(0) || "我";
  }

  /* ---------- 关于我 ---------- */
  var aboutIntro = document.getElementById("about-intro");
  if (SITE.intro) {
    aboutIntro.textContent = SITE.intro;
  } else {
    aboutIntro.style.display = "none";
  }

  var hobBox = document.getElementById("hobbies");
  if (HOBBIES && HOBBIES.length) {
    hobBox.innerHTML = HOBBIES.map(function (h) {
      return '<span class="hobby">' +
        (h.icon ? "<span>" + h.icon + "</span>" : "") +
        escapeHtml(h.name) +
        "</span>";
    }).join("");
  } else {
    hobBox.innerHTML = '<p class="placeholder">还没有填写爱好，去 <code>js/config.js</code> 的 HOBBIES 里加几条吧。</p>';
  }

  /* ---------- 小工具：只渲染已上线（done: true）的内容 ---------- */
  var live = (FEATURES || []).filter(function (f) { return f.done; });

  var featureEl = document.getElementById("feature-list");
  if (live.length) {
    featureEl.innerHTML = live.map(function (f) {
      var body =
        "<h3>" + escapeHtml(f.name) + "</h3>" +
        "<p>" + escapeHtml(f.desc || "") + "</p>" +
        '<span class="badge on">已上线</span>';
      if (f.link) {
        return '<a class="feature" href="' + escapeHtml(f.link) + '">' + body + "</a>";
      }
      return '<div class="feature">' + body + "</div>";
    }).join("");
  } else {
    featureEl.innerHTML =
      '<div class="placeholder-box">' +
      '<p class="placeholder">还没有上线的小工具。</p>' +
      '<p class="placeholder">在 <code>js/config.js</code> 的 FEATURES 里把某项 <code>done</code> 改为 <code>true</code> 并填好 link，这里和顶栏会自动显示。</p>' +
      "</div>";
  }

  // 未上线时：隐藏顶栏"小工具"入口与首页入口卡片；有上线内容才显示
  var navTools = document.getElementById("nav-tools");
  if (navTools) navTools.style.display = live.length ? "" : "none";

  var toolsDesc = document.getElementById("tools-desc");
  if (toolsDesc) {
    toolsDesc.textContent = live.length
      ? "已上线 " + live.length + " 个小工具，欢迎体验。"
      : "未上线的内容暂不展示，上线后自动出现。";
  }

  /* ---------- 首页"模块入口"卡片（层次化：首页做总览，各模块独立成页） ---------- */
  var QUICK = [
    { view: "about", icon: "🙋", name: "关于我",  desc: "自我介绍与爱好" },
    { view: "works", icon: "🗂️", name: "作品库",   desc: "GitHub 上的开源项目" },
    { view: "music", icon: "🎵", name: "音乐",     desc: "自带本地音乐播放器" },
  ];
  if (live.length) {
    QUICK.push({ view: "tools", icon: "🧩", name: "小工具", desc: "已上线 " + live.length + " 个，点此查看" });
  }

  var quickEl = document.getElementById("quick-links");
  if (quickEl) {
    quickEl.innerHTML = QUICK.map(function (q) {
      return (
        '<a class="ql" href="#/' + escapeHtml(q.view) + '">' +
          '<span class="ql-icon">' + q.icon + "</span>" +
          '<span class="ql-name">' + escapeHtml(q.name) + "</span>" +
          '<span class="ql-desc">' + escapeHtml(q.desc) + "</span>" +
        "</a>"
      );
    }).join("");
  }

  /* ---------- 页脚年份 ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
