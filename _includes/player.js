var SOUNDCLOUD_REGEX = /soundcloud\.com/;
var TWITTER_REGEX = /twitter\.com\/.+\/status\/(\d+)/;
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

  if (trackUrl.match(SOUNDCLOUD_REGEX)) {
    setupSoundcloud(trackUrl);
  } else if (match = trackUrl.match(TWITTER_REGEX)) {
    setupTwitter(match[1]);
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

function setupTwitter(tweetId) {
  // ATTEMPT 1. Use official Twitter JS library,
  // but no methods/listeners provided to observe listening state.
  //
  twttr.widgets.createTweet(tweetId, container).then(function() {
    document
      .querySelector("twitter-widget").shadowRoot
      .querySelector("[aria-label='Play Media']").click();
    return new Promise(function(resolve, reject) {
      window.addEventListener("message", function(event) { console.log(event) }, true);
      // video.addEventListener("ended", resolve);
      // video.addEventListener("error", reject);
    });
  }).finally(start);

  // ATTEMPT 2. Create iframe (like with SoundCloud),
  // but CORS only allows me to listen to messages that are explicitly posted.
  // Twitter doesn't post any messages that indicate play state of media.
  //
  // var el = document.createElement("iframe");
  // el.src = "https://twitter.com/i/videos/tweet/" + tweetId + "?autoplay=1";
  // el.setAttribute("scrolling", "no");
  // el.setAttribute("frameborder", "no");
  // el.setAttribute("allow", "autoplay");
  // container.appendChild(el);

  // ATTEMPT 3. Use CORS proxy to get tweet or video information directly,
  // but these require oauth.
  //
  // var request = new XMLHttpRequest();
  // request.addEventListener("load", function() {
  //   container.innerText = this.responseText;
  // });
  // // request.open("GET", "https://cors-anywhere.herokuapp.com/https://twitter.com/i/videos/tweet/" + tweetId);
  // // request.open("GET", "https://cors-anywhere.herokuapp.com/https://api.twitter.com/1.1/videos/tweet/config/" + tweetId + ".json");
  // request.send();

  // ATTEMPT 4. Get video ID at build-time?
  //
  // container.innerHTML = `
  //   <video autoplay preload="none" playsinline="" poster="https://pbs.twimg.com/ext_tw_video_thumb/1195154006584233984/pu/img/R6qTSr--6Ol_741H.jpg" src="https://twitter.com/d6d49839-7d93-4a40-b99f-d14abb451648" style="width: 100%; height: 100%; position: absolute; background-color: black; transform: rotate(0deg) scale(1.005);"></video>
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
