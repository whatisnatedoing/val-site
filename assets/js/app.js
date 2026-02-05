
(function () {
  const data = window.VALENTINE_DATA;

  // Notyf (better notifications)
    const notyf = new Notyf({
    duration: 2600,
    ripple: true,
    position: { x: "right", y: "bottom" },
    dismissible: true,
    types: [
        { type: "love", background: "#EF6CA1" },   // Sweetheart Pink
        { type: "warn", background: "#EE8778" },   // Cupid's Blush
    ],
    });

    // helpers
    const toast = {
    ok: (msg) => notyf.success(msg),
    err: (msg) => notyf.error(msg),
    love: (msg) => notyf.open({ type: "love", message: msg }),
    warn: (msg) => notyf.open({ type: "warn", message: msg }),
    };


  // Helpers
  const $ = (sel) => document.querySelector(sel);

  // Fill top text
  $("#toName").textContent = data.toName;
  $("#fromName").textContent = data.fromName;
  $("#heroHeadline").textContent = data.hero.headline;
  $("#heroSubhead").textContent = data.hero.subhead;



  // Envelope
  $("#letterHeadline").textContent = data.letter.headline;
  $("#sealedLine").textContent = data.letter.sealedLine;

  const letterBody = $("#letterBody");
  letterBody.innerHTML = data.letter.body.map((p) => `<p class="mb-3">${p}</p>`).join("");
  $("#letterSig").textContent = data.letter.signature;

  $("#openLetterBtn").addEventListener("click", () => $("#envelope").classList.add("open"));
  $("#closeLetterBtn").addEventListener("click", () => $("#envelope").classList.remove("open"));

  // Timeline
  const timeline = $("#timeline");
  timeline.innerHTML = "";
  data.timeline.forEach((t) => {
    const card = document.createElement("div");
    card.className = "glass timelineCard";
    card.innerHTML = `
      <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <h3 class="mb-0 font-serif" style="font-size: 24px;">${t.title}</h3>
        <span class="pillDate">${t.date}</span>
      </div>
      <p class="mt-3 mb-0 muted" style="line-height: 1.7;">${t.note}</p>
    `;
    timeline.appendChild(card);
  });

  // Gallery (tap-to-reveal captions)
  const gallery = $("#galleryGrid");
  gallery.innerHTML = "";
  data.gallery.forEach((g, idx) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "galleryItem text-start";
    item.setAttribute("aria-label", `Open photo ${idx + 1}`);
    item.innerHTML = `
      <div class="imgWrap">
        <img src="${g.src}" alt="${g.alt}" loading="${idx < 2 ? "eager" : "lazy"}">
      </div>
      <div class="caption" data-reveal="${encodeURIComponent(g.reveal)}">
        <span class="hint">${g.caption}</span>
        <span class="revealText"></span>
      </div>
    `;
    item.addEventListener("click", () => {
      const cap = item.querySelector(".caption");
      cap.classList.toggle("revealed");
      cap.querySelector(".revealText").textContent = decodeURIComponent(cap.dataset.reveal);
    });
    gallery.appendChild(item);
  });

  // Coupons
  const couponWrap = $("#couponGrid");
  couponWrap.innerHTML = "";
  data.coupons.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "coupon";
    div.innerHTML = `
      <div class="d-flex align-items-start justify-content-between gap-3">
        <div>
          <div class="fw-semibold" style="font-size: 18px;">${c.title}</div>
          <small class="d-block mt-1">${c.finePrint}</small>
        </div>
        <span class="badgeX"><i class="bi bi-ticket-perforated"></i> #${String(i + 1).padStart(2, "0")}</span>
      </div>
      <button class="btnX btnX-soft redeemBtn" data-title="${encodeURIComponent(c.title)}">
        <i class="bi bi-check2-circle"></i> Redeem
      </button>
    `;
    div.querySelector(".redeemBtn").addEventListener("click", (e) => {
      const title = decodeURIComponent(e.currentTarget.dataset.title);
      const key = `lv_coupon_${data.slug}_${title}`;
      const already = localStorage.getItem(key) === "1";
      if (already) {
        toast.warn(`Already redeemed: ${title}`);
        return;
      }
      localStorage.setItem(key, "1");
      toast.love(`Redeemed: ${title}\n\nScreenshot this if you want 😉`);
      e.currentTarget.innerHTML = `<i class="bi bi-check2-circle"></i> Redeemed`;
      e.currentTarget.style.opacity = "0.75";
    });
    couponWrap.appendChild(div);
  });

  // Quiz
  const quizWrap = $("#quizWrap");
  quizWrap.innerHTML = "";
  data.quiz.questions.forEach((qq, idx) => {
    const block = document.createElement("div");
    block.className = "glass p-4";
    block.innerHTML = `
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div class="fw-semibold">Q${idx + 1}. ${qq.q}</div>
        <span class="badgeX"><i class="bi bi-stars"></i> Quick</span>
      </div>
      <div class="mt-3 d-grid gap-2">
        ${qq.options
          .map(
            (opt, j) => `
          <label class="glass p-3" style="cursor:pointer; border-radius: 18px;">
            <input class="form-check-input me-2" type="radio" name="q${idx}" value="${j}">
            <span>${opt}</span>
          </label>`
          )
          .join("")}
      </div>
    `;
    quizWrap.appendChild(block);
  });

  $("#quizBtn").addEventListener("click", () => {
    // super simple “result”: just ensure answered count then pick a fun result
    const total = data.quiz.questions.length;
    let answered = 0;
    for (let i = 0; i < total; i++) {
      const picked = document.querySelector(`input[name="q${i}"]:checked`);
      if (picked) answered++;
    }
    if (answered < total) {
      toast.warn("Answer all questions 😌");
      return;
    }
    const result = data.quiz.results[Math.floor(Math.random() * data.quiz.results.length)];
    $("#quizResultText").textContent = result;
    $("#quizResult").style.display = "block";
  });

  // Save this
  $("#playlistLink").href = data.saveThis.playlistUrl;
  $("#calendarLink").href = data.saveThis.calendarUrl;

  // Unlock (modal)
  const unlockModalEl = $("#unlockModal");
  const unlockModal = new bootstrap.Modal(unlockModalEl);

  function isUnlocked() {
    return localStorage.getItem(data.unlockKey) === "1";
  }

  function setUnlocked() {
    localStorage.setItem(data.unlockKey, "1");
  }

  // If link has ?unlock=1, open modal (no useSearchParams drama here)
  const url = new URL(window.location.href);
  if (url.searchParams.get("unlock") === "1") {
    setTimeout(() => unlockModal.show(), 250);
  }

  // Update “Reveal” button state
  function refreshRevealCTA() {
    const btn = $("#goRevealBtn");
    const hint = $("#revealHint");
    if (isUnlocked()) {
      btn.href = "reveal.html";
      btn.classList.remove("btnX-primary");
      btn.classList.add("btnX-soft");
      btn.innerHTML = `<i class="bi bi-play-circle"></i> Go to reveal`;
      hint.textContent = "Unlocked on this device. Tap to watch.";
    } else {
      btn.href = "#";
      btn.classList.add("btnX-primary");
      btn.classList.remove("btnX-soft");
      btn.innerHTML = `<i class="bi bi-lock"></i> Unlock reveal`;
      hint.textContent = "Locked by a passcode (casual privacy).";
    }
  }
  refreshRevealCTA();

  $("#goRevealBtn").addEventListener("click", (e) => {
    if (isUnlocked()) return; // allow navigation
    e.preventDefault();
    unlockModal.show();
  });

  // Passcode submit
  $("#unlockForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("#passcode").value.trim();
    const err = $("#unlockError");
    err.textContent = "";

    if (code !== data.passcode) {
      err.textContent = "Incorrect code. Try again.";
      return;
    }

    setUnlocked();
    unlockModal.hide();
    refreshRevealCTA();

    // nice little moment
    setTimeout(() => {
      window.location.href = "reveal.html";
    }, 250);
  });
})();



// Make ALL reveal buttons open the same unlock flow
["goRevealBtnTop", "goRevealBtn2"].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("goRevealBtn")?.click();
  });
});


