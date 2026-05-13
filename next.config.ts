import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Varias imágenes en `createVehicle` / `updateVehicle` superan el límite por defecto de 1 MB. */
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
