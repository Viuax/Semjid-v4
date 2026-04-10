#!/usr/bin/env node

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔗 SUPABASE_URL:", url ? "Set" : "Missing");
console.log("🔑 SUPABASE_SERVICE_ROLE_KEY:", svc ? "Set" : "Missing");

if (!url || !svc) {
  console.error("❌ Missing Supabase configuration");
  process.exit(1);
}

const supabase = createClient(url, svc);

async function testSupabase() {
  try {
    console.log("🧪 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("bookings")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Supabase query error:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Supabase connection successful, bookings count:", data);

    // Test insert (but don't actually insert)
    const testData = {
      ref: "TEST-" + Date.now(),
      fname: "Test",
      lname: "User",
      phone: "+976-99999999",
      email: "test@example.com",
      check_in: "2026-04-15",
      check_out: "2026-04-22",
      room_id: "room-1",
      guests: 1,
      payment: "cash",
      total: 1000,
      status: "test",
      special_code: "TEST123"
    };

    console.log("🧪 Testing insert structure...");
    const { error: insertError } = await supabase
      .from("bookings")
      .insert(testData);

    if (insertError) {
      console.error("❌ Insert test failed:", insertError);
      return { success: false, error: insertError.message };
    }

    console.log("✅ Insert structure test passed");

    return { success: true };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { success: false, error: String(err) };
  }
}

testSupabase().then(result => {
  console.log("Test result:", result);
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});