"use client";

import { useQuery } from "@tanstack/react-query";
import { getClient } from "@/lib/api/clients";

export function useClient(id: number | null) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => getClient(id as number),
    enabled: typeof id === "number" && Number.isFinite(id),
  });
}

