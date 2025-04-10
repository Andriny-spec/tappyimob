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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Globe,
  CheckCircle2,
  Settings,
  Plus,
  ExternalLink,
  Info,
  Copy,
  Key,
  AlertCircle,
  ChevronRight,
  Code,
  RefreshCw,
  Zap,
  Lock,
  Search,
  MessageCircle,
  Calendar,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  BookOpen,
  HelpCircle
} from 'lucide-react';

// Dados fictícios para demonstração
const integracoes = [
  {
    id: 1,
    nome: 'Portal ZapImóveis',
    logo: '/logos/zapimoveis.png',
    ativo: true,
    ultimaSincronizacao: '2025-03-12T14:30:00',
    imoveis: 32,
    status: 'conectado',
    tipo: 'portal'
  },
  {
    id: 2,
    nome: 'Viva Real',
    logo: '/logos/vivareal.png',
    ativo: true,
    ultimaSincronizacao: '2025-03-12T14:45:00',
    imoveis: 28,
    status: 'conectado',
    tipo: 'portal'
  },
  {
    id: 3,
    nome: 'Habitissimo',
    logo: '/logos/habitissimo.png',
    ativo: false,
    ultimaSincronizacao: null,
    imoveis: 0,
    status: 'desconectado',
    tipo: 'portal'
  },
  {
    id: 4,
    nome: 'Google Calendar',
    logo: '/logos/googlecalendar.png',
    ativo: true,
    ultimaSincronizacao: '2025-03-12T18:20:00',
    imoveis: null,
    status: 'conectado',
    tipo: 'ferramenta'
  },
  {
    id: 5,
    nome: 'WhatsApp Business',
    logo: '/logos/whatsapp.png',
    ativo: true,
    ultimaSincronizacao: '2025-03-12T09:15:00',
    imoveis: null,
    status: 'conectado',
    tipo: 'comunicacao'
  },
  {
    id: 6,
    nome: 'RD Station CRM',
    logo: '/logos/rdstation.png',
    ativo: false,
    ultimaSincronizacao: null,
    imoveis: null,
    status: 'configuracao',
    tipo: 'crm'
  }
];

// Dados da API para desenvolvedores
const apiInfo = {
  baseUrl: 'https://api.tappyimob.com/v1',
  endpointsImportantes: [
    {
      metodo: 'GET',
      url: '/imoveis',
      descricao: 'Listar todos os imóveis'
    },
    {
      metodo: 'GET',
      url: '/imoveis/{id}',
      descricao: 'Obter detalhes de um imóvel específico'
    },
    {
      metodo: 'POST',
      url: '/imoveis',
      descricao: 'Criar um novo imóvel'
    },
    {
      metodo: 'PUT',
      url: '/imoveis/{id}',
      descricao: 'Atualizar um imóvel existente'
    },
    {
      metodo: 'GET',
      url: '/corretores',
      descricao: 'Listar todos os corretores'
    },
    {
      metodo: 'GET',
      url: '/clientes',
      descricao: 'Listar todos os clientes'
    }
  ]
};

export default function IntegracoesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [apiKey, setApiKey] = useState('sk_test_1a2b3c4d5e6f7g8h9i0j');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const filteredIntegracoes = integracoes.filter(integracao => 
    integracao.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formata a data para o padrão brasileiro
  const formatarData = (data: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  };

  // Função simulada para copiar texto
  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    // Em uma implementação real, mostraríamos um toast de sucesso
  };

  return (
    <PageContainer
      title="Integrações"
      subtitle="Conecte sua imobiliária com portais e serviços externos"
    >
      <Tabs defaultValue="portais" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portais">Portais de Imóveis</TabsTrigger>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
          <TabsTrigger value="api">API para Desenvolvedores</TabsTrigger>
        </TabsList>

        <TabsContent value="portais" className="space-y-6">
          {/* Pesquisa e filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar integração..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button className="gap-1 self-end sm:self-auto">
              <Plus className="h-4 w-4" />
              Nova Integração
            </Button>
          </div>

          {/* Lista de integrações de portais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegracoes
              .filter(integracao => integracao.tipo === 'portal')
              .map((integracao) => (
                <Card key={integracao.id} className={integracao.ativo ? 'border-green-200' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <Globe className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integracao.nome}</CardTitle>
                          <CardDescription>Portal de imóveis</CardDescription>
                        </div>
                      </div>
                      <Switch 
                        checked={integracao.ativo} 
                        className="mt-1"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={integracao.status === 'conectado' ? 'default' : 'secondary'}>
                          {integracao.status === 'conectado' ? 'Conectado' : 
                           integracao.status === 'desconectado' ? 'Desconectado' : 'Configurando'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Imóveis sincronizados:</span>
                        <span className="font-medium">{integracao.imoveis || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última sincronização:</span>
                        <span>{formatarData(integracao.ultimaSincronizacao || '')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex w-full gap-2">
                      {integracao.status === 'conectado' ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <RefreshCw className="h-4 w-4" />
                            Sincronizar
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <Settings className="h-4 w-4" />
                            Configurar
                          </Button>
                        </>
                      ) : (
                        <Button className="w-full gap-1">
                          <Plus className="h-4 w-4" />
                          {integracao.status === 'desconectado' ? 'Conectar' : 'Completar Configuração'}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}

            {/* Card para adicionar nova integração */}
            <Card className="border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                <div className="p-3 bg-muted rounded-full mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-1">Adicionar Portal</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte sua imobiliária com novos portais de imóveis
                </p>
                <Button>Adicionar Portal</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ferramentas" className="space-y-6">
          {/* Lista de integrações de ferramentas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegracoes
              .filter(integracao => integracao.tipo !== 'portal')
              .map((integracao) => (
                <Card key={integracao.id} className={integracao.ativo ? 'border-green-200' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          {integracao.tipo === 'ferramenta' ? 
                            <Settings className="h-6 w-6" /> : 
                            integracao.tipo === 'comunicacao' ? 
                            <MessageCircle className="h-6 w-6" /> :
                            <Database className="h-6 w-6" />
                          }
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integracao.nome}</CardTitle>
                          <CardDescription>
                            {integracao.tipo === 'ferramenta' ? 'Ferramenta externa' : 
                             integracao.tipo === 'comunicacao' ? 'Comunicação' : 'CRM'}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch 
                        checked={integracao.ativo} 
                        className="mt-1"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={integracao.status === 'conectado' ? 'default' : 'secondary'}>
                          {integracao.status === 'conectado' ? 'Conectado' : 
                           integracao.status === 'desconectado' ? 'Desconectado' : 'Configurando'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última sincronização:</span>
                        <span>{formatarData(integracao.ultimaSincronizacao || '')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex w-full gap-2">
                      {integracao.status === 'conectado' ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <RefreshCw className="h-4 w-4" />
                            Sincronizar
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-1">
                            <Settings className="h-4 w-4" />
                            Configurar
                          </Button>
                        </>
                      ) : (
                        <Button className="w-full gap-1">
                          <Plus className="h-4 w-4" />
                          {integracao.status === 'desconectado' ? 'Conectar' : 'Completar Configuração'}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}

            {/* Categorias de integrações disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Explore integrações por categoria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-3 px-4 justify-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-md">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Agenda</div>
                      <div className="text-xs text-muted-foreground">6 integrações</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-3 px-4 justify-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-md">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Comunicação</div>
                      <div className="text-xs text-muted-foreground">4 integrações</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-3 px-4 justify-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-md">
                      <Database className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">CRM</div>
                      <div className="text-xs text-muted-foreground">5 integrações</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-3 px-4 justify-start gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-md">
                      <CreditCard className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Pagamentos</div>
                      <div className="text-xs text-muted-foreground">3 integrações</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="gap-1 w-full">
                  Ver todas as categorias
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Card para adicionar nova integração */}
            <Card className="border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                <div className="p-3 bg-muted rounded-full mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-1">Adicionar Ferramenta</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte com ferramentas externas para aumentar sua produtividade
                </p>
                <Button>Ver Catálogo</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API para Desenvolvedores
              </CardTitle>
              <CardDescription>
                Integre sistemas externos com a API do TappyImob
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seção de chave API */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Sua Chave de API</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 h-7"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {showApiKey ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                
                <div className="flex">
                  <div className="relative flex-1">
                    <Input 
                      value={showApiKey ? apiKey : '•'.repeat(apiKey.length)} 
                      readOnly 
                      className="pr-24 font-mono"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => copiarTexto(apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="ml-2">
                    Gerar Nova
                  </Button>
                </div>
                
                <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Mantenha suas chaves seguras</p>
                    <p className="text-muted-foreground">
                      Não compartilhe ou exponha sua chave de API em código acessível publicamente.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Seção de endpoints */}
              <div className="space-y-4">
                <h3 className="font-medium">Endpoints Disponíveis</h3>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted px-4 py-2 text-sm font-medium">
                    Base URL: {apiInfo.baseUrl}
                  </div>
                  <div>
                    {apiInfo.endpointsImportantes.map((endpoint, index) => (
                      <div 
                        key={index}
                        className="px-4 py-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {endpoint.metodo}
                          </Badge>
                          <code className="bg-muted p-1 rounded text-sm font-mono">
                            {endpoint.url}
                          </code>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {endpoint.descricao}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Links para documentação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="p-2 bg-primary/10 rounded-full mb-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium">Documentação</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Guias detalhados e referência completa
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      Ver Documentação
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="p-2 bg-green-500/10 rounded-full mb-3">
                      <Code className="h-5 w-5 text-green-500" />
                    </div>
                    <h4 className="font-medium">Exemplos de Código</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Snippets para várias linguagens
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      Ver Exemplos
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="p-2 bg-blue-500/10 rounded-full mb-3">
                      <HelpCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <h4 className="font-medium">Suporte Técnico</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Ajuda para integrações avançadas
                    </p>
                    <Button variant="outline" size="sm" className="gap-1">
                      Contatar Suporte
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
