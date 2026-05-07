import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const saleId = Number(id);
  if (!Number.isFinite(saleId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const supabase = createServerAdmin();
  const { data: sale, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      vehicle:vehicles(id, brand, model, year, plate, cost_price, price),
      client:clients(id, name, cin, phone, email, address)
    `,
    )
    .eq("id", saleId)
    .single();

  if (error || !sale) {
    return NextResponse.json({ message: error?.message || "Not found" }, { status: 404 });
  }

  const { data: installments } = await supabase
    .from("installments")
    .select("*")
    .eq("sale_id", saleId)
    .order("due_date", { ascending: true });

  return NextResponse.json({ data: { ...sale, installments: installments || [] } });
}

