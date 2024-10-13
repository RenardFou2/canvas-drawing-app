import React, { useRef, useState, useEffect } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [shape, setShape] = useState("line");
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState([]);
  const [mode, setMode] = useState("draw");
  const [dragging, setDragging] = useState(false);
  const [draggedShapeIndex, setDraggedShapeIndex] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedShape, setSelectedShape] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    setContext(ctx);
  }, []);

  const startDrawing = (e) => {
    if (mode !== "draw") return;
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setSelectedShape(null); // Reset selected shape
  };

  const drawShape = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawShapes();

    context.beginPath();

    let newShape = { type: shape, startX: startPosition.x, startY: startPosition.y, endX: x, endY: y };

    switch (shape) {
      case "line":
        context.moveTo(startPosition.x, startPosition.y);
        context.lineTo(x, y);
        break;
      case "square":
        const width = x - startPosition.x;
        const height = y - startPosition.y;
        context.rect(startPosition.x, startPosition.y, width, height);
        newShape.width = width;
        newShape.height = height;
        break;
      case "circle":
        const radius = Math.sqrt(Math.pow(x - startPosition.x, 2) + Math.pow(y - startPosition.y, 2));
        context.arc(startPosition.x, startPosition.y, radius, 0, Math.PI * 2);
        newShape.radius = radius;
        break;
      default:
        break;
    }

    context.stroke();
    setSelectedShape(newShape);
  };

  const finishDrawing = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let finalShape = {
      type: shape,
      startX: startPosition.x,
      startY: startPosition.y,
      endX: x,
      endY: y,
    };

    if (shape === "square") {
      const width = x - startPosition.x;
      const height = y - startPosition.y;
      finalShape.width = width;
      finalShape.height = height;
    } else if (shape === "circle") {
      const radius = Math.sqrt(Math.pow(x - startPosition.x, 2) + Math.pow(y - startPosition.y, 2));
      finalShape.radius = radius;
    }

    setShapes((prevShapes) => [...prevShapes, finalShape]);
    setDrawing(false);
  };

  const handleErase = (e) => {
    if (mode !== "erase") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedShapes = shapes.filter((s) => {
      switch (s.type) {
        case "line":
          return !(x >= Math.min(s.startX, s.endX) && x <= Math.max(s.startX, s.endX) && y >= Math.min(s.startY, s.endY) && y <= Math.max(s.startY, s.endY));
        case "square":
          return !(x >= s.startX && x <= s.startX + s.width && y >= s.startY && y <= s.startY + s.height);
        case "circle":
          const distance = Math.sqrt(Math.pow(x - s.startX, 2) + Math.pow(y - s.startY, 2));
          return distance > s.radius;
        default:
          return true;
      }
    });

    setShapes(updatedShapes);
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawShapes();
  };

  const handleShapeClick = (e) => {
    if (mode !== "drag") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      switch (s.type) {
        case "line":
          if (x >= Math.min(s.startX, s.endX) && x <= Math.max(s.startX, s.endX) && y >= Math.min(s.startY, s.endY) && y <= Math.max(s.startY, s.endY)) {
            startDragging(i, x, y, s);
            setSelectedShape(s);
            return;
          }
          break;
        case "square":
          if (x >= s.startX && x <= s.startX + s.width && y >= s.startY && y <= s.startY + s.height) {
            startDragging(i, x, y, s);
            setSelectedShape(s); // Show shape data when clicking
            return;
          }
          break;
        case "circle":
          const distance = Math.sqrt(Math.pow(x - s.startX, 2) + Math.pow(y - s.startY, 2));
          if (distance <= s.radius) {
            startDragging(i, x, y, s);
            setSelectedShape(s);
            return;
          }
          break;
        default:
          break;
      }
    }
  };

  const startDragging = (index, x, y, shape) => {
    setDragging(true);
    setDraggedShapeIndex(index);
    setOffset({
      x: x - shape.startX,
      y: y - shape.startY,
    });
  };

  const handleDragging = (e) => {
    if (!dragging || draggedShapeIndex === null) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedShapes = [...shapes];
    const shape = updatedShapes[draggedShapeIndex];

    switch (shape.type) {
      case "line":
        const deltaX = x - offset.x;
        const deltaY = y - offset.y;
        const lineWidth = shape.endX - shape.startX;
        const lineHeight = shape.endY - shape.startY;
        shape.startX = deltaX;
        shape.startY = deltaY;
        shape.endX = deltaX + lineWidth;
        shape.endY = deltaY + lineHeight;
        break;
      case "square":
        shape.startX = x - offset.x;
        shape.startY = y - offset.y;
        break;
      case "circle":
        shape.startX = x - offset.x;
        shape.startY = y - offset.y;
        break;
      default:
        break;
    }

    setShapes(updatedShapes);
    setSelectedShape(shape);
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawShapes();
  };

  const stopDragging = () => {
    setDragging(false);
    setDraggedShapeIndex(null);
  };

  const redrawShapes = () => {
    shapes.forEach((s) => {
      context.beginPath();
      switch (s.type) {
        case "line":
          context.moveTo(s.startX, s.startY);
          context.lineTo(s.endX, s.endY);
          break;
        case "square":
          context.rect(s.startX, s.startY, s.width, s.height);
          break;
        case "circle":
          context.arc(s.startX, s.startY, s.radius, 0, Math.PI * 2);
          break;
        default:
          break;
      }
      context.stroke();
    });
  };

  const clearCanvas = () => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setShapes([]);
    setSelectedShape(null);
  };

  const handleShapeInputChange = (e, property) => {
    if (!selectedShape) return;

    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    const updatedShape = { ...selectedShape, [property]: value };
    setSelectedShape(updatedShape);

    const updatedShapes = shapes.map((s) =>
      s === selectedShape ? updatedShape : s
    );
    setShapes(updatedShapes);

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawShapes();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => {
          if (mode === "draw") startDrawing(e);
          else if (mode === "erase") handleErase(e);
          else if (mode === "drag") handleShapeClick(e);
        }}
        onMouseMove={mode === "drag" ? handleDragging : mode === "draw" ? drawShape : undefined}
        onMouseUp={mode === "draw" ? finishDrawing : mode === "drag" ? stopDragging : undefined}
        onMouseLeave={stopDragging}
        style={{ border: "1px solid black" }}
      />
      <div>
        <button onClick={() => setMode("draw")}>Draw</button>
        <button onClick={() => setMode("erase")}>Erase</button>
        <button onClick={() => setMode("drag")}>Drag</button>
        <button onClick={clearCanvas}>Clear Canvas</button>
        <button onClick={() => setShape("line")}>Line</button>
        <button onClick={() => setShape("square")}>Square</button>
        <button onClick={() => setShape("circle")}>Circle</button>
      </div>

      {selectedShape && (
        <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #ccc" }}>
          <h3>Shape Data</h3>
          <p>Type: {selectedShape.type}</p>
          <label>Start X:</label>
          <input
            type="number"
            value={selectedShape.startX}
            onChange={(e) => handleShapeInputChange(e, "startX")}
          />
          <br />
          <label>Start Y:</label>
          <input
            type="number"
            value={selectedShape.startY}
            onChange={(e) => handleShapeInputChange(e, "startY")}
          />
          <br />
          {selectedShape.type === "line" && (
            <>
              <label>End X:</label>
              <input
                type="number"
                value={selectedShape.endX}
                onChange={(e) => handleShapeInputChange(e, "endX")}
              />
              <br />
              <label>End Y:</label>
              <input
                type="number"
                value={selectedShape.endY}
                onChange={(e) => handleShapeInputChange(e, "endY")}
              />
              <br />
            </>
          )}
          {selectedShape.type === "square" && (
            <>
              <label>Width:</label>
              <input
                type="number"
                value={selectedShape.width}
                onChange={(e) => handleShapeInputChange(e, "width")}
              />
              <br />
              <label>Height:</label>
              <input
                type="number"
                value={selectedShape.height}
                onChange={(e) => handleShapeInputChange(e, "height")}
              />
              <br />
            </>
          )}
          {selectedShape.type === "circle" && (
            <>
              <label>Radius:</label>
              <input
                type="number"
                value={selectedShape.radius}
                onChange={(e) => handleShapeInputChange(e, "radius")}
              />
              <br />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Canvas;
