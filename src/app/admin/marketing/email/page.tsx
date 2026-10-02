"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMailLine,
  RiAddLine,
  RiSendPlaneLine,
  RiDraftLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiEyeLine,
  RiMouseLine,
  RiUserLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiMoreLine,
  RiCloseLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiCalendarLine,
  RiLineChartLine,
  RiTestTubeLine,
  RiLayoutLine,
  RiStarLine,
} from "react-icons/ri";

// ==================== TIPOS ====================
interface EmailCampanha {
  id: string;
  assunto: string;
  preview: string;
  tipo: "newsletter" | "promocional" | "transacional" | "automacao";
  status: "enviado" | "agendado" | "rascunho";
  template: string;
  destinatarios: number;
  enviados: number;
  aberturas: number;
  cliques: number;
  taxaAbertura: number;
  taxaCliques: number;
  dataEnvio?: string;
  dataAgendamento?: string;
}

interface Template {
  id: string;
  nome: string;
  categoria: string;
  preview: string;
  usado: number;
}

// ==================== DADOS MOCK ====================
const emails: EmailCampanha[] = [
  { id: "1", assunto: "🏠 Novos imóveis em Moema!", preview: "Confira os lançamentos desta semana...", tipo: "newsletter", status: "enviado", template: "Newsletter Padrão", destinatarios: 5420, enviados: 5380, aberturas: 1890, cliques: 456, taxaAbertura: 35.1, taxaCliques: 8.5, dataEnvio: "2024-01-24T10:00:00" },
  { id: "2", assunto: "Última chance: Apartamento com 20% OFF", preview: "Promoção válida apenas até sexta...", tipo: "promocional", status: "enviado", template: "Promoção", destinatarios: 3200, enviados: 3180, aberturas: 1420, cliques: 380, taxaAbertura: 44.7, taxaCliques: 11.9, dataEnvio: "2024-01-22T14:00:00" },
  { id: "3", assunto: "Newsletter Semanal - Janeiro #4", preview: "As melhores oportunidades da semana...", tipo: "newsletter", status: "agendado", template: "Newsletter Padrão", destinatarios: 5500, enviados: 0, aberturas: 0, cliques: 0, taxaAbertura: 0, taxaCliques: 0, dataAgendamento: "2024-01-26T10:00:00" },
  { id: "4", assunto: "Seu imóvel dos sonhos está aqui", preview: "Baseado no seu perfil, selecionamos...", tipo: "automacao", status: "enviado", template: "Recomendações", destinatarios: 890, enviados: 885, aberturas: 445, cliques: 156, taxaAbertura: 50.3, taxaCliques: 17.6, dataEnvio: "2024-01-20T09:00:00" },
  { id: "5", assunto: "Bem-vindo à Tappy Imob!", preview: "Obrigado por se cadastrar...", tipo: "transacional", status: "enviado", template: "Boas-vindas", destinatarios: 156, enviados: 156, aberturas: 134, cliques: 89, taxaAbertura: 85.9, taxaCliques: 57.1, dataEnvio: "2024-01-25T08:00:00" },
  { id: "6", assunto: "Lançamento Exclusivo: Torres do Parque", preview: "Em primeira mão para você...", tipo: "promocional", status: "rascunho", template: "Lançamento", destinatarios: 0, enviados: 0, aberturas: 0, cliques: 0, taxaAbertura: 0, taxaCliques: 0 },
];

const templates: Template[] = [
  { id: "1", nome: "Newsletter Padrão", categoria: "Newsletter", preview: "📰", usado: 45 },
  { id: "2", nome: "Promoção", categoria: "Promocional", preview: "🎉", usado: 23 },
  { id: "3", nome: "Boas-vindas", categoria: "Transacional", preview: "👋", usado: 156 },
  { id: "4", nome: "Lançamento", categoria: "Promocional", preview: "🚀", usado: 12 },
  { id: "5", nome: "Recomendações", categoria: "Automação", preview: "💡", usado: 89 },
  { id: "6", nome: "Aniversário", categoria: "Automação", preview: "🎂", usado: 34 },
];

// ==================== CONFIGURAÇÕES ====================
const tipoConfig = {
  newsletter: { label: "Newsletter", cor: "bg-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600" },
  promocional: { label: "Promocional", cor: "bg-pink-500", lightBg: "bg-pink-100 dark:bg-pink-500/20", text: "text-pink-600" },
  transacional: { label: "Transacional", cor: "bg-green-500", lightBg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600" },
  automacao: { label: "Automação", cor: "bg-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600" },
};

const statusConfig = {
  enviado: { label: "Enviado", icon: RiCheckDoubleLine, cor: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  agendado: { label: "Agendado", icon: RiTimeLine, cor: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  rascunho: { label: "Rascunho", icon: RiDraftLine, cor: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-500/20" },
};

// ==================== COMPONENTES ====================

// Stat Card
function StatCard({ label, value, icon: Icon, cor, trend }: { label: string; value: string; icon: React.ElementType; cor: string; trend?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl ${cor} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
            {trend >= 0 ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </motion.div>
  );
}

// Email Card
function EmailCard({ email, onClick }: { email: EmailCampanha; onClick: () => void }) {
  const tipo = tipoConfig[email.tipo];
  const status = statusConfig[email.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${tipo.cor} flex items-center justify-center flex-shrink-0`}>
            <RiMailLine className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipo.lightBg} ${tipo.text}`}>
                {tipo.label}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.cor}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white truncate">{email.assunto}</h3>
            <p className="text-sm text-neutral-500 truncate">{email.preview}</p>

            {/* Métricas para emails enviados */}
            {email.status === "enviado" && (
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <RiUserLine className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">{email.destinatarios.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <RiEyeLine className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-blue-600">{email.taxaAbertura}%</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <RiMouseLine className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-600">{email.taxaCliques}%</span>
                </div>
              </div>
            )}

            {/* Data para agendados */}
            {email.status === "agendado" && email.dataAgendamento && (
              <div className="flex items-center gap-1 mt-3 text-sm text-amber-600">
                <RiCalendarLine className="w-4 h-4" />
                Agendado para {new Date(email.dataAgendamento).toLocaleDateString("pt-BR")} às {new Date(email.dataAgendamento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400" onClick={e => e.stopPropagation()}>
              <RiMoreLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Template Card
function TemplateCard({ template }: { template: Template }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
    >
      <div className="text-4xl mb-3">{template.preview}</div>
      <h4 className="font-medium text-neutral-900 dark:text-white">{template.nome}</h4>
      <p className="text-sm text-neutral-500">{template.categoria}</p>
      <p className="text-xs text-neutral-400 mt-2">Usado {template.usado}x</p>
    </motion.div>
  );
}

// Modal de Detalhes
function EmailModal({ email, onClose }: { email: EmailCampanha; onClose: () => void }) {
  const tipo = tipoConfig[email.tipo];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${tipo.cor} p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <RiMailLine className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">{tipo.label}</p>
                <h2 className="text-lg font-bold text-white">{email.assunto}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white">
              <RiCloseLine className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{email.preview}</p>

          {/* Métricas Grid */}
          {email.status === "enviado" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiSendPlaneLine className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{email.enviados.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Enviados</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiEyeLine className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{email.taxaAbertura}%</p>
                <p className="text-xs text-neutral-500">Taxa Abertura</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiMouseLine className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{email.taxaCliques}%</p>
                <p className="text-xs text-neutral-500">Taxa Cliques</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiUserLine className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{email.cliques}</p>
                <p className="text-xs text-neutral-500">Cliques</p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-3">
            {email.status === "rascunho" && (
              <button className="flex-1 h-11 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 flex items-center justify-center gap-2">
                <RiSendPlaneLine className="w-5 h-5" />
                Enviar Agora
              </button>
            )}
            {email.status === "agendado" && (
              <button className="flex-1 h-11 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 flex items-center justify-center gap-2">
                <RiTimeLine className="w-5 h-5" />
                Editar Agendamento
              </button>
            )}
            <button className="flex-1 h-11 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2">
              <RiEditLine className="w-5 h-5" />
              Editar
            </button>
            <button className="h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-blue-500">
              <RiFileCopyLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function EmailMarketingPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmail, setSelectedEmail] = useState<EmailCampanha | null>(null);

  const filteredEmails = emails.filter(e => statusFilter === "all" || e.status === statusFilter);

  const totalEnviados = emails.reduce((acc, e) => acc + e.enviados, 0);
  const avgTaxaAbertura = emails.filter(e => e.status === "enviado").reduce((acc, e) => acc + e.taxaAbertura, 0) / emails.filter(e => e.status === "enviado").length;
  const avgTaxaCliques = emails.filter(e => e.status === "enviado").reduce((acc, e) => acc + e.taxaCliques, 0) / emails.filter(e => e.status === "enviado").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <RiMailLine className="w-5 h-5 text-white" />
            </div>
            E-mail Marketing
          </h1>
          <p className="text-neutral-500 mt-1">Crie e gerencie suas campanhas de e-mail</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiLayoutLine className="w-4 h-4" />
            Templates
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:opacity-90">
            <RiAddLine className="w-4 h-4" />
            Novo E-mail
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="E-mails Enviados" value={totalEnviados.toLocaleString()} icon={RiSendPlaneLine} cor="bg-blue-500" trend={12} />
        <StatCard label="Taxa de Abertura" value={`${avgTaxaAbertura.toFixed(1)}%`} icon={RiEyeLine} cor="bg-green-500" trend={5} />
        <StatCard label="Taxa de Cliques" value={`${avgTaxaCliques.toFixed(1)}%`} icon={RiMouseLine} cor="bg-purple-500" trend={8} />
        <StatCard label="Agendados" value={String(emails.filter(e => e.status === "agendado").length)} icon={RiTimeLine} cor="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            {["all", "enviado", "agendado", "rascunho"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === s ? "bg-blue-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {s === "all" ? "Todos" : statusConfig[s as keyof typeof statusConfig].label}
              </button>
            ))}
          </div>

          {/* Emails */}
          <div className="space-y-3">
            {filteredEmails.map((email, index) => (
              <motion.div key={email.id} transition={{ delay: index * 0.05 }}>
                <EmailCard email={email} onClick={() => setSelectedEmail(email)} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Templates Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 dark:text-white">Templates Populares</h3>
            <button className="text-sm text-blue-500 hover:underline">Ver todos</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {templates.slice(0, 6).map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <EmailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
