import { pencilSVG } from "./pencilArt"
import { SHAPES, photoGeom } from "./photoShapes"
import { rgba } from "./designerOptions"
import { S, keepIn } from "./designerStore"

// ================= BOARD ITEM =================
// Port of the prototype's itemHTML. Sizes use cqw (percent of the
// board width) so items scale with the board.
// Layers: photos (1) below quotes (2) below pencil arts (3).

function BoardItem({ item }) {
  const isPencil = item.type === "pencil"
  const className = "it" + (isPencil ? " pc" : "") + (item.id === S.sel ? " sel" : "")
  const shadow = item.sho && !isPencil
    ? `${item.shx}cqw ${item.shy}cqw ${item.shb}cqw ${rgba(item.shc, item.sha)}`
    : ""

  const style = {
    zIndex: item.type === "photo" ? 1 : item.type === "text" ? 2 : 3,
    left: `${item.x}%`,
    top: `${item.y}%`,
    opacity: isPencil ? 1 : item.op / 100,
    transform: `rotate(${item.rot}deg)`,
  }

  if (item.type === "photo") {
    const shape = SHAPES[item.shape] || SHAPES.free
    const geom = photoGeom(item)
    style.width = `${item.w}%`
    if (shadow) style.filter = `drop-shadow(${shadow})`

    return (
      <div className={className} data-id={item.id} style={style}>
        <div
          className="ph"
          style={{
            aspectRatio: geom.A,
            ...(shape.m ? shape.m : { border: `${item.bd}cqw solid ${item.bc}` }),
            ...(shape.r ? { borderRadius: shape.r } : {}),
          }}
        >
          <img
            src={item.src}
            alt=""
            draggable="false"
            style={geom.img}
            onLoad={keepIn}
          />
        </div>
      </div>
    )
  }

  if (item.type === "text") {
    Object.assign(style, {
      fontSize: `${item.fs}cqw`,
      fontFamily: `'${item.font}', cursive`,
      color: item.color,
      fontWeight: item.b ? 700 : 400,
      fontStyle: item.i ? "italic" : "normal",
      letterSpacing: `${item.ls}cqw`,
      textAlign: item.al,
    })
    if (shadow) style.textShadow = shadow
    if (item.sw > 0) {
      style.WebkitTextStroke = `${item.sw}cqw ${item.sc}`
      style.paintOrder = "stroke fill"
    }

    return (
      <div className={className} data-id={item.id} style={style}>
        {item.text}
      </div>
    )
  }

  style.width = `${item.w}%`

  return (
    <div
      className={className}
      data-id={item.id}
      style={style}
      dangerouslySetInnerHTML={{ __html: pencilSVG(item.p) }}
    />
  )
}

export default BoardItem
