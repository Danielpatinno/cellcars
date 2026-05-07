"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVehicleApi } from "@/lib/api/vehicles";

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Record<string, any> }) =>
      updateVehicleApi(id, input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["vehicles"] });
      void qc.invalidateQueries({ queryKey: ["vehicles", vars.id] });
    },
  });
}

