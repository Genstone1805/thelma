(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function splitTextForReveal(elements) {
    elements.forEach((element) => {
      if (element.dataset.textSplit === "true") return;
      if (element.children.length > 0) return;
      if (element.closest(".step-card")) return;
      if (element.closest(".faq-item")) return;

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
    if (reducedMotion) return;

    const textTargets = Array.from(
      root.querySelectorAll(
        "body h1, body h2, body h3, body h4, body h5, body h6, body p, body li, body summary, body label, body a, body button, body strong, body .hero-kicker, body .section-kicker, body .hero-lede, body .summary-copy, body .contact-label"
      )
    );

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

  initScrollMotion();
})();
