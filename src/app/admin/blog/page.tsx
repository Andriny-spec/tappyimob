"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiSearchLine,
  RiAddLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiDraftLine,
  RiCheckLine,
  RiTimeLine,
  RiArchiveLine,
  RiArticleLine,
  RiStarLine,
  RiStarFill,
  RiImageLine,
  RiLoader4Line,
  RiRefreshLine,
} from "react-icons/ri";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: "RASCUNHO" | "PUBLICADO" | "AGENDADO" | "ARQUIVADO";
  featured: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: { posts: number };
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  RASCUNHO: { label: "Rascunho", icon: RiDraftLine, color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  PUBLICADO: { label: "Publicado", icon: RiCheckLine, color: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" },
  AGENDADO: { label: "Agendado", icon: RiTimeLine, color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" },
  ARQUIVADO: { label: "Arquivado", icon: RiArchiveLine, color: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" },
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      if (search) params.set("search", search);

      const [postsRes, catsRes] = await Promise.all([
        fetch(`/api/blog/posts?${params}`),
        fetch("/api/blog/categories"),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts || []);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    total: posts.length,
    publicados: posts.filter((p) => p.status === "PUBLICADO").length,
    rascunhos: posts.filter((p) => p.status === "RASCUNHO").length,
    views: posts.reduce((acc, p) => acc + p.views, 0),
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blog/posts/${selectedPost.id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== selectedPost.id));
      } else {
        alert("Erro ao excluir post");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao excluir post");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedPost(null);
    }
  };

  const toggleFeatured = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      const res = await fetch(`/api/blog/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !post.featured }),
      });
      if (res.ok) {
        setPosts(posts.map((p) => (p.id === postId ? { ...p, featured: !p.featured } : p)));
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Blog</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Gerencie os posts do seu blog</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RiRefreshLine className="w-5 h-5" />
          </button>
          <Link
            href="/admin/blog/categorias"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Categorias
          </Link>
          <Link
            href="/admin/blog/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors"
          >
            <RiAddLine className="w-5 h-5" />
            Novo Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Posts", value: stats.total, icon: RiArticleLine },
          { label: "Publicados", value: stats.publicados, icon: RiCheckLine },
          { label: "Rascunhos", value: stats.rascunhos, icon: RiDraftLine },
          { label: "Visualizações", value: stats.views.toLocaleString(), icon: RiEyeLine },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B2545]/10 dark:bg-[#0B2545]/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-[#0B2545] dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545] dark:focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
          >
            <option value="">Todos os status</option>
            <option value="PUBLICADO">Publicado</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="AGENDADO">Agendado</option>
            <option value="ARQUIVADO">Arquivado</option>
          </select>
          <select
            value={categoryFilter || ""}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat._count?.posts || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const statusInfo = statusConfig[post.status] || statusConfig.RASCUNHO;
          const StatusIcon = statusInfo.icon;
          return (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-neutral-100 dark:bg-neutral-700">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <RiImageLine className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
                {post.featured && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded-lg flex items-center gap-1">
                    <RiStarFill className="w-3 h-3" />
                    Destaque
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 ${statusInfo.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </div>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="p-2 bg-white rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <RiEditLine className="w-5 h-5 text-neutral-700" />
                  </Link>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 bg-white rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <RiEyeLine className="w-5 h-5 text-neutral-700" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post)}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <RiDeleteBinLine className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {post.category && (
                  <span
                    className="inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2"
                    style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                  >
                    {post.category.name}
                  </span>
                )}
                <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2 mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0B2545] flex items-center justify-center text-white text-[10px] font-semibold">
                      {post.author?.name?.charAt(0) || "?"}
                    </div>
                    <span>{post.author?.name || "Autor"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <RiEyeLine className="w-3.5 h-3.5" />
                      {post.views}
                    </span>
                    <button
                      onClick={() => toggleFeatured(post.id)}
                      className="hover:text-yellow-500 transition-colors"
                    >
                      {post.featured ? (
                        <RiStarFill className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <RiStarLine className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <RiArticleLine className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-neutral-500 mb-6">Crie seu primeiro post para começar.</p>
          <Link
            href="/admin/blog/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors"
          >
            <RiAddLine className="w-5 h-5" />
            Criar Post
          </Link>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-xl z-50 p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <RiDeleteBinLine className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Excluir post?
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                  Tem certeza que deseja excluir &quot;{selectedPost.title}&quot;? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : null}
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
