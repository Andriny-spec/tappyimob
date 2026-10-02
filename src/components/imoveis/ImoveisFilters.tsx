"use client";

import { useState, useEffect, useRef } from "react";
import { RiCheckLine, RiMapPinLine, RiHome4Line } from "react-icons/ri";
import { FilterModal } from "./FilterModal";
import { FilterButton } from "./FilterButton";
import {
  tipoOptions as tipoOptionsFallback,
  condominioOptions,
  perfilOptions,
  estagioOptions,
  precoMinOptions,
  precoMaxOptions,
  quartosOptions,
  suitesOptions,
  vagasOptions,
  subtipoOptions,
  caracteristicasOptions,
} from "./data";

interface FiltersState {
  negocio: string;
  tipos: string[];
  subtipos: string[];
  precoMin: string;
  precoMax: string;
  quartos: string[];
  suites: string[];
  vagas: string[];
  condominios: string[];
  caracteristicas: string[];
  perfil: string[];
  estagio: string[];
  aceitaPermuta: boolean | null;
  parcelamentoDireto: boolean | null;
  comMobilia: boolean | null;
  areaMin: string;
  areaMax: string;
}

interface ImoveisFiltersProps {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onClear: () => void;
}

export function ImoveisFilters({ filters, setFilters, onClear }: ImoveisFiltersProps) {
  // Estado para categorias dinâmicas
  const [tipoOptions, setTipoOptions] = useState(tipoOptionsFallback);
  
  // Buscar categorias cadastradas
  useEffect(() => {
    fetch("/api/site/property-types?active=true")
      .then(res => res.json())
      .then(data => {
        if (data.types?.length > 0) {
          const dynamicTypes = data.types.map((t: any) => ({
            value: t.type.toLowerCase(),
            label: t.title || t.type,
            icon: RiHome4Line,
          }));
          setTipoOptions(dynamicTypes);
        }
      })
      .catch(console.error);
  }, []);

  // Estado para busca de condomínios (AJAX)
  const [condoSearch, setCondoSearch] = useState("");
  const [condoSearchInput, setCondoSearchInput] = useState("");
  const condoDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [condoOptionsAjax, setCondoOptionsAjax] = useState<string[]>(condominioOptions);

  // Buscar condomínios da API
  useEffect(() => {
    fetch("/api/site/condominiums?limit=500&available=true")
      .then(res => res.json())
      .then(data => {
        if (data.condominiums?.length > 0) {
          const names = data.condominiums.map((c: any) => c.name).sort((a: string, b: string) => a.trim().localeCompare(b.trim(), "pt-BR", { numeric: true, sensitivity: "base" }));
          setCondoOptionsAjax(names);
        }
      })
      .catch(console.error);
  }, []);

  // Filtrar condomínios pela busca (ignorando acentos)
  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const condoOptionsFiltered = condoOptionsAjax.filter(opt =>
    normalize(opt).includes(normalize(condoSearch))
  );

  // Estados dos modais
  const [negocioModal, setNegocioModal] = useState(false);
  const [tipoModal, setTipoModal] = useState(false);
  const [precoMinModal, setPrecoMinModal] = useState(false);
  const [precoMaxModal, setPrecoMaxModal] = useState(false);
  const [quartosModal, setQuartosModal] = useState(false);
  const [suitesModal, setSuitesModal] = useState(false);
  const [vagasModal, setVagasModal] = useState(false);
  const [condominioModal, setCondominioModal] = useState(false);
  const [caracteristicasModal, setCaracteristicasModal] = useState(false);
  const [perfilModal, setPerfilModal] = useState(false);
  const [estagioModal, setEstagioModal] = useState(false);
  const [condicoesModal, setCondicoesModal] = useState(false);
  const [areaModal, setAreaModal] = useState(false);

  const toggleArrayFilter = (key: keyof FiltersState, value: string) => {
    const current = filters[key] as string[];
    if (current.includes(value)) {
      setFilters({ ...filters, [key]: current.filter((v) => v !== value) });
    } else {
      setFilters({ ...filters, [key]: [...current, value] });
    }
  };

  return (
    <>
      {/* Filtros em grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {/* Negócio */}
        <FilterButton
          label="Negócio"
          value={filters.negocio === "venda" ? "Comprar" : filters.negocio === "aluguel" ? "Alugar" : ""}
          onClick={() => setNegocioModal(true)}
          placeholder="Todos"
        />

        {/* Tipo */}
        <FilterButton
          label="Tipo"
          value={filters.tipos}
          onClick={() => setTipoModal(true)}
          placeholder="Todos"
        />

        {/* Preço Mín */}
        <FilterButton
          label="Preço Mín"
          value={filters.precoMin ? `R$ ${(Number(filters.precoMin) / 1000).toFixed(0)}K` : ""}
          onClick={() => setPrecoMinModal(true)}
          placeholder="R$ 0"
        />

        {/* Preço Máx */}
        <FilterButton
          label="Preço Máx"
          value={filters.precoMax ? `R$ ${(Number(filters.precoMax) / 1000000).toFixed(1)}M` : ""}
          onClick={() => setPrecoMaxModal(true)}
          placeholder="Ilimitado"
        />

        {/* Quartos */}
        <FilterButton
          label="Quartos"
          value={filters.quartos}
          onClick={() => setQuartosModal(true)}
          placeholder="Qualquer"
        />

        {/* Suítes */}
        <FilterButton
          label="Suítes"
          value={filters.suites}
          onClick={() => setSuitesModal(true)}
          placeholder="Qualquer"
        />

        {/* Vagas */}
        <FilterButton
          label="Vagas"
          value={filters.vagas}
          onClick={() => setVagasModal(true)}
          placeholder="Qualquer"
        />

        {/* Características */}
        <FilterButton
          label="Características"
          value={filters.caracteristicas}
          onClick={() => setCaracteristicasModal(true)}
          placeholder="Todas"
        />

        {/* Condomínios */}
        <FilterButton
          label="Condomínio"
          value={filters.condominios}
          onClick={() => setCondominioModal(true)}
          placeholder="Todos"
        />

        {/* Área */}
        <FilterButton
          label="Área (m²)"
          value={filters.areaMin || filters.areaMax ? `${filters.areaMin || "0"} - ${filters.areaMax || "∞"}` : ""}
          onClick={() => setAreaModal(true)}
          placeholder="Qualquer"
        />

        {/* Perfil */}
        <FilterButton
          label="Perfil"
          value={filters.perfil}
          onClick={() => setPerfilModal(true)}
          placeholder="Todos"
        />

        {/* Estágio */}
        <FilterButton
          label="Estágio"
          value={filters.estagio}
          onClick={() => setEstagioModal(true)}
          placeholder="Todos"
        />

        {/* Condições Comerciais - OCULTO (informação restrita internamente)
        <FilterButton
          label="Condições"
          value={
            [
              filters.aceitaPermuta === true ? "Permuta" : "",
              filters.parcelamentoDireto === true ? "Parcelamento" : "",
            ].filter(Boolean)
          }
          onClick={() => setCondicoesModal(true)}
          placeholder="Todas"
        /> */}
      </div>

      {/* Botão limpar */}
      <div className="flex justify-end mt-4">
        <button
          onClick={onClear}
          className="text-sm text-[#0B2545] dark:text-sky-400 hover:underline"
        >
          Limpar filtros
        </button>
      </div>

      {/* ==================== MODAIS ==================== */}

      {/* Modal Negócio */}
      <FilterModal isOpen={negocioModal} onClose={() => setNegocioModal(false)} title="Tipo de Negócio">
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "", label: "Todos" },
            { value: "venda", label: "Comprar" },
            { value: "aluguel", label: "Alugar" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters({ ...filters, negocio: opt.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                filters.negocio === opt.value
                  ? "border-[#0B2545] bg-[#0B2545]/10"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
              }`}
            >
              <span className={`font-semibold ${filters.negocio === opt.value ? "text-[#0B2545]" : ""}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </FilterModal>

      {/* Modal Tipo */}
      <FilterModal isOpen={tipoModal} onClose={() => setTipoModal(false)} title="Tipo de Imóvel">
        <p className="text-sm text-neutral-500 mb-4">Selecione um ou mais</p>
        <div className="grid grid-cols-2 gap-3">
          {tipoOptions.map((opt) => {
            const isSelected = filters.tipos.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => {
                  toggleArrayFilter("tipos", opt.value);
                  // Limpar subtipos se desmarcar o tipo
                  if (isSelected) {
                    const subtiposDoTipo = subtipoOptions[opt.value] || [];
                    setFilters(prev => ({
                      ...prev,
                      subtipos: prev.subtipos.filter(s => !subtiposDoTipo.includes(s))
                    }));
                  }
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#0B2545] bg-[#0B2545]/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <opt.icon className={`w-5 h-5 ${isSelected ? "text-[#0B2545]" : "text-neutral-400"}`} />
                <span className={`font-medium ${isSelected ? "text-[#0B2545]" : ""}`}>{opt.label}</span>
                {isSelected && <RiCheckLine className="w-5 h-5 text-[#0B2545] ml-auto" />}
              </button>
            );
          })}
        </div>

        {/* Subtipos - aparecem apenas quando um tipo é selecionado */}
        {filters.tipos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Subtipos</p>
            <div className="flex flex-wrap gap-2">
              {filters.tipos.flatMap(tipo => 
                (subtipoOptions[tipo] || []).map(subtipo => {
                  const isSubSelected = filters.subtipos.includes(subtipo);
                  return (
                    <button
                      key={`${tipo}-${subtipo}`}
                      onClick={() => toggleArrayFilter("subtipos", subtipo)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        isSubSelected
                          ? "border-[#0B2545] bg-[#0B2545] text-white"
                          : "border-neutral-300 dark:border-neutral-600 hover:border-[#0B2545]"
                      }`}
                    >
                      {subtipo}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </FilterModal>

      {/* Modal Preço Mín */}
      <FilterModal isOpen={precoMinModal} onClose={() => setPrecoMinModal(false)} title="Preço Mínimo">
        <div className="space-y-2">
          {precoMinOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters({ ...filters, precoMin: opt.value })}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                filters.precoMin === opt.value
                  ? "border-[#0B2545] bg-[#0B2545]/10"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
              }`}
            >
              <span className={`font-medium ${filters.precoMin === opt.value ? "text-[#0B2545]" : ""}`}>
                {opt.label}
              </span>
              {filters.precoMin === opt.value && <RiCheckLine className="w-5 h-5 text-[#0B2545]" />}
            </button>
          ))}
        </div>
      </FilterModal>

      {/* Modal Preço Máx */}
      <FilterModal isOpen={precoMaxModal} onClose={() => setPrecoMaxModal(false)} title="Preço Máximo">
        <div className="space-y-2">
          {precoMaxOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters({ ...filters, precoMax: opt.value })}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                filters.precoMax === opt.value
                  ? "border-[#0B2545] bg-[#0B2545]/10"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
              }`}
            >
              <span className={`font-medium ${filters.precoMax === opt.value ? "text-[#0B2545]" : ""}`}>
                {opt.label}
              </span>
              {filters.precoMax === opt.value && <RiCheckLine className="w-5 h-5 text-[#0B2545]" />}
            </button>
          ))}
        </div>
      </FilterModal>

      {/* Modal Quartos */}
      <FilterModal isOpen={quartosModal} onClose={() => setQuartosModal(false)} title="Dormitórios">
        <p className="text-sm text-neutral-500 mb-4">Selecione um ou mais</p>
        <div className="flex flex-wrap gap-3">
          {quartosOptions.map((opt) => {
            const isSelected = filters.quartos.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayFilter("quartos", opt)}
                className={`px-6 py-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#0B2545] bg-[#0B2545]/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className={`font-semibold ${isSelected ? "text-[#0B2545]" : ""}`}>{opt}</span>
              </button>
            );
          })}
        </div>
      </FilterModal>

      {/* Modal Suítes */}
      <FilterModal isOpen={suitesModal} onClose={() => setSuitesModal(false)} title="Suítes">
        <p className="text-sm text-neutral-500 mb-4">Selecione um ou mais</p>
        <div className="flex flex-wrap gap-3">
          {suitesOptions.map((opt) => {
            const isSelected = filters.suites.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayFilter("suites", opt)}
                className={`px-6 py-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#0B2545] bg-[#0B2545]/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className={`font-semibold ${isSelected ? "text-[#0B2545]" : ""}`}>{opt}</span>
              </button>
            );
          })}
        </div>
      </FilterModal>

      {/* Modal Vagas */}
      <FilterModal isOpen={vagasModal} onClose={() => setVagasModal(false)} title="Vagas de Garagem">
        <p className="text-sm text-neutral-500 mb-4">Selecione um ou mais</p>
        <div className="flex flex-wrap gap-3">
          {vagasOptions.map((opt) => {
            const isSelected = filters.vagas.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayFilter("vagas", opt)}
                className={`px-6 py-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#0B2545] bg-[#0B2545]/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className={`font-semibold ${isSelected ? "text-[#0B2545]" : ""}`}>{opt}</span>
              </button>
            );
          })}
        </div>
      </FilterModal>

      {/* Modal Características */}
      <FilterModal isOpen={caracteristicasModal} onClose={() => setCaracteristicasModal(false)} title="Características">
        <p className="text-sm text-neutral-500 mb-4">Selecione as características desejadas</p>
        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
          {caracteristicasOptions.map((opt) => {
            const isSelected = filters.caracteristicas.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayFilter("caracteristicas", opt)}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#0B2545] bg-[#0B2545]/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className={`text-sm font-medium ${isSelected ? "text-[#0B2545]" : ""}`}>{opt}</span>
                {isSelected && <RiCheckLine className="w-4 h-4 text-[#0B2545] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </FilterModal>

      {/* Modal Condomínios - com busca AJAX */}
      <FilterModal isOpen={condominioModal} onClose={() => setCondominioModal(false)} title="Condomínios">
        <p className="text-sm text-neutral-500 mb-3">Selecione um ou mais condomínios</p>
        <input
          type="text"
          placeholder="Buscar condomínio..."
          value={condoSearchInput}
          onChange={(e) => {
            setCondoSearchInput(e.target.value);
            if (condoDebounceRef.current) clearTimeout(condoDebounceRef.current);
            condoDebounceRef.current = setTimeout(() => setCondoSearch(e.target.value), 300);
          }}
          className="w-full px-4 py-2.5 mb-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/50"
        />
        <div className="space-y-1 max-h-[350px] overflow-y-auto">
          {condoOptionsFiltered.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">Nenhum condomínio encontrado</p>
          ) : condoOptionsFiltered.map((opt) => {
            const isSelected = filters.condominios.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayFilter("condominios", opt)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isSelected
                    ? "bg-[#0B2545]/10 border border-[#0B2545]/30"
                    : "border border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RiMapPinLine className={`w-4 h-4 ${isSelected ? "text-[#0B2545]" : "text-neutral-400"}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-[#0B2545]" : ""}`}>{opt}</span>
                </div>
                {isSelected && <RiCheckLine className="w-4 h-4 text-[#0B2545]" />}
              </button>
            );
          })}
        </div>
      </FilterModal>

      {/* Modal Perfil */}
      <FilterModal isOpen={perfilModal} onClose={() => setPerfilModal(false)} title="Perfil do Imóvel">
        <div className="space-y-2">
          {perfilOptions.map((opt) => {
            const isSelected = filters.perfil.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayFilter("perfil", opt)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#0B2545] bg-[#0B2545]/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className={`font-medium ${isSelected ? "text-[#0B2545]" : ""}`}>{opt}</span>
                {isSelected && <RiCheckLine className="w-5 h-5 text-[#0B2545]" />}
              </button>
            );
          })}
        </div>
      </FilterModal>

      {/* Modal Estágio */}
      <FilterModal isOpen={estagioModal} onClose={() => setEstagioModal(false)} title="Estágio da Obra">
        <div className="space-y-2">
          {estagioOptions.map((opt) => {
            const isSelected = filters.estagio.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggleArrayFilter("estagio", opt)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#0B2545] bg-[#0B2545]/10"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className={`font-medium ${isSelected ? "text-[#0B2545]" : ""}`}>{opt}</span>
                {isSelected && <RiCheckLine className="w-5 h-5 text-[#0B2545]" />}
              </button>
            );
          })}
        </div>
      </FilterModal>

      {/* Modal Área */}
      <FilterModal isOpen={areaModal} onClose={() => setAreaModal(false)} title="Área (m²)">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
              Área Mínima
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.areaMin}
              onChange={(e) => setFilters({ ...filters, areaMin: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
              Área Máxima
            </label>
            <input
              type="number"
              placeholder="Ilimitado"
              value={filters.areaMax}
              onChange={(e) => setFilters({ ...filters, areaMax: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-[#0B2545]"
            />
          </div>
        </div>
      </FilterModal>

      {/* Modal Condições Comerciais */}
      <FilterModal isOpen={condicoesModal} onClose={() => setCondicoesModal(false)} title="Condições Comerciais">
        <div className="space-y-3">
          {/* Analisa Permuta */}
          <button
            onClick={() =>
              setFilters({
                ...filters,
                aceitaPermuta: filters.aceitaPermuta === true ? null : true,
              })
            }
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              filters.aceitaPermuta === true
                ? "border-[#0B2545] bg-[#0B2545]/10"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}
          >
            <span className={`font-medium ${filters.aceitaPermuta === true ? "text-[#0B2545]" : ""}`}>
              Analisa Permuta
            </span>
            {filters.aceitaPermuta === true && <RiCheckLine className="w-5 h-5 text-[#0B2545]" />}
          </button>

          {/* Parcelamento Direto */}
          <button
            onClick={() =>
              setFilters({
                ...filters,
                parcelamentoDireto: filters.parcelamentoDireto === true ? null : true,
              })
            }
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              filters.parcelamentoDireto === true
                ? "border-[#0B2545] bg-[#0B2545]/10"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
            }`}
          >
            <span className={`font-medium ${filters.parcelamentoDireto === true ? "text-[#0B2545]" : ""}`}>
              Parcelamento Direto
            </span>
            {filters.parcelamentoDireto === true && <RiCheckLine className="w-5 h-5 text-[#0B2545]" />}
          </button>
        </div>
      </FilterModal>
    </>
  );
}

export type { FiltersState };
