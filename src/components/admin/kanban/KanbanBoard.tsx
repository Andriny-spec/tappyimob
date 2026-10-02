"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiLoader4Line } from "react-icons/ri";
import { KanbanColumn as ColumnType, Lead, LeadStatus, leadStatusColors, AutomationRule } from "@/types/lead";
import { useFollowUpDays } from "@/hooks/useFollowUpDays";
import { KanbanColumn } from "./KanbanColumn";
import { AddLeadModal } from "./modals/AddLeadModal";
import { ColorPickerModal } from "./modals/ColorPickerModal";
import { AutomationModal } from "./modals/AutomationModal";
import { AIAnalysisModal } from "./modals/AIAnalysisModal";
import { NotesModal } from "./modals/NotesModal";
import { TagsModal } from "./modals/TagsModal";
import { ScheduleModal } from "./modals/ScheduleModal";
import { BudgetModal } from "./modals/BudgetModal";
import { ContractModal } from "./modals/ContractModal";
import { LeadDetailModal } from "./modals/LeadDetailModal";
import { ChecklistModal } from "./modals/ChecklistModal";
import ArchiveLeadModal from "./modals/ArchiveLeadModal";
import UnarchiveLeadModal from "./modals/UnarchiveLeadModal";
import { ScheduleVisitModal } from "@/components/admin/ScheduleVisitModal";

// Fallback columns (used only if API fails)
const fallbackColumns: ColumnType[] = [
  { id: "col-1", title: "Novos", status: "NOVO", color: leadStatusColors.NOVO, icon: "inbox", order: 1, automationEnabled: false, automationRules: [], leads: [] },
  { id: "col-2", title: "Contatados", status: "CONTATADO", color: leadStatusColors.CONTATADO, icon: "phone", order: 2, automationEnabled: false, automationRules: [], leads: [] },
  { id: "col-3", title: "Qualificados", status: "QUALIFICADO", color: leadStatusColors.QUALIFICADO, icon: "star", order: 3, automationEnabled: false, automationRules: [], leads: [] },
  { id: "col-4", title: "Em Negociação", status: "NEGOCIANDO", color: leadStatusColors.NEGOCIANDO, icon: "handshake", order: 4, automationEnabled: false, automationRules: [], leads: [] },
  { id: "col-5", title: "Fechados", status: "FECHADO", color: leadStatusColors.FECHADO, icon: "check", order: 5, automationEnabled: false, automationRules: [], leads: [] },
];

// Default empty lead structure for new leads
const createDefaultLead = (partial: Partial<Lead>): Lead => ({
  id: partial.id || "",
  name: partial.name || "",
  email: partial.email || "",
  phone: partial.phone || "",
  message: partial.message || null,
  status: partial.status || "NOVO",
  source: partial.source || "SITE",
  score: partial.score || 50,
  probability: partial.probability || 50,
  ticket: partial.ticket || "COMPRA",
  temperature: partial.temperature || "MORNO",
  profile: partial.profile || "COMPRADOR",
  hasPermuta: partial.hasPermuta || false,
  permutaValue: partial.permutaValue || null,
  permutaLocation: partial.permutaLocation || null,
  permutaDescription: partial.permutaDescription || null,
  permutaPropertyCode: partial.permutaPropertyCode || null,
  permutaType: partial.permutaType || null,
  permutaCity: partial.permutaCity || null,
  permutaNeighborhood: partial.permutaNeighborhood || null,
  permutaBedrooms: partial.permutaBedrooms || null,
  permutaArea: partial.permutaArea || null,
  directInstallment: partial.directInstallment || false,
  rentalGuarantees: partial.rentalGuarantees || [],
  searchTypologies: partial.searchTypologies || [],
  searchSubtype: partial.searchSubtype || null,
  searchBedrooms: partial.searchBedrooms || null,
  searchFurnished: partial.searchFurnished ?? null,
  condominiumsOfInterest: partial.condominiumsOfInterest || [],
  budget: partial.budget || null,
  minBudget: partial.minBudget || null,
  maxBudget: partial.maxBudget || null,
  hasFinancing: false,
  financingApproved: false,
  approvedAmount: null,
  preferredPayment: null,
  bantBudget: 0,
  bantAuthority: 0,
  bantNeed: 0,
  bantTimeline: 0,
  tags: partial.tags || [],
  notes: [],
  schedules: [],
  contracts: [],
  aiAnalysis: null,
  propertyId: partial.propertyId || null,
  property: partial.property || null,
  corretorId: partial.corretorId || null,
  corretor: partial.corretor || null,
  createdAt: partial.createdAt || new Date().toISOString(),
  updatedAt: partial.updatedAt || new Date().toISOString(),
  lastContact: partial.lastContact || null,
  nextFollowUp: partial.nextFollowUp || null,
  archivedAt: partial.archivedAt || null,
  archivedReason: partial.archivedReason || null,
  archivedById: partial.archivedById || null,
  previousStatus: partial.previousStatus || null,
});

// Mock leads
const mockLeads: Lead[] = [
  createDefaultLead({
    id: "lead-1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    message: "Interessado no apartamento",
    status: "NOVO",
    source: "SITE",
    score: 85,
    probability: 75,
    budget: 500000,
    tags: ["vip", "financiamento"],
    propertyId: "1",
    property: {
      id: "1",
      code: "IMB00001",
      title: "Apartamento 3 quartos",
      price: 450000,
      thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200",
    },
    corretorId: "1",
    corretor: { id: "1", name: "Maria Corretora", avatar: null },
    lastContact: new Date().toISOString(),
    nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  createDefaultLead({
    id: "lead-2",
    name: "Ana Santos",
    email: "ana@email.com",
    phone: "(11) 98888-8888",
    message: "Procuro casa em condomínio",
    status: "CONTATADO",
    source: "WHATSAPP",
    score: 72,
    probability: 60,
    budget: 800000,
    tags: ["primeira_compra"],
    corretorId: "1",
    corretor: { id: "1", name: "Maria Corretora", avatar: null },
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  createDefaultLead({
    id: "lead-3",
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    phone: "(11) 97777-7777",
    message: "Investidor procurando oportunidade",
    status: "QUALIFICADO",
    source: "INDICACAO",
    score: 92,
    probability: 85,
    budget: 2000000,
    tags: ["investidor", "vip"],
    propertyId: "2",
    property: {
      id: "2",
      code: "IMB00002",
      title: "Cobertura Duplex",
      price: 1800000,
      thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
    },
    lastContact: new Date().toISOString(),
    nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  createDefaultLead({
    id: "lead-4",
    name: "Fernanda Lima",
    email: "fernanda@email.com",
    phone: "(11) 96666-6666",
    message: "Negociando proposta",
    status: "NEGOCIANDO",
    source: "SITE",
    score: 88,
    probability: 90,
    budget: 650000,
    tags: ["financiamento", "urgente"],
    propertyId: "1",
    property: {
      id: "1",
      code: "IMB00001",
      title: "Apartamento 3 quartos",
      price: 450000,
      thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200",
    },
    corretorId: "1",
    corretor: { id: "1", name: "Maria Corretora", avatar: null },
    lastContact: new Date().toISOString(),
    nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  }),
];

export interface KanbanFilters {
  search?: string;
  name?: string;
  phone?: string;
  temperature?: string[];
  status?: string[];
  sources?: string[];
  tags?: string[];
  profiles?: string[];
  tickets?: string[];
  corretor?: string;
  hasProperty?: boolean | null;
  hasCorretor?: boolean | null;
  hasPermuta?: boolean | null;
  hasDirectInstallment?: boolean | null;
  hasVisit?: boolean | null;
  hasProposal?: boolean | null;
  typologies?: string[];
  ticketMin?: number;
  ticketMax?: number;
  condominium?: string;
  condominiums?: string[];
  propertyCode?: string;
  dateFrom?: string;
  dateTo?: string;
  overdue?: boolean | null;
  sortOrder?: "newest" | "oldest";
  /** Origem de campanha: busca parcial em utm_source/medium/campaign. */
  campanha?: string;
}

interface KanbanBoardProps {
  highlightAttention?: boolean;
  isAdmin?: boolean;
  filters?: KanbanFilters;
  corretorId?: string;
  scope?: "ADMIN" | "SDR";
  selectionMode?: boolean;
  selectedLeadIds?: Set<string>;
  onToggleLeadSelection?: (leadId: string) => void;
  onAttentionCount?: (count: number) => void;
}

export function KanbanBoard({ highlightAttention = false, isAdmin = false, filters, corretorId, scope = "ADMIN", selectionMode = false, selectedLeadIds, onToggleLeadSelection, onAttentionCount }: KanbanBoardProps) {
  const { days: followUpDaysByTemperature } = useFollowUpDays();
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar colunas do banco e leads da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Buscar colunas salvas no banco
        let baseColumns: ColumnType[] = fallbackColumns;
        try {
          const colRes = await fetch(`/api/admin/leads/columns?scope=${scope}`);
          if (colRes.ok) {
            const colData = await colRes.json();
            if (colData.columns && colData.columns.length > 0) {
              baseColumns = colData.columns.map((col: any) => ({
                id: col.id,
                title: col.title,
                status: col.status as LeadStatus,
                color: col.color,
                icon: col.icon,
                order: col.order,
                automationEnabled: col.automationEnabled,
                automationRules: col.automationRules || [],
                funnelStage: col.funnelStage || null,
                leads: [],
              }));
            }
          }
        } catch (e) {
          console.error("Erro ao buscar colunas, usando fallback:", e);
        }

        // 2. Buscar leads (corretor só vê seus próprios leads)
        if (!isAdmin && !corretorId) {
          // Corretor sem ID carregado: não buscar nada
          setColumns(baseColumns);
          setIsLoading(false);
          return;
        }
        // Filtrar no servidor o que dá para filtrar. O board baixava os 3.293
        // leads (19MB) para exibir 11 — 2.282 deles ARQUIVADO, status que
        // nenhuma coluna mostra. Em conexão lenta a tela ficava vazia esperando
        // o download terminar, e o SDR parecia não ter lead nenhum.
        const leadsParams = new URLSearchParams({ limit: "9999" });
        if (corretorId) leadsParams.set("corretorId", corretorId);

        // Nenhum quadro tem coluna de ARQUIVADO; trazer esses leads é peso puro.
        const mostraArquivado = baseColumns.some((c) => c.status === "ARQUIVADO");
        if (!mostraArquivado) leadsParams.append("excludeStatus", "ARQUIVADO");

        // A recepção do SDR pede só os não atribuídos — vale filtrar na origem.
        if (filters?.hasCorretor === false) leadsParams.set("hasCorretor", "false");
        else if (filters?.hasCorretor === true) leadsParams.set("hasCorretor", "true");

        const res = await fetch(`/api/admin/leads?${leadsParams}`);
        if (res.ok) {
          const data = await res.json();
          let leads = data.leads || [];
          
          // Defense-in-depth: client-side filter to ensure corretor only sees their own leads
          if (corretorId) {
            leads = leads.filter((lead: Lead) => lead.corretorId === corretorId);
          }
          
          setAllLeads(leads);
          
          setColumns(baseColumns.map((col: ColumnType) => ({
            ...col,
            leads: leads.filter((lead: Lead) => lead.status === col.status),
          })));
        } else {
          // On auth error or API failure, show empty columns (never mock data)
          setAllLeads([]);
          setColumns(baseColumns);
        }
      } catch (error) {
        console.error("Erro ao buscar leads:", error);
        setAllLeads([]);
        setColumns(fallbackColumns);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // hasCorretor entra como dependência porque agora vai para o servidor:
    // sem isso, alternar o filtro deixaria o board com um recorte incompleto em
    // cache. É primitivo de propósito — o objeto `filters` é recriado a cada
    // render do pai e provocaria refetch infinito.
  }, [isAdmin, corretorId, filters?.hasCorretor]);

  // Calcular leads em atraso e reportar via callback
  useEffect(() => {
    if (!onAttentionCount || allLeads.length === 0) return;
    const now = new Date();
    const overdueCount = allLeads.filter((lead) => {
      if (lead.status === "ARQUIVADO") return false;
      if (!lead.lastContact) return false;
      const lastContact = new Date(lead.lastContact);
      const diffDays = Math.ceil(Math.abs(now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      const maxDays = followUpDaysByTemperature[lead.temperature || "MORNO"];
      return diffDays > maxDays;
    }).length;
    onAttentionCount(overdueCount);
  }, [allLeads, onAttentionCount]);

  // Aplicar filtros quando mudam
  useEffect(() => {
    if (allLeads.length === 0 || isLoading) return;
    
    let filtered = [...allLeads];
    
    if (filters) {
      // Helper: remover acentos para busca fuzzy
      const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const stripDigits = (str: string) => str.replace(/\D/g, "");
      
      // Busca geral
      if (filters.search) {
        const s = normalize(filters.search);
        const sDigits = stripDigits(filters.search);
        filtered = filtered.filter(l => 
          normalize(l.name || "").includes(s) || 
          normalize(l.email || "").includes(s) || 
          (sDigits && stripDigits(l.phone || "").includes(sDigits))
        );
      }
      // Nome
      if (filters.name) {
        const n = normalize(filters.name);
        filtered = filtered.filter(l => normalize(l.name || "").includes(n));
      }
      // Telefone (comparar apenas dígitos)
      if (filters.phone) {
        const phoneDigits = stripDigits(filters.phone);
        if (phoneDigits) {
          filtered = filtered.filter(l => stripDigits(l.phone || "").includes(phoneDigits));
        }
      }
      // Temperatura
      if (filters.temperature && filters.temperature.length > 0) {
        filtered = filtered.filter(l => filters.temperature!.includes(l.temperature || "MORNO"));
      }
      // Status
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(l => filters.status!.includes(l.status));
      }
      // Origem
      if (filters.sources && filters.sources.length > 0) {
        filtered = filtered.filter(l => filters.sources!.includes(l.source || ""));
      }
      // Tags
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(l => 
          l.tags?.some((t: any) => filters.tags!.includes(typeof t === "string" ? t : t.name))
        );
      }
      // Perfil
      if (filters.profiles && filters.profiles.length > 0) {
        filtered = filtered.filter(l => filters.profiles!.includes((l as any).profile || ""));
      }
      // Finalidade
      if (filters.tickets && filters.tickets.length > 0) {
        filtered = filtered.filter(l => filters.tickets!.includes((l as any).ticket || ""));
      }
      // Corretor específico (filtra por ID ou nome)
      if (filters.corretor) {
        const c = filters.corretor.toLowerCase();
        filtered = filtered.filter(l =>
          l.corretorId === filters.corretor ||
          l.corretor?.name?.toLowerCase().includes(c)
        );
      }
      // Origem de campanha — uma busca só varre source, mídia e campanha,
      // porque na prática se procura "google" ou o nome da campanha, sem
      // saber em qual dos três campos o valor caiu.
      if (filters.campanha) {
        const termo = filters.campanha.toLowerCase();
        filtered = filtered.filter((l) =>
          [
            (l as any).utmSource,
            (l as any).utmMedium,
            (l as any).utmCampaign,
            (l as any).utmContent,
            (l as any).utmTerm,
          ].some((v) => (v || "").toLowerCase().includes(termo))
        );
      }
      // Tem imóvel
      if (filters.hasProperty === true) {
        filtered = filtered.filter(l => l.property != null);
      } else if (filters.hasProperty === false) {
        filtered = filtered.filter(l => l.property == null);
      }
      // Tem corretor
      if (filters.hasCorretor === true) {
        filtered = filtered.filter(l => l.corretorId != null);
      } else if (filters.hasCorretor === false) {
        filtered = filtered.filter(l => l.corretorId == null);
      }
      // Permuta
      if (filters.hasPermuta === true) {
        filtered = filtered.filter(l => (l as any).hasPermuta === true);
      } else if (filters.hasPermuta === false) {
        filtered = filtered.filter(l => (l as any).hasPermuta !== true);
      }
      // Parcelamento direto
      if (filters.hasDirectInstallment === true) {
        filtered = filtered.filter(l => (l as any).directInstallment === true);
      } else if (filters.hasDirectInstallment === false) {
        filtered = filtered.filter(l => (l as any).directInstallment !== true);
      }
      // Tipologias de busca
      if (filters.typologies && filters.typologies.length > 0) {
        filtered = filtered.filter(l => {
          const leadTyp = (l as any).searchTypologies || [];
          return filters.typologies!.some(t => leadTyp.includes(t));
        });
      }
      // Visitas
      if (filters.hasVisit === true) {
        filtered = filtered.filter(l => ((l as any).linkedPropertiesCount?.visitados || 0) > 0 || ((l as any).scheduledVisitsCount || 0) > 0);
      } else if (filters.hasVisit === false) {
        filtered = filtered.filter(l => ((l as any).linkedPropertiesCount?.visitados || 0) === 0 && ((l as any).scheduledVisitsCount || 0) === 0);
      }
      // Propostas
      if (filters.hasProposal === true) {
        filtered = filtered.filter(l => ((l as any).linkedPropertiesCount?.propostas || 0) > 0);
      } else if (filters.hasProposal === false) {
        filtered = filtered.filter(l => ((l as any).linkedPropertiesCount?.propostas || 0) === 0);
      }
      // Ticket de valor
      if (filters.ticketMin && filters.ticketMin > 0) {
        filtered = filtered.filter(l => (l.maxBudget || 0) >= filters.ticketMin!);
      }
      if (filters.ticketMax && filters.ticketMax > 0) {
        filtered = filtered.filter(l => (l.minBudget || Infinity) <= filters.ticketMax!);
      }
      // Condomínio (texto legado)
      if (filters.condominium) {
        const cond = filters.condominium.toLowerCase();
        filtered = filtered.filter(l => 
          (l as any).condominiumsOfInterest?.some((c: any) => 
            (typeof c === "string" ? c : c.name || "").toLowerCase().includes(cond)
          )
        );
      }
      // Condomínios (multi-select, match ANY)
      if (filters.condominiums && filters.condominiums.length > 0) {
        const condSet = filters.condominiums.map(c => c.toLowerCase());
        filtered = filtered.filter(l =>
          (l as any).condominiumsOfInterest?.some((c: any) => {
            const val = (typeof c === "string" ? c : c.name || "").toLowerCase();
            return condSet.some(cs => val.includes(cs));
          })
        );
      }
      // Código do imóvel
      if (filters.propertyCode) {
        const code = filters.propertyCode.toLowerCase();
        filtered = filtered.filter(l =>
          (l as any).property?.code?.toLowerCase().includes(code)
        );
      }
      // Data de criação
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        filtered = filtered.filter(l => new Date(l.createdAt) >= from);
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo + "T23:59:59");
        filtered = filtered.filter(l => new Date(l.createdAt) <= to);
      }
      // Em atraso (usar followUpDaysByTemperature para calcular corretamente)
      if (filters.overdue === true) {
        const now = new Date();
        filtered = filtered.filter(l => {
          if (l.status === "ARQUIVADO") return false;
          const contactDate = l.lastContact || (l as any).lastContactAt || l.createdAt;
          if (!contactDate) return true;
          const diffDays = Math.ceil(Math.abs(now.getTime() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24));
          const maxDays = followUpDaysByTemperature[l.temperature || "MORNO"] || 3;
          return diffDays > maxDays;
        });
      } else if (filters.overdue === false) {
        const now = new Date();
        filtered = filtered.filter(l => {
          if (l.status === "ARQUIVADO") return false;
          const contactDate = l.lastContact || (l as any).lastContactAt || l.createdAt;
          if (!contactDate) return false;
          const diffDays = Math.ceil(Math.abs(now.getTime() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24));
          const maxDays = followUpDaysByTemperature[l.temperature || "MORNO"] || 3;
          return diffDays <= maxDays;
        });
      }
    }
    
    // Aplicar ordenação
    const sortOrder = filters?.sortOrder || "newest";
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });

    setColumns(prev => prev.map(col => ({
      ...col,
      leads: filtered.filter(l => l.status === col.status),
    })));
  }, [filters, allLeads, isLoading]);

  // Modal states
  const [addLeadModal, setAddLeadModal] = useState<{ open: boolean; column: ColumnType | null }>({
    open: false,
    column: null,
  });
  const [colorPickerModal, setColorPickerModal] = useState<{ open: boolean; column: ColumnType | null }>({
    open: false,
    column: null,
  });
  const [automationModal, setAutomationModal] = useState<{ open: boolean; column: ColumnType | null }>({
    open: false,
    column: null,
  });
  const [aiAnalysisModal, setAIAnalysisModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [notesModal, setNotesModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [tagsModal, setTagsModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [budgetModal, setBudgetModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [contractModal, setContractModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [detailModal, setDetailModal] = useState<{ open: boolean; lead: Lead | null; initialTab?: string }>({
    open: false,
    lead: null,
    initialTab: undefined,
  });
  const [archiveModal, setArchiveModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [qualificationModal, setQualificationModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [visitModal, setVisitModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  // unarchiveModal removido - repescar agora é feito na página /admin/clientes/limbo
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Ref for kanban board element (used for openLeadDetail event from birthday cards)
  const kanbanRef = useRef<HTMLDivElement>(null);

  // Listen for openLeadDetail custom event (e.g. from birthday card click)
  useEffect(() => {
    const el = kanbanRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.leadId) {
        const lead = allLeads.find((l) => l.id === detail.leadId);
        if (lead) {
          setDetailModal({ open: true, lead });
        }
      }
    };
    el.addEventListener("openLeadDetail", handler);
    return () => el.removeEventListener("openLeadDetail", handler);
  }, [allLeads]);

  // Column drag-and-drop reorder
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  
  // Mock corretores para repescagem
  const corretores = [
    { id: "1", name: "Maria Corretora", avatar: null },
    { id: "2", name: "João Corretor", avatar: null },
    { id: "3", name: "Ana Vendas", avatar: null },
  ];

  // Handlers
  const handleAddLead = (column: ColumnType) => {
    setAddLeadModal({ open: true, column });
  };

  const handleSaveLead = async (data: any) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: data.source || "SITE",
          ...(corretorId && !data.corretorId ? { corretorId } : {}),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao criar lead");
      }

      const apiLead = await res.json();
      const newLead = createDefaultLead({
        ...apiLead,
        notes: apiLead.notes || [],
        schedules: apiLead.schedules || [],
        contracts: apiLead.contracts || [],
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.status === newLead.status
            ? { ...col, leads: [...col.leads, newLead] }
            : col
        )
      );
      setAllLeads((prev) => [...prev, newLead]);
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      throw error;
    }
  };

  const handleOpenColorPicker = (column: ColumnType) => {
    setColorPickerModal({ open: true, column });
  };

  const handleSaveColor = async (columnId: string, color: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, color } : col))
    );
    // Persistir no banco
    try {
      await fetch("/api/admin/leads/columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: columnId, color }),
      });
    } catch (error) {
      console.error("Erro ao salvar cor da coluna:", error);
    }
  };

  const handleOpenAutomation = (column: ColumnType) => {
    setAutomationModal({ open: true, column });
  };

  const handleSaveAutomation = async (columnId: string, enabled: boolean, rules: AutomationRule[]) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, automationEnabled: enabled, automationRules: rules }
          : col
      )
    );
    // Persistir no banco
    try {
      await fetch("/api/admin/leads/columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: columnId, automationEnabled: enabled, automationRules: rules }),
      });
    } catch (error) {
      console.error("Erro ao salvar automação da coluna:", error);
    }
  };

  const handleUpdateTitle = async (columnId: string, title: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, title } : col))
    );
    // Persistir no banco
    try {
      await fetch("/api/admin/leads/columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: columnId, title }),
      });
    } catch (error) {
      console.error("Erro ao salvar título da coluna:", error);
    }
  };

  const handleUpdateFunnelStage = async (columnId: string, funnelStage: string | null) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, funnelStage } : col))
    );
    try {
      await fetch("/api/admin/leads/columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: columnId, funnelStage }),
      });
    } catch (error) {
      console.error("Erro ao salvar fase do funil:", error);
    }
  };

  // Atalho para mover lead sem arrastar (bug #66)
  const handleMoveToColumn = async (leadId: string, targetColumn: { id: string; title: string; status: string; color: string }) => {
    const fullColumn = columns.find((c) => c.id === targetColumn.id);
    if (fullColumn) await handleDropLead(leadId, fullColumn);
  };

  const handleDropLead = async (leadId: string, targetColumn: ColumnType) => {
    // Guard: verificar se o lead já está na coluna alvo (evita duplicação)
    const sourceColumn = columns.find((col) => col.leads.some((l) => l.id === leadId));
    if (!sourceColumn || sourceColumn.id === targetColumn.id) return;

    await executeDropLead(leadId, targetColumn, sourceColumn);
  };

  const executeDropLead = async (leadId: string, targetColumn: ColumnType, sourceColumn: ColumnType) => {

    // Atualizar estado local imediatamente (optimistic update)
    setColumns((prev) => {
      let movedLead: Lead | null = null;

      // Find and remove lead from ALL columns (previne duplicação)
      const newColumns = prev.map((col) => {
        const hasLead = col.leads.some((l) => l.id === leadId);
        if (hasLead) {
          if (!movedLead) {
            movedLead = { ...col.leads.find((l) => l.id === leadId)!, status: targetColumn.status };
          }
          return {
            ...col,
            leads: col.leads.filter((l) => l.id !== leadId),
          };
        }
        return col;
      });

      // Add lead to target column (only if not already there)
      if (movedLead) {
        return newColumns.map((col) =>
          col.id === targetColumn.id
            ? { ...col, leads: col.leads.some((l) => l.id === leadId) ? col.leads : [...col.leads, movedLead!] }
            : col
        );
      }

      return newColumns;
    });

    // IMPORTANTE: Atualizar allLeads também (source of truth para filtros)
    setAllLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetColumn.status } : l))
    );

    // Salvar no banco de dados
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetColumn.status }),
      });
    } catch (error) {
      console.error("Erro ao salvar posição do lead:", error);
      // Reverter em caso de erro
      setAllLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: sourceColumn.status } : l))
      );
      setColumns((prev) => {
        const lead = prev.flatMap((c) => c.leads).find((l) => l.id === leadId);
        if (!lead) return prev;
        return prev.map((col) => {
          const withoutLead = col.leads.filter((l) => l.id !== leadId);
          if (col.id === sourceColumn.id) return { ...col, leads: [...withoutLead, { ...lead, status: sourceColumn.status }] };
          return { ...col, leads: withoutLead };
        });
      });
    }
  };

  const handleOpenNotes = (lead: Lead) => {
    setNotesModal({ open: true, lead });
  };

  const handleOpenTags = (lead: Lead) => {
    setTagsModal({ open: true, lead });
  };

  const handleOpenSchedule = (lead: Lead) => {
    setScheduleModal({ open: true, lead });
  };

  const handleOpenBudget = (lead: Lead) => {
    setBudgetModal({ open: true, lead });
  };

  const handleOpenContract = (lead: Lead) => {
    setContractModal({ open: true, lead });
  };

  // Save handlers for modals (agora usam API diretamente nos modais)
  const handleSaveTags = async (leadId: string, tags: string[]) => {
    // Update lead tags via API
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        leads: col.leads.map((lead) =>
          lead.id === leadId ? { ...lead, tags } : lead
        ),
      }))
    );
    setAllLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, tags } : l))
    );
  };

  const handleSaveBudget = (leadId: string, budget: any) => {
    // Update lead budget via API
    const budgetUpdate = {
      budget: budget.maxBudget,
      minBudget: budget.minBudget,
      maxBudget: budget.maxBudget,
      hasFinancing: budget.hasFinancing,
      preferredPayment: budget.preferredPayment,
    };
    fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budgetUpdate),
    }).then(() => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          leads: col.leads.map((lead) =>
            lead.id === leadId ? { ...lead, budget: budget.maxBudget, minBudget: budget.minBudget, maxBudget: budget.maxBudget } : lead
          ),
        }))
      );
      setAllLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, budget: budget.maxBudget, minBudget: budget.minBudget, maxBudget: budget.maxBudget } : l))
      );
    });
  };

  const handleSaveContract = (leadId: string, contract: any) => {
    console.log("Contract saved for lead:", leadId, contract);
    // In production, save to API
  };

  const handleOpenAIAnalysis = (lead: Lead) => {
    setAIAnalysisModal({ open: true, lead });
  };

  const handleOpenVisit = (lead: Lead) => {
    setVisitModal({ open: true, lead });
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    // TODO: Implement edit lead modal
  };

  const handleOpenDetail = (lead: Lead) => {
    setDetailModal({ open: true, lead });
  };

  // Abrir modal de qualificação
  const handleOpenQualification = (lead: Lead) => {
    setQualificationModal({ open: true, lead });
  };

  // Arquivar lead
  const handleArchiveLead = async (leadId: string, reason: string, category: string = "perdido") => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, category }),
      });

      if (!res.ok) throw new Error("Erro ao arquivar lead");

      // Remover lead da coluna e do allLeads (vai para o Limbo - página separada)
      setColumns((prev) => {
        return prev.map((col) => {
          const leadIndex = col.leads.findIndex((l) => l.id === leadId);
          if (leadIndex !== -1) {
            return {
              ...col,
              leads: col.leads.filter((l) => l.id !== leadId),
            };
          }
          return col;
        });
      });
      setAllLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (error) {
      console.error("Erro ao arquivar lead:", error);
      throw error;
    }
  };

  // Repescar lead agora é feito na página /admin/clientes/limbo

  // Todas as colunas são visíveis (coluna de arquivo foi removida)
  const visibleColumns = columns;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    if (!isAdmin) return;
    e.dataTransfer.setData("columnId", columnId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedColumnId(columnId);
  };

  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    const data = e.dataTransfer.types;
    if (!data.includes("columnid")) return; // Only handle column drags
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumnId(columnId);
  };

  const handleColumnDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleColumnDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceColumnId = e.dataTransfer.getData("columnId");
    setDraggedColumnId(null);
    setDragOverColumnId(null);

    if (!sourceColumnId || sourceColumnId === targetColumnId) return;

    // Compute the new order before updating state
    const sourceIndex = columns.findIndex((c) => c.id === sourceColumnId);
    const targetIndex = columns.findIndex((c) => c.id === targetColumnId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newColumns = [...columns];
    const [moved] = newColumns.splice(sourceIndex, 1);
    newColumns.splice(targetIndex, 0, moved);
    const reordered = newColumns.map((col, i) => ({ ...col, order: i + 1 }));

    // Update state
    setColumns(reordered);

    // Persist new order to API using the computed order
    try {
      const columnIds = reordered.map((c) => c.id);
      await fetch("/api/admin/leads/columns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnIds }),
      });
    } catch (error) {
      console.error("Erro ao reordenar colunas:", error);
    }
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  return (
    <>
      <div ref={kanbanRef} data-kanban-board className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
        {visibleColumns.map((column) => (
          <div
            key={column.id}
            draggable={isAdmin}
            onDragStart={(e) => handleColumnDragStart(e, column.id)}
            onDragOver={(e) => handleColumnDragOver(e, column.id)}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, column.id)}
            onDragEnd={handleColumnDragEnd}
            className={`transition-all duration-200 ${
              draggedColumnId === column.id ? "opacity-40 scale-95" : ""
            } ${
              dragOverColumnId === column.id && draggedColumnId ? "ring-2 ring-orange-400 ring-dashed rounded-2xl" : ""
            } ${isAdmin ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <KanbanColumn
              column={column}
              onAddLead={handleAddLead}
              onOpenAutomation={handleOpenAutomation}
              onOpenColorPicker={handleOpenColorPicker}
              onUpdateTitle={handleUpdateTitle}
              onUpdateFunnelStage={handleUpdateFunnelStage}
              onDropLead={handleDropLead}
              onOpenNotes={handleOpenNotes}
              onOpenTags={handleOpenTags}
              onOpenSchedule={handleOpenSchedule}
              onOpenBudget={handleOpenBudget}
              onOpenContract={handleOpenContract}
              onOpenAIAnalysis={handleOpenAIAnalysis}
              onEditLead={handleEditLead}
              onOpenDetail={handleOpenDetail}
              onOpenQualification={handleOpenQualification}
              highlightAttention={highlightAttention}
              isArchiveColumn={false}
              isAdmin={isAdmin}
              onArchiveLead={(lead) => setArchiveModal({ open: true, lead })}
              onUnarchiveLead={() => {}}
              selectionMode={selectionMode}
              selectedLeadIds={selectedLeadIds}
              onToggleLeadSelection={onToggleLeadSelection}
              availableColumns={columns.map((c) => ({ id: c.id, title: c.title, status: c.status, color: c.color }))}
              onMoveToColumn={handleMoveToColumn}
            />
          </div>
        ))}
      </div>

      {/* Modals */}
      <AddLeadModal
        isOpen={addLeadModal.open}
        onClose={() => setAddLeadModal({ open: false, column: null })}
        onSave={handleSaveLead}
        defaultStatus={addLeadModal.column?.status}
      />

      <ColorPickerModal
        column={colorPickerModal.column}
        isOpen={colorPickerModal.open}
        onClose={() => setColorPickerModal({ open: false, column: null })}
        onSave={handleSaveColor}
      />

      <AutomationModal
        column={automationModal.column}
        columns={columns}
        isOpen={automationModal.open}
        onClose={() => setAutomationModal({ open: false, column: null })}
        onSave={handleSaveAutomation}
      />

      <AIAnalysisModal
        lead={aiAnalysisModal.lead}
        isOpen={aiAnalysisModal.open}
        onClose={() => setAIAnalysisModal({ open: false, lead: null })}
      />

      <NotesModal
        lead={notesModal.lead}
        isOpen={notesModal.open}
        onClose={() => setNotesModal({ open: false, lead: null })}
      />

      <TagsModal
        lead={tagsModal.lead}
        isOpen={tagsModal.open}
        onClose={() => setTagsModal({ open: false, lead: null })}
        onSave={handleSaveTags}
      />

      <ScheduleModal
        lead={scheduleModal.lead}
        isOpen={scheduleModal.open}
        onClose={() => setScheduleModal({ open: false, lead: null })}
      />

      <BudgetModal
        lead={budgetModal.lead}
        isOpen={budgetModal.open}
        onClose={() => setBudgetModal({ open: false, lead: null })}
        onSave={handleSaveBudget}
      />

      <ContractModal
        lead={contractModal.lead}
        isOpen={contractModal.open}
        onClose={() => setContractModal({ open: false, lead: null })}
        onSave={handleSaveContract}
      />

      <LeadDetailModal
        lead={detailModal.lead}
        isOpen={detailModal.open}
        initialTab={detailModal.initialTab}
        onClose={() => setDetailModal({ open: false, lead: null, initialTab: undefined })}
        onOpenNotes={handleOpenNotes}
        onOpenTags={handleOpenTags}
        onOpenSchedule={handleOpenSchedule}
        onOpenBudget={handleOpenBudget}
        onOpenContract={handleOpenContract}
        onOpenAIAnalysis={handleOpenAIAnalysis}
        onOpenVisit={handleOpenVisit}
        isAdmin={isAdmin}
        onLeadUpdate={(updatedLead) => {
          // Atualizar lead no estado local
          setColumns((prev) =>
            prev.map((col) => ({
              ...col,
              leads: col.leads.map((l) =>
                l.id === updatedLead.id ? { ...l, ...updatedLead } : l
              ),
            }))
          );
          // Atualizar allLeads (source of truth)
          setAllLeads((prev) =>
            prev.map((l) => (l.id === updatedLead.id ? { ...l, ...updatedLead } : l))
          );
          // Atualizar modal com lead atualizado
          setDetailModal({ open: true, lead: updatedLead });
        }}
        onArchiveLead={(lead) => {
          // Fechar modal de detalhes e abrir modal de arquivar
          setDetailModal({ open: false, lead: null });
          setArchiveModal({ open: true, lead });
        }}
        onDeleteLead={isAdmin ? async (leadId) => {
          try {
            const res = await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
            if (res.ok) {
              setColumns((prev) =>
                prev.map((col) => ({
                  ...col,
                  leads: col.leads.filter((l) => l.id !== leadId),
                }))
              );
              setAllLeads((prev) => prev.filter((l) => l.id !== leadId));
            } else {
              alert("Erro ao excluir lead");
            }
          } catch {
            alert("Erro ao excluir lead");
          }
        } : undefined}
      />

      <ArchiveLeadModal
        lead={archiveModal.lead}
        isOpen={archiveModal.open}
        onClose={() => setArchiveModal({ open: false, lead: null })}
        onArchive={handleArchiveLead}
        isAdmin={isAdmin}
      />

      <ChecklistModal
        lead={qualificationModal.lead}
        isOpen={qualificationModal.open}
        onClose={() => setQualificationModal({ open: false, lead: null })}
        onLeadUpdate={(updatedLead: Lead) => {
          // Atualizar lead no estado local
          setColumns((prev) =>
            prev.map((col) => ({
              ...col,
              leads: col.leads.map((l) =>
                l.id === updatedLead.id ? { ...l, ...updatedLead } : l
              ),
            }))
          );
          setAllLeads((prev) =>
            prev.map((l) => (l.id === updatedLead.id ? { ...l, ...updatedLead } : l))
          );
        }}
      />

      {/* UnarchiveLeadModal removido - repescar agora é feito na página /admin/clientes/limbo */}

      {/* Modal de Agendamento de Visita */}
      {visitModal.lead && (
        <ScheduleVisitModal
          isOpen={visitModal.open}
          onClose={() => setVisitModal({ open: false, lead: null })}
          onSuccess={() => {
            setVisitModal({ open: false, lead: null });
            // Recarregar leads se necessário
          }}
          context="lead"
          lead={{
            id: visitModal.lead.id,
            name: visitModal.lead.name,
            email: visitModal.lead.email,
            phone: visitModal.lead.phone,
          }}
          preSelectedProperties={[]}
        />
      )}
    </>
  );
}
