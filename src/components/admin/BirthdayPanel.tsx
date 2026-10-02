"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCakeLine,
  RiCake2Line,
  RiLoader4Line,
  RiUserLine,
  RiWhatsappLine,
  RiMailLine,
  RiEyeLine,
  RiEyeOffLine,
  RiGiftLine,
  RiTeamLine,
  RiHome4Line,
} from "react-icons/ri";

interface Birthday {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: string;
  type: "lead" | "owner" | "broker";
  age: number | null;
  daysUntil: number;
  isToday: boolean;
  assignedTo?: { id: string; name: string } | null;
}

const STORAGE_KEY = "tappyimob_birthday_panel_visible";

const BirthdayPanel = () => {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "true";
    }
    return false;
  });

  useEffect(() => {
    fetchBirthdays();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(visible));
  }, [visible]);

  const fetchBirthdays = async () => {
    try {
      const res = await fetch("/api/admin/birthdays");
      if (res.ok) {
        const data = await res.json();
        setBirthdays(data.birthdays || []);
        setTodayCount(data.todayCount || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar aniversariantes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <RiLoader4Line className="w-5 h-5 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (birthdays.length === 0) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "lead": return "Lead";
      case "owner": return "Proprietário";
      case "broker": return "Corretor";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lead": return RiUserLine;
      case "owner": return RiHome4Line;
      case "broker": return RiTeamLine;
      default: return RiUserLine;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lead": return "text-blue-500 bg-blue-100 dark:bg-blue-500/20";
      case "owner": return "text-purple-500 bg-purple-100 dark:bg-purple-500/20";
      case "broker": return "text-green-500 bg-green-100 dark:bg-green-500/20";
      default: return "text-neutral-500 bg-neutral-100 dark:bg-neutral-500/20";
    }
  };

  const getDaysLabel = (days: number) => {
    if (days === 0) return "Hoje! 🎉";
    if (days === 1) return "Amanhã";
    return `Em ${days} dias`;
  };

  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const firstName = name?.split(" ")[0] || name;
    const message = encodeURIComponent(`Olá ${firstName}! 🎂🎉\n\nParabéns pelo seu aniversário! Desejo que esse novo ciclo seja repleto de conquistas e realizações!\n\nUm grande abraço! 🥂`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-2 transition-colors"
      >
        {visible ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
        {visible ? "Ocultar aniversariantes" : "Mostrar aniversariantes"}
        {todayCount > 0 && (
          <span className="bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            {todayCount} hoje! 🎂
          </span>
        )}
        {todayCount === 0 && birthdays.length > 0 && (
          <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {birthdays.length} esta semana
          </span>
        )}
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <RiCake2Line className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      Aniversariantes da Semana
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {todayCount > 0 && <span className="text-pink-500 font-semibold">{todayCount} hoje</span>}
                      {todayCount > 0 && birthdays.length > todayCount && " • "}
                      {birthdays.length > todayCount && `${birthdays.length - todayCount} nos próximos dias`}
                    </p>
                  </div>
                </div>
                <RiGiftLine className="w-6 h-6 text-pink-300 dark:text-pink-500/30" />
              </div>

              {/* Birthday list */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {birthdays.map((birthday, idx) => {
                  const TypeIcon = getTypeIcon(birthday.type);
                  return (
                    <motion.div
                      key={`${birthday.type}-${birthday.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`px-4 py-3 flex items-center gap-3 ${
                        birthday.isToday
                          ? "bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-500/5 dark:to-rose-500/5"
                          : ""
                      }`}
                    >
                      {/* Avatar / Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                        birthday.isToday
                          ? "bg-gradient-to-br from-pink-400 to-rose-500 ring-2 ring-pink-300 dark:ring-pink-500/30"
                          : "bg-gradient-to-br from-neutral-400 to-neutral-500"
                      }`}>
                        {birthday.isToday ? "🎂" : birthday.name?.charAt(0) || "?"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                            {birthday.name}
                          </p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${getTypeColor(birthday.type)}`}>
                            <TypeIcon className="w-3 h-3" />
                            {getTypeLabel(birthday.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-medium ${
                            birthday.isToday ? "text-pink-500" : "text-neutral-500"
                          }`}>
                            {getDaysLabel(birthday.daysUntil)}
                          </span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs text-neutral-500">
                            {formatBirthDate(birthday.birthDate)}
                          </span>
                          {birthday.age && (
                            <>
                              <span className="text-xs text-neutral-400">•</span>
                              <span className="text-xs text-neutral-500">{birthday.age} anos</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {birthday.phone && (
                          <button
                            onClick={() => openWhatsApp(birthday.phone!, birthday.name)}
                            className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <RiWhatsappLine className="w-4 h-4" />
                          </button>
                        )}
                        {birthday.email && (
                          <a
                            href={`mailto:${birthday.email}?subject=Feliz Aniversário! 🎂&body=Olá ${birthday.name}! Feliz aniversário! Que seu dia seja repleto de alegrias!`}
                            className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                            title="Enviar email"
                          >
                            <RiMailLine className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BirthdayPanel;
