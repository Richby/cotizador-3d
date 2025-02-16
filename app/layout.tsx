// app/layout.tsx
import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="bg-gray-100 text-gray-900 min-h-screen">
          <nav className="p-4 bg-white shadow-md flex justify-between items-center">
            <h1 className="text-xl font-bold text-orange-500">Cotizador 3D</h1>
            <div>
              <Link href="/">Inicio</Link>
              <Link href="/upload">Subir Modelo</Link>
            </div>
          </nav>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}