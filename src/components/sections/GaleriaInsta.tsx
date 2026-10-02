"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { RiInstagramLine } from "react-icons/ri";

export interface InstagramPost {
  id: string;
  postId: string;
  shortCode: string | null;
  type: string;
  url: string;
  displayUrl: string;
  videoUrl: string | null;
  caption: string | null;
  likesCount: number;
  commentsCount: number;
}

// Fallback images caso não tenha posts no banco
const fallbackImages = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    alt: "Casa moderna em Sua Cidade",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    alt: "Piscina de luxo",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    alt: "Sala de estar elegante",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
    alt: "Fachada contemporânea",
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80",
    alt: "Cozinha gourmet",
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80",
    alt: "Suite master",
  },
];

export function GaleriaInsta({ initialPosts }: { initialPosts?: InstagramPost[] } = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts?.length);

  // Buscar posts do banco (só se não recebeu dados pré-carregados do server)
  useEffect(() => {
    if (initialPosts?.length) {
      setLoading(false);
      return;
    }
    async function fetchPosts() {
      try {
        const response = await fetch("/api/instagram/posts?limit=12");
        if (response.ok) {
          const data = await response.json();
          console.log("Instagram posts response:", data);
          if (data && data.length > 0) {
            setPosts(data);
            console.log(`Carregados ${data.length} posts do Instagram`);
          } else {
            console.log("Nenhum post encontrado, usando fallback");
          }
        } else {
          console.error("Erro na resposta da API:", response.status);
        }
      } catch (error) {
        console.error("Erro ao buscar posts do Instagram:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Auto scroll lento
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let scrollPos = 0;

    const scroll = () => {
      if (!isHovered && container) {
        scrollPos += 0.5; // Velocidade lenta
        
        // Reset quando chega no meio (loop infinito)
        if (scrollPos >= container.scrollWidth / 2) {
          scrollPos = 0;
        }
        
        container.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isHovered]);

  // Preparar imagens para exibição (posts reais ou fallback)
  const displayImages = posts.length > 0
    ? posts.map((post) => ({
        id: post.id,
        src: post.displayUrl,
        alt: post.caption?.substring(0, 50) || "Post do Instagram @tappyimob",
        url: post.url,
      }))
    : fallbackImages.map((img) => ({ ...img, url: "https://www.instagram.com/tappyimob/" }));

  // Duplicar imagens para loop infinito
  const allImages = [...displayImages, ...displayImages];

  return (
    <section className="pt-4 md:pt-6 pb-4 md:pb-8 bg-neutral-50 dark:bg-neutral-900 overflow-hidden relative">
      {/* Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#25D366]/5 border border-[#25D366]/15">
            <div className="w-1.5 h-7 rounded-full bg-[#25D366]" />
            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center">
              <RiInstagramLine className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#25D366] dark:text-white uppercase tracking-wide">
              @TAPPYIMOB
            </h2>
            <span className="px-2.5 py-0.5 bg-[#25D366] text-white text-[10px] font-bold uppercase rounded-full">Instagram</span>
          </div>
          <Link
            href="https://www.instagram.com/tappyimob/"
            target="_blank"
            className="px-4 py-2 text-sm font-medium text-white bg-[#25D366] rounded-lg hover:bg-[#1DA851] transition-colors"
          >
            Seguir
          </Link>
        </div>
      </div>

      {/* Carrossel — contido na largura do container (mesma largura de header/footer) */}
      <div className="container mx-auto px-4 lg:px-8 relative">
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-2 overflow-x-hidden"
          style={{ scrollBehavior: "auto" }}
        >
          {allImages.map((image, index) => (
            <Link
              key={`${image.id}-${index}`}
              href={image.url}
              target="_blank"
              className="flex-shrink-0"
            >
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Card estilo Instagram */}
                <div className="w-[160px] h-[200px] md:w-[180px] md:h-[220px] relative rounded-lg overflow-hidden shadow-md bg-neutral-200 dark:bg-neutral-800">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="180px"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />

                  {/* Overlay no hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RiInstagramLine className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Gradient fades nas bordas */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 lg:w-24 bg-gradient-to-r from-neutral-50 dark:from-neutral-900 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 lg:w-24 bg-gradient-to-l from-neutral-50 dark:from-neutral-900 to-transparent" />
      </div>
    </section>
  );
}
