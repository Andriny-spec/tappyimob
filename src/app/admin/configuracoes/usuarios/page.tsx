"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiUserSettingsLine,
  RiAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiLockLine,
  RiMailLine,
  RiShieldUserLine,
  RiUserStarLine,
  RiCheckLine,
  RiCloseLine,
  RiRefreshLine,
} from "react-icons/ri";

const usuarios = [
  {
    id: "1",
    nome: "Willian Bianchi",
    email: "willian@tappyimob.com.br",
    papel: "admin",
    status: "ativo",
    ultimoAcesso: "2024-01-25T14:30:00",
    avatar: null,
  },
  {
    id: "2",
    nome: "Carlos Oliveira",
    email: "carlos@tappyimob.com.br",
    papel: "corretor",
    status: "ativo",
    ultimoAcesso: "2024-01-25T12:15:00",
    avatar: null,
  },
  {
    id: "3",
    nome: "Maria Silva",
    email: "maria@tappyimob.com.br",
    papel: "corretor",
    status: "ativo",
    ultimoAcesso: "2024-01-25T10:45:00",
    avatar: null,
  },
  {
    id: "4",
    nome: "Fernanda Lima",
    email: "fernanda@tappyimob.com.br",
    papel: "corretor",
    status: "ativo",
    ultimoAcesso: "2024-01-24T18:30:00",
    avatar: null,
  },
  {
    id: "5",
    nome: "Ana Santos",
    email: "ana@tappyimob.com.br",
    papel: "financeiro",
    status: "ativo",
    ultimoAcesso: "2024-01-25T09:00:00",
    avatar: null,
  },
  {
    id: "6",
    nome: "Roberto Almeida",
    email: "roberto@tappyimob.com.br",
    papel: "corretor",
    status: "inativo",
    ultimoAcesso: "2024-01-10T16:20:00",
    avatar: null,
  },
];

const papeis = [
  { id: "admin", label: "Administrador", cor: "bg-purple-500" },
  { id: "corretor", label: "Corretor", cor: "bg-blue-500" },
  { id: "financeiro", label: "Financeiro", cor: "bg-green-500" },
  { id: "marketing", label: "Marketing", cor: "bg-amber-500" },
];

const stats = [
  { label: "Total de Usuários", value: "12", icon: RiUserSettingsLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  { label: "Ativos", value: "10", icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  { label: "Inativos", value: "2", icon: RiCloseLine, color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20" },
  { label: "Corretores", value: "8", icon: RiUserStarLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
];

export default function UsuariosConfigPage() {
  const [search, setSearch] = useState("");
  const [papelFilter, setPapelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR") + " às " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const getPapelConfig = (papelId: string) => {
    return papeis.find(p => p.id === papelId) || papeis[1];
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPapel = papelFilter === "all" || u.papel === papelFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchPapel && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/configuracoes" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <RiUserSettingsLine className="w-5 h-5 text-green-500" />
              </div>
              Usuários
            </h1>
            <p className="text-neutral-500 mt-1">Gerencie os usuários do sistema</p>
          </div>
        </div>

        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600">
          <RiAddLine className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
        <select
          value={papelFilter}
          onChange={(e) => setPapelFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todos os papéis</option>
          {papeis.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Usuário</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Papel</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Último Acesso</th>
                <th className="text-right p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario, index) => {
                const papelConfig = getPapelConfig(usuario.papel);
                return (
                  <motion.tr
                    key={usuario.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-700 flex items-center justify-center text-white font-semibold">
                          {usuario.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{usuario.nome}</p>
                          <p className="text-sm text-neutral-500">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-white ${papelConfig.cor}`}>
                        {papelConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        usuario.status === "ativo"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                      }`}>
                        {usuario.status === "ativo" ? <RiCheckLine className="w-3.5 h-3.5" /> : <RiCloseLine className="w-3.5 h-3.5" />}
                        {usuario.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{formatDate(usuario.ultimoAcesso)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500" title="Editar">
                          <RiEditLine className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-amber-500" title="Redefinir Senha">
                          <RiLockLine className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500" title="Enviar E-mail">
                          <RiMailLine className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-red-500" title="Desativar">
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-2xl border border-green-200 dark:border-green-500/20"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-400 mb-1">Convide novos membros</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Envie convites por e-mail para adicionar novos usuários à equipe
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="email"
              placeholder="email@exemplo.com"
              className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-green-200 dark:border-green-500/30 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600">
              <RiMailLine className="w-4 h-4" />
              Enviar Convite
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
