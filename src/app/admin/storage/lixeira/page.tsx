"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDeleteBinLine,
  RiArrowLeftLine,
  RiRefreshLine,
  RiFolder3Fill,
  RiFileLine,
  RiImageLine,
  RiVideoLine,
  RiFilePdfLine,
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiLoopLeftLine,
  RiDeleteBin2Line,
  RiAlertLine,
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrashFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  deletedAt: string;
  createdBy: { id: string; name: string } | null;
}

interface TrashFolder {
  id: string;
  name: string;
  color: string | null;
  deletedAt: string;
  createdBy: { id: string; name: string } | null;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return RiImageLine;
  if (mimeType.startsWith("video/")) return RiVideoLine;
  if (mimeType === "application/pdf") return RiFilePdfLine;
  return RiFileLine;
}

export default function TrashPage() {
  const router = useRouter();
  const [files, setFiles] = useState<TrashFile[]>([]);
  const [folders, setFolders] = useState<TrashFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/storage/trash");
      const data = await response.json();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (error) {
      console.error("Erro ao carregar lixeira:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const toggleFileSelect = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleFolderSelect = (id: string) => {
    setSelectedFolders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (
      selectedFiles.length === files.length &&
      selectedFolders.length === folders.length
    ) {
      setSelectedFiles([]);
      setSelectedFolders([]);
    } else {
      setSelectedFiles(files.map((f) => f.id));
      setSelectedFolders(folders.map((f) => f.id));
    }
  };

  const handleRestore = async () => {
    if (selectedFiles.length === 0 && selectedFolders.length === 0) return;

    setProcessing(true);
    try {
      await fetch("/api/admin/storage/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          fileIds: selectedFiles,
          folderIds: selectedFolders,
        }),
      });

      setSelectedFiles([]);
      setSelectedFolders([]);
      fetchTrash();
    } catch (error) {
      console.error("Erro ao restaurar:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEmptyTrash = async () => {
    setProcessing(true);
    try {
      await fetch("/api/admin/storage/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "empty" }),
      });

      setShowEmptyConfirm(false);
      fetchTrash();
    } catch (error) {
      console.error("Erro ao esvaziar lixeira:", error);
    } finally {
      setProcessing(false);
    }
  };

  const totalItems = files.length + folders.length;
  const selectedCount = selectedFiles.length + selectedFolders.length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/storage")}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiArrowLeftLine className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <RiDeleteBinLine className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Lixeira
                  </h1>
                  <p className="text-sm text-neutral-500">
                    {totalItems} item(s) na lixeira
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTrash}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiRefreshLine className="w-5 h-5" />
              </button>
              {totalItems > 0 && (
                <button
                  onClick={() => setShowEmptyConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  <RiDeleteBin2Line className="w-4 h-4" />
                  <span className="hidden sm:inline">Esvaziar Lixeira</span>
                </button>
              )}
            </div>
          </div>

          {/* Selection bar */}
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800"
              >
                <button
                  onClick={selectAll}
                  className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                >
                  {selectedCount === totalItems ? (
                    <RiCheckboxLine className="w-4 h-4 text-blue-500" />
                  ) : (
                    <RiCheckboxBlankLine className="w-4 h-4" />
                  )}
                  {selectedCount} selecionado(s)
                </button>
                <button
                  onClick={handleRestore}
                  disabled={processing}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                >
                  <RiLoopLeftLine className="w-4 h-4" />
                  Restaurar
                </button>
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setSelectedFolders([]);
                  }}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Limpar seleção
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-20">
            <RiDeleteBinLine className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              Lixeira vazia
            </h3>
            <p className="text-neutral-500">
              Itens excluídos aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-left">
                  <th className="px-4 py-3 w-10">
                    <button
                      onClick={selectAll}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {selectedCount === totalItems ? (
                        <RiCheckboxLine className="w-4 h-4 text-blue-500" />
                      ) : (
                        <RiCheckboxBlankLine className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden sm:table-cell">
                    Tamanho
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase hidden md:table-cell">
                    Excluído em
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {/* Pastas */}
                {folders.map((folder) => (
                  <tr
                    key={folder.id}
                    onClick={() => toggleFolderSelect(folder.id)}
                    className={`cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                      selectedFolders.includes(folder.id)
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      {selectedFolders.includes(folder.id) ? (
                        <RiCheckboxLine className="w-4 h-4 text-blue-500" />
                      ) : (
                        <RiCheckboxBlankLine className="w-4 h-4 text-neutral-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <RiFolder3Fill
                          className="w-5 h-5"
                          style={{ color: folder.color || "#3B82F6" }}
                        />
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {folder.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">
                      Pasta
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">
                      {formatDistanceToNow(new Date(folder.deletedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </td>
                  </tr>
                ))}

                {/* Arquivos */}
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.mimeType);
                  return (
                    <tr
                      key={file.id}
                      onClick={() => toggleFileSelect(file.id)}
                      className={`cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                        selectedFiles.includes(file.id)
                          ? "bg-blue-50 dark:bg-blue-500/10"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        {selectedFiles.includes(file.id) ? (
                          <RiCheckboxLine className="w-4 h-4 text-blue-500" />
                        ) : (
                          <RiCheckboxBlankLine className="w-4 h-4 text-neutral-400" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileIcon className="w-5 h-5 text-neutral-500" />
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell">
                        {formatBytes(file.size)}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">
                        {formatDistanceToNow(new Date(file.deletedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Confirmar Esvaziar */}
      <AnimatePresence>
        {showEmptyConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmptyConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <RiAlertLine className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Esvaziar Lixeira
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Tem certeza que deseja excluir permanentemente {totalItems}{" "}
                item(s)? Os arquivos serão removidos do servidor e não poderão
                ser recuperados.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEmptyConfirm(false)}
                  className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEmptyTrash}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {processing && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Excluir Permanentemente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
