"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,                  
  RiArrowDownSLine,
  RiEditLine,
  RiDeleteBinLine,
  RiShareLine,
  RiWhatsappLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiHome4Line,
  RiRulerLine,
  RiHotelBedLine,
  RiCarLine,
  RiDropLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCalendarLine,
  RiUser3Line,
  RiFileTextLine,
  RiHistoryLine,
  RiSearchLine,
  RiStarLine,
  RiStarFill,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiAddLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiPlayCircleLine,
  RiImage2Line,
  RiFolderOpenLine,
  RiLayoutGridLine,
  RiMoreLine,
  RiPriceTag3Line,
  RiHandHeartLine,
  RiFileList3Line,
  RiBuilding4Line,
  RiAlertLine,
  RiGlobalLine,
  RiToggleLine,
  RiToggleFill,
  RiRouteLine,
  RiVipCrownLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
  RiProgress1Line,
  RiCameraLine,
  RiNotification3Line,
  RiUploadCloud2Line,
  RiFileCopyLine,
  RiShakeHandsLine,
  RiShieldStarLine,
  RiDatabase2Line,
  RiDownloadLine,
  RiPrinterLine,
  RiSendPlaneLine,
  RiLinkM,
  RiBarChartLine,
  RiUserLine,
  RiTeamLine,
  RiFireLine,
} from "react-icons/ri";
import { TaskScheduler } from "@/components/admin/properties/TaskScheduler";
import { PropertyTimeline } from "@/components/admin/properties/PropertyTimeline";
import { ScheduleVisitModal } from "@/components/admin/ScheduleVisitModal";
import { cleanDescription } from "@/lib/cleanDescription";
import { useAuth } from "@/providers/auth-provider";

// Tabs disponíveis - Histórico e Observações primeiro, Documentos no final
const baseTabs = [
  { id: "detalhes", label: "Detalhes", icon: RiHome4Line },
  { id: "historico", label: "Histórico", icon: RiHistoryLine },
  { id: "observacoes", label: "Observações", icon: RiFileList3Line },
  { id: "fotos", label: "Fotos", icon: RiImage2Line },
  { id: "visitas", label: "Visitas", icon: RiCalendarLine },
  { id: "propostas", label: "Propostas", icon: RiHandHeartLine },
  { id: "proprietario", label: "Proprietário", icon: RiUser3Line },
  { id: "leads", label: "Leads", icon: RiTeamLine },
  { id: "documentos", label: "Documentos", icon: RiFileTextLine },
  { id: "timeline", label: "Timeline", icon: RiRouteLine },
];

// Tab de exclusividade (só aparece quando imóvel é exclusivo ou já teve exclusividade)
const exclusivityTab = { id: "exclusividade", label: "Exclusividade", icon: RiVipCrownLine };

// Mock data para demonstração
const mockProperty = {
  id: "1",
  code: "IMB-2023",
  title: "Apartamento no centro de Joinville",
  description: "Excelente apartamento com 3 quartos, sendo 1 suíte, sala ampla, cozinha americana, área de serviço e 2 vagas de garagem. Condomínio com piscina, academia e salão de festas. Localização privilegiada, próximo a supermercados, escolas e transporte público.",
  type: "APARTAMENTO",
  subType: "APARTAMENTO_PADRAO",
  category: "VENDA",
  condition: "USADO",
  status: "DISPONIVEL",
  price: 320000,
  rentPrice: 2500,
  condoFee: 450,
  iptu: 1200,
  iptuPeriod: "ANUAL",
  area: 85,
  usefulArea: 78,
  bedrooms: 3,
  suites: 1,
  bathrooms: 2,
  parkingSpaces: 2,
  floor: 5,
  totalFloors: 12,
  propertyAge: "8 anos",
  address: "Rua das Palmeiras",
  number: "456",
  complement: "Apto 501",
  neighborhood: "Centro",
  city: "Joinville",
  state: "SC",
  zipCode: "89201-000",
  addressVisibility: "COMPLETO",
  amenities: ["Piscina", "Academia", "Salão de Festas", "Portaria 24h", "Elevador"],
  features: ["Ar condicionado", "Varanda", "Cozinha americana"],
  extras: ["Aceita animais", "Aceita FGTS"],
  acceptsFinancing: true,
  acceptsFGTS: true,
  acceptsExchange: false,
  isNegotiable: true,
  isFeatured: true,
  isExclusive: false,
  videoYoutube: "https://youtube.com/watch?v=xxx",
  virtualTour: "",
  thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  images: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800",
  ],
  owner: {
    name: "João Silva",
    email: "joao@email.com",
    phone: "(47) 99999-1234",
    phones: ["(47) 99999-1234", "(47) 3333-1234"],
    profile: "PROPRIETARIO",
    avatar: "",
  },
  documents: {
    matriculaNumber: "123456",
    iptuNumber: "789012",
    certidaoSPU: "",
  },
  visits: [
    { id: "1", date: "2024-12-05", clientName: "Maria Santos", brokerName: "Carlos", rating: 4, feedback: "Cliente gostou muito, vai pensar" },
    { id: "2", date: "2024-12-03", clientName: "Pedro Alves", brokerName: "Ana", rating: 3, feedback: "Achou o preço alto" },
    { id: "3", date: "2024-11-28", clientName: "Lucia Ferreira", brokerName: "Carlos", rating: 5, feedback: "Muito interessada!" },
  ],
  proposals: [
    { id: "1", clientName: "Lucia Ferreira", value: 300000, status: "PENDENTE", date: "2024-11-29", paymentMethod: "Financiamento" },
    { id: "2", clientName: "Roberto Lima", value: 290000, status: "RECUSADA", date: "2024-11-20", paymentMethod: "À vista" },
  ],
  changelog: [
    { id: "1", field: "price", oldValue: "R$ 350.000", newValue: "R$ 320.000", userName: "Admin", date: "2024-11-15" },
    { id: "2", field: "status", oldValue: "RASCUNHO", newValue: "DISPONIVEL", userName: "Admin", date: "2024-11-10" },
  ],
  views: 234,
  createdAt: "2024-10-15",
  updatedAt: "2024-12-05",
};

// Componente TabTimeline - Usa o novo PropertyTimeline com vinculação de corretor
function TabTimeline({ propertyId, currentUser, brokers }: { propertyId: string; currentUser?: any; brokers?: any[] }) {
  return (
    <PropertyTimeline 
      propertyId={propertyId} 
      currentUser={currentUser}
      brokers={brokers}
    />
  );
}

// Componente TabFotos - Gallery + histórico de alterações de fotos
function TabFotos({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/properties/${propertyId}/photo-history`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const images: string[] = data?.currentImages || [];
  const history: any[] = data?.history || [];

  return (
    <div className="space-y-6">
      {/* Galeria atual */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Fotos atuais ({images.length})
          </h3>
        </div>
        {images.length === 0 ? (
          <p className="text-sm text-neutral-500 py-6 text-center">Nenhuma foto cadastrada</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightbox(url)}
                className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-orange-500 transition-colors group"
              >
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <RiImage2Line className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de alterações */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          Histórico de alterações ({history.length})
        </h3>
        {history.length === 0 ? (
          <p className="text-sm text-neutral-500 py-4 text-center">Nenhuma alteração registrada ainda</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{entry.userName}</span>
                    <span className="text-xs text-neutral-500 ml-2">{entry.userRole}</span>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {new Date(entry.date).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                  <span>{entry.oldCount} → {entry.newCount} fotos</span>
                  {entry.added?.length > 0 && (
                    <span className="text-green-600">+{entry.added.length} adicionada{entry.added.length !== 1 ? "s" : ""}</span>
                  )}
                  {entry.removed?.length > 0 && (
                    <span className="text-red-500">-{entry.removed.length} removida{entry.removed.length !== 1 ? "s" : ""}</span>
                  )}
                </div>
                {entry.added?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.added.slice(0, 8).map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="w-10 h-10 rounded object-cover border border-green-300" />
                    ))}
                    {entry.added.length > 8 && (
                      <span className="text-xs text-neutral-500 self-center">+{entry.added.length - 8} mais</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button
            className="absolute top-4 right-4 text-white hover:text-neutral-300"
            onClick={() => setLightbox(null)}
          >
            <RiCloseLine className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}

// Componente para anexar contrato assinado na aba de exclusividade
function ContractSignedSection({ propertyId, exclusivity, onUpdate }: { propertyId: string; exclusivity: any; onUpdate: (data: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contratoUrl = exclusivity?.contratoUrl || null;
  const contratoAssinado = exclusivity?.contratoAssinado || false;
  const dataAssinatura = exclusivity?.dataAssinatura ? new Date(exclusivity.dataAssinatura).toLocaleDateString("pt-BR") : null;

  const updateField = async (field: string, fieldValue: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/exclusivity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, fieldValue }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.exclusivity);
      }
    } catch (e) {
      console.error("Erro ao atualizar:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `exclusivity/${propertyId}`);
      formData.append("skipWatermark", "true");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Erro no upload");
      const { url } = await uploadRes.json();

      // Salvar URL e marcar como assinado
      const res = await fetch(`/api/admin/properties/${propertyId}/exclusivity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "contratoUrl", fieldValue: url }),
      });
      if (res.ok) {
        // Também marcar como assinado com data de hoje
        const res2 = await fetch(`/api/admin/properties/${propertyId}/exclusivity`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "contratoAssinado", fieldValue: true }),
        });
        const res3 = await fetch(`/api/admin/properties/${propertyId}/exclusivity`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ field: "dataAssinatura", fieldValue: new Date().toISOString() }),
        });
        onUpdate({ contratoUrl: url, contratoAssinado: true, dataAssinatura: new Date().toISOString() });
      }
    } catch (e) {
      console.error("Erro ao enviar contrato:", e);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleAssinado = async () => {
    const newValue = !contratoAssinado;
    await updateField("contratoAssinado", newValue);
    if (newValue) {
      await updateField("dataAssinatura", new Date().toISOString());
      onUpdate({ contratoAssinado: true, dataAssinatura: new Date().toISOString() });
    } else {
      await updateField("dataAssinatura", null);
      onUpdate({ contratoAssinado: false, dataAssinatura: null });
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
      <p className="text-xs text-neutral-500 uppercase font-medium">Status do Contrato</p>

      {/* Toggle assinado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contratoAssinado ? "bg-green-100 dark:bg-green-500/20" : "bg-neutral-100 dark:bg-neutral-700"}`}>
            {contratoAssinado ? <RiCheckLine className="w-5 h-5 text-green-600" /> : <RiTimeLine className="w-5 h-5 text-neutral-400" />}
          </div>
          <div>
            <p className="text-sm font-semibold">{contratoAssinado ? "✅ Contrato Assinado" : "⏳ Pendente Assinatura"}</p>
            {dataAssinatura && <p className="text-xs text-neutral-500">Assinado em {dataAssinatura}</p>}
          </div>
        </div>
        <button
          onClick={toggleAssinado}
          disabled={isSaving}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            contratoAssinado
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400"
          }`}
        >
          {isSaving ? "..." : contratoAssinado ? "Desmarcar" : "Marcar como Assinado"}
        </button>
      </div>

      {/* Anexar contrato assinado */}
      <div className={`p-4 rounded-xl border-2 border-dashed transition-colors ${
        contratoUrl
          ? "border-green-300 bg-green-50 dark:bg-green-500/5 dark:border-green-500/30"
          : "border-neutral-300 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-600"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${contratoUrl ? "bg-green-100 dark:bg-green-500/20" : "bg-purple-100 dark:bg-purple-500/20"}`}>
            {contratoUrl ? <RiFileTextLine className="w-5 h-5 text-green-600" /> : <RiUploadCloud2Line className="w-5 h-5 text-purple-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {contratoUrl ? "Contrato Assinado Anexado" : "Anexar Contrato Assinado"}
            </p>
            <p className="text-xs text-neutral-500">
              {contratoUrl ? "PDF ou imagem do contrato com assinatura" : "Envie o PDF ou foto do contrato assinado"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {contratoUrl && (
              <a
                href={contratoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <RiEyeLine className="w-3.5 h-3.5" />
                Ver
              </a>
            )}
            <label className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer flex items-center gap-1 transition-colors ${
              contratoUrl
                ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300"
                : "bg-purple-500 text-white hover:bg-purple-600"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
              {isUploading ? (
                <><RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> Enviando...</>
              ) : (
                <><RiUploadCloud2Line className="w-3.5 h-3.5" /> {contratoUrl ? "Substituir" : "Anexar"}</>
              )}
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente TabExclusividade - Guia de Exclusividades Completo
function TabExclusividade({ propertyId }: { propertyId: string }) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [exclusivity, setExclusivity] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"resumo" | "checklist" | "contrato" | "relatorio">("resumo");
  const [brokers, setBrokers] = useState<{id: string; name: string}[]>([]);

  // Modal de configuração do relatório (período + mídias)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    startDate: "", endDate: "",
    midiaFotosProf: false, midiaVideoProf: false,
    midiaMetaAds: false, midiaGoogleAds: false,
    midiaNowHouse: false, midiaNowHouseDate: "",
    midiaOpenHouse: false, midiaOpenHouseDate: "",
  });
  const [gerandoReport, setGerandoReport] = useState(false);

  const gerarRelatorioComConfig = async () => {
    setGerandoReport(true);
    try {
      // Abrir a aba imediatamente (síncrono dentro do click) para não ser bloqueado pelo popup blocker
      const qs = new URLSearchParams();
      if (reportConfig.startDate) qs.set("startDate", reportConfig.startDate);
      if (reportConfig.endDate) qs.set("endDate", reportConfig.endDate);
      const reportWindow = window.open("", "_blank");

      // Salvar as mídias no exclusivity antes de navegar
      await fetch(`/api/admin/properties/${propertyId}/exclusivity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          midiaFotosProf: reportConfig.midiaFotosProf,
          midiaVideoProf: reportConfig.midiaVideoProf,
          midiaMetaAds: reportConfig.midiaMetaAds,
          midiaGoogleAds: reportConfig.midiaGoogleAds,
          midiaNowHouse: reportConfig.midiaNowHouse,
          midiaNowHouseDate: reportConfig.midiaNowHouse ? (reportConfig.midiaNowHouseDate || null) : null,
          midiaOpenHouse: reportConfig.midiaOpenHouse,
          midiaOpenHouseDate: reportConfig.midiaOpenHouse ? (reportConfig.midiaOpenHouseDate || null) : null,
        }),
      }).catch(() => {});

      // Navegar a aba já aberta para o relatório
      if (reportWindow) {
        reportWindow.location.href = `/api/admin/properties/${propertyId}/exclusivity/report?${qs}`;
      }
      setReportModalOpen(false);
    } finally {
      setGerandoReport(false);
    }
  };
  
  // Buscar corretores
  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const res = await fetch("/api/admin/brokers");
        if (res.ok) {
          const data = await res.json();
          setBrokers(data.brokers || []);
        }
      } catch (error) {
        console.error("Erro ao carregar corretores:", error);
      }
    };
    fetchBrokers();
  }, []);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    captadorName: "",
    gestorName: "",
    comissaoVenda: "",
    comissaoLocacao: "",
    comissaoRepasse: "",
    feedbackStatus: "EM_DIA",
    condicoesEspeciais: "",
    frequenciaRelatorio: "SEMANAL",
    feedbackIntervalDays: "7",
    lastFeedbackDate: "",
    notes: "",
  });

  // Estado de alerta
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isExpiring, setIsExpiring] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const checklistItems = [
    { key: "contrato_assinado", label: "Contrato de Exclusividade Assinado", category: "Documentação", icon: "📄" },
    { key: "prazo_definido", label: "Prazo de Exclusividade Definido", category: "Documentação", icon: "📅" },
    { key: "documentos_imovel", label: "Documentos do Imóvel Verificados", category: "Documentação", icon: "📋" },
    { key: "fotos_profissionais", label: "Sessão de Fotos Profissionais", category: "Marketing", icon: "📸" },
    { key: "video_drone", label: "Vídeo com Drone", category: "Marketing", icon: "🎬" },
    { key: "tour_virtual", label: "Tour Virtual 360°", category: "Marketing", icon: "🔄" },
    { key: "descricao_premium", label: "Descrição Premium Otimizada", category: "Marketing", icon: "✍️" },
    { key: "destaque_site", label: "Destaque no Site", category: "Divulgação", icon: "🌐" },
    { key: "destaque_portais", label: "Destaque nos Portais", category: "Divulgação", icon: "🏠" },
    { key: "redes_sociais", label: "Campanha nas Redes Sociais", category: "Divulgação", icon: "📱" },
    { key: "email_marketing", label: "Disparo de E-mail Marketing", category: "Divulgação", icon: "📧" },
    { key: "placa_exclusiva", label: "Placa de Exclusividade Instalada", category: "Offline", icon: "🪧" },
    { key: "relatorio_configurado", label: "Relatório Periódico Configurado", category: "Gestão", icon: "📊" },
    { key: "feedback_visitas", label: "Feedback de Visitas Compartilhado", category: "Gestão", icon: "💬" },
    { key: "avaliacao_mercado", label: "Avaliação de Mercado Realizada", category: "Gestão", icon: "📈" },
  ];

  useEffect(() => {
    const fetchExclusivity = async () => {
      try {
        const res = await fetch(`/api/admin/properties/${propertyId}/exclusivity`);
        if (res.ok) {
          const data = await res.json();
          setChecklist(data.checklist || {});
          setExclusivity(data.exclusivity);
          setProperty(data.property);
          setProgress(data.progress || 0);
          setDaysRemaining(data.daysRemaining);
          setIsExpiring(data.isExpiring);
          setIsExpired(data.isExpired);
          
          // Auto-preencher captador do criador do imóvel (quem cadastrou = captador)
          const defaultCaptador = data.property?.createdBy?.name || "";

          if (data.exclusivity) {
            setFormData({
              startDate: data.exclusivity.startDate?.split("T")[0] || "",
              endDate: data.exclusivity.endDate?.split("T")[0] || "",
              captadorName: data.exclusivity.captadorName || defaultCaptador,
              gestorName: data.exclusivity.gestorName || "",
              comissaoVenda: data.exclusivity.comissaoVenda?.toString() || "",
              comissaoLocacao: data.exclusivity.comissaoLocacao?.toString() || "",
              comissaoRepasse: data.exclusivity.comissaoRepasse?.toString() || "",
              feedbackStatus: data.exclusivity.feedbackStatus || "EM_DIA",
              condicoesEspeciais: data.exclusivity.condicoesEspeciais || "",
              frequenciaRelatorio: data.exclusivity.frequenciaRelatorio || "SEMANAL",
              feedbackIntervalDays: data.exclusivity.feedbackIntervalDays?.toString() || "7",
              lastFeedbackDate: data.exclusivity.lastFeedbackDate?.split("T")[0] || "",
              notes: data.exclusivity.notes || "",
            });
          } else if (defaultCaptador) {
            // Sem exclusividade ainda — pré-preencher captador do criador do imóvel
            setFormData(prev => ({ ...prev, captadorName: defaultCaptador }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar exclusividade:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExclusivity();
  }, [propertyId]);

  const toggleItem = async (key: string) => {
    const newValue = !checklist[key];
    setChecklist((prev) => ({ ...prev, [key]: newValue }));
    
    try {
      await fetch(`/api/admin/properties/${propertyId}/exclusivity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue }),
      });
      
      const updated = { ...checklist, [key]: newValue };
      const completed = Object.values(updated).filter(Boolean).length;
      setProgress(Math.round((completed / checklistItems.length) * 100));
    } catch (error) {
      console.error("Erro ao atualizar checklist:", error);
    }
  };

  const saveExclusivity = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/admin/properties/${propertyId}/exclusivity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist,
          startDate: formData.startDate,
          endDate: formData.endDate,
          captadorName: formData.captadorName,
          gestorName: formData.gestorName,
          comissaoVenda: formData.comissaoVenda ? parseFloat(formData.comissaoVenda) : null,
          comissaoLocacao: formData.comissaoLocacao ? parseFloat(formData.comissaoLocacao) : null,
          comissaoRepasse: formData.comissaoRepasse ? parseFloat(formData.comissaoRepasse) : null,
          feedbackStatus: formData.feedbackStatus,
          condicoesEspeciais: formData.condicoesEspeciais,
          frequenciaRelatorio: formData.frequenciaRelatorio,
          feedbackIntervalDays: formData.feedbackIntervalDays ? parseInt(formData.feedbackIntervalDays) : 7,
          lastFeedbackDate: formData.lastFeedbackDate || null,
          notes: formData.notes,
        }),
      });
    } catch (error) {
      console.error("Erro ao salvar exclusividade:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RiLoader4Line className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const categories = [...new Set(checklistItems.map((item) => item.category))];

  return (
    <div className="space-y-6">
      {/* Alerta de Vencimento */}
      {(isExpiring || isExpired) && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          isExpired 
            ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30" 
            : "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isExpired ? "bg-red-500" : "bg-amber-500"
          }`}>
            <RiAlertLine className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${isExpired ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
              {isExpired ? "⚠️ Exclusividade Vencida!" : "⏰ Exclusividade Próxima do Vencimento"}
            </p>
            <p className={`text-sm ${isExpired ? "text-red-600 dark:text-red-300" : "text-amber-600 dark:text-amber-300"}`}>
              {isExpired 
                ? `Venceu há ${Math.abs(daysRemaining || 0)} dias. Renovar ou encerrar.`
                : `Faltam ${daysRemaining} dias para o término.`
              }
            </p>
          </div>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
            isExpired 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}>
            {isExpired ? "Renovar" : "Estender"}
          </button>
        </div>
      )}

      {/* Header com Progresso e Navegação */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <RiVipCrownLine className="w-8 h-8" />
          <div className="flex-1">
            <h3 className="text-lg font-bold">Guia de Exclusividade</h3>
            <p className="text-sm text-white/70">
              {property?.code} • {daysRemaining !== null && daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Prazo não definido"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold">{progress}%</span>
            <p className="text-xs text-white/70">Onboarding</p>
          </div>
        </div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Navegação por Seções */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "resumo", label: "Quadro Resumo", icon: RiLayoutGridLine },
          { id: "checklist", label: "Onboarding", icon: RiCheckboxCircleLine },
          { id: "contrato", label: "Contrato", icon: RiFileTextLine },
          { id: "relatorio", label: "Relatório", icon: RiFileList3Line },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === section.id
                ? "bg-purple-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Seção: Quadro Resumo */}
      {activeSection === "resumo" && (
        <div className="space-y-4">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <p className="text-xs text-neutral-500 mb-1">Captador</p>
              <select
                value={formData.captadorName}
                onChange={(e) => {
                  setFormData({ ...formData, captadorName: e.target.value });
                  setTimeout(saveExclusivity, 100);
                }}
                className="w-full text-sm font-semibold bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
              >
                <option value="">Selecionar corretor</option>
                {brokers.map((broker) => (
                  <option key={broker.id} value={broker.name}>{broker.name}</option>
                ))}
              </select>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <p className="text-xs text-neutral-500 mb-1">Gestor</p>
              <select
                value={formData.gestorName}
                onChange={(e) => {
                  setFormData({ ...formData, gestorName: e.target.value });
                  setTimeout(saveExclusivity, 100);
                }}
                className="w-full text-sm font-semibold bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
              >
                <option value="">Selecionar corretor</option>
                {brokers.map((broker) => (
                  <option key={broker.id} value={broker.name}>{broker.name}</option>
                ))}
              </select>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <p className="text-xs text-neutral-500 mb-1">Início</p>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                onBlur={saveExclusivity}
                className="w-full text-sm font-semibold bg-transparent border-none p-0 focus:ring-0"
              />
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <p className="text-xs text-neutral-500 mb-1">Término</p>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                onBlur={saveExclusivity}
                className="w-full text-sm font-semibold bg-transparent border-none p-0 focus:ring-0"
              />
            </div>
          </div>

          {/* Proprietário */}
          {property?.propertyOwner && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <p className="text-xs text-neutral-500 uppercase mb-3">Proprietário</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                  <RiUser3Line className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 dark:text-white">{property.propertyOwner.name}</p>
                </div>
                {property.propertyOwner.phones?.[0] && (
                  <a href={`tel:${property.propertyOwner.phones[0]}`} className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                    onClick={() => fetch("/api/admin/owner-contact-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId: property.id, ownerId: property.propertyOwner?.id, contactType: "PHONE", phoneNumber: property.propertyOwner?.phones?.[0] }) }).catch(() => {})}
                  >
                    <RiPhoneLine className="w-5 h-5" />
                  </a>
                )}
              </div>
              <button
                onClick={() => setReportModalOpen(true)}
                className="mt-3 w-full py-2 px-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                <RiFileList3Line className="w-4 h-4" />
                Gerar Relatório para Proprietário
              </button>
            </div>
          )}

          {/* Condições Comerciais */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <p className="text-xs text-neutral-500 uppercase mb-3">Condições Comerciais</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Comissão Venda (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.comissaoVenda}
                  onChange={(e) => setFormData({ ...formData, comissaoVenda: e.target.value })}
                  onBlur={saveExclusivity}
                  placeholder="6"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Comissão Locação (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.comissaoLocacao}
                  onChange={(e) => setFormData({ ...formData, comissaoLocacao: e.target.value })}
                  onBlur={saveExclusivity}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Repasse a Parceiros (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.comissaoRepasse || ""}
                  onChange={(e) => setFormData({ ...formData, comissaoRepasse: e.target.value })}
                  onBlur={saveExclusivity}
                  placeholder="50"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                />
                <p className="text-[10px] text-neutral-400 mt-1">% repassado para parceiros</p>
              </div>
            </div>
            
            {/* Status de Feedback ao Vendedor */}
            <div className="mt-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Status Feedback ao Vendedor</label>
                  <div className="flex items-center gap-2 mt-1">
                    {formData.feedbackStatus === "EM_DIA" ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Em Dia
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Atrasado
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...formData, feedbackStatus: "EM_DIA" }); saveExclusivity(); }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      formData.feedbackStatus === "EM_DIA" 
                        ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-500/20" 
                        : "border-neutral-200 dark:border-neutral-700 hover:border-green-300"
                    }`}
                  >
                    ✓ Em Dia
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormData({ ...formData, feedbackStatus: "ATRASADO" }); saveExclusivity(); }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      formData.feedbackStatus === "ATRASADO" 
                        ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/20" 
                        : "border-neutral-200 dark:border-neutral-700 hover:border-red-300"
                    }`}
                  >
                    ⚠ Atrasado
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-neutral-500 mb-1">Condições Especiais</label>
              <textarea
                value={formData.condicoesEspeciais}
                onChange={(e) => setFormData({ ...formData, condicoesEspeciais: e.target.value })}
                onBlur={saveExclusivity}
                placeholder="Condições especiais acordadas com o proprietário..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm min-h-[80px]"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <label className="block text-xs text-neutral-500 uppercase mb-2">Notas da Exclusividade</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              onBlur={saveExclusivity}
              placeholder="Anotações sobre a gestão exclusiva deste imóvel..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm min-h-[100px]"
            />
          </div>
        </div>
      )}

      {/* Seção: Checklist Onboarding */}
      {activeSection === "checklist" && (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                <h4 className="font-medium text-neutral-900 dark:text-white">{category}</h4>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {checklistItems
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleItem(item.key)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <span className="text-lg">{item.icon}</span>
                      {checklist[item.key] ? (
                        <RiCheckboxCircleLine className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <RiCheckboxBlankCircleLine className="w-5 h-5 text-neutral-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm flex-1 text-left ${checklist[item.key] ? "text-green-600 line-through" : "text-neutral-700 dark:text-neutral-300"}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seção: Contrato */}
      {activeSection === "contrato" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <RiFileTextLine className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gerar Contrato de Exclusividade</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Gere automaticamente um contrato de exclusividade com os dados do proprietário e condições acordadas.
            </p>
            <button
              onClick={() => window.open(`/api/admin/properties/${propertyId}/exclusivity/contract`, "_blank")}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
            >
              <RiFileTextLine className="w-5 h-5" />
              Gerar Contrato PDF
            </button>
            
            {exclusivity?.contratoGerado && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-500/10 rounded-lg inline-flex items-center gap-2">
                <RiCheckLine className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">Contrato gerado em {new Date(exclusivity.updatedAt).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </div>

          {/* Status do Contrato + Anexar Contrato Assinado */}
          <ContractSignedSection propertyId={propertyId} exclusivity={exclusivity} onUpdate={(data: any) => setExclusivity((prev: any) => ({ ...prev, ...data }))} />
        </div>
      )}

      {/* Seção: Relatório */}
      {activeSection === "relatorio" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <p className="text-xs text-neutral-500 uppercase mb-3">Frequência do Relatório</p>
            <div className="flex gap-2">
              {["SEMANAL", "QUINZENAL", "MENSAL"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => {
                    setFormData({ ...formData, frequenciaRelatorio: freq });
                    saveExclusivity();
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    formData.frequenciaRelatorio === freq
                      ? "bg-purple-500 text-white"
                      : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {freq.charAt(0) + freq.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Lembrete de Feedback ao Vendedor */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-orange-200 dark:border-orange-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <RiNotification3Line className="w-5 h-5 text-orange-500" />
              <p className="text-xs text-neutral-500 uppercase font-medium">Lembrete de Feedback ao Vendedor</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Intervalo (dias)</label>
                <select
                  value={formData.feedbackIntervalDays}
                  onChange={(e) => {
                    setFormData({ ...formData, feedbackIntervalDays: e.target.value });
                    saveExclusivity();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                >
                  <option value="3">A cada 3 dias</option>
                  <option value="5">A cada 5 dias</option>
                  <option value="7">A cada 7 dias</option>
                  <option value="10">A cada 10 dias</option>
                  <option value="14">A cada 14 dias</option>
                  <option value="30">A cada 30 dias</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Último Feedback</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.lastFeedbackDate}
                    onChange={(e) => setFormData({ ...formData, lastFeedbackDate: e.target.value })}
                    onBlur={saveExclusivity}
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                  />
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      setFormData({ ...formData, lastFeedbackDate: today });
                      saveExclusivity();
                    }}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                    title="Marcar como enviado hoje"
                  >
                    Hoje
                  </button>
                </div>
              </div>
            </div>
            {formData.lastFeedbackDate && (
              <p className="text-xs text-neutral-500 mt-2">
                ⏰ Próximo lembrete em: {(() => {
                  const lastDate = new Date(formData.lastFeedbackDate);
                  const interval = parseInt(formData.feedbackIntervalDays) || 7;
                  const nextDate = new Date(lastDate.getTime() + interval * 24 * 60 * 60 * 1000);
                  const today = new Date();
                  const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  if (daysUntil <= 0) return <span className="text-orange-600 font-semibold">Pendente! ({Math.abs(daysUntil)} dias atrasado)</span>;
                  return `${daysUntil} dia${daysUntil > 1 ? "s" : ""} (${nextDate.toLocaleDateString("pt-BR")})`;
                })()}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <RiFileList3Line className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gerar Relatório para Proprietário</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Gere um relatório bonito com estatísticas de visitas, propostas e ações realizadas para enviar ao proprietário.
            </p>
            <button
              onClick={() => setReportModalOpen(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <RiFileList3Line className="w-5 h-5" />
              Gerar Relatório PDF
            </button>
            
            {exclusivity?.ultimoRelatorio && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg inline-flex items-center gap-2">
                <RiCheckLine className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-400">Último relatório: {new Date(exclusivity.ultimoRelatorio).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador de salvamento */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg flex items-center gap-2">
          <RiLoader4Line className="w-4 h-4 animate-spin" />
          Salvando...
        </div>
      )}

      {/* Modal de configuração do relatório */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !gerandoReport && setReportModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white">Gerar relatório para proprietário</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Selecione o período e as mídias de exposição</p>
              </div>
              <button onClick={() => setReportModalOpen(false)} disabled={gerandoReport} className="text-neutral-400 hover:text-neutral-700">
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Período */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Período do relatório</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">De</label>
                    <input type="date" value={reportConfig.startDate} onChange={(e) => setReportConfig((c) => ({ ...c, startDate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Até</label>
                    <input type="date" value={reportConfig.endDate} onChange={(e) => setReportConfig((c) => ({ ...c, endDate: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm" />
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Deixe em branco para incluir todos os registros. Filtra visitas e propostas.</p>
              </div>

              {/* Mídias */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Mídias de exposição</p>
                <div className="space-y-2">
                  {[
                    { key: "midiaFotosProf", label: "Fotos profissionais" },
                    { key: "midiaVideoProf", label: "Vídeo profissional" },
                    { key: "midiaMetaAds", label: "Meta Ads (Facebook/Instagram)" },
                    { key: "midiaGoogleAds", label: "Google Ads" },
                  ].map((m) => (
                    <label key={m.key} className="flex items-center gap-3 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                      <input type="checkbox" checked={(reportConfig as any)[m.key]} onChange={(e) => setReportConfig((c) => ({ ...c, [m.key]: e.target.checked }))} className="w-4 h-4" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{m.label}</span>
                    </label>
                  ))}
                  {/* Now House */}
                  <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={reportConfig.midiaNowHouse} onChange={(e) => setReportConfig((c) => ({ ...c, midiaNowHouse: e.target.checked }))} className="w-4 h-4" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 flex-1">Now House</span>
                    </label>
                    {reportConfig.midiaNowHouse && (
                      <input type="date" value={reportConfig.midiaNowHouseDate} onChange={(e) => setReportConfig((c) => ({ ...c, midiaNowHouseDate: e.target.value }))}
                        className="mt-2 w-full h-9 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm" />
                    )}
                  </div>
                  {/* Open House */}
                  <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={reportConfig.midiaOpenHouse} onChange={(e) => setReportConfig((c) => ({ ...c, midiaOpenHouse: e.target.checked }))} className="w-4 h-4" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 flex-1">Open House</span>
                    </label>
                    {reportConfig.midiaOpenHouse && (
                      <input type="date" value={reportConfig.midiaOpenHouseDate} onChange={(e) => setReportConfig((c) => ({ ...c, midiaOpenHouseDate: e.target.value }))}
                        className="mt-2 w-full h-9 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
              <button onClick={() => setReportModalOpen(false)} disabled={gerandoReport}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Cancelar
              </button>
              <button onClick={gerarRelatorioComConfig} disabled={gerandoReport}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                {gerandoReport ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiFileList3Line className="w-4 h-4" />}
                Gerar relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini componente de observações para a sidebar
function MiniObservacoes({ propertyId, brokerNotes, createdAt, onViewAll }: { propertyId: string; brokerNotes?: string; createdAt?: string; onViewAll: () => void }) {
  const [observations, setObservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const res = await fetch(`/api/admin/properties/${propertyId}/observations`);
        if (res.ok) {
          const data = await res.json();
          setObservations(data.observations || []);
        }
      } catch (error) {
        console.error("Erro ao carregar observações:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchObservations();
  }, [propertyId]);

  const pinnedObs = observations.filter(obs => obs.isPinned);
  const recentObs = observations.filter(obs => !obs.isPinned).slice(0, 2);
  const displayObs = [...pinnedObs.slice(0, 1), ...recentObs].slice(0, 3);
  const totalCount = observations.length;

  if (isLoading) {
    return (
      <div>
        <p className="text-xs text-neutral-500 uppercase mb-2">Observações</p>
        <div className="flex items-center justify-center py-3">
          <RiLoader4Line className="w-5 h-5 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-neutral-500 uppercase">Observações</p>
        <button 
          onClick={onViewAll}
          className="text-xs text-orange-500 font-medium hover:underline"
        >
          Ver todas ({totalCount})
        </button>
      </div>

      {displayObs.length === 0 ? (
        <p className="text-sm text-neutral-400 italic">Nenhuma observação</p>
      ) : (
        <div className="space-y-2">
          {/* Observações do sistema */}
          {displayObs.map((obs: any, idx: number) => {
            const isLatest = !obs.isPinned && idx === (pinnedObs.length > 0 ? 1 : 0);
            return (
              <div 
                key={obs.id} 
                className={`p-2.5 rounded-lg ${obs.isPinned ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30" : isLatest ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30" : "bg-neutral-50 dark:bg-neutral-800"}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {obs.isPinned && <span className="text-xs">📌</span>}
                  {isLatest && !obs.isPinned && <span className="text-xs">🆕</span>}
                  <span className="text-xs text-neutral-400 truncate">
                    {obs.userName || obs.user?.name || "Corretor"} • {new Date(obs.createdAt || obs.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <p className={`text-sm line-clamp-2 ${obs.isPinned ? "text-red-700 dark:text-red-400 font-medium" : isLatest ? "text-orange-700 dark:text-orange-400 font-medium" : "text-neutral-600 dark:text-neutral-400"}`}>
                  {obs.content || obs.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("detalhes");
  const [property, setProperty] = useState<any | null>(null);
  const [linkedPartner, setLinkedPartner] = useState<any | null>(null);
  const [exclusivityManager, setExclusivityManager] = useState<any | null>(null);
  const [showExclusivityContacts, setShowExclusivityContacts] = useState(false);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showPhotoScheduleModal, setShowPhotoScheduleModal] = useState(false);
  const [timelineSteps, setTimelineSteps] = useState<any[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Swipe handlers para galeria de fotos
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = (imagesLength: number) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setSelectedImage((prev) => (prev < imagesLength - 1 ? prev + 1 : 0));
    }
    if (isRightSwipe) {
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : imagesLength - 1));
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          // Usar dados reais da API
          setProperty(data.property);
          setLinkedPartner(data.linkedPartner || null);
          setExclusivityManager(data.exclusivityManager || null);
        } else {
          console.error("Erro ao carregar imóvel: resposta não ok");
          setProperty(null);
        }
      } catch (error) {
        console.error("Erro ao carregar imóvel:", error);
        setProperty(null);
      }
      setIsLoading(false);
    };
    
    const fetchBrokers = async () => {
      try {
        const res = await fetch("/api/admin/brokers");
        if (res.ok) {
          const data = await res.json();
          setBrokers(data.brokers || []);
        }
      } catch (error) {
        console.error("Erro ao carregar corretores:", error);
      }
    };
    
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`/api/properties/${params.id}/timeline`);
        if (res.ok) {
          const data = await res.json();
          setTimelineSteps(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Erro ao carregar timeline:", error);
      }
    };

    fetchProperty();
    fetchBrokers();
    fetchTimeline();

    // Registrar acesso (fire-and-forget, throttle backend)
    fetch("/api/admin/property-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: params.id }),
    }).catch(() => {});
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-neutral-500 mb-4">Imóvel não encontrado</p>
        <Link href="/admin/imoveis" className="text-orange-500 hover:underline">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DISPONIVEL: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      ATIVO: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      VENDIDO: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      ALUGADO: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      RESERVADO: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      SUSPENSO: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      INDISPONIVEL: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      INATIVO: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400",
    };
    return colors[status] || colors.DISPONIVEL;
  };

  // Calcula o status real baseado em saleStatus e rentalStatus
  const getComputedStatus = () => {
    // Se saleStatus/rentalStatus são null, usar o status legado
    const legacyStatus = property.status;
    const saleStatus = property.saleStatus || (legacyStatus === "VENDIDO" ? "VENDIDO" : legacyStatus === "SUSPENSO" ? "SUSPENSO" : (legacyStatus === "INATIVO" || legacyStatus === "INDISPONIVEL") ? "INATIVO" : "ATIVO");
    const rentalStatus = property.rentalStatus || (legacyStatus === "ALUGADO" ? "ALUGADO" : legacyStatus === "SUSPENSO" ? "SUSPENSO" : (legacyStatus === "INATIVO" || legacyStatus === "INDISPONIVEL") ? "INATIVO" : "ATIVO");
    const category = property.category;

    // Se é VENDA, usa saleStatus (com fallback para status principal)
    if (category === "VENDA") {
      if (saleStatus === "VENDIDO" || legacyStatus === "VENDIDO") return { label: "VENDIDO", status: "VENDIDO" };
      if (saleStatus === "ALUGADO" || rentalStatus === "ALUGADO" || legacyStatus === "ALUGADO") return { label: "ALUGADO", status: "ALUGADO" };
      if (saleStatus === "SUSPENSO") return { label: "SUSPENSO", status: "SUSPENSO" };
      if (saleStatus === "INATIVO") return { label: "INDISPONÍVEL", status: "INDISPONIVEL" };
      return { label: "DISPONÍVEL", status: "DISPONIVEL" };
    }

    // Se é LOCACAO, usa rentalStatus (com fallback para status principal)
    if (category === "LOCACAO") {
      if (rentalStatus === "ALUGADO" || legacyStatus === "ALUGADO") return { label: "ALUGADO", status: "ALUGADO" };
      if (rentalStatus === "VENDIDO" || saleStatus === "VENDIDO" || legacyStatus === "VENDIDO") return { label: "VENDIDO", status: "VENDIDO" };
      if (rentalStatus === "SUSPENSO") return { label: "SUSPENSO", status: "SUSPENSO" };
      if (rentalStatus === "INATIVO") return { label: "INDISPONÍVEL", status: "INDISPONIVEL" };
      return { label: "DISPONÍVEL", status: "DISPONIVEL" };
    }

    // Se é VENDA_LOCACAO, verifica ambos
    if (category === "VENDA_LOCACAO") {
      // Se ambos estão inativos
      if (saleStatus === "INATIVO" && rentalStatus === "INATIVO") {
        return { label: "INDISPONÍVEL", status: "INDISPONIVEL" };
      }
      // Se vendido e alugado (ambos finalizados)
      if (saleStatus === "VENDIDO" && rentalStatus === "ALUGADO") {
        return { label: "INDISPONÍVEL", status: "INDISPONIVEL" };
      }
      // Se vendido (venda finalizada - prioridade sobre ATIVO)
      if (saleStatus === "VENDIDO") {
        return { label: "VENDIDO", status: "VENDIDO" };
      }
      // Se alugado (locação finalizada - prioridade sobre ATIVO)
      if (rentalStatus === "ALUGADO") {
        return { label: "ALUGADO", status: "ALUGADO" };
      }
      // Se algum está ativo (e nenhum vendido/alugado)
      if (saleStatus === "ATIVO" || rentalStatus === "ATIVO") {
        return { label: "DISPONÍVEL", status: "DISPONIVEL" };
      }
      // Se ambos suspensos
      if (saleStatus === "SUSPENSO" && rentalStatus === "SUSPENSO") {
        return { label: "SUSPENSO", status: "SUSPENSO" };
      }
      // SUSPENSO + INATIVO
      if ((saleStatus === "SUSPENSO" && rentalStatus === "INATIVO") || (saleStatus === "INATIVO" && rentalStatus === "SUSPENSO")) {
        return { label: "SUSPENSO", status: "SUSPENSO" };
      }
      // Fallback
      return { label: "INDISPONÍVEL", status: "INDISPONIVEL" };
    }

    // Fallback para status legado
    return { label: property.status || "DISPONÍVEL", status: property.status || "DISPONIVEL" };
  };

  const computedStatus = getComputedStatus();

  const getProposalStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      EM_NEGOCIACAO: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
      APROVADA: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      RECUSADA: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      ACEITA: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      CONTRA_PROPOSTA: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      DESISTENCIA: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400",
    };
    return colors[status] || colors.PENDENTE;
  };

  const getProposalStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDENTE: "Pendente",
      EM_NEGOCIACAO: "Em Andamento",
      APROVADA: "Aprovada",
      RECUSADA: "Recusada",
      ACEITA: "Aceita",
      CONTRA_PROPOSTA: "Contraproposta",
      DESISTENCIA: "Desist\u00eancia",
    };
    return labels[status] || status;
  };

  // Confirmar disponibilidade do imóvel (atualiza data de última verificação)
  const handleConfirmAvailability = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/confirm-availability`, {
        method: "POST",
      });
      if (res.ok) {
        setProperty((prev: any) => ({
          ...prev,
          lastAvailabilityCheck: new Date().toISOString(),
        }));
        alert("Disponibilidade confirmada!");
      }
    } catch (error) {
      console.error("Erro ao confirmar disponibilidade:", error);
    }
  };

  // Verificar status de fotos para banner
  const activePhotoSession = property.photoSessions?.find((s: any) => s.status !== "CONCLUIDO" && s.status !== "CANCELADO");
  const photoStatusConfig: { [key: string]: { bg: string; text: string; icon: string; label: string } } = {
    "AGENDADO": { bg: "bg-violet-500", text: "text-white", icon: "📅", label: "Fotos Agendadas" },
    "PENDENTE_CONFIRMACAO": { bg: "bg-amber-500", text: "text-white", icon: "⏳", label: "Aguardando Confirmação" },
    "CONFIRMADO": { bg: "bg-blue-500", text: "text-white", icon: "✅", label: "Fotos Confirmadas" },
    "EM_PRODUCAO": { bg: "bg-pink-500", text: "text-white", icon: "📸", label: "Sessão em Andamento" },
    "EM_EDICAO": { bg: "bg-orange-500", text: "text-white", icon: "🎬", label: "Fotos em Edição" },
    "EDICAO": { bg: "bg-orange-500", text: "text-white", icon: "🎬", label: "Fotos em Edição" },
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Banner de Status de Fotos - Aparece no topo quando há sessão ativa */}
      {activePhotoSession && (
        <Link 
          href="/admin/agendamentos/fotos"
          className={`flex items-center justify-between gap-3 px-4 py-3 mb-3 rounded-xl ${photoStatusConfig[activePhotoSession.status]?.bg || "bg-purple-500"} ${photoStatusConfig[activePhotoSession.status]?.text || "text-white"} shadow-lg`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{photoStatusConfig[activePhotoSession.status]?.icon || "📷"}</span>
            <div>
              <p className="font-bold text-sm">{photoStatusConfig[activePhotoSession.status]?.label || "Produção de Fotos"}</p>
              <p className="text-xs opacity-90">
                {activePhotoSession.scheduledDate 
                  ? `Agendado: ${new Date(activePhotoSession.scheduledDate).toLocaleDateString("pt-BR")} às ${activePhotoSession.scheduledTime || "—"}`
                  : "Clique para ver detalhes"}
              </p>
            </div>
          </div>
          <RiArrowRightSLine className="w-5 h-5 opacity-80" />
        </Link>
      )}

      {/* Header Mobile First */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/admin/imoveis" className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex-shrink-0">
            <RiArrowLeftLine className="w-4 h-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <a 
              href={`/imovel/${property.slug || property.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h1 className="text-sm font-bold text-neutral-900 dark:text-white truncate hover:text-[#0B2545] dark:hover:text-blue-400 transition-colors">
                {property.condominium?.name || property.title}
              </h1>
              <p className="text-[10px] text-neutral-500 truncate">
                {property.condominium?.name ? `${property.title} · ` : ""}{property.neighborhood}, {property.city}
              </p>
            </a>
          </div>
        </div>

        {/* Ações compactas */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Botão Copiar Link do Site (Ver no Site desabilitado para não poluir analytics) */}
          {property.showOnWebsite && !["INATIVO", "SUSPENSO"].includes(property.status) && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/imovel/${property.slug || property.id}`;
                navigator.clipboard.writeText(url);
                const btn = document.getElementById('copy-link-btn');
                if (btn) { btn.title = 'Link copiado!'; setTimeout(() => { btn.title = 'Copiar link do site'; }, 2000); }
              }}
              id="copy-link-btn"
              className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              title="Copiar link do site"
            >
              <RiFileCopyLine className="w-3.5 h-3.5" />
            </button>
          )}
          <Link href={`/admin/imoveis/novo?id=${property.id}`} className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <RiEditLine className="w-3.5 h-3.5" />
          </Link>
          <button 
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-orange-500 hover:text-orange-500 transition-colors"
            title="Compartilhar imóvel"
            onClick={async () => {
              const slug = property.slug || property.id;
              const shareUrl = `${window.location.origin}/imovel/${slug}`;
              const shareText = `${property.code} - ${property.title}\n${property.address}, ${property.neighborhood} - ${property.city}\n${shareUrl}`;
              
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: `${property.code} - ${property.title}`,
                    text: `${property.address}, ${property.neighborhood} - ${property.city}`,
                    url: shareUrl,
                  });
                } catch (e) {
                  // User cancelled or share failed - fallback to clipboard
                  if ((e as any)?.name !== "AbortError") {
                    await navigator.clipboard.writeText(shareText);
                    alert("Link copiado para a área de transferência!");
                  }
                }
              } else {
                await navigator.clipboard.writeText(shareText);
                alert("Link copiado para a área de transferência!");
              }
            }}
          >
            <RiShareLine className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/admin/storage?folder=fotos/imoveis/${property.code || property.id}`}
            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-500/10 dark:text-amber-400 transition-colors"
            title="Abrir pasta de fotos do imóvel"
          >
            <RiFolderOpenLine className="w-3.5 h-3.5" />
          </Link>
          <button 
            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
            title="Excluir imóvel"
            onClick={async () => {
              if (!confirm(`Tem certeza que deseja excluir o imóvel ${property.code}? Esta ação não pode ser desfeita.`)) return;
              try {
                const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
                if (res.ok) {
                  router.push("/admin/imoveis");
                } else {
                  const data = await res.json().catch(() => ({}));
                  alert(data.error || "Erro ao excluir imóvel");
                }
              } catch (err) {
                alert("Erro ao excluir imóvel");
              }
            }}
          >
            <RiDeleteBinLine className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats Mini + Código + Status */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-mono font-semibold flex-shrink-0">
          {property.code}
        </span>
        <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${getStatusColor(computedStatus.status)}`}>
          {computedStatus.label}
        </span>
        {property.isThirdPartyExclusive && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-semibold flex-shrink-0">
            <RiShieldStarLine className="w-3.5 h-3.5" />
            Gestão Exclusividade
          </span>
        )}
        {property.showOnWebsite === false && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-semibold flex-shrink-0">
            <RiEyeOffLine className="w-3.5 h-3.5" />
            Oculto do Site
          </span>
        )}
        <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-sm flex-shrink-0 cursor-help"
          title="Visualizações do imóvel no site"
        >
          <RiEyeLine className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-700 dark:text-blue-400">{property.views}</span>
        </div>
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg text-sm flex-shrink-0 cursor-help"
          title="Visitas agendadas/realizadas"
        >
          <RiCalendarLine className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-green-700 dark:text-green-400">{property.visits?.length || 0}</span>
        </div>
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-lg text-sm flex-shrink-0 cursor-help"
          title="Propostas recebidas"
        >
          <RiHandHeartLine className="w-4 h-4 text-orange-600" />
          <span className="font-semibold text-orange-700 dark:text-orange-400">{property.proposals?.length || 0}</span>
        </div>
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-sm flex-shrink-0 cursor-help"
          title="Dias desde o cadastro"
        >
          <RiTimeLine className="w-4 h-4 text-purple-600" />
          <span className="font-semibold text-purple-700 dark:text-purple-400">{Math.floor((Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d</span>
        </div>
        {/* Indicador de Produção de Fotos */}
        {property.photoSessions && property.photoSessions.length > 0 ? (
          <Link 
            href="/admin/agendamentos/fotos"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm flex-shrink-0 cursor-pointer transition-colors ${
              property.photoSessions[0].status === "CONCLUIDO" 
                ? "bg-emerald-50 dark:bg-emerald-500/10" 
                : property.photoSessions[0].status === "EM_PRODUCAO" || property.photoSessions[0].status === "EDICAO"
                ? "bg-pink-50 dark:bg-pink-500/10"
                : "bg-violet-50 dark:bg-violet-500/10"
            }`}
            title={`Produção de fotos: ${property.photoSessions[0].status}`}
          >
            <RiImage2Line className={`w-4 h-4 ${
              property.photoSessions[0].status === "CONCLUIDO" 
                ? "text-emerald-600" 
                : property.photoSessions[0].status === "EM_PRODUCAO" || property.photoSessions[0].status === "EDICAO"
                ? "text-pink-600"
                : "text-violet-600"
            }`} />
            <span className={`font-semibold text-xs ${
              property.photoSessions[0].status === "CONCLUIDO" 
                ? "text-emerald-700 dark:text-emerald-400" 
                : property.photoSessions[0].status === "EM_PRODUCAO" || property.photoSessions[0].status === "EDICAO"
                ? "text-pink-700 dark:text-pink-400"
                : "text-violet-700 dark:text-violet-400"
            }`}>
              {property.photoSessions[0].status === "AGENDADO" ? "📅 Fotos Agendadas" :
               property.photoSessions[0].status === "CONFIRMADO" ? "✅ Fotos Confirmadas" :
               property.photoSessions[0].status === "EM_PRODUCAO" ? "📸 Em Produção" :
               property.photoSessions[0].status === "EDICAO" ? "🎬 Em Edição" :
               property.photoSessions[0].status === "CONCLUIDO" ? "✓ Fotos Prontas" : "📷 Fotos"}
            </span>
          </Link>
        ) : (
          <button
            onClick={() => setShowPhotoScheduleModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm flex-shrink-0 cursor-pointer transition-colors bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20"
            title="Agendar sessão de fotos"
          >
            <RiCameraLine className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-xs text-purple-700 dark:text-purple-400">📷 Agendar Fotos</span>
          </button>
        )}
      </div>

      {/* Resumo de Informações Importantes */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        {/* Habitado */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${
            property.isOccupied 
              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" 
              : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
          }`}
          title={property.isOccupied ? "Imóvel está ocupado/habitado" : "Imóvel está desocupado"}
        >
          <span>{property.isOccupied ? "🏠" : "🔑"}</span>
          <span>{property.isOccupied ? "Habitado" : "Desocupado"}</span>
        </div>

        {/* Placa */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${
            property.hasPlate 
              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" 
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
          }`}
          title={property.hasPlate ? "Possui placa no imóvel" : "Sem placa instalada"}
        >
          <span>{property.hasPlate ? "🪧" : "⬜"}</span>
          <span>{property.hasPlate ? "Com Placa" : "Sem Placa"}</span>
        </div>

        {/* Fotos Profissionais */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${
            property.hasProfessionalPhotos 
              ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400" 
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
          }`}
          title={property.hasProfessionalPhotos ? "Fotos profissionais realizadas" : "Sem fotos profissionais"}
        >
          <span>{property.hasProfessionalPhotos ? "📸" : "📷"}</span>
          <span>{property.hasProfessionalPhotos ? "Fotos Pro" : "Sem Fotos Pro"}</span>
        </div>

        {/* Documentação */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${
            property.hasIrregularDocs 
              ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" 
              : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
          }`}
          title={property.hasIrregularDocs ? `Documentação irregular: ${property.irregularDocsNotes || "Ver detalhes"}` : "Documentação regular"}
        >
          <span>{property.hasIrregularDocs ? "⚠️" : "✅"}</span>
          <span>{property.hasIrregularDocs ? "Doc. Irregular" : "Doc. Regular"}</span>
        </div>

        {/* Permuta */}
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 cursor-help ${
            property.acceptsExchange === true 
              ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400" 
              : property.acceptsExchange === false
              ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
              : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
          }`}
          title={
            property.acceptsExchange === true 
              ? `Aceita permuta${property.exchangeTypes?.length ? `: ${property.exchangeTypes.join(", ")}` : ""}${property.exchangeLocations?.length ? ` em ${property.exchangeLocations.join(", ")}` : ""}`
              : property.acceptsExchange === false
              ? "Não aceita permuta"
              : "Permuta não informada"
          }
        >
          <span>{property.acceptsExchange === true ? "🔄" : property.acceptsExchange === false ? "🚫" : "❓"}</span>
          <span>
            {property.acceptsExchange === true 
              ? "Aceita Permuta" 
              : property.acceptsExchange === false 
              ? "Não Permuta" 
              : "Permuta N/I"}
          </span>
        </div>

        {/* Aceita Pet (se for locação) */}
        {(property.category === "LOCACAO" || property.category === "VENDA_LOCACAO") && (
          <div 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${
              property.acceptsPets === true 
                ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" 
                : property.acceptsPets === false
                ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
            }`}
            title={property.acceptsPets === true ? "Aceita pets" : property.acceptsPets === false ? "Não aceita pets" : "Pets não informado"}
          >
            <span>{property.acceptsPets === true ? "🐾" : property.acceptsPets === false ? "🚫" : "❓"}</span>
            <span>
              {property.acceptsPets === true 
                ? "Aceita Pet" 
                : property.acceptsPets === false 
                ? "Não Pet" 
                : "Pet N/I"}
            </span>
          </div>
        )}

        {/* Financiamento */}
        {property.hasFinancingBalance && (
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
            title={`Saldo devedor: ${property.financingBalance ? `R$ ${property.financingBalance.toLocaleString("pt-BR")}` : "Ver detalhes"}${property.financingBank ? ` - ${property.financingBank}` : ""}`}
          >
            <span>💰</span>
            <span>Saldo Devedor</span>
          </div>
        )}
      </div>

      {/* Main Content - Stack no mobile, grid no desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4">
        {/* Gallery */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div 
              className="relative aspect-[4/3] sm:aspect-video cursor-grab active:cursor-grabbing"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={() => onTouchEnd(property.images?.length || 0)}
            >
              <img
                src={property.images?.[selectedImage] || property.thumbnail || '/placeholder.jpg'}
                alt={property.title}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
              {/* Setas de navegação */}
              {(property.images?.length || 0) > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : (property.images?.length || 1) - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <RiArrowLeftSLine className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedImage((prev) => (prev < (property.images?.length || 1) - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <RiArrowRightSLine className="w-5 h-5" />
                  </button>
                </>
              )}
              {/* Contador de fotos */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white rounded text-[10px] font-medium">
                {selectedImage + 1} / {property.images?.length || 0}
              </div>
              <div className="absolute bottom-2 right-2 flex gap-1.5">
                {property.videoYoutube && (
                  <a href={property.videoYoutube} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-black/70 text-white rounded text-[10px]">
                    <RiPlayCircleLine className="w-3 h-3" />
                    Vídeo
                  </a>
                )}
                <button onClick={() => setShowGallery(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-black/70 text-white rounded text-[10px]">
                  <RiImage2Line className="w-3 h-3" />
                  {property.images?.length || 0}
                </button>
              </div>
            </div>
            {(property.images?.length || 0) > 1 && (
              <div className="flex gap-1.5 p-2 overflow-x-auto">
                {(property.images || []).map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 ${
                      selectedImage === idx ? "border-orange-500" : "border-transparent"
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 mt-3">
            <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-700 scrollbar-hide">
              {[...baseTabs, exclusivityTab].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  } ${tab.id === "exclusividade" ? "text-purple-600" : ""}`}>
                  <tab.icon className={`w-3.5 h-3.5 flex-shrink-0 ${tab.id === "exclusividade" && activeTab !== tab.id ? "text-purple-500" : ""}`} />
                  <span>{tab.label}</span>
                  {tab.id === "visitas" && (property.visits?.length || 0) > 0 && (
                    <span className="px-1 py-0.5 text-[9px] bg-green-100 text-green-700 rounded-full">{property.visits?.length || 0}</span>
                  )}
                  {tab.id === "propostas" && (property.proposals?.length || 0) > 0 && (
                    <span className="px-1 py-0.5 text-[9px] bg-orange-100 text-orange-700 rounded-full">{property.proposals?.length || 0}</span>
                  )}
                  {tab.id === "exclusividade" && (
                    <span className="px-1 py-0.5 text-[9px] bg-purple-100 text-purple-700 rounded-full">VIP</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 sm:p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {activeTab === "detalhes" && <TabDetalhes property={property} />}
                  {activeTab === "visitas" && <TabVisitas property={property} />}
                  {activeTab === "propostas" && <TabPropostas property={property} currentUser={user} formatCurrency={formatCurrency} getProposalStatusColor={getProposalStatusColor} getProposalStatusLabel={getProposalStatusLabel} />}
                  {activeTab === "documentos" && <TabDocumentos property={property} />}
                  {activeTab === "proprietario" && <TabProprietario property={property} onConfirmAvailability={handleConfirmAvailability} linkedPartner={linkedPartner} exclusivityManager={exclusivityManager} currentUser={user} />}
                  {activeTab === "leads" && <TabLeads propertyId={property.id} propertyCode={property.code} />}
                  {activeTab === "observacoes" && <TabObservacoes property={property} />}
                  {activeTab === "historico" && <TabHistorico property={property} />}
                  {activeTab === "fotos" && <TabFotos propertyId={property.id} />}
                  {activeTab === "timeline" && <TabTimeline propertyId={property.id} currentUser={user} brokers={brokers} />}
                  {activeTab === "exclusividade" && <TabExclusividade propertyId={property.id} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column - Price & Actions - Mobile: horizontal scroll, Desktop: stack */}
        <div className="space-y-2.5 order-first lg:order-last">
          {/* Price Card */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            {/* Preços */}
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              {(property.category === "VENDA" || property.category === "VENDA_LOCACAO") && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase">Venda</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(property.price)}
                  </p>
                </div>
              )}
              {(property.category === "LOCACAO" || property.category === "VENDA_LOCACAO") && property.rentPrice > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 uppercase">Aluguel</p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(property.rentPrice)}<span className="text-xs font-normal text-neutral-400">/mês</span>
                  </p>
                </div>
              )}
            </div>

            {/* Taxas */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
              <div className="flex gap-1.5">
                <span className="text-neutral-400">Cond.</span>
                <span className="font-medium text-neutral-600 dark:text-neutral-300">{property.condoFee ? formatCurrency(property.condoFee) : "—"}</span>
              </div>
              <div className="flex gap-1.5">
                <span className="text-neutral-400">IPTU</span>
                <span className="font-medium text-neutral-600 dark:text-neutral-300">{property.iptu ? formatCurrency(property.iptu) : "—"}</span>
              </div>
              {property.foro && property.foro > 0 && (
                <div className="flex gap-1.5">
                  <span className="text-neutral-400">Foro</span>
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">{formatCurrency(property.foro)}</span>
                </div>
              )}
            </div>

            {/* Valor Total Mensal - Apenas para imóveis de aluguel */}
            {(property.category === "LOCACAO" || property.category === "VENDA_LOCACAO") && property.rentPrice && (
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase">Valor Total Mensal</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(
                      (property.rentPrice || 0) + 
                      (property.condoFee || 0) + 
                      (property.iptu || 0) + 
                      (property.foro || 0)
                    )}
                    <span className="text-xs font-normal opacity-70">/mês</span>
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 text-right">
                  Aluguel + Condomínio + IPTU{property.foro ? " + Foro" : ""}
                </p>
              </div>
            )}

            {/* Tags de condições */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {property.acceptsExchange && <span className="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded font-medium">✓ Permuta</span>}
            </div>
          </div>

          {/* Corretor Captador */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <p className="text-xs text-neutral-500 uppercase mb-2">Corretor Captador</p>
            {user?.role === "ADMIN" ? (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <RiUser3Line className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <select
                  value={property.ownerId || ""}
                  onChange={async (e) => {
                    const newOwnerId = e.target.value;
                    if (!newOwnerId) return;
                    try {
                      const res = await fetch(`/api/properties/${property.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ownerId: newOwnerId }),
                      });
                      if (res.ok) {
                        const selectedBroker = brokers.find((b: any) => b.id === newOwnerId);
                        setProperty((prev: any) => ({
                          ...prev,
                          ownerId: newOwnerId,
                          owner: selectedBroker ? { ...prev.owner, id: newOwnerId, name: selectedBroker.name } : prev.owner,
                        }));
                      }
                    } catch (err) {
                      console.error("Erro ao alterar captador:", err);
                    }
                  }}
                  className="flex-1 text-sm font-semibold bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">Selecionar corretor</option>
                  {brokers.map((broker: any) => (
                    <option key={broker.id} value={broker.id}>{broker.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <RiUser3Line className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold truncate">{property.owner?.name || "—"}</span>
              </div>
            )}
          </div>

          {/* Gestão de Exclusividade - Só mostra quando isThirdPartyExclusive */}
          {property.isThirdPartyExclusive && (
            <div className="rounded-xl border-2 border-purple-300 dark:border-purple-500/40 p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-500/10 dark:to-fuchsia-500/10">
              <div className="flex items-center gap-2 mb-3">
                <RiShieldStarLine className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Gestão de Exclusividade</span>
              </div>
              {exclusivityManager ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 dark:bg-purple-500/20 ring-2 ring-purple-300">
                      {exclusivityManager.avatar ? (
                        <img src={exclusivityManager.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <RiUser3Line className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <button onClick={() => setShowExclusivityContacts(!showExclusivityContacts)} className="flex-1 min-w-0 text-left group">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-purple-600 transition-colors cursor-pointer">
                        {exclusivityManager.name}
                        <RiArrowDownSLine className={`w-3.5 h-3.5 inline ml-1 transition-transform ${showExclusivityContacts ? "rotate-180" : ""}`} />
                      </p>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                        {exclusivityManager.type === "IMOBILIARIA" ? "Imobiliária" : "Corretor"}
                        {exclusivityManager.creci && ` · CRECI ${exclusivityManager.creci}`}
                      </p>
                    </button>
                    {exclusivityManager.phone && (
                      <a
                        href={`https://wa.me/55${exclusivityManager.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex-shrink-0"
                        title="WhatsApp"
                      >
                        <RiWhatsappLine className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {showExclusivityContacts && (
                    <div className="ml-13 pl-3 border-l-2 border-purple-200 dark:border-purple-500/30 space-y-1 text-xs">
                      {exclusivityManager.phone && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          <RiPhoneLine className="w-3 h-3 inline mr-1" />
                          {exclusivityManager.phone}
                        </p>
                      )}
                      {exclusivityManager.email && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          <RiMailLine className="w-3 h-3 inline mr-1" />
                          <a href={`mailto:${exclusivityManager.email}`} className="hover:text-purple-600">{exclusivityManager.email}</a>
                        </p>
                      )}
                      {exclusivityManager.creci && (
                        <p className="text-neutral-500">CRECI: {exclusivityManager.creci}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-purple-600 dark:text-purple-400">Gestor externo vinculado</p>
              )}
            </div>
          )}

          {/* Proprietário - Só mostra no sidebar quando é gestor de parceria */}
          {property?.propertyOwner && linkedPartner && (
            <div className="rounded-xl border p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border-indigo-200 dark:border-indigo-500/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-neutral-500 uppercase">Proprietário</p>
                <Link href={`/admin/parcerias/${linkedPartner.id}`} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-semibold hover:bg-indigo-200 transition-colors">
                  <RiShakeHandsLine className="w-3 h-3" />
                  Gestor de Parceria
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-300">
                  {linkedPartner.avatar ? (
                    <img src={linkedPartner.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <RiUser3Line className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{property.propertyOwner.name}</p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    {linkedPartner.partnershipFormat === "FIFTY_PADRAO" ? "50/50 Padrão" : linkedPartner.partnershipFormat === "PARCEIRO_PREMIUM" ? "Parceiro Premium" : "Captador"}
                    {linkedPartner.agency && ` • ${linkedPartner.agency.tradeName || linkedPartner.agency.companyName}`}
                  </p>
                </div>
                {property.propertyOwner.phones?.[0] && (
                  <a href={`tel:${property.propertyOwner.phones[0]}`} className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex-shrink-0"
                    onClick={() => fetch("/api/admin/owner-contact-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId: property.id, ownerId: property.propertyOwner?.id, contactType: "PHONE", phoneNumber: property.propertyOwner?.phones?.[0] }) }).catch(() => {})}
                  >
                    <RiPhoneLine className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Datas de Cadastro/Atualização */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-neutral-500 uppercase">Datas</p>
            </div>
            <div className="space-y-2">
              {(() => {
                const cadastroLog = property.changelog?.find((log: any) => log.field?.includes("Importado da planilha - Cadastro"));
                const cadastradoPor = cadastroLog?.userName || property.owner?.name;
                
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Cadastrado</span>
                      <span className="text-[10px] text-neutral-400 ml-auto">
                        {new Date(property.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" })}
                      </span>
                    </div>
                    {cadastradoPor && (
                      <p className="text-[10px] text-neutral-400 ml-4 -mt-1">por {cadastradoPor}</p>
                    )}
                    {(property.updatedAt && property.updatedAt !== property.createdAt) && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Atualizado</span>
                          <span className="text-[10px] text-neutral-400 ml-auto">
                            {new Date(property.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" })}
                          </span>
                        </div>
                        {property.updatedBy?.name && (
                          <p className="text-[10px] text-neutral-400 ml-4 -mt-1">por {property.updatedBy.name}</p>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Mini Observações Recentes */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <MiniObservacoes propertyId={property.id} brokerNotes={property.brokerNotes} createdAt={property.createdAt} onViewAll={() => setActiveTab("observacoes")} />
          </div>

          {/* Toggle Exclusividade */}
          <ExclusivityToggle property={property} onToggle={(isExclusive) => {
            setProperty((prev: any) => ({ ...prev, isExclusive }));
            if (isExclusive) setActiveTab("exclusividade");
          }} />

          {/* Condição Especial Parceiros - Apenas ADMIN */}
          {user?.role === "ADMIN" && (
            <PartnerConditionCard property={property} onUpdate={(data) => {
              setProperty((prev: any) => ({ ...prev, ...data }));
            }} />
          )}

          {/* Status Card */}
          <StatusSelector property={property} />

          {/* Tarefas Agendadas */}
          <TaskScheduler propertyId={property.id} propertyCode={property.code} />

          {/* Variações do Imóvel */}
          <VariationsCard property={property} />

        </div>
      </div>

      {/* Modal Agendar Fotos */}
      <AnimatePresence>
        {showPhotoScheduleModal && (
          <PhotoScheduleModal 
            property={property}
            onClose={() => setShowPhotoScheduleModal(false)}
            onSuccess={() => {
              setShowPhotoScheduleModal(false);
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Tab Components
function TabDetalhes({ property }: { property: any }) {
  return (
    <div className="space-y-5">
      {/* Características principais - Compacto */}
      <div>
        <h4 className="font-semibold mb-2 text-sm">Características</h4>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {/* Esconder quartos/suítes/banheiros/vagas para terrenos */}
          {property.type !== 'TERRENO' && (
            <>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
                <p className="text-lg font-bold text-orange-500">{property.bedrooms || 0}</p>
                <p className="text-[10px] text-neutral-500">Quartos</p>
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
                <p className="text-lg font-bold text-orange-500">{property.suites || 0}</p>
                <p className="text-[10px] text-neutral-500">Suítes</p>
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
                <p className="text-lg font-bold text-orange-500">{property.bathrooms || 0}</p>
                <p className="text-[10px] text-neutral-500">Banheiros</p>
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
                <p className="text-lg font-bold text-orange-500">{property.parkingSpaces || 0}</p>
                <p className="text-[10px] text-neutral-500">Vagas</p>
              </div>
            </>
          )}
          <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
            <p className="text-lg font-bold text-orange-500">{property.area || 0}</p>
            <p className="text-[10px] text-neutral-500">Área (m²)</p>
          </div>
          <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
            <p className="text-lg font-bold text-orange-500">{property.totalArea || property.area || 0}</p>
            <p className="text-[10px] text-neutral-500">Área Total</p>
          </div>
          {property.floor && (
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-500">{property.floor}º</p>
              <p className="text-[10px] text-neutral-500">Andar</p>
            </div>
          )}
          {property.yearBuilt && (
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-500">{property.yearBuilt}</p>
              <p className="text-[10px] text-neutral-500">Ano</p>
            </div>
          )}
          {property.usefulArea && property.usefulArea > 0 && (
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-500">{property.usefulArea}</p>
              <p className="text-[10px] text-neutral-500">Área Útil</p>
            </div>
          )}
          {property.propertyAge && (
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-500">{property.propertyAge}</p>
              <p className="text-[10px] text-neutral-500">Idade</p>
            </div>
          )}
          {property.totalFloors && (
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-500">{property.totalFloors}</p>
              <p className="text-[10px] text-neutral-500">Andares</p>
            </div>
          )}
        </div>
      </div>

      {/* Localização */}
      <div>
        <h4 className="font-semibold mb-2 text-sm">Localização</h4>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-2">
          {/* Condomínio */}
          {property.condominium?.name && (
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🏢</span>
              <span className="text-sm font-medium">{property.condominium.name}</span>
            </div>
          )}
          
          {/* Endereço completo */}
          <div className="flex items-start gap-2">
            <span className="text-orange-500">📍</span>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {property.address && (
                <p>
                  {property.address}
                  {property.number && `, ${property.number}`}
                  {property.complement && ` - ${property.complement}`}
                </p>
              )}
              {(property.neighborhood || property.city) && (
                <p>
                  {property.neighborhood}
                  {property.neighborhood && property.city && " - "}
                  {property.city}
                  {property.state && `/${property.state}`}
                </p>
              )}
              {property.zipCode && (
                <p className="text-xs text-neutral-500">CEP: {property.zipCode}</p>
              )}
            </div>
          </div>

          {/* Torre/Unidade/Andar ou Quadra/Lote para terrenos */}
          {(property.towerName || property.unitNumber) && (
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <span className="text-orange-500">🏠</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {property.type === "TERRENO" || property.condominium?.condoType === "HORIZONTAL" ? (
                  <>
                    {property.towerName && `Quadra ${property.towerName}`}
                    {property.towerName && property.unitNumber && " • "}
                    {property.unitNumber && `Lote ${property.unitNumber}`}
                  </>
                ) : (
                  <>
                    {property.towerName && `Torre ${property.towerName}`}
                    {property.towerName && property.unitNumber && " • "}
                    {property.unitNumber && `Unidade ${property.unitNumber}`}
                    {property.floor && ` • ${property.floor}º andar`}
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Descrição */}
      <div>
        <h4 className="font-semibold mb-2 text-sm">Descrição</h4>
        {property.description ? (
          <div 
            className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm prose prose-sm prose-neutral dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>li]:mb-1"
            dangerouslySetInnerHTML={{ __html: property.description }}
          />
        ) : (
          <p className="text-neutral-500 text-sm">Sem descrição</p>
        )}
      </div>

      {/* Título Marketplace */}
      {property.marketplaceTitle && (
        <div>
          <h4 className="font-semibold mb-2 text-sm">Título para Portais</h4>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
            {property.marketplaceTitle}
          </p>
        </div>
      )}

      {/* Descrição do Condomínio */}
      {property.condoDescription && (
        <div>
          <h4 className="font-semibold mb-2 text-sm">Sobre o Condomínio</h4>
          <div 
            className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm prose prose-sm prose-neutral dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>li]:mb-1"
            dangerouslySetInnerHTML={{ __html: property.condoDescription }}
          />
        </div>
      )}

      {/* Permuta */}
      {property.acceptsExchange && (
        <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-xl">
          <h4 className="font-semibold mb-2 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            🔄 Aceita Permuta
          </h4>
          {property.exchangeDescription && (
            <p className="text-green-700 dark:text-green-400 text-sm">
              {property.exchangeDescription}
            </p>
          )}
          {property.exchangeType && (
            <p className="text-green-600 dark:text-green-500 text-xs mt-2">
              Tipo: {property.exchangeType}
            </p>
          )}
        </div>
      )}

      {/* Opções */}
      <div>
        <h4 className="font-semibold mb-3">Opções</h4>
        <div className="flex flex-wrap gap-2">
          {property.isFeatured && (
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 rounded-lg text-sm font-medium">
              ⭐ Destaque
            </span>
          )}
          {property.isExclusive && (
            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 rounded-lg text-sm font-medium">
              Exclusivo
            </span>
          )}
        </div>
      </div>

      {/* Áreas Comuns */}
      {property.amenities?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Áreas Comuns</h4>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((item: string, idx: number) => (
              <span key={idx} className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Área Privativa */}
      {property.features?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Área Privativa</h4>
          <div className="flex flex-wrap gap-2">
            {property.features.map((item: string, idx: number) => (
              <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Diferenciais */}
      {property.extras?.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Diferenciais</h4>
          <div className="flex flex-wrap gap-2">
            {property.extras.map((item: string, idx: number) => (
              <span key={idx} className="px-3 py-1.5 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 rounded-lg text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mídia - Oculto temporariamente */}
      {/* <div>
        <h4 className="font-semibold mb-3">Mídia</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {property.videoYoutube && (
            <a href={property.videoYoutube} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
              <span className="text-2xl">🎬</span>
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Vídeo YouTube</p>
                <p className="text-xs text-neutral-500">Clique para assistir</p>
              </div>
            </a>
          )}
          {property.virtualTour && (
            <a href={property.virtualTour} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400">Tour Virtual 360°</p>
                <p className="text-xs text-neutral-500">Clique para ver</p>
              </div>
            </a>
          )}
        </div>
      </div> */}
    </div>
  );
}

function TabVisitas({ property }: { property: any }) {
  const [visits, setVisits] = useState<any[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [expandedLeadData, setExpandedLeadData] = useState<any>(null);
  const [loadingLead, setLoadingLead] = useState(false);
  const [feedbackForms, setFeedbackForms] = useState<Record<string, { feedback: string; liked: boolean | null }>>({});
  const [savingFeedback, setSavingFeedback] = useState<string | null>(null);
  const [expandedCorretorId, setExpandedCorretorId] = useState<string | null>(null);
  const [expandedCorretorData, setExpandedCorretorData] = useState<any>(null);
  const [loadingCorretor, setLoadingCorretor] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Buscar visitas agendadas para este imóvel
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await fetch(`/api/admin/scheduled-visits?propertyId=${property.id}&limit=200`);
        if (res.ok) {
          const data = await res.json();
          setVisits(data.visits || []);
          setTotalVisits(data.pagination?.total ?? data.visits?.length ?? 0);
        }
      } catch (error) {
        console.error("Erro ao buscar visitas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [property.id]);

  const reloadVisits = async () => {
    const res = await fetch(`/api/admin/scheduled-visits?propertyId=${property.id}&limit=200`);
    if (res.ok) {
      const data = await res.json();
      setVisits(data.visits || []);
      setTotalVisits(data.total ?? data.visits?.length ?? 0);
    }
  };

  const handleVisitSuccess = async () => {
    await reloadVisits();
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta visita?")) return;
    try {
      const res = await fetch(`/api/admin/scheduled-visits/${visitId}`, { method: "DELETE" });
      if (res.ok) {
        setVisits(prev => prev.filter(v => v.id !== visitId));
      }
    } catch (error) {
      console.error("Erro ao excluir visita:", error);
    }
  };

  const handleUpdateVisitStatus = async (visitId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/scheduled-visits/${visitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: newStatus } : v));
      }
    } catch (error) {
      console.error("Erro ao atualizar status da visita:", error);
    }
  };

  // Iniciar edição de visita
  const startEditVisit = (visit: any) => {
    setEditingVisitId(visit.id);
    setEditForm({
      date: visit.date?.split("T")[0] || "",
      time: visit.time || "",
      endTime: visit.endTime || "",
      notes: visit.notes || "",
      internalNotes: visit.internalNotes || "",
    });
  };

  // Salvar edição de visita
  const handleSaveEdit = async (visitId: string) => {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/scheduled-visits/${visitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        await reloadVisits();
        setEditingVisitId(null);
      }
    } catch (error) {
      console.error("Erro ao salvar visita:", error);
    } finally {
      setSavingEdit(false);
    }
  };

  // Salvar feedback de imóvel específico
  const handleSaveFeedback = async (visitId: string, propertyId: string) => {
    const key = `${visitId}-${propertyId}`;
    const form = feedbackForms[key];
    if (!form) return;
    setSavingFeedback(key);
    try {
      await fetch(`/api/admin/scheduled-visits/${visitId}/property-feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, feedback: form.feedback, liked: form.liked }),
      });
      await reloadVisits();
    } catch (error) {
      console.error("Erro ao salvar feedback:", error);
    } finally {
      setSavingFeedback(null);
    }
  };

  // Expandir ficha do lead
  const handleExpandLead = async (leadId: string) => {
    if (expandedLeadId === leadId) {
      setExpandedLeadId(null);
      setExpandedLeadData(null);
      return;
    }
    setExpandedLeadId(leadId);
    setLoadingLead(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedLeadData(data);
      }
    } catch (error) {
      console.error("Erro ao buscar lead:", error);
    } finally {
      setLoadingLead(false);
    }
  };

  // Expandir ficha do corretor (admin only)
  const handleExpandCorretor = async (corretorId: string) => {
    if (expandedCorretorId === corretorId) {
      setExpandedCorretorId(null);
      setExpandedCorretorData(null);
      return;
    }
    setExpandedCorretorId(corretorId);
    setLoadingCorretor(true);
    try {
      const res = await fetch(`/api/admin/users/${corretorId}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedCorretorData(data.user || data);
      }
    } catch (error) {
      console.error("Erro ao buscar corretor:", error);
    } finally {
      setLoadingCorretor(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AGENDADA: "bg-blue-100 text-blue-700",
      CONFIRMADA: "bg-green-100 text-green-700",
      REALIZADA: "bg-emerald-100 text-emerald-700",
      CANCELADA: "bg-red-100 text-red-700",
      REAGENDADA: "bg-amber-100 text-amber-700",
      NAO_COMPARECEU: "bg-neutral-100 text-neutral-700",
    };
    return colors[status] || "bg-neutral-100 text-neutral-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AGENDADA: "Agendada",
      CONFIRMADA: "Confirmada",
      REALIZADA: "Realizada",
      CANCELADA: "Cancelada",
      REAGENDADA: "Reagendada",
      NAO_COMPARECEU: "Não Compareceu",
    };
    return labels[status] || status;
  };

  // Buscar feedback do imóvel atual nesta visita
  const getPropertyFeedback = (visit: any) => {
    const vp = visit.properties?.find((p: any) => p.property?.id === property.id);
    return vp || null;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Visitas ({totalVisits})</h4>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("list")}
              title="Lista compacta"
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-500" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
            >
              <RiFileList3Line className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              title="Cards detalhados"
              className={`p-1.5 rounded-md transition-colors ${viewMode === "card" ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-500" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
            >
              <RiLayoutGridLine className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            <RiAddLine className="w-4 h-4" />
            Nova Visita
          </button>
        </div>
      </div>

      {/* Modal Nova Visita - Usando ScheduleVisitModal */}
      <ScheduleVisitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleVisitSuccess}
        context="property"
        property={{
          id: property.id,
          code: property.code,
          title: property.title || "",
          address: property.address || "",
          neighborhood: property.neighborhood || "",
          city: property.city || "",
          thumbnail: property.thumbnail || undefined,
        }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RiLoader4Line className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          Nenhuma visita agendada
        </div>
      ) : viewMode === "list" ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-[110px_80px_100px_150px_90px_130px_1fr] gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
            {["Data","Horário","Status","Corretor","Código","Condomínio","Cliente"].map(h => (
              <span key={h} className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {[...visits].sort((a, b) => {
              const da = (a.date?.split("T")[0] || "") + (a.time || "00:00");
              const db = (b.date?.split("T")[0] || "") + (b.time || "00:00");
              return da.localeCompare(db);
            }).map((visit: any) => {
              const clientName = visit.lead?.name || visit.visitorName || "—";
              const codes = visit.properties.map((vp: any) => vp.property?.code).filter(Boolean).join(", ") || property.code;
              const condo = property.condominium?.name || "—";
              const dateStr = visit.date?.split("T")[0] || "";
              const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
              const isToday = dateStr === today;
              const [y,m,d] = dateStr.split("-");
              const dateFmt = dateStr ? `${d}/${m}/${y}` : "—";
              return (
                <div key={visit.id} className={`flex flex-col lg:grid lg:grid-cols-[110px_80px_100px_150px_90px_130px_1fr] lg:items-center gap-1 lg:gap-2 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${visit.status === "CANCELADA" ? "opacity-55" : ""}`}>
                  <div>
                    {isToday && <span className="block text-[10px] font-bold text-blue-500 uppercase leading-none">Hoje</span>}
                    <span className="text-sm text-neutral-900 dark:text-white">{dateFmt}</span>
                  </div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{visit.time || "—"}</span>
                  <span className={`inline-flex w-fit px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(visit.status)}`}>
                    {getStatusLabel(visit.status)}
                  </span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{visit.corretor?.name || "—"}</span>
                  <span className="text-xs font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded w-fit">{codes}</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{condo}</span>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => visit.lead?.id && handleExpandLead(visit.lead.id)}
                      className={`text-sm truncate ${visit.lead ? "text-orange-600 hover:underline cursor-pointer" : "text-neutral-600 dark:text-neutral-400 cursor-default"}`}
                    >
                      {clientName}
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEditVisit(visit)} className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Editar">
                        <RiEditLine className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteVisit(visit.id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Excluir">
                        <RiDeleteBinLine className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* Inline edit row */}
                  {editingVisitId === visit.id && (
                    <div className="col-span-7 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-500/30 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Data</label>
                          <input type="date" value={editForm.date} onChange={e => setEditForm((f: any) => ({...f, date: e.target.value}))}
                            className="w-full h-8 px-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Início</label>
                          <input type="time" value={editForm.time} onChange={e => setEditForm((f: any) => ({...f, time: e.target.value}))}
                            className="w-full h-8 px-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Fim</label>
                          <input type="time" value={editForm.endTime} onChange={e => setEditForm((f: any) => ({...f, endTime: e.target.value}))}
                            className="w-full h-8 px-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                        </div>
                      </div>
                      <input type="text" placeholder="Observações" value={editForm.notes} onChange={e => setEditForm((f: any) => ({...f, notes: e.target.value}))}
                        className="w-full h-8 px-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingVisitId(null)} className="h-7 px-3 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">Cancelar</button>
                        <button onClick={() => handleSaveEdit(visit.id)} disabled={savingEdit}
                          className="h-7 px-3 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">
                          {savingEdit ? "Salvando…" : "Salvar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit: any) => {
            const vpData = getPropertyFeedback(visit);
            const feedbackKey = `${visit.id}-${property.id}`;
            const isEditing = editingVisitId === visit.id;
            return (
            <div key={visit.id} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${visit.lead ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"}`}>
                    <RiUserLine className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    {visit.lead ? (
                      <button
                        onClick={() => handleExpandLead(visit.lead.id)}
                        className="font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                        title="Clique para expandir ficha do cliente"
                      >
                        {visit.lead.name}
                      </button>
                    ) : (
                      <span className="font-medium">
                        {visit.visitorName || "Sem cliente vinculado"}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                    {getStatusLabel(visit.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">
                    {new Date(visit.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às {visit.time}
                  </span>
                  <button
                    onClick={() => isEditing ? setEditingVisitId(null) : startEditVisit(visit)}
                    className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title={isEditing ? "Fechar edição" : "Editar visita"}
                  >
                    <RiEditLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVisit(visit.id)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Excluir visita"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ficha expandida do lead */}
              {expandedLeadId === visit.lead?.id && (
                <div className="mb-3 ml-9 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl">
                  {loadingLead ? (
                    <RiLoader4Line className="w-4 h-4 animate-spin text-orange-500" />
                  ) : expandedLeadData ? (
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{expandedLeadData.name}</p>
                      {expandedLeadData.email && <p className="text-xs text-neutral-500">{expandedLeadData.email}</p>}
                      {expandedLeadData.phone && <p className="text-xs text-neutral-500">{expandedLeadData.phone}</p>}
                      {expandedLeadData.ticket && <p className="text-xs text-neutral-500">Finalidade: {expandedLeadData.ticket === "COMPRA" ? "Compra" : expandedLeadData.ticket === "LOCACAO" ? "Locação" : "Ambos"}</p>}
                      {(expandedLeadData.minBudget || expandedLeadData.maxBudget) && (
                        <p className="text-xs text-green-600 font-medium">
                          Ticket: {expandedLeadData.minBudget ? `R$ ${expandedLeadData.minBudget.toLocaleString("pt-BR")}` : "?"} - {expandedLeadData.maxBudget ? `R$ ${expandedLeadData.maxBudget.toLocaleString("pt-BR")}` : "?"}
                        </p>
                      )}
                      {expandedLeadData.temperature && (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${expandedLeadData.temperature === "QUENTE" ? "bg-red-100 text-red-700" : expandedLeadData.temperature === "MORNO" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                          {expandedLeadData.temperature === "QUENTE" ? "Quente" : expandedLeadData.temperature === "MORNO" ? "Morno" : "Frio"}
                        </span>
                      )}
                      <Link href={`/admin/clientes/leads`} className="inline-block mt-1 text-[10px] text-orange-600 hover:underline font-medium">
                        Abrir no Kanban →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">Erro ao carregar dados</p>
                  )}
                </div>
              )}

              {visit.notes && !isEditing && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-9 mb-1">{visit.notes}</p>
              )}
              <div className="flex items-center gap-3 mt-1 ml-9">
                {visit.corretor && (
                  <button
                    onClick={() => handleExpandCorretor(visit.corretor.id)}
                    className="text-xs text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                    title="Clique para expandir info do corretor"
                  >
                    Corretor: {visit.corretor.name}
                  </button>
                )}
                {visit.partner && (
                  <p className="text-xs text-purple-500">Parceiro: {visit.partner.name}</p>
                )}
              </div>

              {/* Ficha expandida do corretor */}
              {expandedCorretorId === visit.corretor?.id && (
                <div className="mb-3 ml-9 mt-2 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                  {loadingCorretor ? (
                    <RiLoader4Line className="w-4 h-4 animate-spin text-blue-500" />
                  ) : expandedCorretorData ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {expandedCorretorData.avatar && (
                          <img src={expandedCorretorData.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{expandedCorretorData.name}</p>
                          <p className="text-[10px] text-neutral-500">{expandedCorretorData.role === "ADMIN" ? "Administrador" : "Corretor"}</p>
                        </div>
                      </div>
                      {expandedCorretorData.email && <p className="text-xs text-neutral-500">📧 {expandedCorretorData.email}</p>}
                      {expandedCorretorData.phone && <p className="text-xs text-neutral-500">📱 {expandedCorretorData.phone}</p>}
                      {expandedCorretorData.creci && <p className="text-xs text-neutral-500">CRECI: {expandedCorretorData.creci}</p>}
                      {expandedCorretorData.region && <p className="text-xs text-neutral-500">Região: {expandedCorretorData.region}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        {expandedCorretorData.totalSales > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded font-medium">
                            {expandedCorretorData.totalSales} vendas
                          </span>
                        )}
                        {expandedCorretorData.rating > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded font-medium">
                            ⭐ {expandedCorretorData.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">Erro ao carregar dados</p>
                  )}
                </div>
              )}

              {/* Feedback deste imóvel específico */}
              {vpData && (
                <div className="mt-2 ml-9 p-2.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2 mb-1.5">
                    <RiFileTextLine className="w-3.5 h-3.5 text-neutral-400" />
                    <p className="text-[10px] text-neutral-400 uppercase font-medium">Feedback deste imóvel</p>
                    {vpData.liked === true && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">👍 Gostou</span>}
                    {vpData.liked === false && <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded">👎 Não gostou</span>}
                  </div>
                  {vpData.feedback && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{vpData.feedback}</p>
                  )}
                  {/* Editar feedback */}
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFeedbackForms(prev => ({ ...prev, [feedbackKey]: { ...prev[feedbackKey], feedback: prev[feedbackKey]?.feedback || vpData.feedback || "", liked: true } }))}
                        className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${(feedbackForms[feedbackKey]?.liked === true || (!feedbackForms[feedbackKey] && vpData.liked === true)) ? "border-green-500 bg-green-50 text-green-700" : "border-neutral-200 text-neutral-500 hover:border-green-300"}`}
                      >
                        👍 Gostou
                      </button>
                      <button
                        onClick={() => setFeedbackForms(prev => ({ ...prev, [feedbackKey]: { ...prev[feedbackKey], feedback: prev[feedbackKey]?.feedback || vpData.feedback || "", liked: false } }))}
                        className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${(feedbackForms[feedbackKey]?.liked === false || (!feedbackForms[feedbackKey] && vpData.liked === false)) ? "border-red-500 bg-red-50 text-red-700" : "border-neutral-200 text-neutral-500 hover:border-red-300"}`}
                      >
                        👎 Não gostou
                      </button>
                    </div>
                    <textarea
                      value={feedbackForms[feedbackKey]?.feedback ?? vpData.feedback ?? ""}
                      onChange={(e) => setFeedbackForms(prev => ({ ...prev, [feedbackKey]: { ...prev[feedbackKey], feedback: e.target.value, liked: prev[feedbackKey]?.liked ?? vpData.liked ?? null } }))}
                      placeholder="Feedback do cliente sobre este imóvel..."
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 resize-none focus:ring-1 focus:ring-orange-500/30 outline-none"
                    />
                    {feedbackForms[feedbackKey] && (
                      <button
                        onClick={() => handleSaveFeedback(visit.id, property.id)}
                        disabled={savingFeedback === feedbackKey}
                        className="px-3 py-1 text-[11px] font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
                      >
                        {savingFeedback === feedbackKey ? <RiLoader4Line className="w-3 h-3 animate-spin" /> : <RiCheckLine className="w-3 h-3" />}
                        Salvar Feedback
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Formulário de edição inline */}
              {isEditing && (
                <div className="mt-3 ml-9 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl space-y-3">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Editar Visita</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Data</label>
                      <input type="date" value={editForm.date} onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))} className="w-full px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Início</label>
                      <input type="time" value={editForm.time} onChange={(e) => setEditForm(f => ({ ...f, time: e.target.value }))} className="w-full px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-0.5">Fim</label>
                      <input type="time" value={editForm.endTime} onChange={(e) => setEditForm(f => ({ ...f, endTime: e.target.value }))} className="w-full px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Observações</label>
                    <textarea value={editForm.notes} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Notas Internas</label>
                    <textarea value={editForm.internalNotes} onChange={(e) => setEditForm(f => ({ ...f, internalNotes: e.target.value }))} rows={2} className="w-full px-2 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(visit.id)} disabled={savingEdit} className="px-3 py-1.5 text-[11px] font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1">
                      {savingEdit ? <RiLoader4Line className="w-3 h-3 animate-spin" /> : <RiCheckLine className="w-3 h-3" />}
                      Salvar
                    </button>
                    <button onClick={() => setEditingVisitId(null)} className="px-3 py-1.5 text-[11px] font-medium bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Botões de ação de status */}
              {visit.status !== "REALIZADA" && visit.status !== "CANCELADA" && (
                <div className="flex items-center gap-2 mt-3 ml-9">
                  {visit.status === "AGENDADA" && (
                    <button
                      onClick={() => handleUpdateVisitStatus(visit.id, "CONFIRMADA")}
                      className="px-2.5 py-1 text-[11px] font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateVisitStatus(visit.id, "REALIZADA")}
                    className="px-2.5 py-1 text-[11px] font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                  >
                    Concluída
                  </button>
                  <button
                    onClick={() => handleUpdateVisitStatus(visit.id, "CANCELADA")}
                    className="px-2.5 py-1 text-[11px] font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdateVisitStatus(visit.id, "REAGENDADA")}
                    className="px-2.5 py-1 text-[11px] font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    Reagendar
                  </button>
                  <button
                    onClick={() => handleUpdateVisitStatus(visit.id, "NAO_COMPARECEU")}
                    className="px-2.5 py-1 text-[11px] font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    Não Compareceu
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabPropostas({ property, currentUser, formatCurrency, getProposalStatusColor, getProposalStatusLabel }: any) {
  const [showModal, setShowModal] = useState(false);
  
  // Todas as propostas são visíveis para todos (inclusive recusadas)
  const isAdmin = currentUser?.role === "ADMIN";
  const filteredProposals = property.proposals || [];

  // Agrupar propostas por cliente para linha do tempo
  const groupedByClient: Record<string, any[]> = {};
  filteredProposals.forEach((p: any) => {
    const key = (p.clientName || "").trim().toLowerCase();
    if (!groupedByClient[key]) groupedByClient[key] = [];
    groupedByClient[key].push(p);
  });
  Object.values(groupedByClient).forEach((group: any[]) => {
    group.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });
  const clientTimelines = Object.entries(groupedByClient).filter(([, group]) => group.length > 1);

  const [leads, setLeads] = useState<any[]>([]);
  const [searchLead, setSearchLead] = useState("");
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [brokerResults, setBrokerResults] = useState<any[]>([]);
  const [searchBroker, setSearchBroker] = useState("");
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const [newProposal, setNewProposal] = useState({
    purpose: property.category === "LOCACAO" ? "ALUGUEL" : "VENDA" as string,
    clientName: "",
    leadId: "",
    originalValue: "",
    originalValueRaw: 0,
    value: "",
    valueRaw: 0,
    discountPercent: "",
    // Campos ALUGUEL
    rentalGuarantee: "",
    rentalStartDate: "",
    // Parcelamento Direto
    hasDirectPayment: false,
    directPaymentOwn: "",
    directPaymentOwnRaw: 0,
    directPaymentInstallments: "",
    hasCorrection: false,
    correctionDetails: "",
    // Permuta
    hasPermuta: false,
    permutaValue: "",
    permutaValueRaw: 0,
    permutaType: "",
    permutaCity: "",
    permutaNeighborhood: "",
    permutaAddress: "",
    permutaBedrooms: "",
    permutaArea: "",
    permutaDetails: "",
    // Financiamento Bancário
    hasBankFinancing: false,
    bankFinancingOwn: "",
    bankFinancingOwnRaw: 0,
    bankFinancingValue: "",
    bankFinancingValueRaw: 0,
    financingBank: "",
    // Comissão
    commissionType: "PERCENTUAL",
    commissionPercent: "",
    commissionValue: "",
    commissionValueRaw: 0,
    // Corretor Parceiro
    hasPartnerBroker: false,
    partnerBrokerName: "",
    partnerBrokerCreci: "",
    // Resumo
    scopeSummary: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);

  const handleEditProposal = (proposal: any) => {
    setEditingProposalId(proposal.id);
    setNewProposal({
      purpose: proposal.purpose || (property.category === "LOCACAO" ? "ALUGUEL" : "VENDA"),
      clientName: proposal.clientName || "",
      leadId: proposal.leadId || "",
      originalValue: proposal.originalValue ? (proposal.originalValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      originalValueRaw: proposal.originalValue ? Math.round(proposal.originalValue * 100) : 0,
      value: proposal.value ? (proposal.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      valueRaw: proposal.value ? Math.round(proposal.value * 100) : 0,
      discountPercent: proposal.discountPercent ? String(proposal.discountPercent) : "",
      rentalGuarantee: proposal.rentalGuarantee || "",
      rentalStartDate: proposal.rentalStartDate ? new Date(proposal.rentalStartDate).toISOString().split("T")[0] : "",
      hasDirectPayment: proposal.hasDirectPayment || false,
      directPaymentOwn: proposal.directPaymentOwn ? (proposal.directPaymentOwn).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      directPaymentOwnRaw: proposal.directPaymentOwn ? Math.round(proposal.directPaymentOwn * 100) : 0,
      directPaymentInstallments: proposal.directPaymentInstallments ? String(proposal.directPaymentInstallments) : "",
      hasCorrection: proposal.hasCorrection || false,
      correctionDetails: proposal.correctionDetails || "",
      hasPermuta: proposal.hasPermuta || false,
      permutaValue: proposal.permutaValue ? (proposal.permutaValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      permutaValueRaw: proposal.permutaValue ? Math.round(proposal.permutaValue * 100) : 0,
      permutaType: proposal.permutaType || "",
      permutaCity: proposal.permutaCity || "",
      permutaNeighborhood: proposal.permutaNeighborhood || "",
      permutaAddress: proposal.permutaAddress || "",
      permutaBedrooms: proposal.permutaBedrooms ? String(proposal.permutaBedrooms) : "",
      permutaArea: proposal.permutaArea ? String(proposal.permutaArea) : "",
      permutaDetails: proposal.permutaDetails || "",
      hasBankFinancing: proposal.hasBankFinancing || false,
      bankFinancingOwn: proposal.bankFinancingOwn ? (proposal.bankFinancingOwn).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      bankFinancingOwnRaw: proposal.bankFinancingOwn ? Math.round(proposal.bankFinancingOwn * 100) : 0,
      bankFinancingValue: proposal.bankFinancingValue ? (proposal.bankFinancingValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      bankFinancingValueRaw: proposal.bankFinancingValue ? Math.round(proposal.bankFinancingValue * 100) : 0,
      financingBank: proposal.financingBank || "",
      commissionType: proposal.commissionType || "PERCENTUAL",
      commissionPercent: proposal.commissionPercent ? String(proposal.commissionPercent) : "",
      commissionValue: proposal.commissionValue ? (proposal.commissionValue).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
      commissionValueRaw: proposal.commissionValue ? Math.round(proposal.commissionValue * 100) : 0,
      hasPartnerBroker: proposal.hasPartnerBroker || false,
      partnerBrokerName: proposal.partnerBrokerName || "",
      partnerBrokerCreci: proposal.partnerBrokerCreci || "",
      scopeSummary: proposal.scopeSummary || "",
    });
    setSearchLead(proposal.clientName || "");
    setShowModal(true);
  };

  // Estado para modal de contra oferta
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [counterOfferData, setCounterOfferData] = useState({
    proposalId: "",
    counterOfferValue: "",
    counterOfferValueRaw: 0,
    counterOfferDetails: "",
  });

  // Calcular valor líquido ao vendedor
  const calculateNetValue = () => {
    const proposalValue = newProposal.valueRaw / 100;
    if (proposalValue <= 0) return 0;
    
    if (newProposal.commissionType === "PERCENTUAL" && newProposal.commissionPercent) {
      const percent = parseFloat(newProposal.commissionPercent) || 0;
      return proposalValue - (proposalValue * percent / 100);
    } else if (newProposal.commissionType === "VALOR" && newProposal.commissionValueRaw > 0) {
      return proposalValue - (newProposal.commissionValueRaw / 100);
    }
    return proposalValue;
  };

  // Buscar leads ao abrir modal
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch("/api/admin/leads?limit=100");
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
        }
      } catch (error) {
        console.error("Erro ao carregar leads:", error);
      }
    };
    if (showModal) {
      fetchLeads();
    }
  }, [showModal]);

  // Buscar corretores parceiros (debounced)
  useEffect(() => {
    if (!searchBroker || searchBroker.length < 2) {
      setBrokerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const [usersRes, partnersRes] = await Promise.all([
          fetch(`/api/admin/users?role=CORRETOR&search=${encodeURIComponent(searchBroker)}&limit=5`),
          fetch(`/api/admin/business-partners?type=CORRETOR&search=${encodeURIComponent(searchBroker)}&limit=5`),
        ]);
        const results: any[] = [];
        if (usersRes.ok) {
          const data = await usersRes.json();
          (data.users || []).forEach((u: any) => results.push({ id: u.id, name: u.name, creci: u.creci, phone: u.phone, source: "user" }));
        }
        if (partnersRes.ok) {
          const data = await partnersRes.json();
          (data.partners || []).forEach((p: any) => results.push({ id: p.id, name: p.name, creci: p.creci, phone: p.phone, source: "partner" }));
        }
        setBrokerResults(results.slice(0, 8));
      } catch (err) {
        console.error("Erro ao buscar corretores:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchBroker]);

  const selectBroker = (broker: any) => {
    setNewProposal({
      ...newProposal,
      partnerBrokerName: broker.name || "",
      partnerBrokerCreci: broker.creci || "",
    });
    setSearchBroker(broker.name || "");
    setShowBrokerDropdown(false);
  };

  // Filtrar leads pela busca
  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchLead.toLowerCase()) ||
    lead.phone?.includes(searchLead) ||
    lead.email?.toLowerCase().includes(searchLead.toLowerCase())
  ).slice(0, 5);

  const selectLead = (lead: any) => {
    setNewProposal({
      ...newProposal,
      clientName: lead.name || "",
      leadId: lead.id || "",
    });
    setSearchLead(lead.name || "");
    setShowLeadDropdown(false);
  };

  const resetProposal = () => {
    setNewProposal({
      purpose: property.category === "LOCACAO" ? "ALUGUEL" : "VENDA",
      clientName: "",
      leadId: "",
      originalValue: "",
      originalValueRaw: 0,
      value: "",
      valueRaw: 0,
      discountPercent: "",
      rentalGuarantee: "",
      rentalStartDate: "",
      hasDirectPayment: false,
      directPaymentOwn: "",
      directPaymentOwnRaw: 0,
      directPaymentInstallments: "",
      hasCorrection: false,
      correctionDetails: "",
      hasPermuta: false,
      permutaValue: "",
      permutaValueRaw: 0,
      permutaType: "",
      permutaCity: "",
      permutaNeighborhood: "",
      permutaAddress: "",
      permutaBedrooms: "",
      permutaArea: "",
      permutaDetails: "",
      hasBankFinancing: false,
      bankFinancingOwn: "",
      bankFinancingOwnRaw: 0,
      bankFinancingValue: "",
      bankFinancingValueRaw: 0,
      financingBank: "",
      commissionType: "PERCENTUAL",
      commissionPercent: "",
      commissionValue: "",
      commissionValueRaw: 0,
      hasPartnerBroker: false,
      partnerBrokerName: "",
      partnerBrokerCreci: "",
      scopeSummary: "",
    });
    setSearchLead("");
    setSearchBroker("");
  };

  const handleSaveProposal = async () => {
    if (newProposal.valueRaw <= 0) {
      alert("Preencha o valor da proposta");
      return;
    }
    if (!newProposal.hasPartnerBroker && !newProposal.leadId) {
      alert("Selecione o cliente do funil. Se for corretor parceiro, marque a opção correspondente.");
      return;
    }
    if (newProposal.hasPartnerBroker && !newProposal.clientName) {
      alert("Preencha o nome do cliente do corretor parceiro");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        purpose: newProposal.purpose,
        clientName: newProposal.clientName,
        leadId: newProposal.leadId || null,
        originalValue: newProposal.originalValueRaw > 0 ? newProposal.originalValueRaw / 100 : null,
        value: newProposal.valueRaw / 100,
        discountPercent: newProposal.discountPercent ? parseFloat(newProposal.discountPercent) : null,
        rentalGuarantee: newProposal.rentalGuarantee || null,
        rentalStartDate: newProposal.rentalStartDate || null,
        hasDirectPayment: newProposal.hasDirectPayment,
        directPaymentOwn: newProposal.directPaymentOwnRaw > 0 ? newProposal.directPaymentOwnRaw / 100 : null,
        directPaymentInstallments: newProposal.directPaymentInstallments ? parseInt(newProposal.directPaymentInstallments) : null,
        hasCorrection: newProposal.hasCorrection,
        correctionDetails: newProposal.correctionDetails || null,
        hasPermuta: newProposal.hasPermuta,
        permutaValue: newProposal.permutaValueRaw > 0 ? newProposal.permutaValueRaw / 100 : null,
        permutaType: newProposal.permutaType || null,
        permutaCity: newProposal.permutaCity || null,
        permutaNeighborhood: newProposal.permutaNeighborhood || null,
        permutaAddress: newProposal.permutaAddress || null,
        permutaBedrooms: newProposal.permutaBedrooms ? parseInt(newProposal.permutaBedrooms) : null,
        permutaArea: newProposal.permutaArea ? parseFloat(newProposal.permutaArea) : null,
        permutaDetails: newProposal.permutaDetails || null,
        hasBankFinancing: newProposal.hasBankFinancing,
        bankFinancingOwn: newProposal.bankFinancingOwnRaw > 0 ? newProposal.bankFinancingOwnRaw / 100 : null,
        bankFinancingValue: newProposal.bankFinancingValueRaw > 0 ? newProposal.bankFinancingValueRaw / 100 : null,
        financingBank: newProposal.financingBank || null,
        commissionType: newProposal.commissionType,
        commissionPercent: newProposal.commissionPercent ? parseFloat(newProposal.commissionPercent) : null,
        commissionValue: newProposal.commissionValueRaw > 0 ? newProposal.commissionValueRaw / 100 : null,
        netValueToSeller: calculateNetValue(),
        hasPartnerBroker: newProposal.hasPartnerBroker,
        partnerBrokerName: newProposal.partnerBrokerName || null,
        partnerBrokerCreci: newProposal.partnerBrokerCreci || null,
        scopeSummary: newProposal.scopeSummary || null,
      };

      const url = editingProposalId
        ? `/api/admin/properties/${property.id}/proposals/${editingProposalId}`
        : `/api/admin/properties/${property.id}/proposals`;
      const method = editingProposalId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowModal(false);
        resetProposal();
        setEditingProposalId(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao salvar proposta:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, newStatus: string, extraData?: any) => {
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extraData }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao atualizar proposta:", error);
    }
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.")) return;
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/proposals/${proposalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Erro ao excluir proposta");
      }
    } catch (error) {
      console.error("Erro ao excluir proposta:", error);
    }
  };

  const openCounterOfferModal = (proposalId: string) => {
    setCounterOfferData({
      proposalId,
      counterOfferValue: "",
      counterOfferValueRaw: 0,
      counterOfferDetails: "",
    });
    setShowCounterOfferModal(true);
  };

  const handleSubmitCounterOffer = async () => {
    if (!counterOfferData.counterOfferDetails) {
      alert("Informe os detalhes da contra oferta do vendedor");
      return;
    }
    await handleUpdateProposalStatus(counterOfferData.proposalId, "CONTRA_PROPOSTA", {
      counterProposal: counterOfferData.counterOfferValueRaw > 0 ? counterOfferData.counterOfferValueRaw / 100 : null,
      counterOfferDetails: counterOfferData.counterOfferDetails,
    });
    setShowCounterOfferModal(false);
  };

  const formatCounterOfferCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseInt(numbers || "0");
    setCounterOfferData(prev => ({ 
      ...prev, 
      counterOfferValueRaw: amount, 
      counterOfferValue: (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
    }));
  };

  const formatCurrencyInputField = (value: string, field: string, rawField: string) => {
    const numbers = value.replace(/\D/g, "");
    const amount = parseInt(numbers || "0");
    setNewProposal(prev => ({ ...prev, [rawField]: amount, [field]: (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Propostas Recebidas ({filteredProposals.length})</h4>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
        >
          <RiAddLine className="w-4 h-4" />
          Nova Proposta
        </button>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          Nenhuma proposta recebida
        </div>
      ) : (
        <div className="space-y-3">
          {/* Linha do tempo para clientes com múltiplas propostas */}
          {clientTimelines.map(([key, group]) => (
            <div key={`timeline-${key}`} className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-xl border border-blue-200 dark:border-blue-500/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-1.5">
                <RiTimeLine className="w-3.5 h-3.5" />
                Linha do tempo — {group[0].clientName} ({group.length} propostas)
              </p>
              <div className="relative pl-4 border-l-2 border-blue-300 dark:border-blue-500/40 space-y-2">
                {group.map((p: any, idx: number) => (
                  <div key={p.id} className="relative">
                    <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 ${
                      idx === 0 ? "bg-blue-500" : "bg-blue-300 dark:bg-blue-500/50"
                    }`} />
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-neutral-500">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.proposedValue || p.value)}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getProposalStatusColor(p.status)}`}>
                        {getProposalStatusLabel(p.status)}
                      </span>
                      {p.counterProposal && (
                        <span className="text-blue-600 dark:text-blue-400">→ Contra: {formatCurrency(p.counterProposal)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredProposals.map((proposal: any) => {
            const isExpanded = expandedProposalId === proposal.id;
            return (
            <div key={proposal.id} className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                onClick={() => setExpandedProposalId(isExpanded ? null : proposal.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {proposal.purpose && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        proposal.purpose === "ALUGUEL" 
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400" 
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      }`}>
                        {proposal.purpose === "ALUGUEL" ? "🔑 Aluguel" : "🏷️ Venda"}
                      </span>
                    )}
                    <span className="font-medium">{proposal.clientName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getProposalStatusColor(proposal.status)}`}>
                      {getProposalStatusLabel ? getProposalStatusLabel(proposal.status) : proposal.status}
                    </span>
                    {proposal.discountPercent && proposal.discountPercent > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                        -{proposal.discountPercent.toFixed(1)}%
                      </span>
                    )}
                    {proposal.hasPermuta && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400">
                        Permuta
                      </span>
                    )}
                    {proposal.hasPartnerBroker && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                        Corretor Parceiro
                      </span>
                    )}
                    {proposal.corretor && (
                      <span className="text-xs text-neutral-500">
                        por {proposal.corretor.name}
                      </span>
                    )}
                    <RiArrowDownSLine className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500">{new Date(proposal.date || proposal.createdAt).toLocaleDateString("pt-BR")}</span>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProposal(proposal.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-400 hover:text-red-600 transition-colors"
                        title="Excluir proposta (Admin)"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(proposal.value)}</p>
                    {proposal.description && !isExpanded && (
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{proposal.description}</p>
                    )}
                  </div>
                  {(proposal.status === "PENDENTE" || proposal.status === "EM_NEGOCIACAO" || proposal.status === "CONTRA_PROPOSTA") && (
                    <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      {proposal.status === "PENDENTE" && (
                        <button 
                          onClick={() => handleUpdateProposalStatus(proposal.id, "EM_NEGOCIACAO")}
                          className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-400 text-xs font-medium"
                        >
                          Em Andamento
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateProposalStatus(proposal.id, "ACEITA")}
                        className="px-3 py-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 text-xs font-medium"
                      >
                        Aceitar
                      </button>
                      <button 
                        onClick={() => openCounterOfferModal(proposal.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-medium"
                      >
                        Contraproposta
                      </button>
                      <button 
                        onClick={() => { if (confirm("Recusar esta proposta?")) handleUpdateProposalStatus(proposal.id, "RECUSADA"); }}
                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 text-xs font-medium"
                      >
                        Recusar
                      </button>
                      <button 
                        onClick={() => { if (confirm("Marcar como desistência do cliente?")) handleUpdateProposalStatus(proposal.id, "DESISTENCIA"); }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-500/20 dark:text-neutral-400 text-xs font-medium"
                      >
                        Desistência
                      </button>
                    </div>
                  )}
                  {(proposal.status === "APROVADA" || proposal.status === "ACEITA") && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                      <RiCheckLine className="w-4 h-4" />
                      {proposal.status === "ACEITA" ? "Aceita" : "Aprovada"}
                    </span>
                  )}
                  {proposal.status === "DESISTENCIA" && (
                    <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                      Desistência do cliente
                    </span>
                  )}
                  {proposal.status === "RECUSADA" && (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
                      <RiCloseLine className="w-4 h-4" />
                      Recusada
                    </span>
                  )}
                </div>
              </div>

              {/* Destaque contraproposta */}
              {(proposal.status === "CONTRA_PROPOSTA" || proposal.counterOfferDetails) && (
                <div className="mx-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Contraproposta do Vendedor</p>
                  {proposal.counterProposal && (
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(proposal.counterProposal)}</p>
                  )}
                  {proposal.counterOfferDetails && (
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">{proposal.counterOfferDetails}</p>
                  )}
                </div>
              )}

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {proposal.originalValue && (
                      <div>
                        <span className="text-neutral-500">Valor Original</span>
                        <p className="font-medium">{formatCurrency(proposal.originalValue)}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-neutral-500">Valor Proposta</span>
                      <p className="font-semibold text-green-600">{formatCurrency(proposal.value)}</p>
                    </div>
                    {proposal.netValueToSeller && (
                      <div>
                        <span className="text-neutral-500">Líquido ao Vendedor</span>
                        <p className="font-medium">{formatCurrency(proposal.netValueToSeller)}</p>
                      </div>
                    )}
                    {proposal.commissionPercent && (
                      <div>
                        <span className="text-neutral-500">Comissão</span>
                        <p className="font-medium">{proposal.commissionPercent}%{proposal.commissionValue ? ` (${formatCurrency(proposal.commissionValue)})` : ""}</p>
                      </div>
                    )}
                    {proposal.rentalGuarantee && (
                      <div>
                        <span className="text-neutral-500">Garantia Locatícia</span>
                        <p className="font-medium">{proposal.rentalGuarantee}</p>
                      </div>
                    )}
                    {proposal.rentalStartDate && (
                      <div>
                        <span className="text-neutral-500">Início Aluguel</span>
                        <p className="font-medium">{new Date(proposal.rentalStartDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                    )}
                  </div>

                  {proposal.hasDirectPayment && (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                      <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Parcelamento Direto</p>
                      <div className="grid grid-cols-2 gap-2">
                        {proposal.directPaymentOwn && <p><span className="text-neutral-500">Recursos próprios:</span> {formatCurrency(proposal.directPaymentOwn)}</p>}
                        {proposal.directPaymentInstallments && <p><span className="text-neutral-500">Parcelas:</span> {proposal.directPaymentInstallments}x</p>}
                        {proposal.hasCorrection && <p><span className="text-neutral-500">Correção:</span> {proposal.correctionDetails || "Sim"}</p>}
                      </div>
                    </div>
                  )}

                  {proposal.hasPermuta && (
                    <div className="p-2.5 bg-pink-50 dark:bg-pink-500/10 rounded-lg">
                      <p className="font-semibold text-pink-700 dark:text-pink-400 mb-1">Permuta</p>
                      <div className="grid grid-cols-2 gap-2">
                        {proposal.permutaValue && <p><span className="text-neutral-500">Valor:</span> {formatCurrency(proposal.permutaValue)}</p>}
                        {proposal.permutaType && <p><span className="text-neutral-500">Tipo:</span> {proposal.permutaType}</p>}
                        {proposal.permutaCity && <p><span className="text-neutral-500">Cidade:</span> {proposal.permutaCity}</p>}
                        {proposal.permutaNeighborhood && <p><span className="text-neutral-500">Bairro:</span> {proposal.permutaNeighborhood}</p>}
                        {proposal.permutaArea && <p><span className="text-neutral-500">Área:</span> {proposal.permutaArea}m²</p>}
                        {proposal.permutaBedrooms && <p><span className="text-neutral-500">Dorms:</span> {proposal.permutaBedrooms}</p>}
                        {proposal.permutaDetails && <p className="col-span-2"><span className="text-neutral-500">Detalhes:</span> {proposal.permutaDetails}</p>}
                      </div>
                    </div>
                  )}

                  {proposal.hasBankFinancing && (
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                      <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">Financiamento Bancário</p>
                      <div className="grid grid-cols-2 gap-2">
                        {proposal.bankFinancingOwn && <p><span className="text-neutral-500">Recursos próprios:</span> {formatCurrency(proposal.bankFinancingOwn)}</p>}
                        {proposal.bankFinancingValue && <p><span className="text-neutral-500">Financiado:</span> {formatCurrency(proposal.bankFinancingValue)}</p>}
                        {proposal.financingBank && <p><span className="text-neutral-500">Banco:</span> {proposal.financingBank}</p>}
                      </div>
                    </div>
                  )}

                  {proposal.hasPartnerBroker && (
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                      <p className="font-semibold text-purple-700 dark:text-purple-400 mb-1">Corretor Parceiro</p>
                      {proposal.partnerBrokerName && <p><span className="text-neutral-500">Nome:</span> {proposal.partnerBrokerName}</p>}
                    </div>
                  )}

                  {(proposal.scopeSummary || proposal.notes) && (
                    <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      <p className="text-neutral-500 mb-1">Observações</p>
                      <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{proposal.scopeSummary || proposal.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditProposal(proposal); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-medium transition-colors"
                    >
                      <RiEditLine className="w-3.5 h-3.5" />
                      Editar Proposta
                    </button>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Proposta */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Nova Proposta</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Finalidade */}
                <div>
                  <label className="block text-sm font-medium mb-2">Finalidade *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "VENDA", label: "Venda", icon: "🏷️" },
                      { value: "ALUGUEL", label: "Aluguel", icon: "🔑" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          const autoPrice = opt.value === "ALUGUEL" 
                            ? (property.rentPrice || 0) 
                            : (property.price || 0);
                          const autoRaw = Math.round(autoPrice * 100);
                          setNewProposal(prev => ({
                            ...prev,
                            purpose: opt.value,
                            originalValue: autoPrice > 0 ? autoPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
                            originalValueRaw: autoRaw,
                            discountPercent: "",
                          }));
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          newProposal.purpose === opt.value
                            ? "border-[#0A1E3D] bg-[#0A1E3D]/5 dark:bg-[#0A1E3D]/20"
                            : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="block text-sm font-medium mt-1">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CORRETOR PARCEIRO - antes do cliente para condicionar */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProposal.hasPartnerBroker}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNewProposal({ ...newProposal, hasPartnerBroker: checked, ...(!checked ? { clientName: "", leadId: "" } : {}) });
                        if (!checked) setSearchLead("");
                      }}
                      className="w-5 h-5 rounded border-neutral-300 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="font-medium">Corretor Parceiro?</span>
                  </label>
                  {newProposal.hasPartnerBroker && (
                    <div className="mt-4 space-y-3">
                      {newProposal.partnerBrokerName && !searchBroker ? (
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                              <RiUser3Line className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white text-sm">{newProposal.partnerBrokerName}</p>
                              {newProposal.partnerBrokerCreci && <p className="text-xs text-neutral-500">CRECI: {newProposal.partnerBrokerCreci}</p>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewProposal({ ...newProposal, partnerBrokerName: "", partnerBrokerCreci: "" });
                              setSearchBroker("");
                            }}
                            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-lg"
                          >
                            <RiCloseLine className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <label className="block text-xs font-medium mb-1">Buscar Corretor Parceiro</label>
                          <div className="relative">
                            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                              type="text"
                              value={searchBroker}
                              onChange={(e) => {
                                setSearchBroker(e.target.value);
                                setShowBrokerDropdown(true);
                              }}
                              onFocus={() => setShowBrokerDropdown(true)}
                              placeholder="Buscar por nome ou telefone..."
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                          </div>
                          {showBrokerDropdown && brokerResults.length > 0 && searchBroker && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {brokerResults.map((broker) => (
                                <button
                                  key={`${broker.source}-${broker.id}`}
                                  type="button"
                                  onClick={() => selectBroker(broker)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm border-b border-neutral-100 dark:border-neutral-700 last:border-0 flex items-center gap-3"
                                >
                                  <RiUser3Line className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium">{broker.name}</div>
                                    <div className="text-xs text-neutral-500 flex gap-2">
                                      {broker.phone && <span>{broker.phone}</span>}
                                      <span className="text-purple-500">{broker.source === "user" ? "Usuário" : "Parceiro"}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cliente - condicional: parceiro = manual, senão = funil obrigatório */}
                {newProposal.hasPartnerBroker ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome do Cliente</label>
                    <input
                      type="text"
                      value={newProposal.clientName}
                      onChange={(e) => setNewProposal({ ...newProposal, clientName: e.target.value })}
                      placeholder="Nome do cliente do corretor parceiro (opcional)"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Cliente do Funil *</label>
                    <input
                      type="text"
                      value={searchLead || newProposal.clientName}
                      onChange={(e) => {
                        setSearchLead(e.target.value);
                        setNewProposal({ ...newProposal, clientName: e.target.value, leadId: "" });
                        setShowLeadDropdown(true);
                      }}
                      onFocus={() => setShowLeadDropdown(true)}
                      placeholder="Digite para buscar leads do funil..."
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-neutral-800 ${newProposal.leadId ? "border-green-400 dark:border-green-600" : "border-neutral-200 dark:border-neutral-700"}`}
                    />
                    {newProposal.leadId && (
                      <span className="absolute right-3 top-[38px] text-xs text-green-600">✓ Vinculado</span>
                    )}
                    {showLeadDropdown && filteredLeads.length > 0 && searchLead && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredLeads.map(lead => (
                          <button
                            key={lead.id}
                            type="button"
                            onClick={() => selectLead(lead)}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex flex-col"
                          >
                            <span className="font-medium">{lead.name}</span>
                            <span className="text-xs text-neutral-500">{lead.phone} • {lead.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Valores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor Original do Anúncio</label>
                    <input
                      type="text"
                      value={newProposal.originalValue}
                      onChange={(e) => formatCurrencyInputField(e.target.value, "originalValue", "originalValueRaw")}
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm"
                    />
                    <p className="text-xs text-neutral-400 mt-1">Preenchido automaticamente</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor da Proposta *</label>
                    <input
                      type="text"
                      value={newProposal.value}
                      onChange={(e) => {
                        formatCurrencyInputField(e.target.value, "value", "valueRaw");
                        // Auto-calc discount
                        const numbers = e.target.value.replace(/\D/g, "");
                        const proposed = parseInt(numbers || "0");
                        if (newProposal.originalValueRaw > 0 && proposed > 0) {
                          const disc = ((1 - (proposed / newProposal.originalValueRaw)) * 100).toFixed(1);
                          setNewProposal(prev => ({ ...prev, discountPercent: parseFloat(disc) > 0 ? disc : "0" }));
                        }
                      }}
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-lg font-semibold"
                    />
                  </div>
                </div>

                {/* Desconto calculado */}
                {newProposal.originalValueRaw > 0 && newProposal.valueRaw > 0 && (
                  <div className={`p-3 rounded-xl text-center text-sm font-medium ${
                    parseFloat(newProposal.discountPercent || "0") > 0
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                      : parseFloat(newProposal.discountPercent || "0") < 0
                        ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                  }`}>
                    {(() => {
                      const disc = ((1 - (newProposal.valueRaw / newProposal.originalValueRaw)) * 100);
                      if (disc > 0) return `📉 Desconto de ${disc.toFixed(1)}% sobre o valor original`;
                      if (disc < 0) return `📈 Acréscimo de ${Math.abs(disc).toFixed(1)}% sobre o valor original`;
                      return "Valor igual ao original";
                    })()}
                  </div>
                )}

                {/* Campos específicos de ALUGUEL */}
                {newProposal.purpose === "ALUGUEL" && (
                  <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800 space-y-4">
                    <h4 className="font-medium text-sky-800 dark:text-sky-300 text-sm">🔑 Detalhes da Locação</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Garantia Locatícia</label>
                        <select
                          value={newProposal.rentalGuarantee}
                          onChange={(e) => setNewProposal(prev => ({ ...prev, rentalGuarantee: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        >
                          <option value="">Selecione</option>
                          <option value="CAUCAO">Caução (3 meses)</option>
                          <option value="FIADOR">Fiador</option>
                          <option value="SEGURO_FIANCA">Seguro Fiança</option>
                          <option value="TITULO_CAPITALIZACAO">Título de Capitalização</option>
                          <option value="DEPOSITO">Depósito Caução</option>
                          <option value="CARTA_FIANCA_EMPRESARIAL">Carta Fiança Empresarial</option>
                          <option value="SEM_GARANTIA">Sem Garantia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Data de Início</label>
                        <input
                          type="date"
                          value={newProposal.rentalStartDate}
                          onChange={(e) => setNewProposal(prev => ({ ...prev, rentalStartDate: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PARCELAMENTO, PERMUTA E FINANCIAMENTO - Ocultos para ALUGUEL */}
                {newProposal.purpose !== "ALUGUEL" && (<>
                {/* PARCELAMENTO DIRETO */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProposal.hasDirectPayment}
                      onChange={(e) => setNewProposal({ ...newProposal, hasDirectPayment: e.target.checked })}
                      className="w-5 h-5 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="font-medium">Parcelamento Direto?</span>
                  </label>
                  {newProposal.hasDirectPayment && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Recursos Próprios</label>
                          <input
                            type="text"
                            value={newProposal.directPaymentOwn}
                            onChange={(e) => formatCurrencyInputField(e.target.value, "directPaymentOwn", "directPaymentOwnRaw")}
                            placeholder="R$ 0,00"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Nº de Parcelas</label>
                          <input
                            type="number"
                            value={newProposal.directPaymentInstallments}
                            onChange={(e) => setNewProposal({ ...newProposal, directPaymentInstallments: e.target.value })}
                            placeholder="Ex: 12"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newProposal.hasCorrection}
                            onChange={(e) => setNewProposal({ ...newProposal, hasCorrection: e.target.checked })}
                            className="w-4 h-4 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm">Há correção/juros nas parcelas?</span>
                        </label>
                        {newProposal.hasCorrection && (
                          <input
                            type="text"
                            value={newProposal.correctionDetails}
                            onChange={(e) => setNewProposal({ ...newProposal, correctionDetails: e.target.value })}
                            placeholder="Detalhes da correção (ex: IGPM, 1% a.m.)"
                            className="w-full mt-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* PERMUTA */}
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProposal.hasPermuta}
                      onChange={(e) => setNewProposal({ ...newProposal, hasPermuta: e.target.checked })}
                      className="w-5 h-5 rounded border-neutral-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="font-medium">Envolve Permuta?</span>
                  </label>
                  {newProposal.hasPermuta && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Valor da Permuta</label>
                        <input
                          type="text"
                          value={newProposal.permutaValue}
                          onChange={(e) => formatCurrencyInputField(e.target.value, "permutaValue", "permutaValueRaw")}
                          placeholder="R$ 0,00"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Tipo do Imóvel</label>
                          <select
                            value={newProposal.permutaType}
                            onChange={(e) => setNewProposal({ ...newProposal, permutaType: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          >
                            <option value="">Selecione</option>
                            <option value="CASA">Casa</option>
                            <option value="APARTAMENTO">Apartamento</option>
                            <option value="TERRENO">Terreno</option>
                            <option value="COMERCIAL">Comercial</option>
                            <option value="RURAL">Rural</option>
                            <option value="OUTRO">Outro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Cidade</label>
                          <input
                            type="text"
                            value={newProposal.permutaCity}
                            onChange={(e) => setNewProposal({ ...newProposal, permutaCity: e.target.value })}
                            placeholder="Cidade"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Bairro</label>
                          <input
                            type="text"
                            value={newProposal.permutaNeighborhood}
                            onChange={(e) => setNewProposal({ ...newProposal, permutaNeighborhood: e.target.value })}
                            placeholder="Bairro"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Endereço</label>
                          <input
                            type="text"
                            value={newProposal.permutaAddress}
                            onChange={(e) => setNewProposal({ ...newProposal, permutaAddress: e.target.value })}
                            placeholder="Endereço"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Dormitórios</label>
                          <input
                            type="number"
                            value={newProposal.permutaBedrooms}
                            onChange={(e) => setNewProposal({ ...newProposal, permutaBedrooms: e.target.value })}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Área (m²)</label>
                          <input
                            type="number"
                            value={newProposal.permutaArea}
                            onChange={(e) => setNewProposal({ ...newProposal, permutaArea: e.target.value })}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Detalhes Adicionais</label>
                        <textarea
                          value={newProposal.permutaDetails}
                          onChange={(e) => setNewProposal({ ...newProposal, permutaDetails: e.target.value })}
                          placeholder="Outras informações sobre o imóvel de permuta..."
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* FINANCIAMENTO BANCÁRIO */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProposal.hasBankFinancing}
                      onChange={(e) => setNewProposal({ ...newProposal, hasBankFinancing: e.target.checked })}
                      className="w-5 h-5 rounded border-neutral-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="font-medium">Financiamento Bancário?</span>
                  </label>
                  {newProposal.hasBankFinancing && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Recursos Próprios</label>
                          <input
                            type="text"
                            value={newProposal.bankFinancingOwn}
                            onChange={(e) => formatCurrencyInputField(e.target.value, "bankFinancingOwn", "bankFinancingOwnRaw")}
                            placeholder="R$ 0,00"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Valor Financiado</label>
                          <input
                            type="text"
                            value={newProposal.bankFinancingValue}
                            onChange={(e) => formatCurrencyInputField(e.target.value, "bankFinancingValue", "bankFinancingValueRaw")}
                            placeholder="R$ 0,00"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Banco</label>
                        <input
                          type="text"
                          value={newProposal.financingBank}
                          onChange={(e) => setNewProposal({ ...newProposal, financingBank: e.target.value })}
                          placeholder="Nome do banco"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                </>)}

                {/* COMISSÃO */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <label className="block text-sm font-medium mb-3">Comissão</label>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="commissionType"
                        checked={newProposal.commissionType === "PERCENTUAL"}
                        onChange={() => setNewProposal({ ...newProposal, commissionType: "PERCENTUAL", commissionValue: "", commissionValueRaw: 0 })}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm">Percentual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="commissionType"
                        checked={newProposal.commissionType === "VALOR"}
                        onChange={() => setNewProposal({ ...newProposal, commissionType: "VALOR", commissionPercent: "" })}
                        className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm">Valor Fixo</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {newProposal.commissionType === "PERCENTUAL" ? (
                      <div>
                        <label className="block text-xs font-medium mb-1">Percentual (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newProposal.commissionPercent}
                          onChange={(e) => setNewProposal({ ...newProposal, commissionPercent: e.target.value })}
                          placeholder="Ex: 6"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium mb-1">Valor da Comissão</label>
                        <input
                          type="text"
                          value={newProposal.commissionValue}
                          onChange={(e) => formatCurrencyInputField(e.target.value, "commissionValue", "commissionValueRaw")}
                          placeholder="R$ 0,00"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium mb-1">Valor Líquido ao Vendedor</label>
                      <div className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold text-sm">
                        {formatCurrency(calculateNetValue())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESUMO DO ESCOPO */}
                <div>
                  <label className="block text-sm font-medium mb-2">Resumo do Escopo</label>
                  <textarea
                    value={newProposal.scopeSummary}
                    onChange={(e) => setNewProposal({ ...newProposal, scopeSummary: e.target.value })}
                    placeholder="Condições gerais, observações, pontos importantes da negociação..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    rows={3}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3 sticky bottom-0 bg-white dark:bg-neutral-900">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProposal}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSaving ? "Salvando..." : "Salvar Proposta"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Contra Oferta */}
      <AnimatePresence>
        {showCounterOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCounterOfferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-600">Contraproposta do Vendedor</h3>
                  <button onClick={() => setShowCounterOfferModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Informe o valor e detalhes da contraproposta do vendedor:
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor da Contraproposta</label>
                  <input
                    type="text"
                    value={counterOfferData.counterOfferValue}
                    onChange={(e) => formatCounterOfferCurrency(e.target.value)}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Detalhes da Contraproposta *</label>
                  <textarea
                    value={counterOfferData.counterOfferDetails}
                    onChange={(e) => setCounterOfferData(prev => ({ ...prev, counterOfferDetails: e.target.value }))}
                    placeholder="Descreva as condições da contraproposta do vendedor..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    rows={4}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
                <button
                  onClick={() => setShowCounterOfferModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitCounterOffer}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                >
                  Enviar Contraproposta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportDropdown({ property, propertyOwner, ownerName, ownerEmail, ownerPhone }: { property: any; propertyOwner: any; ownerName: string; ownerEmail?: string; ownerPhone?: string }) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const reportUrl = `/admin/relatorios/vendedor/${propertyOwner.id}`;

  // Gerar relatório para obter dados resumidos
  const fetchReport = async () => {
    if (reportData) return reportData;
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/reports/owner/${propertyOwner.id}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        return data;
      }
    } catch (e) {
      console.error("Erro ao gerar relatório:", e);
    } finally {
      setGenerating(false);
    }
    return null;
  };

  // Texto do relatório para WhatsApp/Email
  const buildReportText = (data: any) => {
    const s = data.summary;
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    let text = `📊 *Relatório de Imóveis - ${ownerName}*\n`;
    text += `Tappy Imob | ${new Date().toLocaleDateString("pt-BR")}\n\n`;
    text += `📋 *Resumo:*\n`;
    text += `• ${s.totalProperties} imóvel(is) cadastrado(s)\n`;
    text += `• ${s.activeProperties} disponível(is)\n`;
    if (s.soldProperties > 0) text += `• ${s.soldProperties} vendido(s)\n`;
    if (s.rentedProperties > 0) text += `• ${s.rentedProperties} locado(s)\n`;
    text += `\n👁️ *Exposição:*\n`;
    text += `• ${s.totalViews.toLocaleString("pt-BR")} visualizações no site\n`;
    text += `• ${s.totalPortalViews.toLocaleString("pt-BR")} visualizações em portais\n`;
    text += `• ${s.totalFavorites.toLocaleString("pt-BR")} favoritados\n`;
    text += `• ${s.totalShares.toLocaleString("pt-BR")} compartilhamentos\n`;
    if (s.totalVisits > 0) {
      text += `\n🏠 *Visitas:*\n`;
      text += `• ${s.totalVisits} agendada(s), ${s.completedVisits} realizada(s)\n`;
    }
    text += `\n📄 *Detalhes por imóvel:*\n`;
    data.properties.slice(0, 10).forEach((p: any) => {
      const price = p.price ? `R$ ${p.price.toLocaleString("pt-BR")}` : "";
      text += `\n🔹 *#${p.code}* — ${p.title}\n`;
      text += `   ${p.neighborhood}, ${p.city}`;
      if (price) text += ` | ${price}`;
      text += `\n   👁️ ${p.metrics.views} views | ❤️ ${p.metrics.favorites} fav | 📤 ${p.metrics.shares} shares`;
      if (p.metrics.totalVisits > 0) text += ` | 🏠 ${p.metrics.totalVisits} visitas`;
      text += `\n`;
    });
    text += `\n---\nRelatório completo: ${siteUrl}${reportUrl}`;
    return text;
  };

  const handleWhatsApp = async () => {
    const data = await fetchReport();
    if (!data) return;
    const text = buildReportText(data);
    const phone = ownerPhone?.replace(/\D/g, "") || "";
    const url = phone
      ? `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  const handleEmail = async () => {
    const data = await fetchReport();
    if (!data) return;
    const text = buildReportText(data).replace(/\*/g, "");
    const subject = `Relatório de Imóveis — ${ownerName} — Tappy Imob`;
    const mailto = ownerEmail
      ? `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
      : `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(mailto);
    setOpen(false);
  };

  const handleDownloadPDF = () => {
    window.open(reportUrl, "_blank");
    setOpen(false);
  };

  const handleCopyLink = () => {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${siteUrl}${reportUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-medium hover:bg-orange-600 transition-colors flex items-center gap-1.5"
      >
        {generating ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiBarChartLine className="w-4 h-4" />}
        Relatório
        <RiArrowDownSLine className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1.5 z-50"
          >
            <Link
              href={reportUrl}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
              onClick={() => setOpen(false)}
            >
              <RiEyeLine className="w-4 h-4 text-orange-500" />
              Ver Relatório Completo
            </Link>

            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors text-left"
            >
              <RiPrinterLine className="w-4 h-4 text-blue-500" />
              Baixar / Imprimir PDF
            </button>

            <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

            <button
              onClick={handleWhatsApp}
              disabled={generating}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors text-left disabled:opacity-50"
            >
              <RiWhatsappLine className="w-4 h-4 text-green-500" />
              {generating ? "Gerando..." : "Enviar por WhatsApp"}
            </button>

            <button
              onClick={handleEmail}
              disabled={generating}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors text-left disabled:opacity-50"
            >
              <RiMailLine className="w-4 h-4 text-purple-500" />
              {generating ? "Gerando..." : "Enviar por E-mail"}
            </button>

            <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <RiLinkM className="w-4 h-4 text-neutral-500" />
              {copied ? "✅ Link copiado!" : "Copiar Link do Relatório"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabProprietario({ property, onConfirmAvailability, linkedPartner, exclusivityManager, currentUser }: { property: any; onConfirmAvailability?: (propertyId: string) => Promise<void>; linkedPartner?: any; exclusivityManager?: any; currentUser?: any }) {
  // Usar APENAS propertyOwner (proprietário real) — NUNCA property.owner (que é o corretor)
  const propertyOwner = property.propertyOwner;
  const owner = propertyOwner || {
    name: property.ownerNickname || "",
    email: property.ownerEmail || "",
    phones: property.ownerPhones?.filter(Boolean) || [],
    phoneContacts: [],
  };
  const phoneContacts: { name: string; phone: string }[] = Array.isArray(owner.phoneContacts) ? owner.phoneContacts : [];
  const phones = phoneContacts.length > 0 ? phoneContacts.map((p: any) => p.phone) : (owner.phones || (owner.phone ? [owner.phone] : []));
  const [showDetails, setShowDetails] = useState(false);
  const lastLead = property.leadsList?.[0];
  const isThirdPartyNoContact = property.isThirdPartyExclusive && phones.length === 0 && !owner.email;
  
  // Feedback ao proprietário
  const [feedbackInterval, setFeedbackInterval] = useState(property.ownerFeedbackIntervalDays?.toString() || "7");
  const [lastFeedbackDate, setLastFeedbackDate] = useState(property.ownerLastFeedbackDate?.split("T")[0] || "");
  const [feedbackStatus, setFeedbackStatus] = useState(property.ownerFeedbackStatus || "EM_DIA");
  const [savingFeedback, setSavingFeedback] = useState(false);

  const saveFeedback = async (data: Record<string, any>) => {
    setSavingFeedback(true);
    try {
      await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error("Erro ao salvar feedback:", e);
    } finally {
      setSavingFeedback(false);
    }
  };

  // Mensagem para WhatsApp de confirmação de disponibilidade
  const getWhatsAppMessage = () => {
    const nickname = property.ownerNickname || (owner.name || "").split(" ")[0] || "";
    // Usa o primeiro nome do usuário LOGADO (quem está enviando), não do captador
    const corretorName = currentUser?.name?.split(" ")[0] || "equipe Tappy";
    const condoName = property.condominium?.name ? ` no ${property.condominium.name}` : "";
    const formatVal = (v: number) => v ? `R$ ${v.toLocaleString("pt-BR")}` : "";

    let finalidade = "";
    let valorInfo = "";
    if (property.category === "VENDA_LOCACAO") {
      finalidade = "venda e/ou locação";
      const parts = [];
      if (property.price) parts.push(`Venda: ${formatVal(property.price)}`);
      if (property.rentPrice) parts.push(`Locação: ${formatVal(property.rentPrice)}`);
      valorInfo = parts.length > 0 ? `\n${parts.join(" | ")}` : "";
    } else if (property.category === "LOCACAO") {
      finalidade = "locação";
      valorInfo = property.rentPrice ? `\nValor: ${formatVal(property.rentPrice)}` : (property.price ? `\nValor: ${formatVal(property.price)}` : "");
    } else {
      finalidade = "venda";
      valorInfo = property.price ? `\nValor: ${formatVal(property.price)}` : "";
    }

    const msg = `Olá ${nickname}! Tudo bem?\n\nAqui é o(a) ${corretorName}, da Tappy Imob.\n\nGostaria de confirmar se o imóvel *${property.code || ""}*${condoName} continua disponível para ${finalidade}.${valorInfo}\n\nPoderia me confirmar?\n\nFico no aguardo do seu retorno. 🏡`;
    return encodeURIComponent(msg);
  };
  
  const getProfileLabel = (profile: string) => {
    const labels: Record<string, string> = {
      PROPRIETARIO: "Proprietário",
      CORRETOR: "Corretor",
      IMOBILIARIA: "Imobiliária",
      CONSTRUTORA: "Construtora",
    };
    return labels[profile] || profile || "Proprietário";
  };

  const getTemperatureColor = (temp: string) => {
    const colors: Record<string, string> = {
      QUENTE: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
      MORNO: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      FRIO: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    };
    return colors[temp] || "bg-neutral-100 text-neutral-700";
  };
  
  return (
    <div className="space-y-4">
      {/* Último Lead - Destaque */}
      {lastLead && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30">
          <div className="flex items-center gap-2 mb-3">
            <RiUser3Line className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">Último Lead do Formulário</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-blue-300">
              <RiUser3Line className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-neutral-900 dark:text-white truncate">{lastLead.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getTemperatureColor(lastLead.temperature)}`}>
                  {lastLead.temperature === "QUENTE" ? "🔥 Quente" : lastLead.temperature === "MORNO" ? "🌡️ Morno" : "❄️ Frio"}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(lastLead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            <Link
              href={`/admin/leads/${lastLead.id}`}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-shrink-0"
            >
              Ver Lead
            </Link>
          </div>
          {/* Contatos do Lead */}
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-500/30 flex flex-wrap gap-3">
            {lastLead.phone && (
              <a href={`https://wa.me/55${lastLead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                <RiWhatsappLine className="w-4 h-4" />
                {lastLead.phone}
              </a>
            )}
            {lastLead.email && (
              <a href={`mailto:${lastLead.email}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 truncate max-w-[200px]">
                <RiMailLine className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{lastLead.email}</span>
              </a>
            )}
          </div>
          {lastLead.message && (
            <div className="mt-3 p-3 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Mensagem:</p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">{lastLead.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Header do Proprietário - Destaque */}
      <div className={`p-4 bg-gradient-to-r rounded-xl border ${
        isThirdPartyNoContact
          ? "from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 border-purple-200 dark:border-purple-500/30"
          : "from-orange-50 to-emerald-50 dark:from-orange-500/10 dark:to-emerald-500/10 border-orange-200 dark:border-orange-500/30"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ring-2 ${
            isThirdPartyNoContact ? "bg-purple-100 ring-purple-300" : "bg-orange-100 ring-orange-300"
          }`}>
            {owner.avatar ? (
              <img src={owner.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <RiUser3Line className={`w-7 h-7 ${isThirdPartyNoContact ? "text-purple-600" : "text-orange-600"}`} />
            )}
          </div>
          <div className="flex-1">
            <p className={`text-xl font-bold ${isThirdPartyNoContact ? "text-purple-700 dark:text-purple-400" : "text-neutral-900 dark:text-white"}`}>
              {owner.name || "Não informado"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                isThirdPartyNoContact
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
              }`}>
                {getProfileLabel(owner.profile)}
              </span>
              {isThirdPartyNoContact && (
                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 rounded-full font-semibold flex items-center gap-1">
                  🤝 Exclusividade Terceiros
                </span>
              )}
              {isThirdPartyNoContact && exclusivityManager && (
                <span className="px-2 py-0.5 text-xs bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 rounded-full font-medium">
                  Gestão: {exclusivityManager.name}
                </span>
              )}
              {linkedPartner && (
                <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-full font-semibold flex items-center gap-1">
                  <RiShakeHandsLine className="w-3 h-3" />
                  Gestor de Parceria
                </span>
              )}
              {owner.profiles && owner.profiles.map((profile: string) => (
                <span key={profile} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full">
                  {profile === "CONSTRUTOR" ? "🏗️ Construtor" : profile === "INVESTIDOR" ? "💰 Investidor" : profile}
                </span>
              ))}
            </div>
          </div>
          <ReportDropdown property={property} propertyOwner={propertyOwner || owner} ownerName={owner.name || "Não informado"} ownerEmail={owner.email} ownerPhone={phones[0]} />
        </div>
        {isThirdPartyNoContact && (
          <div className="mt-3 p-3 bg-purple-100/50 dark:bg-purple-500/10 rounded-lg border border-purple-200/50 dark:border-purple-500/20">
            <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">
              Sem contato direto do proprietário — gestão via {exclusivityManager?.name || "parceiro de exclusividade"}.
              {exclusivityManager?.phone && (
                <a href={`https://wa.me/55${exclusivityManager.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-purple-900">
                  Contatar parceiro
                </a>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Destaque: Gestor de Parceria */}
      {linkedPartner && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
          <div className="flex items-center gap-2 mb-3">
            <RiShakeHandsLine className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Gestor de Parceria</span>
            <span className={`ml-auto px-2 py-0.5 text-[10px] rounded-full font-medium ${linkedPartner.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
              {linkedPartner.isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
              <p className="text-[10px] text-indigo-500 uppercase font-medium">Formato</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {linkedPartner.partnershipFormat === "FIFTY_PADRAO" ? "50/50 Padrão" : linkedPartner.partnershipFormat === "PARCEIRO_PREMIUM" ? "Parceiro Premium" : "Captador"}
              </p>
            </div>
            <div className="p-2.5 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
              <p className="text-[10px] text-indigo-500 uppercase font-medium">Tipo</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {linkedPartner.type === "CORRETOR" ? "Corretor" : linkedPartner.type === "IMOBILIARIA" ? "Imobiliária" : linkedPartner.type === "CORRESPONDENTE_BANCARIO" ? "Corresp. Bancário" : linkedPartner.type === "ARQUITETO" ? "Arquiteto" : linkedPartner.type === "CONSTRUTORA" ? "Construtora" : linkedPartner.type}
              </p>
            </div>
            {linkedPartner.creci && (
              <div className="p-2.5 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                <p className="text-[10px] text-indigo-500 uppercase font-medium">CRECI</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {linkedPartner.creci}
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded ${linkedPartner.creciStatus === "ATIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {linkedPartner.creciStatus}
                  </span>
                </p>
              </div>
            )}
            {linkedPartner.agency && (
              <div className="p-2.5 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                <p className="text-[10px] text-indigo-500 uppercase font-medium">Imobiliária</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  {linkedPartner.agency.tradeName || linkedPartner.agency.companyName}
                </p>
              </div>
            )}
            {linkedPartner.partnershipTermStatus && linkedPartner.partnershipTermStatus !== "SEM_CONTRATO" && (
              <div className="p-2.5 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                <p className="text-[10px] text-indigo-500 uppercase font-medium">Contrato</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {linkedPartner.partnershipTermStatus === "ASSINADO" ? "✅ Assinado" : "📤 Enviado"}
                </p>
              </div>
            )}
            {(linkedPartner.totalContracts > 0 || linkedPartner.totalVGV > 0) && (
              <div className="p-2.5 bg-white/60 dark:bg-neutral-800/60 rounded-lg">
                <p className="text-[10px] text-indigo-500 uppercase font-medium">Negócios</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {linkedPartner.totalContracts} contrato{linkedPartner.totalContracts !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
          <Link
            href={`/admin/parcerias/${linkedPartner.id}`}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RiShakeHandsLine className="w-4 h-4" />
            Ver Perfil do Parceiro
          </Link>
        </div>
      )}

      {/* Botão WhatsApp para Confirmar Disponibilidade */}
      {onConfirmAvailability && phones.length > 0 && (
        <div className="space-y-2">
          {/* Botão WhatsApp - Principal (registra contato ao clicar) */}
          <a
            href={`https://wa.me/55${phones[0].replace(/\D/g, "")}?text=${getWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onConfirmAvailability(property.id)}
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RiWhatsappLine className="w-5 h-5" />
            Confirmar Disponibilidade via WhatsApp
          </a>
          
          {/* Info de último contato */}
          {property.lastAvailabilityCheck && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <span className="font-medium">Último contato:</span>{" "}
              {property.availabilityConfirmedBy?.name || "—"} | {new Date(property.lastAvailabilityCheck).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} - {new Date(property.lastAvailabilityCheck).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      )}
      
      {/* Fallback se não tiver telefone - apenas botão de registro */}
      {onConfirmAvailability && phones.length === 0 && (
        <div>
          <button
            onClick={() => onConfirmAvailability(property.id)}
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RiCheckLine className="w-5 h-5" />
            Confirmar Disponibilidade
          </button>
          <p className="text-xs text-neutral-500 text-center mt-1.5">
            Última confirmação: {property.lastAvailabilityCheck ? new Date(property.lastAvailabilityCheck).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Nunca"}
          </p>
        </div>
      )}

      {/* Lembrete de Feedback ao Proprietário */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-orange-200 dark:border-orange-500/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <RiNotification3Line className="w-5 h-5 text-orange-500" />
          <p className="text-xs text-neutral-500 uppercase font-medium">Lembrete de Feedback ao Proprietário</p>
          {savingFeedback && <RiLoader4Line className="w-3.5 h-3.5 text-orange-500 animate-spin ml-auto" />}
        </div>

        {/* Status do Feedback */}
        <div className="flex items-center justify-between mb-3 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            {feedbackStatus === "EM_DIA" ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Em Dia
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Atrasado
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => { setFeedbackStatus("EM_DIA"); saveFeedback({ ownerFeedbackStatus: "EM_DIA" }); }}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                feedbackStatus === "EM_DIA" 
                  ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-500/20" 
                  : "border-neutral-200 dark:border-neutral-700 hover:border-green-300"
              }`}
            >
              Em Dia
            </button>
            <button
              type="button"
              onClick={() => { setFeedbackStatus("ATRASADO"); saveFeedback({ ownerFeedbackStatus: "ATRASADO" }); }}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                feedbackStatus === "ATRASADO" 
                  ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/20" 
                  : "border-neutral-200 dark:border-neutral-700 hover:border-red-300"
              }`}
            >
              Atrasado
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Intervalo (dias)</label>
            <select
              value={feedbackInterval}
              onChange={(e) => {
                setFeedbackInterval(e.target.value);
                saveFeedback({ ownerFeedbackIntervalDays: parseInt(e.target.value) });
              }}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
            >
              <option value="7">7 dias</option>
              <option value="14">14 dias</option>
              <option value="21">21 dias</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="90">90 dias</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Último Feedback</label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={lastFeedbackDate}
                onChange={(e) => setLastFeedbackDate(e.target.value)}
                onBlur={() => saveFeedback({ ownerLastFeedbackDate: lastFeedbackDate || null })}
                className="flex-1 px-2.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm min-w-0"
              />
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setLastFeedbackDate(today);
                  saveFeedback({ ownerLastFeedbackDate: today });
                }}
                className="px-2.5 py-2 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors flex-shrink-0"
                title="Marcar hoje"
              >
                Hoje
              </button>
            </div>
          </div>
        </div>
        {lastFeedbackDate && (
          <p className="text-xs text-neutral-500 mt-2">
            ⏰ Próximo lembrete em: {(() => {
              const lastDate = new Date(lastFeedbackDate);
              const interval = parseInt(feedbackInterval) || 7;
              const nextDate = new Date(lastDate.getTime() + interval * 24 * 60 * 60 * 1000);
              const today = new Date();
              const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              if (daysUntil < 0) return `${Math.abs(daysUntil)} dia(s) atrasado`;
              if (daysUntil === 0) return "Hoje";
              return `${daysUntil} dia(s)`;
            })()}
          </p>
        )}
      </div>

      {/* Expandir Dados Pessoais */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-3 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <span className="font-medium text-sm">Dados Pessoais e Endereço</span>
          <motion.span
            animate={{ rotate: showDetails ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <RiArrowLeftLine className="w-4 h-4 rotate-[-90deg]" />
          </motion.span>
        </button>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4 border-t border-neutral-200 dark:border-neutral-700">
                {/* Contato - Telefones */}
                <div className="space-y-2">
                  <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-medium">Telefone(s)</p>
                  {phoneContacts.length > 0 ? (
                    <div className="space-y-2">
                      {phoneContacts.map((contact: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 bg-green-50 dark:bg-green-500/10 rounded-lg">
                          <div className="flex-1">
                            {contact.name && (
                              <p className="text-[10px] text-neutral-500 mb-0.5">{contact.name}</p>
                            )}
                            <a href={`tel:${contact.phone}`} className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1">
                              <RiPhoneLine className="w-3.5 h-3.5" />
                              {contact.phone}
                            </a>
                          </div>
                          <a
                            href={`https://wa.me/55${contact.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30"
                            title="WhatsApp"
                          >
                            <RiWhatsappLine className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : phones.length > 0 ? (
                    <div className="space-y-2">
                      {phones.map((phone: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 bg-green-50 dark:bg-green-500/10 rounded-lg">
                          <a href={`tel:${phone}`} className="flex-1 text-sm font-medium text-green-600 hover:underline flex items-center gap-1">
                            <RiPhoneLine className="w-3.5 h-3.5" />
                            {phone}
                          </a>
                          <a
                            href={`https://wa.me/55${phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30"
                            title="WhatsApp"
                          >
                            <RiWhatsappLine className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 p-2.5">Nenhum telefone cadastrado</p>
                  )}
                </div>

                {/* E-mail */}
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase">E-mail</p>
                  <p className="text-sm font-medium truncate">
                    {owner.email ? (
                      <a href={`mailto:${owner.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                        <RiMailLine className="w-3.5 h-3.5" />
                        {owner.email}
                      </a>
                    ) : "—"}
                  </p>
                </div>

                {/* Dados Pessoais */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase">CPF</p>
                    <p className="text-sm font-medium">{owner.cpf || "—"}</p>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase">RG</p>
                    <p className="text-sm font-medium">{owner.rg || "—"}</p>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase">Nascimento</p>
                    <p className="text-sm font-medium">{owner.birthDate ? new Date(owner.birthDate).toLocaleDateString("pt-BR") : "—"}</p>
                  </div>
                  <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-[10px] text-neutral-500 uppercase">Estado Civil</p>
                    <p className="text-sm font-medium">{owner.maritalStatus || "—"}</p>
                  </div>
                </div>

                {/* Endereço */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-[10px] text-neutral-500 uppercase mb-1">Endereço Residencial</p>
                  {owner.residentialAddress || owner.residentialCity ? (
                    <div className="flex items-start gap-2">
                      <RiMapPinLine className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">
                          {owner.residentialAddress || ""}
                          {owner.residentialNumber && `, ${owner.residentialNumber}`}
                          {owner.residentialComplement && ` - ${owner.residentialComplement}`}
                        </p>
                        <p className="text-neutral-500">
                          {owner.residentialNeighborhood && `${owner.residentialNeighborhood}, `}
                          {owner.residentialCity || ""} {owner.residentialState && `- ${owner.residentialState}`}
                          {owner.residentialZipCode && ` • CEP: ${owner.residentialZipCode}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">Não informado</p>
                  )}
                </div>

                {/* Notas */}
                {owner.notes && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
                    <p className="text-[10px] text-yellow-700 dark:text-yellow-400 uppercase mb-1">Observações</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                      {owner.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Proprietário Anterior - Expansível */}
      {property.ownerHistory?.filter((h: any) => h.type === "ANTERIOR").length > 0 && (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
          <details className="group">
            <summary className="w-full p-3 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer list-none">
              <span className="font-medium text-sm flex items-center gap-2">
                <RiHistoryLine className="w-4 h-4 text-neutral-400" />
                Proprietários Anteriores
                <span className="px-1.5 py-0.5 text-[10px] bg-neutral-200 dark:bg-neutral-700 rounded-full">
                  {property.ownerHistory?.filter((h: any) => h.type === "ANTERIOR").length}
                </span>
              </span>
              <RiArrowDownSLine className="w-4 h-4 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 space-y-3 border-t border-neutral-200 dark:border-neutral-700">
              {property.ownerHistory?.filter((h: any) => h.type === "ANTERIOR").map((hist: any, idx: number) => (
                <div key={hist.id || idx} className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{hist.name}</p>
                    {hist.endDate && (
                      <span className="text-xs text-neutral-500">
                        até {new Date(hist.endDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {hist.cpf && <p className="text-neutral-500">CPF: {hist.cpf}</p>}
                    {hist.phone && <p className="text-neutral-500">Tel: {hist.phone}</p>}
                    {hist.email && <p className="text-neutral-500 col-span-2">Email: {hist.email}</p>}
                  </div>
                  {hist.notes && (
                    <p className="text-xs text-neutral-500 mt-2 italic">{hist.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Dados da Prefeitura (IPTU) - Expansível + Importação da Base */}
      <IptuSection property={property} ownerName={owner.name} />
    </div>
  );
}

function IptuSection({ property, ownerName }: { property: any; ownerName: string }) {
  const [iptuResults, setIptuResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [importedData, setImportedData] = useState({
    prefeituraOwnerName: property.prefeituraOwnerName || "",
    prefeituraOwnerCpf: property.prefeituraOwnerCpf || "",
    prefeituraInscricao: property.prefeituraInscricao || "",
  });

  const searchIptu = async () => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/iptu`);
      if (res.ok) {
        const data = await res.json();
        setIptuResults(data.items || []);
      }
    } catch (e) {
      console.error("Erro ao buscar IPTU:", e);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const importIptu = async (iptuId: string) => {
    setIsImporting(true);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/iptu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iptuId }),
      });
      if (res.ok) {
        const data = await res.json();
        setImportedData({
          prefeituraOwnerName: data.property.prefeituraOwnerName || "",
          prefeituraOwnerCpf: data.property.prefeituraOwnerCpf || "",
          prefeituraInscricao: data.property.prefeituraInscricao || "",
        });
        setIptuResults([]);
        setHasSearched(false);
      }
    } catch (e) {
      console.error("Erro ao importar IPTU:", e);
    } finally {
      setIsImporting(false);
    }
  };

  const hasData = importedData.prefeituraOwnerName || importedData.prefeituraInscricao;

  return (
    <div className="border border-purple-200 dark:border-purple-500/30 rounded-xl overflow-hidden">
      <details className="group" open={!!hasData}>
        <summary className="w-full p-3 flex items-center justify-between bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors cursor-pointer list-none">
          <span className="font-medium text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <RiBuilding4Line className="w-4 h-4" />
            Dados da Prefeitura (IPTU)
            {!hasData && <span className="text-[10px] bg-purple-200 dark:bg-purple-500/30 px-1.5 py-0.5 rounded">Sem dados</span>}
          </span>
          <RiArrowDownSLine className="w-4 h-4 text-purple-600 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="p-4 space-y-3 border-t border-purple-200 dark:border-purple-500/30">
          {hasData ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase">Proprietário Prefeitura</p>
                  <p className="text-sm font-medium">{importedData.prefeituraOwnerName || "—"}</p>
                </div>
                <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase">CPF/CNPJ</p>
                  <p className="text-sm font-medium">{importedData.prefeituraOwnerCpf || "—"}</p>
                </div>
                <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg col-span-2">
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase">Inscrição Imobiliária</p>
                  <p className="text-sm font-medium">{importedData.prefeituraInscricao || "—"}</p>
                </div>
              </div>
              {importedData.prefeituraOwnerName && importedData.prefeituraOwnerName !== ownerName && (
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <RiAlertLine className="w-4 h-4" />
                    Atenção: O nome do proprietário na prefeitura é diferente do cadastro atual.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-2">Nenhum dado de IPTU vinculado a este imóvel.</p>
          )}

          {/* Botão Buscar na Base IPTU */}
          <button
            onClick={searchIptu}
            disabled={isSearching}
            className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <><RiLoader4Line className="w-4 h-4 animate-spin" /> Buscando...</>
            ) : (
              <><RiDatabase2Line className="w-4 h-4" /> {hasData ? "Atualizar da Base IPTU" : "Buscar na Base IPTU"}</>
            )}
          </button>

          {/* Resultados da busca */}
          {hasSearched && iptuResults.length === 0 && !isSearching && (
            <p className="text-xs text-neutral-500 text-center">Nenhum registro IPTU correspondente encontrado na base.</p>
          )}

          {iptuResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-purple-600 font-medium">{iptuResults.length} registro(s) encontrado(s):</p>
              {iptuResults.map((item: any) => (
                <div key={item.id} className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-purple-100 dark:border-purple-500/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.contribuinte || "Sem nome"}</p>
                      <p className="text-xs text-neutral-500 truncate">{item.address}{item.number ? `, ${item.number}` : ""} — {item.neighborhood}</p>
                      {item.inscricaoImobiliaria && (
                        <p className="text-[10px] text-purple-600 mt-0.5">Inscrição: {item.inscricaoImobiliaria}</p>
                      )}
                      <span className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded font-medium ${
                        item.matchType === "VINCULADO" ? "bg-green-100 text-green-700" :
                        item.matchType === "INSCRICAO" ? "bg-blue-100 text-blue-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {item.matchType === "VINCULADO" ? "Vinculado" : item.matchType === "INSCRICAO" ? "Mesma Inscrição" : "Endereço Similar"}
                      </span>
                    </div>
                    <button
                      onClick={() => importIptu(item.id)}
                      disabled={isImporting}
                      className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0 disabled:opacity-50"
                    >
                      {isImporting ? "..." : "Importar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

function TabDocumentos({ property }: { property: any }) {
  // documents vem como array do Prisma (PropertyDocument[]), pegar o primeiro item
  const initialDocs = Array.isArray(property.documents) ? property.documents[0] || {} : property.documents || {};
  const [documents, setDocuments] = useState<any>(initialDocs);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  // Carregar documentos da API ao montar
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`/api/admin/properties/${property.id}/documents`);
        if (res.ok) {
          const data = await res.json();
          if (data.documents) {
            setDocuments(data.documents);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar documentos:", error);
      }
    };
    fetchDocs();
  }, [property.id]);

  const handleFileUpload = async (docType: string, file: File) => {
    setIsUploading(docType);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `documents/${property.id}`);
      formData.append("skipWatermark", "true");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Erro no upload");

      const { url } = await uploadRes.json();

      // Salvar URL no banco
      const urlField = `${docType}Url`;
      const updateRes = await fetch(`/api/admin/properties/${property.id}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [urlField]: url }),
      });

      if (updateRes.ok) {
        const { documents: updatedDocs } = await updateRes.json();
        setDocuments(updatedDocs);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload do documento");
    } finally {
      setIsUploading(null);
    }
  };

  const handleSaveNumber = async (docType: string, field: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: tempValue }),
      });

      if (res.ok) {
        const { documents: updatedDocs } = await res.json();
        setDocuments(updatedDocs);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
    setEditingField(null);
    setTempValue("");
  };

  const openFileInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  const docRows = [
    { title: "Matrícula", docType: "matricula", numberField: "matriculaNumber", urlField: "matriculaUrl", numberLabel: "Nº" },
    { title: "IPTU", docType: "iptu", numberField: "iptuNumber", urlField: "iptuUrl", numberLabel: "Inscrição" },
    { title: "Certidão SPU", docType: "certidaoSPU", numberField: "certidaoSPU", urlField: "certidaoSPUUrl", numberLabel: "Nº" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          📄 Mantenha a documentação sempre atualizada para agilizar o processo de venda
        </p>
      </div>

      <div className="space-y-3">
        {docRows.map(({ title, docType, numberField, urlField, numberLabel }) => {
          const number = documents?.[numberField];
          const url = documents?.[urlField];
          return (
            <div key={docType} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
              <div className="flex items-center gap-3 flex-1">
                <RiFileList3Line className="w-5 h-5 text-neutral-400" />
                <div className="flex-1">
                  <p className="font-medium">{title}</p>
                  {editingField === numberField ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        placeholder={numberLabel}
                        className="px-2 py-1 text-sm border rounded bg-white dark:bg-neutral-800"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveNumber(docType, numberField)}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => { setEditingField(null); setTempValue(""); }}
                        className="px-2 py-1 text-xs bg-neutral-200 rounded hover:bg-neutral-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <p 
                      className="text-sm text-neutral-500 cursor-pointer hover:text-orange-500"
                      onClick={() => { setEditingField(numberField); setTempValue(number || ""); }}
                    >
                      {numberLabel}: {number || "Clique para informar"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {url ? (
                  <>
                    <button
                      onClick={() => openFileInNewTab(url)}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1"
                    >
                      <RiExternalLinkLine className="w-4 h-4" />
                      Ver anexo
                    </button>
                    <label className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 cursor-pointer">
                      Substituir
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(docType, file);
                        }}
                      />
                    </label>
                  </>
                ) : (
                  <label className={`px-3 py-1.5 text-sm border border-orange-300 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 cursor-pointer flex items-center gap-1 ${isUploading === docType ? "opacity-50" : ""}`}>
                    {isUploading === docType ? (
                      <>
                        <RiLoader4Line className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <RiUploadCloud2Line className="w-4 h-4" />
                        Anexar
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      disabled={isUploading === docType}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(docType, file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabObservacoes({ property }: { property: any }) {
  const [observations, setObservations] = useState<any[]>([]);
  const [newObservation, setNewObservation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Carregar observações
  useEffect(() => {
    const fetchObservations = async () => {
      try {
        const res = await fetch(`/api/admin/properties/${property.id}/observations`);
        if (res.ok) {
          const data = await res.json();
          setObservations(data.observations || []);
        }
      } catch (error) {
        console.error("Erro ao carregar observações:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchObservations();
  }, [property.id]);

  // Salvar nova observação
  const handleSaveObservation = async () => {
    if (!newObservation.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newObservation }),
      });
      if (res.ok) {
        const data = await res.json();
        setObservations([data.observation, ...observations]);
        setNewObservation("");
      }
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fixar/Desfixar observação
  const handleTogglePin = async (obsId: string, currentPinned: boolean) => {
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/observations/${obsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });
      if (res.ok) {
        setObservations(observations.map(obs => 
          obs.id === obsId ? { ...obs, isPinned: !currentPinned } : obs
        ));
      }
    } catch (error) {
      console.error("Erro ao fixar observação:", error);
    }
  };

  // Editar observação
  const handleStartEdit = (obs: any) => {
    setEditingId(obs.id);
    setEditContent(obs.content || obs.text || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    setIsEditSaving(true);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/observations/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        setObservations(observations.map(obs =>
          obs.id === editingId ? { ...obs, content: editContent } : obs
        ));
        setEditingId(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Erro ao editar observação:", error);
    } finally {
      setIsEditSaving(false);
    }
  };

  // Excluir observação
  const handleDelete = async (obsId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta observação?")) return;
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/observations/${obsId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setObservations(observations.filter(obs => obs.id !== obsId));
      }
    } catch (error) {
      console.error("Erro ao excluir observação:", error);
    }
  };

  // Separar observações fixadas e normais
  const pinnedObservations = observations.filter(obs => obs.isPinned);
  const normalObservations = observations.filter(obs => !obs.isPinned);

  return (
    <div className="space-y-6">
      {/* Observação do cadastro (brokerNotes) */}
      {property.brokerNotes && (
        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">📝 Observação do Cadastro</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full">Formulário</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-400 whitespace-pre-line">{property.brokerNotes}</p>
        </div>
      )}

      {/* Observações Fixadas */}
      {pinnedObservations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2 text-red-600">
            📌 Notas Importantes ({pinnedObservations.length})
          </h4>
          <div className="space-y-3">
            {pinnedObservations.map((obs: any) => (
              <div key={obs.id} className="p-4 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <RiUser3Line className="w-3 h-3 text-red-600" />
                    </div>
                    <span className="font-medium text-sm">{obs.userName || obs.user?.name || "Corretor"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">
                      {new Date(obs.createdAt || obs.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => handleStartEdit(obs)}
                      className="p-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 text-red-400 hover:text-red-600"
                      title="Editar"
                    >
                      <RiEditLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(obs.id)}
                      className="p-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 text-red-400 hover:text-red-600"
                      title="Excluir"
                    >
                      <RiDeleteBinLine className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleTogglePin(obs.id, true)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                      title="Desfixar nota"
                    >
                      📌
                    </button>
                  </div>
                </div>
                {editingId === obs.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-red-300 dark:border-red-500/30 bg-white dark:bg-neutral-800 text-sm resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isEditSaving}
                        className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        {isEditSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditContent(""); }}
                        className="px-3 py-1 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-line font-medium">
                    {obs.content || obs.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nova observação */}
      <div className="space-y-3">
        <h4 className="font-semibold">Nova Observação</h4>
        <textarea
          value={newObservation}
          onChange={(e) => setNewObservation(e.target.value)}
          placeholder="Adicione uma observação sobre este imóvel..."
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 resize-none"
          rows={3}
        />
        <button
          onClick={handleSaveObservation}
          disabled={isSaving || !newObservation.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RiAddLine className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Adicionar Observação"}
        </button>
      </div>

      {/* Lista de observações */}
      <div className="space-y-4">
        <h4 className="font-semibold">Histórico de Observações ({normalObservations.length})</h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RiLoader4Line className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : normalObservations.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            Nenhuma observação registrada
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-4">
              {normalObservations.map((obs: any, idx: number) => (
                <div key={obs.id} className="relative pl-10">
                  <div className={`absolute left-2.5 w-3 h-3 rounded-full ${idx === 0 ? "bg-orange-500 ring-2 ring-orange-300" : "bg-orange-500"}`} />
                  <div className={`p-4 rounded-xl ${idx === 0 ? "bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30" : "bg-neutral-50 dark:bg-neutral-900"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                          <RiUser3Line className="w-3 h-3 text-orange-600" />
                        </div>
                        <span className="font-medium text-sm">{obs.userName || obs.user?.name || "Corretor"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">
                          {new Date(obs.createdAt || obs.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <button
                          onClick={() => handleStartEdit(obs)}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-blue-500"
                          title="Editar"
                        >
                          <RiEditLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(obs.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500"
                          title="Excluir"
                        >
                          <RiDeleteBinLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleTogglePin(obs.id, false)}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500"
                          title="Fixar nota importante"
                        >
                          📌
                        </button>
                      </div>
                    </div>
                    {editingId === obs.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={isEditSaving}
                            className="px-3 py-1 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                          >
                            {isEditSaving ? "Salvando..." : "Salvar"}
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditContent(""); }}
                            className="px-3 py-1 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                        {obs.content || obs.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabHistorico({ property }: { property: any }) {
  const [filter, setFilter] = useState<string>("todos");

  const fieldLabels: Record<string, string> = {
    price: "Preço de Venda", rentPrice: "Preço de Locação", status: "Status",
    saleStatus: "Status de Venda", rentalStatus: "Status de Locação",
    title: "Título", description: "Descrição", category: "Finalidade",
    type: "Tipo do Imóvel", condition: "Condição", bedrooms: "Dormitórios",
    suites: "Suítes", bathrooms: "Banheiros", parkingSpaces: "Vagas de Garagem",
    area: "Área (m²)", totalArea: "Área Total (m²)", usefulArea: "Área Útil (m²)",
    address: "Endereço", number: "Número", complement: "Complemento",
    neighborhood: "Bairro", city: "Cidade", state: "Estado",
    isFeatured: "Destaque", isExclusive: "Exclusivo",
    soldBy: "Vendido por", soldAt: "Data da Venda", soldPrice: "Preço de Venda Final",
    condoFee: "Taxa de Condomínio", iptu: "IPTU", floor: "Andar",
    totalFloors: "Total de Andares", yearBuilt: "Ano de Construção",
    hasPlate: "Possui Placa", showOnWebsite: "Visível no Site", isOffMarket: "Off-Market",
    thumbnail: "Foto Principal", videoYoutube: "Vídeo YouTube", virtualTour: "Tour Virtual",
    acceptsFinancing: "Aceita Financiamento", acceptsFGTS: "Aceita FGTS",
    acceptsExchange: "Aceita Permuta", isNegotiable: "Negociável",
  };

  const getFieldLabel = (field: string) => {
    if (field.includes(":")) {
      const [fieldName] = field.split(":");
      return fieldLabels[fieldName.trim()] || fieldName;
    }
    return fieldLabels[field] || field;
  };

  const statusLabels: Record<string, string> = {
    DISPONIVEL: "Disponível", ATIVO: "Ativo", VENDIDO: "Vendido",
    ALUGADO: "Alugado", SUSPENSO: "Suspenso", INDISPONIVEL: "Indisponível", INATIVO: "Indisponível",
  };
  const statusColors: Record<string, string> = {
    DISPONIVEL: "text-green-600", ATIVO: "text-green-600", VENDIDO: "text-blue-600",
    ALUGADO: "text-purple-600", SUSPENSO: "text-amber-600", INDISPONIVEL: "text-red-600", INATIVO: "text-neutral-600",
  };

  const stripHtml = (html: string) => {
    try { return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); } catch { return html; }
  };

  const formatValue = (field: string, value: string) => {
    if (!value || value === "null" || value === "undefined") return "—";
    if (value === "true") return "Sim";
    if (value === "false") return "Não";
    const enumLabels: Record<string, string> = {
      VENDA: "Venda", LOCACAO: "Locação", VENDA_LOCACAO: "Venda e Locação",
      APARTAMENTO: "Apartamento", CASA: "Casa", TERRENO: "Terreno", COMERCIAL: "Comercial",
      COBERTURA: "Cobertura", STUDIO: "Studio", SOBRADO: "Sobrado",
      NOVO: "Novo", USADO: "Usado", NA_PLANTA: "Na Planta", EM_CONSTRUCAO: "Em Construção",
    };
    if (enumLabels[value]) return enumLabels[value];
    if (field.includes("price") || field.includes("Price") || field === "condoFee" || field === "iptu" || field === "soldPrice") {
      const num = parseFloat(value);
      if (!isNaN(num)) return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(num);
    }
    if (statusLabels[value]) return statusLabels[value];
    if (field === "description" || value.includes("<")) return stripHtml(value).substring(0, 150) + (stripHtml(value).length > 150 ? "..." : "");
    return value;
  };

  // Construir timeline unificada
  const timelineItems: Array<{
    id: string;
    date: string;
    type: "changelog" | "visit" | "proposal" | "exclusivity" | "observation" | "creation" | "whatsapp";
    icon: string;
    color: string;
    title: string;
    description: string;
    user: string;
    details?: { oldValue?: string; newValue?: string; field?: string };
  }> = [];

  // Item de criação
  const cadastroLog = (property.changelog || []).find((l: any) => l.field?.includes("Importado da planilha - Cadastro"));
  timelineItems.push({
    id: "creation",
    date: property.createdAt,
    type: "creation",
    icon: "📝",
    color: "bg-green-500",
    title: "Imóvel Cadastrado",
    description: `Código ${property.code}`,
    user: cadastroLog?.userName || property.owner?.name || "Sistema",
  });

  // Changelog entries
  for (const log of (property.changelog || [])) {
    const isStatus = log.field?.includes("status") || log.field?.includes("Status");
    const isPrice = log.field?.includes("price") || log.field?.includes("Price");
    const isImport = log.field?.includes("Importado");

    const isWhatsApp = log.field?.includes("Contato via WhatsApp");

    let color = "bg-orange-500";
    let icon = "🔄";
    if (isWhatsApp) { color = "bg-green-500"; icon = "📱"; }
    else if (isStatus) { color = "bg-blue-500"; icon = "🔀"; }
    else if (isPrice) { color = "bg-emerald-500"; icon = "💰"; }
    else if (isImport) { color = "bg-neutral-400"; icon = "📥"; }
    else if (log.field?.includes("showOnWebsite") || log.field?.includes("isOffMarket")) { color = "bg-purple-500"; icon = "🌐"; }
    else if (log.field?.includes("isExclusive") || log.field?.includes("isFeatured")) { color = "bg-yellow-500"; icon = "⭐"; }

    timelineItems.push({
      id: `cl-${log.id}`,
      date: log.createdAt || log.date,
      type: isWhatsApp ? "whatsapp" : "changelog",
      icon,
      color,
      title: isWhatsApp ? "Contato via WhatsApp" : getFieldLabel(log.field),
      description: isWhatsApp ? "Visitante clicou no botão de WhatsApp do site" : "",
      user: log.userName || "Sistema",
      details: isWhatsApp ? undefined : { oldValue: log.oldValue, newValue: log.newValue, field: log.field },
    });
  }

  // Visitas
  for (const visit of (property.visitRecords || [])) {
    const statusMap: Record<string, string> = {
      AGENDADA: "Visita agendada", CONFIRMADA: "Visita confirmada",
      REALIZADA: "Visita realizada", CANCELADA: "Visita cancelada", NO_SHOW: "No-show na visita",
    };
    timelineItems.push({
      id: `visit-${visit.id}`,
      date: visit.visitDate || visit.createdAt,
      type: "visit",
      icon: "🏠",
      color: visit.status === "CANCELADA" || visit.status === "NO_SHOW" ? "bg-red-500" : "bg-green-500",
      title: statusMap[visit.status] || `Visita — ${visit.status}`,
      description: [
        visit.clientName && `Cliente: ${visit.clientName}`,
        visit.brokerName && `Corretor: ${visit.brokerName}`,
        visit.feedback && `Feedback: ${visit.feedback}`,
      ].filter(Boolean).join(" • "),
      user: visit.brokerName || visit.createdByName || "—",
    });
  }

  // Propostas
  for (const proposal of (property.proposals || [])) {
    const statusMap: Record<string, string> = {
      PENDENTE: "Proposta recebida", ACEITA: "Proposta aceita",
      RECUSADA: "Proposta recusada", CONTRA_PROPOSTA: "Contraproposta",
      CANCELADA: "Proposta cancelada", EXPIRADA: "Proposta expirada",
    };
    const colorMap: Record<string, string> = {
      PENDENTE: "bg-amber-500", ACEITA: "bg-green-500", RECUSADA: "bg-red-500",
      CONTRA_PROPOSTA: "bg-blue-500", CANCELADA: "bg-neutral-500", EXPIRADA: "bg-neutral-400",
    };
    const valor = proposal.proposedValue ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(proposal.proposedValue) : "";
    timelineItems.push({
      id: `prop-${proposal.id}`,
      date: proposal.createdAt,
      type: "proposal",
      icon: "📋",
      color: colorMap[proposal.status] || "bg-amber-500",
      title: statusMap[proposal.status] || `Proposta — ${proposal.status}`,
      description: [
        valor && `Valor: ${valor}`,
        proposal.clientName && `Cliente: ${proposal.clientName}`,
        proposal.notes && `Obs: ${proposal.notes}`,
      ].filter(Boolean).join(" • "),
      user: proposal.brokerName || proposal.createdByName || "—",
    });
  }

  // Visitas Agendadas (modelo novo - ScheduledVisit)
  for (const svp of (property.scheduledVisitProperties || [])) {
    const visit = svp.visit;
    if (!visit) continue;
    const statusMap: Record<string, string> = {
      AGENDADA: "Visita agendada", CONFIRMADA: "Visita confirmada",
      REALIZADA: "Visita realizada", CANCELADA: "Visita cancelada",
      REAGENDADA: "Visita reagendada", NAO_COMPARECEU: "Não compareceu",
    };
    const clientName = visit.lead?.name || visit.visitorName || "";
    timelineItems.push({
      id: `sv-${svp.id}`,
      date: visit.date,
      type: "visit",
      icon: "📅",
      color: visit.status === "CANCELADA" || visit.status === "NAO_COMPARECEU" ? "bg-red-500" : visit.status === "REALIZADA" ? "bg-green-500" : "bg-blue-500",
      title: statusMap[visit.status] || `Visita — ${visit.status}`,
      description: [
        clientName && `Cliente: ${clientName}`,
        visit.corretor?.name && `Corretor: ${visit.corretor.name}`,
        visit.time && `Horário: ${visit.time}`,
      ].filter(Boolean).join(" • "),
      user: visit.corretor?.name || "—",
    });
  }

  // Histórico de preços
  for (const ph of (property.priceHistory || [])) {
    const oldVal = ph.oldValue ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(ph.oldValue) : "—";
    const newVal = ph.newValue ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(ph.newValue) : "—";
    const diff = ph.oldValue && ph.newValue ? ((ph.newValue - ph.oldValue) / ph.oldValue * 100).toFixed(1) : null;
    const isIncrease = ph.newValue > ph.oldValue;
    timelineItems.push({
      id: `ph-${ph.id}`,
      date: ph.createdAt,
      type: "changelog",
      icon: isIncrease ? "📈" : "📉",
      color: isIncrease ? "bg-green-500" : "bg-red-500",
      title: `${ph.field === "rentPrice" ? "Preço Locação" : "Preço Venda"} ${isIncrease ? "aumentou" : "reduziu"}`,
      description: `${oldVal} → ${newVal}${diff ? ` (${isIncrease ? "+" : ""}${diff}%)` : ""}`,
      user: ph.changedBy?.name || "Sistema",
    });
  }

  // Exclusividade
  if (property.exclusivity) {
    const exc = property.exclusivity;
    if (exc.createdAt) {
      timelineItems.push({
        id: `exc-created`,
        date: exc.createdAt,
        type: "exclusivity",
        icon: "🔒",
        color: "bg-purple-500",
        title: "Exclusividade Ativada",
        description: [
          exc.captadorName && `Captador: ${exc.captadorName}`,
          exc.startDate && `Início: ${new Date(exc.startDate).toLocaleDateString("pt-BR")}`,
          exc.endDate && `Fim: ${new Date(exc.endDate).toLocaleDateString("pt-BR")}`,
        ].filter(Boolean).join(" • "),
        user: exc.captadorName || "—",
      });
    }
    if ((exc.status === "ENCERRADA" || exc.status === "VENCIDA") && exc.updatedAt && exc.updatedAt !== exc.createdAt) {
      timelineItems.push({
        id: `exc-deactivated`,
        date: exc.updatedAt,
        type: "exclusivity",
        icon: "🔓",
        color: "bg-neutral-500",
        title: "Exclusividade Desativada",
        description: "",
        user: "—",
      });
    }
  }

  // Observações (do campo notes/observations se existir como array)
  for (const obs of (property.observations || [])) {
    timelineItems.push({
      id: `obs-${obs.id}`,
      date: obs.createdAt,
      type: "observation",
      icon: "💬",
      color: "bg-indigo-500",
      title: obs.isRemoved ? "Observação Removida" : "Observação Adicionada",
      description: obs.content?.substring(0, 120) + (obs.content?.length > 120 ? "..." : "") || "",
      user: obs.user?.name || obs.userName || "—",
    });
  }

  // Ordenar por data decrescente
  timelineItems.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
  });

  // Filtrar
  const filtered = filter === "todos"
    ? timelineItems
    : timelineItems.filter(item => item.type === filter);

  const filterOptions = [
    { value: "todos", label: "Todos", count: timelineItems.length },
    { value: "changelog", label: "Alterações", count: timelineItems.filter(i => i.type === "changelog").length },
    { value: "whatsapp", label: "WhatsApp", count: timelineItems.filter(i => i.type === "whatsapp").length },
    { value: "visit", label: "Visitas", count: timelineItems.filter(i => i.type === "visit").length },
    { value: "proposal", label: "Propostas", count: timelineItems.filter(i => i.type === "proposal").length },
    { value: "exclusivity", label: "Exclusividade", count: timelineItems.filter(i => i.type === "exclusivity").length },
    { value: "observation", label: "Observações", count: timelineItems.filter(i => i.type === "observation").length },
  ].filter(f => f.count > 0 || f.value === "todos" || f.value === "changelog");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Histórico Completo</h4>
        <span className="text-xs text-neutral-500">{timelineItems.length} evento(s)</span>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === opt.value
                ? "bg-[#0B2545] text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {opt.label} ({opt.count})
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          Nenhum evento encontrado
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="relative pl-10">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full ${item.color}`} />
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      <span className="font-medium text-sm truncate">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 flex-shrink-0 whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      {" "}
                      {new Date(item.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {/* Detalhes de changelog */}
                  {item.details && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className={`line-through ${
                        (item.details.field?.includes("status") || item.details.field?.includes("Status"))
                          ? (statusColors[item.details.oldValue || ""] || "text-red-500")
                          : "text-red-500"
                      }`}>
                        {formatValue(item.details.field || "", item.details.oldValue || "")}
                      </span>
                      <span className="text-neutral-400">→</span>
                      <span className={`font-medium ${
                        (item.details.field?.includes("status") || item.details.field?.includes("Status"))
                          ? (statusColors[item.details.newValue || ""] || "text-green-600")
                          : "text-green-600"
                      }`}>
                        {formatValue(item.details.field || "", item.details.newValue || "")}
                      </span>
                    </div>
                  )}

                  {/* Descrição */}
                  {item.description && (
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.description}</p>
                  )}

                  <p className="text-[10px] text-neutral-400 mt-1.5">Por {item.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Portais disponíveis
const availablePortals = [
  { id: "grupozap", name: "Grupo ZAP+", description: "ZAP + Viva Real + OLX", color: "#6B2D8B" },
  { id: "imovelweb", name: "Imóvel Web", color: "#FF6600" },
  { id: "orulo", name: "Órulo", color: "#00C2B2" },
  { id: "123i", name: "123i", color: "#2563EB" },
  { id: "chavesnamao", name: "Chaves na Mão", color: "#E31C25" },
  { id: "trovit", name: "Trovit", color: "#00B4D8" },
  { id: "imocasa", name: "Imocasa", color: "#10B981" },
  { id: "casamineira", name: "Casa Mineira", color: "#DC2626" },
  { id: "lugarcerto", name: "Lugar Certo", color: "#1E40AF" },
];

function TabPublicacao({ property }: { property: any }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [siteCategories, setSiteCategories] = useState<Array<{ type: string; title: string; isActive: boolean }>>([]);
  const [settings, setSettings] = useState({
    showOnWebsite: property.showOnWebsite !== false,
    isOffMarket: property.isOffMarket || false,
    isFeatured: property.isFeatured || false,
    isExclusive: property.isExclusive || false,
    activePortals: property.activePortals || [],
    websiteCategories: property.websiteCategories || [],
  });

  useEffect(() => {
    fetch("/api/site/property-types?active=true")
      .then(res => res.json())
      .then(data => {
        if (data.types) setSiteCategories(data.types);
      })
      .catch(console.error);
  }, []);

  const handleToggle = async (field: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsUpdating(true);
    try {
      await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePortalToggle = async (portalId: string) => {
    const current = settings.activePortals || [];
    const updated = current.includes(portalId)
      ? current.filter((p: string) => p !== portalId)
      : [...current, portalId];
    
    setSettings(prev => ({ ...prev, activePortals: updated }));
    setIsUpdating(true);
    try {
      await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePortals: updated }),
      });
    } catch (error) {
      console.error("Erro ao atualizar portais:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status de Publicação */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <RiGlobalLine className="w-5 h-5 text-[#0B2545]" />
          Visibilidade
        </h4>
        
        <div className="space-y-4">
          {/* Exibir no Site */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div>
              <p className="font-medium">Exibir no Site</p>
              <p className="text-xs text-neutral-500">O imóvel aparece nas buscas do site</p>
            </div>
            <button
              onClick={() => handleToggle("showOnWebsite", !settings.showOnWebsite)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.showOnWebsite ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showOnWebsite ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Off Market */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div>
              <p className="font-medium">Off Market</p>
              <p className="text-xs text-neutral-500">Imóvel exclusivo, não aparece publicamente</p>
            </div>
            <button
              onClick={() => handleToggle("isOffMarket", !settings.isOffMarket)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.isOffMarket ? "bg-purple-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.isOffMarket ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Destaque */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div>
              <p className="font-medium">Destaque no Site</p>
              <p className="text-xs text-neutral-500">Aparece na seção de destaques</p>
            </div>
            <button
              onClick={() => handleToggle("isFeatured", !settings.isFeatured)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.isFeatured ? "bg-amber-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.isFeatured ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {/* Exclusivo */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div>
              <p className="font-medium">Exclusividade</p>
              <p className="text-xs text-neutral-500">Imóvel com contrato de exclusividade</p>
            </div>
            <button
              onClick={() => handleToggle("isExclusive", !settings.isExclusive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.isExclusive ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.isExclusive ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Portais */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <RiExternalLinkLine className="w-5 h-5 text-[#0B2545]" />
          Portais Imobiliários
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availablePortals.map(portal => {
            const isActive = settings.activePortals?.includes(portal.id);
            return (
              <button
                key={portal.id}
                onClick={() => handlePortalToggle(portal.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  isActive 
                    ? "border-green-500 bg-green-50 dark:bg-green-500/10" 
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: portal.color }}
                  >
                    {portal.name.charAt(0)}
                  </div>
                  <span className="font-medium text-sm">{portal.name}</span>
                </div>
                {portal.description && (
                  <p className="text-[10px] text-neutral-500">{portal.description}</p>
                )}
                <div className="mt-2 flex items-center gap-1">
                  {isActive ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <RiCheckLine className="w-3 h-3" /> Ativo
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-400">Inativo</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorias do Site */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <RiPriceTag3Line className="w-5 h-5 text-[#0B2545]" />
          Categorias do Site
        </h4>
        
        <p className="text-sm text-neutral-500 mb-4">Selecione em quais categorias o imóvel aparecerá no site</p>
        <div className="flex flex-wrap gap-2">
          {siteCategories.length > 0 ? (
            siteCategories.map(cat => {
              const isSelected = settings.websiteCategories?.includes(cat.type);
              return (
                <button
                  key={cat.type}
                  onClick={() => {
                    const current = settings.websiteCategories || [];
                    const updated = isSelected ? current.filter((c: string) => c !== cat.type) : [...current, cat.type];
                    setSettings(prev => ({ ...prev, websiteCategories: updated }));
                    fetch(`/api/properties/${property.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ websiteCategories: updated }),
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isSelected 
                      ? "bg-[#0B2545] text-white" 
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {cat.title}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-neutral-400 italic">Carregando categorias...</p>
          )}
        </div>
      </div>

      {/* Placa e Situação */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <h4 className="font-semibold mb-4">Situação Física</h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-500 mb-1">Possui Placa?</p>
            <p className={`font-medium ${property.hasPlate ? "text-green-600" : "text-neutral-500"}`}>
              {property.hasPlate ? "✓ Sim" : "✗ Não"}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-500 mb-1">Está Habitado?</p>
            <p className={`font-medium ${property.isOccupied ? "text-amber-600" : "text-green-600"}`}>
              {property.isOccupied ? "🏠 Sim" : "🔑 Não"}
            </p>
          </div>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <p className="text-xs text-neutral-500 mb-1">Fotos Profissionais?</p>
            <p className={`font-medium ${property.hasProfessionalPhotos ? "text-green-600" : "text-neutral-500"}`}>
              {property.hasProfessionalPhotos ? "📸 Sim" : "✗ Não"}
            </p>
          </div>
        </div>
      </div>

      {isUpdating && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-[#0B2545] text-white rounded-lg shadow-lg flex items-center gap-2">
          <RiLoader4Line className="w-4 h-4 animate-spin" />
          Salvando...
        </div>
      )}
    </div>
  );
}

// Toggle de Exclusividade
function ExclusivityToggle({ property, onToggle }: { property: any; onToggle: (isExclusive: boolean) => void }) {
  const [isExclusive, setIsExclusive] = useState(property.isExclusive || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasExclusivityData, setHasExclusivityData] = useState(false);

  // Verificar se existe dados de exclusividade salvos
  useEffect(() => {
    const checkExclusivityData = async () => {
      try {
        const res = await fetch(`/api/admin/properties/${property.id}/exclusivity`);
        if (res.ok) {
          const data = await res.json();
          setHasExclusivityData(!!data.exclusivity);
        }
      } catch (error) {
        console.error("Erro ao verificar exclusividade:", error);
      }
    };
    checkExclusivityData();
  }, [property.id]);

  const handleToggle = async () => {
    const newValue = !isExclusive;
    setIsUpdating(true);
    
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExclusive: newValue }),
      });
      
      if (res.ok) {
        setIsExclusive(newValue);
        onToggle(newValue);
      }
    } catch (error) {
      console.error("Erro ao atualizar exclusividade:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isExclusive 
        ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300 dark:border-purple-500/50" 
        : hasExclusivityData
        ? "bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-200 dark:border-purple-500/30"
        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isExclusive 
              ? "bg-purple-500 text-white" 
              : hasExclusivityData 
              ? "bg-purple-200 dark:bg-purple-500/30 text-purple-500"
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-400"
          }`}>
            <RiVipCrownLine className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Exclusividade</p>
            <p className="text-xs text-neutral-500">
              {isExclusive 
                ? "Imóvel exclusivo ativo" 
                : hasExclusivityData 
                ? "Exclusividade inativa (dados mantidos)"
                : "Ativar gestão exclusiva"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className="relative"
        >
          {isUpdating ? (
            <RiLoader4Line className="w-6 h-6 animate-spin text-purple-500" />
          ) : isExclusive ? (
            <RiToggleFill className="w-10 h-10 text-purple-500" />
          ) : (
            <RiToggleLine className={`w-10 h-10 ${hasExclusivityData ? "text-purple-300" : "text-neutral-300"}`} />
          )}
        </button>
      </div>
      
      {isExclusive && (
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
          <RiCheckLine className="w-3 h-3" />
          Acesse a aba "Exclusividade" para gerenciar
        </p>
      )}
      
      {!isExclusive && hasExclusivityData && (
        <p className="text-xs text-purple-500 dark:text-purple-400 mt-2 flex items-center gap-1">
          <RiHistoryLine className="w-3 h-3" />
          Histórico de exclusividade disponível na aba
        </p>
      )}
    </div>
  );
}

// Condição Especial Parceiros (apenas ADMIN)
function PartnerConditionCard({ property, onUpdate }: { property: any; onUpdate: (data: any) => void }) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(property.hasPartnerCondition || false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    partnerConditionType: property.partnerConditionType || "",
    partnerConditionValue: property.partnerConditionValue || "",
    partnerConditionDesc: property.partnerConditionDesc || "",
    partnerConditionExpiry: property.partnerConditionExpiry 
      ? new Date(property.partnerConditionExpiry).toISOString().split("T")[0] 
      : "",
  });

  // Apenas ADMIN pode ver e gerenciar
  if (user?.role !== "ADMIN") {
    return null;
  }

  const conditionTypes = [
    { value: "REPASSE_MAIOR", label: "Repasse Maior", icon: "💰", desc: "% maior de comissão" },
    { value: "BONUS", label: "Bônus", icon: "🎁", desc: "Bônus adicional" },
    { value: "COMISSAO_DIFERENCIADA", label: "Comissão Diferenciada", icon: "📊", desc: "Condição especial" },
    { value: "OUTRO", label: "Outro", icon: "✨", desc: "Condição personalizada" },
  ];

  const handleToggle = async () => {
    const newValue = !isEnabled;
    setIsUpdating(true);
    
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/partner-condition`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          hasPartnerCondition: newValue,
          ...formData,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsEnabled(newValue);
        onUpdate(data.partnerCondition);
        if (newValue) setIsExpanded(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar condição:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/partner-condition`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          hasPartnerCondition: true,
          ...formData,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.partnerCondition);
      }
    } catch (error) {
      console.error("Erro ao salvar condição:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isEnabled 
        ? "bg-gradient-to-r from-emerald-500/10 to-orange-500/10 border-amber-300 dark:border-amber-500/50" 
        : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isEnabled 
              ? "bg-amber-500 text-white" 
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-400"
          }`}>
            <RiHandHeartLine className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Condição Especial Parceiros</p>
            <p className="text-xs text-neutral-500">
              {isEnabled ? "Ativo - visível para parceiros" : "Habilitar condição diferenciada"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className="relative"
        >
          {isUpdating ? (
            <RiLoader4Line className="w-6 h-6 animate-spin text-amber-500" />
          ) : isEnabled ? (
            <RiToggleFill className="w-10 h-10 text-amber-500" />
          ) : (
            <RiToggleLine className="w-10 h-10 text-neutral-300" />
          )}
        </button>
      </div>
      
      {isEnabled && (
        <>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 pt-3 border-t border-amber-200 dark:border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1"
          >
            {isExpanded ? "Ocultar configurações" : "Configurar condição"}
            <RiArrowDownSLine className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {/* Tipo de Condição */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Tipo de Condição
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {conditionTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({ ...formData, partnerConditionType: type.value })}
                          className={`p-2 rounded-lg text-left text-xs transition-all ${
                            formData.partnerConditionType === type.value
                              ? "bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/50 border"
                              : "bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600"
                          }`}
                        >
                          <span className="mr-1">{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Valor/Percentual */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Valor/Percentual
                    </label>
                    <input
                      type="text"
                      value={formData.partnerConditionValue}
                      onChange={(e) => setFormData({ ...formData, partnerConditionValue: e.target.value })}
                      placeholder="Ex: 6%, R$ 5.000, 50/50"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Descrição da Condição
                    </label>
                    <textarea
                      value={formData.partnerConditionDesc}
                      onChange={(e) => setFormData({ ...formData, partnerConditionDesc: e.target.value })}
                      placeholder="Descreva a condição especial para parceiros..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg resize-none"
                    />
                  </div>

                  {/* Validade */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Válido até (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.partnerConditionExpiry}
                      onChange={(e) => setFormData({ ...formData, partnerConditionExpiry: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                    />
                  </div>

                  {/* Botão Salvar */}
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />}
                    Salvar Condição
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// Status Card Component
function StatusSelector({ property }: { property: any }) {
  const [currentStatus, setCurrentStatus] = useState(property.status || "DISPONIVEL");
  const [currentSaleStatus, setCurrentSaleStatus] = useState(property.saleStatus || "ATIVO");
  const [currentRentalStatus, setCurrentRentalStatus] = useState(property.rentalStatus || "ATIVO");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modais para detalhes de status
  const [showVendidoModal, setShowVendidoModal] = useState(false);
  const [showAlugadoModal, setShowAlugadoModal] = useState(false);
  const [showSuspensoModal, setShowSuspensoModal] = useState(false);
  const [statusContext, setStatusContext] = useState<"venda" | "locacao" | "geral">("geral");
  
  // Dados dos modais
  const [vendidoData, setVendidoData] = useState({
    soldBy: property.soldBy || "",
    soldAt: property.soldAt ? new Date(property.soldAt).toISOString().split("T")[0] : "",
    soldNotes: property.soldNotes || "",
  });
  
  const [alugadoData, setAlugadoData] = useState({
    rentedBy: property.rentedBy || "",
    rentedAt: property.rentedAt ? new Date(property.rentedAt).toISOString().split("T")[0] : "",
    rentedNotes: property.rentedNotes || "",
    followUpMonths: property.followUpMonths || 6,
  });
  
  const [suspensoData, setSuspensoData] = useState({
    suspensionDays: property.suspensionDays || 30,
    suspensionReason: property.suspensionReason || "",
  });

  const isVendaLocacao = property.category === "VENDA_LOCACAO";

  const statusOptions = [
    { value: "DISPONIVEL", label: "Disponível", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
    { value: "VENDIDO", label: "Vendido", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
    { value: "ALUGADO", label: "Alugado", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50" },
    { value: "SUSPENSO", label: "Suspenso", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-50" },
    { value: "INDISPONIVEL", label: "Indisponível", color: "bg-neutral-500", textColor: "text-neutral-700", bgLight: "bg-neutral-50" },
  ];

  const saleStatusOptions = [
    { value: "ATIVO", label: "Disponível", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
    { value: "SUSPENSO", label: "Suspenso", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-50" },
    { value: "VENDIDO", label: "Vendido", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
    { value: "INATIVO", label: "Indisponível", color: "bg-neutral-500", textColor: "text-neutral-700", bgLight: "bg-neutral-50" },
  ];

  const rentalStatusOptions = [
    { value: "ATIVO", label: "Disponível", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
    { value: "SUSPENSO", label: "Suspenso", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-50" },
    { value: "ALUGADO", label: "Alugado", color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50" },
    { value: "INATIVO", label: "Indisponível", color: "bg-neutral-500", textColor: "text-neutral-700", bgLight: "bg-neutral-50" },
  ];

  const handleStatusChange = async (newStatus: string, extraData?: any) => {
    if (newStatus === currentStatus && !extraData) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extraData }),
      });
      
      if (res.ok) {
        setCurrentStatus(newStatus);
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaleStatusChange = async (newStatus: string, extraData?: any) => {
    if (newStatus === currentSaleStatus && !extraData) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleStatus: newStatus, ...extraData }),
      });
      
      if (res.ok) {
        setCurrentSaleStatus(newStatus);
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao atualizar status de venda:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRentalStatusChange = async (newStatus: string, extraData?: any) => {
    if (newStatus === currentRentalStatus && !extraData) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalStatus: newStatus, ...extraData }),
      });
      
      if (res.ok) {
        setCurrentRentalStatus(newStatus);
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao atualizar status de locação:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handlers para abrir modais
  const openStatusModal = (status: string, context: "venda" | "locacao" | "geral") => {
    setStatusContext(context);
    if (status === "VENDIDO") {
      setShowVendidoModal(true);
    } else if (status === "ALUGADO") {
      setShowAlugadoModal(true);
    } else if (status === "SUSPENSO") {
      setShowSuspensoModal(true);
    } else if (context === "venda") {
      handleSaleStatusChange(status);
    } else if (context === "locacao") {
      handleRentalStatusChange(status);
    } else {
      handleStatusChange(status);
    }
  };

  // Submits dos modais
  const handleVendidoSubmit = () => {
    const extraData = {
      soldBy: vendidoData.soldBy,
      soldAt: vendidoData.soldAt ? new Date(vendidoData.soldAt) : new Date(),
      soldNotes: vendidoData.soldNotes,
    };
    if (statusContext === "venda" || isVendaLocacao) {
      handleSaleStatusChange("VENDIDO", extraData);
    } else {
      handleStatusChange("VENDIDO", extraData);
    }
    setShowVendidoModal(false);
  };

  const handleAlugadoSubmit = () => {
    const followUpDate = alugadoData.rentedBy === "CONCORRENTE" && alugadoData.rentedAt 
      ? new Date(new Date(alugadoData.rentedAt).setMonth(new Date(alugadoData.rentedAt).getMonth() + alugadoData.followUpMonths))
      : null;
    
    const extraData = {
      rentedBy: alugadoData.rentedBy,
      rentedAt: alugadoData.rentedAt ? new Date(alugadoData.rentedAt) : new Date(),
      rentedNotes: alugadoData.rentedNotes,
      followUpMonths: alugadoData.rentedBy === "CONCORRENTE" ? alugadoData.followUpMonths : null,
      followUpDate,
    };
    if (statusContext === "locacao" || isVendaLocacao) {
      handleRentalStatusChange("ALUGADO", extraData);
    } else {
      handleStatusChange("ALUGADO", extraData);
    }
    setShowAlugadoModal(false);
  };

  const handleSuspensoSubmit = () => {
    const suspensionEndDate = new Date();
    suspensionEndDate.setDate(suspensionEndDate.getDate() + suspensoData.suspensionDays);
    
    const extraData = {
      suspensionDays: suspensoData.suspensionDays,
      suspensionStartDate: new Date(),
      suspensionEndDate,
      suspensionReason: suspensoData.suspensionReason,
    };
    if (statusContext === "venda") {
      handleSaleStatusChange("SUSPENSO", extraData);
    } else if (statusContext === "locacao") {
      handleRentalStatusChange("SUSPENSO", extraData);
    } else {
      handleStatusChange("SUSPENSO", extraData);
    }
    setShowSuspensoModal(false);
  };

  const currentOption = statusOptions.find(s => s.value === currentStatus) || statusOptions[0];
  const currentSaleOption = saleStatusOptions.find(s => s.value === currentSaleStatus) || saleStatusOptions[0];
  const currentRentalOption = rentalStatusOptions.find(s => s.value === currentRentalStatus) || rentalStatusOptions[0];

  // Função para renderizar os modais (declarada antes do uso)
  const renderStatusModals = () => (
    <>
      {/* Modal Vendido */}
      <AnimatePresence>
        {showVendidoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowVendidoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-blue-600">🏷️ Marcar como Vendido</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vendido por *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVendidoData(prev => ({ ...prev, soldBy: "TAPPY" }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        vendidoData.soldBy === "TAPPY"
                          ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      ✅ Tappy
                    </button>
                    <button
                      type="button"
                      onClick={() => setVendidoData(prev => ({ ...prev, soldBy: "CONCORRENCIA" }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        vendidoData.soldBy === "CONCORRENCIA"
                          ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      ❌ Concorrência
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data da Venda</label>
                  <input
                    type="date"
                    value={vendidoData.soldAt}
                    onChange={(e) => setVendidoData(prev => ({ ...prev, soldAt: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <textarea
                    value={vendidoData.soldNotes}
                    onChange={(e) => setVendidoData(prev => ({ ...prev, soldNotes: e.target.value }))}
                    placeholder="Observações sobre a venda..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    rows={3}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
                <button
                  onClick={() => setShowVendidoModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVendidoSubmit}
                  disabled={!vendidoData.soldBy || isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {isUpdating ? "Salvando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Alugado */}
      <AnimatePresence>
        {showAlugadoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAlugadoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-purple-600">🔑 Marcar como Alugado</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Alugado por *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAlugadoData(prev => ({ ...prev, rentedBy: "TAPPY" }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        alugadoData.rentedBy === "TAPPY"
                          ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      ✅ Tappy
                    </button>
                    <button
                      type="button"
                      onClick={() => setAlugadoData(prev => ({ ...prev, rentedBy: "CONCORRENTE" }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        alugadoData.rentedBy === "CONCORRENTE"
                          ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      ❌ Concorrente
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data da Locação</label>
                  <input
                    type="date"
                    value={alugadoData.rentedAt}
                    onChange={(e) => setAlugadoData(prev => ({ ...prev, rentedAt: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
                {alugadoData.rentedBy === "CONCORRENTE" && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
                    <label className="block text-sm font-medium mb-2 text-amber-700 dark:text-amber-400">
                      ⏰ Lembrete de Follow-up
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAlugadoData(prev => ({ ...prev, followUpMonths: 6 }))}
                        className={`p-2 rounded-lg border text-sm ${
                          alugadoData.followUpMonths === 6
                            ? "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-500/20"
                            : "border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        6 meses
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlugadoData(prev => ({ ...prev, followUpMonths: 12 }))}
                        className={`p-2 rounded-lg border text-sm ${
                          alugadoData.followUpMonths === 12
                            ? "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-500/20"
                            : "border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        12 meses
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <textarea
                    value={alugadoData.rentedNotes}
                    onChange={(e) => setAlugadoData(prev => ({ ...prev, rentedNotes: e.target.value }))}
                    placeholder="Observações sobre a locação..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    rows={3}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
                <button
                  onClick={() => setShowAlugadoModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAlugadoSubmit}
                  disabled={!alugadoData.rentedBy || isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {isUpdating ? "Salvando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Suspenso */}
      <AnimatePresence>
        {showSuspensoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowSuspensoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-amber-600">⏸️ Suspender Imóvel</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Período de Suspensão *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSuspensoData(prev => ({ ...prev, suspensionDays: 30 }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        suspensoData.suspensionDays === 30
                          ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      30 dias
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuspensoData(prev => ({ ...prev, suspensionDays: 90 }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        suspensoData.suspensionDays === 90
                          ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      90 dias
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuspensoData(prev => ({ ...prev, suspensionDays: 180 }))}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        suspensoData.suspensionDays === 180
                          ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      180 dias
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Motivo da Suspensão</label>
                  <textarea
                    value={suspensoData.suspensionReason}
                    onChange={(e) => setSuspensoData(prev => ({ ...prev, suspensionReason: e.target.value }))}
                    placeholder="Descreva o motivo da suspensão..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    rows={3}
                  />
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <p className="text-xs text-neutral-500">
                    O imóvel será suspenso até <span className="font-semibold text-amber-600">
                      {new Date(Date.now() + suspensoData.suspensionDays * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")}
                    </span>
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
                <button
                  onClick={() => setShowSuspensoModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSuspensoSubmit}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {isUpdating ? "Salvando..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Para VENDA_LOCACAO, mostrar status separados
  if (isVendaLocacao) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 space-y-3">
        <p className="text-[9px] text-neutral-500 uppercase">Status por Finalidade</p>
        
        {/* Status da Venda */}
        <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/30">
          <p className="text-[9px] text-orange-600 dark:text-orange-400 font-semibold mb-1.5">🏷️ VENDA</p>
          <div className={`flex items-center gap-2 p-1.5 rounded ${currentSaleOption.bgLight} dark:bg-opacity-20 mb-1.5`}>
            <div className={`w-2 h-2 rounded-full ${currentSaleOption.color}`} />
            <span className={`text-xs font-medium ${currentSaleOption.textColor}`}>{currentSaleOption.label}</span>
            {isUpdating && <RiLoader4Line className="w-3 h-3 animate-spin ml-auto" />}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {saleStatusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => openStatusModal(option.value, "venda")}
                disabled={isUpdating}
                className={`px-2 py-1 text-[9px] rounded border transition-all ${
                  currentSaleStatus === option.value
                    ? `${option.color} text-white border-transparent`
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                } disabled:opacity-50`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status da Locação */}
        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
          <p className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mb-1.5">🔑 LOCAÇÃO</p>
          <div className={`flex items-center gap-2 p-1.5 rounded ${currentRentalOption.bgLight} dark:bg-opacity-20 mb-1.5`}>
            <div className={`w-2 h-2 rounded-full ${currentRentalOption.color}`} />
            <span className={`text-xs font-medium ${currentRentalOption.textColor}`}>{currentRentalOption.label}</span>
            {isUpdating && <RiLoader4Line className="w-3 h-3 animate-spin ml-auto" />}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {rentalStatusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => openStatusModal(option.value, "locacao")}
                disabled={isUpdating}
                className={`px-2 py-1 text-[9px] rounded border transition-all ${
                  currentRentalStatus === option.value
                    ? `${option.color} text-white border-transparent`
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                } disabled:opacity-50`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modais de Status */}
        {renderStatusModals()}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
      <p className="text-[9px] text-neutral-500 uppercase mb-2">Status do Imóvel</p>
      
      {/* Status atual */}
      <div className={`flex items-center gap-2 p-2 rounded-lg ${currentOption.bgLight} dark:bg-opacity-20 mb-2`}>
        <div className={`w-2 h-2 rounded-full ${currentOption.color}`} />
        <span className={`text-sm font-medium ${currentOption.textColor}`}>{currentOption.label}</span>
        {isUpdating && <RiLoader4Line className="w-3 h-3 animate-spin ml-auto" />}
      </div>

      {/* Botões de status */}
      <div className="grid grid-cols-2 gap-1">
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => openStatusModal(option.value, "geral")}
            disabled={isUpdating}
            className={`px-2 py-1.5 text-[10px] rounded-lg border transition-all ${
              currentStatus === option.value
                ? `${option.color} text-white border-transparent`
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
            } disabled:opacity-50`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Modais de Status */}
      {renderStatusModals()}
    </div>
  );
}

// Variations Card Component - Mostra variações do imóvel (ex: CNC123 e CNC123-2)
function VariationsCard({ property }: { property: any }) {
  const hasVariations = property.variations && property.variations.length > 0;
  const hasParent = property.parentProperty;
  
  if (!hasVariations && !hasParent) {
    return null; // Não mostrar se não tiver variações
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "VENDA": return "Venda";
      case "LOCACAO": return "Locação";
      case "VENDA_LOCACAO": return "Venda e Locação";
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "VENDA": return "bg-orange-100 text-orange-700";
      case "LOCACAO": return "bg-blue-100 text-blue-700";
      case "VENDA_LOCACAO": return "bg-purple-100 text-purple-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
      <p className="text-[9px] text-neutral-500 uppercase mb-2">
        {hasParent ? "Imóvel Principal" : "Variações do Imóvel"}
      </p>
      
      {/* Se tem imóvel pai, mostrar link para ele */}
      {hasParent && (
        <a 
          href={`/admin/imoveis/${property.parentProperty.id}`}
          className="block p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors mb-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
              {property.parentProperty.thumbnail ? (
                <img src={property.parentProperty.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">🏠</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{property.parentProperty.code}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${getCategoryColor(property.parentProperty.category)}`}>
                {getCategoryLabel(property.parentProperty.category)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-green-600">{formatPrice(property.parentProperty.price)}</p>
            </div>
          </div>
        </a>
      )}

      {/* Variações */}
      {hasVariations && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-neutral-500">
            {property.variations.length} variação(ões) encontrada(s)
          </p>
          {property.variations.map((variation: any) => (
            <a 
              key={variation.id}
              href={`/admin/imoveis/${variation.id}`}
              className="block p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                  {variation.thumbnail ? (
                    <img src={variation.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">🏠</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium truncate">{variation.code}</p>
                  <span className={`text-[8px] px-1 py-0.5 rounded ${getCategoryColor(variation.category)}`}>
                    {getCategoryLabel(variation.category)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-green-600">
                    {variation.category === "LOCACAO" && variation.rentPrice 
                      ? formatPrice(variation.rentPrice) 
                      : formatPrice(variation.price)}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Modal de Agendamento de Fotos
function PhotoScheduleModal({ property, onClose, onSuccess }: { property: any; onClose: () => void; onSuccess: () => void }) {
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [form, setForm] = useState({
    serviceTypes: ["FOTO"] as string[],
    scheduledDate: "",
    scheduledTime: "09:00",
    photographerIds: [] as string[],
    contactName: "",
    contactPhone: "",
    isOccupied: false,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    loadPhotographers();
  }, []);

  useEffect(() => {
    if (form.scheduledDate && form.photographerIds.length > 0) {
      checkAvailability();
    }
  }, [form.scheduledDate, form.photographerIds, form.scheduledTime]);

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

  const checkAvailability = async () => {
    if (!form.scheduledDate || form.photographerIds.length === 0) return;
    
    try {
      const params = new URLSearchParams({
        date: form.scheduledDate,
      });
      
      const res = await fetch(`/api/admin/photo-sessions/slots?${params}`);
      if (res.ok) {
        const data = await res.json();
        const allSlots = data.slots || [];
        
        // Verificar se todos os fotógrafos selecionados estão disponíveis
        const conflicts: string[] = [];
        form.photographerIds.forEach(pId => {
          const photographerSlots = allSlots.filter((s: any) => s.photographerId === pId);
          const blocked = photographerSlots.find((s: any) => 
            s.slotType === "BLOQUEADO" && 
            s.startTime <= form.scheduledTime && 
            s.endTime > form.scheduledTime
          );
          if (blocked) {
            const photographer = photographers.find(p => p.id === pId);
            conflicts.push(photographer?.name || "Fotógrafo");
          }
        });

        if (conflicts.length > 0) {
          setConflictWarning(`⚠️ ${conflicts.join(", ")} não tem disponibilidade neste horário`);
        } else {
          setConflictWarning(null);
        }
        
        setAvailableSlots(allSlots.filter((s: any) => s.slotType === "DISPONIVEL"));
      }
    } catch (error) {
      console.error("Erro ao verificar disponibilidade:", error);
    }
  };

  const handleSubmit = async () => {
    if (!form.scheduledDate || !form.scheduledTime) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/photo-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          ...form,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao agendar");
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    } finally {
      setSaving(false);
    }
  };

  const serviceTypeConfig: Record<string, { label: string; color: string }> = {
    FOTO: { label: "Foto", color: "text-blue-500" },
    VIDEO: { label: "Vídeo", color: "text-red-500" },
    VIDEO_CORRETOR: { label: "Vídeo Corretor", color: "text-purple-500" },
    DRONE: { label: "Drone", color: "text-green-500" },
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
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Agendar Fotos</h3>
            <p className="text-sm text-neutral-500">{property.code} - {property.title?.substring(0, 30)}...</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tipos de Serviço */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipos de Produção</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(serviceTypeConfig).map(([key, config]) => {
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 ring-2 ring-purple-500"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {config.label}
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
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Horário *</label>
              <select
                value={form.scheduledTime}
                onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              >
                {["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fotógrafos */}
          <div>
            <label className="block text-sm font-medium mb-2">Fotógrafo(s)</label>
            {photographers.length === 0 ? (
              <p className="text-sm text-neutral-500 italic">Nenhum fotógrafo cadastrado. Cadastre um usuário com role "Fotógrafo" primeiro.</p>
            ) : (
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
                      <span className="text-sm">{p.name}</span>
                      {isSelected && <RiCheckLine className="w-4 h-4 text-purple-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aviso de Conflito */}
          {conflictWarning && (
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-700 dark:text-amber-400">{conflictWarning}</p>
            </div>
          )}

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
                <p className="text-xs text-amber-600 dark:text-amber-500">Marque se o imóvel está ocupado</p>
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
                placeholder="Nome"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
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
              placeholder="Instruções de acesso..."
              rows={2}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.scheduledDate}
            className="flex-1 h-11 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiCameraLine className="w-5 h-5" />}
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

function TabLeads({ propertyId, propertyCode }: { propertyId: string; propertyCode?: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTemp, setFilterTemp] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/properties/${propertyId}/leads`);
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
        }
      } catch (err) {
        console.error("Erro ao buscar leads do imóvel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [propertyId]);

  const filtered = leads.filter((l: any) => {
    if (filterTemp !== "all" && l.temperature !== filterTemp) return false;
    if (filterType !== "all" && l.type !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!l.name?.toLowerCase().includes(s) && !l.phone?.includes(s) && !l.email?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RiLoader4Line className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <RiTeamLine className="w-4 h-4 text-orange-500" />
          Leads Interessados ({leads.length})
        </h3>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[150px]">
          <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lead..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <select
          value={filterTemp}
          onChange={(e) => setFilterTemp(e.target.value)}
          className="h-8 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs"
        >
          <option value="all">Temperatura</option>
          <option value="QUENTE">🔥 Quente</option>
          <option value="MORNO">🌡️ Morno</option>
          <option value="FRIO">❄️ Frio</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-8 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs"
        >
          <option value="all">Tipo de vínculo</option>
          <option value="ORIGEM">Origem</option>
          <option value="ENVIADO">Enviado</option>
          <option value="VISITADO">Visitado</option>
          <option value="PROPOSTA">Proposta</option>
          <option value="COMPRADO">Comprado</option>
        </select>
      </div>

      {/* Lista de leads */}
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <RiTeamLine className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">{leads.length === 0 ? "Nenhum lead vinculado a este imóvel" : "Nenhum lead encontrado com esses filtros"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead: any) => (
            <div key={`${lead.id}-${lead.type}`} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                lead.temperature === "QUENTE" ? "bg-red-500" : lead.temperature === "FRIO" ? "bg-blue-500" : "bg-amber-500"
              }`}>
                {lead.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{lead.name}</p>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    lead.type === "VISITADO" ? "bg-green-100 text-green-600" :
                    lead.type === "PROPOSTA" ? "bg-amber-100 text-amber-600" :
                    lead.type === "COMPRADO" ? "bg-emerald-100 text-emerald-600" :
                    lead.type === "ENVIADO" ? "bg-purple-100 text-purple-600" :
                    "bg-blue-100 text-blue-600"
                  }`}>{lead.type || "Origem"}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    lead.temperature === "QUENTE" ? "bg-red-100 text-red-600" :
                    lead.temperature === "FRIO" ? "bg-blue-100 text-blue-600" :
                    "bg-amber-100 text-amber-600"
                  }`}>
                    {lead.temperature === "QUENTE" ? "🔥" : lead.temperature === "FRIO" ? "❄️" : "🌡️"} {lead.temperature}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-neutral-500">
                  {lead.phone && <span>{lead.phone}</span>}
                  {lead.corretor && <span>Corretor: {lead.corretor}</span>}
                  {lead.date && <span>{new Date(lead.date).toLocaleDateString("pt-BR")}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {lead.phone && (
                  <a href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30">
                    <RiWhatsappLine className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link href={`/admin/clientes/leads?leadId=${lead.id}`}
                  className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:hover:bg-blue-500/30">
                  <RiEyeLine className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
