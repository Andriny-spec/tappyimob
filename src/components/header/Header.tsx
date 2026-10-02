"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsAppLeadModal } from "@/components/WhatsAppLeadModal";
import { RiMenuLine, RiCloseLine, RiHeartLine, RiAddLine, RiDeleteBinLine, RiHome4Line, RiBuilding2Line, RiInformationLine, RiPhoneLine, RiArticleLine, RiArrowRightLine, RiSparklingFill, RiRobot2Line, RiCalculatorLine, RiTeamLine, RiKeyLine, RiFileTextLine, RiPriceTag3Line, RiEyeOffLine, RiWhatsappLine, RiMailLine } from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useFavorites } from "@/contexts/FavoritesContext";
import { CONTATO } from "@/lib/contato";

const navLinks = [
  { label: "Início", href: "/", icon: RiHome4Line },
  { label: "Imóveis", href: "/imoveis", icon: RiBuilding2Line },
];

// Menu mobile completo
const mobileMenuLinks = [
  { label: "Quem somos", href: "/sobre", icon: RiTeamLine },
  { label: "Off Market", href: "/off-market", icon: RiEyeOffLine },
  { label: "Gestão Exclusiva", href: "/gestao-exclusiva", icon: RiKeyLine },
  { label: "Calculadora", href: "/calculadora", icon: RiCalculatorLine },
  { label: "Avalie seu Imóvel", href: "/vender", icon: RiPriceTag3Line },
  { label: "Corretor Parceiro", href: "/corretor-parceiro", icon: RiTeamLine },
  { label: "Blog", href: "/blog", icon: RiArticleLine },
  /*{ label: "Regularização Imobiliária", href: "/regularizacao", icon: RiFileTextLine },*/
  { label: "Contatos", href: "/contato", icon: RiPhoneLine },
];

// Formatar preço
const formatPrice = (price: number) => {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Componente Favoritos Dropdown
function FavoritosDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { favorites, removeFavorite } = useFavorites();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Favoritos"
        className="relative flex items-center justify-center w-10 h-10 rounded-full text-white hover:text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RiHeartLine className="w-5 h-5" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Favoritos</h3>
                <span className="text-sm text-neutral-500">{favorites.length} imóveis</span>
              </div>
            </div>

            {/* Lista de favoritos */}
            <div className="max-h-64 overflow-y-auto">
              {favorites.length > 0 ? (
                favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/imovel/${fav.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200 dark:bg-neutral-700">
                      {fav.thumbnail ? (
                        <Image src={fav.thumbnail} alt={fav.title} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <RiHome4Line className="w-6 h-6 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{fav.title}</p>
                      <p className="text-sm text-[#0B2545] dark:text-sky-400 font-semibold">{formatPrice(fav.price)}</p>
                    </div>
                    <button
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        removeFavorite(fav.id);
                      }}
                      aria-label="Remover dos favoritos"
                      className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center">
                  <RiHeartLine className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">Nenhum favorito ainda</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {favorites.length > 0 && (
              <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href="/favoritos"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-2 text-center text-sm font-medium text-[#0B2545] dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Ver todos os favoritos
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [whatsModal, setWhatsModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-2 bg-[#0B2545] shadow-lg shadow-black/20"
            : "py-4 bg-[#0B2545]"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left section - Logo */}
            <Link href="/" className="hidden lg:flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src="/logo.png"
                  alt="Tappy Imob"
                  width={200}
                  height={60}
                  className="h-14 w-auto object-contain brightness-0 invert"
                  priority
                />
              </motion.div>
            </Link>

            {/* Center section - Navigation */}
            <nav className="hidden lg:flex items-center justify-center gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="relative px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-4/5 transition-all duration-300 rounded-full" />
                </motion.a>
              ))}
              
              {/* Venda seu Imóvel */}
              <Link 
                href="/vender"
                className="relative px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors group flex items-center gap-1.5"
              >
                <RiAddLine className="w-4 h-4" />
                Venda seu Imóvel
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-4/5 transition-all duration-300 rounded-full" />
              </Link>
            </nav>

            {/* Logo Mobile - Centro */}
            <Link href="/" className="flex lg:hidden items-center">
              <Image
                src="/logo.png"
                alt="Tappy Imob"
                width={140}
                height={45}
                className="h-11 w-auto object-contain brightness-0 invert"
                priority
              />
            </Link>

            {/* Right section - Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Botão IA - Encontre seu Imóvel - DESATIVADO ATÉ CONFIGURAR
              <motion.button
                onClick={() => setShowAIModal(true)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:shadow-lg hover:shadow-sky-400/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiSparklingFill className="w-5 h-5" />
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.button> */}

              {/* WhatsApp */}
              <button type="button" onClick={() => setWhatsModal(true)} aria-label="Falar no WhatsApp">
                <motion.div
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RiWhatsappLine className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Calculadora Financeira */}
              <Link href="/calculadora" aria-label="Calculadora financeira">
                <motion.div
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RiCalculatorLine className="w-5 h-5" />
                </motion.div>
              </Link>

              {/* Favoritos Dropdown */}
              <FavoritosDropdown />

              {/* Theme & Language */}
              <LanguageSelector />
              <ThemeToggle />

              {/* Hamburger Menu Desktop */}
              <motion.button
                onClick={() => setIsFullMenuOpen(true)}
                aria-label="Abrir menu"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiMenuLine className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Mobile section */}
            <div className="flex lg:hidden items-center gap-2">
              {/* Botão IA Mobile - DESATIVADO ATÉ CONFIGURAR
              <motion.button
                onClick={() => setShowAIModal(true)}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RiSparklingFill className="w-4 h-4" />
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.button> */}

              {/* WhatsApp Mobile */}
              <button type="button" onClick={() => setWhatsModal(true)} aria-label="Falar no WhatsApp">
                <motion.div
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-green-500 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RiWhatsappLine className="w-4 h-4" />
                </motion.div>
              </button>

              {/* Calculadora Mobile */}
              <Link href="/calculadora" aria-label="Calculadora financeira">
                <motion.div
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RiCalculatorLine className="w-4 h-4" />
                </motion.div>
              </Link>

              {/* Favoritos mobile */}
              <FavoritosDropdown />

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <RiCloseLine className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <RiMenuLine className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[75%] max-w-[280px] bg-[#0B2545] z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <Image
                  src="/logo.png"
                  alt="Tappy Imob"
                  width={140}
                  height={45}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RiCloseLine className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-1">
                {mobileMenuLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </motion.a>
                ))}
              </nav>

              {/* Actions */}
              <div className="p-4 space-y-3 border-t border-white/10">
                {/* Theme & Language */}
                <div className="flex items-center justify-center gap-3 py-2">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
                <Link href="/favoritos" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full"
                  >
                    <RiHeartLine className="w-5 h-5" />
                    Meus Favoritos
                  </Button>
                </Link>
                <Link href="/vender" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    size="lg" 
                    className="w-full gap-2 bg-white text-[#0B2545] hover:bg-white/90 font-semibold rounded-full"
                  >
                    Venda seu Imóvel
                    <RiAddLine className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Menu Desktop */}
      <AnimatePresence>
        {isFullMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => setIsFullMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-[#0B2545] z-[101] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <Image
                  src="/logo.png"
                  alt="Tappy Imob"
                  width={140}
                  height={45}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
                <motion.button
                  onClick={() => setIsFullMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RiCloseLine className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Navigation */}
              <div className="p-6">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Menu</p>
                <nav className="space-y-1">
                  {mobileMenuLinks.map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setIsFullMenuOpen(false)}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <link.icon className="w-5 h-5 text-white/70 group-hover:text-white" />
                      <span className="font-medium text-white/80 group-hover:text-white">{link.label}</span>
                    </motion.a>
                  ))}
                </nav>
              </div>

              {/* CTA */}
              <div className="p-6 border-t border-white/10">
                <Link href="/vender" onClick={() => setIsFullMenuOpen(false)}>
                  <div className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <RiAddLine className="w-5 h-5 text-[#0B2545]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Venda seu Imóvel</p>
                        <p className="text-xs text-white/60">Anuncie gratuitamente</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Contato */}
              <div className="p-6 border-t border-white/10">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Contato</p>
                <div className="space-y-3">
                  <a href={CONTATO.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm">
                    <RiPhoneLine className="w-4 h-4" />
                    <span>WhatsApp {CONTATO.telefone}</span>
                  </a>
                  <a href="tel:+551141931779" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm">
                    <RiPhoneLine className="w-4 h-4" />
                    <span>Telefone (11) 4193-1779</span>
                  </a>
                  <a href="mailto:contato@tappyimob.com.br" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm">
                    <RiMailLine className="w-4 h-4" />
                    <span>contato@tappyimob.com.br</span>
                  </a>
                </div>
              </div>

              {/* Preferências */}
              <div className="p-6 border-t border-white/10">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Preferências</p>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <LanguageSelector />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal IA - Encontre seu Imóvel */}
      <AnimatePresence>
        {showAIModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowAIModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-to-br from-[#0B2545] to-[#0f172a] rounded-3xl shadow-2xl z-[100] p-8 border border-white/10"
            >
              {/* Ícone animado */}
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <RiRobot2Line className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white text-center mb-3">
                Encontre seu imóvel ideal
              </h2>
              <p className="text-white/60 text-center mb-8">
                Nossa IA vai te ajudar a encontrar o imóvel perfeito baseado nas suas preferências, renda e estilo de vida.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {[
                  "Recomendações personalizadas",
                  "Análise de compatibilidade",
                  "Mapa interativo de regiões",
                ].map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-sky-400/20 flex items-center justify-center">
                      <RiSparklingFill className="w-3 h-3 text-sky-400" />
                    </div>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <Link href="/encontre-seu-imovel" onClick={() => setShowAIModal(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sky-400/30 transition-all flex items-center justify-center gap-2"
                  >
                    <RiSparklingFill className="w-5 h-5" />
                    Começar agora
                  </motion.button>
                </Link>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="w-full py-3 text-white/50 hover:text-white text-sm transition-colors"
                >
                  Talvez depois
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[72px]" />

      <WhatsAppLeadModal
        aberto={whatsModal}
        onFechar={() => setWhatsModal(false)}
        telefone={CONTATO.whatsapp}
        mensagem="Olá, vim pelo site e gostaria de conversar com vocês."
        origem="Botão do topo do site"
      />
    </>
  );
}
