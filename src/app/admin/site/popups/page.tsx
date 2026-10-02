"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCloseLine,
  RiSaveLine,
  RiLoader4Line,
  RiWindow2Line,
  RiImageAddLine,
  RiUploadCloud2Line,
  RiTimeLine,
  RiPagesLine,
  RiSettings4Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckLine,
} from "react-icons/ri";

interface PopupBanner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  buttonText: string;
  buttonLink: string | null;
  popupType: string;
  bgColor: string | null;
  textColor: string | null;
  overlayOpacity: number | null;
  position: string;
  size: string;
  triggerType: string;
  triggerValue: number;
  targetPages: string[];
  excludePages: string[];
  startDate: string | null;
  endDate: string | null;
  showFrequency: string;
  formFields: string[];
  formButtonText: string | null;
  clicksToShow: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const triggerOptions = [
  { value: "PAGE_LOAD", label: "Ao abrir a página", desc: "Exibe quando o visitante abre a página" },
  { value: "VIEWS_COUNT", label: "Após X visualizações", desc: "Após o visitante ver X imóveis" },
  { value: "TIME_ON_SITE", label: "Tempo no site", desc: "Após X segundos navegando" },
  { value: "SCROLL_DEPTH", label: "Profundidade de scroll", desc: "Quando rolar X% da página" },
  { value: "EXIT_INTENT", label: "Intenção de saída", desc: "Quando o mouse sai da área da página" },
];

const frequencyOptions = [
  { value: "ONCE_PER_SESSION", label: "1x por sessão" },
  { value: "ONCE_PER_DAY", label: "1x por dia" },
  { value: "ONCE_EVER", label: "Apenas 1 vez" },
  { value: "ALWAYS", label: "Sempre" },
];

const positionOptions = [
  { value: "CENTER", label: "Centro" },
  { value: "BOTTOM", label: "Inferior" },
  { value: "TOP", label: "Superior" },
];

const sizeOptions = [
  { value: "SMALL", label: "Pequeno" },
  { value: "MEDIUM", label: "Médio" },
  { value: "LARGE", label: "Grande" },
  { value: "FULLSCREEN", label: "Tela cheia" },
];

const typeOptions = [
  { value: "BANNER", label: "Banner", desc: "Título, descrição e botão" },
  { value: "IMAGE_ONLY", label: "Apenas Imagem", desc: "Somente a imagem com link" },
  { value: "FORM", label: "Formulário", desc: "Com campos para captura de dados" },
];

const pageOptions = [
  { value: "/", label: "Home" },
  { value: "/imoveis", label: "Listagem de Imóveis" },
  { value: "/imovel/*", label: "Página do Imóvel (todas)" },
  { value: "/vender", label: "Vender/Avaliar" },
  { value: "/corretor-parceiro", label: "Corretor Parceiro" },
  { value: "/parceiros/exclusivos", label: "Parceiros Exclusivos" },
  { value: "/sobre", label: "Quem Somos" },
  { value: "/off-market", label: "Off Market" },
];

const emptyPopup: Partial<PopupBanner> = {
  title: "Novo Pop-up",
  description: "",
  imageUrl: "",
  imageUrlMobile: "",
  buttonText: "Saiba mais",
  buttonLink: "",
  popupType: "BANNER",
  bgColor: "#0B2545",
  textColor: "#FFFFFF",
  overlayOpacity: 0.5,
  position: "CENTER",
  size: "MEDIUM",
  triggerType: "PAGE_LOAD",
  triggerValue: 0,
  targetPages: [],
  excludePages: [],
  startDate: null,
  endDate: null,
  showFrequency: "ONCE_PER_SESSION",
  formFields: [],
  formButtonText: "Enviar",
  clicksToShow: 0,
  isActive: true,
  order: 0,
};

export default function PopupsPage() {
  const [popups, setPopups] = useState<PopupBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Partial<PopupBanner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"conteudo" | "gatilho" | "estilo" | "paginas">("conteudo");
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const fetchPopups = async () => {
    try {
      const res = await fetch("/api/admin/popups");
      const data = await res.json();
      setPopups(data.popups || []);
    } catch (error) {
      console.error("Erro ao carregar popups:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchPopups(); }, []);

  const handleCreate = () => {
    setEditingPopup({ ...emptyPopup });
    setActiveTab("conteudo");
    setShowModal(true);
  };

  const handleEdit = (popup: PopupBanner) => {
    setEditingPopup({ ...popup });
    setActiveTab("conteudo");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingPopup) return;
    setSaving(true);
    try {
      const isNew = !editingPopup.id;
      const url = isNew ? "/api/admin/popups" : `/api/admin/popups/${editingPopup.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPopup),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingPopup(null);
        fetchPopups();
      }
    } catch (error) {
      console.error("Erro ao salvar popup:", error);
    }
    setSaving(false);
  };

  const handleToggleActive = async (popup: PopupBanner) => {
    try {
      await fetch(`/api/admin/popups/${popup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !popup.isActive }),
      });
      fetchPopups();
    } catch (error) {
      console.error("Erro ao alternar popup:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este pop-up?")) return;
    try {
      await fetch(`/api/admin/popups/${id}`, { method: "DELETE" });
      fetchPopups();
    } catch (error) {
      console.error("Erro ao excluir popup:", error);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingPopup(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleImageUpload = async (file: File, target: "desktop" | "mobile") => {
    const setUploading = target === "desktop" ? setUploadingDesktop : setUploadingMobile;
    const field = target === "desktop" ? "imageUrl" : "imageUrlMobile";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "popups");
      formData.append("skipWatermark", "true");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        updateField(field, data.url);
      } else {
        alert("Erro ao fazer upload da imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload");
    }
    setUploading(false);
  };

  const toggleTargetPage = (page: string) => {
    setEditingPopup(prev => {
      if (!prev) return null;
      const current = prev.targetPages || [];
      return {
        ...prev,
        targetPages: current.includes(page)
          ? current.filter(p => p !== page)
          : [...current, page],
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <RiWindow2Line className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Pop-ups</h1>
            <p className="text-sm text-neutral-500">Crie e gerencie pop-ups e banners do site</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors font-medium text-sm"
        >
          <RiAddLine className="w-4 h-4" />
          Novo Pop-up
        </button>
      </div>

      {/* Lista de Popups */}
      {popups.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <RiWindow2Line className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Nenhum pop-up criado</h3>
          <p className="text-neutral-500 mb-6">Crie seu primeiro pop-up para engajar visitantes do site.</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            Criar Pop-up
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {popups.map((popup) => (
            <div
              key={popup.id}
              className={`bg-white dark:bg-neutral-900 rounded-xl border p-5 flex items-center gap-5 transition-colors ${
                popup.isActive
                  ? "border-neutral-200 dark:border-neutral-800"
                  : "border-neutral-200 dark:border-neutral-800 opacity-60"
              }`}
            >
              {/* Preview thumb */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: popup.bgColor || "#0B2545" }}
              >
                {popup.imageUrl ? (
                  <Image src={popup.imageUrl} alt="" width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <RiWindow2Line className="w-7 h-7" style={{ color: popup.textColor || "#fff" }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{popup.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    popup.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                  }`}>
                    {popup.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    {typeOptions.find(t => t.value === popup.popupType)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>{triggerOptions.find(t => t.value === popup.triggerType)?.label}</span>
                  <span>•</span>
                  <span>{frequencyOptions.find(f => f.value === popup.showFrequency)?.label}</span>
                  <span>•</span>
                  <span>{popup.targetPages.length === 0 ? "Todas as páginas" : `${popup.targetPages.length} página(s)`}</span>
                  {popup.startDate && (
                    <>
                      <span>•</span>
                      <span>Início: {new Date(popup.startDate).toLocaleDateString("pt-BR")}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleActive(popup)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                  title={popup.isActive ? "Desativar" : "Ativar"}
                >
                  {popup.isActive ? <RiEyeLine className="w-4 h-4" /> : <RiEyeOffLine className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(popup)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                  title="Editar"
                >
                  <RiEditLine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(popup.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edição */}
      <AnimatePresence>
        {showModal && editingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header do modal */}
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingPopup.id ? "Editar Pop-up" : "Novo Pop-up"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <RiEyeLine className="w-4 h-4" />
                    Preview
                  </button>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-5 pt-4 border-b border-neutral-200 dark:border-neutral-800">
                {[
                  { id: "conteudo" as const, label: "Conteúdo", icon: RiEditLine },
                  { id: "gatilho" as const, label: "Gatilho", icon: RiTimeLine },
                  { id: "paginas" as const, label: "Páginas", icon: RiPagesLine },
                  { id: "estilo" as const, label: "Estilo", icon: RiSettings4Line },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-[#0B2545] text-[#0B2545] dark:text-white bg-neutral-50 dark:bg-neutral-800"
                        : "border-transparent text-neutral-500 hover:text-neutral-700"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Corpo */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Preview inline */}
                {showPreview && (
                  <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-4">
                    <p className="text-xs text-neutral-500 mb-3 uppercase font-medium">Preview</p>
                    <div
                      className="rounded-xl p-6 text-center max-w-sm mx-auto shadow-lg"
                      style={{ backgroundColor: editingPopup.bgColor || "#0B2545", color: editingPopup.textColor || "#fff" }}
                    >
                      {editingPopup.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img src={editingPopup.imageUrl} alt="" className="w-full h-32 object-cover" />
                        </div>
                      )}
                      <h3 className="text-lg font-bold mb-2">{editingPopup.title || "Título"}</h3>
                      {editingPopup.description && (
                        <p className="text-sm opacity-80 mb-4">{editingPopup.description}</p>
                      )}
                      {editingPopup.popupType === "FORM" && (
                        <div className="space-y-2 mb-4">
                          {(editingPopup.formFields || []).map(field => (
                            <div key={field} className="bg-white/20 rounded-lg px-3 py-2 text-sm text-left opacity-70">{field}</div>
                          ))}
                        </div>
                      )}
                      <button className="px-6 py-2 bg-white/20 rounded-lg text-sm font-semibold">
                        {editingPopup.popupType === "FORM" ? editingPopup.formButtonText : editingPopup.buttonText}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Conteúdo */}
                {activeTab === "conteudo" && (
                  <div className="space-y-5">
                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo do Pop-up</label>
                      <div className="grid grid-cols-3 gap-3">
                        {typeOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField("popupType", opt.value)}
                            className={`p-3 rounded-xl text-left border-2 transition-all ${
                              editingPopup.popupType === opt.value
                                ? "border-[#0B2545] bg-[#0B2545]/5"
                                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                            }`}
                          >
                            <span className="font-semibold text-sm">{opt.label}</span>
                            <p className="text-xs text-neutral-500 mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Título</label>
                      <input
                        type="text"
                        value={editingPopup.title || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none"
                        placeholder="Título do pop-up"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Descrição</label>
                      <textarea
                        value={editingPopup.description || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none resize-none"
                        rows={3}
                        placeholder="Texto descritivo (opcional)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Upload Desktop */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Imagem (Desktop)</label>
                        {editingPopup.imageUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                            <img src={editingPopup.imageUrl} alt="Desktop" className="w-full h-32 object-cover" />
                            <button
                              type="button"
                              onClick={() => updateField("imageUrl", "")}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <RiCloseLine className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => desktopInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[#0B2545]"); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove("border-[#0B2545]"); }}
                            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-[#0B2545]"); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f, "desktop"); }}
                            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#0B2545] transition-colors"
                          >
                            {uploadingDesktop ? (
                              <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545] mx-auto" />
                            ) : (
                              <>
                                <RiUploadCloud2Line className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                                <p className="text-xs text-neutral-500">Clique ou arraste</p>
                              </>
                            )}
                          </div>
                        )}
                        <input ref={desktopInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "desktop"); e.target.value = ""; }} />
                      </div>

                      {/* Upload Mobile */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Imagem (Mobile) <span className="text-neutral-400 font-normal">opcional</span></label>
                        {editingPopup.imageUrlMobile ? (
                          <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                            <img src={editingPopup.imageUrlMobile} alt="Mobile" className="w-full h-32 object-cover" />
                            <button
                              type="button"
                              onClick={() => updateField("imageUrlMobile", "")}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <RiCloseLine className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => mobileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-[#0B2545]"); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove("border-[#0B2545]"); }}
                            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-[#0B2545]"); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f, "mobile"); }}
                            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-[#0B2545] transition-colors"
                          >
                            {uploadingMobile ? (
                              <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545] mx-auto" />
                            ) : (
                              <>
                                <RiUploadCloud2Line className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                                <p className="text-xs text-neutral-500">Clique ou arraste</p>
                              </>
                            )}
                          </div>
                        )}
                        <input ref={mobileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "mobile"); e.target.value = ""; }} />
                      </div>
                    </div>

                    {editingPopup.popupType !== "IMAGE_ONLY" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Texto do Botão</label>
                          <input
                            type="text"
                            value={editingPopup.popupType === "FORM" ? (editingPopup.formButtonText || "") : (editingPopup.buttonText || "")}
                            onChange={(e) => updateField(editingPopup.popupType === "FORM" ? "formButtonText" : "buttonText", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none"
                            placeholder="Saiba mais"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Link do Botão</label>
                          <input
                            type="text"
                            value={editingPopup.buttonLink || ""}
                            onChange={(e) => updateField("buttonLink", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none"
                            placeholder="/imoveis ou https://..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Campos do formulário */}
                    {editingPopup.popupType === "FORM" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Campos do Formulário</label>
                        <div className="flex flex-wrap gap-2">
                          {["nome", "email", "telefone", "mensagem"].map(field => (
                            <button
                              key={field}
                              type="button"
                              onClick={() => {
                                const current = editingPopup.formFields || [];
                                updateField("formFields",
                                  current.includes(field) ? current.filter(f => f !== field) : [...current, field]
                                );
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                (editingPopup.formFields || []).includes(field)
                                  ? "border-[#0B2545] bg-[#0B2545] text-white"
                                  : "border-neutral-200 dark:border-neutral-700"
                              }`}
                            >
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ativo/Inativo */}
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      <div>
                        <span className="font-medium text-sm">Pop-up ativo</span>
                        <p className="text-xs text-neutral-500">Quando desativado, não será exibido no site</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField("isActive", !editingPopup.isActive)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          editingPopup.isActive ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                          editingPopup.isActive ? "translate-x-6" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Gatilho */}
                {activeTab === "gatilho" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-3">Quando exibir o pop-up?</label>
                      <div className="space-y-2">
                        {triggerOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField("triggerType", opt.value)}
                            className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 ${
                              editingPopup.triggerType === opt.value
                                ? "border-[#0B2545] bg-[#0B2545]/5"
                                : "border-neutral-200 dark:border-neutral-700"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              editingPopup.triggerType === opt.value ? "border-[#0B2545]" : "border-neutral-300"
                            }`}>
                              {editingPopup.triggerType === opt.value && (
                                <div className="w-2 h-2 rounded-full bg-[#0B2545]" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{opt.label}</span>
                              <p className="text-xs text-neutral-500">{opt.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Valor do gatilho (condicional) */}
                    {editingPopup.triggerType && editingPopup.triggerType !== "PAGE_LOAD" && editingPopup.triggerType !== "EXIT_INTENT" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {editingPopup.triggerType === "VIEWS_COUNT" && "Após quantas visualizações de imóveis?"}
                          {editingPopup.triggerType === "TIME_ON_SITE" && "Após quantos segundos no site?"}
                          {editingPopup.triggerType === "SCROLL_DEPTH" && "Em qual percentual de scroll? (0-100)"}
                        </label>
                        <input
                          type="number"
                          value={editingPopup.triggerValue || 0}
                          onChange={(e) => updateField("triggerValue", parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none"
                          min={0}
                        />
                      </div>
                    )}

                    {/* Frequência */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Com que frequência exibir?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {frequencyOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField("showFrequency", opt.value)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                              editingPopup.showFrequency === opt.value
                                ? "border-[#0B2545] bg-[#0B2545] text-white"
                                : "border-neutral-200 dark:border-neutral-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Agendamento */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Data de Início (opcional)</label>
                        <input
                          type="datetime-local"
                          value={editingPopup.startDate ? new Date(editingPopup.startDate).toISOString().slice(0, 16) : ""}
                          onChange={(e) => updateField("startDate", e.target.value || null)}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Data de Fim (opcional)</label>
                        <input
                          type="datetime-local"
                          value={editingPopup.endDate ? new Date(editingPopup.endDate).toISOString().slice(0, 16) : ""}
                          onChange={(e) => updateField("endDate", e.target.value || null)}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Páginas */}
                {activeTab === "paginas" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Em quais páginas exibir?</label>
                      <p className="text-xs text-neutral-500 mb-3">Deixe vazio para exibir em todas as páginas</p>
                      <div className="space-y-2">
                        {pageOptions.map(page => (
                          <button
                            key={page.value}
                            type="button"
                            onClick={() => toggleTargetPage(page.value)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              (editingPopup.targetPages || []).includes(page.value)
                                ? "border-[#0B2545] bg-[#0B2545]/5"
                                : "border-neutral-200 dark:border-neutral-700"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              (editingPopup.targetPages || []).includes(page.value)
                                ? "border-[#0B2545] bg-[#0B2545]"
                                : "border-neutral-300"
                            }`}>
                              {(editingPopup.targetPages || []).includes(page.value) && (
                                <RiCheckLine className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-sm font-medium">{page.label}</span>
                              <span className="text-xs text-neutral-400 ml-2">{page.value}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Estilo */}
                {activeTab === "estilo" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Posição</label>
                        <div className="flex gap-2">
                          {positionOptions.map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateField("position", opt.value)}
                              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                                editingPopup.position === opt.value
                                  ? "border-[#0B2545] bg-[#0B2545] text-white"
                                  : "border-neutral-200 dark:border-neutral-700"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tamanho</label>
                        <div className="flex gap-2">
                          {sizeOptions.map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateField("size", opt.value)}
                              className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                                editingPopup.size === opt.value
                                  ? "border-[#0B2545] bg-[#0B2545] text-white"
                                  : "border-neutral-200 dark:border-neutral-700"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Cor de Fundo</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingPopup.bgColor || "#0B2545"}
                            onChange={(e) => updateField("bgColor", e.target.value)}
                            className="w-10 h-10 rounded-lg border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingPopup.bgColor || "#0B2545"}
                            onChange={(e) => updateField("bgColor", e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cor do Texto</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingPopup.textColor || "#FFFFFF"}
                            onChange={(e) => updateField("textColor", e.target.value)}
                            className="w-10 h-10 rounded-lg border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingPopup.textColor || "#FFFFFF"}
                            onChange={(e) => updateField("textColor", e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Opacidade do Overlay</label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={editingPopup.overlayOpacity ?? 0.5}
                          onChange={(e) => updateField("overlayOpacity", parseFloat(e.target.value))}
                          className="w-full mt-2"
                        />
                        <span className="text-xs text-neutral-500">{Math.round((editingPopup.overlayOpacity ?? 0.5) * 100)}%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Ordem de prioridade</label>
                      <input
                        type="number"
                        value={editingPopup.order || 0}
                        onChange={(e) => updateField("order", parseInt(e.target.value) || 0)}
                        className="w-32 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-[#0B2545] outline-none"
                        min={0}
                      />
                      <p className="text-xs text-neutral-500 mt-1">Menor número = maior prioridade</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer do modal */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0B2545] text-white rounded-xl text-sm font-medium hover:bg-[#081733] disabled:opacity-60 transition-colors"
                >
                  {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSaveLine className="w-4 h-4" />}
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
