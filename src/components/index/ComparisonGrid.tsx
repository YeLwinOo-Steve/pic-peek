import { type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ImageCard from "@/components/ImageCard";
import type { ImageData } from "@/types/image";

interface ComparisonGridProps {
  images: ImageData[];
  gridRef: RefObject<HTMLDivElement | null>;
  comparisonPadding: number;
  showAdvanced: boolean;
  bestId: string | null;
  onRemove: (id: string) => void;
}

export function ComparisonGrid({
  images,
  gridRef,
  comparisonPadding,
  showAdvanced,
  bestId,
  onRemove,
}: ComparisonGridProps) {
  return (
    <div
      ref={gridRef}
      className="rounded-3xl border border-primary/30 bg-card/40"
      style={{ padding: `${comparisonPadding}px` }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {images.map((img) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                layout: { type: "spring", stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              className="min-w-0"
            >
              <ImageCard
                image={img}
                allImages={images}
                showAdvanced={showAdvanced}
                isBest={img.id === bestId}
                onRemove={onRemove}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
