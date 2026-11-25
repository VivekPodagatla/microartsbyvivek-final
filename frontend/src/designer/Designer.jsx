import { useEffect, useSyncExternalStore } from "react"

import "./designer.css"

import { loadQuoteFonts, loadPencilFonts } from "./designerFonts"
import PencilStep from "./PencilStep"
import FrameStep from "./FrameStep"
import SourceBanner from "./SourceBanner"
import SendStep from "./SendStep"
import {
  S,
  subscribe,
  getVersion,
  setTab,
  refresh,
  resize,
} from "./designerStore"

// ================= DESIGN YOUR GIFT IDEA =================
// Lazy-loaded from App at /design. Unlike the rest of the site,
// the designer keeps its own state (designerStore.js), because it
// is a self-contained tool with dozens of settings.

function Designer({
  leaveDesigner,
  designerBackLabel,
  designerSource,
  designerGift,
  designerArtwork,
  personalizedLoading,
  artworksLoading,
  openDesigner,
}) {
  useSyncExternalStore(subscribe, getVersion)

  // Pencil lettering is measured on a canvas, so redraw once the
  // fonts have loaded (and whenever another font finishes loading).
  // Quote fonts come from Google Fonts, only on this page.
  useEffect(() => {
    let active = true
    const redraw = () => {
      if (active) refresh()
    }

    loadQuoteFonts()
    loadPencilFonts().then(redraw)
    document.fonts.ready.then(redraw)
    document.fonts.addEventListener?.("loadingdone", redraw)
    window.addEventListener("resize", resize)

    return () => {
      active = false
      document.fonts.removeEventListener?.("loadingdone", redraw)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className="designer">

      <button type="button" className="back-button" onClick={leaveDesigner}>
        {designerBackLabel}
      </button>

      <header>
        <h1>Design Your Gift Idea</h1>
        <p>Design your pencil carving, then frame it your way.</p>
      </header>

      {/* The gift or artwork this design was opened from. */}
      {designerSource && !S.send.sent && (
        <SourceBanner
          designerSource={designerSource}
          designerGift={designerGift}
          designerArtwork={designerArtwork}
          loading={designerSource.type === "gift" ? personalizedLoading : artworksLoading}
          removeSource={() => openDesigner()}
        />
      )}

      {!S.send.sent && (
        <nav className="tabs">
          {["1 Carve the pencil", "2 Build the frame", "3 Send"].map((label, index) => (
            <button
              type="button"
              key={label}
              className={`tab${S.tab === index ? " on" : ""}`}
              disabled={S.send.busy}
              onClick={() => setTab(index)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {S.tab === 0 ? (
        <PencilStep />
      ) : S.tab === 1 ? (
        <FrameStep gift={designerGift} artwork={designerArtwork} />
      ) : (
        <SendStep gift={designerGift} artwork={designerArtwork} leaveDesigner={leaveDesigner} />
      )}

      <div className={`toast${S.toast ? " on" : ""}`} role="status">
        {S.toast}
      </div>

    </div>
  )
}

export default Designer
