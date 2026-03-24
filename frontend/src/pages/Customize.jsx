import { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { openRazorpayCheckout } from "../utils/razorpay";
import { buildCustomizationPreview, deriveBackImage } from "../utils/customizationPreview";
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

const DEFAULT_SIDE = "front";
const PRINT_AREA = {
  width: 200,
  height: 300,
  centerX: 400 / 2,
  centerY: 500 / 2 + 40,
};

function getInitialSideDesigns(designJSON) {
  if (designJSON?.sides) {
    return {
      front: designJSON.sides.front || [],
      back: designJSON.sides.back || [],
    };
  }

  if (Array.isArray(designJSON?.objects)) {
    return {
      front: designJSON.objects,
      back: [],
    };
  }

  return { front: [], back: [] };
}

function getInitialActiveSide(designJSON) {
  if (designJSON?.activeSide === "back") {
    return "back";
  }

  return DEFAULT_SIDE;
}

function Customize() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const productRef = useRef(null);
  const sideDesignsRef = useRef({ front: null, back: null });

  const [material, setMaterial] = useState("Cotton");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textFont, setTextFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productUnavailable, setProductUnavailable] = useState(false);
  const [activeSide, setActiveSide] = useState(DEFAULT_SIDE);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const cartItemId = location.state?.cartItemId || "";
  const existingCartItem = location.state?.cartItem || null;

  const getSideImage = useCallback((product, side) => {
    if (!product) {
      return "";
    }

    if (side === "back") {
      return product.backImage || deriveBackImage(product.baseImage) || product.baseImage || product.image;
    }

    return product.baseImage || product.image;
  }, []);

  const saveCurrentSideDesign = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }

    const objects = canvas
      .getObjects()
      .filter((obj) => !obj.isBackgroundImage && !obj.isPrintGuide)
      .map((obj) => obj.toObject(["clipPath"]));

    sideDesignsRef.current[activeSide] = objects;
  }, [activeSide]);

  const loadSideOnCanvas = useCallback(async (side, product) => {
    const canvas = fabricCanvasRef.current;
    const sideImage = getSideImage(product, side);
    if (!canvas || !sideImage) {
      return;
    }

    canvas.clear();

    const tshirt = await fabric.Image.fromURL(sideImage);
    const scale = Math.min(canvas.width / tshirt.width, canvas.height / tshirt.height);
    tshirt.scale(scale);
    tshirt.set({
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
      isBackgroundImage: true,
    });
    canvas.add(tshirt);
    canvas.centerObject(tshirt);
    tshirt.setCoords();

    const guideRect = new fabric.Rect({
      width: PRINT_AREA.width,
      height: PRINT_AREA.height,
      left: PRINT_AREA.centerX,
      top: PRINT_AREA.centerY,
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

    const savedObjects = sideDesignsRef.current[side] || [];
    for (const objectData of savedObjects) {
      const restoredObject = await fabric.util.enlivenObjects([objectData]);
      restoredObject.forEach((item) => {
        item.controls.deleteControl = new fabric.Control({
          x: 0.5,
          y: -0.5,
          cursorStyle: "pointer",
          mouseUpHandler: deleteObject,
          render: renderIcon,
          cornerSize: 24,
        });
        canvas.add(item);
      });
    }

    canvas.requestRenderAll();
  }, [getSideImage]);

  const buildClipRect = () =>
    new fabric.Rect({
      width: PRINT_AREA.width,
      height: PRINT_AREA.height,
      left: PRINT_AREA.centerX,
      top: PRINT_AREA.centerY,
      originX: "center",
      originY: "center",
      absolutePositioned: true,
    });

  const attachDeleteControl = (fabricObject) => {
    fabricObject.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      cursorStyle: "pointer",
      mouseUpHandler: deleteObject,
      render: renderIcon,
      cornerSize: 24,
    });
  };

  useEffect(() => {
    if (fabricCanvasRef.current) return;

    const init = async () => {
      try {
        const res = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await res.json();
        productRef.current = product;
        sideDesignsRef.current = getInitialSideDesigns(existingCartItem?.designJSON);

        if (product?.isOutOfStock) {
          setProductUnavailable(true);
          setLoadingProduct(false);
          return;
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 400,
          height: 500,
          selection: true,
        });

        fabricCanvasRef.current = canvas;
        const initialSide = getInitialActiveSide(existingCartItem?.designJSON);
        setActiveSide(initialSide);
        setMaterial(existingCartItem?.material || "Cotton");
        await loadSideOnCanvas(initialSide, product);
      } finally {
        setLoadingProduct(false);
      }
    };

    init();

    return () => {
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
  }, [existingCartItem?.designJSON, existingCartItem?.material, loadSideOnCanvas, productId]);

  const handleSideChange = async (side) => {
    if (side === activeSide || !productRef.current) {
      return;
    }

    saveCurrentSideDesign();
    setActiveSide(side);
    await loadSideOnCanvas(side, productRef.current);
  };

  const handleAddText = () => {
    if (!textInput.trim() || !fabricCanvasRef.current) return;

    const text = new fabric.IText(textInput, {
      left: PRINT_AREA.centerX,
      top: PRINT_AREA.centerY,
      originX: "center",
      originY: "center",
      fontFamily: textFont,
      fontSize,
      fill: textColor,
      editable: true,
    });

    text.clipPath = buildClipRect();
    attachDeleteControl(text);

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.requestRenderAll();
    saveCurrentSideDesign();
    setTextInput("");
  };

  const handleImageUpload = async (e) => {
    if (!fabricCanvasRef.current) return;
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);

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

      img.clipPath = buildClipRect();
      attachDeleteControl(img);

      fabricCanvasRef.current.add(img);
      fabricCanvasRef.current.setActiveObject(img);
      fabricCanvasRef.current.requestRenderAll();
      saveCurrentSideDesign();
    };
    reader.readAsDataURL(file);
  };

  const captureDesign = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return { designJSON: null, previewImage: null };
    saveCurrentSideDesign();
    const guide = canvas.getObjects().find((obj) => obj.isPrintGuide);
    if (guide) guide.visible = false;
    canvas.requestRenderAll();

    const designJSON = {
      activeSide,
      sides: sideDesignsRef.current,
    };
    const previewImage = canvas.toDataURL({ format: "png", multiplier: 2 });

    if (guide) guide.visible = true;
    canvas.requestRenderAll();

    return { designJSON, previewImage };
  }, [activeSide, saveCurrentSideDesign]);

  const buildSidePreview = useCallback(async (side) => {
    const product = productRef.current;
    const sideImage = getSideImage(product, side);
    if (!product || !sideImage) {
      return "";
    }

    return await buildCustomizationPreview(
      product,
      { sides: sideDesignsRef.current },
      side,
    );
  }, [getSideImage]);

  const captureCustomization = useCallback(async () => {
    const { designJSON, previewImage } = captureDesign();
    const [frontPreview, backPreview] = await Promise.all([
      buildSidePreview("front"),
      buildSidePreview("back"),
    ]);

    return {
      designJSON,
      previewImage,
      previewImages: {
        front: frontPreview,
        back: backPreview,
      },
    };
  }, [buildSidePreview, captureDesign]);

  const handleOrderNow = async () => {
    const product = productRef.current;
    if (!product || product.isOutOfStock) return;

    const { designJSON, previewImage, previewImages } = await captureCustomization();

    try {
      const paymentResponse = await openRazorpayCheckout(product.price, product.name);

      const verifyRes = await fetch("http://localhost:3000/payment/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentResponse,
          type: "single",
          singleItem: { productId, designJSON, previewImage, previewImages, material },
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
    if (productRef.current?.isOutOfStock) return;
    const { designJSON, previewImage, previewImages } = await captureCustomization();

    try {
      const res = await fetch(
        cartItemId ? `http://localhost:3000/cart/item/${cartItemId}` : "http://localhost:3000/cart",
        {
        method: cartItemId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          designJSON,
          previewImage,
          previewImages,
          material,
          quantity: existingCartItem?.quantity || 1,
        }),
        },
      );

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to add to cart");
      }
      alert(cartItemId ? "Customization updated in cart!" : "Added to cart!");
      if (cartItemId) {
        navigate('/cart');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || (cartItemId ? "Failed to update cart item." : "Failed to add to cart."));
    }
  };

  if (loadingProduct) {
    return <main className="customize-page">Loading product...</main>;
  }

  if (productUnavailable) {
    return (
      <main className="customize-page">
        <section className="customize-layout">
          <div className="customize-canvas-panel">
            <p className="customize-eyebrow">Design Studio</p>
            <h2>Product unavailable</h2>
            <p className="customize-copy">
              This product is currently out of stock and cannot be customized right now.
            </p>
            <button onClick={() => navigate(`/products/${productId}`)} className="customize-primary-btn" type="button">
              Back to product
            </button>
          </div>
        </section>
      </main>
    );
  }

  const frontPreviewImage = getSideImage(productRef.current, "front");
  const backPreviewImage = getSideImage(productRef.current, "back");

  return (
    <main className="customize-page">
      <section className="customize-layout">
        <div className="customize-canvas-panel">
          <p className="customize-eyebrow">Design Studio</p>
          <h2>Customize Your T-Shirt</h2>
          <p className="customize-copy">
            Add text, upload artwork, and prepare the final design before adding it to cart or paying now.
          </p>
          <div className="customize-side-picker" role="tablist" aria-label="Design side selector">
            <button
              type="button"
              className={`customize-side-card ${activeSide === "front" ? "is-active" : ""}`}
              onClick={() => handleSideChange("front")}
            >
              <img src={frontPreviewImage} alt="Front design view" />
              <span>Front</span>
            </button>
            <button
              type="button"
              className={`customize-side-card ${activeSide === "back" ? "is-active" : ""}`}
              onClick={() => handleSideChange("back")}
            >
              <img src={backPreviewImage} alt="Back design view" />
              <span>Back</span>
            </button>
          </div>
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
            <label className="customize-upload-field" htmlFor="design-upload">
              <span className="customize-upload-btn">Choose image</span>
              <span className="customize-upload-name">
                {uploadedFileName || "PNG, JPG, or WEBP"}
              </span>
            </label>
            <input
              id="design-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="customize-file"
            />
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
