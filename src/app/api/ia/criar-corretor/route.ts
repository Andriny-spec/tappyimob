import { NextResponse } from 'next/server';
import { PrismaClient, Role, StatusUser } from '@prisma/client';
import { calculateHash } from '@/utils/auth-utils';
import { isValidCPF } from '@/utils/validations';
import deepseekClient from '@/lib/deepseek';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const prisma = new PrismaClient();

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
    
    // Verificar a descrição do corretor

    if (!descricao) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Descrição do corretor é obrigatória'
      }, { status: 400 });
    }

    // Define o schema do modelo Corretor para a IA
    const schemaCorretor = `
      Modelo de Corretor no Prisma:
      
      model Corretor {
        id            String      @id @default(uuid())
        nome          String      // Obrigatório
        email         String      @unique // Obrigatório, deve ser um email válido
        telefone      String?     // Opcional
        cpf           String?     // Opcional, mas deve ser um CPF válido se fornecido
        creci         String?     // Opcional, registro profissional
        biografia     String?     // Opcional, texto sobre o corretor
        foto          String?     // Opcional, URL da foto
        password      String      // Obrigatório, será hasheado antes de salvar
        status        StatusCorretor @default(ATIVO) // ATIVO, INATIVO
        cargo         String?     // Opcional, cargo do corretor
      }
      
      enum StatusCorretor {
        ATIVO
        INATIVO
      }
    `;

    // Pede ao DeepSeek para analisar a descrição e extrair os campos necessários
    const prompt = `
      Você é um assistente especializado em imobiliárias que vai extrair informações de uma descrição
      para criar um registro de corretor no banco de dados usando Prisma.
      
      ${schemaCorretor}
      
      ATENÇÃO: Os campos nome, email e password são obrigatórios. Você deve extraí-los da descrição
      ou gerar valores padrão adequados.
      
      Regras importantes:
      1. Nome: Extraia o nome completo do corretor
      2. Email: Deve ser um email válido. Se não for fornecido, crie um baseado no nome (nome@imobiliaria.com)
      3. Password: Se não for fornecida, gere uma senha temporária forte
      4. CPF: Se fornecido, deve ser um CPF válido
      5. Status: Defina como ATIVO por padrão
      
      Descrição do corretor: "${descricao}"
      
      Responda com um objeto JSON contendo:
      1. "dados": objeto completo com todos os campos necessários para criar um corretor
      2. "camposDetectados": array com nomes dos campos que foram extraídos diretamente da descrição
      3. "camposGerados": array com nomes dos campos que foram gerados automaticamente
      4. "sugestoes": sugestões para melhorar o cadastro do corretor
    `;

    // Envia a solicitação para o DeepSeek
    const resposta = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    if (!resposta || !resposta.choices || resposta.choices.length === 0) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Erro na análise da descrição do corretor'
      }, { status: 500 });
    }

    // Extrai a resposta da IA
    const conteudoResposta = resposta.choices[0]?.message.content || '';
    
    // Tenta extrair o JSON da resposta
    const matchJSON = conteudoResposta.match(/```json\n([\s\S]*?)\n```/) || 
                     conteudoResposta.match(/({[\s\S]*?})/);
    
    if (!matchJSON) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Erro ao extrair JSON da resposta da IA',
        resposta: conteudoResposta
      }, { status: 500 });
    }
    
    const analiseCorretor = JSON.parse(matchJSON[1]);
    
    // Extrai os dados do objeto analisado
    let dadosProcessados = { ...analiseCorretor.dados };
    const { camposDetectados = [], camposGerados = [], sugestoes = [] } = analiseCorretor;
    
    // Verifica campos obrigatórios
    if (!dadosProcessados.nome || !dadosProcessados.email) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Nome e email são obrigatórios',
        sugestoes
      }, { status: 400 });
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dadosProcessados.email)) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'O email fornecido não é válido',
        sugestoes: ['Forneça um email válido no formato usuario@dominio.com']
      }, { status: 400 });
    }

    // Verifica se o email já existe
    const emailExistente = await prisma.user.findUnique({
      where: {
        email: dadosProcessados.email
      }
    });
    
    if (emailExistente) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Já existe um corretor com este email',
        sugestoes: ['Tente outro email']
      }, { status: 400 });
    }

    // Valida CPF se fornecido
    if (dadosProcessados.cpf && !isValidCPF(dadosProcessados.cpf)) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'O CPF fornecido não é válido',
        sugestoes: ['Forneça um CPF válido']
      }, { status: 400 });
    }

    // Gera senha se não fornecida
    if (!dadosProcessados.password) {
      const senhaTemporaria = Math.random().toString(36).slice(-8);
      dadosProcessados.password = senhaTemporaria;
      camposGerados.push('password');
      sugestoes.push(`Senha temporária gerada: ${senhaTemporaria}. Recomendamos alterar após o primeiro acesso.`);
    }

    // Hash da senha
    dadosProcessados.password = await calculateHash(dadosProcessados.password);
    
    // Status padrão é ATIVO
    dadosProcessados.status = dadosProcessados.status || 'ATIVO';

    // Tenta criar o corretor no banco de dados
    try {
      // Adiciona o ID da imobiliária aos dados do corretor
      if (imobiliariaId) {
        dadosProcessados.imobiliariaId = imobiliariaId;
      }
      
      // Cria um usuário primeiro e depois o corretor relacionado
      // Separar os dados do usuário dos dados do corretor
      const dadosUser = {
        nome: dadosProcessados.nome,
        email: dadosProcessados.email,
        senha: dadosProcessados.password,
        role: Role.CORRETOR,
        status: StatusUser.ATIVO
      };
      
      // Remover campos de usuário e campos inválidos dos dados do corretor
      const { 
        nome, 
        email, 
        password, 
        biografia, // Não existe no modelo Corretor
        foto,      // Não existe no modelo Corretor
        status,    // Não existe no modelo Corretor como campo direto
        ...dadosCorretorRaw 
      } = dadosProcessados;
      
      // Filtrar apenas os campos válidos para o modelo Corretor
      // Baseado no schema.prisma
      const camposValidos = [
        'telefone', 'endereco', 'bairro', 'numero', 'cidade', 'estado',
        'cnpj', 'cpf', 'fotoPerfil', 'creci'
      ];
      
      // Criar um objeto apenas com os campos válidos
      const dadosCorretor = Object.fromEntries(
        Object.entries(dadosCorretorRaw).filter(([key]) => camposValidos.includes(key))
      );
      
      // Criar o usuário e o corretor em uma transação
      const novoCorretor = await prisma.$transaction(async (tx) => {
        // Criar o usuário
        const user = await tx.user.create({
          data: dadosUser
        });
        
        // Criar o corretor associado ao usuário
        return tx.corretor.create({
          data: {
            ...dadosCorretor,
            id: user.id,
            imobiliariaId: imobiliariaId
          },
          include: {
            user: true
          }
        });
      });

      // Cria uma cópia sem a senha para retornar
      const corretorSemSenha = {
        ...novoCorretor,
        password: undefined
      };

      return NextResponse.json({
        sucesso: true,
        mensagem: 'Corretor criado com sucesso',
        corretor: corretorSemSenha,
        sugestoes
      });
    } catch (error: any) {
      console.error('Erro ao criar corretor:', error);
      
      return NextResponse.json({
        sucesso: false,
        mensagem: `Erro ao criar corretor: ${error.message || 'Erro desconhecido'}`,
        erro: error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erro na requisição:', error);
    
    return NextResponse.json({
      sucesso: false,
      mensagem: `Erro na requisição: ${error.message || 'Erro desconhecido'}`,
      erro: error
    }, { status: 500 });
  }
}
