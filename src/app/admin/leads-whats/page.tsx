"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RiWhatsappFill,
  RiLoader4Line,
  RiRefreshLine,
  RiSearchLine,
  RiMailLine,
  RiPhoneLine,
  RiHome4Line,
} from "react-icons/ri";

interface LeadWhats {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
  property?: { code?: string | null; title?: string | null } | null;
  corretor?: { name?: string | null } | null;
}

// Leads gerados pelos botões de WhatsApp do site. O modal captura nome,
// telefone e e-mail antes de abrir a conversa, então mesmo quem desiste no
// meio do caminho fica registrado aqui.
export default function LeadsWhatsPage() {
  const [leads, setLeads] = useState<LeadWhats[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads?tags=BOTAO_WHATSAPP&limit=500");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error("Erro ao carregar leads do WhatsApp:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = leads.filter((l) => {
    if (!busca) return true;
    const t = busca.toLowerCase();
    return (
      l.name?.toLowerCase().includes(t) ||
      l.phone?.toLowerCase().includes(t) ||
      l.email?.toLowerCase().includes(t)
    );
  });

  const origem = (msg?: string | null) => {
    if (!msg) return "—";
    const linha = msg.split("\n")[0] || "";
    return linha.replace("💬 Clique no botão de WhatsApp — ", "") || "—";
  };

  const data = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 text-green-600 flex items-center justify-center">
              <RiWhatsappFill className="w-5 h-5" />
            </span>
            Leads Whats
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Contatos capturados pelos botões de WhatsApp do site
          </p>
        </div>
        <button
          onClick={carregar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <RiRefreshLine className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", valor: leads.length },
          {
            label: "Hoje",
            valor: leads.filter(
              (l) =>
                new Date(l.createdAt).toDateString() === new Date().toDateString()
            ).length,
          },
          {
            label: "Com imóvel",
            valor: leads.filter((l) => l.property).length,
          },
          {
            label: "Com e-mail",
            valor: leads.filter((l) => l.email).length,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {k.valor}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, telefone ou e-mail..."
          className="w-full h-11 pl-9 pr-3 text-base sm:text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white outline-none focus:border-green-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <RiWhatsappFill className="w-14 h-14 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" />
          <p className="font-medium text-neutral-900 dark:text-white">
            Nenhum lead ainda
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            Aparecem aqui os contatos deixados nos botões de WhatsApp do site
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((l) => (
            <div
              key={l.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white truncate">
                  {l.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-neutral-500">
                  {l.phone && (
                    <a
                      href={`https://wa.me/${l.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-green-600"
                    >
                      <RiPhoneLine className="w-3.5 h-3.5" />
                      {l.phone}
                    </a>
                  )}
                  {l.email && (
                    <span className="flex items-center gap-1 truncate">
                      <RiMailLine className="w-3.5 h-3.5" />
                      {l.email}
                    </span>
                  )}
                  {l.property?.code && (
                    <span className="flex items-center gap-1">
                      <RiHome4Line className="w-3.5 h-3.5" />
                      {l.property.code}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {origem(l.message)}
                </span>
                <span className="text-neutral-400 whitespace-nowrap">
                  {data(l.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
