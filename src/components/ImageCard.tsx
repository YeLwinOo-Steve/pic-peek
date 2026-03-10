import { Card, CardContent } from "@/components/ui/card";

import { X } from "lucide-react";
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
    <Card className="relative overflow-hidden animate-fade-in group">
      {isBest && (
        <div className="absolute top-2 left-2 z-10">
          <div className="relative px-3 py-1 rounded-full bg-gradient-to-b from-[hsl(45,100%,60%)] to-[hsl(30,90%,45%)] shadow-[0_3px_0_0_hsl(25,80%,35%),0_4px_12px_-2px_hsl(30,90%,40%/0.5),inset_0_1px_2px_hsl(0,0%,100%/0.4)] text-[hsl(30,50%,10%)] text-xs font-bold tracking-wide flex items-center gap-1.5">
            <span className="text-sm drop-shadow-sm">👑</span>
            Best
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-secondary/80 text-secondary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(image.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
        <img
          src={image.url}
          alt="Comparison"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Property label="Width" value={`${image.width}px`} />
          <Property label="Height" value={`${image.height}px`} />
          <Property label="Size" value={`${image.sizeKB} KB`} />
          <Property label="Ratio" value={image.aspectRatio} />
          <Property label="Format" value={image.format.toUpperCase()} />
          <Property label="Pixels" value={`${((image.width * image.height) / 1e6).toFixed(2)} MP`} />
        </div>
        <p className="text-[11px] text-muted-foreground truncate pt-1 border-t border-border">{image.url}</p>
      </CardContent>
    </Card>
  );
};

const Property = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center bg-muted/60 rounded-md px-2 py-1">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className="font-semibold text-foreground text-xs">{value}</span>
  </div>
);

export default ImageCard;
