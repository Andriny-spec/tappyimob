"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  RiAddLine,
  RiUploadCloud2Line,
  RiUserLine,
  RiSaveLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiCloseLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiWhatsappFill,
} from "react-icons/ri";

interface Member {
  id: string;
  name: string;
  phone: string | null;
  whatsappUrl: string | null;
  photoUrl: string | null;
  role: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function EquipePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campanha-summit/team");
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSave = async (id: string | null, payload: Partial<Member>) => {
    const url = id
      ? `/api/admin/campanha-summit/team/${id}`
      : `/api/admin/campanha-summit/team`;
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
    if (!confirm("Excluir este membro?")) return;
    const res = await fetch(`/api/admin/campanha-summit/team/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Erro ao excluir");
      return;
    }
    await fetchAll();
  };

  const move = async (id: string, direction: "up" | "down") => {
    const idx = members.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= members.length) return;
    const a = members[idx];
    const b = members[swapIdx];
    await Promise.all([
      handleSave(a.id, { sortOrder: b.sortOrder }),
      handleSave(b.id, { sortOrder: a.sortOrder }),
    ]);
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Equipe da Campanha Summit
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie os membros da equipe que aparecem na landing page{" "}
            <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              /campanha-summit
            </code>
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1EBE5A] to-[#E8B96A] text-[#040A1A] font-bold text-sm hover:shadow-lg hover:shadow-[#1EBE5A]/30 transition-all"
        >
          <RiAddLine className="w-4 h-4" />
          Novo membro
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <RiLoader4Line className="w-5 h-5 animate-spin mr-2" /> Carregando...
        </div>
      ) : (
        <>
          {creating && (
            <MemberForm
              key="new"
              onCancel={() => setCreating(false)}
              onSave={async (payload) => {
                const ok = await handleSave(null, payload);
                if (ok) setCreating(false);
              }}
            />
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((m, i) =>
              editingId === m.id ? (
                <MemberForm
                  key={m.id}
                  initial={m}
                  onCancel={() => setEditingId(null)}
                  onSave={async (payload) => {
                    const ok = await handleSave(m.id, payload);
                    if (ok) setEditingId(null);
                  }}
                />
              ) : (
                <div
                  key={m.id}
                  className={`group relative rounded-2xl border bg-white dark:bg-neutral-900 overflow-hidden ${
                    m.isActive
                      ? "border-neutral-200 dark:border-neutral-800"
                      : "border-neutral-200 dark:border-neutral-800 opacity-60"
                  }`}
                >
                  <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800">
                    {m.photoUrl ? (
                      <Image src={m.photoUrl} alt={m.name} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-2">
                        <RiUserLine className="w-10 h-10" />
                        <span className="text-[10px] uppercase tracking-wider">Sem foto</span>
                      </div>
                    )}
                    {!m.isActive && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-700 text-white text-[10px] font-bold">
                        <RiEyeOffLine className="w-2.5 h-2.5" /> Oculto
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                      {m.name}
                    </h3>
                    {m.role && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">{m.role}</p>
                    )}
                    {m.phone && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono mt-1">
                        {m.phone}
                      </p>
                    )}
                    {m.whatsappUrl && (
                      <a
                        href={m.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-[10px] text-[#25D366] hover:underline"
                      >
                        <RiWhatsappFill className="w-3 h-3" /> Testar link
                      </a>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => move(m.id, "up")}
                          disabled={i === 0}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
                          title="Subir"
                        >
                          <RiArrowUpLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => move(m.id, "down")}
                          disabled={i === members.length - 1}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
                          title="Descer"
                        >
                          <RiArrowDownLine className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSave(m.id, { isActive: !m.isActive })}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                          title={m.isActive ? "Ocultar" : "Mostrar"}
                        >
                          {m.isActive ? (
                            <RiEyeLine className="w-4 h-4" />
                          ) : (
                            <RiEyeOffLine className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(m.id)}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-blue-500"
                          title="Editar"
                        >
                          <RiEdit2Line className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                          title="Excluir"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
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

function MemberForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Member;
  onSave: (payload: Partial<Member>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    phone: initial?.phone || "",
    whatsappUrl: initial?.whatsappUrl || "",
    photoUrl: initial?.photoUrl || "",
    role: initial?.role || "",
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
      const res = await fetch("/api/admin/campanha-summit/team/upload", {
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

  // Auto-gera o link WhatsApp a partir do telefone se URL estiver vazio
  const generateWhatsApp = () => {
    if (!form.phone) return;
    const digits = form.phone.replace(/\D/g, "");
    const phoneClean = digits.startsWith("55") ? digits : `55${digits}`;
    const firstName = form.name.split(" ")[0] || "";
    const text = encodeURIComponent(
      `Oi ${firstName}, vim pelo guia dos parceiros Tappy. Pode me ajudar?`
    );
    setForm((f) => ({ ...f, whatsappUrl: `https://wa.me/+${phoneClean}?text=${text}` }));
  };

  const submit = async () => {
    if (!form.name.trim()) {
      alert("Nome é obrigatório");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1EBE5A]/40";

  return (
    <div className="rounded-2xl border-2 border-[#1EBE5A]/40 bg-white dark:bg-neutral-900 p-5 sm:col-span-2 lg:col-span-3 xl:col-span-4 mb-4">
      <div className="grid lg:grid-cols-[200px_1fr] gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
            Foto
          </label>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            {form.photoUrl ? (
              <Image src={form.photoUrl} alt="preview" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <RiUserLine className="w-10 h-10" />
                <span className="text-[10px] uppercase tracking-wider">Sem foto</span>
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
              {form.photoUrl ? "Trocar" : "Enviar"}
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

        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Nome *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Tatiana"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Cargo (opcional)
              </label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Ex: Corretora Sênior"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Telefone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99655-7866"
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={generateWhatsApp}
              disabled={!form.phone || !form.name}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-semibold whitespace-nowrap disabled:opacity-50"
              title="Gera o link WhatsApp a partir do telefone e nome"
            >
              <RiWhatsappFill className="w-4 h-4" />
              Gerar link
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              Link WhatsApp
            </label>
            <input
              value={form.whatsappUrl}
              onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })}
              placeholder="https://wa.me/+5511...?text=..."
              className={inputCls + " font-mono text-xs"}
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-[#1EBE5A]"
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                Ativo (visível na LP)
              </span>
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
