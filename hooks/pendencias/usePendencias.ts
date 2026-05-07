"use client";

import { useQuery } from "@tanstack/react-query";
import { listPendencias } from "@/lib/api/pendencias";

export function usePendencias() {
  return useQuery({
    queryKey: ["pendencias"],
    queryFn: listPendencias,
  });
}

