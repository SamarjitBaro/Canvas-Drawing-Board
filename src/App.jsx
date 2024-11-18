import React, { useRef, useState } from "react";
import { CgProfile } from "react-icons/cg";
const CollaborativeWhiteboard = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [brushColor, setBrushColor] = useState("#000000");
  const [range, setRange] = useState("1");

  // Initialize the canvas
  const prepareCanvas = () => {
    const canvas = canvasRef.current;
    // canvas.width = 1000;
    // canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    // ctx.lineWidth = range;
    ctx.strokeStyle = brushColor;
    ctxRef.current = ctx;
  };

  // Start drawing
  const startDrawing = (event) => {
    const { offsetX, offsetY } =
      event.nativeEvent.type === "mousedown"
        ? event.nativeEvent
        : getTouchPosition(event);

    ctxRef.current.beginPath();
    // ctxRef.current.lineWidth = range;
    ctxRef.current.lineWidth = range;
    ctxRef.current.moveTo(offsetX, offsetY);

    setIsDrawing(true);

    // Save the path
    setRedoStack([]);
    setPaths((prev) => [
      ...prev,
      {
        type: "draw",
        points: [{ x: offsetX, y: offsetY }],
        color: brushColor,
        lineWidth: range,
      },
    ]);
  };

  // Draw on the canva
  const draw = (event) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } =
      event.nativeEvent.type === "mousemove"
        ? event.nativeEvent
        : getTouchPosition(event);

    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();

    // Append points to the current path
    setPaths((prev) => {
      const newPaths = [...prev];
      newPaths[newPaths.length - 1].points.push({ x: offsetX, y: offsetY });
      return newPaths;
    });
  };

  // Finish drawing
  const finishDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const getTouchPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
  };
  // Undo the last action
  const undo = () => {
    if (paths.length === 0) return;
    const newRedoStack = [...redoStack, paths[paths.length - 1]];
    setRedoStack(newRedoStack);
    const newPaths = paths.slice(0, -1);
    setPaths(newPaths);
    redrawCanvas(newPaths);
  };

  // Redo the last undone action
  const redo = () => {
    if (redoStack.length === 0) return;
    const lastRedo = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    setRedoStack(newRedoStack);
    const newPaths = [...paths, lastRedo];
    setPaths(newPaths);
    redrawCanvas(newPaths);
  };

  // Redraw the canvas
  const redrawCanvas = (paths) => {
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    paths.forEach((path) => {
      if (path.type === "draw") {
        ctxRef.current.beginPath();
        ctxRef.current.strokeStyle = path.color;
        ctxRef.current.lineWidth = path.lineWidth;
        path.points.forEach((point, index) => {
          if (index === 0) {
            ctxRef.current.moveTo(point.x, point.y);
          } else {
            ctxRef.current.lineTo(point.x, point.y);
          }
        });
        ctxRef.current.stroke();
        ctxRef.current.closePath();
      }
    });
  };

  // Save the canvas as an image
  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "paint.png";
    link.click();
  };

  // Change the brush color
  const changeColor = (e) => {
    const newColor = e.target.value;
    setBrushColor(newColor);
    ctxRef.current.strokeStyle = newColor; // Update canvas context color
  };

  // Prepare the canvas when the component is mounted
  React.useEffect(() => {
    prepareCanvas();
  }, []);

  return (
    <div className="h-screen">
      <div className="bg-green-500 flex justify-center items-center h-[40px]">
        <h1 className="font">Drawing Board</h1>
      </div>
      <canvas
        className="w-[100vw] h-[80vh]"
        ref={canvasRef}
        style={{
          border: "1px solid black",
          cursor: "crosshair",
          touchAction: "none",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={finishDrawing}
        onMouseLeave={finishDrawing}
        onTouchStart={(e) => {
          e.preventDefault(); // Prevent default scrolling
          startDrawing(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault(); // Prevent default scrolling
          draw(e);
        }}
        onTouchEnd={(e) => {
          e.preventDefault(); // Prevent default scrolling
          finishDrawing(e);
        }}
        width={window.innerWidth}
        height={window.innerHeight * 0.8}
      />
      <div
        className="bg-[#21C55D] pb-5 h-[90px] py-2 flex justify-center"
        style={{ display: "flex", gap: "5px" }}
      >
        <button
          onClick={undo}
          className="bg-gray-50 rounded-md md:px-5 px-1 hover:bg-slate-300"
        >
          Undo
        </button>
        <button
          onClick={redo}
          className="bg-gray-50 rounded-md md:px-5 px-1 hover:bg-slate-300"
        >
          Redo
        </button>
        <button
          onClick={saveCanvas}
          className="bg-gray-50 rounded-md md:px-5 hover:bg-slate-300"
        >
          Download
        </button>
        <label className="bg-gray-50 md:flex flex-col px-2  justify-center items-center rounded-md md:px-5 hover:bg-slate-300">
          <input
            type="color"
            value={brushColor}
            onChange={changeColor}
            style={{ cursor: "pointer" }}
          />
          <div>Color:</div>
        </label>
        <div className="bg-gray-50 rounded-md md:px-5 flex items-center justify-center hover:bg-slate-300">
          {" "}
          Brush Size :
          <input
            className="w-10 md:w-40"
            min="1"
            max="10"
            value={range}
            type="range"
            onChange={(e) => {
              setRange(e.target.value);
            }}
          />
        </div>
      </div>
      <footer className="bg-[#21C55D] hidden  md:flex justify-center items-center  h-[10vh] text-black">
        <a href="https://samarjitbaro.netlify.app/" target="blank">
          <CgProfile className="size-7 bg-white rounded-[50%] " />
        </a>
      </footer>
    </div>
  );
};

export default CollaborativeWhiteboard;
