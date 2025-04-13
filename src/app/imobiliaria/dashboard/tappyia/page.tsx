'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PageContainer } from '@/components/layout/page-container';
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
import { ListaIntegracoes } from '@/components/tappyia/integracoes/lista-integracoes';
import { ConsumoRecursos } from '@/components/tappyia/consumo/consumo-recursos';

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
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  User,
  Calendar,
  BarChart2,
  Trash,
  Download,
  Trash2,
  MessageSquareMore,
  Activity,
  BookIcon
} from 'lucide-react';

// Interface para o histórico de chats
interface HistoricoChat {
  id: string;
  titulo: string;
  data: string;
  previa: string;
  respostas?: number;
}

// Hook para buscar histórico de chats da IA
function useHistoricoChats() {
  const [historico, setHistorico] = useState<HistoricoChat[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizarTrigger, setAtualizarTrigger] = useState(0);
  
  // Função para forçar atualização do histórico
  const atualizarHistorico = () => {
    setAtualizarTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchHistorico = async () => {
      setCarregando(true);
      try {
        // Buscar do histórico real da API
        const response = await fetch('/api/ia/historico');
        
        if (response.ok) {
          const data = await response.json();
          
          // Verificar se há dados reais do banco
          if (data.historicos && Array.isArray(data.historicos)) {
            // Formatar os dados da API para o formato esperado
            const historicosFormatados = data.historicos.map((chat: any) => ({
              id: chat.id,
              titulo: chat.titulo,
              data: new Date(chat.createdAt).toLocaleDateString('pt-BR'),
              previa: chat.ultimaPergunta || 'Sem prévia disponível'
            }));
            
            setHistorico(historicosFormatados);
          } else {
            // Sem dados, mostrar lista vazia
            setHistorico([]);
          }
        } else {
          console.error('Erro ao buscar histórico: Status', response.status);
          // Mostrar lista vazia em caso de erro
          setHistorico([]);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        // Mostrar lista vazia em caso de erro
        setHistorico([]);
      } finally {
        setCarregando(false);
      }
    };
    
    fetchHistorico();
  }, [atualizarTrigger]); // Dependendo do trigger de atualização

  return { historico, carregando, atualizarHistorico };
}

// Exemplo de mensagens de chat - inicializado como array vazio
const exemploMensagensChat: any[] = [];

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
  const [integracaoModalAberta, setIntegracaoModalAberta] = useState(false);
  
  // Armazena os resultados das consultas para manter consistência nas respostas
  const [resultadosConsultas, setResultadosConsultas] = useState<Record<string, any>>({});
  
  // Buscar histórico de chats
  const { historico: historicoDeChats, carregando: carregandoHistorico, atualizarHistorico: atualizarHistoricoDeChats } = useHistoricoChats();
  
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
  
  // Função para carregar um chat específico do histórico
  const carregarChat = async (chatId: string) => {
    try {
      setCarregando(true);
      
      console.log('Carregando chat:', chatId);
      
      // Primeiro mudar para a tab de agente pessoal para mostrar o chat
      // Fazemos isso antes da requisição API para garantir mudança imediata de UI
      setTabAtiva('agente-pessoal');
      
      // Requisitar o chat e suas mensagens da API
      const response = await fetch(`/api/ia/historico/${chatId}/mensagens`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar chat: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.mensagens || !Array.isArray(data.mensagens)) {
        throw new Error('Formato de resposta inválido');
      }
      
      // Formatar as mensagens para o formato do estado
      const mensagensFormatadas = data.mensagens.map((msg: any) => ({
        id: msg.id,
        remetente: msg.remetente,
        conteudo: msg.conteudo,
        timestamp: new Date(msg.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
      }));
      
      // Atualizar o estado do chat atual
      setChatAtualId(chatId);
      setMensagens(mensagensFormatadas);
      
      // Forçar nova renderização da tab ativa
      setTimeout(() => {
        setTabAtiva('agente-pessoal');
      }, 50);
      
      return mensagensFormatadas;
    } catch (error) {
      console.error('Erro ao carregar chat:', error);
      return null;
    } finally {
      setCarregando(false);
    }
  };
  
  // Função para excluir um chat do histórico
  const excluirChat = async (chatId: string) => {
    try {
      // Confirmação antes de excluir
      if (!confirm('Tem certeza que deseja excluir este chat do histórico?')) {
        return false;
      }
      
      console.log(`Iniciando exclusão do chat: ${chatId}`);
      
      // Abordagem 1: Excluir primeiro as mensagens e depois o chat manualmente
      try {
        // Excluir mensagens primeiro
        const respostaExcluirMensagens = await fetch(`/api/ia/historico/${chatId}/mensagens`, {
          method: 'DELETE'
        });
        
        console.log('Resposta ao excluir mensagens:', respostaExcluirMensagens.status, respostaExcluirMensagens.statusText);
        
        // Agora excluir o chat
        const response = await fetch(`/api/ia/historico/${chatId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Resposta ao excluir chat:', response.status, response.statusText);
        
        if (!response.ok) {
          // Se houver erro, tente outra abordagem: excluir direto via API
          const responseData = await response.json().catch(() => ({}));
          console.log('Detalhes do erro:', responseData);
          throw new Error(`Erro ao excluir chat: ${response.statusText}`);
        }
      } catch (err) {
        console.error('Erro na primeira tentativa de exclusão, tentando abordagem alternativa:', err);
        
        // Tenta excluir mensagens diretamente no backend
        alert('Houve um problema ao excluir o chat. Tente novamente.');
        return false;
      }
      
      // Atualizar o histórico local
      await atualizarHistoricoDeChats();
      
      // Se o chat excluído é o chat atual, limpar o estado
      if (chatId === chatAtualId) {
        setChatAtualId(null);
        setMensagens([]);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir chat:', error);
      return false;
    }
  };
  
  // Função para excluir todo o histórico de chats
  const excluirTodoHistorico = async () => {
    try {
      // Confirmação antes de excluir tudo
      if (!confirm('Tem certeza que deseja excluir todo o histórico de chats?')) {
        return false;
      }
      
      const response = await fetch('/api/ia/historico', {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir histórico: ${response.statusText}`);
      }
      
      // Limpar o estado local
      setChatAtualId(null);
      setMensagens([]);
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir histórico:', error);
      return false;
    }
  };
  
  // Função para exportar o histórico de chat atual
  const exportarChatAtual = async () => {
    if (!chatAtualId) {
      alert('Selecione um chat para exportar');
      return;
    }
    
    try {
      setCarregando(true);
      
      // Buscar as mensagens do chat atual
      const response = await fetch(`/api/ia/historico/${chatAtualId}/mensagens`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar mensagens: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.mensagens || !Array.isArray(data.mensagens)) {
        throw new Error('Formato de resposta inválido');
      }
      
      // Formatar para exportação
      const chatInfo = historicoDeChats.find((chat: any) => chat.id === chatAtualId);
      const chatParaExportar = {
        id: chatAtualId,
        titulo: chatInfo?.titulo || 'Chat sem título',
        data: chatInfo?.data || new Date().toLocaleDateString('pt-BR'),
        mensagens: data.mensagens.map((msg: any) => ({
          remetente: msg.remetente,
          conteudo: msg.conteudo,
          data: new Date(msg.createdAt).toLocaleString('pt-BR')
        }))
      };
      
      // Converter para string JSON formatada
      const jsonString = JSON.stringify(chatParaExportar, null, 2);
      
      // Criar blob e link para download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar elemento de link e simular clique
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${chatInfo?.titulo.replace(/\s+/g, '-').toLowerCase() || 'chat'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar chat:', error);
      alert('Erro ao exportar chat. Tente novamente.');
      return false;
    } finally {
      setCarregando(false);
    }
  };
  
  // Função para exportar todo o histórico de chats
  const exportarTodoHistorico = async () => {
    try {
      setCarregando(true);
      
      // Buscar todos os chats
      const response = await fetch('/api/ia/historico');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.historicos || !Array.isArray(data.historicos)) {
        throw new Error('Formato de resposta inválido');
      }
      
      // Preparar objeto para exportação
      const historicoParaExportar = {
        data_exportacao: new Date().toLocaleString('pt-BR'),
        total_chats: data.historicos.length,
        chats: data.historicos.map((chat: any) => ({
          id: chat.id,
          titulo: chat.titulo,
          criado_em: new Date(chat.createdAt).toLocaleString('pt-BR'),
          ultima_pergunta: chat.ultimaPergunta
        }))
      };
      
      // Converter para string JSON formatada
      const jsonString = JSON.stringify(historicoParaExportar, null, 2);
      
      // Criar blob e link para download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Criar elemento de link e simular clique
      const a = document.createElement('a');
      a.href = url;
      a.download = `historico-chats-tappy-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar histórico:', error);
      alert('Erro ao exportar histórico. Tente novamente.');
      return false;
    } finally {
      setCarregando(false);
    }
  };
  
  // Efeito para rolar para o final da conversa quando houver novas mensagens
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
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
  
  // Handler para tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };
  
  return (
    <PageContainer
      title="Tappy IA"
      subtitle="Use nossa inteligência artificial para criar conteúdos e automatizar tarefas"
    >
      <Tabs value={tabAtiva} defaultValue="agente-pessoal" className="w-full" onValueChange={setTabAtiva}>
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
          <TabsTrigger 
            value="consumo-recursos"
            className="data-[state=active]:bg-[#25D366] data-[state=active]:text-black font-medium"
          >
            Consumo de recursos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="integracoes">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Integrações</CardTitle>
                  <CardDescription>
                    Conecte seu agente a várias plataformas para automatizar o atendimento
                  </CardDescription>
                </div>
                <Button onClick={() => setIntegracaoModalAberta(true)} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Nova Integração
                </Button>
              </CardHeader>
              <CardContent>
                <ListaIntegracoes abrirFormularioIntegracao={() => setIntegracaoModalAberta(true)} />
              </CardContent>
            </Card>
            
            {/* Modal para nova integração */}
            <Dialog open={integracaoModalAberta} onOpenChange={setIntegracaoModalAberta}>
              <DialogContent 
                className="max-w-[90%] w-full lg:max-w-[1200px] md:max-w-[90%] sm:max-w-[95%]"
                style={{ width: 'calc(100% - 40px)', maxWidth: '1200px' }}>
                <DialogHeader>
                  <DialogTitle>Nova Integração</DialogTitle>
                  <DialogDescription>
                    Configure a integração do seu agente com canais externos
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <IntegracaoForm onIntegracaoCriada={() => setIntegracaoModalAberta(false)} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Treinar Agente</CardTitle>
              <CardDescription>
                Configure a personalidade e conhecimentos do seu assistente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <TreinamentoForm mudarParaAbaDeGerenciamento={() => setTabAtiva("gerenciar")} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gerenciar">
          <KanbanAgentes mudarParaAbaDetreinamento={() => setTabAtiva("configuracoes")} />
        </TabsContent>
        
        <TabsContent value="consumo-recursos">
          <ConsumoRecursos />
        </TabsContent>
        
        <TabsContent value="agente-pessoal">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-col h-[600px]">
                {/* Cabeçalho do chat com informações do assistente */}
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                  <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src="/bot-avatar.png" alt="Assistente da Tappy" />
                      <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Tappy IA</h3>
                      <p className="text-xs text-muted-foreground">Seu assistente pessoal</p>
                    </div>
                  </div>
                  {chatAtualId && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={exportarChatAtual}
                      >
                        <Download className="h-4 w-4" />
                        Exportar Chat
                      </Button>
                    </div>
                  )}
                </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Área de mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mensagens.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <div className="max-w-md space-y-4">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Bot className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Assistente Imobiliário Tappy</h3>
                        <p className="text-slate-500">
                          Olá! Sou seu assistente virtual especializado em imóveis. Posso ajudar com informações sobre propriedades, agendamento de visitas, dúvidas sobre financiamento e muito mais!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                          <Button variant="outline" className="justify-start text-left" onClick={() => {
                            setMensagens([
                              { 
                                id: uuidv4(),
                                remetente: 'usuario', 
                                conteudo: 'Quais imóveis estão disponíveis para venda no Morumbi?',
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              }
                            ]);
                          }}>
                            <MessagesSquare className="h-4 w-4 mr-2" />
                            Buscar imóveis no Morumbi
                          </Button>
                          <Button variant="outline" className="justify-start text-left" onClick={() => {
                            setMensagens([
                              { 
                                id: uuidv4(),
                                remetente: 'usuario', 
                                conteudo: 'Como funciona o financiamento imobiliário?',
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              }
                            ]);
                          }}>
                            <Building2 className="h-4 w-4 mr-2" />
                            Financiamento imobiliário
                          </Button>
                          <Button variant="outline" className="justify-start text-left" onClick={() => {
                            setMensagens([
                              { 
                                id: uuidv4(),
                                remetente: 'usuario', 
                                conteudo: 'Quero agendar uma visita',
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              }
                            ]);
                          }}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar uma visita
                          </Button>
                          <Button variant="outline" className="justify-start text-left" onClick={() => {
                            setMensagens([
                              { 
                                id: uuidv4(),
                                remetente: 'usuario', 
                                conteudo: 'Quero ver as estatísticas de venda do último mês',
                                timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                              }
                            ]);
                          }}>
                            <BarChart2 className="h-4 w-4 mr-2" />
                            Estatísticas de vendas
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {mensagens.map((msg: any, idx: number) => (
                    <div key={idx} className={`flex ${msg.remetente === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-3 ${
                        msg.remetente === 'usuario' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.conteudo}</p>
                      </div>
                    </div>
                  ))}
                  
                  {carregando && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl p-3 bg-slate-100 text-slate-800 rounded-tl-none">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 bg-slate-300 rounded-full animate-pulse"></div>
                          <div className="h-2 w-2 bg-slate-300 rounded-full animate-pulse delay-100"></div>
                          <div className="h-2 w-2 bg-slate-300 rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Área de input */}
                <div className="p-4 border-t">
                  <form 
                    className="flex items-end gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!novaMensagem.trim()) return;
                      
                      // Gera um ID para a mensagem
                      const mensagemId = uuidv4();
                      const timestamp = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                      
                      // Adiciona a mensagem do usuário ao chat
                      const mensagemUsuario = {
                        id: mensagemId,
                        remetente: 'usuario',
                        conteudo: novaMensagem,
                        timestamp
                      };
                      
                      // Guardamos o texto para usar nas requisições
                      const mensagemTexto = novaMensagem;
                      setMensagens(prev => [...prev, mensagemUsuario]);
                      setNovaMensagem('');
                      
                      try {
                        // Criar chat se for primeira mensagem
                        if (mensagens.length === 0 && !chatAtualId) {
                          const idNovoChat = await criarNovoChat(mensagemTexto);
                          if (idNovoChat) {
                            setChatAtualId(idNovoChat);
                            
                            // Salvar a primeira mensagem no novo chat
                            await salvarMensagemHistorico(idNovoChat, mensagemTexto, 'usuario');
                          }
                        } else if (chatAtualId) {
                          // Salvar mensagem no histórico se já existe chat
                          await salvarMensagemHistorico(chatAtualId, mensagemTexto, 'usuario');
                        }
                        
                        // Consultar a IA via DeepSeek
                        setCarregando(true);
                        
                        // Obter contexto de consultas anteriores
                        const contextoConsultas = { ...resultadosConsultas };
                        
                        // Fazer a chamada para a API
                        const response = await fetch('/api/ia', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            mensagem: mensagemTexto,
                            contexto: contextoConsultas
                          })
                        });
                        
                        if (!response.ok) {
                          throw new Error(`Erro na API: ${response.statusText}`);
                        }
                        
                        const data = await response.json();
                        
                        // Se temos consulta e resultado, armazenamos no contexto
                        if (data.resultado) {
                          setResultadosConsultas(prev => ({
                            ...prev,
                            [mensagemId]: data.resultado
                          }));
                        }
                        
                        // Formatar a resposta do DeepSeek
                        let respostaTexto = '';
                        
                        // Priorizar a resposta formatada pelo DeepSeek
                        if (data.resposta) {
                          // Se temos uma resposta formatada pela IA, usamos ela
                          respostaTexto = data.resposta;
                        }
                        // Caso não haja resposta formatada, podemos formatar manualmente baseado nos dados
                        else if (data.resultado) {
                          // Construir uma resposta baseada no resultado
                          if ('totalImoveis' in data.resultado) {
                            respostaTexto = `Encontrei ${data.resultado.totalImoveis} imóveis ${Object.keys(data.resultado.filtrosAplicados || {}).length > 0 ? 'com os filtros aplicados' : 'no total'}.`;
                          } else if ('imoveis' in data.resultado) {
                            respostaTexto = `Encontrei ${data.resultado.imoveis.length} imóveis que correspondem à sua busca.`;
                            
                            // Adicionar detalhes dos imóveis
                            if (data.resultado.imoveis.length > 0) {
                              respostaTexto += '\n\nAqui estão alguns detalhes:';
                              data.resultado.imoveis.forEach((imovel: any, idx: number) => {
                                respostaTexto += `\n\n${idx + 1}. ${imovel.titulo}`;
                                respostaTexto += `\n   Preço: R$ ${imovel.valor.toLocaleString('pt-BR')}`;
                                respostaTexto += `\n   Local: ${imovel.bairro}, ${imovel.cidade}`;
                                respostaTexto += `\n   Detalhes: ${imovel.quartos} quartos, ${imovel.banheiros} banheiros, ${imovel.vagas} vagas`;
                              });
                            }
                          } else if ('bairros' in data.resultado) {
                            respostaTexto = 'Os bairros com mais imóveis são:\n';
                            data.resultado.bairros.forEach((item: any, idx: number) => {
                              respostaTexto += `\n${idx + 1}. ${item.bairro}: ${item._count.id} imóveis`;
                            });
                          } else if ('imovelMaisCaro' in data.resultado) {
                            const imovel = data.resultado.imovelMaisCaro;
                            respostaTexto = `O imóvel mais caro da plataforma é:\n\n${imovel.titulo}\n`;
                            respostaTexto += `Preço: R$ ${imovel.valor.toLocaleString('pt-BR')}\n`;
                            respostaTexto += `Local: ${imovel.bairro}, ${imovel.cidade}\n`;
                            respostaTexto += `Tipo: ${imovel.tipoImovel}, Operação: ${imovel.tipoOperacao}\n`;
                            respostaTexto += `Detalhes: ${imovel.quartos} quartos, ${imovel.banheiros} banheiros, ${imovel.areaTotal}m²`;
                          } else if ('imovelMaisBarato' in data.resultado) {
                            const imovel = data.resultado.imovelMaisBarato;
                            respostaTexto = `O imóvel mais barato disponível é:\n\n${imovel.titulo}\n`;
                            respostaTexto += `Preço: R$ ${imovel.valor.toLocaleString('pt-BR')}\n`;
                            respostaTexto += `Local: ${imovel.bairro}, ${imovel.cidade}\n`;
                            respostaTexto += `Tipo: ${imovel.tipoImovel}, Operação: ${imovel.tipoOperacao}\n`;
                            respostaTexto += `Detalhes: ${imovel.quartos} quartos, ${imovel.banheiros} banheiros, ${imovel.areaTotal}m²`;
                          } else if ('resumo' in data.resultado) {
                            const resumo = data.resultado.resumo;
                            respostaTexto = `Resumo do portfólio imobiliário:\n\n`;
                            
                            // Status dos imóveis
                            respostaTexto += "Status dos imóveis:\n";
                            resumo.imoveisPorStatus.forEach((status: any) => {
                              respostaTexto += `- ${status.status}: ${status._count.id} imóveis\n`;
                            });
                            
                            // Tipos de imóveis
                            respostaTexto += "\nTipos de imóveis:\n";
                            resumo.imoveisPorTipo.forEach((tipo: any) => {
                              respostaTexto += `- ${tipo.tipoImovel}: ${tipo._count.id} imóveis\n`;
                            });
                            
                            // Valores
                            if (resumo.valoresAgregados._avg.valor) {
                              respostaTexto += `\nValor médio: R$ ${resumo.valoresAgregados._avg.valor.toLocaleString('pt-BR')}\n`;
                              respostaTexto += `Valor mínimo: R$ ${resumo.valoresAgregados._min.valor.toLocaleString('pt-BR')}\n`;
                              respostaTexto += `Valor máximo: R$ ${resumo.valoresAgregados._max.valor.toLocaleString('pt-BR')}\n`;
                            }
                          } else {
                            // Resposta genérica para outros tipos de resultados
                            respostaTexto = 'Encontrei as informações que você pediu nos registros da imobiliária.';
                          }
                        } 
                        // Usar explicação como última opção apenas se não tiver nem resposta nem resultado
                        else if (data.explicacao) {
                          respostaTexto = data.explicacao;
                        } else {
                          respostaTexto = 'Desculpe, não consegui processar sua solicitação neste momento. Poderia reformular sua pergunta?';
                        }
                        
                        // Criar objeto de resposta da IA
                        const respostaIA = {
                          id: uuidv4(),
                          remetente: 'ia',
                          conteudo: respostaTexto,
                          timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                        };
                        
                        // Adicionar resposta ao chat
                        setMensagens(prev => [...prev, respostaIA]);
                        
                        // Salvar resposta da IA no histórico
                        if (chatAtualId) {
                          await salvarMensagemHistorico(chatAtualId, respostaTexto, 'ia');
                        }
                      } catch (error) {
                        console.error('Erro ao processar mensagem:', error);
                        
                        // Adicionar mensagem de erro ao chat
                        setMensagens(prev => [...prev, {
                          id: uuidv4(),
                          remetente: 'ia',
                          conteudo: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.',
                          timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
                        }]);
                      } finally {
                        setCarregando(false);
                      }
                    }}
                  >
                    <Textarea 
                      placeholder="Digite sua mensagem..." 
                      className="min-h-[60px] resize-none"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="rounded-full h-10 w-10 shrink-0"
                      disabled={!novaMensagem.trim() || carregando}
                    >
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Histórico de Chats</CardTitle>
                <CardDescription>
                  Acesse seus chats anteriores e continue de onde parou
                </CardDescription>
              </div>
              
              {historicoDeChats && historicoDeChats.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={exportarTodoHistorico}
                  >
                    <Download className="h-4 w-4" />
                    Exportar Histórico
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={excluirTodoHistorico}
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar Histórico
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Buscar no histórico..."
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {historicoDeChats.map((chat: any) => (
                  <div 
                    key={chat.id} 
                    className="border rounded-lg p-3 hover:border-primary/50 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{chat.titulo}</h3>
                      <span className="text-xs text-slate-500">{chat.data}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{chat.previa}</p>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => {
                          // Mudar para a aba antes de carregar o chat
                          setTabAtiva('agente-pessoal');
                          // Pequeno timeout para garantir que a mudança de aba ocorra antes de carregar o chat
                          setTimeout(() => carregarChat(chat.id), 50);
                        }}
                      >
                        <MessageSquareMore className="h-4 w-4" />
                        Ver Conversa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => {
                          setChatAtualId(chat.id);
                          exportarChatAtual();
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => excluirChat(chat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
                
                {historicoDeChats.length === 0 && (
                  <div className="text-center py-6 border rounded-lg">
                    <MessagesSquare className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <h3 className="font-medium text-slate-600">Nenhuma conversa encontrada</h3>
                    <p className="text-sm text-slate-500 mt-1">Utilize o agente pessoal para iniciar uma nova conversa.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
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

// Componente Label já está importado do ui/label
// function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) {
//   return (
//     <label
//       htmlFor={htmlFor}
//       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
//     >
//       {children}
//     </label>
//   );
// }
