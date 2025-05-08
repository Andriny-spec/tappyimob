import { PrismaClient, Role, StatusUser, TipoImovel, StatusImovel, TipoOperacao } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar um administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@tappyimob.com' },
      update: {},
      create: {
        nome: 'Administrador',
        email: 'admin@tappyimob.com',
        senha: adminPassword,
        role: Role.ADMIN,
        status: StatusUser.ATIVO,
        admin: {
          create: {}
        }
      }
    });
    console.log('Administrador criado:', admin.email);

    // Criar uma imobiliária
    const imobiliariaPassword = await bcrypt.hash('imobiliaria123', 10);
    const imobiliaria = await prisma.user.upsert({
      where: { email: 'imobiliaria@exemplo.com' },
      update: {},
      create: {
        nome: 'Imobiliária Exemplo',
        email: 'imobiliaria@exemplo.com',
        senha: imobiliariaPassword,
        role: Role.IMOBILIARIA,
        status: StatusUser.ATIVO,
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
      }
    });
    console.log('Imobiliária criada:', imobiliaria.email);

    // Criar um site para a imobiliária
    // Primeiro, criar um template de site
    const template = await prisma.siteTemplate.upsert({
      where: { slug: 'moderno-padrao' },
      update: {},
      create: {
        nome: 'Moderno Padrão',
        slug: 'moderno-padrao',
        descricao: 'Template moderno para imobiliárias',
        tipo: 'MODERNO',
        previewUrl: 'https://exemplo.com/preview-template.jpg',
        destaques: ['Design responsivo', 'SEO otimizado', 'Integração com WhatsApp']
      }
    });
    console.log('Template de site criado:', template.nome);
    
    // Depois, criar o site da imobiliária
    const site = await prisma.imobiliariaSite.create({
      data: {
        nome: 'Site Imobiliária Exemplo',
        subdominio: 'exemplo',
        descricao: 'Site oficial da Imobiliária Exemplo',
        status: 'PUBLICADO',
        corPrimaria: '#25D366',
        corSecundaria: '#F8FAFC',
        whatsapp: '(11) 99999-9999',
        email: 'contato@exemplo.com',
        imobiliariaId: imobiliaria.id,
        templateId: template.id
      }
    });
    console.log('Site da imobiliária criado:', site.nome);

    // Criar um corretor
    const corretorPassword = await bcrypt.hash('corretor123', 10);
    const corretor = await prisma.user.upsert({
      where: { email: 'corretor@exemplo.com' },
      update: {},
      create: {
        nome: 'João Corretor',
        email: 'corretor@exemplo.com',
        senha: corretorPassword,
        role: Role.CORRETOR,
        status: StatusUser.ATIVO,
        corretor: {
          create: {
            telefone: '(11) 88888-8888',
            endereco: 'Rua Augusta',
            bairro: 'Consolação',
            numero: '500',
            cidade: 'São Paulo',
            estado: 'SP',
            cpf: '123.456.789-00',
            creci: 'CRECI-12345',
            imobiliariaId: undefined // Será definido após a execução
          }
        }
      }
    });
    console.log('Corretor criado:', corretor.email);

    // Criar um cliente
    const clientePassword = await bcrypt.hash('cliente123', 10);
    const cliente = await prisma.user.upsert({
      where: { email: 'cliente@exemplo.com' },
      update: {},
      create: {
        nome: 'Willian Cliente',
        email: 'cliente@exemplo.com',
        senha: clientePassword,
        role: Role.CLIENTE,
        status: StatusUser.ATIVO,
        cliente: {
          create: {
            telefone: '(11) 88888-8888',
            endereco: 'Rua Augusta',
            bairro: 'Consolação',
            numero: '500',
            cidade: 'São Paulo',
            estado: 'SP',
            cpf: '123.456.789-00',
            statusLead: 'INTERESSADO',
            tipoLead: 'COMPRADOR',
            origemLead: 'SITE',
            temperatura: 4
          }
        }
      }
    });
    console.log('Cliente criado:', cliente.email);

    // Relacionar o corretor com a imobiliária
    await prisma.corretor.update({
      where: { id: corretor.id },
      data: {
        imobiliaria: {
          connect: { id: imobiliaria.id }
        }
      }
    });
    console.log('Corretor vinculado à imobiliária');

    // Criar lembrete para o corretor
    await prisma.lembrete.create({
      data: {
        titulo: 'Contatar cliente Willian',
        descricao: 'Entrar em contato para mostrar imóveis no centro',
        dataAlerta: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // amanhã
        corretorId: corretor.id,
        clienteId: cliente.id
      }
    });
    console.log('Lembrete criado para o corretor');

    // Criar notificação para o cliente
    await prisma.notificacao.create({
      data: {
        titulo: 'Bem-vindo à Imobiliária Exemplo',
        mensagem: 'Obrigado por se cadastrar! Nossos corretores já estão preparando as melhores opções para você.',
        clienteId: cliente.id
      }
    });
    console.log('Notificação criada para o cliente');

    // Criar alguns exemplos de imóveis
    // Primeiramente, criar um código único para o imóvel
    const codigoImovel1 = `AP${Math.floor(100000 + Math.random() * 900000)}`;
    const imovel1 = await prisma.imovel.create({
      data: {
        codigo: codigoImovel1,
        titulo: 'Apartamento Luxuoso',
        descricao: 'Excelente apartamento com vista para o mar',
        valor: 750000,
        tipoOperacao: TipoOperacao.VENDA,
        tipoImovel: TipoImovel.APARTAMENTO,
        status: StatusImovel.ATIVO,
        endereco: 'Av. Atlântica',
        bairro: 'Copacabana',
        numero: '500',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '22010-000',
        latitude: -22.9671,
        longitude: -43.1857,
        areaTotal: 120,
        areaConstruida: 110,
        quartos: 3,
        banheiros: 2,
        vagas: 2,
        salas: 1,
        imobiliariaId: imobiliaria.id,
        corretorId: corretor.id
      }
    });
    console.log('Imóvel criado:', imovel1.titulo);

    // Adicionar fotos ao imóvel
    await prisma.fotoImovel.create({
      data: {
        url: 'https://exemplo.com/imoveis/apartamento1.jpg',
        legenda: 'Vista frontal',
        ordem: 1,
        imovelId: imovel1.id
      }
    });
    console.log('Foto adicionada ao imóvel');

    // Criar segundo imóvel
    const codigoImovel2 = `CA${Math.floor(100000 + Math.random() * 900000)}`;
    const imovel2 = await prisma.imovel.create({
      data: {
        codigo: codigoImovel2,
        titulo: 'Casa Térrea com Quintal',
        descricao: 'Casa ampla em condomínio fechado',
        valor: 1200000,
        tipoOperacao: TipoOperacao.VENDA,
        tipoImovel: TipoImovel.CASA,
        status: StatusImovel.ATIVO,
        endereco: 'Alameda dos Ipês',
        bairro: 'Alphaville',
        numero: '120',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '06453-000',
        latitude: -23.4848,
        longitude: -46.8763,
        areaTotal: 250,
        areaConstruida: 200,
        quartos: 4,
        banheiros: 3,
        vagas: 3,
        salas: 2,
        imobiliariaId: imobiliaria.id,
        corretorId: corretor.id
      }
    });
    console.log('Imóvel criado:', imovel2.titulo);

    // Criar interação entre cliente e corretor
    await prisma.interacao.create({
      data: {
        tipo: 'Email',
        descricao: 'Cliente solicitou mais informações sobre o imóvel',
        resultado: 'Agendamento de visita',
        clienteId: cliente.id,
        corretorId: corretor.id
      }
    });
    console.log('Interação criada entre cliente e corretor');

    // Criar avaliação para o imóvel
    await prisma.avaliacao.create({
      data: {
        titulo: 'Excelente localização',
        descricao: 'Imóvel com ótimo acabamento e localização privilegiada',
        nota: 5,
        usuarioId: cliente.id,
        imovelId: imovel1.id
      }
    });
    console.log('Avaliação criada para o imóvel');

    console.log('Seed concluído com sucesso.');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
