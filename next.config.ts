import type { NextConfig } from "next";

// Served from the root of https://neviduj.github.io/ (the NeviduJ.github.io repo), so no basePath
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
