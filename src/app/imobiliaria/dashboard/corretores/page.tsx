'use client';

import { useState, useEffect } from 'react';
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
  Activity,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { StatusUser } from '@prisma/client';

// Componente de mini-gráfico (sparkline)
const SparklineChart = ({ data, color = "#10b981", height = 20 }: { data: number[], color?: string, height?: number }) => {
  const maxValue = Math.max(...data, 1);
  const points = data.map((value, index) => [
    (index / (data.length - 1)) * 100,
    100 - ((value / maxValue) * 100)
  ]);
  
  const pathData = points.map((point, i) => 
    `${i === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`
  ).join(' ');
  
  return (
    <div className="inline-block" style={{ height: `${height}px` }}>
      <svg width="80" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d={pathData} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          vectorEffect="non-scaling-stroke"
        />
        {/* Círculo no ponto final */}
        <circle 
          cx={points[points.length - 1][0]} 
          cy={points[points.length - 1][1]} 
          r="2" 
          fill={color} 
        />
      </svg>
    </div>
  );
};

// Interface para os dados de Corretor
interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  creci: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string;
  status: StatusUser;
  imoveisAtivos: number;
  imoveisFechados?: number;
  avaliacoes?: number;
  avaliacaoMedia?: number;
  desempenhoMensal?: number[];
  createdAt: string;
  updatedAt: string;
}

// Componente para o card de corretor em destaque
const CorretorCard = ({ corretor }: { corretor: Corretor }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-20 h-20 rounded-full bg-muted mb-3 relative">
            {/* Avatar do corretor */}
            {corretor.fotoPerfil && (
              <img 
                src={corretor.fotoPerfil} 
                alt={corretor.nome} 
                className="w-full h-full object-cover rounded-full"
              />
            )}
          </div>
          <h3 className="font-bold text-lg">{corretor.nome}</h3>
          <p className="text-sm text-muted-foreground">{corretor.creci || "Sem CRECI"}</p>
          <Badge variant={corretor.status === "ATIVO" ? "default" : "secondary"}>
            {corretor.status === "ATIVO" ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{corretor.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{corretor.telefone || "Não informado"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">CRECI: {corretor.creci || "Não informado"}</span>
          </div>
          {corretor.cidade && corretor.estado && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{corretor.cidade}/{corretor.estado}</span>
            </div>
          )}
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

// Modal para visualizar detalhes do corretor
const CorretorDetailsModal = ({ 
  isOpen, 
  onClose, 
  corretorId,
  onEditClick,
  onDeleteClick
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  corretorId: string | null,
  onEditClick: (corretor: any) => void,
  onDeleteClick: (corretor: {id: string, nome: string}) => void
}) => {
  const [loading, setLoading] = useState(true);
  const [corretor, setCorretor] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && corretorId) {
      setLoading(true);
      setError(null);
      
      fetch(`/api/imobiliaria/corretores/${corretorId}`)
        .then(res => {
          if (!res.ok) throw new Error("Falha ao carregar dados do corretor");
          return res.json();
        })
        .then(data => {
          setCorretor(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar detalhes do corretor:", err);
          setError("Não foi possível carregar os detalhes do corretor. Tente novamente.");
          setLoading(false);
        });
    }
  }, [isOpen, corretorId]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl max-h-[85vh] w-[95vw] overflow-y-auto p-6 bg-background border rounded-lg shadow-lg">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">Detalhes do Corretor</DialogTitle>
          <DialogDescription>Informações completas do corretor e suas atividades</DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={onClose} className="mt-4">Fechar</Button>
          </div>
        ) : corretor ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Foto e informações básicas */}
              <div className="w-full md:w-1/3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-muted mb-4">
                        {corretor.fotoPerfil && (
                          <img 
                            src={corretor.fotoPerfil} 
                            alt={corretor.nome} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{corretor.nome}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {corretor.creci ? `CRECI: ${corretor.creci}` : "Sem CRECI"}
                      </p>
                      <Badge variant={corretor.status === "ATIVO" ? "default" : "secondary"}>
                        {corretor.status === "ATIVO" ? "Ativo" : "Inativo"}
                      </Badge>
                      
                      <div className="w-full mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{corretor.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{corretor.telefone || "Não informado"}</span>
                        </div>
                        {corretor.cpf && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">CPF: {corretor.cpf}</span>
                          </div>
                        )}
                        {corretor.cnpj && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">CNPJ: {corretor.cnpj}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Informações detalhadas */}
              <div className="w-full md:w-2/3 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Endereço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {corretor.endereco ? (
                        <>
                          <p>{corretor.endereco}, {corretor.numero || "S/N"}</p>
                          <p>{corretor.bairro}</p>
                          <p>{corretor.cidade} - {corretor.estado}</p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Endereço não cadastrado</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Dados Cadastrais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Data de Cadastro</Label>
                        <p>{new Date(corretor.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Última Atualização</Label>
                        <p>{new Date(corretor.updatedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Imóveis gerenciados pelo corretor */}
            {corretor.imoveis && corretor.imoveis.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Imóveis Gerenciados</CardTitle>
                  <CardDescription>
                    Total de {corretor.imoveis.length} imóveis ativos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Operação</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corretor.imoveis.map((imovel: any) => (
                        <TableRow key={imovel.id}>
                          <TableCell>{imovel.codigo}</TableCell>
                          <TableCell>{imovel.titulo}</TableCell>
                          <TableCell>{imovel.tipoImovel}</TableCell>
                          <TableCell>{imovel.tipoOperacao}</TableCell>
                          <TableCell>R$ {Number(imovel.valor).toLocaleString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant={
                              imovel.status === "ATIVO" ? "default" : 
                              imovel.status === "VENDIDO" || imovel.status === "ALUGADO" ? "default" :
                              "secondary"
                            }
                            className={
                              imovel.status === "VENDIDO" || imovel.status === "ALUGADO" ? "bg-green-500 hover:bg-green-500/90" : ""
                            }>
                              {imovel.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            
            {/* Clientes atendidos pelo corretor */}
            {corretor.clientes && corretor.clientes.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Clientes Atendidos</CardTitle>
                  <CardDescription>
                    Total de {corretor.clientes.length} clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corretor.clientes.map((cliente: any) => (
                        <TableRow key={cliente.id}>
                          <TableCell>{cliente.user.nome}</TableCell>
                          <TableCell>{cliente.user.email}</TableCell>
                          <TableCell>{cliente.telefone || "Não informado"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            
            <DialogFooter className="flex justify-between border-t mt-6 pt-4">
              <div>
                <Button variant="destructive" size="sm" className="gap-1" onClick={() => onDeleteClick({ id: corretor.id, nome: corretor.nome })}>
                  <Trash2 className="h-4 w-4" />
                  Excluir Corretor
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>Fechar</Button>
                <Button className="gap-1" onClick={() => onEditClick(corretor)}>
                  <Edit className="h-4 w-4" />
                  Editar Corretor
                </Button>
              </div>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
            <p className="text-sm text-muted-foreground">Corretor não encontrado</p>
            <Button variant="outline" onClick={onClose} className="mt-4">Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Modal para editar corretor
const CorretorEditModal = ({ 
  isOpen, 
  onClose, 
  corretor,
  onSave
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  corretor: any | null,
  onSave: (data: any) => void
}) => {
  const [formData, setFormData] = useState<any>({
    nome: '',
    email: '',
    creci: '',
    telefone: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    status: 'ATIVO',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (corretor) {
      setFormData({
        nome: corretor.nome || '',
        email: corretor.email || '',
        creci: corretor.creci || '',
        telefone: corretor.telefone || '',
        endereco: corretor.endereco || '',
        numero: corretor.numero || '',
        bairro: corretor.bairro || '',
        cidade: corretor.cidade || '',
        estado: corretor.estado || '',
        status: corretor.status,
      });
    }
  }, [corretor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 bg-background border rounded-lg shadow-lg">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">Editar Corretor</DialogTitle>
          <DialogDescription>Atualize as informações do corretor</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo do corretor"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creci">CRECI</Label>
              <Input
                id="creci"
                name="creci"
                value={formData.creci}
                onChange={handleChange}
                placeholder="Número do CRECI"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Rua, Avenida..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="123"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Nome do bairro"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Nome da cidade"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                placeholder="UF"
                maxLength={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="PENDENTE">Pendente</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-1">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full"></div>
                  Salvando...
                </span>
              ) : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Modal para confirmar exclusão
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  corretorId,
  corretorNome,
  onConfirm
}: {
  isOpen: boolean,
  onClose: () => void,
  corretorId: string | null,
  corretorNome: string | null,
  onConfirm: () => void
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Você tem certeza que deseja excluir o corretor <strong>{corretorNome}</strong>?</p>
          <p className="text-sm text-muted-foreground mt-2">
            Esta ação desativará o corretor no sistema. Os dados históricos serão mantidos, mas ele não poderá mais acessar o sistema.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir Corretor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CorretoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modais
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCorretorId, setSelectedCorretorId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [corretorToDelete, setCorretorToDelete] = useState<{id: string, nome: string} | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [corretorToEdit, setCorretorToEdit] = useState<any>(null);
  
  // Usando o toast do sonner diretamente

  useEffect(() => {
    // Carregar corretores da API
    setLoading(true);
    setError(null);
    
    fetch('/api/imobiliaria/corretores')
      .then(res => {
        if (!res.ok) throw new Error("Falha ao carregar dados");
        return res.json();
      })
      .then(data => {
        // Adicionar dados fictícios para demonstração da interface
        const corretoresEnriquecidos = data.map((corretor: Corretor) => ({
          ...corretor,
          imoveisFechados: Math.floor(Math.random() * 15), // Valor fictício para demonstração
          avaliacoes: Math.floor(Math.random() * 30), // Valor fictício para demonstração
          avaliacaoMedia: Math.random() * 2 + 3, // Valor entre 3 e 5
          desempenhoMensal: Array(6).fill(0).map(() => Math.floor(Math.random() * 5)) // Dados fictícios para o gráfico
        }));
        
        setCorretores(corretoresEnriquecidos);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar corretores:", err);
        setError("Não foi possível carregar os corretores. Tente novamente.");
        setLoading(false);
      });
  }, []);

  // Filtrar corretores com base na busca e aba ativa
  const filteredCorretores = corretores.filter(corretor => {
    let matchesTab = true;
    
    if (activeTab === 'ativos') {
      matchesTab = corretor.status === "ATIVO";
    } else if (activeTab === 'inativos') {
      matchesTab = corretor.status === "INATIVO" || corretor.status === "BLOQUEADO" || corretor.status === "PENDENTE";
    }
    
    const matchesSearch = 
      corretor.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      corretor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (corretor.creci && corretor.creci.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Manipulador para abrir o modal de detalhes
  const handleViewCorretor = (id: string) => {
    setSelectedCorretorId(id);
    setDetailsModalOpen(true);
  };

  // Manipulador para abrir o modal de edição
  const handleEditCorretor = (corretor: any) => {
    setCorretorToEdit(corretor);
    setEditModalOpen(true);
    // Se estamos editando a partir do modal de detalhes, fechamos ele
    if (detailsModalOpen) {
      setDetailsModalOpen(false);
    }
  };

  // Manipulador para abrir o modal de exclusão
  const handleDeleteClick = (corretor: {id: string, nome: string}) => {
    setCorretorToDelete(corretor);
    setDeleteModalOpen(true);
  };

  // Manipulador para confirmar a exclusão
  const handleConfirmDelete = () => {
    if (!corretorToDelete) return;
    
    fetch(`/api/imobiliaria/corretores/${corretorToDelete.id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error("Falha ao excluir corretor");
        return res.json();
      })
      .then(data => {
        // Atualizar a lista de corretores
        setCorretores(prevCorretores => 
          prevCorretores.map(c => 
            c.id === corretorToDelete.id ? {...c, status: "INATIVO" as StatusUser} : c
          )
        );
        
        toast.success("Corretor excluído", {
          description: `${corretorToDelete.nome} foi desativado com sucesso.`
        });
        
        setDeleteModalOpen(false);
        setCorretorToDelete(null);
        // Se estamos excluindo a partir do modal de detalhes, fechamos ele
        if (detailsModalOpen) {
          setDetailsModalOpen(false);
        }
      })
      .catch(err => {
        console.error("Erro ao excluir corretor:", err);
        toast.error("Erro ao excluir", {
          description: "Não foi possível excluir o corretor. Tente novamente."
        });
      });
  };

  // Manipulador para salvar as alterações do corretor
  const handleSaveCorretor = (formData: any) => {
    if (!corretorToEdit) return;
    
    fetch(`/api/imobiliaria/corretores/${corretorToEdit.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("Falha ao atualizar corretor");
        return res.json();
      })
      .then(data => {
        // Atualizar a lista de corretores com os novos dados
        setCorretores(prevCorretores => 
          prevCorretores.map(c => 
            c.id === corretorToEdit.id ? {
              ...c,
              nome: formData.nome,
              email: formData.email,
              telefone: formData.telefone || "",
              creci: formData.creci || "",
              endereco: formData.endereco,
              cidade: formData.cidade,
              estado: formData.estado,
              status: formData.status as StatusUser
            } : c
          )
        );
        
        toast.success("Corretor atualizado", {
          description: `Dados de ${formData.nome} foram atualizados com sucesso.`
        });
        
        setEditModalOpen(false);
        setCorretorToEdit(null);
      })
      .catch(err => {
        console.error("Erro ao atualizar corretor:", err);
        toast.error("Erro ao atualizar", {
          description: "Não foi possível atualizar os dados do corretor. Tente novamente."
        });
      });
  };

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
            placeholder="Buscar por nome, e-mail ou CRECI..."
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
        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent opacity-80" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Corretores</p>
                <h3 className="text-2xl font-bold mt-1">{corretores.filter(c => c.status === "ATIVO").length}</h3>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-500/10 to-transparent opacity-80" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Imóveis Gerenciados</p>
                <h3 className="text-2xl font-bold mt-1">{corretores.reduce((total, c) => total + c.imoveisAtivos, 0)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Fechados: {corretores.reduce((total, c) => total + (c.imoveisFechados || 0), 0)}</p>
              </div>
              <div className="bg-green-500/10 p-2 rounded-full">
                <Building2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent opacity-80" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Corretores Ativos</p>
                <h3 className="text-2xl font-bold mt-1">{corretores.filter(c => c.status === "ATIVO").length}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs text-muted-foreground">Média de avaliações: {(corretores.reduce((total, c) => total + (c.avaliacaoMedia || 0), 0) / corretores.length).toFixed(1)}</span>
                </div>
              </div>
              <div className="bg-amber-500/10 p-2 rounded-full">
                <Activity className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent opacity-80" />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Corretores Inativos</p>
                <h3 className="text-2xl font-bold mt-1">{corretores.filter(c => c.status !== "ATIVO").length}</h3>
                <p className="text-xs text-muted-foreground mt-1">Total imóveis: {corretores.filter(c => c.status !== "ATIVO").reduce((total, c) => total + (c.imoveisFechados || 0) + c.imoveisAtivos, 0)}</p>
              </div>
              <div className="bg-purple-500/10 p-2 rounded-full">
                <Briefcase className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading state */}
      {loading && (
        <Card className="w-full">
          <CardContent className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <h3 className="text-lg font-medium">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      )}

      {/* Abas e conteúdo principal */}
      {!loading && !error && (
        <Tabs defaultValue="todos" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="ativos">Ativos</TabsTrigger>
            <TabsTrigger value="inativos">Inativos</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-6">
            {/* Lista de corretores */}
            <Card>
              <CardContent className="p-0">
                {filteredCorretores.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Corretor</TableHead>
                        <TableHead>CRECI</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Imóveis Ativos</TableHead>
                        <TableHead>Imóveis Fechados</TableHead>
                        <TableHead>Avaliações</TableHead>
                        <TableHead>Desempenho</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCorretores.map((corretor) => (
                        <TableRow key={corretor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-muted">
                                {corretor.fotoPerfil && (
                                  <img 
                                    src={corretor.fotoPerfil} 
                                    alt={corretor.nome} 
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{corretor.nome}</div>
                                <div className="text-xs text-muted-foreground">{corretor.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{corretor.creci || "Não informado"}</TableCell>
                          <TableCell>
                            {corretor.cidade && corretor.estado 
                              ? `${corretor.cidade}/${corretor.estado}` 
                              : "Não informado"}
                          </TableCell>
                          <TableCell>{corretor.imoveisAtivos}</TableCell>
                          <TableCell>{corretor.imoveisFechados || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {corretor.avaliacaoMedia ? (
                                <>
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  <span>{corretor.avaliacaoMedia.toFixed(1)}</span>
                                </>  
                              ) : (
                                <span className="text-muted-foreground text-sm">Sem avaliações</span>
                              )}
                              {corretor.avaliacoes ? <span className="text-xs text-muted-foreground">({corretor.avaliacoes})</span> : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            {corretor.desempenhoMensal ? (
                              <SparklineChart data={corretor.desempenhoMensal} />
                            ) : (
                              <SparklineChart data={[0, 0, 1, 2, 3, 2, 4]} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={corretor.status === "ATIVO" ? "default" : "secondary"}>
                              {corretor.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewCorretor(corretor.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditCorretor(corretor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteClick({ id: corretor.id, nome: corretor.nome })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum corretor encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-1">Não existem corretores cadastrados ou que correspondam aos critérios de busca.</p>
                  </div>
                )}
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
            {/* Lista de corretores ativos */}
            <Card>
              <CardContent className="p-0">
                {filteredCorretores.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Corretor</TableHead>
                        <TableHead>CRECI</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Imóveis Ativos</TableHead>
                        <TableHead>Imóveis Fechados</TableHead>
                        <TableHead>Avaliações</TableHead>
                        <TableHead>Desempenho</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCorretores.map((corretor) => (
                        <TableRow key={corretor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-muted">
                                {corretor.fotoPerfil && (
                                  <img 
                                    src={corretor.fotoPerfil} 
                                    alt={corretor.nome} 
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{corretor.nome}</div>
                                <div className="text-xs text-muted-foreground">{corretor.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{corretor.creci || "Não informado"}</TableCell>
                          <TableCell>
                            {corretor.cidade && corretor.estado 
                              ? `${corretor.cidade}/${corretor.estado}` 
                              : "Não informado"}
                          </TableCell>
                          <TableCell>{corretor.imoveisAtivos}</TableCell>
                          <TableCell>{corretor.imoveisFechados || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {corretor.avaliacaoMedia ? (
                                <>
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  <span>{corretor.avaliacaoMedia.toFixed(1)}</span>
                                </>  
                              ) : (
                                <span className="text-muted-foreground text-sm">Sem avaliações</span>
                              )}
                              {corretor.avaliacoes ? <span className="text-xs text-muted-foreground">({corretor.avaliacoes})</span> : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            {corretor.desempenhoMensal ? (
                              <SparklineChart data={corretor.desempenhoMensal} />
                            ) : (
                              <SparklineChart data={[0, 0, 1, 2, 3, 2, 4]} />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewCorretor(corretor.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditCorretor(corretor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteClick({ id: corretor.id, nome: corretor.nome })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum corretor ativo encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-1">Adicione novos corretores ou altere o status dos existentes.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inativos" className="space-y-6">
            {/* Lista de corretores inativos */}
            <Card>
              <CardContent className="p-0">
                {filteredCorretores.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Corretor</TableHead>
                        <TableHead>CRECI</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead>Imóveis Fechados</TableHead>
                        <TableHead>Avaliações</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCorretores.map((corretor) => (
                        <TableRow key={corretor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-muted">
                                {corretor.fotoPerfil && (
                                  <img 
                                    src={corretor.fotoPerfil} 
                                    alt={corretor.nome} 
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{corretor.nome}</div>
                                <div className="text-xs text-muted-foreground">{corretor.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{corretor.creci || "Não informado"}</TableCell>
                          <TableCell>
                            {corretor.cidade && corretor.estado 
                              ? `${corretor.cidade}/${corretor.estado}` 
                              : "Não informado"}
                          </TableCell>
                          <TableCell>{corretor.imoveisFechados || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {corretor.avaliacaoMedia ? (
                                <>
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  <span>{corretor.avaliacaoMedia.toFixed(1)}</span>
                                </>  
                              ) : (
                                <span className="text-muted-foreground text-sm">Sem avaliações</span>
                              )}
                              {corretor.avaliacoes ? <span className="text-xs text-muted-foreground">({corretor.avaliacoes})</span> : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={corretor.status === "ATIVO" ? "default" : "secondary"}>
                              {corretor.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleViewCorretor(corretor.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                Reativar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhum corretor inativo encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-1">Todos os seus corretores estão ativos no momento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Modal de detalhes do corretor */}
      <CorretorDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        corretorId={selectedCorretorId}
        onEditClick={handleEditCorretor}
        onDeleteClick={handleDeleteClick}
      />

      {/* Modal de edição de corretor */}
      <CorretorEditModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        corretor={corretorToEdit}
        onSave={handleSaveCorretor}
      />

      {/* Modal de confirmação de exclusão */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        corretorId={corretorToDelete?.id || null}
        corretorNome={corretorToDelete?.nome || null}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}