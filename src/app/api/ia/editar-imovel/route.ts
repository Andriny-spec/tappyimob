import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import deepseekClient from '@/lib/deepseek';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Extrair dados da requisição
    const { imovelId, campo, valor, adicionais, userEmail } = await request.json();
    
    // Verificar se temos os dados necessários
    if (!userEmail) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Email do usuário não fornecido'
      }, { status: 400 });
    }
    
    if (!imovelId) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'ID do imóvel não fornecido'
      }, { status: 400 });
    }
    
    // Verificação especial para adicionais
    if (campo === 'adicionais') {
      if (!adicionais || !Array.isArray(adicionais) || adicionais.length === 0) {
        return NextResponse.json({
          sucesso: false,
          mensagem: 'Lista de adicionais não fornecida ou vazia'
        }, { status: 400 });
      }
    } else if (!campo || !valor) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Campo ou valor para atualização não fornecidos'
      }, { status: 400 });
    }
    
    // Buscar detalhes do usuário e sua imobiliária
    const userDetails = await prisma.user.findUnique({
      where: { email: userEmail },
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
    
    // Buscar o imóvel para verificar se existe e se pertence à imobiliária
    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
    });
    
    if (!imovel) {
      return NextResponse.json({
        sucesso: false,
        mensagem: `Imóvel com ID ${imovelId} não encontrado`
      }, { status: 404 });
    }
    
    // Verificar se o imóvel pertence à mesma imobiliária do usuário
    if (imobiliariaId && imovel.imobiliariaId !== imobiliariaId) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Você não tem permissão para editar este imóvel'
      }, { status: 403 });
    }
    
    // Mapear o campo para o campo correto do modelo Imovel
    const camposMapeados: Record<string, string> = {
      'valor': 'valor',
      'preço': 'valor',
      'preco': 'valor',
      'price': 'valor',
      'título': 'titulo',
      'titulo': 'titulo',
      'title': 'titulo',
      'descrição': 'descricao',
      'descricao': 'descricao',
      'description': 'descricao',
      'endereço': 'endereco',
      'endereco': 'endereco',
      'address': 'endereco',
      'código': 'codigo',
      'codigo': 'codigo',
      'code': 'codigo',
      'quartos': 'quartos',
      'rooms': 'quartos',
      'bedrooms': 'quartos',
      'banheiros': 'banheiros',
      'bathrooms': 'banheiros',
      'suites': 'suites',
      'cozinhas': 'cozinhas',
      'kitchens': 'cozinhas',
      'garagem': 'vagas',
      'vagas': 'vagas',
      'parkingspaces': 'vagas',
      'área': 'areaTotal',
      'area': 'areaTotal',
      'totalarea': 'areaTotal',
      'área construída': 'areaConstruida',
      'areaconstruida': 'areaConstruida',
      'builtarea': 'areaConstruida',
      'cidade': 'cidade',
      'city': 'cidade',
      'bairro': 'bairro',
      'neighborhood': 'bairro',
      'estado': 'estado',
      'state': 'estado',
      'cep': 'cep',
      'zipcode': 'cep',
      'statusImovel': 'status',
      'status': 'status',
      'adicionais': 'adicionais',
      'amenidades': 'adicionais',
      'recursos': 'adicionais',
      'extras': 'adicionais'
    };
    
    const campoMapeado = camposMapeados[campo.toLowerCase()] || campo;
    
    // Converter o valor para o tipo adequado
    let valorConvertido: any = valor;
    
    // Conversão de números
    if (['valor', 'quartos', 'banheiros', 'suites', 'cozinhas', 'vagas', 'areaTotal', 'areaConstruida'].includes(campoMapeado)) {
      // Remover símbolos de moeda, pontos e vírgulas para conversão
      if (typeof valor === 'string') {
        const valorLimpo = valor.replace(/[^\d,.]/g, '').replace(',', '.');
        
        // Converte para número inteiro ou float dependendo do campo
        if (['quartos', 'banheiros', 'suites', 'cozinhas', 'vagas'].includes(campoMapeado)) {
          valorConvertido = parseInt(valorLimpo) || 0;
        } else {
          valorConvertido = parseFloat(valorLimpo) || 0;
        }
      } else if (typeof valor === 'number') {
        valorConvertido = valor;
      }
    }
    
    // Verificar se o campo existe no modelo Imovel ou se é o campo especial 'adicionais'
    const imovelModel = Reflect.ownKeys(prisma.imovel.fields);
    
    // Tratamento especial para adicionais que é um relacionamento, não um campo direto
    if (campoMapeado !== 'adicionais' && !imovelModel.includes(campoMapeado)) {
      return NextResponse.json({
        sucesso: false,
        mensagem: `Campo '${campo}' não existe no modelo de Imóvel`
      }, { status: 400 });
    }
    
    // Caso especial para adicionais
    if (campo.toLowerCase() === 'adicionais') {
      console.log('Processando adicionais:', adicionais);
      
      // Processamento de adicionais
      try {
        // Lista para armazenar IDs dos adicionais
        const idsAdicionais = [];
        
        // Para cada adicional, verifica se existe ou cria um novo
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
          
          idsAdicionais.push(adicional.id);
        }
        
        // Busca o imóvel com seus adicionais atuais
        const imovelComAdicionais = await prisma.imovel.findUnique({
          where: { id: imovelId },
          include: { adicionais: true }
        });
        
        if (!imovelComAdicionais) {
          return NextResponse.json({
            sucesso: false,
            mensagem: 'Imóvel não encontrado ao tentar atualizar adicionais'
          }, { status: 404 });
        }
        
        // Se for para substituir os adicionais existentes (update), primeiro remove todos os existentes
        try {
          console.log('Removendo adicionais existentes do imóvel:', imovelId);
          await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`DELETE FROM "_ImovelAdicionais" WHERE "A" = ${imovelId}`;
          });
        } catch (error) {
          console.error('Erro ao remover adicionais existentes:', error);
          throw error;
        }
        
        // Adiciona os novos adicionais
        try {
          // Primeiro, verificamos se o imóvel realmente existe
          const imovelExiste = await prisma.imovel.findUnique({
            where: { id: imovelId }
          });
          
          if (!imovelExiste) {
            throw new Error(`Imóvel com ID ${imovelId} não encontrado`);
          }
          
          // Agora adicionamos os adicionais usando o método connect do Prisma em vez de SQL direto
          await prisma.imovel.update({
            where: { id: imovelId },
            data: {
              adicionais: {
                connect: idsAdicionais.map(id => ({ id }))
              }
            }
          });
          
          console.log('Adicionais conectados com sucesso ao imóvel:', idsAdicionais);
        } catch (error) {
          console.error('Erro ao adicionar novos adicionais:', error);
          throw error;
        }
        
        // Busca o imóvel atualizado com seus novos adicionais
        const imovelAtualizado = await prisma.imovel.findUnique({
          where: { id: imovelId },
          include: { adicionais: true }
        });
        
        return NextResponse.json({
          sucesso: true,
          mensagem: `Adicionais do imóvel atualizados com sucesso: ${adicionais.join(', ')}`,
          imovel: imovelAtualizado
        });
      } catch (error) {
        console.error('Erro ao atualizar adicionais:', error);
        return NextResponse.json({
          sucesso: false,
          mensagem: `Erro ao atualizar adicionais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }, { status: 500 });
      }
    } else {
      // Atualização normal de campos
      const dados: any = {};
      dados[campoMapeado] = valorConvertido;
      
      const imovelAtualizado = await prisma.imovel.update({
        where: { id: imovelId },
        data: dados,
        include: { adicionais: true }
      });
      
      return NextResponse.json({
        sucesso: true,
        mensagem: `Imóvel atualizado com sucesso. Campo '${campo}' alterado para '${valor}'`,
        imovel: imovelAtualizado
      });
    }
    
  } catch (error: any) {
    console.error('Erro ao editar imóvel:', error);
    
    return NextResponse.json({
      sucesso: false,
      mensagem: `Erro ao editar imóvel: ${error.message || 'Erro desconhecido'}`,
      erro: error
    }, { status: 500 });
  }
}
