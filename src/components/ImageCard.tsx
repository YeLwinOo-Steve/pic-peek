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
}

interface ImageCardProps {
  image: ImageData;
  isBest: boolean;
  onRemove: (id: string) => void;
}

const ImageCard = ({ image, isBest, onRemove }: ImageCardProps) => {
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
      <div
        className="aspect-video flex items-center justify-center overflow-hidden bg-center bg-no-repeat bg-contain border-b border-border/50 bg-muted"
        style={{ backgroundImage: `url(${image.url})` }}
        aria-label="Comparison image"
      />
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Property label="Width" value={`${image.width}px`} />
          <Property label="Height" value={`${image.height}px`} />
          <Property label="Size" value={`${image.sizeKB} KB`} />
          <Property label="Ratio" value={image.aspectRatio} />
          <Property label="Format" value={image.format.toUpperCase()} />
          <Property label="Pixels" value={`${((image.width * image.height) / 1e6).toFixed(2)} MP`} />
        </div>
        <p className="text-[11px] text-muted-foreground truncate pt-2 border-t border-border/60">{image.url}</p>
      </CardContent>
    </Card>
  );
};

const Property = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center gap-2 rounded-lg border border-border/50 bg-gradient-to-b from-muted/70 to-muted/50 px-2.5 py-2 ring-1 ring-inset ring-white/5">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className="font-semibold text-foreground text-xs tabular-nums">{value}</span>
  </div>
);

export default ImageCard;
