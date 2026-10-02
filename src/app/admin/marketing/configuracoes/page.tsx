"use client";

import { useState, useEffect } from "react";
import { RiSettings4Line, RiSaveLine, RiLoader4Line, RiCheckLine, RiInformationLine } from "react-icons/ri";
import { PageHeader } from "@/components/admin/marketing/MarketingUI";

interface TrackingConfig {
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
  metaPixelIdSummit: string;
  googleAdsId: string;
}

const FIELDS: { key: keyof TrackingConfig; label: string; placeholder: string; help: string }[] = [
  { key: "gtmId", label: "Google Tag Manager (GTM)", placeholder: "GTM-XXXXXXX", help: "Container principal, carregado em todo o site" },
  { key: "ga4Id", label: "Google Analytics 4", placeholder: "G-XXXXXXXXXX", help: "Measurement ID do GA4" },
  { key: "metaPixelId", label: "Meta Pixel (site principal)", placeholder: "000000000000000", help: "Pixel do Facebook/Instagram Ads carregado em todas as páginas do site" },
  { key: "metaPixelIdSummit", label: "Meta Pixel (Tappy Summit)", placeholder: "000000000000000", help: "Pixel separado usado só nas landing pages do Summit — hoje já é diferente do pixel principal" },
  { key: "googleAdsId", label: "Google Ads (conversão)", placeholder: "AW-XXXXXXXXX", help: "Ainda não conectado — deixe em branco se não usar" },
];

export default function MarketingConfiguracoesPage() {
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/marketing/tracking-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (json?.config) setConfig(json.config); })
      .catch(() => setError("Erro ao carregar configuração"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/marketing/tracking-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Erro ao salvar. Tente novamente.");
      }
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader icon={RiSettings4Line} title="Configurações" subtitle="IDs de tracking do site — GTM, GA4, Meta Pixel e Google Ads" />

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-start gap-3 text-sm text-blue-800 dark:text-blue-300">
        <RiInformationLine className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <span>
          Mudanças aqui refletem no site em até 5 minutos (sem precisar de deploy). Cuidado ao editar — um ID errado
          interrompe a coleta de dados no Facebook/Google até ser corrigido.
        </span>
      </div>

      {loading || !config ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-1">{field.label}</label>
              <input
                type="text"
                value={config[field.key]}
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <p className="text-xs text-neutral-400 mt-1">{field.help}</p>
            </div>
          ))}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600">{error}</div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSaveLine className="w-4 h-4" />}
              {saving ? "Salvando..." : "Salvar"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <RiCheckLine className="w-4 h-4" /> Salvo
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
