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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Building2,
  Users,
  Calendar,
  MessageSquare,
  Globe,
  BarChart4,
  CreditCard,
  ChevronRight,
  Rocket,
  Shield,
  Zap,
  PlusCircle,
  Clock,
  Activity
} from 'lucide-react';

// Dados fictícios para demonstração
const planoAtual = {
  nome: 'Profissional',
  status: 'Ativo',
  preco: 179.90,
  ciclo: 'mensal',
  dataRenovacao: '2025-04-15',
  limites: {
    imoveis: {
      usados: 35,
      total: 50,
      percentual: 70
    },
    usuarios: {
      usados: 3,
      total: 5,
      percentual: 60
    },
    destaques: {
      usados: 2,
      total: 3,
      percentual: 67
    },
    integracao: {
      usados: 1,
      total: 2,
      percentual: 50
    }
  },
  recursos: [
    'Portal de imóveis personalizado',
    'Gerenciamento de leads',
    'Integração com portais',
    '5 usuários simultâneos',
    'Até 50 imóveis ativos',
    'Até 3 imóveis em destaque',
    'Relatórios básicos',
    'Chat com clientes',
    'API de integração (2 conexões)'
  ]
};

const planosDisponiveis = [
  {
    id: 1,
    nome: 'Básico',
    preco: 99.90,
    ciclo: 'mensal',
    anual: 1078.92,
    economia: 120,
    destaque: false,
    recursos: [
      'Portal de imóveis simples',
      'Gerenciamento de leads básico',
      'Até 20 imóveis ativos',
      'Até 2 usuários simultâneos',
      '1 imóvel em destaque',
      'Relatórios básicos'
    ]
  },
  {
    id: 2,
    nome: 'Profissional',
    preco: 179.90,
    ciclo: 'mensal',
    anual: 1942.92,
    economia: 216,
    destaque: true,
    recursos: [
      'Portal de imóveis personalizado',
      'Gerenciamento de leads',
      'Integração com portais',
      'Até 5 usuários simultâneos',
      'Até 50 imóveis ativos',
      'Até 3 imóveis em destaque',
      'Relatórios básicos',
      'Chat com clientes',
      'API de integração (2 conexões)'
    ]
  },
  {
    id: 3,
    nome: 'Empresarial',
    preco: 349.90,
    ciclo: 'mensal',
    anual: 3778.92,
    economia: 420,
    destaque: false,
    recursos: [
      'Portal de imóveis customizado',
      'Gerenciamento de leads avançado',
      'Integração com todos os portais',
      'Usuários ilimitados',
      'Imóveis ilimitados',
      'Até 10 imóveis em destaque',
      'Relatórios avançados',
      'Chat com clientes e equipe',
      'API de integração completa',
      'Suporte prioritário 24/7',
      'TappyIA para análise de mercado'
    ]
  }
];

// Dados ficticios para histórico de pagamentos
const historicoPagamentos = [
  {
    id: 'pay_123456',
    data: '2025-03-15',
    valor: 179.90,
    status: 'Pago',
    metodo: 'Cartão de crédito (final 4321)',
    fatura: '#INV-2025-03'
  },
  {
    id: 'pay_123455',
    data: '2025-02-15',
    valor: 179.90,
    status: 'Pago',
    metodo: 'Cartão de crédito (final 4321)',
    fatura: '#INV-2025-02'
  },
  {
    id: 'pay_123454',
    data: '2025-01-15',
    valor: 179.90,
    status: 'Pago',
    metodo: 'Cartão de crédito (final 4321)',
    fatura: '#INV-2025-01'
  },
  {
    id: 'pay_123453',
    data: '2024-12-15',
    valor: 179.90,
    status: 'Pago',
    metodo: 'Cartão de crédito (final 4321)',
    fatura: '#INV-2024-12'
  },
  {
    id: 'pay_123452',
    data: '2024-11-15',
    valor: 179.90,
    status: 'Pago',
    metodo: 'Cartão de crédito (final 4321)',
    fatura: '#INV-2024-11'
  }
];

export default function PlanoPage() {
  const [cicloSelecionado, setCicloSelecionado] = useState('mensal');
  const [tabAtiva, setTabAtiva] = useState('meu-plano');
  
  // Formata a data para o padrão brasileiro
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <PageContainer
      title="Meu Plano"
      subtitle="Gerencie sua assinatura e explore recursos disponíveis"
    >
      <Tabs defaultValue="meu-plano" className="space-y-6" onValueChange={setTabAtiva}>
        <TabsList>
          <TabsTrigger value="meu-plano">Meu Plano</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="upgrade">Fazer Upgrade</TabsTrigger>
        </TabsList>

        <TabsContent value="meu-plano" className="space-y-6">
          {/* Card do plano atual */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Plano Atual</CardTitle>
                  <CardDescription>Detalhes do seu plano e limites de uso</CardDescription>
                </div>
                <Badge className="bg-green-500 hover:bg-green-600">
                  {planoAtual.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    {planoAtual.nome}
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  </h3>
                  <p className="text-muted-foreground">
                    Renovação em {formatarData(planoAtual.dataRenovacao)}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline">Alterar Plano</Button>
                  <Button>Gerenciar Pagamento</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Métricas de uso */}
                <div className="space-y-4">
                  <h4 className="font-medium">Uso do Plano</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          Imóveis
                        </label>
                        <span className="text-sm text-muted-foreground">{planoAtual.limites.imoveis.usados}/{planoAtual.limites.imoveis.total}</span>
                      </div>
                      <Progress value={planoAtual.limites.imoveis.percentual} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Usuários
                        </label>
                        <span className="text-sm text-muted-foreground">{planoAtual.limites.usuarios.usados}/{planoAtual.limites.usuarios.total}</span>
                      </div>
                      <Progress value={planoAtual.limites.usuarios.percentual} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          Destaques
                        </label>
                        <span className="text-sm text-muted-foreground">{planoAtual.limites.destaques.usados}/{planoAtual.limites.destaques.total}</span>
                      </div>
                      <Progress value={planoAtual.limites.destaques.percentual} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          Integrações
                        </label>
                        <span className="text-sm text-muted-foreground">{planoAtual.limites.integracao.usados}/{planoAtual.limites.integracao.total}</span>
                      </div>
                      <Progress value={planoAtual.limites.integracao.percentual} />
                    </div>
                  </div>
                </div>
                
                {/* Recursos incluídos */}
                <div className="space-y-4">
                  <h4 className="font-medium">Recursos Incluídos</h4>
                  
                  <ul className="space-y-2">
                    {planoAtual.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{recurso}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">Valor mensal:</span>
                <span className="text-lg font-bold ml-2">
                  R$ {planoAtual.preco.toFixed(2).replace('.', ',')}
                </span>
              </div>
              
              <Button variant="outline" className="gap-1">
                <Activity className="h-4 w-4" />
                Ver Histórico de Uso
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de recursos recomendados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Recursos Recomendados
              </CardTitle>
              <CardDescription>
                Baseado no seu uso atual, estes recursos podem ajudar a otimizar sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-dashed">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="p-3 bg-blue-500/10 rounded-full mb-3">
                      <PlusCircle className="h-6 w-6 text-blue-500" />
                    </div>
                    <h4 className="font-medium">Mais Usuários</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione mais corretores à sua equipe virtual
                    </p>
                    <Button variant="outline" size="sm" className="mt-auto">
                      Saiba mais
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="p-3 bg-amber-500/10 rounded-full mb-3">
                      <BarChart4 className="h-6 w-6 text-amber-500" />
                    </div>
                    <h4 className="font-medium">Relatórios Avançados</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Análises detalhadas para melhorar suas vendas
                    </p>
                    <Button variant="outline" size="sm" className="mt-auto">
                      Disponível no plano Empresarial
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className="p-3 bg-green-500/10 rounded-full mb-3">
                      <Rocket className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="font-medium">TappyIA</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Análise inteligente de mercado e previsões
                    </p>
                    <Button variant="outline" size="sm" className="mt-auto">
                      Disponível no plano Empresarial
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-6">
          {/* Dados de faturamento */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>Detalhes da sua forma de pagamento e faturas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="space-y-4 flex-1">
                  <h4 className="font-medium">Método de Pagamento</h4>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-muted rounded-md">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Cartão de Crédito</p>
                      <p className="text-sm text-muted-foreground">**** **** **** 4321</p>
                      <p className="text-xs text-muted-foreground">Expira em 05/2026</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Alterar
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <h4 className="font-medium">Endereço de Cobrança</h4>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">Imobiliária Exemplo Ltda.</p>
                    <p className="text-sm">Av. Paulista, 1000, Sala 301</p>
                    <p className="text-sm">Bela Vista, São Paulo - SP</p>
                    <p className="text-sm">CEP: 01310-100</p>
                    <p className="text-sm">CNPJ: 12.345.678/0001-90</p>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                      Editar endereço
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Histórico de Pagamentos</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fatura</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {historicoPagamentos.map((pagamento) => (
                        <tr key={pagamento.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatarData(pagamento.data)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {pagamento.fatura}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            R$ {pagamento.valor.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                              {pagamento.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Button variant="ghost" size="sm">
                              Baixar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próxima cobrança em <span className="font-medium">{formatarData(planoAtual.dataRenovacao)}</span></p>
              </div>
              <Button variant="outline">Todas as Faturas</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          {/* Opções de planos para upgrade */}
          <Card>
            <CardHeader>
              <CardTitle>Escolha o Plano Ideal</CardTitle>
              <CardDescription>Compare os planos e encontre o melhor para sua imobiliária</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center mb-8">
                <div className="bg-muted p-1 rounded-lg inline-flex">
                  <Button 
                    variant={cicloSelecionado === 'mensal' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCicloSelecionado('mensal')}
                  >
                    Mensal
                  </Button>
                  <Button 
                    variant={cicloSelecionado === 'anual' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCicloSelecionado('anual')}
                    className="relative"
                  >
                    Anual
                    <span className="absolute -top-2.5 -right-2.5 bg-green-500 text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium">
                      -10%
                    </span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {planosDisponiveis.map((plano) => (
                  <Card key={plano.id} className={`border ${plano.destaque ? 'border-primary shadow-md relative' : ''}`}>
                    {plano.destaque && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        Mais Popular
                      </div>
                    )}
                    <CardHeader className="pb-6">
                      <CardTitle>{plano.nome}</CardTitle>
                      <CardDescription>
                        {plano.nome === 'Básico' ? 'Para imobiliárias iniciantes' : 
                         plano.nome === 'Profissional' ? 'Para imobiliárias em crescimento' :
                         'Para imobiliárias de médio e grande porte'}
                      </CardDescription>
                      <div className="mt-4">
                        <div className="flex items-baseline">
                          <span className="text-3xl font-bold">
                            R$ {cicloSelecionado === 'mensal' ? 
                              plano.preco.toFixed(2).replace('.', ',') : 
                              (plano.anual / 12).toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-muted-foreground ml-1">/mês</span>
                        </div>
                        {cicloSelecionado === 'anual' && (
                          <div className="text-sm text-muted-foreground mt-1">
                            R$ {plano.anual.toFixed(2).replace('.', ',')} por ano
                            <span className="ml-2 text-green-500 font-medium">
                              Economia de R$ {plano.economia.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-2">
                        {plano.recursos.map((recurso, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{recurso}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant={plano.nome === planoAtual.nome ? 'outline' : 'default'}
                      >
                        {plano.nome === planoAtual.nome ? 'Plano Atual' : 'Selecionar Plano'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col border-t space-y-4">
              <div className="bg-muted p-4 rounded-lg w-full">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Precisa de um plano personalizado?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Entre em contato com nossa equipe para criar um plano sob medida para as necessidades da sua imobiliária.
                </p>
                <Button variant="outline">Fale com Consultor</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
