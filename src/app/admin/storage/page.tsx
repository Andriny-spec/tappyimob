"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RiFolder3Fill, RiDeleteBinLine, RiFolderTransferLine, RiArrowLeftSLine, RiArrowRightSLine, RiUploadCloud2Line, RiLoader4Line, RiDownloadLine, RiCheckboxMultipleLine } from "react-icons/ri";
import { AnimatePresence } from "framer-motion";
import {
  StorageHeader,
  StorageToolbar,
  StorageGrid,
  NewFolderModal,
  UploadModal,
  ShareModal,
  MediaLightbox,
  StorageFile,
  StorageFolder,
  BreadcrumbItem,
  StorageStats,
} from "@/components/admin/storage";

export default function StoragePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><RiLoader4Line className="w-8 h-8 animate-spin text-neutral-400" /></div>}>
      <StoragePageContent />
    </Suspense>
  );
}

function StoragePageContent() {
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [folders, setFolders] = useState<StorageFolder[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [folderPathResolved, setFolderPathResolved] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 30;

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [shareTarget, setShareTarget] = useState<{ type: "file" | "folder"; id: string; name: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDropUploading, setIsDropUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const fetchStorage = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFolderId) params.set("folderId", currentFolderId);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));

      const response = await fetch(`/api/admin/storage?${params}`);
      const data = await response.json();

      setFiles(data.files || []);
      setFolders(data.folders || []);
      setBreadcrumb(data.breadcrumb || []);
      setStats(data.stats || null);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error("Erro ao carregar storage:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, search, page]);

  // Resolve folder path from query params (e.g. ?folder=fotos/imoveis/CNCF00123)
  useEffect(() => {
    const folderPath = searchParams.get("folder");
    if (folderPath && !folderPathResolved) {
      (async () => {
        try {
          const res = await fetch(`/api/admin/storage/resolve-path?path=${encodeURIComponent(folderPath)}&create=true`);
          if (res.ok) {
            const data = await res.json();
            if (data.folderId) {
              setCurrentFolderId(data.folderId);
            }
          }
        } catch {}
        setFolderPathResolved(true);
      })();
    } else {
      setFolderPathResolved(true);
    }
  }, [searchParams, folderPathResolved]);

  useEffect(() => {
    if (folderPathResolved) fetchStorage();
  }, [fetchStorage, folderPathResolved]);

  const handleGoBack = () => {
    if (breadcrumb.length > 0) {
      const parentId = breadcrumb[breadcrumb.length - 1].parentId;
      setCurrentFolderId(parentId);
    } else {
      setCurrentFolderId(null);
    }
    setSelectedItems([]);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const response = await fetch("/api/admin/storage/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), parentId: currentFolderId }),
      });
      if (response.ok) {
        setNewFolderName("");
        setShowNewFolderModal(false);
        fetchStorage();
      }
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
    }
  };

  const STREAM_THRESHOLD = 50 * 1024 * 1024; // 50 MB — acima disso usa streaming

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) return;
    setUploadError(null);
    let hasError = false;

    for (const file of uploadingFiles) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      try {
        if (file.size > STREAM_THRESHOLD) {
          // Arquivo grande: stream XHR direto → servidor → MinIO
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const params = new URLSearchParams({ name: file.name, size: String(file.size) });
            if (currentFolderId) params.set("folderId", currentFolderId);
            xhr.open("POST", `/api/admin/storage/upload-stream?${params}`);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                setUploadProgress((prev) => ({ ...prev, [file.name]: Math.round((e.loaded / e.total) * 100) }));
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
                resolve();
              } else {
                let msg = `HTTP ${xhr.status}`;
                try { msg = JSON.parse(xhr.responseText)?.error || msg; } catch {}
                reject(new Error(msg));
              }
            };
            xhr.onerror = () => reject(new Error("Sem resposta do servidor (verifique a conexão)"));
            xhr.ontimeout = () => reject(new Error("Timeout — arquivo muito grande ou conexão lenta"));
            xhr.timeout = 0; // sem timeout de browser
            xhr.send(file);
          });
        } else {
          // Arquivo pequeno: multipart normal
          const formData = new FormData();
          formData.append("file", file);
          if (currentFolderId) formData.append("folderId", currentFolderId);
          const response = await fetch("/api/admin/storage/upload", { method: "POST", body: formData });
          if (response.ok) {
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
          } else {
            const body = await response.json().catch(() => ({}));
            throw new Error(body?.error || `HTTP ${response.status}`);
          }
        }
      } catch (error: any) {
        hasError = true;
        const msg = `"${file.name}": ${error?.message || "erro desconhecido"}`;
        console.error("[upload]", msg);
        setUploadError(msg);
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
      }
    }

    setTimeout(() => {
      setUploadingFiles([]);
      setUploadProgress({});
      if (!hasError) setShowUploadModal(false);
      fetchStorage();
    }, hasError ? 3000 : 1000);
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Excluir ${selectedItems.length} item(s)?`)) return;
    try {
      for (const id of selectedItems) {
        const isFolder = folders.some((f) => f.id === id);
        await fetch(`/api/admin/storage/${isFolder ? "folders" : "files"}/${id}`, { method: "DELETE" });
      }
      setSelectedItems([]);
      fetchStorage();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fetch(`/api/admin/storage/files/${fileId}`, { method: "DELETE" });
      setSelectedItems((prev) => prev.filter((id) => id !== fileId));
      fetchStorage();
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await fetch(`/api/admin/storage/folders/${folderId}`, { method: "DELETE" });
      setSelectedItems((prev) => prev.filter((id) => id !== folderId));
      fetchStorage();
    } catch (error) {
      console.error("Erro ao excluir pasta:", error);
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await fetch(`/api/admin/storage/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      fetchStorage();
    } catch (error) {
      console.error("Erro ao renomear pasta:", error);
    }
  };

  const handleMoveFileToFolder = async (fileId: string, folderId: string) => {
    try {
      await fetch(`/api/admin/storage/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId: folderId === "__root__" ? null : folderId }),
      });
      fetchStorage();
    } catch (error) {
      console.error("Erro ao mover arquivo:", error);
    }
  };

  const handleMoveFolderToFolder = async (folderId: string, targetFolderId: string | null) => {
    try {
      await fetch(`/api/admin/storage/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: targetFolderId }),
      });
      fetchStorage();
    } catch (error) {
      console.error("Erro ao mover pasta:", error);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/");
      const file = files.find((f) => f.id === fileId);
      if (file) {
        const link = document.createElement("a");
        link.href = `/api/storage/${encodeKey(file.key)}?download=true`;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      // Fallback: buscar key pelo ID
      const response = await fetch(`/api/admin/storage/files/${fileId}`);
      const data = await response.json();
      if (data.key) {
        const link = document.createElement("a");
        link.href = `/api/storage/${encodeKey(data.key)}?download=true`;
        link.download = data.name || "arquivo";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Erro ao baixar:", error);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Drag-and-drop upload direto na página
  const handlePageDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  }, []);

  const handlePageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  }, []);

  const handlePageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const uploadFilesToFolder = useCallback(async (droppedFiles: File[], folderId: string | null) => {
    if (droppedFiles.length === 0) return;
    setIsDropUploading(true);
    for (const file of droppedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      const targetFolder = folderId || currentFolderId;
      if (targetFolder) formData.append("folderId", targetFolder);
      try {
        await fetch("/api/admin/storage/upload", { method: "POST", body: formData });
      } catch (error) {
        console.error(`Erro no upload de ${file.name}:`, error);
      }
    }
    setIsDropUploading(false);
    fetchStorage();
  }, [currentFolderId, fetchStorage]);

  const handlePageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounter.current = 0;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Upload para pasta atual (raiz ou pasta aberta)
    await uploadFilesToFolder(droppedFiles, null);
  }, [uploadFilesToFolder]);

  return (
    <div
      className="space-y-3 relative"
      onDragEnter={handlePageDragEnter}
      onDragLeave={handlePageDragLeave}
      onDragOver={handlePageDragOver}
      onDrop={handlePageDrop}
    >
      {/* Overlay de drag-and-drop (uploading) */}
      {isDropUploading && (
        <div className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-blue-500 px-12 py-10 text-center shadow-2xl">
            <div className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">Enviando arquivos...</p>
          </div>
        </div>
      )}
      {/* Banner de drag-and-drop (não bloqueia pastas) */}
      {isDraggingOver && !isDropUploading && (
        <div className="bg-blue-50 dark:bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl px-6 py-4 flex items-center gap-4">
          <RiUploadCloud2Line className="w-8 h-8 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Solte os arquivos aqui ou sobre uma pasta</p>
            <p className="text-xs text-neutral-500">Arraste para uma pasta específica ou solte aqui para enviar para a pasta atual</p>
          </div>
        </div>
      )}
      <StorageHeader
        stats={stats}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onRefresh={fetchStorage}
        onNewFolder={() => setShowNewFolderModal(true)}
        onUpload={() => setShowUploadModal(true)}
      />

      <StorageToolbar
        breadcrumb={breadcrumb}
        search={search}
        setSearch={setSearch}
        onGoToRoot={() => { setCurrentFolderId(null); setSelectedItems([]); setPage(1); }}
        onGoToFolder={(id) => { setCurrentFolderId(id); setSelectedItems([]); setPage(1); }}
      />

      {/* Barra de seleção */}
      <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-2.5">
        <button
          onClick={() => {
            const allIds = [...folders.map((f) => f.id), ...files.map((f) => f.id)];
            const allSelected = allIds.every((id) => selectedItems.includes(id));
            setSelectedItems(allSelected ? [] : allIds);
          }}
          className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium"
        >
          <RiCheckboxMultipleLine className="w-4 h-4" />
          {selectedItems.length > 0 && selectedItems.length === [...folders.map(f => f.id), ...files.map(f => f.id)].length
            ? "Desmarcar tudo"
            : "Selecionar tudo"}
        </button>

        {selectedItems.length > 0 && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{selectedItems.length} selecionado(s)</span>
            {selectedItems.every((id) => files.some((f) => f.id === id)) && (
              <button
                onClick={() => selectedItems.forEach((id) => handleDownload(id))}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                <RiDownloadLine className="w-4 h-4" /> Baixar
              </button>
            )}
            <button onClick={handleDeleteSelected} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium">
              <RiDeleteBinLine className="w-4 h-4" /> Excluir
            </button>
            <button onClick={() => setSelectedItems([])} className="text-sm text-neutral-500 hover:text-neutral-700 ml-auto">
              Limpar
            </button>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : folders.length === 0 && files.length === 0 ? (
          <div className="text-center py-20">
            <RiFolder3Fill className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Nenhum arquivo ainda</h3>
            <p className="text-neutral-500 mb-4">Comece criando uma pasta ou fazendo upload de arquivos</p>
          </div>
        ) : (
          <StorageGrid
            files={files}
            folders={folders}
            selectedItems={selectedItems}
            currentFolderId={currentFolderId}
            parentFolderId={breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].parentId : null}
            viewMode={viewMode}
            onFolderClick={(id) => { setCurrentFolderId(id); setSelectedItems([]); setPage(1); }}
            onGoBack={handleGoBack}
            onToggleSelect={toggleSelect}
            onDownload={handleDownload}
            onDeleteFile={handleDeleteFile}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
            onMoveFileToFolder={handleMoveFileToFolder}
            onMoveFolderToFolder={handleMoveFolderToFolder}
            onShare={(type, id, name) => setShareTarget({ type, id, name })}
            onUploadToFolder={async (droppedFiles, folderId) => {
              setIsDraggingOver(false);
              dragCounter.current = 0;
              await uploadFilesToFolder(droppedFiles, folderId);
            }}
            onPreviewFile={(idx) => setLightboxIndex(idx)}
          />
        )}
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3">
          <span className="text-sm text-neutral-500">
            {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} arquivo(s)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                typeof p === "string" ? (
                  <span key={`dots-${idx}`} className="px-1 text-neutral-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === pagination.page
                        ? "bg-blue-500 text-white"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <NewFolderModal
        isOpen={showNewFolderModal}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        onClose={() => setShowNewFolderModal(false)}
        onCreate={handleCreateFolder}
      />

      <UploadModal
        isOpen={showUploadModal}
        files={uploadingFiles}
        progress={uploadProgress}
        error={uploadError}
        onClose={() => { setShowUploadModal(false); setUploadError(null); }}
        onFilesChange={setUploadingFiles}
        onUpload={handleUpload}
      />

      {/* Media Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <MediaLightbox
            files={files}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onDownload={handleDownload}
            onDelete={(id) => {
              handleDeleteFile(id);
            }}
          />
        )}
      </AnimatePresence>

      {shareTarget && (
        <ShareModal
          isOpen={!!shareTarget}
          onClose={() => setShareTarget(null)}
          type={shareTarget.type}
          id={shareTarget.id}
          name={shareTarget.name}
          onRefresh={fetchStorage}
        />
      )}
    </div>
  );
}
