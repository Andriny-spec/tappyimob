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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Building,
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit,
  Eye,
  Trash2,
  MapPin,
  DollarSign,
  Home,
  Star,
  SquareStack,
  MoreHorizontal
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

// Dados fictícios para demonstração
const imoveis = [
  { 
    id: 1, 
    titulo: 'Apartamento de Luxo com 3 Quartos',
    endereco: 'Rua das Flores, 123 - Jardins',
    preco: 850000, 
    status: 'À venda',
    tipo: 'Apartamento',
    area: 120,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    destaque: true,
    imagens: ['/img/ap1.jpg'],
    publicadoEm: '28/02/2025',
    visualizacoes: 342,
    contatos: 18
  },
  { 
    id: 2, 
    titulo: 'Casa em Condomínio Fechado',
    endereco: 'Alameda dos Ipês, 45 - Alphaville',
    preco: 1200000, 
    status: 'À venda',
    tipo: 'Casa',
    area: 220,
    quartos: 4,
    banheiros: 3,
    vagas: 3,
    destaque: true,
    imagens: ['/img/casa1.jpg'],
    publicadoEm: '15/02/2025',
    visualizacoes: 287,
    contatos: 12
  },
  { 
    id: 3, 
    titulo: 'Sala Comercial no Centro Empresarial',
    endereco: 'Av. Paulista, 1000 - Bela Vista',
    preco: 3500, 
    status: 'Para alugar',
    tipo: 'Comercial',
    area: 60,
    quartos: 0,
    banheiros: 1,
    vagas: 1,
    destaque: false,
    imagens: ['/img/comercial1.jpg'],
    publicadoEm: '05/03/2025',
    visualizacoes: 105,
    contatos: 6
  },
  { 
    id: 4, 
    titulo: 'Apartamento Compacto e Moderno',
    endereco: 'Rua Augusta, 1200 - Consolação',
    preco: 450000, 
    status: 'À venda',
    tipo: 'Apartamento',
    area: 55,
    quartos: 1,
    banheiros: 1,
    vagas: 1,
    destaque: false,
    imagens: ['/img/ap2.jpg'],
    publicadoEm: '01/03/2025',
    visualizacoes: 178,
    contatos: 8
  },
  { 
    id: 5, 
    titulo: 'Sobrado em Bairro Residencial',
    endereco: 'Rua dos Pinheiros, 322 - Pinheiros',
    preco: 920000, 
    status: 'À venda',
    tipo: 'Casa',
    area: 180,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    destaque: false,
    imagens: ['/img/casa2.jpg'],
    publicadoEm: '20/02/2025',
    visualizacoes: 201,
    contatos: 10
  }
];

export default function ImoveisCorretorPage() {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  
  // Filtro de imóveis
  const imoveisFiltrados = imoveis.filter(imovel => {
    // Filtro por busca
    const termoBusca = busca.toLowerCase();
    const matchBusca = busca === '' || 
      imovel.titulo.toLowerCase().includes(termoBusca) || 
      imovel.endereco.toLowerCase().includes(termoBusca);
    
    // Filtro por tipo
    const matchTipo = tipoFiltro === 'todos' || 
      (tipoFiltro === 'venda' && imovel.status === 'À venda') ||
      (tipoFiltro === 'aluguel' && imovel.status === 'Para alugar') ||
      (tipoFiltro === 'destaque' && imovel.destaque);
    
    return matchBusca && matchTipo;
  });
  
  return (
    <PageContainer
      title="Imóveis"
      subtitle="Gerencie seus imóveis cadastrados"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar imóveis..."
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
                  <DialogTitle>Filtrar Imóveis</DialogTitle>
                  <DialogDescription>
                    Selecione os filtros para encontrar imóveis específicos
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Tipo de Imóvel</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tipo-ap" />
                        <label htmlFor="tipo-ap" className="text-sm">Apartamento</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tipo-casa" />
                        <label htmlFor="tipo-casa" className="text-sm">Casa</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tipo-comercial" />
                        <label htmlFor="tipo-comercial" className="text-sm">Comercial</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="tipo-terreno" />
                        <label htmlFor="tipo-terreno" className="text-sm">Terreno</label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Faixa de Preço</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Mínimo</label>
                        <Input type="number" placeholder="R$ 0" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Máximo</label>
                        <Input type="number" placeholder="Sem limite" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Características</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quartos-2mais" />
                        <label htmlFor="quartos-2mais" className="text-sm">2+ quartos</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quartos-3mais" />
                        <label htmlFor="quartos-3mais" className="text-sm">3+ quartos</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="garagem" />
                        <label htmlFor="garagem" className="text-sm">Com garagem</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mobiliado" />
                        <label htmlFor="mobiliado" className="text-sm">Mobiliado</label>
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
                <Plus className="h-4 w-4 mr-2" />
                Novo Imóvel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Imóvel</DialogTitle>
                <DialogDescription>
                  Preencha os dados do imóvel para publicá-lo na plataforma
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input placeholder="Ex: Apartamento 3 quartos com vista" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>Apartamento</option>
                        <option>Casa</option>
                        <option>Comercial</option>
                        <option>Terreno</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>À venda</option>
                        <option>Para alugar</option>
                        <option>Venda/Aluguel</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Endereço</label>
                    <Input placeholder="Rua, número, bairro" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Preço (R$)</label>
                      <Input type="number" placeholder="Valor" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Área (m²)</label>
                      <Input type="number" placeholder="Tamanho" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium">Quartos</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Banheiros</label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Vagas</label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Fotos</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-10">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary-dark">
                            <span>Carregar fotos</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                          </label>
                          <p className="pl-1">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP até 10MB</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="destaque" />
                    <label htmlFor="destaque" className="text-sm font-medium">Marcar como destaque</label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Imóvel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="todos" onValueChange={setTipoFiltro}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="venda">Venda</TabsTrigger>
            <TabsTrigger value="aluguel">Aluguel</TabsTrigger>
            <TabsTrigger value="destaque">Destaques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos" className="mt-4">
            <Card>
              <CardHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Listagem de Imóveis</CardTitle>
                  <Button variant="outline" size="sm" className="flex gap-1 text-xs">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Ordenar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                {imoveisFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-center text-muted-foreground">
                      Nenhum imóvel encontrado com os filtros selecionados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {imoveisFiltrados.map((imovel) => (
                      <div key={imovel.id} className="flex flex-col sm:flex-row gap-4 rounded-md border p-4">
                        <div className="sm:w-32 h-24 sm:h-32 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0">
                          {imovel.imagens && imovel.imagens.length > 0 ? (
                            <img src={imovel.imagens[0]} alt={imovel.titulo} className="h-full w-full object-cover" />
                          ) : (
                            <Home className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-base">{imovel.titulo}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {imovel.endereco}
                              </div>
                            </div>
                            
                            {imovel.destaque && (
                              <Badge className="ml-2">Destaque</Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="font-medium">
                                {imovel.status === 'Para alugar' ? 
                                  `R$ ${imovel.preco.toLocaleString('pt-BR')}/mês` : 
                                  `R$ ${imovel.preco.toLocaleString('pt-BR')}`
                                }
                              </span>
                            </div>
                            <div className="flex items-center">
                              <SquareStack className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{imovel.area} m²</span>
                            </div>
                            {imovel.quartos > 0 && (
                              <div>
                                <span>{imovel.quartos} {imovel.quartos === 1 ? 'quarto' : 'quartos'}</span>
                              </div>
                            )}
                            {imovel.banheiros > 0 && (
                              <div>
                                <span>{imovel.banheiros} {imovel.banheiros === 1 ? 'banheiro' : 'banheiros'}</span>
                              </div>
                            )}
                            {imovel.vagas > 0 && (
                              <div>
                                <span>{imovel.vagas} {imovel.vagas === 1 ? 'vaga' : 'vagas'}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-1 text-xs text-muted-foreground">
                              <span>Publicado: {imovel.publicadoEm}</span>
                              <span>•</span>
                              <span>Visualizações: {imovel.visualizacoes}</span>
                              <span>•</span>
                              <span>Contatos: {imovel.contatos}</span>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
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
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Compartilhar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Gerar link
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
                  Mostrando {imoveisFiltrados.length} de {imoveis.length} imóveis
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
          
          <TabsContent value="venda" className="mt-4">
            {/* Conteúdo da aba Venda - carregado dinamicamente pelo filtro */}
          </TabsContent>
          
          <TabsContent value="aluguel" className="mt-4">
            {/* Conteúdo da aba Aluguel - carregado dinamicamente pelo filtro */}
          </TabsContent>
          
          <TabsContent value="destaque" className="mt-4">
            {/* Conteúdo da aba Destaque - carregado dinamicamente pelo filtro */}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
