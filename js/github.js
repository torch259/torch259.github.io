/* 作品库：从 GitHub 公开 API 拉取用户仓库 */

(function () {
  var container = document.getElementById("repos");

  if (!GITHUB_USERNAME) {
    container.innerHTML =
      '<p class="placeholder">在 <code>js/config.js</code> 里填写 <code>GITHUB_USERNAME</code> 后，这里会自动展示你的 GitHub 公开仓库。</p>';
    return;
  }

  var url = "https://api.github.com/users/" + encodeURIComponent(GITHUB_USERNAME) +
    "/repos?sort=updated&per_page=100";

  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (repos) {
      // 排除 fork 仓库，按最近更新时间排序，最多展示 12 个
      var list = repos
        .filter(function (r) { return !r.fork; })
        .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); })
        .slice(0, 12);

      if (!list.length) {
        container.innerHTML = '<p class="placeholder">没有找到公开仓库。</p>';
        return;
      }

      container.innerHTML = list.map(function (r) {
        var desc = r.description || "暂无描述";
        var lang = r.language
          ? '<span class="lang-dot" style="background:' + langColor(r.language) + '"></span>' + escapeHtml(r.language)
          : "";
        return (
          '<a class="repo" href="' + escapeHtml(r.html_url) + '" target="_blank" rel="noopener">' +
          "<h3>" + escapeHtml(r.name) + "</h3>" +
          "<p>" + escapeHtml(desc) + "</p>" +
          '<div class="meta"><span>' + lang + "</span>" +
          "<span>⭐ " + r.stargazers_count + "</span></div>" +
          "</a>"
        );
      }).join("");
    })
    .catch(function () {
      container.innerHTML = '<p class="placeholder">加载失败，请检查用户名是否正确或网络是否可用。</p>';
    });
})();

/* 常见语言对应颜色（用于语言小圆点） */
function langColor(lang) {
  var map = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
    Java: "#b07219", "C++": "#f34b7d", C: "#555555", "C#": "#178600",
    Go: "#00ADD8", Rust: "#dea584", HTML: "#e34c26", CSS: "#563d7c",
    Vue: "#41b883", Shell: "#89e051",
  };
  return map[lang] || "#9ca3af";
}
