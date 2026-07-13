(function () {
  "use strict";

  const STORAGE_KEY = "fozTalentosVagas";

  const vagasIniciais = [
    {
      id: "vaga-1",
      titulo: "Assistente Administrativo",
      empresa: "Foz Talentos",
      localizacao: "Foz do Iguaçu - PR",
      contrato: "CLT",
      modalidade: "Presencial",
      salario: "A combinar",
      descricao: "Apoio às rotinas administrativas, atendimento e organização de documentos.",
      requisitos: ["Ensino médio completo", "Conhecimento básico em informática", "Boa comunicação"],
      beneficios: ["Vale-transporte", "Vale-alimentação"],
      whatsapp: "5545999999999",
      email: "vagas@foztalentos.com.br",
      status: "ativa",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    },
    {
      id: "vaga-2",
      titulo: "Analista de Recursos Humanos",
      empresa: "Empresa Parceira",
      localizacao: "Foz do Iguaçu - PR",
      contrato: "CLT",
      modalidade: "Híbrido",
      salario: "R$ 3.500,00",
      descricao: "Atuação em recrutamento e seleção, integração e apoio aos processos de desenvolvimento humano.",
      requisitos: ["Graduação em RH, Psicologia ou áreas afins", "Experiência com recrutamento e seleção"],
      beneficios: ["Plano de saúde", "Vale-refeição", "Auxílio educação"],
      whatsapp: "5545999999999",
      email: "vagas@foztalentos.com.br",
      status: "ativa",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }
  ];

  function ler() {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (!salvo) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vagasIniciais));
        return [...vagasIniciais];
      }
      const dados = JSON.parse(salvo);
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.error("Erro ao ler vagas:", erro);
      return [];
    }
  }

  function salvar(vagas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vagas));
  }

  function gerarId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `vaga-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  window.VagasService = {
    listar() {
      return ler().sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm));
    },
    buscarPorId(id) {
      return ler().find(vaga => vaga.id === id) || null;
    },
    criar(dados) {
      const agora = new Date().toISOString();
      const novaVaga = { ...dados, id: gerarId(), criadoEm: agora, atualizadoEm: agora };
      const vagas = ler();
      vagas.push(novaVaga);
      salvar(vagas);
      return novaVaga;
    },
    atualizar(id, dados) {
      const vagas = ler();
      const indice = vagas.findIndex(vaga => vaga.id === id);
      if (indice < 0) throw new Error("Vaga não encontrada.");
      vagas[indice] = { ...vagas[indice], ...dados, id, atualizadoEm: new Date().toISOString() };
      salvar(vagas);
      return vagas[indice];
    },
    excluir(id) {
      const vagas = ler();
      const novasVagas = vagas.filter(vaga => vaga.id !== id);
      if (novasVagas.length === vagas.length) return false;
      salvar(novasVagas);
      return true;
    }
  };
})();
