"use strict";

const autenticado = sessionStorage.getItem("fozAdminAutenticado") === "true" || localStorage.getItem("fozAdminAutenticado") === "true";
if (!autenticado) window.location.replace("admin-login.html");

const lista = document.getElementById("adminJobsList");
const vazio = document.getElementById("adminEmptyState");
const pesquisa = document.getElementById("searchInput");
const filtroStatus = document.getElementById("statusFilter");
const modal = document.getElementById("jobModal");
const form = document.getElementById("jobForm");
const toast = document.getElementById("toast");
const campos = {
  id: document.getElementById("jobId"), titulo: document.getElementById("jobTitle"), empresa: document.getElementById("jobCompany"),
  localizacao: document.getElementById("jobLocation"), contrato: document.getElementById("jobContract"), modalidade: document.getElementById("jobMode"),
  salario: document.getElementById("jobSalary"), status: document.getElementById("jobStatus"), descricao: document.getElementById("jobDescription"),
  requisitos: document.getElementById("jobRequirements"), beneficios: document.getElementById("jobBenefits"), whatsapp: document.getElementById("jobWhatsapp"),
  email: document.getElementById("jobEmail")
};

function escapeHtml(valor = "") {
  return String(valor).replace(/[&<>'"]/g, caractere => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[caractere]);
}
function linhasParaArray(valor) { return valor.split("\n").map(item => item.trim()).filter(Boolean); }
function formatarData(data) { return new Intl.DateTimeFormat("pt-BR").format(new Date(data)); }

function renderizar() {
  const vagas = VagasService.listar();
  document.getElementById("totalJobs").textContent = vagas.length;
  document.getElementById("activeJobs").textContent = vagas.filter(v => v.status === "ativa").length;
  document.getElementById("inactiveJobs").textContent = vagas.filter(v => v.status === "inativa").length;

  const termo = pesquisa.value.trim().toLowerCase();
  const status = filtroStatus.value;
  const filtradas = vagas.filter(vaga => {
    const texto = `${vaga.titulo} ${vaga.empresa} ${vaga.localizacao}`.toLowerCase();
    return (!termo || texto.includes(termo)) && (status === "todos" || vaga.status === status);
  });

  lista.innerHTML = filtradas.map(vaga => `
    <article class="admin-job-row">
      <div class="admin-job-main"><div class="admin-job-title-line"><h3>${escapeHtml(vaga.titulo)}</h3><span class="status-badge ${vaga.status}">${vaga.status === "ativa" ? "Ativa" : "Inativa"}</span></div>
      <p>${escapeHtml(vaga.empresa)} · ${escapeHtml(vaga.localizacao)}</p><div class="admin-job-tags"><span>${escapeHtml(vaga.contrato)}</span><span>${escapeHtml(vaga.modalidade)}</span><span>Atualizada em ${formatarData(vaga.atualizadoEm)}</span></div></div>
      <div class="admin-job-actions"><button class="icon-action edit" data-action="edit" data-id="${vaga.id}" type="button">Editar</button><button class="icon-action delete" data-action="delete" data-id="${vaga.id}" type="button">Excluir</button></div>
    </article>`).join("");
  vazio.hidden = filtradas.length > 0;
}

function abrirModal(vaga = null) {
  form.reset();
  document.getElementById("formMessage").textContent = "";
  document.getElementById("modalTitle").textContent = vaga ? "Editar vaga" : "Nova vaga";
  campos.id.value = vaga?.id || "";
  if (vaga) {
    campos.titulo.value = vaga.titulo; campos.empresa.value = vaga.empresa; campos.localizacao.value = vaga.localizacao;
    campos.contrato.value = vaga.contrato; campos.modalidade.value = vaga.modalidade; campos.salario.value = vaga.salario || "";
    campos.status.value = vaga.status; campos.descricao.value = vaga.descricao; campos.requisitos.value = (vaga.requisitos || []).join("\n");
    campos.beneficios.value = (vaga.beneficios || []).join("\n"); campos.whatsapp.value = vaga.whatsapp || ""; campos.email.value = vaga.email || "";
  }
  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
  setTimeout(() => campos.titulo.focus(), 50);
}
function fecharModal() { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open"); }
function mostrarToast(texto) { toast.textContent = texto; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2600); }

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const dados = {
    titulo: campos.titulo.value.trim(), empresa: campos.empresa.value.trim(), localizacao: campos.localizacao.value.trim(),
    contrato: campos.contrato.value, modalidade: campos.modalidade.value, salario: campos.salario.value.trim() || "A combinar",
    status: campos.status.value, descricao: campos.descricao.value.trim(), requisitos: linhasParaArray(campos.requisitos.value),
    beneficios: linhasParaArray(campos.beneficios.value), whatsapp: campos.whatsapp.value.replace(/\D/g, ""), email: campos.email.value.trim()
  };
  if (!dados.whatsapp && !dados.email) {
    document.getElementById("formMessage").textContent = "Informe ao menos WhatsApp ou e-mail para candidatura.";
    return;
  }
  if (campos.id.value) { VagasService.atualizar(campos.id.value, dados); mostrarToast("Vaga atualizada com sucesso."); }
  else { VagasService.criar(dados); mostrarToast("Vaga cadastrada com sucesso."); }
  fecharModal(); renderizar();
});

lista.addEventListener("click", event => {
  const botao = event.target.closest("button[data-action]"); if (!botao) return;
  const vaga = VagasService.buscarPorId(botao.dataset.id); if (!vaga) return;
  if (botao.dataset.action === "edit") abrirModal(vaga);
  if (botao.dataset.action === "delete" && confirm(`Deseja excluir a vaga “${vaga.titulo}”?`)) { VagasService.excluir(vaga.id); mostrarToast("Vaga excluída."); renderizar(); }
});

document.getElementById("newJobButton").addEventListener("click", () => abrirModal());
document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", fecharModal));
document.addEventListener("keydown", event => { if (event.key === "Escape") fecharModal(); });
pesquisa.addEventListener("input", renderizar); filtroStatus.addEventListener("change", renderizar);
document.getElementById("logoutButton").addEventListener("click", () => { sessionStorage.removeItem("fozAdminAutenticado"); localStorage.removeItem("fozAdminAutenticado"); window.location.replace("admin-login.html"); });
renderizar();
