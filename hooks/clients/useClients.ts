"use client";

import { useQuery } from "@tanstack/react-query";
import { listClients } from "@/lib/api/clients";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: listClients,
  });
}

