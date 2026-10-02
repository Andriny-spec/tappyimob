"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  useBlastProgress,
  BlastProgressPanel,
  BlastHistoryModal,
  type BlastDetail,
} from "@/components/admin/tappy-summit/BlastPanels";
import {
  RiSearchLine,
  RiDownloadLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiHistoryLine,
  RiWhatsappLine,
  RiMailLine,
  RiUserLine,
  RiBuilding2Line,
  RiCalendarLine,
  RiGroupLine,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiExternalLinkLine,
  RiCursorLine,
  RiBarChartLine,
  RiInstagramLine,
  RiSettings3Line,
  RiListCheck2,
  RiSaveLine,
  RiLoader4Line,
  RiInformationLine,
  RiTimerLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBin2Line,
  RiToggleLine,
  RiToggleFill,
  RiSendPlaneLine,
  RiUploadCloud2Line,
  RiImageLine,
  RiMicLine,
  RiVideoLine,
  RiFileTextLine,
  RiDeleteBin5Line,
  RiSparklingLine,
} from "react-icons/ri";

interface FollowUpLogEntry {
  id: string;
  followUp: { id: string; name: string; sortOrder: number };
  scheduledFor: string;
  whatsappSent: boolean;
  whatsappSentAt: string | null;
  emailSent: boolean;
  emailSentAt: string | null;
  error: string | null;
}

interface Registration {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  companyName: string | null;
  emailSent: boolean;
  whatsappSent: boolean;
  linkAccessed: boolean;
  confirmed: boolean;
  attended: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  followUpLogs?: FollowUpLogEntry[];
}

interface Stats {
  total: number;
  confirmed: number;
  attended: number;
  byType: Record<string, number>;
}

interface Analytics {
  byType: Record<string, number>;
  byPage: Record<string, number>;
  todayViews: number;
}

interface EventConfig {
  id: string;
  whatsappEnabled: boolean;
  whatsappMessage: string;
  whatsappSession: string;
  whatsappDelay: number;
  emailEnabled: boolean;
  emailDelay: number;
}

interface WAHASession {
  name: string;
  status: string;
  me?: { id: string; pushName: string };
}

export default function TappySummitAdminPage() {
  const [activeTab, setActiveTab] = useState<"inscritos" | "followups" | "email" | "whatsapp" | "config">("inscritos");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, confirmed: 0, attended: 0, byType: {} });
  const [analytics, setAnalytics] = useState<Analytics>({ byType: {}, byPage: {}, todayViews: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        type: typeFilter,
        page: page.toString(),
        limit: "30",
      });
      const res = await fetch(`/api/admin/tappy-summit?${params}`);
      const data = await res.json();
      setRegistrations(data.registrations || []);
      setStats(data.stats || { total: 0, confirmed: 0, attended: 0, byType: {} });
      setAnalytics(data.analytics || { byType: {}, byPage: {}, todayViews: 0 });
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar inscrições:", err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleFlag = async (id: string, field: string, currentValue: boolean) => {
    try {
      await fetch(`/api/admin/tappy-summit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: !currentValue } : r))
      );
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    }
  };

  const deleteRegistration = async (id: string, name: string) => {
    if (!confirm(`Excluir inscrição de "${name}"?`)) return;
    try {
      await fetch(`/api/admin/tappy-summit/${id}`, { method: "DELETE" });
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      setStats((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  const [exporting, setExporting] = useState(false);
  const exportCSV = async () => {
    setExporting(true);
    try {
      // Busca TODOS os inscritos respeitando os filtros atuais (sem paginação)
      const params = new URLSearchParams({
        search,
        type: typeFilter,
        page: "1",
        limit: "100000",
      });
      const res = await fetch(`/api/admin/tappy-summit?${params}`);
      const data = await res.json();
      const all: Registration[] = data.registrations || [];

      const headers = ["Nome", "Email", "Telefone", "Tipo", "Imobiliária", "Confirmado", "Presente", "UTM Source", "UTM Medium", "UTM Campaign", "Data Inscrição"];
      const rows = all.map((r) => [
        r.name,
        r.email,
        r.phone,
        r.type === "AUTONOMO" ? "Autônomo" : "Imobiliária",
        r.companyName || "",
        r.confirmed ? "Sim" : "Não",
        r.attended ? "Sim" : "Não",
        r.utmSource || "",
        r.utmMedium || "",
        r.utmCampaign || "",
        new Date(r.createdAt).toLocaleDateString("pt-BR"),
      ]);

      const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n");
      const bom = "\uFEFF";
      const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tappy-summit-inscritos-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Erro ao exportar: " + (err?.message || err));
    } finally {
      setExporting(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    if (phone.length === 10) return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tappy Summit 2026</h1>
          <p className="text-sm text-neutral-500 mt-1">Gerenciamento de inscrições do evento</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/tappysummit"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiExternalLinkLine className="w-4 h-4" /> LP A
          </a>
          <a
            href="/tappysummit-b"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiExternalLinkLine className="w-4 h-4" /> LP B
          </a>
          {activeTab === "inscritos" && (
            <button
              onClick={exportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#0B2545] text-white rounded-xl hover:bg-[#162d4a] disabled:opacity-60 transition-colors"
            >
              {exporting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDownloadLine className="w-4 h-4" />}
              {exporting ? "Exportando..." : "Exportar CSV"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("inscritos")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "inscritos"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          <RiListCheck2 className="w-4 h-4" /> Inscritos
        </button>
        <button
          onClick={() => setActiveTab("followups")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "followups"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          <RiTimerLine className="w-4 h-4" /> Follow-ups
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "email"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          <RiSendPlaneLine className="w-4 h-4" /> Disparar Email
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "whatsapp"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          <RiWhatsappLine className="w-4 h-4" /> Disparar WhatsApp
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "config"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          <RiSettings3Line className="w-4 h-4" /> Configurações
        </button>
      </div>

      {activeTab === "config" ? (
        <ConfigTab />
      ) : activeTab === "whatsapp" ? (
        <WhatsAppBlastTab />
      ) : activeTab === "email" ? (
        <EmailBlastTab />
      ) : activeTab === "followups" ? (
        <FollowUpsTab />
      ) : (
      <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={RiGroupLine} label="Total Inscritos" value={stats.total} color="blue" />
        <StatCard icon={RiUserLine} label="Autônomos" value={stats.byType?.AUTONOMO || 0} color="emerald" />
        <StatCard icon={RiBuilding2Line} label="Imobiliárias" value={stats.byType?.IMOBILIARIA || 0} color="purple" />
        <StatCard icon={RiCheckboxCircleLine} label="Confirmados" value={stats.confirmed} color="orange" />
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard icon={RiEyeLine} label="Acessos Totais" value={(analytics.byType?.pageview || 0)} color="blue" />
        <StatCard icon={RiBarChartLine} label="Acessos Hoje" value={analytics.todayViews} color="emerald" />
        <StatCard icon={RiCursorLine} label="Cliques CTA" value={analytics.byType?.click_cta || 0} color="orange" />
        <StatCard icon={RiWhatsappLine} label="Cliques WhatsApp" value={analytics.byType?.click_whatsapp || 0} color="emerald" />
        <StatCard icon={RiInstagramLine} label="Cliques Instagram" value={analytics.byType?.click_instagram || 0} color="purple" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome, email, telefone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
        >
          <option value="all">Todos os tipos</option>
          <option value="AUTONOMO">Autônomos</option>
          <option value="IMOBILIARIA">Imobiliárias</option>
        </select>
        <button
          onClick={fetchData}
          className="p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RiRefreshLine className={`w-4 h-4 text-neutral-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Contato</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Imobiliária</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <RiMailLine className="w-4 h-4 mx-auto" title="Email enviado" />
                </th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <RiWhatsappLine className="w-4 h-4 mx-auto" title="WhatsApp enviado" />
                </th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <RiCheckboxCircleLine className="w-4 h-4 mx-auto" title="Confirmado" />
                </th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <RiEyeLine className="w-4 h-4 mx-auto" title="Presente" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">
                  <RiTimerLine className="w-4 h-4 inline mr-1" />Cadência
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">UTM</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400">Data</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500 dark:text-neutral-400"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-neutral-400">
                    Carregando...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-neutral-400">
                    Nenhuma inscrição encontrada
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{r.name}</p>
                        {r.companyName && (
                          <p className="text-xs text-neutral-400 mt-0.5">{r.companyName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-neutral-700 dark:text-neutral-300">{r.email}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{formatPhone(r.phone)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        r.type === "AUTONOMO"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400"
                      }`}>
                        {r.type === "AUTONOMO" ? (
                          <><RiUserLine className="w-3 h-3" /> Autônomo</>
                        ) : (
                          <><RiBuilding2Line className="w-3 h-3" /> Imobiliária</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.companyName ? (
                        <span className="text-neutral-700 dark:text-neutral-300 text-sm">{r.companyName}</span>
                      ) : (
                        <span className="text-neutral-300 dark:text-neutral-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-3">
                      <ToggleFlag active={r.emailSent} onClick={() => toggleFlag(r.id, "emailSent", r.emailSent)} />
                    </td>
                    <td className="text-center px-4 py-3">
                      <ToggleFlag active={r.whatsappSent} onClick={() => toggleFlag(r.id, "whatsappSent", r.whatsappSent)} />
                    </td>
                    <td className="text-center px-4 py-3">
                      <ToggleFlag active={r.confirmed} onClick={() => toggleFlag(r.id, "confirmed", r.confirmed)} />
                    </td>
                    <td className="text-center px-4 py-3">
                      <ToggleFlag active={r.attended} onClick={() => toggleFlag(r.id, "attended", r.attended)} />
                    </td>
                    <td className="px-4 py-3">
                      {r.followUpLogs && r.followUpLogs.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {r.followUpLogs.map((log) => {
                            const sent = log.whatsappSent || log.emailSent;
                            const hasError = !!log.error;
                            const pending = !sent && !hasError && new Date(log.scheduledFor) > new Date();
                            const overdue = !sent && !hasError && new Date(log.scheduledFor) <= new Date();
                            return (
                              <div
                                key={log.id}
                                title={`${log.followUp.name}\n${sent ? "Enviado" : hasError ? "Erro: " + log.error : pending ? "Agendado: " + new Date(log.scheduledFor).toLocaleString("pt-BR") : "Aguardando envio"}`}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold cursor-default ${
                                  sent
                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                    : hasError
                                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                                    : overdue
                                    ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                    : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                                }`}
                              >
                                {log.followUp.sortOrder + 1}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.utmSource ? (
                        <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                          {r.utmSource}{r.utmMedium ? ` / ${r.utmMedium}` : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                      <RiCalendarLine className="inline w-3 h-3 mr-1" />
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="text-center px-4 py-3">
                      <button
                        onClick={() => deleteRegistration(r.id, r.name)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-400">
              {total} inscrição{total !== 1 ? "ões" : ""} · Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <RiArrowLeftSLine className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                <RiArrowRightSLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}

function ConfigTab() {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [sessions, setSessions] = useState<WAHASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    loadConfig();
    loadSessions();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/admin/tappy-summit/config");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error("Erro ao carregar config:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/admin/tappy-summit/waha-sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Erro ao carregar sessões:", err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/tappy-summit/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar config:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400">
        <RiLoader4Line className="w-5 h-5 animate-spin mr-2" /> Carregando configurações...
      </div>
    );
  }

  const variables = [
    { var: "{nome}", desc: "Primeiro nome" },
    { var: "{nome_completo}", desc: "Nome completo" },
    { var: "{email}", desc: "E-mail" },
    { var: "{telefone}", desc: "Telefone" },
    { var: "{tipo}", desc: "Autônomo / Imobiliária" },
    { var: "{imobiliaria}", desc: "Nome da imobiliária" },
  ];

  return (
    <div className="space-y-6">
      {/* WhatsApp Config */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <RiWhatsappLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Mensagem WhatsApp</h3>
              <p className="text-xs text-neutral-400">Enviada automaticamente ao inscrito após o cadastro</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.whatsappEnabled}
              onChange={(e) => setConfig({ ...config, whatsappEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="p-6 space-y-5">
          {/* Session selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Sessão WhatsApp (número que envia)
            </label>
            <div className="flex gap-2">
              <select
                value={config.whatsappSession}
                onChange={(e) => setConfig({ ...config, whatsappSession: e.target.value })}
                className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              >
                <option value="default">Selecionar sessão...</option>
                {sessions.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} {s.me?.pushName ? `(${s.me.pushName})` : ""} — {s.status}
                  </option>
                ))}
              </select>
              <button
                onClick={loadSessions}
                disabled={sessionsLoading}
                className="px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Atualizar sessões"
              >
                <RiRefreshLine className={`w-4 h-4 text-neutral-500 ${sessionsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            {sessions.length === 0 && !sessionsLoading && (
              <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                <RiInformationLine className="w-3.5 h-3.5" />
                Nenhuma sessão encontrada. Conecte um WhatsApp no dashboard WAHA primeiro.
              </p>
            )}
          </div>

          {/* Message template */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Mensagem de confirmação
            </label>
            <textarea
              value={config.whatsappMessage}
              onChange={(e) => setConfig({ ...config, whatsappMessage: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 resize-y font-mono"
              placeholder="Digite a mensagem que será enviada..."
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  key={v.var}
                  onClick={() => setConfig({ ...config, whatsappMessage: config.whatsappMessage + v.var })}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title={v.desc}
                >
                  {v.var}
                </button>
              ))}
            </div>
          </div>

          {/* Delay */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Delay entre envios WhatsApp (seg)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={config.whatsappDelay}
                onChange={(e) => setConfig({ ...config, whatsappDelay: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Delay entre envios E-mail (seg)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={config.emailDelay}
                onChange={(e) => setConfig({ ...config, emailDelay: parseInt(e.target.value) || 3 })}
                className="w-full px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Config */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <RiMailLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">E-mail de Confirmação</h3>
              <p className="text-xs text-neutral-400">Enviado automaticamente via SMTP (evento@tappyimob.com.br)</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.emailEnabled}
              onChange={(e) => setConfig({ ...config, emailEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-neutral-500">
            O template do e-mail está definido no código. Para alterar, edite o arquivo da API de registro.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-[#0B2545] text-white rounded-xl hover:bg-[#162d4a] disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <><RiLoader4Line className="w-4 h-4 animate-spin" /> Salvando...</>
          ) : (
            <><RiSaveLine className="w-4 h-4" /> Salvar Configurações</>
          )}
        </button>
        {saved && (
          <span className="text-sm text-emerald-500 flex items-center gap-1">
            <RiCheckLine className="w-4 h-4" /> Salvo com sucesso!
          </span>
        )}
      </div>
    </div>
  );
}

interface FollowUp {
  id: string;
  name: string;
  delayHours: number;
  delayType: string;
  sortOrder: number;
  whatsappEnabled: boolean;
  whatsappMessage: string;
  whatsappMediaUrl: string | null;
  whatsappMediaType: string | null;
  emailEnabled: boolean;
  emailSubject: string;
  emailBody: string;
  active: boolean;
  stats?: {
    total: number;
    whatsappSent: number;
    emailSent: number;
    pending: number;
  };
}

const formatDelay = (hours: number): string => {
  if (hours === 0) return "Imediato";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  if (remainHours === 0) return `${days} dia${days > 1 ? "s" : ""}`;
  return `${days}d ${remainHours}h`;
};

function FollowUpsTab() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FollowUp | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  type FormType = Omit<FollowUp, "id" | "stats">;

  const emptyFollowUp: FormType = {
    name: "",
    delayHours: 0,
    delayType: "after_registration",
    sortOrder: 0,
    whatsappEnabled: true,
    whatsappMessage: "",
    whatsappMediaUrl: null,
    whatsappMediaType: null,
    emailEnabled: true,
    emailSubject: "Tappy Summit 2026",
    emailBody: "",
    active: true,
  };

  const [form, setForm] = useState<FormType>(emptyFollowUp);
  const [delayMode, setDelayMode] = useState<"hours" | "days">("hours");

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    try {
      const res = await fetch("/api/admin/tappy-summit/follow-ups");
      const data = await res.json();
      setFollowUps(data.followUps || []);
    } catch (err) {
      console.error("Erro ao carregar follow-ups:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveFollowUp = async () => {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/admin/tappy-summit/follow-ups/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/admin/tappy-summit/follow-ups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setEditing(null);
      setCreating(false);
      setForm(emptyFollowUp);
      await loadFollowUps();
    } catch (err) {
      console.error("Erro ao salvar follow-up:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteFollowUp = async (id: string, name: string) => {
    if (!confirm(`Excluir follow-up "${name}"? Todos os agendamentos serão removidos.`)) return;
    try {
      await fetch(`/api/admin/tappy-summit/follow-ups/${id}`, { method: "DELETE" });
      await loadFollowUps();
    } catch (err) {
      console.error("Erro ao excluir:", err);
    }
  };

  const toggleActive = async (fu: FollowUp) => {
    try {
      await fetch(`/api/admin/tappy-summit/follow-ups/${fu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fu, active: !fu.active }),
      });
      await loadFollowUps();
    } catch (err) {
      console.error("Erro ao toggle:", err);
    }
  };

  const processNow = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/cron/summit-follow-ups?secret=summit-cron-2026");
      const data = await res.json();
      alert(`Processados: ${data.processed} | WhatsApp: ${data.whatsappSent} | Email: ${data.emailsSent} | Erros: ${data.errors}`);
      await loadFollowUps();
    } catch (err) {
      console.error("Erro ao processar:", err);
    } finally {
      setProcessing(false);
    }
  };

  const startEdit = (fu: FollowUp) => {
    setEditing(fu);
    setCreating(false);
    const isInDays = fu.delayHours >= 24 && fu.delayHours % 24 === 0;
    setDelayMode(isInDays ? "days" : "hours");
    setUploadFileName(fu.whatsappMediaUrl ? fu.whatsappMediaUrl.split("/").pop() || null : null);
    setForm({
      name: fu.name,
      delayHours: fu.delayHours,
      delayType: fu.delayType,
      sortOrder: fu.sortOrder,
      whatsappEnabled: fu.whatsappEnabled,
      whatsappMessage: fu.whatsappMessage,
      whatsappMediaUrl: fu.whatsappMediaUrl,
      whatsappMediaType: fu.whatsappMediaType,
      emailEnabled: fu.emailEnabled,
      emailSubject: fu.emailSubject,
      emailBody: fu.emailBody,
      active: fu.active,
    });
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    setDelayMode("hours");
    setUploadFileName(null);
    setForm(emptyFollowUp);
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setUploadFileName(null);
    setForm(emptyFollowUp);
  };

  const handleMediaUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/tappy-summit/follow-ups/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro no upload");
        return;
      }

      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        whatsappMediaUrl: data.url,
        whatsappMediaType: data.mediaType,
      }));
      setUploadFileName(data.fileName);
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    setForm((prev) => ({
      ...prev,
      whatsappMediaUrl: null,
      whatsappMediaType: null,
    }));
    setUploadFileName(null);
  };

  const delayDisplayValue = delayMode === "days" ? form.delayHours / 24 : form.delayHours;
  const setDelayValue = (val: number) => {
    setForm({ ...form, delayHours: delayMode === "days" ? val * 24 : val });
  };

  const variables = [
    { var: "{nome}", desc: "Primeiro nome" },
    { var: "{nome_completo}", desc: "Nome completo" },
    { var: "{email}", desc: "E-mail" },
    { var: "{telefone}", desc: "Telefone" },
    { var: "{tipo}", desc: "Tipo" },
    { var: "{imobiliaria}", desc: "Imobiliária" },
  ];

  const inputClass = "w-full px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20";
  const toggleClass = "w-9 h-5 bg-neutral-200 dark:bg-neutral-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400">
        <RiLoader4Line className="w-5 h-5 animate-spin mr-2" /> Carregando follow-ups...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          Linha do tempo de mensagens automáticas (email + WhatsApp)
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={processNow}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {processing ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSendPlaneLine className="w-4 h-4" />}
            Processar agora
          </button>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#0B2545] text-white rounded-xl hover:bg-[#162d4a] transition-colors"
          >
            <RiAddLine className="w-4 h-4" /> Nova Ação
          </button>
        </div>
      </div>

      {/* Form (create/edit) */}
      {(creating || editing) && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {editing ? `Editar: ${editing.name}` : "Nova Ação na Sequência"}
          </h3>

          {/* Row 1: Nome + Ordem */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Nome da ação</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Boas-vindas, Prêmios, Lembrete..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Ordem na sequência</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Referência do delay</label>
              <select value={form.delayType} onChange={(e) => setForm({ ...form, delayType: e.target.value })} className={inputClass}>
                <option value="after_registration">Após inscrição</option>
                <option value="after_previous">Após último envio</option>
              </select>
            </div>
          </div>

          {/* Row 2: Delay */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Tempo de espera {form.delayType === "after_previous" ? "(após envio anterior)" : "(após inscrição)"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={delayDisplayValue}
                  onChange={(e) => setDelayValue(parseFloat(e.target.value) || 0)}
                  className={inputClass}
                />
                <div className="flex rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0">
                  <button
                    onClick={() => {
                      if (delayMode !== "hours") {
                        setDelayMode("hours");
                        // Convert from days to hours display
                      }
                    }}
                    className={`px-3 py-2.5 text-xs font-medium transition-colors ${delayMode === "hours" ? "bg-[#0B2545] text-white" : "bg-white dark:bg-neutral-900 text-neutral-500"}`}
                  >
                    Horas
                  </button>
                  <button
                    onClick={() => {
                      if (delayMode !== "days") {
                        setDelayMode("days");
                        // Ensure hours is divisible by 24, round up
                        if (form.delayHours % 24 !== 0) {
                          setForm({ ...form, delayHours: Math.ceil(form.delayHours / 24) * 24 });
                        }
                      }
                    }}
                    className={`px-3 py-2.5 text-xs font-medium transition-colors ${delayMode === "days" ? "bg-[#0B2545] text-white" : "bg-white dark:bg-neutral-900 text-neutral-500"}`}
                  >
                    Dias
                  </button>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {form.delayHours === 0 ? "Envio imediato" : `Envio em ${formatDelay(form.delayHours)}`}
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-800 pt-5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <RiWhatsappLine className="w-4 h-4 text-emerald-500" /> Mensagem WhatsApp
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.whatsappEnabled} onChange={(e) => setForm({ ...form, whatsappEnabled: e.target.checked })} className="sr-only peer" />
                <div className={`${toggleClass} peer-checked:bg-emerald-500`}></div>
              </label>
            </div>
            <textarea
              value={form.whatsappMessage}
              onChange={(e) => setForm({ ...form, whatsappMessage: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 resize-y font-mono"
              placeholder="Mensagem que será enviada via WhatsApp..."
            />
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  key={`wa-${v.var}`}
                  onClick={() => setForm({ ...form, whatsappMessage: form.whatsappMessage + v.var })}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title={v.desc}
                >
                  {v.var}
                </button>
              ))}
            </div>

            {/* Media Upload */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 space-y-3">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">Mídia anexa (opcional)</label>

              {form.whatsappMediaUrl ? (
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    form.whatsappMediaType === "image" ? "bg-blue-50 dark:bg-blue-500/10" :
                    form.whatsappMediaType === "audio" ? "bg-purple-50 dark:bg-purple-500/10" :
                    form.whatsappMediaType === "video" ? "bg-red-50 dark:bg-red-500/10" :
                    "bg-neutral-100 dark:bg-neutral-800"
                  }`}>
                    {form.whatsappMediaType === "image" && <RiImageLine className="w-5 h-5 text-blue-500" />}
                    {form.whatsappMediaType === "audio" && <RiMicLine className="w-5 h-5 text-purple-500" />}
                    {form.whatsappMediaType === "video" && <RiVideoLine className="w-5 h-5 text-red-500" />}
                    {form.whatsappMediaType === "document" && <RiFileTextLine className="w-5 h-5 text-neutral-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{uploadFileName || "Arquivo anexado"}</p>
                    <p className="text-[11px] text-neutral-400 capitalize">{form.whatsappMediaType}</p>
                  </div>
                  {form.whatsappMediaType === "image" && (
                    <img src={form.whatsappMediaUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                    title="Remover mídia"
                  >
                    <RiDeleteBin5Line className="w-4 h-4 text-red-400 hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
                    uploading
                      ? "border-blue-300 bg-blue-50/50 dark:bg-blue-500/5"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-500/5"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) handleMediaUpload(file);
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMediaUpload(file);
                      e.target.value = "";
                    }}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <RiLoader4Line className="w-6 h-6 text-blue-400 animate-spin" />
                      <span className="text-xs text-blue-500 font-medium">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <RiUploadCloud2Line className="w-6 h-6 text-neutral-400" />
                      <span className="text-xs text-neutral-500">Arraste ou clique para enviar imagem, áudio, vídeo ou documento</span>
                      <span className="text-[10px] text-neutral-400">Máximo 25MB</span>
                    </>
                  )}
                </label>
              )}

              <p className="text-xs text-neutral-400">
                {form.whatsappMediaType === "image" && "A imagem será enviada com a mensagem como legenda"}
                {form.whatsappMediaType === "audio" && "O áudio será enviado como mensagem de voz, seguido do texto"}
                {form.whatsappMediaType === "video" && "O vídeo será enviado com a mensagem como legenda"}
                {form.whatsappMediaType === "document" && "O documento será enviado como arquivo, com legenda"}
                {!form.whatsappMediaType && "O tipo de mídia será detectado automaticamente pelo arquivo"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-800 pt-5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <RiMailLine className="w-4 h-4 text-blue-500" /> E-mail
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.emailEnabled} onChange={(e) => setForm({ ...form, emailEnabled: e.target.checked })} className="sr-only peer" />
                <div className={`${toggleClass} peer-checked:bg-blue-500`}></div>
              </label>
            </div>
            <input type="text" value={form.emailSubject} onChange={(e) => setForm({ ...form, emailSubject: e.target.value })} placeholder="Assunto do e-mail" className={inputClass} />
            <textarea
              value={form.emailBody}
              onChange={(e) => setForm({ ...form, emailBody: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 resize-y font-mono"
              placeholder="HTML do e-mail (use variáveis {nome}, etc.)"
            />
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  key={`em-${v.var}`}
                  onClick={() => setForm({ ...form, emailBody: form.emailBody + v.var })}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title={v.desc}
                >
                  {v.var}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveFollowUp}
              disabled={saving || !form.name}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#0B2545] text-white rounded-xl hover:bg-[#162d4a] disabled:opacity-50 transition-colors"
            >
              {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSaveLine className="w-4 h-4" />}
              {editing ? "Salvar alterações" : "Criar ação"}
            </button>
            <button onClick={cancel} className="px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Timeline Visual */}
      {followUps.length === 0 && !creating ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center">
          <RiTimerLine className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">Nenhuma ação configurada</p>
          <p className="text-neutral-400 text-xs mt-1">Monte sua linha do tempo de mensagens após a inscrição</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          {followUps.length > 1 && (
            <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 to-purple-300 dark:from-emerald-500/30 dark:via-blue-500/30 dark:to-purple-500/30" />
          )}

          <div className="space-y-4 relative">
            {/* Inscrição marker */}
            <div className="flex items-center gap-4 pl-1">
              <div className="w-[30px] h-[30px] rounded-full bg-emerald-500 flex items-center justify-center z-10 shadow-lg shadow-emerald-500/20">
                <RiCheckLine className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Inscrição realizada</span>
            </div>

            {followUps.map((fu, i) => (
              <div key={fu.id} className="flex items-start gap-4 pl-1">
                {/* Timeline node */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center z-10 text-[10px] font-bold shadow-sm ${
                    !fu.active
                      ? "bg-neutral-200 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500"
                      : fu.delayHours === 0
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-2 ring-blue-500/20"
                  }`}>
                    {i + 1}
                  </div>
                  {fu.delayHours > 0 && (
                    <div className="mt-[-2px] px-1.5 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-[9px] text-neutral-500 font-medium whitespace-nowrap z-10">
                      {formatDelay(fu.delayHours)}
                    </div>
                  )}
                </div>

                {/* Card */}
                <div className={`flex-1 bg-white dark:bg-neutral-900 border rounded-xl p-4 transition-all ${
                  fu.active
                    ? "border-neutral-200 dark:border-neutral-800 hover:shadow-md"
                    : "border-neutral-100 dark:border-neutral-800/50 opacity-50"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-neutral-900 dark:text-white text-sm truncate">{fu.name}</h4>
                        {!fu.active && <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 rounded">Inativo</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {fu.whatsappEnabled && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                            <RiWhatsappLine className="w-3 h-3" /> WhatsApp
                            {fu.whatsappMediaType && <span className="opacity-60">+ {fu.whatsappMediaType === "image" ? "Img" : fu.whatsappMediaType === "audio" ? "Áudio" : fu.whatsappMediaType === "video" ? "Vídeo" : "Doc"}</span>}
                          </span>
                        )}
                        {fu.emailEnabled && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                            <RiMailLine className="w-3 h-3" /> E-mail
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400">
                          {fu.delayHours === 0 ? "Imediato" : `${formatDelay(fu.delayHours)} ${fu.delayType === "after_previous" ? "após envio anterior" : "após inscrição"}`}
                        </span>
                      </div>
                      {fu.stats && (
                        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                          <span className="text-[11px] text-neutral-400">
                            Total: <span className="font-medium text-neutral-600 dark:text-neutral-300">{fu.stats.total}</span>
                          </span>
                          <span className="text-[11px] text-emerald-500">
                            WA: <span className="font-medium">{fu.stats.whatsappSent}</span>
                          </span>
                          <span className="text-[11px] text-blue-500">
                            Email: <span className="font-medium">{fu.stats.emailSent}</span>
                          </span>
                          {fu.stats.pending > 0 && (
                            <span className="text-[11px] px-1.5 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-medium">
                              {fu.stats.pending} pendente{fu.stats.pending > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 ml-2 shrink-0">
                      <button onClick={() => toggleActive(fu)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title={fu.active ? "Desativar" : "Ativar"}>
                        {fu.active ? <RiToggleFill className="w-5 h-5 text-emerald-500" /> : <RiToggleLine className="w-5 h-5 text-neutral-400" />}
                      </button>
                      <button onClick={() => startEdit(fu)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors" title="Editar">
                        <RiEditLine className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                      </button>
                      <button onClick={() => deleteFollowUp(fu.id, fu.name)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Excluir">
                        <RiDeleteBin2Line className="w-4 h-4 text-neutral-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-xl p-4">
        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
          <RiInformationLine className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            O cron processa os envios pendentes a cada 5 minutos automaticamente.
            Use &quot;Processar agora&quot; para enviar manualmente.
            Suporta texto, imagem, áudio, vídeo e documento via WhatsApp.
          </span>
        </p>
      </div>
    </div>
  );
}

const DEFAULT_EMAIL_SUBJECT = "Você está pronto pra isso? 🏆 Tappy Summit Parceiros 2026";

const DEFAULT_EMAIL_BODY = `Olá, {nome}.

Sua Cidade e Tamboré são mercados à parte. Quem trabalha aqui sabe.

E é exatamente por isso que a gente construiu algo pensado só pra quem é daqui.

No dia 23 de abril, a Tappy Imob abre as portas do Tappy Summit Parceiros 2026 — um encontro fechado com os corretores e imobiliárias que atuam ativamente nessa região.

Na programação: o lançamento da nossa maior campanha de vendas — com metas, premiações e um ranking que vai revelar quem de fato move esse mercado.

E tem mais: vou dividir o palco com nomes que estruturam MILHÕES em negócios todos os meses. Referências reais do mercado. Conexões que todo corretor sonha em ter como parte do staff. O tipo de conversão que não acontece em curso nenhum — acontece ao vivo, com quem respira nosso ecosistema e é tração no nosso mercado.

Não é pra todo mundo. É pra quem já está aqui e quer ir mais longe.

📅 23 de abril | 14h
📍 Hotel Blue Tree Sua Cidade — Barueri/SP
🎯 Vagas limitadas

👉 [LINK DE INSCRIÇÃO]

Até lá,
Jakeline Januária
Sócia | Tappy Imob`;

function buildEmailHtml(text: string, headerColor = "#0B2545", footerColor = "#0f2137"): string {
  const lines = text.split("\n");
  let bodyHtml = "";
  for (const line of lines) {
    if (line.trim() === "") {
      bodyHtml += '<div style="height:16px"></div>';
    } else if (line.includes("[LINK DE INSCRIÇÃO]")) {
      bodyHtml += '<div style="text-align:center;margin:24px 0"><a href="https://tappyimob.com.br/tappysummit" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#25D366,#1DA851);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;border-radius:12px;letter-spacing:0.5px">GARANTIR MINHA VAGA</a></div>';
    } else {
      const escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      bodyHtml += `<p style="margin:0;line-height:1.7;color:#2d3748;font-size:15px">${escaped}</p>`;
    }
  }

  // Darken footer color slightly for the bottom bar
  const bottomBar = footerColor;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background-color:#ffffff">
  <!-- Header -->
  <div style="background:${headerColor};padding:18px 32px;text-align:center">
    <img src="https://tappyimob.com.br/logo-head.png" alt="Tappy Summit 2026" width="220" style="display:block;margin:0 auto;max-width:60%;height:auto;border:0;outline:none" />
  </div>
  <!-- Body -->
  <div style="padding:36px 32px">
    ${bodyHtml}
  </div>
  <!-- Divider -->
  <div style="padding:0 32px"><div style="height:1px;background:linear-gradient(to right,transparent,#e2e8f0,transparent)"></div></div>
  <!-- Footer logos -->
  <div style="background:${footerColor};padding:20px 32px;text-align:center">
    <p style="margin:0 0 14px;font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1.5px">Realização e Apoio</p>
    <img src="https://tappyimob.com.br/parceiros-footer-logo.png" alt="Parceiros Tappy Summit" width="320" style="display:block;margin:0 auto;max-width:70%;height:auto;border:0;outline:none" />
  </div>
  <!-- Bottom bar -->
  <div style="background:${bottomBar};padding:20px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4)">Tappy Imob &copy; 2026 • Sua Cidade &amp; Tamboré</p>
    <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.25)">Você recebeu este email por ser inscrito no Tappy Summit Parceiros 2026</p>
  </div>
</div>
<!-- Identificador único invisível para o Gmail não agrupar emails parecidos (evita "..." no corpo) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">
  ${Date.now()}-${Math.random().toString(36).slice(2, 10)}
</div>
</body>
</html>`;
}

function EmailBlastTab() {
  const [subject, setSubject] = useState(DEFAULT_EMAIL_SUBJECT);
  const [body, setBody] = useState(DEFAULT_EMAIL_BODY);
  const [headerColor, setHeaderColor] = useState("#0B2545");
  const [footerColor, setFooterColor] = useState("#0f2137");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [result, setResult] = useState<{ sent: number; errors: number; total: number } | null>(null);
  const [activeBlastId, setActiveBlastId] = useState<string | null>(null);
  const { blastProgress, setBlastProgress } = useBlastProgress(activeBlastId);
  const [resendingFailed, setResendingFailed] = useState(false);
  const [showBlastHistory, setShowBlastHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmBlast, setConfirmBlast] = useState(false);

  const variables = [
    { var: "{nome}", desc: "Primeiro nome" },
    { var: "{nome_completo}", desc: "Nome completo" },
    { var: "{email}", desc: "E-mail" },
    { var: "{telefone}", desc: "Telefone" },
    { var: "{tipo}", desc: "Tipo" },
    { var: "{imobiliaria}", desc: "Imobiliária" },
  ];

  const colorPresets = [
    { label: "Azul Noturno", header: "#0B2545", footer: "#0f2137" },
    { label: "Vinho", header: "#6B1B1B", footer: "#3d0f0f" },
    { label: "Verde Escuro", header: "#1B4332", footer: "#0d2b20" },
    { label: "Roxo", header: "#4A1D96", footer: "#2d1160" },
    { label: "Cinza Carvão", header: "#1C1C1E", footer: "#111111" },
    { label: "Terracota", header: "#7C3626", footer: "#4a1f15" },
  ];

  const generateWithAI = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/admin/tappy-summit/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", context: aiContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.subject) setSubject(data.subject);
      if (data.body) setBody(data.body);
      setShowAiPanel(false);
    } catch (err: any) {
      alert("Erro ao gerar com IA: " + err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const sendTest = async () => {
    if (!testEmail) return;
    if (!body.trim()) { alert("O corpo do email está vazio. Escreva a mensagem antes de enviar."); return; }
    if (!subject.trim()) { alert("O assunto está vazio."); return; }
    setSendingTest(true);
    try {
      const htmlBody = buildEmailHtml(body, headerColor, footerColor);
      const res = await fetch("/api/admin/tappy-summit/email-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, htmlBody, testEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("Email de teste enviado para " + testEmail);
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setSendingTest(false);
    }
  };

  const sendBlast = async () => {
    if (!body.trim()) { alert("O corpo do email está vazio. Escreva a mensagem antes de disparar."); return; }
    if (!subject.trim()) { alert("O assunto está vazio."); return; }
    if (!confirmBlast) {
      setConfirmBlast(true);
      return;
    }
    setSending(true);
    setResult(null);
    setBlastProgress(null);
    setActiveBlastId(null);
    try {
      const htmlBody = buildEmailHtml(body, headerColor, footerColor);
      const res = await fetch("/api/admin/tappy-summit/email-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, htmlBody }),
      });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {
        throw new Error(`Resposta inválida do servidor (HTTP ${res.status}). Tente novamente.`);
      }
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.blastId) {
        setActiveBlastId(data.blastId);
      } else {
        setResult({ sent: data.sent || 0, errors: data.errors || 0, total: data.total || 0 });
      }
    } catch (err: any) {
      alert("Erro no disparo: " + err.message);
    } finally {
      setSending(false);
      setConfirmBlast(false);
    }
  };

  const resendFailed = async () => {
    if (!activeBlastId) return;
    if (!confirm("Reenviar para todos os destinatários que falharam?")) return;
    setResendingFailed(true);
    try {
      const res = await fetch(
        `/api/admin/tappy-summit/whatsapp-blast/${activeBlastId}/resend-failed`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.blastId) {
        setActiveBlastId(data.blastId);
        setBlastProgress(null);
      }
    } catch (err: any) {
      alert("Erro ao reenviar: " + err.message);
    } finally {
      setResendingFailed(false);
    }
  };

  const previewHtml = buildEmailHtml(
    body
      .replace(/\{nome\}/gi, "João")
      .replace(/\{nome_completo\}/gi, "João da Silva")
      .replace(/\{email\}/gi, "joao@exemplo.com")
      .replace(/\{telefone\}/gi, "(11) 99999-9999")
      .replace(/\{tipo\}/gi, "Autônomo")
      .replace(/\{imobiliaria\}/gi, ""),
    headerColor,
    footerColor
  );

  const inputClass = "w-full px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20";

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-neutral-500">Disparo de email em massa para todos os inscritos</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-purple-200 dark:border-purple-700 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors font-medium"
          >
            <RiSparklingLine className="w-4 h-4" /> Gerar com IA
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiEyeLine className="w-4 h-4" />
            {showPreview ? "Editar" : "Preview"}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <RiSparklingLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Gerar conteúdo com IA</h3>
              <p className="text-xs text-neutral-400">A IA vai criar assunto + corpo do email com base no evento</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Contexto adicional (opcional)
            </label>
            <textarea
              value={aiContext}
              onChange={(e) => setAiContext(e.target.value)}
              rows={3}
              placeholder="Ex: Focar na exclusividade, mencionar os palestrantes, criar urgência de vagas..."
              className="w-full px-4 py-2.5 text-sm border border-purple-200 dark:border-purple-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateWithAI}
              disabled={generatingAI}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {generatingAI ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSparklingLine className="w-4 h-4" />}
              {generatingAI ? "Gerando..." : "Gerar Agora"}
            </button>
            <button onClick={() => setShowAiPanel(false)} className="text-sm text-neutral-400 hover:text-neutral-600">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showPreview ? (
        /* Preview Mode */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <RiEyeLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Preview do Email</h3>
              <p className="text-xs text-neutral-400">Assunto: {subject}</p>
            </div>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4">
            <iframe
              srcDoc={previewHtml}
              className="w-full bg-white rounded-xl border-0 shadow-sm"
              style={{ minHeight: "700px" }}
              title="Email Preview"
            />
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Compose */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <RiMailLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Compor Email</h3>
                <p className="text-xs text-neutral-400">O texto será convertido em um template HTML automaticamente</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Assunto do email</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto do email..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Corpo do email
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 resize-y font-mono leading-relaxed"
                placeholder="Digite o texto do email..."
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {variables.map((v) => (
                  <button
                    key={v.var}
                    onClick={() => setBody(body + v.var)}
                    className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    title={v.desc}
                  >
                    {v.var}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                💡 Use <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">[LINK DE INSCRIÇÃO]</code> para inserir o botão de CTA automaticamente.
              </p>
            </div>
          </div>

          {/* Color customization */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <RiImageLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Personalizar Cores</h3>
                <p className="text-xs text-neutral-400">Cor do cabeçalho e rodapé do email</p>
              </div>
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs text-neutral-500 mb-2">Presets rápidos:</p>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { setHeaderColor(p.header); setFooterColor(p.footer); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: p.header }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Cabeçalho</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer relative">
                    <input
                      type="color"
                      value={headerColor}
                      onChange={(e) => setHeaderColor(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: headerColor }} />
                  </div>
                  <input
                    type="text"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono focus:outline-none"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Rodapé</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer relative">
                    <input
                      type="color"
                      value={footerColor}
                      onChange={(e) => setFooterColor(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: footerColor }} />
                  </div>
                  <input
                    type="text"
                    value={footerColor}
                    onChange={(e) => setFooterColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono focus:outline-none"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Send */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <RiSendPlaneLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Envio de Teste</h3>
                <p className="text-xs text-neutral-400">Envie um teste antes do disparo em massa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`flex-1 ${inputClass}`}
              />
              <button
                onClick={sendTest}
                disabled={sendingTest || !testEmail}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {sendingTest ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSendPlaneLine className="w-4 h-4" />}
                Enviar Teste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blast Controls */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <RiMailLine className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Disparar para Todos</h3>
              <p className="text-xs text-neutral-400">Envia o email para todos os inscritos do Tappy Summit</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBlastHistory(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            <RiHistoryLine className="w-4 h-4" /> Histórico
          </button>
        </div>

        {blastProgress && (
          <div className="mb-4">
            <BlastProgressPanel
              blast={blastProgress}
              channel="email"
              onResendFailed={resendFailed}
              resending={resendingFailed}
            />
          </div>
        )}

        {result && !activeBlastId && (
          <div className={`mb-4 p-4 rounded-xl border ${result.errors > 0 ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20" : "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20"}`}>
            <p className={`text-sm font-medium ${result.errors > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
              Disparo concluído! ✅ {result.sent} enviados de {result.total} total{result.errors > 0 ? ` • ⚠️ ${result.errors} erros` : ""}
            </p>
          </div>
        )}

        {showBlastHistory && (
          <BlastHistoryModal
            channel="email"
            onClose={() => setShowBlastHistory(false)}
            onOpenDetail={(id) => {
              setShowBlastHistory(false);
              setResult(null);
              setBlastProgress(null);
              setActiveBlastId(id);
            }}
          />
        )}

        {confirmBlast && !sending && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              ⚠️ Tem certeza? Isso vai enviar o email para TODOS os inscritos. Clique novamente para confirmar.
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={sendBlast}
            disabled={sending || !subject || !body}
            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
              confirmBlast ? "bg-red-600 text-white hover:bg-red-700" : "bg-[#0B2545] text-white hover:bg-[#162d4a]"
            } disabled:opacity-50`}
          >
            {sending ? (
              <><RiLoader4Line className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : confirmBlast ? (
              <><RiSendPlaneLine className="w-4 h-4" /> Confirmar Disparo</>
            ) : (
              <><RiSendPlaneLine className="w-4 h-4" /> Disparar Emails</>
            )}
          </button>
          {confirmBlast && !sending && (
            <button onClick={() => setConfirmBlast(false)} className="px-4 py-3 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-xl p-4">
        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
          <RiInformationLine className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            O email é enviado de <strong>evento@tappyimob.com.br</strong> via SMTP.
            Use variáveis como {"{nome}"} para personalizar. Delay de 1-2s entre envios para evitar bloqueio.
            Envie sempre um teste antes do disparo em massa.
          </span>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// WHATSAPP BLAST TAB
// ============================================================
function WhatsAppBlastTab() {
  const [sessions, setSessions] = useState<WAHASession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [registrations, setRegistrations] = useState<{ id: string; name: string; phone: string; email: string }[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [message, setMessage] = useState("Olá, {nome}! 👋\n\nEstamos te esperando no *Tappy Summit Parceiros 2026*!\n\n📅 23 de abril às 14h\n📍 Hotel Blue Tree Sua Cidade — Barueri/SP\n\nSua presença faz a diferença. Confirme sua participação:\nhttps://tappyimob.com.br/tappysummit\n\nAté lá! 🚀");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [delayMs, setDelayMs] = useState(3000);
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [result, setResult] = useState<{ sent: number; errors: number; total: number } | null>(null);
  const [activeBlastId, setActiveBlastId] = useState<string | null>(null);
  const [blastProgress, setBlastProgress] = useState<BlastDetail | null>(null);
  const [blastFilter, setBlastFilter] = useState<"all" | "sent" | "failed" | "pending">("all");
  const [resendingFailed, setResendingFailed] = useState(false);
  const [showBlastHistory, setShowBlastHistory] = useState(false);
  const [blastHistory, setBlastHistory] = useState<any[]>([]);
  const [loadingBlastHistory, setLoadingBlastHistory] = useState(false);
  const [confirmBlast, setConfirmBlast] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string>("");
  const [voiceFileName, setVoiceFileName] = useState<string>("");
  const [voiceMimeType, setVoiceMimeType] = useState<string>("");
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "">("");
  const [mediaFileName, setMediaFileName] = useState<string>("");
  const [mediaMimeType, setMediaMimeType] = useState<string>("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [voiceFirst, setVoiceFirst] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadSessions();
    loadRegistrations();
  }, []);

  // cleanup countdown + recording on unmount
  useEffect(() => () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
  }, []);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch("/api/admin/tappy-summit/waha-sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      const working = (data.sessions || []).find((s: WAHASession) => s.status === "WORKING");
      if (working) setSelectedSession(working.name);
    } catch {}
    setSessionsLoading(false);
  };

  const loadRegistrations = async () => {
    setRegLoading(true);
    try {
      const res = await fetch("/api/admin/tappy-summit?limit=999");
      const data = await res.json();
      setRegistrations((data.registrations || []).map((r: any) => ({ id: r.id, name: r.name, phone: r.phone, email: r.email })));
    } catch {}
    setRegLoading(false);
  };

  const toggleId = (id: string) => {
    setSelectAll(false);
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectAll) { setSelectAll(false); setSelectedIds([]); }
    else { setSelectAll(true); setSelectedIds([]); }
  };

  const generateWithAI = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/admin/tappy-summit/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "whatsapp", context: aiContext }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.message) setMessage(data.message);
      setShowAiPanel(false);
    } catch (err: any) {
      alert("Erro ao gerar com IA: " + err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const uploadVoiceBlob = async (blob: Blob, displayName: string) => {
    setUploadingVoice(true);
    try {
      const fd = new FormData();
      const ext = blob.type.includes("webm") ? "webm" : blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "audio";
      fd.append("file", blob, `${displayName.replace(/[^a-zA-Z0-9.-]/g, "_")}.${ext}`);
      const res = await fetch("/api/admin/tappy-summit/follow-ups/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload");
      setVoiceUrl(data.url);
      setVoiceFileName(data.fileName || displayName);
      setVoiceMimeType(data.mimeType || blob.type);
    } catch (err: any) {
      alert("Erro ao enviar áudio: " + err.message);
    } finally {
      setUploadingVoice(false);
    }
  };

  const handleVoiceUpload = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Selecione um arquivo de áudio");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      alert("Áudio muito grande. Máximo 16MB");
      return;
    }
    await uploadVoiceBlob(file, file.name);
  };

  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick best supported mime type for WhatsApp/WAHA conversion
      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      const mimeType = candidates.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) || "";
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
        setRecording(false);
        const finalType = mr.mimeType || mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalType });
        if (blob.size > 0) {
          const stamp = new Date().toISOString().replace(/[:.]/g, "-");
          await uploadVoiceBlob(blob, `gravacao-${stamp}`);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (err: any) {
      alert("Não foi possível acessar o microfone: " + (err?.message || "permissão negada"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
  };

  const removeVoice = () => {
    setVoiceUrl("");
    setVoiceFileName("");
    setVoiceMimeType("");
  };

  const handleMediaUpload = async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      alert("Selecione uma imagem ou vídeo");
      return;
    }
    const maxSize = isVideo ? 16 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Máximo ${isVideo ? "16MB para vídeo" : "5MB para imagem"}`);
      return;
    }
    setUploadingMedia(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/tappy-summit/follow-ups/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload");
      setMediaUrl(data.url);
      setMediaType(isImage ? "image" : "video");
      setMediaFileName(data.fileName || file.name);
      setMediaMimeType(data.mimeType || file.type);
    } catch (err: any) {
      alert("Erro ao enviar mídia: " + err.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = () => {
    setMediaUrl("");
    setMediaType("");
    setMediaFileName("");
    setMediaMimeType("");
  };

  const formatRecTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const doBlast = async () => {
    setSending(true);
    setResult(null);
    setBlastProgress(null);
    setActiveBlastId(null);
    try {
      const res = await fetch("/api/admin/tappy-summit/whatsapp-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionName: selectedSession,
          message,
          recipientIds: selectAll ? [] : selectedIds,
          sendToAll: selectAll,
          delayMs,
          voiceUrl: voiceUrl || undefined,
          voiceMimeType: voiceMimeType || undefined,
          voiceFirst,
          mediaUrl: mediaUrl || undefined,
          mediaType: mediaType || undefined,
          mediaMimeType: mediaMimeType || undefined,
        }),
      });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {
        throw new Error(
          `Resposta inv\u00e1lida do servidor (HTTP ${res.status}). Tente novamente em alguns segundos.`
        );
      }
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      // Novo fluxo async: backend retorna imediatamente com blastId.
      // UI passa a acompanhar via polling em /whatsapp-blast/[id].
      if (data.blastId) {
        setActiveBlastId(data.blastId);
      } else {
        // Fallback pra resposta antiga (disparo sincrono, teste etc)
        setResult({ sent: data.sent || 0, errors: data.errors || 0, total: data.total || 0 });
      }
    } catch (err: any) {
      alert("Erro no disparo: " + err.message);
    } finally {
      setSending(false);
      setConfirmBlast(false);
    }
  };

  // Polling do progresso do blast ativo
  useEffect(() => {
    if (!activeBlastId) return;
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/admin/tappy-summit/whatsapp-blast/${activeBlastId}`);
        if (!res.ok) return;
        const data: BlastDetail = await res.json();
        if (stop) return;
        setBlastProgress(data);
        if (data.status === "running") {
          setTimeout(tick, 2000);
        }
      } catch {
        if (!stop) setTimeout(tick, 3000);
      }
    };
    tick();
    return () => {
      stop = true;
    };
  }, [activeBlastId]);

  const loadBlastHistory = async () => {
    setLoadingBlastHistory(true);
    try {
      const res = await fetch("/api/admin/tappy-summit/whatsapp-blast/history");
      const data = await res.json();
      if (res.ok) setBlastHistory(data.blasts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBlastHistory(false);
    }
  };

  const openBlastHistory = () => {
    setShowBlastHistory(true);
    loadBlastHistory();
  };

  const openBlastDetail = (blastId: string) => {
    setShowBlastHistory(false);
    setResult(null);
    setBlastProgress(null);
    setActiveBlastId(blastId);
  };

  const resendFailed = async () => {
    if (!activeBlastId) return;
    if (!confirm("Reenviar para todos os destinatários que falharam?")) return;
    setResendingFailed(true);
    try {
      const res = await fetch(
        `/api/admin/tappy-summit/whatsapp-blast/${activeBlastId}/resend-failed`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.blastId) {
        setActiveBlastId(data.blastId);
        setBlastProgress(null);
      }
    } catch (err: any) {
      alert("Erro ao reenviar: " + err.message);
    } finally {
      setResendingFailed(false);
    }
  };

  const handleDispatch = () => {
    if (!selectedSession) { alert("Selecione uma sessão WhatsApp"); return; }
    if (!message.trim()) { alert("Digite a mensagem"); return; }
    if (!selectAll && selectedIds.length === 0) { alert("Selecione ao menos um destinatário"); return; }

    if (scheduledAt) {
      const target = new Date(scheduledAt).getTime();
      const now = Date.now();
      const diff = Math.floor((target - now) / 1000);
      if (diff <= 0) { alert("Escolha uma data/hora no futuro"); return; }
      setCountdown(diff);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownRef.current!);
            setCountdown(null);
            doBlast();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      setConfirmBlast(false);
      return;
    }

    if (!confirmBlast) { setConfirmBlast(true); return; }
    doBlast();
  };

  const cancelSchedule = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
  };

  const recipientCount = selectAll ? registrations.length : selectedIds.length;

  const filteredRegistrations = searchQuery.trim()
    ? registrations.filter((r) => {
        const q = searchQuery.trim().toLowerCase();
        const digits = q.replace(/\D/g, "");
        const phoneDigits = r.phone.replace(/\D/g, "");
        return (
          r.name.toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q) ||
          (digits && phoneDigits.includes(digits))
        );
      })
    : registrations;

  const sendTest = async () => {
    if (!testPhone.trim() || !selectedSession || !message.trim()) return;
    setSendingTest(true);
    try {
      const res = await fetch("/api/admin/tappy-summit/whatsapp-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionName: selectedSession,
          message,
          delayMs: 0,
          testPhone: testPhone.trim(),
          voiceUrl: voiceUrl || undefined,
          voiceMimeType: voiceMimeType || undefined,
          voiceFirst,
          mediaUrl: mediaUrl || undefined,
          mediaType: mediaType || undefined,
          mediaMimeType: mediaMimeType || undefined,
        }),
      });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {
        throw new Error(
          res.status === 504
            ? "Timeout do servidor (504) \u2014 o teste pode ter sido enviado mesmo assim. Confira no WhatsApp."
            : `Resposta inv\u00e1lida do servidor (HTTP ${res.status}). Tente novamente.`
        );
      }
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.errors > 0) {
        alert(`Falha no teste: ${data.errorDetails?.[0] || "erro desconhecido"}`);
      } else {
        alert(`✅ Teste enviado para ${testPhone}`);
      }
    } catch (err: any) {
      alert("Erro no teste: " + err.message);
    } finally {
      setSendingTest(false);
    }
  };

  const variables = ["{nome}", "{nome_completo}", "{telefone}"];

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}h ${m}m ${sec}s` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-neutral-500">Disparo de WhatsApp para os inscritos do Tappy Summit</p>
        <div className="flex items-center gap-2">
          <button
            onClick={openBlastHistory}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            <RiHistoryLine className="w-4 h-4" /> Histórico de disparos
          </button>
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors font-medium"
          >
            <RiSparklingLine className="w-4 h-4" /> Gerar mensagem com IA
          </button>
        </div>
      </div>

      {/* Modal: Histórico de disparos */}
      {showBlastHistory && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowBlastHistory(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <RiHistoryLine className="w-5 h-5 text-neutral-600" />
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Histórico de disparos</h3>
                <button
                  onClick={loadBlastHistory}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  title="Atualizar"
                >
                  <RiRefreshLine className={`w-4 h-4 text-neutral-500 ${loadingBlastHistory ? "animate-spin" : ""}`} />
                </button>
              </div>
              <button
                onClick={() => setShowBlastHistory(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiCloseLine className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {loadingBlastHistory && blastHistory.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-400">
                  <RiLoader4Line className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Carregando...
                </div>
              ) : blastHistory.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-400">Nenhum disparo registrado ainda.</div>
              ) : (
                blastHistory.map((b) => {
                  const done = b.sentCount + b.errorCount;
                  const pct = Math.round((done / Math.max(b.totalRecipients, 1)) * 100);
                  const statusLabel =
                    b.status === "running" ? "Em andamento" :
                    b.status === "completed" ? "Concluído" :
                    b.status === "aborted" ? "Abortado" : "Com erro";
                  const statusColor =
                    b.status === "running" ? "text-green-600 bg-green-50" :
                    b.status === "completed" ? "text-emerald-700 bg-emerald-50" :
                    "text-red-700 bg-red-50";
                  return (
                    <button
                      key={b.id}
                      onClick={() => openBlastDetail(b.id)}
                      className="w-full text-left p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#0B2545] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                              {statusLabel}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {new Date(b.createdAt).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {b.createdByName && (
                              <span className="text-xs text-neutral-400">por {b.createdByName}</span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {b.message?.slice(0, 120)}
                            {b.message?.length > 120 ? "..." : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {b.sentCount}/{b.totalRecipients}
                          </p>
                          {b.errorCount > 0 && (
                            <p className="text-xs text-red-500">{b.errorCount} falhados</p>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Panel */}
      {showAiPanel && (
        <div className="bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiSparklingLine className="w-5 h-5 text-green-700 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Gerar mensagem com IA</h3>
              <p className="text-xs text-neutral-400">A IA vai criar uma mensagem de WhatsApp para o evento</p>
            </div>
          </div>
          <textarea
            value={aiContext}
            onChange={(e) => setAiContext(e.target.value)}
            rows={2}
            placeholder="Ex: Foco em urgência, vagas quase esgotadas, tom animado..."
            className="w-full px-4 py-2.5 text-sm border border-green-200 dark:border-green-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={generateWithAI}
              disabled={generatingAI}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {generatingAI ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSparklingLine className="w-4 h-4" />}
              {generatingAI ? "Gerando..." : "Gerar Agora"}
            </button>
            <button onClick={() => setShowAiPanel(false)} className="text-sm text-neutral-400 hover:text-neutral-600">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Session + Message */}
        <div className="space-y-5">
          {/* Session selector */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                  <RiWhatsappLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Sessão WhatsApp</h3>
                  <p className="text-xs text-neutral-400">Selecione a conta que vai fazer o disparo</p>
                </div>
              </div>
              <button onClick={loadSessions} disabled={sessionsLoading} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <RiRefreshLine className={`w-4 h-4 text-neutral-400 ${sessionsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {sessions.length === 0 ? (
              <p className="text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3">
                Nenhuma sessão encontrada. Conecte um WhatsApp em{" "}
                <a href="/admin/imob-ia/chat" className="text-green-600 underline">Imob-IA → Chat</a>.
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSession(s.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedSession === s.name
                        ? "border-green-400 bg-green-50 dark:bg-green-500/10"
                        : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === "WORKING" ? "bg-green-500" : s.status === "STARTING" ? "bg-amber-500" : "bg-red-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{s.name}</p>
                      {s.me?.pushName && <p className="text-xs text-neutral-400 truncate">{s.me.pushName}</p>}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      s.status === "WORKING" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                      s.status === "STARTING" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>{s.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message composer */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <RiFileTextLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Mensagem</h3>
                <p className="text-xs text-neutral-400">Suporta *negrito*, _itálico_ e emojis</p>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-y font-mono leading-relaxed"
              placeholder="Digite a mensagem..."
            />
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  key={v}
                  onClick={() => setMessage((m) => m + v)}
                  className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400">{message.length} caracteres</p>
          </div>

          {/* Voice message */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <RiMicLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Mensagem de voz (opcional)</h3>
                <p className="text-xs text-neutral-400">Envia como áudio de voz do WhatsApp (PTT). Use o controle de ordem abaixo.</p>
              </div>
            </div>

            {voiceUrl ? (
              <div className="flex items-center gap-3 bg-purple-50/50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                  <RiMicLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{voiceFileName}</p>
                  <audio src={voiceUrl} controls className="mt-1 w-full h-8" />
                </div>
                <button
                  type="button"
                  onClick={removeVoice}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                  title="Remover áudio"
                >
                  <RiDeleteBin5Line className="w-4 h-4 text-red-400 hover:text-red-500" />
                </button>
              </div>
            ) : recording ? (
              <div className="flex items-center gap-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
                  <div className="relative w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <RiMicLine className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Gravando...</p>
                  <p className="text-2xl font-mono font-bold text-red-600 dark:text-red-400 tabular-nums">{formatRecTime(recordingTime)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <RiCheckLine className="w-4 h-4" /> Parar e enviar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={uploadingVoice}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <RiMicLine className="w-5 h-5" /> Gravar áudio agora
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400">ou enviar arquivo</span>
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
                </div>

                <label
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                    uploadingVoice
                      ? "border-purple-300 bg-purple-50/50 dark:bg-purple-500/5"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-500/5"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) handleVoiceUpload(file);
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVoiceUpload(file);
                      e.target.value = "";
                    }}
                    disabled={uploadingVoice}
                  />
                  {uploadingVoice ? (
                    <>
                      <RiLoader4Line className="w-6 h-6 text-purple-400 animate-spin" />
                      <span className="text-xs text-purple-500 font-medium">Enviando áudio...</span>
                    </>
                  ) : (
                    <>
                      <RiUploadCloud2Line className="w-6 h-6 text-neutral-400" />
                      <span className="text-xs text-neutral-500">Arraste ou clique para enviar (mp3, ogg, m4a, wav)</span>
                      <span className="text-[10px] text-neutral-400">Máximo 16MB</span>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Ordem de envio — só aparece quando há áudio carregado */}
            {voiceUrl && (
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Ordem de envio
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceFirst(false)}
                    className={`p-3 rounded-xl text-left text-xs transition-all border ${
                      !voiceFirst
                        ? "border-purple-400 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300"
                        : "border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    <div className="font-semibold mb-0.5">1º Texto/Mídia → 2º Áudio</div>
                    <div className="opacity-70">Áudio por último (fechamento)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceFirst(true)}
                    className={`p-3 rounded-xl text-left text-xs transition-all border ${
                      voiceFirst
                        ? "border-purple-400 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300"
                        : "border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    <div className="font-semibold mb-0.5">1º Áudio → 2º Texto/Mídia</div>
                    <div className="opacity-70">Áudio primeiro (abertura)</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Image / Video */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <RiImageLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Imagem ou vídeo (opcional)</h3>
                <p className="text-xs text-neutral-400">Enviado junto da mensagem como legenda</p>
              </div>
            </div>

            {mediaUrl ? (
              <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  {mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={mediaUrl} className="w-full h-full object-cover" muted />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{mediaFileName}</p>
                  <p className="text-[11px] text-neutral-400 capitalize">{mediaType === "image" ? "Imagem" : "Vídeo"}</p>
                </div>
                <button
                  type="button"
                  onClick={removeMedia}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                  title="Remover mídia"
                >
                  <RiDeleteBin5Line className="w-4 h-4 text-red-400 hover:text-red-500" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                  uploadingMedia
                    ? "border-blue-300 bg-blue-50/50 dark:bg-blue-500/5"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-500/5"
                }`}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file) handleMediaUpload(file);
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMediaUpload(file);
                    e.target.value = "";
                  }}
                  disabled={uploadingMedia}
                />
                {uploadingMedia ? (
                  <>
                    <RiLoader4Line className="w-6 h-6 text-blue-400 animate-spin" />
                    <span className="text-xs text-blue-500 font-medium">Enviando mídia...</span>
                  </>
                ) : (
                  <>
                    <RiUploadCloud2Line className="w-6 h-6 text-neutral-400" />
                    <span className="text-xs text-neutral-500">Arraste ou clique para enviar imagem ou vídeo</span>
                    <span className="text-[10px] text-neutral-400">Imagem até 5MB • Vídeo até 16MB</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Delay */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Intervalo entre mensagens
            </label>
            <div className="flex items-center gap-3">
              {[2000, 3000, 5000, 8000].map((d) => (
                <button
                  key={d}
                  onClick={() => setDelayMs(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    delayMs === d ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                  }`}
                >
                  {d / 1000}s
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-2">Intervalo mínimo recomendado: 3s para evitar bloqueio</p>
          </div>
        </div>

        {/* Right: Recipients + Schedule + Dispatch */}
        <div className="space-y-5">
          {/* Recipients */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Destinatários</h3>
                <p className="text-xs text-neutral-400">
                  {recipientCount} selecionado{recipientCount === 1 ? "" : "s"}
                  {searchQuery.trim() && ` • ${filteredRegistrations.length} na busca`}
                </p>
              </div>
              <button
                onClick={toggleSelectAll}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectAll ? "bg-[#0B2545] text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {selectAll ? "✓ Todos" : "Selecionar todos"}
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, telefone ou e-mail..."
                className="w-full pl-9 pr-9 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                  title="Limpar busca"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>

            {regLoading ? (
              <div className="flex items-center justify-center py-8">
                <RiLoader4Line className="w-5 h-5 animate-spin text-neutral-400" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">Nenhum inscrito encontrado</p>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredRegistrations.map((r) => {
                  const isSelected = selectAll || selectedIds.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-green-50 dark:bg-green-500/10" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleId(r.id)}
                        className="w-3.5 h-3.5 accent-green-600 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{r.name}</p>
                        <p className="text-[10px] text-neutral-400">{r.phone}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Test dispatch */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <RiSendPlaneLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Enviar teste</h3>
                <p className="text-xs text-neutral-400">Mande para um número só pra revisar antes do disparo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Ex: 11987654321 ou +55 11 98765-4321"
                className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                onClick={sendTest}
                disabled={sendingTest || !testPhone.trim() || !selectedSession || !message.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {sendingTest ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSendPlaneLine className="w-4 h-4" />}
                {sendingTest ? "Enviando..." : "Testar"}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              Usa a mesma sessão, texto, áudio e mídia configurados. Variáveis como <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">{"{nome}"}</code> viram &quot;Teste&quot;.
            </p>
          </div>

          {/* Schedule */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <RiTimerLine className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">Agendar Disparo</h3>
                <p className="text-xs text-neutral-400">Deixe em branco para disparar imediatamente</p>
              </div>
            </div>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Countdown banner */}
          {countdown !== null && (
            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Disparo agendado</p>
                <p className="text-2xl font-mono font-bold text-amber-800 dark:text-amber-300 mt-1">{formatCountdown(countdown)}</p>
              </div>
              <button
                onClick={cancelSchedule}
                className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Result (disparo teste ou fallback antigo) */}
          {result && !activeBlastId && (
            <div className={`p-4 rounded-xl border ${result.errors > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-sm font-medium ${result.errors > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                ✅ {result.sent} enviados de {result.total}{result.errors > 0 ? ` • ⚠️ ${result.errors} erros` : ""}
              </p>
            </div>
          )}

          {/* Progresso em tempo real do blast ativo */}
          {blastProgress && (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              {/* Cabeçalho com contadores e barra */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {blastProgress.status === "running" ? (
                      <RiLoader4Line className="w-5 h-5 text-green-600 animate-spin" />
                    ) : blastProgress.status === "completed" ? (
                      <RiCheckLine className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <RiAlertLine className="w-5 h-5 text-red-600" />
                    )}
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {blastProgress.status === "running" ? "Disparando..." :
                       blastProgress.status === "completed" ? "Disparo concluído" :
                       blastProgress.status === "aborted" ? "Disparo abortado" :
                       "Disparo com erro"}
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {blastProgress.sentCount + blastProgress.errorCount}/{blastProgress.totalRecipients}
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.round(((blastProgress.sentCount + blastProgress.errorCount) / Math.max(blastProgress.totalRecipients, 1)) * 100)}%`,
                    }}
                  />
                </div>

                {/* Contadores */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{blastProgress.sentCount}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase">Enviados</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">{blastProgress.errorCount}</p>
                    <p className="text-[10px] text-red-600 dark:text-red-500 uppercase">Falhados</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{blastProgress.pendingCount}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-500 uppercase">Pendentes</p>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                    <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{blastProgress.totalRecipients}</p>
                    <p className="text-[10px] text-neutral-500 uppercase">Total</p>
                  </div>
                </div>

                {/* Ações */}
                {blastProgress.status !== "running" && blastProgress.errorCount > 0 && (
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={resendFailed}
                      disabled={resendingFailed}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {resendingFailed ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiRefreshLine className="w-3.5 h-3.5" />}
                      Reenviar {blastProgress.errorCount} falhado{blastProgress.errorCount > 1 ? "s" : ""}
                    </button>
                  </div>
                )}
              </div>

              {/* Filtros + lista de destinatários */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {[
                    { key: "all", label: `Todos (${blastProgress.recipients.length})` },
                    { key: "sent", label: `Enviados (${blastProgress.sentCount})` },
                    { key: "failed", label: `Falhados (${blastProgress.errorCount})` },
                    { key: "pending", label: `Pendentes (${blastProgress.pendingCount})` },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setBlastFilter(f.key as any)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        blastFilter === f.key
                          ? "bg-[#0B2545] text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-800">
                  {blastProgress.recipients
                    .filter((r) => blastFilter === "all" || r.status === blastFilter)
                    .map((r) => (
                      <div key={r.id} className="flex items-center gap-3 p-2.5 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            r.status === "sent" ? "bg-emerald-500" :
                            r.status === "failed" ? "bg-red-500" :
                            "bg-amber-400 animate-pulse"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 dark:text-white truncate">{r.name}</p>
                          <p className="text-[10px] text-neutral-500">{r.phone}</p>
                          {r.error && (
                            <p className="text-[10px] text-red-500 mt-0.5 truncate" title={r.error}>
                              {r.error}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 text-[10px] font-semibold uppercase ${
                            r.status === "sent" ? "text-emerald-600" :
                            r.status === "failed" ? "text-red-600" :
                            "text-amber-600"
                          }`}
                        >
                          {r.status === "sent" ? "Enviado" : r.status === "failed" ? "Falhou" : "Pendente"}
                        </span>
                      </div>
                    ))}
                  {blastProgress.recipients.filter((r) => blastFilter === "all" || r.status === blastFilter).length === 0 && (
                    <div className="p-6 text-center text-xs text-neutral-400">Nenhum destinatário neste filtro</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirm warning */}
          {confirmBlast && !sending && countdown === null && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                ⚠️ Vai enviar WhatsApp para <strong>{recipientCount} pessoa(s)</strong>. Confirme clicando novamente.
              </p>
            </div>
          )}

          {/* Dispatch button */}
          {countdown === null && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDispatch}
                disabled={sending || !selectedSession || !message.trim()}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all ${
                  confirmBlast ? "bg-red-600 text-white hover:bg-red-700" :
                  scheduledAt ? "bg-amber-500 text-white hover:bg-amber-600" :
                  "bg-green-600 text-white hover:bg-green-700"
                } disabled:opacity-50`}
              >
                {sending ? (
                  <><RiLoader4Line className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : confirmBlast ? (
                  <><RiSendPlaneLine className="w-4 h-4" /> Confirmar Disparo</>
                ) : scheduledAt ? (
                  <><RiTimerLine className="w-4 h-4" /> Agendar Disparo</>
                ) : (
                  <><RiWhatsappLine className="w-4 h-4" /> Disparar Agora</>
                )}
              </button>
              {confirmBlast && !sending && (
                <button onClick={() => setConfirmBlast(false)} className="px-4 py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors">
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10 rounded-xl p-4">
        <p className="text-xs text-green-700 dark:text-green-400 flex items-start gap-2">
          <RiInformationLine className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Use uma sessão com status <strong>WORKING</strong>. Mantenha o intervalo mínimo de 3s entre mensagens.
            Para agendamento, a página deve permanecer aberta. Use variáveis como <code className="bg-green-100 dark:bg-green-500/20 px-1 rounded">{"{nome}"}</code> para personalizar.
          </span>
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "emerald" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}

function ToggleFlag({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
        active
          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
          : "bg-neutral-100 text-neutral-300 dark:bg-neutral-800 dark:text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      }`}
      title={active ? "Marcar como não" : "Marcar como sim"}
    >
      {active ? <RiCheckLine className="w-3.5 h-3.5" /> : <RiCloseLine className="w-3.5 h-3.5" />}
    </button>
  );
}
