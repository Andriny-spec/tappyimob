'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter, Search, Edit, Eye, Trash2, Globe, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PaginasPage() {
  const [selectedTab, setSelectedTab] = useState('todas');

  const paginas = [
    { 
      id: '1', 
      titulo: 'Página Inicial',
      slug: 'home',
      status: 'publicada',
      autor: 'Admin',
      dataCriacao: '15/01/2025',
      dataAtualizacao: '05/03/2025',
      visitas: 1450
    },
    { 
      id: '2', 
      titulo: 'Sobre Nós',
      slug: 'sobre',
      status: 'publicada',
      autor: 'Admin',
      dataCriacao: '20/01/2025',
      dataAtualizacao: '20/02/2025',
      visitas: 685
    },
    { 
      id: '3', 
      titulo: 'Termos de Serviço',
      slug: 'termos',
      status: 'publicada',
      autor: 'Admin',
      dataCriacao: '01/02/2025',
      dataAtualizacao: '01/02/2025',
      visitas: 320
    },
    { 
      id: '4', 
      titulo: 'Política de Privacidade',
      slug: 'privacidade',
      status: 'publicada',
      autor: 'Admin',
      dataCriacao: '01/02/2025',
      dataAtualizacao: '10/02/2025',
      visitas: 290
    },
    { 
      id: '5', 
      titulo: 'Contato',
      slug: 'contato',
      status: 'rascunho',
      autor: 'Admin',
      dataCriacao: '10/03/2025',
      dataAtualizacao: '10/03/2025',
      visitas: 0
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'publicada':
        return <Badge variant="success">Publicada</Badge>;
      case 'rascunho':
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPaginas = paginas.filter(pagina => {
    if (selectedTab === 'publicadas') return pagina.status === 'publicada';
    if (selectedTab === 'rascunhos') return pagina.status === 'rascunho';
    return true; // todas
  });

  return (
    <PageContainer
      title="Páginas"
      subtitle="Gerencie as páginas estáticas do site"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar página..." 
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Página
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todas" className="mb-8" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="publicadas">Publicadas</TabsTrigger>
          <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Atualização</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPaginas.map(pagina => (
                <TableRow key={pagina.id}>
                  <TableCell className="font-medium">{pagina.titulo}</TableCell>
                  <TableCell className="text-muted-foreground">/{pagina.slug}</TableCell>
                  <TableCell>{getStatusBadge(pagina.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {pagina.dataAtualizacao}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {pagina.visitas}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
