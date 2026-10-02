import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { minioClient, BUCKET_NAME } from "@/lib/minio";

interface WatermarkSettings {
  logoUrl: string | null;
  position: string;
  opacity: number;
  scale: number;
  margin: number;
  isActive: boolean;
}

/**
 * Busca as configurações de marca d'água do banco
 */
export async function getWatermarkSettings(): Promise<WatermarkSettings | null> {
  try {
    const settings = await prisma.watermarkSettings.findFirst();
    if (!settings || !settings.isActive || !settings.logoUrl) {
      return null;
    }
    return settings;
  } catch (error) {
    console.error("Erro ao buscar configurações de marca d'água:", error);
    return null;
  }
}

/**
 * Extrai o objectKey de uma URL de storage
 */
function extractKeyFromUrl(url: string): string | null {
  const apiPrefix = "/api/storage/";
  if (url.includes(apiPrefix)) {
    const idx = url.indexOf(apiPrefix);
    return url.substring(idx + apiPrefix.length);
  }
  return null;
}

/**
 * Busca o logo da marca d'água diretamente do MinIO (sem HTTP fetch)
 */
async function getLogoBuffer(logoUrl: string): Promise<Buffer | null> {
  try {
    const objectKey = extractKeyFromUrl(logoUrl);
    if (!objectKey) {
      // Tenta como URL absoluta (fallback)
      const response = await fetch(logoUrl);
      if (!response.ok) return null;
      return Buffer.from(await response.arrayBuffer());
    }

    // Buscar direto do MinIO
    const stream = await minioClient.getObject(BUCKET_NAME, objectKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Erro ao buscar logo da marca d'água:", error);
    return null;
  }
}

/**
 * Aplica marca d'água em uma imagem
 * @param imageBuffer - Buffer da imagem original
 * @returns Buffer da imagem com marca d'água
 */
export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const settings = await getWatermarkSettings();
    
    // Se não houver configurações ou estiver desativado, retorna a imagem original
    if (!settings || !settings.logoUrl) {
      return imageBuffer;
    }

    // Carregar a imagem original
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height) {
      return imageBuffer;
    }

    // Buscar o logo da marca d'água direto do MinIO
    const logoBuffer = await getLogoBuffer(settings.logoUrl);
    if (!logoBuffer) {
      console.error("Erro ao obter logo da marca d'água");
      return imageBuffer;
    }

    // Calcular tamanho do logo baseado no scale (% da largura da imagem)
    const logoWidth = Math.round(metadata.width * (settings.scale / 100));
    
    // Redimensionar o logo
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoWidth)
      .ensureAlpha()
      .toBuffer();

    // Obter dimensões do logo redimensionado
    const logoMetadata = await sharp(resizedLogo).metadata();
    const logoHeight = logoMetadata.height || 0;

    // Calcular posição
    const { left, top } = calculatePosition(
      settings.position,
      metadata.width,
      metadata.height,
      logoWidth,
      logoHeight,
      settings.margin
    );

    // Aplicar transparência ao logo
    const logoWithOpacity = await sharp(resizedLogo)
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(255 * (settings.opacity / 100))]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      }])
      .toBuffer();

    // Compor a imagem final
    const result = await image
      .composite([{
        input: logoWithOpacity,
        left,
        top,
        blend: "over",
      }])
      .toBuffer();

    return result;
  } catch (error) {
    console.error("Erro ao aplicar marca d'água:", error);
    return imageBuffer;
  }
}

/**
 * Calcula a posição do logo baseado na configuração
 */
function calculatePosition(
  position: string,
  imageWidth: number,
  imageHeight: number,
  logoWidth: number,
  logoHeight: number,
  margin: number
): { left: number; top: number } {
  let left = margin;
  let top = margin;

  switch (position) {
    case "top-left":
      left = margin;
      top = margin;
      break;
    case "top-center":
      left = Math.round((imageWidth - logoWidth) / 2);
      top = margin;
      break;
    case "top-right":
      left = imageWidth - logoWidth - margin;
      top = margin;
      break;
    case "center-left":
      left = margin;
      top = Math.round((imageHeight - logoHeight) / 2);
      break;
    case "center":
      left = Math.round((imageWidth - logoWidth) / 2);
      top = Math.round((imageHeight - logoHeight) / 2);
      break;
    case "center-right":
      left = imageWidth - logoWidth - margin;
      top = Math.round((imageHeight - logoHeight) / 2);
      break;
    case "bottom-left":
      left = margin;
      top = imageHeight - logoHeight - margin;
      break;
    case "bottom-center":
      left = Math.round((imageWidth - logoWidth) / 2);
      top = imageHeight - logoHeight - margin;
      break;
    case "bottom-right":
      left = imageWidth - logoWidth - margin;
      top = imageHeight - logoHeight - margin;
      break;
  }

  // Garantir que não seja negativo
  left = Math.max(0, left);
  top = Math.max(0, top);

  return { left, top };
}
