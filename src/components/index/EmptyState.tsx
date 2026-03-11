import { FileImage as ImageIcon } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <ImageIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-lg font-medium">No images yet</p>
      <p className="text-muted-foreground text-sm">
        Paste an image URL above to get started
      </p>
    </div>
  );
}
