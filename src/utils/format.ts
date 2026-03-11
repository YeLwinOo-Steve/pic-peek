export function fmtMaybeNumber(n: unknown, digits = 0): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return n.toFixed(digits);
}

export function getFormatFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif",
    "image/bmp": "bmp",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
  };
  const base = contentType.split(";")[0].trim().toLowerCase();
  return map[base] || "unknown";
}
