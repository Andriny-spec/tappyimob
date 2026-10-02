import { prisma } from "./prisma";

// Envio de push para o app (Expo) usando a API HTTP oficial.
// Nenhuma dependência extra: a Expo expõe POST https://exp.host/--/api/v2/push/send
// (o SDK `expo-server-sdk` é só um wrapper em cima disso).

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

async function sendExpoPush(tokens: string[], message: PushMessage): Promise<void> {
  if (tokens.length === 0) return;

  // A API aceita até 100 mensagens por requisição.
  for (let i = 0; i < tokens.length; i += 100) {
    const chunk = tokens.slice(i, i + 100);
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          chunk.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            sound: "default",
            priority: "high",
            data: message.data ?? {},
          }))
        ),
      });
      if (!res.ok) {
        console.error("[push] Expo respondeu", res.status, await res.text());
      }
    } catch (err) {
      console.error("[push] falha ao enviar para a Expo:", err);
    }
  }
}

async function tokensForUsers(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  const rows = await prisma.pushToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true },
  });
  return rows.map((r) => r.token);
}

export async function sendPushToUser(
  userId: string,
  message: PushMessage
): Promise<number> {
  const tokens = await tokensForUsers([userId]);
  await sendExpoPush(tokens, message);
  return tokens.length;
}

export async function sendPushToUsers(
  userIds: string[],
  message: PushMessage
): Promise<number> {
  const tokens = await tokensForUsers(userIds);
  await sendExpoPush(tokens, message);
  return tokens.length;
}
