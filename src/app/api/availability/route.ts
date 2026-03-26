import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId   = searchParams.get("roomId");
  const checkin  = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");

  if (!roomId || !checkin || !checkout)
    return NextResponse.json({ available: true, guests: 0, bookingCount: 0 });

  const { data, error } = await supabase
    .from("bookings")
    .select("guests")
    .eq("room_id", roomId)
    .neq("status", "cancelled")
    .lt("checkin", checkout)
    .gt("checkout", checkin);

  if (error) return NextResponse.json({ available: true, guests: 0, bookingCount: 0 });

  const totalGuests = data.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);
  return NextResponse.json({ available: data.length === 0, guests: totalGuests, bookingCount: data.length });
}