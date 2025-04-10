import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface AgentCardProps {
  id: string;
  name: string;
  status: "ativo" | "treinamento" | "desativado";
  channels: string[];
  objectives: string[];
  trainedDate?: string;
  temperature?: string;
  progress?: number;
}

export const AgentCard = ({ agent }: { agent: AgentCardProps }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const getStatusBadge = () => {
    switch (agent.status) {
      case "ativo":
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case "treinamento":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Treinando</Badge>;
      case "desativado":
        return <Badge variant="outline" className="text-slate-500 bg-slate-100">Desativado</Badge>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded-lg p-3 bg-white hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full ${agent.status === "desativado" ? "bg-slate-200" : "bg-primary/10"} flex items-center justify-center`}>
            <Bot className={`h-4 w-4 ${agent.status === "desativado" ? "text-slate-500" : "text-primary"}`} />
          </div>
          <h4 className="font-medium">{agent.name}</h4>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="flex gap-1 mb-3">
        {agent.channels.map((channel, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className={`text-xs ${agent.status === "desativado" ? "text-slate-500" : ""}`}
          >
            {channel}
          </Badge>
        ))}
        {agent.objectives.map((objective, index) => (
          <Badge 
            key={`obj-${index}`} 
            variant="outline" 
            className={`text-xs ${agent.status === "desativado" ? "text-slate-500" : ""}`}
          >
            {objective}
          </Badge>
        ))}
      </div>
      
      {agent.status === "treinamento" ? (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Iniciado: {agent.trainedDate}</span>
          <div className="flex items-center gap-1">
            <span>{agent.progress}%</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full">
              <div 
                className="h-1.5 bg-amber-500 rounded-full" 
                style={{ width: `${agent.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : agent.status === "desativado" ? (
        <div className="flex justify-between text-xs text-slate-500">
          <span>Desativado em: {agent.trainedDate}</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 py-0 text-xs">
            Reativar
          </Button>
        </div>
      ) : (
        <div className="flex justify-between text-xs text-slate-500">
          <span>Treinado em: {agent.trainedDate}</span>
          <span>Temp: {agent.temperature}</span>
        </div>
      )}
    </div>
  );
};
