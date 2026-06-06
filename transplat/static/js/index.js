// ─── index.js ───

// prevent VideoJS nag
window.HELP_IMPROVE_VIDEOJS = false;

// ─── Interpolation Globals ───
var INTERP_VIDEO      = "./static/videos/interpolation/fireplace.mp4";
var NUM_INTERP_FRAMES = 198;
var INTERP_FPS        = 24;
var pendingFrame      = 0;
var displayedFrame    = -1;
var seekScheduled     = false;

function clampInterpolationFrame(idx) {
  idx = parseInt(idx, 10);
  if (Number.isNaN(idx)) idx = 0;
  return Math.max(0, Math.min(idx, NUM_INTERP_FRAMES - 1));
}

function frameToTime(idx) {
  return clampInterpolationFrame(idx) / INTERP_FPS;
}

function commitInterpolationSeek() {
  var video = document.getElementById("interpolation-video");
  seekScheduled = false;
  if (!video) return;

  if (video.readyState < 1) return;
  if (video.seeking) return;

  var targetFrame = clampInterpolationFrame(pendingFrame);
  if (targetFrame === displayedFrame) return;

  video.pause();
  displayedFrame = targetFrame;
  video.currentTime = frameToTime(targetFrame);
}

function requestInterpolationFrame(idx) {
  pendingFrame = clampInterpolationFrame(idx);
  if (seekScheduled) return;

  seekScheduled = true;
  window.requestAnimationFrame(commitInterpolationSeek);
}

function setupViewportVideoPlayback() {
  var videos = Array.from(document.querySelectorAll("video[autoplay]:not(#interpolation-video)"));
  if (!("IntersectionObserver" in window)) return;

  videos.forEach(function(video) {
    video.preload = "metadata";
    video.pause();
  });

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(function() {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.2 });

  videos.forEach(function(video) {
    observer.observe(video);
  });
}

$(document).ready(function() {
  // ─── Navbar burger toggle ───
  $(".navbar-burger").click(function() {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  // ─── Results Carousel ───
  if (window.bulmaCarousel) {
    bulmaCarousel.attach("#results-carousel", {
      slidesToScroll: 1,
      slidesToShow:   3,
      loop:           true,
      infinite:       false,
      autoplay:       false,
      autoplaySpeed:  3000,
    });
  }

  var interpolationVideo = document.getElementById("interpolation-video");

  // ─── Interpolation Slider Init ───
  $("#interpolation-slider").prop("max", NUM_INTERP_FRAMES - 1);
  if (interpolationVideo) {
    interpolationVideo.pause();
    interpolationVideo.addEventListener("loadedmetadata", function() {
      requestInterpolationFrame(pendingFrame);
    });
    interpolationVideo.addEventListener("seeked", function() {
      if (clampInterpolationFrame(pendingFrame) !== displayedFrame) {
        requestInterpolationFrame(pendingFrame);
      }
    });
  }

  // slider → frame
  $("#interpolation-slider").on("input", function() {
    requestInterpolationFrame(this.value);
  });

  // env-map button clicks → swap video & update target envmap
  $(".env-button").on("click", function() {
    INTERP_VIDEO      = $(this).data("video");
    NUM_INTERP_FRAMES = parseInt($(this).data("frames"), 10);
    pendingFrame      = 0;
    displayedFrame    = -1;
    seekScheduled     = false;

    $("#interpolation-slider")
      .prop("max", NUM_INTERP_FRAMES - 1)
      .val(0);

    if (interpolationVideo) {
      interpolationVideo.pause();
      interpolationVideo.src = INTERP_VIDEO;
      interpolationVideo.load();
    }

    // update the *target* envmap and its label, keep source static
    $("#target-envmap").attr("src", $(this).attr("src"));
    $("#target-envmap-label").text($(this).next("p").text());
  });

  setupViewportVideoPlayback();

  // ─── Bulma-Slider attach (for any .slider) ───
  if (window.bulmaSlider) bulmaSlider.attach();
});
