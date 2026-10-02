import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 60; // regenera no máximo a cada 1 min
export const alt = "Galeria Tappy Summit 2026 — Fotos do evento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Pega até 6 fotos publicadas para montar o mosaico
  let photos: { url: string }[] = [];
  try {
    photos = await prisma.tappyGalleryPhoto.findMany({
      where: { isPublished: true, galeriaId: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: { url: true },
    });
  } catch (err) {
    console.error("[og:tappy-galeria] erro ao buscar fotos:", err);
  }

  // Layout: header com título + grid 3x2 de fotos
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #06142A 0%, #132845 50%, #0B2545 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px",
            background: "rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 18,
                color: "#25D366",
                letterSpacing: 4,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Tappy Summit 2026
            </span>
            <span
              style={{
                fontSize: 56,
                fontWeight: 800,
                lineHeight: 1.05,
                marginTop: 8,
              }}
            >
              Galeria do Evento
            </span>
            <span
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.75)",
                marginTop: 10,
              }}
            >
              {photos.length > 0
                ? `${photos.length}+ fotos · acesse e baixe`
                : "Aponte sua câmera ao QR e acesse"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "14px 22px",
              borderRadius: 999,
              border: "2px solid rgba(37, 211, 102,0.6)",
              background: "rgba(37, 211, 102,0.12)",
              fontSize: 22,
              fontWeight: 700,
              color: "#25D366",
            }}
          >
            tappyimob.com.br
          </div>
        </div>

        {/* Grid de fotos */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: 6,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          {photos.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              📷 Em breve
            </div>
          ) : (
            photos.slice(0, 6).map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: 392,
                  height: 234,
                  background: "#06142A",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img
                  src={p.url}
                  width="100%"
                  height="100%"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
