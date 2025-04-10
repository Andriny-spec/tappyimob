'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter, Search } from 'lucide-react';
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

export default function AssinaturasPage() {
  const [selectedTab, setSelectedTab] = useState('todas');

  const assinaturas = [
    { 
      id: '1', 
      imobiliaria: 'Imobiliária Central',
      plano: 'Premium',
      valor: 'R$ 299,90',
      status: 'ativa',
      dataInicio: '10/01/2025',
      dataFim: '10/01/2026',
      metodo: 'Cartão de Crédito'
    },
    { 
      id: '2', 
      imobiliaria: 'Imóveis Express',
      plano: 'Pro',
      valor: 'R$ 199,90',
      status: 'ativa',
      dataInicio: '05/02/2025',
      dataFim: '05/02/2026',
      metodo: 'Boleto'
    },
    { 
      id: '3', 
      imobiliaria: 'Casa Bela Imóveis',
      plano: 'Premium',
      valor: 'R$ 299,90',
      status: 'pendente',
      dataInicio: '20/02/2025',
      dataFim: '20/02/2026',
      metodo: 'PIX'
    },
    { 
      id: '4', 
      imobiliaria: 'Grupo Habitar',
      plano: 'Basic',
      valor: 'R$ 99,90',
      status: 'cancelada',
      dataInicio: '15/12/2024',
      dataFim: '15/12/2025',
      metodo: 'Boleto'
    },
    { 
      id: '5', 
      imobiliaria: 'Nova Era Imóveis',
      plano: 'Pro',
      valor: 'R$ 199,90',
      status: 'ativa',
      dataInicio: '01/03/2025',
      dataFim: '01/03/2026',
      metodo: 'Cartão de Crédito'
    },
  ];

  return (
    <PageContainer
      title="Assinaturas"
      subtitle="Gerenciamento de todas as assinaturas do sistema"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Buscar assinatura..." 
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
            Nova Assinatura
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todas" className="space-y-4" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="ativas">Ativas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Lista de Assinaturas</CardTitle>
              <CardDescription>
                Total de assinaturas: {assinaturas.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imobiliária</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de início</TableHead>
                    <TableHead>Data de término</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assinaturas.map((assinatura) => (
                    <TableRow key={assinatura.id}>
                      <TableCell className="font-medium">{assinatura.imobiliaria}</TableCell>
                      <TableCell>{assinatura.plano}</TableCell>
                      <TableCell>{assinatura.valor}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            assinatura.status === 'ativa' ? 'default' :
                            assinatura.status === 'pendente' ? 'outline' : 'destructive'
                          }
                        >
                          {assinatura.status.charAt(0).toUpperCase() + assinatura.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{assinatura.dataInicio}</TableCell>
                      <TableCell>{assinatura.dataFim}</TableCell>
                      <TableCell>{assinatura.metodo}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Detalhes</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando 1-{assinaturas.length} de {assinaturas.length} assinaturas
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
              <CardTitle>Assinaturas Ativas</CardTitle>
              <CardDescription>
                Total de assinaturas ativas: {assinaturas.filter(a => a.status === 'ativa').length}
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
              <CardTitle>Assinaturas Pendentes</CardTitle>
              <CardDescription>
                Total de assinaturas pendentes: {assinaturas.filter(a => a.status === 'pendente').length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Conteúdo semelhante ao da aba "Todas", mas filtrado */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canceladas" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Assinaturas Canceladas</CardTitle>
              <CardDescription>
                Total de assinaturas canceladas: {assinaturas.filter(a => a.status === 'cancelada').length}
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
