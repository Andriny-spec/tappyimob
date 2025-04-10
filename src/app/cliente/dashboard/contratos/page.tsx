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
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Building2,
  Calendar,
  Clock,
  User,
  Check,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

// Dados mockados para simulação
const contratos = [
  {
    id: 1,
    tipo: 'Aluguel',
    imovel: 'Apartamento Consolação',
    endereco: 'Rua Augusta, 789 - Consolação, São Paulo',
    numero: 'CON-2024-0123',
    dataInicio: '15/01/2024',
    dataFim: '15/01/2026',
    valorMensal: 'R$ 4.200,00',
    valorTotal: 'R$ 100.800,00',
    status: 'ativo',
    proximoVencimento: '15/06/2024',
    locador: 'Imobiliária Paulo Imóveis',
    assinaturaCliente: true,
    assinaturaLocador: true
  },
  {
    id: 2,
    tipo: 'Compra e Venda',
    imovel: 'Comercial Brooklin',
    endereco: 'Av. Berrini, 120 - Brooklin, São Paulo',
    numero: 'CVN-2024-0456',
    dataInicio: '02/06/2024',
    dataFim: 'Indefinido',
    valorMensal: 'N/A',
    valorTotal: 'R$ 820.000,00',
    status: 'pendente',
    proximoVencimento: 'N/A',
    locador: 'Maria Construtora',
    assinaturaCliente: true,
    assinaturaLocador: false
  },
  {
    id: 3,
    tipo: 'Administração',
    imovel: 'Casa Perdizes',
    endereco: 'Rua Cardoso de Almeida, 300 - Perdizes, São Paulo',
    numero: 'ADM-2023-0789',
    dataInicio: '05/11/2023',
    dataFim: '05/11/2025',
    valorMensal: 'R$ 450,00',
    valorTotal: 'R$ 10.800,00',
    status: 'ativo',
    proximoVencimento: '05/06/2024',
    locador: 'Imobiliária Paulo Imóveis',
    assinaturaCliente: true,
    assinaturaLocador: true
  }
];

// Documentos relacionados aos contratos
const documentos = [
  {
    id: 101,
    contrato: 1,
    nome: 'Contrato de Locação - Apartamento Consolação',
    tipo: 'Contrato',
    dataUpload: '15/01/2024',
    tamanho: '2.4 MB',
    status: 'assinado'
  },
  {
    id: 102,
    contrato: 1,
    nome: 'Laudo de Vistoria - Entrada',
    tipo: 'Vistoria',
    dataUpload: '16/01/2024',
    tamanho: '5.7 MB',
    status: 'assinado'
  },
  {
    id: 103,
    contrato: 1,
    nome: 'Comprovante de Pagamento - Caução',
    tipo: 'Financeiro',
    dataUpload: '14/01/2024',
    tamanho: '1.1 MB',
    status: 'verificado'
  },
  {
    id: 201,
    contrato: 2,
    nome: 'Contrato de Compra e Venda - Comercial Brooklin',
    tipo: 'Contrato',
    dataUpload: '02/06/2024',
    tamanho: '3.2 MB',
    status: 'pendente'
  },
  {
    id: 202,
    contrato: 2,
    nome: 'Matrícula do Imóvel',
    tipo: 'Registro',
    dataUpload: '01/06/2024',
    tamanho: '1.8 MB',
    status: 'verificado'
  },
  {
    id: 203,
    contrato: 2,
    nome: 'Comprovante de Sinal',
    tipo: 'Financeiro',
    dataUpload: '30/05/2024',
    tamanho: '0.9 MB',
    status: 'verificado'
  },
  {
    id: 301,
    contrato: 3,
    nome: 'Contrato de Administração - Casa Perdizes',
    tipo: 'Contrato',
    dataUpload: '05/11/2023',
    tamanho: '2.1 MB',
    status: 'assinado'
  }
];

export default function ContratosClientePage() {
  const [visualizacao, setVisualizacao] = useState('ativos');
  const [busca, setBusca] = useState('');
  const [contratoSelecionado, setContratoSelecionado] = useState<number | null>(null);
  const [modalDocumentoAberto, setModalDocumentoAberto] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<number | null>(null);
  
  // Filtro de contratos baseado na aba selecionada
  const contratosFiltrados = contratos.filter(contrato => {
    if (visualizacao === 'ativos') return contrato.status === 'ativo';
    if (visualizacao === 'pendentes') return contrato.status === 'pendente';
    if (visualizacao === 'encerrados') return contrato.status === 'encerrado';
    return true; // todos
  });
  
  // Documentos do contrato selecionado
  const documentosDoContrato = documentos.filter(
    doc => contratoSelecionado ? doc.contrato === contratoSelecionado : true
  );
  
  // Documento específico selecionado
  const documentoAtual = documentoSelecionado 
    ? documentos.find(doc => doc.id === documentoSelecionado) 
    : null;
  
  return (
    <PageContainer
      title="Contratos"
      subtitle="Gerencie seus contratos e documentos"
    >
      <div className="space-y-6">
        {/* Tabs principais */}
        <Tabs 
          value={visualizacao} 
          onValueChange={setVisualizacao}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <TabsList className="mb-0">
              <TabsTrigger value="ativos">Ativos</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              <TabsTrigger value="encerrados">Encerrados</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
            
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar contratos..."
                  className="pl-8"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Lista de contratos */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Contratos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Número</TableHead>
                    <TableHead className="w-[120px]">Tipo</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead className="w-[120px]">Data Início</TableHead>
                    <TableHead className="w-[120px]">Data Fim</TableHead>
                    <TableHead className="w-[120px]">Valor</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contratosFiltrados.length > 0 ? (
                    contratosFiltrados.map((contrato) => (
                      <TableRow key={contrato.id}>
                        <TableCell className="font-medium">{contrato.numero}</TableCell>
                        <TableCell>{contrato.tipo}</TableCell>
                        <TableCell>
                          <div>{contrato.imovel}</div>
                          <div className="text-xs text-muted-foreground">{contrato.endereco}</div>
                        </TableCell>
                        <TableCell>{contrato.dataInicio}</TableCell>
                        <TableCell>{contrato.dataFim}</TableCell>
                        <TableCell>
                          {contrato.tipo === 'Compra e Venda' ? (
                            contrato.valorTotal
                          ) : (
                            <div>
                              <div>{contrato.valorMensal}/mês</div>
                              <div className="text-xs text-muted-foreground">Total: {contrato.valorTotal}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              contrato.status === 'ativo' ? 'bg-green-500' :
                              contrato.status === 'pendente' ? 'bg-amber-500' :
                              'bg-slate-500'
                            }
                          >
                            {contrato.status === 'ativo' ? 'Ativo' :
                             contrato.status === 'pendente' ? 'Pendente' :
                             'Encerrado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setContratoSelecionado(contrato.id);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Documentos
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar Contrato
                                </DropdownMenuItem>
                                {contrato.status === 'pendente' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Check className="h-4 w-4 mr-2" />
                                      Assinar Contrato
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <HelpCircle className="h-4 w-4 mr-2" />
                                  Solicitar Ajuda
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-8 w-8 mb-2" />
                          <p>Nenhum contrato encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Documentos do contrato selecionado */}
          {contratoSelecionado && (
            <Card>
              <CardHeader className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      Documentos do Contrato {contratos.find(c => c.id === contratoSelecionado)?.numero}
                    </CardTitle>
                    <CardDescription>
                      {contratos.find(c => c.id === contratoSelecionado)?.imovel} - 
                      {contratos.find(c => c.id === contratoSelecionado)?.tipo}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setContratoSelecionado(null)}
                  >
                    Voltar aos Contratos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Documento</TableHead>
                      <TableHead className="w-[120px]">Tipo</TableHead>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead className="w-[100px]">Tamanho</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentosDoContrato.map((documento) => (
                      <TableRow key={documento.id}>
                        <TableCell className="font-medium">{documento.nome}</TableCell>
                        <TableCell>{documento.tipo}</TableCell>
                        <TableCell>{documento.dataUpload}</TableCell>
                        <TableCell>{documento.tamanho}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              documento.status === 'assinado' ? 'bg-green-500' :
                              documento.status === 'pendente' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }
                          >
                            {documento.status === 'assinado' ? 'Assinado' :
                             documento.status === 'pendente' ? 'Pendente' :
                             'Verificado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setDocumentoSelecionado(documento.id);
                                setModalDocumentoAberto(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Baixar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <Button className="w-full sm:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  Solicitar Novos Documentos
                </Button>
              </CardFooter>
            </Card>
          )}
        </Tabs>
        
        {/* Resumo de contratos */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Contratos Ativos</h3>
                  <div className="text-2xl font-bold">2</div>
                </div>
                <div className="bg-green-500/10 rounded-full p-3">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Todos os seus contratos ativos estão regulares.
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Contratos Pendentes</h3>
                  <div className="text-2xl font-bold">1</div>
                </div>
                <div className="bg-amber-500/10 rounded-full p-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Você tem 1 contrato aguardando assinatura.
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Próximo Vencimento</h3>
                  <div className="text-2xl font-bold">05/06/2024</div>
                </div>
                <div className="bg-blue-500/10 rounded-full p-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Pagamento da administração da Casa Perdizes.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modal para visualização de documento */}
      <Dialog open={modalDocumentoAberto} onOpenChange={setModalDocumentoAberto}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{documentoAtual?.nome}</DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="text-sm">Tipo: {documentoAtual?.tipo}</span>
                <span className="text-sm">Data: {documentoAtual?.dataUpload}</span>
                <span className="text-sm">Tamanho: {documentoAtual?.tamanho}</span>
                <Badge 
                  className={
                    documentoAtual?.status === 'assinado' ? 'bg-green-500' :
                    documentoAtual?.status === 'pendente' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }
                >
                  {documentoAtual?.status === 'assinado' ? 'Assinado' :
                   documentoAtual?.status === 'pendente' ? 'Pendente' :
                   'Verificado'}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-6 border rounded-md bg-muted/30 flex flex-col items-center justify-center min-h-[300px]">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Visualização do documento {documentoAtual?.nome}
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {documentoAtual?.status === 'pendente' && (
              <Button>
                <Check className="h-4 w-4 mr-2" />
                Assinar Documento
              </Button>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
