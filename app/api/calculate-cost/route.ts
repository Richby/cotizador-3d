// app/api/calculate-cost/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { estimatePrintCost } from "@/lib/calculations";
import prisma from "@/lib/prisma";

// Define el esquema de validación con Zod
const costCalculationSchema = z.object({
  dimensions: z.object({
    x: z.number().positive(),
    y: z.number().positive(),
    z: z.number().positive(),
  }),
  filamentId: z.string().nonempty(),
  infill: z.number().min(0).max(1),
  layerHeight: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const requestData = await request.json();

    // Valida los datos con Zod
    const validatedData = costCalculationSchema.parse(requestData);

    // Extrae los datos validados
    const { dimensions, filamentId, infill, layerHeight } = validatedData;

    const filament = await prisma.filament.findUnique({
      where: { id: filamentId.toString() },
    });

    if (!filament) {
      return NextResponse.json({ error: "Filamento no encontrado" }, { status: 404 });
    }

    const volume = dimensions.x * dimensions.y * dimensions.z;
    const cost = estimatePrintCost(
      volume,
      filament.costPerCubicMM, // Aquí se pasa el valor numérico
      layerHeight,
      infill
    );

    return NextResponse.json({ cost });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 }); // Errores de validación
    }

    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}