"use server";

import { createServerAdmin } from "@/lib/supabase/server";

export interface Sale {
  id: number;
  vehicle_id: number;
  client_id: number;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  status: string;
  notes: string | null;
  created_at: string;
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
  };
  client?: {
    id: number;
    name: string;
    cin: string;
    phone: string;
  };
}

export interface Installment {
  id: number;
  sale_id: number;
  receipt_number: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  client?: {
    id: number;
    name: string;
  };
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate: string;
  };
}

// Criar venda
export async function createSale(data: {
  vehicle_id: number;
  client_id: number;
  sale_date: string;
  total_amount: number;
  payment_method: string;
  notes?: string;
  installments: {
    receipt_number: string;
    amount: number;
    due_date: string;
  }[];
}) {
  const supabase = await createServerAdmin();

  // Criar venda
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      vehicle_id: data.vehicle_id,
      client_id: data.client_id,
      sale_date: data.sale_date,
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      notes: data.notes || null,
      status: "pendiente",
    })
    .select()
    .single();

  if (saleError || !sale) {
    return { success: false, message: "Error al crear venta: " + saleError?.message };
  }

    // Criar parcelas/recibos
    if (data.installments && data.installments.length > 0) {
      const installmentsToInsert = data.installments.map((inst) => ({
        sale_id: sale.id,
        receipt_number: inst.receipt_number,
        amount: inst.amount,
        due_date: inst.due_date,
        status: "pendiente",
      }));

      const { error: installmentsError } = await supabase
        .from("installments")
        .insert(installmentsToInsert);

      if (installmentsError) {
        console.error("Error creating installments:", installmentsError);
      }
    } else {
      // Se é "Al contado" e não tem parcelas, marca como completado
      if (data.payment_method === "Al contado") {
        await supabase
          .from("sales")
          .update({ status: "completado" })
          .eq("id", sale.id);
      }
    }

  // Atualizar status do veículo para "vendido"
  await supabase
    .from("vehicles")
    .update({ status: "vendido" })
    .eq("id", data.vehicle_id);

  return { success: true, sale };
}

// Listar vendas
export async function getSales() {
  const supabase = await createServerAdmin();

  const { data: sales, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      vehicle:vehicles(id, brand, model, year, plate),
      client:clients(id, name, cin, phone)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    return [];
  }

  return sales || [];
}

// Buscar venda por ID
export async function getSaleById(id: number) {
  const supabase = await createServerAdmin();

  const { data: sale, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      vehicle:vehicles(id, brand, model, year, plate, cost_price, price),
      client:clients(id, name, cin, phone, email, address)
    `
    )
    .eq("id", id)
    .single();

  if (error || !sale) {
    return null;
  }

  // Buscar parcelas
  const { data: installments } = await supabase
    .from("installments")
    .select("*")
    .eq("sale_id", id)
    .order("due_date", { ascending: true });

  return {
    ...sale,
    installments: installments || [],
  };
}

// Adicionar parcela a uma venda existente
export async function addInstallment(
  saleId: number,
  data: {
    receipt_number: string;
    amount: number;
    due_date: string;
  }
) {
  const supabase = await createServerAdmin();

  const { data: installment, error } = await supabase
    .from("installments")
    .insert({
      sale_id: saleId,
      receipt_number: data.receipt_number,
      amount: data.amount,
      due_date: data.due_date,
      status: "pendiente",
    })
    .select()
    .single();

  if (error || !installment) {
    return { success: false, message: "Error al agregar recibo: " + error?.message };
  }

  return { success: true, installment };
}

// Marcar parcela como paga
export async function markInstallmentAsPaid(
  installmentId: number,
  paymentDate: string,
  notes?: string | null
) {
  const supabase = await createServerAdmin();

  // Buscar sale_id antes de atualizar
  const { data: installmentData } = await supabase
    .from("installments")
    .select("sale_id")
    .eq("id", installmentId)
    .single();

  if (!installmentData) {
    return { success: false, message: "Recibo no encontrado" };
  }

  const { error: updateError } = await supabase
    .from("installments")
    .update({
      payment_date: paymentDate,
      status: "pagado",
      notes: notes || null,
    })
    .eq("id", installmentId);

  if (updateError) {
    return { success: false, message: "Error al marcar como pagado: " + updateError.message };
  }

  // Verificar se todas as parcelas estão pagas
  const { data: allInstallments } = await supabase
    .from("installments")
    .select("status")
    .eq("sale_id", installmentData.sale_id);

  // Só marca como completado se houver parcelas E todas estiverem pagas
  if (allInstallments && allInstallments.length > 0) {
    const allPaid = allInstallments.every((inst) => inst.status === "pagado");
    
    if (allPaid) {
      await supabase
        .from("sales")
        .update({ status: "completado" })
        .eq("id", installmentData.sale_id);
    } else {
      // Se ainda há parcelas pendentes, garante que o status seja "pendiente"
      await supabase
        .from("sales")
        .update({ status: "pendiente" })
        .eq("id", installmentData.sale_id);
    }
  }

  return { success: true };
}

// Buscar parcelas pendentes
export async function getPendingInstallments() {
  const supabase = await createServerAdmin();

  // Buscar parcelas que não estão pagas (pendiente ou vencido)
  const { data: installments, error } = await supabase
    .from("installments")
    .select(
      `
      *,
      sale:sales(
        vehicle:vehicles(id, brand, model, year, plate),
        client:clients(id, name)
      )
    `
    )
    .neq("status", "pagado")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching pending installments:", error);
    return [];
  }

  // Formatar dados e atualizar status para "vencido" se necessário
  const formatted = (installments || []).map((inst: any) => {
    const dueDate = new Date(inst.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    // Se a data de vencimento passou e ainda está pendente, marca como vencido
    let status = inst.status;
    if (dueDate < today && inst.status === "pendiente") {
      status = "vencido";
    }
    
    return {
      id: inst.id,
      receipt_number: inst.receipt_number,
      amount: inst.amount,
      due_date: inst.due_date,
      status: status,
      sale_id: inst.sale_id,
      client_name: inst.sale?.client?.name || "N/A",
      vehicle_info: inst.sale?.vehicle
        ? `${inst.sale.vehicle.brand} ${inst.sale.vehicle.model} ${inst.sale.vehicle.year} - ${inst.sale.vehicle.plate}`
        : "N/A",
    };
  });

  return formatted;
}

// Contar parcelas pendentes
export async function getPendingInstallmentsCount() {
  const supabase = await createServerAdmin();

  // Contar parcelas que não estão pagas
  const { count, error } = await supabase
    .from("installments")
    .select("*", { count: "exact", head: true })
    .neq("status", "pagado");

  if (error) {
    console.error("Error counting pending installments:", error);
    return 0;
  }

  return count || 0;
}

// Contar vendas do mês atual
export async function getSalesCountThisMonth() {
  const supabase = await createServerAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const { count, error } = await supabase
    .from("sales")
    .select("*", { count: "exact", head: true })
    .gte("sale_date", startOfMonth.toISOString().split("T")[0])
    .lte("sale_date", endOfMonth.toISOString().split("T")[0]);

  if (error) {
    console.error("Error counting sales this month:", error);
    return 0;
  }

  return count || 0;
}

