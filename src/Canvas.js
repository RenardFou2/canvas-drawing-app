import React, { useRef, useState, useEffect } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [shape, setShape] = useState("line");
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    setContext(ctx);
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
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
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={drawShape}
        onMouseUp={finishDrawing}
        onMouseLeave={finishDrawing}
        style={{ border: "1px solid black" }}
      />
      <div>
        <button onClick={() => setShape("line")}>Draw Line</button>
        <button onClick={() => setShape("square")}>Draw Square</button>
        <button onClick={() => setShape("circle")}>Draw Circle</button>
        <button onClick={clearCanvas}>Erase</button>
      </div>
    </div>
  );
};

export default Canvas;
