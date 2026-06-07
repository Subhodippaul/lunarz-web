/**
 * Google Drive image URL utilities.
 *
 * When an admin pastes a Google Drive share link such as:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/open?id=FILE_ID
 *
 * it cannot be used directly as an <img src> — the browser just loads an
 * HTML page, not a raw image.  We convert it to the thumbnail URL:
 *   https://drive.google.com/thumbnail?id=FILE_ID&sz=w800
 *
 * which Google serves as the actual image bytes reliably for publicly
 * shared files (no virus-scan warning page unlike the uc?export=download URL).
 *
 * Note: the file must be shared publicly ("Anyone with the link can view").
 */

const DRIVE_FILE_RE =
  /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_OPEN_RE =
  /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
const DRIVE_UC_RE =
  /https:\/\/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/;
const DRIVE_THUMBNAIL_RE =
  /https:\/\/drive\.google\.com\/thumbnail\?.*id=([a-zA-Z0-9_-]+)/;
// Already-proxied URLs stored in DB from a previous version of the modal
const PROXY_RE =
  /^\/api\/drive-image\?id=([a-zA-Z0-9_-]+)/;

/**
 * Given any string, return the Google Drive file ID if the URL matches a
 * known Drive pattern, otherwise return null.
 */
export function extractDriveId(url: string): string | null {
  if (!url) return null;
  const m =
    url.match(DRIVE_FILE_RE) ||
    url.match(DRIVE_OPEN_RE) ||
    url.match(DRIVE_UC_RE) ||
    url.match(DRIVE_THUMBNAIL_RE);
  return m ? m[1] : null;
}

/**
 * Convert a Google Drive share URL to a direct thumbnail URL.
 * - Raw Drive share links  → https://drive.google.com/thumbnail?id=FILE_ID&sz=w800
 * - Already-proxied URLs   → converted to thumbnail URL
 * - Already thumbnail URLs → returned unchanged
 * - Any other URL          → returned unchanged
 */
export function toDriveImageUrl(url: string): string {
  if (!url) return url;

  // Already a thumbnail URL — pass through as-is
  if (DRIVE_THUMBNAIL_RE.test(url)) return url;

  // Old proxy URL — extract ID and convert to thumbnail
  const proxyMatch = url.match(PROXY_RE);
  if (proxyMatch) {
    return `https://drive.google.com/thumbnail?id=${proxyMatch[1]}&sz=w800`;
  }

  const id = extractDriveId(url);
  if (!id) return url;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
}

/**
 * Returns true if the given URL is any kind of Google Drive link
 * (raw share link OR already-proxied OR thumbnail).
 */
export function isDriveUrl(url: string): boolean {
  return (
    PROXY_RE.test(url) ||
    DRIVE_THUMBNAIL_RE.test(url) ||
    extractDriveId(url) !== null
  );
}
