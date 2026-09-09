/* 首页顶部组件：实时时钟（每秒刷新）+ 月历（可翻月 / 回到今天 / 点选日期） */

(function () {
  var clockEl = document.getElementById("clock");
  var calEl = document.getElementById("calendar");
  if (!clockEl || !calEl) return;

  var WEEK = ["一", "二", "三", "四", "五", "六", "日"];
  var nickname =
    (typeof SITE !== "undefined" && SITE.nickname) ? SITE.nickname : "朋友";

  function fmt2(n) { return n < 10 ? "0" + n : "" + n; }

  function greeting(h) {
    if (h < 6) return "夜深了";
    if (h < 9) return "早上好";
    if (h < 12) return "上午好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  }

  /* ---------- 实时时钟 ---------- */
  function tick() {
    var d = new Date();
    var w = WEEK[(d.getDay() + 6) % 7]; // 周一为一周开头
    clockEl.innerHTML =
      '<div class="clock-time">' +
        fmt2(d.getHours()) + ":" + fmt2(d.getMinutes()) +
        '<span class="clock-sec">:' + fmt2(d.getSeconds()) + "</span>" +
      "</div>" +
      '<div class="clock-date">' + d.getFullYear() + "年" + (d.getMonth() + 1) +
        "月" + d.getDate() + "日 · 星期" + w + "</div>" +
      '<div class="clock-greet">' + greeting(d.getHours()) + "，" + nickname + "</div>";
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 月历 ---------- */
  var today = new Date();
  var viewY = today.getFullYear();   // 当前展示的年份
  var viewM = today.getMonth();      // 当前展示的月份（0 起）
  var sel = null;                    // 用户点选的日期 {y, m, d}

  function isSameDay(a, b) {
    return a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function renderCalendar() {
    var first = new Date(viewY, viewM, 1);
    var offset = (first.getDay() + 6) % 7;          // 月首前留白（周一开头）
    var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

    var cells = "";
    for (var i = 0; i < offset; i++) {
      cells += '<span class="day blank"></span>';
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var dt = new Date(viewY, viewM, d);
      var cls = "day";
      if (dt.getDay() === 0 || dt.getDay() === 6) cls += " weekend";
      if (isSameDay(dt, today)) cls += " today";
      if (sel && sel.y === viewY && sel.m === viewM && sel.d === d) cls += " sel";
      cells += '<button type="button" class="' + cls + '" data-d="' + d + '">' + d + "</button>";
    }

    calEl.innerHTML =
      '<div class="cal-head">' +
        '<button type="button" class="cal-nav" data-nav="-1" title="上个月">‹</button>' +
        '<div class="cal-title">' + viewY + "年 " + (viewM + 1) + "月</div>" +
        '<button type="button" class="cal-nav" data-nav="1" title="下个月">›</button>' +
      "</div>" +
      '<div class="cal-week">' +
        WEEK.map(function (w) {
          return '<span class="' + (w === "六" || w === "日" ? "weekend" : "") + '">' + w + "</span>";
        }).join("") +
      "</div>" +
      '<div class="cal-grid">' + cells + "</div>" +
      '<div class="cal-foot">' +
        '<button type="button" class="cal-today" title="回到今天">回到今天</button>' +
      "</div>";
  }

  calEl.addEventListener("click", function (e) {
    var t = e.target;
    var nav = t.closest ? t.closest("[data-nav]") : null;
    if (nav) {
      viewM += parseInt(nav.getAttribute("data-nav"), 10);
      if (viewM < 0) { viewM = 11; viewY--; }
      if (viewM > 11) { viewM = 0; viewY++; }
      renderCalendar();
      return;
    }
    if (t.closest && t.closest(".cal-today")) {
      var n = new Date();
      viewY = n.getFullYear();
      viewM = n.getMonth();
      sel = null;
      renderCalendar();
      return;
    }
    var dayBtn = t.closest ? t.closest(".day") : null;
    if (dayBtn) {
      sel = { y: viewY, m: viewM, d: parseInt(dayBtn.getAttribute("data-d"), 10) };
      renderCalendar();
    }
  });

  renderCalendar();
})();
