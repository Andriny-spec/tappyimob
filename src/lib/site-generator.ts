import deepseekClient from './deepseek';
import { ImobiliariaSite, TipoPagina } from '@prisma/client';

/**
 * Interface para os dados da imobiliária usados na geração de conteúdo
 */
interface DadosImobiliaria {
  nome: string;
  descricao?: string;
  cidade?: string;
  estado?: string;
  nicho?: string; // Ex: "imóveis de luxo", "imóveis populares", etc.
  ano_fundacao?: string;
  diferenciais?: string[];
}

/**
 * Interface para configuração do gerador de conteúdo
 */
interface ConfiguracaoGerador {
  tom: 'formal' | 'amigavel' | 'profissional' | 'moderno';
  destaqueTipo?: 'venda' | 'aluguel' | 'ambos';
  palavrasChave?: string[];
}

/**
 * Tipo para as seções de conteúdo no formato JSON
 */
type ConteudoPagina = {
  secoes: {
    tipo: string;
    titulo?: string;
    subtitulo?: string;
    conteudo?: string;
    imagens?: string[];
    items?: {
      titulo: string;
      conteudo: string;
      icone?: string;
    }[];
    [key: string]: any;
  }[];
};

/**
 * Classe para gerar conteúdo para sites de imobiliárias usando IA
 */
export class SiteGenerator {
  /**
   * Gera conteúdo para uma página específica do site
   */
  static async gerarConteudoPagina(
    tipoPagina: TipoPagina,
    dadosImobiliaria: DadosImobiliaria,
    config: ConfiguracaoGerador
  ): Promise<ConteudoPagina> {
    // Base de prompt para diferentes tipos de página
    const promptBase = this.criarPromptBase(tipoPagina, dadosImobiliaria, config);
    
    try {
      const response = await deepseekClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em marketing e copywriting para imobiliárias. Gere conteúdo atraente, profissional e otimizado para SEO para sites de imobiliárias.'
          },
          {
            role: 'user',
            content: promptBase
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const conteudoGerado = response.choices[0]?.message.content;
      
      if (!conteudoGerado) {
        throw new Error('Não foi possível gerar conteúdo');
      }

      // Converter o conteúdo gerado em JSON
      try {
        const conteudoJson = JSON.parse(conteudoGerado) as ConteudoPagina;
        return conteudoJson;
      } catch (error) {
        console.error('Erro ao parsear JSON do conteúdo gerado:', error);
        throw new Error('Formato de resposta inválido da IA');
      }
      
    } catch (error) {
      console.error('Erro ao gerar conteúdo com DeepSeek:', error);
      throw error;
    }
  }

  /**
   * Cria um prompt específico baseado no tipo de página
   */
  private static criarPromptBase(
    tipoPagina: TipoPagina,
    dadosImobiliaria: DadosImobiliaria,
    config: ConfiguracaoGerador
  ): string {
    // Dados básicos da imobiliária formatados para o prompt
    const infosBasicas = `
      Nome da imobiliária: ${dadosImobiliaria.nome}
      ${dadosImobiliaria.descricao ? `Descrição: ${dadosImobiliaria.descricao}` : ''}
      ${dadosImobiliaria.cidade ? `Cidade: ${dadosImobiliaria.cidade}` : ''}
      ${dadosImobiliaria.estado ? `Estado: ${dadosImobiliaria.estado}` : ''}
      ${dadosImobiliaria.nicho ? `Especialidade: ${dadosImobiliaria.nicho}` : ''}
      ${dadosImobiliaria.ano_fundacao ? `Fundação: ${dadosImobiliaria.ano_fundacao}` : ''}
      ${dadosImobiliaria.diferenciais?.length ? `Diferenciais: ${dadosImobiliaria.diferenciais.join(', ')}` : ''}
    `;

    // Configuração do tom de voz
    const tomVoz = `Tom de voz: ${config.tom}`;
    
    // Construção do prompt baseado no tipo de página
    let promptEspecifico = '';
    
    switch (tipoPagina) {
      case TipoPagina.HOME:
        promptEspecifico = `
          Crie o conteúdo para a página inicial (HOME) de uma imobiliária. 
          Inclua as seguintes seções:
          1. Hero (banner principal): uma mensagem impactante e convidativa
          2. Sobre: uma breve introdução à imobiliária
          3. Serviços: principais serviços oferecidos (3 a 5 itens)
          4. Por que escolher: diferenciais da imobiliária (3 a 4 itens)
          5. CTA (Call-to-Action): incentivo para contato
          
          Responda em formato JSON seguindo esta estrutura:
          {
            "secoes": [
              {
                "tipo": "hero",
                "titulo": "Título principal atraente",
                "subtitulo": "Subtítulo explicativo",
                "cta": "Texto do botão"
              },
              {
                "tipo": "sobre",
                "titulo": "Sobre a [Nome da Imobiliária]",
                "conteudo": "Parágrafo sobre a empresa...",
                "destaque": "Frase em destaque"
              },
              {
                "tipo": "servicos",
                "titulo": "Nossos Serviços",
                "items": [
                  {
                    "titulo": "Título do serviço 1",
                    "conteudo": "Descrição do serviço 1",
                    "icone": "house" // nome de ícone sugerido
                  },
                  // mais serviços...
                ]
              },
              {
                "tipo": "diferenciais",
                "titulo": "Por que escolher a [Nome da Imobiliária]",
                "items": [
                  {
                    "titulo": "Diferencial 1",
                    "conteudo": "Descrição do diferencial 1",
                    "icone": "check"
                  },
                  // mais diferenciais...
                ]
              },
              {
                "tipo": "cta",
                "titulo": "Título chamativo",
                "conteudo": "Texto persuasivo para contato",
                "botao": "Texto do botão"
              }
            ]
          }
        `;
        break;
        
      case TipoPagina.SOBRE:
        promptEspecifico = `
          Crie o conteúdo para a página "Sobre Nós" de uma imobiliária.
          Inclua as seguintes seções:
          1. História: como e quando a empresa foi fundada
          2. Missão, Visão e Valores
          3. Equipe: descrição geral da equipe
          4. Diferenciais: o que torna a imobiliária única
          
          Responda em formato JSON seguindo esta estrutura:
          {
            "secoes": [
              {
                "tipo": "historia",
                "titulo": "Nossa História",
                "conteudo": "História detalhada da imobiliária..."
              },
              {
                "tipo": "missao-visao-valores",
                "items": [
                  {
                    "titulo": "Missão",
                    "conteudo": "Nossa missão é..."
                  },
                  {
                    "titulo": "Visão",
                    "conteudo": "Nossa visão de futuro..."
                  },
                  {
                    "titulo": "Valores",
                    "conteudo": "Nossos valores incluem..."
                  }
                ]
              },
              {
                "tipo": "equipe",
                "titulo": "Nossa Equipe",
                "conteudo": "Descrição da equipe..."
              },
              {
                "tipo": "diferenciais",
                "titulo": "Nossos Diferenciais",
                "items": [
                  {
                    "titulo": "Diferencial 1",
                    "conteudo": "Explicação do diferencial..."
                  },
                  // mais diferenciais...
                ]
              }
            ]
          }
        `;
        break;
        
      case TipoPagina.CONTATO:
        promptEspecifico = `
          Crie o conteúdo para a página de "Contato" de uma imobiliária.
          Inclua as seguintes seções:
          1. Introdução: texto convidativo para contato
          2. Informações de contato: sugestões de texto para telefone, email, etc.
          3. Horário de atendimento
          4. Texto para o formulário de contato
          
          Responda em formato JSON seguindo esta estrutura:
          {
            "secoes": [
              {
                "tipo": "introducao",
                "titulo": "Entre em Contato",
                "conteudo": "Texto convidativo para contato..."
              },
              {
                "tipo": "informacoes",
                "items": [
                  {
                    "titulo": "Telefone",
                    "conteudo": "Texto sobre atendimento telefônico",
                    "icone": "phone"
                  },
                  {
                    "titulo": "Email",
                    "conteudo": "Texto sobre contato por email",
                    "icone": "mail"
                  },
                  {
                    "titulo": "Endereço",
                    "conteudo": "Texto sobre visita ao escritório",
                    "icone": "map-pin"
                  }
                ]
              },
              {
                "tipo": "horarios",
                "titulo": "Horários de Atendimento",
                "items": [
                  {
                    "titulo": "Segunda a Sexta",
                    "conteudo": "8h às 18h"
                  },
                  {
                    "titulo": "Sábado",
                    "conteudo": "9h às 13h"
                  }
                ]
              },
              {
                "tipo": "formulario",
                "titulo": "Envie sua Mensagem",
                "conteudo": "Preencha o formulário abaixo e entraremos em contato o mais breve possível."
              }
            ]
          }
        `;
        break;
        
      case TipoPagina.FAQ:
        promptEspecifico = `
          Crie o conteúdo para a página de "Perguntas Frequentes" de uma imobiliária.
          Crie de 8 a 12 perguntas comuns que os clientes costumam fazer sobre serviços imobiliários, 
          com respostas claras e informativas.
          
          Responda em formato JSON seguindo esta estrutura:
          {
            "secoes": [
              {
                "tipo": "introducao",
                "titulo": "Perguntas Frequentes",
                "conteudo": "Texto introdutório sobre as FAQs..."
              },
              {
                "tipo": "faq-items",
                "items": [
                  {
                    "titulo": "Pergunta 1?",
                    "conteudo": "Resposta detalhada para a pergunta 1..."
                  },
                  {
                    "titulo": "Pergunta 2?",
                    "conteudo": "Resposta detalhada para a pergunta 2..."
                  }
                  // mais perguntas e respostas...
                ]
              },
              {
                "tipo": "cta",
                "titulo": "Não encontrou o que procurava?",
                "conteudo": "Entre em contato conosco para mais informações",
                "botao": "Fale Conosco"
              }
            ]
          }
        `;
        break;
        
      case TipoPagina.PRIVACIDADE:
        promptEspecifico = `
          Crie o conteúdo para a "Política de Privacidade" de uma imobiliária.
          Inclua seções sobre coleta de dados, uso de informações, cookies, direitos dos usuários e contato.
          
          Responda em formato JSON seguindo esta estrutura:
          {
            "secoes": [
              {
                "tipo": "introducao",
                "titulo": "Política de Privacidade",
                "conteudo": "Texto introdutório sobre a política de privacidade..."
              },
              {
                "tipo": "secao-legal",
                "items": [
                  {
                    "titulo": "1. Coleta de Informações",
                    "conteudo": "Texto detalhado sobre coleta de dados..."
                  },
                  {
                    "titulo": "2. Uso das Informações",
                    "conteudo": "Texto sobre como as informações são utilizadas..."
                  }
                  // mais seções...
                ]
              }
            ]
          }
        `;
        break;
        
      case TipoPagina.TERMOS:
        promptEspecifico = `
          Crie o conteúdo para os "Termos e Condições" de uma imobiliária.
          Inclua seções sobre uso do site, responsabilidades, direitos autorais e foro.
          
          Responda em formato JSON seguindo esta estrutura:
          {
            "secoes": [
              {
                "tipo": "introducao",
                "titulo": "Termos e Condições de Uso",
                "conteudo": "Texto introdutório sobre os termos..."
              },
              {
                "tipo": "secao-legal",
                "items": [
                  {
                    "titulo": "1. Aceitação dos Termos",
                    "conteudo": "Texto detalhado sobre aceitação..."
                  },
                  {
                    "titulo": "2. Uso do Site",
                    "conteudo": "Texto sobre regras de utilização..."
                  }
                  // mais seções...
                ]
              }
            ]
          }
        `;
        break;
        
      case TipoPagina.CUSTOM:
      default:
        promptEspecifico = `
          Crie o conteúdo para uma página personalizada para a imobiliária.
          Inclua um título atraente, introdução, 2-3 seções de conteúdo relevante 
          e uma conclusão com chamada para ação.
          
          Responda em formato JSON seguindo esta estrutura:
          {
            "secoes": [
              {
                "tipo": "cabecalho",
                "titulo": "Título da Página",
                "subtitulo": "Breve descrição do conteúdo"
              },
              {
                "tipo": "secao",
                "titulo": "Título da Seção 1",
                "conteudo": "Conteúdo detalhado da seção 1..."
              },
              {
                "tipo": "secao",
                "titulo": "Título da Seção 2",
                "conteudo": "Conteúdo detalhado da seção 2..."
              },
              {
                "tipo": "conclusao",
                "titulo": "Título Conclusivo",
                "conteudo": "Resumo final...",
                "botao": "Texto do CTA"
              }
            ]
          }
        `;
        break;
    }
    
    // Montagem do prompt final
    return `
      ${tomVoz}
      
      Informações da imobiliária:
      ${infosBasicas}
      
      ${promptEspecifico}
    `;
  }

  /**
   * Gera um subdomínio válido com base no nome da imobiliária
   */
  static gerarSubdominio(nomeImobiliaria: string): string {
    return nomeImobiliaria
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ''); // Remove espaços
  }

  /**
   * Gera uma sugestão de paleta de cores com base na descrição ou nicho da imobiliária
   */
  static async gerarPaletaCores(
    descricao: string,
    nicho?: string
  ): Promise<{ primaria: string; secundaria: string; acentuacao: string; texto: string }> {
    try {
      const prompt = `
        Gere uma paleta de cores para um site de imobiliária com as seguintes características:
        ${descricao}
        ${nicho ? `Nicho: ${nicho}` : ''}
        
        Retorne apenas um objeto JSON com exatamente 4 cores em formato hexadecimal:
        1. Cor primária (para elementos principais e identidade visual)
        2. Cor secundária (para fundos e elementos secundários)
        3. Cor de acentuação (para destaques e call-to-action)
        4. Cor de texto (para o texto principal do site)
        
        Formato desejado:
        {
          "primaria": "#HEXCODE",
          "secundaria": "#HEXCODE",
          "acentuacao": "#HEXCODE",
          "texto": "#HEXCODE"
        }
      `;

      const response = await deepseekClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em design e branding para sites imobiliários.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      const conteudoGerado = response.choices[0]?.message.content;
      
      if (!conteudoGerado) {
        throw new Error('Não foi possível gerar a paleta de cores');
      }

      return JSON.parse(conteudoGerado);
      
    } catch (error) {
      console.error('Erro ao gerar paleta de cores:', error);
      // Retorna cores padrão em caso de erro
      return {
        primaria: '#25D366',
        secundaria: '#F8FAFC',
        acentuacao: '#FFB800',
        texto: '#1A202C'
      };
    }
  }
}
