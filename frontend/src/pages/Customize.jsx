import { useEffect, useRef } from "react";
import * as fabric from "fabric";


// Helper for custom delete icon
const renderIcon = (ctx, left, top, styleOverride, fabricObject) => {
  const size = 24;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));

  // Background circle
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
  ctx.fillStyle = "#e74c3c";
  ctx.fill();

  // X icon
  ctx.beginPath();
  ctx.moveTo(-size / 4, -size / 4);
  ctx.lineTo(size / 4, size / 4);
  ctx.moveTo(size / 4, -size / 4);
  ctx.lineTo(-size / 4, size / 4);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
};

const deleteObject = (eventData, transform) => {
  const target = transform.target;
  const canvas = target.canvas;
  canvas.remove(target);
  canvas.requestRenderAll();
  return true;
};

function Customize() {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  /* =========================
     DEFINE PRINT AREA
  ========================== */
  const printArea = {
    width: 200,
    height: 300,
    centerX: 400 / 2,
    centerY: 500 / 2 + 40, // move down for chest
  };

  useEffect(() => {
    // React 18 StrictMode guard
    if (fabricCanvasRef.current) return;

    const init = async () => {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 500,
        selection: true,
      });

      fabricCanvasRef.current = canvas;

      /* =========================
         ADD TSHIRT AS LOCKED OBJECT
         (NOT backgroundImage – Fabric v7 safe)
      ========================== */

      const tshirt = await fabric.Image.fromURL("/tshirt.png");

      // ----- FIT IMAGE INSIDE CANVAS (v7 SAFE) -----
      const scale = Math.min(
        canvas.width / tshirt.width,
        canvas.height / tshirt.height
      );
      tshirt.scale(scale);
      // --------------------------------------------

      tshirt.set({
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
      });

      canvas.add(tshirt);

      // ✅ v7-CORRECT CENTERING (RESPECTS originX/Y = 'center')
      canvas.centerObject(tshirt);
      tshirt.setCoords();

      canvas.sendToBack(tshirt);

      // DRAW PRINT AREA GUIDE (Visual only)
      const guideRect = new fabric.Rect({
        width: printArea.width,
        height: printArea.height,
        left: printArea.centerX,
        top: printArea.centerY,
        originX: "center",
        originY: "center",
        fill: "transparent",
        stroke: "rgba(255, 255, 255, 0.5)",
        strokeWidth: 2,
        strokeDashArray: [10, 5],
        selectable: false,
        evented: false,
      });

      canvas.add(guideRect);

      canvas.requestRenderAll();
    };

    init();

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  /* =========================
     IMAGE UPLOAD (Fabric v7)
  ========================== */

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const img = await fabric.Image.fromURL(reader.result);

      img.scaleToWidth(150);
      img.set({   //intial placement of image
        left: fabricCanvasRef.current.width / 2,
        top: fabricCanvasRef.current.height / 2,
        originX: 'center',
        originY: 'center'
      });

      // CREATE CLIP PATH
      // The clipPath must be an object set on the image.
      // We use absolutePositioned: true so that the clip region stays fixed on the canvas
      // even if the image moves.
      const clipRect = new fabric.Rect({
        width: printArea.width,
        height: printArea.height,
        left: printArea.centerX,
        top: printArea.centerY,
        originX: "center",
        originY: "center",
        absolutePositioned: true,
      });


      img.clipPath = clipRect;

      // ADD CUSTOM DELETE CONTROL
      img.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetY: 0,
        cursorStyle: "pointer",
        mouseUpHandler: deleteObject,
        render: renderIcon,
        cornerSize: 24,
      });

      fabricCanvasRef.current.add(img);
      fabricCanvasRef.current.setActiveObject(img);
      fabricCanvasRef.current.requestRenderAll();
    };

    reader.readAsDataURL(file);
  };

  const handleSubmitDesign = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 1️⃣ Full editable design data
    const designJSON = canvas.toJSON();

    // 2️⃣ Visual preview (what user actually sees)
    const previewImage = canvas.toDataURL({
      format: "png",
      multiplier: 2, // higher quality
    });

    console.log("==== DESIGN JSON ====");
    console.log(designJSON);

    console.log("==== PREVIEW IMAGE ====");
    console.log(previewImage);
  };


  return (
    <div style={{ padding: "20px" }}>
      <h2>Customize Your T-Shirt</h2>

      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <button
        onClick={handleSubmitDesign}
        style={{ marginLeft: "10px" }}
      >
        Submit Design
      </button>

      <div style={{ marginTop: "20px" }}>
        <canvas
          ref={canvasRef}
          style={{
            border: "2px solid black",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

export default Customize;