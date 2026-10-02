"use client";

import Link from "next/link";
import { RiHardDriveLine, RiGridLine, RiListUnordered, RiRefreshLine, RiFolderAddLine, RiUploadCloud2Line, RiDeleteBinLine } from "react-icons/ri";
import { formatBytes } from "./utils";
import { StorageStats } from "./types";

const STORAGE_LIMIT = 50 * 1024 * 1024 * 1024; // 50 GB

interface StorageHeaderProps {
  stats: StorageStats | null;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onRefresh: () => void;
  onNewFolder: () => void;
  onUpload: () => void;
}

export function StorageHeader({
  stats,
  viewMode,
  setViewMode,
  onRefresh,
  onNewFolder,
  onUpload,
}: StorageHeaderProps) {
  const usedPercent = stats ? Math.min((stats.totalSize / STORAGE_LIMIT) * 100, 100) : 0;
  const freeSpace = stats ? STORAGE_LIMIT - stats.totalSize : STORAGE_LIMIT;
  const barColor = usedPercent > 90 ? "bg-red-500" : usedPercent > 70 ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <RiHardDriveLine className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">Storage</h1>
            <p className="text-[10px] text-neutral-500">
              {stats ? `${stats.totalFiles} arquivos • ${formatBytes(stats.totalSize)}` : "Carregando..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-[#0A1E3D] text-white" : "text-neutral-400"}`}
            >
              <RiGridLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-[#0A1E3D] text-white" : "text-neutral-400"}`}
            >
              <RiListUnordered className="w-4 h-4" />
            </button>
          </div>

          <button onClick={onRefresh} className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-blue-500">
            <RiRefreshLine className="w-4 h-4" />
          </button>

          <Link href="/admin/storage/lixeira" className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-red-400 hover:text-red-500" title="Lixeira">
            <RiDeleteBinLine className="w-4 h-4" />
          </Link>

          <button onClick={onNewFolder} className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-blue-500 text-sm">
            <RiFolderAddLine className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Pasta</span>
          </button>

          <button onClick={onUpload} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm font-medium">
            <RiUploadCloud2Line className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      {/* Barra de espaço usado */}
      {stats && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {formatBytes(stats.totalSize)} de {formatBytes(STORAGE_LIMIT)} usados
            </span>
            <span className="text-xs text-neutral-500">
              {formatBytes(freeSpace)} livres
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${Math.max(usedPercent, 0.5)}%` }}
            />
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">{usedPercent.toFixed(1)}% utilizado</p>
        </div>
      )}
    </div>
  );
}
