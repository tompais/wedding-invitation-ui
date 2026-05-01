import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className="flex overflow-x-hidden flex-col m-0 w-full min-h-screen leading-relaxed bg-hueso font-body text-text-dark min-w-[320px]">
        {children}
      </body>
    </html>
  );
}
