"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiSettings4Line,
  RiBuilding2Line,
  RiUserSettingsLine,
  RiShieldUserLine,
  RiNotification3Line,
  RiPaletteLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiLockLine,
  RiMailLine,
  RiSmartphoneLine,
  RiGlobalLine,
  RiDatabase2Line,
  RiCloudLine,
  RiInboxArchiveLine,
} from "react-icons/ri";

const configSections = [
  {
    id: "empresa",
    nome: "Dados da Empresa",
    descricao: "Informações, logo, CNPJ e endereço da imobiliária",
    icon: RiBuilding2Line,
    href: "/admin/configuracoes/empresa",
    cor: "blue",
    status: "completo",
  },
  {
    id: "usuarios",
    nome: "Usuários",
    descricao: "Gerenciar usuários, corretores e administradores",
    icon: RiUserSettingsLine,
    href: "/admin/configuracoes/usuarios",
    cor: "green",
    status: "completo",
    badge: "12 ativos",
  },
  {
    id: "permissoes",
    nome: "Permissões",
    descricao: "Papéis, níveis de acesso e políticas de segurança",
    icon: RiShieldUserLine,
    href: "/admin/configuracoes/permissoes",
    cor: "purple",
    status: "completo",
  },
  {
    id: "notificacoes",
    nome: "Notificações",
    descricao: "E-mail, push, WhatsApp e alertas do sistema",
    icon: RiNotification3Line,
    href: "/admin/configuracoes/notificacoes",
    cor: "amber",
    status: "atencao",
    badge: "2 pendentes",
  },
  {
    id: "personalizacao",
    nome: "Personalização",
    descricao: "Temas, cores, logo e identidade visual",
    icon: RiPaletteLine,
    href: "/admin/configuracoes/personalizacao",
    cor: "rose",
    status: "completo",
  },
  {
    id: "arquivamento",
    nome: "Arquivamento",
    descricao: "Motivos e categorias do modal de arquivar leads",
    icon: RiInboxArchiveLine,
    href: "/admin/configuracoes/arquivamento",
    cor: "amber",
    status: "completo",
  },
];

const quickSettings = [
  { nome: "Modo Escuro", icon: RiPaletteLine, ativo: true },
  { nome: "Notificações Push", icon: RiSmartphoneLine, ativo: true },
  { nome: "E-mail Marketing", icon: RiMailLine, ativo: false },
  { nome: "API Externa", icon: RiGlobalLine, ativo: true },
];

const systemInfo = [
  { label: "Versão do Sistema", value: "2.4.1" },
  { label: "Última Atualização", value: "25/01/2024" },
  { label: "Banco de Dados", value: "PostgreSQL 15" },
  { label: "Armazenamento", value: "45.2 GB / 100 GB" },
];

const colorClasses: Record<string, { bg: string; text: string; lightBg: string; border: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20", border: "border-blue-200 dark:border-blue-500/30" },
  green: { bg: "bg-green-500", text: "text-green-500", lightBg: "bg-green-100 dark:bg-green-500/20", border: "border-green-200 dark:border-green-500/30" },
  purple: { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20", border: "border-purple-200 dark:border-purple-500/30" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", lightBg: "bg-amber-100 dark:bg-amber-500/20", border: "border-amber-200 dark:border-amber-500/30" },
  rose: { bg: "bg-rose-500", text: "text-rose-500", lightBg: "bg-rose-100 dark:bg-rose-500/20", border: "border-rose-200 dark:border-rose-500/30" },
};

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-900 dark:from-neutral-600 dark:to-neutral-800 flex items-center justify-center">
            <RiSettings4Line className="w-5 h-5 text-white" />
          </div>
          Configurações
        </h1>
        <p className="text-neutral-500 mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Config Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configSections.map((section, index) => {
          const colors = colorClasses[section.cor];
          const Icon = section.icon;

          return (
            <Link key={section.id} href={section.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 bg-white dark:bg-neutral-900 rounded-2xl border ${
                  section.status === "atencao" 
                    ? "border-amber-300 dark:border-amber-500/30" 
                    : "border-neutral-200 dark:border-neutral-800"
                } hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.lightBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {section.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        section.status === "atencao"
                          ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}>
                        {section.badge}
                      </span>
                    )}
                    {section.status === "completo" ? (
                      <RiCheckboxCircleLine className="w-5 h-5 text-green-500" />
                    ) : (
                      <RiErrorWarningLine className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {section.nome}
                </h3>
                <p className="text-sm text-neutral-500 mb-4">{section.descricao}</p>

                <div className="flex items-center text-sm text-neutral-400 group-hover:text-blue-500 transition-colors">
                  <span>Configurar</span>
                  <RiArrowRightLine className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiSettings4Line className="w-5 h-5 text-neutral-500" />
            Configurações Rápidas
          </h3>

          <div className="space-y-4">
            {quickSettings.map((setting, index) => {
              const Icon = setting.icon;
              return (
                <div key={setting.nome} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{setting.nome}</span>
                  </div>
                  <button
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      setting.ativo ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        setting.ativo ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiInformationLine className="w-5 h-5 text-neutral-500" />
            Informações do Sistema
          </h3>

          <div className="space-y-4">
            {systemInfo.map((info, index) => (
              <div key={info.label} className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{info.label}</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{info.value}</span>
              </div>
            ))}

            {/* Storage Bar */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-500">Uso de Armazenamento</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">45.2%</span>
              </div>
              <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "45.2%" }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <RiLockLine className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">Segurança</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Todas as configurações são protegidas por criptografia. Alterações críticas requerem autenticação adicional.
              Última verificação de segurança: há 2 dias.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
