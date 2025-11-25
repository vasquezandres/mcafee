
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

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-include]").forEach(injectInclude);
  });
})();
