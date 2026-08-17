const contactForm = document.getElementById("contact-form");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");

contactForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  formMessage.textContent = "";
  formMessage.className = "form-message";

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  const formData = new FormData(contactForm);

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Não foi possível enviar a mensagem.");
    }

    formMessage.textContent =
      "Mensagem enviada com sucesso! Em breve, nossa equipe entrará em contato.";

    formMessage.classList.add("form-message-success");

    contactForm.reset();
  } catch (error) {
    console.error("Erro ao enviar formulário:", error);

    formMessage.textContent =
      "Não foi possível enviar a mensagem. Tente novamente em alguns instantes.";

    formMessage.classList.add("form-message-error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar mensagem";
  }
});