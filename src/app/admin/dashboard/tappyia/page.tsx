'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bot,
  Zap,
  Cpu,
  Settings,
  BarChart,
  PieChart,
  LineChart,
  RefreshCw,
  Plus,
  ChevronRight,
  Check,
  Brain,
  LucideIcon,
  Save,
  Tag,
  MessageSquare,
  AlertCircle,
  FlaskConical,
  DollarSign,
  Timer,
  HelpCircle,
  Code,
  FileCode,
  Sparkles,
  Database,
  Lock,
  Clock,
  Users,
  Search,
  Upload,
  FileUp,
  Filter,
  Download,
  PlayCircle,
  PauseCircle,
  BookOpen,
  Rotate3D,
  Terminal,
  CheckCircle2,
  CircleSlash,
  Copy
} from 'lucide-react';

// Dados fictícios para demonstração
const consumoTokens = {
  mensal: 28500000,
  limiteContratado: 50000000,
  usoPercentual: 57,
  custoMensal: 2850.00,
  custoPrevistoAnual: 34200.00,
  mediaUltimos30Dias: 950000,
  crescimentoMensal: 12.5,
  
  distribuicao: [
    { nome: 'Atendimento', percentual: 45, tokens: 12825000, cor: 'bg-blue-500' },
    { nome: 'Análise de Imóveis', percentual: 25, tokens: 7125000, cor: 'bg-purple-500' },
    { nome: 'Fine-tuning', percentual: 20, tokens: 5700000, cor: 'bg-amber-500' },
    { nome: 'Embeds', percentual: 10, tokens: 2850000, cor: 'bg-green-500' }
  ],
  
  historico: [
    { data: '05/02/2025', tokens: 785000, custo: 78.50 },
    { data: '12/02/2025', tokens: 920000, custo: 92.00 },
    { data: '19/02/2025', tokens: 880000, custo: 88.00 },
    { data: '26/02/2025', tokens: 950000, custo: 95.00 },
    { data: '05/03/2025', tokens: 1050000, custo: 105.00 },
    { data: '12/03/2025', tokens: 1100000, custo: 110.00 }
  ],
  
  modelosEmUso: [
    { 
      nome: 'DeepSeek-V2', 
      tipo: 'LLM', 
      versao: '1.5',
      tokens: 15675000, 
      percentualUso: 55,
      custoMedio: 0.10, 
      status: 'ativo',
      detalhes: 'Modelo principal para interações de texto' 
    },
    { 
      nome: 'Claude 3 Haiku', 
      tipo: 'LLM', 
      versao: '1.0',
      tokens: 8550000, 
      percentualUso: 30,
      custoMedio: 0.12, 
      status: 'ativo',
      detalhes: 'Backup para casos específicos' 
    },
    { 
      nome: 'DALL-E 3', 
      tipo: 'Imagem', 
      versao: '3.0',
      tokens: 2850000, 
      percentualUso: 10,
      custoMedio: 0.15, 
      status: 'ativo',
      detalhes: 'Geração de imagens' 
    },
    { 
      nome: 'OpenAI Embedding', 
      tipo: 'Embedding', 
      versao: '3.0',
      tokens: 1425000, 
      percentualUso: 5,
      custoMedio: 0.05, 
      status: 'ativo',
      detalhes: 'Embeddings para busca semântica' 
    }
  ]
};

const modelosDisponiveis = [
  { 
    id: 'm1', 
    nome: 'DeepSeek-V2', 
    contexto: 128000, 
    treinamento: true,
    custoInput: 0.0005,
    custoOutput: 0.0015,
    custoTraining: 0.0030,
    aplicacoesRecomendadas: ['Chat', 'Análise de Documentos', 'Redação']
  },
  { 
    id: 'm2', 
    nome: 'Claude 3 Haiku', 
    contexto: 200000, 
    treinamento: true,
    custoInput: 0.0010,
    custoOutput: 0.0030,
    custoTraining: 0.0050,
    aplicacoesRecomendadas: ['Análise complexa', 'Raciocínio', 'Multimodal']
  },
  { 
    id: 'm3', 
    nome: 'GPT-4o', 
    contexto: 128000, 
    treinamento: true,
    custoInput: 0.0010,
    custoOutput: 0.0030,
    custoTraining: 0.0080,
    aplicacoesRecomendadas: ['Casos gerais', 'Versatilidade', 'Precisão']
  },
  { 
    id: 'm4', 
    nome: 'Mistral Large', 
    contexto: 32000, 
    treinamento: false,
    custoInput: 0.0006,
    custoOutput: 0.0020,
    custoTraining: null,
    aplicacoesRecomendadas: ['Respostas rápidas', 'Baixo custo', 'Eficiência']
  }
];

// Interface para o componente ModelCard
interface ModeloCardProps {
  nome: string;
  tipo: string;
  versao: string;
  tokens: number;
  percentualUso: number;
  custoMedio: number;
  status: string;
  detalhes: string;
}

// Componente de card para modelo de IA
function ModeloCard({ nome, tipo, versao, tokens, percentualUso, custoMedio, status, detalhes }: ModeloCardProps) {
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    return `${(tokens / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className={
            tipo === 'LLM' ? 'bg-blue-500' : 
            tipo === 'Imagem' ? 'bg-purple-500' : 
            'bg-green-500'
          }>
            {tipo}
          </Badge>
          <Badge variant="outline" className={
            status === 'ativo' ? 'text-green-500 border-green-200' : 
            'text-amber-500 border-amber-200'
          }>
            {status === 'ativo' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-2">{nome}</CardTitle>
        <CardDescription className="flex items-center mt-1">
          <Tag className="h-3.5 w-3.5 mr-1" />
          v{versao}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uso de tokens:</span>
              <span className="font-medium">{formatTokens(tokens)}</span>
            </div>
            <Progress value={percentualUso} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{percentualUso}% do total</span>
              <span className="text-muted-foreground">Custo médio: ${custoMedio}/1K tokens</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{detalhes}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button variant="outline" size="sm" className="w-full">
          Configurar
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TappyIAPage() {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [tempModeloSelecionado, setTempModeloSelecionado] = useState('DeepSeek-V2');
  const [tempContextoMaximo, setTempContextoMaximo] = useState(75);
  const [tempTemperatura, setTempTemperatura] = useState(0.7);
  const [tempMaxTokens, setTempMaxTokens] = useState(4000);
  
  return (
    <PageContainer
      title="TappyIA"
      subtitle="Gerencie a inteligência artificial da plataforma"
    >
      <Tabs defaultValue="visao-geral" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full">
          <TabsTrigger value="visao-geral" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="modelos" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Modelos
          </TabsTrigger>
          <TabsTrigger value="fine-tuning" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Fine-tuning
          </TabsTrigger>
          <TabsTrigger value="integracao" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Integração
          </TabsTrigger>
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral">
          {/* Cartões de métricas principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="bg-primary/10 rounded-full p-3 mb-3">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-2xl font-bold">{(consumoTokens.mensal / 1000000).toFixed(1)}M</h4>
                <p className="text-sm text-muted-foreground">Tokens consumidos/mês</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="bg-green-500/10 rounded-full p-3 mb-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <h4 className="text-2xl font-bold">R$ {consumoTokens.custoMensal.toFixed(2)}</h4>
                <p className="text-sm text-muted-foreground">Custo mensal</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="bg-purple-500/10 rounded-full p-3 mb-3">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <h4 className="text-2xl font-bold">32.754</h4>
                <p className="text-sm text-muted-foreground">Requisições/dia</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <div className="bg-amber-500/10 rounded-full p-3 mb-3">
                  <Users className="h-5 w-5 text-amber-500" />
                </div>
                <h4 className="text-2xl font-bold">24</h4>
                <p className="text-sm text-muted-foreground">Agentes ativos</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráfico de progresso mensal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Consumo do plano mensal</CardTitle>
              <CardDescription>
                {consumoTokens.usoPercentual}% do limite de {(consumoTokens.limiteContratado / 1000000).toFixed(0)}M tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={consumoTokens.usoPercentual} className="h-4" />
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div>
                    <p className="text-sm font-medium">Usados</p>
                    <p className="text-2xl font-bold">{(consumoTokens.mensal / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Disponíveis</p>
                    <p className="text-2xl font-bold">{((consumoTokens.limiteContratado - consumoTokens.mensal) / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Média diária</p>
                    <p className="text-2xl font-bold">{(consumoTokens.mediaUltimos30Dias / 1000000).toFixed(2)}M</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Crescimento</p>
                    <p className="text-2xl font-bold text-green-500">+{consumoTokens.crescimentoMensal}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Distribuição de uso */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribuição de uso por tipo</CardTitle>
                <CardDescription>
                  Como os tokens estão sendo utilizados em sua plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consumoTokens.distribuicao.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${item.cor} mr-2`}></div>
                          <span className="text-sm font-medium">{item.nome}</span>
                        </div>
                        <span className="text-sm font-medium">{item.percentual}%</span>
                      </div>
                      <Progress value={item.percentual} className={`h-2 ${item.cor}`} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{(item.tokens / 1000000).toFixed(1)}M tokens</span>
                        <span>R$ {(item.tokens * 0.0001).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
                <CardDescription>
                  Monitoramento em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Sistema online</span>
                      </div>
                      <Badge className="bg-green-500">100%</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Latência API</span>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-200">78ms</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Threads ativos</span>
                      </div>
                      <Badge variant="outline" className="text-blue-500 border-blue-200">124</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-sm">Cache rate</span>
                      </div>
                      <Badge variant="outline" className="text-amber-500 border-amber-200">76%</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Embeddings</span>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-200">OK</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Atualizar status
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Modelos em uso */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Modelos em uso</CardTitle>
                <CardDescription>
                  Modelos de IA ativos em sua plataforma
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar modelo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {consumoTokens.modelosEmUso.map((modelo, index) => (
                  <ModeloCard
                    key={index}
                    nome={modelo.nome}
                    tipo={modelo.tipo}
                    versao={modelo.versao}
                    tokens={modelo.tokens}
                    percentualUso={modelo.percentualUso}
                    custoMedio={modelo.custoMedio}
                    status={modelo.status}
                    detalhes={modelo.detalhes}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Modelos */}
        <TabsContent value="modelos">
          <div className="grid grid-cols-1 gap-6">
            {/* Cabeçalho com ações */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Modelos de IA Disponíveis</h2>
                <p className="text-muted-foreground">Gerencie e configure os modelos de IA utilizados na plataforma</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar modelo personalizado
              </Button>
            </div>

            {/* Filtros e busca */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input 
                  placeholder="Buscar modelo..." 
                  className="w-full pl-9"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Label htmlFor="mostrar-inativos" className="text-sm font-medium cursor-pointer">
                  Mostrar inativos
                </Label>
                <Switch id="mostrar-inativos" />
              </div>
            </div>

            {/* Cards de modelos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modelosDisponiveis.map((modelo, index) => (
                <Card key={index} className="overflow-hidden border-2 hover:border-primary/50 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{modelo.nome}</CardTitle>
                      <Badge variant="outline" className={modelo.treinamento ? 'border-green-200 text-green-600' : 'border-amber-200 text-amber-600'}>
                        {modelo.treinamento ? 'Fine-tuning' : 'Somente inferência'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center mt-1">
                      <Brain className="h-3.5 w-3.5 mr-1" />
                      Contexto: {(modelo.contexto / 1000).toFixed(0)}K tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Custo de input:</p>
                          <p className="font-medium">${modelo.custoInput.toFixed(4)}/1K tokens</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Custo de output:</p>
                          <p className="font-medium">${modelo.custoOutput.toFixed(4)}/1K tokens</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Recomendado para:</h5>
                        <div className="flex flex-wrap gap-1">
                          {modelo.aplicacoesRecomendadas.map((app, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{app}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t bg-muted/30 p-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      Testar
                    </Button>
                    <Button size="sm" className="flex-1">
                      Configurar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Card para adicionar novo modelo */}
              <Card className="border-dashed flex flex-col items-center justify-center p-6 h-full min-h-[16rem]">
                <div className="rounded-full border-2 border-dashed p-4 mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">Adicionar modelo</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">Integre novos modelos de IA à plataforma</p>
                <Button variant="outline">
                  Configurar novo modelo
                </Button>
              </Card>
            </div>

            {/* Configurações globais dos modelos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Configurações Globais de Modelos</CardTitle>
                <CardDescription>
                  Defina os parâmetros padrão para todos os modelos de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="limite-tokens">Limite mensal de tokens</Label>
                      <Input id="limite-tokens" placeholder="50,000,000" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="alerta-tokens">Alerta de consumo</Label>
                        <span className="text-xs text-muted-foreground">75%</span>
                      </div>
                      <Input id="alerta-tokens" type="range" min="10" max="100" step="5" value="75" className="cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="modelo-padrao">Modelo padrão</Label>
                      <select
                        id="modelo-padrao"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={tempModeloSelecionado}
                        onChange={(e) => setTempModeloSelecionado(e.target.value)}
                      >
                        {modelosDisponiveis.map((modelo) => (
                          <option key={modelo.id} value={modelo.nome}>{modelo.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="max-contexto">Máximo de contexto</Label>
                        <span className="text-xs text-muted-foreground">{tempContextoMaximo}%</span>
                      </div>
                      <Input 
                        id="max-contexto" 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5" 
                        value={tempContextoMaximo} 
                        className="cursor-pointer" 
                        onChange={(e) => setTempContextoMaximo(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="temperatura">Temperatura</Label>
                        <span className="text-xs text-muted-foreground">{tempTemperatura}</span>
                      </div>
                      <Input 
                        id="temperatura" 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1" 
                        value={tempTemperatura} 
                        className="cursor-pointer"
                        onChange={(e) => setTempTemperatura(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fallback-modelo">Modelo de fallback</Label>
                      <select
                        id="fallback-modelo"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {modelosDisponiveis.map((modelo) => (
                          <option key={modelo.id} value={modelo.nome}>{modelo.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="max-tokens">Max tokens resposta</Label>
                        <span className="text-xs text-muted-foreground">{tempMaxTokens}</span>
                      </div>
                      <Input 
                        id="max-tokens" 
                        type="range" 
                        min="100" 
                        max="8000" 
                        step="100" 
                        value={tempMaxTokens} 
                        className="cursor-pointer" 
                        onChange={(e) => setTempMaxTokens(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-4">
                      <Button variant="outline" className="w-full">Restaurar padrões</Button>
                      <Button className="w-full">Salvar configurações</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Fine-tuning */}
        <TabsContent value="fine-tuning">
          <div className="grid grid-cols-1 gap-6">
            {/* Cabeçalho da página */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Fine-tuning de Modelos</h2>
                <p className="text-muted-foreground">Treine modelos de IA personalizados para suas imobiliárias</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo projeto de treinamento
              </Button>
            </div>
            
            {/* Status dos jobs de fine-tuning */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-amber-500/10 p-3 rounded-full mb-3">
                      <PlayCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-bold">3</h3>
                    <p className="text-sm text-muted-foreground">Em execução</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-500/10 p-3 rounded-full mb-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold">2</h3>
                    <p className="text-sm text-muted-foreground">Em fila</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-500/10 p-3 rounded-full mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold">12</h3>
                    <p className="text-sm text-muted-foreground">Concluídos</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-red-500/10 p-3 rounded-full mb-3">
                      <CircleSlash className="h-5 w-5 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold">1</h3>
                    <p className="text-sm text-muted-foreground">Falhas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Projetos de fine-tuning ativos */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Projetos de Fine-tuning Ativos</CardTitle>
                    <CardDescription>Processos de treinamento em andamento</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-60">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input 
                        placeholder="Buscar projeto..." 
                        className="w-full pl-9"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do modelo</TableHead>
                        <TableHead>Imobiliária</TableHead>
                        <TableHead>Base</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">AgenteBroker-Prime</TableCell>
                        <TableCell>Imobiliária Norte</TableCell>
                        <TableCell>DeepSeek-V2</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={75} className="h-2" />
                            <span className="text-xs">75%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500">Em execução</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Terminal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell className="font-medium">AtendimentoVIP</TableCell>
                        <TableCell>Pacific Imóveis</TableCell>
                        <TableCell>DeepSeek-V2</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={24} className="h-2" />
                            <span className="text-xs">24%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500">Em execução</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Terminal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell className="font-medium">AssistenteMKT</TableCell>
                        <TableCell>Imobiliária Sudeste</TableCell>
                        <TableCell>Claude 3 Haiku</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={42} className="h-2" />
                            <span className="text-xs">42%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500">Em execução</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Terminal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell className="font-medium">AnaliseMercado</TableCell>
                        <TableCell>Global Imóveis</TableCell>
                        <TableCell>DeepSeek-V2</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={0} className="h-2" />
                            <span className="text-xs">0%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-200 text-blue-600">Em fila</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <CircleSlash className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Terminal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando 4 de 17 projetos
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            {/* Novo projeto de fine-tuning */}
            <Card>
              <CardHeader>
                <CardTitle>Criar novo projeto de Fine-tuning</CardTitle>
                <CardDescription>
                  Configure os parâmetros para treinar um novo modelo de IA personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome-projeto">Nome do projeto</Label>
                      <Input id="nome-projeto" placeholder="Ex: AssistenteCorretor" />
                      <p className="text-xs text-muted-foreground">Um nome único para identificar este modelo</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="modelo-base">Modelo base</Label>
                      <select
                        id="modelo-base"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione um modelo base</option>
                        {modelosDisponiveis
                          .filter(modelo => modelo.treinamento)
                          .map((modelo) => (
                            <option key={modelo.id} value={modelo.nome}>{modelo.nome}</option>
                          ))}
                      </select>
                      <p className="text-xs text-muted-foreground">O modelo original que será personalizado</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="imobiliaria">Imobiliária</Label>
                      <select
                        id="imobiliaria"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione uma imobiliária</option>
                        <option value="imob1">Imobiliária Norte</option>
                        <option value="imob2">Pacific Imóveis</option>
                        <option value="imob3">Imobiliária Sudeste</option>
                        <option value="imob4">Global Imóveis</option>
                      </select>
                      <p className="text-xs text-muted-foreground">A imobiliária que utilizará este modelo</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dados de treinamento</Label>
                      <div className="border rounded-md p-4 bg-muted/40">
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <FileUp className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Arraste arquivos ou clique para enviar</p>
                          <p className="text-xs text-muted-foreground">Aceita JSONL, CSV ou TXT (máx 100MB)</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Escolher arquivos
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="epochs">Epochs de treinamento</Label>
                        <span className="text-xs text-muted-foreground">3</span>
                      </div>
                      <Input id="epochs" type="range" min="1" max="5" step="1" value="3" className="cursor-pointer" />
                      <p className="text-xs text-muted-foreground">Mais epochs = melhor personalização, mais custo</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <Button variant="outline" className="gap-1">
                        <BookOpen className="h-4 w-4" />
                        Ver documentação
                      </Button>
                      <Button className="gap-1">
                        <Sparkles className="h-4 w-4" />
                        Iniciar treinamento
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Integração */}
        <TabsContent value="integracao">
          <div className="grid grid-cols-1 gap-6">
            {/* Cabeçalho da página */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Integração TappyIA</h2>
                <p className="text-muted-foreground">Conecte os serviços de IA às suas aplicações</p>
              </div>
              <Button variant="outline" className="gap-2">
                <FileCode className="h-4 w-4" />
                Documentação completa
              </Button>
            </div>

            {/* Visão geral e chaves de API */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Chaves de API</CardTitle>
                  <CardDescription>Gerencie suas chaves de API para integração com TappyIA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Chave de API principal</h3>
                          <p className="text-sm text-muted-foreground">Usada para autenticar solicitações à API de produção</p>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Renovar
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <Input 
                            type="password" 
                            value="sk_live_TappyIA_7xB42FpKQ8R9ZMvX3Dw5nGcL" 
                            className="pr-24" 
                            readOnly
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Badge variant="outline" className="font-mono text-xs">ATIVO</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limites e quotas</CardTitle>
                  <CardDescription>Limites de uso da API por plano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Requisições / minuto</span>
                        <span className="font-medium">500 / 1000</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tokens / dia</span>
                        <span className="font-medium">1.2M / 5M</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fine-tunings simultâneos</span>
                        <span className="font-medium">3 / 5</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>

                    <Button variant="outline" className="w-full" size="sm">
                      Atualizar plano
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exemplos de código */}
            <Card>
              <CardHeader>
                <CardTitle>Exemplos de integração</CardTitle>
                <CardDescription>Código de exemplo para implementar TappyIA na sua aplicação</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="typescript" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="typescript">TypeScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="php">PHP</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="typescript" className="mt-0">
                    <div className="relative rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-xs">
{`import axios from 'axios';

const TAPPY_API_KEY = 'sk_live_TappyIA_7xB42FpKQ8R9ZMvX3Dw5nGcL';

async function consultarTappyIA() {
  try {
    const resposta = await axios.post(
      'https://api.tappyia.com.br/v1/chat/completions',
      {
        modelo: 'AgenteBroker-Prime',
        mensagens: [
          { papel: 'sistema', conteudo: 'Você é um assistente imobiliário especializado.' },
          { papel: 'usuario', conteudo: 'Quais imóveis de luxo temos disponíveis?' }
        ],
        temperatura: 0.7,
        tokens_max: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${TAPPY_API_KEY}\`
        }
      }
    );

    console.log(resposta.data);
    return resposta.data;
  } catch (erro) {
    console.error('Erro ao consultar TappyIA:', erro);
    throw erro;
  }
}`}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="python" className="mt-0">
                    <div className="relative rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-xs">
{`import requests
import json

TAPPY_API_KEY = "sk_live_TappyIA_7xB42FpKQ8R9ZMvX3Dw5nGcL"

def consultar_tappyia():
    url = "https://api.tappyia.com.br/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TAPPY_API_KEY}"
    }
    
    payload = {
        "modelo": "AgenteBroker-Prime",
        "mensagens": [
            {"papel": "sistema", "conteudo": "Você é um assistente imobiliário especializado."},
            {"papel": "usuario", "conteudo": "Quais imóveis de luxo temos disponíveis?"}
        ],
        "temperatura": 0.7,
        "tokens_max": 1000
    }
    
    try:
        resposta = requests.post(url, headers=headers, data=json.dumps(payload))
        resposta.raise_for_status()
        return resposta.json()
    except Exception as erro:
        print(f"Erro ao consultar TappyIA: {erro}")
        raise erro

# Exemplo de uso
resultado = consultar_tappyia()
print(resultado)`}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="php" className="mt-0">
                    <div className="relative rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-xs">
{`<?php
$tappyApiKey = 'sk_live_TappyIA_7xB42FpKQ8R9ZMvX3Dw5nGcL';

function consultarTappyIA() {
    $url = 'https://api.tappyia.com.br/v1/chat/completions';
    
    $dados = [
        'modelo' => 'AgenteBroker-Prime',
        'mensagens' => [
            ['papel' => 'sistema', 'conteudo' => 'Você é um assistente imobiliário especializado.'],
            ['papel' => 'usuario', 'conteudo' => 'Quais imóveis de luxo temos disponíveis?']
        ],
        'temperatura' => 0.7,
        'tokens_max' => 1000
    ];
    
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $tappyApiKey
    ]);
    
    $resposta = curl_exec($ch);
    $erro = curl_error($ch);
    curl_close($ch);
    
    if ($erro) {
        throw new Exception("Erro ao consultar TappyIA: " . $erro);
    }
    
    return json_decode($resposta, true);
}

try {
    $resultado = consultarTappyIA();
    print_r($resultado);
} catch (Exception $e) {
    echo $e->getMessage();
}`}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="curl" className="mt-0">
                    <div className="relative rounded-md bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-xs">
{`curl -X POST https://api.tappyia.com.br/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_TappyIA_7xB42FpKQ8R9ZMvX3Dw5nGcL" \
  -d '{
    "modelo": "AgenteBroker-Prime",
    "mensagens": [
      {"papel": "sistema", "conteudo": "Você é um assistente imobiliário especializado."},
      {"papel": "usuario", "conteudo": "Quais imóveis de luxo temos disponíveis?"}
    ],
    "temperatura": 0.7,
    "tokens_max": 1000
  }'`}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="flex w-full justify-between items-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Baixar SDK
                  </Button>
                  <Button variant="link" size="sm" className="gap-1">
                    Ver todos os exemplos
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Configure webhooks para receber notificações de eventos TappyIA</CardDescription>
                  </div>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Novo webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Eventos</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          https://meusite.com.br/api/tappyia/webhook
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">chat.completion</Badge>
                            <Badge variant="outline" className="text-xs">fine-tuning.completed</Badge>
                          </div>
                        </TableCell>
                        <TableCell>03/11/2024</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Ativo</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <CircleSlash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          https://api.imobiliariasudeste.com/tappy/webhook
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">chat.completion</Badge>
                            <Badge variant="outline" className="text-xs">embedding.created</Badge>
                          </div>
                        </TableCell>
                        <TableCell>01/09/2024</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">Ativo</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <CircleSlash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  <HelpCircle className="h-4 w-4 inline-block mr-1" />
                  Webhooks permitem que sua aplicação receba notificações em tempo real quando ocorrem eventos no TappyIA.
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Configurações */}
        <TabsContent value="configuracoes">
          <div className="grid grid-cols-1 gap-6">
            {/* Cabeçalho da página */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Configurações TappyIA</h2>
                <p className="text-muted-foreground">Personalize as configurações da sua inteligência artificial</p>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Salvar alterações
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Configurações Gerais */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Gerais</CardTitle>
                    <CardDescription>Configurações básicas do sistema de IA</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="modelo-padrao">Modelo padrão</Label>
                          <p className="text-sm text-muted-foreground">Selecione o modelo base para todas as imobiliárias</p>
                        </div>
                        <select
                          id="modelo-padrao"
                          className="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {modelosDisponiveis.map((modelo) => (
                            <option key={modelo.id} value={modelo.nome}>{modelo.nome}</option>
                          ))}
                        </select>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Ativação automática</Label>
                          <p className="text-sm text-muted-foreground">Ativar automaticamente para novas imobiliárias</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Limite de tokens diário</Label>
                          <p className="text-sm text-muted-foreground">Limite máximo de tokens por imobiliária/dia</p>
                        </div>
                        <Input 
                          type="number" 
                          defaultValue="50000" 
                          className="w-[180px]" 
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Cache de respostas</Label>
                          <p className="text-sm text-muted-foreground">Armazenar respostas para economizar tokens</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Monitoramento 24/7</Label>
                          <p className="text-sm text-muted-foreground">Monitorar continuamente o uso e alertas</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Segurança e Conformidade</CardTitle>
                    <CardDescription>Configurações de segurança e privacidade</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Autenticação de 2 Fatores</Label>
                          <p className="text-sm text-muted-foreground">Exigir 2FA para acessar configurações de IA</p>
                        </div>
                        <Switch />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Registro de ações</Label>
                          <p className="text-sm text-muted-foreground">Manter logs detalhados de todas as interações com IA</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Eliminação automática de dados</Label>
                          <p className="text-sm text-muted-foreground">Período para excluir histórico de conversas</p>
                        </div>
                        <select
                          className="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="7">7 dias</option>
                          <option value="30">30 dias</option>
                          <option value="90">90 dias</option>
                          <option value="180">180 dias</option>
                          <option value="365">1 ano</option>
                          <option value="0">Nunca</option>
                        </select>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Filtro de conteúdo sensitível</Label>
                          <p className="text-sm text-muted-foreground">Filtrar automáticamente conteúdo impróprio</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar de configurações */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>Configure alertas e notificações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Switch id="notif-uso" />
                      <div className="grid gap-0.5">
                        <Label htmlFor="notif-uso">Alertas de uso</Label>
                        <p className="text-xs text-muted-foreground">Notificar quando o uso de tokens atingir 80%</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Switch id="notif-custo" defaultChecked />
                      <div className="grid gap-0.5">
                        <Label htmlFor="notif-custo">Alertas de custo</Label>
                        <p className="text-xs text-muted-foreground">Notificar quando os custos excederem o limite</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Switch id="notif-finetune" defaultChecked />
                      <div className="grid gap-0.5">
                        <Label htmlFor="notif-finetune">Fine-tuning</Label>
                        <p className="text-xs text-muted-foreground">Notificar ao concluir treinamentos</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Switch id="notif-erros" defaultChecked />
                      <div className="grid gap-0.5">
                        <Label htmlFor="notif-erros">Erros do sistema</Label>
                        <p className="text-xs text-muted-foreground">Notificar sobre erros e falhas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Backup & Exportação</CardTitle>
                    <CardDescription>Programe backups e exportações</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Frequência de backup</Label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="diario">Diário</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Exportar dados
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Suporte TappyIA</CardTitle>
                    <CardDescription>Precisa de ajuda?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="justify-start gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat com suporte
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <FileCode className="h-4 w-4" />
                        Documentação
                      </Button>
                      <Button variant="outline" className="justify-start gap-2">
                        <BookOpen className="h-4 w-4" />
                        Tutoriais
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
