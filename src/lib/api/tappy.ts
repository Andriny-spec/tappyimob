'use server';

/**
 * Funções para interagir com a API do site principal Tappy.id
 */

export type Plano = {
  id: string;
  name: string;
  platformId: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  platform: {
    name: string;
    slug: string;
  };
};

export type CadastroAssinanteProps = {
  email: string;
  nome?: string;
  planoId: string;
};

/**
 * Busca os planos da plataforma tappyimob no site principal Tappy.id
 */
export async function buscarPlanos(): Promise<Plano[]> {
  try {
    // URL do site principal
    const url = 'https://tappy.id/api/planos/publico/tappyimob';
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Importante para sempre buscar dados frescos
    });

    if (!res.ok) {
      throw new Error(`Erro ao buscar planos: ${res.status}`);
    }

    const data = await res.json();
    return data.planos || [];
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    // Retornar array vazio em caso de erro
    return [];
  }
}

/**
 * Cadastra um novo assinante no site principal Tappy.id
 * Essa função cria um usuário e envia a senha por email
 */
export async function cadastrarAssinante(dados: CadastroAssinanteProps): Promise<{ 
  success: boolean; 
  message: string; 
  kirvanoUrl?: string;
}> {
  try {
    // URL do site principal
    const url = 'https://tappy.id/api/assinantes/cadastro-externo';
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...dados,
        origem: 'tappyimob',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.error || 'Erro ao cadastrar assinante',
      };
    }

    return {
      success: true,
      message: 'Assinante cadastrado com sucesso! Uma senha foi enviada para seu email.',
      kirvanoUrl: data.kirvanoUrl, // URL para pagamento na Kirvano
    };
  } catch (error) {
    console.error("Erro ao cadastrar assinante:", error);
    return {
      success: false,
      message: 'Erro de conexão ao tentar cadastrar. Por favor, tente novamente.',
    };
  }
}
