import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstagramPosts, ApifyInstagramPost } from "@/lib/apify";
import { uploadFile } from "@/lib/minio";

const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || "http://localhost:9000";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "tappyimob-storage";

// Baixar imagem e salvar no MinIO, retornando URL permanente
async function saveImageToMinio(imageUrl: string, shortCode: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, { 
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const fileName = `${shortCode}.${ext}`;

    await uploadFile(buffer, fileName, contentType, "instagram");
    return `${MINIO_PUBLIC_URL}/instagram/${fileName}`;
  } catch (error) {
    console.error(`Erro ao salvar imagem no MinIO (${shortCode}):`, error);
    return null;
  }
}

// POST /api/instagram/sync - Sincronizar posts do Apify para o banco
export async function POST() {
  try {
    const posts = await getInstagramPosts();

    if (!posts || posts.length === 0) {
      return NextResponse.json(
        { error: "Nenhum post encontrado no Apify" },
        { status: 404 }
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let imagesSaved = 0;

    for (const post of posts) {
      try {
        // Verificar se já existe
        const existing = await prisma.instagramPost.findUnique({
          where: { postId: post.id },
        });

        const originalDisplayUrl = post.displayUrl || post.images?.[0] || "";

        // Salvar imagem no MinIO para URL permanente
        let permanentUrl = originalDisplayUrl;
        if (post.shortCode && originalDisplayUrl) {
          // Só re-salvar se não tiver URL do MinIO já
          const alreadySaved = existing?.displayUrl?.includes("/instagram/") && !existing.displayUrl.includes("cdninstagram");
          if (!alreadySaved) {
            const minioUrl = await saveImageToMinio(originalDisplayUrl, post.shortCode);
            if (minioUrl) {
              permanentUrl = minioUrl;
              imagesSaved++;
            }
          } else {
            permanentUrl = existing!.displayUrl;
          }
        }

        const postData = {
          postId: post.id,
          shortCode: post.shortCode,
          type: post.type || "Image",
          url: post.url,
          displayUrl: permanentUrl,
          videoUrl: post.videoUrl || null,
          caption: post.caption || null,
          hashtags: post.hashtags || [],
          mentions: post.mentions || [],
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
          videoViewCount: post.videoViewCount || null,
          dimensionsWidth: post.dimensionsWidth || null,
          dimensionsHeight: post.dimensionsHeight || null,
          timestamp: post.timestamp ? new Date(post.timestamp) : null,
        };

        if (existing) {
          await prisma.instagramPost.update({
            where: { postId: post.id },
            data: postData,
          });
          updated++;
        } else {
          await prisma.instagramPost.create({
            data: postData,
          });
          created++;
        }
      } catch (err) {
        console.error(`Erro ao processar post ${post.id}:`, err);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída`,
      stats: {
        total: posts.length,
        created,
        updated,
        skipped,
        imagesSaved,
      },
    });
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return NextResponse.json(
      { error: "Erro na sincronização" },
      { status: 500 }
    );
  }
}
