"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiStickyNoteLine,
  RiArrowLeftSLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";

interface NotesActionProps {
  chatId: string;
  chatName: string;
  onBack: () => void;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export function NotesAction({ chatId, chatName, onBack }: NotesActionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<{ id: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [chatId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Erro ao buscar notas:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        setNewNote("");
      }
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Excluir esta anotação?")) return;

    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
      }
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    try {
      const response = await fetch(`/api/admin/notes/${editingNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingNote.content }),
      });

      if (response.ok) {
        setNotes(notes.map((n) => (n.id === editingNote.id ? { ...n, content: editingNote.content } : n)));
        setEditingNote(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar nota:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onBack}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <RiArrowLeftSLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
        <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
          <RiStickyNoteLine className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Anotações</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
      </div>

      {/* Nova Nota */}
      <div className="flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Adicionar anotação..."
          rows={2}
          className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none resize-none"
        />
        <button
          onClick={handleAddNote}
          disabled={loading || !newNote.trim()}
          className="px-3 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 flex items-center"
        >
          {loading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiAddLine className="w-4 h-4" />}
        </button>
      </div>

      {/* Lista de Notas */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            <RiStickyNoteLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhuma anotação ainda</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl group"
            >
              {editingNote?.id === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    rows={2}
                    className="w-full px-2 py-1 bg-white dark:bg-neutral-900 border border-yellow-300 dark:border-yellow-700 rounded text-xs resize-none"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleUpdateNote}
                      className="flex-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs font-medium"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-yellow-600 dark:text-yellow-400">
                      {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingNote({ id: note.id, content: note.content })}
                        className="p-1 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 rounded"
                      >
                        <RiEditLine className="w-3 h-3 text-yellow-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <RiDeleteBinLine className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Voltar */}
      <button
        onClick={onBack}
        className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Voltar
      </button>
    </motion.div>
  );
}
