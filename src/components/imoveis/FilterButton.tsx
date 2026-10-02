"use client";

import { RiArrowDownSLine } from "react-icons/ri";

interface FilterButtonProps {
  label: string;
  value: string | string[];
  onClick: () => void;
  placeholder: string;
}

export function FilterButton({ label, value, onClick, placeholder }: FilterButtonProps) {
  const displayValue = Array.isArray(value)
    ? value.length > 0
      ? `${value.length} selecionado${value.length > 1 ? "s" : ""}`
      : placeholder
    : value || placeholder;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start px-4 py-2.5 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-[#0B2545] dark:hover:border-white/30 transition-colors min-w-[120px]"
    >
      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2 w-full">
        <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
          {displayValue}
        </span>
        <RiArrowDownSLine className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0" />
      </div>
    </button>
  );
}
