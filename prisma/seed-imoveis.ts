import { PrismaClient, TipoImovel, TipoOperacao, StatusImovel, Adicional } from '@prisma/client';

const prisma = new PrismaClient();

// Mapa para armazenar adicionais
const adicionaisMap = new Map<string, string>();

async function main() {
  try {
    console.log('Iniciando seed de imóveis...');

    // Verifica se já existem imóveis no banco
    const imoveisCount = await prisma.imovel.count();
    if (imoveisCount > 0) {
      console.log(`Já existem ${imoveisCount} imóveis cadastrados. Pulando seed.`);
      return;
    }

    // Buscar uma imobiliária para associar aos imóveis
    const imobiliaria = await prisma.imobiliaria.findFirst({
      where: { user: { role: 'IMOBILIARIA' } },
      include: { corretores: true }
    });

    if (!imobiliaria) {
      console.log('Nenhuma imobiliária encontrada. Seed cancelado.');
      return;
    }

    console.log(`Imobiliária encontrada: ${imobiliaria.id}`);
    
    // Verificar se a imobiliária tem corretores
    if (!imobiliaria.corretores || imobiliaria.corretores.length === 0) {
      console.log('Imobiliária não possui corretores. Criando um corretor demo...');
      
      // Criar um usuário e corretor demo
      const userCorretor = await prisma.user.create({
        data: {
          nome: 'Corretor Demo',
          email: 'corretor.demo@tappyimob.com',
          senha: '$2a$10$eYsB9q.ih9U62V0YCd3pNeR7yhJ2FYgJEMJl6Q8JXN2KOITdZVSk2', // senha123
          role: 'CORRETOR',
          status: 'ATIVO',
        }
      });
      
      const corretor = await prisma.corretor.create({
        data: {
          id: userCorretor.id,
          telefone: '(11) 98765-4321',
          cidade: 'São Paulo',
          estado: 'SP',
          creci: 'CRECI-123456',
          fotoPerfil: 'https://source.unsplash.com/random/200x200/?person',
          imobiliariaId: imobiliaria.id
        }
      });
      
      console.log(`Corretor demo criado: ${corretor.id}`);
      imobiliaria.corretores = [corretor];
    }

    // Coleção de adicionais para os imóveis
    const adicionais = [
      'Ar condicionado', 'Varanda', 'Piscina', 'Academia', 
      'Churrasqueira', 'Segurança 24h', 'Portaria', 'Playground',
      'Quadra de esportes', 'Salão de festas', 'Área gourmet',
      'Aquecimento solar', 'Jardim', 'Closet', 'Despensa'
    ];

    // Criar adicionais no banco de dados
    for (const adicional of adicionais) {
      const adicionalExistente = await prisma.adicional.findFirst({
        where: { nome: adicional }
      });
      
      if (!adicionalExistente) {
        const novoAdicional = await prisma.adicional.create({
          data: { nome: adicional }
        });
        adicionaisMap.set(adicional, novoAdicional.id);
      } else {
        adicionaisMap.set(adicional, adicionalExistente.id);
      }
    }

    // Dados para criação de 20 imóveis variados
    const imoveisData = [
      {
        codigo: `${imobiliaria.id.substring(0, 4).toUpperCase()}-0001`,
        titulo: 'Apartamento moderno no Centro',
        descricao: 'Lindo apartamento totalmente reformado no coração da cidade. Próximo a transportes públicos, restaurantes e comércio em geral.',
        valor: 450000,
        tipoOperacao: 'VENDA' as TipoOperacao,
        tipoImovel: 'APARTAMENTO' as TipoImovel,
        status: 'ATIVO' as StatusImovel,
        endereco: 'Rua das Flores',
        bairro: 'Centro',
        numero: '123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000',
        areaTotal: 65,
        areaConstruida: 65,
        quartos: 2,
        suites: 1,
        banheiros: 2,
        salas: 1,
        cozinhas: 1,
        vagas: 1,
        fotoPrincipal: 'https://source.unsplash.com/random/800x600/?apartment',
        adicionais: ['Ar condicionado', 'Varanda', 'Portaria']
      },
      {
        codigo: `${imobiliaria.id.substring(0, 4).toUpperCase()}-0002`,
        titulo: 'Casa ampla em condomínio fechado',
        descricao: 'Casa espaçosa em condomínio com total segurança. Área de lazer completa, jardim e espaço gourmet.',
        valor: 950000,
        tipoOperacao: 'VENDA' as TipoOperacao,
        tipoImovel: 'CASA' as TipoImovel,
        status: 'ATIVO' as StatusImovel,
        endereco: 'Avenida das Palmeiras',
        bairro: 'Jardim América',
        numero: '500',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '04500-000',
        areaTotal: 200,
        areaConstruida: 160,
        quartos: 3,
        suites: 2,
        banheiros: 4,
        salas: 2,
        cozinhas: 1,
        vagas: 2,
        fotoPrincipal: 'https://source.unsplash.com/random/800x600/?house',
        adicionais: ['Churrasqueira', 'Piscina', 'Segurança 24h', 'Jardim']
      },
      {
        codigo: `${imobiliaria.id.substring(0, 4).toUpperCase()}-0003`,
        titulo: 'Sala comercial no melhor ponto da cidade',
        descricao: 'Sala comercial em localização estratégica com alta visibilidade. Prédio novo com infraestrutura completa.',
        valor: 350000,
        tipoOperacao: 'VENDA' as TipoOperacao,
        tipoImovel: 'SALA_COMERCIAL' as TipoImovel,
        status: 'ATIVO' as StatusImovel,
        endereco: 'Av. Paulista',
        bairro: 'Bela Vista',
        numero: '1000',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-000',
        areaTotal: 50,
        areaConstruida: 50,
        quartos: 0,
        suites: 0,
        banheiros: 1,
        salas: 1,
        cozinhas: 0,
        vagas: 1,
        fotoPrincipal: 'https://source.unsplash.com/random/800x600/?office',
        adicionais: ['Ar condicionado', 'Portaria', 'Segurança 24h']
      },
      {
        codigo: `${imobiliaria.id.substring(0, 4).toUpperCase()}-0004`,
        titulo: 'Apartamento de luxo com vista para o mar',
        descricao: 'Apartamento de alto padrão com vista deslumbrante para o mar. Acabamento premium e design exclusivo.',
        valor: 1800000,
        tipoOperacao: 'VENDA' as TipoOperacao,
        tipoImovel: 'APARTAMENTO' as TipoImovel,
        status: 'ATIVO' as StatusImovel,
        endereco: 'Av. Atlântica',
        bairro: 'Copacabana',
        numero: '1500',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '22021-000',
        areaTotal: 150,
        areaConstruida: 150,
        quartos: 3,
        suites: 3,
        banheiros: 4,
        salas: 2,
        cozinhas: 1,
        vagas: 2,
        fotoPrincipal: 'https://source.unsplash.com/random/800x600/?luxury,apartment',
        adicionais: ['Ar condicionado', 'Varanda', 'Piscina', 'Academia', 'Segurança 24h']
      },
      {
        codigo: `${imobiliaria.id.substring(0, 4).toUpperCase()}-0005`,
        titulo: 'Terreno em área de expansão',
        descricao: 'Excelente terreno plano em região de grande valorização. Ideal para construção residencial ou comercial.',
        valor: 550000,
        tipoOperacao: 'VENDA' as TipoOperacao,
        tipoImovel: 'TERRENO' as TipoImovel,
        status: 'ATIVO' as StatusImovel,
        endereco: 'Estrada Municipal',
        bairro: 'Novo Horizonte',
        numero: 's/n',
        cidade: 'Campinas',
        estado: 'SP',
        cep: '13000-000',
        areaTotal: 500,
        areaConstruida: 0,
        quartos: 0,
        suites: 0,
        banheiros: 0,
        salas: 0,
        cozinhas: 0,
        vagas: 0,
        fotoPrincipal: 'https://source.unsplash.com/random/800x600/?land',
        adicionais: []
      }
    ];

    // Criar imóveis no banco de dados
    for (const imovelData of imoveisData) {
      console.log(`Criando imóvel: ${imovelData.titulo}`);
      
      // Selecionar aleatoriamente um corretor da imobiliária
      const corretorIndex = Math.floor(Math.random() * imobiliaria.corretores.length);
      const corretor = imobiliaria.corretores[corretorIndex];

      // Criar o imóvel no banco
      await prisma.imovel.create({
        data: {
          codigo: imovelData.codigo,
          titulo: imovelData.titulo,
          descricao: imovelData.descricao,
          valor: imovelData.valor,
          tipoOperacao: imovelData.tipoOperacao,
          tipoImovel: imovelData.tipoImovel,
          status: imovelData.status,
          endereco: imovelData.endereco,
          bairro: imovelData.bairro,
          numero: imovelData.numero,
          cidade: imovelData.cidade,
          estado: imovelData.estado,
          cep: imovelData.cep,
          areaTotal: imovelData.areaTotal,
          areaConstruida: imovelData.areaConstruida,
          quartos: imovelData.quartos,
          suites: imovelData.suites,
          banheiros: imovelData.banheiros,
          salas: imovelData.salas,
          cozinhas: imovelData.cozinhas,
          vagas: imovelData.vagas,
          fotoPrincipal: imovelData.fotoPrincipal,
          imobiliaria: {
            connect: { id: imobiliaria.id }
          },
          corretor: {
            connect: { id: corretor.id }
          },
          adicionais: {
            connect: imovelData.adicionais
              .filter(adicional => adicionaisMap.has(adicional))
              .map(adicional => ({
                id: adicionaisMap.get(adicional)
              })),
          }
        }
      });
    }

    console.log('Seed de imóveis concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed de imóveis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
