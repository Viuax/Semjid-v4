import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const [{ data: rooms }, { data: services }] = await Promise.all([
    supabase.from("rooms").select("*").order("id"),
    supabase.from("services").select("*").order("id"),
  ]);
  return NextResponse.json({ rooms: rooms || [], services: services || [] });
}
