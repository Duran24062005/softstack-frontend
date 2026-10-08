import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { poppins } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SoftStack por Campuslands — Haz visible tu siguiente nivel",
    template: "%s | SoftStack por Campuslands",
  },
  description: "Una ruta práctica de Campuslands Tech Leap para convertir habilidades técnicas en una presencia profesional que abre puertas.",
  openGraph: {
    title: "SoftStack por Campuslands",
    description: "Aprende, practica y convierte tus habilidades técnicas en evidencia profesional.",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F084B",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${poppins.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Saltar al contenido</a>
        <div id="main-content" tabIndex={-1} className="flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
