import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

// Solo existe en peso 400, y es lo correcto: es una display serif, y engordarla
// la emborrona en vez de jerarquizarla.
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

// Terracotta no define una monoespaciada, pero los bloques de prompt la
// necesitan: son texto para copiar y pegar, no prosa.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Brief — Prompts de estrategia de contenido para tu IA",
  description:
    "Responde un cuestionario y te llevas los prompts para pegar en Claude, ChatGPT o Gemini. No genera tu contenido: genera las órdenes que tu IA necesita para escribirlo como lo escribirías tú.",
  openGraph: {
    title: "El Brief — Prompts de estrategia de contenido para tu IA",
    description:
      "No genera tu contenido. Genera las órdenes que tu IA necesita. Gratis y sin cuenta.",
    locale: "es",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
