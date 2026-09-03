/* 渲染个人信息与静态内容（昵称 / 格言 / 简介 / 头像 / 爱好 / 小功能） */

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
  // 昵称（Hero + 顶栏 + 页脚 + 页面标题）
  document.getElementById("nickname").textContent = SITE.nickname;
  document.getElementById("footer-name").textContent = SITE.nickname;
  document.title = SITE.nickname + " 的个人主页";
  document.querySelector(".brand").textContent = "· " + SITE.nickname;

  // 格言
  document.getElementById("motto").textContent = SITE.motto;

  // 简介
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

  // 爱好
  document.getElementById("hobbies").innerHTML = HOBBIES.map(function (h) {
    return '<span class="hobby">' +
      (h.icon ? "<span>" + h.icon + "</span>" : "") +
      escapeHtml(h.name) +
      "</span>";
  }).join("");

  // 小功能
  document.getElementById("feature-list").innerHTML = FEATURES.map(function (f) {
    var badge = f.done
      ? '<span class="badge on">已上线</span>'
      : '<span class="badge">敬请期待</span>';
    var body = "<h3>" + escapeHtml(f.name) + "</h3><p>" + escapeHtml(f.desc) + "</p>" + badge;
    if (f.done && f.link) {
      return '<a class="feature" href="' + escapeHtml(f.link) + '">' + body + "</a>";
    }
    return '<div class="feature">' + body + "</div>";
  }).join("");

  // 页脚年份
  document.getElementById("year").textContent = new Date().getFullYear();
})();
