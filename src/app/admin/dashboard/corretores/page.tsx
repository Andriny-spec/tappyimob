'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  UserPlus, 
  Building2, 
  Star, 
  ClipboardList, 
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Calendar,
  BadgeCheck,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

// Dados de exemplo para os corretores
const corretoresData = [
  {
    id: '1',
    nome: 'Amanda Silva',
    email: 'amanda.silva@exemplo.com',
    telefone: '(11) 98765-4321',
    imobiliaria: 'Imobiliária Central',
    imobiliariaId: '1',
    avatar: '/avatars/amanda.jpg',
    status: 'ativo',
    imoveis: 24,
    vendas: 8,
    classificacao: 4.8,
    dataIngresso: '15/01/2025',
    endereco: 'São Paulo, SP',
    especialidades: ['Apartamentos', 'Lançamentos'],
    ultimaAtividade: '2h atrás'
  },
  {
    id: '2',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@exemplo.com',
    telefone: '(11) 97654-3210',
    imobiliaria: 'Imóveis Express',
    imobiliariaId: '2',
    avatar: '',
    status: 'inativo',
    imoveis: 12,
    vendas: 3,
    classificacao: 4.2,
    dataIngresso: '03/02/2025',
    endereco: 'São Paulo, SP',
    especialidades: ['Casas', 'Imóveis Rurais'],
    ultimaAtividade: '3d atrás'
  },
  {
    id: '3',
    nome: 'Patrícia Mendes',
    email: 'patricia.mendes@exemplo.com',
    telefone: '(21) 99876-5432',
    imobiliaria: 'Casa Bela Imóveis',
    imobiliariaId: '3',
    avatar: '/avatars/patricia.jpg',
    status: 'ativo',
    imoveis: 18,
    vendas: 5,
    classificacao: 4.5,
    dataIngresso: '22/01/2025',
    endereco: 'Rio de Janeiro, RJ',
    especialidades: ['Alto Padrão', 'Comercial'],
    ultimaAtividade: '5h atrás'
  },
  {
    id: '4',
    nome: 'Ricardo Santos',
    email: 'ricardo.santos@exemplo.com',
    telefone: '(31) 98765-1234',
    imobiliaria: 'Grupo Habitar',
    imobiliariaId: '4',
    avatar: '',
    status: 'ativo',
    imoveis: 15,
    vendas: 4,
    classificacao: 4.3,
    dataIngresso: '10/02/2025',
    endereco: 'Belo Horizonte, MG',
    especialidades: ['Terrenos', 'Casas'],
    ultimaAtividade: '1d atrás'
  },
  {
    id: '5',
    nome: 'Juliana Costa',
    email: 'juliana.costa@exemplo.com',
    telefone: '(41) 99876-4321',
    imobiliaria: 'Nova Era Imóveis',
    imobiliariaId: '5',
    avatar: '/avatars/juliana.jpg',
    status: 'ativo',
    imoveis: 29,
    vendas: 10,
    classificacao: 4.9,
    dataIngresso: '05/01/2025',
    endereco: 'Curitiba, PR',
    especialidades: ['Apartamentos', 'Lançamentos', 'Alto Padrão'],
    ultimaAtividade: '3h atrás'
  },
];

export default function CorretoresPage() {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedTab, setSelectedTab] = useState('todos');
  
  const filteredCorretores = 
    selectedTab === 'todos' 
      ? corretoresData 
      : corretoresData.filter(corretor => corretor.status === selectedTab);

  return (
    <PageContainer
      title="Corretores"
      subtitle="Gerencie os corretores cadastrados no sistema"
    >
      {/* Barra de ações e filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Buscar corretor..." 
            className="w-full sm:w-80"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
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
            Novo Corretor
          </Button>
        </div>
      </div>

      {/* Tabs e alternar visualização */}
      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="todos" className="w-full" onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="ativo">Ativos</TabsTrigger>
            <TabsTrigger value="inativo">Inativos</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 ml-4">
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'outline'} 
            size="sm"
            className="px-3"
            onClick={() => setViewMode('cards')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            className="px-3"
            onClick={() => setViewMode('table')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list">
              <line x1="8" x2="21" y1="6" y2="6" />
              <line x1="8" x2="21" y1="12" y2="12" />
              <line x1="8" x2="21" y1="18" y2="18" />
              <line x1="3" x2="3.01" y1="6" y2="6" />
              <line x1="3" x2="3.01" y1="12" y2="12" />
              <line x1="3" x2="3.01" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Conteúdo baseado no modo de visualização */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCorretores.map((corretor) => (
            <CorretorCard key={corretor.id} corretor={corretor} />
          ))}
        </div>
      )}

      {/* Aqui adicionaremos a visualização em tabela na próxima parte */}
    </PageContainer>
  );
}

// Componente de Card do Corretor
function CorretorCard({ corretor }: { corretor: any }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Badge 
            variant={corretor.status === 'ativo' ? 'default' : 'destructive'}
            className={cn(
              corretor.status === 'ativo' ? 'bg-green-500' : 'bg-red-400'
            )}
          >
            {corretor.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {corretor.classificacao}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            {corretor.avatar ? (
              <AvatarImage src={corretor.avatar} alt={corretor.nome} />
            ) : (
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {corretor.nome.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            )}
          </Avatar>
          <h3 className="text-xl font-semibold">{corretor.nome}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>{corretor.imobiliaria}</span>
          </div>

          <div className="w-full mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col">
              <span className="text-xl font-semibold">{corretor.imoveis}</span>
              <span className="text-xs text-muted-foreground">Imóveis</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold">{corretor.vendas}</span>
              <span className="text-xs text-muted-foreground">Vendas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold">
                {Math.floor(corretor.vendas / corretor.imoveis * 100)}%
              </span>
              <span className="text-xs text-muted-foreground">Conversão</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{corretor.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{corretor.telefone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{corretor.endereco}</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Especialidades</p>
          <div className="flex flex-wrap gap-2">
            {corretor.especialidades.map((esp: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {esp}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between mt-6 pt-4 border-t">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Desde {corretor.dataIngresso}
        </div>
        <Button variant="ghost" size="sm">
          Ver perfil
        </Button>
      </CardFooter>
    </Card>
  );
}
