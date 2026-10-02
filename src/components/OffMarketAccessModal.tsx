"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RiShieldKeyholeLine, RiCloseLine, RiCheckboxCircleFill, RiLoader4Line } from "react-icons/ri";

interface OffMarketAccessImovel {
  id: string;
  ref: string;
  titulo: string;
  condominio?: string;
  localizacao?: string;
}

interface OffMarketAccessModalProps {
  imovel?: OffMarketAccessImovel;
  onClose: () => void;
}

// Modal de solicitação de acesso a imóveis Off Market — cria lead real no CRM
// (mesmo endpoint/fluxo de notificação de qualquer outro lead do site).
export function OffMarketAccessModal({ imovel, onClose }: OffMarketAccessModalProps) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", perfil: "", tipo: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo) {
      setErro("Selecione se você é Cliente ou Corretor Parceiro");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const tipoLabel = form.tipo === "corretor" ? "Corretor Parceiro" : "Cliente";
      const linhas = [
        "🔐 SOLICITAÇÃO DE ACESSO — OFF MARKET",
        `Tipo: ${tipoLabel}`,
        imovel ? `Imóvel de interesse: ${imovel.ref} — ${imovel.condominio || imovel.titulo}${imovel.localizacao ? ` (${imovel.localizacao})` : ""}` : "Acesso geral ao portfólio",
        form.perfil ? `Perfil buscado: ${form.perfil}` : null,
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nome,
          email: form.email,
          phone: form.telefone,
          message: linhas,
          source: "OFF_MARKET",
          propertyId: imovel?.id,
          tags: ["OFF_MARKET", form.tipo === "corretor" ? "OFF_MARKET_CORRETOR" : "OFF_MARKET_CLIENTE"],
        }),
      });
      if (res.ok) {
        setEnviado(true);
      } else {
        setErro("Erro ao enviar solicitação. Tente novamente.");
      }
    } catch {
      setErro("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <RiShieldKeyholeLine className="w-5 h-5 text-neutral-900" />
            <h3 className="font-bold text-neutral-900">Solicitar desbloqueio</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700"><RiCloseLine className="w-5 h-5" /></button>
        </div>

        {enviado ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-5">
              <RiCheckboxCircleFill className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900 mb-2">Acesso solicitado!</h4>
            <p className="text-neutral-600 text-sm">Nossa equipe entrará em contato pelo WhatsApp para apresentar o portfólio.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            {imovel && (
              <div className="p-3 rounded-xl bg-neutral-100 text-sm">
                <span className="text-neutral-500">Imóvel de interesse: </span>
                <span className="font-medium text-neutral-900">{imovel.ref} · {imovel.condominio || imovel.titulo}</span>
              </div>
            )}
            {erro && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{erro}</div>
            )}
            {/* Mesma qualificação do banner: separa cliente final de corretor
                parceiro já na entrada, que é o filtro pedido */}
            <div>
              <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Você é *
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { valor: "cliente", label: "Cliente" },
                  { valor: "corretor", label: "Corretor Parceiro" },
                ].map((op) => (
                  <button
                    key={op.valor}
                    type="button"
                    onClick={() => setForm({ ...form, tipo: op.valor })}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      form.tipo === op.valor
                        ? "bg-[#1EBE5A] border-[#1EBE5A] text-white"
                        : "bg-neutral-100 border-neutral-200 text-neutral-700 hover:border-[#1EBE5A]/50"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <input type="text" required placeholder="Nome completo" value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-100 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
            <input type="email" required placeholder="E-mail" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-100 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
            <input type="tel" required placeholder="WhatsApp / Telefone" value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-100 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
            <textarea rows={3} placeholder="Descreva o perfil que busca (faixa de valor, localização, características...)"
              value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-100 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-none text-sm" />
            <button type="submit" disabled={enviando}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {enviando ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiShieldKeyholeLine className="w-5 h-5" />}
              {enviando ? "Enviando..." : "Quero acesso ao portfólio"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
