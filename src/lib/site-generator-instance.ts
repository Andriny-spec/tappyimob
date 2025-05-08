import { prisma } from './prisma';
import { SiteGenerator as SiteContentGenerator } from './site-generator';
import { TipoPagina, StatusSite } from '@prisma/client';

/**
 * Classe para gerenciar a geração de sites de imobiliárias
 */
export class SiteGenerator {
  private siteId: string;
  private site: any = null;
  private imobiliariaId: string = '';
  private dadosImobiliaria: any = { nome: 'Imobiliária' };
  private configuracao: any = { tom: 'profissional' };
  private imoveisDaImobiliaria: any[] = [];
  private paginasGeradas: Set<string> = new Set();

  /**
   * Construtor
   * @param siteId ID do site a ser gerado
   */
  constructor(siteId: string) {
    this.siteId = siteId;
  }

  /**
   * Inicia o processo de geração do site completo
   */
  public async gerarSite(): Promise<void> {
    console.log(`Iniciando geração do site ${this.siteId}...`);
    
    try {
      // 1. Buscar informações do site no banco de dados
      await this.carregarDadosSite();
      
      // 2. Buscar informações da imobiliária
      await this.carregarDadosImobiliaria();
      
      // 3. Buscar imóveis da imobiliária
      await this.carregarImoveis();
      
      // 4. Atualizar o status do site para EM_PROCESSAMENTO
      await this.atualizarStatusSite(StatusSite.RASCUNHO);

      // 5. Gerar arquivo de configuração do site
      await this.gerarArquivoConfiguracao();
      
      // 6. Gerar conteúdo para cada página
      await this.gerarPaginas();
      
      // 7. Atualizar o status do site para PUBLICADO
      await this.atualizarStatusSite(StatusSite.PUBLICADO);
      
      console.log(`Site ${this.siteId} gerado com sucesso!`);
    } catch (error) {
      console.error(`Erro ao gerar site ${this.siteId}:`, error);
      await this.atualizarStatusSite(StatusSite.INATIVO);
    }
  }

  /**
   * Carrega os dados do site do banco de dados
   */
  private async carregarDadosSite(): Promise<void> {
    this.site = await prisma.imobiliariaSite.findUnique({
      where: { id: this.siteId },
      include: {
        imobiliaria: true,
        paginas: true
      }
    });
    
    if (!this.site) {
      throw new Error(`Site com ID ${this.siteId} não encontrado`);
    }
    
    this.imobiliariaId = this.site.imobiliariaId;
    
    // Configuração do site
    this.configuracao = {
      tom: 'profissional',
      destaqueTipo: 'ambos'
    };
    
    // Tentar extrair metadados adicionais das configurações do site
    try {
      // Configurar o tom da voz com base nas cores do site
      if (this.site.corPrimaria && this.site.corPrimaria.includes('#25D366')) {
        this.configuracao.tom = 'amigavel'; // Cor verde WhatsApp indica tom amigável
      } else if (this.site.corPrimaria && this.site.corPrimaria.includes('#')) {
        // Analisar a cor para definir o tom
        const hexValue = this.site.corPrimaria.substring(1);
        const colorValue = parseInt(hexValue, 16);
        
        if (colorValue > 0xCCCCCC) { // Cores claras
          this.configuracao.tom = 'moderno';
        } else if (colorValue < 0x444444) { // Cores escuras
          this.configuracao.tom = 'profissional';
        }
      }
      
      // Definir destaque de tipo com base no padrão da imobiliária
      // Verificar se há mais imóveis para venda ou aluguel
      const imoveisTipos = await prisma.imovel.groupBy({
        by: ['tipoOperacao'],
        where: { imobiliariaId: this.imobiliariaId },
        _count: true
      });
      
      if (imoveisTipos.length > 0) {
        const maiorContagem = Math.max(...imoveisTipos.map(i => i._count));
        const tipoMaisComum = imoveisTipos.find(i => i._count === maiorContagem);
        
        if (tipoMaisComum && tipoMaisComum.tipoOperacao) {
          if (tipoMaisComum.tipoOperacao === 'VENDA') {
            this.configuracao.destaqueTipo = 'venda';
          } else if (tipoMaisComum.tipoOperacao === 'ALUGUEL') {
            this.configuracao.destaqueTipo = 'aluguel';
          } else {
            this.configuracao.destaqueTipo = 'ambos';
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao processar configurações do site:', error);
    }
    
    console.log(`Dados do site ${this.siteId} carregados com sucesso.`);
  }

  /**
   * Carrega os dados da imobiliária do banco de dados
   */
  private async carregarDadosImobiliaria(): Promise<void> {
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: this.imobiliariaId },
      include: {
        user: true
      }
    });
    
    if (!imobiliaria) {
      throw new Error(`Imobiliária com ID ${this.imobiliariaId} não encontrada`);
    }
    
    this.dadosImobiliaria = {
      nome: imobiliaria.user.nome || 'Imobiliária',
      descricao: this.site.descricao || '',
      cidade: imobiliaria.cidade || '',
      estado: imobiliaria.estado || '',
      telefone: imobiliaria.telefone || '',
      endereco: imobiliaria.endereco || '',
      diferenciais: []
    };
    
    console.log(`Dados da imobiliária ${this.imobiliariaId} carregados com sucesso.`);
  }

  /**
   * Carrega os imóveis da imobiliária do banco de dados
   */
  private async carregarImoveis(): Promise<void> {
    this.imoveisDaImobiliaria = await prisma.imovel.findMany({
      where: { imobiliariaId: this.imobiliariaId },
      include: {
        fotos: true,
        adicionais: true
      },
      take: 30 // Limitar a quantidade de imóveis para não sobrecarregar
    });
    
    console.log(`${this.imoveisDaImobiliaria.length} imóveis da imobiliária ${this.imobiliariaId} carregados com sucesso.`);
  }

  /**
   * Atualiza o status do site no banco de dados
   */
  private async atualizarStatusSite(status: StatusSite): Promise<void> {
    await prisma.imobiliariaSite.update({
      where: { id: this.siteId },
      data: { status }
    });
    
    console.log(`Status do site ${this.siteId} atualizado para ${status}.`);
  }

  /**
   * Gera o arquivo de configuração do site com cores, fontes, logo, etc.
   */
  private async gerarArquivoConfiguracao(): Promise<void> {
    // Aqui seria gerado o arquivo de configuração real
    // Nos baseamos nas configurações salvas no banco
    const configuracao = {
      site: {
        id: this.site.id,
        nome: this.site.nome,
        descricao: this.site.descricao,
        subdominio: this.site.subdominio,
        template: this.site.templateId || 'padrao'
      },
      design: {
        corPrimaria: this.site.corPrimaria || '#25D366',
        corSecundaria: this.site.corSecundaria || '#F8FAFC',
        corAcentuacao: this.site.corAcentuacao || '#FFB800', 
        corTexto: this.site.corTexto || '#1A202C',
        fonteTitulos: this.site.fonteTitulos || 'Inter',
        fonteCorpo: this.site.fonteCorpo || 'Inter'
      },
      imobiliaria: {
        nome: this.dadosImobiliaria.nome,
        descricao: this.dadosImobiliaria.descricao,
        cidade: this.dadosImobiliaria.cidade,
        estado: this.dadosImobiliaria.estado,
        endereco: this.dadosImobiliaria.endereco,
        telefone: this.dadosImobiliaria.telefone,
        logoUrl: this.site.logoUrl || ''
      },
      imoveis: this.imoveisDaImobiliaria.map(imovel => ({
        id: imovel.id,
        titulo: imovel.titulo,
        descricao: imovel.descricao,
        valor: imovel.valor,
        tipo: imovel.tipoImovel,
        operacao: imovel.tipoOperacao,
        endereco: `${imovel.endereco}, ${imovel.numero}, ${imovel.bairro}, ${imovel.cidade}/${imovel.estado}`,
        quartos: imovel.quartos,
        banheiros: imovel.banheiros,
        suites: imovel.suites,
        vagas: imovel.vagas,
        areaTotal: imovel.areaTotal,
        areaConstruida: imovel.areaConstruida,
        fotoPrincipal: imovel.fotoPrincipal || (imovel.fotos?.length > 0 ? imovel.fotos[0].url : null),
        fotos: imovel.fotos?.map((foto: any) => foto.url) || [],
        adicionais: imovel.adicionais?.map((adicional: any) => adicional.nome) || []
      }))
    };
    
    // Em um ambiente de produção, isso seria salvo em um arquivo real de configuração
    // que seria usado pelo frontend para renderizar o site
    console.log(`Arquivo de configuração do site ${this.siteId} gerado com sucesso.`);
    
    // Salvar as informações importantes no banco em campos específicos
    await prisma.imobiliariaSite.update({
      where: { id: this.siteId },
      data: {
        // Atualiza a data de publicação se estiver publicando pela primeira vez
        publicadoEm: this.site.publicadoEm || new Date(),
        // Não há campo metadata para armazenar a configuração completa
        // Seria necessario modificar o schema para adicionar esse campo
      }
    });
    
    // Salvamos o conteúdo da configuração no conteúdo da página inicial
    try {
      const paginaHome = await prisma.imobiliariaSitePagina.findFirst({
        where: {
          siteId: this.siteId,
          tipo: TipoPagina.HOME
        }
      });
      
      if (paginaHome) {
        // Salvar as configurações no campo JSON da página home
        await prisma.imobiliariaSitePagina.update({
          where: { id: paginaHome.id },
          data: {
            conteudo: JSON.stringify({
              config: configuracao,
              lastUpdated: new Date().toISOString()
            })
          }
        });
      }
    } catch (error) {
      console.error('Erro ao salvar configuração na página home:', error);
    }
  }

  /**
   * Gera o conteúdo para todas as páginas do site
   */
  private async gerarPaginas(): Promise<void> {
    // Buscar todas as páginas configuradas para este site
    const paginas = this.site.paginas || [];
    
    for (const pagina of paginas) {
      try {
        // Verificar se já geramos esta página
        if (this.paginasGeradas.has(pagina.id)) {
          continue;
        }
        
        console.log(`Gerando conteúdo para página ${pagina.tipo}...`);
        
        // Gerar conteúdo usando IA
        const conteudo = await SiteContentGenerator.gerarConteudoPagina(
          pagina.tipo as TipoPagina,
          this.dadosImobiliaria,
          this.configuracao
        );
        
        // Atualizar o conteúdo da página no banco de dados
        await prisma.imobiliariaSitePagina.update({
          where: { id: pagina.id },
          data: {
            conteudo: JSON.stringify(conteudo)
          }
        });
        
        this.paginasGeradas.add(pagina.id);
        console.log(`Conteúdo para página ${pagina.tipo} gerado com sucesso.`);
      } catch (error) {
        console.error(`Erro ao gerar conteúdo para página ${pagina.tipo}:`, error);
      }
    }
  }
}
