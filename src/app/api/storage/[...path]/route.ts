import { NextRequest, NextResponse } from "next/server";
import { minioClient, BUCKET_NAME } from "@/lib/minio";

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  heic: "image/heic",
  heif: "image/heif",
  tiff: "image/tiff",
  tif: "image/tiff",
  ico: "image/x-icon",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const objectPath = decodeURIComponent(path.join("/"));
    const { searchParams } = new URL(request.url);
    const forceDownload = searchParams.get("download") === "true";

    // Detectar content-type pela extensão
    const ext = objectPath.split(".").pop()?.toLowerCase() || "";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Buscar objeto do MinIO
    const stream = await minioClient.getObject(BUCKET_NAME, objectPath);

    // Converter stream para buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=2592000, immutable",
      "Access-Control-Allow-Origin": "*",
    };

    // Forçar download quando solicitado
    if (forceDownload) {
      const fileName = objectPath.split("/").pop() || "arquivo";
      headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(fileName)}"`;
      headers["Cache-Control"] = "no-cache";
    }

    return new NextResponse(buffer, { headers });
  } catch (error: any) {
    if (error?.code === "NoSuchKey") {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
    }
    console.error("Error serving storage file:", error);
    return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 });
  }
}
