import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useParams } from "react-router-dom";



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
  const { productId } = useParams();

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const productRef = useRef(null);

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


      // 1️⃣ Fetch product using productId
      const res = await fetch(`http://localhost:3000/products/${productId}`);
      const product = await res.json();
      productRef.current = product;

      const tshirt = await fabric.Image.fromURL(product.baseImage);

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
        // ⭐ ADD THIS
        isPrintGuide: true,
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

  const handleSubmitDesign = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 1️⃣ Hide print guide temporarily
    const guide = canvas.getObjects().find(obj => obj.isPrintGuide);
    if (guide) {
      guide.visible = false;
    }

    canvas.requestRenderAll();

    // 2️⃣ Generate data
    const designJSON = canvas.toJSON();
    const previewImage = canvas.toDataURL({
      format: "png",
      multiplier: 2,
    });

    // 3️⃣ Restore print guide
    if (guide) {
      guide.visible = true;
    }
    canvas.requestRenderAll();

    // 4️⃣ Send to backend
    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          designJSON,
          previewImage,
        }),
      });

      if (!res.ok) {
        throw new Error("Order creation failed");
      }

      alert("Order placed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
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