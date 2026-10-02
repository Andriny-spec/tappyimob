"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiWhatsappLine,
  RiPhoneLine,
  RiMailLine,
  RiHome4Line,
  RiUserLine,
  RiCalendarLine,
  RiTimeLine,
  RiFireLine,
  RiFileTextLine,
  RiPriceTag3Line,
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiSparklingLine,
  RiEditLine,
  RiMapPinLine,
  RiBuilding2Line,
  RiAttachmentLine,
  RiHistoryLine,
  RiAddLine,
  RiSendPlaneLine,
  RiEyeLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiInboxArchiveLine,
  RiCalendarCheckLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiExchangeLine,
  RiShieldCheckLine,
  RiSearchLine,
  RiDeleteBinLine,
  RiPushpinLine,
  RiPushpin2Line,
  RiCompassDiscoverLine,
  RiChat3Line,
  RiRouteLine,
} from "react-icons/ri";
import {
  Lead,
  LeadTicket,
  leadTicketLabels,
  leadTicketColors,
  leadTemperatureLabels,
  leadTemperatureColors,
  leadStatusLabels,
  leadStatusColors,
  leadSourceLabels,
  leadProfileLabels,
  leadProfileColors,
  tagColors,
  followUpDaysByTemperature,
} from "@/types/lead";
import { OrigemCampanha } from "@/components/admin/leads/OrigemCampanha";
import { QualificationChecklist, CondominiosInteresse } from "../QualificationChecklist";
import { ChecklistInline } from "../ChecklistInline";

const subtypesByTypology: Record<string, { value: string; label: string }[]> = {
  Apartamento: [
    { value: "APARTAMENTO_PADRAO", label: "Padrão" },
    { value: "APARTAMENTO_COBERTURA", label: "Cobertura" },
    { value: "APARTAMENTO_DUPLEX", label: "Duplex" },
    { value: "APARTAMENTO_GARDEN", label: "Garden" },
    { value: "APARTAMENTO_FLAT", label: "Flat" },
    { value: "APARTAMENTO_STUDIO", label: "Studio" },
    { value: "APARTAMENTO_LOFT", label: "Loft" },
  ],
  Casa: [
    { value: "CASA_TERREA", label: "Térrea" },
    { value: "CASA_SOBRADO", label: "Sobrado" },
    { value: "CASA_DUPLEX", label: "Duplex" },
    { value: "CASA_TRIPLEX", label: "Triplex" },
    { value: "CASA_VILLAGIO", label: "Villagio" },
    { value: "CASA_GEMINADA", label: "Geminada" },
  ],
  Terreno: [
    { value: "TERRENO_PADRAO", label: "Padrão" },
    { value: "TERRENO_ESQUINA", label: "Esquina" },
    { value: "TERRENO_DECLIVE", label: "Declive" },
    { value: "TERRENO_ACLIVE", label: "Aclive" },
    { value: "TERRENO_PLANO", label: "Plano" },
  ],
  Comercial: [
    { value: "SALA_COMERCIAL", label: "Sala Comercial" },
    { value: "LOJA", label: "Loja" },
    { value: "GALPAO", label: "Galpão" },
    { value: "PREDIO_COMERCIAL", label: "Prédio Comercial" },
    { value: "PONTO_COMERCIAL", label: "Ponto Comercial" },
  ],
};

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  initialTab?: string;
  onClose: () => void;
  onOpenNotes?: (lead: Lead) => void;
  onOpenTags?: (lead: Lead) => void;
  onOpenSchedule?: (lead: Lead) => void;
  onOpenBudget?: (lead: Lead) => void;
  onOpenContract?: (lead: Lead) => void;
  onOpenAIAnalysis?: (lead: Lead) => void;
  onOpenVisit?: (lead: Lead) => void;
  onLeadUpdate?: (updatedLead: Lead) => void;
  onArchiveLead?: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  isAdmin?: boolean;
}

export function LeadDetailModal({
  lead,
  isOpen,
  initialTab,
  onClose,
  onOpenNotes,
  onOpenTags,
  onOpenSchedule,
  onOpenBudget,
  onOpenContract,
  onOpenAIAnalysis,
  onOpenVisit,
  onLeadUpdate,
  isAdmin = true,
  onArchiveLead,
  onDeleteLead,
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "cliente" | "qualificacao" | "imoveis" | "compativeis" | "historico" | "anexos">(
    (initialTab as any) || "info"
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentTemperature, setCurrentTemperature] = useState(lead?.temperature || "MORNO");
  const [isUpdatingTemp, setIsUpdatingTemp] = useState(false);
  const [showFullClientData, setShowFullClientData] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: lead?.name || "",
    nickname: (lead as any)?.nickname || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    cpf: (lead as any)?.cpf || "",
    rg: (lead as any)?.rg || "",
    birthDate: (lead as any)?.birthDate || "",
    maritalStatus: (lead as any)?.maritalStatus || "",
    profession: (lead as any)?.profession || "",
    address: (lead as any)?.address || "",
    number: (lead as any)?.number || "",
    complement: (lead as any)?.complement || "",
    neighborhood: (lead as any)?.neighborhood || "",
    city: (lead as any)?.city || "",
    state: (lead as any)?.state || "",
    zipCode: (lead as any)?.zipCode || "",
  });
  const [isSavingClient, setIsSavingClient] = useState(false);
  
  // Estado para ticket de busca editável (De-Até)
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [minBudgetValue, setMinBudgetValue] = useState(lead?.minBudget?.toString() || "");
  const [maxBudgetValue, setMaxBudgetValue] = useState(lead?.maxBudget?.toString() || "");
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Estado para finalidade editável
  const [currentTicket, setCurrentTicket] = useState<LeadTicket>(lead?.ticket || "COMPRA");

  // Estado para condições por finalidade
  const [directInstallment, setDirectInstallment] = useState(lead?.directInstallment || false);
  const [hasFinancing, setHasFinancing] = useState(lead?.hasFinancing || false);
  const [hasPermuta, setHasPermuta] = useState(lead?.hasPermuta || false);
  const [permutaPropertyCode, setPermutaPropertyCode] = useState(lead?.permutaPropertyCode || "");
  const [permutaPropertySearch, setPermutaPropertySearch] = useState<any[]>([]);
  const [permutaSearchOpen, setPermutaSearchOpen] = useState(false);
  const [permutaDescription, setPermutaDescription] = useState(lead?.permutaDescription || "");
  const [permutaType, setPermutaType] = useState(lead?.permutaType || "");
  const [permutaLocation, setPermutaLocation] = useState((lead as any)?.permutaLocation || "");
  const [permutaCity, setPermutaCity] = useState(lead?.permutaCity || "");
  const [permutaNeighborhood, setPermutaNeighborhood] = useState(lead?.permutaNeighborhood || "");
  const [permutaBedrooms, setPermutaBedrooms] = useState(lead?.permutaBedrooms?.toString() || "");
  const [permutaArea, setPermutaArea] = useState(lead?.permutaArea?.toString() || "");
  const [permutaValue, setPermutaValue] = useState(lead?.permutaValue?.toString() || "");
  const [rentalGuarantees, setRentalGuarantees] = useState<string[]>(lead?.rentalGuarantees || []);

  // Estado para perfil de busca
  const [searchTypologies, setSearchTypologies] = useState<string[]>(lead?.searchTypologies || []);
  const [searchSubtypes, setSearchSubtypes] = useState<string[]>(lead?.searchSubtypes || (lead?.searchSubtype ? [lead.searchSubtype] : []));
  const [searchBedrooms, setSearchBedrooms] = useState(lead?.searchBedrooms || "");
  const [searchFurnished, setSearchFurnished] = useState<boolean | null>(lead?.searchFurnished ?? null);

  // Estado para vincular corretor (admin only)
  const [showCorretorPicker, setShowCorretorPicker] = useState(false);
  const [corretorList, setCorretorList] = useState<Array<{ id: string; name: string; email: string; avatar: string | null; leadsCount: number }>>([]);
  const [loadingCorretores, setLoadingCorretores] = useState(false);
  const [assigningCorretor, setAssigningCorretor] = useState(false);
  const [corretorSearch, setCorretorSearch] = useState("");

  // Estado para notas/observações (fetch fresh do server)
  const [fetchedNotes, setFetchedNotes] = useState<Array<{ id: string; content: string; createdAt: string; pinned?: boolean }>>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Estado para atividades da timeline
  const [activities, setActivities] = useState<Array<{ id: string; type: string; description: string; createdAt: string; metadata?: any; user?: { id: string; name: string; avatar?: string | null } | null }>>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [leadCreatedBy, setLeadCreatedBy] = useState<{ id: string; name: string; avatar?: string | null } | null>(null);
  const [leadSource, setLeadSource] = useState<string | null>(null);

  // Atualizar aba quando initialTab mudar
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  // Buscar notas frescas do servidor quando modal abre
  useEffect(() => {
    if (isOpen && lead) {
      setLoadingNotes(true);
      fetch(`/api/admin/leads/${lead.id}/notes`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setFetchedNotes(Array.isArray(data) ? data : []))
        .catch(() => setFetchedNotes([]))
        .finally(() => setLoadingNotes(false));
    }
    if (!isOpen) {
      setFetchedNotes([]);
    }
  }, [isOpen, lead?.id]);

  // Sincronizar estados quando lead prop mudar
  useEffect(() => {
    if (lead) {
      setCurrentTemperature(lead.temperature || "MORNO");
      setCurrentTicket(lead.ticket || "COMPRA");
      setDirectInstallment(lead.directInstallment || false);
      setHasFinancing(lead.hasFinancing || false);
      setHasPermuta(lead.hasPermuta || false);
      setPermutaPropertyCode(lead.permutaPropertyCode || "");
      setPermutaDescription(lead.permutaDescription || "");
      setPermutaType(lead.permutaType || "");
      setPermutaLocation((lead as any).permutaLocation || "");
      setPermutaCity(lead.permutaCity || "");
      setPermutaNeighborhood(lead.permutaNeighborhood || "");
      setPermutaBedrooms(lead.permutaBedrooms?.toString() || "");
      setPermutaArea(lead.permutaArea?.toString() || "");
      setPermutaValue(lead.permutaValue ? formatCurrencyInput((lead.permutaValue * 100).toString()) : "");
      setRentalGuarantees(lead.rentalGuarantees || []);
      setSearchTypologies(lead.searchTypologies || []);
      setSearchSubtypes(lead.searchSubtypes || (lead.searchSubtype ? [lead.searchSubtype] : []));
      setSearchBedrooms(lead.searchBedrooms || "");
      setSearchFurnished(lead.searchFurnished ?? null);
    }
  }, [lead?.id]);

  // Carregar atividades quando abrir a tab de histórico
  useEffect(() => {
    if (activeTab === "historico" && lead && activities.length === 0) {
      setLoadingActivities(true);
      fetch(`/api/admin/leads/${lead.id}/activities`)
        .then(res => res.json())
        .then(data => {
          setActivities(data.activities || []);
          if (data.createdBy) setLeadCreatedBy(data.createdBy);
          if (data.leadSource) setLeadSource(data.leadSource);
        })
        .catch(err => console.error("Erro ao carregar atividades:", err))
        .finally(() => setLoadingActivities(false));
    }
  }, [activeTab, lead, activities.length]);

  // Atualizar temperatura do lead
  const handleUpdateTemperature = async (leadId: string, temperature: "QUENTE" | "MORNO" | "FRIO") => {
    if (isUpdatingTemp) return;
    setIsUpdatingTemp(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temperature }),
      });
      if (res.ok) {
        setCurrentTemperature(temperature);
        const updated = await res.json();
        onLeadUpdate?.(updated);
      }
    } catch (error) {
      console.error("Erro ao atualizar temperatura:", error);
    } finally {
      setIsUpdatingTemp(false);
    }
  };

  // Salvar ticket de busca (De-Até)
  const handleSaveBudget = async () => {
    if (isSavingBudget || !lead) return;
    setIsSavingBudget(true);
    try {
      // Converter de centavos para reais (o input já está formatado)
      const minValue = parseFloat(minBudgetValue.replace(/[^\d]/g, "")) / 100 || 0;
      const maxValue = parseFloat(maxBudgetValue.replace(/[^\d]/g, "")) / 100 || 0;
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minBudget: minValue, maxBudget: maxValue }),
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setIsEditingBudget(false);
        // Atualizar lead no componente pai
        onLeadUpdate?.(updatedLead);
      }
    } catch (error) {
      console.error("Erro ao salvar ticket de busca:", error);
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Salvar campo individual do lead via PATCH
  const handlePatchLead = async (data: Record<string, any>) => {
    if (!lead) return;
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        onLeadUpdate?.(updated);
        return updated;
      }
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    }
    return null;
  };

  // Atualizar finalidade (ticket)
  const handleUpdateTicket = async (ticket: LeadTicket) => {
    setCurrentTicket(ticket);
    await handlePatchLead({ ticket });
  };

  // Toggle garantia locatícia
  const toggleRentalGuarantee = async (guarantee: string) => {
    const updated = rentalGuarantees.includes(guarantee)
      ? rentalGuarantees.filter(g => g !== guarantee)
      : [...rentalGuarantees, guarantee];
    setRentalGuarantees(updated);
    await handlePatchLead({ rentalGuarantees: updated });
  };

  // Toggle tipologia de busca
  const toggleSearchTypology = async (typology: string) => {
    const updated = searchTypologies.includes(typology)
      ? searchTypologies.filter(t => t !== typology)
      : [...searchTypologies, typology];
    setSearchTypologies(updated);
    await handlePatchLead({ searchTypologies: updated });
  };

  // Carregar lista de corretores para atribuição
  const loadCorretores = async () => {
    if (corretorList.length > 0) return;
    setLoadingCorretores(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead?.id}/assign`);
      if (res.ok) {
        const data = await res.json();
        setCorretorList(data.corretores || []);
      }
    } catch (err) {
      console.error("Erro ao carregar corretores:", err);
    } finally {
      setLoadingCorretores(false);
    }
  };

  // Atribuir corretor ao lead
  const handleAssignCorretor = async (corretorId: string) => {
    if (!lead || assigningCorretor) return;
    setAssigningCorretor(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corretorId }),
      });
      if (res.ok) {
        const data = await res.json();
        onLeadUpdate?.(data.lead);
        setShowCorretorPicker(false);
        setCorretorSearch("");
      }
    } catch (err) {
      console.error("Erro ao atribuir corretor:", err);
    } finally {
      setAssigningCorretor(false);
    }
  };

  // Salvar dados do cliente
  const handleSaveClient = async () => {
    if (isSavingClient || !lead) return;
    setIsSavingClient(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientFormData),
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setIsEditingClient(false);
        onLeadUpdate?.(updatedLead);
      }
    } catch (error) {
      console.error("Erro ao salvar dados do cliente:", error);
    } finally {
      setIsSavingClient(false);
    }
  };

  // Formatar input de moeda
  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const number = parseInt(numericValue) / 100;
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  if (!lead) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getDaysSinceLastContact = () => {
    if (!lead.lastContact) return null;
    const lastContact = new Date(lead.lastContact);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = () => {
    const daysSince = getDaysSinceLastContact();
    if (daysSince === null) return false;
    const maxDays = followUpDaysByTemperature[lead.temperature || "MORNO"];
    return daysSince > maxDays;
  };

  // Calcular próximo contato dinamicamente: menor entre prazo por temperatura e tarefa agendada
  const getNextContactDate = (): string | null => {
    const candidates: Date[] = [];

    // 1. Prazo pela temperatura (baseado no último contato)
    const baseDate = lead.lastContact ? new Date(lead.lastContact) : new Date(lead.createdAt);
    const maxDays = followUpDaysByTemperature[lead.temperature || "MORNO"];
    const tempDeadline = new Date(baseDate);
    tempDeadline.setDate(tempDeadline.getDate() + maxDays);
    candidates.push(tempDeadline);

    // 2. Tarefa agendada mais próxima (schedules pendentes no futuro)
    if (lead.schedules && lead.schedules.length > 0) {
      const now = new Date();
      const futureSchedules = lead.schedules
        .filter((s: any) => !s.completed && new Date(s.date) > now)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (futureSchedules.length > 0) {
        candidates.push(new Date(futureSchedules[0].date));
      }
    }

    // 3. nextFollowUp original do lead (se existir)
    if (lead.nextFollowUp) {
      candidates.push(new Date(lead.nextFollowUp));
    }

    if (candidates.length === 0) return null;

    // Retornar a data mais próxima — nunca no passado
    const now = new Date();
    const earliest = candidates.reduce((a, b) => a < b ? a : b);
    const result = earliest < now ? now : earliest;
    return result.toISOString();
  };

  // Mock de imóveis vinculados (em produção viria da API)
  const linkedProperties = [
    { type: "origem", property: lead.property, date: lead.createdAt },
    // Aqui viriam os imóveis enviados, visitados, com proposta, etc.
  ].filter(p => p.property);

  // Timeline combina atividades da API com evento de criação
  const timeline = [
    { type: "created", date: lead.createdAt, description: leadCreatedBy ? `Lead criado por ${leadCreatedBy.name}${leadSource ? ` (origem: ${leadSource})` : ""}` : `Lead criado${leadSource && !leadCreatedBy ? ` automaticamente pelo ${leadSource}` : leadSource ? ` (origem: ${leadSource})` : ""}`, userName: leadCreatedBy?.name || null },
    ...activities.map(a => ({ type: a.type, date: a.createdAt, description: a.description, userName: a.user?.name || null })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-full bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? "max-w-5xl" : "max-w-2xl"}`}
          >
            {/* Header Compacto - Tudo na mesma linha */}
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-neutral-50 to-orange-50/30 dark:from-neutral-800 dark:to-orange-900/10">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Nome e Badges */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white truncate">
                    {lead.name}
                  </h2>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white"
                      style={{ backgroundColor: leadStatusColors[lead.status] }}
                    >
                      {leadStatusLabels[lead.status]}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white flex items-center gap-0.5"
                      style={{ backgroundColor: leadTemperatureColors[lead.temperature || "MORNO"] }}
                    >
                      <RiFireLine className="w-2 h-2" />
                      {leadTemperatureLabels[lead.temperature || "MORNO"]}
                    </span>
                    {isOverdue() && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-100 text-red-600">
                        Atrasado
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Actions - Inline */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={`https://wa.me/55${lead.phone?.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async () => {
                      try {
                        await fetch(`/api/admin/leads/${lead.id}/notes`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ content: "Contato via WhatsApp" }),
                        });
                        onLeadUpdate?.({ ...lead, lastContact: new Date().toISOString() } as any);
                      } catch (err) { console.error(err); }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500 text-white text-[10px] font-medium hover:bg-green-600 transition-colors"
                  >
                    <RiWhatsappLine className="w-3 h-3" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500 text-white text-[10px] font-medium hover:bg-blue-600 transition-colors"
                  >
                    <RiPhoneLine className="w-3 h-3" />
                    Ligar
                  </a>
                  <button
                    onClick={() => onArchiveLead?.(lead)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Arquivar"
                  >
                    <RiInboxArchiveLine className="w-3 h-3" />
                    Arquivar
                  </button>
                  <button
                    onClick={() => onOpenVisit?.(lead)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500 text-white text-[10px] font-medium hover:bg-orange-600 transition-colors"
                    title="Agendar visita"
                  >
                    <RiCalendarLine className="w-3 h-3" />
                    Visita
                  </button>
                  <button
                    onClick={() => onOpenSchedule?.(lead)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500 text-white text-[10px] font-medium hover:bg-blue-600 transition-colors"
                    title="Agendar tarefa"
                  >
                    <RiCalendarLine className="w-3 h-3" />
                    Tarefa
                  </button>
                  {/* Análise IA temporariamente oculta
                  <button
                    onClick={() => onOpenAIAnalysis(lead)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-medium hover:opacity-90 transition-opacity"
                  >
                    <RiSparklingLine className="w-3 h-3" />
                    Análise IA
                  </button>
                  */}
                </div>

                {/* Delete / Expand / Close */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {isAdmin && onDeleteLead && (
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja EXCLUIR o lead "${lead.name}"? Esta ação não pode ser desfeita.`)) {
                          onDeleteLead(lead.id);
                          onClose();
                        }
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors"
                      title="Excluir lead (apenas admin)"
                    >
                      <RiDeleteBinLine className="w-[18px] h-[18px]" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 transition-colors"
                    title={isExpanded ? "Recolher" : "Expandir"}
                  >
                    {isExpanded ? <RiFullscreenExitLine className="w-[18px] h-[18px]" /> : <RiFullscreenLine className="w-[18px] h-[18px]" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 transition-colors"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Próximo Agendamento */}
            {(() => {
              const now = new Date();
              const upcoming = (lead.schedules || [])
                .filter((s) => !s.completed && !s.cancelled && new Date(s.date) >= new Date(now.toISOString().split("T")[0]))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              if (upcoming.length === 0) return null;
              const next = upcoming[0];
              const typeLabels: Record<string, string> = { LIGACAO: "Ligação", REUNIAO: "Reunião", VISITA: "Visita", FOLLOWUP: "Follow-up" };
              const typeColors: Record<string, string> = { LIGACAO: "bg-green-500", REUNIAO: "bg-purple-500", VISITA: "bg-blue-500", FOLLOWUP: "bg-amber-500" };
              const d = new Date(next.date + "T00:00:00");
              const isToday = d.toDateString() === now.toDateString();
              const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
              const isTomorrow = d.toDateString() === tomorrow.toDateString();
              const dateStr = isToday ? "Hoje" : isTomorrow ? "Amanhã" : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
              return (
                <div className={`mx-4 mt-2 mb-1 px-3 py-2 rounded-lg border flex items-center gap-2 ${isToday ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20" : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${typeColors[next.type] || "bg-neutral-400"} ${isToday ? "animate-pulse" : ""}`} />
                  <RiCalendarLine className={`w-3.5 h-3.5 flex-shrink-0 ${isToday ? "text-orange-500" : "text-blue-500"}`} />
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {typeLabels[next.type] || next.type}
                  </span>
                  <span className={`text-xs font-bold ${isToday ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {dateStr}{next.time ? ` às ${next.time}` : ""}
                  </span>
                  {next.notes && (
                    <span className="text-xs text-neutral-500 truncate max-w-[200px]" title={next.notes}>
                      — {next.notes}
                    </span>
                  )}
                  {upcoming.length > 1 && (
                    <span className="text-[10px] text-neutral-400 ml-auto flex-shrink-0">+{upcoming.length - 1}</span>
                  )}
                </div>
              );
            })()}

            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 py-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
              {[
                { id: "info", label: "Qualificação", icon: RiCheckboxCircleLine },
                { id: "cliente", label: "Cliente", icon: RiFileTextLine },
                // { id: "qualificacao", label: "Qualificação (antiga)", icon: RiCheckboxCircleLine }, // Movido para aba "info" renomeada
                { id: "imoveis", label: "Imóveis", icon: RiHome4Line },
                { id: "compativeis", label: "Compatíveis", icon: RiCompassDiscoverLine },
                { id: "historico", label: "Histórico", icon: RiHistoryLine },
                { id: "anexos", label: "Anexos", icon: RiAttachmentLine },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                      : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content - Com barra de rolagem lateral */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              {activeTab === "info" && (
                <div className="space-y-6">
                  {/* 1. Temperatura + Tags */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-emerald-50 dark:from-orange-500/10 dark:to-emerald-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20">
                    <div className="flex gap-2 mb-3">
                      {(["QUENTE", "MORNO", "FRIO"] as const).map((temp) => (
                        <button
                          key={temp}
                          onClick={() => handleUpdateTemperature(lead.id, temp)}
                          disabled={isUpdatingTemp}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${
                            currentTemperature === temp
                              ? temp === "QUENTE"
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                : temp === "MORNO"
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                : "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                              : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-200 dark:border-neutral-600"
                          }`}
                        >
                          {temp === "QUENTE" && <RiFireLine className="w-3 h-3" />}
                          {temp === "MORNO" && <span>🌡️</span>}
                          {temp === "FRIO" && <span>❄️</span>}
                          {leadTemperatureLabels[temp]}
                        </button>
                      ))}
                    </div>

                    {/* Perfil e Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {(["COMPRADOR", "INVESTIDOR", "CONSTRUTOR"] as const).map((p) => {
                        const isActive = (lead.profile || "COMPRADOR") === p;
                        return (
                          <button
                            key={p}
                            onClick={() => handlePatchLead({ profile: p })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isActive ? "text-white shadow-sm" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:opacity-80"}`}
                            style={isActive ? { backgroundColor: leadProfileColors[p] } : {}}
                          >
                            {leadProfileLabels[p]}
                          </button>
                        );
                      })}
                      {lead.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white group/tag"
                          style={{ backgroundColor: tagColors[tag] || "#6b7280" }}
                        >
                          {tag}
                          {isAdmin && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const updatedTags = lead.tags.filter((t) => t !== tag);
                              try {
                                const res = await fetch(`/api/admin/leads/${lead.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ tags: updatedTags }),
                                });
                                if (res.ok) {
                                  const updated = await res.json();
                                  onLeadUpdate?.(updated);
                                }
                              } catch (err) {
                                console.error("Erro ao remover tag:", err);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors opacity-60 hover:opacity-100"
                            title="Remover tag"
                          >
                            <RiCloseLine className="w-3 h-3" />
                          </button>
                          )}
                        </span>
                      ))}
                      <button
                        onClick={() => onOpenTags?.(lead)}
                        className="px-2 py-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
                      >
                        + Tag
                      </button>
                    </div>
                  </div>

                  {/* 2. Finalidade */}
                  <div className="p-4 rounded-xl border-2" style={{ borderColor: leadTicketColors[currentTicket], backgroundColor: `${leadTicketColors[currentTicket]}08` }}>
                    <h3 className="text-xs font-semibold text-neutral-500 mb-2.5">Finalidade</h3>
                    <div className="flex gap-2">
                      {([
                        { key: "COMPRA" as const, label: "Compra" },
                        { key: "LOCACAO" as const, label: "Locação" },
                      ]).map((opt) => {
                        const isActive = currentTicket === opt.key || currentTicket === "AMBOS";
                        return (
                          <button
                            key={opt.key}
                            onClick={() => {
                              const other = opt.key === "COMPRA" ? "LOCACAO" : "COMPRA";
                              const otherActive = currentTicket === other || currentTicket === "AMBOS";
                              let newTicket: "COMPRA" | "LOCACAO" | "AMBOS";
                              if (isActive) {
                                newTicket = otherActive ? other : opt.key;
                              } else {
                                newTicket = otherActive ? "AMBOS" : opt.key;
                              }
                              handleUpdateTicket(newTicket);
                            }}
                            className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? "text-white shadow-lg"
                                : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 border border-neutral-200 dark:border-neutral-600"
                            }`}
                            style={isActive ? { backgroundColor: leadTicketColors[opt.key], boxShadow: `0 4px 14px ${leadTicketColors[opt.key]}40` } : {}}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {currentTicket === "AMBOS" && (
                      <p className="text-xs text-emerald-600 mt-2 font-medium">Cliente procura compra e locação</p>
                    )}
                  </div>

                  {/* 3. Ticket de Busca */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RiMoneyDollarCircleLine className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-neutral-500">Ticket de Busca</span>
                      </div>
                      {isEditingBudget ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={minBudgetValue}
                            onChange={(e) => setMinBudgetValue(formatCurrencyInput(e.target.value))}
                            placeholder="De"
                            className="w-24 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-white dark:bg-neutral-900 border border-green-300 dark:border-green-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                            autoFocus
                          />
                          <span className="text-xs text-neutral-400">até</span>
                          <input
                            type="text"
                            value={maxBudgetValue}
                            onChange={(e) => setMaxBudgetValue(formatCurrencyInput(e.target.value))}
                            placeholder="Até"
                            className="w-24 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-white dark:bg-neutral-900 border border-green-300 dark:border-green-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveBudget();
                              if (e.key === "Escape") {
                                setIsEditingBudget(false);
                                setMinBudgetValue(lead.minBudget?.toString() || "");
                                setMaxBudgetValue(lead.maxBudget?.toString() || "");
                              }
                            }}
                          />
                          <button
                            onClick={handleSaveBudget}
                            disabled={isSavingBudget}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            <RiCheckLine className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingBudget(false);
                              setMinBudgetValue(lead.minBudget?.toString() || "");
                              setMaxBudgetValue(lead.maxBudget?.toString() || "");
                            }}
                            className="p-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-500 rounded-lg hover:bg-neutral-300"
                          >
                            <RiCloseLine className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="flex items-center gap-1.5 group"
                          onClick={() => {
                            setIsEditingBudget(true);
                            setMinBudgetValue(lead.minBudget ? formatCurrencyInput((lead.minBudget * 100).toString()) : "");
                            setMaxBudgetValue(lead.maxBudget ? formatCurrencyInput((lead.maxBudget * 100).toString()) : "");
                          }}
                        >
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {lead.minBudget || lead.maxBudget 
                              ? `${lead.minBudget ? formatPrice(lead.minBudget) : "?"} - ${lead.maxBudget ? formatPrice(lead.maxBudget) : "?"}`
                              : lead.property?.price
                                ? formatPrice(lead.property.price)
                                : "Não informado"}
                          </span>
                          {!lead.minBudget && !lead.maxBudget && lead.property?.price && (
                            <span className="text-[9px] text-neutral-400 italic">(imóvel de entrada)</span>
                          )}
                          <RiEditLine className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4. Follow-up */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiCalendarLine className="w-4 h-4 text-orange-500" />
                      Follow-up
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-xl ${isOverdue() ? "bg-red-50 dark:bg-red-500/10" : "bg-neutral-50 dark:bg-neutral-800"}`}>
                        <p className="text-xs text-neutral-500 mb-1">
                          Último Contato
                          {!lead.lastContact && <span className="ml-1 text-[10px] text-neutral-400">(última atualização)</span>}
                        </p>
                        <p className={`text-sm font-medium ${isOverdue() ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"}`}>
                          {formatDateTime(lead.lastContact || lead.updatedAt)}
                        </p>
                      </div>
                      {(() => {
                        const nextDate = getNextContactDate();
                        const isPast = nextDate && new Date(nextDate) < new Date();
                        return (
                          <div className={`p-3 rounded-xl ${isPast ? "bg-red-50 dark:bg-red-500/10" : "bg-neutral-50 dark:bg-neutral-800"}`}>
                            <p className="text-xs text-neutral-500 mb-1">Próximo Contato</p>
                            <p className={`text-sm font-medium ${isPast ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-white"}`}>
                              {formatDateTime(nextDate)}
                              {isPast && " ⚠️"}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 5. Visitação */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiMapPinLine className="w-4 h-4 text-blue-500" />
                      Visitação
                    </h3>
                    {(() => {
                      const hasVisit = (lead as any).visitStage && (lead as any).visitStage !== "nenhuma";
                      const scheduledVisits = (lead.schedules || []).filter((s: any) => s.type === "VISITA" || s.type === "VISITA_IMOVEL");
                      const hasAnyVisit = hasVisit || scheduledVisits.length > 0;
                      return (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${
                          hasAnyVisit
                            ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700"
                        }`}>
                          <RiMapPinLine className={`w-4 h-4 flex-shrink-0 ${hasAnyVisit ? "text-green-500" : "text-neutral-400"}`} />
                          <span>
                            {hasAnyVisit
                              ? scheduledVisits.length > 0
                                ? `${scheduledVisits.length} visita${scheduledVisits.length !== 1 ? "s" : ""} agendada${scheduledVisits.length !== 1 ? "s" : ""}`
                                : "Já teve visita"
                              : "Nenhuma visita realizada"}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 6. Imóvel de Entrada */}
                  {lead.property && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {lead.property.thumbnail && (
                            <img 
                              src={lead.property.thumbnail} 
                              alt="" 
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-[10px] text-neutral-500">Imóvel de entrada</p>
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                              {lead.property.code}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-orange-500">
                          {formatPrice(lead.property.price)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Mensagem enviada pelo cliente no formulário do site */}
                  {(lead as any).message && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                        <RiChat3Line className="w-3 h-3" /> Mensagem do cliente
                      </p>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-line">{(lead as any).message}</p>
                    </div>
                  )}

                  {/* Origem — qual formulário/botão o cliente acessou */}
                  {(() => {
                    const SOURCE_LABELS: Record<string, string> = {
                      SITE: "Formulário do site", CAPTACAO: "Quero vender / Captação",
                      AVALIACAO: "Avaliação de imóvel", PRESENCIAL: "Atendimento presencial",
                      WHATSAPP: "WhatsApp", INDICACAO: "Indicação", PORTAL: "Portal imobiliário",
                    };
                    const TAG_ORIGEM: Record<string, string> = {
                      OFF_MARKET_COMPRADOR: "Off Market — Comprador",
                      OFF_MARKET_PROPRIETARIO: "Off Market — Proprietário",
                      OFF_MARKET: "Off Market",
                      INTERESSE_IMOVEL: "Interesse em imóvel (single)",
                      VENDA_IMOVEL: "Anunciar imóvel",
                      AVALIACAO_IMOVEL: "Avaliação",
                      LANCAMENTO: "Lançamento",
                      POPUP: "Popup do site",
                      BANNER: "Banner",
                    };
                    const origemTags = (lead.tags || []).filter((t) => TAG_ORIGEM[t]);
                    const botaoAcessado = origemTags.length > 0 ? TAG_ORIGEM[origemTags[0]] : (SOURCE_LABELS[(lead as any).source] || (lead as any).source || "—");
                    return (
                      <div className="p-3 bg-sky-50 dark:bg-sky-500/10 rounded-xl border border-sky-200 dark:border-sky-500/20">
                        <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <RiRouteLine className="w-3 h-3" /> Caminho do cliente
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between gap-2">
                            <span className="text-neutral-500">Acessou via</span>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200 text-right">{botaoAcessado}</span>
                          </div>
                          {(lead as any).source && (
                            <div className="flex justify-between gap-2">
                              <span className="text-neutral-500">Origem</span>
                              <span className="font-medium text-neutral-700 dark:text-neutral-300 text-right">{SOURCE_LABELS[(lead as any).source] || (lead as any).source}</span>
                            </div>
                          )}
                          {lead.property && (
                            <div className="flex justify-between gap-2">
                              <span className="text-neutral-500">Imóvel de entrada</span>
                              <span className="font-medium text-purple-600 dark:text-purple-400 text-right">{lead.property.code}</span>
                            </div>
                          )}
                        </div>

                        <OrigemCampanha lead={lead} />
                      </div>
                    );
                  })()}

                  {/* 6. Condomínios de Interesse */}
                  <CondominiosInteresse leadId={lead.id} initialCondominios={lead.condominiumsOfInterest || []} />

                  {/* 7. Condições */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 space-y-3">
                      <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <RiPriceTag3Line className="w-3.5 h-3.5" />
                        Condições
                      </h3>

                      {/* Botões de condições */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={async () => {
                            const newVal = !hasFinancing;
                            setHasFinancing(newVal);
                            await handlePatchLead({ hasFinancing: newVal });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            hasFinancing
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-blue-300"
                          }`}
                        >
                          Financiamento
                        </button>
                        <button
                          onClick={async () => {
                            const newVal = !directInstallment;
                            setDirectInstallment(newVal);
                            await handlePatchLead({ directInstallment: newVal });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            directInstallment
                              ? "bg-blue-500 text-white shadow-md"
                              : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-blue-300"
                          }`}
                        >
                          Parcelamento direto
                        </button>
                        {(() => {
                          const hasLancamento = lead.tags.includes("LANCAMENTO");
                          return (
                            <button
                              onClick={async () => {
                                const updatedTags = hasLancamento
                                  ? lead.tags.filter(t => t !== "LANCAMENTO")
                                  : [...lead.tags, "LANCAMENTO"];
                                await handlePatchLead({ tags: updatedTags });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                hasLancamento
                                  ? "bg-indigo-500 text-white shadow-md"
                                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-300"
                              }`}
                            >
                              Lançamento
                            </button>
                          );
                        })()}
                        {(() => {
                          const hasInvestimento = lead.tags.includes("INVESTIMENTO");
                          return (
                            <button
                              onClick={async () => {
                                const updatedTags = hasInvestimento
                                  ? lead.tags.filter(t => t !== "INVESTIMENTO")
                                  : [...lead.tags, "INVESTIMENTO"];
                                await handlePatchLead({ tags: updatedTags });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                hasInvestimento
                                  ? "bg-emerald-500 text-white shadow-md"
                                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-300"
                              }`}
                            >
                              Investimento
                            </button>
                          );
                        })()}
                        <button
                          onClick={async () => {
                            const newVal = !hasPermuta;
                            setHasPermuta(newVal);
                            await handlePatchLead({ hasPermuta: newVal });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                            hasPermuta
                              ? "bg-pink-500 text-white shadow-md"
                              : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-pink-300"
                          }`}
                        >
                          <RiExchangeLine className="w-3.5 h-3.5" />
                          Permuta
                        </button>
                      </div>

                      {/* Detalhes da Permuta */}
                      <div className="space-y-2">

                        {hasPermuta && (
                          <div className="ml-4 space-y-2">
                            {/* Tipo do imóvel */}
                            <div>
                              <label className="text-[10px] text-neutral-500 mb-1 block">Tipo do imóvel</label>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { key: "APARTAMENTO", label: "Apartamento" },
                                  { key: "CASA", label: "Casa" },
                                  { key: "TERRENO", label: "Terreno" },
                                  { key: "COMERCIAL", label: "Comercial" },
                                  { key: "VEICULO", label: "Veículo" },
                                ].map((t) => (
                                  <button
                                    key={t.key}
                                    onClick={async () => {
                                      const val = permutaType === t.key ? "" : t.key;
                                      setPermutaType(val);
                                      await handlePatchLead({ permutaType: val || null });
                                    }}
                                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                                      permutaType === t.key
                                        ? "bg-pink-500 text-white shadow-sm"
                                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-pink-300"
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Valor + Área */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-500 mb-1 block">Valor da permuta (R$)</label>
                                <input
                                  type="text"
                                  value={permutaValue}
                                  onChange={(e) => setPermutaValue(formatCurrencyInput(e.target.value))}
                                  onBlur={() => {
                                    const num = parseFloat(permutaValue.replace(/\./g, "").replace(",", "."));
                                    handlePatchLead({ permutaValue: !isNaN(num) ? num : null });
                                  }}
                                  placeholder="R$ 0,00"
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-500 mb-1 block">Área (m²)</label>
                                <input
                                  type="text"
                                  value={permutaArea}
                                  onChange={(e) => setPermutaArea(e.target.value.replace(/[^\d.,]/g, ""))}
                                  onBlur={() => handlePatchLead({ permutaArea: permutaArea ? parseFloat(permutaArea.replace(",", ".")) : null })}
                                  placeholder="Ex: 85"
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
                                />
                              </div>
                            </div>

                            {/* Local */}
                            <div>
                              <label className="text-[10px] text-neutral-500 mb-1 block">Local</label>
                              <div className="flex flex-wrap gap-1.5">
                                {["Sua Cidade", "São Paulo", "Interior", "Litoral"].map((loc) => (
                                  <button
                                    key={loc}
                                    onClick={async () => {
                                      const val = permutaLocation === loc ? "" : loc;
                                      setPermutaLocation(val);
                                      await handlePatchLead({ permutaLocation: val || null } as any);
                                    }}
                                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                                      permutaLocation === loc
                                        ? "bg-pink-500 text-white shadow-sm"
                                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-pink-300"
                                    }`}
                                  >
                                    {loc}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Dormitórios */}
                            <div>
                              <label className="text-[10px] text-neutral-500 mb-1 block">Dormitórios</label>
                              <div className="flex gap-1">
                                {["1", "2", "3", "4", "5+"].map((d) => (
                                  <button
                                    key={d}
                                    onClick={async () => {
                                      const val = permutaBedrooms === d ? "" : d;
                                      setPermutaBedrooms(val);
                                      await handlePatchLead({ permutaBedrooms: val ? parseInt(val) : null });
                                    }}
                                    className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${
                                      permutaBedrooms === d
                                        ? "bg-pink-500 text-white shadow-sm"
                                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-pink-300"
                                    }`}
                                  >
                                    {d}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Descrição + Código */}
                            <div>
                              <label className="text-[10px] text-neutral-500 mb-1 block">Descrição adicional</label>
                              <input
                                type="text"
                                value={permutaDescription}
                                onChange={(e) => setPermutaDescription(e.target.value)}
                                onBlur={() => handlePatchLead({ permutaDescription: permutaDescription || null })}
                                placeholder="Ex: Apartamento em bom estado, 2 vagas"
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                            <div className="relative">
                              <label className="text-[10px] text-neutral-500 mb-1 block">Código do imóvel (se cadastrado)</label>
                              <input
                                type="text"
                                value={permutaPropertyCode}
                                onChange={async (e) => {
                                  const val = e.target.value;
                                  setPermutaPropertyCode(val);
                                  if (val.length >= 2) {
                                    try {
                                      const res = await fetch(`/api/properties?search=${encodeURIComponent(val)}&limit=5&fields=id,code,title,address,neighborhood,city,price`);
                                      if (res.ok) {
                                        const data = await res.json();
                                        setPermutaPropertySearch(data.properties || data || []);
                                        setPermutaSearchOpen(true);
                                      }
                                    } catch {}
                                  } else {
                                    setPermutaPropertySearch([]);
                                    setPermutaSearchOpen(false);
                                  }
                                }}
                                onBlur={() => {
                                  setTimeout(() => setPermutaSearchOpen(false), 200);
                                  handlePatchLead({ permutaPropertyCode: permutaPropertyCode || null });
                                }}
                                onFocus={() => { if (permutaPropertySearch.length > 0) setPermutaSearchOpen(true); }}
                                placeholder="Digite o código ou endereço..."
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
                              />
                              {permutaSearchOpen && permutaPropertySearch.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                  {permutaPropertySearch.map((p: any) => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setPermutaPropertyCode(p.code);
                                        setPermutaSearchOpen(false);
                                        handlePatchLead({ permutaPropertyCode: p.code });
                                      }}
                                    >
                                      <span className="font-mono font-semibold text-pink-600">{p.code}</span>
                                      <span className="text-neutral-500 ml-1.5">{p.title || p.address || ""}</span>
                                      {p.neighborhood && <span className="text-neutral-400 ml-1">· {p.neighborhood}</span>}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  {(currentTicket === "LOCACAO" || currentTicket === "AMBOS") && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20 space-y-3">
                      <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                        <RiShieldCheckLine className="w-3.5 h-3.5" />
                        Garantia Locatícia
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "FIADOR", label: "Fiador" },
                          { key: "CAUCAO", label: "Caução" },
                          { key: "SEGURO_FIANCA", label: "Seguro Fiança" },
                          { key: "TITULO_CAPITALIZACAO", label: "Título de Capitalização" },
                          { key: "CARTA_FIANCA", label: "Carta Fiança" },
                        ].map((g) => (
                          <button
                            key={g.key}
                            onClick={() => toggleRentalGuarantee(g.key)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              rentalGuarantees.includes(g.key)
                                ? "bg-purple-500 text-white shadow-md"
                                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-purple-300"
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Perfil de Busca */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3">
                    <h3 className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <RiSearchLine className="w-3.5 h-3.5 text-orange-500" />
                      Perfil de Busca
                    </h3>

                    {/* Tipologia - espelha PropertyType do cadastro de imóveis */}
                    <div>
                      <label className="text-[10px] text-neutral-500 mb-1.5 block">Tipologia</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Apartamento", "Casa", "Terreno", "Cobertura", "Studio", "Comercial", "Flat", "Sobrado", "Loft"].map((tipo) => (
                          <button
                            key={tipo}
                            onClick={() => toggleSearchTypology(tipo)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                              searchTypologies.includes(tipo)
                                ? "bg-orange-500 text-white shadow-sm"
                                : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600 hover:border-orange-300"
                            }`}
                          >
                            {tipo}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtipo - expande apenas subtipos compatíveis com tipologias selecionadas */}
                    {searchTypologies.some(t => subtypesByTypology[t]) && (
                      <div>
                        <label className="text-[10px] text-neutral-500 mb-1.5 block">Subtipo</label>
                        <div className="flex flex-wrap gap-1.5">
                          {searchTypologies.flatMap(t => subtypesByTypology[t] || []).map((sub) => (
                            <button
                              key={sub.value}
                              onClick={async () => {
                                const updated = searchSubtypes.includes(sub.value)
                                  ? searchSubtypes.filter(s => s !== sub.value)
                                  : [...searchSubtypes, sub.value];
                                setSearchSubtypes(updated);
                                await handlePatchLead({ searchSubtypes: updated });
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                                searchSubtypes.includes(sub.value)
                                  ? "bg-orange-500 text-white shadow-sm"
                                  : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600 hover:border-orange-300"
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dormitórios + Mobiliário - layout compacto */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] text-neutral-500 whitespace-nowrap">Dorms</label>
                        <div className="flex gap-0.5">
                          {["1", "2", "3", "4", "5+"].map((d) => (
                            <button
                              key={d}
                              onClick={async () => {
                                const val = searchBedrooms === d ? "" : d;
                                setSearchBedrooms(val);
                                await handlePatchLead({ searchBedrooms: val || null });
                              }}
                              className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${
                                searchBedrooms === d
                                  ? "bg-orange-500 text-white shadow-sm"
                                  : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600"
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700" />
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] text-neutral-500 whitespace-nowrap">Mobiliado</label>
                        <div className="flex gap-0.5">
                          {[
                            { val: true, label: "Sim" },
                            { val: false, label: "Não" },
                          ].map((opt) => (
                            <button
                              key={String(opt.val)}
                              onClick={async () => {
                                setSearchFurnished(opt.val);
                                await handlePatchLead({ searchFurnished: opt.val });
                              }}
                              className={`px-2.5 h-7 rounded-md text-[11px] font-medium transition-all ${
                                searchFurnished === opt.val
                                  ? "bg-orange-500 text-white shadow-sm"
                                  : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 8.5 Corretor Vinculado (admin only, na aba info) */}
                  {isAdmin && (
                    <div className="space-y-2">
                      {lead.corretor ? (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {lead.corretor.avatar ? (
                              <img src={lead.corretor.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              lead.corretor.name?.charAt(0) || "C"
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-blue-500 font-medium">Corretor Vinculado</p>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{lead.corretor.name}</p>
                          </div>
                          <button
                            onClick={() => { setShowCorretorPicker(!showCorretorPicker); if (!showCorretorPicker) loadCorretores(); }}
                            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500 transition-colors"
                            title="Trocar corretor"
                          >
                            <RiExchangeLine className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setShowCorretorPicker(!showCorretorPicker); if (!showCorretorPicker) loadCorretores(); }}
                          className="w-full flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 border-dashed hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                        >
                          <RiAddLine className="w-5 h-5 text-amber-500" />
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Vincular Corretor</span>
                        </button>
                      )}

                      {/* Picker de corretor */}
                      {showCorretorPicker && (
                        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg overflow-hidden">
                          <div className="p-2 border-b border-neutral-100 dark:border-neutral-700">
                            <div className="relative">
                              <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                              <input
                                type="text"
                                value={corretorSearch}
                                onChange={(e) => setCorretorSearch(e.target.value)}
                                placeholder="Buscar corretor..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {loadingCorretores ? (
                              <div className="p-4 text-center text-sm text-neutral-500">Carregando...</div>
                            ) : (
                              corretorList
                                .filter((c) => !corretorSearch || c.name.toLowerCase().includes(corretorSearch.toLowerCase()))
                                .map((corretor) => (
                                  <button
                                    key={corretor.id}
                                    onClick={() => handleAssignCorretor(corretor.id)}
                                    disabled={assigningCorretor || corretor.id === lead.corretor?.id}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b last:border-0 border-neutral-100 dark:border-neutral-700 transition-colors ${corretor.id === lead.corretor?.id ? "opacity-50 bg-blue-50/50 dark:bg-blue-500/5" : ""}`}
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                      {corretor.avatar ? (
                                        <img src={corretor.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                      ) : (
                                        corretor.name.charAt(0)
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{corretor.name}</p>
                                      <p className="text-[10px] text-neutral-500">{corretor.leadsCount} leads ativos</p>
                                    </div>
                                    {corretor.id === lead.corretor?.id && (
                                      <RiCheckLine className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    )}
                                  </button>
                                ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 9. Observações */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        <RiHistoryLine className="w-4 h-4 text-orange-500" />
                        Observações
                      </h3>
                    </div>
                    {/* Caixa de nova observação inline */}
                    <div className="mb-3">
                      <div className="relative">
                        <textarea
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (!newNoteText.trim() || savingNote) return;
                              setSavingNote(true);
                              try {
                                const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ content: newNoteText.trim() }),
                                });
                                if (res.ok) {
                                  const note = await res.json();
                                  setFetchedNotes(prev => [note, ...prev]);
                                  setNewNoteText("");
                                  onLeadUpdate?.({ ...lead, lastContact: new Date().toISOString() } as any);
                                }
                              } catch (err) { console.error(err); }
                              finally { setSavingNote(false); }
                            }
                          }}
                          placeholder="Escreva uma nova observação..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/5 border border-yellow-200 dark:border-yellow-500/20 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                        />
                        <button
                          onClick={async () => {
                            if (!newNoteText.trim() || savingNote) return;
                            setSavingNote(true);
                            try {
                              const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ content: newNoteText.trim() }),
                              });
                              if (res.ok) {
                                const note = await res.json();
                                setFetchedNotes(prev => [note, ...prev]);
                                setNewNoteText("");
                                onLeadUpdate?.({ ...lead, lastContact: new Date().toISOString() } as any);
                              }
                            } catch (err) { console.error(err); }
                            finally { setSavingNote(false); }
                          }}
                          disabled={!newNoteText.trim() || savingNote}
                          className="absolute right-2 bottom-2 px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {savingNote ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">Enter para salvar • Shift+Enter para nova linha</p>
                    </div>
                    {loadingNotes ? (
                      <p className="text-sm text-neutral-400 italic">Carregando...</p>
                    ) : (fetchedNotes.length > 0 || (lead.notes && lead.notes.length > 0)) ? (
                      <div className="relative max-h-64 overflow-y-auto">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-yellow-200 dark:bg-yellow-500/30" />
                        <div className="space-y-3">
                          {(fetchedNotes.length > 0 ? fetchedNotes : lead.notes || []).map((note: any) => (
                            <div key={note.id} className="relative flex items-start gap-3 pl-7">
                              <div className={`absolute left-1.5 top-2 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 z-10 ${note.pinned ? 'bg-orange-500' : 'bg-yellow-400 dark:bg-yellow-500'}`} />
                              <div className={`flex-1 p-3 rounded-xl border ${note.pinned ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300 flex-1">{note.content}</p>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ noteId: note.id, pinned: !note.pinned }),
                                        });
                                        if (res.ok) {
                                          setFetchedNotes(prev => {
                                            const updated = prev.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n);
                                            return updated.sort((a, b) => {
                                              if (a.pinned && !b.pinned) return -1;
                                              if (!a.pinned && b.pinned) return 1;
                                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                            });
                                          });
                                        }
                                      } catch (err) { console.error(err); }
                                    }}
                                    className={`flex-shrink-0 p-1 rounded-lg transition-colors ${note.pinned ? 'text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20' : 'text-neutral-400 hover:text-orange-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                                    title={note.pinned ? 'Desfixar observação' : 'Fixar observação'}
                                  >
                                    {note.pinned ? <RiPushpin2Line className="w-3.5 h-3.5" /> : <RiPushpinLine className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {note.pinned && <span className="text-[10px] font-semibold text-orange-500">FIXADA</span>}
                                  {(note as any).author && (
                                    <span className="text-[10px] text-neutral-500 flex items-center gap-0.5">
                                      <RiUserLine className="w-2.5 h-2.5" />{(note as any).author.name}
                                    </span>
                                  )}
                                  <p className="text-[10px] text-neutral-400">{formatDateTime(note.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 italic">Nenhuma observação registrada</p>
                    )}
                  </div>

                  {/* 10. Checklist */}
                  <ChecklistInline leadId={lead.id} />

                </div>
              )}

              {activeTab === "cliente" && (
                <div className="space-y-4">
                  {/* Header com botão de edição */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <RiUserLine className="w-4 h-4 text-orange-500" />
                      Dados do Cliente
                    </h3>
                    {!isEditingClient ? (
                      <button
                        onClick={() => {
                          setClientFormData({
                            name: lead.name || "",
                            nickname: (lead as any).nickname || "",
                            email: lead.email || "",
                            phone: lead.phone || "",
                            cpf: (lead as any).cpf || "",
                            rg: (lead as any).rg || "",
                            birthDate: (lead as any).birthDate ? new Date((lead as any).birthDate).toISOString().split('T')[0] : "",
                            maritalStatus: (lead as any).maritalStatus || "",
                            profession: (lead as any).profession || "",
                            address: (lead as any).address || "",
                            number: (lead as any).number || "",
                            complement: (lead as any).complement || "",
                            neighborhood: (lead as any).neighborhood || "",
                            city: (lead as any).city || "",
                            state: (lead as any).state || "",
                            zipCode: (lead as any).zipCode || "",
                            contact2Name: (lead as any).contact2Name || "",
                            contact2Phone: (lead as any).contact2Phone || "",
                            contact2Role: (lead as any).contact2Role || "",
                          } as any);
                          setIsEditingClient(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                      >
                        <RiEditLine className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveClient}
                          disabled={isSavingClient}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RiCheckLine className="w-3.5 h-3.5" />
                          Salvar
                        </button>
                        <button
                          onClick={() => setIsEditingClient(false)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <RiCloseLine className="w-3.5 h-3.5" />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dados Básicos - Sempre visíveis */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Nome</p>
                        {isEditingClient ? (
                          <input
                            type="text"
                            value={clientFormData.name}
                            onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                          />
                        ) : (
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{lead.name || "-"}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Apelido</p>
                        {isEditingClient ? (
                          <input
                            type="text"
                            value={clientFormData.nickname}
                            onChange={(e) => setClientFormData({ ...clientFormData, nickname: e.target.value })}
                            placeholder="1º nome ou apelido"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                          />
                        ) : (
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{(lead as any).nickname || "-"}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Telefone</p>
                        {isEditingClient ? (
                          <input
                            type="text"
                            value={clientFormData.phone}
                            onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                          />
                        ) : (
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{lead.phone || "-"}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">E-mail</p>
                      {isEditingClient ? (
                        <input
                          type="email"
                          value={clientFormData.email}
                          onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                        />
                      ) : (
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{lead.email || "-"}</p>
                      )}
                    </div>
                  </div>

                  {/* Segundo Contato (família/acompanhante) */}
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Segundo Contato</span>
                      {!(lead as any).contact2Name && !isEditingClient && (
                        <button
                          onClick={() => setIsEditingClient(true)}
                          className="text-xs text-orange-500 hover:underline"
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                    {(isEditingClient || (lead as any).contact2Name || (lead as any).contact2Phone) && (
                      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Nome</p>
                            {isEditingClient ? (
                              <input
                                type="text"
                                value={(clientFormData as any).contact2Name || ""}
                                onChange={(e) => setClientFormData({ ...clientFormData, contact2Name: e.target.value } as any)}
                                placeholder="Ex: Maria Silva"
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                              />
                            ) : (
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">{(lead as any).contact2Name || "-"}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Relação</p>
                            {isEditingClient ? (
                              <select
                                value={(clientFormData as any).contact2Role || ""}
                                onChange={(e) => setClientFormData({ ...clientFormData, contact2Role: e.target.value } as any)}
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                              >
                                <option value="">Selecionar</option>
                                <option value="Cônjuge">Cônjuge</option>
                                <option value="Sócio">Sócio</option>
                                <option value="Familiar">Familiar</option>
                                <option value="Representante">Representante</option>
                              </select>
                            ) : (
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">{(lead as any).contact2Role || "-"}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Telefone</p>
                          {isEditingClient ? (
                            <input
                              type="text"
                              value={(clientFormData as any).contact2Phone || ""}
                              onChange={(e) => setClientFormData({ ...clientFormData, contact2Phone: e.target.value } as any)}
                              placeholder="(00) 00000-0000"
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                            />
                          ) : (lead as any).contact2Phone ? (
                            <a
                              href={`https://wa.me/55${(lead as any).contact2Phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1"
                            >
                              <RiPhoneLine className="w-3.5 h-3.5" />
                              {(lead as any).contact2Phone}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">-</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dados Pessoais - Expansível */}
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowFullClientData(!showFullClientData)}
                      className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Dados Pessoais e Endereço</span>
                      {showFullClientData ? (
                        <RiArrowUpSLine className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <RiArrowDownSLine className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                    
                    {showFullClientData && (
                      <div className="p-4 space-y-4 border-t border-neutral-200 dark:border-neutral-700">
                        {/* Documentos */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">CPF</p>
                            {isEditingClient ? (
                              <input
                                type="text"
                                value={clientFormData.cpf}
                                onChange={(e) => setClientFormData({ ...clientFormData, cpf: e.target.value })}
                                placeholder="000.000.000-00"
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                              />
                            ) : (
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">{(lead as any).cpf || "-"}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">RG</p>
                            {isEditingClient ? (
                              <input
                                type="text"
                                value={clientFormData.rg}
                                onChange={(e) => setClientFormData({ ...clientFormData, rg: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                              />
                            ) : (
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">{(lead as any).rg || "-"}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Data de Nascimento</p>
                            {isEditingClient ? (
                              <input
                                type="date"
                                value={clientFormData.birthDate}
                                onChange={(e) => setClientFormData({ ...clientFormData, birthDate: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                              />
                            ) : (
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                {(lead as any).birthDate ? formatDate((lead as any).birthDate) : "-"}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Estado Civil</p>
                            {isEditingClient ? (
                              <select
                                value={clientFormData.maritalStatus}
                                onChange={(e) => setClientFormData({ ...clientFormData, maritalStatus: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                              >
                                <option value="">Selecione</option>
                                <option value="solteiro">Solteiro(a)</option>
                                <option value="casado">Casado(a)</option>
                                <option value="divorciado">Divorciado(a)</option>
                                <option value="viuvo">Viúvo(a)</option>
                                <option value="uniao_estavel">União Estável</option>
                              </select>
                            ) : (
                              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                {(lead as any).maritalStatus ? ({
                                  solteiro: "Solteiro(a)",
                                  casado: "Casado(a)",
                                  divorciado: "Divorciado(a)",
                                  viuvo: "Viúvo(a)",
                                  uniao_estavel: "União Estável",
                                } as Record<string, string>)[(lead as any).maritalStatus] || (lead as any).maritalStatus : "-"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-neutral-500 mb-1">Profissão</p>
                          {isEditingClient ? (
                            <input
                              type="text"
                              value={clientFormData.profession}
                              onChange={(e) => setClientFormData({ ...clientFormData, profession: e.target.value })}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                            />
                          ) : (
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{(lead as any).profession || "-"}</p>
                          )}
                        </div>

                        {/* Endereço */}
                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <p className="text-xs font-medium text-neutral-500 mb-3 flex items-center gap-1">
                            <RiMapPinLine className="w-3.5 h-3.5" />
                            Endereço
                          </p>
                          
                          {isEditingClient ? (
                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <div className="w-32">
                                  <input
                                    type="text"
                                    value={clientFormData.zipCode}
                                    onChange={(e) => setClientFormData({ ...clientFormData, zipCode: e.target.value.replace(/\D/g, "") })}
                                    placeholder="CEP"
                                    maxLength={8}
                                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-3">
                                  <input
                                    type="text"
                                    value={clientFormData.address}
                                    onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                                    placeholder="Endereço"
                                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                  />
                                </div>
                                <div>
                                  <input
                                    type="text"
                                    value={clientFormData.number}
                                    onChange={(e) => setClientFormData({ ...clientFormData, number: e.target.value })}
                                    placeholder="Nº"
                                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={clientFormData.complement}
                                  onChange={(e) => setClientFormData({ ...clientFormData, complement: e.target.value })}
                                  placeholder="Complemento"
                                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                />
                                <input
                                  type="text"
                                  value={clientFormData.neighborhood}
                                  onChange={(e) => setClientFormData({ ...clientFormData, neighborhood: e.target.value })}
                                  placeholder="Bairro"
                                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                  <input
                                    type="text"
                                    value={clientFormData.city}
                                    onChange={(e) => setClientFormData({ ...clientFormData, city: e.target.value })}
                                    placeholder="Cidade"
                                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={clientFormData.state}
                                  onChange={(e) => setClientFormData({ ...clientFormData, state: e.target.value })}
                                  placeholder="UF"
                                  maxLength={2}
                                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-neutral-900 dark:text-white">
                              {[(lead as any).address, (lead as any).number, (lead as any).complement, (lead as any).neighborhood, (lead as any).city, (lead as any).state, (lead as any).zipCode].filter(Boolean).join(", ") || "Não informado"}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Origem e Datas */}
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiTimeLine className="w-4 h-4 text-orange-500" />
                      Origem e Datas
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        <p className="text-xs text-neutral-500 mb-1">Origem</p>
                        <select
                          value={lead.source || ""}
                          onChange={async (e) => {
                            await handlePatchLead({ source: e.target.value });
                          }}
                          className="w-full text-sm font-medium text-neutral-900 dark:text-white bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-pointer"
                        >
                          <option value="">-</option>
                          <optgroup label="Portais Imobiliários">
                            <option value="IMOVELWEB">Imóvel Web</option>
                            <option value="ZAP_IMOVEIS">ZAP Imóveis</option>
                            <option value="OLX">OLX</option>
                            <option value="CHAVES_NA_MAO">Chaves na Mão</option>
                            <option value="MERCADO_LIVRE">Mercado Livre</option>
                            <option value="VIVA_REAL">Viva Real</option>
                            <option value="ATTRIA">Attria</option>
                            <option value="PORTAIS">Portais (outros)</option>
                          </optgroup>
                          <optgroup label="Redes Sociais">
                            <option value="INSTAGRAM_TAPPY_ORGANICO">Instagram Tappy (Orgânico)</option>
                            <option value="INSTAGRAM_TAPPY_ADS">Instagram Tappy (Ads)</option>
                            <option value="INSTAGRAM_PESSOAL_ORGANICO">Instagram Pessoal (Orgânico)</option>
                            <option value="INSTAGRAM_PESSOAL_ADS">Instagram Pessoal (Ads)</option>
                            <option value="FACEBOOK_GROUPS">Facebook Groups</option>
                            <option value="INSTAGRAM">Instagram</option>
                            <option value="FACEBOOK">Facebook</option>
                            <option value="TIKTOK">TikTok</option>
                            <option value="YOUTUBE">YouTube</option>
                            <option value="REDES_SOCIAIS">Redes Sociais (outros)</option>
                          </optgroup>
                          <optgroup label="Mídia Paga">
                            <option value="GOOGLE_ADS">Google Ads</option>
                            <option value="GOOGLE">Google</option>
                            <option value="META_ADS">Meta Ads</option>
                          </optgroup>
                          <optgroup label="Canais Diretos">
                            <option value="SITE">Site</option>
                            <option value="WHATSAPP">WhatsApp</option>
                            <option value="EMAIL">E-mail</option>
                            <option value="TELEFONE">Telefone</option>
                            <option value="PRESENCIAL">Presencial</option>
                            <option value="INDICACAO">Indicação</option>
                            <option value="PARCERIA_CORRETOR">Parceria Corretor</option>
                          </optgroup>
                          <optgroup label="Offline">
                            <option value="PLACA">Placa</option>
                            <option value="OPEN_HOUSE">Open House</option>
                            <option value="PLANTAO">Plantão</option>
                            <option value="EVENTO">Evento</option>
                          </optgroup>
                          <option value="OUTROS">Outros</option>
                        </select>
                      </div>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        <p className="text-xs text-neutral-500 mb-1">Criado em</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{formatDate(lead.createdAt)}</p>
                      </div>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        <p className="text-xs text-neutral-500 mb-1">Última atualização</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{formatDate((lead as any).updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Orçamento removido da guia cliente - agora está na guia informações como "Ticket de Busca" */}

                  {/* Endereço */}
                  {((lead as any).address || (lead as any).city || (lead as any).state) && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiMapPinLine className="w-4 h-4 text-orange-500" />
                        Endereço
                      </h3>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {[(lead as any).address, (lead as any).neighborhood, (lead as any).city, (lead as any).state].filter(Boolean).join(", ") || "-"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Corretor Responsável */}
                  {lead.corretor && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiUserLine className="w-4 h-4 text-orange-500" />
                        Corretor Responsável
                      </h3>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                          {lead.corretor.avatar ? (
                            <img src={lead.corretor.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            lead.corretor.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{lead.corretor.name}</p>
                          {lead.corretor.email && (
                            <p className="text-xs text-neutral-500">{lead.corretor.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flags de Automação - apenas para admins */}
                  {isAdmin && <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiMailLine className="w-4 h-4 text-orange-500" />
                      Preferências de Comunicação
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🚫</span>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">Não contactar</p>
                            <p className="text-xs text-neutral-500">Excluir de ligações e WhatsApp</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={(lead as any).doNotContact || false}
                          onChange={async (e) => {
                            try {
                              const res = await fetch(`/api/admin/leads/${lead.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ doNotContact: e.target.checked }),
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                onLeadUpdate?.(updated);
                              }
                            } catch (err) {
                              console.error("Erro ao atualizar flag:", err);
                            }
                          }}
                          className="w-5 h-5 rounded border-neutral-300 text-red-500 focus:ring-red-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📧</span>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">Não recebe campanhas</p>
                            <p className="text-xs text-neutral-500">Excluir de emails e automações</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={(lead as any).doNotEmail || false}
                          onChange={async (e) => {
                            try {
                              const res = await fetch(`/api/admin/leads/${lead.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ doNotEmail: e.target.checked }),
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                onLeadUpdate?.(updated);
                              }
                            } catch (err) {
                              console.error("Erro ao atualizar flag:", err);
                            }
                          }}
                          className="w-5 h-5 rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                        />
                      </label>
                    </div>
                  </div>}

                </div>
              )}

              {activeTab === "qualificacao" && (
                <QualificationChecklist
                  leadId={lead.id}
                  initialAnswers={(lead as any).qualificationAnswers || {}}
                  onAnswersChange={(answers, score) => {
                    // Atualizar score no lead
                    console.log("Score atualizado:", score);
                  }}
                  onTemperatureChange={(temp) => {
                    // Auto-classificar temperatura
                    handleUpdateTemperature(lead.id, temp);
                  }}
                />
              )}

              {activeTab === "imoveis" && (
                <ImoveisTab lead={lead} formatDate={formatDate} formatPrice={formatPrice} />
              )}

              {activeTab === "compativeis" && (
                <CompativeisTab lead={lead} formatPrice={formatPrice} />
              )}

              {activeTab === "historico" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <RiHistoryLine className="w-4 h-4 text-orange-500" />
                    Timeline de Atividades
                    <span className="text-xs font-normal text-neutral-400">({timeline.length})</span>
                  </h3>

                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                    
                    <div className="space-y-3">
                      {loadingActivities ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : timeline.length === 0 ? (
                        <p className="text-sm text-neutral-500 text-center py-4">Nenhuma atividade registrada</p>
                      ) : (
                        timeline.map((item, index) => {
                          const activityConfig: Record<string, { color: string; bg: string; label: string }> = {
                            created: { color: "bg-green-500", bg: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20", label: "Criação" },
                            status_change: { color: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20", label: "Status" },
                            temperature_change: { color: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", label: "Temperatura" },
                            name_change: { color: "bg-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20", label: "Nome" },
                            ticket_change: { color: "bg-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20", label: "Finalidade" },
                            corretor_change: { color: "bg-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20", label: "Corretor" },
                            tag_added: { color: "bg-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20", label: "Tag" },
                            tag_removed: { color: "bg-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20", label: "Tag" },
                            note_added: { color: "bg-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20", label: "Observação" },
                            archived: { color: "bg-red-500", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", label: "Arquivado" },
                            unarchived: { color: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", label: "Repescado" },
                            banned: { color: "bg-red-700", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", label: "Banido" },
                            unbanned: { color: "bg-green-600", bg: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20", label: "Desbanido" },
                            enrichment: { color: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20", label: "Enriquecimento" },
                            qualified: { color: "bg-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20", label: "Qualificado" },
                            assigned: { color: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20", label: "Atribuído" },
                            queue_assignment: { color: "bg-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20", label: "Fila" },
                            permuta_match: { color: "bg-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20", label: "Permuta" },
                            VISITA_AGENDADA: { color: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20", label: "Visita" },
                            VISITA_CONFIRMADA: { color: "bg-green-500", bg: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20", label: "Visita" },
                            VISITA_CANCELADA: { color: "bg-red-500", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", label: "Visita" },
                            VISITA_REALIZADA: { color: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", label: "Visita" },
                            VISITA_EXCLUIDA: { color: "bg-red-400", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20", label: "Visita" },
                            funnel_automation: { color: "bg-fuchsia-500", bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-500/20", label: "Automação" },
                            field_edit: { color: "bg-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20", label: "Edição" },
                          };
                          const cfg = activityConfig[item.type] || { color: "bg-neutral-400", bg: "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700", label: item.type };
                          return (
                            <div key={index} className="relative flex items-start gap-3 pl-10">
                              <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 z-10 ${cfg.color}`} />
                              <div className={`flex-1 p-3 rounded-xl border ${cfg.bg}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold text-white ${cfg.color}`}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-[10px] text-neutral-400">{formatDateTime(item.date)}</span>
                                  {item.userName && (
                                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 ml-auto">
                                      <RiUserLine className="w-3 h-3" />
                                      {item.userName}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-neutral-800 dark:text-neutral-200">{item.description}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "anexos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Documentos e Anexos
                    </h3>
                    <button className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium">
                      <RiAddLine className="w-4 h-4" />
                      Adicionar Anexo
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                      <RiAttachmentLine className="w-8 h-8 text-neutral-400" />
                    </div>
                    <p className="text-sm text-neutral-500 mb-2">Nenhum anexo</p>
                    <p className="text-xs text-neutral-400">Arraste arquivos aqui ou clique para adicionar</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


// Componente para aba de Imóveis
function ImoveisTab({ lead, formatDate, formatPrice }: { lead: Lead; formatDate: (d: string | null) => string; formatPrice: (p: number | null) => string }) {
  const [linkedProperties, setLinkedProperties] = useState<any>({ grouped: {}, counts: {} });
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [linkType, setLinkType] = useState<string>("ENVIADO");
  const [linking, setLinking] = useState(false);
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [linkFeedback, setLinkFeedback] = useState("");
  const [linkRating, setLinkRating] = useState<number>(0);
  const [linkInterested, setLinkInterested] = useState<boolean | null>(null);
  const [linkProposalValue, setLinkProposalValue] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLinkedProperties = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/properties`);
      if (res.ok) {
        const data = await res.json();
        setLinkedProperties(data);
      }
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    } finally {
      setLoading(false);
    }
  }, [lead.id]);

  useEffect(() => {
    fetchLinkedProperties();
  }, [fetchLinkedProperties]);

  // Busca de imóveis com debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/properties?search=${encodeURIComponent(searchQuery)}&limit=8&page=1`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.properties || []);
        }
      } catch (err) {
        console.error("Erro na busca:", err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  const resetLinkForm = () => {
    setExpandedPropertyId(null);
    setLinkFeedback("");
    setLinkRating(0);
    setLinkInterested(null);
    setLinkProposalValue("");
  };

  const handleLinkProperty = async (propertyId: string) => {
    // Para VISITADO e PROPOSTA, expandir formulário primeiro
    if ((linkType === "VISITADO" || linkType === "PROPOSTA") && expandedPropertyId !== propertyId) {
      resetLinkForm();
      setExpandedPropertyId(propertyId);
      return;
    }
    setLinking(true);
    try {
      const body: any = { propertyId, type: linkType };
      if (linkType === "VISITADO") {
        if (linkFeedback) body.feedback = linkFeedback;
        if (linkRating > 0) body.rating = linkRating;
        if (linkInterested !== null) body.interested = linkInterested;
      }
      if (linkType === "PROPOSTA") {
        if (linkProposalValue) body.proposalValue = parseFloat(linkProposalValue.replace(/\D/g, "")) || 0;
        if (linkFeedback) body.feedback = linkFeedback;
      }
      const res = await fetch(`/api/admin/leads/${lead.id}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
        resetLinkForm();
        await fetchLinkedProperties();
      }
    } catch (err) {
      console.error("Erro ao vincular:", err);
    } finally {
      setLinking(false);
    }
  };

  const PropertyCard = ({ property, type, date, badge, badgeColor, partnerName, feedback, rating, interested, proposalValue, visitTime, visitEndTime, visitStatus, fromSite, visitNotes }: any) => (
    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
          {property.thumbnail ? (
            <img src={property.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <RiHome4Line className="w-5 h-5 text-neutral-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeColor}`}>{badge}</span>
            {fromSite && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                🌐 Via Site
              </span>
            )}
            {visitStatus && visitStatus !== "REALIZADA" && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                visitStatus === "AGENDADA" ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" :
                visitStatus === "CONFIRMADA" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                visitStatus === "CANCELADA" || visitStatus === "NAO_COMPARECEU" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                "bg-neutral-100 text-neutral-700"
              }`}>
                {visitStatus === "AGENDADA" ? "Agendada" : visitStatus === "CONFIRMADA" ? "Confirmada" : visitStatus === "CANCELADA" ? "Cancelada" : visitStatus === "NAO_COMPARECEU" ? "Não compareceu" : visitStatus}
              </span>
            )}
            {partnerName && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                🤝 Parceria: {partnerName}
              </span>
            )}
            {date && <span className="text-[10px] text-neutral-400">{date}</span>}
          </div>
          <p className="text-xs font-medium text-neutral-900 dark:text-white">{property.code}</p>
          <p className="text-[10px] text-neutral-500 truncate">{property.title}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-orange-500">{formatPrice(property.price)}</p>
            {visitTime && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                🕐 {visitTime}{visitEndTime ? ` - ${visitEndTime}` : ""}
              </span>
            )}
          </div>
        </div>
        <a href={`/admin/imoveis/${property.id}`} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500">
          <RiEyeLine className="w-4 h-4" />
        </a>
      </div>
      {(rating > 0 || interested !== null && interested !== undefined || feedback || proposalValue) && (
        <div className="pl-2 border-l-2 border-neutral-200 dark:border-neutral-700 ml-2 space-y-1">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-neutral-400">Avaliação:</span>
              <span className="text-xs text-yellow-500">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
            </div>
          )}
          {interested !== null && interested !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-neutral-400">Interesse:</span>
              <span className={`text-[10px] font-medium ${interested ? "text-green-600" : "text-red-500"}`}>
                {interested ? "Sim" : "Não"}
              </span>
            </div>
          )}
          {proposalValue > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-neutral-400">Proposta:</span>
              <span className="text-[10px] font-semibold text-amber-600">{formatPrice(proposalValue)}</span>
            </div>
          )}
          {feedback && (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">&ldquo;{feedback}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { grouped, counts } = linkedProperties;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Imóveis Vinculados ({counts.total || 0})
        </h3>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
        >
          {showSearch ? <RiCloseLine className="w-4 h-4" /> : <RiAddLine className="w-4 h-4" />}
          {showSearch ? "Fechar" : "Vincular Imóvel"}
        </button>
      </div>

      {/* Painel de busca e vinculação */}
      {showSearch && (
        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20 space-y-3">
          {/* Tipo de vínculo */}
          <div>
            <label className="text-[10px] text-neutral-500 mb-1.5 block">Vincular como</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "ENVIADO", label: "Enviado", color: "purple" },
                { key: "VISITADO", label: "Visitado", color: "green" },
                { key: "PROPOSTA", label: "Proposta", color: "amber" },
                { key: "COMPRADO", label: "Comprado", color: "emerald" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setLinkType(t.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    linkType === t.key
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-orange-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de busca */}
          <div className="relative">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, endereço ou nome..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
            {searching && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {searchResults.map((prop: any) => (
                <div key={prop.id} className="space-y-0">
                  <div
                    className={`flex items-center gap-2.5 p-2 bg-white dark:bg-neutral-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-colors ${expandedPropertyId === prop.id ? "rounded-b-none border-b-0" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                      {prop.thumbnail ? (
                        <img src={prop.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <RiHome4Line className="w-4 h-4 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-neutral-900 dark:text-white">{prop.code}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{prop.title || prop.address}</p>
                      <p className="text-[10px] font-medium text-orange-500">{formatPrice(prop.price)}</p>
                    </div>
                    <button
                      onClick={() => handleLinkProperty(prop.id)}
                      disabled={linking}
                      className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      {linking ? "..." : expandedPropertyId === prop.id ? "Confirmar" : "Vincular"}
                    </button>
                  </div>
                  {/* Formulário expandido para VISITADO/PROPOSTA */}
                  {expandedPropertyId === prop.id && (
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-b-lg border-t border-neutral-100 dark:border-neutral-700 space-y-2.5">
                      {linkType === "VISITADO" && (
                        <>
                          <div>
                            <label className="text-[10px] text-neutral-500 mb-1 block">Avaliação da visita</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setLinkRating(star)}
                                  className={`text-lg transition-colors ${star <= linkRating ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 mb-1 block">Cliente tem interesse?</label>
                            <div className="flex gap-1.5">
                              {[
                                { val: true, label: "Sim", color: "bg-green-500" },
                                { val: false, label: "Não", color: "bg-red-500" },
                              ].map((opt) => (
                                <button
                                  key={String(opt.val)}
                                  type="button"
                                  onClick={() => setLinkInterested(opt.val)}
                                  className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                                    linkInterested === opt.val
                                      ? `${opt.color} text-white`
                                      : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 mb-1 block">Feedback da visita</label>
                            <textarea
                              value={linkFeedback}
                              onChange={(e) => setLinkFeedback(e.target.value)}
                              placeholder="Como foi a visita? O que o cliente achou?"
                              rows={2}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                            />
                          </div>
                        </>
                      )}
                      {linkType === "PROPOSTA" && (
                        <>
                          <div>
                            <label className="text-[10px] text-neutral-500 mb-1 block">Valor da proposta (R$)</label>
                            <input
                              type="text"
                              value={linkProposalValue}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "");
                                setLinkProposalValue(v ? Number(v).toLocaleString("pt-BR") : "");
                              }}
                              placeholder="0"
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 mb-1 block">Observações da proposta</label>
                            <textarea
                              value={linkFeedback}
                              onChange={(e) => setLinkFeedback(e.target.value)}
                              placeholder="Condições, prazos, observações..."
                              rows={2}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                            />
                          </div>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => resetLinkForm()}
                        className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-neutral-400 text-center py-2">Nenhum imóvel encontrado</p>
          )}
        </div>
      )}

      {/* Sinalização de Vendedor + Imóveis do Vendedor */}
      {((lead as any).isAlsoSeller || linkedProperties.isAlsoSeller) && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <RiBuilding2Line className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">VENDEDOR</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">Este cliente também é proprietário de imóvel cadastrado</p>
              </div>
            </div>
          </div>

          {/* Imóveis que o vendedor possui */}
          {linkedProperties.sellerProperties?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RiBuilding2Line className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Imóveis do Vendedor ({linkedProperties.sellerProperties.length})</span>
              </div>
              {linkedProperties.sellerProperties.map((prop: any) => (
                <div key={prop.id} className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-500/5 rounded-xl border border-amber-200/50 dark:border-amber-500/20">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                    {prop.thumbnail ? (
                      <img src={prop.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <RiHome4Line className="w-5 h-5 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">Proprietário</span>
                      {prop.status && <span className="text-[10px] text-neutral-400">{prop.status}</span>}
                    </div>
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">{prop.code}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{prop.title}</p>
                    <p className="text-xs font-semibold text-orange-500">{formatPrice(prop.price)}</p>
                  </div>
                  <a href={`/admin/imoveis/${prop.id}`} className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600">
                    <RiEyeLine className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Imóvel de Origem */}
      {lead.property && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <RiHome4Line className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Imóvel de Origem</span>
          </div>
          <PropertyCard property={lead.property} type="ORIGEM" date={formatDate(lead.createdAt)} badge="Origem" badgeColor="bg-blue-100 text-blue-600" />
        </div>
      )}

      {/* Imóveis Enviados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RiSendPlaneLine className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Enviados ({counts.enviados || 0})</span>
        </div>
        {grouped.enviados?.length > 0 ? (
          grouped.enviados.map((p: any) => (
            <PropertyCard key={p.id} property={p.property} type="ENVIADO" date={formatDate(p.sentAt)} badge="Enviado" badgeColor="bg-purple-100 text-purple-600" />
          ))
        ) : (
          <p className="text-xs text-neutral-400 pl-6">Nenhum imóvel enviado</p>
        )}
      </div>

      {/* Visitados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RiEyeLine className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Visitados ({counts.visitados || 0})</span>
        </div>
        {grouped.visitados?.length > 0 ? (
          grouped.visitados.map((p: any) => (
            <PropertyCard key={p.id} property={p.property} type="VISITADO" date={formatDate(p.visitedAt)} badge="Visitado" badgeColor="bg-green-100 text-green-600" partnerName={p.partnerName} feedback={p.feedback} rating={p.rating} interested={p.interested} visitTime={p.visitTime} visitEndTime={p.visitEndTime} visitStatus={p.visitStatus} fromSite={p.fromSite} visitNotes={p.visitNotes} />
          ))
        ) : (
          <p className="text-xs text-neutral-400 pl-6">Nenhuma visita registrada</p>
        )}
      </div>

      {/* Propostas */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RiFileList3Line className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Propostas ({counts.propostas || 0})</span>
        </div>
        {grouped.propostas?.length > 0 ? (
          grouped.propostas.map((p: any) => (
            <PropertyCard key={p.id} property={p.property} type="PROPOSTA" date={formatDate(p.proposalAt)} badge="Proposta" badgeColor="bg-amber-100 text-amber-600" feedback={p.feedback} proposalValue={p.proposalValue} />
          ))
        ) : (
          <p className="text-xs text-neutral-400 pl-6">Nenhuma proposta registrada</p>
        )}
      </div>

      {/* Comprados */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RiCheckLine className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Comprados ({counts.comprados || 0})</span>
        </div>
        {grouped.comprados?.length > 0 ? (
          grouped.comprados.map((p: any) => (
            <PropertyCard key={p.id} property={p.property} type="COMPRADO" date={formatDate(p.updatedAt)} badge="Comprado" badgeColor="bg-emerald-100 text-emerald-600" />
          ))
        ) : (
          <p className="text-xs text-neutral-400 pl-6">Nenhum imóvel comprado</p>
        )}
      </div>
    </div>
  );
}

// Componente para aba de Imóveis Compatíveis (match automático)
function CompativeisTab({ lead, formatPrice }: { lead: Lead; formatPrice: (p: number | null) => string }) {
  const [properties, setProperties] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/leads/${lead.id}/match-properties`);
        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties || []);
          setCriteria(data.criteria || null);
          setTotal(data.total || 0);
        }
      } catch (error) {
        console.error("Erro ao buscar imóveis compatíveis:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [lead.id]);

  const typeLabels: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    TERRENO: "Terreno",
    COMERCIAL: "Comercial",
    RURAL: "Rural",
    INDUSTRIAL: "Industrial",
  };

  const categoryLabels: Record<string, string> = {
    VENDA: "Venda",
    LOCACAO: "Locação",
    VENDA_LOCACAO: "Venda/Locação",
    TEMPORADA: "Temporada",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-neutral-500">Buscando imóveis compatíveis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critérios de busca */}
      {criteria && (
        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
            <RiSearchLine className="w-3.5 h-3.5" />
            Critérios de match
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {criteria.ticket && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
                {criteria.ticket === "COMPRA" ? "Compra" : criteria.ticket === "LOCACAO" ? "Locação" : "Compra e Locação"}
              </span>
            )}
            {(criteria.minBudget || criteria.maxBudget) && (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded text-[10px] font-medium">
                {criteria.minBudget ? formatPrice(criteria.minBudget) : "?"} - {criteria.maxBudget ? formatPrice(criteria.maxBudget) : "?"}
              </span>
            )}
            {criteria.typologies?.map((t: string) => (
              <span key={t} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded text-[10px] font-medium">
                {typeLabels[t] || t}
              </span>
            ))}
            {criteria.bedrooms && (
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-[10px] font-medium">
                {criteria.bedrooms}+ quartos
              </span>
            )}
            {criteria.furnished && (
              <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded text-[10px] font-medium">
                Mobiliado
              </span>
            )}
            {criteria.hasPermuta && (
              <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 rounded text-[10px] font-medium">
                Aceita permuta
              </span>
            )}
            {criteria.condominiums?.length > 0 && criteria.condominiums.map((c: string) => (
              <span key={c} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded text-[10px] font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {total} {total === 1 ? "imóvel compatível" : "imóveis compatíveis"}
        </h3>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-8">
          <RiCompassDiscoverLine className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-1">Nenhum imóvel compatível encontrado</p>
          <p className="text-xs text-neutral-400">
            Preencha os critérios de busca na aba Qualificação para ver resultados
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {properties.map((prop: any) => (
            <a
              key={prop.id}
              href={`/admin/imoveis/${prop.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-md transition-all group"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg bg-neutral-100 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                  {prop.thumbnail ? (
                    <img src={prop.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <RiHome4Line className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-orange-500">{prop.code}</span>
                    {prop.matchScore >= 50 && (
                      <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-600 rounded text-[9px] font-bold">
                        Match {prop.matchScore}%
                      </span>
                    )}
                    {prop.matchScore >= 30 && prop.matchScore < 50 && (
                      <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded text-[9px] font-bold">
                        Match {prop.matchScore}%
                      </span>
                    )}
                    {prop.matchScore < 30 && (
                      <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded text-[9px] font-bold">
                        Match {prop.matchScore}%
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400">
                      {categoryLabels[prop.category] || prop.category}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate group-hover:text-orange-600">
                    {prop.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <span>{typeLabels[prop.type] || prop.type}</span>
                    {prop.bedrooms > 0 && <span>• {prop.bedrooms} quartos</span>}
                    {prop.area > 0 && <span>• {prop.area}m²</span>}
                    {prop.condominium && <span>• {prop.condominium.name}</span>}
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatPrice(prop.price)}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prop.matchReasons?.slice(0, 3).map((reason: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded text-[9px]">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
