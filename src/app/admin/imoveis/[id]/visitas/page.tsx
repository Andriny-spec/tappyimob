"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiUserVoiceLine,
  RiCalendarLine,
  RiLoader4Line,
  RiAddLine,
  RiUser3Line,
  RiHome4Line,
  RiCheckLine,
  RiFileTextLine,
} from "react-icons/ri";

interface BrokerNote {
  id: string;
  visitDate: string;
  clientName: string;
  brokerNotes?: string;
  createdAt: string;
  broker?: {
    id: string;
    name: string;
  };
}

export default function ObservacoesCorretorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [notes, setNotes] = useState<BrokerNote[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    visitDate: new Date().toISOString().split("T")[0],
    brokerNotes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propRes = await fetch(`/api/properties/${id}`);
        if (propRes.ok) {
          const propData = await propRes.json();
          setProperty(propData.property);
        }

        const notesRes = await fetch(`/api/properties/${id}/visits`);
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData.visits || []);
        }
      } catch (error) {
        console.error("Erro ao carregar observações:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSaveNote = async () => {
    if (!newNote.brokerNotes.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/properties/${id}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitDate: newNote.visitDate,
          clientName: "Observação do Corretor",
          brokerNotes: newNote.brokerNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes([data.visit, ...notes]);
        setShowAddModal(false);
        setNewNote({
          visitDate: new Date().toISOString().split("T")[0],
          brokerNotes: "",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar observação:", error);
    }
    setIsSaving(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <RiUserVoiceLine className="w-5 h-5 text-white" />
              </div>
              Observações do Corretor
            </h1>
            {property && (
              <p className="text-neutral-500 mt-1">
                {property.code} - {property.title}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium"
        >
          <RiAddLine className="w-4 h-4" />
          Nova Observação
        </button>
      </div>

      {/* Link para o imóvel */}
      <div className="flex gap-2">
        <Link
          href={`/admin/imoveis/${id}`}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm"
        >
          <RiHome4Line className="w-4 h-4" />
          Ver Ficha do Imóvel
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{notes.length}</p>
          <p className="text-sm text-neutral-500">Total de Observações</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-2xl font-bold text-green-600">
            {notes.filter((n) => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </p>
          <p className="text-sm text-neutral-500">Últimos 7 dias</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-2xl font-bold text-blue-600">
            {new Set(notes.map((n) => n.broker?.name)).size}
          </p>
          <p className="text-sm text-neutral-500">Corretores</p>
        </div>
      </div>

      {/* Lista de Observações */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="font-semibold text-lg mb-4">Histórico de Observações</h2>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <RiFileTextLine className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500">Nenhuma observação registrada</p>
            <p className="text-sm text-neutral-400 mt-1">
              Clique em "Nova Observação" para adicionar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                      <RiUser3Line className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {note.broker?.name || "Corretor"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <RiCalendarLine className="w-3 h-3" />
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                    {note.brokerNotes || "Sem observação"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Nova Observação */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <RiFileTextLine className="w-5 h-5 text-orange-500" />
              Nova Observação
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={newNote.visitDate}
                  onChange={(e) => setNewNote({ ...newNote, visitDate: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observação *</label>
                <textarea
                  rows={5}
                  value={newNote.brokerNotes}
                  onChange={(e) => setNewNote({ ...newNote, brokerNotes: e.target.value })}
                  placeholder="Escreva sua observação sobre o imóvel, visita, cliente interessado, etc..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!newNote.brokerNotes.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50"
              >
                {isSaving ? (
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                ) : (
                  <RiCheckLine className="w-4 h-4" />
                )}
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
