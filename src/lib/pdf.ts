/**
 * Geração de PDF via navegador headless.
 *
 * Em produção (Docker) usamos o **Chromium instalado no sistema**
 * (apk add chromium → /usr/bin/chromium). O pacote `@sparticuz/chromium`,
 * voltado a ambientes serverless, tem sua pasta `bin/` (com o Chromium
 * compactado em brotli) **removida pelo file-tracing do build standalone do
 * Next**, o que causava o erro:
 *   "The input directory .../@sparticuz/chromium/bin does not exist"
 *
 * Por isso preferimos o binário do sistema e mantemos o @sparticuz apenas como
 * fallback (ex.: deploy serverless). Se nenhum estiver disponível, lança um erro
 * claro para quem chamou tratar (ex.: devolver o HTML).
 */
import { existsSync } from "fs";

function findSystemChromium(): string | null {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ].filter(Boolean) as string[];
  return candidates.find((p) => existsSync(p)) || null;
}

/**
 * Lança um navegador headless pronto para `page.pdf()`. Lembre-se de chamar
 * `browser.close()` num finally.
 */
export async function launchPdfBrowser() {
  const puppeteer = (await import("puppeteer-core")).default;

  const systemPath = findSystemChromium();
  if (systemPath) {
    return puppeteer.launch({
      headless: true,
      executablePath: systemPath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });
  }

  // Fallback serverless (@sparticuz/chromium).
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
  });
}
