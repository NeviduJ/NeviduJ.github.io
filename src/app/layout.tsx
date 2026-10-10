import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono, Noto_Serif_Sinhala, Noto_Serif_Tamil } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/CursorGlow";
import { OG_IMAGE, SITE_URL } from "@/lib/site";

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

const DESCRIPTION =
  "Nevidu Jayatilleke is a Sri Lankan NLP researcher at the University of Moratuwa, specialising in multilingual natural language processing, computational semantics and diachronic linguistics, with publications at LREC, AACL-IJCNLP, PACLIC and RANLP.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nevidu Jayatilleke | NLP Researcher",
    template: "%s | Nevidu Jayatilleke",
  },
  description: DESCRIPTION,
  keywords: [
    "Nevidu Jayatilleke",
    "NLP researcher",
    "Natural Language Processing",
    "multilingual NLP",
    "computational semantics",
    "diachronic linguistics",
    "semantic change",
    "Sinhala NLP",
    "Tamil NLP",
    "low-resource languages",
    "University of Moratuwa",
    "Sri Lanka",
  ],
  authors: [{ name: "Nevidu Jayatilleke", url: SITE_URL }],
  creator: "Nevidu Jayatilleke",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    firstName: "Nevidu",
    lastName: "Jayatilleke",
    url: "/",
    siteName: "Nevidu Jayatilleke",
    title: "Nevidu Jayatilleke | NLP Researcher",
    description: DESCRIPTION,
    locale: "en_GB",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nevidu Jayatilleke | NLP Researcher",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
  verification: { google: "KM7MQm8GbS0eUWGOQq_UiQPY8mpYnmTZbaZysY9hs8g" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
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
