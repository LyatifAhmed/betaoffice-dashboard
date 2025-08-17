// app/api/mail/open/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE || process.env.BACKEND_BASE || "http://localhost:8001"; // örnek

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const itemId = params.id;
  // external_id: cookie’den; yoksa query’den
  const cookieExt = req.cookies.get("external_id")?.value;
  const urlObj = new URL(req.url);
  const qExt = urlObj.searchParams.get("external_id");
  const externalId = cookieExt || qExt;

  if (!externalId) {
    return NextResponse.json({ error: "external_id missing" }, { status: 400 });
  }

  const url = `${BACKEND_BASE}/mail/open/${encodeURIComponent(itemId)}?external_id=${encodeURIComponent(externalId)}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    return NextResponse.json({ error: txt || "backend_error" }, { status: r.status });
  }
  const data = await r.json();
  return NextResponse.json(data);
}
