'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Bot, BrainCircuit, Clock, Loader2, MessagesSquare, Plus, Settings, Trash, ChevronUp, ChevronDown } from 'lucide-react';

// Tipos para os cartões de agentes
type AgenteStatus = 'EM_TREINAMENTO' | 'ATIVO' | 'DESATIVADO' | 'EM_REVISAO';

interface Agente {
  id: string;
  nome: string;
  descricao: string;
  tipoAgente: string;
  tom: string;
  status: AgenteStatus;
  emoji?: string;
  cor?: string;
  createdAt: string;
  progresso?: number; // Progresso de treinamento (0-100)
  estatisticas?: {
    mensagensRespondidas: number;
    satisfacaoCliente: number;
    tempoMedioResposta: string;
  };
}

// Dados de agentes serão buscados da API
interface KanbanAgentesProps {
  mudarParaAbaDetreinamento: () => void;
}

export function KanbanAgentes({ mudarParaAbaDetreinamento }: KanbanAgentesProps) {
  const [agentes, setAgentes] = useState<Record<AgenteStatus, Agente[]>>({
    EM_TREINAMENTO: [],
    ATIVO: [],
    DESATIVADO: [],
    EM_REVISAO: []
  });
  
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  const [agenteDetalhes, setAgenteDetalhes] = useState<Agente | null>(null);
  const [dialogoDetalhesAberto, setDialogoDetalhesAberto] = useState(false);

  // Efeito para buscar os agentes do banco de dados
  useEffect(() => {
    const buscarAgentes = async () => {
      try {
        setCarregando(true);
        setErro(null);
        
        const response = await fetch('/api/ia/agentes');
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar agentes: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.agentes && Array.isArray(data.agentes)) {
          // Mapear os agentes recebidos para o formato esperado pelo componente
          const agentesFormatados = data.agentes.map((agente: {
            id: string;
            nome: string;
            descricao?: string;
            tipoAgente?: string;
            tom?: string;
            status?: string;
            emoji?: string;
            cor?: string;
            createdAt?: string;
            progresso?: number;
            mensagensRespondidas?: number;
            satisfacaoCliente?: number;
            tempoMedioResposta?: string;
          }) => ({
            id: agente.id,
            nome: agente.nome,
            descricao: agente.descricao || 'Sem descrição',
            tipoAgente: agente.tipoAgente || 'ATENDIMENTO',
            tom: agente.tom || 'PROFISSIONAL',
            status: (agente.status as AgenteStatus) || 'EM_TREINAMENTO',
            emoji: agente.emoji || '🤖',
            cor: agente.cor || '#3B82F6',
            createdAt: agente.createdAt || new Date().toISOString(),
            progresso: agente.progresso || Math.floor(Math.random() * 100),
            mensagensRespondidas: agente.mensagensRespondidas || 0,
            satisfacaoCliente: agente.satisfacaoCliente || 0,
            tempoMedioResposta: agente.tempoMedioResposta || '0s'
          }));
          
          // Agrupar por status
          const agrupados: Record<AgenteStatus, Agente[]> = {
            EM_TREINAMENTO: [],
            ATIVO: [],
            DESATIVADO: [],
            EM_REVISAO: []
          };
          
          agentesFormatados.forEach((agente: Agente) => {
            if (agrupados[agente.status]) {
              agrupados[agente.status].push(agente);
            } else {
              // Caso receba um status não reconhecido, colocar em EM_TREINAMENTO
              agrupados.EM_TREINAMENTO.push({...agente, status: 'EM_TREINAMENTO'});
            }
          });
          
          setAgentes(agrupados);
        } else {
          // Caso não receba agentes, manter o estado inicial vazio
          console.warn('Nenhum agente encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar agentes:', error);
        setErro('Ocorreu um erro ao buscar os agentes. Tente novamente mais tarde.');
      } finally {
        setCarregando(false);
      }
    };
    
    buscarAgentes();
  }, []);

  // Mapeia os status para títulos em português e cores
  const statusConfig: Record<AgenteStatus, { 
    titulo: string, 
    cor: string, 
    icone: React.ReactNode,
    cardClasses: string, // Classe para o card
    badgeClasses: string, // Classe para o badge de status
    progressColor: string // Cor da barra de progresso
  }> = {
    EM_TREINAMENTO: { 
      titulo: 'Em Treinamento', 
      cor: 'bg-amber-50 border-amber-200 text-amber-700',
      icone: <BrainCircuit className="h-4 w-4 text-amber-600" />,
      cardClasses: 'border-l-4 border-l-amber-400',
      badgeClasses: 'bg-amber-100 text-amber-800 border-amber-200',
      progressColor: 'bg-amber-400'
    },
    ATIVO: { 
      titulo: 'Ativos', 
      cor: 'bg-green-50 border-green-200 text-green-700',
      icone: <Bot className="h-4 w-4 text-green-600" />,
      cardClasses: 'border-l-4 border-l-green-500',
      badgeClasses: 'bg-green-100 text-green-800 border-green-200',
      progressColor: 'bg-green-500'
    },
    DESATIVADO: { 
      titulo: 'Desativados', 
      cor: 'bg-slate-50 border-slate-200 text-slate-700',
      icone: <Clock className="h-4 w-4 text-slate-600" />,
      cardClasses: 'border-l-4 border-l-slate-400 opacity-75',
      badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
      progressColor: 'bg-slate-400'
    },
    EM_REVISAO: { 
      titulo: 'Em Revisão', 
      cor: 'bg-blue-50 border-blue-200 text-blue-700',
      icone: <Settings className="h-4 w-4 text-blue-600" />,
      cardClasses: 'border-l-4 border-l-blue-500',
      badgeClasses: 'bg-blue-100 text-blue-800 border-blue-200',
      progressColor: 'bg-blue-500'
    }
  };

  const verDetalhes = (agente: Agente) => {
    setAgenteDetalhes(agente);
    setDialogoDetalhesAberto(true);
  };
  
  // Funções para o drag and drop
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Se não tiver destino, o usuário cancelou o drag
    if (!destination) return;
    
    // Se origem e destino forem os mesmos, e o índice também, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    // Converte os IDs de droppable para o status correspondente
    const sourceStatus = source.droppableId as AgenteStatus;
    const destStatus = destination.droppableId as AgenteStatus;
    
    // Encontra o agente que está sendo movido
    const agente = agentes[sourceStatus][source.index];
    
    // Criar novas listas para as colunas afetadas
    const novaListaOrigem = Array.from(agentes[sourceStatus]);
    novaListaOrigem.splice(source.index, 1);
    
    const novaListaDestino = Array.from(agentes[destStatus]);
    novaListaDestino.splice(destination.index, 0, {...agente, status: destStatus});
    
    try {
      // Atualizar o status no banco de dados
      const response = await fetch(`/api/ia/agentes/${draggableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: destStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar status do agente: ${response.statusText}`);
      }
      
      // Atualizar o estado com as novas listas
      setAgentes({
        ...agentes,
        [sourceStatus]: novaListaOrigem,
        [destStatus]: novaListaDestino
      });
      
      console.log(`Agente ${draggableId} movido com sucesso de ${sourceStatus} para ${destStatus}`);
    } catch (error) {
      console.error('Erro ao mover agente via drag and drop:', error);
      setErro('Ocorreu um erro ao atualizar o status do agente. Tente novamente.');
    }
  };
  
  // Função para mover um agente para uma coluna diferente usando botões
  const moverAgente = async (agenteId: string, statusAtual: AgenteStatus, novoStatus: AgenteStatus) => {
    // Encontrar o agente na coluna atual
    const agente = agentes[statusAtual].find(a => a.id === agenteId);
    
    if (!agente) return;
    
    // Criar uma cópia do agente com o novo status
    const agenteAtualizado = { ...agente, status: novoStatus };
    
    try {
      // Atualizar o status no banco de dados
      const response = await fetch(`/api/ia/agentes/${agenteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar status do agente: ${response.statusText}`);
      }
      
      // Se a atualização no banco foi bem-sucedida, atualizamos a UI
      // Remover o agente da coluna atual
      const novaListaAtual = agentes[statusAtual].filter(a => a.id !== agenteId);
      
      // Adicionar o agente à nova coluna
      const novaListaDestino = [...agentes[novoStatus], agenteAtualizado];
      
      // Atualizar o estado
      setAgentes({
        ...agentes,
        [statusAtual]: novaListaAtual,
        [novoStatus]: novaListaDestino
      });
      
      console.log(`Agente ${agenteId} movido com sucesso de ${statusAtual} para ${novoStatus}`);
    } catch (error) {
      console.error('Erro ao mover agente:', error);
      // Aqui poderia mostrar um toast ou alerta para o usuário
      setErro('Ocorreu um erro ao atualizar o status do agente. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Agentes</h2>
        <Button 
          className="gap-1 bg-green-500 hover:bg-green-600 text-white"
          onClick={mudarParaAbaDetreinamento}
        >
          <Plus className="h-4 w-4" />
          Novo Agente
        </Button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Carregando agentes...</p>
              <p className="text-sm text-slate-500">Aguarde enquanto buscamos os dados</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(agentes).map(([status, agentesLista]) => (
            <div key={status} className="space-y-3">
              <div className={`p-2 rounded ${statusConfig[status as AgenteStatus].cor} flex items-center justify-between shadow-sm`}>
                <div className="flex items-center gap-1.5">
                  {statusConfig[status as AgenteStatus].icone}
                  <h3 className="text-sm font-medium">
                    {statusConfig[status as AgenteStatus].titulo} ({agentesLista.length})
                  </h3>
                </div>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-4 min-h-[250px] p-2 rounded-lg transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-green-50 border-2 border-dashed border-green-300 shadow-inner' : ''}`}
                  >
                    {agentesLista.length === 0 ? (
                      <div className="flex items-center justify-center h-24 border border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">Nenhum agente</p>
                      </div>
                    ) : (
                      agentesLista.map((agente, index) => (
                        <Draggable 
                          key={agente.id} 
                          draggableId={agente.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1
                              }}
                            >
                              <Card 
                                className={`
                                  cursor-grab 
                                  transition-shadow 
                                  ${statusConfig[status as AgenteStatus].cardClasses}
                                  ${snapshot.isDragging ? 'shadow-xl rotate-2 scale-105 z-10' : 'hover:shadow-md'}
                                `}
                              >
                                <CardContent className="p-3 relative">
                                  {/* Tarja superior com status */}
                                  <Badge 
                                    className={`absolute top-2 right-2 text-xs px-2 py-0.5 ${statusConfig[status as AgenteStatus].badgeClasses}`}
                                  >
                                    {statusConfig[status as AgenteStatus].titulo}
                                  </Badge>

                                  <div className="flex justify-between items-start mt-4">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-shrink-0">
                                        <Avatar className="h-10 w-10 ring-2" style={{ backgroundColor: agente.cor || '#e5e7eb', boxShadow: `0 0 0 2px ${agente.cor || '#e5e7eb'}33` }}>
                                          <AvatarFallback>{agente.emoji || <Bot className="h-5 w-5" />}</AvatarFallback>
                                        </Avatar>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium">{agente.nome}</h4>
                                        <p className="text-xs text-muted-foreground truncate max-w-[12rem]">
                                          {agente.descricao}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                          <Badge variant="secondary" className="text-xs py-0 px-1.5">
                                            {agente.tipoAgente === 'VENDAS' ? 'Vendas' :
                                            agente.tipoAgente === 'ATENDIMENTO' ? 'Atendimento' :
                                            agente.tipoAgente === 'CONSULTORIA' ? 'Consultoria' : 'Personalizado'}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs py-0 px-1.5">
                                            {agente.tom === 'FORMAL' ? 'Formal' :
                                            agente.tom === 'INFORMAL' ? 'Informal' :
                                            agente.tom === 'TECNICO' ? 'Técnico' :
                                            agente.tom === 'AMIGAVEL' ? 'Amigável' : 'Direto'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Barra de progresso para agentes em treinamento */}
                                  {(status === 'EM_TREINAMENTO' || status === 'EM_REVISAO') && agente.progresso !== undefined && (
                                    <div className="mt-3 space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Progresso</span>
                                        <span className="font-medium">{agente.progresso}%</span>
                                      </div>
                                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                          className={`h-full ${statusConfig[status as AgenteStatus].progressColor}`} 
                                          style={{ width: `${agente.progresso}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Estatísticas para agentes ativos */}
                                  {agente.estatisticas && (
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                      <div className="bg-slate-50 rounded p-1.5 text-center">
                                        <div className="text-xs text-muted-foreground mb-0.5">Mensagens</div>
                                        <div className="font-medium text-sm flex justify-center items-center gap-1">
                                          <MessagesSquare className="h-3 w-3 text-primary" />
                                          {agente.estatisticas.mensagensRespondidas}
                                        </div>
                                      </div>
                                      <div className="bg-slate-50 rounded p-1.5 text-center">
                                        <div className="text-xs text-muted-foreground mb-0.5">Satisfação</div>
                                        <div className="font-medium text-sm">
                                          {agente.estatisticas.satisfacaoCliente}%
                                        </div>
                                      </div>
                                      <div className="bg-slate-50 rounded p-1.5 text-center">
                                        <div className="text-xs text-muted-foreground mb-0.5">Tempo</div>
                                        <div className="font-medium text-sm flex justify-center items-center gap-1">
                                          <Clock className="h-3 w-3 text-amber-500" />
                                          {agente.estatisticas.tempoMedioResposta}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Botões de ação */}
                                  <div className="flex justify-end mt-3 gap-2 pt-2 border-t">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8 text-xs gap-1 rounded-full"
                                      onClick={() => verDetalhes(agente)}
                                    >
                                      <Settings className="h-3.5 w-3.5" />
                                      Detalhes
                                    </Button>
                                    
                                    {/* Botões para mover entre colunas */}
                                    <div className="flex gap-1">
                                      {status !== 'EM_TREINAMENTO' && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 text-xs px-2"
                                          onClick={() => moverAgente(agente.id, status as AgenteStatus, 'EM_TREINAMENTO')}
                                        >
                                          <BrainCircuit className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      
                                      {status !== 'ATIVO' && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 text-xs px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                          onClick={() => moverAgente(agente.id, status as AgenteStatus, 'ATIVO')}
                                        >
                                          <ChevronUp className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      
                                      {status !== 'DESATIVADO' && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 text-xs px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => moverAgente(agente.id, status as AgenteStatus, 'DESATIVADO')}
                                        >
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
          </div>
        )}
      </DragDropContext>
      
      {/* Diálogo de detalhes do agente */}
      <Dialog open={dialogoDetalhesAberto} onOpenChange={setDialogoDetalhesAberto}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {agenteDetalhes?.emoji || <Bot className="h-5 w-5" />}
              {agenteDetalhes?.nome}
            </DialogTitle>
            <DialogDescription>
              {agenteDetalhes?.descricao}
            </DialogDescription>
          </DialogHeader>
          
          {agenteDetalhes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Tipo</p>
                  <p className="text-sm text-muted-foreground">
                    {agenteDetalhes.tipoAgente === 'VENDAS' ? 'Vendas' :
                     agenteDetalhes.tipoAgente === 'ATENDIMENTO' ? 'Atendimento' :
                     agenteDetalhes.tipoAgente === 'CONSULTORIA' ? 'Consultoria' : 'Personalizado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tom</p>
                  <p className="text-sm text-muted-foreground">
                    {agenteDetalhes.tom === 'FORMAL' ? 'Formal' :
                     agenteDetalhes.tom === 'INFORMAL' ? 'Informal' :
                     agenteDetalhes.tom === 'TECNICO' ? 'Técnico' :
                     agenteDetalhes.tom === 'AMIGAVEL' ? 'Amigável' : 'Direto'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {agenteDetalhes.status === 'EM_TREINAMENTO' ? 'Em Treinamento' :
                     agenteDetalhes.status === 'ATIVO' ? 'Ativo' :
                     agenteDetalhes.status === 'DESATIVADO' ? 'Desativado' : 'Em Revisão'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Criado em</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(agenteDetalhes.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              {agenteDetalhes.estatisticas && (
                <div className="bg-slate-50 p-4 rounded border">
                  <h4 className="text-sm font-medium mb-3">Estatísticas</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Mensagens Respondidas</p>
                      <p className="text-lg font-semibold">{agenteDetalhes.estatisticas.mensagensRespondidas}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Satisfação</p>
                      <p className="text-lg font-semibold">{agenteDetalhes.estatisticas.satisfacaoCliente}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tempo Médio</p>
                      <p className="text-lg font-semibold">{agenteDetalhes.estatisticas.tempoMedioResposta}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button variant="destructive" size="sm" className="gap-1">
              <Trash className="h-4 w-4" />
              Excluir Agente
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Editar</Button>
              <Button size="sm">Atualizar Treinamento</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
