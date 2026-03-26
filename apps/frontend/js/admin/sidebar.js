window.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const sidebarLinks = Array.from(document.querySelectorAll(".sidebar-btn"));
  const normalizePageName = (value) => {
    const lastSegment =
      String(value || "")
        .split(/[?#]/)[0]
        .trim()
        .replace(/[\\/]+$/, "")
        .split(/[\\/]/)
        .filter(Boolean)
        .pop() || "";

    return lastSegment
      .replace(/index\.html$/i, "index")
      .replace(/\.html$/i, "")
      .toLowerCase();
  };

  const currentPage = normalizePageName(window.location.pathname);

  sidebarLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const matchPages = [
      href,
      ...(link.dataset.matchPages || "")
        .split(",")
        .map((page) => page.trim())
        .filter(Boolean),
    ].map(normalizePageName);
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
