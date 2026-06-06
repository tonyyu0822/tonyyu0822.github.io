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
  const videos = Array.from(comparison.querySelectorAll("video"));
  const masterVideo = videos[0];
  let sliderUpdateScheduled = false;
  let buffering = false;
  const loadedVideos = new Set();

  const syncVideoGroup = (threshold = 0.3) => {
    if (!masterVideo || masterVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    const masterTime = masterVideo.currentTime;

    videos.forEach((video) => {
      if (video === masterVideo || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      if (Math.abs(video.currentTime - masterTime) > threshold) {
        video.currentTime = masterTime;
      }
    });
  };

  const markVideoLoaded = (video) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      loadedVideos.add(video);
    }
  };
  const hasGroupLoaded = () => videos.length > 0 && loadedVideos.size === videos.length;
  const canGroupResume = () => videos.every((video) => video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);

  const pauseVideoGroup = () => {
    videos.forEach((video) => video.pause());
  };

  const playVideoGroup = () => {
    if (!hasGroupLoaded() || !canGroupResume()) return;

    buffering = false;
    syncVideoGroup(0.05);
    videos.forEach((video) => {
      if (video.paused) video.play().catch(() => {});
    });
  };

  const recoverVideoGroup = () => {
    videos.forEach(markVideoLoaded);
    if (!hasGroupLoaded() || !canGroupResume()) return;
    window.setTimeout(playVideoGroup, 120);
  };

  videos.forEach((video) => {
    video.autoplay = true;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    markVideoLoaded(video);
    video.pause();

    video.addEventListener("play", (event) => {
      if (!hasGroupLoaded() || !canGroupResume()) {
        event.target.pause();
        return;
      }
      syncVideoGroup(0.1);
    });
    video.addEventListener("canplay", recoverVideoGroup);
    video.addEventListener("canplaythrough", playVideoGroup);
    video.addEventListener("loadeddata", recoverVideoGroup);
    video.addEventListener("waiting", () => {
      buffering = true;
      pauseVideoGroup();
      recoverVideoGroup();
    });
    video.addEventListener("stalled", () => {
      buffering = true;
      pauseVideoGroup();
      recoverVideoGroup();
    });
  });

  recoverVideoGroup();
  window.setInterval(() => {
    if (!hasGroupLoaded() || buffering) {
      recoverVideoGroup();
      return;
    }

    playVideoGroup();
    syncVideoGroup(0.25);
  }, 1000);

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

  const scheduleSliderUpdate = () => {
    if (sliderUpdateScheduled) return;
    sliderUpdateScheduled = true;
    requestAnimationFrame(() => {
      sliderUpdateScheduled = false;
      updateSliders();
    });
  };

  leftSlider.addEventListener("input", scheduleSliderUpdate);
  rightSlider.addEventListener("input", scheduleSliderUpdate);
  container.addEventListener("pointerdown", (event) => {
    const rect = container.getBoundingClientRect();
    const startValue = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    let activeSlider = Math.abs(startValue - Number(leftSlider.value)) <= Math.abs(startValue - Number(rightSlider.value)) ? leftSlider : rightSlider;
    const moveHandle = (pointerEvent) => {
      const value = Math.max(0, Math.min(100, ((pointerEvent.clientX - rect.left) / rect.width) * 100));
      const left = Number(leftSlider.value);
      const right = Number(rightSlider.value);

      activeSlider.value = activeSlider === leftSlider ? Math.min(value, right) : Math.max(value, left);
      scheduleSliderUpdate();
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
