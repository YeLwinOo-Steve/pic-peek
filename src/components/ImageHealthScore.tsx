import { useMemo } from "react";
import { BadgeCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ImageData } from "@/components/ImageCard";

export interface ImageHealthScoreProps {
  image: ImageData;
  /** Optional trigger; defaults to an info icon button. */
  trigger?: React.ReactNode;
  /** Popover placement. Default "bottom". Use "top" to open above the trigger. */
  side?: "top" | "right" | "bottom" | "left";
  /** Compact trigger style (e.g. for inline use next to file name). */
  compact?: boolean;
  className?: string;
}

function computeHealth(image: ImageData): {
  score: number;
  issues: string[];
  positives: string[];
} {
  const issues: string[] = [];
  const positives: string[] = [];
  const mp = (image.width * image.height) / 1e6;
  const format = (image.format || "").toLowerCase();

  // Resolution
  if (mp < 0.3) {
    issues.push("Low resolution");
  } else if (mp >= 1) {
    positives.push("Good resolution");
  }
  if (mp >= 2) {
    positives.push("Great resolution");
  }

  // Format
  if (format === "png" && image.sizeKB > 400) {
    issues.push("PNG used for photo (consider JPEG/WebP for smaller size)");
  }
  if (format === "jpeg" || format === "webp") {
    positives.push("Web-friendly format");
  }

  // File size
  if (image.sizeKB > 2000) {
    issues.push("High file size");
  } else if (image.sizeKB <= 800 && mp >= 0.5) {
    positives.push("Reasonable file size");
  }
  if (image.sizeKB > 4000) {
    issues.push("Very large file");
  }

  // Bytes per pixel (efficiency)
  const pixels = image.width * image.height || 1;
  const bpp = (image.sizeKB * 1024) / pixels;
  if (bpp > 4 && format === "png") {
    issues.push("Inefficient compression");
  }

  // Score: base 70, -12 per issue, +8 per positive, clamp 0–100
  let score = 70;
  score -= issues.length * 12;
  score += positives.length * 8;
  score = Math.round(Math.max(0, Math.min(100, score)));

  return { score, issues, positives };
}

export function ImageHealthScore({
  image,
  trigger,
  side = "bottom",
  compact,
  className,
}: ImageHealthScoreProps) {
  const { score, issues, positives } = useMemo(
    () => computeHealth(image),
    [image],
  );

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className={
        compact
          ? "h-8 w-8 shrink-0 rounded-full border border-border/50 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-primary"
          : "h-7 w-7 rounded-full bg-background/90 border border-border/60 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      }
      aria-label="Image health score"
    >
      <BadgeCheck className="h-8 w-8" />
    </Button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild className={className}>
        {trigger ?? defaultTrigger}
      </PopoverTrigger>
      <PopoverContent
        showArrow
        side={side}
        align="end"
        sideOffset={8}
        className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-border/60 p-5"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
          Image health
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Image score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-foreground">
                {score}
              </span>
              <span className="text-muted-foreground text-sm">/ 100</span>
            </div>
          </div>

          {positives.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Good
              </p>
              <ul className="space-y-1.5">
                {positives.map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400/95"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Issues
              </p>
              <ul className="space-y-1.5">
                {issues.map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400/95"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {issues.length === 0 && positives.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No specific issues or highlights for this image.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ImageHealthScore;
