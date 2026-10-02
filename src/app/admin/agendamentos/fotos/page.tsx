"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiCameraLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiAddLine,
  RiHome4Line,
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiUserLine,
  RiCloseLine,
  RiCheckLine,
  RiVideoLine,
  RiImage2Line,
  RiFlightTakeoffLine,
  RiUploadCloud2Line,
  RiDownloadLine,
  RiSearchLine,
  RiFilterLine,
  RiPhoneLine,
  RiEditLine,
  RiEyeLine,
  RiLoader4Line,
  RiDeleteBinLine,
} from "react-icons/ri";

interface PhotoSession {
  id: string;
  propertyId: string;
  property: {
    id: string;
    code: string;
    title: string;
    address: string;
    number?: string;
    neighborhood: string;
    city: string;
    thumbnail?: string;
    type: string;
  };
  serviceTypes: string[];
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  status: string;
  photographerIds: string[];
  photographer?: { id: string; name: string; avatar?: string };
  broker?: { id: string; name: string; avatar?: string };
  brokerConfirmed: boolean;
  ownerConfirmed: boolean;
  contactName?: string;
  notes?: string;
  requiresAdminApproval?: boolean;
  adminApproved?: boolean;
  _count?: { media: number };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  AGENDADO: { label: "Agendado", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20" },
  PENDENTE_CONFIRMACAO: { label: "Pendente Confirmação", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  EM_EDICAO: { label: "Em Edição", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-500/20" },
  CONCLUIDO: { label: "Concluído", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  CANCELADO: { label: "Cancelado", color: "text-red-600", bg: "bg-red-100 dark:bg-red-500/20" },
};

const serviceTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  FOTO: { label: "Foto", icon: RiImage2Line, color: "text-blue-500" },
  VIDEO: { label: "Vídeo", icon: RiVideoLine, color: "text-red-500" },
  VIDEO_CORRETOR: { label: "Vídeo Corretor", icon: RiUserLine, color: "text-purple-500" },
  DRONE: { label: "Drone", icon: RiFlightTakeoffLine, color: "text-green-500" },
};

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function AgendamentosFotosPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendario" | "esteira">("esteira");
  const [selectedSession, setSelectedSession] = useState<PhotoSession | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [properties, setProperties] = useState<any[]>([]);
  const [photographers, setPhotographers] = useState<any[]>([]);

  useEffect(() => {
    loadSessions();
    loadProperties();
    loadPhotographers();
  }, [statusFilter]);

  const loadSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      
      const res = await fetch(`/api/admin/photo-sessions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await fetch("/api/properties?limit=100&status=DISPONIVEL");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    }
  };

  const loadPhotographers = async () => {
    try {
      const res = await fetch("/api/admin/users?role=FOTOGRAFO");
      if (res.ok) {
        const data = await res.json();
        setPhotographers(data.users || []);
      }
    } catch (error) {
      console.error("Erro ao carregar fotógrafos:", error);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/photo-sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, status: newStatus }),
      });
      if (res.ok) {
        loadSessions();
        setSelectedSession(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/photo-sessions?id=${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadSessions();
        setSelectedSession(null);
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      alert("Erro ao excluir agendamento");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getSessionsByStatus = (status: string) => sessions.filter(s => s.status === status);

  const stats = [
    { label: "Agendados", value: getSessionsByStatus("AGENDADO").length, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Pendente Confirmação", value: getSessionsByStatus("PENDENTE_CONFIRMACAO").length, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
    { label: "Em Edição", value: getSessionsByStatus("EM_EDICAO").length, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
    { label: "Concluídos", value: getSessionsByStatus("CONCLUIDO").length, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  ];

  const esteiraColumns = [
    { status: "AGENDADO", title: "📅 Agendado", color: "border-blue-500" },
    { status: "PENDENTE_CONFIRMACAO", title: "⏳ Pendente Confirmação", color: "border-amber-500" },
    { status: "EM_EDICAO", title: "🎬 Em Edição", color: "border-purple-500" },
    { status: "CONCLUIDO", title: "✅ Concluído", color: "border-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <RiCameraLine className="w-5 h-5 text-white" />
            </div>
            Produção de Fotos & Vídeos
          </h1>
          <p className="text-neutral-500 mt-1">
            Gerencie agendamentos e esteira de produção
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("esteira")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "esteira" ? "bg-white dark:bg-neutral-700 text-purple-500 shadow-sm" : "text-neutral-500"}`}
            >
              Esteira
            </button>
            <button
              onClick={() => setViewMode("calendario")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === "calendario" ? "bg-white dark:bg-neutral-700 text-purple-500 shadow-sm" : "text-neutral-500"}`}
            >
              Calendário
            </button>
          </div>
          <Link
            href="/admin/agendamentos/fotos/agenda"
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiCalendarLine className="w-4 h-4" />
            Gerenciar Agenda
          </Link>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            onClick={() => setStatusFilter(statusFilter === Object.keys(statusConfig)[index] ? "" : Object.keys(statusConfig)[index])}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <span className="text-sm text-neutral-500">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RiLoader4Line className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : viewMode === "esteira" ? (
        /* Esteira de Produção (Kanban) */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-x-auto">
          {esteiraColumns.map((column) => (
            <div key={column.status} className={`bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border-t-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">{column.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                  {getSessionsByStatus(column.status).length}
                </span>
              </div>
              
              <div className="space-y-3">
                {getSessionsByStatus(column.status).map((session) => {
                  const firstService = session.serviceTypes?.[0] || "FOTO";
                  const serviceConfig = serviceTypeConfig[firstService] || serviceTypeConfig.FOTO;
                  const ServiceIcon = serviceConfig.icon;
                  
                  return (
                    <motion.div
                      key={session.id}
                      layoutId={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:shadow-md transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Thumbnail */}
                      {session.property.thumbnail && (
                        <div className="relative h-24 rounded-lg overflow-hidden mb-3">
                          <img src={session.property.thumbnail} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2">
                            <div className={`p-1.5 rounded-lg bg-white/90 dark:bg-black/50 ${serviceConfig.color}`}>
                              <ServiceIcon className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-purple-500">{session.property.code}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[session.status]?.bg} ${statusConfig[session.status]?.color}`}>
                            {serviceConfig.label}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-sm text-neutral-900 dark:text-white line-clamp-1">
                          {session.property.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <RiCalendarLine className="w-3 h-3" />
                          <span>{formatDate(session.scheduledDate)}</span>
                          <RiTimeLine className="w-3 h-3 ml-2" />
                          <span>{session.scheduledTime}</span>
                        </div>
                        
                        {/* Confirmações */}
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 text-xs ${session.brokerConfirmed ? "text-green-500" : "text-neutral-400"}`}>
                            <RiCheckLine className="w-3 h-3" />
                            <span>Corretor</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${session.ownerConfirmed ? "text-green-500" : "text-neutral-400"}`}>
                            <RiCheckLine className="w-3 h-3" />
                            <span>Proprietário</span>
                          </div>
                        </div>
                        
                        {/* Fotógrafo */}
                        {session.photographer && (
                          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                              <RiUserLine className="w-3 h-3 text-purple-500" />
                            </div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">{session.photographer.name}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                
                {getSessionsByStatus(column.status).length === 0 && (
                  <div className="text-center py-8 text-neutral-400 text-sm">
                    Nenhum item
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendário */
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <RiArrowLeftSLine className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold">
                {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <RiArrowRightSLine className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="text-center py-12 text-neutral-500">
            Visualização de calendário em desenvolvimento...
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm font-mono text-purple-500">{selectedSession.property.code}</span>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{selectedSession.property.title}</h3>
                </div>
                <button onClick={() => setSelectedSession(null)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Status atual */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig[selectedSession.status]?.bg} ${statusConfig[selectedSession.status]?.color} mb-4`}>
                <span className="font-medium">{statusConfig[selectedSession.status]?.label}</span>
              </div>

              {/* Informações */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <RiCalendarLine className="w-5 h-5 text-neutral-400" />
                  <span>{new Date(selectedSession.scheduledDate).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiTimeLine className="w-5 h-5 text-neutral-400" />
                  <span>{selectedSession.scheduledTime} ({selectedSession.estimatedDuration} min)</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiMapPinLine className="w-5 h-5 text-neutral-400" />
                  <span>{selectedSession.property.address}, {selectedSession.property.number} - {selectedSession.property.neighborhood}</span>
                </div>
                {selectedSession.contactName && (
                  <div className="flex items-center gap-3">
                    <RiUserLine className="w-5 h-5 text-neutral-400" />
                    <span>Contato: {selectedSession.contactName}</span>
                  </div>
                )}
                {/* Tipos de serviço */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedSession.serviceTypes?.map((type: string) => {
                    const config = serviceTypeConfig[type];
                    const Icon = config?.icon || RiCameraLine;
                    return (
                      <span key={type} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${config?.color || "text-neutral-500"} bg-neutral-100 dark:bg-neutral-800`}>
                        <Icon className="w-3 h-3" />
                        {config?.label || type}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Ações de Status */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <h4 className="text-sm font-medium mb-3">Alterar Status</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateSessionStatus(selectedSession.id, status)}
                      disabled={selectedSession.status === status}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedSession.status === status
                          ? `${config.bg} ${config.color} ring-2 ring-offset-2 ring-current`
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload de Mídia (para status EM_PRODUCAO ou EDICAO) */}
              {(selectedSession.status === "EM_PRODUCAO" || selectedSession.status === "EDICAO") && (
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-3">Mídia</h4>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/agendamentos/fotos/${selectedSession.id}/upload`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600"
                    >
                      <RiUploadCloud2Line className="w-4 h-4" />
                      Upload
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <RiDownloadLine className="w-4 h-4" />
                      Download ({selectedSession._count?.media || 0})
                    </button>
                  </div>
                </div>
              )}

              {/* Enviar para Imóvel (quando CONCLUIDO ou tem mídia) */}
              {(selectedSession.status === "CONCLUIDO" || selectedSession.status === "EDICAO") && (selectedSession._count?.media || 0) > 0 && (
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-3">Galeria do Imóvel</h4>
                  <p className="text-xs text-neutral-500 mb-3">
                    Envie as fotos aprovadas para a aba Mídia do imóvel
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/admin/photo-sessions/transfer-to-property", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ sessionId: selectedSession.id }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          alert(`✅ ${data.transferred.fotos} foto(s) e ${data.transferred.videos} vídeo(s) enviados para o imóvel!`);
                          setSelectedSession(null);
                        } else {
                          const error = await res.json();
                          alert(`Erro: ${error.error}`);
                        }
                      } catch (e) {
                        console.error(e);
                        alert("Erro ao transferir mídias");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    <RiImage2Line className="w-4 h-4" />
                    Enviar para Galeria do Imóvel
                  </button>
                </div>
              )}

              {/* Botão Excluir */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
                <button
                  onClick={() => deleteSession(selectedSession.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                  Excluir Agendamento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Agendamento */}
      <AnimatePresence>
        {showNewModal && (
          <NewSessionModal
            properties={properties}
            photographers={photographers}
            onClose={() => setShowNewModal(false)}
            onSuccess={() => {
              setShowNewModal(false);
              loadSessions();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewSessionModal({ properties, photographers, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    propertyId: "",
    serviceTypes: ["FOTO"] as string[],
    scheduledDate: "",
    scheduledTime: "09:00",
    estimatedDuration: 60,
    photographerIds: [] as string[],
    contactName: "",
    contactPhone: "",
    isOccupied: false,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [searchProperty, setSearchProperty] = useState("");
  const [existingWarning, setExistingWarning] = useState<any>(null);

  const filteredProperties = properties.filter((p: any) =>
    p.code.toLowerCase().includes(searchProperty.toLowerCase()) ||
    p.title.toLowerCase().includes(searchProperty.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchProperty.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.propertyId || !form.scheduledDate || !form.scheduledTime) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/photo-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hasExistingSession) {
          setExistingWarning(data.existingSession);
        } else {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Novo Agendamento de Produção</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {existingWarning && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-amber-700 dark:text-amber-400 text-sm">
              ⚠️ Este imóvel já possui um agendamento em <strong>{existingWarning.status}</strong>. O novo agendamento foi criado mesmo assim.
            </p>
            <button onClick={onSuccess} className="mt-2 text-sm text-amber-600 underline">
              Fechar
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Buscar Imóvel */}
          <div>
            <label className="block text-sm font-medium mb-2">Imóvel *</label>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchProperty}
                onChange={e => setSearchProperty(e.target.value)}
                placeholder="Buscar por código, título ou endereço..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            {searchProperty && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-xl">
                {filteredProperties.slice(0, 5).map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setForm({ ...form, propertyId: p.id });
                      setSearchProperty(`${p.code} - ${p.title}`);
                    }}
                    className={`w-full text-left p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800 last:border-0 ${form.propertyId === p.id ? "bg-purple-50 dark:bg-purple-500/10" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {p.thumbnail && (
                        <img src={p.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <span className="text-xs font-mono text-purple-500">{p.code}</span>
                        <p className="text-sm font-medium line-clamp-1">{p.title}</p>
                        <p className="text-xs text-neutral-500">{p.neighborhood}, {p.city}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tipos de Serviço (múltipla seleção) */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipos de Produção (selecione um ou mais)</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(serviceTypeConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = form.serviceTypes.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => {
                      const newTypes = isSelected
                        ? form.serviceTypes.filter(t => t !== key)
                        : [...form.serviceTypes, key];
                      setForm({ ...form, serviceTypes: newTypes.length > 0 ? newTypes : ["FOTO"] });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm">{config.label}</span>
                    {isSelected && <RiCheckLine className="w-4 h-4 text-purple-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data *</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Horário *</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
          </div>

          {/* Fotógrafos (múltipla seleção) */}
          <div>
            <label className="block text-sm font-medium mb-2">Fotógrafo(s)</label>
            <div className="flex flex-wrap gap-2">
              {photographers.map((p: any) => {
                const isSelected = form.photographerIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      const newIds = isSelected
                        ? form.photographerIds.filter(id => id !== p.id)
                        : [...form.photographerIds, p.id];
                      setForm({ ...form, photographerIds: newIds });
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {p.avatar ? (
                      <img src={p.avatar} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <RiUserLine className="w-3 h-3" />
                      </div>
                    )}
                    <span className="text-sm">{p.name}</span>
                    {isSelected && <RiCheckLine className="w-4 h-4 text-purple-500" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Selecione mais de um para imóveis grandes</p>
          </div>

          {/* Imóvel Habitado */}
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isOccupied}
                onChange={e => setForm({ ...form, isOccupied: e.target.checked })}
                className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-amber-800 dark:text-amber-400">Imóvel Habitado</span>
                <p className="text-xs text-amber-600 dark:text-amber-500">Marque se o imóvel está ocupado/habitado</p>
              </div>
            </label>
          </div>

          {/* Contato */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Contato</label>
              <input
                type="text"
                value={form.contactName}
                onChange={e => setForm({ ...form, contactName: e.target.value })}
                placeholder="Nome do contato no local"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone do Contato</label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Instruções de acesso, observações..."
              rows={3}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.propertyId || !form.scheduledDate}
            className="flex-1 h-11 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiCheckLine className="w-5 h-5" />}
            Agendar
          </button>
          <button
            onClick={onClose}
            className="px-6 h-11 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
