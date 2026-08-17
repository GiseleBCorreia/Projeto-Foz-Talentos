"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.querySelector(".nav-links");

  if (!menuButton || !navLinks) {
    return;
  }

  function abrirMenu() {
    navLinks.classList.add("open");
    document.body.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded", "true");
  }

  function fecharMenu() {
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  function alternarMenu() {
    if (navLinks.classList.contains("open")) {
      fecharMenu();
    } else {
      abrirMenu();
    }
  }

  menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    alternarMenu();
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      fecharMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      navLinks.classList.contains("open") &&
      !event.target.closest(".nav-links") &&
      !event.target.closest(".menu-button")
    ) {
      fecharMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      fecharMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      fecharMenu();
    }
  });
});
