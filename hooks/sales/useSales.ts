"use client";

import { useQuery } from "@tanstack/react-query";
import { listSales } from "@/lib/api/sales";

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: listSales,
  });
}

