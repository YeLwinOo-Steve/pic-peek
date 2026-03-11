import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Trash2, Loader2, CircleCheckBig } from "lucide-react";

type ActionState = "idle" | "loading" | "success";

interface ActionsBarProps {
  imageCount: number;
  copyState: ActionState;
  downloadState: ActionState;
  onCopy: () => void;
  onDownload: () => void;
  onClear: () => void;
  showAdvanced: boolean;
  onShowAdvancedChange: (v: boolean) => void;
  comparisonPadding: number;
  onComparisonPaddingChange: (v: number) => void;
}

export function ActionsBar({
  imageCount,
  copyState,
  downloadState,
  onCopy,
  onDownload,
  onClear,
  showAdvanced,
  onShowAdvancedChange,
  comparisonPadding,
  onComparisonPaddingChange,
}: ActionsBarProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-nowrap sm:gap-4">
      <div className="flex items-center justify-between gap-2 sm:justify-start sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            disabled={copyState === "loading"}
            className="hidden sm:inline-flex overflow-hidden"
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
            size="icon"
            onClick={onCopy}
            disabled={copyState === "loading"}
            className="inline-flex sm:hidden overflow-hidden"
            aria-label={copyState === "loading" ? "Copying" : "Copy"}
          >
            {copyState === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copyState === "success" ? (
              <CircleCheckBig className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={downloadState === "loading"}
            className="hidden sm:inline-flex overflow-hidden"
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
          <Button
            variant="outline"
            size="icon"
            onClick={onDownload}
            disabled={downloadState === "loading"}
            className="inline-flex sm:hidden overflow-hidden"
            aria-label={
              downloadState === "loading" ? "Downloading" : "Download"
            }
          >
            {downloadState === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : downloadState === "success" ? (
              <CircleCheckBig className="h-4 w-4 text-emerald-500" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            className="hidden sm:inline-flex"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Clear All
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={onClear}
            className="inline-flex sm:hidden"
            aria-label="Clear all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground whitespace-nowrap sm:hidden">
          {imageCount}/9 images
        </span>
      </div>

      <div className="flex items-center gap-3 sm:ml-auto sm:flex-nowrap sm:min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
            Advanced
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap sm:hidden">
            Adv.
          </span>
          <Switch
            checked={showAdvanced}
            onCheckedChange={onShowAdvancedChange}
            aria-label="Toggle advanced mode"
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Padding
        </span>
        <div className="flex-1 sm:flex-none sm:w-32">
          <Slider
            min={0}
            max={64}
            step={2}
            value={[comparisonPadding]}
            onValueChange={(vals) => {
              const [v] = vals;
              if (typeof v === "number") onComparisonPaddingChange(v);
            }}
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">
          {imageCount}/9 images
        </span>
      </div>
    </div>
  );
}
