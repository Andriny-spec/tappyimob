import { useState } from "react";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCorners
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { AgentCard, AgentCardProps } from "./draggable-agent-card";
import { Badge } from "@/components/ui/badge";
import { createPortal } from "react-dom";

interface KanbanColumnProps {
  title: string;
  color: string;
  agents: AgentCardProps[];
  onDrop?: (items: AgentCardProps[]) => void;
}

const KanbanColumn = ({ title, color, agents, onDrop }: KanbanColumnProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full bg-${color}`}></span>
          {title}
        </h3>
        <Badge variant="outline" className="text-xs">
          {agents.length} {agents.length === 1 ? "agente" : "agentes"}
        </Badge>
      </div>
      
      <div className="space-y-3 min-h-[200px]">
        <SortableContext items={agents.map(a => a.id)} strategy={rectSortingStrategy}>
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const DraggableKanban = () => {
  // Dados iniciais dos agentes
  const [activeAgents, setActiveAgents] = useState<AgentCardProps[]>([
    {
      id: "agent-1",
      name: "AssistenteVendas",
      status: "ativo",
      channels: ["WhatsApp"],
      objectives: ["Vendas"],
      trainedDate: "10/03/2025",
      temperature: "0.7"
    },
    {
      id: "agent-2",
      name: "SuporteCliente",
      status: "ativo",
      channels: ["Chat"],
      objectives: ["Suporte"],
      trainedDate: "05/03/2025",
      temperature: "0.5"
    },
    {
      id: "agent-3",
      name: "ConselheiroFinanc",
      status: "ativo",
      channels: ["Instagram"],
      objectives: ["Financeiro"],
      trainedDate: "01/03/2025",
      temperature: "0.6"
    }
  ]);

  const [trainingAgents, setTrainingAgents] = useState<AgentCardProps[]>([
    {
      id: "agent-4",
      name: "ConsultorJur",
      status: "treinamento",
      channels: ["Chat"],
      objectives: ["Jurídico"],
      trainedDate: "12/03/2025",
      progress: 75
    },
    {
      id: "agent-5",
      name: "AtendimentoFB",
      status: "treinamento",
      channels: ["Facebook"],
      objectives: ["Atendimento"],
      trainedDate: "12/03/2025",
      progress: 30
    }
  ]);

  const [inactiveAgents, setInactiveAgents] = useState<AgentCardProps[]>([
    {
      id: "agent-6",
      name: "AgenteLegado",
      status: "desativado",
      channels: ["Chat"],
      objectives: ["Comercial"],
      trainedDate: "28/02/2025"
    }
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Configuração dos sensores para o drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Ativa o drag após mover 8px
      },
    })
  );

  // Encontrar o item ativo em qualquer uma das listas
  const findAgentById = (id: string) => {
    return [...activeAgents, ...trainingAgents, ...inactiveAgents].find(
      (agent) => agent.id === id
    );
  };

  // Manipular o início do arrasto
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  // Manipular o fim do arrasto
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Encontrar as listas de origem e destino
    const activeAgent = findAgentById(active.id as string);
    const overAgent = findAgentById(over.id as string);
    
    if (!activeAgent || !overAgent) {
      setActiveId(null);
      return;
    }

    // Determinar listas de origem e destino
    let sourceList: AgentCardProps[];
    let setSourceList: React.Dispatch<React.SetStateAction<AgentCardProps[]>>;
    let destinationList: AgentCardProps[];
    let setDestinationList: React.Dispatch<React.SetStateAction<AgentCardProps[]>>;
    
    // Definir listas de origem
    if (activeAgent.status === "ativo") {
      sourceList = activeAgents;
      setSourceList = setActiveAgents;
    } else if (activeAgent.status === "treinamento") {
      sourceList = trainingAgents;
      setSourceList = setTrainingAgents;
    } else {
      sourceList = inactiveAgents;
      setSourceList = setInactiveAgents;
    }

    // Definir listas de destino
    if (overAgent.status === "ativo") {
      destinationList = activeAgents;
      setDestinationList = setActiveAgents;
    } else if (overAgent.status === "treinamento") {
      destinationList = trainingAgents;
      setDestinationList = setTrainingAgents;
    } else {
      destinationList = inactiveAgents;
      setDestinationList = setInactiveAgents;
    }

    // Se a origem e destino são os mesmos, reordenar
    if (activeAgent.status === overAgent.status) {
      const oldIndex = sourceList.findIndex((agent) => agent.id === active.id);
      const newIndex = sourceList.findIndex((agent) => agent.id === over.id);
      
      setSourceList(arrayMove(sourceList, oldIndex, newIndex));
    } 
    // Caso contrário, mover entre listas
    else {
      const sourceIndex = sourceList.findIndex((agent) => agent.id === active.id);
      const destinationIndex = destinationList.findIndex((agent) => agent.id === over.id);
      
      // Clonar o item e ajustar o status
      const movedItem = {...sourceList[sourceIndex], status: overAgent.status};
      
      // Remover da lista de origem
      const newSourceList = [...sourceList];
      newSourceList.splice(sourceIndex, 1);
      setSourceList(newSourceList);
      
      // Adicionar à lista de destino
      const newDestinationList = [...destinationList];
      newDestinationList.splice(destinationIndex, 0, movedItem);
      setDestinationList(newDestinationList);
    }
    
    setActiveId(null);
  };

  // Componente para renderizar o overlay durante o arrasto
  const DragOverlayItem = () => {
    if (!activeId) return null;
    
    const agent = findAgentById(activeId as string);
    if (!agent) return null;
    
    return createPortal(
      <DragOverlay>
        <AgentCard agent={agent} />
      </DragOverlay>,
      document.body
    );
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn 
          title="Ativos" 
          color="green-500" 
          agents={activeAgents}
        />
        
        <KanbanColumn 
          title="Em Treinamento" 
          color="amber-500" 
          agents={trainingAgents}
        />
        
        <KanbanColumn 
          title="Desativados" 
          color="slate-400" 
          agents={inactiveAgents}
        />
      </div>
      
      <DragOverlayItem />
    </DndContext>
  );
};
