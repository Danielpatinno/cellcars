import { http } from "@/lib/api/http";
import type { Vehicle } from "@/app/vehicles/actions";

export type VehicleWithImages = Vehicle & {
  images?: string[];
  sale_date?: string | null;
  client?: { id: number; name: string; phone: string } | null;
};

type ListResponse = { data: VehicleWithImages[] };
type SingleResponse = { data: VehicleWithImages };

export async function listVehicles() {
  const res = await http<ListResponse>("/api/vehicles", { method: "GET" });
  return res.data;
}

export async function getVehicle(id: number) {
  const res = await http<SingleResponse>(`/api/vehicles/${id}`, { method: "GET" });
  return res.data;
}

export async function updateVehicleApi(id: number, input: Partial<VehicleWithImages>) {
  const res = await http<{ data: VehicleWithImages }>(`/api/vehicles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data;
}

