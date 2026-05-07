import { http } from "@/lib/api/http";
import type { Client } from "@/app/clientes/actions";

type ListResponse = { data: Client[] };
type SingleResponse = { data: Client };

export type ClientUpsertInput = {
  name: string;
  cin: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  birth_date?: string | null;
};

export async function listClients() {
  const res = await http<ListResponse>("/api/clients", { method: "GET" });
  return res.data;
}

export async function getClient(id: number) {
  const res = await http<SingleResponse>(`/api/clients/${id}`, { method: "GET" });
  return res.data;
}

export async function createClientApi(input: ClientUpsertInput) {
  const res = await http<SingleResponse>("/api/clients", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function updateClientApi(id: number, input: Partial<ClientUpsertInput>) {
  const res = await http<SingleResponse>(`/api/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function deleteClientApi(id: number) {
  await http<{ success: true }>(`/api/clients/${id}`, { method: "DELETE" });
}

