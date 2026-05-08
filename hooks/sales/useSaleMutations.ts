"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addInstallmentApi,
  deleteSaleApi,
  markInstallmentPaidApi,
} from "@/lib/api/sales";

export function useAddInstallment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      saleId,
      input,
    }: {
      saleId: number;
      input: { receipt_number: string; amount: number; due_date: string };
    }) => addInstallmentApi(saleId, input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["sales"] });
      void qc.invalidateQueries({ queryKey: ["sales", vars.saleId] });
    },
  });
}

export function useMarkInstallmentPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      installmentId,
      input,
    }: {
      installmentId: number;
      input: { paymentDate: string; notes?: string | null };
    }) => markInstallmentPaidApi(installmentId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["sales"] });
      void qc.invalidateQueries({ queryKey: ["pendencias"] });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (saleId: number) => deleteSaleApi(saleId),
    onSuccess: (data, saleId) => {
      void qc.invalidateQueries({ queryKey: ["sales"] });
      void qc.invalidateQueries({ queryKey: ["sales", saleId] });
      void qc.invalidateQueries({ queryKey: ["vehicles"] });
      void qc.invalidateQueries({ queryKey: ["vehicles", data.vehicle_id] });
      void qc.invalidateQueries({ queryKey: ["pendencias"] });
      void qc.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

