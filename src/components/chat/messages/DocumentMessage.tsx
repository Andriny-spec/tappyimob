"use client";

import { RiFileTextLine, RiFilePdf2Line, RiFileExcel2Line, RiFileWord2Line, RiDownloadLine, RiExternalLinkLine } from "react-icons/ri";

interface DocumentMessageProps {
  mediaUrl: string;
  filename?: string;
  mimetype?: string;
  caption?: string;
  isFromMe?: boolean;
}

const getFileIcon = (mimetype?: string, filename?: string) => {
  const ext = filename?.split(".").pop()?.toLowerCase();
  
  if (mimetype?.includes("pdf") || ext === "pdf") {
    return <RiFilePdf2Line className="w-8 h-8 text-red-500" />;
  }
  if (mimetype?.includes("spreadsheet") || ext === "xlsx" || ext === "xls") {
    return <RiFileExcel2Line className="w-8 h-8 text-green-600" />;
  }
  if (mimetype?.includes("word") || ext === "docx" || ext === "doc") {
    return <RiFileWord2Line className="w-8 h-8 text-blue-600" />;
  }
  return <RiFileTextLine className="w-8 h-8 text-neutral-500" />;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentMessage({ 
  mediaUrl, 
  filename = "documento", 
  mimetype,
  caption,
  isFromMe = false 
}: DocumentMessageProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar documento:", error);
    }
  };

  const handleOpen = () => {
    window.open(mediaUrl, "_blank");
  };

  return (
    <div className={`flex flex-col max-w-[280px] ${isFromMe ? "" : ""}`}>
      <div className={`flex items-center gap-3 p-3 rounded-xl ${
        isFromMe 
          ? "bg-white/10" 
          : "bg-neutral-100 dark:bg-neutral-700"
      }`}>
        {/* Ícone do arquivo */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isFromMe ? "bg-white/10" : "bg-white dark:bg-neutral-600"
        }`}>
          {getFileIcon(mimetype, filename)}
        </div>
        
        {/* Info do arquivo */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isFromMe ? "text-white" : "text-neutral-900 dark:text-white"
          }`}>
            {filename}
          </p>
          <p className={`text-xs ${isFromMe ? "text-white/60" : "text-neutral-500"}`}>
            {mimetype?.split("/").pop()?.toUpperCase() || "Documento"}
          </p>
        </div>
        
        {/* Ações */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpen}
            className={`p-2 rounded-lg transition-colors ${
              isFromMe 
                ? "hover:bg-white/10 text-white/80" 
                : "hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300"
            }`}
            title="Abrir"
          >
            <RiExternalLinkLine className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className={`p-2 rounded-lg transition-colors ${
              isFromMe 
                ? "hover:bg-white/10 text-white/80" 
                : "hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300"
            }`}
            title="Baixar"
          >
            <RiDownloadLine className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {caption && (
        <p className={`mt-2 text-sm ${isFromMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
          {caption}
        </p>
      )}
    </div>
  );
}
