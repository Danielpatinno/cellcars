"use client";

import { useQuery } from "@tanstack/react-query";
import { getSale } from "@/lib/api/sales";

export function useSale(id: number | null) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => getSale(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}

