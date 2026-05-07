import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerAdmin();

  const [{ count: vehiclesCount }, { count: clientsCount }, { count: pendingCount }] =
    await Promise.all([
      supabase.from("vehicles").select("*", { count: "exact", head: true }),
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase
        .from("installments")
        .select("*", { count: "exact", head: true })
        .neq("status", "pagado"),
    ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const { count: salesCount } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .gte("sale_date", startOfMonth.toISOString().split("T")[0])
    .lte("sale_date", endOfMonth.toISOString().split("T")[0]);

  return NextResponse.json({
    data: {
      vehiclesCount: vehiclesCount || 0,
      clientsCount: clientsCount || 0,
      pendingCount: pendingCount || 0,
      salesCount: salesCount || 0,
    },
  });
}

