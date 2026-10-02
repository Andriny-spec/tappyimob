"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiPlayCircleFill, RiCloseLine, RiDownloadLine, RiFullscreenLine } from "react-icons/ri";

interface VideoMessageProps {
  mediaUrl: string;
  caption?: string;
  thumbnail?: string;
  isFromMe?: boolean;
}

export default function VideoMessage({ mediaUrl, caption, thumbnail, isFromMe = false }: VideoMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    videoRef.current?.play();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar vídeo:", error);
    }
  };

  return (
    <>
      <div className="relative group max-w-[280px]">
        {!isPlaying ? (
          <div 
            className="relative cursor-pointer"
            onClick={handlePlay}
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt="Thumbnail"
                className="rounded-xl max-w-full"
              />
            ) : (
              <div className={`w-48 h-32 rounded-xl flex items-center justify-center ${
                isFromMe ? "bg-white/10" : "bg-neutral-100 dark:bg-neutral-700"
              }`}>
                <span className={`text-sm ${isFromMe ? "text-white/70" : "text-neutral-500"}`}>
                  Vídeo
                </span>
              </div>
            )}
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/50 flex items-center justify-center">
                <RiPlayCircleFill className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                isFromMe ? "bg-white/10" : "bg-neutral-100 dark:bg-neutral-700"
              }`}>
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            <video
              ref={videoRef}
              src={mediaUrl}
              className="rounded-xl max-w-full"
              controls
              autoPlay
              onLoadedData={() => setIsLoading(false)}
            />
            
            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <RiFullscreenLine className="w-4 h-4" />
            </button>
          </div>
        )}
        
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
            
            <motion.video
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={mediaUrl}
              className="max-w-full max-h-full rounded-lg"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
