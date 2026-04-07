import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rooms, roomInstances, services } from "@/lib/data";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fname, lname, phone, email,
      checkin, checkout, roomId, svcIds,
      guests, guestDetails, notes, payment, total,
      ilgeehBichigUrl,
    } = body;

    // Validate required fields
    if (!fname || !lname || !phone || !checkin || !checkout || !roomId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate date format and logical order
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkin) || !dateRegex.test(checkout)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime()) || checkoutDate <= checkinDate) {
      return NextResponse.json({ error: "Checkout must be after checkin" }, { status: 400 });
    }

    // Calculate expected total for validation
    const nights = Math.max(0, Math.round((checkoutDate.getTime() - checkinDate.getTime()) / 86400000));
    const roomInstance = roomInstances.find(r => r.id === roomId);
    const roomCategory = roomInstance ? rooms.find(r => r.id === roomInstance.categoryId) : null;
    const roomRate = roomCategory?.adult1 ?? roomCategory?.adult2 ?? 0;
    const expectedRoomPrice = roomRate * nights * (guestDetails?.length || 1);
    const expectedSvcPrice = (svcIds || []).reduce((sum: number, id: string) => {
      const service = services.find(s => s.id === id);
      return sum + (service?.price ?? 0);
    }, 0);
    const expectedTotal = expectedRoomPrice + expectedSvcPrice;

    // Validate total (allow small rounding differences)
    if (Math.abs(total - expectedTotal) > 1000) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    // Check for mixed gender rule - male and female cannot be in same room
    if (guestDetails && guestDetails.length > 0) {
      const genders = guestDetails.map((g: { gender: string }) => g.gender).filter((g: string) => g);
      const hasMale = genders.includes("male");
      const hasFemale = genders.includes("female");

      if (hasMale && hasFemale) {
        return NextResponse.json({ error: "Male and female guests cannot share the same room" }, { status: 400 });
      }

      // Check if room already has opposite gender
      const [{ data: existingBookings }] = await Promise.all([
        supabaseAdmin
          .from("bookings")
          .select("guest_details")
          .eq("room_id", roomId)
          .neq("status", "cancelled")
          .lt("check_in", checkout)
          .gt("check_out", checkin),
      ]);

      const existingGenders = (existingBookings || []).flatMap(b => b.guest_details || []).map(g => g.gender).filter(g => g);
      const existingHasMale = existingGenders.includes("male");
      const existingHasFemale = existingGenders.includes("female");

      if ((hasMale && existingHasFemale) || (hasFemale && existingHasMale)) {
        return NextResponse.json({ error: "This room already has guests of the opposite gender. Mixed genders are not allowed." }, { status: 400 });
      }
    }

    // Generate booking reference
    const ref = `SKH-${Date.now().toString().slice(-6)}`;

    // Generate special code for client verification
    const specialCode = generateSpecialCode();

    // Save to Supabase
    let insertData: Record<string, unknown> = {
      ref,
      fname, lname, phone, email,
      check_in: checkin,
      check_out: checkout,
      room_id: roomId,
      treatments: svcIds || [],
      guests: parseInt(guests) || 1,
      notes,
      payment: payment || "cash",
      total: total || 0,
      status: "pending",
      special_code: specialCode,
    };

    // Add new columns if they exist in the schema
    if (guestDetails && guestDetails.length > 0) {
      insertData.guest_details = guestDetails;
    }
    if (ilgeehBichigUrl) {
      insertData.ilgeeh_bichig_url = ilgeehBichigUrl;
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // Send email notification to admin via Supabase Edge or fallback
    try {
      await sendAdminEmail({ ref, fname, lname, phone, email, checkin, checkout, roomId, total, payment, guestDetails, notes, svcIds });
    } catch (emailErr) {
      console.error("Email failed:", emailErr);
      // Don't fail the booking if email fails
    }

    // Send SMS with special code to client
    try {
      await sendSpecialCodeSMS(phone, specialCode, ref);
    } catch (smsErr) {
      console.error("SMS failed:", smsErr);
      // Don't fail the booking if SMS fails
    }

    return NextResponse.json({ success: true, ref, id: data.id, specialCode });
  } catch (err: unknown) {
    console.error("Booking error:", err);
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }
}

async function sendAdminEmail(b: {
  ref: string; fname: string; lname: string; phone: string; email: string;
  checkin: string; checkout: string; roomId: string; total: number;
  payment: string; guestDetails?: { gender: string }[]; notes: string; svcIds: string[];
}) {
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fbfd;padding:24px;border-radius:12px;">
      <div style="background:#0d7377;padding:20px 24px;border-radius:8px;margin-bottom:20px;">
        <h1 style="color:white;margin:0;font-size:20px;">🏥 Шинэ захиалга ирлээ!</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Сэмжид Хүжирт Рашаан Сувилал</p>
      </div>
      <div style="background:white;padding:20px;border-radius:8px;margin-bottom:16px;">
        <h2 style="font-size:14px;color:#64748b;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Захиалгын дугаар: <span style="color:#0d7377;">${b.ref}</span></h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">Нэр:</td><td style="padding:8px 0;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.fname} ${b.lname}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">Утас:</td><td style="padding:8px 0;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.phone}</td></tr>
          ${b.guestDetails ? `<tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">Зочдын хүйс:</td><td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.guestDetails.map((g, i) => `Guest ${i+1}: ${g.gender}`).join("<br>")}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">И-мэйл:</td><td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.email || "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">Ирэх өдөр:</td><td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.checkin}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">Явах өдөр:</td><td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.checkout}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">Өрөө:</td><td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.roomId}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;border-bottom:1px solid #f1f5f9;">Төлбөр:</td><td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">${b.payment}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;">Нийт дүн:</td><td style="padding:8px 0;font-weight:700;color:#0d7377;font-size:16px;">${new Intl.NumberFormat("mn-MN").format(b.total)}₮</td></tr>
        </table>
        ${b.notes ? `<div style="margin-top:12px;padding:12px;background:#f8fbfd;border-radius:6px;font-size:13px;color:#64748b;"><strong>Тэмдэглэл:</strong> ${b.notes}</div>` : ""}
      </div>
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="display:inline-block;background:#0d7377;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Admin хэсэгт нэвтрэх →</a>
      </div>
      <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">Сэмжид Хүжирт Рашаан Сувилал · 8802-1191</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Semjid Booking <booking@semjid.mn>",
      to: ADMIN_EMAIL,
      subject: `🏥 Шинэ захиалга: ${b.fname} ${b.lname} — ${b.ref}`,
      html,
    }),
  });
}

function generateSpecialCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

async function sendSpecialCodeSMS(phone: string, specialCode: string, ref: string) {
  const SMS_API_URL = process.env.SMS_API_URL;
  const SMS_API_KEY = process.env.SMS_API_KEY;

  if (!SMS_API_URL || !SMS_API_KEY) {
    console.log("SMS not configured, skipping SMS send");
    return;
  }

  const message = `Сэмжид Хүжирт: Таны захиалга амжилттай баталгаажлаа. Захиалгын дугаар: ${ref}. Тусгай код: ${specialCode}. Энэ кодыг рашаан сувилалд ирэхэд ашиглана уу.`;

  try {
    // Try different API formats based on provider
    let requestBody: Record<string, string> = {
      to: phone,
      message: message,
    };

    // Check if it's a specific provider that needs different format
    if (SMS_API_URL.includes('mobicom')) {
      requestBody = {
        recipient: phone,
        text: message,
        sender: 'Semjid'
      };
    } else if (SMS_API_URL.includes('unitel')) {
      requestBody = {
        phone: phone,
        content: message,
        from: 'Semjid'
      };
    }

    const response = await fetch(SMS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SMS_API_KEY}`,
        // Some providers use API-Key header
        "API-Key": SMS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SMS API error: ${response.status} - ${errorText}`);
    }

    console.log("SMS sent successfully to", phone);
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw error;
  }
}
