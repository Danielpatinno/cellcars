import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerAdmin();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServerAdmin();
  const body = (await request.json()) as {
    name: string;
    cin: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    birth_date?: string | null;
  };

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: body.name,
      cin: body.cin,
      phone: body.phone,
      email: body.email ?? null,
      address: body.address ?? null,
      birth_date: body.birth_date ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

