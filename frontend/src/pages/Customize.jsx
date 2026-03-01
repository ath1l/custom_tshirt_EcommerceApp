import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useParams } from "react-router-dom";

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
  'Arial',
  'Georgia',
  'Courier New',
  'Times New Roman',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
];

function Customize() {
  const { productId } = useParams();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const productRef = useRef(null);

  const [material, setMaterial] = useState('Cotton');

  // Text controls
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFont, setTextFont] = useState('Arial');
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
  }, []);

  /* ── ADD TEXT ── */
  const handleAddText = () => {
    if (!textInput.trim()) return;

    const text = new fabric.IText(textInput, {
      left: printArea.centerX,
      top: printArea.centerY,
      originX: 'center',
      originY: 'center',
      fontFamily: textFont,
      fontSize: fontSize,
      fill: textColor,
      editable: true,
    });

    // Clip to print area
    const clipRect = new fabric.Rect({
      width: printArea.width,
      height: printArea.height,
      left: printArea.centerX,
      top: printArea.centerY,
      originX: 'center',
      originY: 'center',
      absolutePositioned: true,
    });
    text.clipPath = clipRect;

    // Delete control
    text.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderIcon,
      cornerSize: 24,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.requestRenderAll();
    setTextInput('');
  };

  /* ── IMAGE UPLOAD ── */
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
        originX: 'center',
        originY: 'center',
      });

      const clipRect = new fabric.Rect({
        width: printArea.width,
        height: printArea.height,
        left: printArea.centerX,
        top: printArea.centerY,
        originX: 'center',
        originY: 'center',
        absolutePositioned: true,
      });
      img.clipPath = clipRect;

      img.controls.deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        cursorStyle: 'pointer',
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

  /* ── SUBMIT ── */
  const handleSubmitDesign = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const guide = canvas.getObjects().find(obj => obj.isPrintGuide);
    if (guide) guide.visible = false;
    canvas.requestRenderAll();

    const designJSON = canvas.toJSON();
    const previewImage = canvas.toDataURL({ format: 'png', multiplier: 2 });

    if (guide) guide.visible = true;
    canvas.requestRenderAll();

    try {
      const res = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, designJSON, previewImage, material }),
      });

      if (!res.ok) throw new Error('Order creation failed');
      alert('Order placed successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to place order');
    }
  };

  const handleAddToCart = async () => {
  const canvas = fabricCanvasRef.current;
  if (!canvas) return;

  const guide = canvas.getObjects().find(obj => obj.isPrintGuide);
  if (guide) guide.visible = false;
  canvas.requestRenderAll();

  const designJSON = canvas.toJSON();
  const previewImage = canvas.toDataURL({ format: 'png', multiplier: 2 });

  if (guide) guide.visible = true;
  canvas.requestRenderAll();

  try {
    const res = await fetch('http://localhost:3000/cart', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, designJSON, previewImage, material }),
    });

    if (!res.ok) throw new Error('Failed to add to cart');
    alert('Added to cart!');
  } catch (err) {
    console.error(err);
    alert('Failed to add to cart. Are you logged in?');
  }
};

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

      {/* ── LEFT: CANVAS ── */}
      <div>
        <h2>Customize Your T-Shirt</h2>
        <canvas ref={canvasRef} style={{ border: '2px solid black', display: 'block' }} />
      </div>

      {/* ── RIGHT: CONTROLS ── */}
      <div style={{ minWidth: '260px' }}>

        {/* Material */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '8px' }}>Material</h3>
          <select value={material} onChange={e => setMaterial(e.target.value)} style={{ width: '100%', padding: '6px' }}>
            <option value="Cotton">Cotton</option>
            <option value="Cotton-Poly Blend">Cotton-Poly Blend</option>
            <option value="Polyester">Polyester</option>
          </select>
        </div>

        {/* Text */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '8px' }}>Add Text</h3>

          <input
            type="text"
            placeholder="Type something..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            style={{ width: '100%', padding: '6px', marginBottom: '8px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px' }}>Font</label>
          <select
            value={textFont}
            onChange={e => setTextFont(e.target.value)}
            style={{ width: '100%', padding: '6px', marginBottom: '8px', fontFamily: textFont }}
          >
            {FONTS.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>

          <label style={{ display: 'block', marginBottom: '4px' }}>Font Size: {fontSize}px</label>
          <input
            type="range"
            min="12"
            max="72"
            value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '8px' }}
          />

          <label style={{ display: 'block', marginBottom: '4px' }}>Text Color</label>
          <input
            type="color"
            value={textColor}
            onChange={e => setTextColor(e.target.value)}
            style={{ width: '100%', height: '36px', marginBottom: '8px', cursor: 'pointer' }}
          />

          <button
            onClick={handleAddText}
            style={{ width: '100%', padding: '8px', marginBottom: '4px' }}
          >
            Add Text to Design
          </button>
          <small style={{ color: '#888' }}>Double-click text on canvas to edit it</small>
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '8px' }}>Upload Image</h3>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%' }} />
        </div>

        {/* Submit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleAddToCart}
              style={{ width: '100%', padding: '10px', fontSize: '16px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none' }}
            >
              Add to Cart 🛒
            </button>
            <button
              onClick={handleSubmitDesign}
              style={{ width: '100%', padding: '10px', fontSize: '16px', cursor: 'pointer', background: '#e44', color: '#fff', border: 'none' }}
            >
              Order Now ⚡
            </button>
          </div>
      </div>
    </div>
  );
}

export default Customize;