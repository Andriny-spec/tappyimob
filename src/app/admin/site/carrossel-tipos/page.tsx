"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiSaveLine,
  RiCloseLine,
  RiImageAddLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiHome4Line,
  RiBuilding2Line,
  RiMapPinLine,
  RiStore2Line,
  RiUploadCloud2Line,
  RiDeleteBin6Line,
  RiDraggable,
} from "react-icons/ri";

type PropertyTypeCard = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  image?: string;
  icon?: string;
  bgColor: string;
  textColor: string;
  order: number;
  isActive: boolean;
};

const propertyTypes = [
  { value: "TAMBORE_I_II_III", label: "Tamboré I, II e III", icon: "RiBuilding2Line" },
  { value: "RETROFIT", label: "Retrofit", icon: "RiHome4Line" },
  { value: "CASAS_TERREAS", label: "Casas Térreas", icon: "RiHome4Line" },
  { value: "VILLAGIOS", label: "Villagios", icon: "RiHome4Line" },
  { value: "CASAS_CENTRO_SUA_CIDADE", label: "Casas (Centro de Sua Cidade)", icon: "RiHome4Line" },
  { value: "LANCAMENTOS", label: "Lançamentos", icon: "RiBuilding2Line" },
  { value: "APARTAMENTOS_CENTRO_SUA_CIDADE", label: "Apartamentos (Centro de Sua Cidade)", icon: "RiBuilding2Line" },
  { value: "VISTAS_INCRIVEIS", label: "Vistas Incríveis", icon: "RiMapPinLine" },
  { value: "EXCLUSIVIDADES", label: "Exclusividades", icon: "RiStore2Line" },
];

const defaultTypeCard: Partial<PropertyTypeCard> = {
  title: "",
  subtitle: "",
  image: "",
  icon: "RiHome4Line",
  bgColor: "#0B2545",
  textColor: "#FFFFFF",
  isActive: true,
};

// Componente Sortable para cada card
function SortableTypeCard({
  typeCard,
  onToggleActive,
  onEdit,
  onDelete,
  getTypeLabel,
}: {
  typeCard: PropertyTypeCard;
  onToggleActive: (t: PropertyTypeCard) => void;
  onEdit: (t: PropertyTypeCard) => void;
  onDelete: (id: string) => void;
  getTypeLabel: (type: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: typeCard.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-neutral-900 rounded-2xl border overflow-hidden ${
        typeCard.isActive
          ? "border-neutral-200 dark:border-neutral-800"
          : "border-neutral-200 dark:border-neutral-800 opacity-60"
      }`}
    >
      {/* Handle de arraste */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center py-1.5 bg-neutral-50 dark:bg-neutral-800 cursor-grab active:cursor-grabbing border-b border-neutral-200 dark:border-neutral-700"
      >
        <RiDraggable className="w-4 h-4 text-neutral-400" />
      </div>

      {/* Preview - altura fixa para alinhar títulos */}
      <div
        className="h-28 relative bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: typeCard.image
            ? `url(${typeCard.image})`
            : undefined,
          backgroundColor: typeCard.image ? undefined : typeCard.bgColor,
        }}
      >
        {typeCard.image && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <span
            className="text-lg font-bold text-center line-clamp-2"
            style={{ color: typeCard.textColor }}
          >
            {typeCard.title || getTypeLabel(typeCard.type)}
          </span>
          {typeCard.subtitle && (
            <span
              className="text-xs opacity-80 text-center line-clamp-2 mt-1"
              style={{ color: typeCard.textColor }}
            >
              {typeCard.subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <span className="text-xs text-neutral-500 truncate block">
              {getTypeLabel(typeCard.type)}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded inline-block mt-1 ${
                typeCard.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {typeCard.isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onToggleActive(typeCard)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {typeCard.isActive ? (
                <RiEyeLine className="w-4 h-4 text-green-500" />
              ) : (
                <RiEyeOffLine className="w-4 h-4 text-neutral-400" />
              )}
            </button>
            <button
              onClick={() => onEdit(typeCard)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <RiEditLine className="w-4 h-4 text-blue-500" />
            </button>
            <button
              onClick={() => onDelete(typeCard.id)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <RiDeleteBinLine className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarrosselTiposPage() {
  const [types, setTypes] = useState<PropertyTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingType, setEditingType] = useState<PropertyTypeCard | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeName, setCustomTypeName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sensors para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTypes();
  }, []);

  // Função para comprimir imagem antes do upload
  const compressImage = async (file: File, maxWidth = 1200, quality = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".webp"),
                { type: "image/webp" }
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Falha ao comprimir imagem"));
            }
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de imagem com compressão
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingType) return;

    setUploading(true);
    try {
      // Comprimir imagem antes do upload
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedFile = await compressImage(file, 1200, 0.85);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      console.log(`Imagem: ${originalSize}MB → ${compressedSize}MB`);

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("folder", "property-types");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditingType({ ...editingType, image: data.url });
      } else {
        alert("Erro ao fazer upload da imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    }
    setUploading(false);
  };

  const handleRemoveImage = () => {
    if (!editingType) return;
    setEditingType({ ...editingType, image: "" });
  };

  // Função de reordenação via drag-and-drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = types.findIndex((t) => t.id === active.id);
    const newIndex = types.findIndex((t) => t.id === over.id);

    const newTypes = arrayMove(types, oldIndex, newIndex);
    setTypes(newTypes);

    // Salvar nova ordem no backend
    try {
      const orderedIds = newTypes.map((t) => t.id);
      await fetch("/api/site/property-types/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (error) {
      console.error("Erro ao reordenar:", error);
      // Reverter em caso de erro
      fetchTypes();
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/site/property-types");
      const data = await res.json();
      setTypes(data.types || []);
    } catch (error) {
      console.error("Erro ao buscar tipos:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // Validar tipo selecionado ou customizado
    const typeValue = isCustomType ? customTypeName.toUpperCase().replace(/\s+/g, "_") : selectedPropertyType;
    if (!editingType || !typeValue) return;
    setSaving(true);

    try {
      const payload = {
        ...editingType,
        type: typeValue,
      };

      const res = await fetch("/api/site/property-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchTypes();
        setShowModal(false);
        setEditingType(null);
        setSelectedPropertyType("");
        setIsCustomType(false);
        setCustomTypeName("");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este tipo?")) return;

    try {
      await fetch(`/api/site/property-types/${id}`, { method: "DELETE" });
      await fetchTypes();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleToggleActive = async (typeCard: PropertyTypeCard) => {
    try {
      await fetch(`/api/site/property-types/${typeCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !typeCard.isActive }),
      });
      await fetchTypes();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const openNewType = () => {
    setEditingType(defaultTypeCard as PropertyTypeCard);
    setSelectedPropertyType("");
    setIsCustomType(false);
    setCustomTypeName("");
    setShowModal(true);
  };

  const openEditType = (typeCard: PropertyTypeCard) => {
    setEditingType(typeCard);
    // Verificar se é um tipo customizado (não está na lista predefinida)
    const isCustom = !propertyTypes.find((t) => t.value === typeCard.type);
    setIsCustomType(isCustom);
    setCustomTypeName(isCustom ? typeCard.type : "");
    setSelectedPropertyType(isCustom ? "CUSTOM" : typeCard.type);
    setShowModal(true);
  };

  const getTypeLabel = (type: string) => {
    return propertyTypes.find((t) => t.value === type)?.label || type;
  };

  const getAvailableTypes = () => {
    const usedTypes = types.map((t) => t.type);
    return propertyTypes.filter(
      (t) => !usedTypes.includes(t.value) || t.value === selectedPropertyType
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A1E3D]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Carrossel de Tipos
          </h1>
          <p className="text-neutral-500">
            Configure os tipos de imóveis exibidos no carrossel da home
          </p>
        </div>
        <button
          onClick={openNewType}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1E3D] text-white rounded-xl hover:bg-[#1A3560] transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          Novo Tipo
        </button>
      </div>

      {/* Grid de Tipos com Drag-and-Drop */}
      {types.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <RiImageAddLine className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhum tipo configurado
          </h3>
          <p className="text-neutral-500 mb-4">
            Configure os tipos de imóveis para o carrossel
          </p>
          <button
            onClick={openNewType}
            className="px-4 py-2 bg-[#0A1E3D] text-white rounded-xl"
          >
            Adicionar Tipo
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={types.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {types.map((typeCard) => (
                <SortableTypeCard
                  key={typeCard.id}
                  typeCard={typeCard}
                  onToggleActive={handleToggleActive}
                  onEdit={openEditType}
                  onDelete={handleDelete}
                  getTypeLabel={getTypeLabel}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Dica de arraste */}
      {types.length > 1 && (
        <p className="text-center text-xs text-neutral-400 mt-4">
          Arraste os cards para reordenar o carrossel
        </p>
      )}

      {/* Modal de Edição */}
      <AnimatePresence>
        {showModal && editingType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingType.id ? "Editar Tipo" : "Novo Tipo"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {/* Toggle entre tipo predefinido e customizado */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomType(false);
                      setCustomTypeName("");
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      !isCustomType
                        ? "bg-[#0A1E3D] text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    Tipo Predefinido
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomType(true);
                      setSelectedPropertyType("CUSTOM");
                    }}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      isCustomType
                        ? "bg-[#0A1E3D] text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    Criar Categoria
                  </button>
                </div>

                {!isCustomType ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tipo de Imóvel *
                    </label>
                    <select
                      value={selectedPropertyType}
                      onChange={(e) => setSelectedPropertyType(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    >
                      <option value="">Selecione...</option>
                      {getAvailableTypes().map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nome da Nova Categoria *
                    </label>
                    <input
                      value={customTypeName}
                      onChange={(e) => setCustomTypeName(e.target.value)}
                      placeholder="Ex: Coberturas, Flats, Studios..."
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    />
                    <p className="text-xs text-neutral-400 mt-1">
                      Esta categoria será criada como um novo tipo no sistema
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título Personalizado
                  </label>
                  <input
                    value={editingType.title}
                    onChange={(e) =>
                      setEditingType({ ...editingType, title: e.target.value })
                    }
                    placeholder="Ex: Apartamentos de Luxo"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subtítulo</label>
                  <input
                    value={editingType.subtitle || ""}
                    onChange={(e) =>
                      setEditingType({ ...editingType, subtitle: e.target.value })
                    }
                    placeholder="Ex: Encontre seu lar"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Imagem
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {editingType.image ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={editingType.image}
                        alt="Tipo"
                        className="w-full h-16 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white rounded-lg text-neutral-700 hover:bg-neutral-100"
                        >
                          <RiUploadCloud2Line className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <RiDeleteBin6Line className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-16 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#0A1E3D] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {uploading ? (
                        <RiLoader4Line className="w-6 h-6 animate-spin text-neutral-400" />
                      ) : (
                        <>
                          <RiUploadCloud2Line className="w-6 h-6 text-neutral-400" />
                          <span className="text-xs text-neutral-500">
                            Clique para upload
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cor de Fundo
                    </label>
                    <input
                      type="color"
                      value={editingType.bgColor}
                      onChange={(e) =>
                        setEditingType({ ...editingType, bgColor: e.target.value })
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cor do Texto
                    </label>
                    <input
                      type="color"
                      value={editingType.textColor}
                      onChange={(e) =>
                        setEditingType({ ...editingType, textColor: e.target.value })
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium mb-1">Preview</label>
                  <div
                    className="h-16 rounded-lg relative bg-cover bg-center flex items-center justify-center"
                    style={{
                      backgroundImage: editingType.image
                        ? `url(${editingType.image})`
                        : undefined,
                      backgroundColor: editingType.image
                        ? undefined
                        : editingType.bgColor,
                    }}
                  >
                    {editingType.image && (
                      <div className="absolute inset-0 bg-black/40 rounded-xl" />
                    )}
                    <div className="relative text-center">
                      <span
                        className="text-xl font-bold"
                        style={{ color: editingType.textColor }}
                      >
                        {editingType.title ||
                          propertyTypes.find((t) => t.value === selectedPropertyType)
                            ?.label ||
                          "Título"}
                      </span>
                      {editingType.subtitle && (
                        <p
                          className="text-sm opacity-80"
                          style={{ color: editingType.textColor }}
                        >
                          {editingType.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (!isCustomType && !selectedPropertyType) || (isCustomType && !customTypeName.trim())}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1E3D] text-white rounded-xl hover:bg-[#1A3560] disabled:opacity-50"
                >
                  {saving ? (
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                  ) : (
                    <RiSaveLine className="w-5 h-5" />
                  )}
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
