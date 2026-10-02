"use client";

import { RiHomeLine, RiSearchLine } from "react-icons/ri";
import { BreadcrumbItem } from "./types";

interface StorageToolbarProps {
  breadcrumb: BreadcrumbItem[];
  search: string;
  setSearch: (search: string) => void;
  onGoToRoot: () => void;
  onGoToFolder: (id: string) => void;
}

export function StorageToolbar({
  breadcrumb,
  search,
  setSearch,
  onGoToRoot,
  onGoToFolder,
}: StorageToolbarProps) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3">
      <div className="flex items-center gap-1 text-sm overflow-x-auto">
        <button
          onClick={onGoToRoot}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
        >
          <RiHomeLine className="w-4 h-4" />
        </button>
        {breadcrumb.map((item, index) => (
          <div key={item.id} className="flex items-center">
            <span className="text-neutral-400 mx-1">/</span>
            <button
              onClick={() => onGoToFolder(item.id)}
              className={`px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                index === breadcrumb.length - 1
                  ? "text-neutral-900 dark:text-white font-medium"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {item.name}
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 w-48 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
