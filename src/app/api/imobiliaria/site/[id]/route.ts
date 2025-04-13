import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { StatusSite } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const imobiliariaId = session.user.id;
    const siteId = params.id;

    // Verificar se é uma imobiliária
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId }
    });

    if (!imobiliaria) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar o site específico
    const site = await prisma.imobiliariaSite.findUnique({
      where: { 
        id: siteId,
        imobiliariaId, // Garante que o site pertence à imobiliária logada
      },
      include: {
        template: true,
        paginas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!site) {
      return NextResponse.json({ error: 'Site não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ site });

  } catch (error) {
    console.error('Erro ao buscar site:', error);
    return NextResponse.json({ error: 'Erro ao buscar site' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const imobiliariaId = session.user.id;
    const siteId = params.id;

    // Verificar se é uma imobiliária
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId }
    });

    if (!imobiliaria) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se o site existe e pertence à imobiliária
    const siteExistente = await prisma.imobiliariaSite.findUnique({
      where: { 
        id: siteId,
        imobiliariaId, // Garante que o site pertence à imobiliária logada
      }
    });

    if (!siteExistente) {
      return NextResponse.json({ error: 'Site não encontrado' }, { status: 404 });
    }

    // Obter dados atualizados
    const dados = await request.json();
    
    // Se quiser atualizar o subdomínio, verificar se já existe
    if (dados.subdominio && dados.subdominio !== siteExistente.subdominio) {
      const siteDuplicado = await prisma.imobiliariaSite.findUnique({
        where: { subdominio: dados.subdominio }
      });

      if (siteDuplicado) {
        return NextResponse.json({ 
          error: 'Este subdomínio já está em uso. Por favor, escolha outro.' 
        }, { status: 400 });
      }
    }

    // Atualizar o site
    const siteAtualizado = await prisma.imobiliariaSite.update({
      where: { id: siteId },
      data: {
        nome: dados.nome,
        subdominio: dados.subdominio,
        descricao: dados.descricao,
        dominioProprio: dados.dominioProprio,
        status: dados.status,
        templateId: dados.templateId,
        corPrimaria: dados.corPrimaria,
        corSecundaria: dados.corSecundaria,
        corAcentuacao: dados.corAcentuacao,
        corTexto: dados.corTexto,
        fonteTitulos: dados.fonteTitulos,
        fonteCorpo: dados.fonteCorpo,
        logoUrl: dados.logoUrl,
        faviconUrl: dados.faviconUrl,
        bannerPrincipal: dados.bannerPrincipal,
        whatsapp: dados.whatsapp,
        email: dados.email,
        telefone: dados.telefone,
        facebook: dados.facebook,
        instagram: dados.instagram,
        youtube: dados.youtube,
        linkedin: dados.linkedin,
        endereco: dados.endereco,
        metaTitulo: dados.metaTitulo,
        metaDescricao: dados.metaDescricao,
        googleAnalytics: dados.googleAnalytics,
        pixelFacebook: dados.pixelFacebook,
        scriptExterno: dados.scriptExterno,
        // Se status for mudado para PUBLICADO, atualizar data de publicação
        publicadoEm: dados.status === StatusSite.PUBLICADO && 
                    (!siteExistente.publicadoEm || siteExistente.status !== StatusSite.PUBLICADO) 
                    ? new Date() 
                    : siteExistente.publicadoEm
      }
    });

    return NextResponse.json({ 
      success: true, 
      site: siteAtualizado 
    });

  } catch (error) {
    console.error('Erro ao atualizar site:', error);
    return NextResponse.json({ error: 'Erro ao atualizar site' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const imobiliariaId = session.user.id;
    const siteId = params.id;

    // Verificar se é uma imobiliária
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId }
    });

    if (!imobiliaria) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se o site existe e pertence à imobiliária
    const siteExistente = await prisma.imobiliariaSite.findUnique({
      where: { 
        id: siteId,
        imobiliariaId, // Garante que o site pertence à imobiliária logada
      }
    });

    if (!siteExistente) {
      return NextResponse.json({ error: 'Site não encontrado' }, { status: 404 });
    }

    // Excluir o site (o cascade delete já vai remover as páginas)
    await prisma.imobiliariaSite.delete({
      where: { id: siteId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Site excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir site:', error);
    return NextResponse.json({ error: 'Erro ao excluir site' }, { status: 500 });
  }
}
