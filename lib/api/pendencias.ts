import { http } from "@/lib/api/http";

export type PendingInstallment = {
  id: number;
  receipt_number: string;
  amount: number;
  due_date: string;
  status: string;
  sale_id: number;
  client_name: string;
  vehicle_info: string;
};

export async function listPendencias() {
  const res = await http<{ data: PendingInstallment[] }>("/api/pendencias", {
    method: "GET",
  });
  return res.data;
}

