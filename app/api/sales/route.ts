import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerAdmin();
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      *,
      vehicle:vehicles(id, brand, model, year, plate),
      client:clients(id, name, cin, phone)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

