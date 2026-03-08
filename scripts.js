(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function splitTextForReveal(elements) {
    elements.forEach((element) => {
      if (element.dataset.textSplit === "true") return;
      if (element.children.length > 0) return;
      if (element.closest(".step-card")) return;

      const text = element.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;

      const words = text.split(" ");
      element.dataset.textSplit = "true";
      element.setAttribute("aria-label", text);
      element.classList.add("text-reveal");
      element.textContent = "";

      words.forEach((word, index) => {
        const wrap = document.createElement("span");
        wrap.className = "text-word-wrap";
        wrap.setAttribute("aria-hidden", "true");

        const inner = document.createElement("span");
        inner.className = "text-word";
        inner.style.setProperty("--word-index", index);
        inner.textContent = word;

        wrap.appendChild(inner);
        element.appendChild(wrap);

        if (index < words.length - 1) {
          element.appendChild(document.createTextNode(" "));
        }
      });
    });
  }

  function initScrollMotion(root = document) {
    const textTargets = Array.from(
      root.querySelectorAll(
        "body h1, body h2, body h3, body h4, body h5, body h6, body p, body li, body summary, body label, body a, body button, body strong, body .eyebrow, body .hero-kicker, body .section-kicker, body .summary-copy, body .contact-label"
      )
    );

    if (reducedMotion) return;

    splitTextForReveal(textTargets);
    const observedElements = Array.from(new Set(textTargets.filter((element) => element.dataset.textSplit === "true")));

    if (!("IntersectionObserver" in window)) {
      observedElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observedElements.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${(index % 8) * 35}ms`);
      observer.observe(element);
    });
  }

  function initFaqAccordions(root = document) {
    const items = Array.from(root.querySelectorAll(".faq-item"));

    items.forEach((item) => {
      const summary = item.querySelector("summary");
      const answer = item.querySelector(".faq-answer");

      if (!summary || !answer) return;

      let isAnimating = false;

      function syncState(open) {
        item.classList.toggle("is-open", open);
        summary.setAttribute("aria-expanded", open ? "true" : "false");
        answer.style.opacity = open ? "1" : "0";
        answer.style.height = open ? "auto" : "0px";
      }

      if (item.open) {
        syncState(true);
      } else {
        syncState(false);
      }

      summary.addEventListener("click", (event) => {
        event.preventDefault();
        if (isAnimating) return;

        const opening = !item.open;

        if (reducedMotion) {
          item.open = opening;
          syncState(opening);
          return;
        }

        isAnimating = true;

        if (opening) {
          item.open = true;
          item.classList.add("is-open");
          summary.setAttribute("aria-expanded", "true");
          answer.style.height = "0px";
          answer.style.opacity = "0";

          window.requestAnimationFrame(() => {
            answer.style.height = `${answer.scrollHeight}px`;
            answer.style.opacity = "1";
          });
        } else {
          answer.style.height = `${answer.scrollHeight}px`;
          item.classList.remove("is-open");
          summary.setAttribute("aria-expanded", "false");

          window.requestAnimationFrame(() => {
            answer.style.height = "0px";
            answer.style.opacity = "0";
          });
        }

        const handleTransitionEnd = (transitionEvent) => {
          if (transitionEvent.propertyName !== "height") return;

          answer.removeEventListener("transitionend", handleTransitionEnd);
          isAnimating = false;

          if (opening) {
            answer.style.height = "auto";
          } else {
            item.open = false;
          }
        };

        answer.addEventListener("transitionend", handleTransitionEnd);
      });
    });
  }

  initFaqAccordions();
  initScrollMotion();

  const heroSlider = document.querySelector("[data-hero-slider]");

  if (heroSlider) {
    const track = heroSlider.querySelector("[data-hero-track]");
    const slides = track ? Array.from(track.children) : [];
    const prevButton = heroSlider.querySelector("[data-hero-prev]");
    const nextButton = heroSlider.querySelector("[data-hero-next]");

    if (track && slides.length > 1 && prevButton && nextButton) {
      const firstClone = slides[0].cloneNode(true);
      const lastClone = slides[slides.length - 1].cloneNode(true);
      firstClone.setAttribute("data-clone", "true");
      lastClone.setAttribute("data-clone", "true");
      track.appendChild(firstClone);
      track.insertBefore(lastClone, track.firstChild);

      const trackSlides = Array.from(track.children);
      let currentIndex = 1;
      let autoplayId = 0;

      function moveTo(index, animate = true) {
        currentIndex = index;
        const slideWidth = heroSlider.getBoundingClientRect().width;
        track.style.transitionDuration = animate && !reducedMotion ? "700ms" : "0ms";
        track.style.transform = `translate3d(-${currentIndex * slideWidth}px, 0, 0)`;
      }

      function stopAutoplay() {
        if (!autoplayId) return;
        window.clearInterval(autoplayId);
        autoplayId = 0;
      }

      function startAutoplay() {
        if (reducedMotion || autoplayId) return;
        autoplayId = window.setInterval(() => moveTo(currentIndex + 1), 3000);
      }

      prevButton.addEventListener("click", () => {
        stopAutoplay();
        moveTo(currentIndex - 1);
        startAutoplay();
      });

      nextButton.addEventListener("click", () => {
        stopAutoplay();
        moveTo(currentIndex + 1);
        startAutoplay();
      });

      track.addEventListener("transitionend", () => {
        if (currentIndex === 0) {
          moveTo(slides.length, false);
        } else if (currentIndex === trackSlides.length - 1) {
          moveTo(1, false);
        }
      });

      heroSlider.addEventListener("mouseenter", stopAutoplay);
      heroSlider.addEventListener("mouseleave", startAutoplay);
      window.addEventListener("resize", () => moveTo(currentIndex, false));

      moveTo(1, false);
      startAutoplay();
    }
  }

  const carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    const track = carousel.querySelector("[data-carousel-track]");
    const viewport = carousel.querySelector(".testimonial-viewport");
    const slides = track ? Array.from(track.querySelectorAll("[data-slide]")) : [];
    const prevButton = document.querySelector("[data-carousel-prev]");
    const nextButton = document.querySelector("[data-carousel-next]");
    const dotsHost = carousel.querySelector("[data-carousel-dots]");

    if (track && viewport && slides.length && prevButton && nextButton && dotsHost) {
      const firstClone = slides[0].cloneNode(true);
      const lastClone = slides[slides.length - 1].cloneNode(true);
      firstClone.setAttribute("data-clone", "true");
      lastClone.setAttribute("data-clone", "true");
      track.appendChild(firstClone);
      track.insertBefore(lastClone, track.firstChild);

      const trackSlides = Array.from(track.children);
      let currentIndex = 1;
      let autoplayId = 0;

      const dots = slides.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Go to testimonial slide ${index + 1}`);
        dot.addEventListener("click", () => moveTo(index + 1));
        dotsHost.appendChild(dot);
        return dot;
      });

      function getRealIndex(index) {
        if (index === 0) return slides.length - 1;
        if (index === trackSlides.length - 1) return 0;
        return index - 1;
      }

      function updateState() {
        const realIndex = getRealIndex(currentIndex);

        trackSlides.forEach((slide, index) => {
          const isActive = index === currentIndex;
          slide.classList.toggle("is-active", isActive && !slide.hasAttribute("data-clone"));
          slide.setAttribute("aria-hidden", isActive ? "false" : "true");
        });

        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === realIndex);
          dot.setAttribute("aria-pressed", index === realIndex ? "true" : "false");
        });
      }

      function moveTo(index, animate = true) {
        currentIndex = index;
        const slideWidth = viewport.getBoundingClientRect().width;
        track.style.transitionDuration = animate && !reducedMotion ? "900ms" : "0ms";
        track.style.transform = `translate3d(-${currentIndex * slideWidth}px, 0, 0)`;
        updateState();
      }

      function stopAutoplay() {
        if (!autoplayId) return;
        window.clearInterval(autoplayId);
        autoplayId = 0;
        dots.forEach((dot) => dot.classList.add("is-paused"));
      }

      function startAutoplay() {
        if (reducedMotion || autoplayId) return;
        dots.forEach((dot) => dot.classList.remove("is-paused"));
        autoplayId = window.setInterval(() => moveTo(currentIndex + 1), 4200);
      }

      prevButton.addEventListener("click", () => {
        stopAutoplay();
        moveTo(currentIndex - 1);
        startAutoplay();
      });

      nextButton.addEventListener("click", () => {
        stopAutoplay();
        moveTo(currentIndex + 1);
        startAutoplay();
      });

      track.addEventListener("transitionend", () => {
        if (currentIndex === 0) {
          moveTo(slides.length, false);
        } else if (currentIndex === trackSlides.length - 1) {
          moveTo(1, false);
        }
      });

      carousel.addEventListener("mouseenter", stopAutoplay);
      carousel.addEventListener("mouseleave", startAutoplay);

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });

      window.addEventListener("resize", () => moveTo(currentIndex, false));

      moveTo(1, false);
      startAutoplay();
    }
  }

  const ctaBanner = document.querySelector(".cta-banner");
  if (ctaBanner && !reducedMotion) {
    let rafId = 0;

    const updateParallax = () => {
      rafId = 0;
      const rect = ctaBanner.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (rect.bottom <= 0 || rect.top >= viewportHeight) return;

      const progress = (rect.top + rect.height) / (viewportHeight + rect.height);
      const offset = (0.5 - progress) * 48;
      ctaBanner.style.setProperty("--parallax-offset", `${offset.toFixed(2)}px`);
    };

    const requestParallax = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };

    requestParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
  }
})();
