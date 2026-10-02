import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTATO } from "@/lib/contato";

// GET - Gerar relatório para proprietário em HTML (para impressão/PDF)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Período opcional para filtrar visitas/propostas
    const sp = request.nextUrl.searchParams;
    const filtroIni = sp.get("startDate");
    const filtroFim = sp.get("endDate");
    const visitDateFilter = (filtroIni || filtroFim)
      ? { visitDate: { ...(filtroIni ? { gte: new Date(filtroIni) } : {}), ...(filtroFim ? { lte: new Date(`${filtroFim}T23:59:59`) } : {}) } }
      : {};
    const propDateFilter = (filtroIni || filtroFim)
      ? { createdAt: { ...(filtroIni ? { gte: new Date(filtroIni) } : {}), ...(filtroFim ? { lte: new Date(`${filtroFim}T23:59:59`) } : {}) } }
      : {};

    // Buscar dados do imóvel
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyOwner: true,
        visitRecords: {
          where: visitDateFilter,
          orderBy: { visitDate: "desc" },
          take: 50,
        },
        proposals: {
          where: propDateFilter,
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        timeline: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // Mapa de corretores envolvidos (para detectar parceiros externos nas visitas)
    const brokerIds = [...new Set((property.visitRecords || []).map((v: any) => v.brokerId).filter(Boolean))] as string[];
    const brokers = brokerIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: brokerIds } }, select: { id: true, name: true, role: true } })
      : [];
    const brokerMap = Object.fromEntries(brokers.map((b) => [b.id, b]));

    const exclusivity = await prisma.propertyExclusivity.findUnique({
      where: { propertyId: id },
    });

    // Atualizar data do último relatório
    if (exclusivity) {
      await prisma.propertyExclusivity.update({
        where: { id: exclusivity.id },
        data: { ultimoRelatorio: new Date() },
      });
    }

    // Dados do proprietário
    const owner = property.propertyOwner;
    const ownerName = owner?.name || "Proprietário";

    // Dados do imóvel
    const propertyAddress = `${property.address || ""}, ${property.number || ""} - ${property.neighborhood || ""}, ${property.city || ""}`.trim();
    const propertyCode = property.code || property.id.slice(0, 8).toUpperCase();
    const propertyValue = property.price
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(property.price)
      : "Sob consulta";

    // Estatísticas
    const totalViews = property.views || 0;
    const totalVisits = property.visitRecords?.length || 0;
    const totalProposals = property.proposals?.length || 0;
    const daysOnMarket = Math.ceil((new Date().getTime() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    // Dados da exclusividade
    const startDate = exclusivity?.startDate
      ? new Date(exclusivity.startDate).toLocaleDateString("pt-BR")
      : "-";
    const endDate = exclusivity?.endDate
      ? new Date(exclusivity.endDate).toLocaleDateString("pt-BR")
      : "-";
    
    // Calcular dias restantes
    let daysRemaining = null;
    if (exclusivity?.endDate) {
      const end = new Date(exclusivity.endDate);
      daysRemaining = Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    }

    // Checklist progress
    const checklist = (exclusivity?.checklist as Record<string, boolean>) || {};
    const checklistCompleted = Object.values(checklist).filter(Boolean).length;
    const checklistTotal = 15;
    const checklistProgress = Math.round((checklistCompleted / checklistTotal) * 100);

    const gestorName = exclusivity?.gestorName || "Equipe Tappy Imob";
    const captadorName = exclusivity?.captadorName || "";

    const today = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const fmtBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

    // Formatar visitas — cada visita em bloco: Data | Horário | Corretor | Cliente | Parceiro? + Feedback abaixo
    const visitsHtml = (property.visitRecords || []).map((visit: any) => {
      const d = new Date(visit.visitDate);
      const data = d.toLocaleDateString("pt-BR");
      const horario = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const broker = visit.brokerId ? brokerMap[visit.brokerId] : null;
      const isPartner = broker?.role === "PARCEIRO_EXTERNO";
      return `
      <tr>
        <td>${data}</td>
        <td>${horario}</td>
        <td>${visit.brokerName || broker?.name || "-"}</td>
        <td>${visit.clientName || "-"}</td>
        <td><span class="badge ${isPartner ? "badge-yes" : "badge-no"}">${isPartner ? "Sim" : "Não"}</span></td>
      </tr>
      <tr class="feedback-row">
        <td colspan="5"><strong>Feedback:</strong> ${visit.feedback || "—"}</td>
      </tr>`;
    }).join("") || '<tr><td colspan="5" class="empty">Nenhuma visita registrada no período</td></tr>';

    // Formatar propostas — Data | Corretor | Cliente | Parceiro? | Valor | Status
    const proposalsHtml = (property.proposals || []).map((proposal: any) => `
      <tr>
        <td>${new Date(proposal.createdAt).toLocaleDateString("pt-BR")}</td>
        <td>${proposal.partnerBrokerName || "-"}</td>
        <td>${proposal.clientName || "-"}</td>
        <td><span class="badge ${proposal.hasPartnerBroker ? "badge-yes" : "badge-no"}">${proposal.hasPartnerBroker ? "Sim" : "Não"}</span></td>
        <td>${fmtBRL(proposal.proposedValue)}</td>
        <td><span class="status status-${(proposal.status || "PENDENTE").toLowerCase()}">${proposal.status || "PENDENTE"}</span></td>
      </tr>
    `).join("") || '<tr><td colspan="6" class="empty">Nenhuma proposta recebida no período</td></tr>';

    // Tempo de anúncio e gestão
    const tempoAnuncio = daysOnMarket;
    const tempoGestao = exclusivity?.startDate
      ? Math.ceil((new Date().getTime() - new Date(exclusivity.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Mídias de exposição
    const ex: any = exclusivity || {};
    const sn = (b: boolean) => b ? '<span class="badge badge-yes">Sim</span>' : '<span class="badge badge-no">Não</span>';
    const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString("pt-BR") : "";
    // Portais onde o imóvel está anunciado
    const PORTAL_LABELS: Record<string, string> = {
      zap: "Zap Imóveis", vivareal: "Viva Real", olx: "OLX", grupozap: "Grupo ZAP",
      imovelweb: "Imóvel Web", mercadolivre: "Mercado Livre", chavesnamao: "Chaves na Mão",
      atria: "Atria", dreamcasa: "Dream Casa", trovit: "Trovit",
    };
    const activePortals = (property.activePortals || []) as string[];
    const portaisHtml = activePortals.length > 0
      ? activePortals.map((pid) => `<span class="portal-chip">${PORTAL_LABELS[pid] || pid}</span>`).join("")
      : '<span style="color:#94a3b8;font-size:9pt;">Nenhum portal ativo</span>';

    const midiasHtml = `
      <div class="midia-grid">
        <div class="midia-item"><span>Visualizações no site</span><strong>${totalViews}</strong></div>
        <div class="midia-item"><span>Tempo de anúncio</span><strong>${tempoAnuncio} dia(s)</strong></div>
        <div class="midia-item"><span>Tempo de gestão</span><strong>${tempoGestao != null ? `${tempoGestao} dia(s)` : "—"}</strong></div>
        <div class="midia-item"><span>Fotos profissionais</span>${sn(ex.midiaFotosProf)}</div>
        <div class="midia-item"><span>Vídeo profissional</span>${sn(ex.midiaVideoProf)}</div>
        <div class="midia-item"><span>Meta Ads (Facebook/Instagram)</span>${sn(ex.midiaMetaAds)}</div>
        <div class="midia-item"><span>Google Ads</span>${sn(ex.midiaGoogleAds)}</div>
        <div class="midia-item"><span>Now House${ex.midiaNowHouse && ex.midiaNowHouseDate ? ` — ${fmtDate(ex.midiaNowHouseDate)}` : ""}</span>${sn(ex.midiaNowHouse)}</div>
        <div class="midia-item"><span>Open House${ex.midiaOpenHouse && ex.midiaOpenHouseDate ? ` — ${fmtDate(ex.midiaOpenHouseDate)}` : ""}</span>${sn(ex.midiaOpenHouse)}</div>
      </div>
      <div style="margin-top:12px;">
        <p style="font-size:9pt;font-weight:600;color:#475569;margin-bottom:6px;">Portais imobiliários ativos:</p>
        <div class="portal-chips">${portaisHtml}</div>
      </div>`;
    const periodoLabel = (filtroIni || filtroFim)
      ? `Período: ${filtroIni ? new Date(filtroIni).toLocaleDateString("pt-BR") : "início"} a ${filtroFim ? new Date(filtroFim).toLocaleDateString("pt-BR") : "hoje"}`
      : "Período: todos os registros";

    // Ações realizadas (checklist items)
    const checklistItems = [
      { key: "contrato_assinado", label: "Contrato de Exclusividade Assinado", icon: "📄" },
      { key: "fotos_profissionais", label: "Sessão de Fotos Profissionais", icon: "📸" },
      { key: "video_drone", label: "Vídeo com Drone", icon: "🎬" },
      { key: "tour_virtual", label: "Tour Virtual 360°", icon: "🔄" },
      { key: "destaque_site", label: "Destaque no Site", icon: "🌐" },
      { key: "destaque_portais", label: "Destaque nos Portais", icon: "🏠" },
      { key: "redes_sociais", label: "Campanha nas Redes Sociais", icon: "📱" },
      { key: "email_marketing", label: "Disparo de E-mail Marketing", icon: "📧" },
      { key: "placa_exclusiva", label: "Placa de Exclusividade", icon: "🪧" },
    ];

    const actionsHtml = checklistItems.map(item => `
      <div class="action-item ${checklist[item.key] ? 'done' : 'pending'}">
        <span class="action-icon">${item.icon}</span>
        <span class="action-label">${item.label}</span>
        <span class="action-status">${checklist[item.key] ? '✅' : '⏳'}</span>
      </div>
    `).join("");

    const isExclusive = !!exclusivity;

    // Marketing actions — expanded list per task 5
    const marketingActions = [
      { key: "fotos_profissionais", label: "Material Profissional", icon: "📸" },
      { key: "video_drone", label: "Know House", icon: "🎬" },
      { key: "placa_exclusiva", label: "Placa Tappy", icon: "🪧" },
      { key: "redes_sociais", label: "Feed Instagram (Orgânico)", icon: "📱" },
      { key: "trafego_meta", label: "Tráfego Meta Ads", icon: "🎯" },
      { key: "destaque_portais", label: "Portais Imobiliários", icon: "🏠" },
      { key: "rede_parcerias", label: "Rede Parcerias", icon: "🤝" },
      { key: "gestao_exclusividade", label: "Gestão de Exclusividade", icon: "🔑" },
      { key: "email_marketing", label: "E-mail Marketing", icon: "📧" },
    ];

    const marketingHtml = marketingActions.map(item => `
      <div class="action-item ${checklist[item.key] ? 'done' : 'pending'}">
        <span class="action-icon">${item.icon}</span>
        <span class="action-label">${item.label}</span>
        <span class="action-status">${checklist[item.key] ? '✅' : '⏳'}</span>
      </div>
    `).join("");

    const siteUrl = `https://tappyimob.com.br/imovel/${property.slug || property.id}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório${isExclusive ? ' de Exclusividade' : ''} - ${propertyCode}</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 30px;
      max-width: 900px;
      margin: 0 auto;
      background: #f1f3f5;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #0B2545 0%, #2a5280 100%);
      color: white;
      padding: 30px;
      position: relative;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo img {
      height: 36px;
      width: auto;
    }
    .logo-text {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: -0.5px;
    }
    .report-date {
      font-size: 10pt;
      opacity: 0.9;
      text-align: right;
    }
    .property-title {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .property-code {
      font-size: 11pt;
      opacity: 0.9;
    }
    .property-address {
      font-size: 10pt;
      opacity: 0.8;
      margin-top: 5px;
    }
    .site-link {
      display: inline-block;
      margin-top: 10px;
      padding: 6px 16px;
      background: rgba(255,255,255,0.15);
      border-radius: 6px;
      color: white;
      font-size: 9pt;
      text-decoration: none;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .site-link:hover {
      background: rgba(255,255,255,0.25);
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      padding: 20px 30px;
      background: #f8f9fa;
      border-bottom: 1px solid #e5e7eb;
    }
    .stat-card {
      background: white;
      padding: 15px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .stat-value {
      font-size: 24pt;
      font-weight: bold;
      color: #0B2545;
    }
    .stat-label {
      font-size: 9pt;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 25px 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #0B2545;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #25D366;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .info-card {
      background: #f9fafb;
      padding: 12px 15px;
      border-radius: 10px;
      border-left: 3px solid #25D366;
    }
    .info-label {
      font-size: 9pt;
      color: #6b7280;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 12pt;
      font-weight: 600;
      color: #1f2937;
    }
    .progress-bar {
      background: #e5e7eb;
      height: 10px;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress-fill {
      background: linear-gradient(90deg, #0B2545, #25D366);
      height: 100%;
      border-radius: 5px;
      transition: width 0.3s;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }
    th {
      background: #0B2545;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      color: white;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f3f4f6;
    }
    tr:hover {
      background: #fafafa;
    }
    .empty {
      text-align: center;
      color: #9ca3af;
      font-style: italic;
    }
    .rating {
      color: #fbbf24;
    }
    .status {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: 600;
    }
    .status-pendente { background: #fef3c7; color: #d97706; }
    .status-aceita { background: #d1fae5; color: #059669; }
    .status-recusada { background: #fee2e2; color: #dc2626; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 8pt; font-weight: 700; }
    .badge-yes { background: #d1fae5; color: #059669; }
    .badge-no { background: #f1f5f9; color: #64748b; }
    .feedback-row td { background: #f8fafc; font-size: 9pt; color: #475569; padding-top: 4px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .midia-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .midia-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 9.5pt; }
    .midia-item span { color: #475569; }
    .midia-item strong { color: #0B2545; }
    .portal-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .portal-chip { display: inline-block; padding: 3px 12px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 8.5pt; font-weight: 600; }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 10pt;
    }
    .action-item.done {
      background: #d1fae5;
    }
    .action-item.pending {
      background: #f3f4f6;
    }
    .action-icon {
      font-size: 14pt;
    }
    .action-label {
      flex: 1;
    }
    .message-box {
      background: linear-gradient(135deg, #eef2f7 0%, #f7ece7 100%);
      padding: 20px;
      border-radius: 12px;
      margin-top: 20px;
    }
    .message-title {
      font-weight: bold;
      color: #0B2545;
      margin-bottom: 8px;
    }
    .message-text {
      color: #4b5563;
      font-size: 10pt;
    }
    .footer {
      background: #0B2545;
      color: white;
      padding: 25px 30px;
      text-align: center;
    }
    .footer p {
      font-size: 9pt;
      color: rgba(255,255,255,0.7);
    }
    .footer-brand {
      font-size: 14pt;
      font-weight: bold;
      color: white;
      margin-bottom: 6px;
    }
    .footer-tagline {
      font-size: 10pt;
      color: #25D366;
      margin-bottom: 12px;
    }
    .contact-info {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 10px;
    }
    .contact-item {
      font-size: 10pt;
      color: rgba(255,255,255,0.8);
    }
    .footer-divider {
      width: 60px;
      height: 2px;
      background: #25D366;
      margin: 12px auto;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #0B2545;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(11, 37, 69, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .print-button:hover {
      background: #162d4a;
    }
    @media print {
      .print-button {
        display: none;
      }
      body {
        padding: 0;
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

  <div class="container">
    <div class="header">
      <div class="header-top">
        <div class="logo">
          <img src="https://tappyimob.com.br/favicon.png" alt="Tappy Imob" onerror="this.style.display='none'" />
          <span class="logo-text">Tappy Imob</span>
        </div>
        <div class="report-date">
          <strong>Relatório${isExclusive ? ' de Exclusividade' : ' do Imóvel'}</strong><br>
          ${today}
        </div>
      </div>
      <div class="property-title">${property.title || "Imóvel"}</div>
      <div class="property-code">Código: ${propertyCode} ${propertyValue !== 'Sob consulta' ? `• ${propertyValue}` : ''}</div>
      <div class="property-address">📍 ${propertyAddress}</div>
      <a href="${siteUrl}" class="site-link" target="_blank">🔗 Ver no site</a>
    </div>

    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-value">${totalViews.toLocaleString()}</div>
        <div class="stat-label">Visualizações</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalVisits}</div>
        <div class="stat-label">Visitas Realizadas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalProposals}</div>
        <div class="stat-label">Propostas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${daysOnMarket}</div>
        <div class="stat-label">Dias no Mercado</div>
      </div>
    </div>

    <div class="content">
      <!-- Equipe Responsável -->
      <div class="section">
        <div class="section-title">� Equipe Responsável</div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Gestor</div>
            <div class="info-value">${gestorName}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Corretor Captador</div>
            <div class="info-value">${captadorName || '-'}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Dias no Mercado</div>
            <div class="info-value">${daysOnMarket} dias</div>
          </div>
        </div>
      </div>

      ${isExclusive ? `
      <!-- Informações Exclusividade -->
      <div class="section">
        <div class="section-title">📋 Informações da Exclusividade</div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Período</div>
            <div class="info-value">${startDate} a ${endDate}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Dias Restantes</div>
            <div class="info-value" style="color: ${daysRemaining && daysRemaining <= 15 ? '#dc2626' : '#059669'}">
              ${daysRemaining !== null ? `${daysRemaining} dias` : '-'}
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">Onboarding</div>
            <div class="info-value">${checklistProgress}% concluído</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${checklistProgress}%"></div>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Ações de Marketing -->
      <div class="section">
        <div class="section-title">✅ Ações de Marketing</div>
        <div class="actions-grid">
          ${marketingHtml}
        </div>
      </div>

      <!-- Período + Mídias de exposição -->
      <div class="section">
        <div class="section-title">📡 Exposição e Mídias</div>
        <p style="font-size:9pt;color:#64748b;margin-bottom:10px;">${periodoLabel}</p>
        ${midiasHtml}
      </div>

      <!-- Visitas -->
      <div class="section">
        <div class="section-title">👥 Visitas</div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Corretor</th>
              <th>Cliente</th>
              <th>Corretor Parceiro?</th>
            </tr>
          </thead>
          <tbody>
            ${visitsHtml}
          </tbody>
        </table>
      </div>

      <!-- Propostas -->
      <div class="section">
        <div class="section-title">💰 Propostas Recebidas</div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Corretor</th>
              <th>Cliente</th>
              <th>Parceiro?</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${proposalsHtml}
          </tbody>
        </table>
      </div>

      <!-- Mensagem ao Proprietário -->
      <div class="message-box">
        <div class="message-title">💬 Mensagem da Equipe</div>
        <div class="message-text">
          Prezado(a) ${ownerName}, estamos trabalhando ativamente na divulgação e comercialização do seu imóvel. 
          ${totalVisits > 0 ? `Já realizamos ${totalVisits} visita(s) com potenciais compradores. ` : ''}
          ${totalProposals > 0 ? `Recebemos ${totalProposals} proposta(s) que estamos analisando. ` : ''}
          Continuamos empenhados em encontrar o melhor negócio para você. Qualquer dúvida, estamos à disposição!
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">Tappy Imob</div>
      <div class="footer-tagline">Especialistas em Sua Cidade e Região</div>
      <div class="footer-divider"></div>
      <div class="contact-info">
        <span class="contact-item">📞 ${CONTATO.telefone}</span>
        <span class="contact-item">📧 comercial@tappyimob.com.br</span>
        <span class="contact-item">🌐 tappyimob.com.br</span>
      </div>
      <p style="margin-top: 12px;">Av. Sagitário, 138 - Sala 913 - Torre City, Sua Cidade Conde II - Barueri/SP</p>
      <p style="margin-top: 4px;">CRECI-J: 35438-J | CNPJ: 34.469.865/0001-13</p>
      <p style="margin-top: 8px; font-size: 8pt;">Código: ${propertyCode} | Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
    </div>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
