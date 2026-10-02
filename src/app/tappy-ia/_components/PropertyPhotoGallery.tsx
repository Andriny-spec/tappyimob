"use client";

import { motion } from "framer-motion";
import { RiImageLine, RiCursorLine } from "react-icons/ri";

interface Props {
  propertyTitle: string;
  propertyCode: string;
  images: string[];
  onSelectPhoto: (url: string, label: string) => void;
}

export function PropertyPhotoGallery({ propertyTitle, propertyCode, images, onSelectPhoto }: Props) {
  if (images.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/50 text-xs">
        <RiImageLine className="w-4 h-4" />
        Nenhuma foto cadastrada para este imóvel.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-white/40 uppercase tracking-widest">
        {images.length} foto{images.length !== 1 ? "s" : ""} · {propertyCode}
      </p>
      <div className="grid grid-cols-3 gap-1.5 max-w-sm">
        {images.map((url, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelectPhoto(url, `${propertyCode} - foto ${i + 1}`)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-orange-400/60 transition-all"
            title="Clique para usar esta foto"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/90 text-white text-[10px] font-medium">
                <RiCursorLine className="w-3 h-3" />
                Usar
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="text-[10px] text-white/30">Clique em uma foto para editá-la</p>
    </div>
  );
}
