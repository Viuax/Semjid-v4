import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Log env vars (masked)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log("Supabase URL:", url ? url.slice(0, 30) + "..." : "MISSING");
    console.log("Service key:", svc ? svc.slice(0, 10) + "..." : "MISSING");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File:", file.name, file.type, file.size);

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF or image files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "pdf";
    const fileName = `ilgeeh-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log("Uploading to bucket: ilgeeh-bichig, file:", fileName);

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from("ilgeeh-bichig")
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Upload error details:", JSON.stringify(uploadError));
      return NextResponse.json({ 
        error: uploadError.message,
        details: JSON.stringify(uploadError)
      }, { status: 500 });
    }

    console.log("Upload success:", data);

    const { data: urlData } = supabaseAdmin.storage
      .from("ilgeeh-bichig")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl, fileName });
  } catch (err) {
    console.error("Caught error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}