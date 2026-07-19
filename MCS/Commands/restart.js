const fs = require("fs");
const path = require("path");

const SYNC_FILE = path.join(__dirname, "../../restart_sync.json");

module.exports = {
    config: {
        name: "restart",
        aliases: ["resed", "r"],
        version: "3.5",
        credit: "MOHAMMAD BADOL", 
        role: 1,                  
        cooldown: 5,             
        prefix: true,            
        description: "Restarts the bot safely with dynamic notification sync."
    },

    onLoadBadol: async function ({ api }) {
        if (fs.existsSync(SYNC_FILE)) {
            setTimeout(async () => {
                try {
                    const data = JSON.parse(fs.readFileSync(SYNC_FILE, "utf-8"));
                    const { threadID, msgID, startTime } = data;

                    if (msgID) {
                        try { await api.unsendMessage(msgID); } catch (e) {}
                    }

                    const time = Math.round((Date.now() - startTime) / 1000);

                    const successMsg = 
                        `╭🕒 SYSTEM ONLINE ━━━❍\n` +
                        `│ 🟢 STATUS : SUCCESSFUL\n` +
                        `│ ⚡ SPEED  : ${time}s SECONDS\n` +
                        `╰━━━━━━━━━━━━━━━━━━❍`;

                    await api.sendMessage(successMsg, threadID);

                } catch (e) {
                    console.error("Restart notification failed:", e.message);
                } finally {
                    try { if (fs.existsSync(SYNC_FILE)) fs.unlinkSync(SYNC_FILE); } catch (e) {}
                }
            }, 3000); 
        }
    },

    onStartBadol: async function (api, event, args) {
        let ownerID = "61591265887748";
        try {
            const fs = require("fs"), path = require("path");
            const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf-8"));
            ownerID = cfg?.OWNER_LOCK?.ID || ownerID;
        } catch (e) {}
        if (event.senderID !== ownerID) {
            const accessDeniedMsg = 
                `╭⛔ ACCESS DENIED ━━━❍\n` +
                `│ Only Owner Mohammad Badol\n` +
                `│ can use this command.\n` +
                `╰━━━━━━━━━━━━━━━━━━❍`;
            return api.sendMessage(accessDeniedMsg, event.threadID, event.messageID);
        }

        try {
            const processMsg = 
                `╭🔄 SYSTEM REBOOT ━━━❍\n` +
                `│ Restarting BADOL-BOT V5...\n` +
                `│ Please wait for 40 seconds.\n` +
                `╰━━━━━━━━━━━━━━━━━━❍`;

            const msgInfo = await api.sendMessage(processMsg, event.threadID, event.messageID);
            
            const restartData = {
                threadID: event.threadID,
                msgID: msgInfo.messageID,
                startTime: Date.now()
            };
            
            fs.writeFileSync(SYNC_FILE, JSON.stringify(restartData, null, 4), "utf-8");

            setTimeout(() => {
                process.exit(1); 
            }, 1000);

        } catch (e) {
            const errorMsg = 
                `╭🔴 REBOOT FAILED ━━━❍\n` +
                `│ Error: ${e.message}\n` +
                `╰━━━━━━━━━━━━━━━━━━❍`;
            api.sendMessage(errorMsg, event.threadID);
        }
    }
};

