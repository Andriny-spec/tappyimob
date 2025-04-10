'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Link, 
  ExternalLink, 
  Check, 
  X, 
  Info, 
  Settings, 
  ArrowRight, 
  Upload, 
  Download, 
  PlusCircle,
  BarChart,
  Database,
  Globe,
  RefreshCw,
  Instagram,
  Facebook,
  Store
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Dados fictícios para demonstração
const integracoes = [
  {
    id: 1,
    nome: 'ZAP Imóveis',
    descricao: 'Publique seus imóveis diretamente no portal ZAP Imóveis',
    logo: '/logos/zap.png',
    categoria: 'portal',
    status: 'conectado',
    ultimaSincronizacao: '10/03/2025 às 15:30',
    imoveisConectados: 42,
    erros: 0
  },
  {
    id: 2,
    nome: 'VivaReal',
    descricao: 'Integração com o portal VivaReal para publicação de imóveis',
    logo: '/logos/vivareal.png',
    categoria: 'portal',
    status: 'desconectado',
    ultimaSincronizacao: null,
    imoveisConectados: 0,
    erros: 0
  },
  {
    id: 3,
    nome: 'Instagram',
    descricao: 'Compartilhe imóveis automaticamente no seu Instagram',
    logo: '/logos/instagram.png',
    categoria: 'social',
    status: 'conectado',
    ultimaSincronizacao: '09/03/2025 às 10:15',
    imoveisConectados: 38,
    erros: 2
  },
  {
    id: 4,
    nome: 'Facebook',
    descricao: 'Publique imóveis na sua página do Facebook',
    logo: '/logos/facebook.png',
    categoria: 'social',
    status: 'conectado',
    ultimaSincronizacao: '09/03/2025 às 10:15',
    imoveisConectados: 38,
    erros: 0
  },
  {
    id: 5,
    nome: 'Imovelweb',
    descricao: 'Integração com o portal Imovelweb',
    logo: '/logos/imovelweb.png',
    categoria: 'portal',
    status: 'desconectado',
    ultimaSincronizacao: null,
    imoveisConectados: 0,
    erros: 0
  },
  {
    id: 6,
    nome: 'OLX',
    descricao: 'Publique seus imóveis na OLX',
    logo: '/logos/olx.png',
    categoria: 'marketplace',
    status: 'conectado',
    ultimaSincronizacao: '08/03/2025 às 09:45',
    imoveisConectados: 25,
    erros: 3
  }
];

// Dados de utilização
const dadosUtilizacao = {
  total: 143,
  enviados: 120,
  erros: 5,
  conversoes: 8,
  retorno: "1.5x"
};

export default function IntegracoesCorretorPage() {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busca, setBusca] = useState('');
  
  // Filtro de integrações
  const integracoesFiltradas = integracoes.filter(integracao => {
    // Filtro por busca
    const termoBusca = busca.toLowerCase();
    const matchBusca = busca === '' || 
      integracao.nome.toLowerCase().includes(termoBusca) || 
      integracao.descricao.toLowerCase().includes(termoBusca);
    
    // Filtro por categoria
    const matchCategoria = filtroCategoria === 'todas' || integracao.categoria === filtroCategoria;
    
    return matchBusca && matchCategoria;
  });
  
  // Função para obter o ícone com base na categoria
  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'portal':
        return <Store className="h-4 w-4 mr-1.5" />;
      case 'social':
        if (nome.includes('Instagram')) return <Instagram className="h-4 w-4 mr-1.5" />;
        if (nome.includes('Facebook')) return <Facebook className="h-4 w-4 mr-1.5" />;
        return <Globe className="h-4 w-4 mr-1.5" />;
      case 'marketplace':
        return <Database className="h-4 w-4 mr-1.5" />;
      default:
        return <Link className="h-4 w-4 mr-1.5" />;
    }
  };
  
  return (
    <PageContainer
      title="Integrações"
      subtitle="Conecte-se a portais imobiliários e outras plataformas"
    >
      <div className="space-y-6">
        {/* Visão geral da utilização */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>
                  Estatísticas de utilização das integrações
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <BarChart className="h-4 w-4" />
                Relatórios
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Total de Anúncios</p>
                    <p className="text-3xl font-bold mt-1">{dadosUtilizacao.total}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Anúncios Enviados</p>
                    <p className="text-3xl font-bold mt-1">{dadosUtilizacao.enviados}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Erros</p>
                    <p className="text-3xl font-bold mt-1 text-destructive">{dadosUtilizacao.erros}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">Conversões</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{dadosUtilizacao.conversoes}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm">ROI</p>
                    <p className="text-3xl font-bold mt-1 text-amber-600">{dadosUtilizacao.retorno}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Filtro e busca */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 sm:max-w-xs">
            <Input
              type="search"
              placeholder="Buscar integração..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Integração
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Integração</DialogTitle>
                  <DialogDescription>
                    Conecte-se a portais imobiliários, redes sociais e outras plataformas
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                        <img src="/logos/zap.png" alt="ZAP Imóveis" className="w-12 h-12 object-contain opacity-50" />
                        <span className="text-sm font-medium text-center">ZAP Imóveis</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                        <img src="/logos/vivareal.png" alt="VivaReal" className="w-12 h-12 object-contain" />
                        <span className="text-sm font-medium text-center">VivaReal</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                        <img src="/logos/olx.png" alt="OLX" className="w-12 h-12 object-contain" />
                        <span className="text-sm font-medium text-center">OLX</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                        <img src="/logos/imovelweb.png" alt="Imovelweb" className="w-12 h-12 object-contain" />
                        <span className="text-sm font-medium text-center">Imovelweb</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                        <Instagram className="w-12 h-12 text-pink-600" />
                        <span className="text-sm font-medium text-center">Instagram</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary cursor-pointer">
                        <Facebook className="w-12 h-12 text-blue-600" />
                        <span className="text-sm font-medium text-center">Facebook</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button variant="outline" size="sm">
                        Ver mais integrações
                      </Button>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    12 integrações disponíveis
                  </p>
                  <Button variant="outline">Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Lista de integrações */}
        <Tabs defaultValue="todas" onValueChange={setFiltroCategoria}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="portal">Portais</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplaces</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas" className="mt-4">
            <Card>
              <CardContent className="px-6 py-4">
                {integracoesFiltradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Link className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-center text-muted-foreground">
                      Nenhuma integração encontrada com os filtros selecionados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {integracoesFiltradas.map((integracao) => (
                      <div key={integracao.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center bg-background rounded-md overflow-hidden">
                            {integracao.logo ? (
                              <img src={integracao.logo} alt={integracao.nome} className="w-10 h-10 object-contain" />
                            ) : (
                              <Link className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-base">{integracao.nome}</h3>
                              <Badge 
                                variant={integracao.status === 'conectado' ? 'default' : 'secondary'} 
                                className="ml-2"
                              >
                                {integracao.status === 'conectado' ? 'Conectado' : 'Desconectado'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{integracao.descricao}</p>
                            
                            {integracao.status === 'conectado' && (
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>
                                  Última sincronização: {integracao.ultimaSincronizacao}
                                </span>
                                <span className="flex items-center">
                                  <Database className="h-3 w-3 mr-1" />
                                  {integracao.imoveisConectados} imóveis
                                </span>
                                {integracao.erros > 0 && (
                                  <span className="flex items-center text-destructive">
                                    <X className="h-3 w-3 mr-1" />
                                    {integracao.erros} erros
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {integracao.status === 'conectado' ? (
                            <>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-1.5" />
                                Configurar
                              </Button>
                              <Button variant="default" size="sm">
                                <RefreshCw className="h-4 w-4 mr-1.5" />
                                Sincronizar
                              </Button>
                            </>
                          ) : (
                            <Button variant="default" size="sm">
                              <Link className="h-4 w-4 mr-1.5" />
                              Conectar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="portal" className="mt-4">
            {/* O conteúdo é carregado dinamicamente com base no filtro */}
          </TabsContent>
          
          <TabsContent value="social" className="mt-4">
            {/* O conteúdo é carregado dinamicamente com base no filtro */}
          </TabsContent>
          
          <TabsContent value="marketplace" className="mt-4">
            {/* O conteúdo é carregado dinamicamente com base no filtro */}
          </TabsContent>
        </Tabs>
        
        {/* Dicas de uso */}
        <Card>
          <CardHeader>
            <CardTitle>Melhores Práticas</CardTitle>
            <CardDescription>
              Dicas para maximizar seus resultados com as integrações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Mantenha suas integrações atualizadas</h4>
                  <p className="text-sm text-muted-foreground">
                    Sincronize seus imóveis regularmente para garantir que as informações estejam sempre atualizadas em todos os portais.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Use fotos de alta qualidade</h4>
                  <p className="text-sm text-muted-foreground">
                    Imóveis com fotos profissionais recebem até 3x mais visualizações nos portais integrados.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Compartilhe nas redes sociais</h4>
                  <p className="text-sm text-muted-foreground">
                    Integre com Instagram e Facebook para aumentar a visibilidade dos seus imóveis e alcançar mais clientes em potencial.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver guia completo de integrações
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
