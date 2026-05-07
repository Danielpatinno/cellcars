import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const installmentId = Number(id);
  if (!Number.isFinite(installmentId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as {
    paymentDate: string;
    notes?: string | null;
  };

  const supabase = createServerAdmin();

  const { data: installmentData } = await supabase
    .from("installments")
    .select("sale_id")
    .eq("id", installmentId)
    .single();

  if (!installmentData) {
    return NextResponse.json({ message: "Recibo no encontrado" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("installments")
    .update({
      payment_date: body.paymentDate,
      status: "pagado",
      notes: body.notes || null,
    })
    .eq("id", installmentId);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  const { data: allInstallments } = await supabase
    .from("installments")
    .select("status")
    .eq("sale_id", installmentData.sale_id);

  if (allInstallments && allInstallments.length > 0) {
    const allPaid = allInstallments.every((inst) => inst.status === "pagado");
    await supabase
      .from("sales")
      .update({ status: allPaid ? "completado" : "pendiente" })
      .eq("id", installmentData.sale_id);
  }

  return NextResponse.json({ success: true });
}

