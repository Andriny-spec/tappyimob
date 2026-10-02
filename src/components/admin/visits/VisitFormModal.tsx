"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiMessageLine,
  RiLoader4Line,
  RiSearchLine,
  RiHome4Line,
} from "react-icons/ri";

interface Property {
  id: string;
  code: string;
  title: string;
}

interface VisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function VisitFormModal({ isOpen, onClose, onSave }: VisitFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchProperty, setSearchProperty] = useState("");
  const [showPropertyList, setShowPropertyList] = useState(false);

  const [formData, setFormData] = useState({
    propertyId: "",
    propertyTitle: "",
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    date: "",
    time: "",
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
    setFormData((prev) => ({
      ...prev,
      propertyId: property.id,
      propertyTitle: `${property.code} - ${property.title}`,
    }));
    setShowPropertyList(false);
    setSearchProperty("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          visitorName: formData.visitorName,
          visitorEmail: formData.visitorEmail,
          visitorPhone: formData.visitorPhone || undefined,
          date: formData.date,
          time: formData.time || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar visita");
      }

      onSave();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Erro ao criar visita");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      propertyId: "",
      propertyTitle: "",
      visitorName: "",
      visitorEmail: "",
      visitorPhone: "",
      date: "",
      time: "",
      notes: "",
    });
    setError("");
    onClose();
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00",
  ];

  const minDate = new Date().toISOString().split("T")[0];

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
                  Agendar Visita
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
                    value={formData.propertyTitle || searchProperty}
                    onChange={(e) => {
                      setSearchProperty(e.target.value);
                      setShowPropertyList(true);
                      if (formData.propertyId) {
                        setFormData((prev) => ({ ...prev, propertyId: "", propertyTitle: "" }));
                      }
                    }}
                    onFocus={() => setShowPropertyList(true)}
                    placeholder="Buscar imóvel por código ou título..."
                    className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  
                  {showPropertyList && (searchProperty || !formData.propertyId) && (
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
                            <p className="text-xs text-neutral-500">{property.code}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiUserLine className="inline w-4 h-4 mr-1" />
                    Nome do visitante *
                  </label>
                  <input
                    type="text"
                    name="visitorName"
                    value={formData.visitorName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nome completo"
                    className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiMailLine className="inline w-4 h-4 mr-1" />
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="visitorEmail"
                      value={formData.visitorEmail}
                      onChange={handleInputChange}
                      required
                      placeholder="email@exemplo.com"
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiPhoneLine className="inline w-4 h-4 mr-1" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="visitorPhone"
                      value={formData.visitorPhone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiCalendarLine className="inline w-4 h-4 mr-1" />
                      Data *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      min={minDate}
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <RiTimeLine className="inline w-4 h-4 mr-1" />
                      Horário
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <RiMessageLine className="inline w-4 h-4 mr-1" />
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Observações sobre a visita..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

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
                    className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RiLoader4Line className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <RiCalendarLine className="w-5 h-5" />
                        Agendar Visita
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
