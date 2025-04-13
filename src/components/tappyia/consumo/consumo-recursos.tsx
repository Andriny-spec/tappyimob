'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Bot, 
  Zap, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Calendar, 
  RefreshCw, 
  Clock, 
  Download,
  ArrowDownRight,
  ArrowUpRight,
  Wallet
} from 'lucide-react';

interface ConsumoRecursosProps {
  // Propriedades extras podem ser adicionadas aqui
}

interface DadosConsumo {
  agentes: AgenteConsumo[];
  estatisticasGerais: EstatisticasGerais;
  historicoConsumo: DadosHistorico[];
  consumoPorCanal: DadosCanal[];
}

interface AgenteConsumo {
  id: string;
  nome: string;
  emoji: string;
  tokens: number;
  interacoes: number;
  ultimaAtividade: string;
  crescimento: number;
  custo: number;
}

interface EstatisticasGerais {
  tokensTotal: number;
  custoTotal: number;
  interacoesTotal: number;
  tempoMedioResposta: string;
  crescimento: number;
}

interface DadosHistorico {
  data: string;
  tokens: number;
  custo: number;
}

interface DadosCanal {
  nome: string;
  tokens: number;
  percentual: number;
  cor: string;
}

export function ConsumoRecursos({}: ConsumoRecursosProps) {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30d');
  const [dados, setDados] = useState<DadosConsumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        // Em produção, usaríamos a API real:
        // const response = await fetch(`/api/ia/consumo?periodo=${periodoSelecionado}`);
        // if (!response.ok) throw new Error('Erro ao carregar dados de consumo');
        // const dadosReais = await response.json();
        // setDados(dadosReais);
        
        // Para fins de demonstração, usamos dados mockados:
        setTimeout(() => {
          setDados(gerarDadosMock());
          setCarregando(false);
        }, 1000);
        
      } catch (error) {
        console.error('Erro ao buscar dados de consumo:', error);
        setErro('Ocorreu um erro ao carregar os dados de consumo. Tente novamente mais tarde.');
        setCarregando(false);
      }
    };
    
    buscarDados();
  }, [periodoSelecionado]);

  const formatarNumero = (numero: number): string => {
    return new Intl.NumberFormat('pt-BR').format(numero);
  };

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Gerar dados mock para teste
  const gerarDadosMock = (): DadosConsumo => {
    // Cores para os canais
    const cores = ['#25D366', '#4267B2', '#E1306C', '#229ED9', '#8a2be2', '#ff6347'];
    
    // Gerar histórico para gráfico
    const historico = Array.from({ length: 30 }, (_, i) => {
      const data = new Date();
      data.setDate(data.getDate() - 29 + i);
      const tokens = Math.floor(10000 + Math.random() * 15000 * (1 + i/20));
      return {
        data: data.toLocaleDateString('pt-BR'),
        tokens,
        custo: tokens * 0.000015
      };
    });
    
    // Canais de consumo
    const canais = [
      { nome: 'WhatsApp', tokens: 150000, percentual: 45, cor: cores[0] },
      { nome: 'Facebook', tokens: 80000, percentual: 24, cor: cores[1] },
      { nome: 'Instagram', tokens: 50000, percentual: 15, cor: cores[2] },
      { nome: 'Telegram', tokens: 30000, percentual: 9, cor: cores[3] },
      { nome: 'Site', tokens: 15000, percentual: 4.5, cor: cores[4] },
      { nome: 'Outros', tokens: 8000, percentual: 2.5, cor: cores[5] }
    ];
    
    // Calcular totais
    const tokensTotal = canais.reduce((acc, canal) => acc + canal.tokens, 0);
    
    return {
      agentes: [
        {
          id: '1',
          nome: 'Vendedor Profissional',
          emoji: '💼',
          tokens: 180000,
          interacoes: 1240,
          ultimaAtividade: 'Hoje, 14:23',
          crescimento: 12.5,
          custo: 2.7
        },
        {
          id: '2',
          nome: 'Atendente Imobiliário',
          emoji: '🏢',
          tokens: 120000,
          interacoes: 890,
          ultimaAtividade: 'Hoje, 15:10',
          crescimento: 8.3,
          custo: 1.8
        },
        {
          id: '3', 
          nome: 'Consultor de Vendas',
          emoji: '📊',
          tokens: 33000,
          interacoes: 245,
          ultimaAtividade: 'Ontem, 18:45',
          crescimento: -5.2,
          custo: 0.495
        }
      ],
      estatisticasGerais: {
        tokensTotal,
        custoTotal: tokensTotal * 0.000015,
        interacoesTotal: 2375,
        tempoMedioResposta: '0.8s',
        crescimento: 15.7
      },
      historicoConsumo: historico,
      consumoPorCanal: canais
    };
  };

  // Renderiza o conteúdo principal com os dados
  const renderizarConteudo = () => {
    if (carregando) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Carregando dados de consumo...</p>
            <p className="text-sm text-slate-500">Calculando estatísticas</p>
          </div>
        </div>
      );
    }

    if (erro) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-md mb-4 text-center">
          <p className="text-lg font-medium mb-2">Ops! Ocorreu um erro</p>
          <p>{erro}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setPeriodoSelecionado(periodoSelecionado)}
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (!dados) return null;

    return (
      <div className="space-y-6">
        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total de Tokens</p>
                  <h3 className="text-2xl font-bold">{formatarNumero(dados.estatisticasGerais.tokensTotal)}</h3>
                  <div className="flex items-center mt-1 text-sm">
                    {dados.estatisticasGerais.crescimento > 0 ? (
                      <span className="text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +{dados.estatisticasGerais.crescimento}%
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        {dados.estatisticasGerais.crescimento}%
                      </span>
                    )}
                    <span className="text-slate-500 ml-2">vs. mês anterior</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Custo Estimado</p>
                  <h3 className="text-2xl font-bold">{formatarMoeda(dados.estatisticasGerais.custoTotal)}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Custo de processamento de tokens
                  </p>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <Wallet className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total de Interações</p>
                  <h3 className="text-2xl font-bold">{formatarNumero(dados.estatisticasGerais.interacoesTotal)}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Mensagens trocadas com clientes
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Bot className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Tempo Médio de Resposta</p>
                  <h3 className="text-2xl font-bold">{dados.estatisticasGerais.tempoMedioResposta}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Velocidade de processamento
                  </p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráfico de histórico de consumo */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Histórico de Consumo</CardTitle>
                <CardDescription>
                  Evolução do consumo de tokens ao longo do tempo
                </CardDescription>
              </div>
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 3 meses</SelectItem>
                  <SelectItem value="6m">Últimos 6 meses</SelectItem>
                  <SelectItem value="1y">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dados.historicoConsumo}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="data" tickMargin={10} />
                  <YAxis 
                    tickFormatter={(value) => `${value / 1000}k`} 
                    tickMargin={10}
                  />
                  <Tooltip formatter={(value) => formatarNumero(Number(value))} />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    name="Tokens Consumidos" 
                    stroke="#25D366" 
                    strokeWidth={2}
                    dot={{ r: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Distribuição por agentes e canais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consumo por agente */}
          <Card>
            <CardHeader>
              <CardTitle>Consumo por Agente</CardTitle>
              <CardDescription>
                Distribuição de tokens entre os agentes da imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dados.agentes.map((agente) => (
                  <div key={agente.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">{agente.emoji}</div>
                        <div>
                          <h4 className="font-medium">{agente.nome}</h4>
                          <p className="text-sm text-slate-500">{formatarNumero(agente.tokens)} tokens</p>
                        </div>
                      </div>
                      <Badge variant={agente.crescimento >= 0 ? "default" : "destructive"} className={`flex items-center gap-1 ${agente.crescimento >= 0 ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}`}>
                        {agente.crescimento >= 0 ? 
                          <ArrowUpRight className="h-3 w-3" /> : 
                          <ArrowDownRight className="h-3 w-3" />
                        }
                        {Math.abs(agente.crescimento)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${(agente.tokens / dados.estatisticasGerais.tokensTotal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>{formatarMoeda(agente.custo)}</span>
                      <span>{agente.interacoes} interações</span>
                      <span>Última: {agente.ultimaAtividade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Consumo por canal */}
          <Card>
            <CardHeader>
              <CardTitle>Consumo por Canal</CardTitle>
              <CardDescription>
                Distribuição de tokens entre os diferentes canais de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dados.consumoPorCanal}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="tokens"
                      nameKey="nome"
                      label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                    >
                      {dados.consumoPorCanal.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatarNumero(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {dados.consumoPorCanal.map((canal, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: canal.cor }}
                      ></div>
                      <span>{canal.nome}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{formatarNumero(canal.tokens)} tokens</span>
                      <span className="text-sm font-medium">{canal.percentual}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Botão de exportar relatório */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => alert('Exportação de relatório não implementada neste exemplo')}
          >
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Consumo de Recursos
          </h2>
          <p className="text-muted-foreground">
            Monitore o consumo de tokens e interações dos seus agentes
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => setPeriodoSelecionado(periodoSelecionado)}
            className="gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {renderizarConteudo()}
    </div>
  );
}
