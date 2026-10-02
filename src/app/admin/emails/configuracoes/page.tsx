"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RiMailSettingsLine,
  RiServerLine,
  RiShieldCheckLine,
  RiShieldLine,
  RiGlobalLine,
  RiMailLine,
  RiLockPasswordLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiInformationLine,
  RiSaveLine,
  RiTestTubeLine,
  RiRefreshLine,
  RiAlertLine,
  RiEyeLine,
  RiEyeOffLine,
  RiMailSendLine,
  RiHardDriveLine,
  RiUserLine,
  RiSpamLine,
  RiLoader4Line,
} from "react-icons/ri";

// ============================================================
// TYPES
// ============================================================
interface ConnectionStatus {
  connected: boolean;
  latency?: number;
  domains?: number;
  mailboxes?: number;
  apiUrl?: string;
  error?: string;
}

interface DomainInfo {
  domain: string;
  description: string;
  active: boolean;
  mailboxes: number;
  aliases: number;
  quota: number;
  maxquota: number;
  defquota: number;
  totalMails: number;
  totalSize: number;
  dkim: boolean;
  created: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: "tls" | "ssl" | "none";
  fromName: string;
  fromEmail: string;
  testTo: string;
}

// ============================================================
// COMPONENTS
// ============================================================

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  badge,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  badge?: { label: string; color: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex items-center gap-3 p-5 border-b border-neutral-100 dark:border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-[#0B2545]/10 dark:bg-[#0B2545]/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#0B2545] dark:text-blue-300" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
            {badge && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function Toggle({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!enabled)}
        className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 mt-0.5 ${
          enabled ? "bg-[#0B2545]" : "bg-neutral-300 dark:bg-neutral-600"
        }`}
      >
        <div
          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-[22px]" : "translate-x-[3px]"
          }`}
        />
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
  suffix,
  disabled,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
        {label}
      </label>
      <div className="relative flex">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30 disabled:opacity-50 disabled:cursor-not-allowed ${suffix ? "rounded-r-none border-r-0" : ""}`}
        />
        {suffix && (
          <span className="px-3 py-2.5 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-500 border border-l-0 border-neutral-200 dark:border-neutral-700 rounded-r-xl flex-shrink-0">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function DnsStatus({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <RiCheckboxCircleLine className="w-4 h-4 text-emerald-500" />
      ) : (
        <RiCloseCircleLine className="w-4 h-4 text-red-500" />
      )}
      <span className={`text-xs font-medium ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
        {label}
      </span>
      <span className={`text-[10px] ${ok ? "text-emerald-500" : "text-red-400"}`}>
        {ok ? "Configurado" : "Pendente"}
      </span>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function EmailConfigPage() {
  // Connection
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Domains
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);

  // SMTP
  const [smtp, setSmtp] = useState<SmtpConfig>({
    host: "mail.tappyimob.com.br",
    port: 587,
    username: "",
    password: "",
    encryption: "tls",
    fromName: "Tappy Imob",
    fromEmail: "noreply@tappyimob.com.br",
    testTo: "",
  });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"servidor" | "dominio" | "smtp">("servidor");

  // Fetch connection status on mount
  const testConnection = useCallback(async () => {
    try {
      setTestingConnection(true);
      const res = await fetch("/api/admin/email/test-connection");
      const data = await res.json();
      setConnection(data);
    } catch (err: any) {
      setConnection({ connected: false, error: err.message });
    } finally {
      setTestingConnection(false);
    }
  }, []);

  const fetchDomains = useCallback(async () => {
    try {
      setLoadingDomains(true);
      const res = await fetch("/api/admin/email/domains");
      if (!res.ok) throw new Error("Erro ao carregar domínios");
      const data = await res.json();
      setDomains(data.domains || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDomains(false);
    }
  }, []);

  useEffect(() => {
    testConnection();
    fetchDomains();
  }, [testConnection, fetchDomains]);

  const handleSendTest = async () => {
    if (!smtp.host || !smtp.username || !smtp.password || !smtp.testTo) {
      setTestResult({ ok: false, message: "Preencha todos os campos SMTP e o email de destino" });
      return;
    }
    try {
      setSendingTest(true);
      setTestResult(null);
      const res = await fetch("/api/admin/email/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: smtp.testTo,
          host: smtp.host,
          port: smtp.port,
          username: smtp.username,
          password: smtp.password,
          encryption: smtp.encryption,
          fromName: smtp.fromName,
          fromEmail: smtp.fromEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ ok: true, message: data.message || "Email enviado!" });
      } else {
        setTestResult({ ok: false, message: data.error || "Falha no envio" });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes <= 0) return "0 B";
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const tabs = [
    { id: "servidor" as const, label: "Servidor", icon: RiServerLine },
    { id: "dominio" as const, label: "Domínios", icon: RiGlobalLine },
    { id: "smtp" as const, label: "SMTP", icon: RiMailSendLine },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiMailSettingsLine className="w-7 h-7 text-[#0B2545]" />
            Configurações de Email
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Status da conexão Mailcow, domínios e SMTP
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-1.5">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#0B2545] text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* ===================== SERVIDOR ===================== */}
        {activeTab === "servidor" && (
          <>
            <SectionCard
              title="Conexão com Mailcow"
              description="Status da integração com o servidor de email"
              icon={RiServerLine}
              badge={
                connection?.connected
                  ? { label: "Conectado", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" }
                  : connection === null
                  ? undefined
                  : { label: "Desconectado", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" }
              }
            >
              <div className="space-y-4">
                {/* Connection Result */}
                {connection && (
                  <div className={`p-4 rounded-xl border ${
                    connection.connected
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                      : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {connection.connected ? (
                        <RiCheckboxCircleLine className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <RiCloseCircleLine className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        connection.connected ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"
                      }`}>
                        {connection.connected ? "Servidor conectado" : "Falha na conexão"}
                      </span>
                    </div>

                    {connection.connected ? (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                        <div>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">API URL</p>
                          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 truncate">{connection.apiUrl}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Latência</p>
                          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">{connection.latency}ms</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Domínios</p>
                          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">{connection.domains}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Mailboxes</p>
                          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">{connection.mailboxes}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{connection.error}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={testConnection}
                    disabled={testingConnection}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0B2545] bg-[#0B2545]/10 hover:bg-[#0B2545]/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {testingConnection ? (
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                      <RiTestTubeLine className="w-4 h-4" />
                    )}
                    {testingConnection ? "Testando..." : "Testar Conexão"}
                  </button>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20">
                  <RiInformationLine className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      A conexão utiliza as variáveis de ambiente <code className="bg-blue-100 dark:bg-blue-500/20 px-1 py-0.5 rounded text-[10px]">MAILCOW_API_URL</code> e{" "}
                      <code className="bg-blue-100 dark:bg-blue-500/20 px-1 py-0.5 rounded text-[10px]">MAILCOW_API_KEY</code> configuradas no servidor.
                      Para alterar, edite o arquivo <code className="bg-blue-100 dark:bg-blue-500/20 px-1 py-0.5 rounded text-[10px]">.env</code> e reinicie o container.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {/* ===================== DOMÍNIOS ===================== */}
        {activeTab === "dominio" && (
          <>
            <SectionCard
              title="Domínios do Mailcow"
              description="Domínios configurados e status de DKIM"
              icon={RiGlobalLine}
            >
              <div className="space-y-4">
                {loadingDomains && domains.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <RiLoader4Line className="w-6 h-6 animate-spin text-[#0B2545]" />
                    <span className="ml-2 text-sm text-neutral-500">Carregando domínios...</span>
                  </div>
                )}

                {domains.map((d) => (
                  <div key={d.domain} className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <RiGlobalLine className="w-5 h-5 text-[#0B2545] dark:text-blue-300" />
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{d.domain}</h4>
                        {d.active ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                            Inativo
                          </span>
                        )}
                      </div>
                      <button
                        onClick={fetchDomains}
                        className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"
                      >
                        <RiRefreshLine className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-neutral-500">Mailboxes</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{d.mailboxes}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500">Aliases</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{d.aliases}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500">Emails</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{(d.totalMails || 0).toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500">Uso em Disco</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{formatSize(d.totalSize || 0)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <DnsStatus ok={d.dkim} label="DKIM" />
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-neutral-500">Quota padrão: {d.defquota} MB | Máx: {d.maxquota} MB</p>
                      </div>
                    </div>

                    {d.description && (
                      <p className="text-xs text-neutral-500 mt-2">{d.description}</p>
                    )}
                  </div>
                ))}

                {!loadingDomains && domains.length === 0 && (
                  <div className="text-center py-8">
                    <RiGlobalLine className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="text-sm text-neutral-500">Nenhum domínio encontrado no Mailcow</p>
                    <p className="text-xs text-neutral-400 mt-1">Verifique a conexão com o servidor</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        )}

        {/* ===================== SMTP ===================== */}
        {activeTab === "smtp" && (
          <>
            <SectionCard
              title="Configuração SMTP"
              description="Configure e teste o envio de emails"
              icon={RiMailSendLine}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <InputField
                    label="Servidor SMTP"
                    value={smtp.host}
                    onChange={(v) => setSmtp({ ...smtp, host: v })}
                    placeholder="mail.tappyimob.com.br"
                    icon={RiServerLine}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Porta"
                      value={smtp.port}
                      onChange={(v) => setSmtp({ ...smtp, port: parseInt(v) || 587 })}
                      type="number"
                      placeholder="587"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Criptografia
                      </label>
                      <select
                        value={smtp.encryption}
                        onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value as SmtpConfig["encryption"] })}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
                      >
                        <option value="tls">TLS (Recomendado)</option>
                        <option value="ssl">SSL</option>
                        <option value="none">Nenhuma</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <InputField
                    label="Usuário SMTP"
                    value={smtp.username}
                    onChange={(v) => setSmtp({ ...smtp, username: v })}
                    placeholder="noreply@tappyimob.com.br"
                    icon={RiUserLine}
                  />
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Senha SMTP
                    </label>
                    <div className="relative">
                      <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type={showSmtpPass ? "text" : "password"}
                        value={smtp.password}
                        onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                        placeholder="Senha do servidor SMTP"
                        className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
                      />
                      <button
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showSmtpPass ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Remetente Padrão</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <InputField
                      label="Nome de Exibição"
                      value={smtp.fromName}
                      onChange={(v) => setSmtp({ ...smtp, fromName: v })}
                      placeholder="Tappy Imob"
                    />
                    <InputField
                      label="Email Remetente"
                      value={smtp.fromEmail}
                      onChange={(v) => setSmtp({ ...smtp, fromEmail: v })}
                      placeholder="noreply@tappyimob.com.br"
                      icon={RiMailLine}
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Enviar Email de Teste</p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    <div className="flex-1">
                      <InputField
                        label="Email de Destino"
                        value={smtp.testTo}
                        onChange={(v) => setSmtp({ ...smtp, testTo: v })}
                        placeholder="seuemail@gmail.com"
                        icon={RiMailLine}
                      />
                    </div>
                    <button
                      onClick={handleSendTest}
                      disabled={sendingTest}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#0B2545] bg-[#0B2545]/10 hover:bg-[#0B2545]/20 rounded-xl transition-colors disabled:opacity-50 h-[42px]"
                    >
                      {sendingTest ? (
                        <RiLoader4Line className="w-4 h-4 animate-spin" />
                      ) : (
                        <RiTestTubeLine className="w-4 h-4" />
                      )}
                      {sendingTest ? "Enviando..." : "Enviar Teste"}
                    </button>
                  </div>

                  {testResult && (
                    <div className={`mt-3 p-3 rounded-xl border ${
                      testResult.ok
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                        : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                    }`}>
                      <div className="flex items-center gap-2">
                        {testResult.ok ? (
                          <RiCheckboxCircleLine className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <RiCloseCircleLine className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${
                          testResult.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                        }`}>
                          {testResult.message}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}
