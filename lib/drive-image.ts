const DRIVE_FILE_RE  = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_OPEN_RE  = /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
const DRIVE_UC_RE    = /https:\/\/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/;
const DRIVE_THUMB_RE = /https:\/\/drive\.google\.com\/thumbnail\?.*id=([a-zA-Z0-9_-]+)/;
const PROXY_RE       = /^\/api\/drive-image\?id=([a-zA-Z0-9_-]+)/;
const LH3_RE         = /https:\/\/lh3\.googleusercontent\.com/;

export function extractDriveId(url: string): string | null {
  if (!url) return null;
  const m = url.match(DRIVE_FILE_RE) || url.match(DRIVE_OPEN_RE) ||
            url.match(DRIVE_UC_RE)   || url.match(DRIVE_THUMB_RE) ||
            url.match(PROXY_RE);
  return m ? m[1] : null;
}

export function toDriveImageUrl(url: string): string {
  if (!url) return url;
  if (LH3_RE.test(url)) return url;           // signed lh3 — pass through
  const id = extractDriveId(url);
  if (!id) return url;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
}

export function isDriveUrl(url: string): boolean {
  return LH3_RE.test(url) || extractDriveId(url) !== null;
}