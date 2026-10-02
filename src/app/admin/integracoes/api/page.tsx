"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiCodeSSlashLine,
  RiAddLine,
  RiCheckLine,
  RiTimeLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFileCopyLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLineChartLine,
  RiShieldCheckLine,
  RiBookOpenLine,
  RiTerminalLine,
  RiKeyLine,
  RiRefreshLine,
  RiArrowRightLine,
  RiExternalLinkLine,
} from "react-icons/ri";

const apiKeys = [
  {
    id: "1",
    nome: "Produção - App Mobile",
    prefixo: "tk_demo_",
    chave: "tk_demo_xxxxxxxxxxxxxxxxxxxxxxxx...",
    chaveCompleta: "tk_demo_xxxxxxxxxxxxxxxxxxxxxxxx",
    permissoes: ["leads:read", "leads:write", "properties:read", "properties:write"],
    ultimoUso: "2024-01-25T14:30:00",
    requisicoes: 12456,
    criadoEm: "2024-01-01",
  },
  {
    id: "2",
    nome: "Integração CRM",
    prefixo: "tk_demo_",
    chave: "tk_demo_xxxxxxxxxxxxxxxxxxxxxxxx...",
    chaveCompleta: "tk_demo_xxxxxxxxxxxxxxxxxxxxxxxx",
    permissoes: ["leads:read", "leads:write"],
    ultimoUso: "2024-01-25T14:28:00",
    requisicoes: 8934,
    criadoEm: "2024-01-10",
  },
  {
    id: "3",
    nome: "Teste - Desenvolvimento",
    prefixo: "tk_demo_",
    chave: "tk_demo_xxxxxxxxxxxxxxxxxxxxxxxx...",
    chaveCompleta: "tk_demo_xxxxxxxxxxxxxxxxxxxxxxxx",
    permissoes: ["*:read", "*:write"],
    ultimoUso: "2024-01-25T10:15:00",
    requisicoes: 2345,
    criadoEm: "2024-01-15",
  },
];

const endpoints = [
  { metodo: "GET", path: "/api/v2/properties", descricao: "Lista todos os imóveis", requisicoes: 15234 },
  { metodo: "POST", path: "/api/v2/leads", descricao: "Cria um novo lead", requisicoes: 8567 },
  { metodo: "GET", path: "/api/v2/leads", descricao: "Lista todos os leads", requisicoes: 7823 },
  { metodo: "PUT", path: "/api/v2/properties/:id", descricao: "Atualiza um imóvel", requisicoes: 3456 },
  { metodo: "GET", path: "/api/v2/contracts", descricao: "Lista contratos", requisicoes: 2134 },
  { metodo: "POST", path: "/api/v2/visits", descricao: "Agenda uma visita", requisicoes: 1987 },
];

const stats = [
  { label: "Requisições/Mês", value: "45.2K", icon: RiLineChartLine, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  { label: "API Keys Ativas", value: "3", icon: RiKeyLine, cor: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" },
  { label: "Endpoints", value: "28", icon: RiCodeSSlashLine, cor: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  { label: "Uptime", value: "99.99%", icon: RiCheckLine, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
];

const codeExample = `// Exemplo de requisição
const response = await fetch('https://api.tappyimob.com.br/v2/properties', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer SUA_CHAVE_AQUI',
    'Content-Type': 'application/json'
  }
});

const properties = await response.json();
console.log(properties);`;

export default function APIPage() {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-green-100 dark:bg-green-500/20 text-green-600",
      POST: "bg-blue-100 dark:bg-blue-500/20 text-blue-600",
      PUT: "bg-amber-100 dark:bg-amber-500/20 text-amber-600",
      DELETE: "bg-red-100 dark:bg-red-500/20 text-red-600",
    };
    return colors[method] || colors.GET;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/integracoes" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <RiCodeSSlashLine className="w-5 h-5 text-white" />
              </div>
              API REST
            </h1>
            <p className="text-neutral-500 mt-1">Acesso programático aos dados do sistema</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RiBookOpenLine className="w-4 h-4" />
            Documentação
            <RiExternalLinkLine className="w-3 h-3" />
          </a>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600">
            <RiAddLine className="w-4 h-4" />
            Nova API Key
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.cor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiKeyLine className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white">API Keys</h3>
                <p className="text-sm text-neutral-500">Gerencie suas chaves de acesso</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {apiKeys.map((apiKey, index) => (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      apiKey.prefixo.includes("test") 
                        ? "bg-amber-100 dark:bg-amber-500/20" 
                        : "bg-green-100 dark:bg-green-500/20"
                    }`}>
                      <RiKeyLine className={`w-5 h-5 ${
                        apiKey.prefixo.includes("test") ? "text-amber-500" : "text-green-500"
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">{apiKey.nome}</h4>
                      <p className="text-xs text-neutral-500">Criada em {formatDate(apiKey.criadoEm)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      apiKey.prefixo.includes("test")
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600"
                        : "bg-green-100 dark:bg-green-500/20 text-green-600"
                    }`}>
                      {apiKey.prefixo.includes("test") ? "Teste" : "Produção"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm font-mono text-neutral-700 dark:text-neutral-300">
                    {visibleKeys.has(apiKey.id) ? apiKey.chaveCompleta : apiKey.chave}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
                  >
                    {visibleKeys.has(apiKey.id) ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyKey(apiKey.id, apiKey.chaveCompleta)}
                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-neutral-400 hover:text-blue-600"
                  >
                    {copiedKey === apiKey.id ? <RiCheckLine className="w-4 h-4 text-green-500" /> : <RiFileCopyLine className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-neutral-400 hover:text-red-600">
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-500">
                      <span className="font-medium text-neutral-900 dark:text-white">{apiKey.requisicoes.toLocaleString()}</span> requisições
                    </span>
                    <span className="text-neutral-500">
                      Último uso: {formatDate(apiKey.ultimoUso)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {apiKey.permissoes.slice(0, 2).map(perm => (
                      <span key={perm} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 rounded text-xs text-blue-600">
                        {perm}
                      </span>
                    ))}
                    {apiKey.permissoes.length > 2 && (
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs text-neutral-500">
                        +{apiKey.permissoes.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiTerminalLine className="w-5 h-5 text-blue-500" />
              Quick Start
            </h3>
          </div>
          <div className="p-4">
            <pre className="p-4 bg-neutral-900 dark:bg-neutral-950 rounded-xl text-xs text-neutral-300 overflow-x-auto">
              <code>{codeExample}</code>
            </pre>
            <button className="mt-3 w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10">
              <RiBookOpenLine className="w-4 h-4" />
              Ver Documentação Completa
            </button>
          </div>
        </motion.div>
      </div>

      {/* Endpoints Populares */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Endpoints Mais Usados</h3>
          <p className="text-sm text-neutral-500">Os endpoints mais requisitados este mês</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Método</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Endpoint</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Descrição</th>
                <th className="text-right p-4 text-xs font-semibold text-neutral-500">Requisições</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint, index) => (
                <motion.tr
                  key={endpoint.path}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.03 }}
                  className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(endpoint.metodo)}`}>
                      {endpoint.metodo}
                    </span>
                  </td>
                  <td className="p-4">
                    <code className="text-sm font-mono text-blue-600">{endpoint.path}</code>
                  </td>
                  <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400">{endpoint.descricao}</td>
                  <td className="p-4 text-right text-sm font-medium text-neutral-900 dark:text-white">
                    {endpoint.requisicoes.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <RiShieldCheckLine className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">API Segura e Documentada</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Nossa API utiliza autenticação Bearer Token, rate limiting e logs completos de auditoria. 
              Acesse a documentação interativa no Swagger para testar os endpoints.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
