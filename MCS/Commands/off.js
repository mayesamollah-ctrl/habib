const fs = require("fs");
const path = require("path");

let config = {};
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf-8"));
} catch (e) {}

module.exports = {
    config: {
        name: "off",
        aliases: ["shutdown", "poweroff", "botoff"],
        version: "1.0",
        credit: "MOHAMMAD BADOL",
        role: 2,        // শুধুমাত্র owner
        cooldown: 0,
        prefix: true,
        description: "বট সম্পূর্ণ বন্ধ করে দেয় — শুধুমাত্র Owner ব্যবহার করতে পারবেন"
    },

    onStartBadol: async (api, event) => {
        const { threadID, messageID } = event;
        const ownerID = config?.OWNER_LOCK?.ID || "61591265887748";

        // Owner check
        if (event.senderID !== ownerID) {
            return api.sendMessage(
                `╭⛔ ACCESS DENIED ━━━❍\n` +
                `│ 🔒 শুধুমাত্র Owner এই কমান্ড\n` +
                `│    ব্যবহার করতে পারবেন।\n` +
                `╰━━━━━━━━━━━━━━━━━━❍`,
                threadID, messageID
            );
        }

        try {
            await api.sendMessage(
                `╭🔴 SYSTEM SHUTDOWN ━━━❍\n` +
                `│ 🟡 STATUS : SHUTTING DOWN\n` +
                `│ 👋 বট বন্ধ হয়ে যাচ্ছে...\n` +
                `│\n` +
                `│ 🔁 আবার চালু করতে হলে:\n` +
                `│    সার্ভার থেকে restart করুন\n` +
                `│    অথবা /restart কমান্ড দিন\n` +
                `╰━━━━━━━━━━━━━━━━━━❍`,
                threadID, messageID
            );

            // ১.৫ সেকেন্ড পর gracefully বন্ধ হবে
            setTimeout(() => process.exit(0), 1500);

        } catch (e) {
            api.sendMessage(
                `╭🔴 SHUTDOWN FAILED ━━━❍\n` +
                `│ ❌ Error: ${e.message}\n` +
                `╰━━━━━━━━━━━━━━━━━━❍`,
                threadID
            );
        }
    }
};
