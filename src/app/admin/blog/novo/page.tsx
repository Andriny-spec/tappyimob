"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import {
  RiArrowLeftLine,
  RiImageAddLine,
  RiCloseLine,
  RiDraftLine,
  RiCheckLine,
  RiStarLine,
  RiStarFill,
  RiLoader4Line,
  RiUploadCloud2Line,
  RiSeoLine,
  RiSparklingLine,
} from "react-icons/ri";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

function calcSeoScore(data: { title: string; slug: string; excerpt: string; content: string; seoTitle: string; seoDescription: string; coverImage: string }) {
  let score = 0;
  const checks: { label: string; ok: boolean }[] = [];

  const hasTitle = data.title.length >= 10;
  checks.push({ label: "Título com 10+ caracteres", ok: hasTitle });
  if (hasTitle) score += 15;

  const hasSeoTitle = (data.seoTitle || data.title).length >= 20 && (data.seoTitle || data.title).length <= 70;
  checks.push({ label: "SEO Title entre 20-70 chars", ok: hasSeoTitle });
  if (hasSeoTitle) score += 15;

  const descLen = data.seoDescription.length;
  const hasDesc = descLen >= 80 && descLen <= 160;
  checks.push({ label: "Meta description 80-160 chars", ok: hasDesc });
  if (hasDesc) score += 15;

  const hasSlug = data.slug.length >= 3 && !data.slug.includes(" ");
  checks.push({ label: "Slug válido", ok: hasSlug });
  if (hasSlug) score += 10;

  const hasImage = !!data.coverImage;
  checks.push({ label: "Imagem de capa", ok: hasImage });
  if (hasImage) score += 10;

  const hasExcerpt = data.excerpt.length >= 30;
  checks.push({ label: "Resumo com 30+ chars", ok: hasExcerpt });
  if (hasExcerpt) score += 10;

  const contentLen = data.content.length;
  const hasContent = contentLen >= 300;
  checks.push({ label: "Conteúdo com 300+ chars", ok: hasContent });
  if (hasContent) score += 15;

  const hasHeading = data.content.includes("## ") || data.content.includes("# ");
  checks.push({ label: "Subtítulos (headings)", ok: hasHeading });
  if (hasHeading) score += 10;

  return { score, checks };
}

export default function NovoPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "RASCUNHO",
    featured: false,
    categoryId: "",
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  const getCategoryName = () => categories.find(c => c.id === formData.categoryId)?.name || "";

  const generateWithAI = async (field: string) => {
    setGeneratingField(field);
    try {
      const cat = getCategoryName();
      const prompts: Record<string, string> = {
        title: `Gere um título atraente e otimizado para SEO para um artigo de blog imobiliário.
${cat ? `Categoria: ${cat}` : ""}
O título deve ter entre 40 e 70 caracteres, ser chamativo e profissional. Retorne APENAS o título, sem aspas.`,
        excerpt: `Gere um resumo curto e envolvente para o seguinte artigo de blog:
Título: ${formData.title || "Artigo sobre mercado imobiliário"}
${cat ? `Categoria: ${cat}` : ""}
${formData.content ? `Início do conteúdo: ${formData.content.substring(0, 500)}` : ""}
O resumo deve ter entre 100 e 200 caracteres, ser persuasivo e convidar à leitura. Retorne APENAS o resumo, sem aspas.`,
        content: `Escreva um artigo completo para o blog de uma imobiliária de alto padrão (Tappy Imob, Sua Cidade/Barueri-SP).
Título: ${formData.title || "Mercado imobiliário"}
${cat ? `Categoria: ${cat}` : ""}
${formData.excerpt ? `Resumo: ${formData.excerpt}` : ""}

O artigo deve:
- Ter entre 800 e 1500 palavras
- Usar formato Markdown com ## para subtítulos
- Ter introdução, desenvolvimento com 3-5 subtítulos, e conclusão
- Linguagem profissional e acessível
- Incluir dicas práticas e informações relevantes
- Focar no mercado imobiliário de alto padrão em Sua Cidade e região

Retorne APENAS o conteúdo do artigo em Markdown (sem o título principal).`,
        seoTitle: `Gere um título SEO otimizado para o seguinte artigo de blog:
Título: ${formData.title || "Artigo imobiliário"}
${cat ? `Categoria: ${cat}` : ""}
${formData.excerpt ? `Resumo: ${formData.excerpt}` : ""}
O título SEO deve ter entre 40 e 60 caracteres, incluir palavras-chave relevantes e ser otimizado para Google. Retorne APENAS o título, sem aspas.`,
        seoDescription: `Gere uma meta description SEO para o seguinte artigo:
Título: ${formData.title || "Artigo imobiliário"}
${cat ? `Categoria: ${cat}` : ""}
${formData.excerpt ? `Resumo: ${formData.excerpt}` : ""}
A meta description deve ter entre 120 e 155 caracteres, incluir call-to-action e palavras-chave. Retorne APENAS a descrição, sem aspas.`,
      };

      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompts[field] }),
      });

      if (!response.ok) throw new Error("Erro na IA");
      const data = await response.json();
      const text = data.description?.trim().replace(/^["']|["']$/g, "") || "";

      if (field === "title") {
        setFormData(prev => ({ ...prev, title: text, slug: generateSlug(text) }));
      } else {
        setFormData(prev => ({ ...prev, [field]: text }));
      }
    } catch {
      alert("Erro ao gerar com IA. Tente novamente.");
    } finally {
      setGeneratingField(null);
    }
  };

  const AiButton = ({ field, label }: { field: string; label: string }) => (
    <button
      type="button"
      onClick={() => generateWithAI(field)}
      disabled={!!generatingField}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
    >
      {generatingField === field ? (
        <><RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> Gerando...</>
      ) : (
        <><RiSparklingLine className="w-3.5 h-3.5" /> {label}</>
      )}
    </button>
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", `fotos/blog/${formData.slug || "geral"}`);
      fd.append("skipWatermark", "true");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
      } else {
        alert("Erro ao fazer upload da imagem");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (status: string) => {
    if (!formData.title.trim()) return alert("Título é obrigatório");
    if (status === "PUBLICADO" && !formData.content.trim()) return alert("Conteúdo é obrigatório para publicar");

    setIsLoading(true);
    try {
      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status,
          authorId: user?.id || "",
        }),
      });
      if (res.ok) {
        router.push("/admin/blog");
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar post");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const seo = calcSeoScore(formData);
  const seoColor = seo.score >= 80 ? "text-green-500" : seo.score >= 50 ? "text-yellow-500" : "text-red-500";
  const seoBg = seo.score >= 80 ? "bg-green-500" : seo.score >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Novo Post</h1>
            <p className="text-neutral-500">Crie um novo artigo para o blog</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit("RASCUNHO")}
            disabled={isLoading || !formData.title}
            className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <RiDraftLine className="w-4 h-4" />
            Salvar rascunho
          </button>
          <button
            onClick={() => handleSubmit("PUBLICADO")}
            disabled={isLoading || !formData.title || !formData.content}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors disabled:opacity-50"
          >
            {isLoading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />}
            Publicar
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Título do Post *</label>
                  <AiButton field="title" label="Gerar título" />
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Digite o título do post"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545] text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-sm">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-do-post"
                    className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Resumo</label>
              <AiButton field="excerpt" label="Gerar resumo" />
            </div>
            <textarea
              rows={3}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Um breve resumo do post (exibido na listagem)"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545] resize-none"
            />
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Conteúdo *</label>
              <AiButton field="content" label="Gerar artigo completo" />
            </div>
            <textarea
              rows={15}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escreva o conteúdo do seu post aqui... (Suporta Markdown)"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545] resize-none font-mono text-sm"
            />
            <p className="text-xs text-neutral-400 mt-2">Suporta Markdown · {formData.content.length} caracteres</p>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <RiSeoLine className="w-5 h-5" /> SEO
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div className={`h-full ${seoBg} rounded-full transition-all`} style={{ width: `${seo.score}%` }} />
                </div>
                <span className={`text-sm font-bold ${seoColor}`}>{seo.score}/100</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Título SEO</label>
                  <AiButton field="seoTitle" label="Gerar SEO Title" />
                </div>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder={formData.title || "Título para mecanismos de busca"}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                />
                <p className="text-xs text-neutral-400 mt-1">{(formData.seoTitle || formData.title).length}/70 caracteres</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Meta Description</label>
                  <AiButton field="seoDescription" label="Gerar Meta Desc" />
                </div>
                <textarea
                  rows={2}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Descrição para mecanismos de busca (80-160 caracteres)"
                  maxLength={160}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545] resize-none"
                />
                <p className="text-xs text-neutral-400 mt-1">{formData.seoDescription.length}/160 caracteres</p>
              </div>
              {/* SEO Checklist */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                {seo.checks.map((c) => (
                  <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-green-600" : "text-neutral-400"}`}>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${c.ok ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Imagem de Capa</h3>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {formData.coverImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                <Image src={formData.coverImage} alt="Cover" fill className="object-cover" />
                <button
                  onClick={() => setFormData({ ...formData, coverImage: "" })}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                >
                  <RiCloseLine className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center mb-3 hover:border-[#0B2545] transition-colors"
              >
                {uploading ? (
                  <RiLoader4Line className="w-10 h-10 text-neutral-400 animate-spin" />
                ) : (
                  <>
                    <RiUploadCloud2Line className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-2" />
                    <p className="text-sm text-neutral-500">Clique para fazer upload</p>
                  </>
                )}
              </button>
            )}
            {!formData.coverImage && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-3 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#081733] transition-colors disabled:opacity-50"
              >
                {uploading ? "Enviando..." : "Upload via MinIO"}
              </button>
            )}
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Categoria</h3>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Featured */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Destaque</h3>
            <button
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                formData.featured
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-yellow-400"
              }`}
            >
              {formData.featured ? <RiStarFill className="w-5 h-5 text-yellow-500" /> : <RiStarLine className="w-5 h-5" />}
              {formData.featured ? "Post em destaque" : "Marcar como destaque"}
            </button>
          </div>

          {/* Google Preview */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Preview Google</h3>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-neutral-900">
              <p className="text-blue-700 dark:text-blue-400 text-base font-medium line-clamp-1 hover:underline cursor-pointer">
                {formData.seoTitle || formData.title || "Título do Post"}
              </p>
              <p className="text-green-700 dark:text-green-500 text-xs mt-1">
                tappyimob.com.br/blog/{formData.slug || "url-do-post"}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                {formData.seoDescription || formData.excerpt || "Descrição do post aparecerá aqui nos resultados de busca..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
