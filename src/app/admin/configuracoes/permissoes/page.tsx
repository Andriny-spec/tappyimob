"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiShieldUserLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiFileTextLine,
  RiSettings4Line,
  RiEyeLine,
  RiPencilLine,
  RiLockLine,
  RiShieldCheckLine,
} from "react-icons/ri";

const papeis = [
  {
    id: "admin",
    nome: "Administrador",
    descricao: "Acesso total ao sistema",
    cor: "purple",
    usuarios: 2,
    permissoes: { leads: "total", imoveis: "total", financeiro: "total", contratos: "total", configuracoes: "total" },
  },
  {
    id: "corretor",
    nome: "Corretor",
    descricao: "Gestão de leads e imóveis",
    cor: "blue",
    usuarios: 8,
    permissoes: { leads: "total", imoveis: "editar", financeiro: "visualizar", contratos: "editar", configuracoes: "nenhum" },
  },
  {
    id: "financeiro",
    nome: "Financeiro",
    descricao: "Controle financeiro completo",
    cor: "green",
    usuarios: 1,
    permissoes: { leads: "visualizar", imoveis: "visualizar", financeiro: "total", contratos: "visualizar", configuracoes: "nenhum" },
  },
  {
    id: "marketing",
    nome: "Marketing",
    descricao: "Gestão de marketing e comunicação",
    cor: "amber",
    usuarios: 1,
    permissoes: { leads: "editar", imoveis: "editar", financeiro: "nenhum", contratos: "nenhum", configuracoes: "nenhum" },
  },
];

const modulos = [
  { id: "leads", nome: "Leads", icon: RiUserLine },
  { id: "imoveis", nome: "Imóveis", icon: RiHome4Line },
  { id: "financeiro", nome: "Financeiro", icon: RiMoneyDollarCircleLine },
  { id: "contratos", nome: "Contratos", icon: RiFileTextLine },
  { id: "configuracoes", nome: "Configurações", icon: RiSettings4Line },
];

const niveisPermissao = [
  { id: "nenhum", label: "Nenhum", icon: RiCloseLine, cor: "text-red-500 bg-red-100 dark:bg-red-500/20" },
  { id: "visualizar", label: "Visualizar", icon: RiEyeLine, cor: "text-amber-500 bg-amber-100 dark:bg-amber-500/20" },
  { id: "editar", label: "Editar", icon: RiPencilLine, cor: "text-blue-500 bg-blue-100 dark:bg-blue-500/20" },
  { id: "total", label: "Total", icon: RiCheckLine, cor: "text-green-500 bg-green-100 dark:bg-green-500/20" },
];

const colorClasses: Record<string, { bg: string; text: string; lightBg: string }> = {
  purple: { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20" },
  blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20" },
  green: { bg: "bg-green-500", text: "text-green-500", lightBg: "bg-green-100 dark:bg-green-500/20" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", lightBg: "bg-amber-100 dark:bg-amber-500/20" },
};

export default function PermissoesConfigPage() {
  const [selectedPapel, setSelectedPapel] = useState<string | null>(null);

  const getPermissaoConfig = (nivel: string) => {
    return niveisPermissao.find(n => n.id === nivel) || niveisPermissao[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/configuracoes" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <RiShieldUserLine className="w-5 h-5 text-purple-500" />
              </div>
              Permissões
            </h1>
            <p className="text-neutral-500 mt-1">Gerencie papéis e níveis de acesso</p>
          </div>
        </div>

        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600">
          <RiAddLine className="w-5 h-5" />
          Novo Papel
        </button>
      </div>

      {/* Legenda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Níveis de Permissão</h3>
        <div className="flex flex-wrap gap-4">
          {niveisPermissao.map(nivel => {
            const Icon = nivel.icon;
            return (
              <div key={nivel.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${nivel.cor} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{nivel.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Papéis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {papeis.map((papel, index) => {
          const colors = colorClasses[papel.cor];
          
          return (
            <motion.div
              key={papel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden ${
                selectedPapel === papel.id ? "ring-2 ring-purple-500" : ""
              }`}
            >
              {/* Papel Header */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.lightBg} flex items-center justify-center`}>
                      <RiShieldCheckLine className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{papel.nome}</h3>
                      <p className="text-sm text-neutral-500">{papel.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {papel.usuarios} usuários
                    </span>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                      <RiEditLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissões Grid */}
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2">
                  {modulos.map(modulo => {
                    const permissao = papel.permissoes[modulo.id as keyof typeof papel.permissoes];
                    const permConfig = getPermissaoConfig(permissao);
                    const ModuloIcon = modulo.icon;
                    const PermIcon = permConfig.icon;

                    return (
                      <div key={modulo.id} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <ModuloIcon className="w-4 h-4 text-neutral-400" />
                          <span className="text-[10px] text-neutral-500">{modulo.nome}</span>
                          <div className={`w-8 h-8 rounded-lg ${permConfig.cor} flex items-center justify-center`}>
                            <PermIcon className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Matriz de Permissões */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Matriz de Permissões</h3>
          <p className="text-sm text-neutral-500">Visão geral de todos os acessos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Módulo</th>
                {papeis.map(papel => (
                  <th key={papel.id} className="text-center p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                    {papel.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulos.map((modulo, index) => {
                const Icon = modulo.icon;
                return (
                  <tr key={modulo.id} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{modulo.nome}</span>
                      </div>
                    </td>
                    {papeis.map(papel => {
                      const permissao = papel.permissoes[modulo.id as keyof typeof papel.permissoes];
                      const permConfig = getPermissaoConfig(permissao);
                      const PermIcon = permConfig.icon;

                      return (
                        <td key={papel.id} className="p-4 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${permConfig.cor}`}>
                            <PermIcon className="w-3.5 h-3.5" />
                            {permConfig.label}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <RiLockLine className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-1">Segurança de Permissões</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Alterações em permissões são registradas no log de auditoria. Recomendamos revisar periodicamente os acessos concedidos.
              Princípio do menor privilégio: conceda apenas as permissões necessárias.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
