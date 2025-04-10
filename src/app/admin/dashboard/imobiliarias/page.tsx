'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter, Search, MapPin, Phone, Mail, ExternalLink, MoreHorizontal, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ImobiliariasPage() {
  const [selectedTab, setSelectedTab] = useState('todas');

  const imobiliarias = [
    { 
      id: '1', 
      nome: 'Imobiliária Central',
      logo: '/imagens/logo-central.png',
      cidade: 'São Paulo, SP',
      corretores: 24,
      plano: 'Premium',
      dataIngresso: '10/01/2025',
      status: 'ativa',
      contato: {
        telefone: '(11) 98765-4321',
        email: 'contato@central.com.br'
      }
    },
    { 
      id: '2', 
      nome: 'Imóveis Express',
      logo: '',
      cidade: 'Rio de Janeiro, RJ',
      corretores: 15,
      plano: 'Pro',
      dataIngresso: '05/02/2025',
      status: 'ativa',
      contato: {
        telefone: '(21) 98765-4321',
        email: 'contato@express.com.br'
      }
    },
    { 
      id: '3', 
      nome: 'Casa Bela Imóveis',
      logo: '',
      cidade: 'Belo Horizonte, MG',
      corretores: 12,
      plano: 'Premium',
      dataIngresso: '20/02/2025',
      status: 'pendente',
      contato: {
        telefone: '(31) 98765-4321',
        email: 'contato@casabela.com.br'
      }
    },
    { 
      id: '4', 
      nome: 'Grupo Habitar',
      logo: '',
      cidade: 'Curitiba, PR',
      corretores: 8,
      plano: 'Basic',
      dataIngresso: '15/12/2024',
      status: 'inativa',
      contato: {
        telefone: '(41) 98765-4321',
        email: 'contato@habitar.com.br'
      }
    },
    { 
      id: '5', 
      nome: 'Nova Era Imóveis',
      logo: '',
      cidade: 'Porto Alegre, RS',
      corretores: 18,
      plano: 'Pro',
      dataIngresso: '01/03/2025',
      status: 'ativa',
      contato: {
        telefone: '(51) 98765-4321',
        email: 'contato@novaera.com.br'
      }
    },
  ];

  return (
    <PageContainer
      title="Imobiliárias"
      subtitle="Gerenciamento de imobiliárias cadastradas no sistema"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Buscar imobiliária..." 
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
            <Plus className="h-4 w-4" />
            Nova Imobiliária
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todas" className="space-y-4" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="ativas">Ativas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="inativas">Inativas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Lista de Imobiliárias</CardTitle>
              <CardDescription>
                Total de imobiliárias: {imobiliarias.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imobiliária</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Corretores</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Ingresso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imobiliarias.map((imobiliaria) => (
                    <TableRow key={imobiliaria.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {imobiliaria.logo ? (
                              <AvatarImage src={imobiliaria.logo} alt={imobiliaria.nome} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {imobiliaria.nome.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{imobiliaria.nome}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{imobiliaria.contato.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{imobiliaria.cidade}</span>
                        </div>
                      </TableCell>
                      <TableCell>{imobiliaria.corretores}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            imobiliaria.plano === 'Premium' ? 'default' :
                            imobiliaria.plano === 'Pro' ? 'secondary' : 'outline'
                          }
                          className={
                            imobiliaria.plano === 'Premium' ? 'bg-primary/90' : ''
                          }
                        >
                          {imobiliaria.plano}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            imobiliaria.status === 'ativa' ? 'default' :
                            imobiliaria.status === 'pendente' ? 'outline' : 'destructive'
                          }
                          className={
                            imobiliaria.status === 'ativa' ? 'bg-green-500' :
                            imobiliaria.status === 'pendente' ? 'text-amber-500 border-amber-200' :
                            'bg-red-400'
                          }
                        >
                          {imobiliaria.status.charAt(0).toUpperCase() + imobiliaria.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{imobiliaria.dataIngresso}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1">
                          Detalhes
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando 1-{imobiliarias.length} de {imobiliarias.length} imobiliárias
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Anterior</Button>
                <Button variant="outline" size="sm" disabled>Próxima</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ativas" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Imobiliárias Ativas</CardTitle>
              <CardDescription>
                Total de imobiliárias ativas: {imobiliarias.filter(a => a.status === 'ativa').length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Conteúdo semelhante ao da aba "Todas", mas filtrado */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Imobiliárias Pendentes</CardTitle>
              <CardDescription>
                Total de imobiliárias pendentes: {imobiliarias.filter(a => a.status === 'pendente').length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Conteúdo semelhante ao da aba "Todas", mas filtrado */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inativas" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Imobiliárias Inativas</CardTitle>
              <CardDescription>
                Total de imobiliárias inativas: {imobiliarias.filter(a => a.status === 'inativa').length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Conteúdo semelhante ao da aba "Todas", mas filtrado */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
