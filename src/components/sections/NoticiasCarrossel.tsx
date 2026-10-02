"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiTimeLine,
  RiEyeLine,
} from "react-icons/ri";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  content: string;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  category: { id: string; name: string; slug: string; color: string } | null;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 86400) return "Hoje";
  if (diff < 172800) return "1 dia atrás";
  if (diff < 604800) return `${Math.floor(diff / 86400)} dias atrás`;
  if (diff < 1209600) return "1 semana";
  if (diff < 2592000) return `${Math.floor(diff / 604800)} semanas`;
  return `${Math.floor(diff / 2592000)} meses`;
}

function readTime(content: string): string {
  const words = content?.split(/\s+/).length || 0;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function NoticiaCard({ post }: { post: BlogPost }) {
  const image = post.coverImage || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80";
  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.article
        whileHover={{ y: -4 }}
        className="flex-shrink-0 w-[280px] bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 group"
      >
        <div className="relative h-36 overflow-hidden">
          <Image src={image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="280px" loading="lazy" />
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-white text-[10px] font-semibold uppercase rounded-md" style={{ backgroundColor: post.category.color || "#25D366" }}>
                {post.category.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#0B2545] dark:group-hover:text-sky-400 transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <RiTimeLine className="w-3.5 h-3.5" />
              {timeAgo(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <RiEyeLine className="w-3.5 h-3.5" />
              {readTime(post.content)}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export function NoticiasCarrossel({ initialPosts }: { initialPosts?: BlogPost[] } = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts || []);

  useEffect(() => {
    if (initialPosts?.length) return;
    fetch("/api/blog/posts?status=PUBLICADO&limit=10")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []))
      .catch(() => {});
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="pt-4 md:pt-6 pb-4 md:pb-8 bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0B2545]/5 border border-[#0B2545]/15">
              <div className="w-1.5 h-7 rounded-full bg-[#0B2545]" />
              <h2 className="text-xl md:text-2xl font-bold text-[#0B2545] dark:text-white uppercase tracking-wide">
                Últimas Notícias
              </h2>
              <span className="px-2.5 py-0.5 bg-[#0B2545] text-white text-[10px] font-bold uppercase rounded-full">Blog</span>
            </div>
          </div>

          {/* Navigation + Ver todas */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm font-medium text-[#0B2545] dark:text-sky-400 hover:underline"
            >
              Ver todas
            </Link>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? "bg-[#0B2545] text-white hover:bg-[#081733]"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <RiArrowLeftSLine className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  canScrollRight
                    ? "bg-[#0B2545] text-white hover:bg-[#081733]"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <RiArrowRightSLine className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Carrossel */}
        <div className="relative -mr-4 lg:-mr-8 xl:-mr-[calc((100vw-1280px)/2+2rem)]">
          {/* Fade Left */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-50 dark:from-neutral-900 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 pr-8 lg:pr-16"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {posts.map((post) => (
              <div key={post.id} style={{ scrollSnapAlign: "start" }}>
                <NoticiaCard post={post} />
              </div>
            ))}
            <div className="flex-shrink-0 w-8 lg:w-16" />
          </div>

          {/* Fade Right */}
          <div className="absolute right-0 top-0 bottom-0 w-32 lg:w-48 bg-gradient-to-l from-neutral-50 dark:from-neutral-900 via-neutral-50/80 dark:via-neutral-900/80 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Mobile - Ver todas */}
        <div className="flex justify-center mt-8 md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B2545] text-white font-medium rounded-full"
          >
            Ver todas as notícias
            <RiArrowRightSLine className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
