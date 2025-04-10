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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Filter,
  FileText,
  FilePlus,
  FolderPlus,
  MoreHorizontal,
  Download,
  FileUp,
  Clock,
  Calendar,
  User,
  Users,
  Home,
  Eye,
  Share2,
  Lock,
  CheckCircle2,
  FileCheck,
  PenLine,
  FileSignature,
  File,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FolderOpen,
  Trash2,
  Copy,
  ChevronRight,
  Building2
} from 'lucide-react';

// Dados fictícios para demonstração
const documentos = [
  {
    id: 'DOC001',
    nome: 'Contrato de Compra e Venda - Apartamento em Pinheiros',
    tipo: 'Contrato',
    categoria: 'Venda',
    formato: 'PDF',
    tamanho: '2.4 MB',
    dataModificacao: '2025-03-10',
    status: 'Assinado',
    cliente: 'Ricardo Almeida',
    imovel: 'Apartamento em Pinheiros',
    autor: 'Ana Santos'
  },
  {
    id: 'DOC002',
    nome: 'Procuração - Mariana Costa',
    tipo: 'Procuração',
    categoria: 'Documentação',
    formato: 'PDF',
    tamanho: '1.1 MB',
    dataModificacao: '2025-03-08',
    status: 'Assinado',
    cliente: 'Mariana Costa',
    imovel: 'Casa em Alphaville',
    autor: 'Carlos Silva'
  },
  {
    id: 'DOC003',
    nome: 'Laudo de Vistoria - Apartamento na Vila Mariana',
    tipo: 'Vistoria',
    categoria: 'Locação',
    formato: 'PDF',
    tamanho: '3.8 MB',
    dataModificacao: '2025-03-05',
    status: 'Finalizado',
    cliente: 'Fernanda Lima',
    imovel: 'Apartamento na Vila Mariana',
    autor: 'Marcos Oliveira'
  },
  {
    id: 'DOC004',
    nome: 'Minuta de Contrato - Sala Comercial',
    tipo: 'Contrato',
    categoria: 'Venda',
    formato: 'DOCX',
    tamanho: '0.9 MB',
    dataModificacao: '2025-03-12',
    status: 'Pendente',
    cliente: 'Paulo Mendes',
    imovel: 'Sala Comercial no Centro',
    autor: 'Juliana Costa'
  },
  {
    id: 'DOC005',
    nome: 'Certidão de Matrícula - Terreno em Alphaville',
    tipo: 'Certidão',
    categoria: 'Documentação',
    formato: 'PDF',
    tamanho: '1.5 MB',
    dataModificacao: '2025-03-03',
    status: 'Válido',
    cliente: 'João Silva',
    imovel: 'Terreno em Alphaville',
    autor: 'Roberto Almeida'
  },
  {
    id: 'DOC006',
    nome: 'Proposta de Compra - Cobertura Duplex',
    tipo: 'Proposta',
    categoria: 'Venda',
    formato: 'PDF',
    tamanho: '0.7 MB',
    dataModificacao: '2025-03-11',
    status: 'Aceito',
    cliente: 'Amanda Oliveira',
    imovel: 'Cobertura Duplex em Perdizes',
    autor: 'Ana Santos'
  },
  {
    id: 'DOC007',
    nome: 'IPTU 2025 - Casa em Moema',
    tipo: 'Imposto',
    categoria: 'Tributação',
    formato: 'PDF',
    tamanho: '0.5 MB',
    dataModificacao: '2025-02-28',
    status: 'Pago',
    cliente: 'Mariana Costa',
    imovel: 'Casa em Moema',
    autor: 'Sistema'
  },
  {
    id: 'DOC008',
    nome: 'Contrato de Exclusividade',
    tipo: 'Contrato',
    categoria: 'Administrativo',
    formato: 'PDF',
    tamanho: '1.0 MB',
    dataModificacao: '2025-03-01',
    status: 'Assinado',
    cliente: 'Renata Sousa',
    imovel: null,
    autor: 'Carlos Silva'
  },
  {
    id: 'DOC009',
    nome: 'Fotos - Apartamento em Pinheiros',
    tipo: 'Mídia',
    categoria: 'Marketing',
    formato: 'ZIP',
    tamanho: '25.3 MB',
    dataModificacao: '2025-03-07',
    status: 'Aprovado',
    cliente: null,
    imovel: 'Apartamento em Pinheiros',
    autor: 'Sistema'
  },
  {
    id: 'DOC010',
    nome: 'Declaração de Quitação - Fernanda Lima',
    tipo: 'Declaração',
    categoria: 'Financeiro',
    formato: 'PDF',
    tamanho: '0.6 MB',
    dataModificacao: '2025-03-09',
    status: 'Emitido',
    cliente: 'Fernanda Lima',
    imovel: 'Apartamento na Vila Mariana',
    autor: 'Marcos Oliveira'
  }
];

// Pastas e categorias
const pastas = [
  { 
    nome: 'Contratos', 
    descricao: 'Documentos contratuais', 
    quantidade: 32, 
    icone: FileSignature 
  },
  { 
    nome: 'Clientes', 
    descricao: 'Documentação de clientes', 
    quantidade: 48, 
    icone: Users 
  },
  { 
    nome: 'Imóveis', 
    descricao: 'Documentação de imóveis', 
    quantidade: 65, 
    icone: Building2 
  },
  { 
    nome: 'Financeiro', 
    descricao: 'Documentos financeiros', 
    quantidade: 27, 
    icone: FileText 
  },
  { 
    nome: 'Administrativo', 
    descricao: 'Documentos administrativos', 
    quantidade: 15, 
    icone: FileCheck 
  },
  { 
    nome: 'Marketing', 
    descricao: 'Materiais promocionais', 
    quantidade: 22, 
    icone: FileImage 
  }
];

// Modelos de documentos
const modelos = [
  {
    nome: 'Contrato de Compra e Venda',
    tipo: 'Contrato',
    downloads: 38,
    dataAtualizacao: '2025-01-15'
  },
  {
    nome: 'Contrato de Locação Residencial',
    tipo: 'Contrato',
    downloads: 45,
    dataAtualizacao: '2025-01-22'
  },
  {
    nome: 'Proposta de Compra',
    tipo: 'Proposta',
    downloads: 29,
    dataAtualizacao: '2025-02-05'
  },
  {
    nome: 'Laudo de Vistoria',
    tipo: 'Relatório',
    downloads: 32,
    dataAtualizacao: '2025-01-30'
  },
  {
    nome: 'Declaração de Quitação',
    tipo: 'Declaração',
    downloads: 18,
    dataAtualizacao: '2025-02-10'
  }
];

// Documentos assinados recentemente
const ultimasAssinaturas = [
  {
    documento: 'Contrato de Compra e Venda - Apartamento em Pinheiros',
    cliente: 'Ricardo Almeida',
    dataAssinatura: '2025-03-10',
    signatario: 'Cliente e Imobiliária'
  },
  {
    documento: 'Procuração - Mariana Costa',
    cliente: 'Mariana Costa',
    dataAssinatura: '2025-03-08',
    signatario: 'Cliente'
  },
  {
    documento: 'Contrato de Exclusividade',
    cliente: 'Renata Sousa',
    dataAssinatura: '2025-03-01',
    signatario: 'Cliente e Imobiliária'
  }
];

// Função para formatar data
const formatarData = (dataString) => {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

// Função para icone apropriado ao formato do arquivo
const getFileIcon = (formato) => {
  switch (formato) {
    case 'PDF':
      return <FileText className="h-4 w-4 text-red-500" />;
    case 'DOCX':
      return <FileText className="h-4 w-4" />;
    case 'XLSX':
      return <FileSpreadsheet className="h-4 w-4" />;
    case 'ZIP':
      return <FileArchive className="h-4 w-4" />;
    case 'JPG':
    case 'PNG':
      return <FileImage className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

// Cores para os status
const statusColors = {
  'Assinado': 'text-green-500 bg-green-500/10',
  'Pendente': 'text-amber-500 bg-amber-500/10',
  'Finalizado': 'text-blue-500 bg-blue-500/10',
  'Válido': 'text-green-500 bg-green-500/10',
  'Aceito': 'text-green-500 bg-green-500/10',
  'Pago': 'text-green-500 bg-green-500/10',
  'Aprovado': 'text-green-500 bg-green-500/10',
  'Emitido': 'text-blue-500 bg-blue-500/10',
  'Vencido': 'text-red-500 bg-red-500/10',
  'Recusado': 'text-red-500 bg-red-500/10'
};

export default function DocumentosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  
  // Filtra documentos com base na busca e na aba ativa
  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = 
      documento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (documento.cliente && documento.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (documento.imovel && documento.imovel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      documento.autor.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'contratos') {
      matchesTab = documento.tipo === 'Contrato';
    } else if (activeTab === 'vistorias') {
      matchesTab = documento.tipo === 'Vistoria';
    } else if (activeTab === 'pendentes') {
      matchesTab = documento.status === 'Pendente';
    } else if (activeTab === 'assinados') {
      matchesTab = documento.status === 'Assinado';
    }
    
    return matchesSearch && matchesTab;
  });
  
  return (
    <PageContainer
      title="Documentos"
      subtitle="Gerencie contratos, certidões e documentação dos clientes e imóveis"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel esquerdo - Pastas e modelos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de pastas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pastas</CardTitle>
              <CardDescription>
                Documentos organizados por categoria
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {pastas.map((pasta, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <pasta.icone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{pasta.nome}</div>
                        <div className="text-xs text-muted-foreground">{pasta.descricao}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{pasta.quantidade}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full gap-1">
                <FolderPlus className="h-4 w-4" />
                Nova Pasta
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de modelos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Modelos de Documentos</CardTitle>
              <CardDescription>
                Templates pré-formatados para uso
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {modelos.map((modelo, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-md hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{modelo.nome}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-xs">
                          {modelo.tipo}
                        </Badge>
                        <span>•</span>
                        <Download className="h-3 w-3" />
                        <span>{modelo.downloads} downloads</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full gap-1">
                <FilePlus className="h-4 w-4" />
                Criar Novo Modelo
              </Button>
            </CardFooter>
          </Card>
          
          {/* Card de assinaturas recentes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Assinados Recentemente</CardTitle>
              <CardDescription>
                Últimos documentos finalizados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {ultimasAssinaturas.map((assinatura, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-md hover:bg-muted/50">
                    <div className="bg-green-500/10 p-2 rounded-md h-fit">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1">{assinatura.documento}</div>
                      <div className="flex flex-col text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {assinatura.cliente}
                        </span>
                        <span className="flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {formatarData(assinatura.dataAssinatura)}
                        </span>
                        <span className="flex items-center gap-1 mt-0.5">
                          <PenLine className="h-3 w-3" />
                          {assinatura.signatario}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Painel direito - Lista de documentos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cabeçalho com pesquisa e botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar documentos..."
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
              <Button variant="outline" className="gap-1">
                <FileUp className="h-4 w-4" />
                Importar
              </Button>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Novo Documento
              </Button>
            </div>
          </div>
          
          {/* Abas e tabela de documentos */}
          <Tabs defaultValue="todos" className="space-y-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="contratos">Contratos</TabsTrigger>
              <TabsTrigger value="vistorias">Vistorias</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              <TabsTrigger value="assinados">Assinados</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocumentos.length > 0 ? (
                        filteredDocumentos.map((documento) => (
                          <TableRow key={documento.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getFileIcon(documento.formato)}
                                <div>
                                  <div className="font-medium">{documento.nome}</div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {documento.tipo}
                                    </Badge>
                                    <span>•</span>
                                    <span>{documento.tamanho}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {documento.categoria}
                            </TableCell>
                            <TableCell>
                              {documento.cliente ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">
                                      {documento.cliente.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{documento.cliente}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {formatarData(documento.dataModificacao)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline" 
                                className={statusColors[documento.status]}
                              >
                                {documento.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <FileText className="h-8 w-8 mb-2" />
                              <p>Nenhum documento encontrado</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Card de documentos recentes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Documentos Recentes</CardTitle>
              <CardDescription>
                Últimos documentos alterados ou criados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentos.slice(0, 4).map((doc, index) => (
                  <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.formato)}
                        <div>
                          <div className="font-medium line-clamp-1">{doc.nome}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Modificado em {formatarData(doc.dataModificacao)}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-center">
              <Button variant="outline" className="gap-1">
                <FolderOpen className="h-4 w-4" />
                Ver Todos os Documentos
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
