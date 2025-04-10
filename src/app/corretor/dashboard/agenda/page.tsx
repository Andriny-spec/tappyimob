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
import { Separator } from '@/components/ui/separator';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Home,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  Check,
  X,
  MoreHorizontal,
  ChevronLeft,
  FileText,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Dados fictícios para simulação
const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const horasDia = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const compromissos = [
  {
    id: 1,
    titulo: 'Visita ao Apartamento Jardins',
    data: '2024-06-18',
    horario: '10:00',
    duracao: '1h',
    cliente: 'João Silva',
    telefone: '(11) 99999-8888',
    email: 'joao.silva@email.com',
    endereco: 'Rua das Flores, 123 - Jardins',
    tipo: 'Visita',
    status: 'confirmado'
  },
  {
    id: 2,
    titulo: 'Assinatura de Contrato - Casa Moema',
    data: '2024-06-18',
    horario: '14:00',
    duracao: '2h',
    cliente: 'Maria Oliveira',
    telefone: '(11) 98765-4321',
    email: 'maria.oliveira@email.com',
    endereco: 'Av. Moema, 456 - Moema',
    tipo: 'Contrato',
    status: 'confirmado'
  },
  {
    id: 3,
    titulo: 'Avaliação de Imóvel',
    data: '2024-06-19',
    horario: '11:00',
    duracao: '1h30',
    cliente: 'Carlos Mendes',
    telefone: '(11) 91234-5678',
    email: 'carlos.mendes@email.com',
    endereco: 'Rua Augusta, 789 - Consolação',
    tipo: 'Avaliação',
    status: 'pendente'
  },
  {
    id: 4,
    titulo: 'Reunião com Investidor',
    data: '2024-06-20',
    horario: '09:00',
    duracao: '1h',
    cliente: 'Roberto Almeida',
    telefone: '(11) 99876-5432',
    email: 'roberto.almeida@email.com',
    endereco: 'Av. Paulista, 1000 - Bela Vista',
    tipo: 'Reunião',
    status: 'confirmado'
  },
  {
    id: 5,
    titulo: 'Visita ao Terreno Brooklin',
    data: '2024-06-21',
    horario: '15:00',
    duracao: '1h30',
    cliente: 'Ana Costa',
    telefone: '(11) 97654-3210',
    email: 'ana.costa@email.com',
    endereco: 'Rua Nebraska, 321 - Brooklin',
    tipo: 'Visita',
    status: 'confirmado'
  }
];

// Função para gerar grade da semana
const gerarGradeSemana = (dataAtual: Date) => {
  let resultado = [];
  
  // Início da semana (domingo)
  const inicioDaSemana = new Date(dataAtual);
  inicioDaSemana.setDate(dataAtual.getDate() - dataAtual.getDay());
  
  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioDaSemana);
    dia.setDate(inicioDaSemana.getDate() + i);
    
    resultado.push({
      data: format(dia, 'yyyy-MM-dd'),
      diaSemana: diasDaSemana[i],
      diaNumero: dia.getDate(),
      mes: dia.getMonth() + 1
    });
  }
  
  return resultado;
};

export default function AgendaCorretorPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [visualizacao, setVisualizacao] = useState('semana');
  const [semanaAtual, setSemanaAtual] = useState(gerarGradeSemana(new Date()));
  const [novoCompromissoAberto, setNovoCompromissoAberto] = useState(false);
  const [dataCompromisso, setDataCompromisso] = useState<Date | undefined>(new Date());
  
  // Avançar ou retroceder semanas
  const navegarSemana = (direcao: number) => {
    const novaData = new Date(date);
    novaData.setDate(date.getDate() + (7 * direcao));
    setDate(novaData);
    setSemanaAtual(gerarGradeSemana(novaData));
  };
  
  return (
    <PageContainer
      title="Agenda"
      subtitle="Gerencie seus compromissos e agendamentos"
    >
      <div className="space-y-5">
        {/* Header com filtros e ações */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Tabs 
              value={visualizacao} 
              onValueChange={setVisualizacao}
              className="w-full sm:w-auto"
            >
              <TabsList>
                <TabsTrigger value="dia">Dia</TabsTrigger>
                <TabsTrigger value="semana">Semana</TabsTrigger>
                <TabsTrigger value="mes">Mês</TabsTrigger>
                <TabsTrigger value="lista">Lista</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navegarSemana(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2 min-w-[160px]">
                    <CalendarIcon className="h-4 w-4" />
                    {visualizacao === 'dia' 
                      ? format(date, "dd 'de' MMMM", { locale: ptBR })
                      : visualizacao === 'semana'
                        ? `${format(new Date(semanaAtual[0].data), "dd/MM", { locale: ptBR })} - ${format(new Date(semanaAtual[6].data), "dd/MM", { locale: ptBR })}`
                        : format(date, "MMMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      if (date) {
                        setDate(date);
                        setSemanaAtual(gerarGradeSemana(date));
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="icon" onClick={() => navegarSemana(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => {
                const hoje = new Date();
                setDate(hoje);
                setSemanaAtual(gerarGradeSemana(hoje));
              }}>
                Hoje
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar compromissos..."
                className="pl-8"
              />
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Dialog open={novoCompromissoAberto} onOpenChange={setNovoCompromissoAberto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Compromisso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Novo Compromisso</DialogTitle>
                  <DialogDescription>
                    Adicione detalhes do novo compromisso na sua agenda.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input placeholder="Título do compromisso" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataCompromisso ? (
                              format(dataCompromisso, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dataCompromisso}
                            onSelect={setDataCompromisso}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Horário</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {horasDia.map((hora) => (
                            <SelectItem key={hora} value={hora}>{hora}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visita">Visita</SelectItem>
                          <SelectItem value="contrato">Contrato</SelectItem>
                          <SelectItem value="avaliacao">Avaliação</SelectItem>
                          <SelectItem value="reuniao">Reunião</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Duração</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30min">30 minutos</SelectItem>
                          <SelectItem value="1h">1 hora</SelectItem>
                          <SelectItem value="1h30">1 hora e 30 minutos</SelectItem>
                          <SelectItem value="2h">2 horas</SelectItem>
                          <SelectItem value="3h">3 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joao">João Silva</SelectItem>
                        <SelectItem value="maria">Maria Oliveira</SelectItem>
                        <SelectItem value="carlos">Carlos Mendes</SelectItem>
                        <SelectItem value="ana">Ana Costa</SelectItem>
                        <SelectItem value="novo">+ Novo Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input placeholder="Endereço do compromisso" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Observações adicionais"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNovoCompromissoAberto(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" onClick={() => setNovoCompromissoAberto(false)}>
                    Salvar Compromisso
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Visualização em formato de semana */}
        {visualizacao === 'semana' && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Agenda da Semana</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto min-w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border bg-muted/50 p-2 text-sm font-medium w-[80px]">Horário</th>
                      {semanaAtual.map((dia, index) => (
                        <th 
                          key={index} 
                          className={`border border-border p-2 text-sm font-medium ${
                            format(new Date(), 'yyyy-MM-dd') === dia.data ? 'bg-primary/10' : 'bg-muted/50'
                          }`}
                        >
                          <div className="text-center">
                            <div>{dia.diaSemana}</div>
                            <div className="text-lg font-semibold">{dia.diaNumero}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horasDia.map((hora, horaIndex) => (
                      <tr key={horaIndex} className="h-20 border-t border-border">
                        <td className="border-r border-border p-2 text-sm text-center font-medium">
                          {hora}
                        </td>
                        {semanaAtual.map((dia, diaIndex) => {
                          const eventosNesteHorario = compromissos.filter(
                            comp => comp.data === dia.data && comp.horario === hora
                          );
                          
                          return (
                            <td 
                              key={diaIndex} 
                              className={`border border-border align-top ${
                                format(new Date(), 'yyyy-MM-dd') === dia.data ? 'bg-primary/5' : ''
                              }`}
                            >
                              {eventosNesteHorario.length > 0 ? (
                                <div className="p-1">
                                  {eventosNesteHorario.map((evento) => (
                                    <div 
                                      key={evento.id}
                                      className={`p-2 mb-1 rounded text-sm cursor-pointer hover:opacity-90 ${
                                        evento.tipo === 'Visita' ? 'bg-blue-500/20 border-l-4 border-blue-500' :
                                        evento.tipo === 'Contrato' ? 'bg-green-500/20 border-l-4 border-green-500' :
                                        evento.tipo === 'Avaliação' ? 'bg-amber-500/20 border-l-4 border-amber-500' :
                                        'bg-purple-500/20 border-l-4 border-purple-500'
                                      }`}
                                    >
                                      <div className="font-medium truncate">{evento.titulo}</div>
                                      <div className="text-xs flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> 
                                        {evento.horario} - {evento.duracao}
                                      </div>
                                      <div className="text-xs flex items-center gap-1">
                                        <User className="h-3 w-3" /> 
                                        {evento.cliente}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div 
                                  className="h-full w-full cursor-pointer hover:bg-muted/50"
                                  onClick={() => setNovoCompromissoAberto(true)}
                                ></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Visualização em formato de lista */}
        {visualizacao === 'lista' && (
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Lista de Compromissos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Data</TableHead>
                    <TableHead className="w-[100px]">Horário</TableHead>
                    <TableHead>Compromisso</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compromissos.map((compromisso) => {
                    const data = new Date(compromisso.data);
                    return (
                      <TableRow key={compromisso.id}>
                        <TableCell>
                          {format(data, "dd/MM/yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {format(data, "EEEE", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {compromisso.horario}
                          <div className="text-xs text-muted-foreground">
                            {compromisso.duracao}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{compromisso.titulo}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {compromisso.endereco}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{compromisso.cliente}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {compromisso.telefone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              compromisso.tipo === 'Visita' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                              compromisso.tipo === 'Contrato' ? 'bg-green-500/10 text-green-600 border-green-200' :
                              compromisso.tipo === 'Avaliação' ? 'bg-amber-500/10 text-amber-600 border-amber-200' :
                              'bg-purple-500/10 text-purple-600 border-purple-200'
                            }
                          >
                            {compromisso.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={compromisso.status === 'confirmado' ? 'default' : 'outline'}
                            className={
                              compromisso.status === 'confirmado' ? 'bg-green-500' :
                              'bg-amber-500/10 text-amber-600 border-amber-200'
                            }
                          >
                            {compromisso.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando 5 de 5 compromissos
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Próximo
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
        
        {/* Próximos Compromissos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Compromissos</CardTitle>
            <CardDescription>
              Seus compromissos agendados para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {compromissos.slice(0, 3).map((compromisso) => (
                <div key={compromisso.id} className="flex items-start gap-4 p-3 border rounded-lg">
                  <div className={`rounded-md p-2 ${
                    compromisso.tipo === 'Visita' ? 'bg-blue-500/10 text-blue-600' :
                    compromisso.tipo === 'Contrato' ? 'bg-green-500/10 text-green-600' :
                    compromisso.tipo === 'Avaliação' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-purple-500/10 text-purple-600'
                  }`}>
                    {compromisso.tipo === 'Visita' ? <Home className="h-5 w-5" /> :
                     compromisso.tipo === 'Contrato' ? <FileText className="h-5 w-5" /> :
                     compromisso.tipo === 'Avaliação' ? <Home className="h-5 w-5" /> :
                     <Users className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{compromisso.titulo}</h4>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User className="h-3.5 w-3.5" />
                          {compromisso.cliente}
                        </div>
                      </div>
                      <Badge 
                        variant={compromisso.status === 'confirmado' ? 'default' : 'outline'}
                        className={
                          compromisso.status === 'confirmado' ? 'bg-green-500' :
                          'bg-amber-500/10 text-amber-600 border-amber-200'
                        }
                      >
                        {compromisso.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                    
                    <div className="flex mt-2 gap-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {format(new Date(compromisso.data), "EEEE, dd/MM", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {compromisso.horario} ({compromisso.duracao})
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{compromisso.endereco}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{compromisso.telefone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        Remarcar
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancelar
                      </Button>
                      <Button variant="default" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver todos os compromissos
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
