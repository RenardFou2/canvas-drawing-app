import React, { useRef, useState, useEffect } from "react";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [shape, setShape] = useState("line"); // Default shape to draw
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

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
    context.beginPath();

    switch (shape) {
      case "line":
        context.moveTo(startPosition.x, startPosition.y);
        context.lineTo(x, y);
        break;
      case "square":
        const side = Math.abs(x - startPosition.x);
        context.rect(startPosition.x, startPosition.y, side, side);
        break;
      case "circle":
        const radius = Math.sqrt(
          Math.pow(x - startPosition.x, 2) + Math.pow(y - startPosition.y, 2)
        );
        context.arc(startPosition.x, startPosition.y, radius, 0, Math.PI * 2);
        break;
      default:
        break;
    }

    context.stroke();
  };

  const finishDrawing = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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