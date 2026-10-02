import { prisma } from "@/lib/prisma";

interface LogPropertyActivityParams {
  action: "CREATED" | "UPDATED" | "DELETED";
  propertyId?: string | null;
  propertyCode: string;
  propertyTitle?: string | null;
  userId?: string | null;
  userName: string;
  userRole?: string | null;
  description?: string;
  metadata?: any;
  ipAddress?: string;
}

export async function logPropertyActivity(params: LogPropertyActivityParams) {
  try {
    await prisma.propertyActivityLog.create({
      data: {
        action: params.action,
        propertyId: params.propertyId || undefined,
        propertyCode: params.propertyCode,
        propertyTitle: params.propertyTitle || null,
        userId: params.userId || undefined,
        userName: params.userName,
        userRole: params.userRole || null,
        description: params.description || null,
        metadata: params.metadata || undefined,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Log silencioso - não queremos que erro de log quebre a operação principal
    console.error("Erro ao registrar log de atividade:", error);
  }
}
