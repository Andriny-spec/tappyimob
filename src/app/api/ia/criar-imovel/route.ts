import { NextRequest, NextResponse } from 'next/server';
import deepseekClient from '@/lib/deepseek';
import { prisma } from '@/lib/prisma';
import { TipoImovel, TipoOperacao, StatusImovel } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function POST(request: Request) {
  try {
    // Extrair dados da requisição
    const { descricao, userEmail } = await request.json();
    
    // Verificar se temos um email (passado da rota principal)
    const email = userEmail || '';
    
    if (!email) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Email do usuário não fornecido'
      }, { status: 400 });
    }
    
    // Buscar detalhes do usuário e sua imobiliária
    const userDetails = await prisma.user.findUnique({
      where: { email: email },
      include: {
        imobiliaria: true,
        corretor: true,
      },
    });

    if (!userDetails) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      }, { status: 404 });
    }
    
    // Determinar a imobiliária associada
    let imobiliariaId = null;
    
    if (userDetails.role === 'IMOBILIARIA' && userDetails.imobiliaria) {
      imobiliariaId = userDetails.imobiliaria.id;
    } else if (userDetails.role === 'CORRETOR' && userDetails.corretor?.imobiliariaId) {
      imobiliariaId = userDetails.corretor.imobiliariaId;
    } else if (userDetails.role !== 'ADMIN') {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Usuário sem imobiliária associada'
      }, { status: 403 });
    }
    
    // Verificar a descrição do imóvel

    if (!descricao) {
      return NextResponse.json(
        { erro: 'Descrição do imóvel é obrigatória' },
        { status: 400 }
      );
    }

    // Extrai informações sobre o schema do Prisma para o modelo Imovel
    const schemaImovel = `
      Modelo de Imóvel no Prisma:
      
      model Imovel {
        id            String      @id @default(uuid())
        codigo        String      @unique // Obrigatório, formato único como "AP001", "CA002"
        titulo        String      // Obrigatório
        descricao     String      // Obrigatório
        valor         Float       // Obrigatório
        tipoOperacao  TipoOperacao // VENDA, ALUGUEL, VENDA_ALUGUEL
        tipoImovel    TipoImovel  // CASA, APARTAMENTO, CONDOMINIO, TERRENO, SALA_COMERCIAL, GALPAO, FAZENDA, SITIO, CHACARA, OUTROS
        status        StatusImovel @default(ATIVO) // ATIVO, INATIVO, VENDIDO, ALUGADO, EM_ANALISE
        
        // Localização
        endereco      String      // Obrigatório
        bairro        String      // Obrigatório
        numero        String      // Obrigatório
        cidade        String      // Obrigatório
        estado        String      // Obrigatório
        cep           String?     // Opcional
        latitude      Float?      // Opcional
        longitude     Float?      // Opcional
        
        // Características
        areaTotal     Float?      // Opcional
        areaConstruida Float?     // Opcional
        salas         Int?        // Opcional
        cozinhas      Int?        // Opcional
        banheiros     Int?        // Opcional
        quartos       Int?        // Opcional
        suites        Int?        // Opcional
        vagas         Int?        // Opcional
        
        // Adicionais - relacionamento com tabela Adicional
        adicionais    Adicional[] @relation("ImovelAdicionais") // Esses são itens como "wifi", "piscina", "churrasqueira", etc.
      }
      
      model Adicional {
        id            String      @id @default(uuid())
        nome          String      // Nome do adicional, ex: "Wi-Fi", "Ar condicionado", "Piscina"
        imoveis       Imovel[]    @relation("ImovelAdicionais")
      }
      
      Enums:
      enum TipoImovel {
        CASA
        APARTAMENTO
        CONDOMINIO
        TERRENO
        SALA_COMERCIAL
        GALPAO
        FAZENDA
        SITIO
        CHACARA
        OUTROS
      }
      
      enum TipoOperacao {
        VENDA
        ALUGUEL
        VENDA_ALUGUEL
      }
      
      enum StatusImovel {
        ATIVO
        INATIVO
        VENDIDO
        ALUGADO
        EM_ANALISE
      }
    `;

    // Pede ao DeepSeek para analisar a descrição e extrair os campos necessários
    const prompt = `
      Você é um assistente especializado em imobiliárias que vai extrair informações de uma descrição de imóvel
      para criar um registro no banco de dados usando Prisma.
      
      ${schemaImovel}
      
      ATENÇÃO: TODOS os campos obrigatórios DEVEM ser preenchidos, mesmo que você precise deduzir valores razoáveis.
      Para campos não mencionados na descrição, use valores padrão inteligentes baseados no contexto.
      
      Regras importantes:
      1. Título: Se não for explicitamente mencionado, crie um título atrativo baseado no tipo e características do imóvel
      2. Número: Se não for mencionado, use "SN" (Sem Número)
      3. TipoOperação: Se não for mencionado, presuma VENDA se tiver valor, ou ALUGUEL se mencionar aluguel
      4. Estado: Use a sigla do estado (ex: SP, RJ, MG)
      5. Código: Gere sempre um código único no formato "XX999" onde XX é o prefixo do tipo (CA=casa, AP=apartamento, etc) e 999 é um número aleatório de 3 dígitos
      6. Adicionais: Identifique quaisquer adicionais mencionados na descrição. Adicionais comuns incluem: Wi-Fi, Piscina, Churrasqueira, Academia, Ar condicionado, Aquecimento central, Elevador, Playground, Salão de festas, Salão de jogos, Varanda gourmet, Cozinha gourmet, Segurança 24h, Portão eletrônico, Câmeras de segurança, Área de lazer, Jardim, Quintal, Móveis planejados, Estacionamento, Depósito, etc.
      
      Descrição do imóvel: "${descricao}"
      
      Responda com um objeto JSON contendo:
      1. "dados": objeto completo com TODOS os campos obrigatórios preenchidos. Campos opcionais podem ser incluídos se existirem na descrição
      2. "camposDetectados": array com nomes dos campos que foram extraídos diretamente da descrição
      3. "camposPreenchidos": array com nomes dos campos que foram preenchidos automaticamente com valores presumidos
      4. "adicionais": array de strings contendo todos os adicionais identificados na descrição (ex: ["Wi-Fi", "Piscina", "Churrasqueira"])
      5. "sugestoes": sugestões para melhorar a descrição do imóvel
    `;

    // Envia a solicitação para o DeepSeek
    const resposta = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const conteudoResposta = resposta.choices[0].message.content || '';
    
    // Extrai o JSON da resposta (pode estar em formato markdown)
    let jsonString = conteudoResposta;
    if (conteudoResposta.includes('```')) {
      const match = conteudoResposta.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match && match[1]) {
        jsonString = match[1].trim();
      }
    }
    
    // Parse o JSON
    let analiseImovel;
    try {
      analiseImovel = JSON.parse(jsonString);
    } catch (error) {
      return NextResponse.json(
        { erro: 'Não foi possível processar a resposta da IA', respostaOriginal: conteudoResposta },
        { status: 500 }
      );
    }
    
    // Extrair os dados do objeto analisado e criar uma cópia para manipulação
    let dadosProcessados = { ...analiseImovel.dados };
    const { camposFaltantes, sugestoes, adicionais } = analiseImovel;
    
    // Na nova implementação, não deveriam haver campos faltantes, mas verificamos mesmo assim
    if (camposFaltantes && camposFaltantes.length > 0) {
      // Vamos completar automaticamente os campos faltantes com valores padrão
      
      // Definição de valores padrão para campos obrigatórios
      if (!dadosProcessados.codigo) {
        const prefixo = dadosProcessados.tipoImovel === 'CASA' ? 'CA' : 
                      dadosProcessados.tipoImovel === 'APARTAMENTO' ? 'AP' : 'IM';
        const numero = Math.floor(Math.random() * 900) + 100; // Gera número entre 100 e 999
        dadosProcessados.codigo = `${prefixo}${numero}`;
      }
      
      if (!dadosProcessados.titulo) {
        const tipoStr = dadosProcessados.tipoImovel === 'CASA' ? 'Casa' : 
                      dadosProcessados.tipoImovel === 'APARTAMENTO' ? 'Apartamento' : 'Imóvel';
        const quartosStr = dadosProcessados.quartos ? `${dadosProcessados.quartos} quartos` : '';
        const localStr = dadosProcessados.bairro ? `no ${dadosProcessados.bairro}` : 
                       dadosProcessados.cidade ? `em ${dadosProcessados.cidade}` : '';
        dadosProcessados.titulo = `${tipoStr} ${quartosStr} ${localStr}`.trim();
      }
      
      if (!dadosProcessados.descricao) {
        dadosProcessados.descricao = descricao || `${dadosProcessados.titulo}. Excelente localização.`;
      }
      
      if (!dadosProcessados.tipoOperacao) {
        dadosProcessados.tipoOperacao = 'VENDA';
      }
      
      if (!dadosProcessados.tipoImovel) {
        dadosProcessados.tipoImovel = 'CASA';
      }
      
      if (!dadosProcessados.endereco) {
        dadosProcessados.endereco = 'Endereço a confirmar';
      }
      
      if (!dadosProcessados.bairro) {
        dadosProcessados.bairro = 'Centro';
      }
      
      if (!dadosProcessados.numero) {
        dadosProcessados.numero = 'SN';
      }
      
      if (!dadosProcessados.cidade) {
        dadosProcessados.cidade = 'São Paulo';
      }
      
      if (!dadosProcessados.estado) {
        dadosProcessados.estado = 'SP';
      }
      
      console.log('Campos preenchidos automaticamente:', camposFaltantes);
    }
    
    // Valida e converte os campos para os tipos corretos
    const dadosValidados = {
      ...dadosProcessados,
      valor: typeof dadosProcessados.valor === 'string' ? parseFloat(dadosProcessados.valor) : dadosProcessados.valor,
      tipoOperacao: dadosProcessados.tipoOperacao as TipoOperacao,
      tipoImovel: dadosProcessados.tipoImovel as TipoImovel,
      status: dadosProcessados.status || 'ATIVO',
      areaConstruida: dadosProcessados.areaConstruida ? (typeof dadosProcessados.areaConstruida === 'string' ? parseFloat(dadosProcessados.areaConstruida) : dadosProcessados.areaConstruida) : undefined,
      areaTotal: dadosProcessados.areaTotal ? (typeof dadosProcessados.areaTotal === 'string' ? parseFloat(dadosProcessados.areaTotal) : dadosProcessados.areaTotal) : undefined,
      banheiros: dadosProcessados.banheiros ? (typeof dadosProcessados.banheiros === 'string' ? parseInt(dadosProcessados.banheiros) : dadosProcessados.banheiros) : undefined,
      cozinhas: dadosProcessados.cozinhas ? (typeof dadosProcessados.cozinhas === 'string' ? parseInt(dadosProcessados.cozinhas) : dadosProcessados.cozinhas) : undefined,
      quartos: dadosProcessados.quartos ? (typeof dadosProcessados.quartos === 'string' ? parseInt(dadosProcessados.quartos) : dadosProcessados.quartos) : undefined,
      salas: dadosProcessados.salas ? (typeof dadosProcessados.salas === 'string' ? parseInt(dadosProcessados.salas) : dadosProcessados.salas) : undefined,
      suites: dadosProcessados.suites ? (typeof dadosProcessados.suites === 'string' ? parseInt(dadosProcessados.suites) : dadosProcessados.suites) : undefined,
      vagas: dadosProcessados.vagas ? (typeof dadosProcessados.vagas === 'string' ? parseInt(dadosProcessados.vagas) : dadosProcessados.vagas) : undefined,
    };
    
    // Gera um código único para o imóvel
    async function gerarCodigoUnico() {
      let codigo = dadosValidados.codigo;
      let tentativas = 0;
      let codigoExistente = true;
      
      // Tenta até 5 vezes gerar um código único
      while (codigoExistente && tentativas < 5) {
        // Verifica se o código já existe
        const imovelExistente = await prisma.imovel.findUnique({
          where: { codigo: codigo }
        });
        
        if (imovelExistente) {
          // Se existe, gera um novo código
          const prefixo = dadosValidados.tipoImovel === 'CASA' ? 'CA' : 
                        dadosValidados.tipoImovel === 'APARTAMENTO' ? 'AP' : 'IM';
          const numero = Math.floor(Math.random() * 900) + 100; // Número entre 100 e 999
          codigo = `${prefixo}${numero}`;
          tentativas++;
        } else {
          codigoExistente = false;
        }
      }
      
      return codigo;
    }
    
    // Garante que o código seja único
    dadosValidados.codigo = await gerarCodigoUnico();
    
    // Tenta criar o imóvel no banco de dados
    try {
      // Adiciona o ID da imobiliária aos dados do imóvel
      if (imobiliariaId) {
        dadosValidados.imobiliariaId = imobiliariaId;
      }
      
      // Criar o imóvel primeiro
      const novoImovel = await prisma.imovel.create({
        data: dadosValidados
      });
      
      // Se houver adicionais, processa-os
      if (adicionais && adicionais.length > 0) {
        try {
          // Lista para armazenar os adicionais a serem conectados
          const adicionaisParaConectar = [];
          
          for (const adicionalNome of adicionais) {
            // Busca se o adicional já existe no banco
            let adicional = await prisma.adicional.findFirst({
              where: {
                nome: {
                  equals: adicionalNome,
                  mode: 'insensitive' // Case insensitive para evitar duplicações como "wifi" e "WiFi"
                }
              }
            });
            
            // Se não existir, cria o adicional
            if (!adicional) {
              adicional = await prisma.adicional.create({
                data: { nome: adicionalNome }
              });
            }
            
            // Adiciona ao array de adicionais para conectar
            adicionaisParaConectar.push({ id: adicional.id });
          }
          
          // Conecta os adicionais ao imóvel criado usando o método update do Prisma
          if (adicionaisParaConectar.length > 0) {
            await prisma.imovel.update({
              where: { id: novoImovel.id },
              data: {
                adicionais: {
                  connect: adicionaisParaConectar
                }
              }
            });
            
            console.log('Adicionais conectados com sucesso ao imóvel:', adicionaisParaConectar);
          }
        } catch (error) {
          console.error('Erro ao processar adicionais:', error);
          // Continuamos mesmo se houver erro nos adicionais
        }
      }
      
      // Formato a resposta usando o DeepSeek para uma mensagem natural
      // Busca o imóvel com os adicionais relacionados para mensagem final
      const imovelCompleto = await prisma.imovel.findUnique({
        where: { id: novoImovel.id },
        include: { adicionais: true }
      });
      
      const promptFinal = `
        Você é um assistente especializado em imobiliárias que acabou de criar um novo imóvel no sistema.
        
        Os dados do imóvel criado são:
        ${JSON.stringify(imovelCompleto, null, 2)}
        
        Por favor, dê uma resposta amigável em português confirmando a criação do imóvel,
        destacando os principais detalhes como título, localização, valor, tipo e características principais.
        Se houver adicionais, mencione-os também (ex: "Com adicionais: Wi-Fi, Piscina, etc").
        Seja conciso e profissional.
      `;
      
      const respostaFinal = await deepseekClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: promptFinal }],
        temperature: 0.7,
        max_tokens: 250,
      });
      
      return NextResponse.json({
        sucesso: true,
        mensagem: respostaFinal.choices[0].message.content,
        imovel: novoImovel
      });
      
    } catch (error) {
      console.error('Erro ao criar imóvel:', error);
      
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Erro ao salvar o imóvel no banco de dados',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
        dadosParciais: dadosValidados
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
