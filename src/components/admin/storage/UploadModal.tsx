"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiUploadCloud2Line, RiCloseLine, RiCheckLine, RiFileLine, RiImageLine, RiVideoLine, RiPlayCircleLine } from "react-icons/ri";
import { formatBytes, getFileIcon, getFileColor } from "./utils";

interface UploadModalProps {
  isOpen: boolean;
  files: File[];
  progress: Record<string, number>;
  error?: string | null;
  onClose: () => void;
  onFilesChange: (files: File[]) => void;
  onUpload: () => void;
}

function FilePreviewThumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  useMemo(() => {
    if (isImage || isVideo) {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
  }, [file, isImage, isVideo]);

  if (isImage && url) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
        <img src={url} alt={file.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (isVideo && url) {
    return (
      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
        <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <RiPlayCircleLine className="w-5 h-5 text-white/90" />
        </div>
      </div>
    );
  }

  const FileIcon = getFileIcon(file.type);
  return (
    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
      <FileIcon className={`w-5 h-5 ${getFileColor(file.type)}`} />
    </div>
  );
}

export function UploadModal({ isOpen, files, progress, error, onClose, onFilesChange, onUpload }: UploadModalProps) {
  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const imageCount = files.filter(f => f.type.startsWith("image/")).length;
  const videoCount = files.filter(f => f.type.startsWith("video/")).length;
  const otherCount = files.length - imageCount - videoCount;
  const isUploading = Object.keys(progress).length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Upload de Arquivos</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <label className="block border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    onFilesChange([...files, ...Array.from(e.target.files)]);
                  }
                }}
              />
              <RiUploadCloud2Line className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
              <p className="text-neutral-600 dark:text-neutral-400">Arraste arquivos ou clique para selecionar</p>
              <p className="text-xs text-neutral-500 mt-1.5">Imagens, vídeos, documentos — até 2 GB por arquivo</p>
            </label>

            {files.length > 0 && (
              <>
                {/* Resumo */}
                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{files.length} arquivo(s)</span>
                  <span>•</span>
                  <span>{formatBytes(totalSize)}</span>
                  {imageCount > 0 && (
                    <span className="flex items-center gap-0.5"><RiImageLine className="w-3.5 h-3.5 text-green-500" /> {imageCount}</span>
                  )}
                  {videoCount > 0 && (
                    <span className="flex items-center gap-0.5"><RiVideoLine className="w-3.5 h-3.5 text-purple-500" /> {videoCount}</span>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <FilePreviewThumb file={file} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                      </div>
                      {progress[file.name] !== undefined && (
                        <div className="w-16">
                          {progress[file.name] === 100 ? (
                            <RiCheckLine className="w-5 h-5 text-green-500" />
                          ) : progress[file.name] === -1 ? (
                            <span className="text-[10px] text-red-500 font-medium">Erro</span>
                          ) : (
                            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress[file.name]}%` }} />
                            </div>
                          )}
                        </div>
                      )}
                      {!isUploading && (
                        <button onClick={() => removeFile(index)} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
                          <RiCloseLine className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-400 break-words">
                ⚠️ {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { onFilesChange([]); onClose(); }} className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm">
                Cancelar
              </button>
              <button
                onClick={onUpload}
                disabled={files.length === 0 || isUploading}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
              >
                {isUploading ? "Enviando..." : `Fazer Upload (${files.length})`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
