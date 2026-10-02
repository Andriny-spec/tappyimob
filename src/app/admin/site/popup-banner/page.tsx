"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  RiSaveLine, 
  RiImageAddLine, 
  RiDeleteBinLine,
  RiEyeLine,
  RiLoader4Line,
  RiCheckLine,
  RiCloseLine,
  RiArrowLeftLine
} from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";

interface PopupBannerData {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  clicksToShow: number;
  isActive: boolean;
}

export default function PopupBannerAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  const [formData, setFormData] = useState<PopupBannerData>({
    title: "Não perca essa oportunidade!",
    description: "",
    imageUrl: "",
    buttonText: "Saiba mais",
    buttonLink: "",
    clicksToShow: 10,
    isActive: true,
  });

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/site/popup-banner");
        if (res.ok) {
          const data = await res.json();
          if (data.banners && data.banners.length > 0) {
            const banner = data.banners[0];
            setFormData({
              id: banner.id,
              title: banner.title || "",
              description: banner.description || "",
              imageUrl: banner.imageUrl || "",
              buttonText: banner.buttonText || "Saiba mais",
              buttonLink: banner.buttonLink || "",
              clicksToShow: banner.clicksToShow || 10,
              isActive: banner.isActive ?? true,
            });
          }
        }
      } catch (error) {
        console.error("Erro ao buscar banner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/site/popup-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, id: data.banner.id }));
        showMessage("success", "Banner salvo com sucesso!");
      } else {
        showMessage("error", "Erro ao salvar banner");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showMessage("error", "Erro ao salvar banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;

    try {
      const res = await fetch(`/api/site/popup-banner?id=${formData.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFormData({
          title: "Não perca essa oportunidade!",
          description: "",
          imageUrl: "",
          buttonText: "Saiba mais",
          buttonLink: "",
          clicksToShow: 10,
          isActive: true,
        });
        showMessage("success", "Banner excluído com sucesso!");
      } else {
        showMessage("error", "Erro ao excluir banner");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showMessage("error", "Erro ao excluir banner");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
            message.type === "success" 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}
        >
          {message.type === "success" ? <RiCheckLine className="w-5 h-5" /> : <RiCloseLine className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/site"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Banner Pop-up
            </h1>
            <p className="text-neutral-500 text-sm">
              Configure o banner que aparece a cada X cliques em imóveis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <RiEyeLine className="w-4 h-4" />
            Preview
          </button>
          {formData.id && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <RiDeleteBinLine className="w-4 h-4" />
              Excluir
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#0B2545] text-white hover:bg-[#081733] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <RiLoader4Line className="w-4 h-4 animate-spin" />
            ) : (
              <RiSaveLine className="w-4 h-4" />
            )}
            Salvar
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div>
            <h3 className="font-medium text-neutral-900 dark:text-white">Status do Banner</h3>
            <p className="text-sm text-neutral-500">Ative ou desative o banner pop-up</p>
          </div>
          <button
            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              formData.isActive ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                formData.isActive ? "left-8" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Cliques para mostrar */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Mostrar a cada X cliques em imóveis
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.clicksToShow}
            onChange={(e) => setFormData(prev => ({ ...prev, clicksToShow: parseInt(e.target.value) || 10 }))}
            className="w-32 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-[#0B2545] focus:border-transparent outline-none"
          />
          <p className="text-xs text-neutral-500 mt-1">
            O pop-up aparecerá após cada {formData.clicksToShow} cliques em fichas de imóveis
          </p>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Não perca essa oportunidade!"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-[#0B2545] focus:border-transparent outline-none"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva a oferta ou chamada para ação..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-[#0B2545] focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Imagem */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Imagem do Banner (URL)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-[#0B2545] focus:border-transparent outline-none"
            />
          </div>
          {formData.imageUrl && (
            <div className="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
              <Image
                src={formData.imageUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Botão */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Texto do Botão
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
              placeholder="Saiba mais"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-[#0B2545] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Link do Botão
            </label>
            <input
              type="text"
              value={formData.buttonLink}
              onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
              placeholder="/off-market ou https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-[#0B2545] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden max-w-md w-full"
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>

            {formData.imageUrl && (
              <div className="relative w-full h-48 sm:h-56">
                <Image
                  src={formData.imageUrl}
                  alt={formData.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <div className={`p-6 ${formData.imageUrl ? "-mt-12 relative" : ""}`}>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${formData.imageUrl ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                {formData.title || "Título do Banner"}
              </h2>
              
              {formData.description && (
                <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base mb-5">
                  {formData.description}
                </p>
              )}

              <div className="flex gap-3">
                <button className="flex-1 py-3 px-6 rounded-xl bg-[#0B2545] text-white font-semibold">
                  {formData.buttonText || "Saiba mais"}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="py-3 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
