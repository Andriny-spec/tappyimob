"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiSearchLine,
  RiTimeLine,
  RiArrowRightLine,
  RiBookmarkLine,
  RiEyeLine,
  RiLoader4Line,
} from "react-icons/ri";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  featured: boolean;
  views: number;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
  category: { id: string; name: string; slug: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: { posts: number };
}

function estimateReadTime(content: string): string {
  const words = content?.split(/\s+/).length || 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const readTime = estimateReadTime(post.content);
  const date = formatDate(post.publishedAt || post.createdAt);
  const image = post.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80";

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.article
        whileHover={{ y: -4 }}
        className={`group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 hover:shadow-xl transition-all ${
          featured ? "md:grid md:grid-cols-2" : ""
        }`}
      >
        <div className={`relative overflow-hidden ${featured ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[16/10]"}`}>
          <Image
            src={image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {post.category && (
            <div className="absolute top-4 left-4">
              <span
                className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: post.category.color || "#0B2545" }}
              >
                {post.category.name}
              </span>
            </div>
          )}
        </div>

        <div className={`p-6 ${featured ? "flex flex-col justify-center" : ""}`}>
          <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
            <span className="flex items-center gap-1">
              <RiTimeLine className="w-4 h-4" />
              {readTime}
            </span>
            <span className="flex items-center gap-1">
              <RiEyeLine className="w-4 h-4" />
              {post.views.toLocaleString()}
            </span>
          </div>

          <h3 className={`font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-[#0B2545] dark:group-hover:text-sky-400 transition-colors ${
            featured ? "text-2xl md:text-3xl" : "text-lg"
          }`}>
            {post.title}
          </h3>

          {post.excerpt && (
            <p className={`text-neutral-600 dark:text-neutral-400 mb-4 ${featured ? "text-base" : "text-sm line-clamp-2"}`}>
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">{date}</span>
            <span className="flex items-center gap-1 text-sm font-medium text-[#0B2545] dark:text-sky-400 group-hover:gap-2 transition-all">
              Ler mais <RiArrowRightLine className="w-4 h-4" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterStatus === "sending") return;
    setNewsletterStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, source: "blog" }),
      });
      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterEmail("");
      } else {
        setNewsletterStatus("error");
      }
    } catch {
      setNewsletterStatus("error");
    }
  };

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      const params = new URLSearchParams({ limit: "12", page: String(pageNum), status: "PUBLICADO" });
      if (busca) params.set("search", busca);
      if (categoriaAtiva !== "todos") params.set("categoryId", categoriaAtiva);

      const res = await fetch(`/api/blog/posts?${params}`);
      if (res.ok) {
        const data = await res.json();
        const newPosts = data.posts || [];
        setPosts(append ? (prev) => [...prev, ...newPosts] : newPosts);
        setHasMore(data.pagination?.page < data.pagination?.totalPages);
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  }, [busca, categoriaAtiva]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPage(1);
      const [_, catsRes] = await Promise.all([
        fetchPosts(1),
        fetch("/api/blog/categories"),
      ]);
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    };
    load();
  }, [fetchPosts]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchPosts(nextPage, true);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const featuredPost = posts.find((p) => p.featured);
  const gridPosts = posts.filter((p) => !p.featured || categoriaAtiva !== "todos" || busca !== "");

  const allCategories = [
    { id: "todos", name: "Todos", _count: { posts: 0 } },
    ...categories,
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-semibold text-[#0B2545] dark:text-sky-400 bg-[#0B2545]/10 dark:bg-sky-400/10 rounded-full mb-6">
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Insights & Novidades
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10">
              Conteúdo exclusivo sobre mercado imobiliário, dicas de investimento, 
              decoração e tudo sobre Sua Cidade e região.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <RiSearchLine className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-0 text-base focus:ring-2 focus:ring-[#0B2545] focus:outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                categoriaAtiva === cat.id
                  ? "bg-[#0B2545] text-white"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              {cat.name}
              {cat._count.posts > 0 && (
                <span className={`ml-2 text-xs ${categoriaAtiva === cat.id ? "text-white/70" : "text-neutral-400"}`}>
                  {cat._count.posts}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545]" />
          </div>
        ) : (
          <>
            {/* Post Destaque */}
            {featuredPost && categoriaAtiva === "todos" && busca === "" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <PostCard post={featuredPost} featured />
              </motion.div>
            )}

            {/* Grid de Posts */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-20">
                <RiBookmarkLine className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-neutral-500">Tente buscar por outro termo ou categoria.</p>
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-12"
              >
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 rounded-full border-2 border-[#0B2545] text-[#0B2545] dark:border-sky-400 dark:text-sky-400 font-semibold hover:bg-[#0B2545] hover:text-white dark:hover:bg-sky-400 dark:hover:text-neutral-900 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingMore && <RiLoader4Line className="w-4 h-4 animate-spin" />}
                  Carregar mais artigos
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Newsletter */}
      <section className="bg-[#0B2545] py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Receba as novidades no seu e-mail
            </h2>
            <p className="text-white/70 mb-8">
              Assine nossa newsletter e fique por dentro das tendências do mercado imobiliário.
            </p>
            {newsletterStatus === "success" ? (
              <p className="text-white font-medium">Inscrição confirmada! Em breve você receberá nossas novidades.</p>
            ) : (
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleNewsletterSubscribe}>
                <input
                  type="email"
                  required
                  placeholder="Seu melhor e-mail"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "sending"}
                  className="px-8 py-4 rounded-xl bg-white text-[#0B2545] font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-60"
                >
                  {newsletterStatus === "sending" ? "Enviando..." : "Inscrever"}
                </button>
              </form>
            )}
            {newsletterStatus === "error" && (
              <p className="mt-3 text-sm text-red-300">Erro ao processar inscrição. Tente novamente.</p>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
