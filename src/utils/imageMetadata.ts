import * as exifr from "exifr";
import type { ExtractedMeta } from "@/types/image";
import { fmtMaybeNumber } from "./format";
import { getFormatFromContentType } from "./format";

export function parsePngMeta(
  buf: ArrayBuffer,
): Pick<ExtractedMeta, "bitDepth" | "dpi" | "colorSpace"> {
  const u8 = new Uint8Array(buf);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < sig.length; i++) {
    if (u8[i] !== sig[i]) return {};
  }

  const view = new DataView(buf);
  let off = 8;
  let bitDepth: string | undefined;
  let dpi: string | undefined;
  let colorSpace: string | undefined;

  while (off + 8 <= view.byteLength) {
    const length = view.getUint32(off);
    const type =
      String.fromCharCode(u8[off + 4] || 0) +
      String.fromCharCode(u8[off + 5] || 0) +
      String.fromCharCode(u8[off + 6] || 0) +
      String.fromCharCode(u8[off + 7] || 0);
    const dataOff = off + 8;

    if (type === "IHDR" && dataOff + 13 <= view.byteLength) {
      const bd = u8[dataOff + 8];
      if (typeof bd === "number") bitDepth = `${bd}-bit`;
    }

    if (type === "pHYs" && dataOff + 9 <= view.byteLength) {
      const ppux = view.getUint32(dataOff);
      const ppuy = view.getUint32(dataOff + 4);
      const unit = u8[dataOff + 8];
      if (unit === 1) {
        const xDpi = ppux * 0.0254;
        const yDpi = ppuy * 0.0254;
        if (Number.isFinite(xDpi) && Number.isFinite(yDpi)) {
          const x = Math.round(xDpi);
          const y = Math.round(yDpi);
          dpi = x === y ? `${x} DPI` : `${x}×${y} DPI`;
        }
      }
    }

    if (type === "sRGB" && length >= 1) {
      colorSpace = "sRGB";
    }

    off = dataOff + length + 4;
    if (type === "IEND") break;
  }

  return { bitDepth, dpi, colorSpace };
}

export async function extractMetadata(
  blob: Blob,
  contentTypeHint?: string,
): Promise<ExtractedMeta> {
  const meta: ExtractedMeta = {};
  const buf = await blob.arrayBuffer();
  const ct = (contentTypeHint || "").toLowerCase();

  if (ct.includes("png")) {
    Object.assign(meta, parsePngMeta(buf));
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed: any = await exifr.parse(buf, {
      tiff: true,
      ifd0: true,
      exif: true,
    } as any);

    if (parsed) {
      const bits =
        parsed.BitsPerSample ?? parsed.BitsPerPixel ?? parsed.BitsPerChannel;
      if (Array.isArray(bits) && bits.length > 0) {
        meta.bitDepth = `${bits.join("/")}-bit`;
      } else if (typeof bits === "number") {
        meta.bitDepth = `${bits}-bit`;
      }

      const xRes = parsed.XResolution ?? parsed.xResolution;
      const yRes = parsed.YResolution ?? parsed.yResolution;
      const unit = parsed.ResolutionUnit ?? 2;
      const x = fmtMaybeNumber(xRes, 0);
      const y = fmtMaybeNumber(yRes, 0);
      if (x && y) {
        const unitLabel = unit === 2 ? "DPI" : unit === 3 ? "DPCM" : "PPI";
        meta.dpi = x === y ? `${x} ${unitLabel}` : `${x}×${y} ${unitLabel}`;
      }

      const cs = parsed.ColorSpace ?? parsed.PhotometricInterpretation;
      if (cs === 1) meta.colorSpace = "sRGB";
      else if (cs === 65535) meta.colorSpace = "Uncalibrated";
      else if (typeof cs === "number") meta.colorSpace = `ColorSpace ${cs}`;

      const fl = parsed.FocalLength ?? parsed.FocalLengthIn35mmFormat;
      if (typeof fl === "number" && Number.isFinite(fl)) {
        meta.focalLength = `${fl.toFixed(1)} mm`;
      }

      const dt =
        parsed.DateTimeOriginal ??
        parsed.CreateDate ??
        parsed.ModifyDate ??
        parsed.DateTime ??
        parsed.FileCreateDate ??
        parsed.FileModifyDate;
      if (dt instanceof Date && !Number.isNaN(dt.getTime())) {
        meta.timestamp = dt.toLocaleString();
      } else if (typeof dt === "string" && dt.trim() !== "") {
        meta.timestamp = dt;
      }

      const o = parsed.Orientation;
      if (typeof o === "number") {
        const map: Record<number, string> = {
          1: "Normal",
          2: "Mirrored",
          3: "Rotated 180°",
          4: "Mirrored 180°",
          5: "Mirrored 90°",
          6: "Rotated 90°",
          7: "Mirrored 270°",
          8: "Rotated 270°",
        };
        meta.exifOrientation = map[o] || `Orientation ${o}`;
      }
    }
  } catch {
    // ignore EXIF failures
  }

  const format = getFormatFromContentType(contentTypeHint ?? "");
  if (!meta.bitDepth) {
    if (format === "jpeg" || format === "webp" || format === "gif") {
      meta.bitDepth = "8-bit (typical)";
    }
  }
  if (
    !meta.colorSpace &&
    (format === "jpeg" || format === "webp" || format === "png")
  ) {
    meta.colorSpace = "sRGB (assumed)";
  }

  return meta;
}
