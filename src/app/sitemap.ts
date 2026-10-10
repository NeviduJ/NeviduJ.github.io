import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Rebuilt by every deploy, including the daily Scholar sync
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/resume`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/Nevidu_Jayatilleke_CV.pdf`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
