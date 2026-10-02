"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiSearchLine,
  RiRefreshLine,
  RiGlobalLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiShieldCheckLine,
  RiLinkM,
} from "react-icons/ri";

interface Domain {
  id: string;
  domain: string;
  isSubdomain: boolean;
  sslStatus: string;
  dnsConfigured: boolean;
  isActive: boolean;
  isPrimary: boolean;
  partnerId: string;
  partner?: { name: string; slug: string };
  createdAt: string;
}

export default function DominiosPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os parceiros com seus domínios
      const res = await fetch("/api/admin/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
        
        // Extrair todos os domínios
        const allDomains: Domain[] = [];
        data.partners.forEach((partner: any) => {
          if (partner.domains) {
            partner.domains.forEach((domain: any) => {
              allDomains.push({
                ...domain,
                partner: { name: partner.name, slug: partner.slug },
              });
            });
          }
        });
        setDomains(allDomains);
      }
    } catch (error) {
      console.error("Erro ao buscar domínios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (domain: Domain) => {
    if (!domain.isActive) return "bg-neutral-100 text-neutral-500";
    if (domain.sslStatus === "ACTIVE" && domain.dnsConfigured) return "bg-green-100 text-green-700";
    if (domain.sslStatus === "PENDING" || !domain.dnsConfigured) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getStatusText = (domain: Domain) => {
    if (!domain.isActive) return "Inativo";
    if (domain.sslStatus === "ACTIVE" && domain.dnsConfigured) return "Ativo";
    if (!domain.dnsConfigured) return "Aguardando DNS";
    if (domain.sslStatus === "PENDING") return "SSL Pendente";
    return "Erro";
  };

  const filteredDomains = domains.filter((d) => {
    const matchSearch = d.domain.toLowerCase().includes(search.toLowerCase()) ||
      d.partner?.name.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "active") return matchSearch && d.isActive && d.dnsConfigured;
    if (statusFilter === "pending") return matchSearch && (!d.dnsConfigured || d.sslStatus === "PENDING");
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <RiGlobalLine className="w-5 h-5 text-purple-600" />
              </div>
              Domínios
            </h1>
            <p className="text-neutral-500 mt-1">
              Gerencie os domínios dos parceiros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar domínio..."
              className="w-64 h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="pending">Pendentes</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RiRefreshLine className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Total</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{domains.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Ativos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {domains.filter(d => d.isActive && d.dnsConfigured && d.sslStatus === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Pendentes</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {domains.filter(d => !d.dnsConfigured || d.sslStatus === "PENDING").length}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <p className="text-sm text-neutral-500">Subdomínios</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{domains.filter(d => d.isSubdomain).length}</p>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <RiGlobalLine className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
          <p className="text-neutral-500">Nenhum domínio encontrado</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left p-4 text-sm font-medium text-neutral-500">Domínio</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-500">Parceiro</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-500">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-500">DNS</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-500">SSL</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-500">Status</th>
                <th className="text-right p-4 text-sm font-medium text-neutral-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDomains.map((domain) => (
                <motion.tr
                  key={domain.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <RiGlobalLine className="w-4 h-4 text-neutral-400" />
                      <span className="font-medium text-neutral-900 dark:text-white">{domain.domain}</span>
                      {domain.isPrimary && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">
                          PRINCIPAL
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/multi-sites/parceiros/${domain.partnerId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {domain.partner?.name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      domain.isSubdomain
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {domain.isSubdomain ? "Subdomínio" : "Próprio"}
                    </span>
                  </td>
                  <td className="p-4">
                    {domain.dnsConfigured ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <RiCheckLine className="w-4 h-4" />
                        <span className="text-sm">Configurado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <RiAlertLine className="w-4 h-4" />
                        <span className="text-sm">Pendente</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {domain.sslStatus === "ACTIVE" ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <RiShieldCheckLine className="w-4 h-4" />
                        <span className="text-sm">Ativo</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600">
                        <RiAlertLine className="w-4 h-4" />
                        <span className="text-sm">{domain.sslStatus}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(domain)}`}>
                      {getStatusText(domain)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`https://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 inline-flex"
                    >
                      <RiExternalLinkLine className="w-4 h-4 text-neutral-500" />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Instruções de DNS */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/30 p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Como configurar um domínio próprio
        </h3>
        <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <span>Acesse o painel de DNS do seu provedor de domínio (ex: Registro.br, GoDaddy)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <span>Adicione um registro CNAME apontando para: <code className="bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 rounded">sites.tappyimob.com.br</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <span>Aguarde a propagação do DNS (pode levar até 48h)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <span>O certificado SSL será gerado automaticamente após a verificação</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
