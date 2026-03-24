import * as fabric from "fabric";

export function deriveBackImage(frontImage) {
  if (!frontImage || typeof frontImage !== "string") {
    return "";
  }

  if (!frontImage.includes("/apparel/editor/")) {
    return "";
  }

  return frontImage.replace("/apparel/editor/", "/apparel/editor back/");
}

export function getProductSideImage(product, side) {
  if (!product) {
    return "";
  }

  if (side === "back") {
    return product.backImage || deriveBackImage(product.baseImage) || "";
  }

  return product.baseImage || product.image || "";
}

export async function buildCustomizationPreview(product, designJSON, side) {
  const sideImage = getProductSideImage(product, side);
  if (!sideImage) {
    return "";
  }

  const canvasElement = document.createElement("canvas");
  canvasElement.width = 400;
  canvasElement.height = 500;
  const previewCanvas = new fabric.StaticCanvas(canvasElement, {
    width: 400,
    height: 500,
  });

  try {
    const baseImage = await fabric.Image.fromURL(sideImage);
    const scale = Math.min(previewCanvas.width / baseImage.width, previewCanvas.height / baseImage.height);
    baseImage.scale(scale);
    baseImage.set({ selectable: false, evented: false });
    previewCanvas.add(baseImage);
    previewCanvas.centerObject(baseImage);
    baseImage.setCoords();

    const savedObjects = designJSON?.sides?.[side] || [];
    for (const objectData of savedObjects) {
      const restoredObjects = await fabric.util.enlivenObjects([objectData]);
      restoredObjects.forEach((item) => previewCanvas.add(item));
    }

    previewCanvas.requestRenderAll();
    return previewCanvas.toDataURL({ format: "png", multiplier: 2 });
  } finally {
    previewCanvas.dispose();
  }
}
