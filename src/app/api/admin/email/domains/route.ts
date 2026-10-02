import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDomains, getDKIM } from "@/lib/mailcow";

// GET /api/admin/email/domains - Lista domínios com status DNS
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const domains = await getDomains();

    const domainsWithDns = await Promise.all(
      domains.map(async (d) => {
        let dkimOk = false;
        try {
          const dkim = await getDKIM(d.domain_name);
          dkimOk = !!(dkim && dkim.dkim_txt);
        } catch {}

        return {
          domain: d.domain_name || "",
          description: d.description || "",
          active: d.active === 1,
          mailboxes: d.mailboxes || 0,
          aliases: d.aliases || 0,
          quota: d.quota || 0,
          maxquota: d.maxquota || 0,
          defquota: d.defquota || 0,
          totalMails: d.mails_in_mailbox_count || 0,
          totalSize: d.mails_in_mailbox_size || 0,
          dkim: dkimOk,
          created: d.created || null,
          modified: d.modified || null,
        };
      })
    );

    return NextResponse.json({ domains: domainsWithDns, total: domainsWithDns.length });
  } catch (error: any) {
    console.error("Erro ao listar domínios:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
