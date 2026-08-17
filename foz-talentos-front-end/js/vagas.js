import VagasService from "./vagas-service.js";

"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const publicJobsList = document.getElementById("publicJobsList");
  const publicEmptyState = document.getElementById("publicEmptyState");
  const jobsResultCount = document.getElementById("jobsResultCount");
  const jobDetailsPanel = document.getElementById("jobDetailsPanel");
  const jobDetailsBackdrop = document.getElementById("jobDetailsBackdrop");
  const jobsMainColumns = document.querySelector(".jobs-main-columns");

  const searchInput = document.getElementById("publicSearch");
  const stateFilter = document.getElementById("publicStateFilter");
  const areaFilter = document.getElementById("publicAreaFilter");

  const modalidadeCheckboxes =
    document.querySelectorAll(".modalidade-filter");

  const contratoCheckboxes =
    document.querySelectorAll(".contrato-filter");

  const experienciaCheckboxes =
    document.querySelectorAll(".experiencia-filter");

  const dateRadioButtons =
    document.querySelectorAll(".date-filter");

  const salaryMinFilter =
    document.getElementById("salaryMinFilter");

  const salaryMaxFilter =
    document.getElementById("salaryMaxFilter");

  if (!publicJobsList || !jobDetailsPanel || !jobsMainColumns) {
    console.error("Estrutura da página de vagas não encontrada.");
    return;
  }

  let salarioMinimoSelecionado =
    Number(salaryMinFilter?.value ?? 0);

  let salarioMaximoSelecionado =
    Number(salaryMaxFilter?.value ?? 20000);

  let vagas = [];
  let vagasVisiveis = [];
  let vagaSelecionadaId = null;

  function estaNoMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function escapeHtml(valor = "") {
    return String(valor).replace(/[&<>'"]/g, (caractere) => {
      const entidades = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
      };

      return entidades[caractere];
    });
  }

  function normalizarTexto(valor = "") {
    return String(valor)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function formatarData(data) {
    if (!data) return "";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("pt-BR").format(dataConvertida);
  }

  function obterSalarioNumerico(salario) {
    if (
      salario === null ||
      salario === undefined ||
      salario === ""
    ) {
      return null;
    }

    if (typeof salario === "number") {
      return Number.isFinite(salario) ? salario : null;
    }

    const texto = normalizarTexto(salario);

    if (
      texto.includes("combinar") ||
      texto.includes("negociar") ||
      texto.includes("pretensao")
    ) {
      return null;
    }

    let valorLimpo =
      String(salario).replace(/[^\d.,-]/g, "");

    if (!valorLimpo) return null;

    if (
      valorLimpo.includes(".") &&
      valorLimpo.includes(",")
    ) {
      valorLimpo =
        valorLimpo.replace(/\./g, "").replace(",", ".");
    } else if (valorLimpo.includes(",")) {
      valorLimpo = valorLimpo.replace(",", ".");
    } else if (/^\d{1,3}(\.\d{3})+$/.test(valorLimpo)) {
      valorLimpo = valorLimpo.replace(/\./g, "");
    }

    const numero = Number(valorLimpo);
    return Number.isFinite(numero) ? numero : null;
  }

  function obterEstadoDaVaga(vaga) {
    if (vaga.estado) {
      return String(vaga.estado).toUpperCase();
    }

    const localizacao = String(vaga.localizacao || "");
    const resultado =
      localizacao.match(/(?:-|\/|,)\s*([A-Za-z]{2})\s*$/);

    return resultado ? resultado[1].toUpperCase() : "";
  }

  function obterAreaDaVaga(vaga) {
    return (
      vaga.area ||
      vaga.categoria ||
      vaga.areaAtuacao ||
      vaga.setor ||
      ""
    );
  }

  function obterValoresMarcados(checkboxes) {
    return Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => normalizarTexto(checkbox.value));
  }

  function contratoCorresponde(
    contratoDaVaga,
    contratosSelecionados
  ) {
    if (contratosSelecionados.length === 0) {
      return true;
    }

    const contratoNormalizado =
      normalizarTexto(contratoDaVaga);

    return contratosSelecionados.some(
      (contratoSelecionado) => {
        if (contratoSelecionado === "efetivo") {
          return (
            contratoNormalizado === "efetivo" ||
            contratoNormalizado === "clt"
          );
        }

        return contratoNormalizado === contratoSelecionado;
      }
    );
  }

  function vagaCorrespondeAData(vaga, valorSelecionado) {
    if (!valorSelecionado) return true;

    const dataDaVaga =
      new Date(vaga.criadoEm || vaga.atualizadoEm);

    if (Number.isNaN(dataDaVaga.getTime())) {
      return true;
    }

    const diferencaEmDias =
      (Date.now() - dataDaVaga.getTime()) /
      (1000 * 60 * 60 * 24);

    const valor = normalizarTexto(valorSelecionado);

    if (
      valor === "hoje" ||
      valor === "today" ||
      valor === "1"
    ) {
      return diferencaEmDias <= 1;
    }

    const quantidadeDeDias = Number(valor);

    return Number.isFinite(quantidadeDeDias)
      ? diferencaEmDias <= quantidadeDeDias
      : true;
  }

  function vagaCorrespondeAoSalario(vaga) {
    const salarioDaVaga =
      obterSalarioNumerico(vaga.salarioValor ?? vaga.salario);

    if (salarioDaVaga === null) {
      return true;
    }

    return (
      salarioDaVaga >= salarioMinimoSelecionado &&
      salarioDaVaga <= salarioMaximoSelecionado
    );
  }

  function normalizarNumeroWhatsApp(numero) {
    let digitos = String(numero || "").replace(/\D/g, "");

    if (digitos.length === 10 || digitos.length === 11) {
      digitos = `55${digitos}`;
    }

    if (
      !digitos.startsWith("55") ||
      digitos.length < 12 ||
      digitos.length > 13
    ) {
      return "";
    }

    return digitos;
  }

  function criarCandidatura(vaga) {
    const titulo =
      String(vaga.titulo || "vaga").trim();

    const empresa =
      String(vaga.empresa || "empresa").trim();

    const codigoDaVaga =
      String(vaga.id || "sem-codigo").trim();

    const mensagem = encodeURIComponent(
      `Olá! Vi a vaga de ${titulo}, da ${empresa}, ` +
      `no site da Foz Talentos e gostaria de me candidatar. ` +
      `Código da vaga: ${codigoDaVaga}.`
    );

    const whatsappDaVaga =
      normalizarNumeroWhatsApp(vaga.whatsapp);

    const whatsappOficial =
      "5561981357318";

    const whatsapp =
      whatsappDaVaga || whatsappOficial;

    return {
      url: `https://wa.me/${whatsapp}?text=${mensagem}`,
      texto: "Candidatar-se pelo WhatsApp"
    };
  }

  function criarLista(itens) {
    if (!Array.isArray(itens) || itens.length === 0) {
      return "";
    }

    return itens
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
  }

  function criarTag(valor, classeExtra = "") {
    if (!valor) return "";

    return `
      <span class="job-tag ${classeExtra}">
        ${escapeHtml(valor)}
      </span>
    `;
  }

  function criarCardDaVaga(vaga) {
    const selecionado =
      String(vaga.id || "") ===
      String(vagaSelecionadaId || "");

    const tags = [
      criarTag(vaga.contrato),
      criarTag(vaga.modalidade),
      criarTag(vaga.salario, "job-salary")
    ].join("");

    return `
      <article
        class="public-job-card${selecionado ? " is-selected" : ""}"
        data-job-id="${escapeHtml(vaga.id || "")}"
        tabindex="0"
        role="button"
        aria-pressed="${selecionado}"
        aria-label="Ver detalhes da vaga ${escapeHtml(vaga.titulo || "")}"
      >
        <div class="public-job-card-content">
          <h2>${escapeHtml(vaga.titulo || "")}</h2>

          <p class="public-job-card-meta">
            <span>${escapeHtml(vaga.empresa || "")}</span>
            ${
              vaga.localizacao
                ? `<span aria-hidden="true">•</span>
                   <span>${escapeHtml(vaga.localizacao)}</span>`
                : ""
            }
          </p>

          ${
            tags
              ? `<div class="public-job-tags">${tags}</div>`
              : ""
          }
        </div>

        <span class="public-job-arrow" aria-hidden="true">›</span>
      </article>
    `;
  }

  function criarSecaoDetalhes(titulo, conteudo, aberta = false) {
    if (!conteudo) return "";

    return `
      <details class="job-details-accordion" ${aberta ? "open" : ""}>
        <summary>${escapeHtml(titulo)}</summary>
        <div class="job-details-accordion-content">
          ${conteudo}
        </div>
      </details>
    `;
  }

  function fecharDetalhes() {
    vagaSelecionadaId = null;
    jobDetailsPanel.hidden = true;
    jobDetailsPanel.innerHTML = "";
    jobsMainColumns.classList.add("details-closed");
    document.body.classList.remove("job-details-mobile-open");

    if (jobDetailsBackdrop) {
      jobDetailsBackdrop.hidden = true;
    }

    renderizarCards();
  }

  function exibirDetalhes(vaga) {
    if (!vaga) {
      fecharDetalhes();
      return;
    }

    vagaSelecionadaId = vaga.id;
    jobDetailsPanel.hidden = false;
    jobsMainColumns.classList.remove("details-closed");

    if (estaNoMobile()) {
      document.body.classList.add("job-details-mobile-open");

      if (jobDetailsBackdrop) {
        jobDetailsBackdrop.hidden = false;
      }
    }

    const candidatura = criarCandidatura(vaga);
    const requisitos = criarLista(vaga.requisitos);
    const beneficios = criarLista(vaga.beneficios);

    const data =
      formatarData(vaga.atualizadoEm || vaga.criadoEm);

    const codigoDaVaga =
      escapeHtml(vaga.id || "Sem código");

    const sobreVaga = `
      <p class="job-details-public-code">
        <strong>Código da vaga:</strong>
        ${codigoDaVaga}
      </p>

      ${
        vaga.descricao
          ? `<p>${escapeHtml(vaga.descricao)}</p>`
          : ""
      }
    `;

    const responsabilidades = criarLista(
      vaga.responsabilidades ||
      vaga.atribuicoes ||
      vaga.atividades ||
      []
    );

    jobDetailsPanel.innerHTML = `
      <div class="job-details-header">
        <div>
          <h2>${escapeHtml(vaga.titulo || "")}</h2>

          <p class="job-details-company">
            ${escapeHtml(vaga.empresa || "")}
          </p>

          <p class="job-details-meta">
            ${escapeHtml(vaga.localizacao || "")}

            ${
              vaga.modalidade
                ? ` <span>•</span> ${escapeHtml(vaga.modalidade)}`
                : ""
            }

            ${
              vaga.contrato
                ? ` <span>•</span> ${escapeHtml(vaga.contrato)}`
                : ""
            }
          </p>

          ${
            vaga.salario
              ? `
                <p class="job-details-salary">
                  Salário: ${escapeHtml(vaga.salario)}
                </p>
              `
              : ""
          }

          ${
            data
              ? `
                <p class="job-details-date">
                  Atualizada em ${escapeHtml(data)}
                </p>
              `
              : ""
          }
        </div>

        <button
          class="job-details-close"
          type="button"
          aria-label="Fechar detalhes da vaga"
          data-close-job-details
        >
          ×
        </button>
      </div>

      <div class="job-details-body">
        ${criarSecaoDetalhes("Sobre a vaga", sobreVaga, true)}

        ${
          responsabilidades
            ? criarSecaoDetalhes(
                "Responsabilidades",
                `<ul>${responsabilidades}</ul>`
              )
            : ""
        }

        ${
          requisitos
            ? criarSecaoDetalhes(
                "Requisitos",
                `<ul>${requisitos}</ul>`
              )
            : ""
        }

        ${
          beneficios
            ? criarSecaoDetalhes(
                "Benefícios",
                `<ul>${beneficios}</ul>`
              )
            : ""
        }
      </div>

      <div class="job-details-footer">
        ${
          candidatura
            ? `
              <a
                class="button button-primary job-details-apply"
                href="${escapeHtml(candidatura.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${escapeHtml(candidatura.texto)}
              </a>
            `
            : `
              <span class="public-job-no-contact">
                Contato para candidatura indisponível
              </span>
            `
        }
      </div>
    `;

    renderizarCards();
  }

  function atualizarEstadoDaLista(
    quantidade,
    existemVagasAtivas
  ) {
    if (jobsResultCount) {
      jobsResultCount.textContent =
        quantidade === 1
          ? "1 vaga encontrada"
          : `${quantidade} vagas encontradas`;
    }

    if (!publicEmptyState) return;

    const tituloVazio =
      publicEmptyState.querySelector("h2");

    const textoVazio =
      publicEmptyState.querySelector("p");

    if (quantidade > 0) {
      publicJobsList.hidden = false;
      publicEmptyState.hidden = true;
      return;
    }

    publicJobsList.hidden = true;
    publicEmptyState.hidden = false;
    fecharDetalhes();

    if (!existemVagasAtivas) {
      if (tituloVazio) {
        tituloVazio.textContent =
          "Nenhuma vaga disponível";
      }

      if (textoVazio) {
        textoVazio.textContent =
          "No momento, não há vagas publicadas.";
      }

      return;
    }

    if (tituloVazio) {
      tituloVazio.textContent =
        "Nenhuma vaga encontrada";
    }

    if (textoVazio) {
      textoVazio.textContent =
        "Tente alterar ou limpar os filtros selecionados.";
    }
  }

  function renderizarCards() {
    publicJobsList.innerHTML =
      vagasVisiveis.map(criarCardDaVaga).join("");
  }

  function aplicarFiltros() {
    const vagasAtivas =
      vagas.filter((vaga) => vaga.ativa === true);

    const termoPesquisado =
      normalizarTexto(searchInput?.value);

    const estadoSelecionado =
      String(stateFilter?.value || "")
        .trim()
        .toUpperCase();

    const areaSelecionada =
      normalizarTexto(areaFilter?.value);

    const modalidadesSelecionadas =
      obterValoresMarcados(modalidadeCheckboxes);

    const contratosSelecionados =
      obterValoresMarcados(contratoCheckboxes);

    const experienciasSelecionadas =
      obterValoresMarcados(experienciaCheckboxes);

    const dataSelecionada =
      Array.from(dateRadioButtons)
        .find((radioButton) => radioButton.checked)
        ?.value || "";

    vagasVisiveis =
      vagasAtivas.filter((vaga) => {
        const textoDaVaga =
          normalizarTexto(
            [
              vaga.titulo,
              vaga.empresa,
              vaga.localizacao,
              vaga.contrato,
              vaga.modalidade,
              vaga.experiencia,
              obterAreaDaVaga(vaga),
              vaga.descricao,
              ...(vaga.requisitos || []),
              ...(vaga.beneficios || [])
            ].join(" ")
          );

        const correspondeAPesquisa =
          !termoPesquisado ||
          textoDaVaga.includes(termoPesquisado);

        const correspondeAoEstado =
          !estadoSelecionado ||
          obterEstadoDaVaga(vaga) === estadoSelecionado;

        const correspondeAArea =
          !areaSelecionada ||
          normalizarTexto(obterAreaDaVaga(vaga)) ===
            areaSelecionada;

        const correspondeAModalidade =
          modalidadesSelecionadas.length === 0 ||
          modalidadesSelecionadas.includes(
            normalizarTexto(vaga.modalidade)
          );

        const correspondeAoContrato =
          contratoCorresponde(
            vaga.contrato,
            contratosSelecionados
          );

        const correspondeAExperiencia =
          experienciasSelecionadas.length === 0 ||
          experienciasSelecionadas.includes(
            normalizarTexto(vaga.experiencia)
          );

        return (
          correspondeAPesquisa &&
          correspondeAoEstado &&
          correspondeAArea &&
          correspondeAModalidade &&
          correspondeAoContrato &&
          correspondeAExperiencia &&
          vagaCorrespondeAData(vaga, dataSelecionada) &&
          vagaCorrespondeAoSalario(vaga)
        );
      });

    if (
      vagaSelecionadaId &&
      !vagasVisiveis.some(
        (vaga) =>
          String(vaga.id) === String(vagaSelecionadaId)
      )
    ) {
      fecharDetalhes();
    }

    renderizarCards();

    if (vagaSelecionadaId) {
      const vagaSelecionada =
        vagasVisiveis.find(
          (vaga) =>
            String(vaga.id) ===
            String(vagaSelecionadaId)
        );

      if (vagaSelecionada) {
        exibirDetalhes(vagaSelecionada);
      }
    }

    atualizarEstadoDaLista(
      vagasVisiveis.length,
      vagasAtivas.length > 0
    );
  }

  publicJobsList.addEventListener("click", (event) => {
    const card = event.target.closest(".public-job-card");

    if (!card) return;

    event.stopPropagation();

    const idDaVaga = String(card.dataset.jobId || "");

    if (
      String(vagaSelecionadaId || "") === idDaVaga
    ) {
      fecharDetalhes();
      return;
    }

    const vaga =
      vagasVisiveis.find(
        (item) =>
          String(item.id || "") === idDaVaga
      );

    if (vaga) {
      exibirDetalhes(vaga);
    }
  });

  publicJobsList.addEventListener("keydown", (event) => {
    const card = event.target.closest(".public-job-card");

    if (!card) return;

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    card.click();
  });

  jobDetailsPanel.addEventListener("click", (event) => {
    event.stopPropagation();

    if (event.target.closest("[data-close-job-details]")) {
      fecharDetalhes();
    }
  });

  jobDetailsBackdrop?.addEventListener("click", fecharDetalhes);

  document.addEventListener("click", (event) => {
    if (!vagaSelecionadaId) return;

    const clicouEmCard =
      event.target.closest(".public-job-card");

    const clicouNosDetalhes =
      event.target.closest("#jobDetailsPanel");

    if (clicouEmCard || clicouNosDetalhes) {
      return;
    }

    fecharDetalhes();
  });

  searchInput?.addEventListener("input", aplicarFiltros);
  stateFilter?.addEventListener("change", aplicarFiltros);
  areaFilter?.addEventListener("change", aplicarFiltros);

  modalidadeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", aplicarFiltros);
  });

  contratoCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", aplicarFiltros);
  });

  experienciaCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", aplicarFiltros);
  });

  dateRadioButtons.forEach((radioButton) => {
    radioButton.addEventListener("change", aplicarFiltros);
  });

  document.addEventListener(
    "salaryFilterChange",
    (event) => {
      salarioMinimoSelecionado =
        Number(
          event.detail?.minimum ??
          salaryMinFilter?.value ??
          0
        );

      salarioMaximoSelecionado =
        Number(
          event.detail?.maximum ??
          salaryMaxFilter?.value ??
          20000
        );

      aplicarFiltros();
    }
  );

  document.addEventListener("filtersCleared", aplicarFiltros);

  window.addEventListener("resize", () => {
    if (!estaNoMobile()) {
      document.body.classList.remove("job-details-mobile-open");

      if (jobDetailsBackdrop) {
        jobDetailsBackdrop.hidden = true;
      }
    }
  });

  jobsMainColumns.classList.add("details-closed");
  jobDetailsPanel.hidden = true;

  try {
    vagas = await VagasService.carregarVagas();
    console.log("Vagas carregadas da API:", vagas);
    aplicarFiltros();
  } catch (error) {
    console.error("Não foi possível carregar as vagas da API.", error);
    atualizarEstadoDaLista(0, false);
  }
});
