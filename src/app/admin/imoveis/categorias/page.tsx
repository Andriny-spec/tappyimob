"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiFolderLine,
  RiSearchLine,
  RiAddLine,
  RiLoader4Line,
  RiEditLine,
  RiDeleteBinLine,
  RiMoreLine,
  RiCloseLine,
  RiCheckLine,
  RiHome4Line,
  RiBuilding2Line,
  RiBuilding4Line,
  RiLandscapeLine,
  RiStore2Line,
  RiCommunityLine,
  RiPaletteLine,
  RiDragMove2Line,
} from "react-icons/ri";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  propertyCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  home: RiHome4Line,
  building: RiBuilding2Line,
  apartment: RiBuilding4Line,
  land: RiLandscapeLine,
  store: RiStore2Line,
  community: RiCommunityLine,
};

const colors = [
  { name: "Laranja", value: "orange" },
  { name: "Azul", value: "blue" },
  { name: "Verde", value: "green" },
  { name: "Roxo", value: "purple" },
  { name: "Rosa", value: "pink" },
  { name: "Amarelo", value: "yellow" },
  { name: "Vermelho", value: "red" },
  { name: "Ciano", value: "cyan" },
];

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "home",
    color: "orange",
    isActive: true,
  });

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    totalProperties: categories.reduce((acc, c) => acc + c.propertyCount, 0),
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon,
        color: category.color,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "home",
        color: "orange",
        isActive: true,
      });
    }
    setShowModal(true);
    setShowMenu(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const data = await response.json();
          alert(data.error || "Erro ao atualizar categoria");
          return;
        }
      } else {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const data = await response.json();
          alert(data.error || "Erro ao criar categoria");
          return;
        }
      }
      
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Erro ao salvar categoria");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao excluir categoria");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
    setShowMenu(null);
  };

  const handleToggleActive = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error toggling category:", error);
    }
    setShowMenu(null);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      orange: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-500", border: "border-orange-500" },
      blue: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-500", border: "border-blue-500" },
      green: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500", border: "border-green-500" },
      purple: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-500", border: "border-purple-500" },
      pink: { bg: "bg-pink-100 dark:bg-pink-500/20", text: "text-pink-500", border: "border-pink-500" },
      yellow: { bg: "bg-yellow-100 dark:bg-yellow-500/20", text: "text-yellow-500", border: "border-yellow-500" },
      red: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-500", border: "border-red-500" },
      cyan: { bg: "bg-cyan-100 dark:bg-cyan-500/20", text: "text-cyan-500", border: "border-cyan-500" },
    };
    return colorMap[color] || colorMap.orange;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiFolderLine className="w-5 h-5 text-green-500" />
            </div>
            Categorias
          </h1>
          <p className="text-neutral-500 mt-1">
            Organize seus imóveis por categoria
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 h-12 px-5 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <RiFolderLine className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-neutral-500">Total</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiCheckLine className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.active}</p>
              <p className="text-sm text-neutral-500">Ativas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <RiCloseLine className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.inactive}</p>
              <p className="text-sm text-neutral-500">Inativas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <RiBuilding2Line className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalProperties}</p>
              <p className="text-sm text-neutral-500">Imóveis</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <RiFolderLine className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhuma categoria encontrada
          </h3>
          <p className="text-neutral-500 max-w-md">
            {search ? "Tente ajustar sua busca." : "Crie sua primeira categoria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category, i) => {
            const colorClasses = getColorClasses(category.color);
            const IconComponent = icons[category.icon] || RiHome4Line;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all ${
                  category.isActive
                    ? "border-neutral-200 dark:border-neutral-800 hover:border-green-300 dark:hover:border-green-500/50"
                    : "border-neutral-200 dark:border-neutral-800 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === category.id ? null : category.id)}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                      <RiMoreLine className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {showMenu === category.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowMenu(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
                          >
                            <button
                              onClick={() => handleOpenModal(category)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                            >
                              <RiEditLine className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggleActive(category.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                            >
                              {category.isActive ? (
                                <>
                                  <RiCloseLine className="w-4 h-4" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <RiCheckLine className="w-4 h-4" />
                                  Ativar
                                </>
                              )}
                            </button>
                            {category.propertyCount === 0 && (
                              <button
                                onClick={() => handleDelete(category.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                              >
                                <RiDeleteBinLine className="w-4 h-4" />
                                Excluir
                              </button>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <RiBuilding2Line className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">
                      {category.propertyCount} imóveis
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                    category.isActive
                      ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  }`}>
                    {category.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </motion.div>
            );
          })}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 pointer-events-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                  >
                    <RiCloseLine className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ex: Apartamentos"
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Descrição da categoria..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Ícone
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(icons).map(([key, Icon]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: key })}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                            formData.icon === key
                              ? "bg-green-500 text-white"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Cor
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(({ name, value }) => {
                        const colorClasses = getColorClasses(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: value })}
                            className={`w-10 h-10 rounded-xl ${colorClasses.bg} transition-all ${
                              formData.color === value
                                ? `ring-2 ${colorClasses.border}`
                                : ""
                            }`}
                            title={name}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Categoria ativa
                    </span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-12 px-6 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
                    >
                      {editingCategory ? "Salvar" : "Criar"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
