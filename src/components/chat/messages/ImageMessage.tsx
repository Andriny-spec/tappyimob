"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiDownloadLine, RiZoomInLine } from "react-icons/ri";

interface ImageMessageProps {
  mediaUrl: string;
  caption?: string;
  isFromMe?: boolean;
}

export default function ImageMessage({ mediaUrl, caption, isFromMe = false }: ImageMessageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imagem-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
    }
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center w-48 h-32 rounded-xl ${
        isFromMe ? "bg-white/10" : "bg-neutral-100 dark:bg-neutral-700"
      }`}>
        <span className={`text-sm ${isFromMe ? "text-white/70" : "text-neutral-500"}`}>
          Imagem indisponível
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="relative group max-w-[280px]">
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center rounded-xl ${
            isFromMe ? "bg-white/10" : "bg-neutral-100 dark:bg-neutral-700"
          }`}>
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={mediaUrl}
          alt="Imagem"
          className={`rounded-xl max-w-full cursor-pointer transition-opacity ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={() => setIsFullscreen(true)}
        />
        
        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors mr-2"
          >
            <RiZoomInLine className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <RiDownloadLine className="w-5 h-5" />
          </button>
        </div>
        
        {caption && (
          <p className={`mt-2 text-sm ${isFromMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
            {caption}
          </p>
        )}
      </div>

      {/* Modal Fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <RiCloseLine className="w-6 h-6" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="absolute top-4 right-16 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <RiDownloadLine className="w-6 h-6" />
            </button>
            
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={mediaUrl}
              alt="Imagem"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
