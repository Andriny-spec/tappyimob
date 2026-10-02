"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  RiUploadCloud2Line,
  RiCloseLine,
  RiCheckLine,
  RiFileLine,
  RiImageLine,
  RiVideoLine,
  RiFilePdfLine,
  RiArrowLeftLine,
  RiHardDriveLine,
} from "react-icons/ri";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return RiImageLine;
  if (type.startsWith("video/")) return RiVideoLine;
  if (type === "application/pdf") return RiFilePdfLine;
  return RiFileLine;
}

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setErrors({});

    for (const file of files) {
      try {
        setProgress((prev) => ({ ...prev, [file.name]: 10 }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setProgress((prev) => ({ ...prev, [file.name]: 100 }));
        } else {
          const data = await response.json();
          setErrors((prev) => ({
            ...prev,
            [file.name]: data.error || "Erro no upload",
          }));
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          [file.name]: "Erro de conexão",
        }));
      }
    }

    setUploading(false);

    // Redirecionar após sucesso
    const hasErrors = Object.keys(errors).length > 0;
    if (!hasErrors) {
      setTimeout(() => {
        router.push("/admin/storage");
      }, 1500);
    }
  };

  const allCompleted =
    files.length > 0 && files.every((f) => progress[f.name] === 100);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/storage")}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <RiUploadCloud2Line className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Upload de Arquivos
                </h1>
                <p className="text-sm text-neutral-500">
                  Arraste ou selecione arquivos para enviar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Drop Zone */}
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
              : "border-neutral-300 dark:border-neutral-700 hover:border-blue-400"
          }`}
        >
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <motion.div
            animate={{ scale: isDragging ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <RiUploadCloud2Line
              className={`w-16 h-16 mx-auto mb-4 ${
                isDragging ? "text-blue-500" : "text-neutral-400"
              }`}
            />
          </motion.div>
          <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            {isDragging ? "Solte os arquivos aqui" : "Arraste arquivos para cá"}
          </p>
          <p className="text-neutral-500">
            ou <span className="text-blue-500">clique para selecionar</span>
          </p>
          <p className="text-sm text-neutral-400 mt-2">
            Máximo 100MB por arquivo
          </p>
        </label>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="font-medium text-neutral-900 dark:text-white">
                {files.length} arquivo(s) selecionado(s)
              </span>
              {!uploading && (
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-80 overflow-y-auto">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.type);
                const completed = progress[file.name] === 100;
                const error = errors[file.name];

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        error
                          ? "bg-red-100 dark:bg-red-500/20"
                          : completed
                          ? "bg-green-100 dark:bg-green-500/20"
                          : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      {completed ? (
                        <RiCheckLine className="w-5 h-5 text-green-500" />
                      ) : (
                        <FileIcon
                          className={`w-5 h-5 ${
                            error ? "text-red-500" : "text-neutral-500"
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {formatBytes(file.size)}
                        {error && (
                          <span className="text-red-500 ml-2">{error}</span>
                        )}
                      </p>
                    </div>

                    {progress[file.name] !== undefined &&
                      !completed &&
                      !error && (
                        <div className="w-24">
                          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress[file.name]}%` }}
                            />
                          </div>
                        </div>
                      )}

                    {!uploading && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <RiCloseLine className="w-5 h-5 text-neutral-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => router.push("/admin/storage")}
            className="px-6 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading || allCompleted}
            className="px-6 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : allCompleted ? (
              <>
                <RiCheckLine className="w-4 h-4" />
                Concluído
              </>
            ) : (
              <>
                <RiUploadCloud2Line className="w-4 h-4" />
                Enviar ({files.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
