import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { minioClient, BUCKET_NAME } from "@/lib/minio";
import sharp from "sharp";

// Extrai o objectKey de uma URL de imagem
function extractObjectKey(url: string): string | null {
  const apiPrefix = "/api/storage/";
  if (url.includes(apiPrefix)) {
    const idx = url.indexOf(apiPrefix);
    return url.substring(idx + apiPrefix.length);
  }
  const bucketPrefix = `/${BUCKET_NAME}/`;
  const idx = url.indexOf(bucketPrefix);
  if (idx !== -1) {
    return url.substring(idx + bucketPrefix.length);
  }
  // Se for apenas o objectKey direto (sem prefixo)
  if (!url.startsWith("http") && !url.startsWith("/")) {
    return url;
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar imóvel por ID, slug ou código
    let property = await prisma.property.findUnique({
      where: { id },
      select: { images: true, thumbnail: true, title: true },
    });
    if (!property) {
      property = await prisma.property.findUnique({
        where: { slug: id },
        select: { images: true, thumbnail: true, title: true },
      });
    }
    if (!property) {
      property = await prisma.property.findUnique({
        where: { code: id },
        select: { images: true, thumbnail: true, title: true },
      });
    }

    if (!property) {
      return new NextResponse("Not found", { status: 404 });
    }

    const rawImage = property.images?.[0] || property.thumbnail || "";
    if (!rawImage) {
      return new NextResponse("No image", { status: 404 });
    }

    let imageBuffer: Buffer;

    const objectKey = extractObjectKey(rawImage);
    if (objectKey) {
      // Buscar imagem do MinIO
      const stream = await minioClient.getObject(BUCKET_NAME, objectKey);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      imageBuffer = Buffer.concat(chunks);
    } else if (rawImage.startsWith("http")) {
      // Buscar imagem externa (ex: Oracle Cloud / Tecimob)
      const extRes = await fetch(rawImage, { signal: AbortSignal.timeout(10000) });
      if (!extRes.ok) {
        return new NextResponse("Failed to fetch external image", { status: 502 });
      }
      imageBuffer = Buffer.from(await extRes.arrayBuffer());
    } else {
      return new NextResponse("Invalid image path", { status: 400 });
    }

    // Redimensionar para 1200x630 e converter para JPEG
    const ogImage = await sharp(imageBuffer)
      .resize(1200, 630, { fit: "cover", position: "center" })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    return new NextResponse(ogImage, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": ogImage.length.toString(),
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("OG image error:", error);
    return new NextResponse("Error generating OG image", { status: 500 });
  }
}
