import api from "./api.js";

"use strict";

const form = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const senhaInput = document.getElementById("adminSenha");
const toggleSenha = document.getElementById("toggleSenha");
const mensagem = document.getElementById("loginMessage");
const lembrar = document.getElementById("lembrar");
const forgotPassword = document.getElementById("forgotPassword");

const usuarioAutenticado =
  sessionStorage.getItem("fozAdminAutenticado") === "true" ||
  localStorage.getItem("fozAdminAutenticado") === "true";

if (usuarioAutenticado) {
  window.location.replace("admin-painel.html");
}

toggleSenha.addEventListener("click", () => {
  const estaVisivel = senhaInput.type === "text";
  senhaInput.type = estaVisivel ? "password" : "text";
  toggleSenha.setAttribute(
    "aria-label",
    estaVisivel ? "Mostrar senha" : "Ocultar senha"
  );
});

forgotPassword.addEventListener("click", event => {
  event.preventDefault();
  mostrarMensagem(
    "A recuperação de senha ainda não está disponível.",
    "info"
  );
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const password = senhaInput.value;

  if (!email || !password) {
    mostrarMensagem("Preencha o e-mail e a senha.", "error");
    return;
  }

  try {
    mostrarMensagem("Verificando suas credenciais...", "info");

    const response = await api.post("/auth/login", {
      email,
      password
    });

    const data = response.data;

    console.log("Resposta da API:", data);

    const {
      token,
      message,
      name,
      role,
      email: emailRetornado
    } = data;

    if (!token) {
      mostrarMensagem(
        message || "Não foi possível realizar o login.",
        "error"
      );
      return;
    }

    const storage = lembrar.checked
      ? localStorage
      : sessionStorage;

    localStorage.removeItem("fozAdminAutenticado");
    localStorage.removeItem("fozAdminToken");
    localStorage.removeItem("fozAdminNome");
    localStorage.removeItem("fozAdminRole");
    localStorage.removeItem("fozAdminEmail");

    sessionStorage.removeItem("fozAdminAutenticado");
    sessionStorage.removeItem("fozAdminToken");
    sessionStorage.removeItem("fozAdminNome");
    sessionStorage.removeItem("fozAdminRole");
    sessionStorage.removeItem("fozAdminEmail");

    storage.setItem("fozAdminAutenticado", "true");
    storage.setItem("fozAdminToken", token);
    storage.setItem("fozAdminNome", name || "");
    storage.setItem("fozAdminRole", role || "");
    storage.setItem("fozAdminEmail", emailRetornado || email);

    mostrarMensagem(
      message || "Login realizado com sucesso!",
      "success"
    );

    window.setTimeout(() => {
      window.location.assign("admin-painel.html");
    }, 500);

  } catch (error) {
    console.error("Erro ao realizar login:", error);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      console.error("Status:", status);
      console.error("Resposta da API:", data);

      const mensagemErro =
        data?.message ||
        data?.error ||
        "E-mail ou senha inválidos.";

      mostrarMensagem(mensagemErro, "error");
      return;
    }

    if (error.request) {
      mostrarMensagem(
        "Não foi possível conectar com o servidor.",
        "error"
      );
      return;
    }

    mostrarMensagem(
      "Ocorreu um erro inesperado ao realizar o login.",
      "error"
    );
  }
});

function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = `login-message show ${tipo}`;
}
