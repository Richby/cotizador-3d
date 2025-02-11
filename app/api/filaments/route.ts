// app/api/filaments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; //  ruta

export async function GET(req: NextRequest) {
  console.log("DATABASE_URL:", process.env.DATABASE_URL); // Verifica la URL
  try {
    const filaments = await prisma.filament.findMany(); //  "filament" en minúscula
    return NextResponse.json(filaments);
  } catch (error) {
    console.error("Error fetching filaments:", error);
    return NextResponse.json({ error: 'Failed to fetch filaments' }, { status: 500 });
  }
}