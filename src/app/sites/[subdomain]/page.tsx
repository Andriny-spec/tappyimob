import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SiteRenderer from "@/components/website-builder/site-renderer";

interface SitePageProps {
  params: {
    subdomain: string;
  };
}

export async function generateMetadata({ params }: SitePageProps) {
  const { subdomain } = params;
  
  // Buscar site pelo subdomínio
  const site = await prisma.imobiliariaSite.findUnique({
    where: { subdominio: subdomain },
    include: {
      imobiliaria: {
        include: {
          user: true
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
  
  return {
    title: site.metaTitulo || site.nome,
    description: site.metaDescricao || site.descricao || `Site da imobiliária ${site.nome}`,
    openGraph: {
      images: [site.logoUrl || ''],
    },
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { subdomain } = params;
  
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
  if (!site) {
    notFound();
  }
  
  // Buscar imóveis da imobiliária para exibir no site
  const imoveis = await prisma.imovel.findMany({
    where: { 
      imobiliariaId: site.imobiliariaId,
      statusImovel: 'ATIVO'
    },
    include: {
      fotos: true,
      adicionais: true
    },
    take: 20
  });
  
  // Gerar configuração do site para o renderizador
  const siteConfig = {
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
      precoLocacao: imovel.valorLocacao,
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
