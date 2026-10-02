"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiMessageLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiLoader4Line,
  RiSearchLine,
  RiMapPinLine,
  RiIdCardLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiGlobalLine,
} from "react-icons/ri";
import { LeadStatus, leadStatusLabels, leadSourceLabels, leadTicketLabels, leadProfileLabels } from "@/types/lead";

interface Property {
  id: string;
  code: string;
  title: string;
  price: number;
}

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  defaultStatus?: LeadStatus;
}

export function AddLeadModal({
  isOpen,
  onClose,
  onSave,
  defaultStatus = "NOVO",
}: AddLeadModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchProperty, setSearchProperty] = useState("");
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [showPersonalData, setShowPersonalData] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [phoneInternational, setPhoneInternational] = useState(false);

  // Condomínios da API
  const [availableCondominiums, setAvailableCondominiums] = useState<string[]>([]);
  const [condoSearch, setCondoSearch] = useState("");
  const [showCondoList, setShowCondoList] = useState(false);
  const [selectedCondos, setSelectedCondos] = useState<string[]>([]);

  // Colunas kanban (para status válidos)
  const [kanbanStatuses, setKanbanStatuses] = useState<{ status: string; title: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    source: "SITE",
    status: defaultStatus,
    ticket: "COMPRA",
    profile: "COMPRADOR",
    budget: "",
    propertyId: "",
    hasPermuta: false,
    permutaValue: "",
    permutaLocation: "",
    condominiumsOfInterest: "",
    // Dados pessoais
    cpf: "",
    rg: "",
    birthDate: "",
    maritalStatus: "",
    profession: "",
    // Endereço
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        source: "SITE",
        status: defaultStatus,
        ticket: "COMPRA",
        profile: "COMPRADOR",
        budget: "",
        propertyId: "",
        hasPermuta: false,
        permutaValue: "",
        permutaLocation: "",
        condominiumsOfInterest: "",
        cpf: "",
        rg: "",
        birthDate: "",
        maritalStatus: "",
        profession: "",
        address: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      });
      setSelectedProperty(null);
      setShowPersonalData(false);
      setShowAddress(false);
      setError("");
      fetchProperties();
      // Buscar condomínios
      fetch("/api/admin/leads/condominiums")
        .then((r) => r.json())
        .then((data) => {
          if (data.condominiums) setAvailableCondominiums(data.condominiums);
        })
        .catch(() => {});
      // Buscar colunas kanban para status válidos
      fetch("/api/admin/leads/columns")
        .then((r) => r.json())
        .then((data) => {
          if (data.columns) {
            const cols = data.columns.map((c: any) => ({ status: c.status, title: c.title }));
            setKanbanStatuses(cols);
            // Se o defaultStatus não existe nas colunas, usar o primeiro
            if (cols.length > 0 && !cols.find((c: any) => c.status === defaultStatus)) {
              setFormData((prev) => ({ ...prev, status: cols[0].status }));
            }
          }
        })
        .catch(() => {});
    } else {
      setSelectedCondos([]);
      setCondoSearch("");
    }
  }, [isOpen, defaultStatus]);

  const fetchProperties = async (search?: string) => {
    try {
      const params = new URLSearchParams({ limit: "2000", showAll: "true" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setProperties(data.properties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchProperty.toLowerCase()) ||
      p.code.toLowerCase().includes(searchProperty.toLowerCase())
  );

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData((prev) => ({ ...prev, propertyId: property.id }));
    setShowPropertyList(false);
    setSearchProperty("");
  };

  const formatPhone = (v: string, isIntl?: boolean) => {
    if (isIntl) return v.replace(/[^+\d\s\-()]/g, "").slice(0, 20);
    const n = v.replace(/\D/g, "");
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
  };

  const formatCurrency = (value: string): string => {
    const nums = value.replace(/\D/g, "");
    if (!nums) return "";
    const n = parseInt(nums, 10);
    return n.toLocaleString("pt-BR");
  };

  const parseCurrency = (value: string): number => {
    const nums = value.replace(/\D/g, "");
    return nums ? parseInt(nums, 10) : 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value, phoneInternational) }));
    } else if (name === "budget" || name === "permutaValue") {
      setFormData((prev) => ({ ...prev, [name]: formatCurrency(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave({
        ...formData,
        budget: formData.budget ? parseCurrency(formData.budget) : undefined,
        permutaValue: formData.permutaValue ? parseCurrency(formData.permutaValue) : undefined,
        condominiumsOfInterest: selectedCondos.length > 0 ? selectedCondos : [],
      });
      handleClose();
    } catch (err: any) {
      setError(err.message || "Erro ao criar lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
      source: "SITE",
      status: defaultStatus,
      ticket: "COMPRA",
      profile: "COMPRADOR",
      budget: "",
      propertyId: "",
      hasPermuta: false,
      permutaValue: "",
      permutaLocation: "",
      condominiumsOfInterest: "",
      cpf: "",
      rg: "",
      birthDate: "",
      maritalStatus: "",
      profession: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setSelectedProperty(null);
    setShowPersonalData(false);
    setShowAddress(false);
    setSelectedCondos([]);
    setCondoSearch("");
    setError("");
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Novo Lead
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiUserLine className="inline w-4 h-4 mr-1" />
                    Nome *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome completo"
                    className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiMailLine className="inline w-4 h-4 mr-1" />
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@exemplo.com"
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiPhoneLine className="inline w-4 h-4 mr-1" />
                      Telefone *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        title={phoneInternational ? "Formato internacional ativo" : "Clique para formato internacional"}
                        onClick={() => setPhoneInternational(!phoneInternational)}
                        className={`h-12 px-3 rounded-xl border text-sm flex items-center gap-1 transition-colors flex-shrink-0 ${phoneInternational ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600"}`}
                      >
                        <RiGlobalLine className="w-4 h-4" />
                      </button>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        maxLength={phoneInternational ? 20 : 15}
                        placeholder={phoneInternational ? "+1 (555) 123-4567" : "(00) 00000-0000"}
                        className="flex-1 h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Origem
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
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

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      {kanbanStatuses.length > 0
                        ? kanbanStatuses.map((col) => (
                            <option key={col.status} value={col.status}>
                              {col.title}
                            </option>
                          ))
                        : Object.entries(leadStatusLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Finalidade
                    </label>
                    <div className="flex gap-2">
                      {([
                        { key: "COMPRA", label: "Compra" },
                        { key: "LOCACAO", label: "Locação" },
                      ] as const).map((opt) => {
                        const isActive =
                          formData.ticket === opt.key || formData.ticket === "AMBOS";
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              const other = opt.key === "COMPRA" ? "LOCACAO" : "COMPRA";
                              const otherActive = formData.ticket === other || formData.ticket === "AMBOS";
                              let newTicket: string;
                              if (isActive) {
                                newTicket = otherActive ? other : opt.key;
                              } else {
                                newTicket = otherActive ? "AMBOS" : opt.key;
                              }
                              setFormData((prev) => ({ ...prev, ticket: newTicket }));
                            }}
                            className={`flex-1 h-12 rounded-xl text-sm font-medium transition-all ${
                              isActive
                                ? "bg-orange-500 text-white shadow-md"
                                : "bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {formData.ticket === "AMBOS" && (
                      <p className="text-xs text-orange-500 mt-1">Cliente procura compra e locação</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Perfil
                    </label>
                    <select
                      name="profile"
                      value={formData.profile}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      {Object.entries(leadProfileLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiMoneyDollarCircleLine className="inline w-4 h-4 mr-1" />
                    Orçamento (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Condomínios de Interesse */}
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiHome4Line className="inline w-4 h-4 mr-1" />
                    Condomínios de Interesse
                  </label>
                  {selectedCondos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selectedCondos.map((condo) => (
                        <span
                          key={condo}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-medium"
                        >
                          {condo}
                          <button
                            type="button"
                            onClick={() => setSelectedCondos((prev) => prev.filter((c) => c !== condo))}
                            className="hover:text-orange-900 dark:hover:text-orange-100"
                          >
                            <RiCloseLine className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={condoSearch}
                      onChange={(e) => {
                        setCondoSearch(e.target.value);
                        setShowCondoList(true);
                      }}
                      onFocus={() => setShowCondoList(true)}
                      placeholder="Buscar condomínio..."
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  {showCondoList && condoSearch && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-40 overflow-y-auto">
                      {availableCondominiums
                        .filter(
                          (c) =>
                            c.toLowerCase().includes(condoSearch.toLowerCase()) &&
                            !selectedCondos.includes(c)
                        )
                        .slice(0, 10)
                        .map((condo) => (
                          <button
                            key={condo}
                            type="button"
                            onClick={() => {
                              setSelectedCondos((prev) => [...prev, condo]);
                              setCondoSearch("");
                              setShowCondoList(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                          >
                            {condo}
                          </button>
                        ))}
                      {availableCondominiums.filter(
                        (c) =>
                          c.toLowerCase().includes(condoSearch.toLowerCase()) &&
                          !selectedCondos.includes(c)
                      ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-neutral-500">Nenhum condomínio encontrado</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dados Pessoais - Expansível */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPersonalData(!showPersonalData)}
                    className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                      <RiIdCardLine className="w-4 h-4 text-orange-500" />
                      Dados Pessoais
                    </span>
                    {showPersonalData ? (
                      <RiArrowUpSLine className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <RiArrowDownSLine className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>
                  {showPersonalData && (
                    <div className="p-4 space-y-3 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">CPF</label>
                          <input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleInputChange}
                            placeholder="000.000.000-00"
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">RG</label>
                          <input
                            type="text"
                            name="rg"
                            value={formData.rg}
                            onChange={handleInputChange}
                            placeholder="00.000.000-0"
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Data de Nascimento</label>
                          <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Estado Civil</label>
                          <select
                            name="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          >
                            <option value="">Selecione</option>
                            <option value="solteiro">Solteiro(a)</option>
                            <option value="casado">Casado(a)</option>
                            <option value="divorciado">Divorciado(a)</option>
                            <option value="viuvo">Viúvo(a)</option>
                            <option value="uniao_estavel">União Estável</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Profissão</label>
                        <input
                          type="text"
                          name="profession"
                          value={formData.profession}
                          onChange={handleInputChange}
                          placeholder="Ex: Engenheiro, Médica..."
                          className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Endereço - Expansível */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAddress(!showAddress)}
                    className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                      <RiMapPinLine className="w-4 h-4 text-orange-500" />
                      Endereço
                    </span>
                    {showAddress ? (
                      <RiArrowUpSLine className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <RiArrowDownSLine className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>
                  {showAddress && (
                    <div className="p-4 space-y-3 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="w-32">
                        <label className="block text-xs text-neutral-500 mb-1">CEP</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value.replace(/\D/g, "") }))}
                          placeholder="00000-000"
                          maxLength={8}
                          className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-3">
                          <label className="block text-xs text-neutral-500 mb-1">Endereço</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Rua, Avenida..."
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Nº</label>
                          <input
                            type="text"
                            name="number"
                            value={formData.number}
                            onChange={handleInputChange}
                            placeholder="Nº"
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Complemento</label>
                          <input
                            type="text"
                            name="complement"
                            value={formData.complement}
                            onChange={handleInputChange}
                            placeholder="Apto, Bloco..."
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Bairro</label>
                          <input
                            type="text"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleInputChange}
                            placeholder="Bairro"
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs text-neutral-500 mb-1">Cidade</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Cidade"
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">UF</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="UF"
                            maxLength={2}
                            className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Permuta */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasPermuta"
                      checked={formData.hasPermuta}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasPermuta: e.target.checked }))}
                      className="w-5 h-5 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Possui imóvel para permuta
                    </span>
                  </label>

                  {formData.hasPermuta && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Valor estimado (R$)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                          <input
                            type="text"
                            name="permutaValue"
                            value={formData.permutaValue}
                            onChange={handleInputChange}
                            placeholder="0"
                            className="w-full h-10 pl-8 pr-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Localização</label>
                        <input
                          type="text"
                          name="permutaLocation"
                          value={formData.permutaLocation}
                          onChange={handleInputChange}
                          placeholder="Bairro, cidade..."
                          className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiHome4Line className="inline w-4 h-4 mr-1" />
                    Imóvel de interesse
                  </label>
                  <input
                    type="text"
                    value={selectedProperty ? `${selectedProperty.code} - ${selectedProperty.title}` : searchProperty}
                    onChange={(e) => {
                      setSearchProperty(e.target.value);
                      setShowPropertyList(true);
                      if (selectedProperty) {
                        setSelectedProperty(null);
                        setFormData((prev) => ({ ...prev, propertyId: "" }));
                      }
                    }}
                    onFocus={() => setShowPropertyList(true)}
                    placeholder="Buscar imóvel..."
                    className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  
                  {showPropertyList && (searchProperty || !selectedProperty) && filteredProperties.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-48 overflow-y-auto">
                      {filteredProperties.slice(0, 8).map((property) => (
                        <button
                          key={property.id}
                          type="button"
                          onClick={() => handleSelectProperty(property)}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                        >
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {property.title}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-neutral-500">{property.code}</p>
                            <p className="text-xs font-medium text-orange-500">
                              {formatPrice(property.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiMessageLine className="inline w-4 h-4 mr-1" />
                    Mensagem
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Observações sobre o lead..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RiLoader4Line className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Criar Lead"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
