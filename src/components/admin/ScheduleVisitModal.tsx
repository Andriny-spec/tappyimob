"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiCheckLine,
  RiLoader4Line,
  RiSearchLine,
  RiHome4Line,
  RiDeleteBinLine,
  RiAddLine,
} from "react-icons/ri";

interface Property {
  id: string;
  code: string;
  title: string;
  address: string;
  neighborhood: string;
  city: string;
  thumbnail?: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface PartnerBroker {
  id: string;
  name: string;
  creci: string;
  phone: string;
}

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // Contexto: de onde o modal foi aberto
  context: "lead" | "property";
  // Se aberto do Lead, recebe o lead
  lead?: Lead;
  // Se aberto do Imóvel, recebe o imóvel
  property?: Property;
  // Imóveis pré-selecionados (quando vem do lead com imóveis vinculados)
  preSelectedProperties?: Property[];
}

export function ScheduleVisitModal({
  isOpen,
  onClose,
  onSuccess,
  context,
  lead,
  property,
  preSelectedProperties = [],
}: ScheduleVisitModalProps) {
  // Form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Selected properties (para contexto lead)
  const [selectedProperties, setSelectedProperties] = useState<Property[]>(
    preSelectedProperties
  );
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyResults, setPropertyResults] = useState<Property[]>([]);
  const [searchingProperties, setSearchingProperties] = useState(false);

  // Selected lead (para contexto property)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(lead || null);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadResults, setLeadResults] = useState<Lead[]>([]);
  const [searchingLeads, setSearchingLeads] = useState(false);


  // Manual visitor info (when no lead is selected)
  const [manualVisitorName, setManualVisitorName] = useState("");
  const [manualVisitorPhone, setManualVisitorPhone] = useState("");
  const [manualVisitorEmail, setManualVisitorEmail] = useState("");

  // Partner broker
  const [selectedPartner, setSelectedPartner] = useState<PartnerBroker | null>(null);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerResults, setPartnerResults] = useState<PartnerBroker[]>([]);
  const [searchingPartners, setSearchingPartners] = useState(false);

  // Imóvel do corretor parceiro (manual)
  const [isPartnerProperty, setIsPartnerProperty] = useState(false);
  const [partnerPropertyDesc, setPartnerPropertyDesc] = useState("");
  const [partnerPropertyAddress, setPartnerPropertyAddress] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset do formulário quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSaving(false);
      setDate("");
      setTime("");
      setEndTime("");
      setNotes("");
      setInternalNotes("");
      setPropertySearch("");
      setPropertyResults([]);
      setLeadSearch("");
      setLeadResults([]);
      setPartnerSearch("");
      setPartnerResults([]);
      setSelectedPartner(null);
      setManualVisitorName("");
      setManualVisitorPhone("");
      setManualVisitorEmail("");
      setIsPartnerProperty(false);
      setPartnerPropertyDesc("");
      setPartnerPropertyAddress("");
      
      // Inicializar com dados pré-selecionados
      if (property && context === "property") {
        setSelectedProperties([property]);
      } else {
        setSelectedProperties(preSelectedProperties);
      }
      
      if (lead && context === "lead") {
        setSelectedLead(lead);
      } else {
        setSelectedLead(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Buscar imóveis
  useEffect(() => {
    if (propertySearch.length < 2) {
      setPropertyResults([]);
      return;
    }

    const search = async () => {
      setSearchingProperties(true);
      try {
        const res = await fetch(
          `/api/properties?search=${encodeURIComponent(propertySearch)}&status=DISPONIVEL&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          // Filtrar os já selecionados
          const filtered = (data.properties || []).filter(
            (p: Property) => !selectedProperties.some((sp) => sp.id === p.id)
          );
          setPropertyResults(filtered);
        }
      } catch (err) {
        console.error("Erro ao buscar imóveis:", err);
      } finally {
        setSearchingProperties(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [propertySearch, selectedProperties]);

  // Buscar leads
  useEffect(() => {
    if (leadSearch.length < 2) {
      setLeadResults([]);
      return;
    }

    const search = async () => {
      setSearchingLeads(true);
      try {
        const res = await fetch(
          `/api/admin/leads?search=${encodeURIComponent(leadSearch)}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setLeadResults(data.leads || []);
        }
      } catch (err) {
        console.error("Erro ao buscar leads:", err);
      } finally {
        setSearchingLeads(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [leadSearch]);

  const addProperty = (prop: Property) => {
    setSelectedProperties([...selectedProperties, prop]);
    setPropertySearch("");
    setPropertyResults([]);
  };

  const removeProperty = (propId: string) => {
    setSelectedProperties(selectedProperties.filter((p) => p.id !== propId));
  };

  const selectLead = (l: Lead) => {
    setSelectedLead(l);
    setLeadSearch("");
    setLeadResults([]);
  };

  const clearLead = () => {
    setSelectedLead(null);
    setLeadSearch("");
  };

  // Buscar parceiros
  useEffect(() => {
    if (partnerSearch.length < 2) {
      setPartnerResults([]);
      return;
    }

    const search = async () => {
      setSearchingPartners(true);
      try {
        const res = await fetch(
          `/api/admin/business-partners?type=CORRETOR&search=${encodeURIComponent(partnerSearch)}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setPartnerResults(data.partners || []);
        }
      } catch (err) {
        console.error("Erro ao buscar parceiros:", err);
      } finally {
        setSearchingPartners(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [partnerSearch]);

  const selectPartner = (p: PartnerBroker) => {
    setSelectedPartner(p);
    setPartnerSearch("");
    setPartnerResults([]);
  };

  const clearPartner = () => {
    setSelectedPartner(null);
    setPartnerSearch("");
  };

  const handleSubmit = async () => {
    setError("");

    // Validações
    if (!date || !time) {
      setError("Data e horário são obrigatórios");
      return;
    }

    if (selectedProperties.length === 0 && !isPartnerProperty) {
      setError("Selecione pelo menos um imóvel ou marque 'Imóvel do Corretor Parceiro'");
      return;
    }

    if (isPartnerProperty && !partnerPropertyDesc.trim()) {
      setError("Informe a descrição do imóvel do corretor parceiro");
      return;
    }

    if (!selectedLead && !manualVisitorName.trim() && !selectedPartner) {
      setError("Selecione um cliente do funil para vincular à visita.");
      return;
    }

    if (!selectedLead && !manualVisitorName.trim() && selectedPartner) {
      setError("Informe o nome do cliente do parceiro.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/scheduled-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          endTime: endTime || null,
          notes: notes || null,
          internalNotes: internalNotes || null,
          leadId: selectedLead?.id || null,
          visitorName: !selectedLead && manualVisitorName.trim() ? manualVisitorName.trim() : null,
          visitorEmail: !selectedLead && manualVisitorEmail.trim() ? manualVisitorEmail.trim() : null,
          visitorPhone: !selectedLead && manualVisitorPhone.trim() ? manualVisitorPhone.trim() : null,
          partnerId: selectedPartner?.id || null,
          propertyIds: selectedProperties.map((p) => p.id),
          isPartnerProperty: isPartnerProperty || false,
          partnerPropertyDesc: isPartnerProperty ? partnerPropertyDesc.trim() : null,
          partnerPropertyAddress: isPartnerProperty ? partnerPropertyAddress.trim() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao agendar visita");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl mx-4"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center">
                <RiCalendarLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Agendar Visita
                </h2>
                <p className="text-sm text-neutral-500">
                  {context === "lead"
                    ? `Cliente: ${lead?.name || "Selecionar"}`
                    : `Imóvel: ${property?.code || "Selecionar"}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <RiCloseLine className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Data e Horário */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Data *
                </label>
                <div className="relative">
                  <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Horário Início *
                </label>
                <div className="relative">
                  <RiTimeLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Horário Fim
                </label>
                <div className="relative">
                  <RiTimeLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Seleção de Corretor Parceiro - ANTES do cliente para condicionar */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Corretor Parceiro <span className="text-neutral-400 font-normal">(opcional)</span>
              </label>

              {selectedPartner ? (
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                      <RiUserLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {selectedPartner.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {selectedPartner.creci ? `CRECI: ${selectedPartner.creci}` : ""}{selectedPartner.phone ? ` • ${selectedPartner.phone}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      clearPartner();
                      setManualVisitorName("");
                      setManualVisitorPhone("");
                      setManualVisitorEmail("");
                    }}
                    className="p-2 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-lg transition-colors"
                  >
                    <RiCloseLine className="w-4 h-4 text-purple-600" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={partnerSearch}
                      onChange={(e) => setPartnerSearch(e.target.value)}
                      placeholder="Buscar corretor parceiro por nome, CRECI..."
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {searchingPartners && (
                      <RiLoader4Line className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
                    )}
                  </div>

                  {/* Resultados da busca */}
                  {partnerResults.length > 0 && (
                    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg max-h-40 overflow-y-auto">
                      {partnerResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => selectPartner(p)}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left border-b last:border-b-0 border-neutral-100 dark:border-neutral-800"
                        >
                          <RiUserLine className="w-4 h-4 text-purple-500" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white text-sm">
                              {p.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {p.creci ? `CRECI: ${p.creci}` : ""}{p.phone ? ` • ${p.phone}` : ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Seleção de Cliente - condicional baseado no corretor parceiro */}
            {selectedPartner ? (
              /* Com corretor parceiro: campos manuais expandidos */
              <div className="space-y-3 p-4 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Dados do cliente do corretor parceiro:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={manualVisitorName}
                      onChange={(e) => setManualVisitorName(e.target.value)}
                      placeholder="Nome do cliente *"
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="relative">
                    <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={manualVisitorPhone}
                      onChange={(e) => setManualVisitorPhone(e.target.value)}
                      placeholder="Telefone"
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="relative">
                    <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={manualVisitorEmail}
                      onChange={(e) => setManualVisitorEmail(e.target.value)}
                      placeholder="E-mail"
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            ) : context === "property" ? (
              /* Sem corretor parceiro + contexto property: busca de lead + campos manuais */
              <div className="space-y-4">
                {/* Busca de Lead do Funil */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Buscar Cliente do Funil
                  </label>

                  {selectedLead ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                          <RiUserLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {selectedLead.name}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {selectedLead.phone} • {selectedLead.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearLead}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        <RiCloseLine className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          placeholder="Buscar cliente por nome, email ou telefone..."
                          className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {searchingLeads && (
                          <RiLoader4Line className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
                        )}
                      </div>

                      {/* Resultados da busca */}
                      {leadResults.length > 0 && (
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg max-h-40 overflow-y-auto">
                          {leadResults.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => selectLead(l)}
                              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left border-b last:border-b-0 border-neutral-100 dark:border-neutral-800"
                            >
                              <RiUserLine className="w-4 h-4 text-neutral-400" />
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-white text-sm">
                                  {l.name}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {l.phone}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Aviso quando nenhum lead selecionado */}
                {!selectedLead && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 px-1">
                    O cliente precisa estar no funil para vincular à visita.
                  </p>
                )}
              </div>
            ) : null}

            {/* Toggle Imóvel do Corretor Parceiro - Oculto quando tem imóvel pré-selecionado do single */}
            {!property && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setIsPartnerProperty(!isPartnerProperty)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isPartnerProperty ? "bg-purple-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPartnerProperty ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Imóvel do Corretor Parceiro</p>
                <p className="text-xs text-neutral-500">Visita a imóvel de terceiro (não cadastrado no sistema)</p>
              </div>
            </div>
            )}

            {/* Campos do imóvel parceiro */}
            {isPartnerProperty && (
              <div className="space-y-3 p-4 bg-purple-50/50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl">
                <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Dados do imóvel do corretor parceiro:</p>
                <div>
                  <input
                    type="text"
                    value={partnerPropertyDesc}
                    onChange={(e) => setPartnerPropertyDesc(e.target.value)}
                    placeholder="Descrição do imóvel (ex: Apto 3 quartos, Edifício Solar) *"
                    className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="relative">
                  <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={partnerPropertyAddress}
                    onChange={(e) => setPartnerPropertyAddress(e.target.value)}
                    placeholder="Endereço completo"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {/* Seleção de Imóveis */}
            {!isPartnerProperty && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Imóveis para Visita *
              </label>

              {/* Imóveis selecionados */}
              {selectedProperties.length > 0 && (
                <div className="space-y-2 mb-3">
                  {selectedProperties.map((prop, index) => (
                    <div
                      key={prop.id}
                      className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center text-sm font-bold text-orange-600">
                        {index + 1}
                      </div>
                      {prop.thumbnail ? (
                        <img
                          src={prop.thumbnail}
                          alt={prop.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                          <RiHome4Line className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                          {prop.code} - {prop.title}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {prop.neighborhood}, {prop.city}
                        </p>
                      </div>
                      {!(context === "property" && prop.id === property?.id) && (
                        <button
                          onClick={() => removeProperty(prop.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <RiDeleteBinLine className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Busca de imóveis */}
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="Buscar imóvel por código, título ou endereço..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {searchingProperties && (
                  <RiLoader4Line className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
                )}
              </div>

              {/* Resultados da busca */}
              {propertyResults.length > 0 && (
                <div className="mt-2 border border-neutral-200 dark:border-neutral-700 rounded-lg max-h-48 overflow-y-auto">
                  {propertyResults.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => addProperty(prop)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left border-b last:border-b-0 border-neutral-100 dark:border-neutral-800"
                    >
                      {prop.thumbnail ? (
                        <img
                          src={prop.thumbnail}
                          alt={prop.title}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                          <RiHome4Line className="w-4 h-4 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                          {prop.code} - {prop.title}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {prop.neighborhood}, {prop.city}
                        </p>
                      </div>
                      <RiAddLine className="w-5 h-5 text-orange-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Observações */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Observações (visível ao cliente)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ex: Levar documentos, chegar 10min antes..."
                  className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Notas Internas
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas apenas para a equipe..."
                  className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <RiCheckLine className="w-4 h-4" />
                  Agendar Visita
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
