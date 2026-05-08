document.querySelectorAll(".image-comparison").forEach((comparison) => {
  const container = comparison.querySelector(".images-container");
  const beforeImage = comparison.querySelector(".before-image");
  const afterImage = comparison.querySelector(".after-image");
  const noLabel = comparison.querySelector(".no-label");
  const beforeLabel = comparison.querySelector(".before-label");
  const afterLabel = comparison.querySelector(".after-label");
  const leftSlider = comparison.querySelector(".slider-left");
  const rightSlider = comparison.querySelector(".slider-right");
  const leftLine = comparison.querySelector(".slider-line-left");
  const rightLine = comparison.querySelector(".slider-line-right");
  const leftIcon = comparison.querySelector(".slider-icon-left");
  const rightIcon = comparison.querySelector(".slider-icon-right");
  const videos = comparison.querySelectorAll("video");

  videos.forEach((video) => {
    video.addEventListener("play", () => {
      videos.forEach((other) => {
        if (other !== video && other.paused) other.play();
      });
    });

    video.addEventListener("timeupdate", () => {
      videos.forEach((other) => {
        if (other !== video && Math.abs(other.currentTime - video.currentTime) > 0.1) {
          other.currentTime = video.currentTime;
        }
      });
    });
  });

  const updateSliders = () => {
    let left = Number(leftSlider.value);
    let right = Number(rightSlider.value);

    if (left > right) {
      if (document.activeElement === leftSlider) rightSlider.value = left;
      else leftSlider.value = right;
      left = Number(leftSlider.value);
      right = Number(rightSlider.value);
    }

    beforeImage.style.clipPath = `inset(0 ${100 - right}% 0 ${left}%)`;
    afterImage.style.clipPath = `inset(0 0 0 ${right}%)`;
    noLabel.style.clipPath = `inset(0 ${100 - left}% 0 0)`;
    beforeLabel.style.clipPath = `inset(0 ${100 - right}% 0 ${left}%)`;
    afterLabel.style.clipPath = `inset(0 0 0 ${right}%)`;
    leftLine.style.left = left + "%";
    rightLine.style.left = right + "%";
    leftIcon.style.left = left + "%";
    rightIcon.style.left = right + "%";
  };

  leftSlider.addEventListener("input", updateSliders);
  rightSlider.addEventListener("input", updateSliders);
  container.addEventListener("pointerdown", (event) => {
    const rect = container.getBoundingClientRect();
    const startValue = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    let activeSlider = Math.abs(startValue - Number(leftSlider.value)) <= Math.abs(startValue - Number(rightSlider.value)) ? leftSlider : rightSlider;
    const moveHandle = (pointerEvent) => {
      const value = Math.max(0, Math.min(100, ((pointerEvent.clientX - rect.left) / rect.width) * 100));
      const left = Number(leftSlider.value);
      const right = Number(rightSlider.value);

      activeSlider.value = activeSlider === leftSlider ? Math.min(value, right) : Math.max(value, left);
      updateSliders();
    };
    const stopDrag = () => {
      window.removeEventListener("pointermove", moveHandle);
      window.removeEventListener("pointerup", stopDrag);
    };

    moveHandle(event);
    window.addEventListener("pointermove", moveHandle);
    window.addEventListener("pointerup", stopDrag);
  });

  updateSliders();
});
