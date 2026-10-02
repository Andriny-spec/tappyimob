"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { RiCloseLine, RiLoader4Line } from "react-icons/ri";

interface PopupData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  buttonText: string;
  buttonLink: string | null;
  popupType: string;
  bgColor: string | null;
  textColor: string | null;
  overlayOpacity: number | null;
  position: string;
  size: string;
  triggerType: string;
  triggerValue: number;
  targetPages: string[];
  excludePages: string[];
  startDate: string | null;
  endDate: string | null;
  showFrequency: string;
  formFields: string[];
  formButtonText: string | null;
  clicksToShow: number;
  isActive: boolean;
  order: number;
}

const STORAGE_PREFIX = "imob_popup_";
const VIEWS_KEY = "imob_property_views";

function getStorageKey(popupId: string, type: string) {
  return `${STORAGE_PREFIX}${popupId}_${type}`;
}

function matchesPage(pathname: string, pattern: string): boolean {
  if (pattern === pathname) return true;
  if (pattern.endsWith("/*")) {
    const base = pattern.slice(0, -2);
    return pathname.startsWith(base);
  }
  return false;
}

function shouldShowByFrequency(popup: PopupData): boolean {
  const key = getStorageKey(popup.id, "shown");
  const lastShown = localStorage.getItem(key);
  if (!lastShown) return true;

  const ts = parseInt(lastShown);
  const now = Date.now();

  switch (popup.showFrequency) {
    case "ALWAYS":
      return true;
    case "ONCE_EVER":
      return false;
    case "ONCE_PER_DAY":
      return now - ts > 24 * 60 * 60 * 1000;
    case "ONCE_PER_SESSION":
    default:
      return false; // sessionStorage seria melhor, mas usamos flag na sessão
  }
}

function markAsShown(popupId: string) {
  localStorage.setItem(getStorageKey(popupId, "shown"), Date.now().toString());
  // Marcar na sessão também
  try { sessionStorage.setItem(getStorageKey(popupId, "session"), "1"); } catch {}
}

function wasShownThisSession(popupId: string): boolean {
  try { return sessionStorage.getItem(getStorageKey(popupId, "session")) === "1"; } catch { return false; }
}

export function PopupBanner() {
  const pathname = usePathname();
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [activePopup, setActivePopup] = useState<PopupData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSending, setFormSending] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const startTimeRef = useRef(Date.now());
  const triggeredRef = useRef<Set<string>>(new Set());

  // Detectar mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Buscar popups ativos
  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch("/api/site/popups");
        if (res.ok) {
          const data = await res.json();
          setPopups(data.popups || []);
        }
      } catch {}
    };
    fetchPopups();
  }, []);

  // Filtrar popups elegíveis para a página atual
  const getEligiblePopups = useCallback(() => {
    return popups.filter(popup => {
      // Já foi disparado nesta renderização?
      if (triggeredRef.current.has(popup.id)) return false;

      // Verificar páginas alvo
      if (popup.targetPages.length > 0) {
        const matches = popup.targetPages.some(p => matchesPage(pathname, p));
        if (!matches) return false;
      }

      // Verificar exclusões
      if (popup.excludePages.length > 0) {
        const excluded = popup.excludePages.some(p => matchesPage(pathname, p));
        if (excluded) return false;
      }

      // Verificar frequência
      if (popup.showFrequency === "ONCE_PER_SESSION" && wasShownThisSession(popup.id)) return false;
      if (popup.showFrequency === "ONCE_EVER" && !shouldShowByFrequency(popup)) return false;
      if (popup.showFrequency === "ONCE_PER_DAY" && !shouldShowByFrequency(popup)) return false;

      return true;
    });
  }, [popups, pathname]);

  // Trigger: PAGE_LOAD
  useEffect(() => {
    if (popups.length === 0) return;
    const eligible = getEligiblePopups().filter(p => p.triggerType === "PAGE_LOAD");
    if (eligible.length > 0) {
      const popup = eligible[0];
      const delay = popup.triggerValue > 0 ? popup.triggerValue * 1000 : 500;
      const timer = setTimeout(() => {
        triggeredRef.current.add(popup.id);
        setActivePopup(popup);
        setShowPopup(true);
        markAsShown(popup.id);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [popups, pathname, getEligiblePopups]);

  // Trigger: TIME_ON_SITE
  useEffect(() => {
    if (popups.length === 0) return;
    const eligible = getEligiblePopups().filter(p => p.triggerType === "TIME_ON_SITE" && p.triggerValue > 0);
    if (eligible.length === 0) return;

    const popup = eligible[0];
    const timer = setTimeout(() => {
      if (!showPopup) {
        triggeredRef.current.add(popup.id);
        setActivePopup(popup);
        setShowPopup(true);
        markAsShown(popup.id);
      }
    }, popup.triggerValue * 1000);

    return () => clearTimeout(timer);
  }, [popups, pathname, getEligiblePopups, showPopup]);

  // Trigger: SCROLL_DEPTH
  useEffect(() => {
    if (popups.length === 0) return;
    const eligible = getEligiblePopups().filter(p => p.triggerType === "SCROLL_DEPTH" && p.triggerValue > 0);
    if (eligible.length === 0) return;

    const popup = eligible[0];
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= popup.triggerValue && !showPopup && !triggeredRef.current.has(popup.id)) {
        triggeredRef.current.add(popup.id);
        setActivePopup(popup);
        setShowPopup(true);
        markAsShown(popup.id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [popups, pathname, getEligiblePopups, showPopup]);

  // Trigger: EXIT_INTENT (mouse sai da janela)
  useEffect(() => {
    if (popups.length === 0) return;
    const eligible = getEligiblePopups().filter(p => p.triggerType === "EXIT_INTENT");
    if (eligible.length === 0) return;

    const popup = eligible[0];
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showPopup && !triggeredRef.current.has(popup.id)) {
        triggeredRef.current.add(popup.id);
        setActivePopup(popup);
        setShowPopup(true);
        markAsShown(popup.id);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [popups, pathname, getEligiblePopups, showPopup]);

  // Trigger: VIEWS_COUNT (cliques em imóveis)
  useEffect(() => {
    if (popups.length === 0) return;
    const eligible = getEligiblePopups().filter(p => p.triggerType === "VIEWS_COUNT" && p.triggerValue > 0);
    if (eligible.length === 0) return;

    const popup = eligible[0];
    const handlePropertyClick = () => {
      const current = parseInt(localStorage.getItem(VIEWS_KEY) || "0");
      const newCount = current + 1;
      localStorage.setItem(VIEWS_KEY, newCount.toString());
      if (newCount >= popup.triggerValue && newCount % popup.triggerValue === 0 && !showPopup) {
        triggeredRef.current.add(popup.id);
        setActivePopup(popup);
        setShowPopup(true);
        markAsShown(popup.id);
      }
    };

    window.addEventListener("propertyClick", handlePropertyClick);
    return () => window.removeEventListener("propertyClick", handlePropertyClick);
  }, [popups, pathname, getEligiblePopups, showPopup]);

  // Legacy: clicksToShow (compatibilidade)
  useEffect(() => {
    if (popups.length === 0) return;
    const eligible = getEligiblePopups().filter(p => p.clicksToShow > 0 && p.triggerType === "PAGE_LOAD");
    if (eligible.length === 0) return;

    const popup = eligible[0];
    const handlePropertyClick = () => {
      const current = parseInt(localStorage.getItem(VIEWS_KEY) || "0");
      const newCount = current + 1;
      localStorage.setItem(VIEWS_KEY, newCount.toString());
      if (newCount > 0 && newCount % popup.clicksToShow === 0 && !showPopup) {
        setActivePopup(popup);
        setShowPopup(true);
        markAsShown(popup.id);
      }
    };

    window.addEventListener("propertyClick", handlePropertyClick);
    return () => window.removeEventListener("propertyClick", handlePropertyClick);
  }, [popups, pathname, getEligiblePopups, showPopup]);

  const handleClose = () => {
    setShowPopup(false);
    setActivePopup(null);
    setFormData({});
    setFormSent(false);
  };

  const handleFormSubmit = async () => {
    if (!activePopup) return;
    setFormSending(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nome || "Visitante",
          email: formData.email || null,
          phone: formData.telefone || null,
          message: `Pop-up: ${activePopup.title}${formData.mensagem ? `\n${formData.mensagem}` : ""}`,
          source: "POPUP",
          tags: ["POPUP_FORM"],
        }),
      });
      setFormSent(true);
    } catch {}
    setFormSending(false);
  };

  if (!activePopup || !showPopup) return null;

  const imgUrl = isMobile && activePopup.imageUrlMobile ? activePopup.imageUrlMobile : activePopup.imageUrl;
  const sizeClass = {
    SMALL: "max-w-sm",
    MEDIUM: "max-w-md",
    LARGE: "max-w-lg",
    FULLSCREEN: "max-w-2xl w-[95%]",
  }[activePopup.size] || "max-w-md";

  const positionClass = {
    CENTER: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    TOP: "top-4 left-1/2 -translate-x-1/2",
    BOTTOM: "bottom-4 left-1/2 -translate-x-1/2",
  }[activePopup.position] || "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: `rgba(0,0,0,${activePopup.overlayOpacity ?? 0.5})` }}
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-[101] w-[90%] ${sizeClass} ${positionClass}`}
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: activePopup.bgColor || "#0B2545" }}>
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>

              {/* IMAGE_ONLY: apenas imagem clicável */}
              {activePopup.popupType === "IMAGE_ONLY" && imgUrl && (
                activePopup.buttonLink ? (
                  <Link href={activePopup.buttonLink} onClick={handleClose}>
                    <img src={imgUrl} alt={activePopup.title} className="w-full h-auto" />
                  </Link>
                ) : (
                  <img src={imgUrl} alt={activePopup.title} className="w-full h-auto" />
                )
              )}

              {/* BANNER: imagem + conteúdo */}
              {activePopup.popupType === "BANNER" && (
                <>
                  {imgUrl && (
                    <div className="relative w-full h-48 sm:h-56">
                      <Image src={imgUrl} alt={activePopup.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div className={`p-6 ${imgUrl ? "-mt-12 relative" : ""}`} style={{ color: activePopup.textColor || "#fff" }}>
                    <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${imgUrl ? "text-white" : ""}`}>
                      {activePopup.title}
                    </h2>
                    {activePopup.description && (
                      <p className="text-sm sm:text-base mb-5 opacity-80">{activePopup.description}</p>
                    )}
                    <div className="flex gap-3">
                      {activePopup.buttonLink ? (
                        <Link
                          href={activePopup.buttonLink}
                          onClick={handleClose}
                          className="flex-1 py-3 px-6 rounded-xl bg-white/20 hover:bg-white/30 font-semibold text-center transition-colors"
                        >
                          {activePopup.buttonText}
                        </Link>
                      ) : (
                        <button onClick={handleClose} className="flex-1 py-3 px-6 rounded-xl bg-white/20 hover:bg-white/30 font-semibold transition-colors">
                          {activePopup.buttonText}
                        </button>
                      )}
                      <button onClick={handleClose} className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 font-medium transition-colors">
                        Fechar
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* FORM: formulário de captura */}
              {activePopup.popupType === "FORM" && (
                <div className="p-6" style={{ color: activePopup.textColor || "#fff" }}>
                  {imgUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
                      <Image src={imgUrl} alt={activePopup.title} fill className="object-cover" />
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">{activePopup.title}</h2>
                  {activePopup.description && (
                    <p className="text-sm opacity-80 mb-4">{activePopup.description}</p>
                  )}

                  {formSent ? (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <RiCloseLine className="w-7 h-7 text-green-400 rotate-45" />
                      </div>
                      <p className="font-semibold text-lg mb-1">Enviado!</p>
                      <p className="text-sm opacity-70">Entraremos em contato em breve.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {(activePopup.formFields || []).map(field => (
                          <input
                            key={field}
                            type={field === "email" ? "email" : field === "telefone" ? "tel" : "text"}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={formData[field] || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder:text-white/50 focus:border-white/50 outline-none text-sm"
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleFormSubmit}
                        disabled={formSending}
                        className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {formSending && <RiLoader4Line className="w-4 h-4 animate-spin" />}
                        {formSending ? "Enviando..." : (activePopup.formButtonText || "Enviar")}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
