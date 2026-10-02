import { prisma } from "@/lib/prisma";

export type StorageRole = "VIEWER" | "EDITOR" | "ADMIN";

interface PermissionCheck {
  canView: boolean;
  canUpload: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  role: StorageRole | null;
  isOwner: boolean;
}

const NO_ACCESS: PermissionCheck = {
  canView: false, canUpload: false, canDelete: false,
  canShare: false, canDownload: false, role: null, isOwner: false,
};

const FULL_ACCESS: PermissionCheck = {
  canView: true, canUpload: true, canDelete: true,
  canShare: true, canDownload: true, role: "ADMIN", isOwner: true,
};

/**
 * Verifica permissões de um usuário em uma pasta.
 * Admin sempre tem acesso total.
 * Dono da pasta (createdById ou ownerId) tem acesso total.
 * Caso contrário, verifica StorageFolderPermission + herança de pastas pai.
 */
export async function checkFolderPermission(
  userId: string,
  userRole: string,
  folderId: string
): Promise<PermissionCheck> {
  // Admin vê tudo
  if (userRole === "ADMIN") return FULL_ACCESS;

  const folder = await prisma.storageFolder.findUnique({
    where: { id: folderId },
    select: { createdById: true, ownerId: true, isPublic: true, parentId: true, sharedWith: true },
  });

  if (!folder) return NO_ACCESS;

  // Dono da pasta
  if (folder.createdById === userId || folder.ownerId === userId) return FULL_ACCESS;

  // Pasta pública
  if (folder.isPublic) {
    return { canView: true, canUpload: false, canDelete: false, canShare: false, canDownload: true, role: "VIEWER", isOwner: false };
  }

  // Legacy sharedWith
  if (folder.sharedWith.includes(userId)) {
    return { canView: true, canUpload: false, canDelete: false, canShare: false, canDownload: true, role: "VIEWER", isOwner: false };
  }

  // Permissão explícita nesta pasta
  const permission = await prisma.storageFolderPermission.findUnique({
    where: { folderId_userId: { folderId, userId } },
  });

  if (permission) {
    // Verificar expiração
    if (permission.expiresAt && new Date() > permission.expiresAt) {
      return NO_ACCESS;
    }
    return {
      canView: true,
      canUpload: permission.canUpload,
      canDelete: permission.canDelete,
      canShare: permission.canShare,
      canDownload: permission.canDownload,
      role: permission.role as StorageRole,
      isOwner: false,
    };
  }

  // Herança de pasta pai (recursivo, max 10 níveis)
  if (folder.parentId) {
    return checkFolderPermissionInherited(userId, folder.parentId, 0);
  }

  return NO_ACCESS;
}

async function checkFolderPermissionInherited(
  userId: string,
  folderId: string,
  depth: number
): Promise<PermissionCheck> {
  if (depth > 10) return NO_ACCESS;

  const folder = await prisma.storageFolder.findUnique({
    where: { id: folderId },
    select: { createdById: true, ownerId: true, isPublic: true, parentId: true, sharedWith: true },
  });

  if (!folder) return NO_ACCESS;

  if (folder.createdById === userId || folder.ownerId === userId) return FULL_ACCESS;
  if (folder.sharedWith.includes(userId)) {
    return { canView: true, canUpload: false, canDelete: false, canShare: false, canDownload: true, role: "VIEWER", isOwner: false };
  }

  const permission = await prisma.storageFolderPermission.findUnique({
    where: { folderId_userId: { folderId, userId } },
  });

  if (permission) {
    if (permission.expiresAt && new Date() > permission.expiresAt) {
      // Expirado, continua procurando em pais
    } else {
      return {
        canView: true,
        canUpload: permission.canUpload,
        canDelete: permission.canDelete,
        canShare: permission.canShare,
        canDownload: permission.canDownload,
        role: permission.role as StorageRole,
        isOwner: false,
      };
    }
  }

  if (folder.parentId) {
    return checkFolderPermissionInherited(userId, folder.parentId, depth + 1);
  }

  return NO_ACCESS;
}

/**
 * Verifica permissões de um usuário em um arquivo.
 */
export async function checkFilePermission(
  userId: string,
  userRole: string,
  fileId: string
): Promise<PermissionCheck> {
  if (userRole === "ADMIN") return FULL_ACCESS;

  const file = await prisma.storageFile.findUnique({
    where: { id: fileId },
    select: { createdById: true, isPublic: true, sharedWith: true, folderId: true },
  });

  if (!file) return NO_ACCESS;

  // Dono do arquivo
  if (file.createdById === userId) return FULL_ACCESS;

  // Arquivo público
  if (file.isPublic) {
    return { canView: true, canUpload: false, canDelete: false, canShare: false, canDownload: true, role: "VIEWER", isOwner: false };
  }

  // Legacy sharedWith
  if (file.sharedWith.includes(userId)) {
    return { canView: true, canUpload: false, canDelete: false, canShare: false, canDownload: true, role: "VIEWER", isOwner: false };
  }

  // Permissão explícita no arquivo
  const permission = await prisma.storageFilePermission.findUnique({
    where: { fileId_userId: { fileId, userId } },
  });

  if (permission) {
    if (permission.expiresAt && new Date() > permission.expiresAt) {
      // Expirado
    } else {
      return {
        canView: true,
        canUpload: false,
        canDelete: permission.canDelete,
        canShare: permission.canShare,
        canDownload: permission.canDownload,
        role: permission.role as StorageRole,
        isOwner: false,
      };
    }
  }

  // Herança de pasta
  if (file.folderId) {
    return checkFolderPermission(userId, "CORRETOR", file.folderId);
  }

  return NO_ACCESS;
}

/**
 * Retorna IDs de pastas acessíveis por um corretor (para listagem).
 * Inclui: pastas criadas por ele, pastas com ownerId dele, pastas com permissão explícita.
 */
export async function getAccessibleFolderIds(userId: string): Promise<string[]> {
  const [ownedFolders, permittedFolders, sharedFolders] = await Promise.all([
    prisma.storageFolder.findMany({
      where: {
        isDeleted: false,
        OR: [{ createdById: userId }, { ownerId: userId }],
      },
      select: { id: true },
    }),
    prisma.storageFolderPermission.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { folderId: true },
    }),
    prisma.storageFolder.findMany({
      where: { isDeleted: false, sharedWith: { has: userId } },
      select: { id: true },
    }),
  ]);

  const ids = new Set<string>();
  ownedFolders.forEach((f) => ids.add(f.id));
  permittedFolders.forEach((f) => ids.add(f.folderId));
  sharedFolders.forEach((f) => ids.add(f.id));

  return Array.from(ids);
}

/**
 * Log de atividade no storage.
 */
export async function logStorageActivity(params: {
  action: string;
  fileId?: string | null;
  folderId?: string | null;
  userId?: string | null;
  userName?: string | null;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await prisma.storageActivityLog.create({
      data: {
        action: params.action,
        fileId: params.fileId || null,
        folderId: params.folderId || null,
        userId: params.userId || null,
        userName: params.userName || null,
        details: (params.details as any) || undefined,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Erro ao registrar atividade storage:", err);
  }
}
