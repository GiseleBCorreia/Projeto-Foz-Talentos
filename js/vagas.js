"use strict";
const listaPublica = document.getElementById("publicJobsList");
const vazioPublico = document.getElementById("publicEmptyState");
const buscaPublica = document.getElementById("publicSearch");
const modalidadePublica = document.getElementById("publicModeFilter");
const detalhesModal = document.getElementById("jobDetailsModal");

function esc(valor = "") { return String(valor).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"})[c]); }
function renderizarVagas() {
  const termo = buscaPublica.value.trim().toLowerCase();
  const modo = modalidadePublica.value;
  const vagas = VagasService.listar().filter(vaga => vaga.status === "ativa").filter(vaga => {
    const texto = `${vaga.titulo} ${vaga.empresa} ${vaga.localizacao} ${vaga.descricao}`.toLowerCase();
    return (!termo || texto.includes(termo)) && (modo === "todos" || vaga.modalidade === modo);
  });
  document.getElementById("jobsResultCount").textContent = `${vagas.length} ${vagas.length === 1 ? "vaga encontrada" : "vagas encontradas"}`;
  listaPublica.innerHTML = vagas.map(vaga => `<article class="public-job-card"><div class="job-top"><span class="job-icon">💼</span><span class="tag blue">${esc(vaga.contrato)}</span></div><h2>${esc(vaga.titulo)}</h2><p class="job-company">${esc(vaga.empresa)}</p><div class="public-job-meta"><span>📍 ${esc(vaga.localizacao)}</span><span>🏢 ${esc(vaga.modalidade)}</span><span>💰 ${esc(vaga.salario || "A combinar")}</span></div><p>${esc(vaga.descricao)}</p><button class="button button-primary public-job-button" data-job-id="${vaga.id}" type="button">Ver detalhes</button></article>`).join("");
  vazioPublico.hidden = vagas.length > 0;
}
function abrirDetalhes(id) {
  const vaga = VagasService.buscarPorId(id); if (!vaga) return;
  document.getElementById("detailsTitle").textContent = vaga.titulo;
  const whatsappLink = vaga.whatsapp ? `https://wa.me/${vaga.whatsapp}?text=${encodeURIComponent(`Olá! Tenho interesse na vaga de ${vaga.titulo}.`)}` : "";
  document.getElementById("jobDetailsContent").innerHTML = `<p class="details-company">${esc(vaga.empresa)}</p><div class="details-meta"><span>📍 ${esc(vaga.localizacao)}</span><span>📄 ${esc(vaga.contrato)}</span><span>🏢 ${esc(vaga.modalidade)}</span><span>💰 ${esc(vaga.salario)}</span></div><h3>Descrição</h3><p>${esc(vaga.descricao)}</p><h3>Requisitos</h3><ul>${(vaga.requisitos || []).map(i => `<li>${esc(i)}</li>`).join("")}</ul>${vaga.beneficios?.length ? `<h3>Benefícios</h3><ul>${vaga.beneficios.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}<div class="details-actions">${whatsappLink ? `<a class="button whatsapp" href="${whatsappLink}" target="_blank" rel="noopener">Candidatar pelo WhatsApp</a>` : ""}${vaga.email ? `<a class="button button-outline" href="mailto:${encodeURIComponent(vaga.email)}?subject=${encodeURIComponent(`Candidatura - ${vaga.titulo}`)}">Candidatar por e-mail</a>` : ""}</div>`;
  detalhesModal.classList.add("open"); detalhesModal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
}
function fecharDetalhes() { detalhesModal.classList.remove("open"); detalhesModal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open"); }
listaPublica.addEventListener("click", e => { const b = e.target.closest("[data-job-id]"); if (b) abrirDetalhes(b.dataset.jobId); });
document.querySelectorAll("[data-close-details]").forEach(el => el.addEventListener("click", fecharDetalhes));
buscaPublica.addEventListener("input", renderizarVagas); modalidadePublica.addEventListener("change", renderizarVagas);
document.getElementById("menuButton").addEventListener("click", () => document.body.classList.toggle("menu-open"));
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharDetalhes(); });
window.addEventListener("storage", renderizarVagas);
renderizarVagas();
