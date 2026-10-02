import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyWatermark } from "@/lib/watermark";
import { uploadFile, deleteFile, BUCKET_NAME } from "@/lib/minio";

// Monta a URL pública do arquivo — usa rota Next.js /api/storage/
function getPublicUrl(objectKey: string): string {
  return `/api/storage/${objectKey}`;
}

// Extrai o objectKey de uma URL pública
function extractObjectKey(url: string): string | null {
  // Formato novo: /api/storage/folder/file.ext
  const apiPrefix = "/api/storage/";
  if (url.includes(apiPrefix)) {
    const idx = url.indexOf(apiPrefix);
    return url.substring(idx + apiPrefix.length);
  }
  // Formato antigo: .../BUCKET_NAME/folder/file.ext
  const bucketPrefix = `/${BUCKET_NAME}/`;
  const idx = url.indexOf(bucketPrefix);
  if (idx !== -1) {
    return url.substring(idx + bucketPrefix.length);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "properties";
    const skipWatermark = formData.get("skipWatermark") === "true";
    
    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const documentTypes = ["application/pdf"];
    const allowedTypes = [...imageTypes, ...documentTypes];
    const isImage = imageTypes.includes(file.type);
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use: JPEG, PNG, WebP, GIF ou PDF" },
        { status: 400 }
      );
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 10MB" },
        { status: 400 }
      );
    }

    // Gerar nome único
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;

    // Converter file para buffer
    const arrayBuffer = await file.arrayBuffer();
    let imageBuffer = Buffer.from(arrayBuffer);

    // Aplicar marca d'água se:
    // - Não for skipWatermark
    // - For uma pasta de imóveis (properties)
    // - For uma imagem (não GIF animado e não PDF)
    const isPropertyFolder = folder === "properties" || 
      folder.startsWith("properties/") ||
      folder.startsWith("fotos/imoveis/") ||
      folder === "property-types" ||
      folder.startsWith("property-types/");
    const shouldApplyWatermark = !skipWatermark && 
      isImage &&
      isPropertyFolder &&
      file.type !== "image/gif";

    if (shouldApplyWatermark) {
      try {
        const watermarkedBuffer = await applyWatermark(imageBuffer);
        imageBuffer = Buffer.from(watermarkedBuffer);
      } catch (watermarkError) {
        console.error("Erro ao aplicar marca d'água:", watermarkError);
        // Continua com a imagem original se falhar
      }
    }

    // Upload para MinIO
    const objectKey = await uploadFile(imageBuffer, fileName, file.type, folder);
    const publicUrl = getPublicUrl(objectKey);

    // Registrar no sistema de Storage (StorageFile) para aparecer em /admin/storage
    try {
      // Determinar pasta raiz: imagens → "fotos", PDFs → "documentos"
      const rootFolderName = isImage ? "fotos" : "documentos";
      
      // Buscar ou criar a pasta raiz
      let rootFolder = await prisma.storageFolder.findFirst({
        where: { name: rootFolderName, parentId: null, isDeleted: false },
      });
      if (!rootFolder) {
        rootFolder = await prisma.storageFolder.create({
          data: { name: rootFolderName, createdById: session.id },
        });
      }

      // Se folder contém subpastas (ex: "fotos/blog/meu-post"), criar hierarquia
      let targetFolder = rootFolder;
      const folderParts = folder.split("/").filter(Boolean);
      // Pular a primeira parte se for igual à pasta raiz (ex: "fotos" em "fotos/blog/slug")
      const startIdx = folderParts[0] === rootFolderName ? 1 : 0;
      for (let i = startIdx; i < folderParts.length; i++) {
        const partName = folderParts[i];
        let sub = await prisma.storageFolder.findFirst({
          where: { name: partName, parentId: targetFolder.id, isDeleted: false },
        });
        if (!sub) {
          sub = await prisma.storageFolder.create({
            data: { name: partName, parentId: targetFolder.id, createdById: session.id },
          });
        }
        targetFolder = sub;
      }

      await prisma.storageFile.create({
        data: {
          name: file.name,
          key: objectKey,
          size: imageBuffer.length,
          mimeType: file.type,
          folderId: targetFolder.id,
          createdById: session.id,
          isPublic: true,
        },
      });
    } catch (storageError) {
      // Não bloqueia o upload se falhar o registro no storage
      console.error("Erro ao registrar no StorageFile:", storageError);
    }

    return NextResponse.json({
      url: publicUrl,
      filename: objectKey,
      size: imageBuffer.length,
      type: file.type,
      watermarkApplied: shouldApplyWatermark,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
}

// DELETE - Remover arquivo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL não fornecida" },
        { status: 400 }
      );
    }

    const objectKey = extractObjectKey(url);
    if (objectKey) {
      await deleteFile(objectKey);
      
      // Soft-delete no StorageFile correspondente
      try {
        await prisma.storageFile.updateMany({
          where: { key: objectKey, isDeleted: false },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      } catch (e) {
        // Ignora se não encontrar registro
      }
    }

    return NextResponse.json({ message: "Arquivo removido com sucesso" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Erro ao remover arquivo" },
      { status: 500 }
    );
  }
}
