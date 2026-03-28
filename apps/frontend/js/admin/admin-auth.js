import { ACTIVE_CONFIG as CONFIG } from "../config.js";

const loginForm = document.getElementById("login-form");
const loginErrorMsg = document.getElementById("login-error-msg");
const loginPassword = document.getElementById("auth-password");
const loginEmail = document.getElementById("login-email");
const toggleBtn = document.getElementById("toggle-password");
const submitBtn = loginForm?.querySelector('button[type="submit"]');
const submitBtnText = submitBtn?.textContent?.trim() || "Sign In";

const loginEndpoint = `${CONFIG.BACKEND_URL}/auth/admin/login`;

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
    <i class="fa-solid fa-exclamation"></i>
    <span>${message}</span>
  `;
  loginErrorMsg.classList.add("is-visible");
};

const clearError = () => {
  loginErrorMsg.classList.remove("is-visible");
  loginErrorMsg.innerHTML = "";
};

const setLoading = (isLoading) => {
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Signing in..." : submitBtnText;
  submitBtn.setAttribute("aria-busy", String(isLoading));
};

// Login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  setLoading(true);

  loginEmail.value = loginEmail.value.trim();
  loginPassword.value = loginPassword.value.trim();

  let didNavigate = false;
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
    didNavigate = true;
    window.location.href = "admin-nomination.html";
  } catch (error) {
    showError("Something went wrong. Please try again.");
  } finally {
    if (!didNavigate) {
      setLoading(false);
    }
  }
});
