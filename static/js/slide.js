document.querySelectorAll(".image-comparison").forEach((comparison) => {
  const slider = comparison.querySelector(".slider");
  const beforeImage = comparison.querySelector(".before-image");
  const sliderLine = comparison.querySelector(".slider-line");
  const sliderIcon = comparison.querySelector(".slider-icon");

  slider.addEventListener("input", (e) => {
    let sliderValue = e.target.value + "%";

    beforeImage.style.width = sliderValue;
    sliderLine.style.left = sliderValue;
    sliderIcon.style.left = sliderValue;
  });
});
