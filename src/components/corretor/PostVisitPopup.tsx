"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiCheckLine,
  RiCalendarLine,
  RiHome4Line,
  RiUserLine,
  RiStarLine,
  RiStarFill,
  RiLoader4Line,
  RiEyeLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiArrowDownSLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiThumbUpFill,
  RiThumbDownFill,
} from "react-icons/ri";

interface PendingVisit {
  id: string;
  date: string;
  time: string | null;
  status: string;
  lead?: { id: string; name: string; email?: string; phone?: string } | null;
  visitorName?: string | null;
  visitorPhone?: string | null;
  visitorEmail?: string | null;
  properties: { property: { id: string; code: string; title: string } }[];
}

interface PropertyFeedback {
  propertyId: string;
  liked: boolean | null;
  feedback: string;
}

export function PostVisitPopup() {
  const [visits, setVisits] = useState<PendingVisit[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [clientExpanded, setClientExpanded] = useState(false);
  const [propertyFeedbacks, setPropertyFeedbacks] = useState<PropertyFeedback[]>([]);

  useEffect(() => {
    fetchPendingVisits();
  }, []);

  const fetchPendingVisits = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

      // Buscar visitas agendadas que passaram (até ontem)
      const res = await fetch(`/api/admin/scheduled-visits?status=AGENDADA&endDate=${yesterdayStr}`);
      if (res.ok) {
        const data = await res.json();
        const pendingVisits = (data.visits || []).filter((v: PendingVisit) => {
          const visitDate = v.date?.split("T")[0] || "";
          return visitDate <= yesterdayStr;
        });
        if (pendingVisits.length > 0) {
          setVisits(pendingVisits);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar visitas pendentes:", error);
    }
  };

  const initPropertyFeedbacks = (visit: PendingVisit) => {
    setPropertyFeedbacks(
      visit.properties.map((p) => ({
        propertyId: p.property.id,
        liked: null,
        feedback: "",
      }))
    );
  };

  const updatePropertyFeedback = (propertyId: string, field: "liked" | "feedback", value: any) => {
    setPropertyFeedbacks((prev) =>
      prev.map((pf) => (pf.propertyId === propertyId ? { ...pf, [field]: value } : pf))
    );
  };

  const handleConfirm = async (status: "REALIZADA" | "NAO_COMPARECEU" | "CANCELADA") => {
    const visit = visits[currentIndex];
    if (!visit) return;

    setSaving(true);
    try {
      const body: any = { status };
      if (status === "REALIZADA") {
        if (feedback.trim()) body.feedback = feedback.trim();
        if (rating > 0) body.rating = rating;
      }

      const res = await fetch(`/api/admin/scheduled-visits/${visit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok && status === "REALIZADA") {
        // Salvar feedback por imóvel — sempre envia para limpar pendências
        for (const pf of propertyFeedbacks) {
          try {
            await fetch(`/api/admin/scheduled-visits/${visit.id}/property-feedback`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                propertyId: pf.propertyId,
                liked: pf.liked ?? false,
                feedback: pf.feedback.trim() || null,
              }),
            });
          } catch {}
        }
      }

      if (res.ok) {
        if (currentIndex < visits.length - 1) {
          const nextIndex = currentIndex + 1;
          setCurrentIndex(nextIndex);
          setFeedback("");
          setRating(0);
          setClientExpanded(false);
          initPropertyFeedbacks(visits[nextIndex]);
        } else {
          handleDismiss();
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar visita:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setDismissed(true);
  };

  // Inicializar feedbacks quando visita muda
  useEffect(() => {
    if (visits.length > 0 && currentIndex < visits.length) {
      initPropertyFeedbacks(visits[currentIndex]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits, currentIndex]);

  if (!isOpen || visits.length === 0) return null;

  const visit = visits[currentIndex];
  const visitorName = visit.lead?.name || visit.visitorName || "Visitante";
  const visitorPhone = visit.lead?.phone || visit.visitorPhone || "";
  const visitorEmail = visit.lead?.email || visit.visitorEmail || "";
  const propertyCodes = visit.properties?.map((p) => p.property.code).join(", ") || "";
  const visitDate = new Date(visit.date);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-emerald-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <RiEyeLine className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Confirmação de Visita</h2>
                  <p className="text-sm text-white/80">
                    {currentIndex + 1} de {visits.length} pendente{visits.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visit Details */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Cliente - clicável para expandir */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <button
                onClick={() => setClientExpanded(!clientExpanded)}
                className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {visitorName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-neutral-900 dark:text-white">{visitorName}</span>
                    {!clientExpanded && (visitorPhone || visitorEmail) && (
                      <p className="text-xs text-neutral-500 mt-0.5">{visitorPhone || visitorEmail}</p>
                    )}
                  </div>
                </div>
                <RiArrowDownSLine className={`w-5 h-5 text-neutral-400 transition-transform ${clientExpanded ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {clientExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 space-y-2 border-t border-neutral-200 dark:border-neutral-700">
                      {visitorPhone && (
                        <div className="flex items-center gap-2">
                          <RiPhoneLine className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">{visitorPhone}</span>
                          <a
                            href={`https://wa.me/${visitorPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            className="ml-auto p-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20"
                          >
                            <RiWhatsappLine className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                      {visitorEmail && (
                        <div className="flex items-center gap-2">
                          <RiMailLine className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">{visitorEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <RiCalendarLine className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {visitDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: "UTC" })}
                          {visit.time && ` às ${visit.time}`}
                        </span>
                      </div>
                      {propertyCodes && (
                        <div className="flex items-center gap-2">
                          <RiHome4Line className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Imóveis: {propertyCodes}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info resumida quando não expandido */}
            {!clientExpanded && (
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <RiCalendarLine className="w-4 h-4" />
                  {visitDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })}
                  {visit.time && ` às ${visit.time}`}
                </span>
                {propertyCodes && (
                  <span className="flex items-center gap-1">
                    <RiHome4Line className="w-4 h-4" />
                    {propertyCodes}
                  </span>
                )}
              </div>
            )}

            {/* Rating geral */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Avaliação da visita
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    {star <= rating ? (
                      <RiStarFill className="w-7 h-7 text-amber-400" />
                    ) : (
                      <RiStarLine className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback por imóvel */}
            {visit.properties.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Feedback por imóvel
                </label>
                {visit.properties.map((vp) => {
                  const pf = propertyFeedbacks.find((f) => f.propertyId === vp.property.id);
                  return (
                    <div key={vp.property.id} className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-neutral-500 bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                          {vp.property.code}
                        </span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{vp.property.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updatePropertyFeedback(vp.property.id, "liked", pf?.liked === true ? null : true)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            pf?.liked === true
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {pf?.liked === true ? <RiThumbUpFill className="w-3.5 h-3.5" /> : <RiThumbUpLine className="w-3.5 h-3.5" />}
                          Gostou
                        </button>
                        <button
                          onClick={() => updatePropertyFeedback(vp.property.id, "liked", pf?.liked === false ? null : false)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            pf?.liked === false
                              ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                              : "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          {pf?.liked === false ? <RiThumbDownFill className="w-3.5 h-3.5" /> : <RiThumbDownLine className="w-3.5 h-3.5" />}
                          Não gostou
                        </button>
                      </div>
                      <input
                        type="text"
                        value={pf?.feedback || ""}
                        onChange={(e) => updatePropertyFeedback(vp.property.id, "feedback", e.target.value)}
                        placeholder="Feedback do cliente sobre este imóvel..."
                        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Feedback geral */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Notas / Feedback geral
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
                placeholder="Como foi a visita? Interesse do cliente, observações..."
                className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleConfirm("REALIZADA")}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />}
                Visita Realizada
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleConfirm("NAO_COMPARECEU")}
                  disabled={saving}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Não Compareceu
                </button>
                <button
                  onClick={() => handleConfirm("CANCELADA")}
                  disabled={saving}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Cancelada
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
