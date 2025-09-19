 /* =========================
   Carrusel múltiple (fotos)
   ========================= */
(function () {
  const carousels = document.querySelectorAll(".carousel");
  carousels.forEach(initCarousel);

  function initCarousel(root) {
    const track = root.querySelector(".track");
    const slides = Array.from(root.querySelectorAll(".slide"));
    const prev = root.querySelector(".cnav.prev, .prev");
    const next = root.querySelector(".cnav.next, .next");
    const dotsC = root.querySelector(".dots");
    const viewport = root.querySelector(".viewport");

    function getPerView() {
      const cs = getComputedStyle(root);
      const val = parseFloat(cs.getPropertyValue("--per-view")) || 1;
      return Math.max(1, Math.min(slides.length, val));
    }

    // === helpers para medir en px considerando el gap del grid ===
    function getGapPx() {
      const cs = getComputedStyle(track);
      // gap puede venir como "12px" o "12px 12px"; tomamos el primero
      const raw = cs.gap.split(" ")[0];
      return parseFloat(raw) || 0;
    }

    function getStepPx() {
      const perView = getPerView();
      const gap = getGapPx();
      const vw = viewport.clientWidth; // ancho visible del carrusel
      const slideWidth = (vw - (perView - 1) * gap) / perView;
      // cada “paso” = ancho de una columna + un gap
      return slideWidth + gap;
    }

    let perView = getPerView();
    let index = 0;
    let maxIndex = Math.max(0, slides.length - perView);
    let pages = maxIndex + 1;

    function buildDots() {
      if (!dotsC) return;
      dotsC.innerHTML = "";
      for (let i = 0; i < pages; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Ir a set ${i + 1}`);
        b.addEventListener("click", () => goTo(i));
        dotsC.appendChild(b);
      }
    }

    function update() {
      perView = getPerView();
      maxIndex = Math.max(0, slides.length - perView);
      pages = maxIndex + 1;

      if (index > maxIndex) index = maxIndex;
      if (dotsC && dotsC.children.length !== pages) buildDots();

      // ✅ desplazamiento en PX, contemplando el gap para que calce perfecto
      const stepPx = getStepPx();
      const offsetPx = -index * stepPx;
      track.style.transform = `translateX(${offsetPx}px)`;

      if (dotsC) {
        Array.from(dotsC.children).forEach((d, i) => {
          d.setAttribute("aria-current", i === index ? "true" : "false");
        });
      }
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === maxIndex;

      root.classList.toggle("at-start", index === 0);
      root.classList.toggle("at-end", index === maxIndex);
    }

    function goTo(i) {
      index = Math.max(0, Math.min(maxIndex, i));
      update();
    }

    if (prev) prev.addEventListener("click", () => goTo(index - 1));
    if (next) next.addEventListener("click", () => goTo(index + 1));

    // Teclado (cuando el carrusel tiene foco)
    root.setAttribute("tabindex", "0");
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });

    // Swipe / drag
    let startX = 0, currentX = 0, dragging = false;

    function getX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onStart(e) {
      dragging = true;
      startX = getX(e);
      currentX = startX;
      track.style.transition = "none";
    }

    function onMove(e) {
      if (!dragging) return;
      currentX = getX(e);
      const dx = currentX - startX;

      // ✅ base + desplazamiento en PX (consistente con update())
      const stepPx = getStepPx();
      const basePx = -(index * stepPx);
      track.style.transform = `translateX(${basePx + dx}px)`;
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";

      const dx = currentX - startX;
      const threshold = viewport.clientWidth * 0.12;

      if (Math.abs(dx) > threshold) {
        if (dx < 0) goTo(index + 1);
        else goTo(index - 1);
      } else {
        update();
      }
    }

    viewport.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    viewport.addEventListener("touchstart", onStart, { passive: true });
    viewport.addEventListener("touchmove", onMove, { passive: true });
    viewport.addEventListener("touchend", onEnd);

    window.addEventListener("resize", update);

    buildDots();
    update();
  }
})();
