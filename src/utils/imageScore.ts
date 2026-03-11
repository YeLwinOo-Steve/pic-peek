import type { ImageData } from "@/types/image";

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function scoreBest(images: ImageData[]): string | null {
  if (images.length < 2) return null;
  let bestId = "";
  let bestScore = -1;
  for (const img of images) {
    const megapixels = (img.width * img.height) / 1e6;
    const sizeEfficiency = megapixels / (img.sizeKB / 1024 || 1);
    const score = megapixels * 0.5 + sizeEfficiency * 0.5;
    if (score > bestScore) {
      bestScore = score;
      bestId = img.id;
    }
  }
  return bestId;
}
