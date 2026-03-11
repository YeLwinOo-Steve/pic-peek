import * as htmlToImage from "html-to-image";

export async function captureGrid(
  element: HTMLElement,
): Promise<HTMLCanvasElement | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (document as any).fonts?.ready;
  } catch {
    // ignore
  }

  const prevBorder = element.style.border;
  const prevBorderColor = element.style.borderColor;

  let baseCanvas: HTMLCanvasElement;
  try {
    element.style.border = "2px dashed transparent";
    element.style.borderColor = "transparent";

    baseCanvas = await htmlToImage.toCanvas(element, {
      backgroundColor: "#ffffff",
      pixelRatio: window.devicePixelRatio || 2,
      cacheBust: true,
    });
  } finally {
    element.style.border = prevBorder;
    element.style.borderColor = prevBorderColor;
  }

  const finalCropW = baseCanvas.width;
  const finalCropH = baseCanvas.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = finalCropW;
  outCanvas.height = finalCropH;
  const ctx = outCanvas.getContext("2d");
  if (!ctx) return baseCanvas;

  ctx.drawImage(baseCanvas, 0, 0, finalCropW, finalCropH, 0, 0, finalCropW, finalCropH);

  const padding = Math.round(outCanvas.width * 0.02);
  const fontSize = Math.max(12, Math.round(outCanvas.width * 0.018));
  ctx.font = `${fontSize}px "Shantell Sans", cursive, sans-serif`;
  ctx.textBaseline = "bottom";

  const watermarkText = "picpeek.yl0.me";
  const textMetrics = ctx.measureText(watermarkText);
  const textWidth = textMetrics.width;
  const x = outCanvas.width - textWidth - padding;
  const y = outCanvas.height - padding;

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

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(watermarkText, x, y);

  return outCanvas;
}
