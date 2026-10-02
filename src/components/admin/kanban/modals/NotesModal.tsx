"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiFileTextLine,
  RiAddLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiLoader4Line,
} from "react-icons/ri";
import { Lead, LeadNote } from "@/types/lead";

interface NotesModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (leadId: string, notes: string[]) => void;
}

export function NotesModal({ lead, isOpen, onClose }: NotesModalProps) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar notas quando o modal abre
  useEffect(() => {
    if (isOpen && lead) {
      fetchNotes();
    }
  }, [isOpen, lead?.id]);

  const fetchNotes = async () => {
    if (!lead) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes([note, ...notes]);
        setNewNote("");
      }
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!lead) return;
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes?noteId=${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
      }
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md p-6 pointer-events-auto max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <RiFileTextLine className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Anotações
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

              {/* Add new note */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Adicionar anotação..."
                  className="flex-1 h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 h-10 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RiAddLine className="w-5 h-5" />
                </button>
              </div>

              {/* Notes list */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <RiLoader4Line className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <RiFileTextLine className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma anotação</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl group"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          {note.content}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                          <RiTimeLine className="w-3 h-3" />
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onClose}
                  className="w-full h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
