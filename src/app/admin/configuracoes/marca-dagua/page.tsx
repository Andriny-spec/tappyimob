"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  RiImageLine, 
  RiSaveLine, 
  RiUploadCloud2Line,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line
} from "react-icons/ri";

const positions = [
  { id: "top-left", label: "Superior Esquerdo" },
  { id: "top-center", label: "Superior Centro" },
  { id: "top-right", label: "Superior Direito" },
  { id: "center-left", label: "Centro Esquerdo" },
  { id: "center", label: "Centro" },
  { id: "center-right", label: "Centro Direito" },
  { id: "bottom-left", label: "Inferior Esquerdo" },
  { id: "bottom-center", label: "Inferior Centro" },
  { id: "bottom-right", label: "Inferior Direito" },
];

export default function MarcaDaguaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState({
    logoUrl: "",
    position: "bottom-right",
    opacity: 50,
    scale: 20,
    margin: 20,
    isActive: false,
  });

  // Carregar configurações
  useEffect(() => {
    fetch("/api/admin/watermark")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            logoUrl: data.logoUrl || "",
            position: data.position || "bottom-right",
            opacity: data.opacity || 50,
            scale: data.scale || 20,
            margin: data.margin || 20,
            isActive: data.isActive || false,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Upload do logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "watermark");
    formData.append("skipWatermark", "true");

    try {
      console.log("[Marca d'água] Iniciando upload...", file.name, file.type, file.size);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("[Marca d'água] Resposta upload:", res.status, data);

      if (res.ok && data.url) {
        setSettings((prev) => ({ ...prev, logoUrl: data.url }));
      } else {
        setUploadError(data.error || "Erro ao fazer upload");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setUploadError("Erro de conexão ao fazer upload");
    } finally {
      setUploading(false);
      // Reset input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Salvar configurações
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/watermark", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert("Configurações salvas com sucesso!");
      } else {
        alert("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  // Posição do preview
  const getPreviewPosition = () => {
    const pos = settings.position;
    const margin = `${settings.margin}px`;
    
    const styles: Record<string, string> = {};
    
    if (pos.includes("top")) styles.top = margin;
    if (pos.includes("bottom")) styles.bottom = margin;
    if (pos.includes("left")) styles.left = margin;
    if (pos.includes("right")) styles.right = margin;
    if (pos === "center") {
      styles.top = "50%";
      styles.left = "50%";
      styles.transform = "translate(-50%, -50%)";
    }
    if (pos === "top-center" || pos === "bottom-center") {
      styles.left = "50%";
      styles.transform = "translateX(-50%)";
    }
    if (pos === "center-left" || pos === "center-right") {
      styles.top = "50%";
      styles.transform = "translateY(-50%)";
    }
    
    return styles;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Marca d'Água
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure a marca d'água que será aplicada automaticamente nas fotos dos imóveis
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RiSaveLine className="w-4 h-4" />
          )}
          Salvar Configurações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Ativar/Desativar */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Marca d'Água Ativa
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Quando ativada, todas as novas fotos receberão a marca d'água
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, isActive: !settings.isActive })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.isActive ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
                }`}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                  animate={{ left: settings.isActive ? "calc(100% - 24px)" : "4px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          {/* Upload do Logo */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Logo da Marca d'Água
            </h3>
            
            {settings.logoUrl ? (
              <div className="relative">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="max-h-32 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-2"
                />
                <button
                  onClick={() => setSettings({ ...settings, logoUrl: "" })}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RiLoader4Line className="w-10 h-10 text-orange-500 mb-2 animate-spin" />
                      <span className="text-sm font-medium text-orange-600">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <RiUploadCloud2Line className="w-10 h-10 text-neutral-400 mb-2" />
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Clique para fazer upload
                      </span>
                      <span className="text-xs text-neutral-500 mt-1">
                        PNG com fundo transparente recomendado
                      </span>
                    </>
                  )}
                </button>
                {uploadError && (
                  <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                )}
              </>
            )}
          </div>

          {/* Posição */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Posição
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {positions.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setSettings({ ...settings, position: pos.id })}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                    settings.position === pos.id
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-orange-300 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transparência */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Transparência
              </h3>
              <span className="text-sm font-medium text-orange-500">
                {settings.opacity}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.opacity}
              onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Mais transparente</span>
              <span>Mais opaco</span>
            </div>
          </div>

          {/* Tamanho */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Tamanho
              </h3>
              <span className="text-sm font-medium text-orange-500">
                {settings.scale}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={settings.scale}
              onChange={(e) => setSettings({ ...settings, scale: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Menor</span>
              <span>Maior</span>
            </div>
          </div>

          {/* Margem */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Margem
              </h3>
              <span className="text-sm font-medium text-orange-500">
                {settings.margin}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.margin}
              onChange={(e) => setSettings({ ...settings, margin: parseInt(e.target.value) })}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Sem margem</span>
              <span>Mais afastado</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Preview em Tempo Real
            </h3>
            
            <div className="relative aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
              {/* Imagem de exemplo */}
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Marca d'água */}
              {settings.logoUrl && settings.isActive && (
                <div
                  className="absolute"
                  style={{
                    ...getPreviewPosition(),
                    width: `${settings.scale}%`,
                    opacity: settings.opacity / 100,
                  }}
                >
                  <img
                    src={settings.logoUrl}
                    alt="Marca d'água"
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Overlay quando desativado */}
              {!settings.isActive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <RiCloseLine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Marca d'água desativada</p>
                  </div>
                </div>
              )}

              {/* Sem logo */}
              {!settings.logoUrl && settings.isActive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <RiImageLine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Faça upload do logo</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <p className="text-xs text-neutral-500">
                <strong>Nota:</strong> A marca d'água será aplicada automaticamente em todas as novas fotos importadas. 
                Fotos já existentes não serão alteradas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
