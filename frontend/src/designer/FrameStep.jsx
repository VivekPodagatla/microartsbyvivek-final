import {
  FRAME_SIZES,
  FRAME_COLORS,
} from "../../../shared/designRules.js"
import { formatMoney } from "../../../shared/designPricing.js"
import { BACKGROUNDS } from "./designerOptions"
import BoardItem from "./BoardItem"
import ItemTools from "./ItemTools"
import {
  S,
  frameDims,
  boardScale,
  designPrice,
  setBoard,
  setFrame,
  addPencil,
  addQuote,
  addPhoto,
  pointerDown,
  pointerMove,
  pointerUp,
  setTab,
} from "./designerStore"

// ================= STEP 2: BUILD THE FRAME =================

const THICKNESSES = [
  [0.5, "½ inch"],
  [1, "1 inch"],
  [1.5, "1½ inch"],
]

function FrameStep({ gift, artwork }) {
  const [w, h] = frameDims()
  const k = boardScale()
  const t = S.frame.thickness
  const clear = S.frame.background === "transparent"
  const { lines, total } = designPrice()
  const chip = (on) => `chip${on ? " on" : ""}`

  return (
    <section className="dz-layout">

      {/* Board stays pinned while the tools scroll underneath
          (phones) or beside it (desktop). */}
      <div className="dz-preview">
      <div className="wrap stick">
        <div
          className="frame"
          style={{ padding: t * k, background: S.frame.frameColor }}
        >
          <div
            ref={setBoard}
            className={`inner${clear ? " clear" : ""}`}
            style={{
              width: w * k,
              height: h * k,
              background: clear ? undefined : S.frame.background,
            }}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
          >
            {S.items.map((item) => <BoardItem key={item.id} item={item} />)}
          </div>
        </div>
      </div>
      </div>

      <div className="dz-controls">

      <div className="card">
        <ItemTools />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add to your frame</h3>
        <div className="add">
          <label className="chip file-chip">
            Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files[0]
                if (file) addPhoto(file)
                event.target.value = ""
              }}
            />
          </label>
          <button type="button" className="chip" onClick={addQuote}>Quote</button>
        </div>
        <div className="add" style={{ marginTop: 8 }}>
          {S.arts.map((_, index) => (
            <button type="button" key={index} className="chip" onClick={() => addPencil(index)}>
              + Pencil art {index + 1}
            </button>
          ))}
        </div>

        <h3>Size</h3>
        <div className="chips">
          {Object.keys(FRAME_SIZES).map((size) => (
            <button type="button" key={size} className={chip(S.frame.size === size)} onClick={() => setFrame("size", size)}>
              {size.replace("x", "×")} in
            </button>
          ))}
        </div>
        <div className="chips" style={{ marginTop: 8 }}>
          <button type="button" className={chip(S.frame.orientation === "L")} onClick={() => setFrame("orientation", "L")}>
            Landscape
          </button>
          <button type="button" className={chip(S.frame.orientation === "P")} onClick={() => setFrame("orientation", "P")}>
            Portrait
          </button>
        </div>

        <h3>Background (glass on both sides when clear)</h3>
        <div className="sws">
          <button
            type="button"
            className={`sw clear${clear ? " on" : ""}`}
            aria-label="Clear glass"
            onClick={() => setFrame("background", "transparent")}
          />
          {BACKGROUNDS.map((color) => (
            <button
              type="button"
              key={color}
              className={`sw${S.frame.background === color ? " on" : ""}`}
              style={{ background: color }}
              aria-label={`Background ${color}`}
              onClick={() => setFrame("background", color)}
            />
          ))}
          <input
            type="color"
            className="sw-picker"
            aria-label="Custom background"
            value={clear ? "#ffffff" : S.frame.background}
            onChange={(event) => setFrame("background", event.target.value)}
          />
        </div>

        <h3>Frame thickness</h3>
        <div className="chips">
          {THICKNESSES.map(([value, label]) => (
            <button type="button" key={value} className={chip(S.frame.thickness === value)} onClick={() => setFrame("thickness", value)}>
              {label}
            </button>
          ))}
        </div>

        <h3>Frame colour</h3>
        <div className="sws">
          {FRAME_COLORS.map(([name, color]) => (
            <button
              type="button"
              key={color}
              className={`sw${S.frame.frameColor === color ? " on" : ""}`}
              style={{ background: color }}
              aria-label={`${name} frame`}
              onClick={() => setFrame("frameColor", color)}
            />
          ))}
        </div>
      </div>

      {/* ================= RECEIPT ================= */}

      <div className="rc">
        <h2>Your frame</h2>
        {lines.map((line, index) => (
          <div className="l" key={index}>
            <span>{line.label}</span>
            <span>{formatMoney(line.amount)}</span>
          </div>
        ))}
        <div className="t">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
        <small>Background: {clear ? "clear glass" : S.frame.background}.</small>
        {gift && (
          <small>
            Sent with your request for: {gift.title}. This total is your
            final price.
          </small>
        )}
        {artwork && <small>Inspired by the artwork: {artwork.title}.</small>}
      </div>

      <button type="button" className="cta" style={{ marginTop: 12 }} onClick={() => setTab(2)}>
        {gift ? "Attach Design to Gift Request" : "Attach Design to My Request"}
      </button>

      </div>

    </section>
  )
}

export default FrameStep
