import {
  RiFileTextLine,
  RiImageLine,
  RiVideoLine,
  RiFilePdfLine,
  RiFileExcelLine,
  RiFileWordLine,
  RiFileLine,
} from "react-icons/ri";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return RiImageLine;
  if (mimeType.startsWith("video/")) return RiVideoLine;
  if (mimeType === "application/pdf") return RiFilePdfLine;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return RiFileExcelLine;
  if (mimeType.includes("word") || mimeType.includes("document")) return RiFileWordLine;
  if (mimeType.startsWith("text/")) return RiFileTextLine;
  return RiFileLine;
}

export function getFileColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "text-green-500";
  if (mimeType.startsWith("video/")) return "text-purple-500";
  if (mimeType === "application/pdf") return "text-red-500";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "text-emerald-500";
  if (mimeType.includes("word") || mimeType.includes("document")) return "text-blue-500";
  return "text-neutral-500";
}
