import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET reviews
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room_id = searchParams.get("room_id");

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("room_id", room_id)
    .eq("approved", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST review
export async function POST(req: Request) {
  const body = await req.json();
  const { room_id, fname, rating, comment } = body;

  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        room_id,
        fname,
        rating,
        comment,
      },
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}