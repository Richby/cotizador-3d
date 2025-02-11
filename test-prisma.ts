// test-prisma.js
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log("✅ Conexión a la base de datos exitosa!");

    const filaments = await prisma.filament.findMany();
    console.log("Filamentos encontrados:", filaments);

  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();