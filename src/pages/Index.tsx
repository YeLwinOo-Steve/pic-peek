import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Download, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import ImageCard, { type ImageData } from "@/components/ImageCard";
import html2canvas from "html2canvas";

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
  const gridRef = useRef<HTMLDivElement>(null);

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
      const data: ImageData = {
        id: crypto.randomUUID(),
        url: trimmed,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKB,
        aspectRatio: `${img.naturalWidth / g}:${img.naturalHeight / g}`,
        format,
      };

      setImages((prev) => [...prev, data]);
      setUrl("");
      toast.success("Image added!");
    } catch {
      toast.error("Could not load image. Check the URL.");
    } finally {
      setLoading(false);
    }
  }, [url, images.length]);

  const removeImage = (id: string) => setImages((prev) => prev.filter((i) => i.id !== id));
  const clearAll = () => { setImages([]); toast("All cleared"); };

  const bestId = scoreBest(images);

  const captureGrid = async (): Promise<HTMLCanvasElement | null> => {
    if (!gridRef.current) return null;
    const el = gridRef.current;
    const canvas = await html2canvas(el, {
      useCORS: true,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--background")
        ? window.getComputedStyle(document.body).backgroundColor
        : "#ffffff",
      scale: 2,
      width: el.scrollWidth,
      height: el.scrollHeight,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });
    return canvas;
  };

  const copyComparison = async () => {
    try {
      const canvas = await captureGrid();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) { toast.error("Copy failed"); return; }
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("Comparison image copied to clipboard!");
      }, "image/png");
    } catch {
      toast.error("Copy failed — your browser may not support image clipboard.");
    }
  };

  const downloadComparison = async () => {
    try {
      const canvas = await captureGrid();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "image-comparison.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Downloaded!");
    } catch {
      toast.error("Download failed — try copying instead.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Image Comparer
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Compare up to 9 images side by side — paste a URL and hit add.
          </p>
        </div>
      </header>

      {/* Input */}
      <div className="container max-w-6xl py-6">
        <form
          onSubmit={(e) => { e.preventDefault(); addImage(); }}
          className="flex gap-2"
        >
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste image URL here…"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !url.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            {loading ? "Loading…" : "Add"}
          </Button>
        </form>

        {images.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyComparison}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadComparison}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear All
            </Button>
            <span className="ml-auto text-sm text-muted-foreground self-center">
              {images.length}/9 images
            </span>
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
            <p className="text-muted-foreground text-lg font-medium">No images yet</p>
            <p className="text-muted-foreground text-sm">Paste an image URL above to get started</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img) => (
              <ImageCard key={img.id} image={img} isBest={img.id === bestId} onRemove={removeImage} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
