import { QUOTE_FONTS, TELUGU_FONTS } from "./designerOptions"
import { SHAPES } from "./photoShapes"
import {
  selectedItem,
  deleteItem,
  setItem,
  toggleItem,
  inputItem,
} from "./designerStore"

// ================= TOOLS FOR THE SELECTED ITEM =================
// Port of the prototype's drawSel.
// Pencil art: size and rotate only (no opacity, no shadow).

function Slider({ label, name, min, max, step, value }) {
  return (
    <label>
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => inputItem(name, event.target.value)}
      />
    </label>
  )
}

function ColorPicker({ label, name, value }) {
  return (
    <label>
      {label}
      <input
        type="color"
        className="cpk"
        value={value}
        onChange={(event) => inputItem(name, event.target.value)}
      />
    </label>
  )
}

function ItemTools() {
  const item = selectedItem()

  if (!item) {
    return (
      <p className="hint">
        Tap an item on the board to select it. Drag to move it, then use the tools here to style it.
      </p>
    )
  }

  const isText = item.type === "text"
  const isPhoto = item.type === "photo"
  const isPencil = item.type === "pencil"
  const name = isText ? "Quote" : isPhoto ? "Photo" : `Pencil art ${item.n || ""}`
  const shape = SHAPES[item.shape] || SHAPES.free

  return (
    <>
      <div className="row">
        <b>{name}</b>
        <button type="button" className="mini" onClick={deleteItem}>Remove</button>
      </div>

      {isText && (
        <>
          <label>
            Your message
            <textarea
              rows={2}
              value={item.text}
              onChange={(event) => inputItem("stext", event.target.value)}
            />
          </label>

          <div className="fscroll">
            {QUOTE_FONTS.map((font) => (
              <button
                type="button"
                key={font}
                className={`chip${font === item.font ? " on" : ""}`}
                style={{ fontFamily: `'${font}', cursive` }}
                onClick={() => setItem("font", font)}
              >
                {TELUGU_FONTS.includes(font) ? "తెలుగు" : font}
              </button>
            ))}
          </div>

          <div className="chips" style={{ marginTop: 6 }}>
            <button type="button" className={`chip${item.b ? " on" : ""}`} onClick={() => toggleItem("b")}>
              <b>B</b>
            </button>
            <button type="button" className={`chip${item.i ? " on" : ""}`} onClick={() => toggleItem("i")}>
              <i>I</i>
            </button>
            {["left", "center", "right"].map((align) => (
              <button
                type="button"
                key={align}
                className={`chip${item.al === align ? " on" : ""}`}
                onClick={() => setItem("al", align)}
              >
                {align}
              </button>
            ))}
          </div>

          <div className="g2">
            <ColorPicker label="Text colour" name="color" value={item.color} />
            <Slider label="Letter spacing" name="ls" min={-0.5} max={3} step={0.1} value={item.ls} />
            <ColorPicker label="Outline colour" name="sc" value={item.sc} />
            <Slider label="Outline width" name="sw" min={0} max={1} step={0.05} value={item.sw} />
          </div>
        </>
      )}

      {isPhoto && (
        <>
          <h3>Crop and shape</h3>
          <div className="fscroll">
            {Object.keys(SHAPES).map((key) => (
              <button
                type="button"
                key={key}
                className={`chip${key === item.shape ? " on" : ""}`}
                onClick={() => setItem("shape", key)}
              >
                {SHAPES[key].n}
              </button>
            ))}
          </div>

          {item.shape === "free" ? (
            <div className="g2">
              <Slider label="Crop left" name="cl" min={0} max={80} step={1} value={Math.round(item.cl * 100)} />
              <Slider label="Crop right" name="cr" min={0} max={80} step={1} value={Math.round(item.cr * 100)} />
              <Slider label="Crop top" name="ct" min={0} max={80} step={1} value={Math.round(item.ct * 100)} />
              <Slider label="Crop bottom" name="cb" min={0} max={80} step={1} value={Math.round(item.cb * 100)} />
            </div>
          ) : (
            <div className="g2">
              <Slider label="Zoom" name="z" min={1} max={3} step={0.05} value={item.z} />
              <Slider label="Move across" name="px" min={0} max={100} step={1} value={item.px} />
              <Slider label="Move down" name="py" min={0} max={100} step={1} value={item.py} />
            </div>
          )}

          {!shape.m && (
            <div className="g2">
              <Slider label="Border width" name="bd" min={0} max={3} step={0.1} value={item.bd} />
              <ColorPicker label="Border colour" name="bc" value={item.bc} />
            </div>
          )}
        </>
      )}

      <div className="g2">
        <Slider
          label="Size"
          name="size"
          min={isText ? 3 : 8}
          max={isText ? 20 : 95}
          step={0.5}
          value={isText ? item.fs : item.w}
        />
        <Slider label="Rotate" name="rot" min={-180} max={180} step={1} value={item.rot} />
        {!isPencil && (
          <Slider label="Opacity" name="op" min={10} max={100} step={1} value={item.op} />
        )}
      </div>

      {!isPencil && (
        <div className="sec">
          <label className="chk">
            <input
              type="checkbox"
              checked={Boolean(item.sho)}
              onChange={(event) => inputItem("sho", null, event.target.checked)}
            />
            {" "}Shadow
          </label>
          <div className="g2">
            <ColorPicker label="Shadow colour" name="shc" value={item.shc} />
            <Slider label="Shadow opacity" name="sha" min={0} max={100} step={1} value={item.sha} />
            <Slider label="Blur" name="shb" min={0} max={6} step={0.1} value={item.shb} />
            <Slider label="Across" name="shx" min={-5} max={5} step={0.1} value={item.shx} />
            <Slider label="Down" name="shy" min={-5} max={5} step={0.1} value={item.shy} />
          </div>
        </div>
      )}
    </>
  )
}

export default ItemTools
