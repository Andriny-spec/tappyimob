import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/tappysummit/track - Track page views and clicks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, type, target } = body;

    if (!page || !type) {
      return NextResponse.json({ error: "Missing page or type" }, { status: 400 });
    }

    const allowedTypes = [
      "pageview",
      "click_cta",
      "click_whatsapp",
      "click_instagram",
      "click_property",
      "click_team",
      "click_nav",
      "form_start",
      "form_submit",
    ];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const params = new URL(req.url).searchParams;
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || null;

    await prisma.eventPageView.create({
      data: {
        page,
        type,
        target: target ? String(target).substring(0, 255) : null,
        referrer: req.headers.get("referer") || null,
        utmSource: params.get("utm_source") || body.utmSource || null,
        utmMedium: params.get("utm_medium") || body.utmMedium || null,
        utmCampaign: params.get("utm_campaign") || body.utmCampaign || null,
        userAgent: req.headers.get("user-agent")?.substring(0, 255) || null,
        ip: ip?.substring(0, 45) || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json({ ok: true }); // Don't fail silently
  }
}
