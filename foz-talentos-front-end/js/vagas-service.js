import api from "./api.js";

"use strict";

const WHATSAPP_OFICIAL = "5561981357318";

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

function mapearVaga(vaga) {
  const active = Boolean(vaga?.active);

  return {
    id: String(vaga?.id ?? ""),
    titulo: vaga?.title ?? "",
    empresa: vaga?.company ?? "",

    cidade: "",
    estado: vaga?.state ?? "",
    localizacao: vaga?.state ?? "",

    area: vaga?.category ?? "",
    categoria: vaga?.category ?? "",

    experiencia: mapearExperiencia(vaga?.level),
    contrato: vaga?.contractType ?? "",
    modalidade: mapearModalidade(vaga?.workMode),

    salario: vaga?.salary ?? "",
    salarioValor: Number(vaga?.salaryValue ?? 0),

    ativa: active,
    status: active ? "ativa" : "encerrada",

    descricao: vaga?.description ?? "",
    requisitos: transformarLista(vaga?.requirements),
    beneficios: transformarLista(vaga?.benefits),
    responsabilidades: [],

    telefone: vaga?.phone ?? "",
    whatsapp: vaga?.phone ?? WHATSAPP_OFICIAL,
    email: vaga?.email ?? "",

    criadoEm: vaga?.createdAt ?? "",
    atualizadoEm: vaga?.updatedAt ?? ""
  };
}

class VagasService {
  async carregarVagas() {
    try {
      const response = await api.get("/jobs");
      const content = response.data?.content ?? [];

      return content.map(mapearVaga);
    } catch (error) {
      console.error("Erro ao buscar vagas na API:", error);
      return [];
    }
  }
}

export default new VagasService();