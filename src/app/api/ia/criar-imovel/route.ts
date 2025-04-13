import { NextRequest, NextResponse } from 'next/server';
import deepseekClient from '@/lib/deepseek';
import { prisma } from '@/lib/prisma';
import { TipoImovel, TipoOperacao, StatusImovel } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { descricao } = await request.json();

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
      
      Baseado na descrição a seguir, extraia todos os campos necessários para criar um novo imóvel.
      Se algum campo obrigatório estiver faltando, inclua na resposta uma lista de campos ausentes.
      Gere um código único para o imóvel seguindo o padrão do tipo de imóvel (ex: AP001 para apartamento, CA001 para casa).
      
      Descrição do imóvel: "${descricao}"
      
      Responda com um objeto JSON contendo:
      1. "dados": objeto com todos os campos para criar o imóvel no Prisma
      2. "camposFaltantes": array com nomes dos campos obrigatórios que não puderam ser extraídos da descrição
      3. "sugestoes": sugestões para completar campos faltantes ou melhorar a qualidade do registro
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
    
    const { dados, camposFaltantes, sugestoes } = analiseImovel;
    
    // Verifica se há campos obrigatórios faltando
    if (camposFaltantes && camposFaltantes.length > 0) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Não foi possível criar o imóvel devido a campos obrigatórios ausentes',
        camposFaltantes,
        sugestoes,
        dadosParciais: dados
      });
    }
    
    // Valida e converte os campos para os tipos corretos
    const dadosValidados = {
      ...dados,
      valor: typeof dados.valor === 'string' ? parseFloat(dados.valor) : dados.valor,
      tipoOperacao: dados.tipoOperacao as TipoOperacao,
      tipoImovel: dados.tipoImovel as TipoImovel,
      status: (dados.status as StatusImovel) || 'ATIVO',
      areaTotal: dados.areaTotal ? parseFloat(String(dados.areaTotal)) : undefined,
      areaConstruida: dados.areaConstruida ? parseFloat(String(dados.areaConstruida)) : undefined,
      quartos: dados.quartos ? parseInt(String(dados.quartos)) : undefined,
      banheiros: dados.banheiros ? parseInt(String(dados.banheiros)) : undefined,
      salas: dados.salas ? parseInt(String(dados.salas)) : undefined,
      suites: dados.suites ? parseInt(String(dados.suites)) : undefined,
      vagas: dados.vagas ? parseInt(String(dados.vagas)) : undefined,
    };
    
    // Tenta criar o imóvel no banco de dados
    try {
      const novoImovel = await prisma.imovel.create({
        data: dadosValidados
      });
      
      // Formato a resposta usando o DeepSeek para uma mensagem natural
      const promptFinal = `
        Você é um assistente especializado em imobiliárias que acabou de criar um novo imóvel no sistema.
        
        Os dados do imóvel criado são:
        ${JSON.stringify(novoImovel, null, 2)}
        
        Por favor, dê uma resposta amigável em português confirmando a criação do imóvel,
        destacando os principais detalhes como título, localização, valor, tipo e características principais.
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
