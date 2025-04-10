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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Briefcase,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Share2,
  Phone,
  Mail,
  Building2,
  Users,
  Award,
  Star,
  Calendar,
  MessageSquare,
  BarChart4,
  Activity
} from 'lucide-react';

// Dados fictícios para demonstração
const corretores = [
  {
    id: 1,
    nome: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    telefone: '(11) 98765-4321',
    creci: '12345-F',
    especialidade: 'Apartamentos de Alto Padrão',
    imoveisAtivos: 15,
    vendasMes: 2,
    vendasTotal: 28,
    comissao: 24580.75,
    avaliacao: 4.7,
    avaliacoes: 23,
    status: 'ativo',
    dataContratacao: '2022-05-15',
  },
  {
    id: 2,
    nome: 'Ana Santos',
    email: 'ana.santos@email.com',
    telefone: '(11) 97654-3210',
    creci: '23456-F',
    especialidade: 'Casas em Condomínio',
    imoveisAtivos: 12,
    vendasMes: 1,
    vendasTotal: 42,
    comissao: 18950.30,
    avaliacao: 4.9,
    avaliacoes: 38,
    status: 'ativo',
    dataContratacao: '2021-10-08',
  },
  {
    id: 3,
    nome: 'Marcos Oliveira',
    email: 'marcos.oliveira@email.com',
    telefone: '(11) 96543-2109',
    creci: '34567-F',
    especialidade: 'Imóveis Comerciais',
    imoveisAtivos: 8,
    vendasMes: 0,
    vendasTotal: 15,
    comissao: 0,
    avaliacao: 4.2,
    avaliacoes: 12,
    status: 'ativo',
    dataContratacao: '2023-02-20',
  },
  {
    id: 4,
    nome: 'Juliana Costa',
    email: 'juliana.costa@email.com',
    telefone: '(11) 95432-1098',
    creci: '45678-F',
    especialidade: 'Lançamentos',
    imoveisAtivos: 18,
    vendasMes: 3,
    vendasTotal: 32,
    comissao: 35760.50,
    avaliacao: 4.8,
    avaliacoes: 26,
    status: 'ativo',
    dataContratacao: '2022-08-10',
  },
  {
    id: 5,
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@email.com',
    telefone: '(11) 94321-0987',
    creci: '56789-F',
    especialidade: 'Terrenos',
    imoveisAtivos: 5,
    vendasMes: 1,
    vendasTotal: 9,
    comissao: 12450.00,
    avaliacao: 4.5,
    avaliacoes: 8,
    status: 'ativo',
    dataContratacao: '2023-05-05',
  },
  {
    id: 6,
    nome: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    telefone: '(11) 93210-9876',
    creci: '67890-F',
    especialidade: 'Apartamentos',
    imoveisAtivos: 14,
    vendasMes: 2,
    vendasTotal: 22,
    comissao: 26830.25,
    avaliacao: 4.6,
    avaliacoes: 19,
    status: 'inativo',
    dataContratacao: '2022-03-18',
  }
];

// Componente para o card de corretor em destaque
const CorretorCard = ({ corretor }: { corretor: any }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-20 h-20 rounded-full bg-muted mb-3 relative">
            {corretor.avaliacao >= 4.8 && (
              <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
                <Star className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-lg">{corretor.nome}</h3>
          <p className="text-sm text-muted-foreground">{corretor.especialidade}</p>
          <div className="flex items-center mt-1 gap-1">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">{corretor.avaliacao}</span>
            <span className="text-xs text-muted-foreground">({corretor.avaliacoes})</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground">Vendas (Mês)</div>
            <div className="text-lg font-bold">{corretor.vendasMes}</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground">Vendas (Total)</div>
            <div className="text-lg font-bold">{corretor.vendasTotal}</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{corretor.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{corretor.telefone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">CRECI: {corretor.creci}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" className="w-full gap-1">
          <MessageSquare className="h-4 w-4" />
          Mensagem
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function CorretoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  
  const filteredCorretores = corretores.filter(corretor => {
    let matchesTab = true;
    
    if (activeTab === 'ativos') {
      matchesTab = corretor.status === 'ativo';
    } else if (activeTab === 'inativos') {
      matchesTab = corretor.status === 'inativo';
    } else if (activeTab === 'destaque') {
      matchesTab = corretor.avaliacao >= 4.7;
    }
    
    const matchesSearch = corretor.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         corretor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corretor.especialidade.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <PageContainer
      title="Corretores"
      subtitle="Gerencie a equipe de corretores da sua imobiliária"
    >
      {/* Cabeçalho com pesquisa e botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, e-mail ou especialidade..."
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
            Novo Corretor
          </Button>
        </div>
      </div>

      {/* Resumo de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Corretores</p>
                <h3 className="text-2xl font-bold mt-1">{corretores.filter(c => c.status === 'ativo').length}</h3>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas no Mês</p>
                <h3 className="text-2xl font-bold mt-1">{corretores.reduce((total, c) => total + c.vendasMes, 0)}</h3>
              </div>
              <div className="bg-green-500/10 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comissões (Mês)</p>
                <h3 className="text-2xl font-bold mt-1">R$ {corretores.reduce((total, c) => total + c.comissao, 0).toLocaleString('pt-BR', {maximumFractionDigits: 0})}</h3>
              </div>
              <div className="bg-amber-500/10 p-2 rounded-full">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                <h3 className="text-2xl font-bold mt-1 flex items-center gap-1">
                  {(corretores.reduce((total, c) => total + c.avaliacao, 0) / corretores.length).toFixed(1)}
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </h3>
              </div>
              <div className="bg-purple-500/10 p-2 rounded-full">
                <Star className="h-5 w-5 text-purple-500" />
              </div>
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
          <TabsTrigger value="destaque">Destaque</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-6">
          {/* Lista de corretores */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Corretor</TableHead>
                    <TableHead>CRECI</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Imóveis Ativos</TableHead>
                    <TableHead>Vendas (Mês)</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorretores.map((corretor) => (
                    <TableRow key={corretor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted"></div>
                          <div>
                            <div className="font-medium">{corretor.nome}</div>
                            <div className="text-xs text-muted-foreground">{corretor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{corretor.creci}</TableCell>
                      <TableCell>{corretor.especialidade}</TableCell>
                      <TableCell>{corretor.imoveisAtivos}</TableCell>
                      <TableCell>{corretor.vendasMes}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span>{corretor.avaliacao}</span>
                          <span className="text-xs text-muted-foreground">({corretor.avaliacoes})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={corretor.status === 'ativo' ? 'default' : 'secondary'}>
                          {corretor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BarChart4 className="h-4 w-4" />
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
                Mostrando {filteredCorretores.length} de {corretores.length} corretores
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

        <TabsContent value="ativos" className="space-y-6">
          {/* Conteúdo similar à aba "todos", mas filtrado para corretores ativos */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Corretor</TableHead>
                    <TableHead>CRECI</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Imóveis Ativos</TableHead>
                    <TableHead>Vendas (Mês)</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorretores.map((corretor) => (
                    <TableRow key={corretor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted"></div>
                          <div>
                            <div className="font-medium">{corretor.nome}</div>
                            <div className="text-xs text-muted-foreground">{corretor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{corretor.creci}</TableCell>
                      <TableCell>{corretor.especialidade}</TableCell>
                      <TableCell>{corretor.imoveisAtivos}</TableCell>
                      <TableCell>{corretor.vendasMes}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span>{corretor.avaliacao}</span>
                          <span className="text-xs text-muted-foreground">({corretor.avaliacoes})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BarChart4 className="h-4 w-4" />
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
          </Card>
        </TabsContent>

        <TabsContent value="inativos" className="space-y-6">
          {/* Lista de corretores inativos */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Última Atividade</TableHead>
                    <TableHead>Vendas Totais</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCorretores.map((corretor) => (
                    <TableRow key={corretor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-muted"></div>
                          <div>
                            <div className="font-medium">{corretor.nome}</div>
                            <div className="text-xs text-muted-foreground">{corretor.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>10/05/2024</TableCell>
                      <TableCell>{corretor.vendasTotal}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm">
                            Reativar
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
            <CardFooter className="border-t px-6 py-3">
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredCorretores.length} de {corretores.filter(c => c.status === 'inativo').length} corretores inativos
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="destaque" className="space-y-6">
          {/* Grid de corretores em destaque */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCorretores.map((corretor) => (
              <CorretorCard key={corretor.id} corretor={corretor} />
            ))}
          </div>
          
          {/* Exibir uma mensagem se não houver corretores em destaque */}
          {filteredCorretores.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum corretor em destaque</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Corretores com avaliação acima de 4.7 aparecem nesta aba.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
