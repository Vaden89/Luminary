function getActivePage() {
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".sidebar-btn");
  links.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

  getActivePage();
