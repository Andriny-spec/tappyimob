"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiBuilding2Line,
  RiGlobalLine,
  RiTeamLine,
  RiCheckLine,
  RiCloseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiLoader4Line,
  RiKeyLine,
  RiBarChartLine,
  RiMore2Fill,
  RiEyeLine,
  RiArrowLeftLine,
} from "react-icons/ri";

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  primaryColor: string;
  isActive: boolean;
  maxProperties: number;
  maxLeads: number;
  currentProperties: number;
  currentLeadsMonth: number;
  createdAt: string;
  expiresAt?: string;
  domains: { domain: string; isPrimary: boolean }[];
  _count: { domains: number; apiKeys: number };
}

export default function ParceirosPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cnpj: "",
    city: "",
    state: "",
    primaryColor: "#25D366",
    maxProperties: 100,
    maxLeads: 500,
    subdomain: "",
    customDomain: "",
  });

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/partners?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
      }
    } catch (error) {
      console.error("Erro ao buscar parceiros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingPartner ? "PUT" : "POST";
      const body = editingPartner ? { id: editingPartner.id, ...form } : form;

      const res = await fetch("/api/admin/partners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchPartners();
        setShowModal(false);
        setEditingPartner(null);
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar parceiro");
      }
    } catch (error) {
      console.error("Erro ao salvar parceiro:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro? Todos os dados serão perdidos.")) return;

    try {
      const res = await fetch(`/api/admin/partners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPartners();
      }
    } catch (error) {
      console.error("Erro ao excluir parceiro:", error);
    }
  };

  const handleToggleStatus = async (partner: Partner) => {
    try {
      await fetch("/api/admin/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: partner.id, isActive: !partner.isActive }),
      });
      fetchPartners();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      cnpj: "",
      city: "",
      state: "",
      primaryColor: "#25D366",
      maxProperties: 100,
      maxLeads: 500,
      subdomain: "",
      customDomain: "",
    });
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      email: partner.email || "",
      phone: partner.phone || "",
      cnpj: "",
      city: partner.city || "",
      state: partner.state || "",
      primaryColor: partner.primaryColor,
      maxProperties: partner.maxProperties,
      maxLeads: partner.maxLeads,
      subdomain: "",
      customDomain: "",
    });
    setShowModal(true);
  };

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <RiTeamLine className="w-5 h-5 text-blue-600" />
              </div>
              Parceiros
            </h1>
            <p className="text-neutral-500 mt-1">
              Gerencie suas imobiliárias parceiras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar parceiro..."
              className="w-64 h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <button
            onClick={fetchPartners}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RiRefreshLine className="w-4 h-4 text-neutral-500" />
          </button>

          <button
            onClick={() => {
              setEditingPartner(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Parceiro
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Total de Parceiros</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{partners.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Ativos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{partners.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Total Imóveis</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{partners.reduce((sum, p) => sum + p.currentProperties, 0)}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Leads este mês</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{partners.reduce((sum, p) => sum + p.currentLeadsMonth, 0)}</p>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <RiTeamLine className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500">Nenhum parceiro encontrado</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            Criar primeiro parceiro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header do Card */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: partner.primaryColor }}
                  >
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      partner.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{partner.name}</h3>
                    <p className="text-sm text-neutral-500 truncate">
                      {partner.domains[0]?.domain || `${partner.slug}.tappyimob.com.br`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(partner)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        partner.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-neutral-400 hover:bg-neutral-100"
                      }`}
                      title={partner.isActive ? "Desativar" : "Ativar"}
                    >
                      {partner.isActive ? <RiCheckLine className="w-4 h-4" /> : <RiCloseLine className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 divide-x divide-neutral-100 dark:divide-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="p-3 text-center">
                  <p className="text-xs text-neutral-500">Imóveis</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {partner.currentProperties}/{partner.maxProperties}
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-neutral-500">Leads/mês</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {partner.currentLeadsMonth}/{partner.maxLeads}
                  </p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-neutral-500">Domínios</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {partner._count.domains}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="p-3 flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-700">
                <Link
                  href={`/admin/multi-sites/parceiros/${partner.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  <RiEyeLine className="w-4 h-4" />
                  Detalhes
                </Link>
                <button
                  onClick={() => openEditModal(partner)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RiEditLine className="w-4 h-4 text-neutral-500" />
                </button>
                <a
                  href={`https://${partner.domains[0]?.domain || `${partner.slug}.tappyimob.com.br`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RiExternalLinkLine className="w-4 h-4 text-neutral-500" />
                </a>
                <button
                  onClick={() => handleDelete(partner.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <RiDeleteBinLine className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-xl font-bold">
                  {editingPartner ? "Editar Parceiro" : "Novo Parceiro"}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Imobiliária *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Imobiliária Cajamar"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="contato@imobiliaria.com"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cidade</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="São Paulo"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cor Principal</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                      className="w-12 h-10 rounded-lg border border-neutral-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={form.primaryColor}
                      onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Limite de Imóveis</label>
                    <input
                      type="number"
                      value={form.maxProperties}
                      onChange={(e) => setForm({ ...form, maxProperties: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Limite de Leads/mês</label>
                    <input
                      type="number"
                      value={form.maxLeads}
                      onChange={(e) => setForm({ ...form, maxLeads: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                {!editingPartner && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Domínio Personalizado (opcional)</label>
                    <input
                      type="text"
                      value={form.customDomain}
                      onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                      placeholder="Ex: cajamar.com.br (deixe vazio para usar subdomínio)"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Subdomínio será criado automaticamente: slug.tappyimob.com.br
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-blue-700"
                >
                  {editingPartner ? "Salvar Alterações" : "Criar Parceiro"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
