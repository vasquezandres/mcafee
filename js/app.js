
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



// === Licencias dropdown: hover en desktop + click en móvil + cierre con delay 200ms ===
(() => {
  const isDesktopHover = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let closeTimer = null;

  const openWrap = (wrap) => {
    if (!wrap) return;
    if (closeTimer) clearTimeout(closeTimer);
    wrap.classList.add("is-open");
    const a = wrap.querySelector(".nav-licencias-link");
    if (a) a.setAttribute("aria-expanded", "true");
  };

  const closeWrap = (wrap, delay = 200) => {
    if (!wrap) return;
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      wrap.classList.remove("is-open");
      const a = wrap.querySelector(".nav-licencias-link");
      if (a) a.setAttribute("aria-expanded", "false");
    }, delay);
  };

  // Hover (solo desktop)
  document.addEventListener("mouseenter", (e) => {
    if (!isDesktopHover()) return;
    const wrap = e.target.closest?.(".nav-licencias");
    if (wrap) openWrap(wrap);
  }, true);

  document.addEventListener("mouseleave", (e) => {
    if (!isDesktopHover()) return;
    const wrap = e.target.closest?.(".nav-licencias");
    if (wrap) closeWrap(wrap, 200);
  }, true);

  // Click toggle (principalmente móvil)
  document.addEventListener("click", (e) => {
    const link = e.target.closest?.(".nav-licencias-link");

    // Click en Licencias
    if (link) {
      // IMPORTANTÍSIMO: en móvil evita que el click cierre el menú hamburguesa
      if (!isDesktopHover()) e.stopPropagation();

      e.preventDefault();
      const wrap = link.closest(".nav-licencias");
      if (!wrap) return;

      if (!isDesktopHover()) {
        const willOpen = !wrap.classList.contains("is-open");

        // Cierra otros dropdowns abiertos
        document.querySelectorAll(".nav-licencias.is-open").forEach((w) => {
          if (w !== wrap) closeWrap(w, 0);
        });

        if (willOpen) openWrap(wrap);
        else closeWrap(wrap, 0);
      }
      return;
    }

    // Click fuera: cerrar inmediato
    document.querySelectorAll(".nav-licencias.is-open").forEach((wrap) => {
      if (!wrap.contains(e.target)) closeWrap(wrap, 0);
    });
  }, true);

  // Escape cierra
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".nav-licencias.is-open").forEach((wrap) => closeWrap(wrap, 0));
  });
})();

