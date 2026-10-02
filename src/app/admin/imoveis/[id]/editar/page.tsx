"use client";

import React, { useState, useEffect, useRef } from "react";
import { Condominium } from "@/types/property";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiHome4Line,
  RiMapPinLine,
  RiRulerLine,
  RiMoneyDollarCircleLine,
  RiImage2Line,
  RiUserLine,
  RiFileList3Line,
  RiLoader4Line,
  RiSaveLine,
  RiMagicLine,
  RiExchangeLine,
  RiDragMoveLine,
  RiDeleteBinLine,
  RiStarLine,
  RiStarFill,
  RiCloseLine,
  RiAddLine,
} from "react-icons/ri";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const propertyTypeLabels: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
};

const categoryLabels: Record<string, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_LOCACAO: "Venda e Locação",
};

const conditionLabels: Record<string, string> = {
  NOVO: "Novo",
  USADO: "Usado",
  NA_PLANTA: "Na Planta",
  EM_CONSTRUCAO: "Em Construção",
};

const statusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  RESERVADO: "Reservado",
  INATIVO: "Indisponível",
};

function ConstructorSection({ formData, setFormData }: { formData: any; setFormData: (d: any) => void }) {
  const [constructors, setConstructors] = useState<any[]>([]);
  const [constructorSearch, setConstructorSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchConstructors = async () => {
      try {
        const res = await fetch("/api/admin/business-partners?type=CONSTRUTORA&limit=100");
        if (res.ok) {
          const data = await res.json();
          setConstructors(data.partners || []);
        }
      } catch (e) {
        console.error("Erro ao buscar construtoras:", e);
      }
    };
    fetchConstructors();
  }, []);

  const filtered = constructors.filter(c =>
    c.name?.toLowerCase().includes(constructorSearch.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-4">
      <h4 className="font-medium text-blue-800 dark:text-blue-300">Dados da Construtora</h4>

      {constructors.length > 0 && (
        <div className="relative">
          <label className="block text-sm font-medium mb-2">Selecionar Construtora Cadastrada</label>
          <input
            type="text"
            value={constructorSearch || formData.constructorName || ""}
            onChange={(e) => {
              setConstructorSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar construtora cadastrada..."
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
          />
          {showDropdown && filtered.length > 0 && constructorSearch && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filtered.map((c: any) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      constructorName: c.name,
                      constructorCnpj: c.cpf || "",
                    });
                    setConstructorSearch(c.name);
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm"
                >
                  <span className="font-medium">{c.name}</span>
                  {c.cpf && <span className="text-neutral-500 ml-2">CNPJ: {c.cpf}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {constructors.length === 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Nome da Construtora</label>
            <input
              value={formData.constructorName || ""}
              onChange={e => setFormData({ ...formData, constructorName: e.target.value })}
              placeholder="Nome da construtora"
              className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">CNPJ</label>
          <input
            value={formData.constructorCnpj || ""}
            onChange={e => setFormData({ ...formData, constructorCnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

export default function EditarImovelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const formDataRef = useRef<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [generatingExchange, setGeneratingExchange] = useState(false);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [propertyOptions, setPropertyOptions] = useState({
    features: ["Energia Fotovoltaica", "Aquecimento Solar", "Elevador", "Escritório", "Cinema", "Sauna", "Terreno com Verde", "Vista Livre", "Automação Residencial", "Mobiliado", "Suíte Térrea"],
    private: ["Ar condicionado", "Varanda", "Closet", "Cozinha americana", "Quintal", "Piscina privativa", "Mobiliado"],
    propertyCategories: ["Tamboré I", "Tamboré II", "Tamboré III", "Retrofit", "Casas Térreas", "Villagios", "Casas (Centro de Sua Cidade)", "Lançamentos", "Exclusividades", "Vistas Incríveis", "Aptos (Centro de Sua Cidade)"],
  });

  // Manter ref sincronizado com formData
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // Carregar condomínios e opções
  useEffect(() => {
    const fetchCondominiums = async () => {
      try {
        const res = await fetch("/api/condominiums");
        if (res.ok) {
          const data = await res.json();
          setCondominiums(data.condominiums || []);
        }
      } catch (error) {
        console.error("Erro ao carregar condomínios:", error);
      }
    };
    const fetchPropertyOptions = async () => {
      try {
        const res = await fetch("/api/admin/properties/options");
        if (res.ok) {
          const data = await res.json();
          setPropertyOptions(prev => ({
            features: data.features || prev.features,
            private: data.private || prev.private,
            propertyCategories: data.propertyCategories || prev.propertyCategories,
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      }
    };
    fetchCondominiums();
    fetchPropertyOptions();
  }, []);

  // Merge: garantir que itens já selecionados do imóvel apareçam nas opções disponíveis
  useEffect(() => {
    if (!formData) return;
    setPropertyOptions(prev => {
      const mergeUnique = (existing: string[], selected: string[]) => {
        if (!selected?.length) return existing;
        const set = new Set(existing);
        for (const item of selected) { if (item?.trim()) set.add(item.trim()); }
        return Array.from(set).sort();
      };
      return {
        features: mergeUnique(prev.features, formData.extras),
        private: mergeUnique(prev.private, formData.features),
        propertyCategories: mergeUnique(prev.propertyCategories, formData.websiteCategories),
      };
    });
  }, [formData?.features?.length, formData?.extras?.length]);

  // Gerar descrição da permuta com IA
  const generateExchangeDescription = async () => {
    if (!formData) return;
    setGeneratingExchange(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "exchange",
          propertyData: {
            type: formData.type,
            category: formData.category,
            price: formData.price,
            city: formData.city,
            neighborhood: formData.neighborhood,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, exchangeDescription: data.description });
      }
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
    }
    setGeneratingExchange(false);
  };

  // Carregar dados do imóvel
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`);
        if (!response.ok) throw new Error("Imóvel não encontrado");
        const data = await response.json();
        const property = data.property;
        
        // Se tiver propertyOwner (dados importados da planilha), preencher os campos do proprietário
        if (property.propertyOwner) {
          property.ownerName = property.ownerName || property.propertyOwner.name || "";
          property.ownerEmail = property.ownerEmail || property.propertyOwner.email || "";
          property.ownerEmails = property.propertyOwner.emails?.length 
            ? property.propertyOwner.emails 
            : (property.propertyOwner.email ? [property.propertyOwner.email] : [""]);
          property.ownerCpf = property.ownerCpf || property.propertyOwner.cpf || "";
          property.ownerPhones = property.ownerPhones?.length 
            ? property.ownerPhones 
            : (property.propertyOwner.phones?.length ? property.propertyOwner.phones : [""]);
        }
        
        console.log("[LOAD] description (HTML):", property.description);
        setFormData(property);
      } catch (error) {
        console.error("Erro:", error);
        router.push("/admin/imoveis");
      }
      setIsLoading(false);
    };
    fetchProperty();
  }, [id, router]);

  // Atalho global Ctrl+S para salvar rascunho
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isSaving && formData) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleSave = async () => {
    // Prevenir double-submit via ref
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      // Ler do ref para garantir dados mais recentes (evita stale closure)
      const currentFormData = formDataRef.current;
      if (!currentFormData) throw new Error("Dados do formulário não carregados");
      
      // Garantir que features e extras são arrays válidos
      const payload = {
        ...currentFormData,
        features: Array.isArray(currentFormData.features) ? currentFormData.features.filter(Boolean) : [],
        extras: Array.isArray(currentFormData.extras) ? currentFormData.extras.filter(Boolean) : [],
        amenities: Array.isArray(currentFormData.amenities) ? currentFormData.amenities.filter(Boolean) : [],
      };
      
      console.log("[SAVE] features:", payload.features);
      console.log("[SAVE] extras:", payload.extras);
      console.log("[SAVE] description (HTML):", payload.description);
      
      const response = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar");
      }

      router.push(`/admin/imoveis/${id}`);
    } catch (error: any) {
      alert(error.message || "Erro ao salvar imóvel");
    }
    isSavingRef.current = false;
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0A1E3D]" />
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <Link href={`/admin/imoveis/${id}`} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex-shrink-0">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">Editar Imóvel</h1>
            <p className="text-sm text-neutral-500 truncate">{formData.code} - {formData.title}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 h-10 lg:h-11 px-4 lg:px-6 rounded-xl bg-[#0A1E3D] text-white text-sm lg:text-base font-medium hover:bg-[#1A3560] disabled:opacity-50 w-full sm:w-auto"
        >
          {isSaving ? <RiLoader4Line className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <RiSaveLine className="w-4 h-4 lg:w-5 lg:h-5" />}
          Salvar
        </button>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {/* Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl lg:rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 lg:p-6"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
            <RiHome4Line className="w-4 h-4 lg:w-5 lg:h-5 text-[#0A1E3D]" />
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Título do Marketplace</label>
              <input
                value={formData.marketplaceTitle || ""}
                onChange={(e) => setFormData({ ...formData, marketplaceTitle: e.target.value })}
                placeholder="Título otimizado para portais (OLX, ZAP, etc.)"
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
              <p className="text-xs text-neutral-500 mt-1">Título curto e atrativo para anúncios em portais</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              >
                {Object.entries(propertyTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Condição</label>
              <select
                value={formData.condition || "USADO"}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              >
                {Object.entries(conditionLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Campos de Venda/Aluguel - aparecem quando status é VENDIDO ou ALUGADO */}
            {(formData.status === "VENDIDO" || formData.status === "ALUGADO") && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.status === "VENDIDO" ? "Vendido por" : "Alugado por"}
                  </label>
                  <select
                    value={formData.soldBy || ""}
                    onChange={(e) => setFormData({ ...formData, soldBy: e.target.value })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
                  >
                    <option value="">Selecione...</option>
                    <option value="TAPPY">Tappy Imob</option>
                    <option value="TERCEIROS">Terceiros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Data da {formData.status === "VENDIDO" ? "Venda" : "Locação"}
                  </label>
                  <input
                    type="date"
                    value={formData.soldAt ? new Date(formData.soldAt).toISOString().split("T")[0] : ""}
                    onChange={(e) => setFormData({ ...formData, soldAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Valor Final</label>
                  <input
                    type="number"
                    value={formData.soldPrice || ""}
                    onChange={(e) => setFormData({ ...formData, soldPrice: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Valor negociado"
                    className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Observações da Negociação</label>
                  <textarea
                    rows={2}
                    value={formData.soldNotes || ""}
                    onChange={(e) => setFormData({ ...formData, soldNotes: e.target.value })}
                    placeholder="Detalhes sobre a negociação..."
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
                  />
                </div>
              </>
            )}
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Descrição do Imóvel</label>
              <RichTextEditor
                value={formData.description || ""}
                onChange={(value: string) => setFormData((prev: any) => ({ ...prev, description: value }))}
                placeholder="Descreva o imóvel com detalhes..."
                maxLength={2500}
              />
            </div>
            
            {/* Descrição da Permuta */}
            {formData.acceptsExchange && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <RiExchangeLine className="w-4 h-4 text-green-500" />
                    Descrição da Permuta
                  </label>
                  <button
                    type="button"
                    onClick={generateExchangeDescription}
                    disabled={generatingExchange}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
                  >
                    {generatingExchange ? (
                      <RiLoader4Line className="w-3 h-3 animate-spin" />
                    ) : (
                      <RiMagicLine className="w-3 h-3" />
                    )}
                    Gerar com IA
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.exchangeDescription || ""}
                  onChange={(e) => setFormData({ ...formData, exchangeDescription: e.target.value })}
                  placeholder="Descreva o que aceita como permuta (tipos de imóveis, veículos, etc.)..."
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Localização */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiMapPinLine className="w-5 h-5 text-[#0A1E3D]" />
            Localização
          </h2>
          
          {/* Condomínio */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Condomínio</label>
            <select
              value={formData.condominiumId || ""}
              onChange={(e) => setFormData({ ...formData, condominiumId: e.target.value || null })}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
            >
              <option value="">Selecione um condomínio (opcional)</option>
              {condominiums.map((condo) => (
                <option key={condo.id} value={condo.id}>
                  {condo.name} {condo.neighborhood ? `- ${condo.neighborhood}` : ""}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">CEP</label>
              <input
                value={formData.zipCode || ""}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Endereço</label>
              <input
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Número</label>
              <input
                value={formData.number || ""}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Complemento</label>
              <input
                value={formData.complement || ""}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                placeholder="Apto, Bloco, etc."
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bairro</label>
              <input
                value={formData.neighborhood || ""}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cidade</label>
              <input
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <input
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="SC"
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiRulerLine className="w-5 h-5 text-[#0A1E3D]" />
            Características
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Área Total (m²)</label>
              <input
                type="number"
                value={formData.area || 0}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Área Útil (m²)</label>
              <input
                type="number"
                value={formData.usefulArea || 0}
                onChange={(e) => setFormData({ ...formData, usefulArea: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Idade do Imóvel</label>
              <input
                value={formData.propertyAge || ""}
                onChange={(e) => setFormData({ ...formData, propertyAge: e.target.value })}
                placeholder="Ex: 5 anos"
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Andar</label>
              <input
                value={formData.floor || ""}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="Ex: 5º"
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quartos</label>
              <input
                type="number"
                value={formData.bedrooms || 0}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Suítes</label>
              <input
                type="number"
                value={formData.suites || 0}
                onChange={(e) => setFormData({ ...formData, suites: parseInt(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Banheiros</label>
              <input
                type="number"
                value={formData.bathrooms || 0}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vagas</label>
              <input
                type="number"
                value={formData.parkingSpaces || 0}
                onChange={(e) => setFormData({ ...formData, parkingSpaces: parseInt(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
          </div>

          {/* Características Especiais */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-3">Características Especiais</label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasElevator: !formData.hasElevator })}
                className={`px-4 py-2 rounded-lg border ${formData.hasElevator ? "border-[#0A1E3D] bg-[#0A1E3D] text-white" : "border-neutral-200 dark:border-neutral-700"}`}
              >
                🛗 Elevador
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isFurnished: !formData.isFurnished })}
                className={`px-4 py-2 rounded-lg border ${formData.isFurnished ? "border-[#0A1E3D] bg-[#0A1E3D] text-white" : "border-neutral-200 dark:border-neutral-700"}`}
              >
                🛋️ Mobiliado
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasGroundFloorSuite: !formData.hasGroundFloorSuite })}
                className={`px-4 py-2 rounded-lg border ${formData.hasGroundFloorSuite ? "border-[#0A1E3D] bg-[#0A1E3D] text-white" : "border-neutral-200 dark:border-neutral-700"}`}
              >
                🏠 Suíte Térrea
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasFreeView: !formData.hasFreeView })}
                className={`px-4 py-2 rounded-lg border ${formData.hasFreeView ? "border-[#0A1E3D] bg-[#0A1E3D] text-white" : "border-neutral-200 dark:border-neutral-700"}`}
              >
                🌅 Vista Livre
              </button>
            </div>
          </div>

          </motion.div>

        {/* Valores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiMoneyDollarCircleLine className="w-5 h-5 text-[#0A1E3D]" />
            Valores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preço Venda (R$)</label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Aluguel (R$)</label>
              <input
                type="number"
                value={formData.rentPrice || 0}
                onChange={(e) => setFormData({ ...formData, rentPrice: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Condomínio (R$)</label>
              <input
                type="number"
                value={formData.condoFee || 0}
                onChange={(e) => setFormData({ ...formData, condoFee: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IPTU (R$)</label>
              <input
                type="number"
                value={formData.iptu || 0}
                onChange={(e) => setFormData({ ...formData, iptu: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">FORO Anual (R$)</label>
              <input
                type="number"
                value={formData.foro || 0}
                onChange={(e) => setFormData({ ...formData, foro: parseFloat(e.target.value) })}
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
              <p className="text-xs text-neutral-500 mt-1">Imposto regional</p>
            </div>
          </div>

          {/* Aceita Permuta */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-3">Aceita Permuta?</label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, acceptsExchange: true })}
                className={`px-4 py-2 rounded-lg border ${formData.acceptsExchange === true ? "border-green-500 bg-green-50 text-green-600" : "border-neutral-200 dark:border-neutral-700"}`}
              >
                ✓ Sim
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, acceptsExchange: false })}
                className={`px-4 py-2 rounded-lg border ${formData.acceptsExchange === false ? "border-red-500 bg-red-50 text-red-600" : "border-neutral-200 dark:border-neutral-700"}`}
              >
                ✗ Não
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, acceptsExchange: null })}
                className={`px-4 py-2 rounded-lg border ${formData.acceptsExchange === null || formData.acceptsExchange === undefined ? "border-yellow-500 bg-yellow-50 text-yellow-600" : "border-neutral-200 dark:border-neutral-700"}`}
              >
                ⚠ Não informado
              </button>
            </div>
            {(formData.acceptsExchange === null || formData.acceptsExchange === undefined) && (
              <p className="text-xs text-yellow-600 mt-2">⚠️ Será gerada uma pendência para confirmar esta informação.</p>
            )}
          </div>

          {/* Detalhes da Permuta - só aparece se SIM */}
          {formData.acceptsExchange === true && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300">Detalhes da Permuta</h4>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de imóvel aceito na permuta *</label>
                <input
                  value={formData.exchangeType || ""}
                  onChange={(e) => setFormData({ ...formData, exchangeType: e.target.value })}
                  placeholder="Ex: Apartamento, Casa, Terreno..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição da permuta aceita *</label>
                <textarea
                  value={formData.exchangeDescription || ""}
                  onChange={(e) => setFormData({ ...formData, exchangeDescription: e.target.value })}
                  placeholder="Descreva detalhes sobre o tipo de permuta aceita..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Valor mínimo da permuta (R$)</label>
                  <input
                    type="number"
                    value={formData.exchangeMinValue || 0}
                    onChange={(e) => setFormData({ ...formData, exchangeMinValue: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valor máximo da permuta (R$)</label>
                  <input
                    type="number"
                    value={formData.exchangeMaxValue || 0}
                    onChange={(e) => setFormData({ ...formData, exchangeMaxValue: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">💡 Esses dados serão usados para cruzar permutas compatíveis automaticamente.</p>
            </div>
          )}
        </motion.div>

        {/* Mídia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiImage2Line className="w-5 h-5 text-[#0A1E3D]" />
            Mídia
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">URL do Vídeo (YouTube)</label>
              <input
                value={formData.videoYoutube || ""}
                onChange={(e) => setFormData({ ...formData, videoYoutube: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">URL da Thumbnail</label>
              <input
                value={formData.thumbnail || ""}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="URL da imagem principal"
                className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg lg:rounded-xl"
              />
            </div>
          </div>
          
          {/* Galeria de imagens com drag-and-drop */}
          {formData.images?.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Imagens ({formData.images.length})</label>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <RiDragMoveLine className="w-3.5 h-3.5" />
                    Arraste para reordenar
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Apagar todas as ${formData.images.length} fotos?`)) {
                        setFormData({ ...formData, images: [], thumbnail: "" });
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                  >
                    <RiDeleteBinLine className="w-3.5 h-3.5" />
                    Apagar todas
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {formData.images.map((img: string, idx: number) => (
                  <div 
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("dragIndex", idx.toString());
                      e.currentTarget.classList.add("opacity-50");
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.classList.remove("opacity-50");
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("ring-2", "ring-[#0A1E3D]");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("ring-2", "ring-[#0A1E3D]");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("ring-2", "ring-[#0A1E3D]");
                      const dragIndex = parseInt(e.dataTransfer.getData("dragIndex"));
                      if (dragIndex !== idx) {
                        const newImages = [...formData.images];
                        const [draggedImage] = newImages.splice(dragIndex, 1);
                        newImages.splice(idx, 0, draggedImage);
                        setFormData({ ...formData, images: newImages });
                      }
                    }}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 cursor-grab active:cursor-grabbing border-2 border-transparent transition-all"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover pointer-events-none" />
                    {/* Número da ordem */}
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    {/* Overlay com ações */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnail: img })}
                        className={`p-1.5 rounded-lg ${formData.thumbnail === img ? "bg-yellow-500 text-white" : "bg-white text-neutral-700"}`}
                        title="Definir como capa"
                      >
                        {formData.thumbnail === img ? <RiStarFill className="w-3.5 h-3.5" /> : <RiStarLine className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_: string, i: number) => i !== idx);
                          setFormData({ 
                            ...formData, 
                            images: newImages,
                            thumbnail: formData.thumbnail === img ? (newImages[0] || "") : formData.thumbnail
                          });
                        }}
                        className="p-1.5 rounded-lg bg-red-500 text-white"
                        title="Remover"
                      >
                        <RiDeleteBinLine className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Badge de capa */}
                    {formData.thumbnail === img && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-yellow-500 text-white text-[10px] rounded font-medium">
                        Capa
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Proprietário */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiUserLine className="w-5 h-5 text-[#0A1E3D]" />
            Proprietário
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo</label>
              <input
                value={formData.ownerName || ""}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Nome do proprietário"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email(s)</label>
              {(formData.ownerEmails || [formData.ownerEmail || ""]).map((email: string, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={email || ""}
                    onChange={(e) => {
                      const emails = [...(formData.ownerEmails || [formData.ownerEmail || ""])];
                      emails[i] = e.target.value;
                      setFormData({ ...formData, ownerEmails: emails, ownerEmail: emails[0] || "" });
                    }}
                    placeholder="email@exemplo.com"
                    className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                  {(formData.ownerEmails || [formData.ownerEmail || ""]).length > 1 && (
                    <button type="button" onClick={() => {
                      const filtered = (formData.ownerEmails || []).filter((_: any, idx: number) => idx !== i);
                      setFormData({ ...formData, ownerEmails: filtered.length > 0 ? filtered : [""], ownerEmail: filtered[0] || "" });
                    }} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl">
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setFormData({ ...formData, ownerEmails: [...(formData.ownerEmails || [formData.ownerEmail || ""]), ""] })} className="flex items-center gap-2 text-sm text-[#0B2545] hover:underline mt-1">
                <RiAddLine className="w-4 h-4" /> Adicionar email
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CPF</label>
              <input
                value={formData.ownerCpf || ""}
                onChange={(e) => setFormData({ ...formData, ownerCpf: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone(s)</label>
              <div className="space-y-2">
                {(formData.ownerPhones || [""]).map((phone: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={phone}
                      onChange={(e) => {
                        const phones = [...(formData.ownerPhones || [""])];
                        phones[idx] = e.target.value;
                        setFormData({ ...formData, ownerPhones: phones });
                      }}
                      placeholder="(00) 00000-0000"
                      className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                    {idx === (formData.ownerPhones || [""]).length - 1 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, ownerPhones: [...(formData.ownerPhones || [""]), ""] })}
                        className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {formData.propertyOwner && (
            <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
              ✓ Dados importados da planilha
            </p>
          )}

          {/* Perfil do Proprietário - Construtor e/ou Investidor */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-3">Perfil do Proprietário</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "CONSTRUTOR", label: "🏗️ Construtor", desc: "Construtora ou incorporadora" },
                { value: "INVESTIDOR", label: "💰 Investidor", desc: "Investidor imobiliário" },
              ].map((profile) => {
                const isSelected = formData.ownerProfiles?.includes(profile.value);
                return (
                  <button
                    key={profile.value}
                    type="button"
                    onClick={() => {
                      const current = formData.ownerProfiles || [];
                      setFormData({
                        ...formData,
                        ownerProfiles: isSelected
                          ? current.filter((p: string) => p !== profile.value)
                          : [...current, profile.value],
                      });
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-[#0B2545] bg-[#0B2545]/5"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <span className="block font-medium">{profile.label}</span>
                    <span className="text-xs text-neutral-500">{profile.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dados da Construtora */}
          {formData.ownerProfiles?.includes("CONSTRUTOR") && (
            <ConstructorSection formData={formData} setFormData={setFormData} />
          )}
        </motion.div>

        {/* Amenidades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Amenidades</h2>
          
          <div>
            <label className="block text-sm font-medium mb-3">Área Privativa</label>
            <div className="flex flex-wrap gap-2">
              {propertyOptions.private.map((feature) => {
                const isSelected = formData.features?.includes(feature);
                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => {
                        const current = prev.features || [];
                        return {
                          ...prev,
                          features: current.includes(feature)
                            ? current.filter((f: string) => f !== feature)
                            : [...current, feature]
                        };
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-[#0A1E3D] text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                    }`}
                  >
                    {feature}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-3">Diferenciais e Características</label>
            <div className="flex flex-wrap gap-2">
              {propertyOptions.features.map((extra) => {
                const isSelected = formData.extras?.includes(extra);
                return (
                  <button
                    key={extra}
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => {
                        const current = prev.extras || [];
                        return {
                          ...prev,
                          extras: current.includes(extra)
                            ? current.filter((e: string) => e !== extra)
                            : [...current, extra]
                        };
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-[#0A1E3D] text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                    }`}
                  >
                    {extra}
                  </button>
                );
              })}
            </div>
          </div>

        </motion.div>

      </div>

      {/* Barra flutuante de Salvar Rascunho - visível ao rolar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between md:justify-end gap-3 md:pl-64">
        <p className="text-xs text-neutral-500 md:mr-auto">Alterações não salvas serão perdidas • <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[10px] font-mono">Ctrl+S</kbd></p>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A1E3D] text-white text-sm font-medium hover:bg-[#1A3560] disabled:opacity-50 shadow-lg"
        >
          {isSaving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSaveLine className="w-4 h-4" />}
          Salvar Rascunho
        </button>
      </div>
      {/* Spacer para não sobrepor conteúdo */}
      <div className="h-16" />
    </div>
  );
}
