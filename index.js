// BADOL-BOT-V5 — Entry Point
// ✅ Katabump | ✅ GitHub Actions | ✅ Render Support
const login = require("stfca");
const fs    = require("fs");
const path  = require("path");
const config = require("./config.json");
const logger = require("./BADOL-Main/logger");

// ─── Web Server (Render-এর জন্য আবশ্যক) ───────────────────
const { startServer } = require("./server");
startServer(); // Render বা UptimeRobot ব্যবহার করলে এটা port খোলে

// ─── Appstate Check ────────────────────────────────────────
if (!fs.existsSync("BADOL-Appstate.json")) {
    logger.error("BADOL-Appstate.json ফাইলটি খুঁজে পাওয়া যায়নি!");
    process.exit(1);
}

const appState = JSON.parse(fs.readFileSync("BADOL-Appstate.json", "utf8"));

// ─── Facebook Login ────────────────────────────────────────
login({ appState }, (err, api) => {
    if (err) {
        console.error("Login Failed:", err);
        return;
    }

    console.log("✅ BADOL-BOT: Logged in successfully!");

    // API options — connection stable রাখতে
    api.setOptions({
        listenEvents: true,
        selfListen:   config.BEHAVIOR?.SELF_LISTEN || false,
        logLevel:     "silent",
        updatePresence: false,
        forceLogin:   false
    });

    const handlerPath = path.join(__dirname, "BADOL-Main", "badol.js");
    require(handlerPath)(api);

    logger.autoBanner();
});
