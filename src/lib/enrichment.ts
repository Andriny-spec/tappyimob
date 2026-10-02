// Integração com APIs de Enriquecimento de Dados
// PH3A e Seekloc

export interface EnrichmentResult {
  provider: "PH3A" | "SEEKLOC";
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  data: any;
  error?: string;
}

// Configurar credenciais no .env:
// PH3A_API_KEY=sua_chave
// PH3A_API_URL=https://api.ph3a.com.br
// SEEKLOC_API_KEY=sua_chave
// SEEKLOC_API_URL=https://api.seekloc.com.br

export async function enrichWithPH3A(
  cpf?: string,
  phone?: string,
  email?: string
): Promise<EnrichmentResult> {
  try {
    const apiKey = process.env.PH3A_API_KEY;
    const apiUrl = process.env.PH3A_API_URL || "https://api.ph3a.com.br";

    if (!apiKey) {
      return {
        provider: "PH3A",
        status: "FAILED",
        data: null,
        error: "PH3A_API_KEY não configurada",
      };
    }

    // Construir query de busca
    const searchParams = new URLSearchParams();
    if (cpf) searchParams.append("cpf", cpf.replace(/\D/g, ""));
    if (phone) searchParams.append("telefone", phone.replace(/\D/g, ""));
    if (email) searchParams.append("email", email);

    const response = await fetch(`${apiUrl}/v1/pessoa?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        provider: "PH3A",
        status: "FAILED",
        data: null,
        error: `Erro HTTP: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      provider: "PH3A",
      status: "SUCCESS",
      data: {
        nome: data.nome,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        idade: data.idade,
        sexo: data.sexo,
        email: data.email,
        telefones: data.telefones,
        endereco: data.endereco,
        rendaEstimada: data.rendaEstimada,
        scoreCredito: data.scoreCredito,
        ocupacao: data.ocupacao,
        empresas: data.empresas,
        veiculos: data.veiculos,
        imoveis: data.imoveis,
        processos: data.processos,
        negativacoes: data.negativacoes,
      },
    };
  } catch (error: any) {
    return {
      provider: "PH3A",
      status: "FAILED",
      data: null,
      error: error.message,
    };
  }
}

export async function enrichWithSeekloc(
  cpf?: string,
  phone?: string,
  email?: string
): Promise<EnrichmentResult> {
  try {
    const apiKey = process.env.SEEKLOC_API_KEY;
    const apiUrl = process.env.SEEKLOC_API_URL || "https://api.seekloc.com.br";

    if (!apiKey) {
      return {
        provider: "SEEKLOC",
        status: "FAILED",
        data: null,
        error: "SEEKLOC_API_KEY não configurada",
      };
    }

    // Construir body de busca
    const body: any = {};
    if (cpf) body.cpf = cpf.replace(/\D/g, "");
    if (phone) body.telefone = phone.replace(/\D/g, "");
    if (email) body.email = email;

    const response = await fetch(`${apiUrl}/consulta/pessoa`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        provider: "SEEKLOC",
        status: "FAILED",
        data: null,
        error: `Erro HTTP: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      provider: "SEEKLOC",
      status: "SUCCESS",
      data: {
        nome: data.nome_completo,
        cpf: data.cpf,
        dataNascimento: data.data_nascimento,
        sexo: data.sexo,
        email: data.emails,
        telefones: data.telefones,
        endereco: data.enderecos,
        rendaEstimada: data.renda_presumida,
        profissao: data.profissao,
        escolaridade: data.escolaridade,
        estadoCivil: data.estado_civil,
        parentes: data.parentes,
        socios: data.socios,
        participacoes: data.participacoes_empresariais,
      },
    };
  } catch (error: any) {
    return {
      provider: "SEEKLOC",
      status: "FAILED",
      data: null,
      error: error.message,
    };
  }
}

// Função para enriquecer lead com múltiplos provedores
export async function enrichLead(
  cpf?: string,
  phone?: string,
  email?: string
): Promise<{ ph3a: EnrichmentResult; seekloc: EnrichmentResult }> {
  const [ph3a, seekloc] = await Promise.all([
    enrichWithPH3A(cpf, phone, email),
    enrichWithSeekloc(cpf, phone, email),
  ]);

  return { ph3a, seekloc };
}

// Formatar dados de enriquecimento para exibição
export function formatEnrichmentData(data: any) {
  if (!data) return null;

  return {
    // Dados pessoais
    nome: data.nome,
    cpf: data.cpf,
    dataNascimento: data.dataNascimento,
    idade: data.idade,
    sexo: data.sexo === "M" ? "Masculino" : data.sexo === "F" ? "Feminino" : data.sexo,

    // Contato
    emails: Array.isArray(data.email) ? data.email : data.email ? [data.email] : [],
    telefones: data.telefones || [],

    // Endereço
    endereco: data.endereco,

    // Financeiro
    rendaEstimada: data.rendaEstimada,
    scoreCredito: data.scoreCredito,

    // Profissional
    ocupacao: data.ocupacao || data.profissao,
    escolaridade: data.escolaridade,

    // Empresas
    empresas: data.empresas || data.participacoes || [],

    // Patrimônio
    veiculos: data.veiculos || [],
    imoveis: data.imoveis || [],

    // Jurídico
    processos: data.processos || [],
    negativacoes: data.negativacoes || [],

    // Família
    estadoCivil: data.estadoCivil,
    parentes: data.parentes || [],
  };
}
