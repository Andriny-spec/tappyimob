'use client';

import { useState, useEffect, useRef, useMemo, FormEvent } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Plus,
  Building2,
  Calendar,
  BarChart3,
  Filter,
  SlidersHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Star,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Tag,
  DollarSign,
  Thermometer,
  MessagesSquare,
  Eye,
  Home,
  Move,
  MoreHorizontal,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

// Definição dos tipos e enums do Prisma
enum StatusLead {
  NOVO = 'NOVO',
  CONTATO = 'CONTATO',
  INTERESSADO = 'INTERESSADO',
  VISITA = 'VISITA',
  PROPOSTA = 'PROPOSTA',
  CONTRATO = 'CONTRATO',
  FECHADO = 'FECHADO',
  PERDIDO = 'PERDIDO',
}

// Definição da estrutura das colunas do Kanban
interface KanbanColumn {
  id: StatusLead;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
}

enum TipoLead {
  COMPRADOR = 'COMPRADOR',
  VENDEDOR = 'VENDEDOR',
  LOCATARIO = 'LOCATARIO',
  LOCADOR = 'LOCADOR',
  INVESTIDOR = 'INVESTIDOR',
}

enum OrigemLead {
  SITE = 'SITE',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  INDICACAO = 'INDICACAO',
  PORTAL_IMOVEIS = 'PORTAL_IMOVEIS',
  LIGACAO = 'LIGACAO',
  ANUNCIO = 'ANUNCIO',
  VISITA_ESCRITORIO = 'VISITA_ESCRITORIO',
  OUTROS = 'OUTROS',
}

// Interface para os dados do cliente/lead
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string;
  
  // Campos CRM
  statusLead?: StatusLead;
  tipoLead?: TipoLead;
  origemLead?: OrigemLead;
  interesse?: string;
  orcamento?: number;
  prazo?: Date;
  observacoes?: string;
  temperatura?: number;
  ultimoContato?: Date;
  proximoContato?: Date;
  corretorResponsavelId?: string;
  corretorResponsavel?: string;
  
  // Métricas
  visualizacoes: number;
  mensagensRecebidas: number;
  visualizacoesImoveis: number;
  agendamentosRealizados: number;
  
  createdAt: Date | string;
  updatedAt: Date | string;
}
