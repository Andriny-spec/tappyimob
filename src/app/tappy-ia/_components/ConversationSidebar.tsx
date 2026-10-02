"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiChat3Line,
  RiDeleteBinLine,
  RiEdit2Line,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiSearchLine,
  RiAlertLine,
} from "react-icons/ri";

export interface ConversationListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

interface Props {
  currentId: string | null;
  onSelect: (id: string | null) => void;
  /** Incrementa para forçar refetch externo */
  refreshKey?: number;
  open: boolean;
  onClose?: () => void;
}

// ===== Helpers =====
const DAY = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min atrás`;
  if (diff < DAY) return `${Math.floor(diff / 3_600_000)}h atrás`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

type Bucket = "Hoje" | "Ontem" | "Últimos 7 dias" | "Anteriores";

function bucketOf(iso: string): Bucket {
  const today = startOfDay(new Date()).getTime();
  const ts = startOfDay(new Date(iso)).getTime();
  const diff = today - ts;
  if (diff <= 0) return "Hoje";
  if (diff === DAY) return "Ontem";
  if (diff < 7 * DAY) return "Últimos 7 dias";
  return "Anteriores";
}

const BUCKET_ORDER: Bucket[] = ["Hoje", "Ontem", "Últimos 7 dias", "Anteriores"];

// ====================================================================

export function ConversationSidebar({ currentId, onSelect, refreshKey = 0, open, onClose }: Props) {
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ConversationListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/tappy-ia/conversations", { cache: "no-store" });
      const data = await res.json();
      setItems(data.conversations || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  // Filtragem + agrupamento
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? items.filter((c) => c.title.toLowerCase().includes(q)) : items;
    const groups: Record<Bucket, ConversationListItem[]> = {
      "Hoje": [],
      "Ontem": [],
      "Últimos 7 dias": [],
      "Anteriores": [],
    };
    for (const c of filtered) {
      groups[bucketOf(c.updatedAt)].push(c);
    }
    return groups;
  }, [items, search]);

  const totalFiltered = useMemo(
    () => Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0),
    [grouped]
  );

  function handleNew() {
    onSelect(null);
    setSearch("");
    onClose?.();
  }

  async function performDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tappy-ia/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((c) => c.id !== id));
        if (currentId === id) onSelect(null);
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  async function handleRename(id: string) {
    const title = editingTitle.trim();
    if (!title) {
      setEditingId(null);
      return;
    }
    const res = await fetch(`/api/tappy-ia/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    }
    setEditingId(null);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 z-40 h-full w-72 flex flex-col border-r border-white/10 bg-gradient-to-b from-[#070f1c]/95 via-[#0b1426]/95 to-[#070f1c]/95 backdrop-blur-xl shadow-2xl shadow-black/50"
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-[#25D366]/10 border border-orange-500/30 flex items-center justify-center">
                    <RiChat3Line className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                    Conversas
                  </span>
                  {items.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 font-mono">
                      {items.length}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  aria-label="Fechar"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>

              {/* Nova conversa */}
              <div className="p-3">
                <button
                  onClick={handleNew}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-[#25D366] text-white text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RiAddLine className="w-4 h-4" />
                  Nova conversa
                </button>
              </div>

              {/* Busca */}
              {items.length > 3 && (
                <div className="px-3 pb-2">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar…"
                      className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/40 focus:bg-white/[0.06] transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md hover:bg-white/10 flex items-center justify-center text-white/40"
                        aria-label="Limpar"
                      >
                        <RiCloseLine className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Lista */}
              <div className="flex-1 overflow-y-auto px-2 pb-3 conversations-scroll">
                {loading ? (
                  <div className="flex items-center justify-center py-10 text-white/30 text-xs gap-2">
                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                    Carregando…
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <RiChat3Line className="w-5 h-5 text-white/30" />
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">
                      Nenhuma conversa ainda.<br />
                      Comece uma nova acima.
                    </p>
                  </div>
                ) : totalFiltered === 0 ? (
                  <div className="text-center py-10 text-white/30 text-xs">
                    Nada encontrado para &ldquo;{search}&rdquo;.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {BUCKET_ORDER.map((bucket) => {
                      const list = grouped[bucket];
                      if (!list.length) return null;
                      return (
                        <div key={bucket}>
                          <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                            {bucket}
                          </div>
                          <ul className="space-y-0.5">
                            {list.map((c, idx) => {
                              const active = c.id === currentId;
                              const isEditing = editingId === c.id;
                              return (
                                <motion.li
                                  key={c.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.18, delay: idx * 0.015 }}
                                >
                                  <div
                                    className={`group relative flex items-center gap-1 px-2 py-2 rounded-lg transition-all cursor-pointer ${
                                      active
                                        ? "bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-white border border-orange-500/30"
                                        : "border border-transparent hover:bg-white/[0.04] text-white/70 hover:text-white"
                                    }`}
                                    onClick={() => {
                                      if (isEditing) return;
                                      onSelect(c.id);
                                      onClose?.();
                                    }}
                                  >
                                    {active && (
                                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-gradient-to-b from-orange-400 to-[#25D366]" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      {isEditing ? (
                                        <div
                                          className="flex items-center gap-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <input
                                            autoFocus
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") handleRename(c.id);
                                              if (e.key === "Escape") setEditingId(null);
                                            }}
                                            className="flex-1 min-w-0 px-2 py-1 rounded bg-white/10 text-sm text-white outline-none border border-orange-500/40"
                                          />
                                          <button
                                            onClick={() => handleRename(c.id)}
                                            className="w-6 h-6 rounded bg-orange-500/20 text-orange-300 flex items-center justify-center hover:bg-orange-500/30"
                                            aria-label="Salvar"
                                          >
                                            <RiCheckLine className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setEditingId(null)}
                                            className="w-6 h-6 rounded bg-white/5 text-white/50 flex items-center justify-center hover:bg-white/10"
                                            aria-label="Cancelar"
                                          >
                                            <RiCloseLine className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="truncate text-sm leading-tight">
                                            {c.title}
                                          </div>
                                          <div className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1.5">
                                            <span>{timeAgo(c.updatedAt)}</span>
                                            {c._count?.messages ? (
                                              <>
                                                <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                                                <span>{c._count.messages} msg{c._count.messages > 1 ? "s" : ""}</span>
                                              </>
                                            ) : null}
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    {!isEditing && (
                                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingId(c.id);
                                            setEditingTitle(c.title);
                                          }}
                                          className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
                                          aria-label="Renomear"
                                          title="Renomear"
                                        >
                                          <RiEdit2Line className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDelete(c);
                                          }}
                                          className="w-7 h-7 rounded-md hover:bg-red-500/20 flex items-center justify-center text-white/50 hover:text-red-300"
                                          aria-label="Apagar"
                                          title="Apagar"
                                        >
                                          <RiDeleteBinLine className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30">
                <span>Tappy IA</span>
                <span className="font-mono">v1.0</span>
              </div>

              <style jsx>{`
                .conversations-scroll::-webkit-scrollbar {
                  width: 6px;
                }
                .conversations-scroll::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.08);
                  border-radius: 3px;
                }
                .conversations-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(255, 255, 255, 0.15);
                }
              `}</style>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modal custom de confirmação */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !deleting && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[#0b1426] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                    <RiAlertLine className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Apagar conversa?</div>
                    <div className="text-xs text-white/50">Esta ação não pode ser desfeita.</div>
                  </div>
                </div>
                <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/70 mb-4 truncate">
                  &ldquo;{confirmDelete.title}&rdquo;
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => performDelete(confirmDelete.id)}
                    disabled={deleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {deleting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDeleteBinLine className="w-4 h-4" />}
                    Apagar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
