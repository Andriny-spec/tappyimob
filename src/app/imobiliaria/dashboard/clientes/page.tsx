'use client';

import { useState, useEffect, useRef, useMemo, FormEvent } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Plus,
  Building2,
  Calendar,
  BarChart3,
  Filter,
  SlidersHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Star,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Tag,
  DollarSign,
  Thermometer,
  MessagesSquare,
  Eye,
  Home,
  Move,
  MoreHorizontal,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

// Definição dos tipos e enums do Prisma
enum StatusLead {
  NOVO = 'NOVO',
  CONTATO = 'CONTATO',
  INTERESSADO = 'INTERESSADO',
  VISITA = 'VISITA',
  PROPOSTA = 'PROPOSTA',
  CONTRATO = 'CONTRATO',
  FECHADO = 'FECHADO',
  PERDIDO = 'PERDIDO',
}

// Definição da estrutura das colunas do Kanban
interface KanbanColumn {
  id: StatusLead;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
}

enum TipoLead {
  COMPRADOR = 'COMPRADOR',
  VENDEDOR = 'VENDEDOR',
  LOCATARIO = 'LOCATARIO',
  LOCADOR = 'LOCADOR',
  INVESTIDOR = 'INVESTIDOR',
}

enum OrigemLead {
  SITE = 'SITE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  INDICACAO = 'INDICACAO',
  PORTAL_IMOVEIS = 'PORTAL_IMOVEIS',
  LIGACAO = 'LIGACAO',
  ANUNCIO = 'ANUNCIO',
  VISITA_ESCRITORIO = 'VISITA_ESCRITORIO',
  OUTROS = 'OUTROS',
}

// Interface para os dados do cliente/lead
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string;
  
  // Campos CRM
  statusLead?: StatusLead;
  tipoLead?: TipoLead;
  origemLead?: OrigemLead;
  interesse?: string;
  orcamento?: number;
  prazo?: Date;
  observacoes?: string;
  temperatura?: number;
  ultimoContato?: Date;
  proximoContato?: Date;
  corretorResponsavelId?: string;
  corretorResponsavel?: string;
  
  // Métricas
  visualizacoes: number;
  mensagensRecebidas: number;
  visualizacoesImoveis: number;
  agendamentosRealizados: number;
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Dados mockados para desenvolvimento
const clientesMock: Cliente[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    cidade: 'São Paulo',
    estado: 'SP',
    statusLead: StatusLead.NOVO,
    tipoLead: TipoLead.COMPRADOR,
    origemLead: OrigemLead.SITE,
    interesse: 'Apartamento 3 quartos na zona sul',
    orcamento: 850000,
    temperatura: 3,
    visualizacoes: 14,
    mensagensRecebidas: 2,
    visualizacoesImoveis: 8,
    agendamentosRealizados: 0,
    createdAt: new Date('2025-04-10'),
    updatedAt: new Date('2025-04-10')
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    telefone: '(11) 97654-3210',
    cidade: 'São Paulo',
    estado: 'SP',
    statusLead: StatusLead.CONTATO,
    tipoLead: TipoLead.LOCATARIO,
    origemLead: OrigemLead.INDICACAO,
    interesse: 'Casa com 4 quartos e quintal',
    orcamento: 5000,
    temperatura: 4,
    corretorResponsavelId: '1',
    corretorResponsavel: 'Ana Santos',
    visualizacoes: 8,
    mensagensRecebidas: 5,
    visualizacoesImoveis: 12,
    agendamentosRealizados: 0,
    createdAt: new Date('2025-04-08'),
    updatedAt: new Date('2025-04-12')
  },
  {
    id: '3',
    nome: 'Carlos Pereira',
    email: 'carlos.pereira@email.com',
    telefone: '(11) 96543-2109',
    cidade: 'São Paulo',
    estado: 'SP',
    statusLead: StatusLead.INTERESSADO,
    tipoLead: TipoLead.INVESTIDOR,
    origemLead: OrigemLead.PORTAL_IMOVEIS,
    interesse: 'Sala comercial em região central',
    orcamento: 450000,
    temperatura: 5,
    corretorResponsavelId: '2',
    corretorResponsavel: 'Roberto Almeida',
    visualizacoes: 12,
    mensagensRecebidas: 8,
    visualizacoesImoveis: 15,
    agendamentosRealizados: 1,
    createdAt: new Date('2025-04-05'),
    updatedAt: new Date('2025-04-11')
  },
];

// Componente do modal de detalhes do lead
interface LeadDetailsProps {
  cliente: Cliente | null;
  open: boolean;
  onClose: () => void;
}

function LeadDetailsModal({ cliente, open, onClose }: LeadDetailsProps) {
  if (!cliente) return null;
  
  // Função para formatar o valor em reais
  const formatCurrency = (value?: number) => {
    if (!value) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  // Função para formatar a data
  const formatDate = (date?: Date | string) => {
    if (!date) return 'Não definido';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  // Renderização do indicador de temperatura
  const renderTemperatura = (temp?: number) => {
    if (!temp) return 'Não definido';
    
    const colors = [
      'bg-blue-100 text-blue-700',  // 1
      'bg-green-100 text-green-700', // 2
      'bg-yellow-100 text-yellow-700', // 3
      'bg-orange-100 text-orange-700', // 4
      'bg-red-100 text-red-700', // 5
    ];
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(n => (
          <div 
            key={n} 
            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs 
              ${n <= temp ? colors[n-1] : 'bg-gray-100 text-gray-400'}`}
          >
            {n}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-100 text-green-700">
                {cliente.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {cliente.nome}
          </DialogTitle>
          <DialogDescription>
            Lead {cliente.tipoLead?.toLowerCase()} adicionado em {formatDate(cliente.createdAt)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="metricas">Métricas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Dados de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{cliente.email}</div>
                      <div className="text-xs text-muted-foreground">Email</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{cliente.telefone || 'Não informado'}</div>
                      <div className="text-xs text-muted-foreground">Telefone</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Localização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">{cliente.cidade || 'Não informado'}{cliente.estado ? `, ${cliente.estado}` : ''}</div>
                    <div className="text-xs text-muted-foreground">Cidade/Estado</div>
                  </div>
                  {cliente.endereco && (
                    <div className="text-sm">
                      <div className="font-medium">{cliente.endereco}, {cliente.bairro}</div>
                      <div className="text-xs text-muted-foreground">Endereço</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="crm" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Informações do Lead</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="font-medium">{cliente.statusLead || 'Não definido'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Tipo</div>
                      <div className="font-medium">{cliente.tipoLead || 'Não definido'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Origem</div>
                      <div className="font-medium">{cliente.origemLead || 'Não definido'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Corretor</div>
                      <div className="font-medium">{cliente.corretorResponsavel || 'Não atribuído'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Qualificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Interesse</div>
                    <div className="font-medium">{cliente.interesse || 'Não informado'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Orçamento</div>
                    <div className="font-medium">{formatCurrency(cliente.orcamento)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Temperatura</div>
                    <div className="font-medium">{renderTemperatura(cliente.temperatura)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{cliente.observacoes || 'Nenhuma observação registrada.'}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metricas" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Visualizações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cliente.visualizacoes}</div>
                  <p className="text-xs text-muted-foreground">Total de perfil</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Mensagens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cliente.mensagensRecebidas}</div>
                  <p className="text-xs text-muted-foreground">Recebidas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Visualizações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cliente.visualizacoesImoveis}</div>
                  <p className="text-xs text-muted-foreground">De imóveis</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cliente.agendamentosRealizados}</div>
                  <p className="text-xs text-muted-foreground">Realizados</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button 
            variant="default"
            onClick={() => toast.info('Função em desenvolvimento')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente de filtros
function FiltrosPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto bg-white">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filtros de Leads</SheetTitle>
          <SheetDescription>
            Refine sua visualização de leads com os filtros abaixo
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status do Lead</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os status</SelectItem>
                <SelectItem value="NOVO">Novos</SelectItem>
                <SelectItem value="CONTATO">Em Contato</SelectItem>
                <SelectItem value="INTERESSADO">Interessados</SelectItem>
                <SelectItem value="VISITA">Visita Agendada</SelectItem>
                <SelectItem value="PROPOSTA">Proposta</SelectItem>
                <SelectItem value="CONTRATO">Contrato</SelectItem>
                <SelectItem value="FECHADO">Fechados</SelectItem>
                <SelectItem value="PERDIDO">Perdidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Lead</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os tipos</SelectItem>
                <SelectItem value="COMPRADOR">Compradores</SelectItem>
                <SelectItem value="VENDEDOR">Vendedores</SelectItem>
                <SelectItem value="LOCATARIO">Locatários</SelectItem>
                <SelectItem value="LOCADOR">Locadores</SelectItem>
                <SelectItem value="INVESTIDOR">Investidores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Origem do Lead</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todas as origens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas as origens</SelectItem>
                <SelectItem value="SITE">Site</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Redes Sociais</SelectItem>
                <SelectItem value="INDICACAO">Indicação</SelectItem>
                <SelectItem value="PORTAL_IMOVEIS">Portal de Imóveis</SelectItem>
                <SelectItem value="LIGACAO">Ligação</SelectItem>
                <SelectItem value="ANUNCIO">Anúncio</SelectItem>
                <SelectItem value="VISITA_ESCRITORIO">Visita ao Escritório</SelectItem>
                <SelectItem value="OUTROS">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Temperatura</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Qualquer temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Qualquer temperatura</SelectItem>
                <SelectItem value="1">1 - Muito Frio</SelectItem>
                <SelectItem value="2">2 - Frio</SelectItem>
                <SelectItem value="3">3 - Morno</SelectItem>
                <SelectItem value="4">4 - Quente</SelectItem>
                <SelectItem value="5">5 - Muito Quente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Corretor Responsável</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos os corretores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os corretores</SelectItem>
                <SelectItem value="1">Ana Santos</SelectItem>
                <SelectItem value="2">Roberto Almeida</SelectItem>
                <SelectItem value="NAO_ATRIBUIDO">Não atribuído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <SheetFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => toast.info('Filtros limpos')}
          >
            Limpar
          </Button>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => toast.success('Filtros aplicados')}
          >
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Componente de Modal para Criar ou Editar Lead
interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  lead?: Cliente | null;
  onSave: (lead: Partial<Cliente>) => void;
}

function LeadFormModal({ open, onClose, lead, onSave }: LeadFormModalProps) {
  const isEditing = !!lead;
  const [formData, setFormData] = useState<Partial<Cliente>>(lead || {
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    statusLead: StatusLead.NOVO,
    tipoLead: TipoLead.COMPRADOR,
    origemLead: OrigemLead.SITE,
    interesse: '',
    orcamento: 0,
    temperatura: 3,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tratamento especial para números
    if (name === 'orcamento' || name === 'temperatura') {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'orcamento' ? parseFloat(value) : parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    
    // Atualizar dados com data atual
    const now = new Date();
    const updatedData = {
      ...formData,
      id: lead?.id || `temp-${Date.now()}`,
      visualizacoes: lead?.visualizacoes || 0,
      mensagensRecebidas: lead?.mensagensRecebidas || 0,
      visualizacoesImoveis: lead?.visualizacoesImoveis || 0,
      agendamentosRealizados: lead?.agendamentosRealizados || 0,
      createdAt: lead?.createdAt || now,
      updatedAt: now
    };
    
    onSave(updatedData);
    onClose();
    toast.success(isEditing ? 'Lead atualizado com sucesso!' : 'Novo lead criado com sucesso!');
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Altere as informações do lead conforme necessário.' : 'Preencha os dados para criar um novo lead.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
              <TabsTrigger value="crm">Dados CRM</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome*</label>
                  <Input 
                    name="nome"
                    value={formData.nome || ''}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email*</label>
                  <Input 
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input 
                    name="telefone"
                    value={formData.telefone || ''}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cidade</label>
                  <Input 
                    name="cidade"
                    value={formData.cidade || ''}
                    onChange={handleChange}
                    placeholder="Cidade"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Input 
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleChange}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bairro</label>
                  <Input 
                    name="bairro"
                    value={formData.bairro || ''}
                    onChange={handleChange}
                    placeholder="Bairro"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="crm" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status do Lead</label>
                  <Select
                    value={formData.statusLead}
                    onValueChange={(value) => handleSelectChange('statusLead', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(StatusLead).map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Lead</label>
                  <Select
                    value={formData.tipoLead}
                    onValueChange={(value) => handleSelectChange('tipoLead', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TipoLead).map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origem do Lead</label>
                  <Select
                    value={formData.origemLead}
                    onValueChange={(value) => handleSelectChange('origemLead', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(OrigemLead).map((origem) => (
                        <SelectItem key={origem} value={origem}>
                          {origem === 'PORTAL_IMOVEIS' ? 'PORTAL DE IMÓVEIS' : 
                           origem === 'SOCIAL_MEDIA' ? 'REDES SOCIAIS' : 
                           origem === 'VISITA_ESCRITORIO' ? 'VISITA AO ESCRITÓRIO' : origem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Corretor Responsável</label>
                  <Select
                    value={formData.corretorResponsavelId}
                    onValueChange={(value) => {
                      handleSelectChange('corretorResponsavelId', value);
                      // Simulando a seleção do nome do corretor
                      const corretorNome = value === '1' ? 'Ana Santos' : 
                                          value === '2' ? 'Roberto Almeida' : undefined;
                      handleSelectChange('corretorResponsavel', corretorNome || '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o corretor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      <SelectItem value="1">Ana Santos</SelectItem>
                      <SelectItem value="2">Roberto Almeida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperatura do Lead</label>
                  <Select
                    value={String(formData.temperatura || 3)}
                    onValueChange={(value) => handleSelectChange('temperatura', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a temperatura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muito Frio</SelectItem>
                      <SelectItem value="2">2 - Frio</SelectItem>
                      <SelectItem value="3">3 - Morno</SelectItem>
                      <SelectItem value="4">4 - Quente</SelectItem>
                      <SelectItem value="5">5 - Muito Quente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Orçamento (R$)</label>
                  <Input 
                    name="orcamento"
                    type="number"
                    value={formData.orcamento || ''}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Interesse</label>
                  <Input 
                    name="interesse"
                    value={formData.interesse || ''}
                    onChange={handleChange}
                    placeholder="Descreva o interesse do cliente (tipo de imóvel, região, etc)"
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea 
                    name="observacoes"
                    value={formData.observacoes || ''}
                    onChange={handleChange}
                    placeholder="Observações adicionais"
                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientesCRMPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Cliente | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Cliente | null>(null);
  
  // Definição das colunas do Kanban - apenas as 4 principais para simplificar o layout
  const kanbanColumns: KanbanColumn[] = [
    {
      id: StatusLead.NOVO,
      title: "Novos Leads",
      icon: <UserPlus className="h-4 w-4" />,
      color: "bg-green-500",
      bg: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      badgeColor: "bg-green-50 text-green-700 hover:bg-green-50"
    },
    {
      id: StatusLead.CONTATO,
      title: "Em Contato",
      icon: <Phone className="h-4 w-4" />,
      color: "bg-purple-500",
      bg: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      badgeColor: "bg-purple-50 text-purple-700 hover:bg-purple-50"
    },
    {
      id: StatusLead.INTERESSADO,
      title: "Interessados",
      icon: <Star className="h-4 w-4" />,
      color: "bg-blue-500",
      bg: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      badgeColor: "bg-blue-50 text-blue-700 hover:bg-blue-50"
    },
    {
      id: StatusLead.VISITA,
      title: "Visita Agendada",
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      badgeColor: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
    },
  ];
  
  // Função que retorna o status "default" caso o lead tenha um status que não está no Kanban
  const getMappedStatus = (statusLead?: StatusLead): StatusLead => {
    if (!statusLead) return StatusLead.NOVO;
    
    // Verificar se o status existe nas colunas do Kanban
    const statusExists = kanbanColumns.some(col => col.id === statusLead);
    if (statusExists) return statusLead;
    
    // Se o status não existir nas colunas, mapear para um dos 4 principais
    switch (statusLead) {
      case StatusLead.PROPOSTA:
      case StatusLead.CONTRATO:
      case StatusLead.FECHADO:
        return StatusLead.INTERESSADO; // Avançados vão para "Interessados"
      case StatusLead.PERDIDO:
        return StatusLead.NOVO; // Perdidos voltam para "Novos"
      default:
        return StatusLead.NOVO;
    }
  };
  
  // Função para filtrar leads por busca
  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientes;
    
    const term = searchTerm.toLowerCase();
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term) ||
      (cliente.telefone && cliente.telefone.toLowerCase().includes(term))
    );
  }, [clientes, searchTerm]);
  
  // Estado para armazenar a ordem dos cards em cada coluna
  const [columnOrder, setColumnOrder] = useState<Record<string, string[]>>({});
  
  // Carregar dados dos clientes da API
  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      try {
        const response = await fetch('/api/clientes');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Formatar datas que vierem como string
          const clientesFormatados = data.data.map((cliente: any) => ({
            ...cliente,
            ultimoContato: cliente.ultimoContato ? new Date(cliente.ultimoContato) : null,
            proximoContato: cliente.proximoContato ? new Date(cliente.proximoContato) : null,
            prazo: cliente.prazo ? new Date(cliente.prazo) : null,
            createdAt: new Date(cliente.createdAt),
            updatedAt: new Date(cliente.updatedAt)
          }));
          
          console.log('Clientes carregados da API:', clientesFormatados.length);
          setClientes(clientesFormatados);
        } else {
          console.error('Erro ao carregar clientes:', data.error);
          toast.error('Erro ao carregar clientes');
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        toast.error('Erro ao carregar dados dos clientes');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClientes();
  }, []);
  
  // Efeito para recuperar a ordem salva quando o componente monta
  useEffect(() => {
    // Buscar a ordem salva do servidor
    const fetchSavedOrder = async () => {
      try {
        // Em um ambiente real com API completa, usaria:
        // const response = await fetch('/api/kanban/order');
        // const data = await response.json();
        // setColumnOrder(data.order);
        
        // Por enquanto, usamos localStorage
        const savedOrder = localStorage.getItem('kanbanColumnOrder');
        if (savedOrder) {
          const parsedOrder = JSON.parse(savedOrder);
          console.log('Ordem recuperada:', parsedOrder);
          setColumnOrder(parsedOrder);
        }
      } catch (error) {
        console.error('Erro ao recuperar ordem:', error);
      }
    };
    
    fetchSavedOrder();
  }, []);
  
  // Função para salvar a ordem no servidor
  const saveColumnOrder = async (order: Record<string, string[]>) => {
    try {
      // Salvar no localStorage para persistência local
      localStorage.setItem('kanbanColumnOrder', JSON.stringify(order));
      
      // Enviar para a API para persistência no servidor
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('Ordem salva com sucesso no servidor:', data.message);
        // toast.success('Ordem dos cards salva!', { duration: 1500 });
      } else {
        console.error('Erro ao salvar ordem no servidor:', data.error);
      }
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      toast.error('Erro ao salvar a ordem dos cards');
    }
  };
  
  // Inicializar a ordem das colunas quando os clientes carregarem ou mudarem
  useEffect(() => {
    if (!clientes || clientes.length === 0 || Object.keys(columnOrder).length === 0) return;
    
    // Esta função só é executada depois que já temos a ordem carregada do localStorage/API
    console.log('Processando clientes com ordem já carregada:', columnOrder);
    
    // Verificar se há novos leads que precisam ser adicionados à ordem existente
    const updatedOrder = { ...columnOrder };
    let needsUpdate = false;
    
    // Para cada coluna do Kanban
    kanbanColumns.forEach(column => {
      // Criar o array para a coluna se não existir
      if (!updatedOrder[column.id]) {
        updatedOrder[column.id] = [];
      }
      
      // Pegar todos os leads que deveriam estar nesta coluna
      const leadsInColumn = clientes
        .filter(lead => getMappedStatus(lead.statusLead) === column.id)
        .map(lead => lead.id);
      
      // Conjunto dos IDs já na ordem salva
      const savedIds = new Set(updatedOrder[column.id]);
      
      // Identificar leads que não estão na ordem ainda
      const newLeadIds = leadsInColumn.filter(id => !savedIds.has(id));
      
      // Se temos novos leads, adicionar ao final da ordem existente
      if (newLeadIds.length > 0) {
        updatedOrder[column.id] = [...updatedOrder[column.id], ...newLeadIds];
        needsUpdate = true;
        console.log(`Adicionados ${newLeadIds.length} novos leads à coluna ${column.id}`);
      }
      
      // Remover IDs que não existem mais nos clientes
      const validLeadIds = new Set(leadsInColumn);
      const filteredOrder = updatedOrder[column.id].filter(id => validLeadIds.has(id));
      
      if (filteredOrder.length !== updatedOrder[column.id].length) {
        updatedOrder[column.id] = filteredOrder;
        needsUpdate = true;
        console.log(`Removidos leads inexistentes da coluna ${column.id}`);
      }
    });
    
    // Se houve alguma mudança, atualizar o estado e salvar
    if (needsUpdate) {
      console.log('Atualizando ordem com novos/removidos leads:', updatedOrder);
      setColumnOrder(updatedOrder);
      saveColumnOrder(updatedOrder);
    }
  }, [clientes, columnOrder]); // Depende de clientes E columnOrder
  
  // Função para lidar com o drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Cancelar se não houver destino válido
    if (!destination) return;
    
    // Fazer uma cópia profunda da ordem atual
    const newColumnOrder = JSON.parse(JSON.stringify(columnOrder)) as Record<string, string[]>;
    
    // Garantir que as colunas de origem e destino existam na ordem
    if (!newColumnOrder[source.droppableId]) {
      newColumnOrder[source.droppableId] = [];
    }
    
    if (!newColumnOrder[destination.droppableId]) {
      newColumnOrder[destination.droppableId] = [];
    }
    
    // Se o movimento for na mesma coluna
    if (source.droppableId === destination.droppableId) {
      // Reordenar os items na coluna
      const column = [...newColumnOrder[source.droppableId]];
      column.splice(source.index, 1); // Remover o item da posição origem
      column.splice(destination.index, 0, draggableId); // Inserir na posição destino
      newColumnOrder[source.droppableId] = column;
      
      toast.success('Ordem dos cards atualizada', { duration: 1500 });
    } else {
      // Movimento entre colunas
      // Remover da coluna de origem
      const sourceColumn = [...newColumnOrder[source.droppableId]];
      sourceColumn.splice(source.index, 1);
      newColumnOrder[source.droppableId] = sourceColumn;
      
      // Adicionar à coluna de destino
      const destColumn = [...newColumnOrder[destination.droppableId]];
      destColumn.splice(destination.index, 0, draggableId);
      newColumnOrder[destination.droppableId] = destColumn;
      
      // Atualizar o status do lead
      const updatedClientes = clientes.map(cliente => {
        if (cliente.id === draggableId) {
          return {
            ...cliente,
            statusLead: destination.droppableId as StatusLead
          };
        }
        return cliente;
      });
      
      setClientes(updatedClientes);
      toast.success(`Lead movido para ${kanbanColumns.find(col => col.id === destination.droppableId)?.title}`);
    }
    
    // Salvar a nova ordem no estado e persistir
    console.log('Nova ordem após drag-and-drop:', newColumnOrder);
    setColumnOrder(newColumnOrder);
    
    // Usar setTimeout para garantir que o salvamento ocorra após a atualização do estado
    setTimeout(() => {
      // Verificamos o estado atual para garantir que estamos salvando os dados mais recentes
      saveColumnOrder(newColumnOrder);
    }, 0);
  };
  
  // Ordenar os leads em cada coluna com base no columnOrder
  const getOrderedLeadsForColumn = (columnId: string) => {
    console.log(`Ordenando leads para coluna ${columnId}. Ordem salva:`, columnOrder[columnId]); 
    
    // Se não há ordem definida, retorna os leads na ordem original
    if (!columnOrder[columnId] || columnOrder[columnId].length === 0) {
      const defaultOrder = clientes.filter(cliente => getMappedStatus(cliente.statusLead) === columnId);
      console.log(`Sem ordem definida para coluna ${columnId}, usando ordem padrão:`, defaultOrder.map(lead => lead.id));
      return defaultOrder;
    }
    
    // Pega os leads para a coluna
    const leadsInColumn = clientes.filter(cliente => getMappedStatus(cliente.statusLead) === columnId);
    console.log(`Leads na coluna ${columnId}:`, leadsInColumn.map(lead => lead.id));
    
    // Monta um Map para acesso rápido por ID
    const leadsMap = new Map(leadsInColumn.map(lead => [lead.id, lead]));
    
    // Verificar se há IDs duplicados nos leads
    const uniqueLeadIds = new Set();
    leadsInColumn.forEach(lead => {
      if (!lead.id) {
        console.error('Lead sem ID válido:', lead);
      } else if (uniqueLeadIds.has(lead.id)) {
        console.error('ID de lead duplicado encontrado:', lead.id);
      } else {
        uniqueLeadIds.add(lead.id);
      }
    });
    
    // Ordenar os leads com base na ordem salva
    const orderedLeads = columnOrder[columnId]
      .map(id => {
        const lead = leadsMap.get(id);
        if (!lead) {
          console.log(`Lead com ID ${id} não encontrado na coluna ${columnId}, pode ter sido movido`); 
        }
        return lead;
      })
      .filter(Boolean) as Cliente[];
    
    console.log(`Leads ordenados na coluna ${columnId}:`, orderedLeads.map(lead => lead.id));
    
    // Adicionar leads que não estão na ordem (novos leads)
    const leadIdsInOrder = new Set(columnOrder[columnId]);
    const newLeads = leadsInColumn.filter(lead => !leadIdsInOrder.has(lead.id));
    
    if (newLeads.length > 0) {
      console.log(`Novos leads não na ordem para coluna ${columnId}:`, newLeads.map(lead => lead.id));
    }
    
    // Garantir que não haja duplicação de IDs
    const finalOrderedLeads = [...orderedLeads, ...newLeads];
    const uniqueLeads: Cliente[] = [];
    const seenIds = new Set();
    
    finalOrderedLeads.forEach(lead => {
      if (lead && lead.id && !seenIds.has(lead.id)) {
        uniqueLeads.push(lead);
        seenIds.add(lead.id);
      }
    });
    
    console.log(`Lista final de leads ordenados para coluna ${columnId}:`, uniqueLeads.map(lead => lead.id));
    return uniqueLeads;
  };
  
  // Métricas para o dashboard
  const totalClientes = clientes.length;
  const novosClientes = clientes.filter(c => c.statusLead === StatusLead.NOVO).length;
  const clientesAtivos = clientes.filter(c => 
    c.statusLead !== StatusLead.FECHADO && c.statusLead !== StatusLead.PERDIDO
  ).length;
  const leadsQuentes = clientes.filter(c => (c.temperatura || 0) >= 4).length;
  
  return (
    <div className="px-4 py-4 w-full max-w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">CRM de Clientes</h1>
            <p className="text-muted-foreground mt-1.5">Gerencie seus leads e clientes em um Kanban intuitivo</p>
          </div>
        </div>
      </div>
      {/* Dashboard de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes/Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground mt-1">Em todos os estágios</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{novosClientes}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando primeiro contato</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesAtivos}</div>
            <p className="text-xs text-muted-foreground mt-1">Em processo de negociação</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Quentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{leadsQuentes}</div>
            <p className="text-xs text-muted-foreground mt-1">Alta probabilidade de conversão</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome, email ou telefone..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <FiltrosPanel />
        
        <Button 
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
          onClick={() => {
            setLeadToEdit(null);
            setShowLeadForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>
      
      {/* Kanban Board */}
      <div className="mb-4 flex items-center">
        <h2 className="text-lg font-semibold">Kanban de Leads</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <Move className="h-4 w-4 mr-2" />
            Organizar
          </Button>
        </div>
      </div>
      

      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-4 mb-2 flex items-center justify-end text-xs text-muted-foreground gap-1">
            <div className="flex items-center bg-slate-100 rounded-md px-2 py-1 gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
                <path d="M9 6L6 9L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 6L18 9L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 18L6 15L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 18L18 15L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 15H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Arraste os cards para ordenar (a ordem será salva)</span>
            </div>
          </div>
          {kanbanColumns.map((column) => {
            // Mapear status inexistentes para um dos 4 principais
            const columnLeads = getOrderedLeadsForColumn(column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className="bg-white rounded-t-md border p-3 flex items-center">
                  <div className={`w-3 h-3 rounded-full ${column.color} mr-2`}></div>
                  <h3 className="font-medium text-sm">{column.title}</h3>
                  <Badge variant="outline" className="ml-auto">{columnLeads.length}</Badge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`h-[calc(100vh-380px)] rounded-b-md border border-t-0 ${snapshot.isDraggingOver ? column.bg : 'bg-gray-50'} overflow-hidden`}
                    >
                      <ScrollArea className="h-full p-3">
                        <div className="space-y-3 min-h-[calc(100vh-390px)]">
                          {columnLeads.map((cliente, index) => {
                            // Verificar se temos ID válido para evitar erro de chaves duplicadas
                            if (!cliente || !cliente.id) {
                              console.error('Cliente sem ID válido:', cliente);
                              return null;
                            }
                            
                            return (
                              <Draggable
                                key={`${column.id}-${cliente.id}`}
                                draggableId={cliente.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <Card 
                                      className={`bg-white ${snapshot.isDragging ? 'shadow-md' : 'shadow-sm'} hover:shadow cursor-pointer transition-shadow duration-200 ${snapshot.isDragging ? `border-2 ${column.borderColor}` : ''}`}
                                    >
                                      <CardHeader className="p-3 pb-0">
                                        <div className="flex justify-between items-start">
                                          <CardTitle className="text-sm font-medium">{cliente.nome}</CardTitle>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${column.badgeColor}`}
                                          >
                                            {cliente.tipoLead}
                                          </Badge>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="p-3 pt-2">
                                        <p className="text-xs text-muted-foreground mb-2">{cliente.interesse}</p>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                          <Eye className="h-3 w-3 mr-1" /> {cliente.visualizacoes}
                                          <MessageSquare className="h-3 w-3 ml-2 mr-1" /> {cliente.mensagensRecebidas}
                                          
                                          {/* Temperatura do Lead */}
                                          {cliente.temperatura && (
                                            <div className="ml-auto flex items-center">
                                              <Thermometer className="h-3 w-3 mr-1" />
                                              <div className="flex">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <div 
                                                    key={i}
                                                    className={`w-1.5 h-3 mx-0.5 rounded-sm ${i < cliente.temperatura! ? 'bg-green-500' : 'bg-gray-200'}`}
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                      <CardFooter className="p-3 pt-0 flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                          {cliente.corretorResponsavel ? (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Avatar className="h-6 w-6 border-2 border-white">
                                                    <AvatarFallback className="text-[10px] bg-green-100 text-green-700">
                                                      {cliente.corretorResponsavel?.charAt(0)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{cliente.corretorResponsavel}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          ) : null}
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" >
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => {
                                              setSelectedLead(cliente);
                                              setShowLeadDetails(true);
                                            }}>
                                              <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                              setLeadToEdit(cliente);
                              setShowLeadForm(true);
                            }}>
                                              <Edit className="h-4 w-4 mr-2" /> Editar lead
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                              <Phone className="h-4 w-4 mr-2" /> Registrar contato
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </CardFooter>
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          
                          {/* Botão de adicionar */}
                          <Button 
                            variant="outline" 
                            className="w-full border-dashed text-muted-foreground hover:text-green-600 hover:border-green-600 bg-white mt-2"
                            onClick={() => {
                              setLeadToEdit(null);
                              setShowLeadForm(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar lead
                          </Button>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal de detalhes do lead */} 
      <LeadDetailsModal 
        cliente={selectedLead} 
        open={showLeadDetails} 
        onClose={() => setShowLeadDetails(false)} 
      />
      
      {/* Modal de criação/edição de lead */}
      <LeadFormModal
        open={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        lead={leadToEdit}
        onSave={(leadData) => {
          if (leadToEdit) {
            // Atualizar lead existente
            setClientes(prev => 
              prev.map(c => c.id === leadToEdit.id ? { ...c, ...leadData } as Cliente : c)
            );
            toast.success(`Lead atualizado com sucesso`);
          } else {
            // Adicionar novo lead
            const novoLead = {
              ...leadData,
              id: uuidv4(), // Gerar ID único
              createdAt: new Date(),
              updatedAt: new Date(),
              visualizacoes: 0,
              mensagensRecebidas: 0,
              visualizacoesImoveis: 0,
              agendamentosRealizados: 0
            } as Cliente;
            
            setClientes(prev => [...prev, novoLead]);
            toast.success(`Novo lead criado com sucesso`);
          }
        }}
      />
    </div>
  );
}