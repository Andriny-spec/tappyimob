import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Gerar contrato de exclusividade em HTML (para impressão/PDF)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar dados do imóvel e exclusividade
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        propertyOwner: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    const exclusivity = await prisma.propertyExclusivity.findUnique({
      where: { propertyId: id },
    });

    // Dados do proprietário
    const owner = property.propertyOwner;
    const ownerName = owner?.name || "[NOME DO PROPRIETÁRIO]";
    const ownerCpf = owner?.cpf || "[CPF]";
    const ownerRg = owner?.rg || "[RG]";
    const ownerAddress = owner?.residentialAddress || "[ENDEREÇO]";
    const ownerPhone = owner?.phones?.[0] || "[TELEFONE]";
    const ownerEmail = owner?.email || "[EMAIL]";

    // Dados do imóvel
    const propertyAddress = `${property.address || ""}, ${property.number || ""} ${property.complement || ""} - ${property.neighborhood || ""}, ${property.city || ""} - ${property.state || ""}`.trim();
    const propertyCode = property.code || property.id.slice(0, 8).toUpperCase();
    const propertyValue = property.price
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(property.price)
      : "[VALOR]";

    // Dados da exclusividade
    const startDate = exclusivity?.startDate
      ? new Date(exclusivity.startDate).toLocaleDateString("pt-BR")
      : "[DATA INÍCIO]";
    const endDate = exclusivity?.endDate
      ? new Date(exclusivity.endDate).toLocaleDateString("pt-BR")
      : "[DATA TÉRMINO]";
    const comissaoVenda = exclusivity?.comissaoVenda || 6;
    const valorMinimo = exclusivity?.valorMinimo
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(exclusivity.valorMinimo)
      : propertyValue;
    const condicoesEspeciais = exclusivity?.condicoesEspeciais || "";
    const captadorName = exclusivity?.captadorName || "[NOME DO CORRETOR]";
    const gestorName = exclusivity?.gestorName || "[NOME DO GESTOR]";

    const today = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Marcar contrato como gerado
    if (exclusivity) {
      await prisma.propertyExclusivity.update({
        where: { id: exclusivity.id },
        data: { contratoGerado: true },
      });
    }

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato de Exclusividade - ${propertyCode}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header h2 {
      font-size: 14pt;
      font-weight: normal;
      color: #555;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    .clause {
      margin-bottom: 15px;
      text-align: justify;
    }
    .clause-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .highlight {
      background-color: #fffde7;
      padding: 2px 5px;
      font-weight: bold;
    }
    .signatures {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }
    .signature-box {
      flex: 1;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 10px;
    }
    .signature-name {
      font-weight: bold;
    }
    .signature-role {
      font-size: 10pt;
      color: #666;
    }
    .witnesses {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }
    .witness-box {
      flex: 1;
    }
    .witness-line {
      border-top: 1px solid #333;
      margin-top: 40px;
      padding-top: 5px;
      font-size: 10pt;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10pt;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 15px;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #7c3aed;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .print-button:hover {
      background: #6d28d9;
    }
    @media print {
      .print-button {
        display: none;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

  <div class="header">
    <h1>Contrato de Exclusividade</h1>
    <h2>Intermediação Imobiliária</h2>
  </div>

  <div class="section">
    <p class="clause">
      Pelo presente instrumento particular, de um lado <span class="highlight">${ownerName}</span>, 
      inscrito(a) no CPF sob o nº <span class="highlight">${ownerCpf}</span>, 
      RG nº <span class="highlight">${ownerRg}</span>, 
      residente e domiciliado(a) em <span class="highlight">${ownerAddress}</span>, 
      telefone <span class="highlight">${ownerPhone}</span>, 
      e-mail <span class="highlight">${ownerEmail}</span>, 
      doravante denominado(a) <strong>CONTRATANTE/PROPRIETÁRIO</strong>;
    </p>
    <p class="clause" style="margin-top: 15px;">
      E de outro lado, a empresa <strong>TAPPY IMOB LTDA</strong>, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, 
      com sede na cidade de São Paulo/SP, representada neste ato por <span class="highlight">${captadorName}</span>, 
      CRECI nº XXXXX, doravante denominada <strong>CONTRATADA/IMOBILIÁRIA</strong>;
    </p>
    <p class="clause" style="margin-top: 15px;">
      Têm entre si justo e contratado o presente <strong>CONTRATO DE EXCLUSIVIDADE PARA INTERMEDIAÇÃO IMOBILIÁRIA</strong>, 
      que se regerá pelas cláusulas e condições seguintes:
    </p>
  </div>

  <div class="section">
    <p class="section-title">Cláusula 1ª - Do Objeto</p>
    <p class="clause">
      O presente contrato tem por objeto a intermediação imobiliária com exclusividade para a venda do imóvel 
      situado em <span class="highlight">${propertyAddress}</span>, 
      Código de Referência <span class="highlight">${propertyCode}</span>, 
      de propriedade do CONTRATANTE.
    </p>
  </div>

  <div class="section">
    <p class="section-title">Cláusula 2ª - Do Prazo</p>
    <p class="clause">
      O presente contrato terá vigência de <span class="highlight">${startDate}</span> 
      a <span class="highlight">${endDate}</span>, podendo ser renovado por igual período 
      mediante acordo entre as partes.
    </p>
  </div>

  <div class="section">
    <p class="section-title">Cláusula 3ª - Do Valor e Comissão</p>
    <p class="clause">
      O imóvel objeto deste contrato será comercializado pelo valor mínimo de <span class="highlight">${valorMinimo}</span>, 
      podendo este valor ser alterado mediante autorização expressa do CONTRATANTE.
    </p>
    <p class="clause">
      A comissão devida à CONTRATADA pela intermediação será de <span class="highlight">${comissaoVenda}%</span> 
      (${comissaoVenda === 6 ? "seis" : comissaoVenda} por cento) sobre o valor da venda, 
      a ser paga pelo CONTRATANTE no ato da assinatura do contrato de compra e venda ou da escritura pública.
    </p>
  </div>

  <div class="section">
    <p class="section-title">Cláusula 4ª - Da Exclusividade</p>
    <p class="clause">
      Durante a vigência deste contrato, o CONTRATANTE concede à CONTRATADA exclusividade total para a 
      intermediação do imóvel descrito, comprometendo-se a:
    </p>
    <p class="clause" style="padding-left: 20px;">
      a) Não negociar o imóvel diretamente ou por intermédio de terceiros;<br>
      b) Facilitar as visitas ao imóvel mediante agendamento prévio;<br>
      c) Fornecer toda documentação necessária para a comercialização;<br>
      d) Informar à CONTRATADA qualquer contato de interessados.
    </p>
  </div>

  <div class="section">
    <p class="section-title">Cláusula 5ª - Das Obrigações da Contratada</p>
    <p class="clause">
      A CONTRATADA se compromete a:
    </p>
    <p class="clause" style="padding-left: 20px;">
      a) Realizar sessão fotográfica profissional do imóvel;<br>
      b) Divulgar o imóvel nos principais portais imobiliários;<br>
      c) Realizar campanhas de marketing digital;<br>
      d) Instalar placa de "VENDE-SE" no imóvel (quando autorizado);<br>
      e) Enviar relatórios periódicos sobre as ações realizadas;<br>
      f) Acompanhar todas as visitas com corretores credenciados;<br>
      g) Assessorar na negociação e documentação até a conclusão da venda.
    </p>
  </div>

  ${condicoesEspeciais ? `
  <div class="section">
    <p class="section-title">Cláusula 6ª - Condições Especiais</p>
    <p class="clause">${condicoesEspeciais}</p>
  </div>
  ` : ""}

  <div class="section">
    <p class="section-title">Cláusula ${condicoesEspeciais ? "7ª" : "6ª"} - Do Foro</p>
    <p class="clause">
      Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas oriundas do presente contrato, 
      com renúncia expressa a qualquer outro, por mais privilegiado que seja.
    </p>
  </div>

  <p class="clause" style="margin-top: 30px; text-align: center;">
    E, por estarem assim justos e contratados, firmam o presente instrumento em 02 (duas) vias de igual 
    teor e forma, na presença das testemunhas abaixo.
  </p>

  <p style="text-align: center; margin-top: 30px; font-weight: bold;">
    São Paulo, ${today}
  </p>

  <div class="signatures">
    <div class="signature-box">
      <div class="signature-line">
        <p class="signature-name">${ownerName}</p>
        <p class="signature-role">CONTRATANTE/PROPRIETÁRIO</p>
        <p class="signature-role">CPF: ${ownerCpf}</p>
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-line">
        <p class="signature-name">${captadorName}</p>
        <p class="signature-role">CONTRATADA/IMOBILIÁRIA</p>
        <p class="signature-role">CRECI: XXXXX</p>
      </div>
    </div>
  </div>

  <div class="witnesses">
    <div class="witness-box">
      <div class="witness-line">
        <p>Testemunha 1</p>
        <p>Nome: _________________________</p>
        <p>CPF: __________________________</p>
      </div>
    </div>
    <div class="witness-box">
      <div class="witness-line">
        <p>Testemunha 2</p>
        <p>Nome: _________________________</p>
        <p>CPF: __________________________</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Documento gerado automaticamente pelo sistema Tappy Imob</p>
    <p>Código do Imóvel: ${propertyCode} | Data de geração: ${new Date().toLocaleString("pt-BR")}</p>
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
    console.error("Erro ao gerar contrato:", error);
    return NextResponse.json({ error: "Erro ao gerar contrato" }, { status: 500 });
  }
}
