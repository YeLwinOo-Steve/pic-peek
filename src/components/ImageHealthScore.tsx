import { useMemo } from "react";
import { Sparkles, Laugh, Frown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ImageData } from "@/types/image";

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
  recommendations: string[];
} {
  const issues: string[] = [];
  const positives: string[] = [];
  const recommendations: string[] = [];
  const mp = (image.width * image.height) / 1e6;
  const format = (image.format || "").toLowerCase();
  const pixels = image.width * image.height || 1;
  const bpp = (image.sizeKB * 1024) / pixels;
  const maxDim = Math.max(image.width, image.height);

  // Resolution
  if (mp < 0.3) {
    issues.push("Low resolution");
    recommendations.push(
      "Use at least 0.5 MP (e.g. 800×600) for clear display.",
    );
  } else if (mp >= 1) {
    positives.push("Good resolution");
  }
  if (mp >= 2) {
    positives.push("Great resolution");
  }

  // Dimensions for web
  if (maxDim > 4096) {
    issues.push("Very large dimensions");
    recommendations.push(
      "Resize to max 2048–4096px on the long side for web to reduce size and load time.",
    );
  } else if (maxDim > 2048 && (format === "jpeg" || format === "png")) {
    recommendations.push(
      "Consider resizing to 1920–2048px for typical web use.",
    );
  }

  // Format
  if (format === "png" && image.sizeKB > 400) {
    issues.push("PNG used for photo (consider JPEG/WebP for smaller size)");
    recommendations.push(
      "Convert to WebP or JPEG for 30–50% smaller file size at similar quality.",
    );
  }
  if (format === "jpeg" || format === "webp") {
    positives.push("Web-friendly format");
  }
  if (format === "png" && image.hasAlpha === false) {
    recommendations.push(
      "No transparency needed — JPEG or WebP would be smaller than PNG.",
    );
  }

  // File size
  if (image.sizeKB > 2000) {
    issues.push("High file size");
    recommendations.push(
      "Compress or convert to WebP; aim for under 200–500 KB for web.",
    );
  } else if (image.sizeKB <= 800 && mp >= 0.5) {
    positives.push("Reasonable file size");
  }
  if (image.sizeKB > 4000) {
    issues.push("Very large file");
  }

  // Bytes per pixel (efficiency)
  if (bpp > 4 && format === "png") {
    issues.push("Inefficient compression");
    recommendations.push(
      "Re-export PNG with higher compression or use TinyPNG/squoosh.",
    );
  }

  // Over-compression (high MP but very small file)
  if (mp >= 2 && image.sizeKB < 100) {
    issues.push("Likely over-compressed");
    recommendations.push(
      "Quality may be low; use higher JPEG/WebP quality or less aggressive compression.",
    );
  }

  // Aspect ratio
  const ratio = image.width / (image.height || 1);
  const isCommonRatio =
    Math.abs(ratio - 16 / 9) < 0.05 ||
    Math.abs(ratio - 4 / 3) < 0.05 ||
    Math.abs(ratio - 1) < 0.05;
  if (isCommonRatio) {
    positives.push("Common aspect ratio (display-friendly)");
  }

  // Color space
  if (image.colorSpace && image.colorSpace.toLowerCase().includes("srgb")) {
    positives.push("sRGB color space (good for web)");
  } else if (
    image.colorSpace &&
    !image.colorSpace.toLowerCase().includes("unknown")
  ) {
    recommendations.push("Convert to sRGB for consistent web display.");
  }

  // DPI
  if (image.dpi && image.dpi !== "Unknown") {
    const dpiNum = parseInt(image.dpi, 10);
    if (!Number.isNaN(dpiNum) && dpiNum > 300) {
      recommendations.push(
        "DPI > 300 is for print; 72–150 is enough for screen.",
      );
    }
  }

  // Score: base 70, -12 per issue, +8 per positive, clamp 0–100
  let score = 70;
  score -= issues.length * 12;
  score += positives.length * 8;
  score = Math.round(Math.max(0, Math.min(100, score)));

  return { score, issues, positives, recommendations };
}

export function ImageHealthScore({
  image,
  trigger,
  side = "bottom",
  compact,
  className,
}: ImageHealthScoreProps) {
  const { score, issues, positives, recommendations } = useMemo(
    () => computeHealth(image),
    [image],
  );

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className={
        compact
          ? "h-8 w-8 shrink-0 rounded-full border border-border/50 bg-muted/50 text-primary hover:text-white hover:bg-primary"
          : "h-7 w-7 rounded-full bg-background/90 border border-border/60 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      }
      aria-label="Image health score"
    >
      <Activity className="h-8 w-8" />
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
                    <Laugh className="h-4 w-4 shrink-0 mt-0.5" />
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
                    <Frown className="h-4 w-4 shrink-0 mt-0.5" />
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

          {recommendations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                Recommendations
              </p>
              <ul className="space-y-1.5">
                {recommendations.map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ImageHealthScore;
