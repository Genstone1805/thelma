(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    revealItems.forEach((item) => io.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const counters = Array.from(document.querySelectorAll("[data-count]"));
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    const duration = 1000;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${value}+`;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (prefersReduced) {
    counters.forEach((el) => {
      const target = Number(el.getAttribute("data-count")) || 0;
      el.textContent = `${target}+`;
    });
    return;
  }

  if ("IntersectionObserver" in window) {
    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 },
    );

    counters.forEach((counter) => io.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
})();
