"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiHistoryLine,
  RiUserLine,
  RiTimeLine,
  RiLoader4Line,
  RiEditLine,
  RiPriceTag3Line,
  RiFileTextLine,
  RiHome4Line,
} from "react-icons/ri";

interface ChangelogEntry {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const fieldLabels: Record<string, string> = {
  price: "Preço",
  rentPrice: "Preço de Aluguel",
  status: "Status",
  title: "Título",
  description: "Descrição",
  category: "Categoria",
  type: "Tipo",
  condition: "Condição",
  bedrooms: "Quartos",
  bathrooms: "Banheiros",
  suites: "Suítes",
  parkingSpaces: "Vagas",
  area: "Área",
  address: "Endereço",
  neighborhood: "Bairro",
  city: "Cidade",
  isFeatured: "Destaque",
  isExclusive: "Exclusivo",
  soldBy: "Vendido Por",
  soldAt: "Data da Venda",
  soldPrice: "Valor Final",
};

const getFieldIcon = (field: string) => {
  if (field.includes("price") || field === "soldPrice") return RiPriceTag3Line;
  if (field.includes("description") || field === "title") return RiFileTextLine;
  return RiEditLine;
};

export default function HistoricoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados do imóvel
        const propRes = await fetch(`/api/properties/${id}`);
        if (propRes.ok) {
          const propData = await propRes.json();
          setProperty(propData.property);
        }

        // Buscar changelog
        const logRes = await fetch(`/api/properties/${id}/changelog`);
        if (logRes.ok) {
          const logData = await logRes.json();
          setChangelog(logData.changelog || []);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatValue = (value: string | null, field: string) => {
    if (value === null || value === "") return "—";
    
    if (field.includes("price") || field === "soldPrice") {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(num);
      }
    }
    
    if (field === "status") {
      const statusLabels: Record<string, string> = {
        DISPONIVEL: "Disponível",
        VENDIDO: "Vendido",
        ALUGADO: "Alugado",
        RESERVADO: "Reservado",
        INATIVO: "Indisponível",
      };
      return statusLabels[value] || value;
    }
    
    if (field === "soldBy") {
      return value === "TAPPY" ? "Tappy Imob" : "Terceiros";
    }
    
    if (value === "true") return "Sim";
    if (value === "false") return "Não";
    
    return value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <RiHistoryLine className="w-5 h-5 text-white" />
            </div>
            Histórico de Alterações
          </h1>
          {property && (
            <p className="text-neutral-500 mt-1">
              {property.code} - {property.title}
            </p>
          )}
        </div>
      </div>

      {/* Link para o imóvel */}
      <div className="flex gap-2">
        <Link
          href={`/admin/imoveis/${id}`}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm"
        >
          <RiHome4Line className="w-4 h-4" />
          Ver Ficha do Imóvel
        </Link>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        {changelog.length === 0 ? (
          <div className="text-center py-12">
            <RiHistoryLine className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500">Nenhuma alteração registrada</p>
            <p className="text-sm text-neutral-400 mt-1">
              As alterações feitas no imóvel aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
            
            <div className="space-y-6">
              {changelog.map((log, index) => {
                const Icon = getFieldIcon(log.field);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-12"
                  >
                    <div className="absolute left-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {fieldLabels[log.field] || log.field}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <RiTimeLine className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex-1 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                          <span className="text-xs text-red-500 block mb-1">Anterior</span>
                          <span className="text-red-600 dark:text-red-400 line-through">
                            {formatValue(log.oldValue, log.field)}
                          </span>
                        </div>
                        <span className="text-neutral-400">→</span>
                        <div className="flex-1 p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                          <span className="text-xs text-green-500 block mb-1">Novo</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {formatValue(log.newValue, log.field)}
                          </span>
                        </div>
                      </div>
                      
                      {log.user && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                            <RiUserLine className="w-3 h-3 text-orange-600" />
                          </div>
                          <span className="text-xs text-neutral-500">
                            Alterado por <span className="font-medium text-neutral-700 dark:text-neutral-300">{log.user.name}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
