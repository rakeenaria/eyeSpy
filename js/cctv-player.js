(function () {
  const video = document.getElementById("cctvVideo");
  const status = document.getElementById("cctvPlayerStatus");
  const reloadButton = document.getElementById("reloadCctvStream");

  if (!video || !status || !reloadButton) {
    return;
  }

  const liveUrl = video.dataset.liveUrl || "";
  const fallbackUrl = video.dataset.fallbackUrl || "";
  let hls = null;
  let mode = "idle";

  function setStatus(kind, message) {
    status.textContent = message;
    status.dataset.state = kind;
  }

  function disposePlayer() {
    if (hls) {
      hls.destroy();
      hls = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();
  }

  function playWhenAllowed() {
    const playback = video.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {
        if (mode === "live") {
          setStatus("ready", "Stream siap. Tekan tombol putar untuk memulai video.");
        }
      });
    }
  }

  function useFallback(message) {
    mode = "transition";
    disposePlayer();
    mode = "fallback";
    setStatus("error", message + " Video cadangan sedang ditampilkan.");

    if (fallbackUrl) {
      video.src = fallbackUrl;
      video.load();
      playWhenAllowed();
    }
  }

  function loadLiveStream() {
    if (!liveUrl) {
      useFallback("Kamera saat ini ditandai tidak terhubung oleh sumber resmi.");
      return;
    }

    mode = "transition";
    disposePlayer();
    mode = "live";
    setStatus("loading", "Memuat stream dari portal CCTV Jogja Istimewa…");

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 20
      });

      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(liveUrl);
      });

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus("ready", "Stream diterima. Menyiapkan pemutaran…");
        playWhenAllowed();
      });

      hls.on(window.Hls.Events.ERROR, function (_event, data) {
        if (mode === "live" && data.fatal) {
          useFallback("Stream live tidak dapat diputar saat ini.");
        }
      });

      hls.attachMedia(video);
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = liveUrl;
      video.load();
      playWhenAllowed();
      return;
    }

    useFallback("Browser ini belum mendukung pemutaran HLS.");
  }

  video.addEventListener("playing", function () {
    if (mode === "live") {
      setStatus("live", "Siaran live sedang diputar.");
    }
  });

  video.addEventListener("error", function () {
    if (mode === "live") {
      useFallback("Terjadi kesalahan saat memuat stream live.");
    }
  });

  reloadButton.addEventListener("click", loadLiveStream);
  window.addEventListener("pagehide", disposePlayer);

  loadLiveStream();
})();
