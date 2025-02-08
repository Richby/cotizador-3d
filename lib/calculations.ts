// lib/calculations.ts

// Ya no necesitamos importar Filament ni prisma aquí

// Usar la misma interfaz Dimensions que en el frontend
interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// Función separada para calcular el volumen (aunque sea simple ahora)
export function calculateVolume(dimensions: Dimensions): number {
  return dimensions.width * dimensions.height * dimensions.depth;
}

// Función para estimar el costo de impresión
export function estimatePrintCost(
  volume: number,         // Volumen en mm³
  costPerCubicMM: number, // Costo por mm³
  layerMultiplier: number = 1,  // Multiplicador por altura de capa
  infillMultiplier: number = 1, // Multiplicador por densidad de relleno
  fileSizeMultiplier: number = 1, // Multiplicador por tamaño de archivo
) {
  let totalCost = volume * costPerCubicMM * layerMultiplier * infillMultiplier * fileSizeMultiplier;

  const profitMargin = 0.2; // 20% de margen de ganancia (configurable)
  totalCost *= (1 + profitMargin);

  return totalCost;
}