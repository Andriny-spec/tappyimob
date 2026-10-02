"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiFileList3Line,
  RiLoader4Line,
  RiDownload2Line,
  RiEyeLine,
  RiAddLine,
  RiCheckLine,
  RiTimeLine,
  RiAlertLine,
  RiHome4Line,
} from "react-icons/ri";
import { Lead } from "@/types/lead";

interface ContractModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadId: string, contract: any) => void;
}

interface ContractDocument {
  id: string;
  name: string;
  type: "proposta" | "contrato" | "aditivo" | "distrato";
  status: "rascunho" | "enviado" | "assinado" | "cancelado";
  createdAt: string;
}

const documentTypes = [
  { id: "proposta", label: "Proposta Comercial" },
  { id: "contrato", label: "Contrato de Compra e Venda" },
  { id: "aditivo", label: "Aditivo Contratual" },
  { id: "distrato", label: "Distrato" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  rascunho: { label: "Rascunho", color: "text-neutral-500", bg: "bg-neutral-500/10" },
  enviado: { label: "Enviado", color: "text-blue-500", bg: "bg-blue-500/10" },
  assinado: { label: "Assinado", color: "text-green-500", bg: "bg-green-500/10" },
  cancelado: { label: "Cancelado", color: "text-red-500", bg: "bg-red-500/10" },
};

export function ContractModal({ lead, isOpen, onClose, onSave }: ContractModalProps) {
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState("proposta");

  const handleAddDocument = () => {
    const newDoc: ContractDocument = {
      id: `doc-${Date.now()}`,
      name: documentTypes.find((t) => t.id === selectedType)?.label || "Documento",
      type: selectedType as any,
      status: "rascunho",
      createdAt: new Date().toISOString(),
    };

    setDocuments([...documents, newDoc]);
    setShowForm(false);
    setSelectedType("proposta");
  };

  const handleUpdateStatus = (docId: string, status: ContractDocument["status"]) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status } : doc))
    );
  };

  const handleSave = async () => {
    if (!lead) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onSave(lead.id, documents);
    setIsSaving(false);
    onClose();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[60] pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md p-6 pointer-events-auto max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <RiFileList3Line className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Contratos
                    </h2>
                    <p className="text-sm text-neutral-500">{lead.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Property info */}
              {lead.property && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl mb-4">
                  <RiHome4Line className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {lead.property.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-neutral-500">{lead.property.code}</span>
                      <span className="text-orange-500 font-semibold">
                        {formatPrice(lead.property.price)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add button */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-2 w-full h-10 mb-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                >
                  <RiAddLine className="w-5 h-5" />
                  Novo Documento
                </button>
              )}

              {/* Add form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3"
                  >
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Tipo de documento
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {documentTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={`p-3 rounded-lg text-sm text-left transition-all ${
                            selectedType === type.id
                              ? "bg-indigo-500 text-white"
                              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowForm(false)}
                        className="flex-1 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddDocument}
                        className="flex-1 h-9 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
                      >
                        Criar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Documents list */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <RiFileList3Line className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum documento</p>
                    <p className="text-xs text-neutral-400">
                      Crie propostas e contratos para este lead
                    </p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                            <RiTimeLine className="w-3 h-3" />
                            {formatDate(doc.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusConfig[doc.status]?.bg
                          } ${statusConfig[doc.status]?.color}`}
                        >
                          {statusConfig[doc.status]?.label}
                        </span>
                      </div>

                      {/* Status buttons */}
                      <div className="flex flex-wrap gap-2">
                        {doc.status === "rascunho" && (
                          <button
                            onClick={() => handleUpdateStatus(doc.id, "enviado")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
                          >
                            Enviar
                          </button>
                        )}
                        {doc.status === "enviado" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, "assinado")}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                            >
                              <RiCheckLine className="w-3 h-3" />
                              Assinado
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, "cancelado")}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-600">
                          <RiEyeLine className="w-3 h-3" />
                          Visualizar
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-600">
                          <RiDownload2Line className="w-3 h-3" />
                          Baixar
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Summary */}
              {documents.length > 0 && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {documents.length} documento(s)
                    </span>
                    <div className="flex items-center gap-2">
                      {documents.some((d) => d.status === "assinado") && (
                        <span className="flex items-center gap-1 text-green-500">
                          <RiCheckLine className="w-4 h-4" />
                          {documents.filter((d) => d.status === "assinado").length} assinado(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
