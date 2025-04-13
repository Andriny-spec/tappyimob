'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCenter,
  PointerSensor,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard, { Lead, LeadStatus, leadStatusConfig } from './KanbanCard';

interface KanbanBoardProps {
  initialLeads: Lead[];
  onLeadUpdate?: (updatedLead: Lead) => void;
  onAddNewLead?: (status: LeadStatus) => void;
  onEditLead?: (lead: Lead) => void;
}

const KanbanBoard = ({
  initialLeads,
  onLeadUpdate,
  onAddNewLead,
  onEditLead
}: KanbanBoardProps) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  // Configurar sensores para arrastar e soltar
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  // Agrupar leads por status
  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.statusLead === status);
  };

  // Ordenar as colunas na ordem do fluxo de vendas
  const columnOrder: LeadStatus[] = [
    'NOVO',
    'CONTATO',
    'INTERESSADO',
    'VISITA',
    'PROPOSTA',
    'CONTRATO',
    'FECHADO',
    'PERDIDO'
  ];

  // Manipuladores de eventos DnD
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'lead') {
      setActiveLead(active.data.current.lead);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const activeLead = active.data.current?.lead as Lead;
    const activeLeadId = active.id;
    
    // Se estiver arrastando sobre uma coluna
    if (over.data.current?.type === 'column') {
      const newStatus = over.data.current.status as LeadStatus;
      
      // Não faz nada se o status já for o mesmo
      if (activeLead.statusLead === newStatus) return;
      
      setLeads(currentLeads => {
        return currentLeads.map(lead => {
          if (lead.id === activeLeadId) {
            const updatedLead = { ...lead, statusLead: newStatus };
            // Notificar o componente pai sobre a atualização
            if (onLeadUpdate) {
              setTimeout(() => onLeadUpdate(updatedLead), 0);
            }
            return updatedLead;
          }
          return lead;
        });
      });

      toast({
        title: "Lead movido",
        description: `Lead ${activeLead.nome} movido para ${leadStatusConfig[newStatus].title}`,
        duration: 2000,
      });
    }
    
    // Se estiver reordenando dentro da mesma coluna
    if (over.data.current?.type === 'lead') {
      const overLead = over.data.current.lead as Lead;
      
      // Somente reordenar se estiverem na mesma coluna
      if (activeLead.statusLead === overLead.statusLead) {
        setLeads(currentLeads => {
          const activeIndex = currentLeads.findIndex(l => l.id === activeLeadId);
          const overIndex = currentLeads.findIndex(l => l.id === over.id);
          
          return arrayMove(currentLeads, activeIndex, overIndex);
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    // Já tratamos a lógica no handleDragOver
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-4 px-1 pt-2 min-h-[calc(100vh-240px)]">
        {columnOrder.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={getLeadsByStatus(status)}
            onAddNew={onAddNewLead}
            onEdit={onEditLead}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && <KanbanCard lead={activeLead} />}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
