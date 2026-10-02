"use client";

import { useState, useRef, useEffect } from "react";
import {
  RiFolder3Fill,
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiEditLine,
  RiDragMoveLine,
  RiDownloadLine,
  RiMoreLine,
  RiFolderTransferLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
  RiShareLine,
  RiTeamLine,
  RiPlayCircleLine,
  RiEyeLine,
} from "react-icons/ri";
import { StorageFile, StorageFolder } from "./types";
import { formatBytes, getFileIcon, getFileColor } from "./utils";

interface StorageGridProps {
  files: StorageFile[];
  folders: StorageFolder[];
  selectedItems: string[];
  currentFolderId: string | null;
  parentFolderId?: string | null;
  viewMode?: "grid" | "list";
  onFolderClick: (id: string) => void;
  onGoBack: () => void;
  onToggleSelect: (id: string) => void;
  onDownload: (id: string) => void;
  onDeleteFile?: (id: string) => void;
  onDeleteFolder?: (id: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
  onMoveFileToFolder?: (fileId: string, folderId: string) => void;
  onMoveFolderToFolder?: (folderId: string, targetFolderId: string | null) => void;
  onShare?: (type: "file" | "folder", id: string, name: string) => void;
  onUploadToFolder?: (files: File[], folderId: string | null) => void;
  onPreviewFile?: (fileIndex: number) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  type: "file" | "folder";
  id: string;
  name: string;
}

export function StorageGrid({
  files,
  folders,
  selectedItems,
  currentFolderId,
  parentFolderId,
  viewMode = "grid",
  onFolderClick,
  onGoBack,
  onToggleSelect,
  onDownload,
  onDeleteFile,
  onDeleteFolder,
  onRenameFolder,
  onMoveFileToFolder,
  onMoveFolderToFolder,
  onShare,
  onUploadToFolder,
  onPreviewFile,
}: StorageGridProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<"file" | "folder" | null>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null);
  const [dropTargetBack, setDropTargetBack] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);

  // Fechar context menu ao clicar fora (via overlay, não document listener)
  // O document.addEventListener não funciona bem com React 18+ event delegation

  // Focar no input de renomear
  useEffect(() => {
    if (renamingFolderId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFolderId]);

  const handleContextMenu = (e: React.MouseEvent, type: "file" | "folder", id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id, name });
  };

  const handleRenameSubmit = (folderId: string) => {
    if (renameValue.trim() && onRenameFolder) {
      onRenameFolder(folderId, renameValue.trim());
    }
    setRenamingFolderId(null);
    setRenameValue("");
  };

  // DnD handlers
  const handleDragStart = (e: React.DragEvent, itemId: string, itemType: "file" | "folder") => {
    isDraggingRef.current = true;
    setDraggedItemId(itemId);
    setDraggedItemType(itemType);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${itemType}:${itemId}`);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    // Não permitir drop de uma pasta em si mesma
    if (draggedItemType === "folder" && draggedItemId === folderId) return;
    e.preventDefault();
    // Detectar se é arquivo externo (do desktop) ou interno
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }
    setDropTargetFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDropTargetFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetFolderId(null);
    setDropTargetBack(false);

    // Verificar se é drag interno (mover item) ou externo (upload do desktop)
    const transferData = e.dataTransfer.getData("text/plain");
    const isInternalDrag = transferData && transferData.includes(":");

    if (!isInternalDrag && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Drop de arquivos externos (do desktop) direto na pasta
      const externalFiles = Array.from(e.dataTransfer.files);
      if (onUploadToFolder) {
        onUploadToFolder(externalFiles, targetFolderId);
      }
      setDraggedItemId(null);
      setDraggedItemType(null);
      return;
    }

    // Read from dataTransfer (reliable) instead of React state (may be cleared by dragEnd)
    const [itemType, itemId] = (transferData || "").split(":") as ["file" | "folder", string];
    if (!itemId || !itemType) { setDraggedItemId(null); setDraggedItemType(null); return; }

    if (itemType === "folder") {
      if (itemId !== targetFolderId && onMoveFolderToFolder) {
        onMoveFolderToFolder(itemId, targetFolderId);
        if (selectedItems.includes(itemId)) {
          selectedItems.forEach((id) => {
            if (id !== itemId && id !== targetFolderId && folders.some((f) => f.id === id)) {
              onMoveFolderToFolder(id, targetFolderId);
            }
          });
        }
      }
    } else {
      if (onMoveFileToFolder) {
        onMoveFileToFolder(itemId, targetFolderId);
        if (selectedItems.includes(itemId)) {
          selectedItems.forEach((id) => {
            if (id !== itemId && files.some((f) => f.id === id)) {
              onMoveFileToFolder(id, targetFolderId);
            }
          });
        }
      }
    }
    setDraggedItemId(null);
    setDraggedItemType(null);
  };

  // Drop no botão "Voltar" = mover para pasta pai
  const handleBackDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetBack(true);
  };

  const handleBackDragLeave = () => {
    setDropTargetBack(false);
  };

  const handleBackDrop = (e: React.DragEvent, parentId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetBack(false);

    const transferData = e.dataTransfer.getData("text/plain");
    const [itemType, itemId] = transferData.split(":") as ["file" | "folder", string];
    if (!itemId || !itemType) { setDraggedItemId(null); setDraggedItemType(null); return; }

    if (itemType === "folder" && onMoveFolderToFolder) {
      onMoveFolderToFolder(itemId, parentId);
    } else if (itemType === "file" && parentId && onMoveFileToFolder) {
      onMoveFileToFolder(itemId, parentId);
    } else if (itemType === "file" && !parentId && onMoveFileToFolder) {
      onMoveFileToFolder(itemId, "__root__");
    }
    setDraggedItemId(null);
    setDraggedItemType(null);
  };

  const handleDragEnd = () => {
    // Delay clearing isDragging to prevent click from firing after drop
    setTimeout(() => { isDraggingRef.current = false; }, 100);
    setDraggedItemId(null);
    setDraggedItemType(null);
    setDropTargetFolderId(null);
    setDropTargetBack(false);
  };

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    const allItems = [
      ...folders.map((f) => ({ kind: "folder" as const, item: f })),
      ...files.map((f) => ({ kind: "file" as const, item: f })),
    ];
    return (
      <div className="relative">
        {currentFolderId && (
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-3"
          >
            <RiArrowLeftLine className="w-4 h-4" /> Voltar
          </button>
        )}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
          {allItems.length === 0 && (
            <p className="text-center py-12 text-sm text-neutral-400">Nenhum arquivo</p>
          )}
          {allItems.map(({ kind, item }) => {
            const isFolder = kind === "folder";
            const isSelected = selectedItems.includes(item.id);
            const isImage = !isFolder && (item as StorageFile).mimeType.startsWith("image/");
            const isVideo = !isFolder && (item as StorageFile).mimeType.startsWith("video/");
            const isMedia = isImage || isVideo;
            const FileIcon = isFolder ? RiFolder3Fill : getFileIcon((item as StorageFile).mimeType);

            return (
              <div
                key={item.id}
                onContextMenu={(e) => handleContextMenu(e, isFolder ? "folder" : "file", item.id, item.name)}
                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors ${
                  isSelected ? "bg-blue-50 dark:bg-blue-500/5" : ""
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => onToggleSelect(item.id)}
                  className="flex-shrink-0"
                >
                  {isSelected ? (
                    <RiCheckboxCircleLine className="w-5 h-5 text-blue-500" />
                  ) : (
                    <RiCheckboxBlankCircleLine className="w-5 h-5 text-neutral-300 hover:text-neutral-400" />
                  )}
                </button>

                {/* Icon / thumb */}
                <div
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
                  onClick={() => {
                    if (isFolder) { onFolderClick(item.id); return; }
                    if (isMedia && onPreviewFile) {
                      const mediaFiles = files.filter(f => f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/"));
                      const idx = mediaFiles.findIndex(f => f.id === item.id);
                      onPreviewFile(idx >= 0 ? idx : 0);
                    }
                  }}
                >
                  {isImage ? (
                    <img src={`/api/storage/${(item as StorageFile).key}`} alt={item.name} className="w-full h-full object-cover" />
                  ) : isFolder ? (
                    <RiFolder3Fill className="w-5 h-5" style={{ color: (item as any).color || "#3B82F6" }} />
                  ) : (
                    <FileIcon className={`w-5 h-5 ${getFileColor((item as StorageFile).mimeType)}`} />
                  )}
                </div>

                {/* Name */}
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => {
                    if (isFolder) { onFolderClick(item.id); return; }
                    if (isMedia && onPreviewFile) {
                      const mediaFiles = files.filter(f => f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/"));
                      const idx = mediaFiles.findIndex(f => f.id === item.id);
                      onPreviewFile(idx >= 0 ? idx : 0);
                    }
                  }}
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-neutral-400">
                    {isFolder
                      ? `${(item as any)._count?.files ?? 0} arquivo(s)`
                      : formatBytes((item as StorageFile).size)}
                  </p>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!isFolder && (
                    <button
                      onClick={() => onDownload(item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Download"
                    >
                      <RiDownloadLine className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e, isFolder ? "folder" : "file", item.id, item.name); }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Mais opções"
                  >
                    <RiMoreLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Context Menu (same as grid) */}
        {contextMenu && (
          <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            ref={contextMenuRef}
            style={{ top: contextMenu.y, left: contextMenu.x, position: "fixed" }}
            className="z-50 min-w-[180px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl py-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { contextMenu.type === "folder" ? onFolderClick(contextMenu.id) : onDownload(contextMenu.id); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              {contextMenu.type === "folder" ? <><RiFolder3Fill className="w-4 h-4 text-blue-500" /> Abrir</> : <><RiDownloadLine className="w-4 h-4 text-blue-500" /> Download</>}
            </button>
            <button onClick={() => { onShare?.(contextMenu.type, contextMenu.id, contextMenu.name); setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <RiShareLine className="w-4 h-4 text-green-500" /> Compartilhar
            </button>
            <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />
            <button onClick={() => { if (confirm(`Excluir "${contextMenu.name}"?`)) { contextMenu.type === "folder" ? onDeleteFolder?.(contextMenu.id) : onDeleteFile?.(contextMenu.id); } setContextMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
              <RiDeleteBinLine className="w-4 h-4" /> Excluir
            </button>
          </div>
          </>
        )}
      </div>
    );
  }
  // ── GRID VIEW ──────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {/* Voltar */}
        {currentFolderId && (
          <button
            onClick={onGoBack}
            onDragOver={handleBackDragOver}
            onDragLeave={handleBackDragLeave}
            onDrop={(e) => handleBackDrop(e, parentFolderId ?? null)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-dashed transition-all ${
              dropTargetBack
                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/30 scale-105"
                : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600"
            }`}
          >
            <RiArrowLeftLine className="w-8 h-8 text-neutral-400 mb-1" />
            <span className="text-xs text-neutral-500">{dropTargetBack ? "Soltar aqui" : "Voltar"}</span>
          </button>
        )}

        {/* Pastas */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            draggable={renamingFolderId !== folder.id}
            onDragStart={(e) => handleDragStart(e, folder.id, "folder")}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (renamingFolderId === folder.id) return;
              if (isDraggingRef.current) return;
              onFolderClick(folder.id);
            }}
            onContextMenu={(e) => handleContextMenu(e, "folder", folder.id, folder.name)}
            onDragOver={(e) => handleDragOver(e, folder.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, folder.id)}
            className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
              draggedItemId === folder.id
                ? "opacity-40 scale-95"
                :
              dropTargetFolderId === folder.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/30 scale-105"
                : selectedItems.includes(folder.id)
                  ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-neutral-900"
            }`}
          >
            {/* Checkbox de seleção */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSelect(folder.id); }}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {selectedItems.includes(folder.id) ? (
                <RiCheckboxCircleLine className="w-5 h-5 text-blue-500" />
              ) : (
                <RiCheckboxBlankCircleLine className="w-5 h-5 text-neutral-300" />
              )}
            </button>

            {/* Menu */}
            <button
              onClick={(e) => { e.stopPropagation(); handleContextMenu(e, "folder", folder.id, folder.name); }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <RiMoreLine className="w-4 h-4 text-neutral-400" />
            </button>

            <RiFolder3Fill className="w-12 h-12 mb-1.5" style={{ color: folder.color || "#3B82F6" }} />
            
            {renamingFolderId === folder.id ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(folder.id);
                  if (e.key === "Escape") { setRenamingFolderId(null); setRenameValue(""); }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-center text-sm font-medium bg-white dark:bg-neutral-800 border border-blue-500 rounded px-1 py-0.5 outline-none"
              />
            ) : (
              <span className="text-sm font-medium text-neutral-900 dark:text-white text-center truncate w-full">{folder.name}</span>
            )}
            <span className="text-[10px] text-neutral-500 mt-0.5">{folder._count.files} arquivo(s)</span>
          </div>
        ))}

        {/* Arquivos */}
        {files.map((file, fileIdx) => {
          const FileIcon = getFileIcon(file.mimeType);
          const isImage = file.mimeType.startsWith("image/");
          const isVideo = file.mimeType.startsWith("video/");
          const isMedia = isImage || isVideo;
          const isDragging = draggedItemId === file.id;

          return (
            <div
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, file.id, "file")}
              onDragEnd={handleDragEnd}
              onClick={() => onToggleSelect(file.id)}
              onDoubleClick={() => {
                if (isMedia && onPreviewFile) {
                  // Calcular índice no array de mídia
                  const mediaFiles = files.filter(f => f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/"));
                  const mediaIdx = mediaFiles.findIndex(f => f.id === file.id);
                  onPreviewFile(mediaIdx >= 0 ? mediaIdx : 0);
                } else {
                  onDownload(file.id);
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, "file", file.id, file.name)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                isDragging
                  ? "opacity-40 scale-95"
                  : selectedItems.includes(file.id)
                    ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-neutral-900"
              }`}
            >
              {/* Checkbox de seleção */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id); }}
                className={`absolute top-2 left-2 z-10 transition-opacity ${
                  selectedItems.includes(file.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {selectedItems.includes(file.id) ? (
                  <RiCheckboxCircleLine className="w-5 h-5 text-blue-500" />
                ) : (
                  <RiCheckboxBlankCircleLine className="w-5 h-5 text-neutral-300" />
                )}
              </button>

              {/* Menu */}
              <button
                onClick={(e) => { e.stopPropagation(); handleContextMenu(e, "file", file.id, file.name); }}
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiMoreLine className="w-4 h-4 text-neutral-400" />
              </button>

              {/* Ícone de drag */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
                <RiDragMoveLine className="w-3.5 h-3.5 text-neutral-400" />
              </div>

              {isImage ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-1.5 bg-neutral-100 dark:bg-neutral-800">
                  <img src={`/api/storage/${file.key}`} alt={file.name} className="w-full h-full object-cover" />
                  {/* Preview overlay */}
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPreviewFile) {
                        const mediaFiles = files.filter(f => f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/"));
                        const mediaIdx = mediaFiles.findIndex(f => f.id === file.id);
                        onPreviewFile(mediaIdx >= 0 ? mediaIdx : 0);
                      }
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/80 dark:bg-black/60">
                      <RiEyeLine className="w-5 h-5 text-neutral-800 dark:text-white" />
                    </div>
                  </div>
                </div>
              ) : isVideo ? (
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-1.5 bg-neutral-900">
                  <video
                    src={`/api/storage/${file.key}`}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  {/* Play overlay */}
                  <div
                    className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPreviewFile) {
                        const mediaFiles = files.filter(f => f.mimeType.startsWith("image/") || f.mimeType.startsWith("video/"));
                        const mediaIdx = mediaFiles.findIndex(f => f.id === file.id);
                        onPreviewFile(mediaIdx >= 0 ? mediaIdx : 0);
                      }
                    }}
                  >
                    <div className="p-3 rounded-full bg-white/90 dark:bg-black/70 shadow-lg">
                      <RiPlayCircleLine className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white font-medium">
                    Vídeo
                  </div>
                </div>
              ) : (
                <FileIcon className={`w-12 h-12 mb-1.5 ${getFileColor(file.mimeType)}`} />
              )}
              <span className="text-xs font-medium text-neutral-900 dark:text-white text-center truncate w-full">{file.name}</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">{formatBytes(file.size)}</span>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
        <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
        <div
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x, position: "fixed" }}
          className="z-50 min-w-[180px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === "folder" ? (
            <>
              <button
                onClick={() => { onFolderClick(contextMenu.id); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiFolder3Fill className="w-4 h-4 text-blue-500" /> Abrir
              </button>
              <button
                onClick={() => {
                  setRenamingFolderId(contextMenu.id);
                  setRenameValue(contextMenu.name);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiEditLine className="w-4 h-4 text-amber-500" /> Renomear
              </button>
              <button
                onClick={() => { onShare?.("folder", contextMenu.id, contextMenu.name); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiTeamLine className="w-4 h-4 text-purple-500" /> Permissões / Compartilhar
              </button>
              {/* Mover pasta para outra pasta */}
              {(folders.filter(f => f.id !== contextMenu.id).length > 0 || currentFolderId) && (
                <>
                  <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Mover para</div>
                  {currentFolderId && (
                    <button
                      onClick={() => {
                        onMoveFolderToFolder?.(contextMenu.id, parentFolderId ?? null);
                        setContextMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <RiArrowLeftLine className="w-3.5 h-3.5 text-neutral-400" /> Pasta anterior
                    </button>
                  )}
                  {folders.filter(f => f.id !== contextMenu.id).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onMoveFolderToFolder?.(contextMenu.id, f.id);
                        setContextMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <RiFolder3Fill className="w-3.5 h-3.5" style={{ color: f.color || "#3B82F6" }} /> {f.name}
                    </button>
                  ))}
                </>
              )}
              <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
              <button
                onClick={() => {
                  if (confirm(`Excluir pasta "${contextMenu.name}" e todos os arquivos dentro?`)) {
                    onDeleteFolder?.(contextMenu.id);
                  }
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <RiDeleteBinLine className="w-4 h-4" /> Excluir Pasta
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onDownload(contextMenu.id); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiDownloadLine className="w-4 h-4 text-blue-500" /> Download
              </button>
              <button
                onClick={() => { onShare?.("file", contextMenu.id, contextMenu.name); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiShareLine className="w-4 h-4 text-green-500" /> Compartilhar
              </button>
              {(folders.length > 0 || currentFolderId) && (
                <>
                  <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Mover para</div>
                  {currentFolderId && (
                    <button
                      onClick={() => {
                        const targetId = parentFolderId ?? "__root__";
                        onMoveFileToFolder?.(contextMenu.id, targetId);
                        setContextMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <RiArrowLeftLine className="w-3.5 h-3.5 text-neutral-400" /> Pasta anterior
                    </button>
                  )}
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onMoveFileToFolder?.(contextMenu.id, f.id);
                        setContextMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <RiFolder3Fill className="w-3.5 h-3.5" style={{ color: f.color || "#3B82F6" }} /> {f.name}
                    </button>
                  ))}
                </>
              )}
              <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
              <button
                onClick={() => {
                  if (confirm(`Excluir "${contextMenu.name}"?`)) {
                    onDeleteFile?.(contextMenu.id);
                  }
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <RiDeleteBinLine className="w-4 h-4" /> Excluir
              </button>
            </>
          )}
        </div>
        </>
      )}
    </div>
  );
}
