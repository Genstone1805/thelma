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
    name: document.getElementById("contactName"),
    email: document.getElementById("contactEmail"),
    program: document.getElementById("contactProgram"),
    date: document.getElementById("contactDate"),
    message: document.getElementById("contactMessage"),
  };

  const summary = {
    name: document.querySelector("[data-summary='name']"),
    email: document.querySelector("[data-summary='email']"),
    program: document.querySelector("[data-summary='program']"),
    date: document.querySelector("[data-summary='date']"),
    message: document.querySelector("[data-summary='message']"),
  };

  const count = document.getElementById("messageCount");

  const formatDate = (value) => {
    if (!value) return "Not selected yet";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateSummary = () => {
    if (summary.name) summary.name.textContent = fields.name?.value || "Not added yet";
    if (summary.email) summary.email.textContent = fields.email?.value || "Not added yet";
    if (summary.program) summary.program.textContent = fields.program?.value || "Not selected yet";
    if (summary.date) summary.date.textContent = formatDate(fields.date?.value || "");

    const message = (fields.message?.value || "").trim();
    if (summary.message) {
      summary.message.textContent = message
        ? `${message.slice(0, 70)}${message.length > 70 ? "..." : ""}`
        : "Waiting for your details";
    }

    if (count) count.textContent = String(message.length);
  };

  Object.values(fields).forEach((field) => {
    field?.addEventListener("input", updateSummary);
    field?.addEventListener("change", updateSummary);
  });

  updateSummary();
})();
