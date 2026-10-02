"use client";

import { useState, useEffect, use } from "react";
import { handleDatePaste } from "@/lib/date-paste";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowLeftLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileList3Line,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiTimeLine,
  RiBuilding2Line,
  RiMapPinLine,
  RiIdCardLine,
  RiAwardLine,
  RiEyeLine,
  RiAddLine,
  RiSendPlaneLine,
  RiContractLine,
  RiHistoryLine,
  RiPriceTag3Line,
  RiCloseLine,
  RiCake2Line,
  RiStarLine,
  RiDashboardLine,
  RiRoadMapLine,
  RiFolder3Line,
  RiUploadLine,
  RiBankLine,
  RiCarLine,
  RiHome4Line,
  RiDownloadLine,
  RiAttachmentLine,
  RiImageLine,
} from "react-icons/ri";

// Tipos das abas
type TabType = "painel" | "jornada" | "historico" | "documentos";

const tabs: { id: TabType; label: string; icon: any }[] = [
  { id: "painel", label: "Painel Geral", icon: RiDashboardLine },
  { id: "jornada", label: "Jornada", icon: RiRoadMapLine },
  { id: "historico", label: "Histórico", icon: RiHistoryLine },
  { id: "documentos", label: "Documentos & Dados", icon: RiFolder3Line },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
};

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("painel");
  const [showTagModal, setShowTagModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newObservation, setNewObservation] = useState("");
  const [savingObservation, setSavingObservation] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const res = await fetch(`/api/admin/business-partners/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPartner(data);
        }
      } catch (error) {
        console.error("Erro ao carregar parceiro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [id]);

  const handleAddTag = async () => {
    if (!newTag.trim() || !partner) return;
    const updatedTags = [...(partner.tags || []), newTag.trim()];
    try {
      const res = await fetch(`/api/admin/business-partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags }),
      });
      if (res.ok) {
        setPartner({ ...partner, tags: updatedTags });
        setNewTag("");
        setShowTagModal(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar tag:", error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!partner) return;
    const updatedTags = partner.tags.filter((t: string) => t !== tag);
    try {
      const res = await fetch(`/api/admin/business-partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags }),
      });
      if (res.ok) {
        setPartner({ ...partner, tags: updatedTags });
      }
    } catch (error) {
      console.error("Erro ao remover tag:", error);
    }
  };

  const handleOpenEdit = () => {
    if (!partner) return;
    setEditFormData({
      name: partner.name || "",
      cpf: partner.cpf || "",
      rg: partner.rg || "",
      creci: partner.creci || "",
      creciStatus: partner.creciStatus || "ATIVO",
      phone: partner.phone || "",
      email: partner.email || "",
      gender: partner.gender || "",
      birthDate: partner.birthDate ? partner.birthDate.split("T")[0] : "",
      partnershipFormat: partner.partnershipFormat || "CAPTADOR",
      partnershipTermStatus: partner.partnershipTermStatus || "SEM_CONTRATO",
      isAutonomous: !partner.agencyId,
      agencyId: partner.agencyId || null,
      specialties: partner.specialties || [],
      actingRegions: partner.actingRegions || [],
      pixKey: partner.pixKey || "",
      bankName: partner.bankName || "",
      bankAgency: partner.bankAgency || "",
      bankAccount: partner.bankAccount || "",
      address: partner.address || "",
      neighborhood: partner.neighborhood || "",
      city: partner.city || "",
      state: partner.state || "",
      zipCode: partner.zipCode || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const { agency, _count, visits, proposals, contracts, activities, notes, isAutonomous, ...cleanData } = editFormData;
      const res = await fetch(`/api/admin/business-partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cleanData,
          agencyId: isAutonomous ? null : cleanData.agencyId,
          birthDate: cleanData.birthDate || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPartner({ ...partner, ...updated });
        setShowEditModal(false);
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-neutral-500">Parceiro não encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-orange-500 hover:text-orange-600"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
              {partner.avatar ? (
                <img src={partner.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                partner.name[0]
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {partner.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {partner.creci && (
                  <span className="text-sm text-neutral-500">CRECI: {partner.creci}</span>
                )}
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    partner.creciStatus === "ATIVO"
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  }`}
                >
                  {partner.creciStatus}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    partner.partnershipFormat === "PARCEIRO_PREMIUM"
                      ? "bg-purple-100 text-purple-700"
                      : partner.partnershipFormat === "FIFTY_PADRAO"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {partner.partnershipFormat === "PARCEIRO_PREMIUM"
                    ? "Premium"
                    : partner.partnershipFormat === "FIFTY_PADRAO"
                    ? "50/50"
                    : "Captador"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-xl transition-colors">
            <RiWhatsappLine className="w-4 h-4" />
            WhatsApp
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors">
            <RiMailLine className="w-4 h-4" />
            E-mail
          </button>
          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <RiEditLine className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiMoneyDollarCircleLine className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">VGV Realizado</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(partner.totalVGV)}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiEyeLine className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Visitas</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{partner.totalVisits}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <RiFileList3Line className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Propostas</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{partner.totalProposals}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <RiContractLine className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Contratos</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{partner.totalContracts}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <RiContractLine className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Termo de Parceria</p>
              <p className={`text-sm font-bold ${
                partner.partnershipTermStatus === "ASSINADO"
                  ? "text-green-600"
                  : partner.partnershipTermStatus === "ENVIADO"
                  ? "text-amber-600"
                  : "text-neutral-500"
              }`}>
                {partner.partnershipTermStatus === "ASSINADO"
                  ? "Assinado ✓"
                  : partner.partnershipTermStatus === "ENVIADO"
                  ? "Enviado"
                  : "Sem contrato"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Conteúdo */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="flex border-b border-neutral-200 dark:border-neutral-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Tab Painel Geral */}
              {activeTab === "painel" && (
                <div className="grid grid-cols-3 gap-6">
                  {/* Foto */}
                  <div className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-4xl mb-3">
                      {partner.avatar ? <img src={partner.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : partner.name[0]}
                    </div>
                    <p className="text-sm font-medium">{partner.name}</p>
                    {partner.creci && <p className="text-xs text-neutral-500">CRECI: {partner.creci}</p>}
                  </div>
                  {/* VGV */}
                  <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-1">VGV Realizado</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(partner.totalVGV)}</p>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-green-200">
                      <div className="text-center"><p className="font-bold">{partner.totalVisits}</p><p className="text-[10px] text-neutral-500">Visitas</p></div>
                      <div className="text-center"><p className="font-bold">{partner.totalProposals}</p><p className="text-[10px] text-neutral-500">Propostas</p></div>
                      <div className="text-center"><p className="font-bold">{partner.totalContracts}</p><p className="text-[10px] text-neutral-500">Negócios</p></div>
                    </div>
                  </div>
                  {/* Vínculos */}
                  <div className="p-4 bg-white dark:bg-neutral-700/50 rounded-xl border">
                    <p className="text-xs text-neutral-500 mb-2">Vínculos</p>
                    {partner.agency ? (
                      <div className="p-2 bg-blue-50 rounded-lg"><p className="text-sm font-medium">{partner.agency.tradeName || partner.agency.companyName}</p></div>
                    ) : <p className="text-sm text-neutral-400 italic">Autônomo</p>}
                  </div>
                  {/* Tags - ocupa linha inteira */}
                  <div className="col-span-3 p-4 bg-white dark:bg-neutral-700/50 rounded-xl border">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-neutral-500 flex items-center gap-1"><RiPriceTag3Line className="w-3.5 h-3.5" />Tags</p>
                      <button onClick={() => setShowTagModal(true)} className="text-xs text-orange-500 hover:text-orange-600 font-medium">+ Adicionar</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {partner.tags?.length > 0 ? partner.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-200 rounded-lg group">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500"><RiCloseLine className="w-3 h-3" /></button>
                        </span>
                      )) : <span className="text-xs text-neutral-400">Nenhuma tag</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Jornada */}
              {activeTab === "jornada" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg"><RiWhatsappLine className="w-4 h-4 text-green-500 mb-1" /><p className="text-xs text-neutral-500">Último WhatsApp</p><p className="text-sm font-medium">{formatDateTime(partner.lastWhatsappContact)}</p></div>
                    <div className="p-3 bg-blue-50 rounded-lg"><RiMailLine className="w-4 h-4 text-blue-500 mb-1" /><p className="text-xs text-neutral-500">Último E-mail</p><p className="text-sm font-medium">{formatDateTime(partner.lastEmailContact)}</p></div>
                    <div className="p-3 bg-amber-50 rounded-lg"><RiEyeLine className="w-4 h-4 text-amber-500 mb-1" /><p className="text-xs text-neutral-500">Última Visita</p><p className="text-sm font-medium">{formatDateTime(partner.lastVisit)}</p></div>
                    <div className="p-3 bg-purple-50 rounded-lg"><RiFileList3Line className="w-4 h-4 text-purple-500 mb-1" /><p className="text-xs text-neutral-500">Última Proposta</p><p className="text-sm font-medium">{formatDateTime(partner.lastProposal)}</p></div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl"><h4 className="text-sm font-semibold mb-3">Observações</h4>
                    {partner.notes?.length > 0 ? partner.notes.map((n: any) => <div key={n.id} className="p-2 bg-white rounded-lg mb-2"><p className="text-sm">{n.content}</p><p className="text-xs text-neutral-400 mt-1">{formatDateTime(n.createdAt)}</p></div>) : <p className="text-sm text-neutral-400">Nenhuma observação</p>}
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-xl"><h4 className="text-sm font-semibold mb-3">Histórico de Eventos</h4>
                    {partner.activities?.slice(0, 10).map((a: any) => <div key={a.id} className="flex gap-2 py-2 border-b last:border-0"><div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" /><div><p className="text-sm">{a.description}</p><p className="text-xs text-neutral-400">{formatDateTime(a.createdAt)}</p></div></div>) || <p className="text-sm text-neutral-400">Nenhum evento</p>}
                  </div>
                </div>
              )}

              {/* Tab Histórico */}
              {activeTab === "historico" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl"><h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><RiEyeLine className="w-4 h-4 text-blue-500" />Visitas ({partner.visits?.length || 0})</h4>
                    {partner.visits?.slice(0, 5).map((v: any) => <div key={v.id} className="p-2 bg-white rounded-lg mb-2"><p className="text-sm font-medium">{v.clientName || "Cliente"}</p><p className="text-xs text-neutral-500">{formatDateTime(v.visitDate)}</p></div>) || <p className="text-sm text-neutral-400">Nenhuma visita</p>}
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl"><h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><RiFileList3Line className="w-4 h-4 text-amber-500" />Propostas ({partner.proposals?.length || 0})</h4>
                    {partner.proposals?.slice(0, 5).map((p: any) => <div key={p.id} className="p-2 bg-white rounded-lg mb-2"><p className="text-sm font-medium">{p.clientName || "Proposta"}</p><p className="text-xs text-green-600 font-medium">{p.proposalValue ? formatCurrency(p.proposalValue) : "-"}</p></div>) || <p className="text-sm text-neutral-400">Nenhuma proposta</p>}
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl"><h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><RiContractLine className="w-4 h-4 text-green-500" />Negócios ({partner.contracts?.length || 0})</h4>
                    {partner.contracts?.slice(0, 5).map((c: any) => <div key={c.id} className="p-2 bg-white rounded-lg mb-2"><p className="text-sm font-medium">Contrato #{c.id.slice(-6)}</p><p className="text-xs text-green-600 font-medium">{c.saleValue ? formatCurrency(c.saleValue) : "-"}</p></div>) || <p className="text-sm text-neutral-400">Nenhum negócio</p>}
                  </div>
                </div>
              )}

              {/* Tab Documentos & Dados */}
              {activeTab === "documentos" && (
                <div className="grid grid-cols-2 gap-6">
                  {/* Documentos */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><RiAttachmentLine className="w-4 h-4 text-orange-500" />Documentos</h4>
                    {[
                      { key: "contrato_parceria", label: "Contrato de Parceria", icon: RiContractLine },
                      { key: "creci", label: "CRECI (Anexo)", icon: RiIdCardLine },
                      { key: "cnh", label: "CNH (Anexo)", icon: RiCarLine },
                      { key: "cartao_cnpj", label: "Cartão CNPJ (Anexo)", icon: RiBankLine },
                    ].map((doc) => (
                      <div key={doc.key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-2"><doc.icon className="w-4 h-4 text-neutral-400" /><span className="text-sm">{doc.label}</span></div>
                        <button className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"><RiUploadLine className="w-3.5 h-3.5" />Anexar</button>
                      </div>
                    ))}
                  </div>
                  {/* Dados Pessoais */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><RiIdCardLine className="w-4 h-4 text-orange-500" />Dados Pessoais & Financeiros</h4>
                    <div className="p-3 bg-neutral-50 rounded-lg space-y-2">
                      <div className="flex justify-between"><span className="text-xs text-neutral-500">CPF</span><span className="text-sm font-medium">{partner.cpf || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-neutral-500">RG</span><span className="text-sm font-medium">{partner.rg || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-neutral-500">Nascimento</span><span className="text-sm font-medium">{formatDate(partner.birthDate)}</span></div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg space-y-2">
                      <p className="text-xs text-neutral-500 font-medium">Dados Bancários</p>
                      <div className="flex justify-between"><span className="text-xs text-neutral-500">Chave PIX</span><span className="text-sm font-medium">{partner.pixKey || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-neutral-500">Banco</span><span className="text-sm font-medium">{partner.bankName || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-neutral-500">Agência/Conta</span><span className="text-sm font-medium">{partner.bankAgency && partner.bankAccount ? `${partner.bankAgency} / ${partner.bankAccount}` : "-"}</span></div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                      <p className="text-xs text-neutral-500 font-medium">Endereço</p>
                      <p className="text-sm">{partner.address ? `${partner.address}, ${partner.neighborhood} - ${partner.city}/${partner.state}` : "Não informado"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
      </div>

      {/* Modal de Tag */}
      {showTagModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowTagModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl z-50 p-6 w-80">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Adicionar Tag</h3>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nome da tag"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Edição */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Editar Parceiro</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg">
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Nome Completo *</label>
                  <input type="text" value={editFormData.name || ""} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">CPF</label>
                  <input type="text" value={editFormData.cpf || ""} onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">RG</label>
                  <input type="text" value={editFormData.rg || ""} onChange={(e) => setEditFormData({ ...editFormData, rg: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">CRECI</label>
                  <input type="text" value={editFormData.creci || ""} onChange={(e) => setEditFormData({ ...editFormData, creci: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Situação CRECI</label>
                  <select value={editFormData.creciStatus || "ATIVO"} onChange={(e) => setEditFormData({ ...editFormData, creciStatus: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                    <option value="ATIVO">Ativo</option>
                    <option value="SUSPENSO">Suspenso</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone</label>
                  <input type="text" value={editFormData.phone || ""} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">E-mail</label>
                  <input type="email" value={editFormData.email || ""} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Sexo</label>
                  <select value={editFormData.gender || ""} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Data de Nascimento</label>
                  <input type="date" value={editFormData.birthDate || ""} onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })} onPaste={(e) => handleDatePaste(e, (val) => setEditFormData({ ...editFormData, birthDate: val }))} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Formato de Parceria</label>
                  <select value={editFormData.partnershipFormat || "CAPTADOR"} onChange={(e) => setEditFormData({ ...editFormData, partnershipFormat: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                    <option value="CAPTADOR">Captador</option>
                    <option value="FIFTY_PADRAO">50/50 Padrão</option>
                    <option value="PARCEIRO_PREMIUM">Parceiro Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Status Contrato</label>
                  <select value={editFormData.partnershipTermStatus || "SEM_CONTRATO"} onChange={(e) => setEditFormData({ ...editFormData, partnershipTermStatus: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                    <option value="SEM_CONTRATO">Sem Contrato</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="ASSINADO">Assinado</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Dados Bancários</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Chave PIX</label>
                    <input type="text" value={editFormData.pixKey || ""} onChange={(e) => setEditFormData({ ...editFormData, pixKey: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Banco</label>
                    <input type="text" value={editFormData.bankName || ""} onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Agência</label>
                    <input type="text" value={editFormData.bankAgency || ""} onChange={(e) => setEditFormData({ ...editFormData, bankAgency: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Conta</label>
                    <input type="text" value={editFormData.bankAccount || ""} onChange={(e) => setEditFormData({ ...editFormData, bankAccount: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                </div>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Endereço</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Logradouro</label>
                    <input type="text" value={editFormData.address || ""} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Bairro</label>
                    <input type="text" value={editFormData.neighborhood || ""} onChange={(e) => setEditFormData({ ...editFormData, neighborhood: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Cidade</label>
                    <input type="text" value={editFormData.city || ""} onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Estado</label>
                    <input type="text" value={editFormData.state || ""} onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">CEP</label>
                    <input type="text" value={editFormData.zipCode || ""} onChange={(e) => setEditFormData({ ...editFormData, zipCode: e.target.value })} className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={savingEdit || !editFormData.name} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {savingEdit ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
