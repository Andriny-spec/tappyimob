import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT?.replace('http://', '').replace('https://', '').split(':')[0] || 'localhost',
  port: parseInt(process.env.MINIO_ENDPOINT?.split(':')[2] || '9000'),
  useSSL: process.env.MINIO_ENDPOINT?.startsWith('https') || false,
  accessKey: process.env.MINIO_ROOT_USER || 'tappyimob',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'TappyImobStorage2026!',
});

// Cliente separado para gerar URLs presigned com endpoint público (browser usa essa URL)
// Necessário para upload direto browser → MinIO sem passar pelo Next.js
function buildPublicClient(): Client | null {
  const publicHost = process.env.MINIO_PUBLIC_HOST; // ex: tappyimob.com.br
  if (!publicHost) return null;
  const useSSL = (process.env.MINIO_PUBLIC_SSL ?? "true") !== "false";
  const port = parseInt(process.env.MINIO_PUBLIC_PORT || (useSSL ? "443" : "80"));
  return new Client({
    endPoint: publicHost,
    port,
    useSSL,
    accessKey: process.env.MINIO_ROOT_USER || 'tappyimob',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'TappyImobStorage2026!',
  });
}
const publicMinioClient = buildPublicClient();

const BUCKET_NAME = process.env.MINIO_BUCKET || 'tappyimob-storage';

export async function initBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
  }
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = ''
): Promise<string> {
  await initBucket();
  
  const objectName = folder ? `${folder}/${fileName}` : fileName;
  
  await minioClient.putObject(BUCKET_NAME, objectName, file, file.length, {
    'Content-Type': contentType,
  });
  
  return objectName;
}

export async function getFileUrl(objectName: string, expirySeconds: number = 3600): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expirySeconds);
}

// PUT presigned para upload direto do browser → MinIO (bypass Next.js)
// Usa cliente público (configurado via MINIO_PUBLIC_HOST) para que a URL seja acessível pelo browser.
// NÃO chama initBucket aqui — assumimos que o bucket já existe (criado em uploads anteriores).
export async function getPresignedPutUrl(
  objectName: string,
  expirySeconds: number = 600
): Promise<string> {
  const client = publicMinioClient || minioClient;
  return await client.presignedPutObject(BUCKET_NAME, objectName, expirySeconds);
}

export async function deleteFile(objectName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, objectName);
}

export async function listFiles(prefix: string = ''): Promise<any[]> {
  await initBucket();
  
  return new Promise((resolve, reject) => {
    const files: any[] = [];
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);
    
    stream.on('data', (obj) => files.push(obj));
    stream.on('error', reject);
    stream.on('end', () => resolve(files));
  });
}

export async function getFileStats(objectName: string) {
  return await minioClient.statObject(BUCKET_NAME, objectName);
}

export async function createFolder(folderPath: string): Promise<void> {
  await initBucket();
  // MinIO doesn't have real folders, we create a placeholder
  const placeholder = `${folderPath}/.folder`;
  await minioClient.putObject(BUCKET_NAME, placeholder, Buffer.from(''), 0);
}

export async function getBucketStats() {
  await initBucket();
  
  const files = await listFiles();
  let totalSize = 0;
  let fileCount = 0;
  
  for (const file of files) {
    if (!file.name?.endsWith('.folder')) {
      totalSize += file.size || 0;
      fileCount++;
    }
  }
  
  return {
    totalSize,
    fileCount,
    bucket: BUCKET_NAME,
  };
}

export async function copyFile(sourceKey: string, destKey: string): Promise<void> {
  await minioClient.copyObject(BUCKET_NAME, destKey, `/${BUCKET_NAME}/${sourceKey}`);
}

export async function moveFile(sourceKey: string, destKey: string): Promise<void> {
  await copyFile(sourceKey, destKey);
  await deleteFile(sourceKey);
}

export { minioClient, BUCKET_NAME };
