"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiSearchLine,
  RiRefreshLine,
  RiKeyLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiShieldLine,
  RiSaveLine,
  RiBuilding2Line,
  RiUserLine,
  RiExchangeLine,
  RiWhatsappLine,
  RiMailLine,
  RiBarChartLine,
  RiPlugLine,
  RiGlobalLine,
} from "react-icons/ri";

interface Partner {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  primaryColor: string;
  permissions?: {
    canAccessProperties: boolean;
    canAccessLeads: boolean;
    canAccessPortals: boolean;
    canAccessWhatsApp: boolean;
    canAccessEmail: boolean;
    canAccessReports: boolean;
    rateLimit: number;
    dailyLimit: number;
    hasCustomBranding: boolean;
    hasCustomDomain: boolean;
    hasAdvancedAnalytics: boolean;
    hasApiWebhooks: boolean;
    portalZapImoveis: boolean;
    portalVivaReal: boolean;
    portalOlx: boolean;
    portalImovelWeb: boolean;
    portalChavesNaMao: boolean;
  };
}

export default function PermissoesPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState<any>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
      }
    } catch (error) {
      console.error("Erro ao buscar parceiros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setPermissions(partner.permissions || {
      canAccessProperties: true,
      canAccessLeads: true,
      canAccessPortals: false,
      canAccessWhatsApp: false,
      canAccessEmail: false,
      canAccessReports: true,
      rateLimit: 1000,
      dailyLimit: 10000,
      hasCustomBranding: true,
      hasCustomDomain: false,
      hasAdvancedAnalytics: false,
      hasApiWebhooks: false,
      portalZapImoveis: false,
      portalVivaReal: false,
      portalOlx: false,
      portalImovelWeb: false,
      portalChavesNaMao: false,
    });
  };

  const handleSave = async () => {
    if (!selectedPartner) return;
    setIsSaving(true);
    try {
      await fetch(`/api/admin/partners/${selectedPartner.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions),
      });
      alert("Permissões salvas com sucesso!");
      fetchPartners();
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center justify-between py-3 cursor-pointer group">
      <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <RiKeyLine className="w-5 h-5 text-amber-600" />
              </div>
              Permissões
            </h1>
            <p className="text-neutral-500 mt-1">
              Configure o que cada parceiro pode acessar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPartners}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RiRefreshLine className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Parceiros */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar parceiro..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-700 border-0 text-sm"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RiLoader4Line className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                Nenhum parceiro encontrado
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <button
                  key={partner.id}
                  onClick={() => selectPartner(partner)}
                  className={`w-full p-4 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left ${
                    selectedPartner?.id === partner.id ? "bg-amber-50 dark:bg-amber-500/10" : ""
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: partner.primaryColor }}
                  >
                    {partner.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white truncate">{partner.name}</p>
                    <p className="text-xs text-neutral-500">{partner.slug}</p>
                  </div>
                  {partner.isActive ? (
                    <RiCheckLine className="w-4 h-4 text-green-500" />
                  ) : (
                    <RiCloseLine className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Painel de Permissões */}
        <div className="lg:col-span-2">
          {!selectedPartner ? (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
              <RiShieldLine className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
              <p className="text-neutral-500">Selecione um parceiro para configurar suas permissões</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header do Parceiro */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: selectedPartner.primaryColor }}
                  >
                    {selectedPartner.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{selectedPartner.name}</h2>
                    <p className="text-sm text-neutral-500">Configurando permissões</p>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50"
                >
                  {isSaving ? (
                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                  ) : (
                    <RiSaveLine className="w-4 h-4" />
                  )}
                  Salvar
                </button>
              </div>

              {/* Seções de Permissões */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* APIs */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <RiPlugLine className="w-4 h-4 text-blue-500" />
                    Acesso às APIs
                  </h3>
                  <div className="space-y-1 divide-y divide-neutral-100 dark:divide-neutral-700">
                    <ToggleSwitch
                      checked={permissions?.canAccessProperties}
                      onChange={(v) => setPermissions({ ...permissions, canAccessProperties: v })}
                      label="API de Imóveis"
                    />
                    <ToggleSwitch
                      checked={permissions?.canAccessLeads}
                      onChange={(v) => setPermissions({ ...permissions, canAccessLeads: v })}
                      label="API de Leads"
                    />
                    <ToggleSwitch
                      checked={permissions?.canAccessReports}
                      onChange={(v) => setPermissions({ ...permissions, canAccessReports: v })}
                      label="API de Relatórios"
                    />
                    <ToggleSwitch
                      checked={permissions?.canAccessWhatsApp}
                      onChange={(v) => setPermissions({ ...permissions, canAccessWhatsApp: v })}
                      label="API WhatsApp"
                    />
                    <ToggleSwitch
                      checked={permissions?.canAccessEmail}
                      onChange={(v) => setPermissions({ ...permissions, canAccessEmail: v })}
                      label="Email Marketing"
                    />
                  </div>
                </div>

                {/* Funcionalidades */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <RiShieldLine className="w-4 h-4 text-purple-500" />
                    Funcionalidades
                  </h3>
                  <div className="space-y-1 divide-y divide-neutral-100 dark:divide-neutral-700">
                    <ToggleSwitch
                      checked={permissions?.hasCustomBranding}
                      onChange={(v) => setPermissions({ ...permissions, hasCustomBranding: v })}
                      label="Personalização Visual"
                    />
                    <ToggleSwitch
                      checked={permissions?.hasCustomDomain}
                      onChange={(v) => setPermissions({ ...permissions, hasCustomDomain: v })}
                      label="Domínio Próprio"
                    />
                    <ToggleSwitch
                      checked={permissions?.hasAdvancedAnalytics}
                      onChange={(v) => setPermissions({ ...permissions, hasAdvancedAnalytics: v })}
                      label="Analytics Avançado"
                    />
                    <ToggleSwitch
                      checked={permissions?.hasApiWebhooks}
                      onChange={(v) => setPermissions({ ...permissions, hasApiWebhooks: v })}
                      label="Webhooks"
                    />
                  </div>
                </div>

                {/* Portais */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <RiExchangeLine className="w-4 h-4 text-green-500" />
                    Integração com Portais
                  </h3>
                  <div className="space-y-1 divide-y divide-neutral-100 dark:divide-neutral-700">
                    <ToggleSwitch
                      checked={permissions?.canAccessPortals}
                      onChange={(v) => setPermissions({ ...permissions, canAccessPortals: v })}
                      label="Habilitar Portais"
                    />
                    {permissions?.canAccessPortals && (
                      <>
                        <ToggleSwitch
                          checked={permissions?.portalZapImoveis}
                          onChange={(v) => setPermissions({ ...permissions, portalZapImoveis: v })}
                          label="ZAP Imóveis"
                        />
                        <ToggleSwitch
                          checked={permissions?.portalVivaReal}
                          onChange={(v) => setPermissions({ ...permissions, portalVivaReal: v })}
                          label="Viva Real"
                        />
                        <ToggleSwitch
                          checked={permissions?.portalOlx}
                          onChange={(v) => setPermissions({ ...permissions, portalOlx: v })}
                          label="OLX"
                        />
                        <ToggleSwitch
                          checked={permissions?.portalImovelWeb}
                          onChange={(v) => setPermissions({ ...permissions, portalImovelWeb: v })}
                          label="ImovelWeb"
                        />
                        <ToggleSwitch
                          checked={permissions?.portalChavesNaMao}
                          onChange={(v) => setPermissions({ ...permissions, portalChavesNaMao: v })}
                          label="Chaves na Mão"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Limites */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <RiBarChartLine className="w-4 h-4 text-amber-500" />
                    Limites de Requisições
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        Requisições por hora
                      </label>
                      <input
                        type="number"
                        value={permissions?.rateLimit || 1000}
                        onChange={(e) => setPermissions({ ...permissions, rateLimit: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        Requisições por dia
                      </label>
                      <input
                        type="number"
                        value={permissions?.dailyLimit || 10000}
                        onChange={(e) => setPermissions({ ...permissions, dailyLimit: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
