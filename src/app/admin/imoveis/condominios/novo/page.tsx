"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiBuilding4Line,
  RiMapPinLine,
  RiImageLine,
  RiSettings4Line,
  RiCheckLine,
  RiAddLine,
  RiDeleteBinLine,
  RiHome4Line,
  RiUploadCloud2Line,
  RiCloseLine,
  RiEditLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiFullscreenLine,
  RiUser3Line,
  RiPhoneLine,
  RiFilePdfLine,
  RiLayoutLine,
  RiRocketLine,
  RiCalendarLine,
  RiFileListLine,
} from "react-icons/ri";
import Image from "next/image";

const amenitiesOptions = [
  "Piscina",
  "Academia",
  "Salão de Festas",
  "Churrasqueira",
  "Playground",
  "Quadra Poliesportiva",
  "Quadra de Tênis",
  "Sauna",
  "Spa",
  "Cinema",
  "Coworking",
  "Pet Place",
  "Brinquedoteca",
  "Espaço Gourmet",
  "Jardim",
  "Portaria 24h",
  "Segurança",
  "CFTV",
  "Elevador",
  "Gerador",
  "Bicicletário",
  "Lavanderia",
  "Área Verde",
  "Lago",
  "Trilha",
  "Campo de Futebol",
  "Pista de Caminhada",
  "Heliponto",
];

interface Tower {
  id?: string;
  name: string;
  floors: string;
  unitsPerFloor: string;
  totalUnits: string;
  availableSizes: string[];
}

interface CondoImage {
  url: string;
  caption: string;
}

interface CondoContact {
  name: string;
  phone: string;
  role: string;
}

interface CondoMap {
  url: string;
  name: string;
  type: string;
}

interface FloorPlan {
  url: string;
  name: string;
  units: string;
}

function CondominioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    condoCategory: "RESIDENCIAL", // RESIDENCIAL, COMERCIAL, HIBRIDO
    condoType: "VERTICAL", // VERTICAL, HORIZONTAL, MISTO
    builderId: "", // ID da construtora vinculada
    // Endereço real
    address: "",
    number: "",
    neighborhood: "Sua Cidade",
    city: "Santana de Parnaíba",
    state: "SP",
    zipCode: "",
    // Endereço fake
    fakeAddress: "",
    fakeNumber: "",
    fakeNeighborhood: "",
    fakeCity: "",
    fakeState: "",
    fakeZipCode: "",
    showRealAddress: false,
    // Características
    totalUnits: "",
    totalLots: "",
    yearBuilt: "",
    builder: "",
    // Metragens disponíveis
    availableSizes: [] as string[],
    // Tipologias
    hasApartment: false,
    hasCobertura: false,
    hasGarden: false,
    hasFlat: false,
    hasStudio: false,
    hasHouse: false,
    hasCasaTerrea: false,
    hasSobrado: false,
    hasTerrain: false,
    hasCommercial: false,
    // Amenidades
    amenities: [] as string[],
    hasSportsAdvisory: false,
    activityScheduleImage: "", // Imagem da grade de atividades
    // Contatos (antigo - portaria)
    adminName: "",
    adminPhone: "",
    adminEmail: "",
    porterPhone: "",
    // Administradora do condomínio
    managementCompany: "",
    managementCompanyPhone: "",
    managementCompanyEmail: "",
    managementCompanyWebsite: "",
    // Projeto em fase de lançamento
    isLaunchProject: false,
    launchStage: "",
    expectedDelivery: "",
    launchDescription: "",
    // Mídia
    thumbnail: "",
    images: [] as string[],
    videos: [] as string[],
    virtualTour: "",
    // Arquivos internos (não aparecem no site)
    internalMap: "",  // Mapa/PDF interno (legacy)
    implantation: "", // PDF de implantação
    // SEO
    metaTitle: "",
    metaDescription: "",
    // Status
    isActive: true,
    isFeatured: false,
  });

  // Torres/Blocos (para verticais)
  const [towers, setTowers] = useState<Tower[]>([]);
  const [newSizeInput, setNewSizeInput] = useState("");
  
  // Imagens com legendas
  const [condoImages, setCondoImages] = useState<CondoImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState<number | null>(null);
  
  // Contatos do condomínio
  const [contacts, setContacts] = useState<CondoContact[]>([]);
  
  // Mapas do condomínio
  const [maps, setMaps] = useState<CondoMap[]>([]);
  
  // Plantas com unidades
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  
  // Modal de visualização do mapa com zoom
  const [showMapViewer, setShowMapViewer] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Modal de visualização da grade de atividades
  const [showActivityScheduleModal, setShowActivityScheduleModal] = useState(false);
  const [activityZoom, setActivityZoom] = useState(1);
  const [activityPosition, setActivityPosition] = useState({ x: 0, y: 0 });
  const [isActivityDragging, setIsActivityDragging] = useState(false);
  const [activityDragStart, setActivityDragStart] = useState({ x: 0, y: 0 });
  
  // Lista de construtoras cadastradas
  const [builders, setBuilders] = useState<{id: string; name: string}[]>([]);

  // Carregar dados se editando
  useEffect(() => {
    if (editId) {
      setLoading(true);
      fetch(`/api/admin/condominiums/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setFormData({
              name: data.name || "",
              description: data.description || "",
              condoCategory: data.condoCategory || "RESIDENCIAL",
              condoType: data.condoType || "VERTICAL",
              builderId: data.builderId || "",
              address: data.address || "",
              number: data.number || "",
              neighborhood: data.neighborhood || "Sua Cidade",
              city: data.city || "Santana de Parnaíba",
              state: data.state || "SP",
              zipCode: data.zipCode || "",
              fakeAddress: data.fakeAddress || "",
              fakeNumber: data.fakeNumber || "",
              fakeNeighborhood: data.fakeNeighborhood || "",
              fakeCity: data.fakeCity || "",
              fakeState: data.fakeState || "",
              fakeZipCode: data.fakeZipCode || "",
              showRealAddress: data.showRealAddress || false,
              totalUnits: data.totalUnits?.toString() || "",
              totalLots: data.totalLots?.toString() || "",
              yearBuilt: data.yearBuilt?.toString() || "",
              builder: data.builder || "",
              availableSizes: data.availableSizes || [],
              hasApartment: data.hasApartment || false,
              hasCobertura: data.hasCobertura || false,
              hasGarden: data.hasGarden || false,
              hasFlat: data.hasFlat || false,
              hasStudio: data.hasStudio || false,
              hasHouse: data.hasHouse || false,
              hasCasaTerrea: data.hasCasaTerrea || false,
              hasSobrado: data.hasSobrado || false,
              hasTerrain: data.hasTerrain || false,
              hasCommercial: data.hasCommercial || false,
              amenities: data.amenities || [],
              hasSportsAdvisory: data.hasSportsAdvisory || false,
              activityScheduleImage: data.activityScheduleImage || "",
              adminName: data.adminName || "",
              adminPhone: data.adminPhone || "",
              adminEmail: data.adminEmail || "",
              porterPhone: data.porterPhone || "",
              managementCompany: data.managementCompany || "",
              managementCompanyPhone: data.managementCompanyPhone || "",
              managementCompanyEmail: data.managementCompanyEmail || "",
              managementCompanyWebsite: data.managementCompanyWebsite || "",
              isLaunchProject: data.isLaunchProject || false,
              launchStage: data.launchStage || "",
              expectedDelivery: data.expectedDelivery?.split("T")[0] || "",
              launchDescription: data.launchDescription || "",
              thumbnail: data.thumbnail || "",
              images: data.images || [],
              videos: data.videos || [],
              virtualTour: data.virtualTour || "",
              internalMap: data.internalMap || "",
              implantation: data.implantation || "",
              metaTitle: data.metaTitle || "",
              metaDescription: data.metaDescription || "",
              isActive: data.isActive ?? true,
              isFeatured: data.isFeatured || false,
            });
            // Carregar torres
            if (data.towers) {
              setTowers(data.towers.map((t: any) => ({
                id: t.id,
                name: t.name || "",
                floors: t.floors?.toString() || "",
                unitsPerFloor: t.unitsPerFloor?.toString() || "",
                totalUnits: t.totalUnits?.toString() || "",
                availableSizes: t.availableSizes || [],
              })));
            }
            // Carregar imagens existentes no estado condoImages
            if (data.images && data.images.length > 0) {
              setCondoImages(data.images.map((url: string) => ({ url, caption: "" })));
            }
            // Carregar contatos
            if (data.contacts) {
              setContacts(data.contacts);
            }
            // Carregar mapas
            if (data.maps) {
              setMaps(data.maps);
            }
            // Carregar plantas
            if (data.floorPlans) {
              setFloorPlans(data.floorPlans);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [editId]);

  // Carregar lista de construtoras
  useEffect(() => {
    fetch("/api/admin/business-partners?type=CONSTRUTORA")
      .then((res) => res.json())
      .then((data) => {
        if (data.partners) {
          setBuilders(data.partners.map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch((err) => console.error("Erro ao carregar construtoras:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Extrair URLs das imagens do condoImages
      const imageUrls = condoImages.map(img => img.url);
      
      const payload = {
        ...formData,
        builderId: formData.builderId || null, // Garantir que builderId seja null se vazio
        images: imageUrls, // Usar as imagens do estado condoImages
        totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : null,
        totalLots: formData.totalLots ? parseInt(formData.totalLots) : null,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
        expectedDelivery: formData.expectedDelivery || null,
        contacts, // Contatos do condomínio
        maps, // Mapas do condomínio
        implantation: formData.implantation, // PDF de implantação
        internalMap: formData.internalMap, // Mapa interno
        floorPlans, // Plantas com unidades
        towers: towers.map(t => ({
          id: t.id,
          name: t.name,
          floors: t.floors ? parseInt(t.floors) : null,
          unitsPerFloor: t.unitsPerFloor ? parseInt(t.unitsPerFloor) : null,
          totalUnits: t.totalUnits ? parseInt(t.totalUnits) : null,
          availableSizes: t.availableSizes,
        })),
      };

      const url = isEditing
        ? `/api/admin/condominiums/${editId}`
        : "/api/admin/condominiums";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/imoveis/condominios");
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao salvar condomínio");
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addSize = () => {
    if (newSizeInput.trim() && !formData.availableSizes.includes(newSizeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        availableSizes: [...prev.availableSizes, newSizeInput.trim()]
      }));
      setNewSizeInput("");
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      availableSizes: prev.availableSizes.filter(s => s !== size)
    }));
  };

  const addTower = () => {
    setTowers(prev => [...prev, {
      name: "", // Nome livre para padronização
      floors: "",
      unitsPerFloor: "",
      totalUnits: "",
      availableSizes: [],
    }]);
  };

  const updateTower = (index: number, field: keyof Tower, value: any) => {
    setTowers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const removeTower = (index: number) => {
    setTowers(prev => prev.filter((_, i) => i !== index));
  };

  const isVertical = formData.condoType === "VERTICAL" || formData.condoType === "MISTO";
  const isHorizontal = formData.condoType === "HORIZONTAL" || formData.condoType === "MISTO" || formData.condoType === "VILLAGIO";
  const isVillagio = formData.condoType === "VILLAGIO";

  const tabs = [
    { id: "info", label: "Informações", icon: RiBuilding4Line },
    { id: "location", label: "Localização", icon: RiMapPinLine },
    { id: "features", label: "Características", icon: RiSettings4Line },
    { id: "docs", label: "Documentos", icon: RiFileListLine },
    { id: "media", label: "Mídia", icon: RiImageLine },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0B2545] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/imoveis/condominios"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {isEditing ? "Editar Condomínio" : "Novo Condomínio"}
            </h1>
            <p className="text-sm text-neutral-500">
              {isEditing ? "Atualize as informações do condomínio" : "Cadastre um novo condomínio"}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2545] text-white font-medium hover:bg-[#081733] disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RiSaveLine className="w-5 h-5" />
          )}
          Salvar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#0B2545] text-[#0B2545] dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Informações */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Básicos */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Dados Básicos</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Nome do Condomínio *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Sua Cidade 1"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoria *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "RESIDENCIAL", label: "Residencial", desc: "Moradia" },
                  { value: "COMERCIAL", label: "Comercial", desc: "Negócios" },
                  { value: "HIBRIDO", label: "Híbrido", desc: "Ambos" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, condoCategory: opt.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.condoCategory === opt.value
                        ? "border-[#0B2545] bg-[#0B2545]/5"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-neutral-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Formato *</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "VERTICAL", label: "Vertical", desc: "Edifícios/Apartamentos" },
                  { value: "HORIZONTAL", label: "Horizontal", desc: "Casas/Terrenos" },
                  { value: "VILLAGIO", label: "Villagio", desc: "Casas c/ Unidade" },
                  { value: "MISTO", label: "Misto", desc: "Ambos" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, condoType: opt.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.condoType === opt.value
                        ? "border-[#0B2545] bg-[#0B2545]/5"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-neutral-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Descreva o condomínio..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Construtora Vinculada</label>
                <select
                  value={formData.builderId}
                  onChange={(e) => setFormData({ ...formData, builderId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <option value="">Selecione uma construtora</option>
                  {builders.map((builder) => (
                    <option key={builder.id} value={builder.id}>
                      {builder.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-1">Vincule a uma construtora cadastrada</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ano de Construção</label>
                <input
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                  placeholder="2020"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Construtora (texto livre)</label>
              <input
                type="text"
                value={formData.builder}
                onChange={(e) => setFormData({ ...formData, builder: e.target.value })}
                placeholder="Nome da construtora (caso não esteja cadastrada)"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
              <p className="text-xs text-neutral-500 mt-1">Use se a construtora não estiver cadastrada no sistema</p>
            </div>
          </div>

          {/* Metragens Disponíveis */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Metragens Disponíveis</h2>
            <p className="text-sm text-neutral-500">Adicione as metragens disponíveis no condomínio</p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                placeholder="Ex: 120m²"
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2.5 rounded-xl bg-[#0B2545] text-white hover:bg-[#081733]"
              >
                <RiAddLine className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.availableSizes.map((size) => (
                <span
                  key={size}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="ml-1 text-neutral-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.availableSizes.length === 0 && (
                <p className="text-sm text-neutral-400">Nenhuma metragem adicionada</p>
              )}
            </div>
          </div>

          {/* Unidades */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Unidades</h2>

            <div className="grid grid-cols-2 gap-4">
              {isVertical && (
                <div>
                  <label className="block text-sm font-medium mb-2">Total de Unidades</label>
                  <input
                    type="number"
                    value={formData.totalUnits}
                    onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                    placeholder="200"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              )}
              {isHorizontal && (
                <div>
                  <label className="block text-sm font-medium mb-2">Total de Lotes</label>
                  <input
                    type="number"
                    value={formData.totalLots}
                    onChange={(e) => setFormData({ ...formData, totalLots: e.target.value })}
                    placeholder="150"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Torres/Blocos (apenas para verticais) */}
          {isVertical && (
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-neutral-900 dark:text-white">Torres / Blocos</h2>
                  <p className="text-sm text-neutral-500">Cadastre as torres do condomínio</p>
                </div>
                <button
                  type="button"
                  onClick={addTower}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B2545] text-white text-sm hover:bg-[#081733]"
                >
                  <RiAddLine className="w-4 h-4" />
                  Adicionar Torre
                </button>
              </div>

              {towers.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  <RiBuilding4Line className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma torre cadastrada</p>
                  <p className="text-sm">Clique em "Adicionar Torre" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {towers.map((tower, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-neutral-500 mb-1">Nome da Torre/Bloco</label>
                          <input
                            type="text"
                            value={tower.name}
                            onChange={(e) => updateTower(index, "name", e.target.value)}
                            placeholder="Ex: Torre A, Bloco 1, Edifício Norte..."
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTower(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-5"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Andares</label>
                          <input
                            type="number"
                            value={tower.floors}
                            onChange={(e) => updateTower(index, "floors", e.target.value)}
                            placeholder="20"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Unid./Andar</label>
                          <input
                            type="number"
                            value={tower.unitsPerFloor}
                            onChange={(e) => updateTower(index, "unitsPerFloor", e.target.value)}
                            placeholder="4"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1">Total Unid.</label>
                          <input
                            type="number"
                            value={tower.totalUnits}
                            onChange={(e) => updateTower(index, "totalUnits", e.target.value)}
                            placeholder="80"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Localização */}
      {activeTab === "location" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Endereço</h2>

            {/* Busca por CEP */}
            <div className="flex gap-4">
              <div className="w-48">
                <label className="block text-sm font-medium mb-2">CEP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.zipCode.replace(/(\d{5})(\d)/, "$1-$2")}
                    onChange={(e) => {
                      const cep = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setFormData({ ...formData, zipCode: cep });
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (formData.zipCode.length !== 8) {
                        alert("CEP deve ter 8 dígitos");
                        return;
                      }
                      try {
                        const cep = formData.zipCode.replace(/\D/g, "");
                        const res = await fetch(`/api/cep?cep=${cep}`);
                        if (!res.ok) {
                          alert("Erro na requisição do CEP");
                          return;
                        }
                        const data = await res.json();
                        if (data.erro) {
                          alert("CEP não encontrado");
                          return;
                        }
                        setFormData({
                          ...formData,
                          address: data.logradouro || "",
                          neighborhood: data.bairro || "",
                          city: data.localidade || "",
                          state: data.uf || "",
                        });
                      } catch (error: any) {
                        console.error("Erro ao buscar CEP:", error);
                        alert("Erro ao buscar CEP: " + (error.message || "Verifique sua conexão"));
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm hover:bg-[#081733] whitespace-nowrap"
                  >
                    Buscar
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, Alameda..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Número</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="123"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bairro</label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="Sua Cidade"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Santana de Parnaíba"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="SP"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
          </div>


          {/* Mapa Interno */}
          <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-4">
            <h2 className="font-semibold text-blue-800 dark:text-blue-300">Mapa Interno</h2>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Upload de mapa ou PDF do condomínio. Este arquivo é apenas para uso interno e não aparece no site.
            </p>

            {formData.internalMap ? (
              <div className="space-y-4">
                {/* Preview do mapa */}
                {!formData.internalMap.endsWith('.pdf') && (
                  <div 
                    className="relative rounded-xl overflow-hidden border border-blue-200 dark:border-blue-700 cursor-pointer group"
                    onClick={() => {
                      setMapZoom(1);
                      setMapPosition({ x: 0, y: 0 });
                      setShowMapViewer(true);
                    }}
                  >
                    <img 
                      src={formData.internalMap} 
                      alt="Mapa do condomínio" 
                      className="w-full max-h-[300px] object-contain bg-white"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-neutral-800/90 px-4 py-2 rounded-lg flex items-center gap-2">
                        <RiZoomInLine className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">Clique para ampliar</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-700">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Arquivo enviado</p>
                    <a 
                      href={formData.internalMap} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate block"
                    >
                      {formData.internalMap}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMapZoom(1);
                      setMapPosition({ x: 0, y: 0 });
                      setShowMapViewer(true);
                    }}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                    title="Visualizar com zoom"
                  >
                    <RiZoomInLine className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, internalMap: "" })}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="internal-map-upload"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formDataUpload = new FormData();
                    formDataUpload.append("file", file);
                    
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formDataUpload,
                      });
                      
                      if (res.ok) {
                        const data = await res.json();
                        setFormData(prev => ({ ...prev, internalMap: data.url }));
                      }
                    } catch (error) {
                      console.error("Erro no upload:", error);
                    }
                    e.target.value = "";
                  }}
                />
                <label htmlFor="internal-map-upload" className="cursor-pointer">
                  <RiUploadCloud2Line className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Clique para fazer upload
                  </p>
                  <p className="text-xs text-blue-500 mt-1">PDF, PNG, JPG até 10MB</p>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Características */}
      {activeTab === "features" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Amenidades */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Amenidades</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {amenitiesOptions.map((amenity) => (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    formData.amenities.includes(amenity)
                      ? "bg-[#0B2545]/10 border border-[#0B2545]/30"
                      : "bg-neutral-50 dark:bg-neutral-800 border border-transparent hover:border-neutral-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="sr-only"
                  />
                  {formData.amenities.includes(amenity) && (
                    <RiCheckLine className="w-4 h-4 text-[#0B2545]" />
                  )}
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assessoria Esportiva */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Serviços</h2>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasSportsAdvisory}
                onChange={(e) => setFormData({ ...formData, hasSportsAdvisory: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300"
              />
              <div>
                <p className="font-medium text-sm">Assessoria Esportiva</p>
                <p className="text-xs text-neutral-500">Gestão esportiva profissional no condomínio</p>
              </div>
            </label>

            {/* Grade de Atividades - Aparece quando tem assessoria esportiva */}
            {formData.hasSportsAdvisory && (
              <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30">
                <label className="block text-sm font-medium mb-2 text-green-800 dark:text-green-400">
                  📅 Grade de Atividades
                </label>
                <p className="text-xs text-green-600 dark:text-green-500 mb-3">
                  Anexe a imagem da grade de atividades da assessoria esportiva
                </p>
                
                {formData.activityScheduleImage ? (
                  <div className="relative group">
                    <img 
                      src={formData.activityScheduleImage} 
                      alt="Grade de Atividades" 
                      className="w-full max-h-64 object-contain rounded-lg border border-green-200 dark:border-green-500/30 cursor-pointer"
                      onClick={() => setShowActivityScheduleModal(true)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowActivityScheduleModal(true)}
                        className="px-3 py-1.5 bg-white text-neutral-800 rounded-lg text-xs font-medium"
                      >
                        🔍 Ampliar
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, activityScheduleImage: "" })}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium"
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formDataUpload = new FormData();
                          formDataUpload.append("file", file);
                          try {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: formDataUpload,
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setFormData({ ...formData, activityScheduleImage: data.url });
                            }
                          } catch (error) {
                            console.error("Erro ao fazer upload:", error);
                          }
                        }
                      }}
                      className="hidden"
                      id="activityScheduleUpload"
                    />
                    <label
                      htmlFor="activityScheduleUpload"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 dark:border-green-500/50 rounded-xl cursor-pointer hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                    >
                      <span className="text-3xl mb-2">📅</span>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Clique para anexar</span>
                      <span className="text-xs text-green-600 dark:text-green-500">PNG, JPG ou WEBP</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contatos do Condomínio (visualização interna) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <RiUser3Line className="w-5 h-5" />
                  Contatos do Condomínio
                </h2>
                <p className="text-sm text-purple-600 dark:text-purple-400">Visualização interna - Síndico, Zelador, etc.</p>
              </div>
              <button
                type="button"
                onClick={() => setContacts(prev => [...prev, { name: "", phone: "", role: "" }])}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700"
              >
                <RiAddLine className="w-4 h-4" />
                Adicionar Contato
              </button>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-6 text-purple-400">
                <RiUser3Line className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum contato cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-600">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].role = e.target.value;
                          setContacts(newContacts);
                        }}
                        placeholder="Função (ex: Síndico)"
                        className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].name = e.target.value;
                          setContacts(newContacts);
                        }}
                        placeholder="Nome"
                        className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => {
                          const newContacts = [...contacts];
                          newContacts[index].phone = e.target.value;
                          setContacts(newContacts);
                        }}
                        placeholder="Telefone"
                        className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setContacts(prev => prev.filter((_, i) => i !== index))}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Administradora do Condomínio */}
          <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 space-y-4">
            <h2 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <RiBuilding4Line className="w-5 h-5" />
              Administradora
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-300">Nome da Empresa</label>
              <input
                type="text"
                value={formData.managementCompany}
                onChange={(e) => setFormData({ ...formData, managementCompany: e.target.value })}
                placeholder="Ex: Administradora XYZ"
                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-600 bg-white dark:bg-neutral-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-300">Telefone</label>
                <input
                  type="text"
                  value={formData.managementCompanyPhone}
                  onChange={(e) => setFormData({ ...formData, managementCompanyPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-600 bg-white dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-300">Email</label>
                <input
                  type="email"
                  value={formData.managementCompanyEmail}
                  onChange={(e) => setFormData({ ...formData, managementCompanyEmail: e.target.value })}
                  placeholder="contato@admin.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-600 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-blue-800 dark:text-blue-300">Website</label>
              <input
                type="url"
                value={formData.managementCompanyWebsite}
                onChange={(e) => setFormData({ ...formData, managementCompanyWebsite: e.target.value })}
                placeholder="https://www.administradora.com.br"
                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-600 bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          {/* Contatos Antigos (Portaria) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiPhoneLine className="w-5 h-5" />
              Portaria / Outros
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Contato</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  placeholder="Nome"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone Portaria</label>
                <input
                  type="text"
                  value={formData.porterPhone}
                  onChange={(e) => setFormData({ ...formData, porterPhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Projeto em Fase de Lançamento */}
          <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 transition-all ${
            formData.isLaunchProject 
              ? "bg-gradient-to-r from-orange-50 to-emerald-50 dark:from-orange-900/20 dark:to-emerald-900/20 border-orange-300 dark:border-orange-600"
              : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formData.isLaunchProject ? "bg-orange-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                }`}>
                  <RiRocketLine className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-neutral-900 dark:text-white">Projeto em Fase de Lançamento</h2>
                  <p className="text-sm text-neutral-500">Marque se este é um empreendimento em construção</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isLaunchProject}
                  onChange={(e) => setFormData({ ...formData, isLaunchProject: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {formData.isLaunchProject && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-orange-200 dark:border-orange-700">
                <div>
                  <label className="block text-sm font-medium mb-2 text-orange-800 dark:text-orange-300">Estágio da Obra</label>
                  <select
                    value={formData.launchStage}
                    onChange={(e) => setFormData({ ...formData, launchStage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-orange-200 dark:border-orange-600 bg-white dark:bg-neutral-900"
                  >
                    <option value="">Selecione...</option>
                    <option value="PLANTA">Na Planta</option>
                    <option value="FUNDACAO">Fundação</option>
                    <option value="ESTRUTURA">Estrutura</option>
                    <option value="ACABAMENTO">Acabamento</option>
                    <option value="PRONTO">Pronto para Entrega</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-orange-800 dark:text-orange-300">
                    <RiCalendarLine className="w-4 h-4 inline mr-1" />
                    Previsão de Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-orange-200 dark:border-orange-600 bg-white dark:bg-neutral-900"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium mb-2 text-orange-800 dark:text-orange-300">Descrição</label>
                  <textarea
                    value={formData.launchDescription}
                    onChange={(e) => setFormData({ ...formData, launchDescription: e.target.value })}
                    rows={2}
                    placeholder="Detalhes sobre o lançamento..."
                    className="w-full px-4 py-2.5 rounded-xl border border-orange-200 dark:border-orange-600 bg-white dark:bg-neutral-900 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Documentos (Mapas, Implantação, Plantas) */}
      {activeTab === "docs" && (
        <div className="space-y-6">
          {/* Mapas do Condomínio */}
          <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <RiMapPinLine className="w-5 h-5" />
                  Mapas do Condomínio
                </h2>
                <p className="text-sm text-blue-600 dark:text-blue-400">Anexe mapas (imagem ou PDF) para visualização interna</p>
              </div>
            </div>

            {/* Upload de Mapas */}
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-6 text-center">
              <input
                type="file"
                id="map-upload"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const formDataUpload = new FormData();
                  formDataUpload.append("file", file);
                  
                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formDataUpload,
                    });
                    
                    if (res.ok) {
                      const data = await res.json();
                      setMaps(prev => [...prev, { 
                        url: data.url, 
                        name: file.name.replace(/\.[^/.]+$/, ""),
                        type: file.type
                      }]);
                    }
                  } catch (error) {
                    console.error("Erro no upload:", error);
                  }
                  e.target.value = "";
                }}
              />
              <label htmlFor="map-upload" className="cursor-pointer">
                <RiUploadCloud2Line className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Clique para fazer upload</p>
                <p className="text-xs text-blue-500 mt-1">PDF, PNG, JPG até 10MB</p>
              </label>
            </div>

            {/* Lista de Mapas */}
            {maps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maps.map((map, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-600">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      {map.type?.includes("pdf") ? (
                        <RiFilePdfLine className="w-6 h-6 text-red-500" />
                      ) : (
                        <RiImageLine className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={map.name}
                        onChange={(e) => {
                          const newMaps = [...maps];
                          newMaps[index].name = e.target.value;
                          setMaps(newMaps);
                        }}
                        className="w-full text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
                        placeholder="Nome do mapa"
                      />
                      <a href={map.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                        Visualizar
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaps(prev => prev.filter((_, i) => i !== index))}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Implantação (PDF) */}
          <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 space-y-4">
            <h2 className="font-semibold text-green-900 dark:text-green-300 flex items-center gap-2">
              <RiLayoutLine className="w-5 h-5" />
              Implantação do Condomínio
            </h2>
            <p className="text-sm text-green-600 dark:text-green-400">PDF de implantação para condomínios novos</p>

            {formData.implantation ? (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-green-200 dark:border-green-700">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                  <RiFilePdfLine className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Implantação anexada</p>
                  <a href={formData.implantation} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">
                    Visualizar PDF
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, implantation: "" })}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-xl p-6 text-center">
                <input
                  type="file"
                  id="implantation-upload"
                  accept=".pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formDataUpload = new FormData();
                    formDataUpload.append("file", file);
                    
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formDataUpload,
                      });
                      
                      if (res.ok) {
                        const data = await res.json();
                        setFormData(prev => ({ ...prev, implantation: data.url }));
                      }
                    } catch (error) {
                      console.error("Erro no upload:", error);
                    }
                    e.target.value = "";
                  }}
                />
                <label htmlFor="implantation-upload" className="cursor-pointer">
                  <RiUploadCloud2Line className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Clique para fazer upload</p>
                  <p className="text-xs text-green-500 mt-1">Apenas PDF até 10MB</p>
                </label>
              </div>
            )}
          </div>

          {/* Plantas com Unidades */}
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <RiHome4Line className="w-5 h-5" />
                  Plantas do Condomínio
                </h2>
                <p className="text-sm text-amber-600 dark:text-amber-400">Anexe plantas com as unidades referentes</p>
              </div>
            </div>

            {/* Upload de Plantas */}
            <div className="border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-xl p-6 text-center">
              <input
                type="file"
                id="floorplan-upload"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const formDataUpload = new FormData();
                  formDataUpload.append("file", file);
                  
                  try {
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formDataUpload,
                    });
                    
                    if (res.ok) {
                      const data = await res.json();
                      setFloorPlans(prev => [...prev, { 
                        url: data.url, 
                        name: file.name.replace(/\.[^/.]+$/, ""),
                        units: ""
                      }]);
                    }
                  } catch (error) {
                    console.error("Erro no upload:", error);
                  }
                  e.target.value = "";
                }}
              />
              <label htmlFor="floorplan-upload" className="cursor-pointer">
                <RiUploadCloud2Line className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Clique para fazer upload</p>
                <p className="text-xs text-amber-500 mt-1">PDF, PNG, JPG até 10MB</p>
              </label>
            </div>

            {/* Lista de Plantas */}
            {floorPlans.length > 0 && (
              <div className="space-y-3">
                {floorPlans.map((plan, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-600">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        {plan.url?.includes(".pdf") ? (
                          <RiFilePdfLine className="w-6 h-6 text-red-500" />
                        ) : (
                          <RiImageLine className="w-6 h-6 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const newPlans = [...floorPlans];
                            newPlans[index].name = e.target.value;
                            setFloorPlans(newPlans);
                          }}
                          className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                          placeholder="Nome da planta (ex: Planta 2 quartos)"
                        />
                        <input
                          type="text"
                          value={plan.units}
                          onChange={(e) => {
                            const newPlans = [...floorPlans];
                            newPlans[index].units = e.target.value;
                            setFloorPlans(newPlans);
                          }}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                          placeholder="Unidades referentes (ex: 101-110, 201-210, Torre A)"
                        />
                        <a href={plan.url} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline">
                          Visualizar arquivo
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFloorPlans(prev => prev.filter((_, i) => i !== index))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab: Mídia */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Upload de Imagens */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-neutral-900 dark:text-white">Fotos do Condomínio</h2>
                <p className="text-sm text-neutral-500">Adicione fotos das áreas comuns com legendas</p>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-[#0B2545] transition-colors">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  
                  setIsUploading(true);
                  
                  for (const file of Array.from(files)) {
                    const formDataUpload = new FormData();
                    formDataUpload.append("file", file);
                    
                    try {
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formDataUpload,
                      });
                      
                      if (res.ok) {
                        const data = await res.json();
                        setCondoImages(prev => [...prev, { url: data.url, caption: "" }]);
                      }
                    } catch (error) {
                      console.error("Erro no upload:", error);
                    }
                  }
                  
                  setIsUploading(false);
                  e.target.value = "";
                }}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-2 border-[#0B2545] border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-neutral-500">Enviando...</p>
                  </div>
                ) : (
                  <>
                    <RiUploadCloud2Line className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Clique para fazer upload ou arraste as imagens
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">PNG, JPG até 10MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Lista de Imagens com Legendas */}
            {condoImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {condoImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={img.url}
                        alt={img.caption || `Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay com ações */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCaption(index)}
                        className="p-2 rounded-lg bg-white/90 text-neutral-700 hover:bg-white"
                      >
                        <RiEditLine className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCondoImages(prev => prev.filter((_, i) => i !== index))}
                        className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      >
                        <RiCloseLine className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Legenda */}
                    {editingCaption === index ? (
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => {
                          const newImages = [...condoImages];
                          newImages[index].caption = e.target.value;
                          setCondoImages(newImages);
                        }}
                        onBlur={() => setEditingCaption(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingCaption(null)}
                        placeholder="Digite a legenda..."
                        className="mt-2 w-full px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                        autoFocus
                      />
                    ) : (
                      <p 
                        className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 truncate cursor-pointer hover:text-[#0B2545]"
                        onClick={() => setEditingCaption(index)}
                      >
                        {img.caption || "Clique para adicionar legenda"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Definir Thumbnail */}
            {condoImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Foto de Capa</label>
                <select
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <option value="">Selecione a foto de capa</option>
                  {condoImages.map((img, index) => (
                    <option key={index} value={img.url}>
                      {img.caption || `Foto ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tour Virtual */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Tour Virtual</h2>
            <div>
              <label className="block text-sm font-medium mb-2">URL do Tour Virtual</label>
              <input
                type="url"
                value={formData.virtualTour}
                onChange={(e) => setFormData({ ...formData, virtualTour: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
              <p className="text-xs text-neutral-500 mt-1">Cole o link do Matterport, 360°, etc.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização do Mapa com Zoom */}
      {showMapViewer && formData.internalMap && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setShowMapViewer(false)}
        >
          {/* Controles */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMapZoom(prev => Math.max(0.5, prev - 0.25));
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Diminuir zoom"
            >
              <RiZoomOutLine className="w-5 h-5" />
            </button>
            <span className="px-3 py-2 bg-white/10 rounded-xl text-white text-sm font-medium min-w-[60px] text-center">
              {Math.round(mapZoom * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMapZoom(prev => Math.min(5, prev + 0.25));
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Aumentar zoom"
            >
              <RiZoomInLine className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMapZoom(1);
                setMapPosition({ x: 0, y: 0 });
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Resetar zoom"
            >
              <RiFullscreenLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMapViewer(false)}
              className="p-3 bg-red-500/80 hover:bg-red-500 rounded-xl text-white transition-colors ml-2"
              title="Fechar"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>

          {/* Instruções */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-xl text-white/70 text-sm">
            Use scroll para zoom • Arraste para mover • Clique fora para fechar
          </div>

          {/* Imagem com zoom */}
          <div 
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ 
              width: '90vw', 
              height: '85vh',
            }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setMapZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setMapPosition({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y,
                });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {formData.internalMap.endsWith('.pdf') ? (
              <iframe
                src={formData.internalMap}
                className="w-full h-full bg-white rounded-xl"
                title="Mapa do condomínio"
              />
            ) : (
              <img
                src={formData.internalMap}
                alt="Mapa do condomínio"
                className="max-w-none select-none"
                style={{
                  transform: `scale(${mapZoom}) translate(${mapPosition.x / mapZoom}px, ${mapPosition.y / mapZoom}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                draggable={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal de Visualização da Grade de Atividades com Zoom */}
      {showActivityScheduleModal && formData.activityScheduleImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setShowActivityScheduleModal(false)}
        >
          {/* Controles */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivityZoom(prev => Math.max(0.5, prev - 0.25));
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Diminuir zoom"
            >
              <RiZoomOutLine className="w-5 h-5" />
            </button>
            <span className="px-3 py-2 bg-white/10 rounded-xl text-white text-sm font-medium min-w-[60px] text-center">
              {Math.round(activityZoom * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivityZoom(prev => Math.min(5, prev + 0.25));
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Aumentar zoom"
            >
              <RiZoomInLine className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivityZoom(1);
                setActivityPosition({ x: 0, y: 0 });
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Resetar zoom"
            >
              <RiFullscreenLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowActivityScheduleModal(false)}
              className="p-3 bg-red-500/80 hover:bg-red-500 rounded-xl text-white transition-colors ml-2"
              title="Fechar"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>

          {/* Título */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-green-500/80 rounded-xl text-white text-sm font-medium">
            📅 Grade de Atividades
          </div>

          {/* Instruções */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-xl text-white/70 text-sm">
            Use scroll para zoom • Arraste para mover • Clique fora para fechar
          </div>

          {/* Imagem com zoom */}
          <div 
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ 
              width: '90vw', 
              height: '85vh',
            }}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setActivityZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
            }}
            onMouseDown={(e) => {
              setIsActivityDragging(true);
              setActivityDragStart({ x: e.clientX - activityPosition.x, y: e.clientY - activityPosition.y });
            }}
            onMouseMove={(e) => {
              if (isActivityDragging) {
                setActivityPosition({
                  x: e.clientX - activityDragStart.x,
                  y: e.clientY - activityDragStart.y,
                });
              }
            }}
            onMouseUp={() => setIsActivityDragging(false)}
            onMouseLeave={() => setIsActivityDragging(false)}
          >
            <img
              src={formData.activityScheduleImage}
              alt="Grade de Atividades"
              className="max-w-none select-none"
              style={{
                transform: `scale(${activityZoom}) translate(${activityPosition.x / activityZoom}px, ${activityPosition.y / activityZoom}px)`,
                transformOrigin: 'center center',
                transition: isActivityDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </form>
  );
}

export default function NovoCondominioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#0B2545] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CondominioForm />
    </Suspense>
  );
}
