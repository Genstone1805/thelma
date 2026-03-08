(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = Array.from(document.querySelectorAll(".faq-item"));

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
})();
