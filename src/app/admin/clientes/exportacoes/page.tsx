"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  RiDownload2Line,
  RiFileExcel2Line,
  RiFileTextLine,
  RiKanbanView,
  RiArchiveLine,
  RiGhostLine,
  RiRefreshLine,
  RiUserSearchLine,
  RiCloseLine,
  RiCheckLine,
} from "react-icons/ri";

type AreaKey = "kanban" | "acervo" | "limbo";

interface AreaInfo {
  key: AreaKey;
  nome: string;
  descricao: string;
  icone: React.ElementType;
  cor: string;
}

const AREAS: AreaInfo[] = [
  {
    key: "kanban",
    nome: "Kanban",
    descricao: "Clientes ativos, nas colunas do funil",
    icone: RiKanbanView,
    cor: "blue",
  },
  {
    key: "acervo",
    nome: "Acervo",
    descricao: "Arquivados para relacionamento futuro",
    icone: RiArchiveLine,
    cor: "green",
  },
  {
    key: "limbo",
    nome: "Limbo",
    descricao: "Perdidos, sem perfil e sem interação",
    icone: RiGhostLine,
    cor: "orange",
  },
];

const CORES: Record<string, { ativo: string; icone: string; texto: string }> = {
  blue: {
    ativo: "border-blue-500 bg-blue-50 dark:bg-blue-500/10",
    icone: "text-blue-600 dark:text-blue-400",
    texto: "text-blue-700 dark:text-blue-300",
  },
  green: {
    ativo: "border-green-500 bg-green-50 dark:bg-green-500/10",
    icone: "text-green-600 dark:text-green-400",
    texto: "text-green-700 dark:text-green-300",
  },
  orange: {
    ativo: "border-orange-500 bg-orange-50 dark:bg-orange-500/10",
    icone: "text-orange-600 dark:text-orange-400",
    texto: "text-orange-700 dark:text-orange-300",
  },
};

const COLUNAS_EXPORTADAS = [
  "Nome do Cliente",
  "Telefone",
  "E-mail",
  "Mídia / Origem",
  "Corretor Vinculado",
  "Ticket (R$)",
  "Visitas (S/N)",
  "Propostas (S/N)",
  "Data de Entrada",
  "Última Atualização",
  "Área",
  "Posição",
  "Finalidade",
  "Origem da Campanha",
  "Nome da Campanha",
];

interface Corretor {
  id: string;
  name: string;
  avatar: string | null;
}

export default function ExportacoesPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Acervo e Limbo são telas de admin; a planilha junta as duas.
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/admin/clientes/leads");
    }
  }, [user, router]);

  const [areasSelecionadas, setAreasSelecionadas] = useState<AreaKey[]>(["kanban", "acervo", "limbo"]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [corretorSelecionado, setCorretorSelecionado] = useState<Corretor | null>(null);

  const [contagem, setContagem] = useState<Record<AreaKey, number> | null>(null);
  const [carregandoContagem, setCarregandoContagem] = useState(true);
  const [exportando, setExportando] = useState<"csv" | "xlsx" | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Busca de corretor
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [buscaCorretor, setBuscaCorretor] = useState("");
  const [mostrarListaCorretores, setMostrarListaCorretores] = useState(false);

  const paramsFiltro = useCallback(() => {
    const params = new URLSearchParams();
    if (corretorSelecionado) params.set("corretorId", corretorSelecionado.id);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params;
  }, [corretorSelecionado, dateFrom, dateTo]);

  // Contagem por área — recalcula quando os filtros mudam, para o usuário saber
  // o tamanho da planilha antes de baixar.
  const buscarContagem = useCallback(async () => {
    setCarregandoContagem(true);
    try {
      const params = paramsFiltro();
      params.set("contagem", "1");
      const res = await fetch(`/api/admin/leads/export?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContagem(data.contagem);
      }
    } catch (e) {
      console.error("Erro ao contar clientes:", e);
    } finally {
      setCarregandoContagem(false);
    }
  }, [paramsFiltro]);

  useEffect(() => {
    buscarContagem();
  }, [buscarContagem]);

  useEffect(() => {
    const buscar = async () => {
      try {
        const res = await fetch(`/api/admin/corretores?search=${encodeURIComponent(buscaCorretor)}`);
        if (res.ok) {
          const data = await res.json();
          setCorretores(Array.isArray(data) ? data.slice(0, 8) : []);
        }
      } catch {
        setCorretores([]);
      }
    };
    if (mostrarListaCorretores) buscar();
  }, [buscaCorretor, mostrarListaCorretores]);

  const alternarArea = (key: AreaKey) => {
    setAreasSelecionadas((atual) =>
      atual.includes(key) ? atual.filter((a) => a !== key) : [...atual, key]
    );
  };

  const totalSelecionado = contagem
    ? areasSelecionadas.reduce((soma, a) => soma + (contagem[a] || 0), 0)
    : 0;

  const buscarDados = async () => {
    const params = paramsFiltro();
    areasSelecionadas.forEach((a) => params.append("area", a));
    const res = await fetch(`/api/admin/leads/export?${params.toString()}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Falha ao gerar a exportação");
    }
    return res.json() as Promise<{ headers: string[]; rows: string[][]; total: number }>;
  };

  const nomeArquivo = () => {
    const partes = areasSelecionadas.length === 3 ? "todos" : areasSelecionadas.join("-");
    return `clientes-${partes}-${new Date().toISOString().slice(0, 10)}`;
  };

  const exportarCSV = async () => {
    if (exportando || areasSelecionadas.length === 0) return;
    setExportando("csv");
    setErro(null);
    try {
      const { headers, rows } = await buscarDados();
      const csv = [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
      // BOM na frente para o Excel abrir os acentos corretamente.
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nomeArquivo()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErro(e?.message || "Erro ao exportar");
    } finally {
      setExportando(null);
    }
  };

  const exportarXLSX = async () => {
    if (exportando || areasSelecionadas.length === 0) return;
    setExportando("xlsx");
    setErro(null);
    try {
      const XLSX = await import("xlsx");
      const { headers, rows } = await buscarDados();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      // Largura das colunas para a planilha abrir legível, sem arrastar borda.
      ws["!cols"] = headers.map((h, i) => ({
        wch: Math.min(38, Math.max(h.length + 2, ...rows.slice(0, 200).map((r) => String(r[i] ?? "").length + 2))),
      }));
      ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: rows.length } }) };
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");
      XLSX.writeFile(wb, `${nomeArquivo()}.xlsx`);
    } catch (e: any) {
      setErro(e?.message || "Erro ao exportar");
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <RiDownload2Line className="w-7 h-7 text-blue-600" />
            Exportação de Clientes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Baixe a base completa — Kanban, Acervo e Limbo — em uma planilha só
          </p>
        </div>
        <button
          onClick={buscarContagem}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          title="Atualizar contagem"
        >
          <RiRefreshLine className={`w-4 h-4 ${carregandoContagem ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Seleção de origem */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">O que incluir</h3>
        <p className="text-sm text-neutral-500 mb-4">
          Cada cliente aparece uma vez só, com a coluna <strong>Posição</strong> dizendo em qual
          área e etapa ele está.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AREAS.map((area) => {
            const ativo = areasSelecionadas.includes(area.key);
            const cor = CORES[area.cor];
            const Icone = area.icone;
            return (
              <button
                key={area.key}
                onClick={() => alternarArea(area.key)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  ativo
                    ? cor.ativo
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <Icone className={`w-6 h-6 ${ativo ? cor.icone : "text-neutral-400"}`} />
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${
                      ativo
                        ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white"
                        : "border-neutral-300 dark:border-neutral-700"
                    }`}
                  >
                    {ativo && <RiCheckLine className="w-3.5 h-3.5 text-white dark:text-neutral-900" />}
                  </div>
                </div>
                <p className={`mt-3 font-semibold ${ativo ? cor.texto : "text-neutral-900 dark:text-white"}`}>
                  {area.nome}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{area.descricao}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2 tabular-nums">
                  {carregandoContagem || !contagem ? "—" : contagem[area.key].toLocaleString("pt-BR")}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros opcionais */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Filtros (opcionais)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Entrada a partir de</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Entrada até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Corretor</label>
            {corretorSelecionado ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                <span className="text-sm text-neutral-900 dark:text-white truncate">
                  {corretorSelecionado.name}
                </span>
                <button
                  onClick={() => {
                    setCorretorSelecionado(null);
                    setBuscaCorretor("");
                  }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <RiUserSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={buscaCorretor}
                  onChange={(e) => setBuscaCorretor(e.target.value)}
                  onFocus={() => setMostrarListaCorretores(true)}
                  onBlur={() => setTimeout(() => setMostrarListaCorretores(false), 150)}
                  placeholder="Todos os corretores"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                />
              </div>
            )}
            {mostrarListaCorretores && !corretorSelecionado && corretores.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg">
                {corretores.map((c) => (
                  <button
                    key={c.id}
                    onMouseDown={() => {
                      setCorretorSelecionado(c);
                      setMostrarListaCorretores(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Colunas + download */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Colunas da planilha</h3>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {COLUNAS_EXPORTADAS.map((c) => (
            <span
              key={c}
              className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300"
            >
              {c}
            </span>
          ))}
        </div>

        {erro && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-sm text-red-600 dark:text-red-400">
            {erro}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportarXLSX}
            disabled={!!exportando || areasSelecionadas.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {exportando === "xlsx" ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <RiFileExcel2Line className="w-4 h-4" />
            )}
            Baixar Excel (.xlsx)
          </button>
          <button
            onClick={exportarCSV}
            disabled={!!exportando || areasSelecionadas.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-700 dark:text-neutral-200 text-sm font-medium transition-colors"
          >
            {exportando === "csv" ? (
              <div className="w-4 h-4 border-2 border-neutral-400/40 border-t-neutral-500 rounded-full animate-spin" />
            ) : (
              <RiFileTextLine className="w-4 h-4" />
            )}
            Baixar CSV
          </button>

          <span className="text-sm text-neutral-500">
            {areasSelecionadas.length === 0
              ? "Escolha ao menos uma origem"
              : `${totalSelecionado.toLocaleString("pt-BR")} cliente(s) na planilha`}
          </span>
        </div>
      </div>
    </div>
  );
}
