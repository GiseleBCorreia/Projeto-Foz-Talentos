import VagasService from "./vagas-service.js";


const autenticado =
  sessionStorage.getItem("fozAdminAutenticado") === "true" ||
  localStorage.getItem("fozAdminAutenticado") === "true";

if (!autenticado) {
  window.location.replace("admin-login.html");
}

const lista = document.getElementById("adminJobsList");
const vazio = document.getElementById("adminEmptyState");
const pesquisa = document.getElementById("searchInput");
const filtroStatus = document.getElementById("statusFilter");
const modal = document.getElementById("jobModal");
const form = document.getElementById("jobForm");
const toast = document.getElementById("toast");
const formMessage = document.getElementById("formMessage");

const campos = {
  id: document.getElementById("jobId"),
  titulo: document.getElementById("jobTitle"),
  empresa: document.getElementById("jobCompany"),
  cidade: document.getElementById("jobCity"),
  estado: document.getElementById("jobState"),
  area: document.getElementById("jobArea"),
  contrato: document.getElementById("jobContract"),
  modalidade: document.getElementById("jobMode"),
  experiencia: document.getElementById("jobExperience"),
  salario: document.getElementById("jobSalary"),
  status: document.getElementById("jobStatus"),
  descricao: document.getElementById("jobDescription"),
  requisitos: document.getElementById("jobRequirements"),
  beneficios: document.getElementById("jobBenefits"),
  whatsapp: document.getElementById("jobWhatsapp"),
  email: document.getElementById("jobEmail")
};

const CAMPOS_OBRIGATORIOS = [
  ["Título da vaga", "titulo"],
  ["Empresa", "empresa"],
  ["Cidade", "cidade"],
  ["Estado", "estado"],
  ["Área de atuação", "area"],
  ["Tipo de contrato", "contrato"],
  ["Modalidade", "modalidade"],
  ["Nível de experiência", "experiencia"],
  ["Salário", "salario"],
  ["Status", "status"],
  ["Descrição", "descricao"],
  ["Requisitos", "requisitos"]
];

function escapeHtml(valor = "") {
  return String(valor).replace(
    /[&<>'"]/g,
    (caractere) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
      })[caractere]
  );
}

function linhasParaArray(valor = "") {
  return valor
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatarData(data) {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR").format(dataConvertida);
}

function obterCidade(vaga) {
  if (vaga.cidade) {
    return vaga.cidade;
  }

  return String(vaga.localizacao || "")
    .replace(/\s*-\s*[A-Za-z]{2}\s*$/, "")
    .trim();
}

function obterEstado(vaga) {
  if (vaga.estado) {
    return vaga.estado;
  }

  const resultado =
    String(vaga.localizacao || "")
      .match(/-\s*([A-Za-z]{2})\s*$/);

  return resultado ? resultado[1].toUpperCase() : "";
}

function renderizar() {
  const vagas = VagasService.listar();

  document.getElementById("totalJobs").textContent =
    vagas.length;

  document.getElementById("activeJobs").textContent =
    vagas.filter((vaga) => vaga.status === "ativa").length;

  document.getElementById("inactiveJobs").textContent =
    vagas.filter((vaga) => vaga.status === "inativa").length;

  const termo =
    pesquisa.value.trim().toLowerCase();

  const status =
    filtroStatus.value;

  const filtradas =
    vagas.filter((vaga) => {
      const texto =
        [
          vaga.id,
          vaga.titulo,
          vaga.empresa,
          vaga.localizacao,
          vaga.area,
          vaga.experiencia
        ]
          .join(" ")
          .toLowerCase();

      return (
        (!termo || texto.includes(termo)) &&
        (status === "todos" || vaga.status === status)
      );
    });

  lista.innerHTML =
    filtradas
      .map(
        (vaga) => `
          <article class="admin-job-row">
            <div class="admin-job-main">
              <div class="admin-job-title-line">
                <h3>${escapeHtml(vaga.titulo)}</h3>

                <span class="status-badge ${escapeHtml(vaga.status)}">
                  ${vaga.status === "ativa" ? "Ativa" : "Inativa"}
                </span>
              </div>

              <p class="admin-job-code">
                Código da vaga:
                <strong>${escapeHtml(vaga.id || "Sem código")}</strong>
              </p>

              <p>
                ${escapeHtml(vaga.empresa)}
                ·
                ${escapeHtml(vaga.localizacao)}
              </p>

              <div class="admin-job-tags">
                <span>${escapeHtml(vaga.area || "Área não informada")}</span>
                <span>${escapeHtml(vaga.contrato)}</span>
                <span>${escapeHtml(vaga.modalidade)}</span>
                <span>${escapeHtml(vaga.experiencia || "Experiência não informada")}</span>
                <span>${escapeHtml(vaga.salario || "Salário não informado")}</span>

                <span>
                  Atualizada em ${formatarData(vaga.atualizadoEm)}
                </span>
              </div>
            </div>

            <div class="admin-job-actions">
              <button
                class="icon-action edit"
                data-action="edit"
                data-id="${escapeHtml(vaga.id)}"
                type="button"
              >
                Editar
              </button>

              <button
                class="icon-action delete"
                data-action="delete"
                data-id="${escapeHtml(vaga.id)}"
                type="button"
              >
                Excluir
              </button>
            </div>
          </article>
        `
      )
      .join("");

  vazio.hidden = filtradas.length > 0;
}

function abrirModal(vaga = null) {
  form.reset();
  formMessage.textContent = "";
  formMessage.className = "form-message";

  document.getElementById("modalTitle").textContent =
    vaga ? "Editar vaga" : "Nova vaga";

  campos.id.value = vaga?.id || "";

  if (vaga) {
    campos.titulo.value = vaga.titulo || "";
    campos.empresa.value = vaga.empresa || "";
    campos.cidade.value = obterCidade(vaga);
    campos.estado.value = obterEstado(vaga);
    campos.area.value = vaga.area || "";
    campos.contrato.value = vaga.contrato || "";
    campos.modalidade.value = vaga.modalidade || "";
    campos.experiencia.value = vaga.experiencia || "";
    campos.salario.value = vaga.salario || "";
    campos.status.value = vaga.status || "";
    campos.descricao.value = vaga.descricao || "";

    campos.requisitos.value =
      (vaga.requisitos || []).join("\n");

    campos.beneficios.value =
      (vaga.beneficios || []).join("\n");

    campos.whatsapp.value = vaga.whatsapp || "";
    campos.email.value = vaga.email || "";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  setTimeout(() => campos.titulo.focus(), 50);
}

function fecharModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function mostrarToast(texto) {
  toast.textContent = texto;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function validarCamposObrigatorios() {
  const ausentes = [];

  CAMPOS_OBRIGATORIOS.forEach(([rotulo, chave]) => {
    const campo = campos[chave];

    if (!campo || !String(campo.value).trim()) {
      ausentes.push(rotulo);
    }
  });

  if (linhasParaArray(campos.requisitos.value).length === 0) {
    if (!ausentes.includes("Requisitos")) {
      ausentes.push("Requisitos");
    }
  }

  if (ausentes.length > 0) {
    formMessage.textContent =
      `Preencha os campos obrigatórios: ${ausentes.join(", ")}.`;

    formMessage.className =
      "form-message form-message-error";

    const primeiroCampo =
      CAMPOS_OBRIGATORIOS
        .map(([, chave]) => campos[chave])
        .find(
          (campo) =>
            campo && !String(campo.value).trim()
        );

    primeiroCampo?.focus();

    return false;
  }

  return true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!validarCamposObrigatorios()) {
    return;
  }

  const cidade =
    campos.cidade.value.trim();

  const estado =
    campos.estado.value.trim().toUpperCase();

  const dados = {
    titulo: campos.titulo.value.trim(),
    empresa: campos.empresa.value.trim(),

    cidade,
    estado,
    localizacao: `${cidade} - ${estado}`,

    area: campos.area.value,
    contrato: campos.contrato.value,
    modalidade: campos.modalidade.value,
    experiencia: campos.experiencia.value,
    salario: campos.salario.value.trim(),
    status: campos.status.value,
    descricao: campos.descricao.value.trim(),

    requisitos:
      linhasParaArray(campos.requisitos.value),

    beneficios:
      linhasParaArray(campos.beneficios.value),

    whatsapp:
      campos.whatsapp.value.replace(/\D/g, ""),

    email:
      campos.email.value.trim()
  };

  if (!dados.whatsapp && !dados.email) {
    formMessage.textContent =
      "Informe ao menos WhatsApp ou e-mail para candidatura.";

    formMessage.className =
      "form-message form-message-error";

    return;
  }

  try {
    if (campos.id.value) {
      await VagasService.atualizar(campos.id.value, dados);
      mostrarToast("Vaga atualizada com sucesso.");
    } else {
      await VagasService.criar(dados);
      mostrarToast("Vaga cadastrada com sucesso.");
    }

    fecharModal();
    renderizar();
  } catch (error) {
    console.error("Erro ao salvar vaga:", error);
    formMessage.textContent =
      error.response?.data?.message ||
      "Não foi possível salvar a vaga. Tente novamente.";
    formMessage.className = "form-message form-message-error";
  }
});

lista.addEventListener("click", async (event) => {
  const botao =
    event.target.closest("button[data-action]");

  if (!botao) {
    return;
  }

  const vaga =
    VagasService.buscarPorId(botao.dataset.id);

  if (!vaga) {
    return;
  }

  if (botao.dataset.action === "edit") {
    abrirModal(vaga);
  }

  if (
    botao.dataset.action === "delete" &&
    confirm(`Deseja desativar a vaga “${vaga.titulo}”?`)
  ) {
    try {
      await VagasService.desativar(vaga.id);
      mostrarToast("Vaga desativada.");
      renderizar();
    } catch (error) {
      console.error("Erro ao desativar vaga:", error);
      mostrarToast("Não foi possível desativar a vaga.");
    }
  }
});

document
  .getElementById("newJobButton")
  .addEventListener("click", () => abrirModal());

document
  .querySelectorAll("[data-close-modal]")
  .forEach((elemento) => {
    elemento.addEventListener("click", fecharModal);
  });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    fecharModal();
  }
});

pesquisa.addEventListener("input", renderizar);
filtroStatus.addEventListener("change", renderizar);

document
  .getElementById("logoutButton")
  .addEventListener("click", () => {
    sessionStorage.removeItem("fozAdminAutenticado");
    localStorage.removeItem("fozAdminAutenticado");
    window.location.replace("admin-login.html");
  });

async function iniciarPainel() {
  try {
    await VagasService.carregarVagas();
    renderizar();
  } catch (error) {
    console.error("Erro ao carregar painel:", error);
    vazio.hidden = false;
    vazio.querySelector("h2").textContent = "Erro ao carregar vagas";
    vazio.querySelector("p").textContent = "Não foi possível buscar as vagas na API.";
  }
}

iniciarPainel();
