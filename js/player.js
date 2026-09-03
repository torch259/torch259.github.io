/* 本地音乐播放器：读取 MUSIC 清单，同源加载音频文件 */

(function () {
  var audio = new Audio();
  var list = MUSIC || [];
  var index = -1;

  var el = {
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
  };

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

  function setPlayState(playing) {
    el.play.textContent = playing ? "⏸" : "▶";
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
    audio.play().catch(function () { setPlayState(false); });
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

  audio.addEventListener("play", function () { setPlayState(true); });
  audio.addEventListener("pause", function () { setPlayState(false); });
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
    if (index >= 0 && list[index].src) {
      el.title.textContent = "加载失败：" + list[index].title;
      el.artist.textContent = "请检查音频文件路径是否存在（" + list[index].src + "）";
      el.dur.textContent = "0:00";
    }
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
    el.playlist.innerHTML = '<p class="placeholder">暂无歌曲，请在 <code>js/config.js</code> 的 <code>MUSIC</code> 里添加。</p>';
  } else {
    renderPlaylist();
  }
})();
