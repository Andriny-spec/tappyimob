import { PrismaClient, Role, StatusUser, TipoImovel, TipoOperacao, StatusImovel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Criar um administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      nome: 'Administrador',
      email: 'admin@tappyimob.com',
      senha: adminPassword,
      role: Role.ADMIN,
      admin: {
        create: {}
      }
    },
    include: {
      admin: true
    }
  });
  console.log('Administrador criado:', admin.email);

  // Criar uma imobiliária
  const imobiliariaPassword = await bcrypt.hash('imobiliaria123', 10);
  const imobiliaria = await prisma.user.create({
    data: {
      nome: 'Imobiliária Exemplo',
      email: 'imobiliaria@exemplo.com',
      senha: imobiliariaPassword,
      role: Role.IMOBILIARIA,
      imobiliaria: {
        create: {
          telefone: '(11) 99999-9999',
          endereco: 'Av. Paulista',
          bairro: 'Bela Vista',
          numero: '1000',
          cidade: 'São Paulo',
          estado: 'SP',
          cnpj: '12.345.678/0001-99'
        }
      }
    },
    include: {
      imobiliaria: true
    }
  });
  console.log('Imobiliária criada:', imobiliaria.email);

  // Criar um corretor
  const corretorPassword = await bcrypt.hash('corretor123', 10);
  const corretor = await prisma.user.create({
    data: {
      nome: 'João Corretor',
      email: 'corretor@exemplo.com',
      senha: corretorPassword,
      role: Role.CORRETOR,
      corretor: {
        create: {
          telefone: '(11) 88888-8888',
          endereco: 'Rua Augusta',
          bairro: 'Consolação',
          numero: '500',
          cidade: 'São Paulo',
          estado: 'SP',
          cpf: '123.456.789-10',
          creci: '12345',
          imobiliariaId: imobiliaria.imobiliaria?.id
        }
      }
    },
    include: {
      corretor: true
    }
  });
  console.log('Corretor criado:', corretor.email);

  // Criar um cliente
  const clientePassword = await bcrypt.hash('cliente123', 10);
  const cliente = await prisma.user.create({
    data: {
      nome: 'Maria Cliente',
      email: 'cliente@exemplo.com',
      senha: clientePassword,
      role: Role.CLIENTE,
      cliente: {
        create: {
          telefone: '(11) 77777-7777',
          endereco: 'Rua Oscar Freire',
          bairro: 'Jardins',
          numero: '100',
          cidade: 'São Paulo',
          estado: 'SP',
          cpf: '987.654.321-00',
          imobiliariaId: imobiliaria.imobiliaria?.id
        }
      }
    },
    include: {
      cliente: true
    }
  });
  console.log('Cliente criado:', cliente.email);

  // Criar categorias de imóveis
  const categorias = await Promise.all([
    prisma.categoria.create({
      data: { nome: 'Residencial', descricao: 'Imóveis para moradia' }
    }),
    prisma.categoria.create({
      data: { nome: 'Comercial', descricao: 'Imóveis para negócios' }
    }),
    prisma.categoria.create({
      data: { nome: 'Industrial', descricao: 'Imóveis para indústrias' }
    }),
    prisma.categoria.create({
      data: { nome: 'Rural', descricao: 'Imóveis em áreas rurais' }
    })
  ]);
  console.log('Categorias criadas:', categorias.length);

  // Criar adicionais
  const adicionais = await Promise.all([
    prisma.adicional.create({
      data: { nome: 'Piscina' }
    }),
    prisma.adicional.create({
      data: { nome: 'Academia' }
    }),
    prisma.adicional.create({
      data: { nome: 'Área de lazer' }
    }),
    prisma.adicional.create({
      data: { nome: 'Churrasqueira' }
    }),
    prisma.adicional.create({
      data: { nome: 'Segurança 24h' }
    })
  ]);
  console.log('Adicionais criados:', adicionais.length);

  // Criar plano
  const plano = await prisma.plano.create({
    data: {
      nome: 'Plano Premium',
      descricao: 'Plano completo para imobiliárias',
      valor: 199.90,
      tempoDuracao: 30,
      beneficios: {
        create: [
          { descricao: 'Anúncios ilimitados' },
          { descricao: 'Destaque nos resultados de busca' },
          { descricao: 'Relatórios avançados' },
          { descricao: 'Suporte prioritário' }
        ]
      }
    }
  });
  console.log('Plano criado:', plano.nome);

  // Vincular plano à imobiliária
  await prisma.imobiliaria.update({
    where: { id: imobiliaria.imobiliaria?.id },
    data: { planoId: plano.id }
  });

  // Criar imóveis
  const imovel1 = await prisma.imovel.create({
    data: {
      codigo: 'AP001',
      titulo: 'Apartamento com 3 quartos em Jardins',
      descricao: 'Lindo apartamento com excelente localização e acabamento de alto padrão',
      valor: 850000,
      tipoOperacao: TipoOperacao.VENDA,
      tipoImovel: TipoImovel.APARTAMENTO,
      endereco: 'Rua Haddock Lobo',
      bairro: 'Jardins',
      numero: '1234',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01414-000',
      areaTotal: 120,
      areaConstruida: 110,
      salas: 1,
      cozinhas: 1,
      banheiros: 2,
      quartos: 3,
      suites: 1,
      vagas: 2,
      fotoPrincipal: 'https://images.unsplash.com/photo-1515263487990-61b07816b324',
      imobiliariaId: imobiliaria.imobiliaria?.id,
      corretorId: corretor.corretor?.id,
      categorias: {
        connect: [{ id: categorias[0].id }]
      },
      adicionais: {
        connect: [
          { id: adicionais[2].id },
          { id: adicionais[4].id }
        ]
      },
      fotos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            legenda: 'Fachada',
            ordem: 1
          },
          {
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
            legenda: 'Sala de estar',
            ordem: 2
          },
          {
            url: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912',
            legenda: 'Cozinha',
            ordem: 3
          }
        ]
      }
    }
  });

  const imovel2 = await prisma.imovel.create({
    data: {
      codigo: 'CA001',
      titulo: 'Casa ampla com quintal em Moema',
      descricao: 'Casa espaçosa com quintal grande e área gourmet para família',
      valor: 1200000,
      tipoOperacao: TipoOperacao.VENDA,
      tipoImovel: TipoImovel.CASA,
      endereco: 'Alameda dos Nhambiquaras',
      bairro: 'Moema',
      numero: '500',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04090-001',
      areaTotal: 250,
      areaConstruida: 180,
      salas: 2,
      cozinhas: 1,
      banheiros: 3,
      quartos: 4,
      suites: 2,
      vagas: 3,
      fotoPrincipal: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
      imobiliariaId: imobiliaria.imobiliaria?.id,
      corretorId: corretor.corretor?.id,
      categorias: {
        connect: [{ id: categorias[0].id }]
      },
      adicionais: {
        connect: [
          { id: adicionais[0].id },
          { id: adicionais[3].id }
        ]
      },
      fotos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
            legenda: 'Fachada',
            ordem: 1
          },
          {
            url: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c',
            legenda: 'Área externa',
            ordem: 2
          },
          {
            url: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
            legenda: 'Sala de jantar',
            ordem: 3
          }
        ]
      }
    }
  });
  console.log('Imóveis criados:', 2);

  // Criar avaliações
  const avaliacao = await prisma.avaliacao.create({
    data: {
      titulo: 'Ótimo atendimento',
      descricao: 'O corretor foi muito atencioso e prestativo durante todo o processo',
      nota: 5,
      usuarioId: cliente.id,
      corretorId: corretor.corretor?.id
    }
  });

  const avaliacaoImovel = await prisma.avaliacao.create({
    data: {
      titulo: 'Imóvel excelente',
      descricao: 'O imóvel estava exatamente como descrito. Ótima localização e acabamento',
      nota: 5,
      usuarioId: cliente.id,
      imovelId: imovel1.id
    }
  });
  console.log('Avaliações criadas:', 2);

  // Criar mensagens
  const mensagem = await prisma.mensagem.create({
    data: {
      nome: 'Carlos Interessado',
      email: 'carlos@email.com',
      telefone: '(11) 98765-4321',
      conteudo: 'Tenho interesse no apartamento em Jardins. É possível agendar uma visita?',
      corretorId: corretor.corretor?.id
    }
  });
  console.log('Mensagem criada:', mensagem.id);

  // Criar relatório
  const relatorio = await prisma.relatorio.create({
    data: {
      titulo: 'Relatório de Acessos',
      descricao: 'Acessos ao site em março de 2025',
      tipo: 'acessos',
      dadosJson: JSON.stringify({
        total: 1500,
        novosUsuarios: 350,
        taxaConversao: 2.8,
        fontesTrafego: {
          organico: 750,
          direto: 450,
          social: 200,
          email: 100
        }
      }),
      imobiliariaId: imobiliaria.imobiliaria?.id
    }
  });
  console.log('Relatório criado:', relatorio.id);

  // Dados do relatório por usuário
  const relatorioUsuario = await prisma.relatorioUsuario.create({
    data: {
      tipoAcao: 'acesso',
      dados: JSON.stringify({
        paginaAcessada: '/imoveis/SP001',
        tempoNavegacao: 175,
        dispositivo: 'mobile',
        browser: 'chrome'
      }),
      usuarioId: cliente.id,
      clienteId: cliente.cliente?.id
    }
  });
  console.log('Dados do relatório por usuário criados:', relatorioUsuario.id);

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });