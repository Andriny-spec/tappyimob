"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowLeftLine,
  RiEyeLine,
  RiFootprintLine,
  RiFileList3Line,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiMapPinLine,
  RiBuilding2Line,
  RiUserStarLine,
  RiLoader4Line,
  RiEditLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";

type ApprovalStatus = "PENDENTE" | "APROVADO" | "REJEITADO";

interface PartnerInfo {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface PartnerProperty {
  id: string;
  code: string;
  title: string;
  type: string;
  address: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  price: number;
  rentPrice: number | null;
  area: number | null;
  bedrooms: number | null;
  thumbnail: string | null;
  views: number;
  inPersonVisits: number;
  proposalsCount: number;
  partnerApprovalStatus: ApprovalStatus | null;
  partnerSubmittedAt: string | null;
  showOnWebsite: boolean;
  condominiumName: string | null;
  partner: PartnerInfo | null;
}

interface Stats {
  totalViews: number;
  totalVisits: number;
  totalProposals: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDENTE: { label: "Aguardando", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", icon: RiTimeLine },
  APROVADO: { label: "Aprovado", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", icon: RiCheckLine },
  REJEITADO: { label: "Reprovado", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: RiCloseLine },
};

const fmtBRL = (v: number | null | undefined) =>
  typeof v === "number" && v > 0
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : "—";

function CadastrosImoveisContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "PENDENTE";

  const [filter, setFilter] = useState<string>(initialStatus);
  const [properties, setProperties] = useState<PartnerProperty[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<PartnerProperty | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "todos" ? `?status=${filter}` : "";
      const res = await fetch(`/api/admin/parcerias/imoveis${params}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
        setStats(data.stats || null);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (p: PartnerProperty, action: "approve" | "reject") => {
    if (action === "reject" && !confirm(`Reprovar o imóvel ${p.code}? Ele ficará oculto com a tarja "Reprovado".`)) return;
    setActing(p.id);
    try {
      const res = await fetch(`/api/admin/parcerias/imoveis/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await load();
      } else {
        alert("Erro ao atualizar o cadastro.");
      }
    } finally {
      setActing(null);
    }
  };

  const filters = [
    { value: "PENDENTE", label: "Aguardando", count: stats?.pendentes },
    { value: "APROVADO", label: "Aprovados", count: stats?.aprovados },
    { value: "REJEITADO", label: "Reprovados", count: stats?.rejeitados },
    { value: "todos", label: "Todos" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/parcerias"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Cadastros de Imóveis</h1>
          <p className="text-sm text-neutral-500">Aprove ou recuse os imóveis enviados pelos parceiros externos</p>
        </div>
      </div>

      {/* Painel de contadores gerais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={RiBuilding2Line} label="Imóveis cadastrados" value={(stats ? stats.pendentes + stats.aprovados + stats.rejeitados : 0).toLocaleString("pt-BR")} color="text-sky-600 dark:text-sky-400" />
        <StatCard icon={RiEyeLine} label="Total de visitas (views)" value={(stats?.totalViews ?? 0).toLocaleString("pt-BR")} color="text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={RiFootprintLine} label="Visitas presenciais" value={(stats?.totalVisits ?? 0).toLocaleString("pt-BR")} color="text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={RiFileList3Line} label="Total de propostas" value={(stats?.totalProposals ?? 0).toLocaleString("pt-BR")} color="text-amber-600 dark:text-amber-400" />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-[#0B2545] text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {f.label}
            {typeof f.count === "number" && (
              <span className={`ml-1.5 ${filter === f.value ? "text-white/80" : "text-neutral-400"}`}>({f.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 h-40 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <RiBuilding2Line className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
          <p className="text-neutral-500 font-medium">Nenhum imóvel nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {properties.map((p) => {
            const cfg = p.partnerApprovalStatus ? statusConfig[p.partnerApprovalStatus] : null;
            const StatusIcon = cfg?.icon;
            const endereco = [[p.address, p.number].filter(Boolean).join(", "), p.neighborhood, p.city].filter(Boolean).join(" — ");
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
              >
                <div className="flex">
                  <div className="w-32 h-auto min-h-[8rem] bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 relative">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <RiBuilding2Line className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-neutral-400">{p.code}</p>
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                          {p.condominiumName || p.title}
                        </p>
                      </div>
                      {cfg && StatusIcon && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      )}
                    </div>
                    {endereco && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                        <RiMapPinLine className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{endereco}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm font-semibold text-[#0B2545] dark:text-sky-400 mt-1.5">
                      <RiMoneyDollarCircleLine className="w-4 h-4" />
                      {fmtBRL(p.price)}
                      {p.rentPrice ? <span className="text-xs text-neutral-500 font-normal ml-1">· {fmtBRL(p.rentPrice)}/mês</span> : null}
                    </div>
                    {p.partner && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                        <RiUserStarLine className="w-3.5 h-3.5 text-amber-500" />
                        <span className="truncate">{p.partner.name || p.partner.email}</span>
                      </div>
                    )}
                    {/* contadores individuais */}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1"><RiEyeLine className="w-3.5 h-3.5" />{p.views}</span>
                      <span className="flex items-center gap-1"><RiFootprintLine className="w-3.5 h-3.5" />{p.inPersonVisits}</span>
                      <span className="flex items-center gap-1"><RiFileList3Line className="w-3.5 h-3.5" />{p.proposalsCount}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => setEditTarget(p)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <RiEditLine className="w-3.5 h-3.5" /> Revisar / editar
                  </button>
                  <div className="flex-1" />
                  {p.partnerApprovalStatus !== "REJEITADO" && (
                    <button
                      onClick={() => act(p, "reject")}
                      disabled={acting === p.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <RiCloseLine className="w-3.5 h-3.5" /> Recusar
                    </button>
                  )}
                  {p.partnerApprovalStatus !== "APROVADO" && (
                    <button
                      onClick={() => act(p, "approve")}
                      disabled={acting === p.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {acting === p.id ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiCheckLine className="w-3.5 h-3.5" />} Aprovar
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {editTarget && (
          <RevisarModal
            propertyId={editTarget.id}
            onClose={() => setEditTarget(null)}
            onSaved={() => {
              setEditTarget(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Icon className={`w-4 h-4 ${color}`} />
        {label}
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

/* ---------- Modal de revisão / edição completa (admin) ---------- */
function RevisarModal({ propertyId, onClose, onSaved }: { propertyId: string; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [owner, setOwner] = useState<any>({});

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/parcerias/imoveis/${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setForm(data.property);
        setOwner(data.property?.propertyOwner || {});
      }
      setLoading(false);
    })();
  }, [propertyId]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setOwn = (k: string, v: any) => setOwner((o: any) => ({ ...o, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/parcerias/imoveis/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          data: {
            title: form.title,
            description: form.description,
            price: form.price,
            rentPrice: form.rentPrice,
            area: form.area,
            bedrooms: form.bedrooms,
            suites: form.suites,
            bathrooms: form.bathrooms,
            parkingSpaces: form.parkingSpaces,
            address: form.address,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode,
            owner: {
              name: owner.name,
              cpf: owner.cpf,
              rg: owner.rg,
              maritalStatus: owner.maritalStatus,
              phones: owner.phones,
              emails: owner.emails,
              residentialAddress: owner.residentialAddress,
              residentialNumber: owner.residentialNumber,
              residentialNeighborhood: owner.residentialNeighborhood,
              residentialCity: owner.residentialCity,
              residentialState: owner.residentialState,
              residentialZipCode: owner.residentialZipCode,
            },
          },
        }),
      });
      if (res.ok) onSaved();
      else alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Revisar cadastro</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {loading || !form ? (
          <div className="p-12 flex justify-center">
            <RiLoader4Line className="w-7 h-7 text-[#0B2545] animate-spin" />
          </div>
        ) : (
          <div className="p-5 space-y-6">
            <Section title="Imóvel">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Título" value={form.title} onChange={(v) => set("title", v)} className="sm:col-span-2" />
                <Field label="Valor de venda (R$)" value={form.price} onChange={(v) => set("price", v)} />
                <Field label="Valor de locação (R$)" value={form.rentPrice ?? ""} onChange={(v) => set("rentPrice", v)} />
                <Field label="Área (m²)" value={form.area ?? ""} onChange={(v) => set("area", v)} />
                <Field label="Quartos" value={form.bedrooms ?? ""} onChange={(v) => set("bedrooms", v)} />
                <Field label="Suítes" value={form.suites ?? ""} onChange={(v) => set("suites", v)} />
                <Field label="Banheiros" value={form.bathrooms ?? ""} onChange={(v) => set("bathrooms", v)} />
                <Field label="Vagas" value={form.parkingSpaces ?? ""} onChange={(v) => set("parkingSpaces", v)} />
              </div>
            </Section>

            <Section title="Endereço">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Logradouro" value={form.address ?? ""} onChange={(v) => set("address", v)} className="sm:col-span-2" />
                <Field label="Número" value={form.number ?? ""} onChange={(v) => set("number", v)} />
                <Field label="Complemento" value={form.complement ?? ""} onChange={(v) => set("complement", v)} />
                <Field label="Bairro" value={form.neighborhood ?? ""} onChange={(v) => set("neighborhood", v)} />
                <Field label="Cidade" value={form.city ?? ""} onChange={(v) => set("city", v)} />
                <Field label="Estado" value={form.state ?? ""} onChange={(v) => set("state", v)} />
                <Field label="CEP" value={form.zipCode ?? ""} onChange={(v) => set("zipCode", v)} />
              </div>
            </Section>

            <Section title="Proprietário">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nome" value={owner.name ?? ""} onChange={(v) => setOwn("name", v)} className="sm:col-span-2" />
                <Field label="CPF" value={owner.cpf ?? ""} onChange={(v) => setOwn("cpf", v)} />
                <Field label="RG" value={owner.rg ?? ""} onChange={(v) => setOwn("rg", v)} />
                <Field label="Estado civil" value={owner.maritalStatus ?? ""} onChange={(v) => setOwn("maritalStatus", v)} />
                <Field label="Telefone" value={(owner.phones?.[0]) ?? ""} onChange={(v) => setOwn("phones", [v])} />
                <Field label="E-mail" value={(owner.emails?.[0]) ?? ""} onChange={(v) => setOwn("emails", [v])} />
              </div>
            </Section>
          </div>
        )}

        <div className="flex justify-end gap-3 p-5 border-t border-neutral-100 dark:border-neutral-800 sticky bottom-0 bg-white dark:bg-neutral-900">
          <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm">
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving || loading}
            className="px-4 py-2 rounded-lg bg-[#0B2545] text-white hover:bg-[#2a4f80] disabled:opacity-50 text-sm font-medium flex items-center gap-2"
          >
            {saving && <RiLoader4Line className="w-4 h-4 animate-spin" />}
            Salvar alterações
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: { label: string; value: any; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-neutral-500">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
      />
    </label>
  );
}

export default function CadastrosImoveisPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><RiLoader4Line className="w-7 h-7 animate-spin text-[#0B2545]" /></div>}>
      <CadastrosImoveisContent />
    </Suspense>
  );
}
