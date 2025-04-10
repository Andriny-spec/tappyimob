'use client';

import React, { useState } from 'react';
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
  MessagesSquare,
  Search,
  SendHorizonal,
  Phone,
  Video,
  Paperclip,
  Image,
  Smile,
  Users,
  PenSquare,
  Clock,
  Star,
  Phone as PhoneIcon,
  Mail,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';

// Dados fictícios para demonstração
const conversas = [
  {
    id: 1,
    contato: {
      id: 101,
      nome: 'Roberto Silva',
      avatar: '/avatars/roberto.jpg',
      online: true,
      ultimoAcesso: 'Agora',
      telefone: '(11) 98765-4321',
      email: 'roberto.silva@email.com',
      tipo: 'cliente'
    },
    ultimaMensagem: {
      texto: 'Gostaria de agendar uma visita para o apartamento no Jardins',
      data: '10:25',
      lida: false,
      remetente: 'contato'
    },
    naolidas: 2
  },
  {
    id: 2,
    contato: {
      id: 102,
      nome: 'Carla Mendes',
      avatar: '/avatars/carla.jpg',
      online: false,
      ultimoAcesso: 'Há 35 min',
      telefone: '(11) 97654-3210',
      email: 'carla.mendes@email.com',
      tipo: 'lead'
    },
    ultimaMensagem: {
      texto: 'Obrigado pelas informações! Vou analisar e retorno em breve.',
      data: 'Ontem',
      lida: true,
      remetente: 'contato'
    },
    naolidas: 0
  },
  {
    id: 3,
    contato: {
      id: 103,
      nome: 'Paulo Santos',
      avatar: '',
      online: false,
      ultimoAcesso: 'Há 2h',
      telefone: '(11) 96543-2109',
      email: 'paulo.santos@empresa.com.br',
      tipo: 'lead'
    },
    ultimaMensagem: {
      texto: 'Enviei a proposta com os valores e condições conforme conversamos.',
      data: 'Ontem',
      lida: true,
      remetente: 'usuario'
    },
    naolidas: 0
  },
  {
    id: 4,
    contato: {
      id: 104,
      nome: 'Ana Costa',
      avatar: '/avatars/ana.jpg',
      online: true,
      ultimoAcesso: 'Agora',
      telefone: '(11) 95432-1098',
      email: 'ana.costa@email.com',
      tipo: 'cliente'
    },
    ultimaMensagem: {
      texto: 'Vamos agendar uma call para discutir os detalhes do contrato?',
      data: 'Seg',
      lida: true,
      remetente: 'contato'
    },
    naolidas: 0
  },
  {
    id: 5,
    contato: {
      id: 105,
      nome: 'Marcos Oliveira',
      avatar: '',
      online: false,
      ultimoAcesso: 'Há 1 dia',
      telefone: '(11) 94321-0987',
      email: 'marcos.oliveira@email.com',
      tipo: 'lead'
    },
    ultimaMensagem: {
      texto: 'Tem algum terreno na região do Campo Belo?',
      data: 'Seg',
      lida: true,
      remetente: 'contato'
    },
    naolidas: 0
  }
];

// Mensagens de exemplo para uma conversa específica
const mensagensConversa = [
  {
    id: 1,
    texto: 'Olá Roberto, tudo bem?',
    data: '10:15',
    remetente: 'usuario'
  },
  {
    id: 2,
    texto: 'Oi, tudo ótimo! E com você?',
    data: '10:17',
    remetente: 'contato'
  },
  {
    id: 3,
    texto: 'Estou bem, obrigado! Estou entrando em contato para saber se você ainda tem interesse no apartamento no Jardins que conversamos na semana passada.',
    data: '10:18',
    remetente: 'usuario'
  },
  {
    id: 4,
    texto: 'Sim, tenho sim! Inclusive estava pensando em agendar uma visita para ver pessoalmente.',
    data: '10:20',
    remetente: 'contato'
  },
  {
    id: 5,
    texto: 'Gostaria de agendar uma visita para o apartamento no Jardins',
    data: '10:25',
    remetente: 'contato'
  }
];

// Modelos de mensagens rápidas
const modelosMensagens = [
  "Olá! Como posso ajudá-lo na busca pelo seu imóvel ideal?",
  "Bom dia! Temos novidades sobre o imóvel que você demonstrou interesse.",
  "Confirmo nosso agendamento para visita ao imóvel. Estarei lá no horário combinado.",
  "Envio em anexo a proposta conforme conversamos. Fico à disposição para esclarecimentos.",
  "Obrigado pelo contato! Retornarei assim que tiver as informações solicitadas."
];

export default function MensagensCorretorPage() {
  const [busca, setBusca] = useState('');
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [conversaAtiva, setConversaAtiva] = useState(conversas[0]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  
  // Filtro de conversas
  const conversasFiltradas = conversas.filter(conversa => {
    // Filtro por busca
    const termoBusca = busca.toLowerCase();
    const matchBusca = busca === '' || 
      conversa.contato.nome.toLowerCase().includes(termoBusca) || 
      conversa.contato.email.toLowerCase().includes(termoBusca) ||
      conversa.ultimaMensagem.texto.toLowerCase().includes(termoBusca);
    
    // Filtro por tipo de contato
    const matchTipo = filtroTipo === 'todos' || conversa.contato.tipo === filtroTipo;
    
    return matchBusca && matchTipo;
  });
  
  const enviarMensagem = () => {
    if (mensagemAtual.trim() === '') return;
    
    // Aqui seria implementada a lógica para enviar a mensagem
    console.log('Enviando mensagem:', mensagemAtual);
    
    // Limpa o campo após enviar
    setMensagemAtual('');
  };
  
  const usarModeloMensagem = (modelo) => {
    setMensagemAtual(modelo);
  };
  
  return (
    <PageContainer
      title="Mensagens"
      subtitle="Comunique-se com seus clientes e leads"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
        {/* Lista de conversas */}
        <Card className="md:col-span-4 flex flex-col">
          <CardHeader className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle>Conversas</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PenSquare className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar conversa..."
                className="pl-8"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </CardHeader>
          
          <Tabs defaultValue="todos" onValueChange={setFiltroTipo} className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="todos" className="flex-1">Todos</TabsTrigger>
              <TabsTrigger value="cliente" className="flex-1">Clientes</TabsTrigger>
              <TabsTrigger value="lead" className="flex-1">Leads</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <CardContent className="flex-1 overflow-auto p-0">
            {conversasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <MessagesSquare className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-center text-muted-foreground">
                  Nenhuma conversa encontrada com os filtros selecionados.
                </p>
              </div>
            ) : (
              <div className="space-y-1 px-2 py-2">
                {conversasFiltradas.map((conversa) => (
                  <div 
                    key={conversa.id} 
                    className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                      conversaAtiva.id === conversa.id 
                        ? 'bg-primary/10' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setConversaAtiva(conversa)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversa.contato.avatar} alt={conversa.contato.nome} />
                        <AvatarFallback>{conversa.contato.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</AvatarFallback>
                      </Avatar>
                      {conversa.contato.online && (
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conversa.contato.nome}</p>
                        <p className="text-xs text-muted-foreground">{conversa.ultimaMensagem.data}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {conversa.ultimaMensagem.remetente === 'usuario' ? 'Você: ' : ''}
                          {conversa.ultimaMensagem.texto}
                        </p>
                        {conversa.naolidas > 0 && (
                          <Badge variant="default" className="ml-2 px-1.5 py-0.5 text-[10px]">
                            {conversa.naolidas}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Chat ativo */}
        <Card className="md:col-span-8 flex flex-col">
          {conversaAtiva ? (
            <>
              <CardHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={conversaAtiva.contato.avatar} alt={conversaAtiva.contato.nome} />
                    <AvatarFallback>{conversaAtiva.contato.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{conversaAtiva.contato.nome}</h3>
                      <Badge variant={conversaAtiva.contato.tipo === 'cliente' ? 'default' : 'secondary'} className="px-1.5 py-0 text-[10px]">
                        {conversaAtiva.contato.tipo === 'cliente' ? 'Cliente' : 'Lead'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conversaAtiva.contato.online ? 'Online' : `Último acesso: ${conversaAtiva.contato.ultimoAcesso}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {mensagensConversa.map((mensagem) => (
                  <div 
                    key={mensagem.id} 
                    className={`flex ${mensagem.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        mensagem.remetente === 'usuario' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{mensagem.texto}</p>
                      <p className={`text-xs mt-1 ${mensagem.remetente === 'usuario' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {mensagem.data}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              
              <div className="px-4 py-2 border-t">
                <div className="mb-2 flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
                  {modelosMensagens.map((modelo, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => usarModeloMensagem(modelo)}
                    >
                      {modelo.substring(0, 25)}{modelo.length > 25 ? '...' : ''}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Image className="h-4 w-4" />
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      placeholder="Digite sua mensagem..."
                      className="pr-10"
                      value={mensagemAtual}
                      onChange={(e) => setMensagemAtual(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    className="shrink-0" 
                    size="icon"
                    onClick={enviarMensagem}
                    disabled={mensagemAtual.trim() === ''}
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <MessagesSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma conversa selecionada</h3>
              <p className="text-center text-muted-foreground mb-4">
                Selecione uma conversa da lista ou inicie uma nova.
              </p>
              <Button>
                <PenSquare className="h-4 w-4 mr-2" />
                Nova Conversa
              </Button>
            </div>
          )}
        </Card>
      </div>
      
      <div className="mt-4">
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Contatos Recentes</CardTitle>
            <CardDescription>
              Clientes e leads com quem você interagiu recentemente
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {conversas.slice(0, 3).map((conversa) => (
                <Card key={conversa.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={conversa.contato.avatar} alt={conversa.contato.nome} />
                        <AvatarFallback>{conversa.contato.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium truncate">{conversa.contato.nome}</h4>
                          <Badge variant={conversa.contato.tipo === 'cliente' ? 'default' : 'secondary'} className="ml-2 px-1.5 py-0 text-[10px]">
                            {conversa.contato.tipo === 'cliente' ? 'Cliente' : 'Lead'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{conversa.contato.email}</p>
                      </div>
                    </div>
                    
                    <div className="px-4 py-2 bg-muted/40 flex flex-col">
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <PhoneIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>Último contato: {conversa.ultimaMensagem.data}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          Detalhes
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4">
            <Button variant="outline" className="w-full">
              Ver todos os contatos
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
