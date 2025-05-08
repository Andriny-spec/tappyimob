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
  nome: string;
  telefone: string;
  planoId: string;
  intervalo?: 'mensal' | 'anual';
};

/**
 * Busca os planos da plataforma tappyimob no site principal Tappy.id
 */
export async function buscarPlanos(): Promise<Plano[]> {
  try {
    // URL do site principal - usando o mesmo endpoint do TappyLink mas filtrando para tappyimob
    const url = 'https://tappy.id/api/planos/publico?plataforma=tappy-imob';
    
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
    
    // Filtrar apenas os planos da plataforma tappy-imob
    if (Array.isArray(data)) {
      return data.filter((plano: Plano) => plano.platformId === 'tappy-imob');
    } else if (data.planos && Array.isArray(data.planos)) {
      return data.planos.filter((plano: Plano) => plano.platformId === 'tappy-imob');
    }
    
    return [];
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
    // URL do site principal - mudando para o endpoint correto
    const url = 'https://tappy.id/api/assinatura/checkout/imob';
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: dados.email,
        name: dados.nome,
        phone: dados.telefone.replace(/\D/g, ''),
        planId: dados.planoId,
        interval: dados.intervalo === 'anual' ? 'yearly' : 'monthly',
        companyType: 'IMOBILIARIA',
        origin: 'tappyimob-site',
        platform: 'tappy-imob',
        redirectUrl: 'https://tappyimob.com.br/sucesso'
      }),
    });
    
    // Verificar se a resposta está OK antes de tentar analisar o JSON
    if (!res.ok) {
      let errorMsg = `Erro no servidor: ${res.status}`;
      
      try {
        // Tenta ler o erro como JSON apenas se a resposta não estiver vazia
        const errorData = await res.text();
        if (errorData) {
          const jsonError = JSON.parse(errorData);
          errorMsg = jsonError.error || jsonError.message || errorMsg;
        }
      } catch (jsonError) {
        // Ignora erro de parsing e usa a mensagem padrão
        console.error('Erro ao processar resposta de erro:', jsonError);
      }
      
      return {
        success: false,
        message: errorMsg,
      };
    }
    
    // Ler a resposta apenas quando sabemos que é válida
    let data;
    try {
      const responseText = await res.text();
      data = responseText ? JSON.parse(responseText) : {};
    } catch (jsonError) {
      console.error('Erro ao processar resposta JSON:', jsonError);
      return {
        success: false,
        message: 'Erro ao processar resposta do servidor',
      };
    }

    return {
      success: true,
      message: 'Imobiliária cadastrada com sucesso! Uma senha foi enviada para seu email.',
      kirvanoUrl: data.url || data.kirvanoUrl, // URL para pagamento
    };
  } catch (error) {
    console.error("Erro ao cadastrar imobiliária:", error);
    return {
      success: false,
      message: 'Erro de conexão ao tentar cadastrar. Por favor, tente novamente.',
    };
  }
}
