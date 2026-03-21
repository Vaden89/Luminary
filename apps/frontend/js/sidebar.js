window.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const sidebarLinks = Array.from(document.querySelectorAll(".sidebar-btn"));
  const currentPage = window.location.pathname.split("/").pop();

  sidebarLinks.forEach((link) => {
    const href = (link.getAttribute("href") || "").split(/[?#]/)[0];
    const matchPages = (link.dataset.matchPages || href)
      .split(",")
      .map((page) => page.trim())
      .filter(Boolean);
    const isActive = matchPages.includes(currentPage);

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else if (link.getAttribute("aria-current") === "page") {
      link.removeAttribute("aria-current");
    }

    link.addEventListener("click", () => {
      if (navToggle) {
        navToggle.checked = false;
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle?.checked) {
      navToggle.checked = false;
    }
  });
});
