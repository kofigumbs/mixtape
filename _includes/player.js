var SOUNDCLOUD_REGEX = /soundcloud\.com/;
var YOUTUBE_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

var current = -1;
var container = document.querySelector("[data-container]");
var play      = document.querySelector("[data-play]")
var tracks    = document.querySelectorAll("[data-track]");

play.addEventListener("click", start);

function start() {
  current++;
  container.innerHTML = "";
  play.innerText = "Play Next";
  tracks.forEach(function(el) { el.classList.remove("active") });

  var match;
  var el = tracks[current % tracks.length];
  var trackUrl = el.dataset.track;
  el.classList.add("active");

  if (match = trackUrl.match(SOUNDCLOUD_REGEX)) {
    setupSoundcloud(trackUrl);
  } else if (match = trackUrl.match(YOUTUBE_REGEX)) {
    setupYoutube(match[2]);
  }
}

function setupSoundcloud(url) {
  var el = document.createElement("iframe");
  el.src = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url) + "&auto_play=true";
  el.setAttribute("height", 166);
  el.setAttribute("width", "100%");
  el.setAttribute("scrolling", "no");
  el.setAttribute("frameborder", "no");
  el.setAttribute("allow", "autoplay");
  container.appendChild(el);
  SC.Widget(el).bind(SC.Widget.Events.ERROR, start);
  SC.Widget(el).bind(SC.Widget.Events.FINISH, start);
}

function setupYoutube(videoId) {
  var player = document.createElement("div");
  player.id = "player";
  container.appendChild(player);

  new YT.Player("player", {
    height: window.innerHeight,
    width: window.innerWidth,
    videoId: videoId,
    events: {
      onReady: function(event) { event.target.playVideo() },
      onError: function(event) { start() },
      onStateChange: function(event) { if (event.data == YT.PlayerState.ENDED) start() },
    }
  });

  window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
}
