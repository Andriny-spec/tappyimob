"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { RiCameraLine, RiCloseLine, RiDownloadLine, RiLockLine, RiSparklingLine } from "react-icons/ri";

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string | null;
  width?: number | null;
  height?: number | null;
}

// Same unlock key used by the QR code. Anyone who scans gets access.
const UNLOCK_KEY = "tappysummit2026";
const STORAGE_KEY = "tappy_galeria_unlocked";

const PAGE_SIZE = 15;

function TappyGaleriaContent() {
  const searchParams = useSearchParams();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Trava para evitar disparos paralelos do IntersectionObserver
  const fetchingRef = useRef(false);

  // Carrega uma página. Se reset=true, substitui tudo (refresh do topo).
  const loadPage = useCallback(async (offset: number, reset = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (reset) setLoading(true);
    try {
      const res = await fetch(
        `/api/tappy-galeria?offset=${offset}&limit=${PAGE_SIZE}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const newPhotos: GalleryPhoto[] = data.photos || [];
      setTotal(data.total || 0);
      setHasMore(Boolean(data.hasMore));
      setPhotos((prev) => {
        if (reset) return newPhotos;
        // Dedup por id (caso o poll/append concorram)
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...newPhotos.filter((p) => !seen.has(p.id))];
      });
    } catch (err) {
      console.error(err);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Primeira carga
  useEffect(() => {
    loadPage(0, true);
  }, [loadPage]);

  // Infinite scroll: observer no sentinela
  useEffect(() => {
    if (!unlocked) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !fetchingRef.current) {
          loadPage(photos.length);
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [unlocked, hasMore, photos.length, loadPage]);

  // Check unlock via ?unlock=key or previous session
  useEffect(() => {
    const key = searchParams.get("unlock");
    if (key === UNLOCK_KEY) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      return;
    }
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, [searchParams]);

  // QR code encodes an absolute URL with the unlock key
  const qrUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}/tappy-galeria`;
    return `${base}?unlock=${UNLOCK_KEY}`;
  }, []);

  return (
    <main className="relative min-h-screen bg-[#06142A] overflow-hidden">
      {/* Brand background — Tappy Summit dark blue */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06142A] via-[#132845] to-[#0B2545]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#25D366]/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#0B2545]/40 blur-[100px] animate-pulse" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Locked state: QR code front and center */}
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6"
          >
            {/* Event badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
            >
              <RiSparklingLine className="w-4 h-4 text-[#25D366]" />
              <span className="text-xs font-medium text-white uppercase tracking-[0.2em]">
                Tappy Summit 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white text-center mb-3 tracking-tight"
            >
              Galeria <span className="italic font-light">do evento</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-center max-w-md mb-10"
            >
              Aponte a câmera do seu celular para o QR Code abaixo para revelar todas as fotos
            </motion.p>

            {/* QR Code card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="relative"
            >
              <div className="relative bg-white p-6 md:p-8 rounded-3xl shadow-2xl">
                {qrUrl && (
                  <QRCodeSVG
                    value={qrUrl}
                    size={280}
                    level="H"
                    includeMargin={false}
                    fgColor="#0a0a0a"
                    bgColor="#ffffff"
                  />
                )}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-black/5 pointer-events-none" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/40"
              >
                <RiLockLine className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex items-center gap-3 text-white/50 text-sm"
            >
              <RiCameraLine className="w-5 h-5" />
              <span>
                {photos.length} foto{photos.length === 1 ? "" : "s"} te aguardam
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlocked state: real mosaic gallery */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 min-h-screen"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 backdrop-blur-lg bg-black/40 border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#25D366] flex items-center justify-center">
                    <RiCameraLine className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-white">Galeria Tappy Summit</h1>
                    <p className="text-xs text-white/60">
                      {photos.length} de {total} foto{total === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mosaic */}
            <div className="max-w-7xl mx-auto p-3 md:p-6">
              {loading && photos.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-white/50">
                  Carregando fotos...
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-20 text-white/60">
                  Ainda não há fotos publicadas.
                </div>
              ) : (
                <>
                  <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 [column-fill:_balance]">
                    {photos.map((photo, i) => (
                      <PhotoTile
                        key={photo.id}
                        photo={photo}
                        index={i}
                        onClick={() => setLightbox(photo)}
                      />
                    ))}
                  </div>

                  {/* Sentinela do infinite scroll */}
                  {hasMore && (
                    <div
                      ref={sentinelRef}
                      className="flex items-center justify-center py-10 text-white/50 text-sm gap-3"
                    >
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Carregando mais fotos...
                    </div>
                  )}

                  {!hasMore && photos.length > 0 && (
                    <div className="text-center py-10 text-white/40 text-xs uppercase tracking-widest">
                      • fim da galeria •
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Fechar"
            >
              <RiCloseLine className="w-6 h-6" />
            </button>
            <a
              href={lightbox.url}
              download
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 right-16 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              title="Baixar foto"
            >
              <RiDownloadLine className="w-5 h-5" />
            </a>
            <motion.img
              key={lightbox.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={lightbox.url}
              alt={lightbox.caption || "Foto"}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// =====================================================================
// PhotoTile — card individual com placeholder, fade-in e fallback de erro
// =====================================================================
function PhotoTile({
  photo,
  index,
  onClick,
}: {
  photo: GalleryPhoto;
  index: number;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Reserva espaço usando aspect-ratio se temos width/height; senão usa 4:5 médio
  const aspect =
    photo.width && photo.height
      ? `${photo.width} / ${photo.height}`
      : "4 / 5";

  // As primeiras 6 fotos carregam eager (above the fold), o resto lazy
  const isPriority = index < 6;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.6) }}
      onClick={onClick}
      className="block w-full mb-3 rounded-xl overflow-hidden bg-white/5 hover:ring-2 hover:ring-[#25D366]/60 transition-all break-inside-avoid relative"
      style={{ aspectRatio: aspect }}
    >
      {/* Skeleton enquanto carrega */}
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-white/[0.08] to-white/[0.04] animate-pulse" />
      )}

      {/* Erro */}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 text-xs gap-2 p-2 text-center">
          <RiCameraLine className="w-6 h-6" />
          <span>Falha ao carregar</span>
        </div>
      )}

      {!errored && (
        <Image
          src={photo.url}
          alt={photo.caption || "Foto"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          quality={70}
          priority={isPriority}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </motion.button>
  );
}

export const dynamic = "force-dynamic";

export default function TappyGaleriaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </main>
      }
    >
      <TappyGaleriaContent />
    </Suspense>
  );
}
