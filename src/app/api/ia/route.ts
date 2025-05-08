import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import deepseekClient from '@/lib/deepseek';
import { prisma } from '@/lib/prisma';

// Flag para verificar se a API está funcionando
const API_MOCK_ENABLED = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    console.log('Recebendo requisição para API de IA');
    // Obter informações da sessão logo no início
    const session = await getServerSession(authOptions);
    
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

    // Verifica se a mensagem é um comando para criar um imóvel
    // Padrões que indicam criação de imóvel
    const padroesCriarImovel = [
      // Comandos explícitos
      mensagem.toLowerCase().includes('cria') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('cadastra') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      // Tipos de imóveis específicos
      mensagem.toLowerCase().includes('cria') && mensagem.toLowerCase().includes('casa'),
      mensagem.toLowerCase().includes('cadastra') && mensagem.toLowerCase().includes('casa'),
      mensagem.toLowerCase().includes('cria') && mensagem.toLowerCase().includes('apartamento'),
      mensagem.toLowerCase().includes('cadastra') && mensagem.toLowerCase().includes('apartamento'),
      mensagem.toLowerCase().includes('cria') && mensagem.toLowerCase().includes('terreno'),
      mensagem.toLowerCase().includes('cadastra') && mensagem.toLowerCase().includes('terreno'),
      // Forma imperativa (crie)
      mensagem.toLowerCase().includes('crie') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('crie') && mensagem.toLowerCase().includes('casa'),
      mensagem.toLowerCase().includes('crie') && mensagem.toLowerCase().includes('apartamento'),
      mensagem.toLowerCase().includes('crie') && mensagem.toLowerCase().includes('terreno'),
      // Detecção de descrição estruturada de imóvel com preço
      (mensagem.toLowerCase().includes('casa') || mensagem.toLowerCase().includes('apartamento')) && 
        mensagem.toLowerCase().includes('venda') && 
        (mensagem.toLowerCase().includes('mil') || mensagem.toLowerCase().includes('r$')),
      (mensagem.toLowerCase().includes('casa') || mensagem.toLowerCase().includes('apartamento')) && 
        mensagem.toLowerCase().includes('quarto') && 
        mensagem.toLowerCase().includes('banheiro')
    ];
    
    // Padrões que indicam edição de imóvel
    const padroesEditarImovel = [
      // Comandos explícitos de edição
      mensagem.toLowerCase().includes('edit') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('alterar') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('modific') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('atualiz') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      // Comandos específicos para campos
      mensagem.toLowerCase().includes('mude') && mensagem.toLowerCase().includes('valor') && mensagem.toLowerCase().includes('imovel'),
      mensagem.toLowerCase().includes('mude') && mensagem.toLowerCase().includes('preço') && mensagem.toLowerCase().includes('imovel'),
      mensagem.toLowerCase().includes('valor') && mensagem.toLowerCase().includes('para') && mensagem.toLowerCase().includes('imovel'),
      mensagem.toLowerCase().includes('troque') && mensagem.toLowerCase().includes('valor'),
      // Detecção de ID de imóvel
      mensagem.includes('ID:') && (mensagem.toLowerCase().includes('valor') || mensagem.toLowerCase().includes('preço') || mensagem.toLowerCase().includes('alterar')),
      mensagem.toLowerCase().includes('id do imóvel') && (mensagem.toLowerCase().includes('valor') || mensagem.toLowerCase().includes('preço'))
    ];
    
    // Padrões que indicam exclusão de imóvel
    const padroesExcluirImovel = [
      // Comandos explícitos de exclusão
      mensagem.toLowerCase().includes('exclui') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('remov') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('delet') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      mensagem.toLowerCase().includes('apag') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      // Forma imperativa
      mensagem.toLowerCase().includes('exclua') && (mensagem.toLowerCase().includes('imovel') || mensagem.toLowerCase().includes('imóvel')),
      // Detecção de ID com comandos de exclusão
      mensagem.toLowerCase().includes('exclua') && mensagem.includes('-') && mensagem.includes('-'),
      mensagem.toLowerCase().includes('delete') && mensagem.includes('-') && mensagem.includes('-')
    ];
    
    // Não deve conter termos de corretor
    const naoDizRespeitoACorretor = !mensagem.toLowerCase().includes('corretor') && 
                                  !mensagem.toLowerCase().includes('agente');
                                  
    if (padroesCriarImovel.some(padrao => padrao) && naoDizRespeitoACorretor) {
      
      console.log('Detectado comando para criar imóvel');
      
      try {
        // Verifica se o usuário está autenticado
        if (!session || !session.user) {
          return NextResponse.json({
            resposta: 'Você precisa estar logado para criar um imóvel. Por favor, faça login e tente novamente.'
          });
        }
        
        // Passe as credenciais do usuário diretamente nos dados
        const userEmail = session.user.email;
          
        // Chama o endpoint de criação de imóvel
        const response = await fetch(new URL('/api/ia/criar-imovel', request.url).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            descricao: mensagem,
            userEmail: userEmail
          }),
        });
        
        const resultado = await response.json();
        
        return NextResponse.json({
          resposta: resultado.mensagem || 'Tentei criar um imóvel com base na sua descrição.',
          resultado: {
            tipo: 'criar_imovel',
            status: resultado.sucesso ? 'ok' : 'erro',
            dados: resultado.imovel || resultado.dadosParciais,
            erro: resultado.erro,
            camposFaltantes: resultado.camposFaltantes
          }
        });
      } catch (error) {
        console.error('Erro ao criar imóvel via IA:', error);
        return NextResponse.json({
          resposta: 'Desculpe, ocorreu um erro ao tentar criar o imóvel. Por favor, tente novamente com mais detalhes.',
          resultado: {
            tipo: 'criar_imovel',
            status: 'erro',
            erro: error instanceof Error ? error.message : 'Erro desconhecido'
          }
        });
      }
    }
    
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
      
      // Padrões que indicam criação de corretor
    const padroesCriarCorretor = [
      // Comandos explícitos
      mensagem.toLowerCase().includes('cria') && (mensagem.toLowerCase().includes('corretor') || mensagem.toLowerCase().includes('agente')),
      mensagem.toLowerCase().includes('cadastra') && (mensagem.toLowerCase().includes('corretor') || mensagem.toLowerCase().includes('agente')),
      // Forma imperativa (crie)
      mensagem.toLowerCase().includes('crie') && (mensagem.toLowerCase().includes('corretor') || mensagem.toLowerCase().includes('agente')),
      // Detecta nome completo, email e creci na mesma mensagem (dados típicos de um corretor)
      mensagem.toLowerCase().includes('@') && 
        mensagem.toLowerCase().includes('creci') && 
        mensagem.toLowerCase().includes('senha')
    ];
    
    // Padrões que indicam exclusão de corretor
    const padroesExcluirCorretor = [
      // Comandos explícitos
      mensagem.toLowerCase().includes('exclui') && (mensagem.toLowerCase().includes('corretor') || mensagem.toLowerCase().includes('agente')),
      mensagem.toLowerCase().includes('remov') && (mensagem.toLowerCase().includes('corretor') || mensagem.toLowerCase().includes('agente')),
      mensagem.toLowerCase().includes('delet') && (mensagem.toLowerCase().includes('corretor') || mensagem.toLowerCase().includes('agente')),
      // Forma imperativa
      mensagem.toLowerCase().includes('exclua') && (mensagem.toLowerCase().includes('corretor') || mensagem.toLowerCase().includes('agente'))
    ];
    
    if (padroesCriarCorretor.some(padrao => padrao)) {
        
        console.log('Detectado comando para criar corretor');
        
        // Verifica se o usuário está autenticado
      if (!session || !session.user) {
        return NextResponse.json({
          resposta: 'Você precisa estar logado para criar um corretor. Por favor, faça login e tente novamente.'
        });
      }
      
      // Passe as credenciais do usuário diretamente nos dados
      const userEmail = session.user.email;
      
      // Redireciona para a API de criar corretor
      const response = await fetch(new URL('/api/ia/criar-corretor', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          descricao: mensagem,
          userEmail: userEmail
        })
      });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
          let mensagemSucesso = `✅ Corretor criado com sucesso!\n\n`;
          
          // Acessar corretamente os dados do usuário relacionado
          if (resultado.corretor && resultado.corretor.user) {
            mensagemSucesso += `**Nome:** ${resultado.corretor.user.nome}\n**Email:** ${resultado.corretor.user.email}\n`;
          } else if (resultado.corretor) {
            mensagemSucesso += `**ID:** ${resultado.corretor.id}\n`;
          }
          
          // Adicionar dados do corretor se disponível
          if (resultado.corretor && resultado.corretor.creci) {
            mensagemSucesso += `**CRECI:** ${resultado.corretor.creci}\n`;
          }
          
          if (resultado.corretor && resultado.corretor.telefone) {
            mensagemSucesso += `**Telefone:** ${resultado.corretor.telefone}\n`;
          }
          
          if (resultado.sugestoes && resultado.sugestoes.length > 0) {
            mensagemSucesso += '\n**Observações:**\n';
            resultado.sugestoes.forEach((sugestao: string) => {
              mensagemSucesso += `- ${sugestao}\n`;
            });
          }
          
          return NextResponse.json({ resposta: mensagemSucesso });
        } else {
          return NextResponse.json({ 
            resposta: `❌ Não foi possível criar o corretor: ${resultado.mensagem}\n\n${resultado.sugestoes ? resultado.sugestoes.join('\n') : ''}` 
          });
        }
      }
      
      // Verifica se a mensagem é um comando para editar imóvel
    if (padroesEditarImovel.some(padrao => padrao)) {
      console.log('Detectado comando para editar imóvel');
      
      // Verifica se o usuário está autenticado
      if (!session || !session.user) {
        return NextResponse.json({
          resposta: 'Você precisa estar logado para editar um imóvel. Por favor, faça login e tente novamente.'
        });
      }
      
      // Extrair ID do imóvel da mensagem
      const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      const uuidMatch = mensagem.match(uuidRegex);
      
      if (!uuidMatch) {
        return NextResponse.json({
          resposta: 'Por favor, especifique o ID do imóvel que deseja editar no formato UUID (ex: 123e4567-e89b-12d3-a456-426614174000).'
        });
      }
      
      const imovelId = uuidMatch[0];
      
      // Extrair campo e valor para atualização
      // Analisamos a mensagem para identificar o que está sendo editado
      
      // Verificação para campo valor/preço
      const camposValor = ['valor', 'preco', 'preço', 'price', 'custo'];
      let campo = '';
      let valor: any = null;
      let adicionaisDetectados: string[] = [];
      
      // Detecta o campo de valor
      for (const campoValor of camposValor) {
        if (mensagem.toLowerCase().includes(campoValor)) {
          campo = 'valor';
          break;
        }
      }
      
      // Verifica se a mensagem contém referência a adicionais
      // Padrões mais abrangentes para detectar comandos relacionados a adicionais
      const padroesAdicionais = [
        mensagem.toLowerCase().includes('adiciona') && mensagem.toLowerCase().includes('adicionais'),
        mensagem.toLowerCase().includes('adicion') && mensagem.toLowerCase().includes('imovel'),
        mensagem.toLowerCase().includes('edite') && mensagem.toLowerCase().includes('adicionais'),
        mensagem.toLowerCase().includes('atualiz') && mensagem.toLowerCase().includes('adicionais'),
        mensagem.toLowerCase().includes('os adicionais'),
        mensagem.toLowerCase().includes('com adicionais'),
        mensagem.toLowerCase().includes('incluindo'),
        mensagem.toLowerCase().includes('inclua'),
        mensagem.toLowerCase().includes('acrescente')
      ];
      
      if (padroesAdicionais.some(padrao => padrao)) {
        console.log('Detectada referência a adicionais na mensagem');
        campo = 'adicionais';
        
        // Abordagens para extrair os adicionais
        // 1. Verifica se a mensagem contém a frase "os adicionais são" ou similar
        const regexAdicionaisSao = /(os )?(adicionais|itens|recursos) (s[aã]o|ser[aã]o|incluem|inclu[ií]dos|cont[eê]m|possui)\s*:?\s*(.+)/i;
        const matchAdicionaisSao = mensagem.match(regexAdicionaisSao);
        
        // 2. Verifica outras estruturas comuns como "adicionando os adicionais"
        const regexAdicionando = /adicionando (os )?(adicionais|itens|recursos)\s*:?\s*(.+)/i;
        const matchAdicionando = mensagem.match(regexAdicionando);
        
        if (matchAdicionaisSao && matchAdicionaisSao[4]) {
          // Extrai a lista de adicionais após a frase
          const listaAdicionaisTexto = matchAdicionaisSao[4];
          adicionaisDetectados = listaAdicionaisTexto
            .split(/[,;\.\n]+/) // Divide por vírgulas, ponto-e-vírgulas, pontos ou quebras de linha
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0 && item.toLowerCase() !== 'etc' && item.toLowerCase() !== 'entre outros');
          
          console.log('Adicionais detectados do padrão "os adicionais são":', adicionaisDetectados);
        } else if (matchAdicionando && matchAdicionando[3]) {
          // Extrai a lista de adicionais após "adicionando os adicionais"
          const listaAdicionaisTexto = matchAdicionando[3];
          adicionaisDetectados = listaAdicionaisTexto
            .split(/[,;\.\n]+/) // Divide por vírgulas, ponto-e-vírgulas, pontos ou quebras de linha
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0 && item.toLowerCase() !== 'etc' && item.toLowerCase() !== 'entre outros');
          
          console.log('Adicionais detectados do padrão "adicionando os adicionais":', adicionaisDetectados);
        } else {
          // 3. Simplesmente encontra uma lista separada por vírgulas após encontrar UUID
          const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
          const uuidMatch = mensagem.match(uuidRegex);
          
          if (uuidMatch) {
            const posUUID = mensagem.indexOf(uuidMatch[0]) + uuidMatch[0].length;
            const restoMensagem = mensagem.substring(posUUID);
            
            // Procura uma lista separada por vírgulas
            const listMatch = restoMensagem.match(/[:\s]([^\.]*)/);
            if (listMatch && listMatch[1]) {
              adicionaisDetectados = listMatch[1]
                .split(/[,;\.\n]+/)
                .map((item: string) => item.trim())
                .filter((item: string) => item.length > 0 && item.toLowerCase() !== 'etc' && item.toLowerCase() !== 'entre outros');
                
              console.log('Adicionais detectados após UUID:', adicionaisDetectados);
            }
          }
        }
        
        // 4. Se não conseguiu extrair por padrões, tenta palavras-chave comuns
        if (adicionaisDetectados.length === 0) {
          // Tenta detectar adicionais comuns no texto
          const adicionaisComuns = [
            'wifi', 'wi-fi', 'piscina', 'churrasqueira', 'academia', 'ar condicionado', 
            'aquecimento', 'elevador', 'playground', 'salão de festas', 'salão de jogos', 
            'varanda gourmet', 'cozinha gourmet', 'segurança 24h', 'portão eletrônico', 
            'câmeras', 'cameras', 'área de lazer', 'area de lazer', 'jardim', 'quintal', 
            'moveis planejados', 'móveis planejados', 'estacionamento', 'garagem', 'depósito', 'deposito',
            'sala espacial'
          ];
          
          for (const adicional of adicionaisComuns) {
            if (mensagem.toLowerCase().includes(adicional)) {
              adicionaisDetectados.push(adicional);
            }
          }
          
          console.log('Adicionais detectados por palavras-chave:', adicionaisDetectados);
        }
      }
      
      // Se for o campo valor, extrai o valor numérico
      if (campo === 'valor') {
        // Procura por padrões como "500 mil", "R$ 500 mil", "500.000"
        const valorRegex = /(\d+([.,]\d+)*)\s*(mil|milh[aõ]o|milh[oõ]es|reais|reals|k)/i;
        const valorMatch = mensagem.match(valorRegex);
        
        if (valorMatch) {
          const valorNumerico = parseFloat(valorMatch[1].replace(',', '.'));
          const unidade = valorMatch[3]?.toLowerCase();
          
          if (unidade === 'mil' || unidade === 'k') {
            valor = valorNumerico * 1000;
          } else if (unidade === 'milhão' || unidade === 'milhoes' || unidade === 'milhões') {
            valor = valorNumerico * 1000000;
          } else {
            valor = valorNumerico;
          }
        } else {
          // Tenta extrair apenas o número
          const numeroRegex = /(\d+([.,]\d+)*)/;
          const numeroMatch = mensagem.match(numeroRegex);
          
          if (numeroMatch) {
            valor = parseFloat(numeroMatch[1].replace(',', '.'));
          }
        }
      }
      
      // Se for adicionais, verificamos se temos a lista
      if (campo === 'adicionais') {
        if (adicionaisDetectados.length === 0) {
          return NextResponse.json({
            resposta: 'Por favor, especifique quais adicionais deseja incluir. Por exemplo: "Os adicionais do imóvel ID-123 são: Wi-Fi, Piscina, Churrasqueira"'
          });
        }
      } else if (!campo || valor === null) {
        return NextResponse.json({
          resposta: 'Por favor, especifique claramente qual campo deseja editar e o novo valor. Por exemplo: "Altere o valor do imóvel ID-123 para R$ 500 mil"'
        });
      }
      
      // Chama o endpoint de edição de imóvel
      try {
        const response = await fetch(new URL('/api/ia/editar-imovel', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imovelId,
            campo,
            valor,
            adicionais: adicionaisDetectados,
            userEmail: session.user.email
          })
        });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
          return NextResponse.json({
            resposta: `✅ ${resultado.mensagem}`
          });
        } else {
          return NextResponse.json({
            resposta: `❌ Não foi possível editar o imóvel: ${resultado.mensagem}`
          });
        }
      } catch (error) {
        console.error('Erro ao editar imóvel:', error);
        return NextResponse.json({
          resposta: 'Ocorreu um erro ao tentar editar o imóvel. Por favor, tente novamente mais tarde.'
        });
      }
    }
    
    // Verifica se a mensagem é um comando para excluir imóvel
    if (padroesExcluirImovel.some(padrao => padrao)) {
      console.log('Detectado comando para excluir imóvel');
      
      // Verifica se o usuário está autenticado
      if (!session || !session.user) {
        return NextResponse.json({
          resposta: 'Você precisa estar logado para excluir um imóvel. Por favor, faça login e tente novamente.'
        });
      }
      
      // Extrair ID do imóvel da mensagem
      const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      const uuidMatch = mensagem.match(uuidRegex);
      
      if (!uuidMatch) {
        return NextResponse.json({
          resposta: 'Por favor, especifique o ID do imóvel que deseja excluir no formato UUID (ex: 123e4567-e89b-12d3-a456-426614174000).'
        });
      }
      
      const imovelId = uuidMatch[0];
      const userEmail = session.user.email;
      
      // Chama o endpoint de exclusão de imóvel
      try {
        const response = await fetch(new URL('/api/ia/excluir-imovel', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imovelId,
            userEmail
          })
        });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
          return NextResponse.json({
            resposta: `✅ ${resultado.mensagem}`
          });
        } else {
          return NextResponse.json({
            resposta: `❌ Não foi possível excluir o imóvel: ${resultado.mensagem}`
          });
        }
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
        return NextResponse.json({
          resposta: 'Ocorreu um erro ao tentar excluir o imóvel. Por favor, tente novamente mais tarde.'
        });
      }
    }
    
    // Verifica se a mensagem é um comando para excluir corretor
    if (padroesExcluirCorretor.some(padrao => padrao)) {
      console.log('Detectado comando para excluir corretor');
      
      // Verifica se o usuário está autenticado
      if (!session || !session.user) {
        return NextResponse.json({
          resposta: 'Você precisa estar logado para excluir um corretor. Por favor, faça login e tente novamente.'
        });
      }
      
      // Extrair email do corretor a ser excluído
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
      const emails = mensagem.match(emailRegex);
      
      if (!emails || emails.length === 0) {
        return NextResponse.json({
          resposta: 'Por favor, especifique o email do corretor que deseja excluir.'
        });
      }
      
      const emailCorretor = emails[0];
      const userEmail = session.user.email;
      
      // Chama o endpoint de exclusão de corretor
      try {
        const response = await fetch(new URL('/api/ia/excluir-corretor', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: emailCorretor,
            userEmail: userEmail
          })
        });
        
        const resultado = await response.json();
        
        if (resultado.sucesso) {
          return NextResponse.json({
            resposta: `✅ ${resultado.mensagem}`
          });
        } else {
          return NextResponse.json({
            resposta: `❌ Não foi possível excluir o corretor: ${resultado.mensagem}`
          });
        }
      } catch (error) {
        console.error('Erro ao excluir corretor:', error);
        return NextResponse.json({
          resposta: 'Ocorreu um erro ao tentar excluir o corretor. Por favor, tente novamente mais tarde.'
        });
      }
    }  
      
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
