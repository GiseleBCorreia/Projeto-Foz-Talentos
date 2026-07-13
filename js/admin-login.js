"use strict";

const form = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const senhaInput = document.getElementById("adminSenha");
const toggleSenha = document.getElementById("toggleSenha");
const mensagem = document.getElementById("loginMessage");
const lembrar = document.getElementById("lembrar");
const forgotPassword = document.getElementById("forgotPassword");

// logine  senha.
const DEMO_EMAIL = "admin@foztalentos.com.br";
const DEMO_PASSWORD = "admin123";

if (sessionStorage.getItem("fozAdminAutenticado") === "true" || localStorage.getItem("fozAdminAutenticado") === "true") {
  window.location.replace("admin-painel.html");
}

toggleSenha.addEventListener("click", () => {
  const estaVisivel = senhaInput.type === "text";
  senhaInput.type = estaVisivel ? "password" : "text";
  toggleSenha.textContent = estaVisivel ? "👁" : "🙈";
  toggleSenha.setAttribute("aria-label", estaVisivel ? "Mostrar senha" : "Ocultar senha");
});

forgotPassword.addEventListener("click", event => {
  event.preventDefault();
  mostrarMensagem("A recuperação de senha será conectada ao back-end.", "info");
});

form.addEventListener("submit", event => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value;

  if (!email || !senha) {
    mostrarMensagem("Preencha o e-mail e a senha.", "error");
    return;
  }

  if (email !== DEMO_EMAIL || senha !== DEMO_PASSWORD) {
    mostrarMensagem("E-mail ou senha inválidos. Use as credenciais de demonstração.", "error");
    return;
  }

  const storage = lembrar.checked ? localStorage : sessionStorage;
  storage.setItem("fozAdminAutenticado", "true");
  storage.setItem("fozAdminEmail", email);
  mostrarMensagem("Login realizado. Redirecionando...", "success");
  window.setTimeout(() => window.location.assign("admin-painel.html"), 350);
});

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `login-message show ${tipo}`;
}
