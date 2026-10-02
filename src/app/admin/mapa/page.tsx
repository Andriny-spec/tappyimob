"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiZoomInLine,
  RiZoomOutLine,
  RiFullscreenLine,
  RiDownloadLine,
  RiShareLine,
  RiPaletteLine,
  RiMindMap,
  RiSaveLine,
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiListCheck2,
  RiCloseLine,
  RiFileListLine,
} from "react-icons/ri";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  parentId: string | null;
  children: string[];
  collapsed: boolean;
  notes?: string;
  link?: string;
  icon?: string;
  checklist?: ChecklistItem[];
}

interface MindMapData {
  id: string;
  name: string;
  nodes: { [key: string]: MindMapNode };
  rootId: string;
  createdAt: string;
  updatedAt: string;
}

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#25D366", // orange
  "#6366F1", // indigo
  "#14B8A6", // teal
];

const initialData: MindMapData = {
  id: "local-1",
  name: "Mapa Imob",
  rootId: "root",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: {
    root: {
      id: "root",
      text: "TAPPY",
      x: 0,
      y: 0,
      color: "#3B82F6",
      parentId: null,
      children: ["node1", "node2", "node3", "node4"],
      collapsed: false,
      checklist: [],
    },
    node1: {
      id: "node1",
      text: "CRM",
      x: 120,
      y: -80,
      color: "#10B981",
      parentId: "root",
      children: ["node1-1", "node1-2", "node1-3"],
      collapsed: false,
      checklist: [
        { id: "c1", text: "Dashboard", completed: true },
        { id: "c2", text: "Leads", completed: true },
        { id: "c3", text: "Kanban", completed: false },
      ],
    },
    "node1-1": {
      id: "node1-1",
      text: "Imóveis",
      x: 220,
      y: -120,
      color: "#10B981",
      parentId: "node1",
      children: [],
      collapsed: false,
      checklist: [],
    },
    "node1-2": {
      id: "node1-2",
      text: "Clientes",
      x: 220,
      y: -80,
      color: "#10B981",
      parentId: "node1",
      children: [],
      collapsed: false,
      checklist: [],
    },
    "node1-3": {
      id: "node1-3",
      text: "Contratos",
      x: 220,
      y: -40,
      color: "#10B981",
      parentId: "node1",
      children: [],
      collapsed: false,
      checklist: [],
    },
    node2: {
      id: "node2",
      text: "Site",
      x: 120,
      y: 0,
      color: "#F59E0B",
      parentId: "root",
      children: ["node2-1", "node2-2"],
      collapsed: false,
      checklist: [],
    },
    "node2-1": {
      id: "node2-1",
      text: "Landing Pages",
      x: 220,
      y: -20,
      color: "#F59E0B",
      parentId: "node2",
      children: [],
      collapsed: false,
      checklist: [],
    },
    "node2-2": {
      id: "node2-2",
      text: "Blog",
      x: 220,
      y: 20,
      color: "#F59E0B",
      parentId: "node2",
      children: [],
      collapsed: false,
      checklist: [],
    },
    node3: {
      id: "node3",
      text: "Integrações",
      x: 120,
      y: 80,
      color: "#8B5CF6",
      parentId: "root",
      children: ["node3-1", "node3-2", "node3-3"],
      collapsed: false,
      checklist: [],
    },
    "node3-1": {
      id: "node3-1",
      text: "WhatsApp",
      x: 240,
      y: 40,
      color: "#8B5CF6",
      parentId: "node3",
      children: [],
      collapsed: false,
      checklist: [
        { id: "w1", text: "WAHA Setup", completed: true },
        { id: "w2", text: "Webhooks", completed: false },
      ],
    },
    "node3-2": {
      id: "node3-2",
      text: "Portais",
      x: 240,
      y: 80,
      color: "#8B5CF6",
      parentId: "node3",
      children: [],
      collapsed: false,
      checklist: [],
    },
    "node3-3": {
      id: "node3-3",
      text: "Email",
      x: 240,
      y: 120,
      color: "#8B5CF6",
      parentId: "node3",
      children: [],
      collapsed: false,
      checklist: [],
    },
    node4: {
      id: "node4",
      text: "Servidor",
      x: 120,
      y: 160,
      color: "#EF4444",
      parentId: "root",
      children: ["node4-1", "node4-2", "node4-3"],
      collapsed: false,
      checklist: [],
    },
    "node4-1": {
      id: "node4-1",
      text: "Docker",
      x: 230,
      y: 140,
      color: "#EF4444",
      parentId: "node4",
      children: [],
      collapsed: false,
      checklist: [
        { id: "s1", text: "Docker Setup", completed: true },
        { id: "s2", text: "PostgreSQL", completed: true },
        { id: "s3", text: "Redis", completed: true },
        { id: "s4", text: "MinIO", completed: true },
        { id: "s5", text: "Hetzner", completed: false },
      ],
    },
    "node4-2": {
      id: "node4-2",
      text: "Banco de Dados",
      x: 230,
      y: 180,
      color: "#EF4444",
      parentId: "node4",
      children: [],
      collapsed: false,
      checklist: [],
    },
    "node4-3": {
      id: "node4-3",
      text: "Storage",
      x: 230,
      y: 220,
      color: "#EF4444",
      parentId: "node4",
      children: [],
      collapsed: false,
      checklist: [],
    },
  },
};

export default function MapaImobPage() {
  const [data, setData] = useState<MindMapData>(initialData);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 400, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showChecklist, setShowChecklist] = useState<string | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mindmap-data");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar mapa salvo:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (hasChanges) {
      localStorage.setItem("mindmap-data", JSON.stringify(data));
    }
  }, [data, hasChanges]);

  useEffect(() => {
    if (editingNode && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingNode]);

  const markChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("mindmap-data", JSON.stringify(data));
      setHasChanges(false);
      setSaveMessage("Salvo!");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (error) {
      setSaveMessage("Erro ao salvar");
      setTimeout(() => setSaveMessage(""), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains("canvas-bg")) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNode(null);
      setShowChecklist(null);
      setShowColorPicker(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
    if (draggingNode) {
      const node = data.nodes[draggingNode];
      if (node) {
        const newX = (e.clientX - pan.x) / zoom;
        const newY = (e.clientY - pan.y) / zoom;
        setData((prev) => ({
          ...prev,
          nodes: {
            ...prev.nodes,
            [draggingNode]: { ...node, x: newX, y: newY },
          },
        }));
        markChanged();
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingNode(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 2));
  };

  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    setShowColorPicker(false);
  };

  const handleNodeDoubleClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode(nodeId);
    setEditText(data.nodes[nodeId].text);
  };

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId !== "root") {
      setDraggingNode(nodeId);
    }
  };

  const saveNodeText = () => {
    if (editingNode && editText.trim()) {
      setData((prev) => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [editingNode]: { ...prev.nodes[editingNode], text: editText.trim() },
        },
      }));
      markChanged();
    }
    setEditingNode(null);
    setEditText("");
  };

  const addChildNode = (parentId: string) => {
    const parent = data.nodes[parentId];
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const childCount = parent.children.length;
    const yOffset = childCount * 40; // Espaçamento vertical menor

    const newNode: MindMapNode = {
      id: newId,
      text: "Novo item",
      x: parent.x + 120, // Distância horizontal menor (era 200)
      y: parent.y + yOffset - (childCount * 20),
      color: parent.color,
      parentId: parentId,
      children: [],
      collapsed: false,
      checklist: [],
    };

    setData((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [newId]: newNode,
        [parentId]: {
          ...prev.nodes[parentId],
          children: [...prev.nodes[parentId].children, newId],
        },
      },
    }));

    setSelectedNode(newId);
    setEditingNode(newId);
    setEditText("Novo item");
    markChanged();
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === "root") return;

    const node = data.nodes[nodeId];
    if (!node) return;

    const deleteRecursive = (id: string, nodes: { [key: string]: MindMapNode }) => {
      const n = nodes[id];
      if (!n) return nodes;

      let newNodes = { ...nodes };
      n.children.forEach((childId) => {
        newNodes = deleteRecursive(childId, newNodes);
      });
      delete newNodes[id];
      return newNodes;
    };

    let newNodes = deleteRecursive(nodeId, data.nodes);

    if (node.parentId) {
      newNodes[node.parentId] = {
        ...newNodes[node.parentId],
        children: newNodes[node.parentId].children.filter((id) => id !== nodeId),
      };
    }

    setData((prev) => ({ ...prev, nodes: newNodes }));
    setSelectedNode(null);
    markChanged();
    // Nó excluído
  };

  const changeNodeColor = (nodeId: string, color: string) => {
    setData((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: { ...prev.nodes[nodeId], color },
      },
    }));
    setShowColorPicker(false);
    markChanged();
  };

  const toggleCollapse = (nodeId: string) => {
    setData((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: { ...prev.nodes[nodeId], collapsed: !prev.nodes[nodeId].collapsed },
      },
    }));
    markChanged();
  };

  // Checklist functions - suporta múltiplos itens separados por vírgula ou nova linha
  const addChecklistItem = (nodeId: string) => {
    if (!newChecklistItem.trim()) return;

    const node = data.nodes[nodeId];
    
    // Separa por vírgula ou nova linha e filtra vazios
    const items = newChecklistItem
      .split(/[,\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) return;

    const newItems: ChecklistItem[] = items.map((text, index) => ({
      id: `check-${Date.now()}-${index}`,
      text,
      completed: false,
    }));

    setData((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: {
          ...node,
          checklist: [...(node.checklist || []), ...newItems],
        },
      },
    }));

    setNewChecklistItem("");
    markChanged();
  };

  const toggleChecklistItem = (nodeId: string, itemId: string) => {
    const node = data.nodes[nodeId];
    if (!node.checklist) return;

    setData((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: {
          ...node,
          checklist: node.checklist!.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
        },
      },
    }));
    markChanged();
  };

  const deleteChecklistItem = (nodeId: string, itemId: string) => {
    const node = data.nodes[nodeId];
    if (!node.checklist) return;

    setData((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: {
          ...node,
          checklist: node.checklist!.filter((item) => item.id !== itemId),
        },
      },
    }));
    markChanged();
  };

  const getChecklistProgress = (nodeId: string) => {
    const node = data.nodes[nodeId];
    if (!node.checklist || node.checklist.length === 0) return null;
    const completed = node.checklist.filter((item) => item.completed).length;
    return { completed, total: node.checklist.length };
  };

  const renderConnections = () => {
    const connections: React.ReactElement[] = [];

    Object.values(data.nodes).forEach((node) => {
      if (node.parentId && data.nodes[node.parentId] && !data.nodes[node.parentId].collapsed) {
        const parent = data.nodes[node.parentId];
        
        // Ponto de saída do pai (lado direito)
        const startX = parent.x + 90;
        const startY = parent.y + 20;
        
        // Ponto de entrada do filho (lado esquerdo)
        const endX = node.x - 5;
        const endY = node.y + 20;

        // Curva bezier suave estilo MindMeister
        const midX = startX + (endX - startX) * 0.5;
        
        connections.push(
          <path
            key={`conn-${node.id}`}
            d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
            stroke={parent.color}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        );
      }
    });

    return connections;
  };

  const renderNodes = () => {
    return Object.values(data.nodes).map((node) => {
      if (node.parentId && data.nodes[node.parentId]?.collapsed) {
        return null;
      }

      const isSelected = selectedNode === node.id;
      const isEditing = editingNode === node.id;
      const isRoot = node.id === "root";
      const hasChildren = node.children.length > 0;
      const progress = getChecklistProgress(node.id);

      return (
        <motion.div
          key={node.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          style={{
            position: "absolute",
            left: node.x,
            top: node.y,
            transform: "translate(0, 0)",
          }}
          className={`group cursor-pointer select-none`}
          onClick={(e) => handleNodeClick(node.id, e)}
          onDoubleClick={(e) => handleNodeDoubleClick(node.id, e)}
          onMouseDown={(e) => handleNodeDragStart(node.id, e)}
        >
          <div
            className={`relative flex flex-col px-4 py-2 rounded-xl shadow-lg transition-all duration-200 ${
              isRoot ? "min-w-[120px]" : "min-w-[100px]"
            } ${isSelected ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
            style={{
              backgroundColor: node.color,
              boxShadow: isSelected
                ? `0 0 0 3px ${node.color}40, 0 4px 12px ${node.color}30`
                : `0 4px 12px ${node.color}30`,
            }}
          >
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={saveNodeText}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveNodeText();
                    if (e.key === "Escape") {
                      setEditingNode(null);
                      setEditText("");
                    }
                  }}
                  className="bg-transparent text-white font-medium text-sm outline-none w-full min-w-[80px]"
                  style={{ caretColor: "white" }}
                />
              ) : (
                <span className={`text-white font-medium ${isRoot ? "text-base" : "text-sm"}`}>
                  {node.text}
                </span>
              )}
            </div>

            {/* Checklist progress indicator */}
            {progress && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progress.completed === progress.total ? "bg-green-400" : "bg-white"
                    }`}
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${
                  progress.completed === progress.total ? "text-green-300" : "text-white/80"
                }`}>
                  {progress.completed}/{progress.total}
                </span>
              </div>
            )}

            {/* Status indicator based on checklist progress */}
            {progress && progress.completed === progress.total && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {progress && progress.completed < progress.total && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}

            {/* Collapse button */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(node.id);
                }}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                {node.collapsed ? (
                  <RiAddLine className="w-3 h-3" />
                ) : (
                  <span className="text-xs font-bold">−</span>
                )}
              </button>
            )}

            {/* Action toolbar */}
            {isSelected && !isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-1 z-50"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addChildNode(node.id);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                  title="Adicionar filho"
                >
                  <RiAddLine className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNode(node.id);
                    setEditText(node.text);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                  title="Editar"
                >
                  <RiEditLine className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChecklist(showChecklist === node.id ? null : node.id);
                    setShowColorPicker(false);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                  title="Checklist"
                >
                  <RiListCheck2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                    setShowChecklist(null);
                  }}
                  className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                  title="Cor"
                >
                  <RiPaletteLine className="w-4 h-4" />
                </button>
                {!isRoot && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNode(node.id);
                    }}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500"
                    title="Excluir"
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Color picker */}
            {isSelected && showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-wrap gap-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-2 w-[140px] z-50"
              >
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeNodeColor(node.id, color);
                    }}
                    className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </motion.div>
            )}

            {/* Checklist panel */}
            {isSelected && showChecklist === node.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-full left-0 mt-14 bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-3 w-[250px] z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                    <RiListCheck2 className="w-4 h-4" />
                    Checklist
                  </h4>
                  <button
                    onClick={() => setShowChecklist(null)}
                    className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <RiCloseLine className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>

                {/* Checklist items */}
                <div className="space-y-1 max-h-[200px] overflow-y-auto mb-2">
                  {(node.checklist || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 group/item"
                    >
                      <button
                        onClick={() => toggleChecklistItem(node.id, item.id)}
                        className="flex-shrink-0"
                      >
                        {item.completed ? (
                          <RiCheckboxLine className="w-5 h-5 text-green-500" />
                        ) : (
                          <RiCheckboxBlankLine className="w-5 h-5 text-neutral-400" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          item.completed
                            ? "line-through text-neutral-400"
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => deleteChecklistItem(node.id, item.id)}
                        className="opacity-0 group-hover/item:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500"
                      >
                        <RiCloseLine className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new item - suporta múltiplos separados por vírgula ou Enter */}
                <div className="flex flex-col gap-2">
                  <textarea
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        e.preventDefault();
                        addChecklistItem(node.id);
                      }
                    }}
                    placeholder="Digite itens separados por vírgula ou Enter...&#10;Ex: Item 1, Item 2, Item 3"
                    rows={3}
                    className="w-full text-sm px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">Ctrl+Enter para adicionar</span>
                    <button
                      onClick={() => addChecklistItem(node.id)}
                      className="px-3 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium flex items-center gap-1"
                    >
                      <RiAddLine className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <RiMindMap className="w-6 h-6 text-blue-500" />
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">Mapa Imob</h1>
          </div>
          <span className="text-sm text-neutral-500">•</span>
          <span className="text-sm text-neutral-500">{Object.keys(data.nodes).length} nós</span>
          {hasChanges && (
            <span className="text-xs text-amber-500 font-medium">• Alterações não salvas</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.3))}
              className="p-2 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
              title="Diminuir zoom"
            >
              <RiZoomOutLine className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 0.1, 2))}
              className="p-2 rounded hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
              title="Aumentar zoom"
            >
              <RiZoomInLine className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 400, y: 300 });
            }}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            title="Resetar visualização"
          >
            <RiFullscreenLine className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              hasChanges
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
            title="Salvar"
          >
            <RiSaveLine className="w-4 h-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </button>

          <button
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            title="Exportar"
          >
            <RiDownloadLine className="w-5 h-5" />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            title="Compartilhar"
          >
            <RiShareLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing canvas-bg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundImage: `
            radial-gradient(circle, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          className="relative"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: "3000px",
            height: "3000px",
          }}
        >
          {/* Conexões SVG */}
          <svg
            className="absolute pointer-events-none"
            style={{ 
              overflow: "visible",
              width: "3000px",
              height: "3000px",
              left: 0,
              top: 0,
            }}
          >
            {renderConnections()}
          </svg>

          {/* Nós */}
          <AnimatePresence>{renderNodes()}</AnimatePresence>
        </div>
      </div>

      {/* Help tooltip */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-4">
          <span><strong>Duplo clique:</strong> Editar</span>
          <span><strong>Arrastar nó:</strong> Mover</span>
          <span><strong>Scroll:</strong> Zoom</span>
          <span><strong>Clique + arraste:</strong> Pan</span>
        </div>
      </div>
    </div>
  );
}
