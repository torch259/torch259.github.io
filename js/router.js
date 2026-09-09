/* 视图路由：把单页拆成若干独立"视图"（如 #/music、#/works）。
 * 点击顶栏导航切换 hash，只显示当前视图并高亮对应导航项。
 * 支持直接访问、刷新、后退，未知 hash 一律回到首页。
 */
(function () {
  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[data-view]'));
  var current = "";

  function getView(name) {
    if (!name) return null;
    for (var i = 0; i < views.length; i++) {
      if (views[i].id === "view-" + name) return views[i];
    }
    return null;
  }

  function show(name) {
    var view = getView(name) || getView("home");
    var realName = view ? view.id.replace("view-", "") : "home";

    views.forEach(function (v) { v.classList.toggle("active", v === view); });
    links.forEach(function (a) { a.classList.toggle("active", a.dataset.view === realName); });

    current = realName;

    // 更新浏览器标题
    var base = (typeof SITE !== "undefined" && SITE.nickname) ? SITE.nickname : "个人主页";
    var sub = view && view.dataset.title ? " · " + view.dataset.title : "";
    document.title = base + sub;

    window.scrollTo(0, 0);
  }

  function parseHash() {
    // "#/music" / "#music" / "#/" / "" 都能解析
    var raw = location.hash.replace(/^#\/?/, "");
    var name = raw.split("/")[0];
    show(name || "home");
  }

  window.addEventListener("hashchange", parseHash);
  parseHash();
})();
