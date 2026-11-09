// For shops: the landing page's sticky screens, without its globe or passes. Each [data-track] screen moves through
// its steps as you scroll, and goes back on the way up. landing.css draws the screens; shops.css draws this page's parts.
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("nav");
  const screens = $$("main > section");
  const tracks = $$("[data-track]").map((el) => ({
    el,
    ats: $$("[data-at]", el).map((n) => [n, +n.dataset.at]),
    untils: $$("[data-until]", el).map((n) => [n, +n.dataset.until]),
    types: $$("[data-type]", el),
    meters: $$("[data-meter]", el).map((n) => [n, n.dataset.meter.split(",").map((s) => s.split(":").map(Number))]),
  }));
  /* On the home page, back to the top in one go. Anywhere else the logo leads home, like any site's. */
  nav?.querySelector(".logo")?.addEventListener("click", (e) => {
    if (location.pathname !== "/") return;
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
  let lastY = scrollY;

  function frame() {
    /* Screens hand over to each other: the next one rises into place as it arrives, the last one fades as it goes. */
    for (const el of screens) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--e", (reduce ? 1 : Math.max(0, Math.min(1, 1 - r.top / innerHeight))).toFixed(3));
      el.style.setProperty("--x", (reduce ? 0 : Math.max(0, Math.min(1, 1 - r.bottom / innerHeight))).toFixed(3));
    }
    for (const t of tracks) {
      const r = t.el.getBoundingClientRect();
      const p = reduce ? 1 : Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
      t.el.style.setProperty("--p", p.toFixed(3));
      for (const [n, at] of t.ats) n.classList.toggle("is", p >= at);
      for (const [n, u] of t.untils) n.classList.toggle("gone", p >= u);
      for (const n of t.types) {
        const text = n.dataset.type;
        const k = Math.max(0, Math.min(1, (p - +n.dataset.from) / (+n.dataset.to - +n.dataset.from)));
        const show = text.slice(0, Math.round(k * text.length));
        if (n.textContent !== show) n.textContent = show;
      }
      for (const [n, stops] of t.meters) n.style.setProperty("--w", `${stops.find(([at]) => p >= at)[1]}%`);
    }
    if (nav) {
      const moved = scrollY - lastY;
      nav.classList.toggle("solid", scrollY > 24);
      if (moved > 4 && scrollY > innerHeight * 0.6) nav.classList.add("away");
      else if (moved < -4 || scrollY < innerHeight * 0.6) nav.classList.remove("away");
    }
    lastY = scrollY;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
