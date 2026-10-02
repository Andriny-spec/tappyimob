"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiPrinterLine,
  RiEyeLine,
  RiHeartLine,
  RiShareLine,
  RiHome4Line,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiGlobalLine,
  RiCursorLine,
  RiBuilding4Line,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiExternalLinkLine,
} from "react-icons/ri";

interface OwnerReport {
  owner: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    cpf?: string;
  };
  properties: {
    id: string;
    code: string;
    title: string;
    address: string;
    number?: string;
    neighborhood: string;
    city: string;
    type: string;
    category: string;
    status: string;
    price?: number;
    rentalPrice?: number;
    thumbnail?: string;
    area?: number;
    bedrooms?: number;
    createdAt: string;
    metrics: {
      views: number;
      portalViews: number;
      clicks: number;
      favorites: number;
      shares: number;
      totalVisits: number;
      completedVisits: number;
      cancelledVisits: number;
    };
  }[];
  summary: {
    totalProperties: number;
    activeProperties: number;
    soldProperties: number;
    rentedProperties: number;
    totalViews: number;
    totalPortalViews: number;
    totalClicks: number;
    totalFavorites: number;
    totalShares: number;
    totalVisits: number;
    completedVisits: number;
    cancelledVisits: number;
  };
  generatedAt: string;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  DISPONIVEL: { label: "Disponível", color: "text-green-700", bg: "bg-green-100" },
  VENDIDO: { label: "Vendido", color: "text-blue-700", bg: "bg-blue-100" },
  LOCADO: { label: "Locado", color: "text-purple-700", bg: "bg-purple-100" },
  INATIVO: { label: "Inativo", color: "text-neutral-700", bg: "bg-neutral-100" },
  RESERVADO: { label: "Reservado", color: "text-amber-700", bg: "bg-amber-100" },
};

const typeLabels: Record<string, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  RURAL: "Rural",
  GALPAO: "Galpão",
  SALA: "Sala",
  LOJA: "Loja",
  FLAT: "Flat",
  KITNET: "Kitnet",
  COBERTURA: "Cobertura",
};

const categoryLabels: Record<string, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_LOCACAO: "Venda e Locação",
  TEMPORADA: "Temporada",
};

export default function RelatorioVendedorPage() {
  const params = useParams();
  const ownerId = params.ownerId as string;
  const [report, setReport] = useState<OwnerReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/admin/reports/owner/${ownerId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        } else {
          setError("Erro ao carregar relatório");
        }
      } catch {
        setError("Erro ao carregar relatório");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [ownerId]);

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (value?: number) => {
    if (!value) return "—";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error || "Relatório não encontrado"}</p>
        <Link href="/admin/imoveis" className="text-orange-500 hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  const { owner, properties, summary } = report;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - não imprime os botões */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/admin/imoveis"
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700"
        >
          <RiArrowLeftLine className="w-5 h-5" />
          Voltar
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          <RiPrinterLine className="w-5 h-5" />
          Exportar PDF
        </button>
      </div>

      {/* Conteúdo do Relatório */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden print:border-0 print:shadow-none">
        {/* Cabeçalho do Relatório */}
        <div className="p-8 border-b border-neutral-200 dark:border-neutral-800 print:border-neutral-300">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white print:text-black">
                Relatório do Proprietário
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-1 print:text-neutral-700">
                {owner.name}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500 print:text-neutral-600">
                {owner.phone && <span>Tel: {owner.phone}</span>}
                {owner.email && <span>Email: {owner.email}</span>}
              </div>
            </div>
            <div className="text-right text-sm text-neutral-500 print:text-neutral-600">
              <p className="font-semibold text-neutral-700 dark:text-neutral-300 print:text-black">Tappy Imob</p>
              <p>Gerado em: {new Date(report.generatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        {/* Resumo Geral */}
        <div className="p-8 border-b border-neutral-200 dark:border-neutral-800 print:border-neutral-300">
          <h2 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white print:text-black">Resumo Geral</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
            <StatCard icon={RiBuilding4Line} label="Imóveis" value={summary.totalProperties} color="text-orange-500" />
            <StatCard icon={RiCheckLine} label="Disponíveis" value={summary.activeProperties} color="text-green-500" />
            <StatCard icon={RiMoneyDollarCircleLine} label="Vendidos" value={summary.soldProperties} color="text-blue-500" />
            <StatCard icon={RiHome4Line} label="Locados" value={summary.rentedProperties} color="text-purple-500" />
          </div>
        </div>

        {/* Métricas de Exposição */}
        <div className="p-8 border-b border-neutral-200 dark:border-neutral-800 print:border-neutral-300">
          <h2 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white print:text-black">Exposição e Engajamento</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5">
            <StatCard icon={RiEyeLine} label="Visualizações Site" value={summary.totalViews} color="text-blue-500" />
            <StatCard icon={RiGlobalLine} label="Views Portais" value={summary.totalPortalViews} color="text-teal-500" />
            <StatCard icon={RiCursorLine} label="Cliques" value={summary.totalClicks} color="text-indigo-500" />
            <StatCard icon={RiHeartLine} label="Favoritos" value={summary.totalFavorites} color="text-red-500" />
            <StatCard icon={RiShareLine} label="Compartilhamentos" value={summary.totalShares} color="text-green-500" />
          </div>
        </div>

        {/* Visitas */}
        <div className="p-8 border-b border-neutral-200 dark:border-neutral-800 print:border-neutral-300">
          <h2 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white print:text-black">Visitas Agendadas</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={RiCalendarLine} label="Total de Visitas" value={summary.totalVisits} color="text-orange-500" />
            <StatCard icon={RiCheckLine} label="Realizadas" value={summary.completedVisits} color="text-green-500" />
            <StatCard icon={RiCloseLine} label="Canceladas" value={summary.cancelledVisits} color="text-red-500" />
          </div>
        </div>

        {/* Detalhes por Imóvel */}
        <div className="p-8">
          <h2 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white print:text-black">Detalhes por Imóvel</h2>
          <div className="space-y-4">
            {properties.map((property) => {
              const statusInfo = statusLabels[property.status] || statusLabels.DISPONIVEL;
              return (
                <div
                  key={property.id}
                  className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 print:border-neutral-300 print:break-inside-avoid"
                >
                  <div className="flex items-start gap-4">
                    {property.thumbnail && (
                      <img
                        src={property.thumbnail}
                        alt={property.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 print:w-16 print:h-16"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                          href={`/admin/imoveis/${property.id}`}
                          className="font-bold text-neutral-900 dark:text-white hover:text-orange-500 print:text-black print:no-underline"
                        >
                          #{property.code}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {typeLabels[property.type] || property.type} • {categoryLabels[property.category] || property.category}
                        </span>
                        <a
                          href={`/api/admin/properties/${property.id}/exclusivity/report`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Emitir relatório deste imóvel"
                          className="ml-auto print:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 text-[11px] font-medium transition-colors"
                        >
                          <RiExternalLinkLine className="w-3.5 h-3.5" />
                          Emitir relatório
                        </a>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1 print:text-neutral-700">
                        <RiMapPinLine className="w-3.5 h-3.5 flex-shrink-0" />
                        {property.address}{property.number ? `, ${property.number}` : ""} — {property.neighborhood}, {property.city}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                        {property.price && <span>Venda: {formatPrice(property.price)}</span>}
                        {property.rentalPrice && <span>Locação: {formatPrice(property.rentalPrice)}</span>}
                        {property.area && <span>{property.area}m²</span>}
                        {property.bedrooms && <span>{property.bedrooms} quartos</span>}
                      </div>
                    </div>
                  </div>

                  {/* Métricas do imóvel */}
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-3 print:grid-cols-8">
                    <MiniStat label="Views Site" value={property.metrics.views} />
                    <MiniStat label="Views Portais" value={property.metrics.portalViews} />
                    <MiniStat label="Cliques" value={property.metrics.clicks} />
                    <MiniStat label="Favoritos" value={property.metrics.favorites} />
                    <MiniStat label="Compartilhamentos" value={property.metrics.shares} />
                    <MiniStat label="Visitas" value={property.metrics.totalVisits} />
                    <MiniStat label="Realizadas" value={property.metrics.completedVisits} />
                    <MiniStat label="Canceladas" value={property.metrics.cancelledVisits} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé do Relatório */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-800 text-center text-xs text-neutral-500 print:bg-white print:border-t print:border-neutral-300">
          <p>Tappy Imob — Relatório gerado automaticamente em {new Date(report.generatedAt).toLocaleString("pt-BR")}</p>
          <p className="mt-1">Este relatório é confidencial e destinado exclusivamente ao proprietário.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl print:bg-white print:border print:border-neutral-200">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] text-neutral-500 uppercase">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg print:bg-white print:border print:border-neutral-200">
      <p className="text-sm font-bold text-neutral-900 dark:text-white print:text-black">{value}</p>
      <p className="text-[9px] text-neutral-500 leading-tight">{label}</p>
    </div>
  );
}
