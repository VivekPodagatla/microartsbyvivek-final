import {
  PENCIL_COLORS,
  REGULAR_FONTS,
  SPECIAL_FONTS,
  MAX_ARTS,
  MAX_ART_TEXT,
  SYMBOL_NAMES,
} from "../../../shared/designRules.js"
import { artPrice, formatMoney } from "../../../shared/designPricing.js"
import { pencilSVG } from "./pencilArt"
import { SYMBOL_COLORS, SYMBOL_PRICE_HINT } from "./designerOptions"
import {
  S,
  currentArt,
  selectArt,
  addArt,
  deleteArt,
  setArt,
  setArtText,
  addSymbol,
  selectSymbol,
  deleteSymbol,
  setSymbolColor,
  setTab,
} from "./designerStore"

// ================= STEP 1: CARVE THE PENCIL =================

const chip = (on) => `chip${on ? " on" : ""}`

function FontChip({ font, art }) {
  const telugu = font === "Chathura"
  return (
    <button
      type="button"
      className={chip(art.font === font)}
      style={{
        fontFamily: `'${font}', cursive`,
        fontWeight: telugu ? 800 : 400,
        fontSize: telugu ? 20 : 16,
      }}
      onClick={() => setArt("font", font)}
    >
      {telugu ? "తెలుగు" : font}
    </button>
  )
}

function SymbolColorRow({ title, current, which }) {
  return (
    <>
      <h3>{title}</h3>
      <div className="sws">
        <button
          type="button"
          className={`sw none${!current ? " on" : ""}`}
          aria-label="No colour"
          onClick={() => setSymbolColor(which, "")}
        />
        {SYMBOL_COLORS.map((color, index) => (
          <button
            type="button"
            key={color}
            className={`sw${current === color ? " on" : ""}`}
            style={{ background: color }}
            aria-label={index ? color : "Yellow (preferred)"}
            onClick={() => setSymbolColor(which, color)}
          />
        ))}
        <input
          type="color"
          className="cpk"
          aria-label="Custom colour"
          value={current || "#f2c230"}
          onChange={(event) => setSymbolColor(which, event.target.value)}
        />
      </div>
    </>
  )
}

function PencilStep() {
  const art = currentArt()
  const price = artPrice(art)
  const symbol = art.syms[S.ss]

  return (
    <section className="dz-layout">

      {/* Preview: left column on desktop, top on phones. */}
      <div className="dz-preview">

      <div className="chips arts-row">
        {S.arts.map((_, index) => (
          <button
            type="button"
            key={index}
            className={chip(index === S.cur)}
            onClick={() => selectArt(index)}
          >
            Pencil art {index + 1}
          </button>
        ))}
        {S.arts.length < MAX_ARTS && (
          <button type="button" className="chip" onClick={addArt}>
            + New art
          </button>
        )}
        {S.arts.length > 1 && (
          <button type="button" className="mini" onClick={deleteArt}>
            Delete art {S.cur + 1}
          </button>
        )}
      </div>

      <div className="card stage">
        <div
          className="pencil-preview"
          dangerouslySetInnerHTML={{ __html: pencilSVG(art) }}
        />
      </div>

      <p className="hint art-price">
        <b>Art price: {formatMoney(price.price)}</b>
        {" · "}
        {price.characters} character{price.characters === 1 ? "" : "s"} × {formatMoney(price.rates.rate)}
        {price.symbols ? ` + symbols ${formatMoney(price.symbols)}` : ""}
        {price.minimumApplies ? `, minimum ${formatMoney(price.rates.min)} applies` : ""}
      </p>

      </div>

      <div className="dz-controls">

      <div className="card">

        <label>
          Name or message
          <input
            type="text"
            maxLength={MAX_ART_TEXT}
            value={art.text}
            onChange={(event) => setArtText(event.target.value)}
          />
        </label>

        <h3>Pencil type</h3>
        <div className="chips">
          <button type="button" className={chip(art.kind === "hex")} onClick={() => setArt("kind", "hex")}>
            Hexagonal pencil
          </button>
          <button type="button" className={chip(art.kind === "carp")} onClick={() => setArt("kind", "carp")}>
            Carpenter pencil
          </button>
        </div>

        <h3>Pencil colour</h3>
        <div className="sws">
          {PENCIL_COLORS.map(([name, color]) => (
            <button
              type="button"
              key={color}
              className={`sw${art.color === color ? " on" : ""}`}
              style={{ background: color }}
              aria-label={`${name} pencil`}
              onClick={() => setArt("color", color)}
            />
          ))}
        </div>

        <h3>Lettering: regular</h3>
        <div className="chips">
          {REGULAR_FONTS.map((font) => <FontChip key={font} font={font} art={art} />)}
        </div>

        <h3>Lettering: cursive and special</h3>
        <div className="chips">
          {SPECIAL_FONTS.map((font) => <FontChip key={font} font={font} art={art} />)}
        </div>

        <h3>Carving style</h3>
        <div className="chips">
          <button type="button" className={chip(art.ends === 2)} onClick={() => setArt("ends", 2)}>
            Both ends sharpened
          </button>
          <button type="button" className={chip(art.ends === 1)} onClick={() => setArt("ends", 1)}>
            One end
          </button>
        </div>

        <h3>Symbols after the text</h3>
        <div className="chips">
          {Object.entries(SYMBOL_NAMES).map(([type, name]) => (
            <button type="button" key={type} className="chip" onClick={() => addSymbol(type)}>
              {name}
            </button>
          ))}
        </div>
        <p className="hint" style={{ margin: "8px 0 0" }}>{SYMBOL_PRICE_HINT}</p>

        {art.syms.length ? (
          <div className="chips" style={{ marginTop: 10 }}>
            {art.syms.map((sym, index) => (
              <span className="sy" key={index}>
                <button type="button" className={chip(index === S.ss)} onClick={() => selectSymbol(index)}>
                  {SYMBOL_NAMES[sym.t]}
                </button>
                <button type="button" className="mini" aria-label="Remove symbol" onClick={() => deleteSymbol(index)}>
                  ✕
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="hint" style={{ marginTop: 10 }}>
            Tap a symbol above to add it after the text. Add as many as you like.
          </p>
        )}

        {symbol && symbol.t === "h1" && (
          <p className="hint" style={{ marginTop: 8 }}>
            Small hearts are carved into the lead, so they have no colour.
          </p>
        )}
        {symbol && symbol.t === "h3" && (
          <>
            <SymbolColorRow title="Outer heart colour" current={symbol.c} which={1} />
            <SymbolColorRow title="Inner heart colour" current={symbol.c2} which={2} />
          </>
        )}
        {symbol && (symbol.t === "h2" || symbol.t === "sm") && (
          <SymbolColorRow
            title={symbol.t === "sm" ? "Smile colour (yellow preferred)" : "Heart colour"}
            current={symbol.c}
            which={1}
          />
        )}

      </div>

      <button type="button" className="cta" onClick={() => setTab(1)}>
        Next: build the frame
      </button>

      </div>

    </section>
  )
}

export default PencilStep
