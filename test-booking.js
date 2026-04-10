#!/usr/bin/env node

async function testBooking() {
  try {
    console.log("🧪 Testing booking submission...");

    const bookingData = {
      fname: "Test",
      lname: "User",
      phone: "+976-99999999",
      email: "test@example.com",
      checkin: "2026-04-15",
      checkout: "2026-04-22",
      roomId: "101",
      guests: 1,
      guestDetails: [],
      notes: "Test booking",
      payment: "cash",
      total: 616000
    };

    console.log("📤 Sending booking data:", bookingData);

    const response = await fetch("http://localhost:3000/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    console.log("📥 Response status:", response.status);
    console.log("📥 Response data:", data);

    if (!response.ok) {
      console.error("❌ Booking failed:", data.error);
      return { success: false, error: data.error };
    }

    console.log("✅ Booking successful:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Test error:", err);
    return { success: false, error: String(err) };
  }
}

testBooking().then(result => {
  console.log("Test result:", result);
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});