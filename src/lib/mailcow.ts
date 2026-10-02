// ============================================================
// MAILCOW API CLIENT
// Docs: https://mailcow.github.io/mailcow-dockerized-docs/
// ============================================================

const MAILCOW_API_URL = process.env.MAILCOW_API_URL || "https://mail.tappyimob.com.br";
const MAILCOW_API_KEY = process.env.MAILCOW_API_KEY || "";

// Mailcow pode estar com cert self-signed em localhost ou rede Docker interna
if (typeof process !== "undefined" && (MAILCOW_API_URL.includes("127.0.0.1") || MAILCOW_API_URL.includes("mailcow"))) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface MailcowRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
}

async function mailcowFetch<T = any>(endpoint: string, options: MailcowRequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  const url = `${MAILCOW_API_URL}/api/v1${endpoint}`;
  const headers: Record<string, string> = {
    "X-API-Key": MAILCOW_API_KEY,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Mailcow API error ${res.status}: ${text}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res.text() as any;
}

// ============================================================
// MAILBOXES
// ============================================================

export interface MailcowMailbox {
  username: string;
  domain: string;
  name: string;
  local_part: string;
  quota: number; // bytes
  quota_used: number; // bytes
  messages: number;
  active: number; // 1 or 0
  last_imap_login: number; // timestamp
  last_smtp_login: number; // timestamp
  last_pop3_login: number; // timestamp
  created: string;
  modified: string;
  attributes: {
    force_pw_update: string;
    tls_enforce_in: string;
    tls_enforce_out: string;
    sogo_access: string;
    imap_access: string;
    pop3_access: string;
    smtp_access: string;
    relayhost: string;
  };
  tags: string[];
  percent_in_use: number;
}

export async function getMailboxes(domain?: string): Promise<MailcowMailbox[]> {
  const endpoint = domain ? `/get/mailbox/${domain}` : "/get/mailbox/all";
  const data = await mailcowFetch<MailcowMailbox[]>(endpoint);
  return Array.isArray(data) ? data : [];
}

export async function getMailbox(email: string): Promise<MailcowMailbox | null> {
  try {
    const data = await mailcowFetch<MailcowMailbox[]>(`/get/mailbox/${email}`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

export interface CreateMailboxParams {
  local_part: string;
  domain: string;
  name: string;
  password: string;
  password2: string;
  quota: number; // MB
  active: number; // 1 or 0
  force_pw_update?: number;
  tls_enforce_in?: number;
  tls_enforce_out?: number;
  tags?: string[];
}

export async function createMailbox(params: CreateMailboxParams) {
  return mailcowFetch("/add/mailbox", {
    method: "POST",
    body: params,
  });
}

export interface UpdateMailboxParams {
  attr: {
    name?: string;
    quota?: number; // MB
    active?: number;
    force_pw_update?: number;
    sogo_access?: number;
    imap_access?: number;
    pop3_access?: number;
    smtp_access?: number;
    password?: string;
    password2?: string;
    tags?: string[];
  };
  items: string[]; // email addresses
}

export async function updateMailbox(params: UpdateMailboxParams) {
  return mailcowFetch("/edit/mailbox", {
    method: "POST",
    body: params,
  });
}

export async function deleteMailbox(emails: string[]) {
  return mailcowFetch("/delete/mailbox", {
    method: "POST",
    body: emails,
  });
}

// ============================================================
// ALIASES
// ============================================================

export interface MailcowAlias {
  id: number;
  address: string;
  goto: string;
  domain: string;
  active: number;
  created: string;
  modified: string;
  private_comment: string;
  public_comment: string;
  sogo_visible: number;
  in_primary_domain: string;
}

export async function getAliases(domain?: string): Promise<MailcowAlias[]> {
  const endpoint = domain ? `/get/alias/${domain}` : "/get/alias/all";
  const data = await mailcowFetch<MailcowAlias[]>(endpoint);
  return Array.isArray(data) ? data : [];
}

export interface CreateAliasParams {
  address: string; // alias email
  goto: string; // destination email
  active: number;
  sogo_visible?: number;
  private_comment?: string;
  public_comment?: string;
}

export async function createAlias(params: CreateAliasParams) {
  return mailcowFetch("/add/alias", {
    method: "POST",
    body: params,
  });
}

export async function updateAlias(params: { attr: Partial<CreateAliasParams>; items: string[] }) {
  return mailcowFetch("/edit/alias", {
    method: "POST",
    body: params,
  });
}

export async function deleteAlias(ids: number[]) {
  return mailcowFetch("/delete/alias", {
    method: "POST",
    body: ids,
  });
}

// ============================================================
// DOMAINS
// ============================================================

export interface MailcowDomain {
  domain_name: string;
  description: string;
  aliases: number;
  mailboxes: number;
  defquota: number;
  maxquota: number;
  quota: number;
  active: number;
  mails_in_mailbox_count: number;
  mails_in_mailbox_size: number;
  created: string;
  modified: string;
}

export async function getDomains(): Promise<MailcowDomain[]> {
  const data = await mailcowFetch<MailcowDomain[]>("/get/domain/all");
  return Array.isArray(data) ? data : [];
}

export async function getDomain(domain: string): Promise<MailcowDomain | null> {
  try {
    const data = await mailcowFetch<MailcowDomain[]>(`/get/domain/${domain}`);
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

// ============================================================
// DKIM
// ============================================================

export async function getDKIM(domain: string) {
  return mailcowFetch(`/get/dkim/${domain}`);
}

export async function generateDKIM(domain: string, keySize: number = 2048) {
  return mailcowFetch("/add/dkim", {
    method: "POST",
    body: {
      domains: domain,
      dkim_selector: "dkim",
      key_size: keySize,
    },
  });
}

// ============================================================
// QUARANTINE / SPAM
// ============================================================

export async function getQuarantine() {
  return mailcowFetch("/get/quarantine/all");
}

// ============================================================
// LOGS
// ============================================================

export async function getMailLogs(count: number = 50) {
  return mailcowFetch(`/get/logs/postfix/${count}`);
}

export async function getDovecotLogs(count: number = 50) {
  return mailcowFetch(`/get/logs/dovecot/${count}`);
}

// ============================================================
// STATUS / HEALTH
// ============================================================

export async function getMailcowStatus() {
  try {
    const [domains, mailboxes] = await Promise.all([
      getDomains(),
      getMailboxes(),
    ]);

    const totalQuotaUsed = mailboxes.reduce((sum, m) => sum + (m.quota_used || 0), 0);
    const totalQuota = mailboxes.reduce((sum, m) => sum + (m.quota || 0), 0);
    const activeMailboxes = mailboxes.filter((m) => m.active === 1).length;
    const totalMessages = mailboxes.reduce((sum, m) => sum + (m.messages || 0), 0);

    return {
      ok: true,
      domains: domains.length,
      mailboxes: mailboxes.length,
      activeMailboxes,
      totalMessages,
      totalQuotaUsed,
      totalQuota,
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
      domains: 0,
      mailboxes: 0,
      activeMailboxes: 0,
      totalMessages: 0,
      totalQuotaUsed: 0,
      totalQuota: 0,
    };
  }
}
