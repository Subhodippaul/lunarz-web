// app/api/drive-image/route.ts
// Legacy proxy route — kept for backward compatibility with any old URLs
// that may still be stored in the database as /api/drive-image?id=FILE_ID.
// New code uses the thumbnail URL directly via toDriveImageUrl() in drive-image.ts.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  // Use the thumbnail endpoint — much more reliable than uc?export=download
  // which triggers Google's virus-scan HTML page for larger files.
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;

  const res = await fetch(thumbnailUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    redirect: "follow",
  });

  if (!res.ok) return new Response("Failed to fetch image", { status: res.status });

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/jpeg";

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400", // cache 24h to avoid re-fetching
    },
  });
}
