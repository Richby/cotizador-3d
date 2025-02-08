// app/layout.tsx
import "./globals.css"; // Asegúrate de que la ruta sea correcta
import Link from "next/link";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <div className="bg-gray-100 text-gray-900 min-h-screen">
          <nav className="p-4 bg-white shadow-md flex justify-between items-center">
            <h1 className="text-xl font-bold text-orange-500">Cotizador 3D</h1>
            <div>
              <Link href="/" className="mr-4 hover:text-orange-500 transition-colors">
                Inicio
              </Link>
              <Link
                href="/"
                className="ml-4 hover:text-orange-500 transition-colors"
              >
                Subir Modelo
              </Link>
            </div>
          </nav>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}