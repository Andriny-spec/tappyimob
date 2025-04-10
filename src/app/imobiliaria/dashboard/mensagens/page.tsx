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
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Search,
  Send,
  Filter,
  Phone,
  Video,
  MoreVertical,
  Clock,
  Paperclip,
  Image,
  Plus,
  ChevronRight,
  ArrowRight,
  Eye,
  MessageCircle,
  Users,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Dados fictícios para demonstração
const conversas = [
  {
    id: 1,
    nome: 'André Martins',
    avatar: '',
    ultimaMensagem: 'Olá, gostaria de agendar uma visita ao apartamento na Avenida Paulista.',
    horario: '10:45',
    naoLidas: 2,
    online: true,
    interesse: 'Apartamento 3 quartos',
    tipo: 'Comprador',
    mensagens: [
      {
        id: 1,
        remetente: 'cliente',
        texto: 'Olá, gostaria de obter mais informações sobre o apartamento na Av. Paulista.',
        horario: '2025-03-11T10:30:00',
        lida: true
      },
      {
        id: 2,
        remetente: 'corretor',
        texto: 'Olá André! Tudo bem? Claro, tenho várias opções na região da Av. Paulista. Você tem preferência por algum tamanho específico?',
        horario: '2025-03-11T10:35:00',
        lida: true
      },
      {
        id: 3,
        remetente: 'cliente',
        texto: 'Estou procurando um apartamento com 3 quartos, de preferência com uma suíte e uma vaga de garagem.',
        horario: '2025-03-11T10:40:00',
        lida: true
      },
      {
        id: 4,
        remetente: 'cliente',
        texto: 'Olá, gostaria de agendar uma visita ao apartamento na Avenida Paulista.',
        horario: '2025-03-12T10:45:00',
        lida: false
      }
    ]
  },
  {
    id: 2,
    nome: 'Mariana Costa',
    avatar: '',
    ultimaMensagem: 'Qual é o valor do condomínio da casa em Alphaville?',
    horario: '09:20',
    naoLidas: 0,
    online: false,
    interesse: 'Casa em condomínio',
    tipo: 'Comprador',
    mensagens: [
      {
        id: 1,
        remetente: 'cliente',
        texto: 'Boa tarde! Vi o anúncio da casa em Alphaville e estou interessada.',
        horario: '2025-03-10T15:10:00',
        lida: true
      },
      {
        id: 2,
        remetente: 'corretor',
        texto: 'Olá Mariana! Que ótimo! É uma excelente propriedade. Posso te enviar mais fotos e detalhes se desejar.',
        horario: '2025-03-10T15:15:00',
        lida: true
      },
      {
        id: 3,
        remetente: 'cliente',
        texto: 'Seria ótimo. E também gostaria de saber o valor do condomínio.',
        horario: '2025-03-10T15:20:00',
        lida: true
      },
      {
        id: 4,
        remetente: 'corretor',
        texto: 'Claro, o condomínio é de R$ 1.850,00 mensais. Inclui segurança 24h, área de lazer completa com piscina, academia e quadra poliesportiva.',
        horario: '2025-03-10T15:25:00',
        lida: true
      },
      {
        id: 5,
        remetente: 'cliente',
        texto: 'Qual é o valor do condomínio da casa em Alphaville?',
        horario: '2025-03-12T09:20:00',
        lida: true
      }
    ]
  },
  {
    id: 3,
    nome: 'Francisco Oliveira',
    avatar: '',
    ultimaMensagem: 'Perfeito, obrigado pelas informações.',
    horario: 'Ontem',
    naoLidas: 0,
    online: true,
    interesse: 'Apartamento para alugar',
    tipo: 'Locatário',
    mensagens: []
  },
  {
    id: 4,
    nome: 'Patricia Santos',
    avatar: '',
    ultimaMensagem: 'Gostaria de uma avaliação do meu apartamento.',
    horario: 'Ontem',
    naoLidas: 0,
    online: false,
    interesse: 'Vender apartamento',
    tipo: 'Proprietário',
    mensagens: []
  },
  {
    id: 5,
    nome: 'Ricardo Lima',
    avatar: '',
    ultimaMensagem: 'Podemos agendar para amanhã às 14h?',
    horario: 'Segunda',
    naoLidas: 0,
    online: false,
    interesse: 'Sala comercial',
    tipo: 'Comprador',
    mensagens: []
  },
  {
    id: 6,
    nome: 'Camila Rodrigues',
    avatar: '',
    ultimaMensagem: 'Recebi as fotos. O imóvel é lindo!',
    horario: 'Segunda',
    naoLidas: 1,
    online: false,
    interesse: 'Cobertura duplex',
    tipo: 'Comprador',
    mensagens: []
  }
];

// Respostas rápidas predefinidas
const respostasRapidas = [
  {
    titulo: 'Saudação',
    texto: 'Olá! Tudo bem? Como posso ajudar com sua busca por imóveis hoje?'
  },
  {
    titulo: 'Agendar visita',
    texto: 'Podemos agendar uma visita ao imóvel. Quais dias e horários seriam mais convenientes para você?'
  },
  {
    titulo: 'Enviar catálogo',
    texto: 'Tenho um catálogo com opções que podem te interessar. Posso enviar para você analisar com calma.'
  },
  {
    titulo: 'Solicitar documentos',
    texto: 'Para avançarmos no processo, precisaremos dos seguintes documentos: RG, CPF, comprovante de renda e comprovante de residência.'
  },
  {
    titulo: 'Agradecer contato',
    texto: 'Agradeço seu contato! Estou à disposição para ajudar em qualquer dúvida sobre o imóvel.'
  }
];

export default function MensagensPage() {
  const [conversaSelecionada, setConversaSelecionada] = useState<number | null>(1); // Inicialmente, seleciona a primeira conversa
  const [novaMensagem, setNovaMensagem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Encontra a conversa selecionada
  const conversa = conversas.find(c => c.id === conversaSelecionada);
  
  // Filtrar conversas baseado na busca
  const conversasFiltradas = conversas.filter(conversa => 
    conversa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversa.ultimaMensagem.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para formatar a hora
  const formatarHora = (dataString: string) => {
    if (dataString === 'Ontem' || dataString === 'Segunda') return dataString;
    
    try {
      const data = new Date(dataString);
      return data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dataString; // Retorna a string original se não for uma data válida
    }
  };

  // Função para formatar data completa
  const formatarDataCompleta = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return ''; // Retorna string vazia se não for uma data válida
    }
  };

  // Função para enviar mensagem
  const enviarMensagem = () => {
    if (novaMensagem.trim() && conversaSelecionada) {
      // Aqui você implementaria a lógica real para enviar a mensagem
      // e atualizar o estado das conversas
      console.log('Mensagem enviada:', novaMensagem);
      
      // Limpa o campo de mensagem
      setNovaMensagem('');
    }
  };

  // Função para selecionar uma resposta rápida
  const selecionarRespostaRapida = (texto: string) => {
    setNovaMensagem(texto);
  };

  return (
    <PageContainer
      title="Mensagens"
      subtitle="Gerencie suas conversas com clientes e potenciais compradores"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
        {/* Painel esquerdo - Lista de conversas */}
        <div className="md:col-span-1 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar contatos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Nova Conversa
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {conversasFiltradas.map((conversa) => (
              <div
                key={conversa.id}
                className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer border-b ${
                  conversaSelecionada === conversa.id ? 'bg-muted' : ''
                }`}
                onClick={() => setConversaSelecionada(conversa.id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>{conversa.nome.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  {conversa.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium truncate">{conversa.nome}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{conversa.horario}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversa.ultimaMensagem}</p>
                </div>
                {conversa.naoLidas > 0 && (
                  <Badge className="ml-auto" variant="default">
                    {conversa.naoLidas}
                  </Badge>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Painel de conversa - Mensagens */}
        <div className="md:col-span-2 lg:col-span-2 flex flex-col border rounded-lg overflow-hidden">
          {conversa ? (
            <>
              {/* Cabeçalho da conversa */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{conversa.nome.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{conversa.nome}</h3>
                      {conversa.online && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                          Online
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{conversa.interesse}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Área de mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversa.mensagens && conversa.mensagens.length > 0 ? (
                    conversa.mensagens.map((mensagem) => (
                      <div
                        key={mensagem.id}
                        className={`flex ${
                          mensagem.remetente === 'corretor' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            mensagem.remetente === 'corretor'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{mensagem.texto}</p>
                          <div
                            className={`text-xs mt-1 ${
                              mensagem.remetente === 'corretor'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatarHora(mensagem.horario)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium">Nenhuma mensagem</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Inicie uma conversa com {conversa.nome}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Área de digitação */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="min-h-[80px]"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          enviarMensagem();
                        }
                      }}
                    />
                    <div className="flex justify-between mt-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        onClick={enviarMensagem}
                        className="gap-1"
                        disabled={!novaMensagem.trim()}
                      >
                        <Send className="h-4 w-4" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Nenhuma conversa selecionada</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Selecione uma conversa para visualizar as mensagens
              </p>
              <Button>Nova conversa</Button>
            </div>
          )}
        </div>
        
        {/* Painel direito - Informações do cliente */}
        <div className="hidden lg:block lg:col-span-1">
          {conversa ? (
            <div className="border rounded-lg overflow-hidden h-full">
              <div className="p-4 border-b">
                <h3 className="font-medium">Detalhes do Contato</h3>
              </div>
              
              <ScrollArea className="h-[calc(100%-61px)] p-4">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-16 h-16 mb-3">
                    <AvatarFallback className="text-lg">{conversa.nome.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-medium">{conversa.nome}</h3>
                  <Badge className="mt-1">{conversa.tipo}</Badge>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Informações de Contato</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>(11) 98765-4321</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span>cliente@email.com</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Interesse</h4>
                    <p className="text-sm">{conversa.interesse}</p>
                    
                    <Button variant="outline" size="sm" className="gap-1 w-full">
                      <Eye className="h-4 w-4" />
                      Ver Imóveis Relacionados
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Respostas Rápidas</h4>
                    <div className="space-y-2">
                      {respostasRapidas.map((resposta, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start font-normal text-left h-auto py-2"
                          onClick={() => selecionarRespostaRapida(resposta.texto)}
                        >
                          <div className="truncate">
                            <span className="font-medium">{resposta.titulo}:</span>{' '}
                            <span className="text-muted-foreground">
                              {resposta.texto.length > 30
                                ? resposta.texto.substring(0, 30) + '...'
                                : resposta.texto}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Ações</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <User className="h-4 w-4" />
                        Perfil
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Clock className="h-4 w-4" />
                        Histórico
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden h-full flex items-center justify-center">
              <div className="text-center p-6">
                <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium">Nenhum contato selecionado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione uma conversa para ver os detalhes do contato
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
