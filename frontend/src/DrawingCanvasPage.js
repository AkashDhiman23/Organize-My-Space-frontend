import React, { useRef, useState, useEffect } from 'react';
import './ManagerDashboard.css';

const TOOL_TYPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',
  MOVE: 'move',
  ERASER: 'eraser',
};

const DesignerDashboard = () => {
  const canvasRef = useRef(null);
  const eraserRef = useRef(null);
  const [tool, setTool] = useState(TOOL_TYPES.RECTANGLE);
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Draw all saved shapes on canvas
  const drawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape, idx) => {
      ctx.save();
      if (idx === selectedShapeIndex) {
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(0,123,255,0.5)';
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }

      if (shape.type === TOOL_TYPES.RECTANGLE) {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === TOOL_TYPES.CIRCLE) {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (shape.type === TOOL_TYPES.LINE) {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      }
      ctx.restore();
    });
  };

  // Draw preview of current shape while drawing
  const drawCurrentShape = () => {
    if (!currentShape) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (currentShape.type === TOOL_TYPES.RECTANGLE) {
      ctx.strokeRect(currentShape.x, currentShape.y, currentShape.width, currentShape.height);
    } else if (currentShape.type === TOOL_TYPES.CIRCLE) {
      ctx.beginPath();
      ctx.arc(currentShape.x, currentShape.y, currentShape.radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (currentShape.type === TOOL_TYPES.LINE) {
      ctx.beginPath();
      ctx.moveTo(currentShape.x1, currentShape.y1);
      ctx.lineTo(currentShape.x2, currentShape.y2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const redraw = () => {
    drawShapes();
    drawCurrentShape();
  };

  useEffect(() => {
    redraw();
  }, [shapes, currentShape]);

  // Mouse down: start drawing or moving
  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === TOOL_TYPES.MOVE) {
      const index = shapes.findIndex((shape) => isPointInsideShape(shape, x, y));
      if (index !== -1) setSelectedShapeIndex(index);
      else setSelectedShapeIndex(null);
    } else if (tool === TOOL_TYPES.ERASER) {
      startErasing(x, y);
    } else {
      setIsDrawing(true);
      if (tool === TOOL_TYPES.RECTANGLE) {
        setCurrentShape({ type: TOOL_TYPES.RECTANGLE, x, y, width: 0, height: 0 });
      } else if (tool === TOOL_TYPES.CIRCLE) {
        setCurrentShape({ type: TOOL_TYPES.CIRCLE, x, y, radius: 0 });
      } else if (tool === TOOL_TYPES.LINE) {
        setCurrentShape({ type: TOOL_TYPES.LINE, x1: x, y1: y, x2: x, y2: y });
      }
    }
  };

  // Mouse move: update drawing or moving
  const updateAction = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === TOOL_TYPES.MOVE && selectedShapeIndex !== null && e.buttons === 1) {
      const dx = x - (currentShape?.lastX || x);
      const dy = y - (currentShape?.lastY || y);
      setShapes((prev) => {
        const newShapes = [...prev];
        const shape = { ...newShapes[selectedShapeIndex] };
        if (shape.type === TOOL_TYPES.RECTANGLE) {
          shape.x += dx;
          shape.y += dy;
        } else if (shape.type === TOOL_TYPES.CIRCLE) {
          shape.x += dx;
          shape.y += dy;
        } else if (shape.type === TOOL_TYPES.LINE) {
          shape.x1 += dx;
          shape.y1 += dy;
          shape.x2 += dx;
          shape.y2 += dy;
        }
        newShapes[selectedShapeIndex] = shape;
        return newShapes;
      });
      setCurrentShape({ lastX: x, lastY: y });
    } else if (tool === TOOL_TYPES.ERASER) {
      eraseAt(x, y);
    } else if (isDrawing && currentShape) {
      if (currentShape.type === TOOL_TYPES.RECTANGLE) {
        setCurrentShape((prev) => ({
          ...prev,
          width: x - prev.x,
          height: y - prev.y,
        }));
      } else if (currentShape.type === TOOL_TYPES.CIRCLE) {
        const radius = Math.sqrt((x - currentShape.x) ** 2 + (y - currentShape.y) ** 2);
        setCurrentShape((prev) => ({
          ...prev,
          radius,
        }));
      } else if (currentShape.type === TOOL_TYPES.LINE) {
        setCurrentShape((prev) => ({
          ...prev,
          x2: x,
          y2: y,
        }));
      }
    }
  };

  // Mouse up or leave: finish drawing or moving
  const endAction = () => {
    if (tool === TOOL_TYPES.MOVE) {
      setSelectedShapeIndex(null);
      setCurrentShape(null);
    } else if (tool === TOOL_TYPES.ERASER) {
      stopErasing();
    } else if (isDrawing && currentShape) {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
      setIsDrawing(false);
    }
  };

  // Check if point inside shape (bounding box for rectangle, radius for circle, approx for line)
  const isPointInsideShape = (shape, x, y) => {
    if (shape.type === TOOL_TYPES.RECTANGLE) {
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      );
    } else if (shape.type === TOOL_TYPES.CIRCLE) {
      const dx = x - shape.x;
      const dy = y - shape.y;
      return dx * dx + dy * dy <= shape.radius * shape.radius;
    } else if (shape.type === TOOL_TYPES.LINE) {
      const { x1, y1, x2, y2 } = shape;
      const dist =
        Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
        Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
      return dist < 5;
    }
    return false;
  };

  // Eraser methods
  const startErasing = (x, y) => {
    const eraserCanvas = eraserRef.current;
    if (!eraserCanvas) return;
    const ctx = eraserCanvas.getContext('2d');
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const eraseAt = (x, y) => {
    const eraserCanvas = eraserRef.current;
    if (!eraserCanvas) return;
    const ctx = eraserCanvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopErasing = () => {
    const eraserCanvas = eraserRef.current;
    if (!eraserCanvas) return;
    const ctx = eraserCanvas.getContext('2d');
    ctx.closePath();
    ctx.clearRect(0, 0, eraserCanvas.width, eraserCanvas.height);
  };

  // Clear everything
  const clearCanvas = () => {
    setShapes([]);
    setCurrentShape(null);
    setSelectedShapeIndex(null);
    const eraserCanvas = eraserRef.current;
    if (eraserCanvas) {
      eraserCanvas.getContext('2d').clearRect(0, 0, eraserCanvas.width, eraserCanvas.height);
    }
  };

  // Cursor style based on tool
  const getCursor = () => {
    switch (tool) {
      case TOOL_TYPES.MOVE:
        return selectedShapeIndex !== null ? 'move' : 'default';
      case TOOL_TYPES.ERASER:
        return 'crosshair';
      default:
        return 'crosshair';
    }
  };

  // Back button handler
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="designer-dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <h1 className="navbar-title">Designer Dashboard</h1>
      </nav>

      {/* Left Sidebar - Settings */}
      <aside className="sidebar left-sidebar">
        <h2>Settings</h2>
        <button onClick={clearCanvas}>Clear Canvas</button>
      </aside>

      {/* Canvas container */}
      <section className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="drawing-canvas"
          style={{ cursor: getCursor() }}
          onMouseDown={startDrawing}
          onMouseMove={updateAction}
          onMouseUp={endAction}
          onMouseLeave={endAction}
        />
        <canvas
          ref={eraserRef}
          width={800}
          height={600}
          className="eraser-canvas"
          style={{ pointerEvents: tool === TOOL_TYPES.ERASER ? 'auto' : 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={updateAction}
          onMouseUp={endAction}
          onMouseLeave={endAction}
        />
      </section>

      {/* Right Sidebar - Tools */}
      <aside className="sidebar right-sidebar">
        <h2>Tools</h2>
        <ul className="tool-list">
          {Object.values(TOOL_TYPES).map((t) => (
            <li
              key={t}
              className={tool === t ? 'active' : ''}
              onClick={() => setTool(t)}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            >
              {t === TOOL_TYPES.RECTANGLE && '▭'}
              {t === TOOL_TYPES.CIRCLE && '●'}
              {t === TOOL_TYPES.LINE && '―'}
              {t === TOOL_TYPES.MOVE && '↔'}
              {t === TOOL_TYPES.ERASER && '🩹'}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default DesignerDashboard;
