import { Card, CardContent } from "@/components/ui/card";

import { X, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

interface ImageCardProps {
  image: ImageData;
  allImages: ImageData[];
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

const ImageCard = ({ image, allImages, isBest, onRemove }: ImageCardProps) => {
  const best = getBestFlags(image, allImages);

  return (
    <Card className="relative overflow-hidden animate-fade-in group rounded-3xl shadow-none border-2 border-border/40 bg-gradient-to-b from-card to-card/95 ring-1 ring-inset ring-white/10">
      {isBest && (
        <div className="absolute top-2 left-2 z-10">
          <div className="relative px-3 py-1.5 rounded-full bg-gradient-to-b from-[hsl(140,70%,52%)] to-[hsl(150,75%,38%)] border border-[hsl(155,60%,30%)]/50 text-[hsl(150,60%,12%)] text-xs font-bold tracking-wide flex items-center gap-1.5 ring-1 ring-inset ring-white/30">
            <ThumbsUp className="h-3.5 w-3.5 text-[hsl(150,60%,12%)]" />
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
          {image.fileName != null && image.fileName !== "" && (
            <Property label="File Name" value={image.fileName} className="col-span-2 truncate" />
          )}
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
}: {
  label: string;
  value: string;
  className?: string;
  isBest?: boolean;
}) => (
  <div
    className={`flex justify-between items-center gap-2 rounded-lg border px-2.5 py-2 ring-1 ring-inset ${
      isBest
        ? "border-emerald-500/40 bg-emerald-500/15 ring-emerald-400/20"
        : "border-border/50 bg-gradient-to-b from-muted/70 to-muted/50 ring-white/5"
    } ${className}`.trim()}
  >
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className="font-semibold text-foreground text-xs tabular-nums truncate min-w-0">{value}</span>
  </div>
);

export default ImageCard;
