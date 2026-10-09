import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono, Noto_Serif_Sinhala, Noto_Serif_Tamil } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const sinhala = Noto_Serif_Sinhala({ subsets: ["sinhala"], variable: "--font-noto-sinhala" });
const tamil = Noto_Serif_Tamil({ subsets: ["tamil"], variable: "--font-noto-tamil" });

export const metadata: Metadata = {
  title: "Nevidu Jayatilleke | NLP Researcher",
  description: "Personal website of Nevidu Jayatilleke, a Postgraduate Researcher specializing in Natural Language Processing.",
};

// Dark is the default; runs before first paint so a saved light choice doesn't flash dark
const themeScript = `try{if(localStorage.getItem("theme")==="light")delete document.documentElement.dataset.theme}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geist.variable} ${instrument.variable} ${jetbrains.variable} ${sinhala.variable} ${tamil.variable} font-sans antialiased`}
      >
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
