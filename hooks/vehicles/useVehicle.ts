"use client";

import { useQuery } from "@tanstack/react-query";
import { getVehicle } from "@/lib/api/vehicles";

export function useVehicle(id: number | null) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => getVehicle(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}

