import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerAdmin();

  const { data: installments, error } = await supabase
    .from("installments")
    .select(
      `
      *,
      sale:sales(
        vehicle:vehicles(id, brand, model, year, plate),
        client:clients(id, name)
      )
    `,
    )
    .neq("status", "pagado")
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const formatted = (installments || []).map((inst: any) => {
    const dueDate = new Date(inst.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    let status = inst.status;
    if (dueDate < today && inst.status === "pendiente") status = "vencido";

    return {
      id: inst.id,
      receipt_number: inst.receipt_number,
      amount: inst.amount,
      due_date: inst.due_date,
      status,
      sale_id: inst.sale_id,
      client_name: inst.sale?.client?.name || "N/A",
      vehicle_info: inst.sale?.vehicle
        ? `${inst.sale.vehicle.brand} ${inst.sale.vehicle.model} ${inst.sale.vehicle.year} - ${inst.sale.vehicle.plate}`
        : "N/A",
    };
  });

  return NextResponse.json({ data: formatted });
}

