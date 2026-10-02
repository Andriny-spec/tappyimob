import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBucketStats, listFiles } from "@/lib/minio";
import { getAccessibleFolderIds } from "@/lib/storage-permissions";

// GET - Listar arquivos e pastas + estatísticas
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");
    const type = searchParams.get("type"); // all, images, documents, videos
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // STG7: Auto-criar pasta pessoal para corretor no primeiro acesso
    if (session.role === "CORRETOR" && !folderId && !search) {
      const personalFolder = await prisma.storageFolder.findFirst({
        where: { ownerId: session.id, ownerType: "CORRETOR", isDeleted: false },
      });
      if (!personalFolder) {
        const userName = session.name || session.email || "Corretor";
        await prisma.storageFolder.create({
          data: {
            name: `Meus Arquivos - ${userName}`,
            ownerId: session.id,
            ownerType: "CORRETOR",
            createdById: session.id,
            icon: "user",
          },
        });
      }
    }

    // STG6: Filtrar pastas por permissão
    const foldersWhere: any = {
      isDeleted: false,
      // Quando há busca, pesquisa em todas as pastas (ignora parentId)
      ...(search ? {} : { parentId: folderId || null }),
    };

    // Corretor na raiz: só vê pastas próprias + compartilhadas + com permissão
    if (session.role === "CORRETOR" && !folderId && !search) {
      const accessibleIds = await getAccessibleFolderIds(session.id);
      foldersWhere.OR = [
        { createdById: session.id },
        { ownerId: session.id },
        { isPublic: true },
        { id: { in: accessibleIds } },
      ];
    }

    if (search) {
      foldersWhere.name = { contains: search, mode: "insensitive" };
    }

    const folders = await prisma.storageFolder.findMany({
      where: foldersWhere,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { files: true, children: true },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Calcular contagem recursiva de arquivos para cada pasta
    async function countRecursiveFiles(fId: string): Promise<number> {
      const directFiles = await prisma.storageFile.count({
        where: { folderId: fId, isDeleted: false },
      });
      const subFolders = await prisma.storageFolder.findMany({
        where: { parentId: fId, isDeleted: false },
        select: { id: true },
      });
      let total = directFiles;
      for (const sub of subFolders) {
        total += await countRecursiveFiles(sub.id);
      }
      return total;
    }

    // Enriquecer pastas com contagem recursiva
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const totalFiles = await countRecursiveFiles(folder.id);
        return { ...folder, _count: { ...folder._count, files: totalFiles } };
      })
    );

    // Buscar arquivos
    const filesWhere: any = {
      isDeleted: false,
      // Quando há busca, pesquisa em todos os arquivos (ignora folderId)
      ...(search ? {} : { folderId: folderId || null }),
    };

    if (search) {
      filesWhere.name = { contains: search, mode: "insensitive" };
    }

    if (type && type !== "all") {
      const mimeTypeMap: Record<string, string[]> = {
        images: ["image/"],
        documents: ["application/pdf", "application/msword", "application/vnd", "text/"],
        videos: ["video/"],
      };
      if (mimeTypeMap[type]) {
        filesWhere.OR = mimeTypeMap[type].map((mime) => ({
          mimeType: { startsWith: mime },
        }));
      }
    }

    const [files, totalFiles] = await Promise.all([
      prisma.storageFile.findMany({
        where: filesWhere,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.storageFile.count({ where: filesWhere }),
    ]);

    // Estatísticas gerais
    const [totalStorageFiles, totalFolders, storageByType] = await Promise.all([
      prisma.storageFile.aggregate({
        where: { isDeleted: false },
        _sum: { size: true },
        _count: true,
      }),
      prisma.storageFolder.count({ where: { isDeleted: false } }),
      prisma.storageFile.groupBy({
        by: ["mimeType"],
        where: { isDeleted: false },
        _sum: { size: true },
        _count: true,
      }),
    ]);

    // Breadcrumb - caminho até a pasta atual
    let breadcrumb: any[] = [];
    if (folderId) {
      let currentFolder = await prisma.storageFolder.findUnique({
        where: { id: folderId },
        select: { id: true, name: true, parentId: true },
      });

      while (currentFolder) {
        breadcrumb.unshift(currentFolder);
        if (currentFolder.parentId) {
          currentFolder = await prisma.storageFolder.findUnique({
            where: { id: currentFolder.parentId },
            select: { id: true, name: true, parentId: true },
          });
        } else {
          currentFolder = null;
        }
      }
    }

    return NextResponse.json({
      folders: foldersWithCount,
      files,
      breadcrumb,
      pagination: {
        page,
        limit,
        total: totalFiles,
        totalPages: Math.ceil(totalFiles / limit),
      },
      stats: {
        totalFiles: totalStorageFiles._count,
        totalSize: totalStorageFiles._sum.size || 0,
        totalFolders,
        byType: storageByType,
      },
    });
  } catch (error) {
    console.error("Erro ao listar storage:", error);
    return NextResponse.json(
      { error: "Erro ao listar arquivos" },
      { status: 500 }
    );
  }
}
