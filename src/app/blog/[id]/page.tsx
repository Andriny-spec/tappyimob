"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiTimeLine,
  RiCalendarLine,
  RiEyeLine,
  RiTwitterXLine,
  RiLinkedinLine,
  RiFacebookLine,
  RiWhatsappLine,
  RiLinkM,
  RiArrowRightLine,
  RiLoader4Line,
} from "react-icons/ri";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  featured: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  author: { id: string; name: string; avatar: string | null };
  category: { id: string; name: string; slug: string; color: string } | null;
  tags: { id: string; name: string; slug: string }[];
}

function estimateReadTime(content: string): string {
  const words = content?.split(/\s+/).length || 0;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function renderMarkdown(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{line.replace("## ", "")}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold mt-8 mb-3">{line.replace("### ", "")}</h3>;
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold mt-4">{line.replace(/\*\*/g, "")}</p>;
    if (line.startsWith("- ")) return <li key={i} className="ml-6">{line.replace("- ", "")}</li>;
    if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-6 list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
    if (line.trim() === "") return null;
    return <p key={i} className="mb-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">{line}</p>;
  });
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/blog/posts/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          // Buscar posts relacionados (mesma categoria)
          if (data.categoryId) {
            const relRes = await fetch(`/api/blog/posts?status=PUBLICADO&categoryId=${data.categoryId}&limit=4`);
            if (relRes.ok) {
              const relData = await relRes.json();
              setRelated((relData.posts || []).filter((p: Post) => p.id !== data.id).slice(0, 3));
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar post:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id]);

  const handleShare = (platform: string) => {
    if (!post) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    if (platform === "copy") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    } else {
      window.open(urls[platform], "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950 gap-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Post não encontrado</h1>
        <Link href="/blog" className="text-[#0B2545] hover:underline">Voltar ao blog</Link>
      </div>
    );
  }

  const image = post.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80";
  const readTime = estimateReadTime(post.content);
  const date = formatDate(post.publishedAt || post.createdAt);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <Image src={image} alt={post.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Link href="/blog" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
            <RiArrowLeftLine className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            {post.category && (
              <span className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full mb-4" style={{ backgroundColor: post.category.color || "#0B2545" }}>
                {post.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1.5"><RiCalendarLine className="w-4 h-4" />{date}</span>
              <span className="flex items-center gap-1.5"><RiTimeLine className="w-4 h-4" />{readTime} de leitura</span>
              <span className="flex items-center gap-1.5"><RiEyeLine className="w-4 h-4" />{post.views.toLocaleString()} visualizações</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Share sidebar */}
            <div className="hidden md:block w-16 flex-shrink-0">
              <div className="sticky top-32 flex flex-col items-center gap-3">
                <span className="text-xs text-neutral-500 mb-1">Compartilhar</span>
                {[
                  { icon: RiTwitterXLine, key: "twitter", hoverBg: "hover:bg-[#0B2545]" },
                  { icon: RiLinkedinLine, key: "linkedin", hoverBg: "hover:bg-[#0B2545]" },
                  { icon: RiFacebookLine, key: "facebook", hoverBg: "hover:bg-[#0B2545]" },
                  { icon: RiWhatsappLine, key: "whatsapp", hoverBg: "hover:bg-green-600" },
                  { icon: RiLinkM, key: "copy", hoverBg: "hover:bg-[#0B2545]" },
                ].map(({ icon: Icon, key, hoverBg }) => (
                  <button key={key} onClick={() => handleShare(key)} className={`w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center ${hoverBg} hover:text-white transition-colors`}>
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <article className="flex-1">
              {/* Author */}
              <div className="flex items-center gap-4 pb-8 mb-8 border-b border-neutral-200 dark:border-neutral-800">
                <div className="w-14 h-14 rounded-full bg-[#0B2545] flex items-center justify-center text-white font-bold text-xl">
                  {post.author?.name?.charAt(0) || "A"}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{post.author?.name || "Autor"}</p>
                  <p className="text-sm text-neutral-500">Tappy Imob</p>
                </div>
              </div>

              {/* Mobile share */}
              <div className="flex md:hidden items-center gap-2 mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-sm text-neutral-500 mr-2">Compartilhar:</span>
                <button onClick={() => handleShare("whatsapp")} className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center"><RiWhatsappLine className="w-4 h-4" /></button>
                <button onClick={() => handleShare("twitter")} className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center"><RiTwitterXLine className="w-4 h-4" /></button>
                <button onClick={() => handleShare("linkedin")} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center"><RiLinkedinLine className="w-4 h-4" /></button>
                <button onClick={() => handleShare("copy")} className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center"><RiLinkM className="w-4 h-4" /></button>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">{post.excerpt}</p>
              )}

              {/* Content */}
              <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:text-[#0B2545] dark:prose-headings:text-white prose-a:text-[#0B2545] dark:prose-a:text-sky-400 prose-strong:text-neutral-900 dark:prose-strong:text-white">
                {renderMarkdown(post.content)}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="px-4 py-2 text-sm rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-neutral-50 dark:bg-neutral-900 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">Artigos relacionados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/blog/${item.slug}`}>
                    <article className="group bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-700 hover:shadow-lg transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image src={item.coverImage || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        {item.category && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full" style={{ backgroundColor: item.category.color || "#0B2545" }}>{item.category.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 group-hover:text-[#0B2545] dark:group-hover:text-sky-400 transition-colors line-clamp-2">{item.title}</h3>
                        <div className="flex items-center justify-between text-sm text-neutral-500">
                          <span className="flex items-center gap-1"><RiTimeLine className="w-4 h-4" />{estimateReadTime(item.content)}</span>
                          <span className="flex items-center gap-1 text-[#0B2545] dark:text-sky-400 font-medium group-hover:gap-2 transition-all">Ler <RiArrowRightLine className="w-4 h-4" /></span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
