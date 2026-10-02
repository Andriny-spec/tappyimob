"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WhatsAppLeadModal } from "@/components/WhatsAppLeadModal";
import { RiWhatsappLine } from "react-icons/ri";
import { CONTATO } from "@/lib/contato";

interface FloatingWhatsAppProps {
  message?: string;
  propertyId?: string;
}

export function FloatingWhatsApp({ message, propertyId }: FloatingWhatsAppProps) {
  const [whatsModal, setWhatsModal] = useState(false);
  const defaultMessage = "Olá, vim pelo site e gostaria de conversar com vocês.";
  const whatsappNumber = CONTATO.whatsapp;
  
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setWhatsModal(true);
    // Registrar contato via WhatsApp (atualiza updatedAt do imóvel)
    if (propertyId) {
      fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, event: "whatsapp_contact" }),
      }).catch(() => {});
    }
  };

  return (
    <>
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-40 sm:bottom-8 sm:right-6 md:bottom-8 md:right-8"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        <div className="flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors">
          <RiWhatsappLine className="w-5 h-5 md:w-7 md:h-7" />
        </div>
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
      </div>
    </motion.a>

    <WhatsAppLeadModal
      aberto={whatsModal}
      onFechar={() => setWhatsModal(false)}
      telefone={whatsappNumber}
      mensagem={message || defaultMessage}
      origem="Botão flutuante do site"
      propertyId={propertyId}
    />
    </>
  );
}
