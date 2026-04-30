/* ==========================================================
   Solutech Panamá — app.js
   - Includes de header/footer (sin cache busting agresivo)
   - Menú móvil
   - Dropdown Licencias (hover desktop + click móvil)
   - Carrusel de reviews (si existe)
   ========================================================== */

(function () {
  // Versión fija para cache busting controlado.
  // Cámbiala manualmente cuando edites header/footer.
  const VERSION = "v=20260429";

  async function injectInclude(el) {
    const file = el.getAttribute("data-include");
    const url = (file.startsWith("/") ? file : "/" + file) + "?" + VERSION;
    try {
      const res = await fetch(url, { headers: { "Accept": "text/html" } });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const html = await res.text();
      const wrap = document.createElement("div");
      wrap.innerHTML = html.trim();

      // Insertamos TODOS los hijos (puede haber barra reseller + header)
      const frag = document.createDocumentFragment();
      Array.from(wrap.children).forEach((node) => frag.appendChild(node));
      el.replaceWith(frag);

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
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  function initReviewsCarousel() {
    const scroller = document.querySelector(".reviews-scroller");
    if (!scroller) return;

    const track = scroller.querySelector(".reviews-track");
    if (!track) return;
    const cards = Array.from(track.children);
    if (cards.length <= 1) return;

    let index = 0;

    function calculateWidth() {
      const first = cards[0];
      return first.getBoundingClientRect().width + 16;
    }
    function update() {
      const width = calculateWidth();
      track.style.transform = `translateX(${-index * width}px)`;
    }

    let interval = setInterval(() => {
      index = (index + 1) % cards.length;
      update();
    }, 6000);

    document.getElementById("reviews-next")?.addEventListener("click", () => {
      clearInterval(interval);
      index = (index + 1) % cards.length;
      update();
    });

    document.getElementById("reviews-prev")?.addEventListener("click", () => {
      clearInterval(interval);
      index = (index - 1 + cards.length) % cards.length;
      update();
    });

    window.addEventListener("resize", () => requestAnimationFrame(update));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-include]").forEach(injectInclude);
    initReviewsCarousel();
  });
})();


/* === Dropdown Licencias: hover desktop + click móvil === */
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

  document.addEventListener("click", (e) => {
    const link = e.target.closest?.(".nav-licencias-link");

    if (link) {
      if (!isDesktopHover()) e.stopPropagation();
      e.preventDefault();
      const wrap = link.closest(".nav-licencias");
      if (!wrap) return;

      if (!isDesktopHover()) {
        const willOpen = !wrap.classList.contains("is-open");
        document.querySelectorAll(".nav-licencias.is-open").forEach((w) => {
          if (w !== wrap) closeWrap(w, 0);
        });
        if (willOpen) openWrap(wrap);
        else closeWrap(wrap, 0);
      }
      return;
    }

    document.querySelectorAll(".nav-licencias.is-open").forEach((wrap) => {
      if (!wrap.contains(e.target)) closeWrap(wrap, 0);
    });
  }, true);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".nav-licencias.is-open").forEach((wrap) => closeWrap(wrap, 0));
  });
})();
