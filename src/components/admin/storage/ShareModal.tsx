"use client";

import { useState, useEffect, useRef } from "react";
import {
  RiCloseLine,
  RiShareLine,
  RiLinkM,
  RiFileCopyLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiLoader4Line,
  RiUser3Line,
  RiShieldLine,
  RiLockLine,
  RiTimeLine,
  RiSearchLine,
  RiEyeLine,
  RiEditLine,
  RiAdminLine,
  RiTeamLine,
  RiMailLine,
  RiMailSendLine,
  RiAddLine,
  RiMailCheckLine,
} from "react-icons/ri";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "file" | "folder";
  id: string;
  name: string;
  onRefresh?: () => void;
}

interface Permission {
  id: string;
  userId: string;
  role: string;
  canUpload: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  expiresAt: string | null;
  user: { id: string; name: string; email: string; avatar: string | null; role: string };
  grantedBy: { id: string; name: string } | null;
  createdAt: string;
}

interface UserResult {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

const ROLE_OPTIONS = [
  { value: "VIEWER", label: "Visualizar", icon: RiEyeLine, color: "text-blue-500" },
  { value: "EDITOR", label: "Editar", icon: RiEditLine, color: "text-amber-500" },
  { value: "ADMIN", label: "Admin", icon: RiAdminLine, color: "text-purple-500" },
];

export function ShareModal({ isOpen, onClose, type, id, name, onRefresh }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [hasShareLink, setHasShareLink] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [target, setTarget] = useState<any>(null);

  // Link form
  const [linkPassword, setLinkPassword] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  // User search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState("VIEWER");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Email invite
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Tab
  const [tab, setTab] = useState<"people" | "email" | "link">("people");

  useEffect(() => {
    if (isOpen && id) {
      fetchPermissions();
    }
  }, [isOpen, id]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/storage/permissions?type=${type}&id=${id}`);
      const data = await res.json();
      setPermissions(data.permissions || []);
      setTarget(data.target);
      setHasShareLink(data.hasShareLink);
      setHasPassword(data.hasPassword);
      if (data.target?.shareToken) {
        setShareUrl(`${window.location.origin}/compartilhado/${data.target.shareToken}`);
      }
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
    }
    setLoading(false);
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        const users = (data.users || data || []).filter(
          (u: UserResult) => !permissions.some((p) => p.userId === u.id)
        );
        setSearchResults(users);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
      setSearching(false);
    }, 300);
  };

  const handleAddPermission = async (userId: string) => {
    try {
      await fetch("/api/admin/storage/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, userId, role: selectedRole }),
      });
      setSearchQuery("");
      setSearchResults([]);
      fetchPermissions();
    } catch (err) {
      console.error("Erro ao adicionar permissão:", err);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await fetch("/api/admin/storage/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, userId, role }),
      });
      fetchPermissions();
    } catch (err) {
      console.error("Erro ao atualizar permissão:", err);
    }
  };

  const handleRemovePermission = async (userId: string) => {
    try {
      await fetch(`/api/admin/storage/permissions?type=${type}&id=${id}&userId=${userId}`, {
        method: "DELETE",
      });
      fetchPermissions();
    } catch (err) {
      console.error("Erro ao remover permissão:", err);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/admin/storage/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          id,
          password: linkPassword || undefined,
          expiresInDays: linkExpiry ? parseInt(linkExpiry) : undefined,
        }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        setShareUrl(`${window.location.origin}${data.shareUrl}`);
        setHasShareLink(true);
        setHasPassword(!!linkPassword);
      }
    } catch (err) {
      console.error("Erro ao gerar link:", err);
    }
    setGeneratingLink(false);
  };

  const handleRevokeLink = async () => {
    try {
      await fetch(`/api/admin/storage/share?type=${type}&id=${id}`, { method: "DELETE" });
      setShareUrl("");
      setHasShareLink(false);
      setHasPassword(false);
    } catch (err) {
      console.error("Erro ao revogar link:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddEmail = () => {
    const email = emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email) && !emailList.includes(email)) {
      setEmailList([...emailList, email]);
      setEmailInput("");
      setEmailError("");
    } else if (email && !emailRegex.test(email)) {
      setEmailError("E-mail inválido");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmailList(emailList.filter((e) => e !== email));
  };

  const handleSendEmails = async () => {
    if (emailList.length === 0) return;
    setSendingEmails(true);
    setEmailError("");
    try {
      const res = await fetch("/api/admin/storage/share/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          id,
          emails: emailList,
          message: emailMessage || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSent(true);
        setHasShareLink(true);
        if (data.shareToken) {
          setShareUrl(`${window.location.origin}/compartilhado/${data.shareToken}`);
        }
        setTimeout(() => {
          setEmailSent(false);
          setEmailList([]);
          setEmailMessage("");
        }, 3000);
      } else {
        setEmailError(data.error || "Erro ao enviar");
      }
    } catch (err) {
      setEmailError("Erro ao enviar e-mails");
    }
    setSendingEmails(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiShareLine className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Compartilhar</h2>
              <p className="text-xs text-neutral-500 truncate">{name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setTab("people")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "people"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <RiTeamLine className="w-4 h-4 inline-block mr-1.5" />
            Pessoas
          </button>
          <button
            onClick={() => setTab("email")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "email"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <RiMailLine className="w-4 h-4 inline-block mr-1.5" />
            E-mail
          </button>
          <button
            onClick={() => setTab("link")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "link"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <RiLinkM className="w-4 h-4 inline-block mr-1.5" />
            Link
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[55vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RiLoader4Line className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : tab === "email" ? (
            /* Tab Email */
            <div className="p-4 space-y-4">
              {emailSent ? (
                <div className="text-center py-8">
                  <RiMailCheckLine className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">E-mails enviados com sucesso!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs text-neutral-500 font-medium">Adicionar e-mails</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddEmail(); } }}
                        placeholder="email@exemplo.com"
                        className="flex-1 px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddEmail}
                        className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 flex items-center gap-1"
                      >
                        <RiAddLine className="w-4 h-4" />
                      </button>
                    </div>
                    {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                  </div>

                  {emailList.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-500 font-medium">Destinatários ({emailList.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {emailList.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-xs"
                          >
                            {email}
                            <button
                              onClick={() => handleRemoveEmail(email)}
                              className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-500/30"
                            >
                              <RiCloseLine className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-neutral-500 font-medium mb-1">Mensagem (opcional)</label>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Olá, estou compartilhando estes arquivos..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSendEmails}
                    disabled={emailList.length === 0 || sendingEmails}
                    className="w-full py-2.5 bg-[#0B2545] text-white rounded-xl text-sm font-medium hover:bg-[#163A6B] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingEmails ? (
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                      <RiMailSendLine className="w-4 h-4" />
                    )}
                    Enviar para {emailList.length} e-mail{emailList.length !== 1 ? "s" : ""}
                  </button>
                </>
              )}
            </div>
          ) : tab === "people" ? (
            <div className="p-4 space-y-4">
              {/* Buscar pessoa */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchUsers(e.target.value)}
                      placeholder="Buscar por nome ou email..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searching && (
                      <RiLoader4Line className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-neutral-400" />
                    )}
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Resultados da busca */}
                {searchResults.length > 0 && (
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddPermission(user.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-b-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.name?.charAt(0)?.toUpperCase() || "?"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <span className="text-xs text-blue-500 font-medium">+ Adicionar</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dono */}
              {target?.createdBy && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    {target.createdBy.avatar ? (
                      <img src={target.createdBy.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <RiUser3Line className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{target.createdBy.name}</p>
                    <p className="text-xs text-neutral-500">Proprietário</p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 text-[10px] font-medium rounded-full uppercase">
                    Dono
                  </span>
                </div>
              )}

              {/* Lista de permissões */}
              {permissions.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 uppercase font-medium px-1">Pessoas com acesso</p>
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium">
                        {perm.user.avatar ? (
                          <img src={perm.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          perm.user.name?.charAt(0)?.toUpperCase() || "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{perm.user.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{perm.user.email}</p>
                      </div>
                      <select
                        value={perm.role}
                        onChange={(e) => handleUpdateRole(perm.userId, e.target.value)}
                        className="px-2 py-1 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemovePermission(perm.userId)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Remover acesso"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-400">
                  <RiTeamLine className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  <p className="text-sm">Nenhuma pessoa adicionada</p>
                  <p className="text-xs">Busque por nome ou email acima</p>
                </div>
              )}
            </div>
          ) : (
            /* Tab Link */
            <div className="p-4 space-y-4">
              {hasShareLink ? (
                <>
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <RiLinkM className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Link ativo</span>
                      {hasPassword && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded text-[10px]">
                          <RiLockLine className="w-3 h-3" /> Com senha
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-green-200 dark:border-green-500/30 rounded-lg"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-1.5"
                      >
                        {copied ? <RiCheckLine className="w-3.5 h-3.5" /> : <RiFileCopyLine className="w-3.5 h-3.5" />}
                        {copied ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleRevokeLink}
                    className="w-full py-2.5 text-sm font-medium text-red-600 border border-red-200 dark:border-red-500/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Revogar Link
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center py-4">
                    <RiLinkM className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Gere um link para compartilhar com qualquer pessoa</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        <RiLockLine className="w-3 h-3 inline mr-1" />
                        Senha (opcional)
                      </label>
                      <input
                        type="text"
                        value={linkPassword}
                        onChange={(e) => setLinkPassword(e.target.value)}
                        placeholder="Sem senha"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        <RiTimeLine className="w-3 h-3 inline mr-1" />
                        Expiração (opcional)
                      </label>
                      <select
                        value={linkExpiry}
                        onChange={(e) => setLinkExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800"
                      >
                        <option value="">Sem expiração</option>
                        <option value="1">1 dia</option>
                        <option value="7">7 dias</option>
                        <option value="30">30 dias</option>
                        <option value="90">90 dias</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateLink}
                    disabled={generatingLink}
                    className="w-full py-2.5 bg-[#0B2545] text-white rounded-xl text-sm font-medium hover:bg-[#163A6B] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generatingLink ? (
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                      <RiLinkM className="w-4 h-4" />
                    )}
                    Gerar Link de Compartilhamento
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
