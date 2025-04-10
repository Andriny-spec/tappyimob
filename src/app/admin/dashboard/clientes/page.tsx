'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Mail,
  Phone,
  Home,
  Calendar,
  Eye,
  MessageSquare,
  Clock,
  Settings,
  Bell,
  Heart,
  Star,
  ArrowUpRight,
  PlusCircle,
  ChevronRight
} from 'lucide-react';

// Dados de exemplo para os clientes
const clientesData = [
  {
    id: '1',
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@gmail.com',
    telefone: '(11) 98765-4321',
    endereco: 'São Paulo, SP',
    avatar: '',
    status: 'ativo',
    dataCadastro: '15/01/2025',
    ultimoContato: '2 dias atrás',
    preferencias: {
      tipoImovel: ['Apartamento', 'Studio'],
      bairros: ['Vila Madalena', 'Pinheiros'],
      valorMaximo: 'R$ 800.000',
      quartos: '2-3'
    },
    imoveis: {
      favoritos: 12,
      vistos: 48,
      agendamentos: 3
    },
    interacoes: 15,
    interesse: 'alto',
    tags: ['Financiamento', 'Primeira compra'],
    corretor: 'Amanda Silva'
  },
  {
    id: '2',
    nome: 'Mariana Costa',
    email: 'mariana.costa@outlook.com',
    telefone: '(11) 97654-3210',
    endereco: 'São Paulo, SP',
    avatar: '/avatars/mariana.jpg',
    status: 'ativo',
    dataCadastro: '03/02/2025',
    ultimoContato: '5 horas atrás',
    preferencias: {
      tipoImovel: ['Casa'],
      bairros: ['Moema', 'Campo Belo'],
      valorMaximo: 'R$ 1.500.000',
      quartos: '3-4'
    },
    imoveis: {
      favoritos: 8,
      vistos: 32,
      agendamentos: 2
    },
    interacoes: 9,
    interesse: 'médio',
    tags: ['Reformado', 'Pronto para morar'],
    corretor: 'Carlos Oliveira'
  },
  {
    id: '3',
    nome: 'Lucas Oliveira',
    email: 'lucas.oliveira@gmail.com',
    telefone: '(21) 99876-5432',
    endereco: 'Rio de Janeiro, RJ',
    avatar: '',
    status: 'inativo',
    dataCadastro: '22/01/2025',
    ultimoContato: '20 dias atrás',
    preferencias: {
      tipoImovel: ['Apartamento'],
      bairros: ['Leblon', 'Ipanema'],
      valorMaximo: 'R$ 2.000.000',
      quartos: '3+'
    },
    imoveis: {
      favoritos: 5,
      vistos: 18,
      agendamentos: 1
    },
    interacoes: 4,
    interesse: 'baixo',
    tags: ['Alto padrão', 'Vista para o mar'],
    corretor: 'Patrícia Mendes'
  },
  {
    id: '4',
    nome: 'Camila Santos',
    email: 'camila.santos@gmail.com',
    telefone: '(31) 98765-1234',
    endereco: 'Belo Horizonte, MG',
    avatar: '/avatars/camila.jpg',
    status: 'ativo',
    dataCadastro: '10/02/2025',
    ultimoContato: '1 dia atrás',
    preferencias: {
      tipoImovel: ['Cobertura', 'Apartamento'],
      bairros: ['Savassi', 'Lourdes'],
      valorMaximo: 'R$ 1.200.000',
      quartos: '2-3'
    },
    imoveis: {
      favoritos: 15,
      vistos: 62,
      agendamentos: 4
    },
    interacoes: 22,
    interesse: 'alto',
    tags: ['Investimento', 'Renda passiva'],
    corretor: 'Ricardo Santos'
  },
  {
    id: '5',
    nome: 'Fernando Gomes',
    email: 'fernando.gomes@outlook.com',
    telefone: '(41) 99876-4321',
    endereco: 'Curitiba, PR',
    avatar: '',
    status: 'ativo',
    dataCadastro: '05/01/2025',
    ultimoContato: '3 dias atrás',
    preferencias: {
      tipoImovel: ['Casa', 'Sobrado'],
      bairros: ['Batel', 'Ecoville'],
      valorMaximo: 'R$ 950.000',
      quartos: '3+'
    },
    imoveis: {
      favoritos: 7,
      vistos: 29,
      agendamentos: 2
    },
    interacoes: 11,
    interesse: 'médio',
    tags: ['Garagem', 'Área verde'],
    corretor: 'Juliana Costa'
  }
];

export default function ClientesPage() {
  const [selectedTab, setSelectedTab] = useState('todos');
  
  const filteredClientes = 
    selectedTab === 'todos' 
      ? clientesData 
      : clientesData.filter(cliente => cliente.status === selectedTab);

  return (
    <PageContainer
      title="Clientes"
      subtitle="Gerencie os clientes cadastrados no sistema"
    >
      {/* Barra de ações e filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input 
              placeholder="Buscar cliente..." 
              className="w-full pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="todos" className="space-y-6" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativo">Ativos</TabsTrigger>
          <TabsTrigger value="inativo">Inativos</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

      {/* Cartões de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-2xl font-bold">{clientesData.length}</h4>
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-green-500/10 rounded-full p-3 mb-3">
              <Bell className="h-5 w-5 text-green-500" />
            </div>
            <h4 className="text-2xl font-bold">
              {clientesData.filter(c => c.status === 'ativo' && c.interesse === 'alto').length}
            </h4>
            <p className="text-sm text-muted-foreground">Alto Interesse</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-amber-500/10 rounded-full p-3 mb-3">
              <Eye className="h-5 w-5 text-amber-500" />
            </div>
            <h4 className="text-2xl font-bold">
              {clientesData.reduce((total, cliente) => total + cliente.imoveis.vistos, 0)}
            </h4>
            <p className="text-sm text-muted-foreground">Imóveis Visualizados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-blue-500/10 rounded-full p-3 mb-3">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <h4 className="text-2xl font-bold">
              {clientesData.reduce((total, cliente) => total + cliente.imoveis.agendamentos, 0)}
            </h4>
            <p className="text-sm text-muted-foreground">Agendamentos</p>
          </CardContent>
        </Card>
      </div>

        {/* Listagem de clientes */}
        <TabsContent value="todos" className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Gerencie todos os seus clientes em um só lugar</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredClientes.map((cliente) => (
              <div 
                key={cliente.id} 
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b hover:bg-muted/20 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    {cliente.avatar ? (
                      <AvatarImage src={cliente.avatar} alt={cliente.nome} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {cliente.nome.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-medium truncate">{cliente.nome}</h4>
                    <Badge 
                      variant={cliente.status === 'ativo' ? 'default' : 'destructive'}
                      className={cliente.status === 'ativo' ? 'bg-green-500' : 'bg-red-400'}
                    >
                      {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {cliente.interesse === 'alto' && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                        Alta prioridade
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{cliente.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{cliente.telefone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      <span>{cliente.endereco}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 grid grid-cols-3 gap-4 mt-2 md:mt-0 text-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{cliente.imoveis.vistos}</span>
                    <span className="text-xs text-muted-foreground">Visualizações</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{cliente.imoveis.favoritos}</span>
                    <span className="text-xs text-muted-foreground">Favoritos</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{cliente.imoveis.agendamentos}</span>
                    <span className="text-xs text-muted-foreground">Agendamentos</span>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Último contato: {cliente.ultimoContato}
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredClientes.length} de {clientesData.length} clientes
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" disabled>Próxima</Button>
            </div>
          </CardFooter>
        </Card>
        </TabsContent>
      </Tabs>
      {/* Cards de clientes destacados */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Clientes com alto interesse</h3>
          <Button variant="link" size="sm" className="gap-1">
            Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clientesData
            .filter(c => c.interesse === 'alto' && c.status === 'ativo')
            .slice(0, 4)
            .map(cliente => (
              <Card key={cliente.id} className="overflow-hidden">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                      <Star className="h-3 w-3 fill-green-500 text-green-500 mr-1" />
                      Alto interesse
                    </Badge>
                    <span className="text-xs text-muted-foreground">{cliente.ultimoContato}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      {cliente.avatar ? (
                        <AvatarImage src={cliente.avatar} alt={cliente.nome} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {cliente.nome.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{cliente.nome}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{cliente.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Preferências:</span> {cliente.preferencias.tipoImovel.join(', ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Localização:</span> {cliente.preferencias.bairros.join(', ')}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Orçamento:</span> {cliente.preferencias.valorMaximo}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {cliente.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4 flex justify-between">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" /> Contatar
                  </Button>
                  <Button variant="secondary" size="sm">
                    Ver perfil
                  </Button>
                </CardFooter>
              </Card>
            ))}
          
          {/* Card para adicionar novo cliente */}
          <Card className="flex flex-col justify-center items-center border-dashed p-6">
            <div className="text-center">
              <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-2">Novo Cliente</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cadastre um novo cliente no sistema
              </p>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-1" /> Cadastrar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
