"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiPriceTag3Line,
  RiCalendarLine,
  RiUserLine,
  RiMessageLine,
  RiLoader4Line,
  RiHome4Line,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";

interface Property {
  id: string;
  code: string;
  title: string;
  price: number;
}

interface EvaluationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EvaluationFormModal({ isOpen, onClose, onSave }: EvaluationFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchProperty, setSearchProperty] = useState("");
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [formData, setFormData] = useState({
    propertyId: "",
    value: "",
    evaluator: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Fetch properties for selection
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties?limit=100");
        const data = await response.json();
        if (response.ok) {
          setProperties(data.properties);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchProperty.toLowerCase()) ||
      p.code.toLowerCase().includes(searchProperty.toLowerCase())
  );

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData((prev) => ({
      ...prev,
      propertyId: property.id,
    }));
    setShowPropertyList(false);
    setSearchProperty("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyId) {
      setError("Selecione um imóvel");
      return;
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError("Informe um valor válido");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          value: parseFloat(formData.value),
          evaluator: formData.evaluator,
          date: formData.date,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar avaliação");
      }

      onSave();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Erro ao criar avaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      propertyId: "",
      value: "",
      evaluator: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setSelectedProperty(null);
    setError("");
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Nova Avaliação
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Property Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiHome4Line className="inline w-4 h-4 mr-1" />
                    Imóvel *
                  </label>
                  <input
                    type="text"
                    value={selectedProperty ? `${selectedProperty.code} - ${selectedProperty.title}` : searchProperty}
                    onChange={(e) => {
                      setSearchProperty(e.target.value);
                      setShowPropertyList(true);
                      if (selectedProperty) {
                        setSelectedProperty(null);
                        setFormData((prev) => ({ ...prev, propertyId: "" }));
                      }
                    }}
                    onFocus={() => setShowPropertyList(true)}
                    placeholder="Buscar imóvel por código ou título..."
                    className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  
                  {showPropertyList && (searchProperty || !selectedProperty) && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-60 overflow-y-auto">
                      {filteredProperties.length === 0 ? (
                        <div className="p-4 text-center text-neutral-500">
                          Nenhum imóvel encontrado
                        </div>
                      ) : (
                        filteredProperties.slice(0, 10).map((property) => (
                          <button
                            key={property.id}
                            type="button"
                            onClick={() => handleSelectProperty(property)}
                            className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 last:border-0"
                          >
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {property.title}
                            </p>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-neutral-500">{property.code}</p>
                              <p className="text-xs font-medium text-purple-500">
                                {formatPrice(property.price)}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected property info */}
                {selectedProperty && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Preço anunciado: <strong>{formatPrice(selectedProperty.price)}</strong>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiMoneyDollarCircleLine className="inline w-4 h-4 mr-1" />
                      Valor avaliado (R$) *
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                      placeholder="0"
                      min="0"
                      step="1000"
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiCalendarLine className="inline w-4 h-4 mr-1" />
                      Data da avaliação *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiUserLine className="inline w-4 h-4 mr-1" />
                    Nome do avaliador *
                  </label>
                  <input
                    type="text"
                    name="evaluator"
                    value={formData.evaluator}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome do perito/avaliador"
                    className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiMessageLine className="inline w-4 h-4 mr-1" />
                    Observações / Laudo
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Descreva as condições do imóvel, pontos fortes, fracos, etc..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Price difference preview */}
                {selectedProperty && formData.value && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">Diferença:</span>
                      <span className={`font-bold ${
                        parseFloat(formData.value) >= selectedProperty.price
                          ? "text-green-500"
                          : "text-red-500"
                      }`}>
                        {parseFloat(formData.value) >= selectedProperty.price ? "+" : ""}
                        {formatPrice(parseFloat(formData.value) - selectedProperty.price)}
                        {" "}
                        ({(((parseFloat(formData.value) - selectedProperty.price) / selectedProperty.price) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RiLoader4Line className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <RiPriceTag3Line className="w-5 h-5" />
                        Salvar Avaliação
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
