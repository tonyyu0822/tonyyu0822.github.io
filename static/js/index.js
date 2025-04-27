window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE       = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 197;
var interp_images     = [];

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
  // initial load
  preloadInterpolationImages();
  setInterpolationImage(0);
  $("#interpolation-slider")
    .prop("max", NUM_INTERP_FRAMES - 1);

  // slider moves
  $("#interpolation-slider").on("input", function() {
    setInterpolationImage(this.value);
  });

  // env-map button clicks
  $(".env-button").on("click", function() {
    INTERP_BASE       = $(this).data("base");
    NUM_INTERP_FRAMES = parseInt($(this).data("frames"), 10);

    preloadInterpolationImages();
    $("#interpolation-slider")
      .prop("max", NUM_INTERP_FRAMES - 1)
      .val(0);
    setInterpolationImage(0);

    // swap the city thumb to match the clicked one (optional)
    $("#source-envmap")
      .attr("src", $(this).attr("src"));
  });

  if (window.bulmaSlider) bulmaSlider.attach();
});
