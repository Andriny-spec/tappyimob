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
  Building2,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Home,
  Award,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  Download,
  RefreshCw,
  Share2
} from 'lucide-react';

// Dados fictícios para demonstração
const imoveis = [
  {
    id: 'IM001',
    titulo: 'Apartamento em Pinheiros',
    endereco: 'Rua dos Pinheiros, 1500, São Paulo - SP',
    tipo: 'Apartamento',
    status: 'Disponível',
    preco: 850000,
    area: 85,
    quartos: 2,
    banheiros: 2,
    garagem: 1,
    destaque: true,
    dataCadastro: '2024-10-15',
    visualizacoes: 345,
    contatos: 12
  },
  {
    id: 'IM002',
    titulo: 'Casa em Moema',
    endereco: 'Alameda dos Nhambiquaras, 1100, São Paulo - SP',
    tipo: 'Casa',
    status: 'Disponível',
    preco: 1350000,
    area: 150,
    quartos: 3,
    banheiros: 3,
    garagem: 2,
    destaque: true,
    dataCadastro: '2024-09-22',
    visualizacoes: 530,
    contatos: 18
  },
  {
    id: 'IM003',
    titulo: 'Sala Comercial no Centro',
    endereco: 'Av. Paulista, 1000, São Paulo - SP',
    tipo: 'Comercial',
    status: 'Disponível',
    preco: 550000,
    area: 60,
    quartos: 0,
    banheiros: 1,
    garagem: 1,
    destaque: false,
    dataCadastro: '2024-11-05',
    visualizacoes: 128,
    contatos: 4
  },
  {
    id: 'IM004',
    titulo: 'Apartamento na Vila Mariana',
    endereco: 'Rua Vergueiro, 2500, São Paulo - SP',
    tipo: 'Apartamento',
    status: 'Reservado',
    preco: 750000,
    area: 75,
    quartos: 2,
    banheiros: 1,
    garagem: 1,
    destaque: false,
    dataCadastro: '2024-10-28',
    visualizacoes: 290,
    contatos: 10
  },
  {
    id: 'IM005',
    titulo: 'Cobertura Duplex em Perdizes',
    endereco: 'Rua Cardoso de Almeida, 800, São Paulo - SP',
    tipo: 'Apartamento',
    status: 'Disponível',
    preco: 1850000,
    area: 180,
    quartos: 4,
    banheiros: 3,
    garagem: 3,
    destaque: true,
    dataCadastro: '2024-09-15',
    visualizacoes: 620,
    contatos: 22
  },
  {
    id: 'IM006',
    titulo: 'Terreno em Alphaville',
    endereco: 'Alameda Cauaxi, 380, Barueri - SP',
    tipo: 'Terreno',
    status: 'Disponível',
    preco: 650000,
    area: 500,
    quartos: 0,
    banheiros: 0,
    garagem: 0,
    destaque: false,
    dataCadastro: '2024-11-01',
    visualizacoes: 190,
    contatos: 7
  },
  {
    id: 'IM007',
    titulo: 'Casa em Condomínio Fechado',
    endereco: 'Estrada das Árvores, 500, Cotia - SP',
    tipo: 'Casa',
    status: 'Vendido',
    preco: 980000,
    area: 200,
    quartos: 3,
    banheiros: 4,
    garagem: 2,
    destaque: false,
    dataCadastro: '2024-08-20',
    visualizacoes: 480,
    contatos: 15
  }
];

export default function ImoveisPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  
  const filteredImoveis = imoveis.filter(imovel => {
    let matchesTab = true;
    
    if (activeTab === 'disponiveis') {
      matchesTab = imovel.status === 'Disponível';
    } else if (activeTab === 'reservados') {
      matchesTab = imovel.status === 'Reservado';
    } else if (activeTab === 'vendidos') {
      matchesTab = imovel.status === 'Vendido';
    } else if (activeTab === 'destaques') {
      matchesTab = imovel.destaque === true;
    }
    
    const matchesSearch = imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         imovel.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <PageContainer
      title="Imóveis"
      subtitle="Gerencie o catálogo de imóveis da sua imobiliária"
    >
      {/* Cabeçalho com pesquisa e botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por código, título ou endereço..."
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
            Novo Imóvel
          </Button>
        </div>
      </div>

      {/* Abas e conteúdo principal */}
      <Tabs defaultValue="todos" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
          <TabsTrigger value="reservados">Reservados</TabsTrigger>
          <TabsTrigger value="vendidos">Vendidos</TabsTrigger>
          <TabsTrigger value="destaques">Destaques</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-6">
          {/* Lista de imóveis */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImoveis.map((imovel) => (
                    <TableRow key={imovel.id}>
                      <TableCell className="font-medium">{imovel.id}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">{imovel.titulo}</div>
                          <div className="text-xs text-muted-foreground truncate">{imovel.endereco}</div>
                        </div>
                      </TableCell>
                      <TableCell>{imovel.tipo}</TableCell>
                      <TableCell>R$ {imovel.preco.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          imovel.status === 'Disponível' ? 'default' :
                          imovel.status === 'Reservado' ? 'secondary' :
                          'outline'
                        }>
                          {imovel.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
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
            <CardFooter className="border-t px-6 py-3 flex justify-between">
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredImoveis.length} de {imoveis.length} imóveis
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

        <TabsContent value="disponiveis" className="space-y-6">
          {/* Conteúdo similar à aba "todos", mas filtrado para imóveis disponíveis */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredImoveis.map((imovel) => (
                    <TableRow key={imovel.id}>
                      <TableCell className="font-medium">{imovel.id}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">{imovel.titulo}</div>
                          <div className="text-xs text-muted-foreground truncate">{imovel.endereco}</div>
                        </div>
                      </TableCell>
                      <TableCell>{imovel.tipo}</TableCell>
                      <TableCell>R$ {imovel.preco.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {imovel.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
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
                Mostrando {filteredImoveis.length} de {imoveis.filter(i => i.status === 'Disponível').length} imóveis disponíveis
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="reservados" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              {filteredImoveis.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Código</TableHead>
                      <TableHead>Imóvel</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Similar ao conteúdo da aba "todos" */}
                    {filteredImoveis.map((imovel) => (
                      <TableRow key={imovel.id}>
                        <TableCell className="font-medium">{imovel.id}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium">{imovel.titulo}</div>
                            <div className="text-xs text-muted-foreground truncate">{imovel.endereco}</div>
                          </div>
                        </TableCell>
                        <TableCell>{imovel.tipo}</TableCell>
                        <TableCell>R$ {imovel.preco.toLocaleString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
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
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum imóvel reservado encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Não há imóveis reservados que correspondam à sua busca.</p>
                  <Button variant="outline" className="gap-1" onClick={() => setSearchTerm('')}>
                    <RefreshCw className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendidos" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              {filteredImoveis.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Código</TableHead>
                      <TableHead>Imóvel</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Data Venda</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImoveis.map((imovel) => (
                      <TableRow key={imovel.id}>
                        <TableCell className="font-medium">{imovel.id}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium">{imovel.titulo}</div>
                            <div className="text-xs text-muted-foreground truncate">{imovel.endereco}</div>
                          </div>
                        </TableCell>
                        <TableCell>{imovel.tipo}</TableCell>
                        <TableCell>R$ {imovel.preco.toLocaleString('pt-BR')}</TableCell>
                        <TableCell>15/10/2024</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
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
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum imóvel vendido encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Não há imóveis vendidos que correspondam à sua busca.</p>
                  <Button variant="outline" className="gap-1" onClick={() => setSearchTerm('')}>
                    <RefreshCw className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="destaques" className="space-y-6">
          {/* Grid de imóveis em destaque */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImoveis.map((imovel) => (
              <Card key={imovel.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500">Destaque</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{imovel.titulo}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {imovel.endereco}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between mb-2">
                    <Badge variant="outline">{imovel.tipo}</Badge>
                    <Badge>{imovel.status}</Badge>
                  </div>
                  <div className="text-xl font-bold">R$ {imovel.preco.toLocaleString('pt-BR')}</div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Área</div>
                      <div className="font-medium">{imovel.area}m²</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Quartos</div>
                      <div className="font-medium">{imovel.quartos}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Banheiros</div>
                      <div className="font-medium">{imovel.banheiros}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Garagem</div>
                      <div className="font-medium">{imovel.garagem}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {imovel.visualizacoes} visualizações
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-3 w-3" />
                    Compartilhar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
