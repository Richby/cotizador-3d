// lib/calculations.ts
import { Filament } from '@prisma/client';
import prisma from '@/lib/prisma'; // Import the *instance* from lib/prisma.ts

interface Dimensions {
  x: number;
  y: number;
  z: number;
}

export async function calculateCost(
  dimensions: Dimensions,
  filament: Filament,
  infill: number,
  layerHeight: number,
  estimatedPrintTime?: number // Opcional, en horas
) {
  // Aproximación del volumen (mejorar con el volumen real de Three.js si es posible)
  const volume = dimensions.x * dimensions.y * dimensions.z * (1 - (1 - infill));
  const materialCost = volume * filament.costPerCubicCm;

  let totalCost = materialCost;

  if (estimatedPrintTime) {
    const hourlyRate = 10; //  Costo por hora de la impresora (configurable)
    totalCost += estimatedPrintTime * hourlyRate;
  }

  const profitMargin = 0.2; // 20% de margen de ganancia (configurable)
  totalCost *= (1 + profitMargin);

  return totalCost;
}