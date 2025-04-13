'use client';

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import KanbanCard, { Lead, LeadStatus, leadStatusConfig } from './KanbanCard';

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onAddNew?: (status: LeadStatus) => void;
  onEdit?: (lead: Lead) => void;
}

export const KanbanColumn = ({
  status,
  leads,
  onAddNew,
  onEdit
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status
    }
  });

  const columnRef = useRef<HTMLDivElement>(null);
  const statusConfig = leadStatusConfig[status];

  return (
    <Card className="w-[320px] min-w-[320px] mx-0.5 border shadow bg-white/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className={`py-2.5 px-3 flex flex-row items-center justify-between ${statusConfig.bgColor} border-b`}>
        <div className="flex items-center">
          <CardTitle className={`text-sm font-medium ${statusConfig.color}`}>
            {statusConfig.title}
          </CardTitle>
          <Badge className="ml-2 bg-white text-xs font-normal" variant="outline">
            {leads.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onAddNew?.(status)}
          title={`Adicionar em ${statusConfig.title}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2 flex-grow overflow-hidden">
        <div 
          ref={setNodeRef} 
          className="h-full min-h-[200px]"
        >
          <ScrollArea className="h-[calc(100vh-250px)]">
            <SortableContext
              id={status}
              items={leads.map(lead => lead.id)}
              strategy={verticalListSortingStrategy}
            >
              {leads.map((lead) => (
                <KanbanCard 
                  key={lead.id} 
                  lead={lead} 
                  onEdit={onEdit}
                />
              ))}

              {leads.length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 border border-dashed rounded-md mt-2 text-center p-2">
                  <p className="text-xs text-muted-foreground">Sem leads neste estágio</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-7 text-xs"
                    onClick={() => onAddNew?.(status)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar lead
                  </Button>
                </div>
              )}
            </SortableContext>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanColumn;
