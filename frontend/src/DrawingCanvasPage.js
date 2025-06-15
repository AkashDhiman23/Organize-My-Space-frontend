import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import "./DrawingCanvasPage.css";

/* ───── tool constants ───── */
const TOOL_TYPES = {
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  LINE: "line",
  MOVE: "move",
  ERASER: "eraser",
  TRIANGLE: "triangle",
  ELLIPSE: "ellipse",
};

export default function DrawingCanvasPage() {
  /* ───── routing ───── */
  const { customerId } = useParams();            // /draw/:customerId
  const [query]        = useSearchParams();      // ?drawingNum=2
  const drawingNum      = query.get("drawingNum") ?? "1";
  const navigate        = useNavigate();

  /* ───── canvas + drawing state ───── */
  const canvasRef                 = useRef(null);
  const [tool, setTool]           = useState(TOOL_TYPES.RECTANGLE);
  const [shapes, setShapes]       = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  /* ───────────────────────────────────────── helpers ───────────────────────────────────────── */

  /** low‑level util: mouse → canvas coords */
  const getCursor = (evt) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  /** erase helper: returns true if (x,y) is inside a shape  */
  const isPointInsideShape = (shape, x, y) => {
    switch (shape.type) {
      case TOOL_TYPES.RECTANGLE:
        return (
          x >= shape.x &&
          x <= shape.x + shape.width &&
          y >= shape.y &&
          y <= shape.y + shape.height
        );
      case TOOL_TYPES.CIRCLE: {
        const dx = x - shape.x;
        const dy = y - shape.y;
        return dx * dx + dy * dy <= shape.radius * shape.radius;
      }
      case TOOL_TYPES.LINE: {
        const { x1, y1, x2, y2 } = shape;
        const dist =
          Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
          Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        return dist < 5;
      }
      case TOOL_TYPES.TRIANGLE: {
        const x0 = shape.x;
        const y0 = shape.y + shape.height;
        const x1 = shape.x + shape.width / 2;
        const y1 = shape.y;
        const x2 = shape.x + shape.width;
        const y2 = shape.y + shape.height;
        const area = 0.5 * (-y1 * x2 + y0 * (-x1 + x2) + y1 * x0 + y2 * (x1 - x0));
        const s = (1 / (2 * area)) * (y0 * x2 - x0 * y2 + (y2 - y0) * x + (x0 - x2) * y);
        const t = (1 / (2 * area)) * (x0 * y1 - y0 * x1 + (y0 - y1) * x + (x1 - x0) * y);
        return s >= 0 && t >= 0 && s + t <= 1;
      }
      case TOOL_TYPES.ELLIPSE: {
        const dx = x - shape.x;
        const dy = y - shape.y;
        return (
          dx * dx / (shape.radiusX ** 2) + dy * dy / (shape.radiusY ** 2) <= 1
        );
      }
      default:
        return false;
    }
  };

  /** remove shapes under eraser */
  const eraseAt = (x, y) =>
    setShapes((prev) => prev.filter((s) => !isPointInsideShape(s, x, y)));

  /** clear entire canvas */
  const clearCanvas = () => {
    setShapes([]);
    setCurrentShape(null);
    setSelectedShapeIndex(null);
  };

  /** draw all shapes  */
  const drawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape, idx) => {
      ctx.save();
      if (idx === selectedShapeIndex) {
        ctx.strokeStyle = "#007bff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(0,123,255,0.5)";
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
      }

      switch (shape.type) {
        case TOOL_TYPES.RECTANGLE:
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case TOOL_TYPES.CIRCLE:
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case TOOL_TYPES.LINE:
          ctx.beginPath();
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.stroke();
          break;
        case TOOL_TYPES.TRIANGLE:
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y + shape.height);
          ctx.lineTo(shape.x + shape.width / 2, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.closePath();
          ctx.stroke();
          break;
        case TOOL_TYPES.ELLIPSE:
          ctx.beginPath();
          ctx.ellipse(
            shape.x,
            shape.y,
            shape.radiusX,
            shape.radiusY,
            0,
            0,
            2 * Math.PI
          );
          ctx.stroke();
          break;
        default:
          break;
      }
      ctx.restore();
    });
  };

  /** live preview while drawing */
  const drawCurrentShape = () => {
    if (!currentShape) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.strokeStyle = "#28a745";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;

    const s = currentShape;
    switch (s.type) {
      case TOOL_TYPES.RECTANGLE:
        ctx.strokeRect(s.x, s.y, s.width, s.height);
        break;
      case TOOL_TYPES.CIRCLE:
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case TOOL_TYPES.LINE:
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
        break;
      case TOOL_TYPES.TRIANGLE:
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + s.height);
        ctx.lineTo(s.x + s.width / 2, s.y);
        ctx.lineTo(s.x + s.width, s.y + s.height);
        ctx.closePath();
        ctx.stroke();
        break;
      case TOOL_TYPES.ELLIPSE:
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.radiusX, s.radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      default:
        break;
    }
    ctx.restore();
  };

  /* redraw whenever shapes/currentShape changes */
  const redraw = () => {
    drawShapes();
    drawCurrentShape();
  };
  useEffect(redraw, [shapes, currentShape]);

  /* ───── mouse events ───── */
  const startDrawing = (e) => {
    const { x, y } = getCursor(e);

    if (tool === TOOL_TYPES.MOVE) {
      const idx = shapes.findIndex((sh) => isPointInsideShape(sh, x, y));
      setSelectedShapeIndex(idx !== -1 ? idx : null);
      setCurrentShape({ lastX: x, lastY: y });
      return;
    }
    if (tool === TOOL_TYPES.ERASER) {
      eraseAt(x, y);
      return;
    }

    setIsDrawing(true);
    const base = { x, y };
    switch (tool) {
      case TOOL_TYPES.RECTANGLE:
        setCurrentShape({ ...base, type: tool, width: 0, height: 0 });
        break;
      case TOOL_TYPES.CIRCLE:
        setCurrentShape({ ...base, type: tool, radius: 0 });
        break;
      case TOOL_TYPES.LINE:
        setCurrentShape({ type: tool, x1: x, y1: y, x2: x, y2: y });
        break;
      case TOOL_TYPES.TRIANGLE:
        setCurrentShape({ ...base, type: tool, width: 0, height: 0 });
        break;
      case TOOL_TYPES.ELLIPSE:
        setCurrentShape({ ...base, type: tool, radiusX: 0, radiusY: 0 });
        break;
      default:
        break;
    }
  };

  const updateAction = (e) => {
    const { x, y } = getCursor(e);

    if (tool === TOOL_TYPES.MOVE && selectedShapeIndex !== null && e.buttons) {
      const dx = x - currentShape.lastX;
      const dy = y - currentShape.lastY;
      setShapes((prev) => {
        const next = [...prev];
        const sh = { ...next[selectedShapeIndex] };
        if (sh.type === TOOL_TYPES.LINE) {
          sh.x1 += dx; sh.y1 += dy; sh.x2 += dx; sh.y2 += dy;
        } else {
          sh.x += dx; sh.y += dy;
        }
        next[selectedShapeIndex] = sh;
        return next;
      });
      setCurrentShape({ lastX: x, lastY: y });
      return;
    }

    if (!isDrawing || !currentShape) return;

    if ([TOOL_TYPES.RECTANGLE, TOOL_TYPES.TRIANGLE].includes(currentShape.type)) {
      setCurrentShape((prev) => ({ ...prev, width: x - prev.x, height: y - prev.y }));
    } else if (currentShape.type === TOOL_TYPES.CIRCLE) {
      const radius = Math.sqrt((x - currentShape.x) ** 2 + (y - currentShape.y) ** 2);
      setCurrentShape((prev) => ({ ...prev, radius }));
    } else if (currentShape.type === TOOL_TYPES.LINE) {
      setCurrentShape((prev) => ({ ...prev, x2: x, y2: y }));
    } else if (currentShape.type === TOOL_TYPES.ELLIPSE) {
      setCurrentShape((prev) => ({ ...prev, radiusX: Math.abs(x - prev.x), radiusY: Math.abs(y - prev.y) }));
    }
  };

  const endAction = () => {
    if (isDrawing && currentShape && tool !== TOOL_TYPES.ERASER) {
      setShapes((prev) => [...prev, currentShape]);
    }
    setIsDrawing(false);
    setCurrentShape(null);
    setSelectedShapeIndex(null);
  };

  /* ───── pdf upload ───── */
  const saveDrawingAsPDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return alert("Canvas unavailable");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
    const blob = pdf.output("blob");

    try {
      const form = new FormData();
      form.append("file", blob, `drawing${drawingNum}.pdf`);

      const res = await fetch(
        `/accounts/customers/${customerId}/project/drawing/`,
        { method: "POST", body: form, credentials: "include" }
      );
      if (!res.ok) throw new Error(`upload failed (${res.status})`);
      alert("Drawing saved!");
      navigate(`/project-details/${customerId}`);
    } catch (err) {
      console.error(err);
      alert(`Save failed: ${err.message}`);
    }
  };

  /* ───── cursor style ───── */
  const cursor = tool === TOOL_TYPES.ERASER ? "crosshair"
               : tool === TOOL_TYPES.MOVE   ? (selectedShapeIndex !== null ? "move" : "default")
               : "crosshair";

  /* ───── JSX ───── */
  return (
    <div className="designer-dashboard">
      <nav className="topnavbar">
        <h1 className="navbar-title">
          Drawing #{drawingNum} for Customer #{customerId}
        </h1>
      </nav>

      {/* left sidebar */}
      <aside className="sidebar left-sidebar">
        <h2>Actions</h2>
        <button onClick={clearCanvas}>Clear Canvas</button>
        <button onClick={saveDrawingAsPDF}>Save Drawing</button>
        <button onClick={() => navigate(-1)}>← Back</button>
      </aside>

      {/* canvas */}
      <section className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ cursor }}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={updateAction}
          onMouseUp={endAction}
          onMouseLeave={endAction}
        />
      </section>

      {/* right sidebar */}
      <aside className="sidebar right-sidebar">
        <h2>Tools</h2>
        <ul className="tool-list">
          {Object.values(TOOL_TYPES).map((t) => (
            <li
              key={t}
              className={tool === t ? "active" : ""}
              title={t[0].toUpperCase() + t.slice(1)}
              onClick={() => setTool(t)}
            >
              {t === TOOL_TYPES.RECTANGLE && "▭"}
              {t === TOOL_TYPES.CIRCLE    && "●"}
              {t === TOOL_TYPES.LINE      && "―"}
              {t === TOOL_TYPES.TRIANGLE  && "▲"}
              {t === TOOL_TYPES.ELLIPSE   && "⬭"}
              {t === TOOL_TYPES.MOVE      && "↔"}
              {t === TOOL_TYPES.ERASER    && "🩹"}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}