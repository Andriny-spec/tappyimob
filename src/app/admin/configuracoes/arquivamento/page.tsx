"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  RiArrowLeftLine,
  RiAddLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiLoader4Line,
  RiCloseLine,
  RiInboxArchiveLine,
  RiDraggable,
} from "react-icons/ri";
import Link from "next/link";

interface CategoryItem {
  id: string;
  label: string;
  color: string;
}

const colorOptions = [
  { color: "bg-red-100 text-red-700", label: "Vermelho" },
  { color: "bg-blue-100 text-blue-700", label: "Azul" },
  { color: "bg-amber-100 text-amber-700", label: "Âmbar" },
  { color: "bg-green-100 text-green-700", label: "Verde" },
  { color: "bg-purple-100 text-purple-700", label: "Roxo" },
  { color: "bg-neutral-100 text-neutral-700", label: "Neutro" },
  { color: "bg-pink-100 text-pink-700", label: "Rosa" },
  { color: "bg-teal-100 text-teal-700", label: "Teal" },
  { color: "bg-indigo-100 text-indigo-700", label: "Índigo" },
];

const defaultReasons = [
  "Não tem interesse",
  "Sem condições financeiras",
  "Comprou com concorrente",
  "Não responde",
  "Contato inválido",
  "Lead duplicado",
  "Fora do perfil",
  "Desistiu",
  "Outro",
];

const defaultLimboCategories: CategoryItem[] = [
  { id: "perdido", label: "Perdido", color: "bg-red-100 text-red-700" },
  { id: "nurturing", label: "Nurturing", color: "bg-blue-100 text-blue-700" },
  { id: "reativar", label: "Reativar depois", color: "bg-amber-100 text-amber-700" },
  { id: "sem_perfil", label: "Sem perfil", color: "bg-neutral-100 text-neutral-700" },
];

const defaultAcervoCategories: CategoryItem[] = [
  { id: "nurturing", label: "Nurturing", color: "bg-blue-100 text-blue-700" },
  { id: "reativar", label: "Reativar depois", color: "bg-amber-100 text-amber-700" },
];

export default function ArchiveConfigPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [reasons, setReasons] = useState<string[]>(defaultReasons);
  const [limboCategories, setLimboCategories] = useState<CategoryItem[]>(defaultLimboCategories);
  const [acervoCategories, setAcervoCategories] = useState<CategoryItem[]>(defaultAcervoCategories);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newReason, setNewReason] = useState("");
  const [newLimboCat, setNewLimboCat] = useState({ label: "", color: colorOptions[0].color });
  const [newAcervoCat, setNewAcervoCat] = useState({ label: "", color: colorOptions[1].color });

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/admin");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const [reasonsRes, limboRes, acervoRes] = await Promise.all([
          fetch("/api/admin/config?key=archive_reasons"),
          fetch("/api/admin/config?key=archive_limbo_categories"),
          fetch("/api/admin/config?key=archive_acervo_categories"),
        ]);
        if (reasonsRes.ok) {
          const data = await reasonsRes.json();
          if (data.value && Array.isArray(data.value) && data.value.length > 0) {
            setReasons(data.value);
          }
        }
        if (limboRes.ok) {
          const data = await limboRes.json();
          if (data.value && Array.isArray(data.value) && data.value.length > 0) {
            setLimboCategories(data.value);
          }
        }
        if (acervoRes.ok) {
          const data = await acervoRes.json();
          if (data.value && Array.isArray(data.value) && data.value.length > 0) {
            setAcervoCategories(data.value);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        fetch("/api/admin/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "archive_reasons", value: reasons }),
        }),
        fetch("/api/admin/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "archive_limbo_categories", value: limboCategories }),
        }),
        fetch("/api/admin/config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "archive_acervo_categories", value: acervoCategories }),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const addReason = () => {
    if (!newReason.trim()) return;
    if (reasons.includes(newReason.trim())) return;
    setReasons([...reasons, newReason.trim()]);
    setNewReason("");
  };

  const removeReason = (idx: number) => {
    setReasons(reasons.filter((_, i) => i !== idx));
  };

  const addLimboCategory = () => {
    if (!newLimboCat.label.trim()) return;
    const id = newLimboCat.label.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (limboCategories.some(c => c.id === id)) return;
    setLimboCategories([...limboCategories, { id, label: newLimboCat.label.trim(), color: newLimboCat.color }]);
    setNewLimboCat({ label: "", color: colorOptions[0].color });
  };

  const removeLimboCategory = (id: string) => {
    setLimboCategories(limboCategories.filter(c => c.id !== id));
  };

  const addAcervoCategory = () => {
    if (!newAcervoCat.label.trim()) return;
    const id = newAcervoCat.label.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (acervoCategories.some(c => c.id === id)) return;
    setAcervoCategories([...acervoCategories, { id, label: newAcervoCat.label.trim(), color: newAcervoCat.color }]);
    setNewAcervoCat({ label: "", color: colorOptions[1].color });
  };

  const removeAcervoCategory = (id: string) => {
    setAcervoCategories(acervoCategories.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/configuracoes"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiInboxArchiveLine className="w-7 h-7 text-neutral-400" />
              Configurar Arquivamento
            </h1>
            <p className="text-sm text-neutral-500">
              Editar motivos e categorias do modal de arquivamento
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            saved
              ? "bg-green-500 text-white"
              : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
          }`}
        >
          {saving ? (
            <RiLoader4Line className="w-4 h-4 animate-spin" />
          ) : saved ? (
            "✓ Salvo"
          ) : (
            <>
              <RiSaveLine className="w-4 h-4" />
              Salvar Tudo
            </>
          )}
        </button>
      </div>

      {/* Motivos de Arquivamento */}
      <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Motivos de Arquivamento</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Opções que aparecem no select de motivo ao arquivar</p>
        </div>
        <div className="p-4 space-y-2">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <input
                type="text"
                value={reason}
                onChange={(e) => {
                  const updated = [...reasons];
                  updated[idx] = e.target.value;
                  setReasons(updated);
                }}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <button
                onClick={() => removeReason(idx)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addReason()}
              placeholder="Novo motivo..."
              className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <button
              onClick={addReason}
              className="p-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Categorias do Limbo */}
      <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-red-50 dark:bg-red-500/10">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Categorias do Limbo</h2>
          <p className="text-xs text-red-500/70 mt-0.5">Categorias disponíveis quando destino é Limbo</p>
        </div>
        <div className="p-4 space-y-2">
          {limboCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 group">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.color} min-w-[80px] text-center`}>
                {cat.label}
              </span>
              <input
                type="text"
                value={cat.label}
                onChange={(e) => {
                  setLimboCategories(prev => prev.map(c => c.id === cat.id ? { ...c, label: e.target.value } : c));
                }}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <select
                value={cat.color}
                onChange={(e) => {
                  setLimboCategories(prev => prev.map(c => c.id === cat.id ? { ...c, color: e.target.value } : c));
                }}
                className="px-2 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white"
              >
                {colorOptions.map(co => (
                  <option key={co.color} value={co.color}>{co.label}</option>
                ))}
              </select>
              <button
                onClick={() => removeLimboCategory(cat.id)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newLimboCat.label}
              onChange={(e) => setNewLimboCat(prev => ({ ...prev, label: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addLimboCategory()}
              placeholder="Nova categoria..."
              className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <select
              value={newLimboCat.color}
              onChange={(e) => setNewLimboCat(prev => ({ ...prev, color: e.target.value }))}
              className="px-2 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white"
            >
              {colorOptions.map(co => (
                <option key={co.color} value={co.color}>{co.label}</option>
              ))}
            </select>
            <button
              onClick={addLimboCategory}
              className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Categorias do Acervo */}
      <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-blue-50 dark:bg-blue-500/10">
          <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-400">Categorias do Acervo</h2>
          <p className="text-xs text-blue-500/70 mt-0.5">Categorias disponíveis quando destino é Acervo</p>
        </div>
        <div className="p-4 space-y-2">
          {acervoCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 group">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.color} min-w-[80px] text-center`}>
                {cat.label}
              </span>
              <input
                type="text"
                value={cat.label}
                onChange={(e) => {
                  setAcervoCategories(prev => prev.map(c => c.id === cat.id ? { ...c, label: e.target.value } : c));
                }}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <select
                value={cat.color}
                onChange={(e) => {
                  setAcervoCategories(prev => prev.map(c => c.id === cat.id ? { ...c, color: e.target.value } : c));
                }}
                className="px-2 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white"
              >
                {colorOptions.map(co => (
                  <option key={co.color} value={co.color}>{co.label}</option>
                ))}
              </select>
              <button
                onClick={() => removeAcervoCategory(cat.id)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newAcervoCat.label}
              onChange={(e) => setNewAcervoCat(prev => ({ ...prev, label: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addAcervoCategory()}
              placeholder="Nova categoria..."
              className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <select
              value={newAcervoCat.color}
              onChange={(e) => setNewAcervoCat(prev => ({ ...prev, color: e.target.value }))}
              className="px-2 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white"
            >
              {colorOptions.map(co => (
                <option key={co.color} value={co.color}>{co.label}</option>
              ))}
            </select>
            <button
              onClick={addAcervoCategory}
              className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
