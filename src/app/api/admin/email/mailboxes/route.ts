import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getMailboxes,
  createMailbox,
  updateMailbox,
  deleteMailbox,
  getAliases,
} from "@/lib/mailcow";

// GET /api/admin/email/mailboxes - Listar caixas de email
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain") || undefined;

    const [mailboxes, aliases] = await Promise.all([
      getMailboxes(domain),
      getAliases(domain),
    ]);

    // Mapear aliases por mailbox
    const aliasMap: Record<string, string[]> = {};
    for (const alias of aliases) {
      const dest = alias.goto;
      if (!aliasMap[dest]) aliasMap[dest] = [];
      aliasMap[dest].push(alias.address);
    }

    // Transformar para formato do frontend
    const accounts = mailboxes.map((mb) => ({
      id: mb.username,
      email: mb.username,
      displayName: mb.name || mb.local_part,
      domain: mb.domain,
      status: mb.active === 1 ? "active" : "inactive",
      storageUsed: Math.round((mb.quota_used || 0) / (1024 * 1024)), // bytes -> MB
      storageLimit: Math.round((mb.quota || 0) / (1024 * 1024)), // bytes -> MB
      messages: mb.messages || 0,
      percentUsed: mb.percent_in_use || 0,
      lastLogin: mb.last_imap_login
        ? new Date(mb.last_imap_login * 1000).toISOString()
        : null,
      createdAt: mb.created,
      aliases: aliasMap[mb.username] || [],
      tags: mb.tags || [],
      attributes: mb.attributes,
    }));

    return NextResponse.json({ accounts, total: accounts.length });
  } catch (error: any) {
    console.error("Erro ao listar mailboxes:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao listar caixas de email" },
      { status: 500 }
    );
  }
}

// POST /api/admin/email/mailboxes - Criar ou editar caixa de email
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const { localPart, domain, name, password, quota, active } = body;

      if (!localPart || !domain || !password) {
        return NextResponse.json(
          { error: "Campos obrigatórios: localPart, domain, password" },
          { status: 400 }
        );
      }

      const result = await createMailbox({
        local_part: localPart,
        domain: domain,
        name: name || localPart,
        password: password,
        password2: password,
        quota: quota || 3072, // 3GB default
        active: active ?? 1,
      });

      return NextResponse.json({ success: true, result });
    }

    if (action === "update") {
      const { email, name, quota, active, password } = body;

      if (!email) {
        return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
      }

      const attr: any = {};
      if (name !== undefined) attr.name = name;
      if (quota !== undefined) attr.quota = quota;
      if (active !== undefined) attr.active = active;
      if (password) {
        attr.password = password;
        attr.password2 = password;
      }

      const result = await updateMailbox({
        attr,
        items: [email],
      });

      return NextResponse.json({ success: true, result });
    }

    if (action === "delete") {
      const { emails } = body;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return NextResponse.json({ error: "Lista de emails obrigatória" }, { status: 400 });
      }

      const result = await deleteMailbox(emails);
      return NextResponse.json({ success: true, result });
    }

    if (action === "toggle") {
      const { email, active } = body;

      if (!email) {
        return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
      }

      const result = await updateMailbox({
        attr: { active: active ? 1 : 0 },
        items: [email],
      });

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro na operação de mailbox:", error);
    return NextResponse.json(
      { error: error.message || "Erro na operação" },
      { status: 500 }
    );
  }
}
