// Developers docs: language tabs that follow each other across the page, and copy buttons.
(() => {
  const KEY = "courier-docs-lang";
  const pick = (lang) => {
    for (const box of document.querySelectorAll(".dx-code[data-tabs]")) {
      if (!box.querySelector(`pre[data-lang="${lang}"]`)) continue;
      for (const b of box.querySelectorAll("[data-lang]"))
        if (b.tagName === "BUTTON") b.setAttribute("aria-selected", String(b.dataset.lang === lang));
        else b.hidden = b.dataset.lang !== lang;
    }
    try {
      localStorage.setItem(KEY, lang);
    } catch {}
  };
  for (const b of document.querySelectorAll(".dx-code button[data-lang]"))
    b.addEventListener("click", () => pick(b.dataset.lang));
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) pick(saved);
  } catch {}
  for (const b of document.querySelectorAll(".dx-copy"))
    b.addEventListener("click", async () => {
      const pre = [...b.closest(".dx-code").querySelectorAll("pre")].find((p) => !p.hidden);
      try {
        await navigator.clipboard.writeText(pre.textContent);
        b.textContent = "Copied";
      } catch {
        b.textContent = "Select and copy";
      }
      setTimeout(() => (b.textContent = "Copy"), 1600);
    });
  // The section you're reading, marked in "On this page".
  const links = [...document.querySelectorAll(".dx-toc a")];
  const heads = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if ("IntersectionObserver" in window && heads.length) {
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id);
        const first = heads.find((h) => seen.has(h.id));
        if (first) for (const a of links) a.toggleAttribute("aria-current", a.hash === `#${first.id}`);
      },
      { rootMargin: "0px 0px -60% 0px" },
    );
    for (const h of heads) io.observe(h);
  }
})();
