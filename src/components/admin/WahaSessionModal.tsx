"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiCloseLine,
  RiWhatsappLine,
  RiTimeLine,
  RiRefreshLine,
  RiLoader4Line,
  RiWifiLine,
  RiWifiOffLine,
  RiQrCodeLine,
  RiDeleteBinLine,
  RiSmartphoneLine,
  RiAddLine,
} from "react-icons/ri";
import type { WAHASession } from "@/lib/waha";

export type { WAHASession };

/**
 * Modal de gestão de sessões WhatsApp (WAHA): listar, criar, conectar (QR)
 * e excluir sessões. Compartilhado entre /admin/imob-ia/chat e o ícone do
 * Topbar — mesmo componente, mesmo comportamento, sem duplicação.
 */
export function WahaSessionModal({
  isOpen,
  onClose,
  sessions,
  onSessionConnected,
  onRefreshSessions,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  sessions: WAHASession[];
  onSessionConnected: (sessionId: string) => void;
  onRefreshSessions: () => Promise<void>;
  isLoading: boolean;
}) {
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrSessionId, setQrSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [qrTimer, setQrTimer] = useState(0);

  // Timer do QR Code (expira em ~60s)
  useEffect(() => {
    if (!qrCode) { setQrTimer(0); return; }
    setQrTimer(60);
    const interval = setInterval(() => {
      setQrTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrCode]);

  // Auto-refresh QR quando timer chega a 0
  useEffect(() => {
    if (qrTimer === 0 && qrCode && qrSessionId) {
      handleGetQRCode(qrSessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrTimer]);

  // Verificar status da sessão quando QR Code está aberto
  useEffect(() => {
    if (!qrCode || !qrSessionId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/admin/waha/sessions/${qrSessionId}`);
        if (res.ok) {
          const session = await res.json();
          if (session.status === "WORKING") {
            setQrCode(null);
            setQrSessionId(null);
            setError(null);
            onSessionConnected(qrSessionId);
          } else if (session.status === "FAILED") {
            setError(`Sessão "${qrSessionId}" falhou. Tente excluir e criar uma nova.`);
            setQrCode(null);
            setQrSessionId(null);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [qrCode, qrSessionId, onSessionConnected]);

  const handleDeleteSession = async (e: React.MouseEvent, sessionName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Excluir sessão "${sessionName}"?\n\nIsso removerá permanentemente esta sessão.`)) return;
    setDeletingSession(sessionName);
    setError(null);
    try {
      const res = await fetch(`/api/admin/waha/sessions/${sessionName}`, { method: "DELETE" });
      if (res.ok) {
        await onRefreshSessions();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Erro ao excluir sessão "${sessionName}"`);
      }
    } catch {
      setError(`Erro ao excluir sessão "${sessionName}"`);
    } finally {
      setDeletingSession(null);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    setCreatingSession(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/waha/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSessionName.trim() }),
      });

      if (res.ok) {
        const session = await res.json();
        await onRefreshSessions();
        setTimeout(async () => {
          try {
            const qrRes = await fetch(`/api/admin/waha/sessions/${session.name}/qr`);
            if (qrRes.ok) {
              const data = await qrRes.json();
              if (data.qr_code) {
                setQrCode(data.qr_code);
                setQrSessionId(session.name);
              } else {
                setError("QR Code não disponível ainda. Clique na sessão para tentar novamente.");
              }
            } else {
              setError("Erro ao obter QR Code. Clique na sessão para tentar novamente.");
            }
          } catch {
            setError("Erro ao buscar QR Code.");
          }
        }, 2000);

        setShowNewSession(false);
        setNewSessionName("");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao criar sessão.");
      }
    } catch {
      setError("Erro ao criar sessão. Verifique se o WAHA está online.");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleGetQRCode = async (sessionId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/waha/sessions/${sessionId}/qr`);
      if (res.ok) {
        const data = await res.json();
        if (data.qr_code) {
          setQrCode(data.qr_code);
          setQrSessionId(sessionId);
        } else {
          setError("QR Code não disponível. A sessão pode estar expirada — tente excluir e criar uma nova.");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao obter QR Code. Tente excluir a sessão e criar uma nova.");
      }
    } catch {
      setError("Erro ao buscar QR Code. Verifique se o WAHA está online.");
    }
  };

  const handleSelectSession = (session: WAHASession) => {
    setError(null);
    if (session.status === "WORKING") {
      onSessionConnected(session.name);
    } else if (session.status === "SCAN_QR_CODE" || session.status === "STOPPED") {
      handleGetQRCode(session.name);
    } else if (session.status === "FAILED") {
      setError(`Sessão "${session.name}" falhou. Exclua e crie uma nova.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - clicável para fechar */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-emerald-500 p-6">
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <RiWhatsappLine className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Conectar WhatsApp</h2>
              <p className="text-white/80 text-sm">Selecione ou crie uma sessão</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
              <RiCloseLine className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer hover:text-red-800" onClick={() => setError(null)} />
              <span>{error}</span>
            </div>
          )}

          {qrCode ? (
            // QR Code Display
            <div className="text-center">
              <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-3 relative">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <RiTimeLine className="w-4 h-4 text-neutral-400" />
                <span className={`text-sm font-medium ${qrTimer <= 10 ? "text-red-500" : "text-neutral-500"}`}>
                  {qrTimer > 0 ? `Expira em ${qrTimer}s` : "Atualizando QR..."}
                </span>
                <div className="w-24 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${qrTimer <= 10 ? "bg-red-500" : "bg-orange-500"}`}
                    style={{ width: `${(qrTimer / 60) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 text-left max-w-xs mx-auto">
                {[
                  "Abra o WhatsApp no celular",
                  "Toque em Mais opções ou Configurações",
                  "Selecione Aparelhos conectados",
                  "Toque em Conectar um aparelho"
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-600">
                      {i + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleGetQRCode(qrSessionId!)}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RiRefreshLine className="w-4 h-4" />
                  Atualizar QR
                </button>
                <button
                  onClick={() => { setQrCode(null); setQrSessionId(null); }}
                  className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          ) : isLoading ? (
            // Loading
            <div className="text-center py-12">
              <RiLoader4Line className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-neutral-500">Verificando conexões...</p>
            </div>
          ) : (
            // Sessions List
            <div className="space-y-4">
              {sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.name}
                      onClick={() => handleSelectSession(session)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        session.status === "WORKING"
                          ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                          : session.status === "FAILED"
                          ? "border-red-300 bg-red-50 dark:bg-red-500/10"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            session.status === "WORKING"
                              ? "bg-green-500 text-white"
                              : session.status === "FAILED"
                              ? "bg-red-500 text-white"
                              : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                          }`}>
                            {session.status === "WORKING" ? (
                              <RiWifiLine className="w-5 h-5" />
                            ) : (
                              <RiWifiOffLine className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{session.name}</p>
                            <p className="text-sm text-neutral-500">
                              {session.status === "WORKING" ? "Conectado" :
                               session.status === "SCAN_QR_CODE" ? "Aguardando QR Code" :
                               session.status === "STARTING" ? "Iniciando..." :
                               session.status === "FAILED" ? "Falhou" : "Desconectado"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === "WORKING" ? (
                            <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                              Usar
                            </span>
                          ) : (
                            <RiQrCodeLine className="w-5 h-5 text-neutral-400" />
                          )}
                          {/* Botão Excluir */}
                          <button
                            onClick={(e) => handleDeleteSession(e, session.name)}
                            disabled={deletingSession === session.name}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
                            title="Excluir sessão"
                          >
                            {deletingSession === session.name ? (
                              <RiLoader4Line className="w-4 h-4 animate-spin" />
                            ) : (
                              <RiDeleteBinLine className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <RiSmartphoneLine className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-500 mb-2">Nenhuma sessão encontrada</p>
                  <p className="text-sm text-neutral-400">Crie uma nova sessão para conectar</p>
                </div>
              )}

              {/* New Session Form */}
              {showNewSession ? (
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Nome da sessão (ex: Imobiliária)"
                      className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                      autoFocus
                    />
                    <button
                      onClick={handleCreateSession}
                      disabled={creatingSession || !newSessionName.trim()}
                      className="px-4 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {creatingSession ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : "Criar"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewSession(true)}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                >
                  <RiAddLine className="w-5 h-5" />
                  Nova Sessão
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
