// ─── index.js ───

// prevent VideoJS nag
window.HELP_IMPROVE_VIDEOJS = false;

// ─── Interpolation Globals ───
var INTERP_BASE       = "./static/interpolation/fireplace";
var NUM_INTERP_FRAMES = 197;
var interp_images     = [];

/** Preload the current INTERP_BASE sequence into memory */
function preloadInterpolationImages() {
  interp_images = [];
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var img = new Image();
    img.src = INTERP_BASE + "/" + String(i).padStart(5, "0") + ".png";
    interp_images.push(img);
  }
}

/** Display frame idx from interp_images[] */
function setInterpolationImage(idx) {
  var img = interp_images[idx];
  img.ondragstart   = () => false;
  img.oncontextmenu = () => false;
  $("#interpolation-image-wrapper")
    .empty()
    .append(img);
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

  // ─── Interpolation Slider Init ───
  preloadInterpolationImages();
  setInterpolationImage(0);
  $("#interpolation-slider").prop("max", NUM_INTERP_FRAMES - 1);

  // slider → frame
  $("#interpolation-slider").on("input", function() {
    setInterpolationImage(this.value);
  });

  // env-map button clicks → swap sequence & update target envmap
  $(".env-button").on("click", function() {
    INTERP_BASE       = $(this).data("base");
    NUM_INTERP_FRAMES = parseInt($(this).data("frames"), 10);

    preloadInterpolationImages();
    $("#interpolation-slider")
      .prop("max", NUM_INTERP_FRAMES - 1)
      .val(0);
    setInterpolationImage(0);

    // update the *target* envmap and its label, keep source static
    $("#target-envmap").attr("src", $(this).attr("src"));
    $("#target-envmap-label").text($(this).next("p").text());
  });

  // ─── Bulma-Slider attach (for any .slider) ───
  if (window.bulmaSlider) bulmaSlider.attach();
});
