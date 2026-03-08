// Home Banner

(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const banner = document.querySelector(".home-banner");
  const bg = document.querySelector(".home-banner-bg");
  const animEls = document.querySelectorAll(".home-banner .banner-anim");

  if (!banner) return;

  // Entrance animation (on load)
  const enter = () => {
    if (bg && !prefersReduced) bg.classList.add("bg-in");
    animEls.forEach((el) => el.classList.add("is-in"));
  };

  // Run after paint for smoother transitions
  window.addEventListener("load", () => {
    requestAnimationFrame(() => requestAnimationFrame(enter));
  });

  // Subtle parallax on scroll (pure JS)
  if (!prefersReduced && bg) {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = banner.getBoundingClientRect();
        const viewH =
          window.innerHeight || document.documentElement.clientHeight;

        // progress: 0 when banner top hits top, to 1 when banner bottom leaves view
        const start = viewH;
        const end = -rect.height;
        const progress = (start - rect.top) / (start - end);
        const clamped = Math.min(1, Math.max(0, progress));

        // translate background a little (very subtle)
        const y = (clamped - 0.5) * 18; // px
        bg.style.transform = `translateY(${y.toFixed(2)}px) scale(1.08)`;

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Optional: animate in when banner comes into view (if page loads mid-scroll)
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) enter();
        });
      },
      { threshold: 0.35 },
    );
    io.observe(banner);
  }
})();

// Fact Checker

(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const section = document.querySelector(".facts");
  const bg = document.querySelector(".facts-bg");
  const counters = Array.from(document.querySelectorAll(".countup"));

  if (!section) return;

  /* -------------------------
     PARALLAX BACKGROUND
     ------------------------- */
  if (!prefersReduced && bg) {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewH =
          window.innerHeight || document.documentElement.clientHeight;

        // progress: 0 (section enters) -> 1 (section leaves)
        const start = viewH;
        const end = -rect.height;
        const progress = (start - rect.top) / (start - end);
        const p = Math.min(1, Math.max(0, progress));

        // subtle movement only
        const y = (p - 0.5) * 28; // px
        bg.style.transform = `translateY(${y.toFixed(2)}px) scale(1.10)`;

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------
     COUNT UP ANIMATION
     ------------------------- */
  const parseTarget = (el) => {
    const raw = el.getAttribute("data-target") || "0";
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const formatNumber = (n) => {
    // keep it clean: 1,234 formatting for big numbers
    return n.toLocaleString();
  };

  const animateCount = (el) => {
    const target = parseTarget(el);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1100; // ms
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);

      el.textContent = `${formatNumber(value)}${suffix}`;

      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  let hasRun = false;

  const runCounters = () => {
    if (hasRun) return;
    hasRun = true;
    counters.forEach(animateCount);
  };

  if (prefersReduced) {
    // render final values
    counters.forEach((el) => {
      const target = parseTarget(el);
      const suffix = el.getAttribute("data-suffix") || "";
      el.textContent = `${formatNumber(target)}${suffix}`;
    });
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) runCounters();
        });
      },
      { threshold: 0.35 },
    );
    io.observe(section);
  } else {
    // fallback
    window.addEventListener("load", runCounters);
  }
})();

// Testimonies
(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const section = document.querySelector(".testimonials");
  const bg = document.querySelector(".testimonials-bg");
  const slider = document.querySelector("[data-slider]");
  if (!section || !slider) return;

  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const prevBtn = slider.querySelector("[data-prev]");
  const nextBtn = slider.querySelector("[data-next]");
  const dotsWrap = slider.querySelector("[data-dots]");

  let index = slides.findIndex((s) => s.classList.contains("is-active"));
  if (index < 0) index = 0;

  // Build dots
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "t-dot";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Go to testimony ${i + 1}`);
    b.setAttribute("aria-selected", i === index ? "true" : "false");
    b.addEventListener("click", () => goTo(i, true));
    dotsWrap?.appendChild(b);
    return b;
  });

  const setActive = (i) => {
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
    dots.forEach((d, idx) =>
      d.setAttribute("aria-selected", idx === i ? "true" : "false"),
    );
  };

  const goTo = (i, user = false) => {
    index = (i + slides.length) % slides.length;
    setActive(index);
    if (user) restartAutoplay();
  };

  const next = (user = false) => goTo(index + 1, user);
  const prev = (user = false) => goTo(index - 1, user);

  prevBtn?.addEventListener("click", () => prev(true));
  nextBtn?.addEventListener("click", () => next(true));

  // Keyboard support
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev(true);
    if (e.key === "ArrowRight") next(true);
  });

  // Autoplay
  let timer = null;
  const startAutoplay = () => {
    if (prefersReduced) return;
    timer = window.setInterval(() => next(false), 5000);
  };
  const stopAutoplay = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };
  const restartAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  // Swipe (mobile)
  let startX = 0;
  let startY = 0;
  slider.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    },
    { passive: true },
  );

  slider.addEventListener(
    "touchend",
    (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (Math.abs(dx) > 40 && Math.abs(dy) < 40) {
        dx < 0 ? next(true) : prev(true);
      }
    },
    { passive: true },
  );

  // Background parallax (subtle)
  if (!prefersReduced && bg) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewH =
          window.innerHeight || document.documentElement.clientHeight;

        const start = viewH;
        const end = -rect.height;
        const progress = (start - rect.top) / (start - end);
        const p = Math.min(1, Math.max(0, progress));

        const y = (p - 0.5) * 26; // px
        bg.style.transform = `translateY(${y.toFixed(2)}px) scale(1.10)`;

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Init
  setActive(index);
  startAutoplay();
})();
