// assets/js/bg.js
(function () {
  const data = window.VALENTINE_DATA;
  if (!data || !Array.isArray(data.gallery)) return;

  // HTML paths from data.js look like: "assets/img/photo1.jpg"
  const photos = data.gallery.map((g) => g?.src).filter(Boolean);
  if (!photos.length) return;

  // IMPORTANT:
  // The CSS background lives in assets/css/styles.css, so url(...) must be relative to that file.
  // "../img/photo1.jpg" is correct from assets/css/ -> assets/img/  [web:144]
  function toCssRelative(src) {
    return src.replace(/^assets\/img\//, "../img/");
  }

  // Preload (so we only fade when the next image is actually available)
  function preload(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error("Failed to load " + src));
      img.src = src;
    });
  }

  async function setBg(htmlSrc) {
    try {
      await preload(htmlSrc);

      document.body.classList.add("bg-fade");
      setTimeout(() => {
        document.documentElement.style.setProperty(
          "--bg-photo",
          `url("${toCssRelative(htmlSrc)}")`
        );
        document.body.classList.remove("bg-fade");
      }, 350);
    } catch (e) {
      document.body.classList.remove("bg-fade");
    }
  }

  // Start
  let i = 0;
  setBg(photos[i]);

  // Change every 30s (for testing, temporarily set 3000)
  setInterval(() => {
    i = (i + 1) % photos.length;
    setBg(photos[i]);
  }, 30000);
})();
