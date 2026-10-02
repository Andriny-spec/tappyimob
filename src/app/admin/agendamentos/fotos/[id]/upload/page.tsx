"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowLeftLine,
  RiUploadCloud2Line,
  RiImage2Line,
  RiVideoLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiDownloadLine,
  RiEyeLine,
  RiHome4Line,
  RiCalendarLine,
  RiCameraLine,
} from "react-icons/ri";

interface Media {
  id: string;
  mediaType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  status: string;
  createdAt: string;
}

interface PhotoSession {
  id: string;
  property: {
    id: string;
    code: string;
    title: string;
    address: string;
    neighborhood: string;
    city: string;
    thumbnail?: string;
  };
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  media: Media[];
}

const statusColors: Record<string, { bg: string; text: string }> = {
  BRUTO: { bg: "bg-neutral-100 dark:bg-neutral-700", text: "text-neutral-600 dark:text-neutral-300" },
  EM_EDICAO: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
  EDITADO: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
  APROVADO: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400" },
  REJEITADO: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400" },
};

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<PhotoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const res = await fetch(`/api/admin/photo-sessions?propertyId=&status=`);
      if (res.ok) {
        const data = await res.json();
        const found = data.sessions?.find((s: any) => s.id === sessionId);
        if (found) {
          // Carregar mídias
          const mediaRes = await fetch(`/api/admin/photo-sessions/media?sessionId=${sessionId}`);
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            found.media = mediaData.media || [];
          }
          setSession(found);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar sessão:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    addFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Criar previews
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrls((prev) => [...prev, url]);
      } else {
        setPreviewUrls((prev) => [...prev, ""]);
      }
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("sessionId", sessionId);
    
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/admin/photo-sessions/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSelectedFiles([]);
        setPreviewUrls([]);
        await loadSession();
        setUploadProgress(100);
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const updateMediaStatus = async (mediaId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/photo-sessions/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mediaId, status }),
      });
      if (res.ok) {
        await loadSession();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!confirm("Remover este arquivo?")) return;

    try {
      const res = await fetch(`/api/admin/photo-sessions/media?id=${mediaId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadSession();
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RiLoader4Line className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Sessão não encontrada</p>
        <Link href="/admin/agendamentos/fotos" className="text-purple-500 underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/agendamentos/fotos"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiUploadCloud2Line className="w-6 h-6 text-purple-500" />
            Upload de Mídia
          </h1>
          <p className="text-sm text-neutral-500">
            {session.property.code} - {session.property.title}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-start gap-4">
          {session.property.thumbnail && (
            <img
              src={session.property.thumbnail}
              alt=""
              className="w-24 h-24 rounded-xl object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-purple-500">{session.property.code}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                session.status === "CONCLUIDO" ? "bg-green-100 text-green-600" :
                session.status === "EM_PRODUCAO" || session.status === "EDICAO" ? "bg-orange-100 text-orange-600" :
                "bg-blue-100 text-blue-600"
              }`}>
                {session.status}
              </span>
            </div>
            <h3 className="font-medium text-neutral-900 dark:text-white">{session.property.title}</h3>
            <p className="text-sm text-neutral-500">
              {session.property.address} - {session.property.neighborhood}, {session.property.city}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
              <div className="flex items-center gap-1">
                <RiCalendarLine className="w-4 h-4" />
                {new Date(session.scheduledDate).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center gap-1">
                <RiCameraLine className="w-4 h-4" />
                {session.serviceType}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragOver
            ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
            : "border-neutral-300 dark:border-neutral-700 hover:border-purple-400"
        }`}
      >
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <RiUploadCloud2Line className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">
          Arraste fotos e vídeos aqui ou <span className="text-purple-500">clique para selecionar</span>
        </p>
        <p className="text-sm text-neutral-400 mt-2">
          Suporta JPG, PNG, MP4, MOV
        </p>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{selectedFiles.length} arquivo(s) selecionado(s)</h3>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {uploading ? (
                <RiLoader4Line className="w-4 h-4 animate-spin" />
              ) : (
                <RiUploadCloud2Line className="w-4 h-4" />
              )}
              Fazer Upload
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {previewUrls[index] ? (
                    <img src={previewUrls[index]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <RiVideoLine className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
                <p className="text-xs text-neutral-500 truncate mt-1">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Media */}
      {session.media && session.media.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Mídia Carregada ({session.media.length})</h3>
            <div className="flex gap-2">
              <span className="text-sm text-neutral-500">
                {session.media.filter(m => m.status === "APROVADO").length} aprovado(s)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {session.media.map((media) => (
              <div key={media.id} className="group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {media.mediaType === "VIDEO" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <RiVideoLine className="w-8 h-8 text-neutral-400" />
                    </div>
                  ) : (
                    <img src={media.fileUrl} alt="" className="w-full h-full object-cover" />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={media.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                    >
                      <RiEyeLine className="w-4 h-4 text-white" />
                    </a>
                    <a
                      href={media.fileUrl}
                      download
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                    >
                      <RiDownloadLine className="w-4 h-4 text-white" />
                    </a>
                    <button
                      onClick={() => deleteMedia(media.id)}
                      className="p-2 rounded-full bg-red-500/80 hover:bg-red-500"
                    >
                      <RiDeleteBinLine className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[media.status]?.bg} ${statusColors[media.status]?.text}`}>
                    {media.status}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => updateMediaStatus(media.id, "APROVADO")}
                    className={`flex-1 py-1 rounded text-xs ${
                      media.status === "APROVADO"
                        ? "bg-green-500 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 hover:bg-green-100 dark:hover:bg-green-500/20"
                    }`}
                  >
                    <RiCheckLine className="w-3 h-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => updateMediaStatus(media.id, "REJEITADO")}
                    className={`flex-1 py-1 rounded text-xs ${
                      media.status === "REJEITADO"
                        ? "bg-red-500 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-500/20"
                    }`}
                  >
                    <RiCloseLine className="w-3 h-3 mx-auto" />
                  </button>
                </div>

                <p className="text-xs text-neutral-500 truncate mt-1">{media.fileName}</p>
                <p className="text-[10px] text-neutral-400">{formatFileSize(media.fileSize)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
