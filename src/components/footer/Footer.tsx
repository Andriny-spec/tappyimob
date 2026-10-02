"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTwitterXLine,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiYoutubeLine,
  RiArrowRightLine,
  RiCloseLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { CONTATO } from "@/lib/contato";

const footerLinks = {
  imoveis: [
    { label: "Apartamentos", href: "/imoveis?tipo=apartamento" },
    { label: "Casas", href: "/imoveis?tipo=casa" },
    { label: "Comerciais", href: "/imoveis?tipo=comercial" },
    { label: "Terrenos", href: "/imoveis?tipo=terreno" },
  ],
  empresa: [
    { label: "Sobre", href: "/sobre" },
    { label: "Blog", href: "/blog" },
    { label: "Contato", href: "/contato" },
  ],
  suporte: [
    { label: "Ajuda", href: "/ajuda" },
    { label: "Privacidade", href: "/politicas-de-privacidade" },
    { label: "Termos", href: "/termos" },
  ],
};

const socialLinks = [
  { icon: RiInstagramLine, href: "https://www.instagram.com/tappyimob/", label: "Instagram" },
  { icon: RiFacebookCircleLine, href: "https://www.facebook.com/tappyimob-861827897530376/", label: "Facebook" },
  { icon: RiYoutubeLine, href: "https://www.youtube.com/channel/UCu27SUsjT6HPnpqmIA3o4ew", label: "YouTube" },
  { icon: RiTwitterXLine, href: "https://twitter.com/TappyImovel", label: "Twitter" },
];


interface FooterProps {
  variant?: "default" | "light";
  showNewsletter?: boolean;
}

export function Footer({ variant = "default", showNewsletter = true }: FooterProps) {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubscribing) return;
    setSubscribeError("");
    setIsSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      if (res.ok) {
        setShowModal(true);
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setSubscribeError(data.error || "Erro ao processar inscrição. Tente novamente.");
      }
    } catch {
      setSubscribeError("Erro ao processar inscrição. Tente novamente.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const isLight = variant === "light";

  return (
    <footer className={`hidden md:block ${isLight ? "bg-white text-neutral-900 border-t border-neutral-200" : "bg-neutral-900 text-white"}`}>
      {/* Newsletter CTA - Compact */}
      {showNewsletter && (
        <div className={`border-b ${isLight ? "border-neutral-200" : "border-white/10"}`}>
          <div className="container mx-auto px-4 lg:px-8 py-5">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Fique por dentro do{" "}
                <span className="text-[#25D366]">mercado imobiliário</span>
              </h2>
              <p className={`text-sm mb-6 ${isLight ? "text-neutral-600" : "text-white/70"}`}>
                Receba as melhores oportunidades de imóveis de alto padrão no seu e-mail.
              </p>

              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <RiMailLine className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? "text-neutral-400" : "text-white/40"}`} />
                    <Input
                      type="email"
                      required
                      placeholder="Seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-11 pl-10 text-sm ${isLight ? "bg-neutral-100 border-neutral-300 text-neutral-900 placeholder:text-neutral-400" : "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white focus:ring-white"}`}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubscribing}
                    className={`font-medium text-sm px-5 rounded-lg disabled:opacity-60 ${isLight ? "bg-[#25D366] text-white hover:bg-[#1DA851]" : "bg-[#25D366] text-white hover:bg-[#5EE08E]"}`}
                  >
                    {isSubscribing ? "Enviando..." : "Inscrever"}
                    {!isSubscribing && <RiArrowRightLine className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
                {subscribeError && (
                  <p className="mt-2 text-xs text-red-400">{subscribeError}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={isLight ? "/logodark.png" : "/logo.png"}
                alt="Tappy Imob"
                width={150}
                height={48}
                className="h-11 w-auto object-contain"
              />
            </Link>

            <p className={`text-xs mb-2 max-w-xs leading-relaxed ${isLight ? "text-neutral-600" : "text-white/70"}`}>
              Tappy Imob, Planejamento Urbano e Imobiliário LTDA
            </p>
            <p className={`text-xs mb-4 max-w-xs leading-relaxed ${isLight ? "text-neutral-500" : "text-white/60"}`}>
              CNPJ: 34.469.865/0001-13 | CRECI-J: 35438-J
            </p>

            {/* Contact - compact */}
            <div className={`flex flex-col gap-2 text-xs mb-4 ${isLight ? "text-neutral-600" : "text-white/70"}`}>
              <a href="mailto:comercial@tappyimob.com.br" className={`flex items-center gap-1.5 transition-colors ${isLight ? "hover:text-neutral-900" : "hover:text-white"}`}>
                <RiMailLine className="w-3.5 h-3.5 flex-shrink-0" />
                comercial@tappyimob.com.br
              </a>
              <a href={CONTATO.whatsappLink} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 transition-colors ${isLight ? "hover:text-neutral-900" : "hover:text-white"}`}>
                <RiPhoneLine className="w-3.5 h-3.5 flex-shrink-0" />
                WhatsApp (11) 
                
              </a>
              <a href="tel:+551141931779" className={`flex items-center gap-1.5 transition-colors ${isLight ? "hover:text-neutral-900" : "hover:text-white"}`}>
                <RiPhoneLine className="w-3.5 h-3.5 flex-shrink-0" />
                Telefone (11) 4193-1779
              </a>
            </div>

            {/* Social - smaller */}
            <div className="flex items-center gap-1.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isLight ? "bg-neutral-100 text-neutral-500 hover:bg-[#0B2545] hover:text-white" : "bg-white/10 text-white/50 hover:bg-white hover:text-[#0B2545]"}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links - compact */}
          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? "text-neutral-700" : "text-white/80"}`}>Imóveis</h4>
            <ul className="space-y-2">
              {footerLinks.imoveis.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={`text-xs transition-colors underline-offset-2 ${isLight ? "text-neutral-600 hover:text-neutral-900" : "text-white/70 hover:text-white"}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? "text-neutral-700" : "text-white/80"}`}>Empresa</h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={`text-xs transition-colors underline-offset-2 ${isLight ? "text-neutral-600 hover:text-neutral-900" : "text-white/70 hover:text-white"}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? "text-neutral-700" : "text-white/80"}`}>Suporte</h4>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={`text-xs transition-colors underline-offset-2 ${isLight ? "text-neutral-600 hover:text-neutral-900" : "text-white/70 hover:text-white"}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar - minimal */}
      <div className={`border-t ${isLight ? "border-neutral-200" : "border-white/10"}`}>
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] ${isLight ? "text-neutral-500" : "text-white/60"}`}>
            <span>© {new Date().getFullYear()} Tappy Imob - CNPJ: 34.469.865/0001-13 - CRECI-J: 35438-J</span>
            <div className="flex items-center gap-1">
              <RiMapPinLine className="w-3 h-3 flex-shrink-0" />
              <span>Av. Sagitário, 138 - Sala 913 - Torre City, Sua Cidade Conde II - Barueri/SP - CEP 06473-073</span>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de agradecimento */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl p-6 text-center shadow-2xl"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <RiCloseLine className="w-5 h-5 text-neutral-500" />
            </button>

            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <RiCheckboxCircleLine className="w-6 h-6 text-green-600" />
            </div>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Inscrição confirmada!
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Em breve você receberá as melhores oportunidades.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-[#0B2545] text-white text-sm font-medium rounded-lg hover:bg-[#081733] transition-colors"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </footer>
  );
}
