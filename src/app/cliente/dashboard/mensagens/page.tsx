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
import { Separator } from '@/components/ui/separator';
import {
  Search,
  User,
  MessagesSquare,
  Send,
  PlusCircle,
  Image,
  Paperclip,
  MoreHorizontal,
  Phone,
  Video,
  FileText,
  Archive,
  Clock,
  Star,
  Check,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Dados fictícios para simulação
const conversas = [
  {
    id: 1,
    usuario: {
      nome: 'Carlos Oliveira',
      avatar: '',
      cargo: 'Corretor',
      empresa: 'Paulo Imóveis',
      online: true
    },
    ultimaMensagem: {
      texto: 'Olá! Temos novidades sobre seu processo de compra do apartamento. Podemos conversar?',
      data: '10:32',
      enviada: false,
      lida: true
    },
    naoLidas: 0,
    favorita: true,
    imovel: 'Apartamento Vila Madalena'
  },
  {
    id: 2,
    usuario: {
      nome: 'Mariana Santos',
      avatar: '',
      cargo: 'Consultora',
      empresa: 'Paulo Imóveis',
      online: false
    },
    ultimaMensagem: {
      texto: 'Os documentos que você enviou foram recebidos. Estamos analisando e em breve retornaremos.',
      data: 'Ontem',
      enviada: false,
      lida: false
    },
    naoLidas: 2,
    favorita: false,
    imovel: 'Comercial Brooklin'
  },
  {
    id: 3,
    usuario: {
      nome: 'Rogério Lima',
      avatar: '',
      cargo: 'Gerente',
      empresa: 'Paulo Imóveis',
      online: true
    },
    ultimaMensagem: {
      texto: 'Obrigado pelo contato! Para atendê-lo melhor, poderia me informar qual imóvel você tem interesse?',
      data: '12/06',
      enviada: false,
      lida: true
    },
    naoLidas: 0,
    favorita: false,
    imovel: 'Geral'
  },
  {
    id: 4,
    usuario: {
      nome: 'Suporte Técnico',
      avatar: '',
      cargo: 'Suporte',
      empresa: 'Paulo Imóveis',
      online: true
    },
    ultimaMensagem: {
      texto: 'Seu chamado #12345 sobre problemas no acesso ao portal foi resolvido. Por favor, verifique se está tudo correto.',
      data: '10/06',
      enviada: false,
      lida: true
    },
    naoLidas: 0,
    favorita: false,
    imovel: 'Suporte'
  },
  {
    id: 5,
    usuario: {
      nome: 'Administração',
      avatar: '',
      cargo: 'Admin',
      empresa: 'Paulo Imóveis',
      online: false
    },
    ultimaMensagem: {
      texto: 'Informamos que o boleto referente ao aluguel de Junho já está disponível no portal. Qualquer dúvida, estamos à disposição.',
      data: '08/06',
      enviada: false,
      lida: true
    },
    naoLidas: 0,
    favorita: true,
    imovel: 'Apartamento Consolação'
  }
];

// Mensagens da conversa ativa
const mensagensConversa = [
  {
    id: 101,
    usuario: 'Carlos Oliveira',
    texto: 'Olá! Tudo bem com você?',
    data: '10:15',
    enviada: false
  },
  {
    id: 102,
    usuario: 'Você',
    texto: 'Olá, Carlos! Tudo ótimo, e com você?',
    data: '10:16',
    enviada: true
  },
  {
    id: 103,
    usuario: 'Carlos Oliveira',
    texto: 'Estou bem, obrigado! Estou entrando em contato para informar que temos novidades sobre seu processo de compra do apartamento na Vila Madalena.',
    data: '10:18',
    enviada: false
  },
  {
    id: 104,
    usuario: 'Carlos Oliveira',
    texto: 'A proposta que você enviou foi aceita pelo vendedor! Precisamos agora dar continuidade ao processo com a documentação necessária.',
    data: '10:20',
    enviada: false
  },
  {
    id: 105,
    usuario: 'Você',
    texto: 'Que ótima notícia! Estou muito feliz com isso. Quais são os próximos passos?',
    data: '10:25',
    enviada: true
  },
  {
    id: 106,
    usuario: 'Carlos Oliveira',
    texto: 'Precisamos agendar uma reunião para assinatura do compromisso de compra e venda. Você tem disponibilidade esta semana?',
    data: '10:26',
    enviada: false
  },
  {
    id: 107,
    usuario: 'Você',
    texto: 'Sim, tenho disponibilidade. Pode ser na quinta-feira pela manhã?',
    data: '10:29',
    enviada: true
  },
  {
    id: 108,
    usuario: 'Carlos Oliveira',
    texto: 'Perfeito! Vou agendar para quinta-feira às 10h em nosso escritório. Enviarei por email a lista de documentos que você precisa trazer, ok?',
    data: '10:30',
    enviada: false
  },
  {
    id: 109,
    usuario: 'Carlos Oliveira',
    texto: 'Olá! Temos novidades sobre seu processo de compra do apartamento. Podemos conversar?',
    data: '10:32',
    enviada: false
  }
];

export default function MensagensClientePage() {
  const [conversaAtiva, setConversaAtiva] = useState<number | null>(1);
  const [filtro, setFiltro] = useState('todas');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [infoContatoAberto, setInfoContatoAberto] = useState(false);
  
  // Filtragem de conversas
  const conversasFiltradas = conversas.filter(conversa => {
    if (filtro === 'favoritas') return conversa.favorita;
    if (filtro === 'nao-lidas') return conversa.naoLidas > 0;
    return true;
  });
  
  // Conversa atual selecionada
  const conversaAtual = conversas.find(c => c.id === conversaAtiva);
  
  return (
    <PageContainer
      title="Mensagens"
      subtitle="Converse com corretores e suporte"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-240px)] min-h-[600px]">
        {/* Lista de conversas */}
        <Card className="md:col-span-4 flex flex-col">
          <CardHeader className="p-4 pb-2 space-y-2 flex-none">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Conversas</CardTitle>
              <Button variant="ghost" size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar conversas..."
                className="pl-8"
              />
            </div>
            
            <div className="flex overflow-auto pb-1 gap-1">
              <Button 
                variant={filtro === 'todas' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFiltro('todas')}
                className="flex-shrink-0"
              >
                Todas
              </Button>
              <Button 
                variant={filtro === 'nao-lidas' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFiltro('nao-lidas')}
                className="flex-shrink-0"
              >
                Não lidas
              </Button>
              <Button 
                variant={filtro === 'favoritas' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFiltro('favoritas')}
                className="flex-shrink-0"
              >
                Favoritas
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-2 pt-2">
                {conversasFiltradas.map((conversa) => (
                  <div 
                    key={conversa.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex gap-3 
                      ${conversaAtiva === conversa.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                    onClick={() => setConversaAtiva(conversa.id)}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {conversa.usuario.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversa.usuario.online && (
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">
                          {conversa.usuario.nome}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conversa.ultimaMensagem.data}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground truncate">
                        {conversa.ultimaMensagem.enviada && (
                          <span className="inline-flex items-center mr-1">
                            <Check className={`h-3 w-3 ${conversa.ultimaMensagem.lida ? 'text-blue-500' : ''}`} />
                          </span>
                        )}
                        {conversa.ultimaMensagem.texto}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-muted-foreground truncate">
                          {conversa.imovel}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {conversa.favorita && (
                            <Star className="h-3 w-3 fill-current text-amber-500" />
                          )}
                          {conversa.naoLidas > 0 && (
                            <Badge className="h-5 w-5 text-[10px] flex items-center justify-center rounded-full p-0">
                              {conversa.naoLidas}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Área de conversa */}
        {conversaAtiva ? (
          <Card className="md:col-span-8 flex flex-col">
            {/* Cabeçalho */}
            <CardHeader className="p-4 flex-none border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 mr-2">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conversaAtual?.usuario.nome.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-base flex items-center">
                      {conversaAtual?.usuario.nome}
                      {conversaAtual?.usuario.online && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {conversaAtual?.usuario.cargo} • {conversaAtual?.usuario.empresa}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  
                  <Sheet open={infoContatoAberto} onOpenChange={setInfoContatoAberto}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[300px] sm:w-[400px]">
                      <SheetHeader>
                        <SheetTitle>Informações do Contato</SheetTitle>
                      </SheetHeader>
                      <div className="py-6 flex flex-col items-center">
                        <Avatar className="h-20 w-20 mb-3">
                          <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                            {conversaAtual?.usuario.nome.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-medium">
                          {conversaAtual?.usuario.nome}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {conversaAtual?.usuario.cargo} • {conversaAtual?.usuario.empresa}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Ligar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-2" />
                            Vídeo
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Imóvel</h4>
                          <p className="text-sm">{conversaAtual?.imovel}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">E-mail</h4>
                          <p className="text-sm">contato@pauloimoveis.com.br</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Telefone</h4>
                          <p className="text-sm">(11) 99999-8888</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Opções</h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <Star className="h-4 w-4 mr-2" />
                              Adicionar aos favoritos
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar conversa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Adicionar aos favoritos
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar conversa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver documentos compartilhados
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            
            {/* Mensagens */}
            <CardContent className="p-0 flex-grow overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {mensagensConversa.map((mensagem) => (
                    <div 
                      key={mensagem.id} 
                      className={`flex ${mensagem.enviada ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`relative max-w-[80%] ${
                        mensagem.enviada 
                          ? 'bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                          : 'bg-muted rounded-tl-lg rounded-tr-lg rounded-br-lg'
                      } p-3`}>
                        {!mensagem.enviada && (
                          <div className="font-medium text-sm mb-1">
                            {mensagem.usuario}
                          </div>
                        )}
                        <p className="text-sm">{mensagem.texto}</p>
                        <div className={`text-xs mt-1 text-right ${
                          mensagem.enviada ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {mensagem.data}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            
            {/* Barra de composição */}
            <CardFooter className="p-4 flex-none border-t">
              <div className="flex items-center w-full gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Image className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="md:col-span-8 flex flex-col items-center justify-center p-6">
            <MessagesSquare className="h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-medium mb-2">Nenhuma conversa selecionada</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Selecione uma conversa da lista ou inicie uma nova para começar a se comunicar.
            </p>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
