import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const clientId = Number(id);
  if (!Number.isFinite(clientId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const supabase = createServerAdmin();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const clientId = Number(id);
  if (!Number.isFinite(clientId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as {
    name?: string;
    cin?: string;
    phone?: string;
    email?: string | null;
    address?: string | null;
    birth_date?: string | null;
  };

  const supabase = createServerAdmin();
  const { data, error } = await supabase
    .from("clients")
    .update({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.cin !== undefined ? { cin: body.cin } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.birth_date !== undefined ? { birth_date: body.birth_date } : {}),
    })
    .eq("id", clientId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const clientId = Number(id);
  if (!Number.isFinite(clientId)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const supabase = createServerAdmin();
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

