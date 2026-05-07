"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createClientApi,
  deleteClientApi,
  updateClientApi,
  type ClientUpsertInput,
} from "@/lib/api/clients";

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientUpsertInput) => createClientApi(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<ClientUpsertInput>;
    }) => updateClientApi(id, input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["clients"] });
      void qc.invalidateQueries({ queryKey: ["clients", vars.id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteClientApi(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

