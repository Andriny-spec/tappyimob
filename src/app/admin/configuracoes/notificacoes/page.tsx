"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiNotification3Line,
  RiSave3Line,
  RiCheckLine,
  RiMailLine,
  RiWhatsappLine,
  RiComputerLine,
  RiAddLine,
  RiDeleteBinLine,
  RiPhoneLine,
  RiLoader4Line,
  RiCloseLine,
  RiInformationLine,
  RiUserLine,
  RiRefreshLine,
  RiEyeLine,
  RiSmartphoneLine,
} from "react-icons/ri";

const CONFIG_KEY = "lead_notifications";

interface NotifConfig {
  extraPhones: string[];
  channels: { whatsapp: boolean; email: boolean; panel: boolean };
  wahaSession: string;
}

const DEFAULT_CONFIG: NotifConfig = {
  extraPhones: [],
  channels: { whatsapp: true, email: true, panel: true },
  wahaSession: "",
};

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.startsWith("55") ? d : `55${d}`;
}

function isValidPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 13;
}

interface WAHASession {
  name: string;
  status: string;
  me?: { id: string; pushName: string };
}

export default function NotificacoesConfigPage() {
  const [config, setConfig] = useState<NotifConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [adminUsers, setAdminUsers] = useState<{ name: string; phone: string | null }[]>([]);
  const [sessions, setSessions] = useState<WAHASession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const saveConfig = useCallback(async (cfg: NotifConfig) => {
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: CONFIG_KEY, value: cfg }),
    });
  }, []);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/admin/waha/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : (data.sessions || []));
      }
    } catch {}
    setSessionsLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const [cfgRes, usersRes] = await Promise.all([
        fetch("/api/admin/config?key=" + CONFIG_KEY),
        fetch("/api/admin/users?role=ADMIN&limit=50"),
      ]);
      if (cfgRes.ok) {
        const { value } = await cfgRes.json();
        if (value) setConfig({ ...DEFAULT_CONFIG, ...value });
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setAdminUsers((data.users || []).map((u: any) => ({ name: u.name, phone: u.phone })));
      }
      setLoading(false);
    };
    load();
    loadSessions();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await saveConfig(config);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addPhone = async () => {
    setPhoneError("");
    if (!newPhone.trim()) return;
    if (!isValidPhone(newPhone)) {
      setPhoneError("Número inválido. Use DDD + número, ex: 11999999999");
      return;
    }
    const formatted = formatPhone(newPhone);
    if (config.extraPhones.includes(formatted)) {
      setPhoneError("Número já adicionado");
      return;
    }
    const newConfig = { ...config, extraPhones: [...config.extraPhones, formatted] };
    setConfig(newConfig);
    setNewPhone("");
    await saveConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const removePhone = async (phone: string) => {
    const newConfig = { ...config, extraPhones: config.extraPhones.filter((p) => p !== phone) };
    setConfig(newConfig);
    await saveConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleChannel = async (ch: keyof NotifConfig["channels"]) => {
    const newConfig = { ...config, channels: { ...config.channels, [ch]: !config.channels[ch] } };
    setConfig(newConfig);
    await saveConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setSession = async (session: string) => {
    const newConfig = { ...config, wahaSession: session };
    setConfig(newConfig);
    await saveConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-7 h-7 animate-spin text-amber-500" />
      </div>
    );
  }

  const previewMessage = `🔔 *Novo Lead do Site*\n\n👤 *Nome:* João da Silva\n📱 *Telefone:* (11) 99999-9999\n📧 *Email:* joao@exemplo.com\n💬 *Mensagem:*\nTenho interesse em imóveis em Sua Cidade\n\n📲 Acesse o sistema para gerenciar este lead.`;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/configuracoes" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <RiNotification3Line className="w-5 h-5 text-amber-500" />
              </div>
              Notificações de Leads
            </h1>
            <p className="text-neutral-500 mt-1 text-sm">Configure quem e como recebe os alertas de novos leads</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <RiCheckLine className="w-4 h-4" /> Salvo
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-10 px-5 rounded-xl font-medium transition-all text-sm bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSave3Line className="w-4 h-4" />}
            Salvar tudo
          </button>
        </div>
      </div>

      {/* Sessão WAHA */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <RiSmartphoneLine className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">WhatsApp que dispara os alertas</h3>
          </div>
          <button onClick={loadSessions} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="Atualizar sessões">
            <RiRefreshLine className={`w-4 h-4 ${sessionsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">Selecione qual número (sessão WAHA conectada) envia a notificação de novo lead.</p>

        {sessions.length === 0 && !sessionsLoading && (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg">
            Nenhuma sessão encontrada. Conecte um WhatsApp em <Link href="/admin/imob-ia/chat" className="underline">WhatsApp / IA</Link>.
          </p>
        )}

        {sessions.length > 0 && (
          <div className="space-y-2">
            {sessions.map((s) => {
              const isSelected = config.wahaSession === s.name || (!config.wahaSession && s.name === (process.env.NEXT_PUBLIC_WAHA_DEFAULT_SESSION || "Jake"));
              const isConnected = s.status === "WORKING" || s.status === "CONNECTED";
              return (
                <button
                  key={s.name}
                  onClick={() => setSession(s.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-emerald-300"
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isConnected ? "bg-emerald-500" : "bg-neutral-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{s.name}</p>
                    {s.me?.pushName && (
                      <p className="text-xs text-neutral-500">{s.me.pushName} · {s.me.id?.replace(/@.*/, "")}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isConnected ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-neutral-100 text-neutral-500"}`}>
                    {isConnected ? "Conectado" : s.status}
                  </span>
                  {isSelected && <RiCheckLine className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 text-xs text-neutral-400">
          <RiInformationLine className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>O número selecionado aqui envia os alertas. Ele <strong>não</strong> recebe — o WhatsApp não notifica a si mesmo. Cadastre um número extra abaixo para que ele também receba.</span>
        </div>
      </div>

      {/* Canais ativos */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Canais de notificação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { key: "whatsapp", label: "WhatsApp", desc: "Mensagem ao receber lead", Icon: RiWhatsappLine, color: "emerald" },
            { key: "email", label: "E-mail", desc: "E-mail para todos os admins", Icon: RiMailLine, color: "blue" },
            { key: "panel", label: "Painel", desc: "Sino no menu do sistema", Icon: RiComputerLine, color: "purple" },
          ] as const).map(({ key, label, desc, Icon, color }) => {
            const on = config.channels[key];
            const colorMap: Record<string, string> = {
              emerald: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10",
              blue: "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10",
              purple: "border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10",
            };
            const iconMap: Record<string, string> = { emerald: "text-emerald-500", blue: "text-blue-500", purple: "text-purple-500" };
            const toggleColor: Record<string, string> = { emerald: "bg-emerald-500", blue: "bg-blue-500", purple: "bg-purple-500" };
            return (
              <button
                key={key}
                onClick={() => toggleChannel(key)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer text-left transition-all ${
                  on ? colorMap[color] : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${on ? iconMap[color] : "text-neutral-400"}`} />
                  <div>
                    <p className={`text-sm font-medium ${on ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`}>{label}</p>
                    <p className="text-[11px] text-neutral-500">{desc}</p>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${on ? toggleColor[color] : "bg-neutral-300 dark:bg-neutral-600"}`}>
                  <div className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telefones extras */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center gap-2 mb-1">
          <RiWhatsappLine className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Quem recebe no WhatsApp</h3>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          Admins com telefone no perfil recebem automaticamente. Adicione números extras se quiser notificar pessoas fora do sistema.
        </p>

        {/* Admins automáticos */}
        {adminUsers.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-medium text-neutral-500 uppercase mb-2 flex items-center gap-1">
              <RiUserLine className="w-3.5 h-3.5" /> Admins (recebem automaticamente)
            </p>
            <div className="space-y-1">
              {adminUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{u.name}</span>
                  {u.phone ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs">{u.phone}</span>
                  ) : (
                    <span className="text-red-400 text-xs">sem telefone — não vai receber</span>
                  )}
                </div>
              ))}
            </div>
            <Link href="/admin/configuracoes/usuarios" className="inline-block mt-2 text-xs text-blue-500 hover:underline">
              Editar perfis dos admins →
            </Link>
          </div>
        )}

        {/* Números extras */}
        {config.extraPhones.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {config.extraPhones.map((phone) => (
              <div key={phone} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
                <RiPhoneLine className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-mono text-sm text-emerald-700 dark:text-emerald-300">+{phone}</span>
                <button
                  onClick={() => removePhone(phone)}
                  className="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-neutral-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                  title="Remover número"
                >
                  <RiCloseLine className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {config.extraPhones.length === 0 && (
          <p className="text-sm text-neutral-400 italic mb-3">Nenhum número extra adicionado.</p>
        )}

        {/* Adicionar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="tel"
              placeholder="DDD + número, ex: 11999999999"
              value={newPhone}
              onChange={(e) => { setNewPhone(e.target.value); setPhoneError(""); }}
              onKeyDown={(e) => e.key === "Enter" && addPhone()}
              className={`w-full h-10 px-4 rounded-xl text-sm border bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-emerald-500 outline-none transition ${
                phoneError ? "border-red-400" : "border-neutral-200 dark:border-neutral-700"
              }`}
            />
            {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
          </div>
          <button
            onClick={addPhone}
            className="h-10 px-4 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1"
          >
            <RiAddLine className="w-4 h-4" /> Adicionar
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-neutral-400">
          <RiInformationLine className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Adicionar e remover salva automaticamente. Não precisa clicar em "Salvar tudo".</span>
        </div>
      </div>

      {/* Preview da mensagem */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RiEyeLine className="w-5 h-5 text-neutral-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Preview da mensagem</h3>
          </div>
          <button onClick={() => setShowPreview((v) => !v)} className="text-sm text-amber-500 hover:text-amber-600 font-medium">
            {showPreview ? "Ocultar" : "Ver mensagem"}
          </button>
        </div>

        {showPreview ? (
          <div className="flex justify-end">
            <div className="bg-[#dcf8c6] dark:bg-emerald-700/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-sm shadow-sm">
              <pre className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap font-sans leading-relaxed">{previewMessage}</pre>
              <p className="text-[10px] text-neutral-500 text-right mt-1">agora ✓✓</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Clique em "Ver mensagem" para visualizar o template enviado via WhatsApp quando um novo lead chega.</p>
        )}
      </div>
    </div>
  );
}
