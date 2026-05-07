import { http } from "@/lib/api/http";
import type { Sale } from "@/app/sales/actions";

type ListResponse = { data: Sale[] };
type SingleResponse = { data: any };

export async function listSales() {
  const res = await http<ListResponse>("/api/sales", { method: "GET" });
  return res.data;
}

export async function getSale(id: number) {
  const res = await http<SingleResponse>(`/api/sales/${id}`, { method: "GET" });
  return res.data;
}

export async function addInstallmentApi(
  saleId: number,
  input: { receipt_number: string; amount: number; due_date: string },
) {
  const res = await http<{ data: any }>(`/api/sales/${saleId}/installments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function markInstallmentPaidApi(
  installmentId: number,
  input: { paymentDate: string; notes?: string | null },
) {
  await http<{ success: true }>(`/api/installments/${installmentId}/pay`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

