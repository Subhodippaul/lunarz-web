// app/api/drive-image/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const res = await fetch(
    `https://drive.google.com/uc?export=download&id=${id}`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    }
  );

  if (!res.ok) return new Response("Failed to fetch image", { status: res.status });

  const contentType = res.headers.get("content-type") ?? "image/jpeg";

  // If Google returns HTML (virus-scan confirmation page), handle confirm token
  if (contentType.includes("text/html")) {
    const html = await res.text();
    const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/);
    if (!confirmMatch) return new Response("Drive access denied", { status: 403 });

    const confirmed = await fetch(
      `https://drive.google.com/uc?export=download&id=${id}&confirm=${confirmMatch[1]}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" }
    );

    if (!confirmed.ok) return new Response("Confirmation failed", { status: confirmed.status });

    return new Response(confirmed.body, {
      headers: {
        "Content-Type": confirmed.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}