const db = require('./db');
const { sendWhatsApp } = require('./notifications');

console.log("Testing WA Notification...");

// 1. Fetch a user with a phone number
db.query("SELECT name, phone FROM wp_eizin_users WHERE phone != '' AND phone IS NOT NULL LIMIT 1", async (err, results) => {
    if (err) {
        console.error("DB Error:", err);
        process.exit(1);
    }

    if (results.length === 0) {
        console.log("No users with phone numbers found in DB.");
        process.exit(0);
    }

    const user = results[0];
    console.log(`Found User: ${user.name} (${user.phone})`);
    console.log("Attempting to send message...");

    await sendWhatsApp(user.phone, "Tes Notifikasi E-Izin Magang (System Test)");
    console.log("Test function called. Check console for [WA SENT] or [WA ERROR] logs.");

    // Allow time for async fetch to complete
    setTimeout(() => {
        console.log("Exiting...");
        process.exit(0);
    }, 5000);
});
