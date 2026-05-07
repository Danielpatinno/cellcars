import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const saleId = Number(id);
  if (!Number.isFinite(saleId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as {
    receipt_number: string;
    amount: number;
    due_date: string;
  };

  const supabase = createServerAdmin();
  const { data, error } = await supabase
    .from("installments")
    .insert({
      sale_id: saleId,
      receipt_number: body.receipt_number,
      amount: body.amount,
      due_date: body.due_date,
      status: "pendiente",
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message || "Failed" }, { status: 400 });
  }

  // Garantir que a venda fique "pendiente" se houver novas parcelas
  await supabase.from("sales").update({ status: "pendiente" }).eq("id", saleId);

  return NextResponse.json({ data }, { status: 201 });
}

