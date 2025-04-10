'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter, Search, Edit, Eye, Trash2, Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function BlogPage() {
  const [selectedTab, setSelectedTab] = useState('todos');

  const posts = [
    { 
      id: '1', 
      titulo: 'Como encontrar o imóvel perfeito para você',
      slug: 'como-encontrar-imovel-perfeito',
      status: 'publicado',
      autor: 'Maria Silva',
      categoria: 'Dicas',
      dataCriacao: '15/02/2025',
      comentarios: 12,
      visitas: 845
    },
    { 
      id: '2', 
      titulo: 'Mercado imobiliário em 2025: tendências e previsões',
      slug: 'mercado-imobiliario-2025',
      status: 'publicado',
      autor: 'Carlos Santos',
      categoria: 'Mercado',
      dataCriacao: '01/03/2025',
      comentarios: 8,
      visitas: 732
    },
    { 
      id: '3', 
      titulo: 'Como financiar seu primeiro imóvel com as melhores taxas',
      slug: 'financiar-primeiro-imovel',
      status: 'rascunho',
      autor: 'Ana Oliveira',
      categoria: 'Financiamento',
      dataCriacao: '10/03/2025',
      comentarios: 0,
      visitas: 0
    },
    { 
      id: '4', 
      titulo: 'Decoração minimalista para apartamentos pequenos',
      slug: 'decoracao-minimalista',
      status: 'publicado',
      autor: 'Pedro Mendes',
      categoria: 'Decoração',
      dataCriacao: '28/02/2025',
      comentarios: 15,
      visitas: 605
    },
    { 
      id: '5', 
      titulo: 'Investimento em imóveis: guia para iniciantes',
      slug: 'investimento-imoveis-iniciantes',
      status: 'agendado',
      autor: 'Mariana Costa',
      categoria: 'Investimentos',
      dataCriacao: '05/03/2025',
      comentarios: 0,
      visitas: 0
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'publicado':
        return <Badge variant="success">Publicado</Badge>;
      case 'rascunho':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'agendado':
        return <Badge variant="secondary">Agendado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (selectedTab === 'publicados') return post.status === 'publicado';
    if (selectedTab === 'rascunhos') return post.status === 'rascunho';
    if (selectedTab === 'agendados') return post.status === 'agendado';
    return true; // todos
  });

  return (
    <PageContainer
      title="Blog"
      subtitle="Gerencie os artigos do blog"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar artigo..." 
              className="pl-8"
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
            <Plus className="h-4 w-4" />
            Novo Artigo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" className="mb-8" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="publicados">Publicados</TabsTrigger>
          <TabsTrigger value="rascunhos">Rascunhos</TabsTrigger>
          <TabsTrigger value="agendados">Agendados</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Interações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map(post => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.titulo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{post.autor.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {post.autor}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.categoria}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {post.dataCriacao}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{post.visitas}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{post.comentarios}</span>
                      </div>
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
