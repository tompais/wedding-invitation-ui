import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Angie & Tomi - Invitación de Boda",
  description:
    "Invitación digital para nuestra boda. Confirmá tu asistencia a la ceremonia civil y fiesta. Julio 2026.",
  keywords: ["boda", "casamiento", "invitación", "Angie", "Tomi", "2026"],
  authors: [{ name: "Angie & Tomi" }],
  openGraph: {
    title: "Angie & Tomi - Invitación de Boda",
    description: "Nos casamos! Confirmá tu asistencia.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className="bg-hueso font-body text-text-dark m-0 flex min-h-screen w-full min-w-[320px] flex-col overflow-x-hidden leading-relaxed">
        {children}
      </body>
    </html>
  );
}
