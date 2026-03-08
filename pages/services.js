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

  const buttons = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-track]"));

  const setFilter = (filter) => {
    buttons.forEach((button) =>
      button.classList.toggle("is-active", button.dataset.filter === filter),
    );

    cards.forEach((card) => {
      const matches = filter === "all" || card.dataset.track === filter;
      card.classList.toggle("is-hidden", !matches);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter || "all"));
  });
})();
