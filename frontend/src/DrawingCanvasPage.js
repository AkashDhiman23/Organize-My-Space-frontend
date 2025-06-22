import React, { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./DrawingCanvasPage.css";

/* ---------- Tool types and icons ---------- */
const TOOL_TYPES = {
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  LINE: "line",
  TRIANGLE: "triangle",
  PENCIL: "pencil",
  MEASUREMENT: "measurement",
  MOVE: "move",
  ERASER: "eraser",
  TEXT: "text",
};

const ICONS = {
  [TOOL_TYPES.RECTANGLE]: "bi-square",
  [TOOL_TYPES.CIRCLE]: "bi-circle",
  [TOOL_TYPES.LINE]: "bi-slash-lg",
  [TOOL_TYPES.TRIANGLE]: "bi-triangle",
  [TOOL_TYPES.PENCIL]: "bi-pencil",
  [TOOL_TYPES.MEASUREMENT]: "bi-rulers",
  [TOOL_TYPES.MOVE]: "bi-arrows-move",
  [TOOL_TYPES.ERASER]: "bi-eraser",
  [TOOL_TYPES.TEXT]: "bi-type",
};

const TOOL_ORDER = [
  TOOL_TYPES.RECTANGLE,
  TOOL_TYPES.CIRCLE,
  TOOL_TYPES.LINE,
  TOOL_TYPES.TRIANGLE,
  TOOL_TYPES.PENCIL,
  TOOL_TYPES.MEASUREMENT,
  TOOL_TYPES.MOVE,
  TOOL_TYPES.ERASER,
  TOOL_TYPES.TEXT,
];

export default function DrawingCanvasPage() {
  const { customerId } = useParams();
  const [query] = useSearchParams();
  const drawingNum = query.get("drawingNum") ?? "1";
  const navigate = useNavigate();

  const canvasRef = useRef(null);

  /* ---------- State ---------- */
  const [tool, setTool] = useState(TOOL_TYPES.RECTANGLE);
  const [shapes, setShapes] = useState([]);
  const [curr, setCurr] = useState(null);
  const [selIdx, setSelIdx] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(18);

  const [popup, setPopup] = useState(null);
  const [textEdit, setTextEdit] = useState(null);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const pushUndo = useCallback(
    (snap) => {
      setUndoStack((u) => [...u, snap]);
      setRedoStack([]);
    },
    [setUndoStack, setRedoStack]
  );

  /* Shift key state for snapping */
  const [shiftHeld, setShiftHeld] = useState(false);
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Shift" && setShiftHeld(true);
    const onKeyUp = (e) => e.key === "Shift" && setShiftHeld(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  /* ---------- Helper Functions ---------- */
  const cursorPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const hit = (shape, x, y) => {
    switch (shape.type) {
      case TOOL_TYPES.RECTANGLE:
      case TOOL_TYPES.TEXT:
        return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
      case TOOL_TYPES.CIRCLE:
        return (x - shape.x) ** 2 + (y - shape.y) ** 2 <= shape.radius ** 2;
      case TOOL_TYPES.LINE:
      case TOOL_TYPES.MEASUREMENT: {
        const { x1, y1, x2, y2 } = shape;
        const dist =
          Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.hypot(y2 - y1, x2 - x1);
        return dist < 6;
      }
      case TOOL_TYPES.TRIANGLE: {
        const x0 = shape.x,
          y0 = shape.y + shape.height,
          x1 = shape.x + shape.width / 2,
          y1 = shape.y,
          x2 = shape.x + shape.width,
          y2 = shape.y + shape.height;
        const A = 0.5 * (-y1 * x2 + y0 * (-x1 + x2) + y1 * x0 + y2 * (x1 - x0));
        const s = (1 / (2 * A)) * (y0 * x2 - x0 * y2 + (y2 - y0) * x + (x0 - x2) * y);
        const t = (1 / (2 * A)) * (x0 * y1 - y0 * x1 + (y0 - y1) * x + (x1 - x0) * y);
        return s >= 0 && t >= 0 && s + t <= 1;
      }
      case TOOL_TYPES.PENCIL:
        return shape.points.some((p) => Math.abs(p.x - x) < 6 && Math.abs(p.y - y) < 6);
      default:
        return false;
    }
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY, size = 8) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.translate(toX, toY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size / 2);
    ctx.lineTo(-size, -size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const snapLine = (x1, y1, x2, y2, shiftHeld) => {
    if (!shiftHeld) return { x2, y2 };
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);

    if (dx < dy / 2) return { x2: x1, y2 };
    if (dy < dx / 2) return { x2, y2: y1 };

    const sx = x2 >= x1 ? 1 : -1;
    const sy = y2 >= y1 ? 1 : -1;
    const d = Math.min(dx, dy);
    return { x2: x1 + sx * d, y2: y1 + sy * d };
  };

  /* ---------- Render shapes ---------- */
  const renderShape = (ctx, shape, { highlight = false, preview = false } = {}) => {
    ctx.save();

    ctx.strokeStyle = preview ? strokeColor : shape.strokeColor || "#000";
    ctx.fillStyle = preview ? fillColor : shape.fillColor || "transparent";
    ctx.lineWidth = preview ? strokeWidth : shape.strokeWidth || 1;
    if (preview) ctx.setLineDash([6, 4]);
    if (highlight) {
      ctx.shadowColor = "rgba(0,123,255,0.5)";
      ctx.shadowBlur = 8;
    }

    switch (shape.type) {
      case TOOL_TYPES.RECTANGLE:
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;

      case TOOL_TYPES.CIRCLE:
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;

      case TOOL_TYPES.TRIANGLE:
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y + shape.height);
        ctx.lineTo(shape.x + shape.width / 2, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case TOOL_TYPES.LINE:
      case TOOL_TYPES.MEASUREMENT: {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();

        drawArrow(ctx, shape.x2, shape.y2, shape.x1, shape.y1);
        drawArrow(ctx, shape.x1, shape.y1, shape.x2, shape.y2);

        const label = shape.measurementText || `${Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1).toFixed(1)}px`;
        const midX = (shape.x1 + shape.x2) / 2;
        const midY = (shape.y1 + shape.y2) / 2;
        const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        const offset = 15;
        const offsetX = offset * Math.cos(angle + Math.PI / 2);
        const offsetY = offset * Math.sin(angle + Math.PI / 2);

        ctx.font = "13px Inter, sans-serif";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(label, midX + offsetX, midY + offsetY);
        break;
      }

      case TOOL_TYPES.PENCIL:
        ctx.beginPath();
        shape.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
        break;

      case TOOL_TYPES.TEXT:
        ctx.font = `${shape.fontSize}px Inter`;
        ctx.fillStyle = shape.fillColor || "transparent";
        ctx.fillText(shape.text || "", shape.x + 4, shape.y + 4);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;

      default:
        break;
    }

    ctx.restore();
  };

  const repaint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape, i) => renderShape(ctx, shape, { highlight: i === selIdx }));
    if (curr) renderShape(ctx, curr, { preview: true });
  };

  useEffect(repaint, [shapes, curr, selIdx, strokeColor, fillColor, strokeWidth, fontSize]);

  /* ---------- Mouse handlers ---------- */
  const ERASER_RADIUS = 12;

  const startDraw = (e) => {
    const { x, y } = cursorPos(e);

    if (tool === TOOL_TYPES.MOVE) {
      const idx = shapes.findIndex((shape) => hit(shape, x, y));
      setSelIdx(idx !== -1 ? idx : null);
      setCurr({ lastX: x, lastY: y });
      setPopup(null);
      setTextEdit(null);
      return;
    }

    if (tool === TOOL_TYPES.ERASER) {
      setShapes((prev) => prev.filter((shape) => !hit(shape, x, y)));
      setSelIdx(null);
      setCurr({ lastX: x, lastY: y });
      setIsDraw(true);
      setPopup(null);
      setTextEdit(null);
      return;
    }

    pushUndo(shapes);
    setIsDraw(true);
    setPopup(null);
    setTextEdit(null);

    switch (tool) {
      case TOOL_TYPES.RECTANGLE:
      case TOOL_TYPES.TRIANGLE:
      case TOOL_TYPES.TEXT:
        setCurr({ type: tool, x, y, width: 0, height: 0, text: "", fontSize, fillColor });
        break;
      case TOOL_TYPES.CIRCLE:
        setCurr({ type: tool, x, y, radius: 0, fillColor });
        break;
      case TOOL_TYPES.LINE:
      case TOOL_TYPES.MEASUREMENT:
        setCurr({ type: tool, x1: x, y1: y, x2: x, y2: y, measurementText: "" });
        break;
      case TOOL_TYPES.PENCIL:
        setCurr({ type: tool, points: [{ x, y }] });
        break;
      default:
        break;
    }
  };

  const moveDraw = (e) => {
    const { x, y } = cursorPos(e);

    if (tool === TOOL_TYPES.PENCIL && isDraw) {
      setCurr((p) => ({ ...p, points: [...p.points, { x, y }] }));
      return;
    }

    if (tool === TOOL_TYPES.MOVE && selIdx !== null && e.buttons) {
      const dx = x - curr.lastX;
      const dy = y - curr.lastY;
      setShapes((prev) => {
        const next = [...prev];
        const sh = { ...next[selIdx] };

        if ([TOOL_TYPES.LINE, TOOL_TYPES.MEASUREMENT].includes(sh.type)) {
          sh.x1 += dx;
          sh.y1 += dy;
          sh.x2 += dx;
          sh.y2 += dy;
        } else if (sh.type === TOOL_TYPES.PENCIL) {
          sh.points = sh.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        } else {
          sh.x += dx;
          sh.y += dy;
        }

        next[selIdx] = sh;
        return next;
      });
      setCurr({ lastX: x, lastY: y });
      return;
    }

    if (tool === TOOL_TYPES.ERASER && isDraw) {
      setShapes((prev) =>
        prev
          .map((sh) => {
            if (sh.type === TOOL_TYPES.PENCIL) {
              const filteredPoints = sh.points.filter((p) => Math.hypot(p.x - x, p.y - y) > ERASER_RADIUS);
              if (filteredPoints.length === 0) return null;
              return { ...sh, points: filteredPoints };
            }
            return sh;
          })
          .filter(Boolean)
      );
      return;
    }

    if (!isDraw || !curr) return;

    switch (curr.type) {
      case TOOL_TYPES.RECTANGLE:
      case TOOL_TYPES.TRIANGLE:
      case TOOL_TYPES.TEXT:
        setCurr((p) => ({ ...p, width: x - p.x, height: y - p.y }));
        break;
      case TOOL_TYPES.CIRCLE:
        setCurr((p) => ({ ...p, radius: Math.hypot(x - p.x, y - p.y) }));
        break;
      case TOOL_TYPES.LINE:
      case TOOL_TYPES.MEASUREMENT: {
        const { x2, y2 } = snapLine(curr.x1, curr.y1, x, y, shiftHeld);
        setCurr((p) => ({ ...p, x2, y2 }));
        break;
      }
      default:
        break;
    }
  };

  const endDraw = () => {
    if (isDraw && curr) {
      const newShape = { ...curr, strokeColor, strokeWidth, fillColor: curr.fillColor || fillColor };
      setShapes([...shapes, newShape]);

      if (curr.type === TOOL_TYPES.MEASUREMENT) {
        const idx = shapes.length;
        const midX = (curr.x1 + curr.x2) / 2;
        const midY = (curr.y1 + curr.y2) / 2;
        setPopup({ x: midX, y: midY, shapeIdx: idx, text: "" });
        setSelIdx(idx);
      }

      if (curr.type === TOOL_TYPES.TEXT) {
        const idx = shapes.length;
        setTextEdit({
          x: curr.x + 4,
          y: curr.y + 4,
          w: Math.max(curr.width - 8, 40),
          h: Math.max(curr.height - 8, 30),
          shapeIdx: idx,
          value: "",
        });
      }
    }
    setIsDraw(false);
    setCurr(null);
  };

  /* ---------- Undo / Redo / Clear ---------- */
  const undo = () => {
    if (!undoStack.length) return;
    setRedoStack((r) => [shapes, ...r]);
    const last = [...undoStack];
    const prev = last.pop();
    setUndoStack(last);
    setShapes(prev);
    setPopup(null);
    setTextEdit(null);
  };

  const redo = () => {
    if (!redoStack.length) return;
    setUndoStack((u) => [...u, shapes]);
    const [next, ...rest] = redoStack;
    setRedoStack(rest);
    setShapes(next);
    setPopup(null);
    setTextEdit(null);
  };

  const clearCanvas = () => {
    setShapes([]);
    setUndoStack([]);
    setRedoStack([]);
    setCurr(null);
    setSelIdx(null);
    setPopup(null);
    setTextEdit(null);
  };

  /* ---------- Popup handlers ---------- */
  const onPopupChange = (e) => {
    const text = e.target.value;
    setPopup((p) => ({ ...p, text }));
    setShapes((prev) => {
      const next = [...prev];
      if (popup?.shapeIdx !== undefined) {
        next[popup.shapeIdx].measurementText = text;
      }
      return next;
    });
  };

  const onPopupClose = () => setPopup(null);

  /* ---------- Text editing ---------- */
  const onTextChange = (e) => {
    const value = e.target.value;
    setTextEdit((t) => ({ ...t, value }));
    setShapes((prev) => {
      const next = [...prev];
      if (textEdit?.shapeIdx !== undefined) {
        next[textEdit.shapeIdx].text = value;
      }
      return next;
    });
  };

  const onTextBlur = () => setTextEdit(null);

  /* ---------- Export as PDF ---------- */
   const saveDrawing = async () => {
    const canvas = canvasRef.current;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
    const blob = pdf.output("blob");
    const form = new FormData();
    form.append("file", blob, `drawing${drawingNum}.pdf`);
    form.append("drawing_num", drawingNum);
    try {
      const res = await fetch(
        `http://localhost:8000/accounts/customers/${customerId}/project/drawing/`,
        {
          method: "POST",
          body: form,
                    credentials: "include",
        }
      );
      if (res.ok) {
        alert("Drawing saved successfully!");
      } else {
        alert("Failed to save drawing.");
      }
    } catch (error) {
      alert("Error saving drawing: " + error.message);
    }
  };

  /* ---------- Render ---------- */
  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <button className="btn back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <div>
          <h4>
            Drawing Canvas <br />
            <small className="text-primary">Customer: {customerId || "Guest"}</small>
          </h4>
        </div>
        <div style={{ width: "10%" }} /> {/* empty for spacing */}
      </div>

      <div className="flex-grow-1 d-flex">
        {/* Left sidebar (Tools) */}
        <aside className="sidebar-left" aria-label="Tool selection">
          <ul>
            {TOOL_ORDER.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  className={tool === key ? "btn btn-primary" : "btn btn-outline-primary"}
                  onClick={() => {
                    setTool(key);
                    setSelIdx(null);
                    setPopup(null);
                    setTextEdit(null);
                  }}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  aria-pressed={tool === key}
                >
                  <i className={ICONS[key]} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Canvas container */}
        <main className="canvas-area">
          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            style={{ cursor: tool === TOOL_TYPES.MOVE ? "move" : "crosshair" }}
            aria-label="Drawing canvas"
          />
          {/* Popup input for measurement */}
          {popup && (
            <input
              className="measurement-popup"
              style={{ left: popup.x, top: popup.y }}
              value={popup.text}
              onChange={onPopupChange}
              onBlur={onPopupClose}
              autoFocus
              aria-label="Measurement input"
            />
          )}
          {/* Text editing textarea */}
          {textEdit && (
            <textarea
              className="text-edit"
              style={{ left: textEdit.x, top: textEdit.y, width: textEdit.w, height: textEdit.h }}
              value={textEdit.value}
              onChange={onTextChange}
              onBlur={onTextBlur}
              autoFocus
              aria-label="Text editing input"
            />
          )}
        </main>

        {/* Right sidebar (Settings & Actions) */}
        <aside className="sidebar-right" aria-label="Settings and actions">
          <h5>Settings</h5>

          <label htmlFor="stroke-color" className="form-label">
            Stroke Color
          </label>
          <input
            id="stroke-color"
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
          />

          <label htmlFor="fill-color" className="form-label mt-3">
            Fill Color
          </label>
          <input
            id="fill-color"
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
          />

          <label htmlFor="stroke-width" className="form-label mt-3">
            Stroke Width
          </label>
          <input
            id="stroke-width"
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />

          <label htmlFor="font-size" className="form-label mt-3">
            Font Size
          </label>
          <input
            id="font-size"
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />

          {/* Buttons */}
          <button className="btn btn-outline-primary mt-4" onClick={undo} disabled={!undoStack.length}>
            <i className="bi bi-arrow-counterclockwise"></i> Undo
          </button>
          <button className="btn btn-outline-primary mt-2" onClick={redo} disabled={!redoStack.length}>
            <i className="bi bi-arrow-clockwise"></i> Redo
          </button>
          <button className="btn btn-outline-danger mt-2" onClick={clearCanvas}>
            <i className="bi bi-trash"></i> Clear
          </button>
          <button className="btn btn-outline-success mt-2" onClick={saveDrawing}>
            <i className="bi bi-file-earmark-pdf"></i> Save Drawing
          </button>
        </aside>
      </div>
    </>
  );
}
