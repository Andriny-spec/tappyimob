"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiSearchLine,
  RiUser3Line,
} from "react-icons/ri";

interface PropertyOption {
  id: string;
  code: string;
  title: string;
  price: number;
  category?: string;
  rentPrice?: number;
}

interface CorretorOption {
  id: string;
  name: string;
}

interface AddProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  isAdmin: boolean;
  currentUserId?: string;
}

const emptyProposal = {
  purpose: "VENDA" as string,
  clientName: "",
  leadId: "",
  originalValue: "",
  originalValueRaw: 0,
  value: "",
  valueRaw: 0,
  discountPercent: "",
  rentalGuarantee: "",
  rentalStartDate: "",
  hasDirectPayment: false,
  directPaymentOwn: "",
  directPaymentOwnRaw: 0,
  directPaymentInstallments: "",
  hasCorrection: false,
  correctionDetails: "",
  hasPermuta: false,
  permutaValue: "",
  permutaValueRaw: 0,
  permutaType: "",
  permutaCity: "",
  permutaNeighborhood: "",
  permutaAddress: "",
  permutaBedrooms: "",
  permutaArea: "",
  permutaDetails: "",
  hasBankFinancing: false,
  bankFinancingOwn: "",
  bankFinancingOwnRaw: 0,
  bankFinancingValue: "",
  bankFinancingValueRaw: 0,
  financingBank: "",
  commissionType: "PERCENTUAL",
  commissionPercent: "",
  commissionValue: "",
  commissionValueRaw: 0,
  hasPartnerBroker: false,
  partnerBrokerName: "",
  partnerBrokerCreci: "",
  scopeSummary: "",
};

export function AddProposalModal({ isOpen, onClose, onSaved, isAdmin, currentUserId }: AddProposalModalProps) {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [searchProperty, setSearchProperty] = useState("");
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption | null>(null);

  const [corretores, setCorretores] = useState<CorretorOption[]>([]);
  const [corretorId, setCorretorId] = useState("");

  const [leads, setLeads] = useState<any[]>([]);
  const [searchLead, setSearchLead] = useState("");
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [brokerResults, setBrokerResults] = useState<any[]>([]);
  const [searchBroker, setSearchBroker] = useState("");
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const [newProposal, setNewProposal] = useState({ ...emptyProposal });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProperty(null);
    setSearchProperty("");
    setCorretorId(currentUserId || "");
    setNewProposal({ ...emptyProposal });
    setSearchLead("");
    setSearchBroker("");
    setError("");

    fetch("/api/properties?limit=2000&showAll=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.properties) setProperties(data.properties); })
      .catch(() => {});

    fetch("/api/admin/leads?limit=100")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.leads) setLeads(data.leads); })
      .catch(() => {});

    if (isAdmin) {
      fetch("/api/admin/corretores")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => { if (data) setCorretores(data.corretores || data || []); })
        .catch(() => {});
    }
  }, [isOpen, isAdmin, currentUserId]);

  useEffect(() => {
    if (!searchBroker || searchBroker.length < 2) {
      setBrokerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const [usersRes, partnersRes] = await Promise.all([
          fetch(`/api/admin/users?role=CORRETOR&search=${encodeURIComponent(searchBroker)}&limit=5`),
          fetch(`/api/admin/business-partners?type=CORRETOR&search=${encodeURIComponent(searchBroker)}&limit=5`),
        ]);
        const results: any[] = [];
        if (usersRes.ok) {
          const data = await usersRes.json();
          (data.users || []).forEach((u: any) => results.push({ id: u.id, name: u.name, creci: u.creci, phone: u.phone, source: "user" }));
        }
        if (partnersRes.ok) {
          const data = await partnersRes.json();
          (data.partners || []).forEach((p: any) => results.push({ id: p.id, name: p.name, creci: p.creci, phone: p.phone, source: "partner" }));
        }
        setBrokerResults(results.slice(0, 8));
      } catch (err) {
        console.error("Erro ao buscar corretores parceiros:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchBroker]);

  const filteredProperties = properties
    .filter((p) => p.title?.toLowerCase().includes(searchProperty.toLowerCase()) || p.code?.toLowerCase().includes(searchProperty.toLowerCase()))
    .slice(0, 8);

  const filteredLeads = leads
    .filter((lead) => lead.name?.toLowerCase().includes(searchLead.toLowerCase()) || lead.phone?.includes(searchLead) || lead.email?.toLowerCase().includes(searchLead.toLowerCase()))
    .slice(0, 5);

  const selectProperty = (p: PropertyOption) => {
    setSelectedProperty(p);
    setSearchProperty(`${p.code} — ${p.title}`);
    setShowPropertyDropdown(false);
    const purpose = p.category === "LOCACAO" ? "ALUGUEL" : "VENDA";
    const autoPrice = purpose === "ALUGUEL" ? (p.rentPrice || 0) : (p.price || 0);
    setNewProposal((prev) => ({
      ...prev,
      purpose,
      originalValue: autoPrice > 0 ? autoPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      originalValueRaw: Math.round(autoPrice * 100),
    }));
  };

  const selectLead = (lead: any) => {
    setNewProposal({ ...newProposal, clientName: lead.name || "", leadId: lead.id || "" });
    setSearchLead(lead.name || "");
    setShowLeadDropdown(false);
  };

  const selectBroker = (broker: any) => {
    setNewProposal({ ...newProposal, partnerBrokerName: broker.name || "", partnerBrokerCreci: broker.creci || "" });
    setSearchBroker(broker.name || "");
    setShowBrokerDropdown(false);
  };

  const formatCurrencyInputField = (value: string, field: string, rawField: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseInt(numbers || "0");
    setNewProposal((prev) => ({ ...prev, [rawField]: amount, [field]: (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }));
  };

  const calculateNetValue = () => {
    const proposalValue = newProposal.valueRaw / 100;
    if (proposalValue <= 0) return 0;
    if (newProposal.commissionType === "PERCENTUAL" && newProposal.commissionPercent) {
      const percent = parseFloat(newProposal.commissionPercent) || 0;
      return proposalValue - (proposalValue * percent) / 100;
    } else if (newProposal.commissionType === "VALOR" && newProposal.commissionValueRaw > 0) {
      return proposalValue - newProposal.commissionValueRaw / 100;
    }
    return proposalValue;
  };

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSave = async () => {
    setError("");
    if (!selectedProperty) {
      setError("Selecione o imóvel da proposta");
      return;
    }
    if (newProposal.valueRaw <= 0) {
      setError("Preencha o valor da proposta");
      return;
    }
    if (!newProposal.hasPartnerBroker && !newProposal.leadId) {
      setError("Selecione o cliente do funil. Se for corretor parceiro, marque a opção correspondente.");
      return;
    }
    if (newProposal.hasPartnerBroker && !newProposal.clientName) {
      setError("Preencha o nome do cliente do corretor parceiro");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        propertyId: selectedProperty.id,
        corretorId: isAdmin ? corretorId : undefined,
        purpose: newProposal.purpose,
        clientName: newProposal.clientName,
        leadId: newProposal.leadId || null,
        originalValue: newProposal.originalValueRaw > 0 ? newProposal.originalValueRaw / 100 : null,
        value: newProposal.valueRaw / 100,
        discountPercent: newProposal.discountPercent ? parseFloat(newProposal.discountPercent) : null,
        rentalGuarantee: newProposal.rentalGuarantee || null,
        rentalStartDate: newProposal.rentalStartDate || null,
        hasDirectPayment: newProposal.hasDirectPayment,
        directPaymentOwn: newProposal.directPaymentOwnRaw > 0 ? newProposal.directPaymentOwnRaw / 100 : null,
        directPaymentInstallments: newProposal.directPaymentInstallments ? parseInt(newProposal.directPaymentInstallments) : null,
        hasCorrection: newProposal.hasCorrection,
        correctionDetails: newProposal.correctionDetails || null,
        hasPermuta: newProposal.hasPermuta,
        permutaValue: newProposal.permutaValueRaw > 0 ? newProposal.permutaValueRaw / 100 : null,
        permutaType: newProposal.permutaType || null,
        permutaCity: newProposal.permutaCity || null,
        permutaNeighborhood: newProposal.permutaNeighborhood || null,
        permutaAddress: newProposal.permutaAddress || null,
        permutaBedrooms: newProposal.permutaBedrooms ? parseInt(newProposal.permutaBedrooms) : null,
        permutaArea: newProposal.permutaArea ? parseFloat(newProposal.permutaArea) : null,
        permutaDetails: newProposal.permutaDetails || null,
        hasBankFinancing: newProposal.hasBankFinancing,
        bankFinancingOwn: newProposal.bankFinancingOwnRaw > 0 ? newProposal.bankFinancingOwnRaw / 100 : null,
        bankFinancingValue: newProposal.bankFinancingValueRaw > 0 ? newProposal.bankFinancingValueRaw / 100 : null,
        financingBank: newProposal.financingBank || null,
        commissionType: newProposal.commissionType,
        commissionPercent: newProposal.commissionPercent ? parseFloat(newProposal.commissionPercent) : null,
        commissionValue: newProposal.commissionValueRaw > 0 ? newProposal.commissionValueRaw / 100 : null,
        netValueToSeller: calculateNetValue(),
        hasPartnerBroker: newProposal.hasPartnerBroker,
        partnerBrokerName: newProposal.partnerBrokerName || null,
        partnerBrokerCreci: newProposal.partnerBrokerCreci || null,
        scopeSummary: newProposal.scopeSummary || null,
      };

      const res = await fetch("/api/admin/leads/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao salvar proposta");
      }
    } catch (err) {
      console.error("Erro ao salvar proposta:", err);
      setError("Erro ao salvar proposta");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Nova Proposta</h3>
                <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Imóvel */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Imóvel *</label>
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchProperty}
                    onChange={(e) => {
                      setSearchProperty(e.target.value);
                      setSelectedProperty(null);
                      setShowPropertyDropdown(true);
                    }}
                    onFocus={() => setShowPropertyDropdown(true)}
                    placeholder="Buscar por código ou título..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-neutral-800 text-sm ${selectedProperty ? "border-green-400 dark:border-green-600" : "border-neutral-200 dark:border-neutral-700"}`}
                  />
                </div>
                {showPropertyDropdown && searchProperty && filteredProperties.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredProperties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectProperty(p)}
                        className="w-full px-4 py-2.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex flex-col"
                      >
                        <span className="font-medium text-sm">{p.code} — {p.title}</span>
                        <span className="text-xs text-neutral-500">{formatCurrency(p.price || 0)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Corretor responsável (somente admin) */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Corretor Responsável</label>
                  <select
                    value={corretorId}
                    onChange={(e) => setCorretorId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  >
                    <option value="">Selecione</option>
                    {corretores.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Finalidade */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Finalidade *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "VENDA", label: "Venda", icon: "🏷️" },
                    { value: "ALUGUEL", label: "Aluguel", icon: "🔑" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewProposal((prev) => ({ ...prev, purpose: opt.value }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        newProposal.purpose === opt.value
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="block text-sm font-medium mt-1">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Corretor parceiro */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProposal.hasPartnerBroker}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNewProposal({ ...newProposal, hasPartnerBroker: checked, ...(!checked ? { clientName: "", leadId: "" } : {}) });
                      if (!checked) setSearchLead("");
                    }}
                    className="w-5 h-5 rounded border-neutral-300 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="font-medium">Corretor Parceiro?</span>
                </label>
                {newProposal.hasPartnerBroker && (
                  <div className="mt-4 space-y-3">
                    {newProposal.partnerBrokerName && !searchBroker ? (
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                            <RiUser3Line className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white text-sm">{newProposal.partnerBrokerName}</p>
                            {newProposal.partnerBrokerCreci && <p className="text-xs text-neutral-500">CRECI: {newProposal.partnerBrokerCreci}</p>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setNewProposal({ ...newProposal, partnerBrokerName: "", partnerBrokerCreci: "" }); setSearchBroker(""); }}
                          className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-lg"
                        >
                          <RiCloseLine className="w-4 h-4 text-purple-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <label className="block text-xs font-medium mb-1">Buscar Corretor Parceiro</label>
                        <div className="relative">
                          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            value={searchBroker}
                            onChange={(e) => { setSearchBroker(e.target.value); setShowBrokerDropdown(true); }}
                            onFocus={() => setShowBrokerDropdown(true)}
                            placeholder="Buscar por nome ou telefone..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>
                        {showBrokerDropdown && brokerResults.length > 0 && searchBroker && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {brokerResults.map((broker) => (
                              <button
                                key={`${broker.source}-${broker.id}`}
                                type="button"
                                onClick={() => selectBroker(broker)}
                                className="w-full text-left px-3 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm border-b border-neutral-100 dark:border-neutral-700 last:border-0 flex items-center gap-3"
                              >
                                <RiUser3Line className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <div>
                                  <div className="font-medium">{broker.name}</div>
                                  <div className="text-xs text-neutral-500 flex gap-2">
                                    {broker.phone && <span>{broker.phone}</span>}
                                    <span className="text-purple-500">{broker.source === "user" ? "Usuário" : "Parceiro"}</span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cliente */}
              {newProposal.hasPartnerBroker ? (
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Nome do Cliente</label>
                  <input
                    type="text"
                    value={newProposal.clientName}
                    onChange={(e) => setNewProposal({ ...newProposal, clientName: e.target.value })}
                    placeholder="Nome do cliente do corretor parceiro (opcional)"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  />
                </div>
              ) : (
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Cliente do Funil *</label>
                  <input
                    type="text"
                    value={searchLead || newProposal.clientName}
                    onChange={(e) => {
                      setSearchLead(e.target.value);
                      setNewProposal({ ...newProposal, clientName: e.target.value, leadId: "" });
                      setShowLeadDropdown(true);
                    }}
                    onFocus={() => setShowLeadDropdown(true)}
                    placeholder="Digite para buscar leads do funil..."
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-neutral-800 text-sm ${newProposal.leadId ? "border-green-400 dark:border-green-600" : "border-neutral-200 dark:border-neutral-700"}`}
                  />
                  {newProposal.leadId && (
                    <span className="absolute right-3 top-[38px] text-xs text-green-600">✓ Vinculado</span>
                  )}
                  {showLeadDropdown && filteredLeads.length > 0 && searchLead && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => selectLead(lead)}
                          className="w-full px-4 py-2.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex flex-col"
                        >
                          <span className="font-medium">{lead.name}</span>
                          <span className="text-xs text-neutral-500">{lead.phone} • {lead.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Valores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Valor Original do Anúncio</label>
                  <input
                    type="text"
                    value={newProposal.originalValue}
                    onChange={(e) => formatCurrencyInputField(e.target.value, "originalValue", "originalValueRaw")}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Valor da Proposta *</label>
                  <input
                    type="text"
                    value={newProposal.value}
                    onChange={(e) => {
                      formatCurrencyInputField(e.target.value, "value", "valueRaw");
                      const numbers = e.target.value.replace(/\D/g, "");
                      const proposed = parseInt(numbers || "0");
                      if (newProposal.originalValueRaw > 0 && proposed > 0) {
                        const disc = ((1 - proposed / newProposal.originalValueRaw) * 100).toFixed(1);
                        setNewProposal((prev) => ({ ...prev, discountPercent: parseFloat(disc) > 0 ? disc : "0" }));
                      }
                    }}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-lg font-semibold"
                  />
                </div>
              </div>

              {newProposal.purpose === "ALUGUEL" && (
                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800 space-y-4">
                  <h4 className="font-medium text-sky-800 dark:text-sky-300 text-sm">🔑 Detalhes da Locação</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Garantia Locatícia</label>
                      <select
                        value={newProposal.rentalGuarantee}
                        onChange={(e) => setNewProposal((prev) => ({ ...prev, rentalGuarantee: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="CAUCAO">Caução (3 meses)</option>
                        <option value="FIADOR">Fiador</option>
                        <option value="SEGURO_FIANCA">Seguro Fiança</option>
                        <option value="TITULO_CAPITALIZACAO">Título de Capitalização</option>
                        <option value="DEPOSITO">Depósito Caução</option>
                        <option value="CARTA_FIANCA_EMPRESARIAL">Carta Fiança Empresarial</option>
                        <option value="SEM_GARANTIA">Sem Garantia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Data de Início</label>
                      <input
                        type="date"
                        value={newProposal.rentalStartDate}
                        onChange={(e) => setNewProposal((prev) => ({ ...prev, rentalStartDate: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newProposal.purpose !== "ALUGUEL" && (
                <>
                  {/* Parcelamento direto */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProposal.hasDirectPayment}
                        onChange={(e) => setNewProposal({ ...newProposal, hasDirectPayment: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="font-medium">Parcelamento Direto?</span>
                    </label>
                    {newProposal.hasDirectPayment && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Recursos Próprios</label>
                            <input
                              type="text"
                              value={newProposal.directPaymentOwn}
                              onChange={(e) => formatCurrencyInputField(e.target.value, "directPaymentOwn", "directPaymentOwnRaw")}
                              placeholder="R$ 0,00"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Nº de Parcelas</label>
                            <input
                              type="number"
                              value={newProposal.directPaymentInstallments}
                              onChange={(e) => setNewProposal({ ...newProposal, directPaymentInstallments: e.target.value })}
                              placeholder="Ex: 12"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newProposal.hasCorrection}
                              onChange={(e) => setNewProposal({ ...newProposal, hasCorrection: e.target.checked })}
                              className="w-4 h-4 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm">Há correção/juros nas parcelas?</span>
                          </label>
                          {newProposal.hasCorrection && (
                            <input
                              type="text"
                              value={newProposal.correctionDetails}
                              onChange={(e) => setNewProposal({ ...newProposal, correctionDetails: e.target.value })}
                              placeholder="Detalhes da correção (ex: IGPM, 1% a.m.)"
                              className="w-full mt-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Permuta */}
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProposal.hasPermuta}
                        onChange={(e) => setNewProposal({ ...newProposal, hasPermuta: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="font-medium">Envolve Permuta?</span>
                    </label>
                    {newProposal.hasPermuta && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Valor da Permuta</label>
                          <input
                            type="text"
                            value={newProposal.permutaValue}
                            onChange={(e) => formatCurrencyInputField(e.target.value, "permutaValue", "permutaValueRaw")}
                            placeholder="R$ 0,00"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Tipo do Imóvel</label>
                            <select
                              value={newProposal.permutaType}
                              onChange={(e) => setNewProposal({ ...newProposal, permutaType: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            >
                              <option value="">Selecione</option>
                              <option value="CASA">Casa</option>
                              <option value="APARTAMENTO">Apartamento</option>
                              <option value="TERRENO">Terreno</option>
                              <option value="COMERCIAL">Comercial</option>
                              <option value="RURAL">Rural</option>
                              <option value="OUTRO">Outro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Cidade</label>
                            <input
                              type="text"
                              value={newProposal.permutaCity}
                              onChange={(e) => setNewProposal({ ...newProposal, permutaCity: e.target.value })}
                              placeholder="Cidade"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Bairro</label>
                            <input
                              type="text"
                              value={newProposal.permutaNeighborhood}
                              onChange={(e) => setNewProposal({ ...newProposal, permutaNeighborhood: e.target.value })}
                              placeholder="Bairro"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Endereço</label>
                            <input
                              type="text"
                              value={newProposal.permutaAddress}
                              onChange={(e) => setNewProposal({ ...newProposal, permutaAddress: e.target.value })}
                              placeholder="Endereço"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Dormitórios</label>
                            <input
                              type="number"
                              value={newProposal.permutaBedrooms}
                              onChange={(e) => setNewProposal({ ...newProposal, permutaBedrooms: e.target.value })}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Área (m²)</label>
                            <input
                              type="number"
                              value={newProposal.permutaArea}
                              onChange={(e) => setNewProposal({ ...newProposal, permutaArea: e.target.value })}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Detalhes Adicionais</label>
                          <textarea
                            value={newProposal.permutaDetails}
                            onChange={(e) => setNewProposal({ ...newProposal, permutaDetails: e.target.value })}
                            placeholder="Outras informações sobre o imóvel de permuta..."
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financiamento bancário */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProposal.hasBankFinancing}
                        onChange={(e) => setNewProposal({ ...newProposal, hasBankFinancing: e.target.checked })}
                        className="w-5 h-5 rounded border-neutral-300 text-green-500 focus:ring-green-500"
                      />
                      <span className="font-medium">Financiamento Bancário?</span>
                    </label>
                    {newProposal.hasBankFinancing && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Recursos Próprios</label>
                            <input
                              type="text"
                              value={newProposal.bankFinancingOwn}
                              onChange={(e) => formatCurrencyInputField(e.target.value, "bankFinancingOwn", "bankFinancingOwnRaw")}
                              placeholder="R$ 0,00"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Valor Financiado</label>
                            <input
                              type="text"
                              value={newProposal.bankFinancingValue}
                              onChange={(e) => formatCurrencyInputField(e.target.value, "bankFinancingValue", "bankFinancingValueRaw")}
                              placeholder="R$ 0,00"
                              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Banco</label>
                          <input
                            type="text"
                            value={newProposal.financingBank}
                            onChange={(e) => setNewProposal({ ...newProposal, financingBank: e.target.value })}
                            placeholder="Nome do banco"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Comissão */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <label className="block text-sm font-medium mb-3">Comissão</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      checked={newProposal.commissionType === "PERCENTUAL"}
                      onChange={() => setNewProposal({ ...newProposal, commissionType: "PERCENTUAL", commissionValue: "", commissionValueRaw: 0 })}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm">Percentual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      checked={newProposal.commissionType === "VALOR"}
                      onChange={() => setNewProposal({ ...newProposal, commissionType: "VALOR", commissionPercent: "" })}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm">Valor Fixo</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {newProposal.commissionType === "PERCENTUAL" ? (
                    <div>
                      <label className="block text-xs font-medium mb-1">Percentual (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newProposal.commissionPercent}
                        onChange={(e) => setNewProposal({ ...newProposal, commissionPercent: e.target.value })}
                        placeholder="Ex: 6"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium mb-1">Valor da Comissão</label>
                      <input
                        type="text"
                        value={newProposal.commissionValue}
                        onChange={(e) => formatCurrencyInputField(e.target.value, "commissionValue", "commissionValueRaw")}
                        placeholder="R$ 0,00"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium mb-1">Valor Líquido ao Vendedor</label>
                    <div className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold text-sm">
                      {formatCurrency(calculateNetValue())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-900 dark:text-white">Resumo do Escopo</label>
                <textarea
                  value={newProposal.scopeSummary}
                  onChange={(e) => setNewProposal({ ...newProposal, scopeSummary: e.target.value })}
                  placeholder="Condições gerais, observações, pontos importantes da negociação..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3 sticky bottom-0 bg-white dark:bg-neutral-900">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Salvar Proposta"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
