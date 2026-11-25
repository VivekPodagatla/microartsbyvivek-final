import { useEffect, useState } from "react"

import { formatMoney } from "../../../../shared/designPricing.js"
import {
  updateDesignRequest,
  deleteDesignRequest,
} from "../../api/designRequests"
import { renderDesign, canvasToBlob } from "../renderDesign"
import { pencilSVG } from "../pencilArt"
import { loadQuoteFonts, loadPencilFonts } from "../designerFonts"
import { renderPrintCanvas, makePrintPng, makePrintPdf, PRINT_DPI } from "./printFile"
import {
  STATUS_LABELS,
  reference,
  formatDate,
  colorName,
  fontLabel,
  symbolLabel,
  artSize,
  downloadUrl,
  resizedUrl,
  photoResolution,
  printFileName,
  saveBlob,
  contactPhone,
  contactPhoneDigits,
} from "./adminHelpers"

// ================= ONE DESIGN REQUEST =================

function DesignRequestDetail({ request, authToken, showNotification, showConfirm, onChanged, onDeleted }) {
  const { design, photos, contact } = request
  const [viewUrl, setViewUrl] = useState("")
  const [viewFailed, setViewFailed] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [fontsReady, setFontsReady] = useState(false)
  const [notes, setNotes] = useState(request.notes || "")
  const [busy, setBusy] = useState("")

  const [artW, artH] = artSize(design.frame)
  const pencils = design.items.filter((item) => item.type === "pencil")
  const resolutions = photoResolution(request)
  const phoneDigits = contactPhoneDigits(contact)
  const clearGlass = design.frame.background === "transparent"

  // Overall design: the same renderer as the customer's board,
  // with the frame and pencils, from the uploaded photos.
  useEffect(() => {
    let active = true
    let url = ""
    ;(async () => {
      await Promise.all([loadQuoteFonts(), loadPencilFonts()])
      if (!active) return
      setFontsReady(true)
      const longSide = Math.max(artW, artH) + 2 * design.frame.thickness
      const canvas = await renderDesign(design, {
        ppi: Math.round(2400 / longSide),
        photoSource: (item) => {
          const photo = photos.find((p) => p.itemId === item.id)
          return photo ? resizedUrl(photo.url, 2000) : ""
        },
      })
      url = URL.createObjectURL(await canvasToBlob(canvas, "image/png"))
      if (active) setViewUrl(url)
    })().catch((error) => {
      console.error("Design view error:", error)
      if (active) setViewFailed(true)
    })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [design, photos, artW, artH])

  const save = async (updates, message) => {
    const response = await updateDesignRequest(authToken, request._id, updates)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      showNotification(data.message || "Failed to update the design request.", "error")
      return
    }
    onChanged({
      ...request,
      status: data.designRequest.status,
      notes: data.designRequest.notes,
      statusHistory: data.designRequest.statusHistory,
    })
    showNotification(message, "success")
  }

  const remove = async () => {
    const confirmed = await showConfirm({
      title: "Delete design request?",
      message: `This permanently deletes request #${reference(request)}, its preview and the customer's photos. It cannot be undone.`,
      confirmText: "Delete",
      danger: true,
    })
    if (!confirmed) return
    const response = await deleteDesignRequest(authToken, request._id)
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      showNotification(data.message || "Failed to delete the design request.", "error")
      return
    }
    showNotification("Design request and photos deleted.", "success")
    onDeleted()
  }

  const downloadPrint = async (kind) => {
    setBusy(kind)
    try {
      const canvas = await renderPrintCanvas(request)
      const blob = kind === "pdf" ? await makePrintPdf(canvas, request) : await makePrintPng(canvas)
      saveBlob(blob, printFileName(request, kind))
    } catch (error) {
      console.error("Print file error:", error)
      showNotification("The print file could not be made. Please try again.", "error")
    } finally {
      setBusy("")
    }
  }

  return (
    <article className="da-detail">

      {/* ================= HEADER ================= */}

      <header className="da-detail-header">
        <div>
          <h1>Design request #{reference(request)}</h1>
          <p className="da-muted">Received {formatDate(request.createdAt)}</p>
        </div>
        <label className="da-status-select">
          Status
          <select
            value={request.status}
            onChange={(event) => save({ status: event.target.value }, `Status set to ${STATUS_LABELS[event.target.value]}.`)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </header>

      <div className="da-columns">

        {/* ================= OVERALL DESIGN ================= */}

        <section className="da-panel da-view">
          <h2>Overall design</h2>
          <div className="da-view-scroll">
            <img
              src={viewUrl || request.preview.url}
              alt="The customer's finished frame"
              style={{ width: `${zoom}%` }}
            />
          </div>
          {!viewUrl && !viewFailed && <p className="da-muted">Drawing the full-size view... (showing the customer's preview)</p>}
          {viewFailed && <p className="da-muted">Showing the customer's preview image.</p>}
          <label className="da-zoom">
            Zoom {zoom}%
            <input type="range" min={100} max={400} step={25} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
          </label>
          <a className="da-button" href={downloadUrl(request.preview.url)}>Download customer preview</a>
        </section>

        <div className="da-side">

          {/* ================= CUSTOMER ================= */}

          <section className="da-panel">
            <h2>Customer</h2>
            <p><strong>{contact.name}</strong></p>
            <div className="da-line">
              <span>Phone</span>
              <span>
                <a href={`tel:+${phoneDigits}`}>{contactPhone(contact)}</a>{" "}
                <span className="da-muted">({contact.hasWhatsapp ? "WhatsApp" : "no WhatsApp"})</span>
              </span>
            </div>
            <div className="da-line">
              <span>Email</span>
              <span>
                {contact.email
                  ? <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  : <span className="da-muted">Not given</span>}
              </span>
            </div>
            <div className="da-line">
              <span>Address</span>
              <span className="da-pre">{contact.address}</span>
            </div>
            <div className="da-actions">
              {contact.hasWhatsapp && (
                <a className="da-button da-primary" href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">
                  Chat on WhatsApp
                </a>
              )}
              <a className="da-button" href={`tel:+${phoneDigits}`}>Call</a>
              {contact.email && <a className="da-button" href={`mailto:${contact.email}`}>Email</a>}
            </div>
            {contact.notes && <p className="da-pre"><b>Customer notes:</b> {contact.notes}</p>}
          </section>

          {/* ================= PRICE ================= */}

          <section className="da-panel">
            <h2>Price</h2>
            {request.priceBreakdown.map((line, index) => (
              <div className="da-line" key={index}>
                <span>{line.label}</span>
                <span>{formatMoney(line.amount)}</span>
              </div>
            ))}
            <div className="da-line da-total">
              <span>Total</span>
              <span>{formatMoney(request.total)}</span>
            </div>
            {request.gift?.slug && (
              <p>Gift: <a href={`/gifts/${request.gift.slug}`} target="_blank" rel="noreferrer">{request.gift.title}</a></p>
            )}
            {request.artwork?.slug && (
              <p>Inspired by: <a href={`/artworks/${request.artwork.slug}`} target="_blank" rel="noreferrer">{request.artwork.title}</a></p>
            )}
          </section>

        </div>
      </div>

      {/* ================= PRINT FILE ================= */}

      <section className="da-panel">
        <h2>Print file</h2>
        <p className="da-muted">
          Background, photos and quotes only: no frame and no pencil arts (their places stay empty).
          Exactly {artW}×{artH} in at {PRINT_DPI} DPI ({artW * PRINT_DPI}×{artH * PRINT_DPI} px), using the original photos.
          {clearGlass && " Clear glass: the background is transparent."}
        </p>
        <div className="da-actions">
          <button type="button" className="da-button da-primary" disabled={Boolean(busy)} onClick={() => downloadPrint("png")}>
            {busy === "png" ? "Making PNG..." : "Download print PNG"}
          </button>
          <button type="button" className="da-button da-primary" disabled={Boolean(busy)} onClick={() => downloadPrint("pdf")}>
            {busy === "pdf" ? "Making PDF..." : "Download print PDF"}
          </button>
        </div>
        {resolutions.some((r) => r.low) && (
          <p className="da-warning" role="alert">
            Low resolution: {resolutions.filter((r) => r.low).map((r) => `photo ${r.index} (${r.dpi} DPI)`).join(", ")}.
            These may print soft at their placed size.
          </p>
        )}
      </section>

      {/* ================= CARVING ================= */}

      <section className="da-panel">
        <h2>Pencil arts to carve ({pencils.length})</h2>
        {pencils.length === 0 && <p className="da-muted">No pencil arts in this frame.</p>}
        {pencils.map((item, index) => (
          <div className="da-pencil" key={item.id}>
            {fontsReady && (
              <div className="da-pencil-svg" dangerouslySetInnerHTML={{ __html: pencilSVG(item.p) }} />
            )}
            <dl>
              <dt>Pencil {index + 1}</dt>
              <dd className="da-carve-text">“{item.p.text}”</dd>
              <dt>Lettering</dt>
              <dd>{fontLabel(item.p.font)}</dd>
              <dt>Pencil</dt>
              <dd>{item.p.kind === "carp" ? "Carpenter (flat)" : "Hexagonal"}, {colorName(item.p.color)}</dd>
              <dt>Carving</dt>
              <dd>{item.p.ends === 2 ? "Both ends sharpened (text in the middle)" : "One end"}</dd>
              <dt>Symbols</dt>
              <dd>
                {item.p.syms.length
                  ? <ol>{item.p.syms.map((symbol, i) => <li key={i}>{symbolLabel(symbol)}</li>)}</ol>
                  : "None"}
              </dd>
            </dl>
          </div>
        ))}
      </section>

      {/* ================= FRAME AND PHOTOS ================= */}

      <section className="da-panel">
        <h2>Frame</h2>
        <div className="da-line"><span>Size</span><span>{design.frame.size.replace("x", "×")} in, {design.frame.orientation === "L" ? "landscape" : "portrait"}</span></div>
        <div className="da-line"><span>Background</span><span>{colorName(design.frame.background)}</span></div>
        <div className="da-line"><span>Thickness</span><span>{design.frame.thickness} in</span></div>
        <div className="da-line"><span>Frame colour</span><span>{colorName(design.frame.frameColor)}</span></div>
        <div className="da-line"><span>Quotes</span><span>{design.items.filter((item) => item.type === "text").length}</span></div>

        <h3>Original photos ({photos.length})</h3>
        <div className="da-photos">
          {resolutions.map(({ photo, index, dpi, low }) =>
            photo ? (
              <a key={photo.publicId} className="da-photo" href={downloadUrl(photo.url)}>
                <img src={resizedUrl(photo.url, 300)} alt={`Photo ${index}`} loading="lazy" />
                <span>
                  Photo {index}: {photo.width}×{photo.height}
                  {dpi ? ` · ${dpi} DPI placed` : ""}
                  {low ? " ⚠" : ""}
                </span>
              </a>
            ) : null
          )}
        </div>
      </section>

      {/* ================= VIVEK'S NOTES ================= */}

      <section className="da-panel">
        <h2>Your notes</h2>
        <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Private notes (only you see these)" />
        <div className="da-actions">
          <button type="button" className="da-button da-primary" onClick={() => save({ notes }, "Notes saved.")}>Save notes</button>
          <button type="button" className="da-button da-danger" onClick={remove}>Delete request</button>
        </div>
        <p className="da-muted">
          History: {request.statusHistory.map((entry) => `${STATUS_LABELS[entry.status]} (${formatDate(entry.at)})`).join(" → ")}
        </p>
      </section>

    </article>
  )
}

export default DesignRequestDetail
