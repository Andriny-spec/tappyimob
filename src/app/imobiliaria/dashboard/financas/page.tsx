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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Search,
  Plus,
  Filter,
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Download,
  FileText,
  PieChart,
  TrendingUp,
  BarChart,
  CircleDollarSign,
  Wallet,
  CreditCard,
  Calendar,
  Users,
  User,
  Home,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CalendarDays,
  CheckSquare,
  Eye
} from 'lucide-react';

// Dados fictícios para demonstração
const transacoes = [
  {
    id: 'TR001',
    data: '2025-03-10',
    descricao: 'Comissão - Venda Apartamento Pinheiros',
    tipo: 'receita',
    categoria: 'Comissões',
    valor: 42500,
    status: 'confirmado',
    imovel: 'Apartamento em Pinheiros',
    cliente: 'Ricardo Almeida',
    corretor: 'Ana Santos'
  },
  {
    id: 'TR002',
    data: '2025-03-08',
    descricao: 'Aluguel do escritório',
    tipo: 'despesa',
    categoria: 'Aluguel',
    valor: 5600,
    status: 'confirmado',
    imovel: null,
    cliente: null,
    corretor: null
  },
  {
    id: 'TR003',
    data: '2025-03-05',
    descricao: 'Comissão - Venda Casa em Moema',
    tipo: 'receita',
    categoria: 'Comissões',
    valor: 67500,
    status: 'confirmado',
    imovel: 'Casa em Moema',
    cliente: 'Mariana Costa',
    corretor: 'Carlos Silva'
  },
  {
    id: 'TR004',
    data: '2025-03-01',
    descricao: 'Salários - Funcionários Administrativos',
    tipo: 'despesa',
    categoria: 'Salários',
    valor: 12800,
    status: 'confirmado',
    imovel: null,
    cliente: null,
    corretor: null
  },
  {
    id: 'TR005',
    data: '2025-03-15',
    descricao: 'Comissão - Venda Cobertura em Perdizes',
    tipo: 'receita',
    categoria: 'Comissões',
    valor: 92500,
    status: 'pendente',
    imovel: 'Cobertura Duplex em Perdizes',
    cliente: 'Amanda Oliveira',
    corretor: 'Ana Santos'
  },
  {
    id: 'TR006',
    data: '2025-03-12',
    descricao: 'Internet e Telefonia',
    tipo: 'despesa',
    categoria: 'Serviços',
    valor: 850,
    status: 'confirmado',
    imovel: null,
    cliente: null,
    corretor: null
  },
  {
    id: 'TR007',
    data: '2025-03-14',
    descricao: 'Comissão - Venda Sala Comercial',
    tipo: 'receita',
    categoria: 'Comissões',
    valor: 27500,
    status: 'pendente',
    imovel: 'Sala Comercial no Centro',
    cliente: 'Paulo Mendes',
    corretor: 'Juliana Costa'
  },
  {
    id: 'TR008',
    data: '2025-03-07',
    descricao: 'Manutenção do Sistema',
    tipo: 'despesa',
    categoria: 'Tecnologia',
    valor: 2200,
    status: 'confirmado',
    imovel: null,
    cliente: null,
    corretor: null
  },
  {
    id: 'TR009',
    data: '2025-03-03',
    descricao: 'Comissão - Aluguel Apartamento Vila Mariana',
    tipo: 'receita',
    categoria: 'Comissões',
    valor: 3800,
    status: 'confirmado',
    imovel: 'Apartamento na Vila Mariana',
    cliente: 'Fernanda Lima',
    corretor: 'Marcos Oliveira'
  },
  {
    id: 'TR010',
    data: '2025-03-11',
    descricao: 'Marketing e Publicidade',
    tipo: 'despesa',
    categoria: 'Marketing',
    valor: 4500,
    status: 'confirmado',
    imovel: null,
    cliente: null,
    corretor: null
  }
];

// Resumo financeiro
const resumoFinanceiro = {
  saldoAtual: 203550,
  receitasMes: 234800,
  despesasMes: 31250,
  receitasPendentes: 120000,
  despesasPendentes: 15000,
  variacaoMesAnterior: 12.5
};

// Categorias de receitas e despesas
const categorias = {
  receitas: [
    { nome: 'Comissões', valor: 234800, percentual: 88 },
    { nome: 'Avaliações', valor: 12500, percentual: 5 },
    { nome: 'Consultorias', valor: 18500, percentual: 7 }
  ],
  despesas: [
    { nome: 'Salários', valor: 12800, percentual: 41 },
    { nome: 'Aluguel', valor: 5600, percentual: 18 },
    { nome: 'Marketing', valor: 4500, percentual: 14 },
    { nome: 'Tecnologia', valor: 2200, percentual: 7 },
    { nome: 'Serviços', valor: 850, percentual: 3 },
    { nome: 'Outros', valor: 5300, percentual: 17 }
  ]
};

// Próximos pagamentos
const proximosPagamentos = [
  {
    id: 'PG001',
    data: '2025-03-18',
    descricao: 'Pagamento de Comissão - Carlos Silva',
    valor: 33750,
    status: 'pendente'
  },
  {
    id: 'PG002',
    data: '2025-03-20',
    descricao: 'Pagamento de Comissão - Ana Santos',
    valor: 21250,
    status: 'pendente'
  },
  {
    id: 'PG003',
    data: '2025-03-25',
    descricao: 'Contas de Utilidades',
    valor: 1800,
    status: 'pendente'
  },
  {
    id: 'PG004',
    data: '2025-03-30',
    descricao: 'Pagamento de Salários',
    valor: 18500,
    status: 'agendado'
  }
];

// Função para formatar valores monetários
const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// Função para formatar datas
const formatarData = (dataString) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

// Cores para os status
const statusColors = {
  confirmado: 'text-green-500 bg-green-500/10 border-green-500/20',
  pendente: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  agendado: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  cancelado: 'text-red-500 bg-red-500/10 border-red-500/20'
};

export default function FinancasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todas');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  
  // Filtra transações com base na busca e na aba ativa
  const filteredTransacoes = transacoes.filter(transacao => {
    const matchesSearch = 
      transacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transacao.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transacao.cliente && transacao.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transacao.corretor && transacao.corretor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesTab = true;
    if (activeTab === 'receitas') {
      matchesTab = transacao.tipo === 'receita';
    } else if (activeTab === 'despesas') {
      matchesTab = transacao.tipo === 'despesa';
    } else if (activeTab === 'pendentes') {
      matchesTab = transacao.status === 'pendente';
    }
    
    return matchesSearch && matchesTab;
  });
  
  return (
    <PageContainer
      title="Finanças"
      subtitle="Gerencie receitas, despesas e o fluxo de caixa da sua imobiliária"
    >
      {/* Cartões de resumo financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <h3 className="text-2xl font-bold mt-1">{formatarMoeda(resumoFinanceiro.saldoAtual)}</h3>
                <div className="flex items-center mt-1 text-green-500">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{resumoFinanceiro.variacaoMesAnterior}% vs mês anterior</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Receitas do Mês</p>
                <h3 className="text-2xl font-bold mt-1">{formatarMoeda(resumoFinanceiro.receitasMes)}</h3>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                  <span className="text-sm">{formatarMoeda(resumoFinanceiro.receitasPendentes)} pendentes</span>
                </div>
              </div>
              <div className="bg-green-500/10 p-2 rounded-lg">
                <ArrowUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Despesas do Mês</p>
                <h3 className="text-2xl font-bold mt-1">{formatarMoeda(resumoFinanceiro.despesasMes)}</h3>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                  <span className="text-sm">{formatarMoeda(resumoFinanceiro.despesasPendentes)} pendentes</span>
                </div>
              </div>
              <div className="bg-red-500/10 p-2 rounded-lg">
                <ArrowDown className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Resultado do Mês</p>
                <h3 className="text-2xl font-bold mt-1">{formatarMoeda(resumoFinanceiro.receitasMes - resumoFinanceiro.despesasMes)}</h3>
                <div className="flex items-center mt-1 text-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Lucro</span>
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <CircleDollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel esquerdo - Gráficos e resumos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de receitas por categoria */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Receitas por Categoria</CardTitle>
              <CardDescription>
                Distribuição das receitas do mês
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/20 rounded-md h-[180px] flex items-center justify-center mb-4">
                <PieChart className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                {categorias.receitas.map((categoria, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-primary`} 
                        style={{ opacity: 0.5 + (index * 0.2) }}></div>
                      <span>{categoria.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{formatarMoeda(categoria.valor)}</span>
                      <span className="text-sm font-medium">{categoria.percentual}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Card de despesas por categoria */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>
                Distribuição das despesas do mês
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/20 rounded-md h-[180px] flex items-center justify-center mb-4">
                <PieChart className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                {categorias.despesas.map((categoria, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-red-500`} 
                        style={{ opacity: 0.5 + (index * 0.1) }}></div>
                      <span>{categoria.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{formatarMoeda(categoria.valor)}</span>
                      <span className="text-sm font-medium">{categoria.percentual}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Card de próximos pagamentos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Próximos Pagamentos</CardTitle>
              <CardDescription>
                Pagamentos previstos para os próximos dias
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {proximosPagamentos.map((pagamento, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-md hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{pagamento.descricao}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatarData(pagamento.data)}</span>
                        <Badge 
                          variant="outline" 
                          className={`ml-1 text-xs ${statusColors[pagamento.status]}`}
                        >
                          {pagamento.status === 'pendente' ? 'Pendente' : 'Agendado'}
                        </Badge>
                      </div>
                    </div>
                    <div className="font-medium text-right">
                      {formatarMoeda(pagamento.valor)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <Button variant="outline" className="w-full gap-1">
                <CalendarDays className="h-4 w-4" />
                Ver Calendário Financeiro
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Painel direito - Extrato de transações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cabeçalho com pesquisa, filtros e botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar transações..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select defaultValue="mes" onValueChange={setPeriodoSelecionado}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="trimestre">Este trimestre</SelectItem>
                  <SelectItem value="ano">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" className="gap-1">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          </div>
          
          {/* Abas e extrato de transações */}
          <Tabs defaultValue="todas" className="space-y-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="receitas">Receitas</TabsTrigger>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
              <TabsTrigger value="pendentes" className="relative">
                Pendentes
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {transacoes.filter(t => t.status === 'pendente').length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-center w-[100px]">Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransacoes.length > 0 ? (
                        filteredTransacoes.map((transacao) => (
                          <TableRow key={transacao.id}>
                            <TableCell className="font-medium">
                              {formatarData(transacao.data)}
                            </TableCell>
                            <TableCell>
                              <div>{transacao.descricao}</div>
                              {(transacao.cliente || transacao.corretor) && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {transacao.cliente && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {transacao.cliente}
                                    </span>
                                  )}
                                  {transacao.corretor && (
                                    <span className="flex items-center gap-1 mt-0.5">
                                      <Users className="h-3 w-3" />
                                      {transacao.corretor}
                                    </span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transacao.categoria}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transacao.tipo === 'receita' ? '+' : '-'}{formatarMoeda(transacao.valor)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline" 
                                className={statusColors[transacao.status]}
                              >
                                {transacao.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <FileText className="h-8 w-8 mb-2" />
                              <p>Nenhuma transação encontrada</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Gráfico de evolução financeira */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Evolução Financeira</CardTitle>
              <CardDescription>
                Histórico de receitas e despesas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/20 rounded-md h-[300px] flex items-center justify-center">
                <BarChart className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
