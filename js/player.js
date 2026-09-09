/* 本地音乐播放器：读取 MUSIC 清单，同源加载音频文件。
 * 歌单可折叠（点击"播放列表"标题栏展开/收起）。
 */

(function () {
  var audio = new Audio();
  var list = MUSIC || [];
  var index = -1;

  var el = {
    player:   document.querySelector(".player"),
    cover:    document.getElementById("cover"),
    title:    document.getElementById("song-title"),
    artist:   document.getElementById("song-artist"),
    play:     document.getElementById("btn-play"),
    prev:     document.getElementById("btn-prev"),
    next:     document.getElementById("btn-next"),
    seek:     document.getElementById("seek"),
    volume:   document.getElementById("volume"),
    cur:      document.getElementById("cur"),
    dur:      document.getElementById("dur"),
    playlist: document.getElementById("playlist"),
    toggle:   document.getElementById("playlist-toggle"),
    collapse: document.querySelector(".playlist-collapse"),
    status:   document.getElementById("playlist-status"),
  };

  /* ---------- 歌单折叠 ---------- */
  function setOpen(open) {
    if (el.collapse) el.collapse.classList.toggle("open", open);
    if (el.toggle) el.toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function isOpen() {
    return el.collapse ? el.collapse.classList.contains("open") : true;
  }
  if (el.toggle) {
    el.toggle.addEventListener("click", function () { setOpen(!isOpen()); });
  }

  function updateStatus(text) {
    if (el.status) el.status.textContent = text || "";
  }
  function countText() {
    return "共 " + list.length + " 首";
  }

  /* 播放 / 暂停两种视觉状态：暂停时隐藏歌曲内部信息 */
  function setPlaying(playing) {
    el.player.classList.toggle("idle", !playing);
    el.play.textContent = playing ? "⏸" : "▶";
  }

  function renderPlaylist() {
    el.playlist.innerHTML = list.map(function (song, i) {
      return (
        '<li class="song' + (i === index ? " active" : "") + '" data-i="' + i + '">' +
        '<span class="song-idx">' + (i + 1) + "</span>" +
        '<span class="song-name">' + escapeHtml(song.title) + " — " + escapeHtml(song.artist) + "</span>" +
        "</li>"
      );
    }).join("");
  }

  function load(i) {
    index = i;
    var song = list[i];
    if (!song) return;
    audio.src = song.src;
    el.title.textContent = song.title;
    el.artist.textContent = song.artist;
    if (song.cover) {
      el.cover.innerHTML = '<img src="' + escapeHtml(song.cover) + '" alt="" />';
    } else {
      el.cover.textContent = "♪";
    }
    renderPlaylist();
    updateStatus("正在播放：" + song.title);
    audio.play().catch(function () { setPlaying(false); });
  }

  function playPause() {
    if (!list.length) return;
    if (index === -1) { load(0); return; }
    if (audio.paused) audio.play().catch(function () {});
    else audio.pause();
  }

  function next(delta) {
    if (!list.length) return;
    load((index + delta + list.length) % list.length);
  }

  /* 事件绑定 */
  el.play.addEventListener("click", playPause);
  el.next.addEventListener("click", function () { next(1); });
  el.prev.addEventListener("click", function () { next(-1); });

  audio.addEventListener("play", function () { setPlaying(true); });
  audio.addEventListener("pause", function () { setPlaying(false); });
  audio.addEventListener("ended", function () { next(1); });

  audio.addEventListener("timeupdate", function () {
    if (audio.duration) {
      el.seek.value = (audio.currentTime / audio.duration) * 100;
      el.cur.textContent = fmtTime(audio.currentTime);
    }
  });

  audio.addEventListener("loadedmetadata", function () {
    el.dur.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener("error", function () {
    /* 加载失败时回到暂停态，不暴露内部文件路径 */
    audio.pause();
    index = -1;
    el.title.textContent = "";
    el.artist.textContent = "";
    el.cover.textContent = "♪";
    el.cur.textContent = "0:00";
    el.dur.textContent = "0:00";
    el.seek.value = 0;
    renderPlaylist();
    updateStatus(list.length ? countText() : "");
    setPlaying(false);
  });

  el.seek.addEventListener("input", function () {
    if (audio.duration) audio.currentTime = (el.seek.value / 100) * audio.duration;
  });

  audio.volume = 0.8;
  el.volume.value = 80;
  el.volume.addEventListener("input", function () {
    audio.volume = el.volume.value / 100;
  });

  el.playlist.addEventListener("click", function (e) {
    var li = e.target.closest(".song");
    if (li) load(parseInt(li.dataset.i, 10));
  });

  /* 初始化 */
  if (!list.length) {
    el.player.classList.add("empty");
    el.playlist.innerHTML = '<li class="placeholder">暂无歌曲，请先在 js/config.js 的 MUSIC 里登记。</li>';
    updateStatus("暂无歌曲");
    if (el.toggle) el.toggle.disabled = true;
    setOpen(false);
  } else {
    renderPlaylist();
    updateStatus(countText());
  }
  setPlaying(false);
})();
