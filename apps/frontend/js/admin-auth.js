userPassword = document.getElementById("auth-password");

const displayPassword = () => {
  if (userPassword.type === "password") {
    userPassword.type = "text";
  } else {
    userPassword.type = "password";
  }
};
