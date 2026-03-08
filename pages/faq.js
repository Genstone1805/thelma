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

  const search = document.getElementById("faqSearch");
  const buttons = Array.from(document.querySelectorAll("[data-category]"));
  const items = Array.from(document.querySelectorAll("[data-faq-item]"));
  const emptyState = document.getElementById("faqEmpty");

  let activeCategory = "all";

  const applyFilters = () => {
    const term = (search?.value || "").trim().toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const category = item.getAttribute("data-category-value") || "all";
      const text = item.textContent?.toLowerCase() || "";
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesTerm = !term || text.includes(term);
      const visible = matchesCategory && matchesTerm;
      item.classList.toggle("is-hidden", !visible);
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category || "all";
      buttons.forEach((item) =>
        item.classList.toggle("is-active", item === button),
      );
      applyFilters();
    });
  });

  search?.addEventListener("input", applyFilters);
  applyFilters();
})();
