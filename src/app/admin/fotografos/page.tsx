"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCameraLine,
  RiAddLine,
  RiSearchLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCalendarLine,
  RiToggleLine,
  RiToggleFill,
} from "react-icons/ri";

interface Photographer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    photographerSessions: number;
    photographerSlots: number;
  };
}

export default function FotografosPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulário
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadPhotographers();
  }, []);

  const loadPhotographers = async () => {
    try {
      const res = await fetch("/api/admin/users?role=FOTOGRAFO");
      if (res.ok) {
        const data = await res.json();
        setPhotographers(data.users || []);
      }
    } catch (error) {
      console.error("Erro ao carregar fotógrafos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (photographer?: Photographer) => {
    if (photographer) {
      setEditingPhotographer(photographer);
      setForm({
        name: photographer.name,
        email: photographer.email,
        phone: photographer.phone || "",
        password: "",
        isActive: photographer.isActive,
      });
    } else {
      setEditingPhotographer(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      alert("Nome e e-mail são obrigatórios");
      return;
    }

    if (!editingPhotographer && !form.password) {
      alert("Senha é obrigatória para novo fotógrafo");
      return;
    }

    setSaving(true);
    try {
      const url = editingPhotographer
        ? `/api/admin/fotografos/${editingPhotographer.id}`
        : "/api/admin/fotografos";

      const res = await fetch(url, {
        method: editingPhotographer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          password: form.password || undefined,
          isActive: form.isActive,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        loadPhotographers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar fotógrafo:", error);
      alert("Erro ao salvar fotógrafo");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (photographer: Photographer) => {
    try {
      const res = await fetch(`/api/admin/fotografos/${photographer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !photographer.isActive }),
      });

      if (res.ok) {
        loadPhotographers();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleDelete = async (photographer: Photographer) => {
    if (!confirm(`Deseja realmente excluir o fotógrafo ${photographer.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/fotografos/${photographer.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadPhotographers();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir");
      }
    } catch (error) {
      console.error("Erro ao excluir fotógrafo:", error);
    }
  };

  const filteredPhotographers = photographers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Fotógrafos
          </h1>
          <p className="text-neutral-500">
            Gerencie os fotógrafos que podem acessar o sistema
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          Novo Fotógrafo
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoComplete="off"
          name="search-photographers"
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : filteredPhotographers.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <RiCameraLine className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
            Nenhum fotógrafo cadastrado
          </h3>
          <p className="text-neutral-500 mb-4">
            Cadastre fotógrafos para que eles possam gerenciar suas agendas
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600"
          >
            Cadastrar Fotógrafo
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">
                    Fotógrafo
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-500">
                    Contato
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">
                    Sessões
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-neutral-500">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-neutral-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPhotographers.map((photographer) => (
                  <tr
                    key={photographer.id}
                    className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                          {photographer.avatar ? (
                            <img
                              src={photographer.avatar}
                              alt={photographer.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <RiUserLine className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {photographer.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Desde {new Date(photographer.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-1.5">
                          <RiMailLine className="w-4 h-4 text-neutral-400" />
                          {photographer.email}
                        </p>
                        {photographer.phone && (
                          <p className="text-sm flex items-center gap-1.5">
                            <RiPhoneLine className="w-4 h-4 text-neutral-400" />
                            {photographer.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">
                            {photographer._count?.photographerSessions || 0}
                          </p>
                          <p className="text-xs text-neutral-500">Sessões</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">
                            {photographer._count?.photographerSlots || 0}
                          </p>
                          <p className="text-xs text-neutral-500">Slots</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(photographer)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          photographer.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {photographer.isActive ? (
                          <>
                            <RiToggleFill className="w-4 h-4" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <RiToggleLine className="w-4 h-4" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(photographer)}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-purple-600"
                          title="Editar"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(photographer)}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-600"
                          title="Excluir"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Novo/Editar */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">
                  {editingPhotographer ? "Editar Fotógrafo" : "Novo Fotógrafo"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome *</label>
                  <div className="relative">
                    <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      autoComplete="off"
                      name="photographer-name"
                      className="w-full pl-12 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                      placeholder="Nome do fotógrafo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">E-mail *</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="off"
                      name="photographer-email"
                      className="w-full pl-12 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <div className="relative">
                    <RiPhoneLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      autoComplete="off"
                      name="photographer-phone"
                      className="w-full pl-12 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Senha {editingPhotographer ? "(deixe em branco para manter)" : "*"}
                  </label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      autoComplete="new-password"
                      name="photographer-password"
                      className="w-full pl-12 pr-12 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? (
                        <RiEyeOffLine className="w-5 h-5" />
                      ) : (
                        <RiEyeLine className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <span className="text-sm font-medium">Conta ativa</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      form.isActive ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        form.isActive ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                  ) : (
                    <RiCheckLine className="w-5 h-5" />
                  )}
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
