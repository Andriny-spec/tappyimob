"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMailLine,
  RiMailFill,
  RiMailSendLine,
  RiMailDownloadLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiShieldCheckLine,
  RiShieldLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiRefreshLine,
  RiCloseLine,
  RiLockPasswordLine,
  RiUserLine,
  RiHardDriveLine,
  RiMailSettingsLine,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiInformationLine,
  RiMailStarLine,
  RiSpamLine,
  RiGroupLine,
  RiLoader4Line,
} from "react-icons/ri";

// ============================================================
// TYPES
// ============================================================
interface EmailAccount {
  id: string;
  email: string;
  displayName: string;
  domain: string;
  role: "admin" | "corretor" | "suporte" | "marketing" | "geral";
  status: "active" | "inactive" | "suspended";
  storageUsed: number; // MB
  storageLimit: number; // MB
  messages: number;
  percentUsed: number;
  lastLogin: string | null;
  createdAt: string;
  forwardTo: string | null;
  autoReply: boolean;
  twoFactor: boolean;
  aliases: string[];
  tags: string[];
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

function normalizeForEmail(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "");
}

function generatePassword(localPart: string): string {
  const capitalized = localPart.charAt(0).toUpperCase() + localPart.slice(1);
  return `${capitalized}@Ci2026`;
}

// Inferir role a partir das tags do Mailcow ou local_part
function inferRole(account: any): EmailAccount["role"] {
  const tags = account.tags || [];
  if (tags.includes("admin")) return "admin";
  if (tags.includes("corretor")) return "corretor";
  if (tags.includes("marketing")) return "marketing";
  if (tags.includes("suporte")) return "suporte";
  const local = account.email?.split("@")[0] || "";
  if (["admin", "administrador"].includes(local)) return "admin";
  if (["marketing", "mkt"].includes(local)) return "marketing";
  if (["suporte", "support"].includes(local)) return "suporte";
  if (["contato", "contact"].includes(local)) return "geral";
  return "geral";
}

// ============================================================
// HELPERS
// ============================================================
function formatStorage(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return `${mb} MB`;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Agora mesmo";
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function getStoragePercentage(used: number, limit: number): number {
  return Math.round((used / limit) * 100);
}

function getStorageColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function getRoleBadge(role: EmailAccount["role"]) {
  const map = {
    admin: { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" },
    corretor: { label: "Corretor", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
    suporte: { label: "Suporte", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
    marketing: { label: "Marketing", color: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400" },
    geral: { label: "Geral", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" },
  };
  return map[role];
}

function getStatusInfo(status: EmailAccount["status"]) {
  const map = {
    active: { label: "Ativo", color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
    inactive: { label: "Inativo", color: "text-neutral-500", dot: "bg-neutral-400" },
    suspended: { label: "Suspenso", color: "text-red-500", dot: "bg-red-500" },
  };
  return map[status];
}

// ============================================================
// COMPONENTS
// ============================================================

function StatsCards({ accounts }: { accounts: EmailAccount[] }) {
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.status === "active").length;
  const totalStorageUsed = accounts.reduce((s, a) => s + a.storageUsed, 0);
  const totalStorageLimit = accounts.reduce((s, a) => s + a.storageLimit, 0);
  const totalMessages = accounts.reduce((s, a) => s + (a.messages || 0), 0);
  const totalAliases = accounts.reduce((s, a) => s + (a.aliases?.length || 0), 0);

  const stats = [
    {
      label: "Contas Ativas",
      value: `${activeAccounts}/${totalAccounts}`,
      icon: RiMailFill,
      color: "text-[#0B2545]",
      bg: "bg-[#0B2545]/10 dark:bg-[#0B2545]/20",
      sub: `${totalAccounts - activeAccounts} inativa(s)`,
    },
    {
      label: "Armazenamento",
      value: formatStorage(totalStorageUsed),
      icon: RiHardDriveLine,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      sub: `de ${formatStorage(totalStorageLimit)} total`,
    },
    {
      label: "Total de Emails",
      value: formatNumber(totalMessages),
      icon: RiMailSendLine,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      sub: "nas caixas de email",
    },
    {
      label: "Aliases",
      value: formatNumber(totalAliases),
      icon: RiMailDownloadLine,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      sub: "redirecionamentos ativos",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
          <p className="text-[10px] text-neutral-400 mt-1">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

function AccountRow({
  account,
  onEdit,
  onToggleStatus,
  onDelete,
  onChangePassword,
}: {
  account: EmailAccount;
  onEdit: (a: EmailAccount) => void;
  onToggleStatus: (a: EmailAccount) => void | Promise<void>;
  onDelete: (a: EmailAccount) => void | Promise<void>;
  onChangePassword: (a: EmailAccount) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const storagePct = getStoragePercentage(account.storageUsed, account.storageLimit);
  const roleBadge = getRoleBadge(account.role);
  const statusInfo = getStatusInfo(account.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
    >
      {/* Avatar + Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-[#0B2545]/10 dark:bg-[#0B2545]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-[#0B2545] dark:text-blue-300">
            {account.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
              {account.email}
            </h3>
            <div className={`flex items-center gap-1 flex-shrink-0 ${statusInfo.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              <span className="text-[10px] font-medium">{statusInfo.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-neutral-500 truncate">{account.displayName}</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full flex-shrink-0 ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
            {account.twoFactor && (
              <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" title="2FA Ativo" />
            )}
            {account.autoReply && (
              <RiMailStarLine className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" title="Auto-resposta" />
            )}
            {account.forwardTo && (
              <RiMailSendLine className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" title={`Encaminha para ${account.forwardTo}`} />
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 lg:gap-6 ml-[52px] lg:ml-0 flex-shrink-0">
        <div className="text-center">
          <p className="text-xs font-bold text-neutral-900 dark:text-white">{formatNumber(account.messages || 0)}</p>
          <p className="text-[10px] text-neutral-400">Mensagens</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-neutral-900 dark:text-white">{account.aliases?.length || 0}</p>
          <p className="text-[10px] text-neutral-400">Aliases</p>
        </div>
        <div className="text-center min-w-[60px]">
          <p className="text-xs font-bold text-neutral-900 dark:text-white">{formatDate(account.lastLogin)}</p>
          <p className="text-[10px] text-neutral-400">Último login</p>
        </div>
      </div>

      {/* Storage Bar */}
      <div className="w-full lg:w-40 ml-[52px] lg:ml-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-neutral-500">{formatStorage(account.storageUsed)}</span>
          <span className="text-[10px] text-neutral-400">{formatStorage(account.storageLimit)}</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getStorageColor(storagePct)}`}
            style={{ width: `${Math.min(storagePct, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-neutral-400 mt-0.5 text-right">{storagePct}%</p>
      </div>

      {/* Actions */}
      <div className="relative flex items-center gap-1 ml-[52px] lg:ml-0 flex-shrink-0">
        <button
          onClick={() => onEdit(account)}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-[#0B2545] dark:hover:text-blue-300 transition-colors"
          title="Editar"
        >
          <RiEditLine className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <RiMoreLine className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl z-50 py-1 overflow-hidden"
                >
                  <button
                    onClick={() => { onToggleStatus(account); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    {account.status === "active" ? (
                      <><RiCloseCircleLine className="w-4 h-4 text-amber-500" /> Desativar</>
                    ) : (
                      <><RiCheckboxCircleLine className="w-4 h-4 text-emerald-500" /> Ativar</>
                    )}
                  </button>
                  <button
                    onClick={() => { onChangePassword(account); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <RiLockPasswordLine className="w-4 h-4" /> Alterar Senha
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      alert(`O 2FA deve ser ativado pelo próprio usuário.\n\nInstrua ${account.email} a acessar:\nhttps://mail.tappyimob.com.br/SOGo/\n\nEm: Preferências → Senha → Autenticação em dois fatores`);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <RiShieldLine className="w-4 h-4" /> {account.twoFactor ? "Desativar 2FA" : "Ativar 2FA"}
                  </button>
                  <div className="border-t border-neutral-100 dark:border-neutral-700 my-1" />
                  <button
                    onClick={() => { onDelete(account); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <RiDeleteBinLine className="w-4 h-4" /> Excluir Conta
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function CreateEditModal({
  isOpen,
  onClose,
  account,
  onSave,
  users,
}: {
  isOpen: boolean;
  onClose: () => void;
  account: EmailAccount | null;
  onSave: (data: Partial<EmailAccount>) => void;
  users: SystemUser[];
}) {
  const [email, setEmail] = useState(account?.email?.split("@")[0] || "");
  const [displayName, setDisplayName] = useState(account?.displayName || "");
  const [role, setRole] = useState<EmailAccount["role"]>(account?.role || "geral");
  const [storageLimit, setStorageLimit] = useState(account?.storageLimit || 3000);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forwardTo, setForwardTo] = useState(account?.forwardTo || "");
  const [autoReply, setAutoReply] = useState(account?.autoReply || false);
  const [twoFactor, setTwoFactor] = useState(account?.twoFactor || false);
  const [userSearch, setUserSearch] = useState("");
  const [showUserList, setShowUserList] = useState(false);

  const isEditing = !!account;
  const domain = "@tappyimob.com.br";

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSelectUser = (user: SystemUser) => {
    const localPart = normalizeForEmail(user.name);
    setEmail(localPart);
    setDisplayName(user.name);
    setPassword(generatePassword(localPart));
    const r = user.role.toLowerCase();
    if (r === "admin") setRole("admin");
    else if (r === "corretor") setRole("corretor");
    else setRole("geral");
    setShowUserList(false);
    setUserSearch("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {isEditing ? "Editar Conta" : "Nova Conta de Email"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isEditing ? `Editando ${account.email}` : "Criar nova conta no domínio da empresa"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* User Selector */}
          {!isEditing && users.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Vincular a Usuário do Sistema <span className="text-neutral-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <RiGroupLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setShowUserList(true); }}
                  onFocus={() => setShowUserList(true)}
                  placeholder="Buscar usuário pelo nome..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
                />
                {showUserList && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserList(false)} />
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl z-20 max-h-48 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-neutral-500">Nenhum usuário encontrado</p>
                      ) : (
                        filteredUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleSelectUser(u)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full bg-[#0B2545]/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-[#0B2545]">{u.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{u.name}</p>
                              <p className="text-[10px] text-neutral-500 truncate">{u.role}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Endereço de Email
            </label>
            <div className="flex">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                placeholder="usuario"
                disabled={isEditing}
                className="flex-1 px-3 py-2.5 text-sm rounded-l-xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="px-3 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-500 border border-l-0 border-neutral-200 dark:border-neutral-700 rounded-r-xl">
                {domain}
              </span>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Nome de Exibição
            </label>
            <div className="relative">
              <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome completo ou departamento"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {isEditing ? "Nova Senha" : "Senha"}{" "}
              {isEditing && <span className="text-neutral-400 font-normal">(deixe vazio para manter a atual)</span>}
            </label>
            <div className="relative">
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? "Digite para alterar a senha..." : "Mínimo 8 caracteres"}
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
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

          {/* Role + Storage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Função
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EmailAccount["role"])}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
              >
                <option value="admin">Admin</option>
                <option value="corretor">Corretor</option>
                <option value="marketing">Marketing</option>
                <option value="suporte">Suporte</option>
                <option value="geral">Geral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Armazenamento
              </label>
              <select
                value={storageLimit}
                onChange={(e) => setStorageLimit(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
              >
                <option value={1000}>1 GB</option>
                <option value={3000}>3 GB</option>
                <option value={5000}>5 GB</option>
                <option value={10000}>10 GB</option>
                <option value={25000}>25 GB</option>
              </select>
            </div>
          </div>

          {/* Forward */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Encaminhar emails para <span className="text-neutral-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <RiMailSendLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={forwardTo}
                onChange={(e) => setForwardTo(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setAutoReply(!autoReply)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  autoReply ? "bg-[#0B2545]" : "bg-neutral-300 dark:bg-neutral-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    autoReply ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Auto-resposta</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  twoFactor ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    twoFactor ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400">2FA</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave({
                email: `${email}${domain}`,
                displayName,
                role,
                storageLimit,
                forwardTo: forwardTo || null,
                autoReply,
                twoFactor,
                password,
              } as any);
              onClose();
            }}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#162d4a] rounded-xl transition-colors"
          >
            {isEditing ? "Salvar Alterações" : "Criar Conta"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ChangePasswordModal({
  isOpen,
  onClose,
  account,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  account: EmailAccount | null;
  onSave: (email: string, password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !account) return null;

  const handleSave = async () => {
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(account.email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao alterar senha");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Alterar Senha</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{account.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Nova Senha</label>
            <div className="relative">
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Confirmar Senha</label>
            <div className="relative">
              <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-neutral-100 dark:border-neutral-800">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !password}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#162d4a] rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <><RiLoader4Line className="w-4 h-4 animate-spin" /> Salvando...</> : "Alterar Senha"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function BulkCreateModal({
  isOpen,
  onClose,
  users,
  existingEmails,
  onBulkCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  users: SystemUser[];
  existingEmails: string[];
  onBulkCreate: (items: { localPart: string; name: string; password: string; role: string }[]) => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ email: string; ok: boolean; error?: string }[]>([]);

  const existingLocalParts = existingEmails.map((e) => e.split("@")[0].toLowerCase());

  const pending = users
    .filter((u) => u.isActive)
    .map((u) => {
      const localPart = normalizeForEmail(u.name);
      const already = existingLocalParts.includes(localPart);
      return { user: u, localPart, already };
    })
    .filter((p) => !p.already && p.localPart.length >= 2);

  const handleCreate = async () => {
    setCreating(true);
    setResults([]);
    const items = pending.map((p) => ({
      localPart: p.localPart,
      name: p.user.name,
      password: generatePassword(p.localPart),
      role: p.user.role,
    }));
    await onBulkCreate(items);
    setCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!creating ? onClose : undefined}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiGroupLine className="w-5 h-5 text-[#0B2545]" />
              Criar Contas para Todos
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {pending.length} usuário(s) sem conta de email
            </p>
          </div>
          <button onClick={onClose} disabled={creating} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50">
            <RiCloseLine className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="p-5">
          {pending.length === 0 ? (
            <div className="text-center py-8">
              <RiCheckboxCircleLine className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Todos os usuários já possuem conta de email!</p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 border border-amber-200 dark:border-amber-500/20 mb-4">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Será criada uma conta <strong>nome@tappyimob.com.br</strong> para cada usuário abaixo.
                  A senha padrão segue o formato <strong>Nome@Ci2026</strong>. Cada corretor deve trocar sua senha no primeiro acesso.
                </p>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800">
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-neutral-500 uppercase">Usuário</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-neutral-500 uppercase">Email a criar</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-neutral-500 uppercase">Senha</th>
                      <th className="text-left px-3 py-2 text-[10px] font-semibold text-neutral-500 uppercase">Função</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {pending.map((p) => (
                      <tr key={p.user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#0B2545]/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-[#0B2545]">{p.user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-xs font-medium text-neutral-900 dark:text-white truncate">{p.user.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400">{p.localPart}@tappyimob.com.br</td>
                        <td className="px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400 font-mono">{generatePassword(p.localPart)}</td>
                        <td className="px-3 py-2 text-xs text-neutral-500">{p.user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {pending.length > 0 && (
          <div className="flex items-center justify-end gap-2 p-5 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#162d4a] rounded-xl transition-colors disabled:opacity-50"
            >
              {creating ? (
                <><RiLoader4Line className="w-4 h-4 animate-spin" /> Criando...</>
              ) : (
                <><RiGroupLine className="w-4 h-4" /> Criar {pending.length} Conta(s)</>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function EmailsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"email" | "storage" | "messages" | "aliases">("email");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAccount, setPasswordAccount] = useState<EmailAccount | null>(null);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?limit=200");
      if (!res.ok) return;
      const data = await res.json();
      setSystemUsers((data.users || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
      })));
    } catch {}
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/email/mailboxes");
      if (!res.ok) throw new Error("Erro ao carregar contas");
      const data = await res.json();
      const mapped = (data.accounts || []).map((a: any) => ({
        ...a,
        role: inferRole(a),
        forwardTo: null,
        autoReply: false,
        twoFactor: false,
      }));
      setAccounts(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar contas de email");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
  }, [fetchAccounts, fetchUsers]);

  const filtered = useMemo(() => {
    let list = [...accounts];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.email.toLowerCase().includes(q) ||
          a.displayName.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (roleFilter !== "all") {
      list = list.filter((a) => a.role === roleFilter);
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "storage": cmp = a.storageUsed - b.storageUsed; break;
        case "messages": cmp = (a.messages || 0) - (b.messages || 0); break;
        case "aliases": cmp = (a.aliases?.length || 0) - (b.aliases?.length || 0); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [accounts, search, statusFilter, roleFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleToggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const handleToggleStatus = async (account: EmailAccount) => {
    const newActive = account.status !== "active";
    try {
      const res = await fetch("/api/admin/email/mailboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", email: account.email, active: newActive }),
      });
      if (!res.ok) throw new Error("Erro ao alterar status");
      fetchAccounts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (account: EmailAccount) => {
    if (confirm(`Tem certeza que deseja excluir ${account.email}? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita.`)) {
      try {
        const res = await fetch("/api/admin/email/mailboxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", emails: [account.email] }),
        });
        if (!res.ok) throw new Error("Erro ao excluir conta");
        fetchAccounts();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSave = async (data: Partial<EmailAccount> & { password?: string }) => {
    try {
      if (editingAccount) {
        const updatePayload: any = {
          action: "update",
          email: editingAccount.email,
          name: data.displayName,
          quota: data.storageLimit,
        };
        if ((data as any).password) {
          updatePayload.password = (data as any).password;
        }
        const res = await fetch("/api/admin/email/mailboxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
        if (!res.ok) throw new Error("Erro ao atualizar conta");
      } else {
        const localPart = data.email?.split("@")[0] || "";
        const domain = data.email?.split("@")[1] || "tappyimob.com.br";
        const res = await fetch("/api/admin/email/mailboxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            localPart,
            domain,
            name: data.displayName || localPart,
            password: (data as any).password || "Mudar@123",
            quota: data.storageLimit || 3072,
          }),
        });
        if (!res.ok) throw new Error("Erro ao criar conta");
      }
      fetchAccounts();
    } catch (err: any) {
      alert(err.message);
    }
    setEditingAccount(null);
  };

  const handleBulkCreate = async (items: { localPart: string; name: string; password: string; role: string }[]) => {
    for (const item of items) {
      try {
        await fetch("/api/admin/email/mailboxes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            localPart: item.localPart,
            domain: "tappyimob.com.br",
            name: item.name,
            password: item.password,
            quota: 3072,
          }),
        });
      } catch {}
    }
    setShowBulkModal(false);
    fetchAccounts();
  };

  const handleChangePassword = async (email: string, password: string) => {
    const res = await fetch("/api/admin/email/mailboxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", email, password }),
    });
    if (!res.ok) throw new Error("Erro ao alterar senha");
    setShowPasswordModal(false);
    setPasswordAccount(null);
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? (
      <RiArrowUpLine className="w-3 h-3" />
    ) : (
      <RiArrowDownLine className="w-3 h-3" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiMailFill className="w-7 h-7 text-[#0B2545]" />
            Emails Imob
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Gerencie as contas de email da empresa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAccounts()}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Atualizar"
          >
            <RiRefreshLine className="w-4 h-4 text-neutral-500" />
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0B2545] bg-[#0B2545]/10 hover:bg-[#0B2545]/20 rounded-xl transition-colors"
          >
            <RiGroupLine className="w-4 h-4" />
            Criar Todos
          </button>
          <button
            onClick={() => { setEditingAccount(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B2545] hover:bg-[#162d4a] rounded-xl transition-colors shadow-sm"
          >
            <RiAddLine className="w-4 h-4" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards accounts={accounts} />

      {/* Filters + Search */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por email ou nome..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className="px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
          >
            <option value="all">Todas as Funções</option>
            <option value="admin">Admin</option>
            <option value="corretor">Corretor</option>
            <option value="marketing">Marketing</option>
            <option value="suporte">Suporte</option>
            <option value="geral">Geral</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-1 py-1">
            {(["email", "storage", "messages", "aliases"] as const).map((col) => (
              <button
                key={col}
                onClick={() => handleToggleSort(col)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                  sortBy === col
                    ? "bg-white dark:bg-neutral-700 text-[#0B2545] dark:text-blue-300 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                {{ email: "Email", storage: "Storage", messages: "Msgs", aliases: "Aliases" }[col]}
                <SortIcon col={col} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {paginated.length === 0 ? (
            <div className="text-center py-16">
              <RiMailLine className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                Nenhuma conta encontrada
              </h3>
              <p className="text-xs text-neutral-500">Tente ajustar os filtros ou crie uma nova conta</p>
            </div>
          ) : (
            paginated.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                onEdit={(a) => { setEditingAccount(a); setShowModal(true); }}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onChangePassword={(a) => { setPasswordAccount(a); setShowPasswordModal(true); }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">
              Mostrando {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <RiArrowLeftSLine className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-[#0B2545] text-white"
                      : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <RiArrowRightSLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-200 dark:border-red-500/20">
          <RiInformationLine className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Erro de conexão</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {error}. Verifique as configurações do Mailcow nas{" "}
              <a href="/admin/emails/configuracoes" className="underline font-medium">Configurações</a>.
            </p>
          </div>
        </div>
      )}

      {loading && accounts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B2545]"></div>
          <span className="ml-3 text-sm text-neutral-500">Carregando contas de email...</span>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateEditModal
            isOpen={showModal}
            onClose={() => { setShowModal(false); setEditingAccount(null); }}
            account={editingAccount}
            onSave={handleSave}
            users={systemUsers}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkModal && (
          <BulkCreateModal
            isOpen={showBulkModal}
            onClose={() => setShowBulkModal(false)}
            users={systemUsers}
            existingEmails={accounts.map((a) => a.email)}
            onBulkCreate={handleBulkCreate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={() => { setShowPasswordModal(false); setPasswordAccount(null); }}
            account={passwordAccount}
            onSave={handleChangePassword}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
