import { PrismaClient, TipoTemplate } from '@prisma/client';

const prisma = new PrismaClient();

// Templates pré-definidos para o site de imobiliária
const templates = [
  {
    nome: 'Moderno Minimalista',
    slug: 'moderno-minimalista',
    descricao: 'Design limpo e minimalista com foco em usabilidade e experiência do usuário.',
    tipo: TipoTemplate.MODERNO,
    previewUrl: '/images/templates/moderno-minimalista.jpg',
    destaques: [
      'Layout responsivo em todos os dispositivos',
      'Foco em velocidade de carregamento',
      'Design clean e minimalista',
      'Valorização de imagens'
    ]
  },
  {
    nome: 'Imobiliária Tradicional',
    slug: 'tradicional',
    descricao: 'Template elegante e tradicional, ideal para imobiliárias estabelecidas no mercado.',
    tipo: TipoTemplate.TRADICIONAL,
    previewUrl: '/images/templates/tradicional.jpg',
    destaques: [
      'Design conservador e elegante',
      'Ideal para mercado de alto padrão',
      'Cores sóbrias e sofisticadas',
      'Estrutura clássica de navegação'
    ]
  },
  {
    nome: 'Imóveis de Luxo',
    slug: 'luxo',
    descricao: 'Exclusivo para o mercado de imóveis de alto padrão, com elementos sofisticados e premium.',
    tipo: TipoTemplate.LUXO,
    previewUrl: '/images/templates/luxo.jpg',
    destaques: [
      'Visual sofisticado e elegante',
      'Tipografia premium',
      'Destaque para imagens em alta resolução',
      'Transições e animações suaves'
    ]
  },
  {
    nome: 'Ultra Minimalista',
    slug: 'ultra-minimalista',
    descricao: 'Um design extremamente simples e direto, com foco total na conversão e na experiência do usuário.',
    tipo: TipoTemplate.MINIMALISTA,
    previewUrl: '/images/templates/ultra-minimalista.jpg',
    destaques: [
      'Design ultra simplificado',
      'Foco máximo em performance',
      'Layout intuitivo e prático',
      'Ênfase nos imóveis sem distrações'
    ]
  },
  {
    nome: 'Tech Imobiliária',
    slug: 'tech',
    descricao: 'Layout moderno e tecnológico, ideal para imobiliárias com foco em inovação e tecnologia.',
    tipo: TipoTemplate.TECH,
    previewUrl: '/images/templates/tech.jpg',
    destaques: [
      'Visual futurista e tecnológico',
      'Elementos interativos',
      'Modo escuro disponível',
      'Recursos avançados de visualização'
    ]
  }
];

async function main() {
  try {
    console.log('Iniciando inserção dos templates de site...');
    
    // Criar diretório public/images/templates caso não exista
    const fs = require('fs');
    const path = require('path');
    const templatesDir = path.join(process.cwd(), 'public', 'images', 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      console.log('Diretório de imagens para templates criado:', templatesDir);
    }

    // Inserir ou atualizar cada template
    for (const template of templates) {
      const templateExistente = await prisma.siteTemplate.findUnique({
        where: { slug: template.slug }
      });

      if (templateExistente) {
        await prisma.siteTemplate.update({
          where: { id: templateExistente.id },
          data: template
        });
        console.log(`Template atualizado: ${template.nome}`);
      } else {
        await prisma.siteTemplate.create({
          data: template
        });
        console.log(`Template criado: ${template.nome}`);
      }
      
      // Criar um arquivo placeholder para a imagem de preview se não existir
      const imagePath = path.join(templatesDir, `${template.slug}.jpg`);
      if (!fs.existsSync(imagePath)) {
        // Criando um arquivo vazio para servir como placeholder
        // Em ambiente de produção, você deve substituir por imagens reais
        fs.writeFileSync(imagePath, '');
        console.log(`Arquivo placeholder criado para: ${template.slug}.jpg`);
      }
    }

    console.log('Templates de site inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir templates:', error);
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
