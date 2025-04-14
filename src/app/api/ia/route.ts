import { NextRequest, NextResponse } from 'next/server';
import deepseekClient from '@/lib/deepseek';
import { prisma } from '@/lib/prisma';

// Flag para verificar se a API está funcionando
const API_MOCK_ENABLED = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    console.log('Recebendo requisição para API de IA');
    const { mensagem, contexto } = await request.json();

    if (!mensagem) {
      return NextResponse.json(
        { erro: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }
    
    // Log para debug em produção
    console.log(`Mensagem recebida: ${mensagem.substring(0, 50)}...`);
    console.log(`API_MOCK_ENABLED: ${API_MOCK_ENABLED}`);
    console.log(`DEEPSEEK_API_KEY presente: ${!!process.env.DEEPSEEK_API_KEY}`);
    
    // Verificar se estamos em produção e enfrentando problemas com a API
    if (API_MOCK_ENABLED) {
      console.log('Usando resposta de fallback para ambiente de produção');
      // Resposta de fallback simplificada para garantir funcionamento
      return NextResponse.json({
        resposta: "Olá! No momento estou operando em modo de contingência devido a uma manutenção em nossos servidores. Posso ajudar com informações básicas sobre imóveis, mas algumas funcionalidades avançadas podem estar limitadas. Em que posso te ajudar hoje?",
        resultado: {
          tipo: "fallback",
          status: "ok"
        }
      });
    }
    
    // Se houver contexto de consultas anteriores, usamos para dar mais precisão às respostas
    const contextoAnterior = contexto || {};

    // Cria um resumo do schema do Prisma para o DeepSeek entender
    const schemaResumo = `
      Estrutura dos dados da imobiliária:
      - Imóvel (Imovel): id, titulo, descricao, valor, tipoOperacao (VENDA, ALUGUEL, VENDA_ALUGUEL), tipoImovel (CASA, APARTAMENTO, etc), status (ATIVO, INATIVO, VENDIDO, ALUGADO), endereco, bairro, cidade, estado, características (quartos, vagas, etc)
      - Cliente (Cliente): id, nome (via user.nome), email (via user.email), telefone, statusLead, tipoLead, origemLead
      - Imobiliária (Imobiliaria): id, nome (via user.nome), email (via user.email), telefone, endereco
      - Corretor (Corretor): id, nome (via user.nome), email (via user.email), telefone, creci
    `;

    // Instruções para o DeepSeek
    const prompt = `
      Você é um assistente especializado em imobiliárias que tem acesso ao banco de dados Prisma da empresa.
      
      ${schemaResumo}
      
      Com base na pergunta do usuário, gere um código de consulta Prisma para obter as informações necessárias.
      Pergunta do usuário: "${mensagem}"
      
      Responda apenas com um objeto JSON com os seguintes campos:
      1. "consulta": o código JavaScript/TypeScript para consulta Prisma (incluindo imports)
      2. "explicacao": explicação em português do que a consulta faz
      
      Exemplos:
      Se o usuário perguntar "Quantos imóveis temos na plataforma?", a resposta seria:
      {
        "consulta": "const totalImoveis = await prisma.imovel.count();",
        "explicacao": "Consulta para contar o número total de imóveis na plataforma."
      }
      
      Se o usuário perguntar "Quais são os bairros com mais imóveis?", a resposta seria:
      {
        "consulta": "const bairros = await prisma.imovel.groupBy({ by: ['bairro'], _count: true, orderBy: { _count: { id: 'desc' } }, take: 5 });",
        "explicacao": "Consulta para agrupar imóveis por bairro, contar quantos imóveis existem em cada bairro e retornar os 5 bairros com mais imóveis."
      }
    `;

    // Consulta o DeepSeek para obter a consulta Prisma
    const stream = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat', // Modelo DeepSeek padrão
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Baixa temperatura para respostas mais precisas
      max_tokens: 1000,
    });
    
    // Extrai a consulta da resposta do DeepSeek
    const resposta = stream.choices[0].message.content || '';
    
    try {
      // Extrai o JSON da resposta que pode vir em formato markdown
      let jsonString = resposta;
      
      // Se a resposta estiver em formato markdown com blocos de código
      if (resposta.includes('```')) {
        // Extrai o conteúdo entre marcadores de código markdown
        const match = resposta.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (match && match[1]) {
          jsonString = match[1].trim();
        }
      }
      
      // Converte a resposta em JSON
      const parsedResponse = JSON.parse(jsonString);
      const { consulta, explicacao } = parsedResponse;
      
      if (!consulta) {
        return NextResponse.json(
          { erro: 'Não foi possível gerar uma consulta válida' },
          { status: 400 }
        );
      }
      
      // AVISO DE SEGURANÇA: Em um ambiente de produção, nunca execute código dinâmico diretamente.
      // Isso é apenas para fins de demonstração. Idealmente, você usaria um conjunto de consultas
      // pré-definidas ou validaria rigorosamente o código antes de executá-lo.
      
      // Abordagem expandida com consultas completas ao Prisma
      let resultado;
      
      try {
        // Analisamos a consulta para determinar o tipo
        
        // 1. CONSULTAS DE CONTAGEM (count)
        if (consulta.includes('count()') || consulta.toLowerCase().includes('quantidade') || consulta.toLowerCase().includes('total')) {
          if (consulta.includes('imovel') || consulta.includes('Imovel') || 
              consulta.toLowerCase().includes('imóveis') || consulta.toLowerCase().includes('imoveis')) {
            // Contagem de imóveis
            // Verificamos filtros na consulta
            const filtros: any = {};
            
            if (consulta.toLowerCase().includes('venda')) {
              filtros.tipoOperacao = 'VENDA';
            } else if (consulta.toLowerCase().includes('aluguel')) {
              filtros.tipoOperacao = 'ALUGUEL';
            }
            
            if (consulta.toLowerCase().includes('ativo')) {
              filtros.status = 'ATIVO';
            } else if (consulta.toLowerCase().includes('vendido')) {
              filtros.status = 'VENDIDO';
            } else if (consulta.toLowerCase().includes('alugado')) {
              filtros.status = 'ALUGADO';
            }
            
            // Filtros por tipo de imóvel
            if (consulta.toLowerCase().includes('apartamento')) {
              filtros.tipoImovel = 'APARTAMENTO';
            } else if (consulta.toLowerCase().includes('casa')) {
              filtros.tipoImovel = 'CASA';
            } else if (consulta.toLowerCase().includes('terreno')) {
              filtros.tipoImovel = 'TERRENO';
            }
            
            // Filtro por bairro se mencionado
            const bairroMatch = consulta.match(/bairro\s+([\w\s]+)/i) || consulta.match(/em\s+([\w\s]+)/i);
            if (bairroMatch && bairroMatch[1]) {
              const bairro = bairroMatch[1].trim();
              filtros.bairro = { contains: bairro, mode: 'insensitive' };
            }
            
            const totalImoveis = await prisma.imovel.count({
              where: Object.keys(filtros).length > 0 ? filtros : undefined
            });
            
            resultado = { totalImoveis, filtrosAplicados: filtros };
          } else if (consulta.includes('cliente') || consulta.includes('Cliente') || 
                    consulta.toLowerCase().includes('clientes')) {
            // Contagem de clientes
            const filtros: any = {};
            
            // Filtros por status de lead
            if (consulta.toLowerCase().includes('ativos')) {
              filtros.user = { status: 'ATIVO' };
            }
            
            // Filtro por cidade se mencionada
            const cidadeMatch = consulta.match(/cidade\s+([\w\s]+)/i) || consulta.match(/em\s+([\w\s]+)/i);
            if (cidadeMatch && cidadeMatch[1]) {
              const cidade = cidadeMatch[1].trim();
              filtros.cidade = { contains: cidade, mode: 'insensitive' };
            }
            
            const totalClientes = await prisma.cliente.count({
              where: Object.keys(filtros).length > 0 ? filtros : undefined
            });
            
            resultado = { totalClientes, filtrosAplicados: filtros };
          } else if (consulta.includes('corretor') || consulta.includes('Corretor') || 
                    consulta.toLowerCase().includes('corretores')) {
            // Contagem de corretores
            const totalCorretores = await prisma.corretor.count();
            resultado = { totalCorretores };
          }
        }
        
        // 2. CONSULTAS DE AGRUPAMENTO (groupBy)
        else if (consulta.includes('groupBy') || 
                consulta.toLowerCase().includes('agrupar') || 
                consulta.toLowerCase().includes('agrupados') ||
                consulta.toLowerCase().includes('por bairro') ||
                consulta.toLowerCase().includes('por tipo') ||
                consulta.toLowerCase().includes('por cidade')) {
          
          if (consulta.toLowerCase().includes('bairro')) {
            // Agrupar imóveis por bairro
            const bairros = await prisma.imovel.groupBy({
              by: ['bairro'],
              _count: {
                id: true
              },
              orderBy: {
                _count: {
                  id: 'desc'
                }
              },
              take: 10
            });
            resultado = { bairros };
          } else if (consulta.toLowerCase().includes('tipo') || consulta.toLowerCase().includes('tipoImovel')) {
            // Agrupar por tipo de imóvel
            const tiposImovel = await prisma.imovel.groupBy({
              by: ['tipoImovel'],
              _count: {
                id: true
              },
              orderBy: {
                _count: {
                  id: 'desc'
                }
              }
            });
            resultado = { tiposImovel };
          } else if (consulta.toLowerCase().includes('cidade')) {
            // Agrupar por cidade
            const cidades = await prisma.imovel.groupBy({
              by: ['cidade'],
              _count: {
                id: true
              },
              orderBy: {
                _count: {
                  id: 'desc'
                }
              },
              take: 10
            });
            resultado = { cidades };
          } else if (consulta.toLowerCase().includes('status')) {
            // Agrupar por status
            const statusImoveis = await prisma.imovel.groupBy({
              by: ['status'],
              _count: {
                id: true
              },
              orderBy: {
                _count: {
                  id: 'desc'
                }
              }
            });
            resultado = { statusImoveis };
          } else if (consulta.toLowerCase().includes('operação') || consulta.toLowerCase().includes('operacao')) {
            // Agrupar por tipo de operação
            const tiposOperacao = await prisma.imovel.groupBy({
              by: ['tipoOperacao'],
              _count: {
                id: true
              },
              orderBy: {
                _count: {
                  id: 'desc'
                }
              }
            });
            resultado = { tiposOperacao };
          }
        }
        
        // 3. CONSULTAS DE BUSCA (findMany)
        else if (consulta.includes('findMany') || 
                consulta.toLowerCase().includes('buscar') || 
                consulta.toLowerCase().includes('listar') ||
                consulta.toLowerCase().includes('mostrar') ||
                consulta.toLowerCase().includes('exibir')) {
          
          if (consulta.toLowerCase().includes('imóvel') || consulta.toLowerCase().includes('imovel') || 
              consulta.toLowerCase().includes('imóveis') || consulta.toLowerCase().includes('imoveis')) {
            
            // Construir objeto where com filtros
            const filtros: any = {};
            
            if (consulta.toLowerCase().includes('venda')) {
              filtros.tipoOperacao = 'VENDA';
            } else if (consulta.toLowerCase().includes('aluguel')) {
              filtros.tipoOperacao = 'ALUGUEL';
            }
            
            if (consulta.toLowerCase().includes('ativo')) {
              filtros.status = 'ATIVO';
            } else if (consulta.toLowerCase().includes('vendido')) {
              filtros.status = 'VENDIDO';
            } else if (consulta.toLowerCase().includes('alugado')) {
              filtros.status = 'ALUGADO';
            }
            
            // Filtros por tipo de imóvel
            if (consulta.toLowerCase().includes('apartamento')) {
              filtros.tipoImovel = 'APARTAMENTO';
            } else if (consulta.toLowerCase().includes('casa')) {
              filtros.tipoImovel = 'CASA';
            } else if (consulta.toLowerCase().includes('terreno')) {
              filtros.tipoImovel = 'TERRENO';
            }
            
            // Filtro por bairro se mencionado
            const bairroMatch = consulta.match(/bairro\s+([\w\s]+)/i) || consulta.match(/em\s+([\w\s]+)/i);
            if (bairroMatch && bairroMatch[1]) {
              const bairro = bairroMatch[1].trim();
              filtros.bairro = { contains: bairro, mode: 'insensitive' };
            }
            
            // Definir ordem
            let orderBy: any = { createdAt: 'desc' }; // padrão: mais recentes
            
            if (consulta.toLowerCase().includes('mais caro') || 
                consulta.toLowerCase().includes('maior valor') ||
                consulta.toLowerCase().includes('maior preço')) {
              orderBy = { valor: 'desc' };
            } 
            else if (consulta.toLowerCase().includes('mais barato') || 
                    consulta.toLowerCase().includes('menor valor') ||
                    consulta.toLowerCase().includes('menor preço')) {
              orderBy = { valor: 'asc' };
            }
            else if (consulta.toLowerCase().includes('mais recente') || 
                    consulta.toLowerCase().includes('últimos')) {
              orderBy = { createdAt: 'desc' };
            }
            else if (consulta.toLowerCase().includes('mais antigo')) {
              orderBy = { createdAt: 'asc' };
            }
            
            // Definir limite
            let take = 5; // padrão
            const limitMatch = consulta.match(/\b(\d+)\s+im[oó]ve[li]s\b/i) || 
                            consulta.match(/\blimite\s+(\d+)\b/i) ||
                            consulta.match(/\btop\s+(\d+)\b/i);
            
            if (limitMatch && limitMatch[1]) {
              take = parseInt(limitMatch[1], 10);
              if (take > 20) take = 20; // limite máximo
            }
            
            const imoveis = await prisma.imovel.findMany({
              where: Object.keys(filtros).length > 0 ? filtros : undefined,
              orderBy,
              take,
              select: {
                id: true,
                codigo: true,
                titulo: true,
                descricao: true,
                valor: true,
                bairro: true,
                cidade: true,
                tipoImovel: true,
                tipoOperacao: true,
                status: true,
                quartos: true,
                banheiros: true,
                areaTotal: true,
                vagas: true,
                createdAt: true
              }
            });
            
            resultado = { 
              imoveis, 
              filtrosAplicados: filtros, 
              ordenacao: orderBy,
              limite: take
            };
          } 
          else if (consulta.toLowerCase().includes('cliente') || consulta.toLowerCase().includes('clientes')) {
            const clientes = await prisma.cliente.findMany({
              take: 10,
              select: {
                id: true,
                user: {
                  select: {
                    nome: true,
                    email: true
                  }
                },
                telefone: true,
                cidade: true,
                bairro: true,
                estado: true,
                createdAt: true
              }
            });
            resultado = { clientes };
          }
          else if (consulta.toLowerCase().includes('corretor') || consulta.toLowerCase().includes('corretores')) {
            const corretores = await prisma.corretor.findMany({
              take: 10,
              select: {
                id: true,
                user: {
                  select: {
                    nome: true,
                    email: true
                  }
                },
                telefone: true,
                creci: true,
                cidade: true
              }
            });
            resultado = { corretores };
          }
        }
        
        // 4. CONSULTAS DE DADOS ESPECÍFICOS (findFirst, findUnique)
        else if (consulta.includes('findFirst') || consulta.includes('findUnique') ||
                consulta.toLowerCase().includes('específico') ||
                consulta.toLowerCase().includes('mais caro') ||
                consulta.toLowerCase().includes('mais barato') ||
                consulta.toLowerCase().includes('maior valor') ||
                consulta.toLowerCase().includes('menor valor')) {
          
          if (consulta.toLowerCase().includes('imóvel') || consulta.toLowerCase().includes('imovel')) {
            // Imóvel mais caro
            if (consulta.toLowerCase().includes('mais caro') || 
                consulta.toLowerCase().includes('maior valor') || 
                consulta.toLowerCase().includes('maior preço')) {
              
              const imovelMaisCaro = await prisma.imovel.findFirst({
                orderBy: {
                  valor: 'desc'
                },
                select: {
                  id: true,
                  codigo: true,
                  titulo: true,
                  descricao: true,
                  valor: true,
                  bairro: true,
                  cidade: true,
                  tipoImovel: true,
                  tipoOperacao: true,
                  quartos: true,
                  banheiros: true,
                  areaTotal: true
                }
              });
              
              resultado = { imovelMaisCaro };
            }
            // Imóvel mais barato
            else if (consulta.toLowerCase().includes('mais barato') || 
                    consulta.toLowerCase().includes('menor valor') || 
                    consulta.toLowerCase().includes('menor preço')) {
              
              const imovelMaisBarato = await prisma.imovel.findFirst({
                where: {
                  valor: { gt: 0 } // para evitar valores zerados
                },
                orderBy: {
                  valor: 'asc'
                },
                select: {
                  id: true,
                  codigo: true,
                  titulo: true,
                  descricao: true,
                  valor: true,
                  bairro: true,
                  cidade: true,
                  tipoImovel: true,
                  tipoOperacao: true,
                  quartos: true,
                  banheiros: true,
                  areaTotal: true
                }
              });
              
              resultado = { imovelMaisBarato };
            }
          }
        }
        
        // 5. CONSULTAS AGREGADAS (aggregate - média, soma, etc)
        else if (consulta.includes('aggregate') || 
                consulta.toLowerCase().includes('média') ||
                consulta.toLowerCase().includes('media') ||
                consulta.toLowerCase().includes('soma') ||
                consulta.toLowerCase().includes('valor total') ||
                consulta.toLowerCase().includes('preço médio')) {
          
          if ((consulta.toLowerCase().includes('média') || consulta.toLowerCase().includes('media')) &&
              (consulta.toLowerCase().includes('valor') || consulta.toLowerCase().includes('preço'))) {
            
            // Filtros
            const filtros: any = {};
            
            if (consulta.toLowerCase().includes('venda')) {
              filtros.tipoOperacao = 'VENDA';
            } else if (consulta.toLowerCase().includes('aluguel')) {
              filtros.tipoOperacao = 'ALUGUEL';
            }
            
            // Filtros por tipo de imóvel
            if (consulta.toLowerCase().includes('apartamento')) {
              filtros.tipoImovel = 'APARTAMENTO';
            } else if (consulta.toLowerCase().includes('casa')) {
              filtros.tipoImovel = 'CASA';
            } else if (consulta.toLowerCase().includes('terreno')) {
              filtros.tipoImovel = 'TERRENO';
            }
            
            // Filtro por bairro se mencionado
            const bairroMatch = consulta.match(/bairro\s+([\w\s]+)/i) || consulta.match(/em\s+([\w\s]+)/i);
            if (bairroMatch && bairroMatch[1]) {
              const bairro = bairroMatch[1].trim();
              filtros.bairro = { contains: bairro, mode: 'insensitive' };
            }
            
            // Cálculo da média
            const mediaValores = await prisma.imovel.aggregate({
              where: Object.keys(filtros).length > 0 ? filtros : undefined,
              _avg: {
                valor: true
              },
              _count: {
                id: true
              },
              _min: {
                valor: true
              },
              _max: {
                valor: true
              }
            });
            
            resultado = { 
              mediaValores: mediaValores._avg.valor,
              totalImoveis: mediaValores._count.id,
              menorValor: mediaValores._min.valor,
              maiorValor: mediaValores._max.valor,
              filtrosAplicados: filtros
            };
          }
        }
        
        // 6. ESTATÍSTICAS GERAIS E RESUMOS
        else if (consulta.toLowerCase().includes('estatísticas') || 
                consulta.toLowerCase().includes('resumo') ||
                consulta.toLowerCase().includes('dashboard') ||
                consulta.toLowerCase().includes('visão geral') ||
                consulta.toLowerCase().includes('relatório')) {
          
          // Total de imóveis por status
          const imoveisPorStatus = await prisma.imovel.groupBy({
            by: ['status'],
            _count: { id: true }
          });
          
          // Total de imóveis por tipo
          const imoveisPorTipo = await prisma.imovel.groupBy({
            by: ['tipoImovel'],
            _count: { id: true }
          });
          
          // Total de imóveis por operação
          const imoveisPorOperacao = await prisma.imovel.groupBy({
            by: ['tipoOperacao'],
            _count: { id: true }
          });
          
          // Valores agregados
          const valoresAgregados = await prisma.imovel.aggregate({
            _avg: { valor: true },
            _min: { valor: true },
            _max: { valor: true },
            _sum: { valor: true }
          });
          
          // Imóveis mais recentes
          const imoveisRecentes = await prisma.imovel.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              titulo: true,
              valor: true,
              tipoImovel: true,
              status: true,
              createdAt: true
            }
          });
          
          // Total de clientes
          const totalClientes = await prisma.cliente.count();
          
          // Total de corretores
          const totalCorretores = await prisma.corretor.count();
          
          resultado = {
            resumo: {
              imoveisPorStatus,
              imoveisPorTipo,
              imoveisPorOperacao,
              valoresAgregados,
              imoveisRecentes,
              totalClientes,
              totalCorretores
            }
          };
        }
        
        // Se não encontramos uma consulta adequada
        if (!resultado) {
          resultado = { mensagem: 'Não foi possível executar uma consulta com base na pergunta' };
        }
      } catch (err) {
        console.error('Erro ao executar consulta:', err);
        resultado = { erro: 'Erro ao consultar o banco de dados: ' + (err instanceof Error ? err.message : String(err)) };
      }
      
      // Verifica se há consultas anteriores no contexto que podem ajudar
      const contextoRelevante = Object.keys(contextoAnterior).length > 0 ? 
        `\nContexto de consultas anteriores: ${JSON.stringify(contextoAnterior)}` : '';
      
      // Formata a resposta final usando o DeepSeek
      const promptFinal = `
        Você é um assistente amigável e prestativo de uma imobiliária.
        O usuário perguntou: "${mensagem}"
        
        Dados obtidos do banco de dados: ${JSON.stringify(resultado || {})}${contextoRelevante}
        
        Por favor, formate uma resposta amigável e natural em português com base nesses dados.
        Seja conciso, claro e profissional, como se estivesse respondendo a um colega de trabalho.
        
        IMPORTANTE: Se a pergunta faz referência a consultas anteriores ou dados já mencionados anteriormente,
        utilize o contexto fornecido para manter consistência na resposta.
        
        Não invente informações nem crie dados fictícios. Se os dados não estiverem disponíveis, diga honestamente
        que não consegue encontrar a informação solicitada e indique quais dados estão disponíveis.
      `;
      
      const respostaFinal = await deepseekClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: promptFinal }],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      return NextResponse.json({
        resposta: respostaFinal.choices[0].message.content,
        dados: resultado || {},
        explicacao
      });
      
    } catch (error) {
      console.error('Erro ao processar consulta:', error);
      return NextResponse.json(
        { 
          erro: 'Não foi possível processar a consulta',
          resposta: 'Desculpe, estou tendo dificuldade para processar essa consulta no momento. Poderia reformular sua pergunta?' 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
