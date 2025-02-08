// app/page.tsx
import ModelViewer from './components/ModelViewer'; // Ensure this path is correct and the file exists
import FilamentSelector from './components/ui/FilamentSelector';
import CostDisplay from './components/ui/CostDisplay';
import { prisma } from '@/lib/prisma'; // Este alias debería seguir funcionando

async function getFilaments() {
  const filaments = await prisma.filament.findMany();
  return filaments;
}

export default async function Home() {
  const filaments = await getFilaments();

  return (
    <main className="flex min-h-screen flex-col items-center p-12">
      <h1 className="text-4xl font-bold text-center mb-8">Cotizador de Impresión 3D</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="flex flex-col gap-4">
          <ModelViewer />
          <FilamentSelector filaments={filaments} />
        </div>
        <CostDisplay />
      </div>
    </main>
  );
}