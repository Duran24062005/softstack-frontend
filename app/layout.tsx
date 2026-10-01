import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoftStack — Haz visible tu siguiente nivel",
  description: "Una ruta práctica para convertir tus habilidades técnicas en una presencia profesional que abre puertas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
