'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Plus, 
  Zap, 
  UserPlus, 
  Home, 
  BarChart, 
  Sparkles,
  Brain,
  RefreshCw,
  ChevronRight,
  Globe,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  StarIcon,
  Star,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function PlanosPage() {
  const [comparacaoAberta, setComparacaoAberta] = useState(false);
  const [numImoveisRange, setNumImoveisRange] = useState([200]);
  const [periodoCobranca, setPeriodoCobranca] = useState('mensal');

  const planos = [
    {
      id: '1',
      nome: 'Básico',
      descricao: 'Ideal para imobiliárias pequenas',
      preco: periodoCobranca === 'mensal' ? 99.90 : 1079.00,
      cor: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      corTexto: 'text-blue-500',
      recursos: [
        { nome: 'Cadastro de imóveis', limit: '30 imóveis', incluido: true },
        { nome: 'Usuários', limit: '5 corretores', incluido: true },
        { nome: 'Integração com portais', limit: '1 portal', incluido: true },
        { nome: 'Suporte por e-mail', incluido: true },
        { nome: 'Integrações avançadas', incluido: false },
        { nome: 'IA para descrições', incluido: false },
        { nome: 'Automações', incluido: false },
        { nome: 'Relatórios avançados', incluido: false },
      ],
      destaque: false,
      ativo: true
    },
    {
      id: '2',
      nome: 'Pro',
      descricao: 'Para imobiliárias em crescimento',
      preco: periodoCobranca === 'mensal' ? 199.90 : 2159.00,
      cor: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      corTexto: 'text-purple-500',
      recursos: [
        { nome: 'Cadastro de imóveis', limit: '100 imóveis', incluido: true },
        { nome: 'Usuários', limit: '15 corretores', incluido: true },
        { nome: 'Integração com portais', limit: '3 portais', incluido: true },
        { nome: 'Suporte por e-mail', incluido: true },
        { nome: 'Integrações avançadas', incluido: true },
        { nome: 'IA para descrições', incluido: true },
        { nome: 'Automações', incluido: false },
        { nome: 'Relatórios avançados', incluido: true },
      ],
      destaque: true,
      ativo: true
    },
    {
      id: '3',
      nome: 'Premium',
      descricao: 'Solução completa e sem limites',
      preco: periodoCobranca === 'mensal' ? 299.90 : 3239.00,
      cor: 'from-primary/20 to-green-600/20 border-primary/30',
      corTexto: 'text-primary',
      recursos: [
        { nome: 'Cadastro de imóveis', limit: 'Ilimitados', incluido: true },
        { nome: 'Usuários', limit: 'Ilimitados', incluido: true },
        { nome: 'Integração com portais', limit: 'Todos os portais', incluido: true },
        { nome: 'Suporte prioritário', incluido: true },
        { nome: 'Integrações avançadas', incluido: true },
        { nome: 'IA para descrições', incluido: true },
        { nome: 'Automações', incluido: true },
        { nome: 'Relatórios avançados', incluido: true },
      ],
      destaque: false,
      ativo: true
    }
  ];

  // Planilha para comparação de funcionalidades por plano
  const comparativoFuncionalidades = [
    { 
      categoria: 'Imóveis', 
      funcionalidades: [
        { nome: 'Cadastro de imóveis', basico: '30', pro: '100', premium: 'Ilimitado' },
        { nome: 'Fotos por imóvel', basico: '10', pro: '30', premium: 'Ilimitado' },
        { nome: 'Tours virtuais', basico: false, pro: true, premium: true },
        { nome: 'Vídeos', basico: '1 por imóvel', pro: '3 por imóvel', premium: 'Ilimitado' },
      ]
    },
    { 
      categoria: 'Usuários', 
      funcionalidades: [
        { nome: 'Corretores', basico: '5', pro: '15', premium: 'Ilimitado' },
        { nome: 'Perfis de acesso', basico: '2', pro: '5', premium: 'Ilimitado' },
        { nome: 'Administradores', basico: '1', pro: '3', premium: 'Ilimitado' },
      ]
    },
    { 
      categoria: 'Integrações', 
      funcionalidades: [
        { nome: 'Portais imobiliários', basico: '1', pro: '3', premium: 'Todos' },
        { nome: 'Redes sociais', basico: false, pro: true, premium: true },
        { nome: 'API para desenvolvedores', basico: false, pro: false, premium: true },
        { nome: 'Webhooks', basico: false, pro: true, premium: true },
      ]
    },
    { 
      categoria: 'Inteligência Artificial', 
      funcionalidades: [
        { nome: 'Geração de descrições', basico: false, pro: true, premium: true },
        { nome: 'Análise de mercado', basico: false, pro: false, premium: true },
        { nome: 'Sugestão de preços', basico: false, pro: true, premium: true },
        { nome: 'Qualificação de leads', basico: false, pro: false, premium: true },
      ]
    },
  ];

  return (
    <PageContainer
      title="Planos"
      subtitle="Gerencie os planos de assinatura disponíveis no TappyImob"
    >
      <Tabs defaultValue="visaogeral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visaogeral">Visão Geral</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="visaogeral" className="space-y-6">
          {/* Seleção de período de cobrança */}
          <div className="flex justify-center mb-8">
            <Card className="w-full max-w-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Label htmlFor="periodo">Período de cobrança</Label>
                    <p className="text-sm text-muted-foreground">
                      Economia de até 10% no plano anual
                    </p>
                  </div>
                  <RadioGroup 
                    defaultValue="mensal" 
                    className="flex space-x-1"
                    value={periodoCobranca}
                    onValueChange={setPeriodoCobranca}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mensal" id="mensal" className="peer sr-only" />
                      <Label
                        htmlFor="mensal"
                        className="flex h-8 w-20 cursor-pointer items-center justify-center rounded-md border text-center text-sm peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                      >
                        Mensal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anual" id="anual" className="peer sr-only" />
                      <Label
                        htmlFor="anual"
                        className="flex h-8 w-20 cursor-pointer items-center justify-center rounded-md border text-center text-sm peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                      >
                        Anual
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards dos planos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <motion.div 
                key={plano.id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="flex"
              >
                <Card 
                  className={cn(
                    "flex flex-col w-full border overflow-hidden",
                    plano.destaque ? "shadow-lg ring-2 ring-primary ring-offset-2" : "",
                    `bg-gradient-to-br ${plano.cor}`
                  )}
                >
                  {plano.destaque && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg bg-primary text-xs uppercase shadow-sm">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className={plano.corTexto}>{plano.nome}</CardTitle>
                    <CardDescription className="min-h-[40px]">{plano.descricao}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="mt-2 mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">
                          R$ {plano.preco.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-sm ml-1 text-muted-foreground">
                          /{periodoCobranca === 'mensal' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      
                      {periodoCobranca === 'anual' && (
                        <Badge variant="outline" className="mt-1 bg-amber-500/10 text-amber-600 border-amber-200">
                          Economia de {(plano.preco * 12 - plano.preco).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <ul className="space-y-3 mt-6">
                      {plano.recursos.map((recurso, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          {recurso.incluido ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={cn(
                              "text-sm font-medium",
                              !recurso.incluido && "text-muted-foreground"
                            )}>
                              {recurso.nome}
                            </p>
                            {recurso.limit && recurso.incluido && (
                              <p className="text-xs text-muted-foreground">
                                {recurso.limit}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="flex-col gap-2 pt-2">
                    <Button 
                      className={cn(
                        "w-full",
                        plano.destaque ? "bg-primary" : "bg-card text-card-foreground border"
                      )}
                    >
                      Editar Plano
                    </Button>
                    
                    <div className="flex items-center justify-center w-full gap-2 mt-2">
                      <Switch 
                        id={`ativo-${plano.id}`}
                        checked={plano.ativo}
                      />
                      <Label htmlFor={`ativo-${plano.id}`} className="text-xs">
                        {plano.ativo ? 'Plano ativo' : 'Plano inativo'}
                      </Label>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}

            {/* Card para adicionar novo plano */}
            <motion.div 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="flex"
            >
              <Card className="flex flex-col justify-center items-center w-full border border-dashed p-8">
                <div className="text-center">
                  <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <PlusCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Novo Plano</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Crie um plano personalizado com características específicas
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Plano
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="comparativo">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Comparativo de Planos</CardTitle>
                  <CardDescription>Compare os recursos disponíveis em cada plano</CardDescription>
                </div>
                
                <Button variant="outline" className="gap-1" onClick={() => setComparacaoAberta(!comparacaoAberta)}>
                  {comparacaoAberta ? 'Simplificar' : 'Expandir'} 
                  {comparacaoAberta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {comparativoFuncionalidades.map((categoria, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      {idx === 0 && <Home className="h-5 w-5" />}
                      {idx === 1 && <UserPlus className="h-5 w-5" />}
                      {idx === 2 && <Globe className="h-5 w-5" />}
                      {idx === 3 && <Sparkles className="h-5 w-5" />}
                      {categoria.categoria}
                    </h3>
                    
                    <div className="rounded-lg border overflow-hidden">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/3">
                              Funcionalidade
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-blue-500 uppercase tracking-wider">
                              Básico
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-purple-500 uppercase tracking-wider">
                              Pro
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-primary uppercase tracking-wider">
                              Premium
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {categoria.funcionalidades.map((func, funcIdx) => (
                            <tr key={funcIdx} className={funcIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                              <td className="px-6 py-4 text-sm font-medium">
                                {func.nome}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof func.basico === 'boolean' ? (
                                  func.basico ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm">{func.basico}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof func.pro === 'boolean' ? (
                                  func.pro ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm">{func.pro}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof func.premium === 'boolean' ? (
                                  func.premium ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm">{func.premium}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Limites e Características</CardTitle>
                <CardDescription>
                  Configure os limites de cada plano e suas características
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Número máximo de imóveis - Plano Básico</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={numImoveisRange}
                        max={500}
                        step={10}
                        className="w-full"
                        onValueChange={setNumImoveisRange}
                      />
                      <span className="w-12 text-right font-medium">{numImoveisRange}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Número máximo de corretores - Plano Básico</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        defaultValue={[5]}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                      <span className="w-12 text-right font-medium">5</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Número máximo de integrações - Plano Pro</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        defaultValue={[3]}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <span className="w-12 text-right font-medium">3</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Funcionalidades por Plano</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tours-basico" className="flex items-center gap-2">
                        <Home className="h-4 w-4" /> 
                        Tours virtuais no plano Básico
                      </Label>
                      <Switch id="tours-basico" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ia-pro" className="flex items-center gap-2">
                        <Brain className="h-4 w-4" /> 
                        IA para descrições no plano Pro
                      </Label>
                      <Switch id="ia-pro" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="api-premium" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" /> 
                        API para desenvolvedores no plano Premium
                      </Label>
                      <Switch id="api-premium" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-6">
                <Button variant="outline">Restaurar Padrões</Button>
                <Button>Salvar Configurações</Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Promoções</CardTitle>
                  <CardDescription>Configure descontos e ofertas especiais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cupom-promo">Código promocional</Label>
                    <Input id="cupom-promo" placeholder="PROMO2025" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="desconto">Desconto (%)</Label>
                    <Input id="desconto" type="number" placeholder="15" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="promo-ativa">Promoção ativa</Label>
                    <Switch id="promo-ativa" />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Criar Promoção</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Período de testes</CardTitle>
                  <CardDescription>Configure o período de avaliação gratuita</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dias-teste">Dias de teste gratuito</Label>
                    <Input id="dias-teste" type="number" placeholder="14" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="teste-cartao">Requer cartão de crédito</Label>
                    <Switch id="teste-cartao" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Salvar</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
