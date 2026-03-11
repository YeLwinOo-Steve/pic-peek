import { useState, useRef, useCallback, type ChangeEvent } from "react";
import { toast } from "sonner";
import type { ImageData } from "@/types/image";
import { getFormatFromContentType } from "@/utils/format";
import { gcd } from "@/utils/imageScore";
import { scoreBest } from "@/utils/imageScore";
import { extractMetadata } from "@/utils/imageMetadata";
import { captureGrid } from "@/utils/captureGrid";
import { Helmet } from "react-helmet-async";
import {
  Header,
  ImageInputForm,
  ActionsBar,
  EmptyState,
  ComparisonGrid,
  Footer,
} from "@/components/index";

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

      let sizeKB = 0;
      let format = "unknown";
      let meta = {};
      try {
        const res = await fetch(trimmed, { mode: "cors" });
        const contentType = res.headers.get("content-type") || "";
        format = getFormatFromContentType(contentType);
        const blob = await res.blob();
        sizeKB = Math.round(blob.size / 1024);
        meta = await extractMetadata(blob, contentType);
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
        ...meta,
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
                  img.onload = async () => {
                    const g = gcd(img.naturalWidth, img.naturalHeight);
                    const sizeKB = Math.round(file.size / 1024);
                    const format = getFormatFromContentType(file.type || "");
                    const meta = await extractMetadata(file, file.type || "");
                    resolve({
                      id: crypto.randomUUID(),
                      url: result,
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                      sizeKB,
                      aspectRatio: `${img.naturalWidth / g}:${img.naturalHeight / g}`,
                      format,
                      fileName: file.name,
                      ...meta,
                    });
                  };
                  img.onerror = () =>
                    reject(new Error("Failed to load image file"));
                  img.src = result;
                };
                reader.onerror = () =>
                  reject(new Error("Failed to read image file"));
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

  const doCaptureGrid = async (): Promise<HTMLCanvasElement | null> => {
    if (!gridRef.current) return null;
    return captureGrid(gridRef.current);
  };

  const copyComparison = async () => {
    try {
      setCopyState("loading");
      const canvas = await doCaptureGrid();
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
        setTimeout(() => setCopyState("idle"), 1000);
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
      const canvas = await doCaptureGrid();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "image-comparison.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Downloaded!");
      setDownloadState("success");
      setTimeout(() => setDownloadState("idle"), 1000);
    } catch {
      toast.error("Download failed — try copying instead.");
      setDownloadState("idle");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>PicPeek — Compare images side by side</title>
        <meta
          name="description"
          content="Compare up to 9 images side by side — paste a URL or upload files. Check dimensions, file size, format, and more."
        />
        <meta
          name="keywords"
          content="picpeek,Pic-Peek, pic peek, picture data, image data, image compare, compare images, image comparison, side by side images"
        />
        <link rel="canonical" href="https://picpeek.yl0.me/" />

        <meta
          property="og:title"
          content="PicPeek — Compare images side by side"
        />
        <meta
          property="og:description"
          content="Compare up to 9 images side by side — paste a URL or upload files."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://picpeek.yl0.me/" />
        <meta
          property="og:image"
          content="https://picpeek.yl0.me/picpeek.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="PicPeek — Compare images side by side"
        />
        <meta
          name="twitter:description"
          content="Compare up to 9 images side by side — paste a URL or upload files."
        />
        <meta
          name="twitter:image"
          content="https://picpeek.yl0.me/picpeek.png"
        />
        <script
          defer
          src={import.meta.env.VITE_UMAMI_SRC}
          data-website-id={import.meta.env.VITE_UMAMI_WEBSITE_ID}
        />
      </Helmet>

      <Header />

      <main className="flex-1 flex flex-col">
        <div className="container max-w-6xl py-6">
          <ImageInputForm
            url={url}
            setUrl={setUrl}
            loading={loading}
            onSubmit={addImage}
            fileInputRef={fileInputRef}
            onFileChange={handleFileUpload}
          />

          {images.length > 0 && (
            <ActionsBar
              imageCount={images.length}
              copyState={copyState}
              downloadState={downloadState}
              onCopy={copyComparison}
              onDownload={downloadComparison}
              onClear={clearAll}
              showAdvanced={showAdvanced}
              onShowAdvancedChange={setShowAdvanced}
              comparisonPadding={comparisonPadding}
              onComparisonPaddingChange={setComparisonPadding}
            />
          )}
        </div>

        <div className="container max-w-6xl pb-12">
          {images.length === 0 ? (
            <EmptyState />
          ) : (
            <ComparisonGrid
              images={images}
              gridRef={gridRef}
              comparisonPadding={comparisonPadding}
              showAdvanced={showAdvanced}
              bestId={bestId}
              onRemove={removeImage}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
