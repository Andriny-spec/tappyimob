"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RiAddLine,
  RiMoreLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
  RiAttachmentLine,
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiLoader4Line,
  RiArrowLeftLine,
  RiFlagLine,
  RiTimeLine,
  RiMenuLine,
  RiDragMoveLine,
} from "react-icons/ri";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  position: number;
}

interface Checklist {
  id: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  priority?: string;
  labels: string[];
  color?: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  progress: number;
  attachments?: any[];
  checklists: Checklist[];
  _count?: { comments: number };
  columnId: string;
}

interface Column {
  id: string;
  name: string;
  color: string;
  position: number;
  cards: Card[];
}

interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  columns: Column[];
}

// Componente de Card Sortável
function SortableCard({ card, onEdit, onDelete }: { card: Card; onEdit: (card: Card) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const checklistProgress = card.checklists.reduce((acc, cl) => {
    const total = cl.items.length;
    const done = cl.items.filter(i => i.isCompleted).length;
    return { total: acc.total + total, done: acc.done + done };
  }, { total: 0, done: 0 });

  const priorityColors: Record<string, string> = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completedAt;

  // Calcular progresso automático baseado nos checklists
  const autoProgress = checklistProgress.total > 0 
    ? Math.round((checklistProgress.done / checklistProgress.total) * 100) 
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(card.color ? { borderLeftWidth: "4px", borderLeftColor: card.color } : {}),
      }}
      {...attributes}
      {...listeners}
      className={`group relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all overflow-hidden ${isDragging ? "cursor-grabbing opacity-50 shadow-xl ring-2 ring-purple-500" : "cursor-grab"}`}
    >
      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 z-10">
        <RiDragMoveLine className="w-4 h-4 text-neutral-400" />
      </div>
      
      <div className="p-3" onClick={() => onEdit(card)}>

        {/* Status Badge */}
        {(card as any).status && (card as any).status !== "AGUARDANDO" && (
          <div className="mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              (card as any).status === "EM_PROGRESSO" ? "bg-blue-100 text-blue-700" :
              (card as any).status === "CONCLUIDO" ? "bg-green-100 text-green-700" :
              (card as any).status === "ATRASADO" ? "bg-red-100 text-red-700" :
              "bg-neutral-100 text-neutral-600"
            }`}>
              {(card as any).status === "EM_PROGRESSO" ? "Em Progresso" :
               (card as any).status === "CONCLUIDO" ? "✓ Concluído" :
               (card as any).status === "ATRASADO" ? "⚠ Atrasado" :
               (card as any).status}
            </span>
          </div>
        )}

        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: label, color: "white" }}
              >
                &nbsp;
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2 pr-6">
          {card.title}
        </h4>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-500">
          {card.priority && card.priority !== "MEDIUM" && (
            <span className={`px-1.5 py-0.5 rounded ${priorityColors[card.priority]}`}>
              <RiFlagLine className="w-3 h-3 inline mr-0.5" />
              {card.priority}
            </span>
          )}
          
          {card.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : ""}`}>
              <RiCalendarLine className="w-3 h-3" />
              {new Date(card.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          )}

          {checklistProgress.total > 0 && (
            <span className="flex items-center gap-1">
              <RiCheckboxLine className="w-3 h-3" />
              {checklistProgress.done}/{checklistProgress.total}
            </span>
          )}

          {card.attachments && card.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <RiAttachmentLine className="w-3 h-3" />
              {card.attachments.length}
            </span>
          )}

          {card._count?.comments ? (
            <span className="flex items-center gap-1">
              💬 {card._count.comments}
            </span>
          ) : null}
        </div>

        {/* Progress bar - automático baseado nos checklists */}
        {autoProgress > 0 && (
          <div className="mt-2 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                autoProgress === 100 ? "bg-green-500" : "bg-purple-500"
              }`}
              style={{ width: `${autoProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Droppable para a área de cards
function DroppableColumn({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${columnId}`, // Prefixo para evitar conflito com SortableColumn
    data: { type: "column-area", columnId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[150px] transition-all rounded-xl ${isOver ? "bg-purple-100 dark:bg-purple-500/20 ring-2 ring-purple-400 ring-inset" : ""}`}
    >
      {children}
    </div>
  );
}

// Componente de Coluna Sortável
function SortableColumn({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
}: {
  column: Column;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "column", column } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim() && name !== column.name) {
      onEditColumn({ ...column, name: name.trim() });
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-72 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl flex flex-col max-h-full"
    >
      {/* Header */}
      <div
        className="p-3 flex items-center gap-2 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color }}
        />
        
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setName(column.name);
                setIsEditing(false);
              }
            }}
            className="flex-1 px-2 py-1 text-sm font-semibold bg-white dark:bg-neutral-700 rounded border-none focus:ring-2 focus:ring-purple-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            className="flex-1 text-sm font-semibold text-neutral-900 dark:text-white cursor-text"
            onDoubleClick={() => setIsEditing(true)}
          >
            {column.name}
          </h3>
        )}

        <span className="text-xs text-neutral-500 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-full">
          {column.cards.length}
        </span>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <RiMoreLine className="w-4 h-4 text-neutral-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
              >
                <RiEditLine className="w-4 h-4" /> Renomear
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Deletar coluna e todos os cards?")) {
                    onDeleteColumn(column.id);
                  }
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
              >
                <RiDeleteBinLine className="w-4 h-4" /> Deletar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards - Droppable Area */}
      <DroppableColumn columnId={column.id}>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[100px]">
          <SortableContext
            items={column.cards.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
          </SortableContext>
          {column.cards.length === 0 && (
            <div className="h-20 flex items-center justify-center text-neutral-400 text-sm border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
              Arraste cards aqui
            </div>
          )}
        </div>
      </DroppableColumn>

      {/* Add Card */}
      <button
        onClick={() => onAddCard(column.id)}
        className="m-3 mt-0 p-2 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-purple-400 hover:text-purple-500 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <RiAddLine className="w-4 h-4" />
        Adicionar Card
      </button>
    </div>
  );
}

// Modal de Edição de Card
function CardModal({
  card,
  onClose,
  onSave,
  onDelete,
}: {
  card: Card;
  onClose: () => void;
  onSave: (card: Partial<Card>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({
    title: card.title,
    description: card.description || "",
    priority: card.priority || "MEDIUM",
    status: (card as any).status || "AGUARDANDO",
    startDate: card.startDate?.split("T")[0] || "",
    dueDate: card.dueDate?.split("T")[0] || "",
    color: card.color || "",
  });
  const [checklists, setChecklists] = useState<Checklist[]>(card.checklists || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [showListModal, setShowListModal] = useState(false);
  const [listInput, setListInput] = useState("");

  const handleSave = () => {
    onSave({
      id: card.id,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      color: form.color || undefined,
    } as any);
  };

  const deleteChecklist = async (checklistId: string) => {
    try {
      await fetch(`/api/admin/task-boards/cards/checklists?id=${checklistId}&type=checklist`, {
        method: "DELETE",
      });
      setChecklists(checklists.filter(cl => cl.id !== checklistId));
    } catch (error) {
      console.error(error);
    }
  };

  const generateListFromText = async () => {
    if (!listInput.trim()) return;
    
    const lines = listInput.split("\n").filter(line => line.trim());
    if (lines.length === 0) return;

    try {
      const res = await fetch("/api/admin/task-boards/cards/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, title: "Lista de Tarefas" }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const checklistId = data.checklist.id;

        // Adicionar cada linha como item
        for (const line of lines) {
          await fetch("/api/admin/task-boards/cards/checklists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checklistId, text: line.trim() }),
          });
        }

        // Recarregar checklist com itens
        const checklistRes = await fetch(`/api/admin/task-boards/cards?id=${card.id}`);
        if (checklistRes.ok) {
          const cardData = await checklistRes.json();
          setChecklists(cardData.card.checklists || []);
        }
        
        setListInput("");
        setShowListModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const res = await fetch("/api/admin/task-boards/cards/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, title: newChecklistTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setChecklists([...checklists, data.checklist]);
        setNewChecklistTitle("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addChecklistItem = async (checklistId: string) => {
    const text = newItemTexts[checklistId];
    if (!text?.trim()) return;
    try {
      const res = await fetch("/api/admin/task-boards/cards/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistId, text }),
      });
      if (res.ok) {
        const data = await res.json();
        setChecklists(checklists.map(cl =>
          cl.id === checklistId
            ? { ...cl, items: [...cl.items, data.item] }
            : cl
        ));
        setNewItemTexts({ ...newItemTexts, [checklistId]: "" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleItem = async (checklistId: string, itemId: string, isCompleted: boolean) => {
    try {
      await fetch("/api/admin/task-boards/cards/checklists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, type: "item", isCompleted: !isCompleted }),
      });
      setChecklists(checklists.map(cl =>
        cl.id === checklistId
          ? {
              ...cl,
              items: cl.items.map(item =>
                item.id === itemId ? { ...item, isCompleted: !isCompleted } : item
              ),
            }
          : cl
      ));
    } catch (error) {
      console.error(error);
    }
  };

  const colors = ["#ef4444", "#25D366", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-xl font-bold w-full bg-transparent border-none p-0 focus:ring-0"
            placeholder="Título da tarefa"
          />
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              placeholder="Adicione uma descrição..."
            />
          </div>

          {/* Cores */}
          <div>
            <label className="block text-sm font-medium mb-2">Cor do Card</label>
            <div className="flex gap-2">
              <button
                onClick={() => setForm({ ...form, color: "" })}
                className={`w-8 h-8 rounded-lg border-2 ${!form.color ? "border-purple-500" : "border-neutral-300"}`}
              >
                ✕
              </button>
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-lg border-2 ${form.color === color ? "border-purple-500 ring-2 ring-purple-300" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Datas e Prioridade */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Início</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Entrega</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prioridade</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "AGUARDANDO", label: "Aguardando", color: "bg-neutral-100 text-neutral-600 border-neutral-300" },
                { value: "EM_PROGRESSO", label: "Em Progresso", color: "bg-blue-100 text-blue-600 border-blue-300" },
                { value: "CONCLUIDO", label: "Concluído", color: "bg-green-100 text-green-600 border-green-300" },
                { value: "ATRASADO", label: "Atrasado", color: "bg-red-100 text-red-600 border-red-300" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: s.value })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                    form.status === s.value
                      ? `${s.color} border-current ring-2 ring-offset-1`
                      : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Anexos */}
          <div>
            <label className="block text-sm font-medium mb-2">Anexos</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(card.attachments || []).map((att: any, i: number) => (
                <div key={i} className="relative group">
                  {att.type?.startsWith("image") ? (
                    <img src={att.url} alt={att.name} className="w-full h-20 object-cover rounded-lg" />
                  ) : att.type?.startsWith("video") ? (
                    <video src={att.url} className="w-full h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-20 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                      <RiAttachmentLine className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white bg-black/50 rounded px-1 truncate">
                    {att.name}
                  </span>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl cursor-pointer hover:border-purple-400 hover:text-purple-500 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  
                  for (const file of Array.from(files)) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("cardId", card.id);
                    
                    try {
                      const res = await fetch("/api/admin/task-boards/cards/upload", {
                        method: "POST",
                        body: formData,
                      });
                      if (res.ok) {
                        const data = await res.json();
                        card.attachments = [...(card.attachments || []), data.attachment];
                      }
                    } catch (error) {
                      console.error(error);
                    }
                  }
                }}
              />
              <RiAddLine className="w-4 h-4" />
              <span className="text-sm">Adicionar imagem ou vídeo</span>
            </label>
          </div>

          {/* Checklists */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Checklists</label>
              <button
                onClick={() => setShowListModal(true)}
                className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-90"
              >
                + Gerar Lista
              </button>
            </div>
            
            {checklists.map((checklist) => (
              <div key={checklist.id} className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{checklist.title}</h4>
                  <button
                    onClick={() => deleteChecklist(checklist.id)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {checklist.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => toggleItem(checklist.id, item.id, item.isCompleted)}
                    >
                      {item.isCompleted ? (
                        <RiCheckboxLine className="w-5 h-5 text-green-500" />
                      ) : (
                        <RiCheckboxBlankLine className="w-5 h-5 text-neutral-400" />
                      )}
                      <span className={item.isCompleted ? "line-through text-neutral-500" : ""}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newItemTexts[checklist.id] || ""}
                    onChange={(e) => setNewItemTexts({ ...newItemTexts, [checklist.id]: e.target.value })}
                    placeholder="Novo item..."
                    className="flex-1 px-2 py-1 text-sm rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addChecklistItem(checklist.id);
                    }}
                  />
                  <button
                    onClick={() => addChecklistItem(checklist.id)}
                    className="px-2 py-1 bg-purple-500 text-white rounded text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Novo checklist..."
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addChecklist();
                }}
              />
              <button
                onClick={addChecklist}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-medium"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">
          <button
            onClick={() => {
              if (confirm("Deletar esta tarefa?")) onDelete();
            }}
            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl font-medium flex items-center gap-2"
          >
            <RiDeleteBinLine className="w-4 h-4" />
            Deletar
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600"
            >
              Salvar
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal Gerar Lista */}
      {showListModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          onClick={() => setShowListModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Gerar Lista de Tarefas</h3>
            <p className="text-sm text-neutral-500 mb-3">
              Cole ou digite sua lista (uma tarefa por linha):
            </p>
            <textarea
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              placeholder="• Tarefa 1&#10;• Tarefa 2&#10;• Tarefa 3"
              rows={8}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowListModal(false)}
                className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={generateListFromText}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600"
              >
                Criar Lista
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Página Principal
export default function TarefasPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"card" | "column" | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch("/api/admin/task-boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
        
        // Se tem boards, carregar o primeiro
        if (data.boards?.length > 0) {
          fetchBoard(data.boards[0].id);
        } else {
          // Criar board padrão
          await createBoard();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoard = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/task-boards?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data.board);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createBoard = async () => {
    try {
      const res = await fetch("/api/admin/task-boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Meu Quadro" }),
      });
      if (res.ok) {
        const data = await res.json();
        setBoard({ ...data.board, columns: data.board.columns.map((c: any) => ({ ...c, cards: [] })) });
        setBoards([data.board]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addColumn = async () => {
    if (!board) return;
    try {
      const res = await fetch("/api/admin/task-boards/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: board.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setBoard({
          ...board,
          columns: [...board.columns, { ...data.column, cards: [] }],
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateColumn = async (column: Column) => {
    try {
      await fetch("/api/admin/task-boards/columns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: column.id, name: column.name, color: column.color }),
      });
      if (board) {
        setBoard({
          ...board,
          columns: board.columns.map((c) => (c.id === column.id ? { ...c, ...column } : c)),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      await fetch(`/api/admin/task-boards/columns?id=${id}`, { method: "DELETE" });
      if (board) {
        setBoard({
          ...board,
          columns: board.columns.filter((c) => c.id !== id),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addCard = async (columnId: string) => {
    try {
      const res = await fetch("/api/admin/task-boards/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (board) {
          setBoard({
            ...board,
            columns: board.columns.map((c) =>
              c.id === columnId
                ? { ...c, cards: [...c.cards, { ...data.card, checklists: [] }] }
                : c
            ),
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateCard = async (cardData: Partial<Card>) => {
    try {
      await fetch("/api/admin/task-boards/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });
      if (board) {
        setBoard({
          ...board,
          columns: board.columns.map((c) => ({
            ...c,
            cards: c.cards.map((card) =>
              card.id === cardData.id ? { ...card, ...cardData } : card
            ),
          })),
        });
      }
      setEditingCard(null);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await fetch(`/api/admin/task-boards/cards?id=${id}`, { method: "DELETE" });
      if (board) {
        setBoard({
          ...board,
          columns: board.columns.map((c) => ({
            ...c,
            cards: c.cards.filter((card) => card.id !== id),
          })),
        });
      }
      setEditingCard(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Ignorar se estamos arrastando uma coluna
    if (active.data.current?.type === "column") return;

    // Encontrar coluna de origem do card ativo
    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );
    
    if (!activeColumn) return;

    // Tentar encontrar a coluna de destino de várias formas:
    let targetColumn: Column | undefined;
    let overCardIndex = -1;

    // 1. Verificar se over é uma área droppable de coluna (droppable-xxx)
    if (overId.startsWith("droppable-")) {
      const columnId = overId.replace("droppable-", "");
      targetColumn = board.columns.find((col) => col.id === columnId);
    }

    // 2. Verificar se over é um card
    if (!targetColumn) {
      targetColumn = board.columns.find((col) =>
        col.cards.some((card) => card.id === overId)
      );
      if (targetColumn) {
        overCardIndex = targetColumn.cards.findIndex((c) => c.id === overId);
      }
    }

    if (!targetColumn) return;
    if (activeColumn.id === targetColumn.id) return;

    // Mover card para outra coluna
    const activeCard = activeColumn.cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    setBoard((prevBoard) => {
      if (!prevBoard) return prevBoard;
      return {
        ...prevBoard,
        columns: prevBoard.columns.map((col) => {
          // Remover da coluna de origem
          if (col.id === activeColumn.id) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== activeId),
            };
          }
          // Adicionar na coluna de destino
          if (col.id === targetColumn!.id) {
            const newCards = [...col.cards];
            const insertIndex = overCardIndex === -1 ? col.cards.length : overCardIndex;
            newCards.splice(insertIndex, 0, { ...activeCard, columnId: col.id });
            return { ...col, cards: newCards };
          }
          return col;
        }),
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    // Reordenar colunas
    if (activeData?.type === "column" && (overData?.type === "column" || board.columns.some(c => c.id === overId))) {
      const oldIndex = board.columns.findIndex((c) => c.id === activeId);
      const newIndex = board.columns.findIndex((c) => c.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newColumns = arrayMove(board.columns, oldIndex, newIndex);
        setBoard({ ...board, columns: newColumns });

        // Salvar nova ordem
        await fetch("/api/admin/task-boards/columns", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reorder: newColumns.map((c, i) => ({ id: c.id, position: i })),
          }),
        });
      }
      return;
    }

    // Reordenar cards dentro da mesma coluna ou salvar mudança de coluna
    if (activeData?.type === "card") {
      // Encontrar coluna atual do card (após o handleDragOver já ter movido)
      const currentColumn = board.columns.find((c) =>
        c.cards.some((card) => card.id === activeId)
      );

      if (currentColumn) {
        const oldIndex = currentColumn.cards.findIndex((c) => c.id === activeId);
        let newIndex = oldIndex;

        // Se over é um card na mesma coluna, reordenar
        if (overData?.type === "card" || currentColumn.cards.some(c => c.id === overId)) {
          const overIdx = currentColumn.cards.findIndex((c) => c.id === overId);
          if (overIdx !== -1) {
            newIndex = overIdx;
          }
        }

        // Reordenar se necessário
        let finalCards = currentColumn.cards;
        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          finalCards = arrayMove(currentColumn.cards, oldIndex, newIndex);
          setBoard({
            ...board,
            columns: board.columns.map((c) =>
              c.id === currentColumn.id ? { ...c, cards: finalCards } : c
            ),
          });
        }

        // Salvar nova ordem e coluna no backend
        await fetch("/api/admin/task-boards/cards", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reorder: finalCards.map((c, i) => ({
              id: c.id,
              columnId: currentColumn.id,
              position: i,
            })),
          }),
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <RiLoader4Line className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <RiArrowLeftLine className="w-5 h-5 text-neutral-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: board?.color || "#7c3aed" }}
                />
                {board?.name || "Tarefas"}
              </h1>
              <p className="text-sm text-neutral-500">
                {board?.columns.reduce((acc, c) => acc + c.cards.length, 0) || 0} tarefas
              </p>
            </div>
          </div>

          <button
            onClick={addColumn}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600"
          >
            <RiAddLine className="w-4 h-4" />
            Nova Coluna
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            <SortableContext
              items={board?.columns.map((c) => c.id) || []}
              strategy={horizontalListSortingStrategy}
            >
              {board?.columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  onAddCard={addCard}
                  onEditCard={setEditingCard}
                  onDeleteCard={deleteCard}
                  onEditColumn={updateColumn}
                  onDeleteColumn={deleteColumn}
                />
              ))}
            </SortableContext>

            {/* Add Column Button */}
            <button
              onClick={addColumn}
              className="flex-shrink-0 w-72 h-24 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-purple-400 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
            >
              <RiAddLine className="w-5 h-5" />
              Adicionar Coluna
            </button>
          </div>

          {/* Drag Overlay - mostra o card sendo arrastado */}
          <DragOverlay>
            {activeId && activeType === "card" ? (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border-2 border-purple-500 shadow-2xl p-3 w-64 opacity-90">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {board?.columns
                    .flatMap((c) => c.cards)
                    .find((c) => c.id === activeId)?.title || "Arrastando..."}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Edit Modal */}
      <AnimatePresence>
        {editingCard && (
          <CardModal
            card={editingCard}
            onClose={() => setEditingCard(null)}
            onSave={updateCard}
            onDelete={() => deleteCard(editingCard.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
