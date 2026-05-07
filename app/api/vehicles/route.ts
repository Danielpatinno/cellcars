import { NextResponse } from "next/server";

import { createServerAdmin } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServerAdmin();

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (vehiclesError) {
    return NextResponse.json({ message: vehiclesError.message }, { status: 500 });
  }

  const vehiclesWithImages = await Promise.all(
    (vehicles || []).map(async (vehicle) => {
      const { data: files } = await supabase
        .from("vehicles_files")
        .select("url_img")
        .eq("vehicle_id", vehicle.id)
        .order("created_at", { ascending: true });

      return {
        ...vehicle,
        images: files?.map((f) => f.url_img) || [],
      };
    }),
  );

  return NextResponse.json({ data: vehiclesWithImages });
}

