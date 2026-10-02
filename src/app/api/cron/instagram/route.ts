import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstagramPosts, startInstagramScrape, getRunStatus } from "@/lib/apify";
import { uploadFile } from "@/lib/minio";

const CRON_SECRET = process.env.CRON_SECRET || "tappyimob-cron-2026";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || "http://localhost:9000";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "tappyimob-storage";

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

// GET /api/cron/instagram - Trigger scrape + sync (chamado via crontab do servidor)
export async function GET(request: NextRequest) {
  // Autenticação simples via query param
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Iniciar scrape no Apify
    console.log("[CRON Instagram] Iniciando scrape...");
    const run = await startInstagramScrape("tappyimob", 12);

    if (!run) {
      // Se não conseguiu iniciar scrape, tentar sync com dados existentes
      console.log("[CRON Instagram] Falha ao iniciar scrape, tentando sync com dados existentes...");
    } else {
      // 2. Aguardar conclusão do scrape (polling, max 3 min)
      console.log(`[CRON Instagram] Scrape iniciado: ${run.id}, aguardando...`);
      const maxWait = 180000; // 3 min
      const pollInterval = 10000; // 10s
      let elapsed = 0;

      while (elapsed < maxWait) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        elapsed += pollInterval;

        const status = await getRunStatus(run.id);
        if (status?.status === "SUCCEEDED") {
          console.log("[CRON Instagram] Scrape concluído com sucesso!");
          break;
        }
        if (status?.status === "FAILED" || status?.status === "ABORTED") {
          console.error(`[CRON Instagram] Scrape falhou: ${status.status}`);
          break;
        }
      }
    }

    // 3. Sincronizar posts do Apify para o banco
    console.log("[CRON Instagram] Sincronizando posts...");
    const posts = await getInstagramPosts();

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Nenhum post encontrado no Apify",
      });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let imagesSaved = 0;

    for (const post of posts) {
      try {
        const existing = await prisma.instagramPost.findUnique({
          where: { postId: post.id },
        });

        const originalDisplayUrl = post.displayUrl || post.images?.[0] || "";

        let permanentUrl = originalDisplayUrl;
        if (post.shortCode && originalDisplayUrl) {
          const alreadySaved =
            existing?.displayUrl?.includes("/instagram/") &&
            !existing.displayUrl.includes("cdninstagram");
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

    const result = {
      success: true,
      message: "Sincronização concluída",
      stats: { total: posts.length, created, updated, skipped, imagesSaved },
      timestamp: new Date().toISOString(),
    };

    console.log("[CRON Instagram]", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[CRON Instagram] Erro:", error);
    return NextResponse.json({ error: "Erro na sincronização" }, { status: 500 });
  }
}
