import { http } from "@/lib/api/http";

export type DashboardStats = {
  vehiclesCount: number;
  clientsCount: number;
  pendingCount: number;
  salesCount: number;
};

export async function getDashboardStats() {
  const res = await http<{ data: DashboardStats }>("/api/dashboard/stats", {
    method: "GET",
  });
  return res.data;
}

