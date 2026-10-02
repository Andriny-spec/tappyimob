"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiHome4Line,
  RiSearchLine,
  RiEyeLine,
  RiEyeOffLine,
  RiEditLine,
  RiPercentLine,
  RiDownload2Line,
  RiExternalLinkLine,
  RiCheckLine,
  RiCloseLine,
  RiImageLine,
  RiVideoLine,
  RiMapPinLine,
} from "react-icons/ri";

interface ExclusiveConfig {
  id: string;
  propertyId: string;
  showToPartners: boolean;
  commissionPercent?: number;
  commissionNotes?: string;
  specialConditions?: string;
  allowPhotoDownload: boolean;
  allowVideoDownload: boolean;
  requireLogin: boolean;
  viewCount: number;
  downloadCount: number;
  property?: {
    id: string;
    code: string;
    title: string;
    price: number;
    thumbnail?: string;
    neighborhood?: string;
    city?: string;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function PartnerExclusivesAdminPage() {
  const [exclusives, setExclusives] = useState<ExclusiveConfig[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [editingExclusive, setEditingExclusive] = useState<ExclusiveConfig | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [exclusivesRes, propertiesRes] = await Promise.all([
        fetch("/api/admin/partner-exclusives"),
        fetch("/api/admin/properties?limit=100&exclusivity=EXCLUSIVO"),
      ]);

      if (exclusivesRes.ok) {
        const data = await exclusivesRes.json();
        setExclusives(data.exclusives || []);
      }

      if (propertiesRes.ok) {
        const data = await propertiesRes.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (propertyId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/partner-exclusives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          showToPartners: !currentStatus,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  const handleSaveConfig = async (data: any) => {
    try {
      const res = await fetch("/api/admin/partner-exclusives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchData();
        setShowConfigModal(false);
        setEditingExclusive(null);
        setSelectedProperty(null);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // Combinar propriedades exclusivas com suas configurações
  const combinedData = properties.map((property) => {
    const config = exclusives.find((e) => e.propertyId === property.id);
    return {
      property,
      config,
    };
  });

  const filteredData = combinedData.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.property.code?.toLowerCase().includes(searchLower) ||
      item.property.title?.toLowerCase().includes(searchLower) ||
      item.property.neighborhood?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Exclusividades para Parceiros
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure quais imóveis exclusivos serão compartilhados com parceiros
          </p>
        </div>
        <a
          href="/parceiros/exclusivos"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 rounded-xl transition-colors"
        >
          <RiExternalLinkLine className="w-4 h-4" />
          Ver Página Pública
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">Total Exclusivos</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{properties.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">Visíveis aos Parceiros</p>
          <p className="text-2xl font-bold text-green-600">
            {exclusives.filter((e) => e.showToPartners).length}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">Total Visualizações</p>
          <p className="text-2xl font-bold text-blue-600">
            {exclusives.reduce((acc, e) => acc + e.viewCount, 0)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500">Total Downloads</p>
          <p className="text-2xl font-bold text-purple-600">
            {exclusives.reduce((acc, e) => acc + e.downloadCount, 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, título ou bairro..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      </div>

      {/* Lista de Imóveis */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="text-center py-20">
            <RiHome4Line className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-500">Nenhum imóvel exclusivo encontrado</p>
          </div>
        ) : (
          filteredData.map(({ property, config }) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-xl bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                {property.thumbnail ? (
                  <img
                    src={property.thumbnail}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <RiHome4Line className="w-8 h-8 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                    {property.code}
                  </span>
                  {config?.showToPartners && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded flex items-center gap-1">
                      <RiEyeLine className="w-3 h-3" />
                      Visível
                    </span>
                  )}
                  {config?.commissionPercent && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 rounded flex items-center gap-1">
                      <RiPercentLine className="w-3 h-3" />
                      {config.commissionPercent}%
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mt-1 truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-neutral-500 flex items-center gap-1">
                  <RiMapPinLine className="w-3.5 h-3.5" />
                  {property.neighborhood}, {property.city}
                </p>
              </div>

              {/* Preço */}
              <div className="text-right">
                <p className="text-lg font-bold text-orange-500">
                  {formatCurrency(property.price)}
                </p>
                {config && (
                  <p className="text-xs text-neutral-500">
                    {config.viewCount} views • {config.downloadCount} downloads
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVisibility(property.id, config?.showToPartners || false)}
                  className={`p-2 rounded-lg transition-colors ${
                    config?.showToPartners
                      ? "text-green-600 bg-green-50 dark:bg-green-500/10 hover:bg-green-100"
                      : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                  title={config?.showToPartners ? "Ocultar dos parceiros" : "Exibir aos parceiros"}
                >
                  {config?.showToPartners ? (
                    <RiEyeLine className="w-5 h-5" />
                  ) : (
                    <RiEyeOffLine className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedProperty(property);
                    setEditingExclusive(config || null);
                    setShowConfigModal(true);
                  }}
                  className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Configurar"
                >
                  <RiEditLine className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de Configuração */}
      {showConfigModal && selectedProperty && (
        <ConfigModal
          property={selectedProperty}
          config={editingExclusive}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedProperty(null);
            setEditingExclusive(null);
          }}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
}

// Modal de Configuração
function ConfigModal({
  property,
  config,
  onClose,
  onSave,
}: {
  property: any;
  config: ExclusiveConfig | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [showToPartners, setShowToPartners] = useState(config?.showToPartners ?? true);
  const [commissionPercent, setCommissionPercent] = useState(config?.commissionPercent?.toString() || "");
  const [commissionNotes, setCommissionNotes] = useState(config?.commissionNotes || "");
  const [specialConditions, setSpecialConditions] = useState(config?.specialConditions || "");
  const [allowPhotoDownload, setAllowPhotoDownload] = useState(config?.allowPhotoDownload ?? true);
  const [allowVideoDownload, setAllowVideoDownload] = useState(config?.allowVideoDownload ?? true);
  const [requireLogin, setRequireLogin] = useState(config?.requireLogin ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    onSave({
      propertyId: property.id,
      showToPartners,
      commissionPercent: commissionPercent ? parseFloat(commissionPercent) : null,
      commissionNotes,
      specialConditions,
      allowPhotoDownload,
      allowVideoDownload,
      requireLogin,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Configurar Exclusividade
            </h2>
            <p className="text-sm text-neutral-500">{property.code} - {property.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Visibilidade */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="flex items-center gap-3">
              {showToPartners ? (
                <RiEyeLine className="w-5 h-5 text-green-500" />
              ) : (
                <RiEyeOffLine className="w-5 h-5 text-neutral-400" />
              )}
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  Exibir aos Parceiros
                </p>
                <p className="text-xs text-neutral-500">
                  Imóvel aparecerá na página de exclusivos
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowToPartners(!showToPartners)}
              className={`w-12 h-6 rounded-full transition-colors ${
                showToPartners ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  showToPartners ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Comissão */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Comissão Oferecida (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={commissionPercent}
              onChange={(e) => setCommissionPercent(e.target.value)}
              placeholder="Ex: 6"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Notas sobre Comissão */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Observações sobre Comissão
            </label>
            <textarea
              value={commissionNotes}
              onChange={(e) => setCommissionNotes(e.target.value)}
              placeholder="Ex: Comissão pode ser negociada em caso de venda rápida"
              rows={2}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
          </div>

          {/* Condições Especiais */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Condições Especiais
            </label>
            <textarea
              value={specialConditions}
              onChange={(e) => setSpecialConditions(e.target.value)}
              placeholder="Ex: Aceita permuta, financiamento direto com proprietário..."
              rows={3}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
          </div>

          {/* Permissões de Download */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-500">Permissões de Download</label>
            <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={allowPhotoDownload}
                onChange={(e) => setAllowPhotoDownload(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
              />
              <RiImageLine className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-neutral-900 dark:text-white">Permitir download de fotos</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={allowVideoDownload}
                onChange={(e) => setAllowVideoDownload(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
              />
              <RiVideoLine className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-neutral-900 dark:text-white">Permitir download de vídeos</span>
            </label>
          </div>

          {/* Exigir Login (Fase 2) */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
            <input
              type="checkbox"
              checked={requireLogin}
              onChange={(e) => setRequireLogin(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
            />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Exigir login para visualizar (Fase 2)
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Parceiros precisarão estar logados para acessar
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>
      </div>
    </>
  );
}
