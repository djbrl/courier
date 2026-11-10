// The landing page's header on a plain page: it turns solid once the page moves, and steps aside while you read down.
(() => {
  const nav = document.getElementById("nav");
  if (!nav) return;
  let lastY = scrollY;
  addEventListener(
    "scroll",
    () => {
      const moved = scrollY - lastY;
      nav.classList.toggle("solid", scrollY > 24);
      if (moved > 4 && scrollY > innerHeight * 0.6) nav.classList.add("away");
      else if (moved < -4 || scrollY < innerHeight * 0.6) nav.classList.remove("away");
      lastY = scrollY;
    },
    { passive: true },
  );
})();
