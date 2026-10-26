const tracks = [
  { title: "back to friends", artist: "sombr", genre: "Инди", album: "back to friends", emoji: "🖤", image: "assets/back-to-friends.jpg", videoId: "c8zq4kAn_O0", duration: "3:22" },
  { title: "cry.", artist: "Cigarettes After Sex", genre: "Лоу-фай", album: "cry.", emoji: "☁️", image: "assets/cry.jpg", videoId: "3uZIJyu2m44", duration: "4:16" },
  { title: "lovers rock", artist: "TV Girl", genre: "Инди", album: "French Exit", emoji: "💗", image: "assets/lovers-rock.jpg", videoId: "j_sG_Juncn8", duration: "3:33" },
  { title: "спокойной ночи", artist: "Кино", genre: "Рок", album: "Ночь", emoji: "🌒", image: "assets/spokoynoy-nochi.jpg", videoId: "K4EDfjTda0Y", duration: "6:24" },
  { title: "O Green World", artist: "Gorillaz", genre: "Инди", album: "Demon Days", emoji: "🌍", image: "assets/o-green-world.jpg", videoId: "Hl7w9HPGmOk", duration: "4:35" },
  { title: "Char", artist: "Crystal Castles", genre: "Электроника", album: "Crystal Castles", emoji: "⚡", image: "assets/char.jpg", videoId: "vmfg97UCzso", duration: "3:08" },
  { title: "Sad Girl", artist: "Lana Del Rey", genre: "Поп", album: "Ultraviolence", emoji: "🌙", image: "assets/sad-girl.jpg", videoId: "yS785LHbriw", duration: "5:18" },
  { title: "WILDFLOWER", artist: "Billie Eilish", genre: "Поп", album: "HIT ME HARD AND SOFT", emoji: "🌸", image: "assets/wildflower.jpg", videoId: "IWKyykQBRKo", duration: "4:22" }
];

const albums = [
  { title: "back to friends", artist: "sombr", emoji: "🖤", image: "assets/back-to-friends.jpg", cls: "" },
  { title: "cry.", artist: "Cigarettes After Sex", emoji: "☁️", image: "assets/cry.jpg", cls: "c2" },
  { title: "lovers rock", artist: "TV Girl", emoji: "💗", image: "assets/lovers-rock.jpg", cls: "c3" },
  { title: "спокойной ночи", artist: "Кино", emoji: "🌒", image: "assets/spokoynoy-nochi.jpg", cls: "c4" }
];

let current = -1;
let playing = false;
let favorites = new Set();
let view = "home";
let shuffled = false;
let player = null;
let playerReady = false;
let progressTimer = null;

const $ = id => document.getElementById(id);
const fmt = seconds => {
  if (!Number.isFinite(seconds)) return "0:00";
  seconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("youtubePlayer", {
    width: "320",
    height: "200",
    videoId: tracks[0].videoId,
    playerVars: { playsinline: 1, rel: 0 },
    events: {
      onReady: () => { playerReady = true; updatePlayer(); },
      onStateChange: event => {
        if (event.data === YT.PlayerState.PLAYING) {
          playing = true;
          startProgressTimer();
        } else {
          playing = false;
          stopProgressTimer();
        }
        updatePlayButton();
        renderTracks();
        if (event.data === YT.PlayerState.ENDED) nextTrack();
      },
      onError: () => {
        $("youtubeStatus").textContent = "Это видео нельзя встроить. Попробуй открыть его на YouTube.";
      }
    }
  });
};

function filteredTracks() {
  const q = $("search").value.toLowerCase().trim();
  const artist = $("artistFilter").value;
  const genre = $("genreFilter").value;
  return tracks.filter((t, i) =>
    (view !== "favorites" || favorites.has(i)) &&
    (!artist || t.artist === artist) &&
    (!genre || t.genre === genre) &&
    (!q || `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q))
  );
}

function playIndex(filteredIndex) {
  const list = filteredTracks();
  if (!list.length) return;
  if (filteredIndex < 0) filteredIndex = list.length - 1;
  if (filteredIndex >= list.length) filteredIndex = 0;
  current = tracks.indexOf(list[filteredIndex]);
  updatePlayer();
  renderTracks();
  if (!playerReady || !player) {
    $("youtubeStatus").textContent = "Подключаю YouTube-плеер… попробуй нажать ▶ ещё раз через секунду.";
    return;
  }
  $("youtubeStatus").textContent = "Загрузка видео YouTube…";
  player.loadVideoById(tracks[current].videoId);
}

function togglePlay() {
  if (current < 0) { playIndex(0); return; }
  if (!playerReady || !player) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
}

function nextTrack() {
  const list = filteredTracks();
  if (!list.length) return;
  const idx = list.findIndex(t => tracks.indexOf(t) === current);
  playIndex(shuffled ? Math.floor(Math.random() * list.length) : (idx + 1) % list.length);
}
function prevTrack() {
  if (playerReady && player && player.getCurrentTime() > 3) {
    player.seekTo(0, true);
    return;
  }
  const list = filteredTracks();
  if (!list.length) return;
  const idx = list.findIndex(t => tracks.indexOf(t) === current);
  playIndex((idx - 1 + list.length) % list.length);
}

function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(updateProgress, 500);
}
function stopProgressTimer() {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = null;
}
function updateProgress() {
  if (!playerReady || !player) return;
  const duration = player.getDuration() || 0;
  const time = player.getCurrentTime() || 0;
  $("currentTime").textContent = fmt(time);
  $("totalTime").textContent = fmt(duration);
  $("progress").value = duration ? (time / duration) * 1000 : 0;
}
function updatePlayButton() {
  $("playPause").textContent = playing ? "Ⅱ" : "▶";
}
function updatePlayer() {
  const track = tracks[current];
  if (track) {
    $("nowTitle").textContent = track.title;
    $("nowArtist").textContent = track.artist;
    $("nowArt").innerHTML = `<img src="${track.image}" alt="Обложка ${track.title}">`;
    $("favCurrent").textContent = favorites.has(current) ? "♥" : "♡";
    $("youtubeStatus").textContent = `Выбрано: ${track.title} — ${track.artist}`;
  }
  updatePlayButton();
  updateProgress();
}

function renderAlbums() {
  $("albumGrid").innerHTML = albums.map((a, i) => `
    <div class="album" data-album="${i}">
      <div class="cover ${a.cls}"><img class="cover-image" src="${a.image}" alt="Обложка ${a.title}"></div>
      <div class="album-title">${a.title}</div>
      <div class="album-artist">${a.artist}</div>
    </div>`).join("");
  document.querySelectorAll("[data-album]").forEach(el => {
    el.onclick = () => {
      const album = albums[Number(el.dataset.album)];
      const index = tracks.findIndex(t => t.album === album.title || t.title === album.title);
      const visibleIndex = filteredTracks().findIndex(t => tracks.indexOf(t) === index);
      playIndex(visibleIndex >= 0 ? visibleIndex : 0);
    };
  });
}

function renderTracks() {
  const list = filteredTracks();
  $("trackList").innerHTML = list.length ? list.map((t, n) => {
    const i = tracks.indexOf(t);
    return `<div class="track ${i === current ? "playing" : ""}">
      <div class="track-num">${String(n + 1).padStart(2, "0")}</div>
      <div class="mini-cover"><img src="${t.image}" alt=""></div>
      <div><div class="track-name">${t.title}</div><div class="track-artist">${t.artist}</div></div>
      <div class="duration">${t.duration}</div>
      <button class="play-btn" data-play="${i}" aria-label="Воспроизвести">${i === current && playing ? "Ⅱ" : "▶"}</button>
    </div>`;
  }).join("") : '<div class="empty">Ничего не найдено. Попробуй другой запрос.</div>';

  document.querySelectorAll("[data-play]").forEach(button => {
    button.onclick = () => {
      const index = Number(button.dataset.play);
      if (current === index) togglePlay();
      else playIndex(filteredTracks().findIndex(t => tracks.indexOf(t) === index));
    };
  });
}

function render() {
  renderTracks();
  $("albumsSection").style.display = (view === "home" || view === "albums") ? "" : "none";
  $("trackHeading").textContent =
    view === "favorites" ? "Избранное" :
    view === "artists" ? "Все исполнители" :
    view === "albums" ? "Треки" : "Все треки";
  document.querySelectorAll(".nav button").forEach(button =>
    button.classList.toggle("active", button.dataset.view === view)
  );
}

$("artistFilter").innerHTML = '<option value="">Все исполнители</option>' +
  [...new Set(tracks.map(t => t.artist))].map(artist =>
    `<option value="${artist}">${artist}</option>`).join("");

$("search").addEventListener("input", renderTracks);
$("artistFilter").addEventListener("change", renderTracks);
$("genreFilter").addEventListener("change", renderTracks);
document.querySelectorAll(".nav button").forEach(button => {
  button.onclick = () => { view = button.dataset.view; render(); };
});
document.querySelectorAll(".playlist-link").forEach(button => {
  button.onclick = () => {
    view = button.dataset.playlist === "Любимые треки" ? "favorites" : "all";
    $("genreFilter").value = button.dataset.playlist === "Рок" ? "Рок" :
      button.dataset.playlist === "Для учёбы" ? "Лоу-фай" : "";
    render();
  };
});
$("playPause").onclick = togglePlay;
$("next").onclick = nextTrack;
$("prev").onclick = prevTrack;
$("shuffle").onclick = () => {
  shuffled = !shuffled;
  $("shuffle").style.color = shuffled ? "#e16acb" : "#d9d3f1";
};
$("favCurrent").onclick = () => {
  if (current < 0) return;
  favorites.has(current) ? favorites.delete(current) : favorites.add(current);
  updatePlayer();
  renderTracks();
};
$("progress").oninput = () => {
  if (playerReady && player && player.getDuration()) {
    player.seekTo((Number($("progress").value) / 1000) * player.getDuration(), true);
  }
};
$("newPlaylist").onclick = () => {
  const name = prompt("Название плейлиста:");
  if (!name) return;
  const button = document.createElement("button");
  button.className = "playlist-link";
  button.textContent = "♫ " + name;
  button.onclick = () => { view = "all"; render(); };
  document.querySelector(".side-title").after(button);
};

renderAlbums();
render();
