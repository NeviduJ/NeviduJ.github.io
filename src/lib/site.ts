export const SITE_URL = "https://neviduj.github.io";

// Pre-rendered share card (a real .png, so GitHub Pages serves it with an image content type).
// Pages that set their own openGraph must include it again: Next.js doesn't merge nested metadata.
export const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "Nevidu Jayatilleke, NLP researcher" };
