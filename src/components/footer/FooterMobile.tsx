"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  RiHome4Line,
  RiSearchLine,
  RiHeartLine,
  RiUser3Line,
  RiInstagramLine,
  RiWhatsappLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
} from "react-icons/ri";
import { CONTATO } from "@/lib/contato";

const mobileNavItems = [
  { icon: RiHome4Line, label: "Início", href: "/" },
  { icon: RiSearchLine, label: "Buscar", href: "/imoveis" },
  { icon: RiHeartLine, label: "Favoritos", href: "/favoritos" },
  { icon: RiUser3Line, label: "Perfil", href: "/perfil" },
];

const footerLinks = [
  { label: "Quem somos", href: "/sobre" },
  { label: "Corretor Parceiro", href: "/corretor-parceiro" },
  { label: "Gestão Exclusiva", href: "/gestao-exclusiva" },
  { label: "Blog", href: "/blog" },
  { label: "Regularização", href: "/regularizacao" },
  { label: "Avalie seu Imóvel", href: "/vender" },
  { label: "Calculadora", href: "/calculadora" },
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
];

export function FooterMobile() {
  const [activeItem, setActiveItem] = useState("/");
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Footer institucional mobile */}
      <footer className="bg-neutral-900 text-white pb-20 md:hidden">
        <div className="container mx-auto px-4 py-6">
          {/* Logo e descrição */}
          <div className="text-center mb-4">
            <Link href="/" className="inline-block mb-2">
              <Image
                src="/logo.png"
                alt="Tappy Imob"
                width={100}
                height={35}
                className="h-7 w-auto object-contain brightness-0 invert mx-auto"
              />
            </Link>
            <p className="text-[10px] text-neutral-300 max-w-[280px] mx-auto mb-1">
              Planejamento Urbano e Imobiliário LTDA
            </p>
            <p className="text-[9px] text-neutral-400 max-w-[280px] mx-auto">
              CNPJ: 34.469.865/0001-13 | CRECI-J: 35438-J
            </p>
          </div>

          {/* Social */}
          <div className="flex justify-center gap-2 mb-4">
            <a
              href="https://www.instagram.com/tappyimob/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-neutral-900 transition-colors"
            >
              <RiInstagramLine className="w-4 h-4" />
            </a>
            <a
              href={CONTATO.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
            >
              <RiWhatsappLine className="w-4 h-4" />
            </a>
          </div>

          {/* Botão Expandir */}
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Menos informações" : "Mais informações"}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-neutral-300 hover:text-white transition-colors"
          >
            {expanded ? (
              <>
                <span>Menos informações</span>
                <RiArrowUpSLine className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Mais informações</span>
                <RiArrowDownSLine className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Conteúdo expandido */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-neutral-800 mt-2">
                  {/* Contato */}
                  <div className="mb-4">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 text-center">Contato</p>
                    <div className="flex flex-col items-center gap-2 text-xs text-neutral-300">
                      <a href={CONTATO.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                        <RiWhatsappLine className="w-3 h-3" />
                        WhatsApp {CONTATO.telefone}
                      </a>
                      <a href="tel:+551141931779" className="flex items-center gap-2 hover:text-white">
                        <RiPhoneLine className="w-3 h-3" />
                        Telefone (11) 4193-1779
                      </a>
                      <a href="mailto:comercial@tappyimob.com.br" className="flex items-center gap-2 hover:text-white">
                        <RiMailLine className="w-3 h-3" />
                        comercial@tappyimob.com.br
                      </a>
                      <span className="flex items-center gap-2 text-center text-[10px]">
                        <RiMapPinLine className="w-3 h-3 flex-shrink-0" />
                        Av. Sagitário, 138 - Sala 913 - Torre City - Barueri/SP
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mb-4">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 text-center">Links</p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-neutral-300">
                      {footerLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-white">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copyright */}
          <p className="text-center text-[9px] text-neutral-600 mt-3">
            © {new Date().getFullYear()} Tappy Imob - CRECI-J: 35438-J
          </p>
        </div>
      </footer>

      {/* Nav bar fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="absolute inset-0 bg-neutral-900" />

        <div className="relative flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {mobileNavItems.map((item) => {
            const isActive = activeItem === item.href;

            return (
              <Link key={item.label} href={item.href}>
                <motion.button
                  onClick={() => setActiveItem(item.href)}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-0.5 px-4 py-1"
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-white" : "text-neutral-400"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
