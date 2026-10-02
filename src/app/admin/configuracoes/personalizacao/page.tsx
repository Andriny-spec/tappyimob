"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiPaletteLine,
  RiSave3Line,
  RiCheckLine,
  RiSunLine,
  RiMoonLine,
  RiComputerLine,
  RiLayoutLine,
  RiFontSize,
  RiImage2Line,
  RiContrastLine,
  RiPaintBrushLine,
  RiEyeLine,
} from "react-icons/ri";

const temas = [
  { id: "light", nome: "Claro", icon: RiSunLine, preview: "bg-white" },
  { id: "dark", nome: "Escuro", icon: RiMoonLine, preview: "bg-neutral-900" },
  { id: "system", nome: "Sistema", icon: RiComputerLine, preview: "bg-gradient-to-r from-white to-neutral-900" },
];

const coresPrimarias = [
  { id: "blue", nome: "Azul", cor: "#3B82F6" },
  { id: "indigo", nome: "Índigo", cor: "#6366F1" },
  { id: "purple", nome: "Roxo", cor: "#8B5CF6" },
  { id: "pink", nome: "Rosa", cor: "#EC4899" },
  { id: "red", nome: "Vermelho", cor: "#EF4444" },
  { id: "orange", nome: "Laranja", cor: "#25D366" },
  { id: "amber", nome: "Âmbar", cor: "#F59E0B" },
  { id: "green", nome: "Verde", cor: "#22C55E" },
  { id: "teal", nome: "Teal", cor: "#14B8A6" },
  { id: "cyan", nome: "Ciano", cor: "#06B6D4" },
];

const densidades = [
  { id: "compact", nome: "Compacto", descricao: "Mais informações em menos espaço" },
  { id: "normal", nome: "Normal", descricao: "Equilíbrio entre espaço e conteúdo" },
  { id: "comfortable", nome: "Confortável", descricao: "Mais espaço entre elementos" },
];

const fontes = [
  { id: "inter", nome: "Inter", preview: "font-sans" },
  { id: "roboto", nome: "Roboto", preview: "font-sans" },
  { id: "poppins", nome: "Poppins", preview: "font-sans" },
  { id: "nunito", nome: "Nunito", preview: "font-sans" },
];

export default function PersonalizacaoConfigPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    tema: "dark",
    corPrimaria: "blue",
    densidade: "normal",
    fonte: "inter",
    sidebarCompacta: false,
    animacoes: true,
    bordas: "rounded",
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/configuracoes" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                <RiPaletteLine className="w-5 h-5 text-rose-500" />
              </div>
              Personalização
            </h1>
            <p className="text-neutral-500 mt-1">Customize a aparência do sistema</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 h-10 px-6 rounded-xl font-medium transition-all ${
            saved ? "bg-green-500 text-white" : "bg-rose-500 text-white hover:bg-rose-600"
          }`}
        >
          {saved ? (
            <><RiCheckLine className="w-5 h-5" /> Salvo!</>
          ) : isSaving ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
          ) : (
            <><RiSave3Line className="w-5 h-5" /> Salvar</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiContrastLine className="w-5 h-5 text-neutral-400" />
            Tema
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {temas.map(tema => {
              const Icon = tema.icon;
              return (
                <button
                  key={tema.id}
                  onClick={() => setConfig(prev => ({ ...prev, tema: tema.id }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    config.tema === tema.id
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <div className={`w-full h-12 rounded-lg mb-3 ${tema.preview} border border-neutral-200 dark:border-neutral-700`} />
                  <div className="flex items-center justify-center gap-2">
                    <Icon className={`w-4 h-4 ${config.tema === tema.id ? "text-rose-500" : "text-neutral-400"}`} />
                    <span className={`text-sm font-medium ${config.tema === tema.id ? "text-rose-600" : "text-neutral-700 dark:text-neutral-300"}`}>
                      {tema.nome}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Cor Primária */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiPaintBrushLine className="w-5 h-5 text-neutral-400" />
            Cor Principal
          </h3>

          <div className="grid grid-cols-5 gap-3">
            {coresPrimarias.map(cor => (
              <button
                key={cor.id}
                onClick={() => setConfig(prev => ({ ...prev, corPrimaria: cor.id }))}
                className={`relative aspect-square rounded-xl transition-all ${
                  config.corPrimaria === cor.id ? "ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-900" : ""
                }`}
                style={{ backgroundColor: cor.cor }}
                title={cor.nome}
              >
                {config.corPrimaria === cor.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RiCheckLine className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-sm text-neutral-500 mb-2">Cor personalizada</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={coresPrimarias.find(c => c.id === config.corPrimaria)?.cor || "#3B82F6"}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={coresPrimarias.find(c => c.id === config.corPrimaria)?.cor || "#3B82F6"}
                className="h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm w-32"
                readOnly
              />
            </div>
          </div>
        </motion.div>

        {/* Densidade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiLayoutLine className="w-5 h-5 text-neutral-400" />
            Densidade
          </h3>

          <div className="space-y-3">
            {densidades.map(densidade => (
              <button
                key={densidade.id}
                onClick={() => setConfig(prev => ({ ...prev, densidade: densidade.id }))}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  config.densidade === densidade.id
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <p className={`font-medium ${config.densidade === densidade.id ? "text-rose-600" : "text-neutral-900 dark:text-white"}`}>
                  {densidade.nome}
                </p>
                <p className="text-sm text-neutral-500">{densidade.descricao}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Fonte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiFontSize className="w-5 h-5 text-neutral-400" />
            Fonte
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {fontes.map(fonte => (
              <button
                key={fonte.id}
                onClick={() => setConfig(prev => ({ ...prev, fonte: fonte.id }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  config.fonte === fonte.id
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <p className={`text-lg ${fonte.preview} ${config.fonte === fonte.id ? "text-rose-600" : "text-neutral-900 dark:text-white"}`}>
                  {fonte.nome}
                </p>
                <p className={`text-sm ${fonte.preview} text-neutral-500`}>Aa Bb Cc 123</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Outras Opções */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Outras Opções</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">Sidebar Compacta</p>
              <p className="text-sm text-neutral-500">Mostrar apenas ícones na sidebar</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, sidebarCompacta: !prev.sidebarCompacta }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.sidebarCompacta ? "bg-rose-500" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            >
              <div className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${
                config.sidebarCompacta ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">Animações</p>
              <p className="text-sm text-neutral-500">Transições e animações da interface</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, animacoes: !prev.animacoes }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.animacoes ? "bg-rose-500" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            >
              <div className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${
                config.animacoes ? "translate-x-6" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">Estilo das Bordas</p>
              <p className="text-sm text-neutral-500">Formato dos cantos dos elementos</p>
            </div>
            <select
              value={config.bordas}
              onChange={(e) => setConfig(prev => ({ ...prev, bordas: e.target.value }))}
              className="h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            >
              <option value="none">Reto</option>
              <option value="rounded">Arredondado</option>
              <option value="full">Muito Arredondado</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-6 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10 rounded-2xl border border-rose-200 dark:border-rose-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
            <RiEyeLine className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-800 dark:text-rose-400">Preview</h3>
            <p className="text-sm text-rose-700 dark:text-rose-300">As alterações serão aplicadas em tempo real após salvar</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-rose-200 dark:border-rose-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: coresPrimarias.find(c => c.id === config.corPrimaria)?.cor }} />
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
              <div className="w-2/3 h-full rounded-full" style={{ backgroundColor: coresPrimarias.find(c => c.id === config.corPrimaria)?.cor }} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-8 px-4 text-sm text-white rounded-lg" style={{ backgroundColor: coresPrimarias.find(c => c.id === config.corPrimaria)?.cor }}>
              Botão Primário
            </button>
            <button className="h-8 px-4 text-sm rounded-lg border" style={{ borderColor: coresPrimarias.find(c => c.id === config.corPrimaria)?.cor, color: coresPrimarias.find(c => c.id === config.corPrimaria)?.cor }}>
              Botão Secundário
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
