// app/api/filaments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const filaments = await prisma.filament.findMany(); // Obtiene todos los filamentos
    return NextResponse.json(filaments);
  } catch (error) {
    console.error("Error fetching filaments:", error);
    return NextResponse.json({ error: 'Failed to fetch filaments' }, { status: 500 });
  }
}

// Puedes agregar métodos POST, PUT, DELETE aquí para crear, actualizar y eliminar filamentos.