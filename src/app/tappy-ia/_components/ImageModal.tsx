"use client";

import { motion } from "framer-motion";
import { RiCloseLine, RiDownloadLine, RiSparklingLine } from "react-icons/ri";

interface Props {
  image: { dataUrl: string; prompt: string; size: string };
  onClose: () => void;
}

export function ImageModal({ image, onClose }: Props) {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = image.dataUrl;
    a.download = `tappy-ia-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-gradient-to-br from-[#0f1a2e] to-[#0a1424] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <RiSparklingLine className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-white/90">Arte gerada</span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 ml-2">
              gpt-image-2
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="p-6 flex items-center justify-center bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.dataUrl}
            alt={image.prompt}
            className="max-w-full max-h-[65vh] rounded-xl shadow-xl"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between gap-4">
          <p className="text-xs text-white/40 line-clamp-2 flex-1 italic">
            &ldquo;{image.prompt}&rdquo;
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-[#25D366] text-white text-sm font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-[1.03] flex-shrink-0"
          >
            <RiDownloadLine className="w-4 h-4" />
            Baixar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
