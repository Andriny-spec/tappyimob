"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiDragMoveLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiSaveLine,
  RiCloseLine,
  RiImageAddLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiUploadCloud2Line,
  RiDeleteBin6Line,
} from "react-icons/ri";

type HeroSlide = {
  id: string;
  title: string;
  paragraph?: string;
  badge?: string;
  alignment: string;
  titleSize: string;
  titleFont: string;
  titleColor: string;
  paragraphSize: string;
  paragraphFont: string;
  paragraphColor: string;
  button1Text?: string;
  button1Link?: string;
  button1Color: string;
  button1Hover: string;
  button1TextColor: string;
  button1Rounded: string;
  button2Text?: string;
  button2Link?: string;
  button2Color: string;
  button2Hover: string;
  button2TextColor: string;
  button2Rounded: string;
  button2Border: string;
  bgImage?: string;
  bgVideo?: string;
  bgOverlay: string;
  order: number;
  isActive: boolean;
};

const defaultSlide: Partial<HeroSlide> = {
  title: "Novo Slide",
  paragraph: "",
  badge: "",
  alignment: "left",
  titleSize: "text-4xl md:text-6xl",
  titleFont: "font-bold",
  titleColor: "#FFFFFF",
  paragraphSize: "text-lg md:text-xl",
  paragraphFont: "font-normal",
  paragraphColor: "#FFFFFF",
  button1Text: "Ver Imóveis",
  button1Link: "/imoveis",
  button1Color: "#0B2545",
  button1Hover: "#1A3560",
  button1TextColor: "#FFFFFF",
  button1Rounded: "rounded-xl",
  button2Text: "",
  button2Link: "",
  button2Color: "transparent",
  button2Hover: "rgba(255,255,255,0.1)",
  button2TextColor: "#FFFFFF",
  button2Rounded: "rounded-xl",
  button2Border: "border border-white",
  bgImage: "",
  bgOverlay: "bg-black/40",
  isActive: true,
};

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  // Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero-slides");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditingSlide({ ...editingSlide, bgImage: data.url });
      } else {
        alert("Erro ao fazer upload da imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    }
    setUploading(false);
  };

  const handleRemoveImage = () => {
    if (!editingSlide) return;
    setEditingSlide({ ...editingSlide, bgImage: "" });
  };

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/site/hero-slides");
      const data = await res.json();
      setSlides(data.slides || []);
    } catch (error) {
      console.error("Erro ao buscar slides:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingSlide) return;
    setSaving(true);

    try {
      const isNew = !editingSlide.id;
      const url = isNew
        ? "/api/site/hero-slides"
        : `/api/site/hero-slides/${editingSlide.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSlide),
      });

      if (res.ok) {
        await fetchSlides();
        setShowModal(false);
        setEditingSlide(null);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;

    try {
      await fetch(`/api/site/hero-slides/${id}`, { method: "DELETE" });
      await fetchSlides();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await fetch(`/api/site/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      await fetchSlides();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const index = slides.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === slides.length - 1)
    )
      return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];

    // Atualizar ordens
    for (let i = 0; i < newSlides.length; i++) {
      await fetch(`/api/site/hero-slides/${newSlides[i].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: i }),
      });
    }
    await fetchSlides();
  };

  const openNewSlide = () => {
    setEditingSlide(defaultSlide as HeroSlide);
    setShowModal(true);
  };

  const openEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A1E3D]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Hero Slider
          </h1>
          <p className="text-neutral-500">
            Gerencie os slides do banner principal da home
          </p>
        </div>
        <button
          onClick={openNewSlide}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1E3D] text-white rounded-xl hover:bg-[#1A3560] transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          Novo Slide
        </button>
      </div>

      {/* Lista de Slides */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <RiImageAddLine className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Nenhum slide cadastrado
            </h3>
            <p className="text-neutral-500 mb-4">
              Crie seu primeiro slide para o banner da home
            </p>
            <button
              onClick={openNewSlide}
              className="px-4 py-2 bg-[#0A1E3D] text-white rounded-xl"
            >
              Criar Slide
            </button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-neutral-900 rounded-2xl border overflow-hidden ${
                slide.isActive
                  ? "border-neutral-200 dark:border-neutral-800"
                  : "border-neutral-200 dark:border-neutral-800 opacity-60"
              }`}
            >
              <div className="flex items-stretch">
                {/* Preview */}
                <div
                  className="w-64 h-36 flex-shrink-0 relative bg-cover bg-center"
                  style={{
                    backgroundImage: slide.bgImage
                      ? `url(${slide.bgImage})`
                      : "linear-gradient(135deg, #0B2545 0%, #1A3560 100%)",
                  }}
                >
                  <div className={`absolute inset-0 ${slide.bgOverlay}`} />
                  <div className="absolute inset-0 p-4 flex flex-col justify-center">
                    {slide.badge && (
                      <span className="text-[8px] bg-orange-500 text-white px-1.5 py-0.5 rounded w-fit mb-1">
                        {slide.badge}
                      </span>
                    )}
                    <h3
                      className="text-sm font-bold line-clamp-2"
                      style={{ color: slide.titleColor }}
                    >
                      {slide.title}
                    </h3>
                    {slide.paragraph && (
                      <p
                        className="text-[10px] line-clamp-2 mt-1"
                        style={{ color: slide.paragraphColor }}
                      >
                        {slide.paragraph}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {slide.title}
                      </h3>
                      <p className="text-sm text-neutral-500 line-clamp-1">
                        {slide.paragraph || "Sem descrição"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            slide.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {slide.isActive ? "Ativo" : "Inativo"}
                        </span>
                        <span className="text-xs text-neutral-400">
                          Ordem: {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReorder(slide.id, "up")}
                        disabled={index === 0}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                      >
                        <RiArrowUpLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(slide.id, "down")}
                        disabled={index === slides.length - 1}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                      >
                        <RiArrowDownLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(slide)}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        {slide.isActive ? (
                          <RiEyeLine className="w-4 h-4 text-green-500" />
                        ) : (
                          <RiEyeOffLine className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditSlide(slide)}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <RiEditLine className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <RiDeleteBinLine className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de Edição */}
      <AnimatePresence>
        {showModal && editingSlide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {editingSlide.id ? "Editar Slide" : "Novo Slide"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coluna Esquerda - Conteúdo */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      Conteúdo
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">Título *</label>
                      <input
                        value={editingSlide.title}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, title: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Parágrafo</label>
                      <textarea
                        value={editingSlide.paragraph || ""}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, paragraph: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Badge</label>
                        <input
                          value={editingSlide.badge || ""}
                          onChange={(e) =>
                            setEditingSlide({ ...editingSlide, badge: e.target.value })
                          }
                          placeholder="Ex: Exclusivo"
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Alinhamento</label>
                        <select
                          value={editingSlide.alignment}
                          onChange={(e) =>
                            setEditingSlide({ ...editingSlide, alignment: e.target.value })
                          }
                          className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Imagem de Fundo
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {editingSlide.bgImage ? (
                        <div className="relative rounded-xl overflow-hidden">
                          <img
                            src={editingSlide.bgImage}
                            alt="Background"
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 bg-white rounded-lg text-neutral-700 hover:bg-neutral-100"
                            >
                              <RiUploadCloud2Line className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50"
                            >
                              <RiDeleteBin6Line className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#0A1E3D] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          {uploading ? (
                            <RiLoader4Line className="w-6 h-6 animate-spin text-neutral-400" />
                          ) : (
                            <>
                              <RiUploadCloud2Line className="w-8 h-8 text-neutral-400" />
                              <span className="text-sm text-neutral-500">
                                Clique para fazer upload
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Overlay</label>
                      <select
                        value={editingSlide.bgOverlay}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, bgOverlay: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                      >
                        <option value="bg-black/20">Leve (20%)</option>
                        <option value="bg-black/40">Médio (40%)</option>
                        <option value="bg-black/60">Forte (60%)</option>
                        <option value="bg-black/80">Muito Forte (80%)</option>
                      </select>
                    </div>
                  </div>

                  {/* Coluna Direita - Botões e Estilos */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      Botões
                    </h3>

                    {/* Botão 1 */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3">
                      <h4 className="text-sm font-medium">Botão Principal</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs mb-1">Texto</label>
                          <input
                            value={editingSlide.button1Text || ""}
                            onChange={(e) =>
                              setEditingSlide({ ...editingSlide, button1Text: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Link</label>
                          <input
                            value={editingSlide.button1Link || ""}
                            onChange={(e) =>
                              setEditingSlide({ ...editingSlide, button1Link: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Cor</label>
                          <input
                            type="color"
                            value={editingSlide.button1Color}
                            onChange={(e) =>
                              setEditingSlide({ ...editingSlide, button1Color: e.target.value })
                            }
                            className="w-full h-9 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Cor do Texto</label>
                          <input
                            type="color"
                            value={editingSlide.button1TextColor}
                            onChange={(e) =>
                              setEditingSlide({ ...editingSlide, button1TextColor: e.target.value })
                            }
                            className="w-full h-9 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botão 2 */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3">
                      <h4 className="text-sm font-medium">Botão Secundário</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs mb-1">Texto</label>
                          <input
                            value={editingSlide.button2Text || ""}
                            onChange={(e) =>
                              setEditingSlide({ ...editingSlide, button2Text: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Link</label>
                          <input
                            value={editingSlide.button2Link || ""}
                            onChange={(e) =>
                              setEditingSlide({ ...editingSlide, button2Link: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Cor do Texto</label>
                          <input
                            type="color"
                            value={editingSlide.button2TextColor}
                            onChange={(e) =>
                              setEditingSlide({ ...editingSlide, button2TextColor: e.target.value })
                            }
                            className="w-full h-9 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cores do Texto */}
                    <h3 className="font-semibold text-neutral-900 dark:text-white pt-2">
                      Cores do Texto
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Cor do Título</label>
                        <input
                          type="color"
                          value={editingSlide.titleColor}
                          onChange={(e) =>
                            setEditingSlide({ ...editingSlide, titleColor: e.target.value })
                          }
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Cor do Parágrafo</label>
                        <input
                          type="color"
                          value={editingSlide.paragraphColor}
                          onChange={(e) =>
                            setEditingSlide({ ...editingSlide, paragraphColor: e.target.value })
                          }
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1E3D] text-white rounded-xl hover:bg-[#1A3560] disabled:opacity-50"
                >
                  {saving ? (
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                  ) : (
                    <RiSaveLine className="w-5 h-5" />
                  )}
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
