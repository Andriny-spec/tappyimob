'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BadgeExtended } from '@/components/ui/badge-extended';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Search, Edit, Trash2, Eye, PlusCircle } from 'lucide-react';
import { formatarMoeda } from '@/lib/utils';

// Tipos
interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  valor: number;
  tipoOperacao: string;
  tipoImovel: string;
  status: string;
  bairro: string;
  cidade: string;
  estado: string;
  fotoPrincipal?: string;
  quartos?: number;
  banheiros?: number;
  areaTotal?: number;
  createdAt: string;
  fotos?: { id: string; url: string; ordem: number }[];
  corretor?: { id: string; fotoPerfil?: string; user: { nome: string, email: string } };
  adicionais?: { id: string; nome: string }[];
}

interface ImovelListagemProps {
  onVerDetalhes: (imovel: Imovel) => void;
  onEditar: (imovel: Imovel) => void;
  onDeletar: (id: string) => void;
  onAdicionar?: () => void;
}

export function ImovelListagem({ onVerDetalhes, onEditar, onDeletar, onAdicionar }: ImovelListagemProps) {
  const router = useRouter();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imovelParaExcluir, setImovelParaExcluir] = useState<string | null>(null);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

  useEffect(() => {
    carregarImoveis();
  }, [currentPage, searchTerm]);

  async function carregarImoveis() {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/imobiliaria/imoveis?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar imóveis');
      }

      const data = await response.json();
      setImoveis(data.imoveis);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      setError('Não foi possível carregar os imóveis. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    carregarImoveis();
  };

  const confirmarExclusao = (id: string) => {
    setImovelParaExcluir(id);
    setConfirmacaoAberta(true);
  };

  const executarExclusao = () => {
    if (imovelParaExcluir) {
      onDeletar(imovelParaExcluir);
      setConfirmacaoAberta(false);
      setImovelParaExcluir(null);
    }
  };

  // Formatação e exibição
  const formatarTipoImovel = (tipo: string) => {
    const formatacao: Record<string, string> = {
      'CASA': 'Casa',
      'APARTAMENTO': 'Apartamento',
      'TERRENO': 'Terreno',
      'SALA_COMERCIAL': 'Sala Comercial',
      'CONDOMINIO': 'Condomínio',
      'GALPAO': 'Galpão',
      'FAZENDA': 'Fazenda',
      'SITIO': 'Sítio',
      'CHACARA': 'Chácara',
      'OUTROS': 'Outros'
    };
    return formatacao[tipo] || tipo;
  };

  const formatarTipoOperacao = (tipo: string) => {
    const formatacao: Record<string, string> = {
      'VENDA': 'Venda',
      'ALUGUEL': 'Aluguel',
      'VENDA_ALUGUEL': 'Venda/Aluguel'
    };
    return formatacao[tipo] || tipo;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
      'ATIVO': 'success',
      'INATIVO': 'outline',
      'VENDIDO': 'secondary',
      'ALUGADO': 'secondary',
      'EM_ANALISE': 'warning'
    };
    return variants[status] || 'default';
  };

  const formatarStatus = (status: string) => {
    const formatacao: Record<string, string> = {
      'ATIVO': 'Ativo',
      'INATIVO': 'Inativo',
      'VENDIDO': 'Vendido',
      'ALUGADO': 'Alugado',
      'EM_ANALISE': 'Em Análise'
    };
    return formatacao[status] || status;
  };

  // Função para exibir endereço simplificado
  const formatarEndereco = (imovel: Imovel) => {
    return `${imovel.bairro}, ${imovel.cidade} - ${imovel.estado}`;
  };

  if (isLoading && imoveis.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando imóveis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/20 p-4 rounded-md text-destructive">
        <p>{error}</p>
        <Button 
          variant="outline" 
          onClick={carregarImoveis}
          className="mt-2"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de busca */}
      <div className="flex items-center justify-between mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 mr-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título, endereço, código..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        {onAdicionar && (
          <Button onClick={onAdicionar} className="whitespace-nowrap">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Imóvel
          </Button>
        )}
      </div>

      {/* Tabela de imóveis */}
      {imoveis.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-lg text-muted-foreground">Nenhum imóvel encontrado.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tente ajustar seus critérios de busca ou {' '}
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => router.push('/imobiliaria/dashboard/imoveis/novo')}
            >
              adicione um novo imóvel
            </Button>.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Foto</TableHead>
                  <TableHead className="w-[80px]">Código</TableHead>
                  <TableHead className="max-w-[250px]">Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead className="hidden md:table-cell">Local</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imoveis.map((imovel) => (
                  <TableRow key={imovel.id}>
                    <TableCell>
                      <div className="relative h-10 w-14 overflow-hidden rounded-md bg-muted">
                        {imovel.fotoPrincipal ? (
                          <img 
                            src={imovel.fotoPrincipal} 
                            alt={imovel.titulo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs">Sem foto</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{imovel.codigo}</TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {imovel.titulo}
                    </TableCell>
                    <TableCell>{formatarTipoImovel(imovel.tipoImovel)}</TableCell>
                    <TableCell>{formatarTipoOperacao(imovel.tipoOperacao)}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatarEndereco(imovel)}</TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(imovel.valor)}
                    </TableCell>
                    <TableCell>
                      <BadgeExtended variant={getStatusBadgeVariant(imovel.status)}>
                        {formatarStatus(imovel.status)}
                      </BadgeExtended>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onVerDetalhes(imovel)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditar(imovel)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmarExclusao(imovel.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Próxima
            </Button>
          </div>
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      <Dialog open={confirmacaoAberta} onOpenChange={setConfirmacaoAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmacaoAberta(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={executarExclusao}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
