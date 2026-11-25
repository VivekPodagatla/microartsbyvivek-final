// ================= PRINT FILE =================
// What Vivek prints himself: the background, photos and quotes at
// the exact art size and 300 DPI, with no frame and no pencil arts
// (their places stay empty). Original photos from Cloudinary.
// A clear-glass background exports transparent.

import { renderDesign, canvasToBlob } from "../renderDesign"
import { loadQuoteFonts, loadPencilFonts } from "../designerFonts"
import { artSize, withPngDpi } from "./adminHelpers"

export const PRINT_DPI = 300

const originalPhoto = (request) => (item) =>
  request.photos.find((photo) => photo.itemId === item.id)?.url

export async function renderPrintCanvas(request) {
  await Promise.all([loadQuoteFonts(), loadPencilFonts()])
  return renderDesign(request.design, {
    ppi: PRINT_DPI,
    includeFrame: false,
    includePencils: false,
    includeBackground: true,
    clearAs: "transparent",
    photoSource: originalPhoto(request),
  })
}

export async function makePrintPng(canvas) {
  return withPngDpi(await canvasToBlob(canvas, "image/png"), PRINT_DPI)
}

// PDF page exactly the art size; transparent stays transparent.
export async function makePrintPdf(canvas, request) {
  const { jsPDF } = await import("jspdf")
  const [w, h] = artSize(request.design.frame)
  const pdf = new jsPDF({
    unit: "in",
    format: [w, h],
    orientation: w > h ? "landscape" : "portrait",
    compress: true,
  })
  pdf.addImage(canvas, "PNG", 0, 0, w, h, undefined, "FAST")
  return pdf.output("blob")
}
