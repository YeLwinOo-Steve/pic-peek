import { Card, CardContent } from "@/components/ui/card";

import { useEffect, useMemo, useState } from "react";
import { X, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageHealthScore } from "@/components/ImageHealthScore";

export interface ImageData {
  id: string;
  url: string;
  width: number;
  height: number;
  sizeKB: number;
  aspectRatio: string;
  format: string;
  /** Optional display name (e.g. file name or URL basename). */
  fileName?: string;
  bitDepth?: string;
  dpi?: string;
  colorSpace?: string;
  hasAlpha?: boolean;
  histogram?: string;
  focalLength?: string;
  timestamp?: string;
  exifOrientation?: string;
}

interface ImageCardProps {
  image: ImageData;
  allImages: ImageData[];
  showAdvanced: boolean;
  isBest: boolean;
  onRemove: (id: string) => void;
}

function getBestFlags(image: ImageData, allImages: ImageData[]) {
  if (allImages.length < 2) return { width: false, height: false, size: false, pixels: false, bytesPerPx: false };
  const maxW = Math.max(...allImages.map((i) => i.width));
  const maxH = Math.max(...allImages.map((i) => i.height));
  const minSize = Math.min(...allImages.map((i) => i.sizeKB));
  const maxPixels = Math.max(...allImages.map((i) => i.width * i.height));
  const pixels = image.width * image.height;
  const bytesPerPx = (image.sizeKB * 1024) / (pixels || 1);
  const minBpp = Math.min(...allImages.map((i) => (i.sizeKB * 1024) / (i.width * i.height || 1)));
  return {
    width: image.width >= maxW,
    height: image.height >= maxH,
    size: image.sizeKB <= minSize,
    pixels: pixels >= maxPixels,
    bytesPerPx: bytesPerPx <= minBpp,
  };
}

type AdvancedInfo =
  | {
      status: "idle" | "loading";
    }
  | {
      status: "unavailable";
      reason: string;
    }
  | {
      status: "ready";
      hasAlpha: boolean;
      dominantColors: string[];
      histogram16: number[];
      lumaMean: number;
      lumaStd: number;
    };

function computeOrientation(width: number, height: number): string {
  if (width === height) return "Square";
  return width > height ? "Landscape" : "Portrait";
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

async function analyzeImagePixels(src: string): Promise<
  | { ok: true; hasAlpha: boolean; dominantColors: string[]; histogram16: number[]; lumaMean: number; lumaStd: number }
  | { ok: false; reason: string }
> {
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image for analysis"));
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { ok: false, reason: "Canvas not available" };

  // Downsample for speed (still enough for dominant colors/histogram)
  const maxDim = 96;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
  canvas.width = w;
  canvas.height = h;

  try {
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    let hasAlpha = false;
    const histogram16 = new Array<number>(16).fill(0);
    const buckets = new Map<string, number>();

    const lumas: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const a = data[i + 3] ?? 255;
      if (a < 255) hasAlpha = true;

      // Luma (Rec. 709)
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lumas.push(y);
      const bin = Math.min(15, Math.floor(y / 16));
      histogram16[bin] = (histogram16[bin] || 0) + 1;

      // Dominant colors via quantized buckets
      const qr = (r >> 4) << 4;
      const qg = (g >> 4) << 4;
      const qb = (b >> 4) << 4;
      const key = rgbToHex(qr, qg, qb);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    const mean = lumas.reduce((s, v) => s + v, 0) / (lumas.length || 1);
    const variance =
      lumas.reduce((s, v) => s + (v - mean) * (v - mean), 0) / (lumas.length || 1);
    const std = Math.sqrt(variance);

    const dominantColors = [...buckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hex]) => hex);

    return { ok: true, hasAlpha, dominantColors, histogram16, lumaMean: mean, lumaStd: std };
  } catch {
    return {
      ok: false,
      reason:
        "Pixel analysis blocked (likely CORS). Try uploading the file instead of using a URL.",
    };
  }
}

const ImageCard = ({ image, allImages, showAdvanced, isBest, onRemove }: ImageCardProps) => {
  const best = getBestFlags(image, allImages);
  const orientation = useMemo(() => {
    if (image.exifOrientation && image.exifOrientation.trim() !== "") {
      return image.exifOrientation;
    }
    return computeOrientation(image.width, image.height);
  }, [image.width, image.height, image.exifOrientation]);
  const [advanced, setAdvanced] = useState<AdvancedInfo>({ status: "idle" });

  useEffect(() => {
    if (!showAdvanced) return;
    let cancelled = false;

    (async () => {
      setAdvanced({ status: "loading" });
      const res = await analyzeImagePixels(image.url);
      if (cancelled) return;
      if (res.ok === false) {
        setAdvanced({ status: "unavailable", reason: res.reason });
        return;
      }
      setAdvanced({
        status: "ready",
        hasAlpha: res.hasAlpha,
        dominantColors: res.dominantColors,
        histogram16: res.histogram16,
        lumaMean: res.lumaMean,
        lumaStd: res.lumaStd,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [showAdvanced, image.url]);

  return (
    <Card className="relative overflow-hidden animate-fade-in group rounded-3xl shadow-none border-2 border-border/40 bg-gradient-to-b from-card to-card/95 ring-1 ring-inset ring-white/10">
      {isBest && (
        <div className="absolute top-2 left-2 z-10">
          <div className="relative px-3 py-1.5 rounded-full bg-gradient-to-b from-[hsl(140,70%,52%)] to-[hsl(150,75%,38%)] border border-[hsl(155,60%,30%)]/50 text-black text-xs font-bold tracking-wide flex items-center gap-1.5 ring-1 ring-inset ring-white/30">
            <ThumbsUp className="h-3.5 w-3.5 text-black" />
            Best
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-background/90 border border-border/60 text-foreground opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        onClick={() => onRemove(image.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="aspect-video flex items-center justify-center overflow-hidden border-b border-border/50 bg-muted">
        <img
          src={image.url}
          alt="Comparison image"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Property label="Width" value={`${image.width}px`} isBest={best.width} />
          <Property label="Height" value={`${image.height}px`} isBest={best.height} />
          <Property label="Size" value={`${image.sizeKB} KB`} isBest={best.size} />
          <Property label="Ratio" value={image.aspectRatio} />
          <Property label="Pixels" value={`${((image.width * image.height) / 1e6).toFixed(2)} MP`} isBest={best.pixels} />
          <Property
            label="Bytes/px"
            value={`${((image.sizeKB * 1024) / (image.width * image.height || 1)).toFixed(2)}`}
            isBest={best.bytesPerPx}
          />
          <Property label="Format" value={image.format.toUpperCase()} />
          <div
            aria-hidden={!showAdvanced}
            className={`col-span-2 overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out will-change-[max-height,opacity,transform] ${
              showAdvanced
                ? "max-h-[520px] opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
            }`.trim()}
          >
            <div className="rounded-xl border border-amber-500/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-foreground">
                  Advanced Properties
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {advanced.status === "loading"
                    ? "Analyzing…"
                    : advanced.status === "unavailable"
                      ? "Unavailable"
                      : ""}
                </div>
              </div>

              <div className="col-span-2 flex flex-col gap-2 text-sm">
                <Property
                  label="Bit Depth"
                  value={image.bitDepth || "Unknown"}
                  tone={image.bitDepth ? "normal" : "muted"}
                />
                <Property
                  label="DPI/PPI"
                  value={image.dpi || "Unknown"}
                  tone={image.dpi ? "normal" : "muted"}
                />
                <Property
                  label="Color Space"
                  value={image.colorSpace || "Unknown"}
                  tone={image.colorSpace ? "normal" : "muted"}
                />
                <Property
                  label="Orientation"
                  value={orientation}
                />
                <Property
                  label="Timestamp"
                  value={image.timestamp || "Unknown"}
                  tone={image.timestamp ? "normal" : "muted"}
                />
                <Property
                  label="Focal Length"
                  value={image.focalLength || "Unknown"}
                  tone={image.focalLength ? "normal" : "muted"}
                />
                <Property
                  label="Alpha"
                  value={
                    typeof image.hasAlpha === "boolean"
                      ? image.hasAlpha
                        ? "Yes"
                        : "No"
                      : advanced.status === "ready"
                        ? advanced.hasAlpha
                          ? "Yes"
                          : "No"
                        : advanced.status === "unavailable"
                          ? "Unavailable"
                          : "—"
                  }
                />
                <Property
                  label="Histogram"
                  value={
                    image.histogram ||
                    (advanced.status === "ready"
                      ? `μ ${advanced.lumaMean.toFixed(0)}, σ ${advanced.lumaStd.toFixed(0)}`
                      : advanced.status === "unavailable"
                        ? "Unavailable"
                        : "—")
                  }
                />
                <div className="col-span-2 flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/40 px-2.5 py-2">
                  <span className="text-muted-foreground text-xs">Dominant colors</span>
                  <div className="flex items-center gap-1.5">
                    {advanced.status === "ready" ? (
                      advanced.dominantColors.map((c) => (
                        <div key={c} className="flex items-center gap-1">
                          <span
                            className="h-6 w-6 rounded-sm border border-primary/40"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {advanced.status === "unavailable" ? advanced.reason : "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-2 min-w-0">
            <Property
              label="File Name"
              value={image.fileName != null && image.fileName !== "" ? image.fileName : "—"}
              className="flex-1 min-w-0 truncate"
            />
            <ImageHealthScore image={image} side="top" compact />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground truncate pt-2 border-t border-border/60">{image.url}</p>
      </CardContent>
    </Card>
  );
};

const Property = ({
  label,
  value,
  className = "",
  isBest = false,
  tone = "normal",
}: {
  label: string;
  value: string;
  className?: string;
  isBest?: boolean;
  tone?: "normal" | "muted";
}) => (
  <div
    className={`flex justify-between items-center gap-2 rounded-lg border px-2.5 py-2 ring-1 ring-inset ${
      isBest
        ? "border-emerald-500/40 bg-emerald-500/15 ring-emerald-400/20"
        : "border-border/50 bg-gradient-to-b from-muted/70 to-muted/50 ring-white/5"
    } ${className}`.trim()}
  >
    <span className="text-muted-foreground text-xs">{label}</span>
    <span
      className={`font-semibold text-xs tabular-nums truncate min-w-0 ${
        tone === "muted" ? "text-muted-foreground/50" : "text-foreground"
      }`.trim()}
    >
      {value}
    </span>
  </div>
);

export default ImageCard;
