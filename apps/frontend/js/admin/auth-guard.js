async function authGuard() {
  const token = localStorage.getItem("access_token");
  const path = window.location.pathname;
  const isLoginPage = path.includes("admin-login.html");

  if (!token) {
    if (!isLoginPage) {
      // Redirect to login if not logged in
      window.location.replace("admin-login.html");
    }
    return;
  }

  document.documentElement.classList.remove("auth-pending");
}
authGuard();
