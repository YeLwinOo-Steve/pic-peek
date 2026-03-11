import { useState, useRef, useCallback, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  CornerDownRight,
  Download,
  Copy,
  Trash2,
  FileImage as ImageIcon,
  Loader2,
  CircleCheckBig,
} from "lucide-react";
import ImageCard, { type ImageData } from "@/components/ImageCard";
import * as htmlToImage from "html-to-image";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getFormatFromContentType(contentType: string): string {
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

function scoreBest(images: ImageData[]): string | null {
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

const Index = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "loading" | "success">(
    "idle",
  );
  const [downloadState, setDownloadState] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const [comparisonPadding, setComparisonPadding] = useState(24);
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addImage = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (images.length >= 9) {
      toast.error("Maximum 9 images allowed");
      return;
    }

    setLoading(true);
    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = trimmed;
      });

      // Fetch to get size and content-type
      let sizeKB = 0;
      let format = "unknown";
      try {
        const res = await fetch(trimmed, { mode: "cors" });
        const contentType = res.headers.get("content-type") || "";
        format = getFormatFromContentType(contentType);
        const blob = await res.blob();
        sizeKB = Math.round(blob.size / 1024);
      } catch {
        sizeKB = 0;
      }

      const g = gcd(img.naturalWidth, img.naturalHeight);
      const urlName =
        trimmed.split("/").pop()?.split("?")[0] || trimmed.slice(0, 40);
      const data: ImageData = {
        id: crypto.randomUUID(),
        url: trimmed,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKB,
        aspectRatio: `${img.naturalWidth / g}:${img.naturalHeight / g}`,
        format,
        fileName: urlName,
      };

      setImages((prev) => [...prev, data]);
      setUrl("");
      toast.success("Image added!");
    } catch {
      toast.error("Could not load image. Check the URL.", {
        description:
          "The image URL may be invalid or the image is not accessible.",
      });
    } finally {
      setLoading(false);
    }
  }, [url, images.length]);

  const handleFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;

      if (images.length >= 9) {
        toast.error("Maximum 9 images allowed");
        event.target.value = "";
        return;
      }

      const remainingSlots = 9 - images.length;
      const files = Array.from(fileList).slice(0, remainingSlots);

      setLoading(true);
      try {
        const newImages: ImageData[] = await Promise.all(
          files.map(
            (file) =>
              new Promise<ImageData>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result;
                  if (typeof result !== "string") {
                    reject(new Error("Failed to read image file"));
                    return;
                  }
                  const img = new window.Image();
                  img.onload = () => {
                    const g = gcd(img.naturalWidth, img.naturalHeight);
                    const sizeKB = Math.round(file.size / 1024);
                    const format = getFormatFromContentType(file.type || "");
                    resolve({
                      id: crypto.randomUUID(),
                      url: result,
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      sizeKB,
                      aspectRatio: `${img.naturalWidth / g}:${img.naturalHeight / g}`,
                      format,
                      fileName: file.name,
                    });
                  };
                  img.onerror = () => {
                    reject(new Error("Failed to load image file"));
                  };
                  img.src = result;
                };
                reader.onerror = () => {
                  reject(new Error("Failed to read image file"));
                };
                reader.readAsDataURL(file);
              }),
          ),
        );

        setImages((prev) => [...prev, ...newImages]);

        if (fileList.length > remainingSlots) {
          toast("Some files were not added", {
            description: "You can add up to 9 images total.",
          });
        } else {
          toast.success("Image(s) added!");
        }
      } catch {
        toast.error("Could not load one or more image files.");
      } finally {
        setLoading(false);
        event.target.value = "";
      }
    },
    [images.length],
  );

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((i) => i.id !== id));

  const clearAll = () => {
    setImages([]);
    toast("All cleared");
  };

  const bestId = scoreBest(images);

  const captureGrid = async (): Promise<HTMLCanvasElement | null> => {
    if (!gridRef.current) return null;
    const el = gridRef.current;

    // Ensure web fonts are loaded before snapshotting (prevents "wonky" text)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (document as any).fonts?.ready;
    } catch {
      // ignore
    }

    // Temporarily hide the dotted border while capturing so it doesn't
    // appear in the exported image.
    const prevBorder = el.style.border;
    const prevBorderColor = el.style.borderColor;

    let baseCanvas: HTMLCanvasElement;
    try {
      el.style.border = "2px dashed transparent";
      el.style.borderColor = "transparent";

      // Capture the grid exactly as rendered on screen
      baseCanvas = await htmlToImage.toCanvas(el, {
        backgroundColor: "#ffffff",
        pixelRatio: window.devicePixelRatio || 2,
        cacheBust: true,
      });
    } finally {
      el.style.border = prevBorder;
      el.style.borderColor = prevBorderColor;
    }

    const srcWidth = baseCanvas.width;
    const srcHeight = baseCanvas.height;

    const cropX = 0;
    const cropY = 0;
    const finalCropW = srcWidth;
    const finalCropH = srcHeight;

    // Add watermark to a copy so we keep the original capture untouched
    const outCanvas = document.createElement("canvas");
    outCanvas.width = finalCropW;
    outCanvas.height = finalCropH;
    const ctx = outCanvas.getContext("2d");
    if (!ctx) return baseCanvas;

    // Draw captured UI
    ctx.drawImage(
      baseCanvas,
      cropX,
      cropY,
      finalCropW,
      finalCropH,
      0,
      0,
      finalCropW,
      finalCropH,
    );

    // Watermark in bottom-right corner
    const padding = Math.round(outCanvas.width * 0.02); // 2% padding
    const fontSize = Math.max(12, Math.round(outCanvas.width * 0.018));
    ctx.font = `${fontSize}px "Shantell Sans", cursive, sans-serif`;
    ctx.textBaseline = "bottom";

    const watermarkText = "PicPeek";
    const textMetrics = ctx.measureText(watermarkText);
    const textWidth = textMetrics.width;
    const x = outCanvas.width - textWidth - padding;
    const y = outCanvas.height - padding;

    // Subtle background for legibility
    const boxPaddingX = padding * 0.5;
    const boxPaddingY = padding * 0.4;
    const boxX = x - boxPaddingX;
    const boxY = y - fontSize - boxPaddingY * 0.5;
    const boxW = textWidth + boxPaddingX * 2;
    const boxH = fontSize + boxPaddingY;

    ctx.fillStyle = "rgb(228, 85, 42)";
    ctx.roundRect?.(boxX, boxY, boxW, boxH, Math.min(16, boxH));
    if (!ctx.roundRect) {
      ctx.fillRect(boxX, boxY, boxW, boxH);
    } else {
      ctx.fill();
    }

    // Watermark text
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(watermarkText, x, y);

    return outCanvas;
  };

  const copyComparison = async () => {
    try {
      setCopyState("loading");
      const canvas = await captureGrid();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Copy failed");
          setCopyState("idle");
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Comparison image copied to clipboard!");
        setCopyState("success");
        setTimeout(() => setCopyState("idle"), 200);
      }, "image/png");
    } catch {
      toast.error(
        "Copy failed — your browser may not support image clipboard.",
      );
      setCopyState("idle");
    }
  };

  const downloadComparison = async () => {
    try {
      setDownloadState("loading");
      const canvas = await captureGrid();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "image-comparison.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Downloaded!");
      setDownloadState("success");
      setTimeout(() => setDownloadState("idle"), 200);
    } catch {
      toast.error("Download failed — try copying instead.");
      setDownloadState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <img
                src="/picpeek.png"
                className="rounded-md"
                alt="PicPeek"
                width={40}
                height={40}
              />
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                PicPeek
              </h1>
              <p className="text-muted-foreground text-sm">
                Compare up to 9 images side by side — paste a URL or upload
                files.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Input */}
      <div className="container max-w-6xl py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addImage();
          }}
          className="flex gap-2"
        >
          <Button type="button" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4 mr-1" /> Upload Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste image URL here…"
            className="flex-1 rounded-full py-2"
            disabled={loading}
          />

          <Button type="submit" disabled={loading || !url.trim()}>
            <CornerDownRight className="h-4 w-4 mr-1" />
            {loading ? "Loading…" : "Compare"}
          </Button>
        </form>

        {images.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={copyComparison}
              disabled={copyState === "loading"}
            >
              {copyState === "loading" ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : copyState === "success" ? (
                <CircleCheckBig className="h-4 w-4 mr-1 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {copyState === "loading"
                ? "Copying…"
                : copyState === "success"
                  ? "Copied!"
                  : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadComparison}
              disabled={downloadState === "loading"}
            >
              {downloadState === "loading" ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : downloadState === "success" ? (
                <CircleCheckBig className="h-4 w-4 mr-1 text-emerald-500" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              {downloadState === "loading"
                ? "Downloading…"
                : downloadState === "success"
                  ? "Downloaded!"
                  : "Download"}
            </Button>
            <Button variant="destructive" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear All
            </Button>
            <div className="ml-auto flex items-center gap-3 min-w-[180px]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                  Advanced
                </span>
                <Switch
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                  aria-label="Toggle advanced mode"
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                Padding
              </span>
              <div className="w-32">
                <Slider
                  min={0}
                  max={64}
                  step={2}
                  value={[comparisonPadding]}
                  onValueChange={(vals) => {
                    const [v] = vals;
                    if (typeof v === "number") setComparisonPadding(v);
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {images.length}/9 images
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="container max-w-6xl pb-12">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">
              No images yet
            </p>
            <p className="text-muted-foreground text-sm">
              Paste an image URL above to get started
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="rounded-3xl border border-primary/30 bg-card/40"
            style={{ padding: `${comparisonPadding}px` }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  allImages={images}
                  showAdvanced={showAdvanced}
                  isBest={img.id === bestId}
                  onRemove={removeImage}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
