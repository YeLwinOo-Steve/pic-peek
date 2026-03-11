export interface ImageData {
  id: string;
  url: string;
  width: number;
  height: number;
  sizeKB: number;
  aspectRatio: string;
  format: string;
  fileName?: string;
  bitDepth?: string;
  dpi?: string;
  colorSpace?: string;
  hasAlpha?: boolean;
  histogram?: string;
  focalLength?: string;
  timestamp?: string;
  exifOrientation?: string;
}

export type ExtractedMeta = Pick<
  ImageData,
  | "bitDepth"
  | "dpi"
  | "colorSpace"
  | "focalLength"
  | "timestamp"
  | "exifOrientation"
  | "hasAlpha"
  | "histogram"
>;
