async function authGuard() {
  const token = localStorage.getItem("access_token");
  const path = window.location.pathname;
  const isLoginPage = path.includes("admin-login.html");

  // Determine API Base URL from body or default
  const apiBaseElement = document.querySelector("[data-api-base]");
  const apiBase = (apiBaseElement ? apiBaseElement.dataset.apiBase : "http://127.0.0.1:5001/api").replace(/\/$/, "");

  if (!token) {
    if (!isLoginPage) {
      // Redirect to login if not logged in
      window.location.replace("admin-login.html");
    }
    return;
  }
}
authGuard();
