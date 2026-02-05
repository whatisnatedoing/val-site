
(function () {
  const data = window.VALENTINE_DATA;
  const $ = (sel) => document.querySelector(sel);

  $("#revealTo").textContent = data.toName;
  $("#revealFrom").textContent = data.fromName;
  $("#revealNote").textContent = data.reveal.note;

  const unlocked = localStorage.getItem(data.unlockKey) === "1";
  if (!unlocked) {
    // casual gating: bounce back to index and open modal
    window.location.href = "index.html?unlock=1";
    return;
  }

  $("#videoFrame").src = data.reveal.videoEmbedUrl;
})();
