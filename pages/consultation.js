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

  const fields = {
    package: document.getElementById("consultPackage"),
    timeline: document.getElementById("consultTimeline"),
    name: document.getElementById("consultName"),
    email: document.getElementById("consultEmail"),
    goals: document.getElementById("consultGoals"),
  };

  const outputs = {
    package: document.querySelector("[data-booking='package']"),
    timeline: document.querySelector("[data-booking='timeline']"),
    name: document.querySelector("[data-booking='name']"),
    email: document.querySelector("[data-booking='email']"),
    goals: document.querySelector("[data-booking='goals']"),
  };

  const options = Array.from(document.querySelectorAll(".consult-option"));

  const updateSummary = () => {
    if (outputs.package) {
      outputs.package.textContent = fields.package?.value || "Choose an option";
    }
    if (outputs.timeline) {
      outputs.timeline.textContent = fields.timeline?.value || "Select your exam window";
    }
    if (outputs.name) outputs.name.textContent = fields.name?.value || "Not added yet";
    if (outputs.email) outputs.email.textContent = fields.email?.value || "Not added yet";

    const goals = (fields.goals?.value || "").trim();
    if (outputs.goals) {
      outputs.goals.textContent = goals
        ? `${goals.slice(0, 70)}${goals.length > 70 ? "..." : ""}`
        : "Waiting for your focus area";
    }

    options.forEach((option) => {
      option.classList.toggle(
        "is-selected",
        option.getAttribute("data-package") === (fields.package?.value || ""),
      );
    });
  };

  options.forEach((option) => {
    option.addEventListener("click", () => {
      if (fields.package) {
        fields.package.value = option.getAttribute("data-package") || "";
      }
      updateSummary();
    });
  });

  Object.values(fields).forEach((field) => {
    field?.addEventListener("input", updateSummary);
    field?.addEventListener("change", updateSummary);
  });

  updateSummary();
})();
