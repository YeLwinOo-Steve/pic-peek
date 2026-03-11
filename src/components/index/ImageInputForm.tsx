import { type RefObject } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CornerDownRight, FileImage as ImageIcon } from "lucide-react";

interface ImageInputFormProps {
  url: string;
  setUrl: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageInputForm({
  url,
  setUrl,
  loading,
  onSubmit,
  fileInputRef,
  onFileChange,
}: ImageInputFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="hidden sm:inline-flex"
        >
          <ImageIcon className="h-4 w-4 mr-1" /> Upload Image
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex sm:hidden"
          aria-label="Upload image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileChange}
      />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste image URL here…"
        className="flex-1 rounded-full py-2"
        disabled={loading}
      />

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={loading || !url.trim()}
          className="hidden sm:inline-flex"
        >
          <CornerDownRight className="h-4 w-4 mr-1" />
          {loading ? "Loading…" : "Compare"}
        </Button>
        <Button
          type="submit"
          size="icon"
          variant="default"
          disabled={loading || !url.trim()}
          className="inline-flex sm:hidden"
          aria-label="Compare"
        >
          <CornerDownRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
