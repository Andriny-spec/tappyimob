"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  RiAddLine,
  RiUploadCloud2Line,
  RiImageLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiCheckLine,
  RiCloseLine,
  RiVipDiamondFill,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiExternalLinkLine,
  RiMagicLine,
  RiDraggable,
} from "react-icons/ri";

interface Property {
  id: string;
  name: string;
  referenceCode: string | null;
  price: string;
  bonus: string;
  bonusIcon: string;
  specs: string | null;
  photoUrl: string | null;
  driveUrl: string | null;
  highlight: boolean;
  isActive: boolean;
  sortOrder: number;
}

const ICONS = [
  { value: "plane", label: "✈ Viagem" },
  { value: "smartphone", label: "📱 iPhone/Smartphone" },
  { value: "watch", label: "⌚ Apple Watch" },
  { value: "headphone", label: "🎧 AirPods" },
  { value: "restaurant", label: "🍽 Restaurante" },
  { value: "home", label: "🏠 Hospedagem/Pousada" },
  { value: "car", label: "🚗 Carro" },
  { value: "suitcase", label: "🧳 Acessórios/Viagem" },
  { value: "gift", label: "🎁 Outro" },
];

export default function ImoveisCampanhaPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campanha-summit/properties");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async (id: string | null, payload: Partial<Property>) => {
    const url = id
      ? `/api/admin/campanha-summit/properties/${id}`
      : `/api/admin/campanha-summit/properties`;
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao salvar");
      return false;
    }
    await fetchAll();
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este imóvel?")) return;
    const res = await fetch(`/api/admin/campanha-summit/properties/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Erro ao excluir");
      return;
    }
    await fetchAll();
  };

  const [autoFilling, setAutoFilling] = useState(false);
  const autoFillPhotos = async (onlyMissing = true) => {
    const msg = onlyMissing
      ? "Preencher fotos automaticamente dos imóveis que ainda NÃO têm foto, buscando pelos códigos de referência no acervo Tappy?"
      : "Sobrescrever TODAS as fotos usando as imagens do acervo Tappy (inclusive as que já têm upload manual)?";
    if (!confirm(msg)) return;
    setAutoFilling(true);
    try {
      const res = await fetch("/api/admin/campanha-summit/properties/auto-fill-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onlyMissing }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao preencher fotos");
        return;
      }
      const missing = data.notFound?.length > 0 ? `\nNão encontrados no acervo: ${data.notFound.join(", ")}` : "";
      alert(`✅ ${data.updated} foto(s) preenchida(s)${data.skipped > 0 ? ` · ${data.skipped} sem foto no acervo` : ""}${missing}`);
      await fetchAll();
    } finally {
      setAutoFilling(false);
    }
  };

  const persistOrder = async (list: Property[]) => {
    const ids = list.map((p) => p.id);
    await fetch("/api/admin/campanha-summit/properties/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
  };

  const move = async (id: string, direction: "up" | "down") => {
    const idx = properties.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= properties.length) return;
    const newList = [...properties];
    [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
    setProperties(newList);
    await persistOrder(newList);
  };

  // Drag and Drop
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragOverId) setDragOverId(id);
  };
  const onDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };
  const onDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) {
      onDragEnd();
      return;
    }
    const fromIdx = properties.findIndex((p) => p.id === dragId);
    const toIdx = properties.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      onDragEnd();
      return;
    }
    const newList = [...properties];
    const [moved] = newList.splice(fromIdx, 1);
    newList.splice(toIdx, 0, moved);
    setProperties(newList);
    onDragEnd();
    await persistOrder(newList);
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Imóveis da Campanha Summit
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie os imóveis bonificados que aparecem na landing page{" "}
            <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              /campanha-summit
            </code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => autoFillPhotos(true)}
            disabled={autoFilling}
            title="Puxa as fotos do acervo Tappy usando o código de referência (ex: CNCL1957). Só preenche os que estão sem foto."
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1EBE5A]/40 bg-[#1EBE5A]/10 hover:bg-[#1EBE5A]/20 text-[#1EBE5A] font-semibold text-sm disabled:opacity-50"
          >
            {autoFilling ? (
              <RiLoader4Line className="w-4 h-4 animate-spin" />
            ) : (
              <RiMagicLine className="w-4 h-4" />
            )}
            Puxar fotos do acervo
          </button>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1EBE5A] to-[#E8B96A] text-[#040A1A] font-bold text-sm hover:shadow-lg hover:shadow-[#1EBE5A]/30 transition-all"
          >
            <RiAddLine className="w-4 h-4" />
            Novo imóvel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <RiLoader4Line className="w-5 h-5 animate-spin mr-2" /> Carregando...
        </div>
      ) : (
        <>
          {creating && (
            <PropertyForm
              key="new"
              onCancel={() => setCreating(false)}
              onSave={async (payload) => {
                const ok = await handleSave(null, payload);
                if (ok) setCreating(false);
              }}
            />
          )}

          <p className="text-[11px] text-neutral-500 mb-3 flex items-center gap-1.5">
            <RiDraggable className="w-3.5 h-3.5" />
            Arraste pelo cabeçalho do card para reordenar, ou use as setinhas.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {properties.map((p, i) =>
              editingId === p.id ? (
                <PropertyForm
                  key={p.id}
                  initial={p}
                  onCancel={() => setEditingId(null)}
                  onSave={async (payload) => {
                    const ok = await handleSave(p.id, payload);
                    if (ok) setEditingId(null);
                  }}
                />
              ) : (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => onDragStart(p.id)}
                  onDragOver={(e) => onDragOver(e, p.id)}
                  onDragLeave={() => setDragOverId(null)}
                  onDragEnd={onDragEnd}
                  onDrop={() => onDrop(p.id)}
                  className={`group relative rounded-xl border bg-white dark:bg-neutral-900 overflow-hidden transition-all cursor-grab active:cursor-grabbing ${
                    p.highlight
                      ? "border-[#1EBE5A]/60 shadow-sm shadow-[#1EBE5A]/10"
                      : "border-neutral-200 dark:border-neutral-800"
                  } ${!p.isActive ? "opacity-60" : ""} ${
                    dragId === p.id ? "opacity-40 scale-95" : ""
                  } ${
                    dragOverId === p.id && dragId !== p.id
                      ? "ring-2 ring-[#1EBE5A] ring-offset-1 dark:ring-offset-neutral-950"
                      : ""
                  }`}
                >
                  {/* Drag handle no topo */}
                  <div className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-black/40 backdrop-blur text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <RiDraggable className="w-3.5 h-3.5" />
                  </div>

                  <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800">
                    {p.photoUrl ? (
                      <Image
                        src={p.photoUrl}
                        alt={p.name}
                        fill
                        sizes="200px"
                        className="object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 text-[10px] gap-1">
                        <RiImageLine className="w-6 h-6" />
                        Sem foto
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                      {p.highlight && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#1EBE5A] text-[#040A1A] text-[8px] font-bold uppercase tracking-wider">
                          <RiVipDiamondFill className="w-2 h-2" />
                        </span>
                      )}
                      {!p.isActive && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-neutral-700 text-white text-[8px] font-bold">
                          <RiEyeOffLine className="w-2 h-2" />
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-white text-[9px] font-mono">
                      #{i + 1}
                    </div>
                  </div>

                  <div className="p-2.5">
                    <h3 className="font-bold text-neutral-900 dark:text-white text-xs leading-tight truncate">
                      {p.name}
                    </h3>
                    {p.referenceCode && (
                      <p className="text-[9px] font-mono text-neutral-400 mt-0.5 truncate">{p.referenceCode}</p>
                    )}
                    <p className="text-[#1EBE5A] font-bold text-xs mt-1 truncate">{p.price}</p>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-snug line-clamp-2">
                      {p.bonus}
                    </p>

                    <div className="flex items-center justify-between gap-0.5 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            move(p.id, "up");
                          }}
                          disabled={i === 0}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
                          title="Subir"
                        >
                          <RiArrowUpLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            move(p.id, "down");
                          }}
                          disabled={i === properties.length - 1}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
                          title="Descer"
                        >
                          <RiArrowDownLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(p.id, { isActive: !p.isActive });
                          }}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                          title={p.isActive ? "Ocultar" : "Mostrar"}
                        >
                          {p.isActive ? (
                            <RiEyeLine className="w-3.5 h-3.5" />
                          ) : (
                            <RiEyeOffLine className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(p.id);
                          }}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-blue-500"
                          title="Editar"
                        >
                          <RiEdit2Line className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id);
                          }}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                          title="Excluir"
                        >
                          <RiDeleteBinLine className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

// =====================================================================
// FORM
// =====================================================================
function PropertyForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Property;
  onSave: (payload: Partial<Property>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    referenceCode: initial?.referenceCode || "",
    price: initial?.price || "",
    bonus: initial?.bonus || "",
    bonusIcon: initial?.bonusIcon || "plane",
    specs: initial?.specs || "",
    photoUrl: initial?.photoUrl || "",
    driveUrl: initial?.driveUrl || "",
    highlight: initial?.highlight || false,
    isActive: initial?.isActive ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/campanha-summit/properties/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro no upload");
        return;
      }
      setForm((f) => ({ ...f, photoUrl: data.url }));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.bonus.trim()) {
      alert("Nome, preço e bônus são obrigatórios");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1EBE5A]/40";

  return (
    <div className="rounded-2xl border-2 border-[#1EBE5A]/40 bg-white dark:bg-neutral-900 p-5 col-span-full mb-4">
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        {/* Foto */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Foto do imóvel
          </label>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            {form.photoUrl ? (
              <Image src={form.photoUrl} alt="preview" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 text-xs gap-2">
                <RiImageLine className="w-8 h-8" />
                Sem foto
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs">
                <RiLoader4Line className="w-5 h-5 animate-spin mr-2" /> Enviando...
              </div>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#1EBE5A]/10 hover:bg-[#1EBE5A]/20 text-[#1EBE5A] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RiUploadCloud2Line className="w-4 h-4" />
              {form.photoUrl ? "Trocar foto" : "Enviar foto"}
            </button>
            {form.photoUrl && (
              <button
                onClick={() => setForm((f) => ({ ...f, photoUrl: "" }))}
                className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-red-500 text-xs font-semibold"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Campos */}
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Nome do condomínio *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Tamboré 11"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Referência
              </label>
              <input
                value={form.referenceCode}
                onChange={(e) => setForm({ ...form, referenceCode: e.target.value })}
                placeholder="CNCL1957"
                className={inputCls + " font-mono"}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Valor *
            </label>
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Ex: R$ 8.600.000"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Specs (opcional)
            </label>
            <input
              value={form.specs}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
              placeholder="Ex: 980m² · 6 carros · piscina · 4 quartos"
              className={inputCls}
            />
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Bônus do corretor *
              </label>
              <input
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                placeholder="Ex: Viagem para Paris · 7 dias com acompanhante"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Ícone
              </label>
              <select
                value={form.bonusIcon}
                onChange={(e) => setForm({ ...form, bonusIcon: e.target.value })}
                className={inputCls}
              >
                {ICONS.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Link do material (Drive — opcional)
            </label>
            <input
              value={form.driveUrl}
              onChange={(e) => setForm({ ...form, driveUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className={inputCls}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.highlight}
                onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
                className="w-4 h-4 accent-[#1EBE5A]"
              />
              <span className="text-neutral-700 dark:text-neutral-300">Destaque</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#1EBE5A]"
              />
              <span className="text-neutral-700 dark:text-neutral-300">Ativo (visível na LP)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <RiCloseLine className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1EBE5A] to-[#E8B96A] text-[#040A1A] text-sm font-bold disabled:opacity-50"
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
      </div>
    </div>
  );
}
