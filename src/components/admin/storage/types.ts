export interface StorageFile {
  id: string;
  name: string;
  key: string;
  size: number;
  mimeType: string;
  folderId: string | null;
  description: string | null;
  tags: string[];
  createdAt: string;
  createdBy: { id: string; name: string; avatar: string | null } | null;
  folder: { id: string; name: string } | null;
}

export interface StorageFolder {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  createdAt: string;
  createdBy: { id: string; name: string; avatar: string | null } | null;
  _count: { files: number; children: number };
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  parentId: string | null;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
}
