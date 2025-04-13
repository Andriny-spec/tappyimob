'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PageContainer } from '@/components/layout/page-container';
import dynamic from 'next/dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

// Componentes personalizados para as interfaces de IA
import { TreinamentoForm } from '@/components/tappyia/agentes/treinamento-form';
import { KanbanAgentes } from '@/components/tappyia/agentes/kanban-agentes';
import { IntegracaoForm } from '@/components/tappyia/integracoes/integracao-form';

import { 
  Bot,
  Star,
  Search,
  Plus,
  Send,
  MessagesSquare,
  Repeat,
  FileText,
  Settings,
  RefreshCw,
  Image,
  PanelLeft,
  Building2,
  Users,
  Mail,
  FileEdit,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
// importação do Avatar já realizada no topo do arquivo

// Interface para o histórico de chats
interface HistoricoChat {
  id: string;
  titulo: string;
  data: string;
  previa: string;
}

// Hook para buscar histórico de chats da IA
function useHistoricoChats() {
  const [historico, setHistorico] = useState<HistoricoChat[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        setCarregando(true);
        const response = await fetch('/api/ia/historico');
        
        if (response.ok) {
          const data = await response.json();
          
          // Formatar os dados para a interface
          const historicosFormatados = data.historicos.map((chat: any) => ({
            id: chat.id,
            titulo: chat.titulo,
            data: new Date(chat.createdAt).toLocaleDateString('pt-BR'),
            previa: chat.ultimaPergunta || 'Sem prévia disponível'
          }));
          
          setHistorico(historicosFormatados);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    buscarHistorico();
  }, []);
  
  return { historico, carregando };
}

// Dados fictícios para demonstração do histórico de chats
const historicoDeChats = [
  {
    id: 1,
    titulo: 'Análise de imóveis',
    data: '11/04/2025',
    previa: 'Quantos imóveis temos na plataforma?',
    respostas: 14
  },
  {
    id: 2,
    titulo: 'Clientes ativos',
    data: '10/04/2025',
    previa: 'Quantos clientes ativos temos?',
    respostas: 8
  },
  {
    id: 3,
    titulo: 'Relatório mensal',
    data: '08/04/2025',
    previa: 'Gere um relatório dos imóveis vendidos este mês',
    respostas: 22
  },
  {
    id: 4,
    titulo: 'Análise de mercado',
    data: '05/04/2025',
    previa: 'Como está o mercado na região sul?',
    respostas: 17
  }
];

// Exemplo de mensagens de chat
const exemploMensagensChat: any[] = [
  // Conversa de exemplo - quando em produção, iniciar com array vazio
  // e buscar histórico de conversas do banco de dados
];

const modelosPrompt = [
  {
    id: 1,
    nome: 'Descrição de imóvel',
    descricao: 'Crie uma descrição atrativa para um imóvel com base nas suas características',
    icone: Building2
  },
  {
    id: 2,
    nome: 'E-mail para leads',
    descricao: 'Elabore um e-mail profissional para enviar a potenciais clientes',
    icone: Mail
  },
  {
    id: 3,
    nome: 'Análise de mercado',
    descricao: 'Gere uma análise de mercado para uma região específica',
    icone: FileText
  },
  {
    id: 4,
    nome: 'Carta de apresentação',
    descricao: 'Crie uma carta de apresentação para novos clientes',
    icone: FileEdit
  }
];

// Definindo interfaces para tipar os dados
interface RespostaChatIA {
  resposta: string;
  dados?: Record<string, any>;
  camposRequeridos?: string[];
  camposFaltantes?: string[];
  sucesso?: boolean;
  erro?: string;
  mensagem?: string;
  sugestoes?: string[];
}

export default function TappyIAPage() {
  const [pesquisa, setPesquisa] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tabAtiva, setTabAtiva] = useState('agente-pessoal');
  const [mensagens, setMensagens] = useState(exemploMensagensChat);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [chatAtualId, setChatAtualId] = useState<string | null>(null);
  
  // Armazena os resultados das consultas para manter consistência nas respostas
  const [resultadosConsultas, setResultadosConsultas] = useState<Record<string, any>>({});
  
  // Buscar histórico de chats
  const { historico: historicoDeChats, carregando: carregandoHistorico } = useHistoricoChats();
  
  // Função para atualizar o histórico após exclusão
  const atualizarHistorico = async () => {
    try {
      const response = await fetch('/api/ia/historico');
      
      if (response.ok) {
        const data = await response.json();
        
        // Formatar os dados para a interface
        const historicosFormatados = data.historicos.map((chat: any) => ({
          id: chat.id,
          titulo: chat.titulo,
          data: new Date(chat.createdAt).toLocaleDateString('pt-BR'),
          previa: chat.ultimaPergunta || 'Sem prévia disponível'
        }));
        
        // Atualizar o histórico no estado local
        return historicosFormatados;
      }
    } catch (error) {
      console.error('Erro ao atualizar histórico:', error);
    }
    return [];
  };
  
  // Efeito para rolar para o final da conversa quando houver novas mensagens
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [mensagens]);
  
  // Função para criar um novo chat no banco de dados
  const criarNovoChat = async (primeiraPergunta: string) => {
    try {
      // Extrair um título da primeira pergunta (primeiras 30 caracteres)
      const titulo = primeiraPergunta.length > 30 
        ? primeiraPergunta.substring(0, 30) + '...' 
        : primeiraPergunta;
      
      const response = await fetch('/api/ia/historico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          titulo,
          primeiraPergunta
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatAtualId(data.id);
        return data.id;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao criar chat:', error);
      return null;
    }
  };
  
  // Função para salvar mensagens no histórico
  const salvarMensagemHistorico = async (chatId: string, mensagem: string, remetente: string) => {
    try {
      await fetch(`/api/ia/historico/${chatId}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          conteudo: mensagem,
          remetente
        })
      });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  };
  
  return (
    <PageContainer
      title="Tappy IA"
      subtitle="Use nossa inteligência artificial para criar conteúdos e automatizar tarefas"
    >
      <Tabs defaultValue="agente-pessoal" className="w-full" onValueChange={setTabAtiva}>
        <TabsList className="mb-4 bg-slate-100 p-1">
          <TabsTrigger 
            value="agente-pessoal"
            className="data-[state=active]:bg-[#25D366] data-[state=active]:text-black font-medium"
          >
            Meu Agente Pessoal
          </TabsTrigger>
          <TabsTrigger 
            value="historico-chats"
            className="data-[state=active]:bg-[#25D366] data-[state=active]:text-black font-medium"
          >
            Histórico de Chats
          </TabsTrigger>
          <TabsTrigger 
            value="integracoes"
            className="data-[state=active]:bg-[#25D366] data-[state=active]:text-black font-medium"
          >
            Integrações
          </TabsTrigger>
          <TabsTrigger 
            value="configuracoes"
            className="data-[state=active]:bg-[#25D366] data-[state=active]:text-black font-medium"
          >
            Treinar agente
          </TabsTrigger>
          <TabsTrigger 
            value="gerenciar"
            className="data-[state=active]:bg-[#25D366] data-[state=active]:text-black font-medium"
          >
            Gerenciar agentes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="integracoes">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Conecte seu agente a várias plataformas para automatizar o atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegracaoForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Treinar Agente</CardTitle>
              <CardDescription>
                Configure a personalidade e conhecimentos do seu assistente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TreinamentoForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gerenciar">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Agentes</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os seus agentes de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KanbanAgentes mudarParaAbaDetreinamento={() => setTabAtiva("configuracoes")} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agente-pessoal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Meu Agente Imobiliário IA
              </CardTitle>
              <CardDescription>
                Um assistente inteligente com acesso aos dados da sua imobiliária para análises e consultas em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-container">
                  {mensagens.length > 0 ? (
                    mensagens.map((mensagem) => (
                      <div 
                        key={mensagem.id} 
                        className={`flex ${mensagem.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${mensagem.remetente === 'usuario' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted border'}`}
                        >
                          <div className="whitespace-pre-wrap">{mensagem.conteudo}</div>
                          <div className={`text-xs mt-1 ${mensagem.remetente === 'usuario' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'}`}
                          >
                            {mensagem.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="font-medium text-lg mb-2">Seu assistente imobiliário pessoal</h3>
                      <p className="text-muted-foreground max-w-md mb-6">
                        Pergunte sobre imóveis, clientes, estatísticas de vendas ou qualquer outra informação da sua plataforma
                      </p>
                      <div className="space-y-4 w-full max-w-md">
                        <div className="border-b pb-2">
                          <h4 className="text-sm font-medium mb-2">Consultas rápidas</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              className="justify-start text-left h-auto py-2" 
                              onClick={() => setNovaMensagem("Quantos imóveis temos na plataforma?")}
                            >
                              Quantos imóveis temos na plataforma?
                            </Button>
                            <Button 
                              variant="outline" 
                              className="justify-start text-left h-auto py-2"
                              onClick={() => setNovaMensagem("Quais são os clientes mais ativos?")}
                            >
                              Quais são os clientes mais ativos?
                            </Button>
                            <Button 
                              variant="outline" 
                              className="justify-start text-left h-auto py-2"
                              onClick={() => setNovaMensagem("Gere um relatório de vendas do mês")}
                            >
                              Gere um relatório de vendas do mês
                            </Button>
                            <Button 
                              variant="outline" 
                              className="justify-start text-left h-auto py-2"
                              onClick={() => setNovaMensagem("Quais bairros têm mais imóveis?")}
                            >
                              Quais bairros têm mais imóveis?
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            Criar imóvel com IA
                          </h4>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              className="justify-start text-left h-auto py-2 w-full"
                              onClick={() => setNovaMensagem("Crie um apartamento em Moema, 3 quartos, 2 banheiros, 120m², para venda por R$ 1.200.000, próximo ao parque.")}                            
                            >
                              Criar apartamento em Moema
                            </Button>
                            <Button 
                              variant="outline" 
                              className="justify-start text-left h-auto py-2 w-full"
                              onClick={() => setNovaMensagem("Crie uma casa em Pinheiros, 4 quartos, 3 banheiros, 200m², 2 vagas de garagem, para venda por R$ 2.500.000")}                            
                            >
                              Criar casa em Pinheiros
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t p-4">
                  <form 
                    className="flex items-end gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!novaMensagem.trim()) return;
                      
                      // Adiciona a mensagem do usuário ao chat
                      const mensagemUsuario = {
                        id: uuidv4(),
                        remetente: 'usuario',
                        conteudo: novaMensagem,
                        timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                      };
                      
                      // Guardamos o texto para usar nas requisições
                      const mensagemTexto = novaMensagem;
                      setMensagens(prev => [...prev, mensagemUsuario]);
                      setNovaMensagem('');
                      
                      // Se for a primeira mensagem, cria um novo chat no histórico
                      let chatId = chatAtualId;
                      if (!chatId) {
                        chatId = await criarNovoChat(mensagemTexto);
                      }
                      
                      // Salva a mensagem do usuário no histórico
                      if (chatId) {
                        await salvarMensagemHistorico(chatId, mensagemTexto, 'usuario');
                      }
                      
                      // Adiciona uma mensagem de carregamento
                      const idCarregamento = uuidv4();
                      const mensagemCarregamento = {
                        id: idCarregamento,
                        remetente: 'ia',
                        conteudo: 'Estou analisando os dados da sua imobiliária para responder sua pergunta...',
                        timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                      };
                      
                      setMensagens(prev => [...prev, mensagemCarregamento]);
                      
                      try {
                        let response;
                        let data: RespostaChatIA;
                        
                        // Verifica se a mensagem é uma solicitação para criar imóvel
                        const isCriarImovel = mensagemTexto.toLowerCase().includes('crie um') || 
                          mensagemTexto.toLowerCase().includes('criar um') || 
                          mensagemTexto.toLowerCase().includes('novo imóvel');
                        
                        if (isCriarImovel) {
                          // Chama a API específica para criação de imóveis
                          let response = await fetch('/api/ia/criar-imovel', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ descricao: mensagemTexto })
                          });
                          
                          let data: RespostaChatIA = await response.json();
                          
                          if (response.ok && data.sucesso) {
                            // Quando o imóvel é criado com sucesso
                            setMensagens(prev => prev.map(msg => 
                              msg.id === idCarregamento ? {
                                ...msg,
                                conteudo: data.mensagem || 'Imóvel criado com sucesso!',
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              } : msg
                            ));
                          } else {
                            // Quando há campos faltantes ou erros
                            const mensagemErro = data.mensagem || 
                              (data.camposFaltantes ? 
                                `Não consegui criar o imóvel. Faltam os seguintes campos: ${data.camposFaltantes.join(', ')}. ${data.sugestoes || ''}` : 
                                'Houve um erro ao criar o imóvel. Por favor, tente novamente.');
                            
                            setMensagens(prev => prev.map(msg => 
                              msg.id === idCarregamento ? {
                                ...msg,
                                conteudo: mensagemErro,
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              } : msg
                            ));
                          }
                        } else {
                          // Chama a API normal para consultas
                          response = await fetch('/api/ia', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                              mensagem: mensagemTexto,
                              contexto: resultadosConsultas // Envia o contexto das consultas anteriores
                            })
                          });
                          
                          data = await response.json() as RespostaChatIA;
                          
                          if (response.ok) {
                            // Armazena os resultados da consulta no estado
                            if (data && data.dados) {
                              setResultadosConsultas(prev => ({
                                ...prev,
                                ...data.dados
                              }));
                            }
                            
                            // Adiciona os resultados anteriores armazenados ao prompt atual
                            const mensagemComContexto = {
                              mensagem: mensagemTexto,
                              resultadosAnteriores: resultadosConsultas
                            };
                            
                            // Substitui a mensagem de carregamento pela resposta real
                            const respostaFinal = data && data.resposta || 'Não consegui encontrar uma resposta para essa pergunta.';
                            
                            setMensagens(prev => prev.map(msg => 
                              msg.id === idCarregamento ? {
                                ...msg,
                                conteudo: respostaFinal,
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              } : msg
                            ));
                            
                            // Salva a resposta da IA no histórico
                            if (chatAtualId) {
                              await salvarMensagemHistorico(chatAtualId, respostaFinal, 'ia');
                              
                              // Atualiza a última pergunta no chat
                              await fetch(`/api/ia/historico/${chatAtualId}`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ 
                                  ultimaPergunta: mensagemTexto
                                })
                              });
                            }
                          } else {
                            // Em caso de erro na API
                            setMensagens(prev => prev.map(msg => 
                              msg.id === idCarregamento ? {
                                ...msg,
                                conteudo: 'Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente.',
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              } : msg
                            ));
                          }
                        }
                      } catch (error) {
                        console.error('Erro ao chamar a API:', error);
                        // Em caso de erro na requisição
                        setMensagens(prev => prev.map(msg => 
                          msg.id === idCarregamento ? {
                            ...msg,
                            conteudo: 'Ocorreu um erro de conexão. Por favor, verifique sua internet e tente novamente.',
                            timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                          } : msg
                        ));
                      } finally {
                        // Rola a conversa para o final após receber a resposta
                        setTimeout(() => {
                          const chatContainer = document.getElementById('chat-container');
                          if (chatContainer) {
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                          }
                        }, 100);
                      }
                    }}
                  >
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="min-h-[60px] flex-1"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                    />
                    <Button type="submit" size="icon" className="h-[60px] w-[60px]">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historico-chats">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Histórico de Conversas</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar conversa..."
                    className="pl-8"
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicoDeChats
                  .filter(item => 
                    pesquisa === '' || 
                    item.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
                    item.previa.toLowerCase().includes(pesquisa.toLowerCase())
                  )
                  .map(item => (
                    <div key={item.id} className="flex flex-col p-3 border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/bottts/svg?seed=${item.id}`} />
                            <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium">{item.titulo}</h3>
                            <span className="text-xs text-muted-foreground">{item.data}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.previa}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Carregar histórico de chat
                            fetch(`/api/ia/historico/${item.id}`)
                              .then(res => res.json())
                              .then(data => {
                                setChatAtualId(item.id);
                                // Converter mensagens do formato do banco para o formato da UI
                                const mensagensFormatadas = data.mensagens.map((msg: any) => ({
                                  id: msg.id,
                                  remetente: msg.remetente,
                                  conteudo: msg.conteudo,
                                  timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                                }));
                                
                                setMensagens(mensagensFormatadas);
                                setTabAtiva('agente-pessoal'); // Voltar para a tab de chat
                                
                                // Rolar para o início da conversa após carregar
                                setTimeout(() => {
                                  const chatContainer = document.getElementById('chat-container');
                                  if (chatContainer) {
                                    chatContainer.scrollTop = 0;
                                  }
                                }, 100);
                              })
                              .catch(err => console.error('Erro ao carregar chat:', err));
                          }}
                        >
                          <MessagesSquare className="h-3.5 w-3.5 mr-1" />
                          Carregar
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 text-xs flex items-center gap-1 text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            
                            // Confirmação antes de excluir
                            if (confirm(`Tem certeza que deseja excluir a conversa "${item.titulo}"?`)) {
                              // Excluir histórico de chat
                              fetch(`/api/ia/historico/${item.id}`, {
                                method: 'DELETE'
                              })
                                .then(res => res.json())
                                .then(async () => {
                                  // Atualizar a lista de histórico depois de excluir
                                  await atualizarHistorico();
                                  
                                  // Se o chat atual foi excluído, limpamos o ID
                                  if (item.id === chatAtualId) {
                                    setChatAtualId(null);
                                  }
                                  
                                  // Recarregar a página para atualizar a lista
                                  window.location.reload();
                                })
                                .catch(err => console.error('Erro ao excluir chat:', err));
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integracoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessagesSquare className="h-5 w-5 text-primary" />
                Integrações para Tappy IA
              </CardTitle>
              <CardDescription>
                Conecte a inteligência artificial com seus canais de comunicação preferidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WhatsApp */}
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M19.4019 4.95776C14.8897 0.446403 7.42237 0.446414 2.91007 4.95781C0.813935 7.05394 -0.203021 9.70886 0.0352814 12.5C0.273519 15.2912 1.72325 17.8478 3.95373 19.5869L2.6543 23.7017C2.5726 23.9517 2.67568 24.2257 2.89568 24.3673C3.01598 24.4477 3.1586 24.4889 3.30229 24.4889C3.40538 24.4889 3.50846 24.4651 3.60215 24.4173L8.03089 22.1303C9.51862 22.7129 11.0732 23 12.6543 23C17.7445 23 22.0041 19.8607 23.2733 15.0477C24.5425 10.2347 22.6567 5.14062 19.4019 4.95776ZM17.6722 17.6087C17.0134 18.2673 16.1099 18.6478 15.1619 18.6478C14.2139 18.6478 13.3104 18.2673 12.6516 17.6087L12.5294 17.4864C12.1773 17.1343 11.6165 17.1343 11.2645 17.4864C10.9124 17.8385 10.9124 18.3992 11.2645 18.7513L11.3867 18.8737C12.409 19.8958 13.7487 20.4566 15.1619 20.4566C16.5751 20.4566 17.9148 19.8958 18.937 18.8735C19.9593 17.8513 20.5201 16.5116 20.5201 15.0983C20.5201 13.6851 19.9593 12.3454 18.937 11.3232L18.8147 11.201C18.4626 10.8489 17.9019 10.8489 17.5498 11.201C17.1977 11.5531 17.1977 12.1138 17.5498 12.4659L17.6722 12.5882C18.3308 13.2471 18.7114 14.1505 18.7114 15.0985C18.7114 16.0465 18.3308 16.95 17.6722 17.6087ZM5.83434 12.5881C5.83434 11.6402 6.21481 10.7368 6.87342 10.0781C7.53204 9.41953 8.43554 9.03901 9.38352 9.03901C10.3315 9.03901 11.235 9.41953 11.8936 10.0781L12.016 10.2005C12.368 10.5526 12.9288 10.5526 13.2809 10.2005C13.633 9.84839 13.633 9.28769 13.2809 8.93558L13.1585 8.81317C12.1362 7.79098 10.7966 7.2301 9.38342 7.2301C7.97022 7.2301 6.63054 7.79098 5.60839 8.81317C4.5862 9.83534 4.02539 11.175 4.02539 12.5883C4.02539 14.0015 4.5862 15.3412 5.60839 16.3634L5.73083 16.4857C5.9069 16.6618 6.1336 16.7499 6.36036 16.7499C6.58712 16.7499 6.81382 16.6618 6.98989 16.4857C7.342 16.1336 7.342 15.5729 6.98989 15.2208L6.8675 15.0984C6.20885 14.4397 5.83434 13.5361 5.83434 12.5881Z" fill="#25D366"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg">WhatsApp</h3>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          Recomendado
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        Integre a Tappy IA com seu WhatsApp para atendimento automatizado e qualificação de leads
                      </p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                        <Plus className="h-4 w-4" />
                        Conectar WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Facebook */}
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg">Facebook Messenger</h3>
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                          Popular
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        Integre a IA com o Facebook Messenger para automatizar o atendimento na sua página
                      </p>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                        <Plus className="h-4 w-4" />
                        Conectar Facebook
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Instagram */}
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163ZM12 0C8.741 0 8.333 0.014 7.053 0.072C2.695 0.272 0.273 2.69 0.073 7.052C0.014 8.333 0 8.741 0 12C0 15.259 0.014 15.668 0.072 16.948C0.272 21.306 2.69 23.728 7.052 23.928C8.333 23.986 8.741 24 12 24C15.259 24 15.668 23.986 16.948 23.928C21.302 23.728 23.73 21.31 23.927 16.948C23.986 15.668 24 15.259 24 12C24 8.741 23.986 8.333 23.928 7.053C23.732 2.699 21.311 0.273 16.949 0.073C15.668 0.014 15.259 0 12 0Z" fill="url(#paint0_radial_204_4)"/>
                        <path d="M12 5.838C8.597 5.838 5.838 8.597 5.838 12C5.838 15.403 8.597 18.163 12 18.163C15.403 18.163 18.162 15.404 18.162 12C18.162 8.597 15.403 5.838 12 5.838ZM12 16C9.791 16 8 14.21 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.21 14.209 16 12 16Z" fill="url(#paint1_radial_204_4)"/>
                        <path d="M18.406 7.034C19.2013 7.034 19.846 6.38929 19.846 5.594C19.846 4.79872 19.2013 4.154 18.406 4.154C17.6107 4.154 16.966 4.79872 16.966 5.594C16.966 6.38929 17.6107 7.034 18.406 7.034Z" fill="url(#paint2_radial_204_4)"/>
                        <defs>
                          <radialGradient id="paint0_radial_204_4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6 18) rotate(-55.3758) scale(25.5196)">
                            <stop stop-color="#B13589"/>
                            <stop offset="0.793" stop-color="#C62F94"/>
                            <stop offset="1" stop-color="#8A3AC8"/>
                          </radialGradient>
                          <radialGradient id="paint1_radial_204_4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(8 16) rotate(-65.1363) scale(9.22059)">
                            <stop stop-color="#E0E8B7"/>
                            <stop offset="0.444" stop-color="#FB8A2E"/>
                            <stop offset="0.71" stop-color="#E2425C"/>
                            <stop offset="1" stop-color="#E2425C" stop-opacity="0"/>
                          </radialGradient>
                          <radialGradient id="paint2_radial_204_4" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16.966 7.034) rotate(-90) scale(2.88)">
                            <stop offset="0.156" stop-color="#406ADC"/>
                            <stop offset="0.467" stop-color="#6A45BE"/>
                            <stop offset="1" stop-color="#6A45BE" stop-opacity="0"/>
                          </radialGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg">Instagram</h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        Conecte com suas DMs do Instagram para atendimento automatizado e qualificação de leads
                      </p>
                      <Button size="sm" className="gap-1 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:via-pink-700 hover:to-amber-600 text-white">
                        <Plus className="h-4 w-4" />
                        Conectar Instagram
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Chat no Site */}
                <div className="border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessagesSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg">Chat no Site</h3>
                        <Badge variant="default" className="bg-primary/80">
                          Ativo
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        Adicione um widget de chat inteligente ao seu site para atender visitantes 24/7
                      </p>
                      <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5 gap-1">
                        <Settings className="h-4 w-4" />
                        Gerenciar Widget
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-8" />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Configurações de resposta para integrações</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Horário de atendimento</h4>
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Segunda a Sexta</span>
                        <span className="text-sm font-medium">8:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sábado</span>
                        <span className="text-sm font-medium">9:00 - 13:00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Domingo e Feriados</span>
                        <span className="text-sm font-medium">Fechado</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-8 px-2 gap-1">
                      <Settings className="h-3 w-3" />
                      Editar Horários
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Mensagens automáticas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Boas-vindas</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          Editar
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fora de horário</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          Editar
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Aguardando retorno</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-5">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Treinar Agente</CardTitle>
              <CardDescription>
                Configure a personalidade e conhecimentos do seu assistente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TreinamentoForm />
            </CardContent>
          </Card>
                        </div>
                      </div>
                      <div className="flex items-center justify-center p-2 border rounded-md cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all">
                        <div className="flex flex-col items-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" className="mb-1">
                            <path d="M12 2.163C15.204 2.163 15.584 2.175 16.85 2.233C20.102 2.381 21.621 3.924 21.769 7.152C21.827 8.417 21.838 8.797 21.838 12.001C21.838 15.206 21.826 15.585 21.769 16.85C21.62 20.075 20.105 21.621 16.85 21.769C15.584 21.827 15.206 21.839 12 21.839C8.796 21.839 8.416 21.827 7.151 21.769C3.891 21.62 2.38 20.07 2.232 16.849C2.174 15.584 2.162 15.205 2.162 12C2.162 8.796 2.175 8.417 2.232 7.151C2.381 3.924 3.896 2.38 7.151 2.232C8.417 2.175 8.796 2.163 12 2.163Z" fill="#E1306C"/>
                          </svg>
                          <span className="text-xs font-medium">Instagram</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center p-2 border rounded-md cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all">
                        <div className="flex flex-col items-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-1">
                            <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2"/>
                          </svg>
                          <span className="text-xs font-medium">Facebook</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="objetivo-agente">Objetivo do Agente</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Vendas
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Atendimento
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Suporte
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Jurídico
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Financeiro
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Comercial
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="temperatura">Temperatura</Label>
                      <span className="text-xs text-slate-500">0.7</span>
                    </div>
                    <div className="pt-2">
                      <div className="h-2 bg-slate-200 rounded-full w-full">
                        <div className="h-2 bg-primary rounded-full w-[70%]"></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Preciso</span>
                        <span>Criativo</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="humor-agente">Humor do Agente</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Formal
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Amigável
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Profissional
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Objetivo
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Descontraído
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Empático
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comportamento">Comportamento</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Proativo
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Reativo
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Consultivo
                      </Badge>
                      <Badge variant="outline" className="py-2 cursor-pointer bg-white hover:bg-slate-50 hover:border-primary flex justify-center">
                        Informativo
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prompt-modelo">Prompt Base</Label>
                    <Textarea
                      id="prompt-modelo"
                      placeholder="Ex: Você é um assistente especializado em imóveis que ajuda clientes a encontrar propriedades. Seja amigável e forneça informações detalhadas quando solicitado."
                      className="min-h-[150px] resize-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Dica de especialista</h4>
                    <p className="text-sm text-slate-500">
                      Use um tom amigável e temperatura moderada para agentes de atendimento. Para vendas, aumente a temperatura para permitir mais criatividade na abordagem dos leads.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="gap-1.5">
                  <Bot className="h-4 w-4" />
                  Criar Agente
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Removido Tab de Ativos */}
      </Tabs>
      
      {/* Banner informativo sobre a integração com banco de dados */}
      <Card className="mt-6 border-dashed border-primary/50 bg-primary/5">
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <Badge variant="secondary" className="mb-2">Novo</Badge>
            <h3 className="text-lg font-medium mb-1 text-center md:text-left">Agente IA com DeepSeek e Prisma</h3>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Seu agente inteligente utiliza o modelo DeepSeek com acesso ao banco de dados para consultas em tempo real sobre imóveis, clientes e mais!
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-1.5">
              <PanelLeft className="h-4 w-4" />
              Ver Documentação
            </Button>
            <Button className="gap-1.5">
              <Bot className="h-4 w-4" />
              Treinar IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// Componente Label para usar no formulário
function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
    >
      {children}
    </label>
  );
}
