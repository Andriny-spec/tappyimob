'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Filter,
  MapPin,
  User,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  Phone,
  MessageSquare,
  Users,
  Building2,
  CalendarDays,
  CalendarIcon
} from 'lucide-react';

// Dados fictícios para demonstração
const agendamentos = [
  {
    id: 1,
    titulo: 'Visita ao Apartamento em Pinheiros',
    tipo: 'Visita',
    cliente: 'Ricardo Almeida',
    corretor: 'Ana Santos',
    imovel: 'Apartamento em Pinheiros',
    data: '2025-03-15',
    horario: '14:30',
    status: 'agendado',
    endereco: 'Rua dos Pinheiros, 1500, São Paulo - SP',
    observacao: 'Cliente interessado em apartamentos de 2 dormitórios na região. Já visitou outros 2 imóveis.'
  },
  {
    id: 2,
    titulo: 'Assinatura de Contrato',
    tipo: 'Reunião',
    cliente: 'Mariana Costa',
    corretor: 'Carlos Silva',
    imovel: 'Casa em Alphaville',
    data: '2025-03-15',
    horario: '16:00',
    status: 'agendado',
    endereco: 'Escritório da Imobiliária',
    observacao: 'Trazer documentação completa e cheque para sinal.'
  },
  {
    id: 3,
    titulo: 'Vistoria Final',
    tipo: 'Vistoria',
    cliente: 'Paulo Mendes',
    corretor: 'Juliana Costa',
    imovel: 'Apartamento na Vila Mariana',
    data: '2025-03-16',
    horario: '10:00',
    status: 'agendado',
    endereco: 'Rua Vergueiro, 2500, São Paulo - SP',
    observacao: 'Vistoria final antes da entrega das chaves.'
  },
  {
    id: 4,
    titulo: 'Apresentação de Portfólio',
    tipo: 'Reunião',
    cliente: 'Fernanda Lima',
    corretor: 'Marcos Oliveira',
    imovel: null,
    data: '2025-03-17',
    horario: '09:30',
    status: 'agendado',
    endereco: 'Escritório da Imobiliária',
    observacao: 'Cliente procura imóvel para investimento, preferência por apartamentos na zona sul.'
  },
  {
    id: 5,
    titulo: 'Visita a Terreno',
    tipo: 'Visita',
    cliente: 'João Silva',
    corretor: 'Roberto Almeida',
    imovel: 'Terreno em Alphaville',
    data: '2025-03-18',
    horario: '14:00',
    status: 'confirmado',
    endereco: 'Alameda Cauaxi, 380, Barueri - SP',
    observacao: 'Cliente já visitou o local pelo Street View e está bastante interessado.'
  },
  {
    id: 6,
    titulo: 'Visita a Cobertura',
    tipo: 'Visita',
    cliente: 'Amanda Oliveira',
    corretor: 'Ana Santos',
    imovel: 'Cobertura Duplex em Perdizes',
    data: '2025-03-14',
    horario: '15:30',
    status: 'concluido',
    endereco: 'Rua Cardoso de Almeida, 800, São Paulo - SP',
    observacao: 'Cliente gostou muito do imóvel, irá retornar com o marido para uma segunda visita.'
  },
  {
    id: 7,
    titulo: 'Avaliação de Imóvel',
    tipo: 'Avaliação',
    cliente: 'Renata Sousa',
    corretor: 'Carlos Silva',
    imovel: null,
    data: '2025-03-14',
    horario: '10:00',
    status: 'cancelado',
    endereco: 'Alameda dos Nhambiquaras, 1100, São Paulo - SP',
    observacao: 'Cliente cancelou, remarcará para a próxima semana.'
  }
];

const proximasVisitas = agendamentos.filter(
  a => a.status === 'agendado' || a.status === 'confirmado'
).sort((a, b) => {
  const dataA = new Date(`${a.data}T${a.horario}`);
  const dataB = new Date(`${b.data}T${b.horario}`);
  return dataA.getTime() - dataB.getTime();
}).slice(0, 5);

// Função para formatar data
const formatarData = (dataString) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Mapeamento de cores de status
const statusColors = {
  agendado: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
    icon: AlertCircle
  },
  confirmado: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/20',
    icon: CheckCircle2
  },
  concluido: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-500',
    border: 'border-gray-500/20',
    icon: CheckCircle2
  },
  cancelado: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    icon: XCircle
  }
};

export default function AgendamentosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [dataSelecionada, setDataSelecionada] = useState('');
  
  // Filtra agendamentos com base na busca, aba ativa e data selecionada
  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const matchesSearch = 
      agendamento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agendamento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agendamento.imovel && agendamento.imovel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      agendamento.corretor.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      matchesTab = agendamento.data === hoje;
    } else if (activeTab === 'futuros') {
      const hoje = new Date().toISOString().split('T')[0];
      matchesTab = agendamento.data > hoje && (agendamento.status === 'agendado' || agendamento.status === 'confirmado');
    } else if (activeTab === 'concluidos') {
      matchesTab = agendamento.status === 'concluido';
    } else if (activeTab === 'cancelados') {
      matchesTab = agendamento.status === 'cancelado';
    }
    
    let matchesData = true;
    if (dataSelecionada) {
      matchesData = agendamento.data === dataSelecionada;
    }
    
    return matchesSearch && matchesTab && matchesData;
  });
  
  return (
    <PageContainer
      title="Agendamentos"
      subtitle="Gerencie visitas, reuniões e compromissos com clientes"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel esquerdo - Calendário e resumo */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de calendário */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Calendário</CardTitle>
              <CardDescription>
                Visualize e gerencie suas atividades
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/40 h-[300px] rounded-md flex items-center justify-center mb-4">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Componente de calendário será exibido aqui</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Filtrar por data</h3>
                <Select value={dataSelecionada} onValueChange={setDataSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as datas</SelectItem>
                    <SelectItem value="2025-03-14">14/03/2025</SelectItem>
                    <SelectItem value="2025-03-15">15/03/2025</SelectItem>
                    <SelectItem value="2025-03-16">16/03/2025</SelectItem>
                    <SelectItem value="2025-03-17">17/03/2025</SelectItem>
                    <SelectItem value="2025-03-18">18/03/2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full gap-1">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de próximas visitas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Próximas Atividades</CardTitle>
              <CardDescription>
                Seus próximos compromissos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {proximasVisitas.map((agendamento, index) => (
                  <div 
                    key={index} 
                    className="flex gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${statusColors[agendamento.status].bg}`}>
                      {agendamento.tipo === 'Visita' && <Home className={`h-5 w-5 ${statusColors[agendamento.status].text}`} />}
                      {agendamento.tipo === 'Reunião' && <Users className={`h-5 w-5 ${statusColors[agendamento.status].text}`} />}
                      {agendamento.tipo === 'Vistoria' && <CheckCircle2 className={`h-5 w-5 ${statusColors[agendamento.status].text}`} />}
                      {agendamento.tipo === 'Avaliação' && <Building2 className={`h-5 w-5 ${statusColors[agendamento.status].text}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{agendamento.titulo}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatarData(agendamento.data)}</span>
                        <span className="mx-1">•</span>
                        <Clock className="h-3 w-3" />
                        <span>{agendamento.horario}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>{agendamento.cliente}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button variant="ghost" size="sm" className="text-primary gap-1">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de estatísticas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Resumo</CardTitle>
              <CardDescription>
                Estatísticas de agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-md bg-blue-500/10">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Agendados</span>
                  </div>
                  <div className="text-lg font-bold">
                    {agendamentos.filter(a => a.status === 'agendado').length}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-md bg-green-500/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Confirmados</span>
                  </div>
                  <div className="text-lg font-bold">
                    {agendamentos.filter(a => a.status === 'confirmado').length}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-md bg-gray-500/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Concluídos</span>
                  </div>
                  <div className="text-lg font-bold">
                    {agendamentos.filter(a => a.status === 'concluido').length}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-md bg-red-500/10">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Cancelados</span>
                  </div>
                  <div className="text-lg font-bold">
                    {agendamentos.filter(a => a.status === 'cancelado').length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Painel direito - Lista de agendamentos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cabeçalho com pesquisa e botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar agendamentos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>
          </div>
          
          {/* Abas e conteúdo principal */}
          <Tabs defaultValue="todos" className="space-y-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="hoje">Hoje</TabsTrigger>
              <TabsTrigger value="futuros">Futuros</TabsTrigger>
              <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
              <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredAgendamentos.length > 0 ? (
                <div className="space-y-4">
                  {filteredAgendamentos.map((agendamento, index) => (
                    <Card key={agendamento.id} className={`border-${statusColors[agendamento.status].border}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{agendamento.titulo}</h3>
                            <Badge 
                              variant="outline" 
                              className={`${statusColors[agendamento.status].bg} ${statusColors[agendamento.status].text} hover:${statusColors[agendamento.status].bg} border-${statusColors[agendamento.status].border}`}
                            >
                              {agendamento.status === 'agendado' && 'Agendado'}
                              {agendamento.status === 'confirmado' && 'Confirmado'}
                              {agendamento.status === 'concluido' && 'Concluído'}
                              {agendamento.status === 'cancelado' && 'Cancelado'}
                            </Badge>
                          </div>
                          <Badge variant="secondary">{agendamento.tipo}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{formatarData(agendamento.data)}</span>
                                <span className="text-muted-foreground">•</span>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{agendamento.horario}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{agendamento.endereco}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Cliente: </span>
                                <span className="text-sm">{agendamento.cliente}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Corretor: </span>
                                <span className="text-sm">{agendamento.corretor}</span>
                              </div>
                              
                              {agendamento.imovel && (
                                <div className="flex items-center gap-2">
                                  <Home className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Imóvel: </span>
                                  <span className="text-sm">{agendamento.imovel}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {agendamento.observacao && (
                            <div>
                              <Separator className="my-2" />
                              <p className="text-sm text-muted-foreground">
                                {agendamento.observacao}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Phone className="h-4 w-4" />
                            Ligar
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Mensagem
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          {agendamento.status === 'agendado' && (
                            <Button size="sm" className="gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Confirmar
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum agendamento encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Não existem agendamentos que correspondam aos filtros aplicados.
                    </p>
                    <Button>Criar Novo Agendamento</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
