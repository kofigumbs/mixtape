const SOUNDCLOUD_REGEX = /soundcloud\.com/;
const TWITTER_REGEX = /twitter\.com\/.+\/status\/(\d+)/;
const YOUTUBE_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

let current = -1;
const container = document.querySelector("[data-container]");
const play      = document.querySelector("[data-play]")
const tracks    = document.querySelectorAll("[data-track]");

play.addEventListener("click", start);

function start() {
  current++;
  container.innerHTML = "";
  play.innerText = "Play Next";
  tracks.forEach(function(el) { el.classList.remove("active") });

  let match;
  const el = tracks[current % tracks.length];
  const trackUrl = el.dataset.track;
  el.classList.add("active");

  if (trackUrl.match(SOUNDCLOUD_REGEX)) {
    setupSoundcloud(trackUrl);
  } else if (match = trackUrl.match(TWITTER_REGEX)) {
    setupTwitter(match[1]);
  } else if (match = trackUrl.match(YOUTUBE_REGEX)) {
    setupYoutube(match[2]);
  }
}

function setupSoundcloud(url) {
  const el = document.createElement("iframe");
  el.src = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url);
  el.setAttribute("height", 166);
  el.setAttribute("width", "100%");
  el.setAttribute("scrolling", "no");
  el.setAttribute("frameborder", "no");
  el.setAttribute("allow", "autoplay");

  const widget = SC.Widget(el);
  widget.bind(SC.Widget.Events.ERROR, start);
  widget.bind(SC.Widget.Events.FINISH, start);
  widget.bind(SC.Widget.Events.READY, function() { widget.play() });
  container.appendChild(el);
}

function setupTwitter(tweetId) {
  Promise.all([
    twttr.widgets.createTweet(tweetId, container, { align: "center" }),
    get("https://kofi.sexy/.netlify/functions/embed-twitter-video?tweet=" + tweetId),
  ]).then(function(arguments) {
    const card = arguments[0].shadowRoot.querySelector(".MediaCard");
    card.innerHTML = "";

    const source = document.createElement("source");
    source.type = "video/mp4";
    source.src = arguments[1];

    const player = document.createElement("video");
    player.autoplay = true;
    player.controls = true;
    player.style.width = "100%";
    player.style.borderRadius = "4px";
    player.appendChild(source);
    card.appendChild(player);

    return new Promise(function(resolve, reject) {
      player.addEventListener("ended", resolve);
      player.addEventListener("error", reject);
    });
  }).finally(start);
}

function setupYoutube(videoId) {
  const player = document.createElement("div");
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

function get(url) {
  return new Promise(function(resolve, reject) {
    const request = new XMLHttpRequest();
    request.addEventListener("load", function() {
      this.status === 200 ? resolve(this.responseText) : reject(this.responseText);
    });
    request.addEventListener("error", reject);
    request.open("GET", url);
    request.send();
  });
}
