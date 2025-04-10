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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Building2,
  Calendar,
  Star,
  ArrowUpRight,
  Phone,
  Mail,
  Home,
  Activity
} from 'lucide-react';

// Dados fictícios para demonstração
const clientes = [
  {
    id: 1,
    nome: 'André Martins',
    email: 'andre.martins@email.com',
    telefone: '(11) 99876-5432',
    interesse: 'Apartamento 3 quartos',
    tipo: 'Comprador',
    status: 'Ativo',
    origem: 'Site',
    ultimoContato: '2025-03-08',
    responsavel: 'Carlos Silva',
    visualizacoes: 8,
    mensagens: 12,
    agendamentos: 2
  },
  {
    id: 2,
    nome: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    telefone: '(11) 98765-4321',
    interesse: 'Casa em condomínio',
    tipo: 'Comprador',
    status: 'Ativo',
    origem: 'Indicação',
    ultimoContato: '2025-03-10',
    responsavel: 'Ana Santos',
    visualizacoes: 15,
    mensagens: 5,
    agendamentos: 1
  },
  {
    id: 3,
    nome: 'Francisco Oliveira',
    email: 'francisco.oliveira@email.com',
    telefone: '(11) 97654-3210',
    interesse: 'Apartamento para alugar',
    tipo: 'Locatário',
    status: 'Ativo',
    origem: 'Portal',
    ultimoContato: '2025-03-05',
    responsavel: 'Marcos Oliveira',
    visualizacoes: 6,
    mensagens: 3,
    agendamentos: 0
  },
  {
    id: 4,
    nome: 'Patricia Santos',
    email: 'patricia.santos@email.com',
    telefone: '(11) 96543-2109',
    interesse: 'Vender apartamento',
    tipo: 'Proprietário',
    status: 'Ativo',
    origem: 'Site',
    ultimoContato: '2025-03-09',
    responsavel: 'Juliana Costa',
    visualizacoes: 3,
    mensagens: 8,
    agendamentos: 1
  },
  {
    id: 5,
    nome: 'Ricardo Lima',
    email: 'ricardo.lima@email.com',
    telefone: '(11) 95432-1098',
    interesse: 'Sala comercial',
    tipo: 'Comprador',
    status: 'Inativo',
    origem: 'Indicação',
    ultimoContato: '2025-02-15',
    responsavel: 'Roberto Almeida',
    visualizacoes: 4,
    mensagens: 1,
    agendamentos: 0
  },
  {
    id: 6,
    nome: 'Camila Rodrigues',
    email: 'camila.rodrigues@email.com',
    telefone: '(11) 94321-0987',
    interesse: 'Cobertura duplex',
    tipo: 'Comprador',
    status: 'Ativo',
    origem: 'Portal',
    ultimoContato: '2025-03-11',
    responsavel: 'Ana Santos',
    visualizacoes: 12,
    mensagens: 6,
    agendamentos: 2
  }
];

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  
  const filteredClientes = clientes.filter(cliente => {
    let matchesTab = true;
    
    if (activeTab === 'ativos') {
      matchesTab = cliente.status === 'Ativo';
    } else if (activeTab === 'inativos') {
      matchesTab = cliente.status === 'Inativo';
    } else if (activeTab === 'compradores') {
      matchesTab = cliente.tipo === 'Comprador';
    } else if (activeTab === 'proprietarios') {
      matchesTab = cliente.tipo === 'Proprietário';
    }
    
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.telefone.includes(searchTerm) ||
                         cliente.interesse.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <PageContainer
      title="Clientes"
      subtitle="Gerencie sua carteira de clientes e potenciais compradores"
    >
      {/* Cabeçalho com pesquisa e botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, e-mail ou telefone..."
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
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Resumo de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <h3 className="text-2xl font-bold mt-1">{clientes.filter(c => c.status === 'Ativo').length}</h3>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">5.2%</span>
              <span className="text-muted-foreground">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
                <h3 className="text-2xl font-bold mt-1">23</h3>
              </div>
              <div className="bg-green-500/10 p-2 rounded-full">
                <Plus className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">12.8%</span>
              <span className="text-muted-foreground">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visitas Agendadas</p>
                <h3 className="text-2xl font-bold mt-1">18</h3>
              </div>
              <div className="bg-amber-500/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">3.5%</span>
              <span className="text-muted-foreground">esta semana</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <h3 className="text-2xl font-bold mt-1">24%</h3>
              </div>
              <div className="bg-purple-500/10 p-2 rounded-full">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">2.1%</span>
              <span className="text-muted-foreground">este mês</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas e conteúdo principal */}
      <Tabs defaultValue="todos" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
          <TabsTrigger value="compradores">Compradores</TabsTrigger>
          <TabsTrigger value="proprietarios">Proprietários</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-6">
          {/* Lista de clientes */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Interesse</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Último Contato</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted"></div>
                          <div>
                            <div className="font-medium">{cliente.nome}</div>
                            <div className="text-xs text-muted-foreground">{cliente.telefone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.interesse}</TableCell>
                      <TableCell>{cliente.tipo}</TableCell>
                      <TableCell>{new Date(cliente.ultimoContato).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{cliente.responsavel}</TableCell>
                      <TableCell>
                        <Badge variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}>
                          {cliente.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="border-t px-6 py-3 flex justify-between">
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredClientes.length} de {clientes.length} clientes
              </div>
              <div className="flex gap-2">
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

        {/* Conteúdo similar para as outras abas */}
        <TabsContent value="ativos">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Ativos</CardTitle>
              <CardDescription>Lista de clientes atualmente engajados com a imobiliária</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Interesse</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Último Contato</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted"></div>
                          <div>
                            <div className="font-medium">{cliente.nome}</div>
                            <div className="text-xs text-muted-foreground">{cliente.telefone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.interesse}</TableCell>
                      <TableCell>{cliente.tipo}</TableCell>
                      <TableCell>{new Date(cliente.ultimoContato).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            Contatar
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compradores">
          <Card>
            <CardHeader>
              <CardTitle>Compradores</CardTitle>
              <CardDescription>Clientes interessados em adquirir imóveis</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredClientes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Interesse</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell>{cliente.interesse}</TableCell>
                        <TableCell>{cliente.origem}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Sugerir imóveis
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Home className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum comprador encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Não há clientes do tipo comprador que correspondam à sua busca.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proprietarios">
          <Card>
            <CardHeader>
              <CardTitle>Proprietários</CardTitle>
              <CardDescription>Proprietários com imóveis cadastrados na imobiliária</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredClientes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Imóveis</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{cliente.telefone}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{cliente.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Ver imóveis
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum proprietário encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Não há clientes do tipo proprietário que correspondam à sua busca.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
