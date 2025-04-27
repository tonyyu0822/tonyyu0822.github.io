// ─── INTERPOLATION SLIDER SCRIPT ───
window.HELP_IMPROVE_VIDEOJS = false;

// default folder & frame count (will be overridden on click)
var INTERP_BASE       = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 197;

var interp_images = [];

function preloadInterpolationImages() {
  interp_images = [];
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var img = new Image();
    img.src = INTERP_BASE + "/" + String(i).padStart(5, "0") + ".png";
    interp_images.push(img);
  }
}

function setInterpolationImage(idx) {
  var img = interp_images[idx];
  img.ondragstart   = () => false;
  img.oncontextmenu = () => false;
  $("#interpolation-image-wrapper")
    .empty()
    .append(img);
}

$(document).ready(function() {
  // 1) initial load
  preloadInterpolationImages();
  setInterpolationImage(0);
  $("#interpolation-slider")
    .prop("max", NUM_INTERP_FRAMES - 1);

  // 2) slider moves
  $("#interpolation-slider").on("input", function() {
    setInterpolationImage(this.value);
  });

  // 3) env-map button clicks
  $(".env-button").on("click", function() {
    // grab new folder & frame count
    INTERP_BASE       = $(this).data("base");
    NUM_INTERP_FRAMES = parseInt($(this).data("frames"), 10);

    // reload frames
    preloadInterpolationImages();

    // reset slider range & thumb
    $("#interpolation-slider")
      .prop("max", NUM_INTERP_FRAMES - 1)
      .val(0);

    // draw first frame
    setInterpolationImage(0);

    // optional: swap the source-envmap thumbnail to match
    $("#source-envmap")
      .attr("src", $(this).attr("src").replace("_thumb", ""));
  });

  // reattach bulmaSlider if you need it elsewhere
  if (window.bulmaSlider) bulmaSlider.attach();
});
