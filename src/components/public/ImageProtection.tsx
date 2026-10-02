"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Componente que protege imagens nas páginas públicas contra:
 * - Botão direito (salvar imagem como)
 * - Arrastar imagens
 * - PrintScreen (escurece a tela)
 * - F12 / Ctrl+Shift+I (DevTools)
 * - Ctrl+S (salvar página)
 * - Ctrl+U (ver código fonte)
 * 
 * Aplicado apenas em rotas públicas (não admin/corretor/fotografo/login)
 */
export function ImageProtection() {
  const pathname = usePathname();

  // Só aplica em páginas públicas
  const isPublicPage = !pathname.startsWith("/admin") && 
                        !pathname.startsWith("/corretor") && 
                        !pathname.startsWith("/fotografo") && 
                        !pathname.startsWith("/login");

  useEffect(() => {
    if (!isPublicPage) return;

    // Bloquear botão direito em imagens
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.closest("img")) {
        e.preventDefault();
      }
    };

    // Bloquear arrastar imagens
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
      }
    };

    // Bloquear atalhos de teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
      }
      // Ctrl+S (Save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
      }
      // PrintScreen - escurece a tela momentaneamente
      if (e.key === "PrintScreen") {
        document.body.style.filter = "brightness(0)";
        setTimeout(() => {
          document.body.style.filter = "";
        }, 1500);
      }
    };

    // Detectar perda de foco (PrintScreen em alguns navegadores)
    const handleVisibilityChange = () => {
      // Não faz nada drástico, só um leve delay
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Adicionar CSS de proteção via style tag
    const style = document.createElement("style");
    style.id = "image-protection-styles";
    style.textContent = `
      /* Proteção de imagens em páginas públicas */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto;
      }
      
      /* Overlay transparente sobre imagens de propriedade */
      .property-image-container {
        position: relative;
      }
      .property-image-container::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        pointer-events: auto;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      const existingStyle = document.getElementById("image-protection-styles");
      if (existingStyle) existingStyle.remove();
    };
  }, [isPublicPage]);

  if (!isPublicPage) return null;

  return null;
}
