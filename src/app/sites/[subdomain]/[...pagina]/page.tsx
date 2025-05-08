import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteRenderer from "@/components/website-builder/site-renderer";

interface SitePageProps {
  params: {
    subdomain: string;
    pagina: string[];
  };
}

export async function generateMetadata({ params }: SitePageProps) {
  const { subdomain, pagina } = params;
  const slug = pagina[0] || "home";
  
  // Buscar site pelo subdomínio
  const site = await prisma.imobiliariaSite.findUnique({
    where: { subdominio: subdomain },
    include: {
      imobiliaria: {
        include: {
          user: true
        }
      },
      paginas: {
        where: {
          slug
        }
      }
    }
  });
  
  if (!site) {
    return {
      title: "Site não encontrado",
      description: "O site solicitado não foi encontrado."
    };
  }

  const paginaAtual = site.paginas[0];
  
  return {
    title: paginaAtual?.metaTitulo || `${paginaAtual?.titulo} | ${site.nome}` || site.nome,
    description: paginaAtual?.metaDescricao || site.metaDescricao || site.descricao || `Site da imobiliária ${site.nome}`,
    openGraph: {
      images: [paginaAtual?.imagemShare || site.logoUrl || ''],
    },
  };
}

export default async function SitePageWithRoute({ params }: SitePageProps) {
  const { subdomain, pagina } = params;
  const slug = pagina[0] || "home";
  
  console.log(`Acessando site: ${subdomain}, página: ${slug}`);
  
  // Buscar site pelo subdomínio
  const site = await prisma.imobiliariaSite.findUnique({
    where: { subdominio: subdomain },
    include: {
      imobiliaria: {
        include: {
          user: true
        }
      },
      paginas: {
        orderBy: {
          ordem: 'asc'
        }
      },
      template: true
    }
  });
  
  // Se não encontrar site, retornar 404
  if (!site || !site.template) {
    console.error(`Site não encontrado: ${subdomain}`);
    notFound();
  }
  
  // Buscar a página atual
  const paginaAtual = site.paginas.find(p => p.slug === slug);
  
  // Se a página não existir e não for a página inicial, retornar 404
  if (!paginaAtual && slug !== "home") {
    console.error(`Página não encontrada: ${slug}`);
    notFound();
  }
  
  // Buscar imóveis da imobiliária para exibir no site
  const imoveis = await prisma.imovel.findMany({
    where: { 
      imobiliariaId: site.imobiliariaId,
      status: 'ATIVO' 
    },
    include: {
      fotos: true,
      adicionais: true
    },
    take: 20
  });
  
  // Gerar configuração do site para o renderizador
  const siteConfig: any = {
    id: site.id,
    nome: site.nome,
    subdominio: site.subdominio,
    template: site.template.slug,
    templateId: site.templateId,
    corPrimaria: site.corPrimaria,
    corSecundaria: site.corSecundaria,
    corAcentuacao: site.corAcentuacao,
    corTexto: site.corTexto,
    fonteTitulos: site.fonteTitulos,
    fonteCorpo: site.fonteCorpo,
    logoUrl: site.logoUrl,
    paginaAtual: slug,
    imobiliaria: {
      nome: site.imobiliaria.user.nome,
      telefone: site.imobiliaria.telefone,
      whatsapp: site.whatsapp,
      email: site.email || site.imobiliaria.user.email,
      endereco: site.endereco || site.imobiliaria.endereco,
      cidade: site.imobiliaria.cidade,
      estado: site.imobiliaria.estado
    },
    paginas: site.paginas.map(pagina => ({
      id: pagina.id,
      titulo: pagina.titulo,
      slug: pagina.slug,
      tipo: pagina.tipo,
      conteudo: typeof pagina.conteudo === 'string' 
        ? JSON.parse(pagina.conteudo)
        : pagina.conteudo
    })),
    imoveis: imoveis.map(imovel => ({
      id: imovel.id,
      titulo: imovel.titulo,
      descricao: imovel.descricao,
      precoVenda: imovel.valor,
      // O campo valorLocacao pode não existir, então tratamos como opcional
      precoLocacao: (imovel as any).valorLocacao,
      tipo: imovel.tipoImovel,
      operacao: imovel.tipoOperacao,
      endereco: `${imovel.endereco}, ${imovel.numero}, ${imovel.bairro}, ${imovel.cidade}/${imovel.estado}`,
      bairro: imovel.bairro,
      cidade: imovel.cidade,
      estado: imovel.estado,
      cep: imovel.cep,
      quartos: imovel.quartos,
      banheiros: imovel.banheiros,
      suites: imovel.suites,
      vagas: imovel.vagas,
      areaTotal: imovel.areaTotal,
      areaConstruida: imovel.areaConstruida,
      fotoPrincipal: imovel.fotoPrincipal || (imovel.fotos?.length > 0 ? imovel.fotos[0].url : null),
      fotos: imovel.fotos?.map(foto => foto.url) || [],
      adicionais: imovel.adicionais?.map(adicional => adicional.nome) || []
    }))
  };
  
  return <SiteRenderer site={siteConfig} />;
}
