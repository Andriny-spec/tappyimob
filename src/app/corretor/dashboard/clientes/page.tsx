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
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  MoreHorizontal,
  Mail,
  Phone,
  UserCheck,
  Star,
  Clock,
  Edit,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dados fictícios para demonstração
const clientes = [
  { 
    id: 1, 
    nome: 'Roberto Silva', 
    email: 'roberto.silva@email.com', 
    telefone: '(11) 98765-4321',
    status: 'cliente',
    interesse: 'Apartamento - 3 quartos',
    fonte: 'Site',
    avaliacaoAtendimento: 5,
    ultimoContato: '09/03/2025',
    proximoContato: '15/03/2025',
    notas: 'Procura imóvel no bairro Jardins. Orçamento de até R$ 850 mil.',
    avatar: '/avatars/roberto.jpg'
  },
  { 
    id: 2, 
    nome: 'Carla Mendes', 
    email: 'carla.mendes@email.com', 
    telefone: '(11) 97654-3210',
    status: 'lead',
    interesse: 'Casa em condomínio',
    fonte: 'Instagram',
    avaliacaoAtendimento: null,
    ultimoContato: '10/03/2025',
    proximoContato: '12/03/2025',
    notas: 'Tem interesse em casas na região de Alphaville. Orçamento entre R$ 1M e R$ 1.5M.',
    avatar: '/avatars/carla.jpg'
  },
  { 
    id: 3, 
    nome: 'Paulo Santos', 
    email: 'paulo.santos@empresa.com.br', 
    telefone: '(11) 96543-2109',
    status: 'lead',
    interesse: 'Sala comercial para locação',
    fonte: 'Indicação',
    avaliacaoAtendimento: null,
    ultimoContato: '07/03/2025',
    proximoContato: '11/03/2025',
    notas: 'Procura sala comercial na região da Paulista para expansão da empresa.',
    avatar: ''
  },
  { 
    id: 4, 
    nome: 'Ana Costa', 
    email: 'ana.costa@email.com', 
    telefone: '(11) 95432-1098',
    status: 'cliente',
    interesse: 'Apartamento para investimento',
    fonte: 'Site',
    avaliacaoAtendimento: 4,
    ultimoContato: '05/03/2025',
    proximoContato: '15/03/2025',
    notas: 'Já possui 2 imóveis e busca mais um para investimento.',
    avatar: '/avatars/ana.jpg'
  },
  { 
    id: 5, 
    nome: 'Marcos Oliveira', 
    email: 'marcos.oliveira@email.com', 
    telefone: '(11) 94321-0987',
    status: 'lead',
    interesse: 'Terreno',
    fonte: 'Facebook',
    avaliacaoAtendimento: null,
    ultimoContato: '01/03/2025',
    proximoContato: '12/03/2025',
    notas: 'Busca terreno para construção de casa própria.',
    avatar: ''
  }
];

export default function ClientesCorretorPage() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  
  // Filtro de clientes
  const clientesFiltrados = clientes.filter(cliente => {
    // Filtro por busca
    const termoBusca = busca.toLowerCase();
    const matchBusca = busca === '' || 
      cliente.nome.toLowerCase().includes(termoBusca) || 
      cliente.email.toLowerCase().includes(termoBusca) ||
      cliente.telefone.includes(termoBusca);
    
    // Filtro por status
    const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });
  
  return (
    <PageContainer
      title="Clientes"
      subtitle="Gerencie seus clientes e leads"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-8 w-full"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filtrar Clientes</DialogTitle>
                  <DialogDescription>
                    Refine sua lista de clientes com filtros específicos
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Fonte</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="fonte-site" />
                        <label htmlFor="fonte-site" className="text-sm">Site</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="fonte-indicacao" />
                        <label htmlFor="fonte-indicacao" className="text-sm">Indicação</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="fonte-instagram" />
                        <label htmlFor="fonte-instagram" className="text-sm">Instagram</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="fonte-facebook" />
                        <label htmlFor="fonte-facebook" className="text-sm">Facebook</label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Interesse</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="interesse-apartamento" />
                        <label htmlFor="interesse-apartamento" className="text-sm">Apartamento</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="interesse-casa" />
                        <label htmlFor="interesse-casa" className="text-sm">Casa</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="interesse-comercial" />
                        <label htmlFor="interesse-comercial" className="text-sm">Comercial</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="interesse-terreno" />
                        <label htmlFor="interesse-terreno" className="text-sm">Terreno</label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Último contato</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">De</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Até</label>
                        <Input type="date" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline">Limpar Filtros</Button>
                  <Button>Aplicar Filtros</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Adicione as informações do cliente para iniciar o atendimento
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome Completo</label>
                    <Input placeholder="Ex: João da Silva" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">E-mail</label>
                      <Input type="email" placeholder="cliente@email.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <Input placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="lead">Lead</option>
                        <option value="cliente">Cliente</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fonte</label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="site">Site</option>
                        <option value="indicacao">Indicação</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Interesse</label>
                    <Input placeholder="Ex: Apartamento de 3 quartos na zona sul" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Notas</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Adicione informações relevantes sobre o cliente..."
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Cliente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="todos" onValueChange={setFiltroStatus}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="lead">Leads</TabsTrigger>
            <TabsTrigger value="cliente">Clientes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos" className="mt-4">
            <Card>
              <CardHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Clientes</CardTitle>
                  <Button variant="outline" size="sm" className="flex gap-1 text-xs">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Ordenar
                  </Button>
                </div>
                <CardDescription>
                  Total: {clientesFiltrados.length} contatos
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                {clientesFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-center text-muted-foreground">
                      Nenhum cliente encontrado com os filtros selecionados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientesFiltrados.map((cliente) => (
                      <div key={cliente.id} className="flex flex-col sm:flex-row gap-4 rounded-md border p-4">
                        <div className="sm:w-14 flex items-center shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={cliente.avatar} alt={cliente.nome} />
                            <AvatarFallback>{cliente.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-base">{cliente.nome}</h3>
                              <div className="flex flex-col sm:flex-row sm:gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Mail className="h-3.5 w-3.5 mr-1" />
                                  {cliente.email}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3.5 w-3.5 mr-1" />
                                  {cliente.telefone}
                                </div>
                              </div>
                            </div>
                            
                            <Badge variant={cliente.status === 'cliente' ? 'default' : 'secondary'}>
                              {cliente.status === 'cliente' ? 'Cliente' : 'Lead'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">Fonte: </span>
                              <span className="ml-1">{cliente.fonte}</span>
                            </div>
                            
                            {cliente.avaliacaoAtendimento && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-amber-500" />
                                <span className="text-muted-foreground">Avaliação: </span>
                                <span className="ml-1">{cliente.avaliacaoAtendimento}/5</span>
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">Último contato: </span>
                              <span className="ml-1">{cliente.ultimoContato}</span>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Interesse: </span>
                              <span>{cliente.interesse}</span>
                            </div>
                            {cliente.notas && (
                              <div className="text-sm mt-1">
                                <span className="text-muted-foreground">Notas: </span>
                                <span className="text-xs">{cliente.notas}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-primary" />
                              Próximo contato: {cliente.proximoContato}
                            </div>
                            
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="h-8">
                                <Phone className="h-3.5 w-3.5 mr-1.5" />
                                Contatar
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    Ver histórico
                                  </DropdownMenuItem>
                                  {cliente.status === 'lead' && (
                                    <DropdownMenuItem>
                                      Converter para cliente
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>
                                    Agendar visita
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Enviar proposta
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {clientesFiltrados.length} de {clientes.length} contatos
                </div>
                <div className="flex items-center space-x-6">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    Próximo
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="lead" className="mt-4">
            {/* Conteúdo da aba Lead - carregado dinamicamente pelo filtro */}
          </TabsContent>
          
          <TabsContent value="cliente" className="mt-4">
            {/* Conteúdo da aba Cliente - carregado dinamicamente pelo filtro */}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
