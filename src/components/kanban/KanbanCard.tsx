'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Clock,
  MessageSquare,
  Thermometer,
  Eye,
  MoreHorizontal,
  Phone,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

// Tipos de leads
export type LeadStatus = 'NOVO' | 'CONTATO' | 'INTERESSADO' | 'VISITA' | 'PROPOSTA' | 'CONTRATO' | 'FECHADO' | 'PERDIDO';
export type LeadType = 'COMPRADOR' | 'VENDEDOR' | 'LOCATARIO' | 'LOCADOR' | 'INVESTIDOR';
export type LeadOrigin = 'SITE' | 'SOCIAL_MEDIA' | 'INDICACAO' | 'PORTAL_IMOVEIS' | 'LIGACAO' | 'ANUNCIO' | 'VISITA_ESCRITORIO' | 'OUTROS';

// Interface do lead
export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  statusLead: LeadStatus;
  tipoLead?: LeadType;
  origemLead?: LeadOrigin;
  interesse?: string;
  orcamento?: number;
  temperatura?: number;
  ultimoContato?: string;
  proximoContato?: string;
  observacoes?: string;
  corretorResponsavel?: string;
  corretorResponsavelId?: string;
  fotoPerfil?: string;
  visualizacoes: number;
  mensagensRecebidas: number;
  visualizacoesImoveis: number;
  agendamentosRealizados: number;
  createdAt: string;
  updatedAt: string;
}

// Estilos para cada status de lead
export const leadStatusConfig: Record<LeadStatus, { color: string; bgColor: string; borderColor: string; title: string }> = {
  NOVO: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Novo Lead'
  },
  CONTATO: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'Em Contato'
  },
  INTERESSADO: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    title: 'Interessado'
  },
  VISITA: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    title: 'Visita Agendada'
  },
  PROPOSTA: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    title: 'Proposta'
  },
  CONTRATO: {
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    title: 'Contrato'
  },
  FECHADO: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Negócio Fechado'
  },
  PERDIDO: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'Perdido'
  }
};

// Estilos para cada tipo de lead
export const leadTypeConfig: Record<LeadType, { color: string; bgColor: string }> = {
  COMPRADOR: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  VENDEDOR: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  LOCATARIO: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  LOCADOR: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  INVESTIDOR: {
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  }
};

// Componente para exibir a temperatura do lead
const LeadTemperature = ({ value }: { value: number }) => {
  const getColorClass = (temp: number) => {
    switch (temp) {
      case 1: return 'text-blue-500';
      case 2: return 'text-cyan-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-orange-500';
      case 5: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center" title={`Temperatura: ${value}/5`}>
      <Thermometer className={`h-3.5 w-3.5 ${getColorClass(value)}`} />
      <div className="flex ml-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className={`w-1.5 h-3 rounded-sm mx-px ${i < value ? getColorClass(value) : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
};

// Componente do card do Kanban
export const KanbanCard = ({
  lead,
  onEdit
}: {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: lead.id,
    data: {
      type: 'lead',
      lead
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const statusConfig = leadStatusConfig[lead.statusLead];
  const typeConfig = lead.tipoLead ? leadTypeConfig[lead.tipoLead] : { color: 'text-gray-600', bgColor: 'bg-gray-50' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 touch-manipulation cursor-grab active:cursor-grabbing"
    >
      <Card className={`p-3 border ${statusConfig.borderColor} bg-white shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-sm truncate" title={lead.nome}>{lead.nome}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate" title={lead.email}>{lead.email}</span>
            </div>
            {lead.telefone && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{lead.telefone}</span>
              </div>
            )}
          </div>
          <Badge className={`${typeConfig.color} ${typeConfig.bgColor} ml-1`} variant="outline">
            {lead.tipoLead?.replace('_', ' ')}
          </Badge>
        </div>
        
        {lead.interesse && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2" title={lead.interesse}>
            <span className="font-medium">Interesse:</span> {lead.interesse}
          </p>
        )}
        
        {lead.orcamento && (
          <p className="text-xs text-muted-foreground mb-2">
            <span className="font-medium">Orçamento:</span> {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(lead.orcamento)}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-1.5">
          {lead.temperatura && <LeadTemperature value={lead.temperatura} />}
          
          {lead.ultimoContato && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(lead.ultimoContato).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          {lead.corretorResponsavel ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src={lead.fotoPerfil || ""} alt={lead.corretorResponsavel} />
                    <AvatarFallback className="text-[10px]">{lead.corretorResponsavel?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate max-w-[80px]">{lead.corretorResponsavel}</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-60">
                <div className="flex justify-between space-x-4">
                  <Avatar>
                    <AvatarImage src={lead.fotoPerfil || ""} />
                    <AvatarFallback>{lead.corretorResponsavel?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{lead.corretorResponsavel}</h4>
                    <p className="text-xs">Corretor responsável</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <span className="text-xs text-muted-foreground">Sem corretor</span>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center" title="Mensagens">
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs ml-1">{lead.mensagensRecebidas}</span>
            </div>
            <div className="flex items-center" title="Agendamentos">
              <Calendar className="h-3 w-3" />
              <span className="text-xs ml-1">{lead.agendamentosRealizados}</span>
            </div>
            <div className="flex items-center" title="Visualizações">
              <Eye className="h-3 w-3" />
              <span className="text-xs ml-1">{lead.visualizacoes}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0 absolute top-1 right-1" title="Mais opções">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit?.(lead)}>
              <Phone className="h-3.5 w-3.5 mr-2" />
              Contatar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="h-3.5 w-3.5 mr-2" />
              Agendar visita
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="h-3.5 w-3.5 mr-2" />
              Ver detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </div>
  );
};

export default KanbanCard;
