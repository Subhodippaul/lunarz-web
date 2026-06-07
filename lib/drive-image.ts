export function toDriveImageUrl(url: string): string {
  return url; // just return as-is — Cloudinary URLs work directly
}

export function isDriveUrl(url: string): boolean {
  return url.includes("cloudinary.com");
}

export function isGooglePhotosUrl(url: string): boolean {
  return false; // no longer needed
}

export function isSupportedImageUrl(url: string): boolean {
  return url.includes("cloudinary.com");
}