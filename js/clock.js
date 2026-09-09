/* 首页顶部组件：实时时钟（每秒刷新）+ 矩阵式月历（7×6 固定网格） */

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
      '<div class="clock-top">' +
        '<span class="clock-week">星期' + w + '</span>' +
        '<span class="clock-date">' + d.getMonth() + "月" + d.getDate() + "日</span>" +
      "</div>" +
      '<div class="clock-time">' +
        fmt2(d.getHours()) + ":" + fmt2(d.getMinutes()) +
        '<span class="clock-sec">:' + fmt2(d.getSeconds()) + "</span>" +
      "</div>" +
      '<div class="clock-greet">' + greeting(d.getHours()) + "，" + nickname + "</div>";
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 矩阵式月历（固定 7×6 网格，邻接月日期占位、可点击跨月） ---------- */
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
    var m = viewM, y = viewY;
    var first = new Date(y, m, 1);
    var startOffset = (first.getDay() + 6) % 7; // 周一开头前的留白格数
    var rows = 6;                               // 固定 6 行，构成 7×6 矩阵

    var cells = "";
    for (var idx = 0; idx < rows * 7; idx++) {
      var cellDate = new Date(y, m, 1 - startOffset + idx);
      var inMonth = cellDate.getMonth() === m;
      var cls = "day";
      if (!inMonth) cls += " out";                          // 邻接月日期（占位，弱化）
      if (cellDate.getDay() === 0 || cellDate.getDay() === 6) cls += " weekend";
      if (isSameDay(cellDate, today)) cls += " today";
      if (sel && cellDate.getFullYear() === sel.y &&
          cellDate.getMonth() === sel.m && cellDate.getDate() === sel.d) cls += " sel";
      cells +=
        '<button type="button" class="' + cls + '"' +
        ' data-y="' + cellDate.getFullYear() + '"' +
        ' data-m="' + cellDate.getMonth() + '"' +
        ' data-d="' + cellDate.getDate() + '">' +
        cellDate.getDate() +
        "</button>";
    }

    calEl.innerHTML =
      '<div class="cal-head">' +
        '<button type="button" class="cal-nav" data-nav="-1" title="上个月">‹</button>' +
        '<div class="cal-title">' + y + "年 " + (m + 1) + "月</div>" +
        '<button type="button" class="cal-nav" data-nav="1" title="下个月">›</button>' +
      "</div>" +
      '<div class="cal-week">' +
        WEEK.map(function (w) {
          return '<span class="' + (w === "六" || w === "日" ? "weekend" : "") + '">' + w + "</span>";
        }).join("") +
      "</div>" +
      '<div class="cal-matrix">' + cells + "</div>" +
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
    var cell = t.closest ? t.closest(".day") : null;
    if (cell) {
      var cy = parseInt(cell.getAttribute("data-y"), 10);
      var cm = parseInt(cell.getAttribute("data-m"), 10);
      var cd = parseInt(cell.getAttribute("data-d"), 10);
      if (cm !== viewM) { viewY = cy; viewM = cm; }   // 点邻接日期会跳到对应月份
      sel = { y: cy, m: cm, d: cd };
      renderCalendar();
    }
  });

  renderCalendar();
})();
