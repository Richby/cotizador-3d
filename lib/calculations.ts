// lib/calculations.ts

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

const MAX_DIMENSIONS = { width: 300, height: 300, depth: 330 }; // Máximo en mm (30x30x33 cm)

export function calculateVolume(dimensions: Dimensions): number {
  return dimensions.width * dimensions.height * dimensions.depth;
}

export function estimatePrintCost(
  volume: number,
  costPerCubicMM: number,
  layerMultiplier: number = 1,
  infillMultiplier: number = 1,
  fileSizeMultiplier: number = 1
): number {
  let totalCost = volume * costPerCubicMM * layerMultiplier * infillMultiplier * fileSizeMultiplier;

  const profitMargin = 0.2; // 20% de margen de ganancia
  totalCost *= 1 + profitMargin;

  return totalCost;
}

export function validateScaledDimensions(
  originalDimensions: Dimensions,
  scale: number
): { isValid: boolean; message?: string } {
  const scaledWidth = originalDimensions.width * scale;
  const scaledHeight = originalDimensions.height * scale;
  const scaledDepth = originalDimensions.depth * scale;

  if (
    scaledWidth > MAX_DIMENSIONS.width ||
    scaledHeight > MAX_DIMENSIONS.height ||
    scaledDepth > MAX_DIMENSIONS.depth
  ) {
    return {
      isValid: false,
      message: "Las dimensiones escaladas exceden el volumen máximo de impresión.",
    };
  }

  return { isValid: true };
}

export function calculateMaxAllowedScale(originalDimensions: Dimensions): number {
  const maxScaleWidth = MAX_DIMENSIONS.width / originalDimensions.width;
  const maxScaleHeight = MAX_DIMENSIONS.height / originalDimensions.height;
  const maxScaleDepth = MAX_DIMENSIONS.depth / originalDimensions.depth;

  return Math.min(maxScaleWidth, maxScaleHeight, maxScaleDepth);
}