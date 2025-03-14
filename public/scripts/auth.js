document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Toggle Forms
    loginBtn.addEventListener("click", () => {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        loginBtn.classList.add("active");
        registerBtn.classList.remove("active");
    });

    registerBtn.addEventListener("click", () => {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        registerBtn.classList.add("active");
        loginBtn.classList.remove("active");
    });
});