const loginForm = document.getElementById("login-form");
const loginErrorMsg = document.getElementById("login-error-msg");
const loginPassword = document.getElementById("auth-password");
const loginEmail = document.getElementById("login-email");
const toggleBtn = document.getElementById("toggle-password");

const apiBase = (loginForm.dataset.apiBase || "").replace(/\/$/, "");
const loginEndpoint = apiBase
  ? `${apiBase}/auth/admin/login`
  : "/api/auth/admin/login";

// Password visibility toggle
toggleBtn.addEventListener("click", () => {
  const isVisible = loginPassword.type === "text";
  loginPassword.type = isVisible ? "password" : "text";
  toggleBtn.classList.toggle("is-visible", !isVisible);
  toggleBtn.setAttribute(
    "aria-label",
    isVisible ? "Show password" : "Hide password",
  );
  toggleBtn.setAttribute("aria-pressed", String(!isVisible));
});

// Error handling
const showError = (message) => {
  loginErrorMsg.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <span>${message}</span>
  `;
  loginErrorMsg.classList.add("is-visible");
};

const clearError = () => {
  loginErrorMsg.classList.remove("is-visible");
  loginErrorMsg.innerHTML = "";
};

// Login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  loginEmail.value = loginEmail.value.trim();
  loginPassword.value = loginPassword.value.trim();

  try {
    const response = await fetch(loginEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showError(result.error || "Invalid email or password.");
      return;
    }

    localStorage.setItem("access_token", result.data.token.access_token);
    localStorage.setItem("refresh_token", result.data.token.refresh_token);

    window.location.href = "admin-nomination.html";
  } catch (error) {
    showError("Something went wrong. Please try again.");
  }
});
