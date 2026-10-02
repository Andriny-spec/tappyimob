"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldLine,
  RiSearchLine,
  RiCloseLine,
  RiCheckLine,
  RiUserLine,
  RiFilterLine,
  RiEditLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiAddLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLockLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { ALL_MODULE_KEYS } from "@/components/admin/Sidebar";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "ADMIN" | "CORRETOR" | "CLIENTE" | "FOTOGRAFO" | "SDR" | "PARCEIRO_EXTERNO" | "MARKETING" | "ASSINANTE";
  allowedModules: string[];
  isActive: boolean;
  creci: string | null;
  createdAt: string;
  updatedAt: string;
}

const ROLES = [
  { value: "ADMIN", label: "Administrador", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  { value: "CORRETOR", label: "Corretor", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  { value: "CLIENTE", label: "Cliente", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  { value: "FOTOGRAFO", label: "Fotógrafo", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" },
  { value: "SDR", label: "SDR", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" },
  { value: "PARCEIRO_EXTERNO", label: "Parceiro externo", color: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400" },
  { value: "MARKETING", label: "Marketing", color: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400" },
  { value: "ASSINANTE", label: "Assinante", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Estado do formulário de edição
  const [editRole, setEditRole] = useState("");
  const [editModules, setEditModules] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [changeEditPassword, setChangeEditPassword] = useState(false); // só altera senha se marcado

  // Estado do formulário de criação
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("CORRETOR");
  const [newModules, setNewModules] = useState<string[]>([]);
  const [newCreci, setNewCreci] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/admin/usuarios?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  useEffect(() => {
    setPage(1);
    const timeout = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Excluir permanentemente "${user.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        const d = await res.json();
        alert(d.error || "Erro ao excluir usuário");
      }
    } catch {
      alert("Erro ao excluir usuário");
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditModules(user.allowedModules || []);
    setEditPassword("");
    setChangeEditPassword(false);
    setEditIsActive(user.isActive);
    setEditPassword("");
    setShowEditPassword(false);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          allowedModules: editModules,
          isActive: editIsActive,
          ...(changeEditPassword && editPassword.length >= 6 ? { password: editPassword } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => prev.map(u => u.id === data.user.id ? data.user : u));
        setEditingUser(null);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (moduleKey: string) => {
    setEditModules(prev =>
      prev.includes(moduleKey)
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const selectAllModules = () => {
    setEditModules(ALL_MODULE_KEYS.map(m => m.key));
  };

  const clearAllModules = () => {
    setEditModules([]);
  };

  const openCreateModal = () => {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewPhone("");
    setNewRole("CORRETOR");
    setNewModules([]);
    setNewCreci("");
    setShowPassword(false);
    setShowCreateModal(true);
  };

  const createUser = async () => {
    if (!newName || !newEmail || !newPassword) {
      alert("Nome, email e senha são obrigatórios");
      return;
    }
    if (newPassword.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          phone: newPhone || null,
          role: newRole,
          allowedModules: newModules,
          creci: newCreci || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => [...prev, data.user].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
        setShowCreateModal(false);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar usuário");
      }
    } catch (error) {
      console.error("Erro ao criar:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleNewModule = (moduleKey: string) => {
    setNewModules(prev =>
      prev.includes(moduleKey)
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const getRoleBadge = (role: string) => {
    const r = ROLES.find(r => r.value === role);
    return r ? (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.color}`}>
        {r.label}
      </span>
    ) : role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiShieldLine className="w-7 h-7 text-[#0B2545]" />
            Usuários
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gerencie roles e permissões de módulos da sidebar
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-medium hover:bg-[#0B2545]/90 transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            name="search_usuarios"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
          />
        </div>
        <div className="flex gap-2">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(prev => prev === r.value ? "" : r.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                roleFilter === r.value
                  ? "border-[#0B2545] bg-[#0B2545]/10 text-[#0B2545]"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
            <RiUserLine className="w-12 h-12 mb-2" />
            <p>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Módulos</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-300 overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "ADMIN" && (!user.allowedModules || user.allowedModules.length === 0) ? (
                        <span className="text-xs text-neutral-500 italic">Acesso total</span>
                      ) : user.allowedModules?.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {user.allowedModules.slice(0, 3).map(mod => {
                            const moduleInfo = ALL_MODULE_KEYS.find(m => m.key === mod);
                            return (
                              <span key={mod} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                {moduleInfo?.label || mod}
                              </span>
                            );
                          })}
                          {user.allowedModules.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                              +{user.allowedModules.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Nenhum módulo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <RiCheckboxCircleLine className="w-4 h-4" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <RiCloseCircleLine className="w-4 h-4" /> Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-[#0B2545] transition-colors"
                        >
                          <RiEditLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Excluir usuário"
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Mostrando <strong>{users.length}</strong> de <strong>{total}</strong> usuários
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <RiArrowLeftSLine className="w-4 h-4" />
              </button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <RiArrowRightSLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-orange shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-300 overflow-hidden flex-shrink-0">
                    {editingUser.avatar ? (
                      <img src={editingUser.avatar} alt={editingUser.name} className="w-full h-full object-cover" />
                    ) : (
                      editingUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{editingUser.name}</h3>
                    <p className="text-xs text-neutral-500">{editingUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Role */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setEditRole(r.value)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          editRole === r.value
                            ? "border-[#0B2545] bg-[#0B2545]/10 text-[#0B2545] dark:text-blue-300"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status ativo */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditIsActive(true)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        editIsActive
                          ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/50"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <RiCheckboxCircleLine className="w-4 h-4 inline mr-1" /> Ativo
                    </button>
                    <button
                      onClick={() => setEditIsActive(false)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        !editIsActive
                          ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/50"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <RiCloseCircleLine className="w-4 h-4 inline mr-1" /> Inativo
                    </button>
                  </div>
                </div>

                {/* Módulos da Sidebar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Módulos da Sidebar
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllModules}
                        className="text-xs text-[#0B2545] hover:underline"
                      >
                        Selecionar todos
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button
                        onClick={clearAllModules}
                        className="text-xs text-neutral-500 hover:underline"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {editRole === "ADMIN" && editModules.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg mb-2">
                      Admin sem módulos selecionados = acesso total a tudo
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-1.5 max-h-[280px] overflow-y-auto scrollbar-orange pr-1">
                    {ALL_MODULE_KEYS.map(mod => (
                      <button
                        key={mod.key}
                        onClick={() => toggleModule(mod.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          editModules.includes(mod.key)
                            ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-blue-300 ring-1 ring-[#0B2545]/30"
                            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {editModules.includes(mod.key) ? (
                          <RiCheckLine className="w-3.5 h-3.5 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded border border-neutral-300 dark:border-neutral-600 flex-shrink-0" />
                        )}
                        <span className="truncate">{mod.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Senha — só altera se marcar explicitamente (evita troca acidental) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={changeEditPassword}
                      onChange={(e) => { setChangeEditPassword(e.target.checked); if (!e.target.checked) setEditPassword(""); }}
                      className="rounded"
                    />
                    Alterar senha deste usuário
                  </label>
                  {!changeEditPassword ? (
                    <p className="text-xs text-neutral-400">A senha atual será mantida. Editar permissões não altera a senha.</p>
                  ) : (
                    <>
                      <div className="relative">
                        <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type={showEditPassword ? "text" : "password"}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Nova senha (mínimo 6 caracteres)"
                          minLength={6}
                          autoComplete="new-password"
                          name="edit-user-new-password"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
                          className="w-full px-3 py-2.5 pl-10 pr-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showEditPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                        </button>
                      </div>
                      {editPassword.length > 0 && editPassword.length < 6 && (
                        <p className="text-xs text-red-500 mt-1">A senha deve ter no mínimo 6 caracteres</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveUser}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#0B2545] text-white hover:bg-[#0B2545]/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Criação */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-orange shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <RiAddLine className="w-5 h-5 text-[#0B2545]" />
                  Novo Usuário
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Nome */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    autoComplete="new-email"
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                    Senha * <span className="text-neutral-400 font-normal">(mín. 6 caracteres)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      name="new-user-password"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Telefone + CRECI em grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 block">
                      CRECI
                    </label>
                    <input
                      type="text"
                      value={newCreci}
                      onChange={(e) => setNewCreci(e.target.value)}
                      placeholder="Opcional"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setNewRole(r.value)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          newRole === r.value
                            ? "border-[#0B2545] bg-[#0B2545]/10 text-[#0B2545] dark:text-blue-300"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Módulos da Sidebar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Módulos da Sidebar
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewModules(ALL_MODULE_KEYS.map(m => m.key))}
                        className="text-xs text-[#0B2545] hover:underline"
                      >
                        Todos
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button
                        onClick={() => setNewModules([])}
                        className="text-xs text-neutral-500 hover:underline"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {newRole === "ADMIN" && newModules.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg mb-2">
                      Admin sem módulos selecionados = acesso total a tudo
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto scrollbar-orange pr-1">
                    {ALL_MODULE_KEYS.map(mod => (
                      <button
                        key={mod.key}
                        onClick={() => toggleNewModule(mod.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                          newModules.includes(mod.key)
                            ? "bg-[#0B2545]/10 text-[#0B2545] dark:text-blue-300 ring-1 ring-[#0B2545]/30"
                            : "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {newModules.includes(mod.key) ? (
                          <RiCheckLine className="w-3.5 h-3.5 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded border border-neutral-300 dark:border-neutral-600 flex-shrink-0" />
                        )}
                        <span className="truncate">{mod.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createUser}
                  disabled={saving || !newName || !newEmail || !newPassword}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#0B2545] text-white hover:bg-[#0B2545]/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Criando..." : "Criar Usuário"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
