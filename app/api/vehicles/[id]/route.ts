import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const supabase = createServerAdmin();

  const { data: vehicle, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .single();

  if (error || !vehicle) {
    return NextResponse.json({ message: error?.message || "Not found" }, { status: 404 });
  }

  let sale_date: string | null = null;
  let client: any = null;
  if (vehicle.status === "vendido") {
    const { data: sale } = await supabase
      .from("sales")
      .select(`sale_date, client:clients(id, name, phone)`)
      .eq("vehicle_id", vehicle.id)
      .order("sale_date", { ascending: false })
      .limit(1)
      .single();
    if (sale) {
      sale_date = sale.sale_date;
      client = sale.client;
    }
  }

  const { data: files } = await supabase
    .from("vehicles_files")
    .select("url_img")
    .eq("vehicle_id", vehicle.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    data: {
      ...vehicle,
      images: files?.map((f) => f.url_img) || [],
      sale_date,
      client,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as Partial<{
    brand: string;
    model: string;
    year: number;
    mileage: number;
    cost_price: number;
    price: number;
    price_currency: string;
    plate: string;
    color: string | null;
    status: string | null;
  }>;

  const supabase = createServerAdmin();
  const { data, error } = await supabase
    .from("vehicles")
    .update({
      ...(body.brand !== undefined ? { brand: body.brand } : {}),
      ...(body.model !== undefined ? { model: body.model } : {}),
      ...(body.year !== undefined ? { year: body.year } : {}),
      ...(body.mileage !== undefined ? { mileage: body.mileage } : {}),
      ...(body.cost_price !== undefined ? { cost_price: body.cost_price } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.plate !== undefined ? { plate: body.plate.toUpperCase() } : {}),
      ...(body.price_currency !== undefined
        ? {
            price_currency:
              body.price_currency === "USD" || body.price_currency === "PYG"
                ? body.price_currency
                : "PYG",
          }
        : {}),
      ...(body.color !== undefined ? { color: body.color } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    })
    .eq("id", vehicleId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ message: error?.message || "Failed" }, { status: 400 });
  }

  return NextResponse.json({ data });
}

