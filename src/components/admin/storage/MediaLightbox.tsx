"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiFullscreenLine,
  RiPlayLine,
} from "react-icons/ri";
import { StorageFile } from "./types";
import { formatBytes } from "./utils";

interface MediaLightboxProps {
  files: StorageFile[];
  initialIndex: number;
  onClose: () => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MediaLightbox({
  files,
  initialIndex,
  onClose,
  onDownload,
  onDelete,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const mediaFiles = files.filter(
    (f) => f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/")
  );

  const currentFile = mediaFiles[currentIndex];
  const isVideo = currentFile?.mimeType.startsWith("video/");
  const total = mediaFiles.length;

  const goNext = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.5, 5));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.5, 0.5));
      if (e.key === "0") { setZoom(1); setPosition({ x: 0, y: 0 }); }
    },
    [onClose, goNext, goPrev]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + 0.25, 5));
    } else {
      setZoom((z) => {
        const newZoom = Math.max(z - 0.25, 0.5);
        if (newZoom <= 1) setPosition({ x: 0, y: 0 });
        return newZoom;
      });
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: posStart.current.x + (e.clientX - dragStart.current.x),
      y: posStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!currentFile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm font-medium">
            {currentIndex + 1} / {total}
          </span>
          <span className="text-white/50 text-sm">•</span>
          <span className="text-white text-sm font-medium truncate max-w-[300px]">
            {currentFile.name}
          </span>
          <span className="text-white/50 text-sm">
            {formatBytes(currentFile.size)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isVideo && (
            <>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Zoom in (+)"
              >
                <RiZoomInLine className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setZoom((z) => Math.max(z - 0.5, 0.5)); if (zoom <= 1.5) setPosition({ x: 0, y: 0 }); }}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Zoom out (-)"
              >
                <RiZoomOutLine className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Resetar zoom (0)"
              >
                <RiFullscreenLine className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />
            </>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(currentFile.id)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Download"
            >
              <RiDownloadLine className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Excluir "${currentFile.name}"?`)) {
                  onDelete(currentFile.id);
                  if (total <= 1) {
                    onClose();
                  } else if (currentIndex >= total - 1) {
                    setCurrentIndex(currentIndex - 1);
                  }
                }
              }}
              className="p-2 rounded-lg text-white/70 hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Excluir"
            >
              <RiDeleteBinLine className="w-5 h-5" />
            </button>
          )}
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar (Esc)"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden select-none"
        onWheel={!isVideo ? handleWheel : undefined}
        onMouseDown={!isVideo ? handleMouseDown : undefined}
        onMouseMove={!isVideo ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : zoom > 1 ? "grab" : "default" }}
      >
        {/* Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm transition-all hover:scale-110"
            >
              <RiArrowLeftSLine className="w-7 h-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm transition-all hover:scale-110"
            >
              <RiArrowRightSLine className="w-7 h-7" />
            </button>
          </>
        )}

        {/* Media */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFile.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90vw] max-h-[80vh] flex items-center justify-center"
          >
            {isVideo ? (
              <video
                src={`/api/storage/${currentFile.key}`}
                controls
                autoPlay
                className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl"
              >
                Seu navegador não suporta vídeos.
              </video>
            ) : (
              <img
                src={`/api/storage/${currentFile.key}`}
                alt={currentFile.name}
                className="max-h-[80vh] rounded-lg shadow-2xl transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                }}
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnail Strip */}
      {total > 1 && (
        <div className="px-4 py-3 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 justify-center overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-white/20">
            {mediaFiles.map((file, idx) => {
              const isVid = file.mimeType.startsWith("video/");
              return (
                <button
                  key={file.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex
                      ? "border-blue-500 ring-2 ring-blue-500/30 scale-110"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {isVid ? (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <RiPlayLine className="w-5 h-5 text-white/80" />
                    </div>
                  ) : (
                    <img
                      src={`/api/storage/${file.key}`}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
