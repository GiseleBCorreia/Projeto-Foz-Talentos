import api from "./api.js";

"use strict";

const WHATSAPP_OFICIAL = "5561981357318";
let vagasCache = [];

function transformarLista(valor) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor.filter(Boolean).map(String);

  return String(valor)
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapearExperiencia(level) {
  const niveis = {
    YOUNG_APPRENTICE: "Jovem Aprendiz",
    INTERNSHIP: "Estágio",
    TRAINEE: "Trainee",
    JUNIOR: "Júnior",
    MID_LEVEL: "Pleno",
    SENIOR: "Sênior",
    SPECIALIST: "Especialista",
    COORDINATOR: "Coordenador",
    MANAGER: "Gerente",
    DIRECTOR: "Diretor"
  };
  return niveis[level] ?? level ?? "";
}

function mapearModalidade(workMode) {
  const modalidades = {
    ONSITE: "Presencial",
    HYBRID: "Híbrido",
    REMOTE: "Remoto"
  };
  return modalidades[workMode] ?? workMode ?? "";
}

// TODO: confirme com o backend os valores exatos do enum de contractType.
// Deixei CLT/PJ iguais (já batem) e mapeei os demais seguindo o mesmo
// padrão usado no enum de "level" (INTERNSHIP, etc.).
function mapearContrato(contractType) {
  const contratos = {
    CLT: "CLT",
    PJ: "PJ",
    INTERNSHIP: "Estágio",
    TEMPORARY: "Temporário",
    FREELANCER: "Freelancer"
  };
  return contratos[contractType] ?? contractType ?? "";
}

const CONTRATO_PARA_API = {
  CLT: "CLT",
  PJ: "PJ",
  "Estágio": "INTERNSHIP",
  "Temporário": "TEMPORARY",
  Freelancer: "FREELANCER"
};

// Extrai um número de uma string de salário livre (ex.: "R$ 2.500,00" -> 2500).
// Se não conseguir extrair (ex.: "A Combinar"), retorna 0.
function extrairValorSalario(salario = "") {
  const match = String(salario).match(/[\d.,]+/);
  if (!match) return 0;

  const numero = Number(match[0].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(numero) ? numero : 0;
}

function mapearVaga(vaga) {
  const active = Boolean(vaga?.active);

  return {
    id: String(vaga?.id ?? ""),
    titulo: vaga?.title ?? "",
    empresa: vaga?.company ?? "",
    cidade: vaga?.city ?? "",
    estado: vaga?.state ?? "",
    localizacao: vaga?.city ? `${vaga.city} - ${vaga.state ?? ""}`.trim() : "",
    area: vaga?.category?.name ?? vaga?.category ?? "",
    categoriaId: vaga?.categoryId ?? vaga?.category?.id ?? null,
    experiencia: mapearExperiencia(vaga?.level),
    contrato: mapearContrato(vaga?.contractType),
    modalidade: mapearModalidade(vaga?.workMode),
    salario: vaga?.salary ?? "",
    salarioValor: Number(vaga?.salaryValue ?? 0),
    ativa: active,
    status: active ? "ativa" : "inativa",
    descricao: vaga?.description ?? "",
    requisitos: transformarLista(vaga?.requirements),
    beneficios: transformarLista(vaga?.benefits),
    telefone: vaga?.phone ?? "",
    whatsapp: vaga?.phone ?? WHATSAPP_OFICIAL,
    email: vaga?.email ?? "",
    criadoEm: vaga?.createdAt ?? "",
    atualizadoEm: vaga?.updatedAt ?? ""
  };
}

// Cache de categorias (nome -> id), usado para converter o campo "area"
// (texto do select) no "categoryId" (number) que a API espera.
// ATENÇÃO: assume que existe um endpoint GET /categories retornando algo como
// [{ id, name }, ...] ou { content: [{ id, name }, ...] }. Se o endpoint real
// tiver outro caminho/formato, ajuste apenas esta função.
let categoriasCache = null;

async function carregarMapaCategorias() {
  if (categoriasCache) {
    return categoriasCache;
  }

  try {
    const response = await api.get("/categories", {
      headers: headersAutenticacao()
    });
    const lista = response.data?.content ?? response.data ?? [];

    categoriasCache = lista.reduce((mapa, categoria) => {
      const nome = categoria?.name ?? categoria?.nome;
      if (nome) {
        mapa[nome] = categoria.id;
      }
      return mapa;
    }, {});
  } catch (error) {
    console.error("Erro ao buscar categorias na API:", error);
    categoriasCache = {};
  }

  return categoriasCache;
}

function headersAutenticacao() {
  const token =
    sessionStorage.getItem("fozAdminToken") ||
    localStorage.getItem("fozAdminToken");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function converterDadosParaApi(dados) {
  const modalidade = {
    Presencial: "ONSITE",
    Híbrido: "HYBRID",
    Remoto: "REMOTE"
  };

  const nivel = {
    "Jovem Aprendiz": "YOUNG_APPRENTICE",
    "Estágio": "INTERNSHIP",
    "Trainee": "TRAINEE",
    "Júnior": "JUNIOR",
    "Pleno": "MID_LEVEL",
    "Sênior": "SENIOR",
    "Especialista": "SPECIALIST"
  };

  const mapaCategorias = await carregarMapaCategorias();
  const categoryId = mapaCategorias[dados.area];

  if (categoryId === undefined) {
    const erro = new Error(
      `Categoria "${dados.area}" não foi encontrada na API. Verifique o cadastro de categorias.`
    );
    erro.response = { data: { message: erro.message } };
    throw erro;
  }

  return {
    title: dados.titulo,
    company: dados.empresa,
    state: dados.estado,
    contractType: CONTRATO_PARA_API[dados.contrato] || dados.contrato,
    level: nivel[dados.experiencia] || dados.experiencia,
    workMode: modalidade[dados.modalidade] || dados.modalidade,
    salary: dados.salario,
    salaryValue: extrairValorSalario(dados.salario),
    active: dados.status === "ativa",
    description: dados.descricao,
    requirements: Array.isArray(dados.requisitos) ? dados.requisitos.join("\n") : dados.requisitos,
    benefits: Array.isArray(dados.beneficios) ? dados.beneficios.join("\n") : dados.beneficios,
    phone: dados.whatsapp,
    email: dados.email,
    categoryId
  };
}

class VagasService {
  async carregarVagas() {
    try {
      const response = await api.get("/jobs");
      const content = response.data?.content ?? [];
      vagasCache = content.map(mapearVaga);
      return vagasCache;
    } catch (error) {
      console.error("Erro ao buscar vagas na API:", error);
      throw error;
    }
  }

  listar() {
    return vagasCache;
  }

  buscarPorId(id) {
    return vagasCache.find((vaga) => String(vaga.id) === String(id));
  }

  async criar(dados) {
    const payload = await converterDadosParaApi(dados);

    await api.post("/jobs", payload, {
      headers: headersAutenticacao()
    });
    await this.carregarVagas();
  }

  async atualizar(id, dados) {
    const payload = await converterDadosParaApi(dados);

    await api.put(`/jobs/${id}`, payload, {
      headers: headersAutenticacao()
    });
    await this.carregarVagas();
  }

  // Antes chamava DELETE /jobs/{id}. O botão da UI ainda diz "Excluir",
  // mas agora só desativa a vaga (PATCH /jobs/{id}/deactivate), sem
  // removê-la de fato.
  async desativar(id) {
    await api.patch(`/jobs/${id}/deactivate`, null, {
      headers: headersAutenticacao()
    });
    await this.carregarVagas();
  }
}

export default new VagasService();
