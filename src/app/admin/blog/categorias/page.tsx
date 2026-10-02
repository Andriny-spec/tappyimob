"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiPriceTag3Line,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  _count: { posts: number };
}

const colorOptions = [
  "#0B2545", "#3B82F6", "#059669", "#7C3AED", 
  "#DC2626", "#F59E0B", "#EC4899", "#06B6D4",
];

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#0B2545",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/blog/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const openNewModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", color: "#0B2545" });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      color: category.color,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) return alert("Nome e slug são obrigatórios");
    setIsLoading(true);
    try {
      if (editingCategory) {
        const res = await fetch(`/api/blog/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const updated = await res.json();
          setCategories(categories.map((cat) => (cat.id === editingCategory.id ? updated : cat)));
        } else {
          const err = await res.json();
          alert(err.error || "Erro ao atualizar");
        }
      } else {
        const res = await fetch("/api/blog/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const newCat = await res.json();
          setCategories([...categories, { ...newCat, _count: { posts: 0 } }]);
        } else {
          const err = await res.json();
          alert(err.error || "Erro ao criar");
        }
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/blog/categories/${selectedCategory.id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      } else {
        alert("Erro ao excluir categoria");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setSelectedCategory(null);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Categorias</h1>
            <p className="text-neutral-500">Gerencie as categorias do blog</p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <RiPriceTag3Line className="w-5 h-5" style={{ color: category.color }} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <RiEditLine className="w-4 h-4 text-neutral-500" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <RiDeleteBinLine className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">/blog/categoria/{category.slug}</span>
              <span className="px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                {category._count.posts} posts
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <RiPriceTag3Line className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhuma categoria
          </h3>
          <p className="text-neutral-500 mb-6">Crie sua primeira categoria para organizar os posts.</p>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors"
          >
            <RiAddLine className="w-5 h-5" />
            Criar Categoria
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-xl z-50"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Nome da categoria"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="slug-da-categoria"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição da categoria"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Cor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-transform ${
                          formData.color === color ? "ring-2 ring-offset-2 ring-[#0B2545] scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.name}
                  className="px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#081733] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <RiLoader4Line className="w-4 h-4 animate-spin" />}
                  {editingCategory ? "Salvar" : "Criar"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedCategory && (
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
                  Excluir categoria?
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-2">
                  Tem certeza que deseja excluir "{selectedCategory.name}"?
                </p>
                {selectedCategory._count.posts > 0 && (
                  <p className="text-sm text-orange-500 mb-4">
                    ⚠️ Esta categoria possui {selectedCategory._count.posts} posts associados.
                  </p>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading && <RiLoader4Line className="w-4 h-4 animate-spin" />}
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
