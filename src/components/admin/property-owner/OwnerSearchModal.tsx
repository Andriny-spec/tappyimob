"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiLoader4Line,
  RiUser3Line,
  RiPhoneLine,
  RiMailLine,
  RiHome4Line,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
} from "react-icons/ri";

interface PropertyOwner {
  id: string;
  name: string;
  email: string | null;
  phones: string[];
  cpf: string | null;
  _count: { properties: number };
  properties: {
    id: string;
    code: string;
    title: string;
    price: number;
    status: string;
  }[];
}

interface OwnerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (owner: PropertyOwner) => void;
  onCreateNew: (initialData: { name?: string; phone?: string }) => void;
  initialPhone?: string;
}

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function OwnerSearchModal({
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
  initialPhone = "",
}: OwnerSearchModalProps) {
  const [searchPhone, setSearchPhone] = useState(initialPhone);
  const [searchName, setSearchName] = useState("");
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(null);

  useEffect(() => {
    if (isOpen && initialPhone) {
      setSearchPhone(initialPhone);
      handleSearch(initialPhone, "");
    }
  }, [isOpen, initialPhone]);

  const handleSearch = useCallback(async (phone: string, name: string) => {
    if (!phone && !name) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (phone) params.set("phone", phone.replace(/\D/g, ""));
      if (name) params.set("name", name);

      const res = await fetch(`/api/admin/property-owners/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOwners(data.owners || []);
      }
    } catch (error) {
      console.error("Erro ao buscar vendedor:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchPhone, searchName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
            <RiUser3Line className="w-5 h-5 text-emerald-500" />
            Vincular Vendedor
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Busca */}
        <form onSubmit={handleSubmitSearch} className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 mb-3">
            Busque pelo telefone ou nome para verificar se o vendedor já está cadastrado
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <RiPhoneLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Telefone do vendedor"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="relative flex-1">
              <RiUser3Line className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Nome do vendedor"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || (!searchPhone && !searchName)}
              className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <RiLoader4Line className="w-5 h-5 animate-spin" />
              ) : (
                <RiSearchLine className="w-5 h-5" />
              )}
              Buscar
            </button>
          </div>
        </form>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RiLoader4Line className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : hasSearched && owners.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <RiUser3Line className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                Nenhum vendedor encontrado
              </h4>
              <p className="text-sm text-neutral-500 mb-6">
                Não encontramos nenhum vendedor com esse telefone/nome cadastrado
              </p>
              <button
                onClick={() => onCreateNew({ name: searchName, phone: searchPhone })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                <RiAddLine className="w-5 h-5" />
                Cadastrar Novo Vendedor
              </button>
            </div>
          ) : owners.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-500 mb-4">
                {owners.length === 1 
                  ? "Encontramos 1 vendedor com esse telefone/nome:" 
                  : `Encontramos ${owners.length} vendedores com esse telefone/nome:`}
              </p>

              {owners.map((owner) => (
                <div
                  key={owner.id}
                  onClick={() => setSelectedOwner(selectedOwner?.id === owner.id ? null : owner)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedOwner?.id === owner.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedOwner?.id === owner.id 
                          ? "bg-emerald-500 text-white" 
                          : "bg-neutral-100 dark:bg-neutral-700"
                      }`}>
                        {selectedOwner?.id === owner.id ? (
                          <RiCheckLine className="w-5 h-5" />
                        ) : (
                          <span className="font-bold text-neutral-600 dark:text-neutral-400">
                            {owner.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{owner.name}</p>
                        <div className="flex items-center gap-3 text-sm text-neutral-500">
                          {owner.phones[0] && (
                            <span className="flex items-center gap-1">
                              <RiPhoneLine className="w-3 h-3" />
                              {formatPhone(owner.phones[0])}
                            </span>
                          )}
                          {owner.email && (
                            <span className="flex items-center gap-1">
                              <RiMailLine className="w-3 h-3" />
                              {owner.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                        {owner._count.properties} {owner._count.properties === 1 ? "imóvel" : "imóveis"}
                      </span>
                    </div>
                  </div>

                  {/* Expandir para mostrar imóveis */}
                  <AnimatePresence>
                    {selectedOwner?.id === owner.id && owner.properties.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                      >
                        <p className="text-xs text-neutral-500 mb-2">Imóveis deste vendedor:</p>
                        <div className="space-y-2">
                          {owner.properties.slice(0, 3).map((prop) => (
                            <div key={prop.id} className="flex items-center justify-between text-sm">
                              <span className="text-neutral-600 dark:text-neutral-400">
                                <strong>{prop.code}</strong> - {prop.title.substring(0, 30)}...
                              </span>
                              <span className="text-emerald-600 font-medium">
                                {formatCurrency(prop.price)}
                              </span>
                            </div>
                          ))}
                          {owner.properties.length > 3 && (
                            <p className="text-xs text-neutral-400">
                              + {owner.properties.length - 3} outros imóveis
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Opção de criar novo mesmo assim */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 mt-4">
                <button
                  onClick={() => onCreateNew({ name: searchName, phone: searchPhone })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-600 dark:text-neutral-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors"
                >
                  <RiAddLine className="w-5 h-5" />
                  Cadastrar Novo Vendedor
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <RiSearchLine className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>Digite o telefone ou nome do vendedor para buscar</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedOwner && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
            <button
              onClick={() => onSelect(selectedOwner)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
            >
              <RiCheckLine className="w-5 h-5" />
              Vincular {selectedOwner.name}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
