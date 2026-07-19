module.exports = {
    config: {
        name: "autoseen",
        version: "3.2.0",
        credit: "MOHAMMAD BADOL",
        role: 1,
        prefix: true,
        cooldown: 5,
        aliases: []
    },

    onChatBadol: async function(api, event) {
        if (global.autoSeenStatus === true) {
            try {
                api.markAsReadAll(() => {});
            } catch (e) {}
        }
    },

    onStartBadol: async function(api, event, args) {
        const { threadID, messageID } = event;
        const action = args[0] ? args[0].toLowerCase() : "";
        const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

        if (action === "on") {
            global.autoSeenStatus = true;
            const msg = `╭─❏ AUTO SEEN ON\n` +
                        `│ ✅ Auto seen on successfully!\n` +
                        `│ ⏰ Time: ${time}\n` +
                        `│ 🤖 Bot: BADOL-BOT-V5\n` +
                        `╰──────────────`;
            return api.sendMessage(msg, threadID, messageID);
        } 
        else if (action === "off") {
            global.autoSeenStatus = false;
            const msg = `╭─❏ AUTO SEEN OFF\n` +
                        `│ ❌ Auto Seen off successfully!\n` +
                        `│ ⏰ Time: ${time}\n` +
                        `│ 🤖 Bot: BADOL-BOT-V5\n` +
                        `╰──────────────`;
            return api.sendMessage(msg, threadID, messageID);
        } 
        else {
            const status = global.autoSeenStatus ? "ON" : "OFF";
            const msg = `╭─❏ AUTO SEEN STATUS\n` +
                        `│ ⚙️ Current Status: ${status}\n` +
                        `│ 💡 Usage: /autoseen on / off\n` +
                        `│ 🤖 Bot: BADOL-BOT-V5\n` +
                        `╰──────────────`;
            return api.sendMessage(msg, threadID, messageID);
        }
    }
};