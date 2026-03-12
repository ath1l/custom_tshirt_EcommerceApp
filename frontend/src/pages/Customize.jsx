import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useNavigate, useParams } from "react-router-dom";
import { openRazorpayCheckout } from "../utils/razorpay";
import "../styles/customize.css";

const renderIcon = (ctx, left, top, styleOverride, fabricObject) => {
  const size = 24;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
  ctx.fillStyle = "#e74c3c";
  ctx.fill();
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

const FONTS = [
  "Arial",
  "Georgia",
  "Courier New",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
];

function Customize() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const productRef = useRef(null);

  const [material, setMaterial] = useState("Cotton");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textFont, setTextFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);

  const printArea = {
    width: 200,
    height: 300,
    centerX: 400 / 2,
    centerY: 500 / 2 + 40,
  };

  useEffect(() => {
    if (fabricCanvasRef.current) return;

    const init = async () => {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 400,
        height: 500,
        selection: true,
      });

      fabricCanvasRef.current = canvas;

      const res = await fetch(`http://localhost:3000/products/${productId}`);
      const product = await res.json();
      productRef.current = product;

      const tshirt = await fabric.Image.fromURL(product.baseImage);
      const scale = Math.min(canvas.width / tshirt.width, canvas.height / tshirt.height);
      tshirt.scale(scale);
      tshirt.set({ selectable: false, evented: false, hasControls: false, hasBorders: false });
      canvas.add(tshirt);
      canvas.centerObject(tshirt);
      tshirt.setCoords();

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
  }, [productId]);

  const handleAddText = () => {
    if (!textInput.trim()) return;

    const text = new fabric.IText(textInput, {
      left: printArea.centerX,
      top: printArea.centerY,
      originX: "center",
      originY: "center",
      fontFamily: textFont,
      fontSize,
      fill: textColor,
      editable: true,
    });

    const clipRect = new fabric.Rect({
      width: printArea.width,
      height: printArea.height,
      left: printArea.centerX,
      top: printArea.centerY,
      originX: "center",
      originY: "center",
      absolutePositioned: true,
    });
    text.clipPath = clipRect;

    text.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      cursorStyle: "pointer",
      mouseUpHandler: deleteObject,
      render: renderIcon,
      cornerSize: 24,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.requestRenderAll();
    setTextInput("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const img = await fabric.Image.fromURL(reader.result);
      img.scaleToWidth(150);
      img.set({
        left: fabricCanvasRef.current.width / 2,
        top: fabricCanvasRef.current.height / 2,
        originX: "center",
        originY: "center",
      });

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

      img.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
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

  const captureDesign = () => {
    const canvas = fabricCanvasRef.current;
    const guide = canvas.getObjects().find((obj) => obj.isPrintGuide);
    if (guide) guide.visible = false;
    canvas.requestRenderAll();

    const designJSON = canvas.toJSON();
    const previewImage = canvas.toDataURL({ format: "png", multiplier: 2 });

    if (guide) guide.visible = true;
    canvas.requestRenderAll();

    return { designJSON, previewImage };
  };

  const handleOrderNow = async () => {
    const product = productRef.current;
    if (!product) return;

    const { designJSON, previewImage } = captureDesign();

    try {
      const paymentResponse = await openRazorpayCheckout(product.price, product.name);

      const verifyRes = await fetch("http://localhost:3000/payment/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentResponse,
          type: "single",
          singleItem: { productId, designJSON, previewImage, material },
        }),
      });

      if (verifyRes.status === 401) {
        navigate('/login');
        return;
      }

      if (!verifyRes.ok) throw new Error("Payment verification failed");

      alert("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      if (err.message !== "Payment cancelled") {
        console.error(err);
        alert(err.message || "Failed to place order");
      }
    }
  };

  const handleAddToCart = async () => {
    const { designJSON, previewImage } = captureDesign();

    try {
      const res = await fetch("http://localhost:3000/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, designJSON, previewImage, material }),
      });

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (!res.ok) throw new Error("Failed to add to cart");
      alert("Added to cart!");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart. Are you logged in?");
    }
  };

  return (
    <main className="customize-page">
      <section className="customize-layout">
        <div className="customize-canvas-panel">
          <p className="customize-eyebrow">Design Studio</p>
          <h2>Customize Your T-Shirt</h2>
          <p className="customize-copy">
            Add text, upload artwork, and prepare the final design before adding it to cart or paying now.
          </p>
          <div className="customize-canvas-shell">
            <canvas ref={canvasRef} className="customize-canvas" />
          </div>
        </div>

        <aside className="customize-controls">
          <section className="customize-card">
            <h3>Material</h3>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className="customize-input">
              <option value="Cotton">Cotton</option>
              <option value="Cotton-Poly Blend">Cotton-Poly Blend</option>
              <option value="Polyester">Polyester</option>
            </select>
          </section>

          <section className="customize-card">
            <h3>Add Text</h3>
            <input
              type="text"
              placeholder="Type something..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="customize-input"
            />

            <label className="customize-label">Font</label>
            <select
              value={textFont}
              onChange={(e) => setTextFont(e.target.value)}
              className="customize-input"
              style={{ fontFamily: textFont }}
            >
              {FONTS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>

            <label className="customize-label">Font Size: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="customize-range"
            />

            <label className="customize-label">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="customize-color"
            />

            <button onClick={handleAddText} className="customize-secondary-btn" type="button">
              Add Text to Design
            </button>
            <small className="customize-hint">Double-click text on canvas to edit it.</small>
          </section>

          <section className="customize-card">
            <h3>Upload Image</h3>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="customize-file" />
          </section>

          <div className="customize-actions">
            <button onClick={handleAddToCart} className="customize-dark-btn" type="button">
              Add to Cart
            </button>
            <button onClick={handleOrderNow} className="customize-primary-btn" type="button">
              Order Now
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Customize;
