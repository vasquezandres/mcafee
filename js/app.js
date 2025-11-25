
(function () {
  const BUST = `v=${Date.now()}`;

  async function injectInclude(el) {
    const file = el.getAttribute("data-include");
    const url = file.startsWith("/") ? `${file}?${BUST}` : `/${file}?${BUST}`;
    try {
      const res = await fetch(url, { cache: "no-store", headers: { "Accept": "text/html" } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const html = await res.text();
      const wrap = document.createElement("div");
      wrap.innerHTML = html.trim();
      const node = wrap.firstElementChild || document.createTextNode("");
      el.replaceWith(node);
      if (file.includes("header.html")) initMenu();
    } catch (err) {
      console.error("Include falló:", file, err);
    }
  }

  function initMenu() {
    const btn = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!btn || !nav) return;
    const toggle = () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
      document.body.classList.toggle("nav-open", !open);
    };
    btn.addEventListener("click", toggle);
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  function initReviewsCarousel() {
    const scroller = document.querySelector(".reviews-scroller");
    if (!scroller) return;

    const track = scroller.querySelector(".reviews-track");
    const cards = Array.from(track.children);

    if (cards.length <= 1) return;

    let index = 0;

    function calculateWidth() {
      const first = cards[0];
      return first.getBoundingClientRect().width + 16; // gap incluido
    }

    function update() {
      const width = calculateWidth();
      track.style.transform = `translateX(${-index * width}px)`;
    }

    // Movimiento automático
    let interval = setInterval(() => {
      index = (index + 1) % cards.length;
      update();
    }, 6000);

    // Botón siguiente
    document.getElementById("reviews-next")?.addEventListener("click", () => {
      clearInterval(interval);
      index = (index + 1) % cards.length;
      update();
    });

    // Botón anterior
    document.getElementById("reviews-prev")?.addEventListener("click", () => {
      clearInterval(interval);
      index = (index - 1 + cards.length) % cards.length;
      update();
    });

    // Recalcular en resize
    window.addEventListener("resize", () => requestAnimationFrame(update));
  }


  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-include]").forEach(injectInclude);
    initReviewsCarousel();
  });
})();

