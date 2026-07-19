// ═══════════════════════════════════════════════════════════
//  BADOL-BOT-V5 — Web Server (Render + UptimeRobot support)
// ═══════════════════════════════════════════════════════════
// Render-এ চালাতে হলে একটা HTTP port খোলা থাকতে হবে।
// এই ফাইলটা সেই কাজ করে।
// UptimeRobot দিয়ে এই URL-এ ping দিলে বট কখনো sleep যাবে না।

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Health Check endpoint — Render এখানে request দেয়
app.get("/", (req, res) => {
    const uptime = process.uptime();
    const hours   = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    res.status(200).json({
        status:   "✅ BADOL-BOT V5 is ONLINE",
        bot:      "BADOL-BOT-V5",
        owner:    "MOHAMMAD BADOL",
        version:  "5.2.1",
        uptime:   `${hours}h ${minutes}m ${seconds}s`,
        message:  "পিং সফল! বট চলছে।"
    });
});

// Ping endpoint — UptimeRobot এখানে ping দেবে
app.get("/ping", (req, res) => {
    res.status(200).send("🟢 pong — BADOL-BOT V5 alive");
});

// Status page
app.get("/status", (req, res) => {
    res.status(200).json({
        bot_name:   "BADOL-BOT-V5",
        owner:      "MOHAMMAD BADOL",
        commands:   global.commands?.size || 0,
        events:     global.events?.size   || 0,
        uptime_sec: Math.floor(process.uptime()),
        started:    new Date(Date.now() - process.uptime() * 1000).toISOString()
    });
});

const startServer = () => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🌐 [SERVER] Web server running on port ${PORT}`);
        console.log(`🔗 [SERVER] Health check: http://0.0.0.0:${PORT}/`);
    });
};

module.exports = { app, startServer };
