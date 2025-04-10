'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  ExternalLink,
  Plus,
  Settings,
  RefreshCw,
  ChevronRight,
  Check,
  Clock,
  XCircle,
  AlertTriangle,
  CircleCheck,
  LinkIcon,
  ShieldCheck,
  Globe,
  CheckCircle,
  FileText,
  Database,
  Zap,
  Home,
  Mail,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';

// Dados de exemplo para as integrações
const integracoesData = [
  {
    id: '1',
    nome: 'ZAP Imóveis',
    slug: 'zap',
    logo: '/logos/zap.svg',
    descricao: 'Integração com o portal ZAP Imóveis',
    status: 'ativo',
    sincronizacao: {
      ultimaAtualizacao: '2h atrás',
      totalImoveis: 156,
      imoveisSincronizados: 156,
      erros: 0
    },
    categoria: 'portal',
    configurado: true
  },
  {
    id: '2',
    nome: 'VivaReal',
    slug: 'vivareal',
    logo: '/logos/vivareal.svg',
    descricao: 'Integração com o portal VivaReal',
    status: 'ativo',
    sincronizacao: {
      ultimaAtualizacao: '2h atrás',
      totalImoveis: 156,
      imoveisSincronizados: 142,
      erros: 14
    },
    categoria: 'portal',
    configurado: true
  },
  {
    id: '3',
    nome: 'OLX',
    slug: 'olx',
    logo: '/logos/olx.svg',
    descricao: 'Integração com o portal OLX',
    status: 'pendente',
    sincronizacao: {
      ultimaAtualizacao: 'Nunca sincronizado',
      totalImoveis: 0,
      imoveisSincronizados: 0,
      erros: 0
    },
    categoria: 'portal',
    configurado: false
  },
  {
    id: '4',
    nome: 'Email Marketing',
    slug: 'email',
    logo: '/logos/email.svg',
    descricao: 'Integração com sistema de email marketing',
    status: 'ativo',
    sincronizacao: {
      ultimaAtualizacao: '1d atrás',
      totalImoveis: null,
      imoveisSincronizados: null,
      erros: 0
    },
    categoria: 'marketing',
    configurado: true
  },
  {
    id: '5',
    nome: 'WhatsApp',
    slug: 'whatsapp',
    logo: '/logos/whatsapp.svg',
    descricao: 'Integração com API do WhatsApp Business',
    status: 'inativo',
    sincronizacao: {
      ultimaAtualizacao: '10d atrás',
      totalImoveis: null,
      imoveisSincronizados: null,
      erros: 0
    },
    categoria: 'comunicacao',
    configurado: true
  },
  {
    id: '6',
    nome: 'Instagram',
    slug: 'instagram',
    logo: '/logos/instagram.svg',
    descricao: 'Integração com Instagram para postagens automáticas',
    status: 'inativo',
    sincronizacao: {
      ultimaAtualizacao: 'Nunca sincronizado',
      totalImoveis: null,
      imoveisSincronizados: null,
      erros: 0
    },
    categoria: 'marketing',
    configurado: false
  },
  {
    id: '7',
    nome: 'API Personalizada',
    slug: 'api',
    logo: '/logos/api.svg',
    descricao: 'API para integrações externas',
    status: 'ativo',
    sincronizacao: {
      ultimaAtualizacao: 'Tempo real',
      totalImoveis: null,
      imoveisSincronizados: null,
      erros: 0
    },
    categoria: 'api',
    configurado: true
  }
];

// Categorias de integrações disponíveis
const categorias = [
  { id: 'todos', nome: 'Todos', icone: <Globe className="h-4 w-4" /> },
  { id: 'portal', nome: 'Portais', icone: <ExternalLink className="h-4 w-4" /> },
  { id: 'marketing', nome: 'Marketing', icone: <FileText className="h-4 w-4" /> },
  { id: 'comunicacao', nome: 'Comunicação', icone: <MessageSquare className="h-4 w-4" /> },
  { id: 'api', nome: 'APIs', icone: <Database className="h-4 w-4" /> }
];

// Componente de MessageSquare que faltava
function MessageSquare(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function IntegracoesPage() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  
  const integracoesFiltradas = 
    categoriaSelecionada === 'todos' 
      ? integracoesData 
      : integracoesData.filter(integracao => integracao.categoria === categoriaSelecionada);

  return (
    <PageContainer
      title="Integrações"
      subtitle="Gerencie as integrações do sistema com serviços externos"
    >
      {/* Categorias de integrações */}
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
        {categorias.map(categoria => (
          <Button
            key={categoria.id}
            variant={categoriaSelecionada === categoria.id ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => setCategoriaSelecionada(categoria.id)}
          >
            {categoria.icone}
            {categoria.nome}
          </Button>
        ))}
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            <h4 className="text-2xl font-bold">{integracoesData.length}</h4>
            <p className="text-sm text-muted-foreground">Total de Integrações</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-green-500/10 rounded-full p-3 mb-3">
              <CircleCheck className="h-5 w-5 text-green-500" />
            </div>
            <h4 className="text-2xl font-bold">
              {integracoesData.filter(i => i.status === 'ativo').length}
            </h4>
            <p className="text-sm text-muted-foreground">Integrações Ativas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-amber-500/10 rounded-full p-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <h4 className="text-2xl font-bold">
              {integracoesData.filter(i => i.status === 'pendente').length}
            </h4>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-red-500/10 rounded-full p-3 mb-3">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <h4 className="text-2xl font-bold">
              {integracoesData.reduce((total, integracao) => {
                return total + (integracao.sincronizacao.erros || 0);
              }, 0)}
            </h4>
            <p className="text-sm text-muted-foreground">Erros Detectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de integrações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integracoesFiltradas.map(integracao => (
          <Card 
            key={integracao.id} 
            className={cn(
              "overflow-hidden",
              integracao.status === 'pendente' && "border-amber-200 bg-amber-50/30 dark:bg-amber-900/10",
              integracao.status === 'inativo' && "border-muted bg-muted/30"
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge 
                  variant={
                    integracao.status === 'ativo' ? 'default' :
                    integracao.status === 'pendente' ? 'outline' : 'secondary'
                  }
                  className={cn(
                    integracao.status === 'ativo' && "bg-green-500",
                    integracao.status === 'pendente' && "bg-amber-500/10 text-amber-600 border-amber-200",
                    integracao.status === 'inativo' && "bg-muted text-muted-foreground"
                  )}
                >
                  {integracao.status === 'ativo' ? 'Ativo' : 
                   integracao.status === 'pendente' ? 'Pendente' : 'Inativo'}
                </Badge>
                
                <Switch
                  checked={integracao.status === 'ativo'}
                  disabled={integracao.status === 'pendente' && !integracao.configurado}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-md bg-muted">
                  {/* Placeholder para logo */}
                  {integracao.slug === 'zap' && <Zap className="h-6 w-6 text-green-500" />}
                  {integracao.slug === 'vivareal' && <Home className="h-6 w-6 text-blue-500" />}
                  {integracao.slug === 'olx' && <Globe className="h-6 w-6 text-purple-500" />}
                  {integracao.slug === 'email' && <Mail className="h-6 w-6 text-amber-500" />}
                  {integracao.slug === 'whatsapp' && <MessageSquare className="h-6 w-6 text-green-600" />}
                  {integracao.slug === 'instagram' && <Camera className="h-6 w-6 text-pink-500" />}
                  {integracao.slug === 'api' && <Database className="h-6 w-6 text-blue-500" />}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{integracao.nome}</h3>
                  <p className="text-sm text-muted-foreground">{integracao.descricao}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Última atualização</span>
                  </div>
                  <span className="font-medium">{integracao.sincronizacao.ultimaAtualizacao}</span>
                </div>
                
                {integracao.sincronizacao.totalImoveis !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso da sincronização</span>
                      <span className="font-medium">
                        {Math.round((integracao.sincronizacao.imoveisSincronizados / integracao.sincronizacao.totalImoveis) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(integracao.sincronizacao.imoveisSincronizados / integracao.sincronizacao.totalImoveis) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{integracao.sincronizacao.imoveisSincronizados} de {integracao.sincronizacao.totalImoveis} imóveis</span>
                      {integracao.sincronizacao.erros > 0 && (
                        <span className="text-red-500 flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> {integracao.sincronizacao.erros} erros
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-4 border-t">
              {integracao.configurado ? (
                <>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Button>
                </>
              ) : (
                <Button className="w-full gap-1">
                  <Plus className="h-4 w-4" />
                  Configurar Integração
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
        
        {/* Card para adicionar nova integração */}
        <Card className="flex flex-col justify-center items-center border-dashed p-6">
          <div className="text-center">
            <div className="mx-auto bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nova Integração</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Conecte o sistema a um novo serviço externo
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Integração
            </Button>
          </div>
        </Card>
      </div>

      {/* Seção de documentação */}
      <div className="mt-10">
        <h3 className="text-lg font-medium mb-4">Documentação de Integrações</h3>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Como configurar uma integração</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">
                Para configurar uma integração, siga os passos abaixo:
              </p>
              <ol className="text-sm space-y-2 pl-5 list-decimal">
                <li>Clique no botão "Configurar Integração" no card da integração desejada</li>
                <li>Preencha as informações de API solicitadas</li>
                <li>Configure as regras de sincronização</li>
                <li>Clique em "Salvar" para ativar a integração</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>API para desenvolvedores</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">
                Nossa API REST permite que você integre suas aplicações ao TappyImob.
              </p>
              <div className="bg-muted rounded-md p-4 mb-4 overflow-auto">
                <code className="text-xs">
                  https://api.tappyimob.com/v1/properties
                </code>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Ver documentação completa
              </Button>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>Resolvendo problemas comuns</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                Problemas comuns e suas soluções:
              </p>
              <ul className="text-sm space-y-2 pl-5 list-disc">
                <li>Erro de autenticação: verifique se suas credenciais estão atualizadas</li>
                <li>Sincronização incompleta: verifique as regras de filtro configuradas</li>
                <li>Atualizações não refletidas: force uma sincronização manual</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PageContainer>
  );
}
