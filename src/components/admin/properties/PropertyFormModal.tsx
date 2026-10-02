"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RiCloseLine,
  RiImageAddLine,
  RiLoader4Line,
  RiDeleteBinLine,
  RiStarLine,
  RiStarFill,
  RiSaveLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiMapPinLine,
  RiSettings4Line,
} from "react-icons/ri";
import {
  Property,
  PropertyType,
  PropertyCategory,
  PropertyCondition,
  propertyTypeLabels,
  propertyCategoryLabels,
  propertyConditionLabels,
} from "@/types/property";

interface PropertyFormModalProps {
  property?: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const amenitiesList = [
  "Piscina", "Academia", "Churrasqueira", "Salão de Festas", "Playground",
  "Portaria 24h", "Elevador", "Ar Condicionado", "Varanda", "Closet",
  "Cozinha Americana", "Área de Serviço", "Despensa", "Escritório", "Jardim",
  "Quadra Esportiva", "Sauna", "Spa", "Brinquedoteca", "Coworking",
];

export function PropertyFormModal({ property, isOpen, onClose, onSave }: PropertyFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    type: "APARTAMENTO" as PropertyType,
    category: "VENDA" as PropertyCategory,
    condition: "USADO" as PropertyCondition,
    price: "",
    rentPrice: "",
    condoFee: "",
    iptu: "",
    area: "",
    totalArea: "",
    bedrooms: "0",
    suites: "0",
    bathrooms: "0",
    parkingSpaces: "0",
    floor: "",
    yearBuilt: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    isFeatured: false,
    isExclusive: false,
    amenities: [] as string[],
  });

  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  // Load property data if editing
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        description: property.description || "",
        shortDescription: property.shortDescription || "",
        type: property.type,
        category: property.category,
        condition: property.condition,
        price: String(property.price || ""),
        rentPrice: String(property.rentPrice || ""),
        condoFee: String(property.condoFee || ""),
        iptu: String(property.iptu || ""),
        area: String(property.area || ""),
        totalArea: String(property.totalArea || ""),
        bedrooms: String(property.bedrooms || "0"),
        suites: String(property.suites || "0"),
        bathrooms: String(property.bathrooms || "0"),
        parkingSpaces: String(property.parkingSpaces || "0"),
        floor: String(property.floor || ""),
        yearBuilt: String(property.yearBuilt || ""),
        address: property.address || "",
        number: property.number || "",
        complement: property.complement || "",
        neighborhood: property.neighborhood || "",
        city: property.city || "",
        state: property.state || "",
        zipCode: property.zipCode || "",
        isFeatured: property.isFeatured || false,
        isExclusive: property.isExclusive || false,
        amenities: property.amenities || [],
      });
      setImages(property.images || []);
      setThumbnail(property.thumbnail || null);
    } else {
      // Reset form
      setFormData({
        title: "",
        description: "",
        shortDescription: "",
        type: "APARTAMENTO",
        category: "VENDA",
        condition: "USADO",
        price: "",
        rentPrice: "",
        condoFee: "",
        iptu: "",
        area: "",
        totalArea: "",
        bedrooms: "0",
        suites: "0",
        bathrooms: "0",
        parkingSpaces: "0",
        floor: "",
        yearBuilt: "",
        address: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        isFeatured: false,
        isExclusive: false,
        amenities: [],
      });
      setImages([]);
      setThumbnail(null);
    }
    setActiveTab("basic");
    setError("");
  }, [property, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Função para comprimir e converter imagem para WebP
  // Marca d'água é aplicada no servidor via /admin/configuracoes/marca-dagua
  const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");

    const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
    const validUrls: string[] = [];

    // Processar uma imagem
    const processImage = async (file: File, index: number): Promise<string | null> => {
      try {
        const compressedFile = await compressImage(file, 1920, 0.8);
        console.log(`Imagem ${index + 1}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

        const formDataUpload = new FormData();
        formDataUpload.append("file", compressedFile);
        formDataUpload.append("folder", "properties");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) {
          console.error(`Erro no upload da imagem ${index + 1}`);
          return null;
        }

        const data = await response.json();
        return data.url || null;
      } catch (error) {
        console.error("Erro no upload:", error);
        return null;
      }
    };

    try {
      // Processar em lotes de 4 imagens simultâneas
      const BATCH_SIZE = 4;
      for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
        const batch = imageFiles.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map((file, idx) => processImage(file, i + idx))
        );
        validUrls.push(...results.filter((url): url is string => url !== null));
      }

      setImages((prev) => [...prev, ...validUrls]);

      if (!thumbnail && validUrls.length > 0) {
        setThumbnail(validUrls[0]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload das imagens");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    if (thumbnail === url) {
      const remaining = images.filter((img) => img !== url);
      setThumbnail(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const setAsThumbnail = (url: string) => {
    setThumbnail(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription || undefined,
        type: formData.type,
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price) || 0,
        rentPrice: formData.rentPrice ? parseFloat(formData.rentPrice) : undefined,
        condoFee: formData.condoFee ? parseFloat(formData.condoFee) : undefined,
        iptu: formData.iptu ? parseFloat(formData.iptu) : undefined,
        area: parseFloat(formData.area) || 0,
        totalArea: formData.totalArea ? parseFloat(formData.totalArea) : undefined,
        bedrooms: parseInt(formData.bedrooms) || 0,
        suites: parseInt(formData.suites) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        parkingSpaces: parseInt(formData.parkingSpaces) || 0,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
        address: formData.address,
        number: formData.number || undefined,
        complement: formData.complement || undefined,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode || undefined,
        isFeatured: formData.isFeatured,
        isExclusive: formData.isExclusive,
        amenities: formData.amenities,
        thumbnail: thumbnail || undefined,
        images: images,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar imóvel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Informações", icon: RiHome4Line },
    { id: "price", label: "Preços", icon: RiMoneyDollarCircleLine },
    { id: "location", label: "Localização", icon: RiMapPinLine },
    { id: "features", label: "Características", icon: RiSettings4Line },
    { id: "images", label: "Fotos", icon: RiImageAddLine },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 lg:inset-10 bg-white dark:bg-neutral-900 rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {property ? "Editar Imóvel" : "Novo Imóvel"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 lg:p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Título *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Apartamento 3 quartos no Centro"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Tipo *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        {Object.entries(propertyTypeLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Categoria *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        {Object.entries(propertyCategoryLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Condição
                      </label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        {Object.entries(propertyConditionLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Destaque</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isExclusive"
                          checked={formData.isExclusive}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Exclusivo</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Descrição curta
                      </label>
                      <input
                        type="text"
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        placeholder="Resumo do imóvel em uma linha"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Descrição completa *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder="Descreva o imóvel em detalhes..."
                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Price */}
              {activeTab === "price" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Preço de Venda *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          placeholder="0,00"
                          className="w-full h-12 pl-12 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Preço de Aluguel
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                        <input
                          type="number"
                          name="rentPrice"
                          value={formData.rentPrice}
                          onChange={handleInputChange}
                          placeholder="0,00"
                          className="w-full h-12 pl-12 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Condomínio
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                        <input
                          type="number"
                          name="condoFee"
                          value={formData.condoFee}
                          onChange={handleInputChange}
                          placeholder="0,00"
                          className="w-full h-12 pl-12 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        IPTU (anual)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                        <input
                          type="number"
                          name="iptu"
                          value={formData.iptu}
                          onChange={handleInputChange}
                          placeholder="0,00"
                          className="w-full h-12 pl-12 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {activeTab === "location" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Endereço *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Rua, Avenida..."
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Número
                      </label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        placeholder="Apto 101, Bloco A..."
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        required
                        placeholder="Centro"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        CEP
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="São Paulo"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Estado *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="SP"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              {activeTab === "features" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Área (m²) *
                      </label>
                      <input
                        type="number"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        required
                        placeholder="0"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Área Total (m²)
                      </label>
                      <input
                        type="number"
                        name="totalArea"
                        value={formData.totalArea}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Quartos
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Suítes
                      </label>
                      <input
                        type="number"
                        name="suites"
                        value={formData.suites}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Banheiros
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Vagas
                      </label>
                      <input
                        type="number"
                        name="parkingSpaces"
                        value={formData.parkingSpaces}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Andar
                      </label>
                      <input
                        type="number"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Ano de construção
                      </label>
                      <input
                        type="number"
                        name="yearBuilt"
                        value={formData.yearBuilt}
                        onChange={handleInputChange}
                        placeholder="2020"
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                      Comodidades
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {amenitiesList.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.amenities.includes(amenity)
                              ? "bg-orange-500 text-white"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full h-40 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
                          <span className="text-neutral-600 dark:text-neutral-400">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <RiImageAddLine className="w-8 h-8 text-neutral-400" />
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Clique para adicionar fotos
                          </span>
                          <span className="text-xs text-neutral-500">
                            JPEG, PNG, WebP ou GIF (máx. 10MB cada)
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {images.map((url, i) => (
                        <div
                          key={i}
                          className={`relative aspect-square rounded-xl overflow-hidden group ${
                            thumbnail === url ? "ring-2 ring-orange-500" : ""
                          }`}
                        >
                          <Image src={url} alt="" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAsThumbnail(url)}
                              className="p-2 bg-white rounded-full text-neutral-700 hover:text-orange-500"
                              title="Definir como capa"
                            >
                              {thumbnail === url ? (
                                <RiStarFill className="w-5 h-5 text-orange-500" />
                              ) : (
                                <RiStarLine className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(url)}
                              className="p-2 bg-white rounded-full text-neutral-700 hover:text-red-500"
                              title="Remover"
                            >
                              <RiDeleteBinLine className="w-5 h-5" />
                            </button>
                          </div>
                          {thumbnail === url && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
                              Capa
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 lg:p-6 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <RiSaveLine className="w-5 h-5" />
                    {property ? "Salvar Alterações" : "Criar Imóvel"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
