const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "errorck",
        aliases: ["error", "err"],
        version: "1.5.0",
        credit: "MOHAMMAD BADOL",
        role: 1,
        cooldown: 15,
        prefix: true,
        description: "Check bot files for syntax and errors"
    },

    onStartBadol: async (api, event, args) => {
        const { threadID, messageID } = event;
        
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const cmdPath = path.join(__dirname, "../Commands");
        const evtPath = path.join(__dirname, "../Events");
        const CACHE_DIR = path.join(__dirname, "../../cache");
        
        if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
        const imgPath = path.join(CACHE_DIR, `health_${Date.now()}.jpg`);
        
        let errors = [];

        const checkFiles = (dir, type) => {
            if (!fs.existsSync(dir)) return;
            const files = fs.readdirSync(dir).filter(f => f.endsWith(".js") && f !== "errorck.js");
            for (const file of files) {
                try {
                    delete require.cache[require.resolve(path.join(dir, file))];
                    require(path.join(dir, file));
                } catch (e) {
                    errors.push(`• [${type}] ${file}\n   ⚠️ ${e.message.split('\n')[0]}`);
                }
            }
        };

        try {
            checkFiles(cmdPath, "CMD");
            checkFiles(evtPath, "EVT");

            const driveFileId = "1gZ8SDDl0Po8YTEfVOGzFFVKiZkJBY4Rk";
            const imgUrl = `https://drive.google.com/uc?export=view&id=${driveFileId}`;
            
            try {
                const imgRes = await axios.get(imgUrl, {
                    responseType: "arraybuffer",
                    timeout: 10000
                });
                fs.writeFileSync(imgPath, imgRes.data);
            } catch (e) {
                console.log("[ ERRORCK ] Image download failed:", e.message);
            }

            let msg = `╭─── BADOL-BOT-V5 ───╮\n`;
            msg += `│   SYSTEM HEALTH    \n`;
            msg += `╰────────────────────╯\n\n`;

            if (errors.length === 0) {
                msg += `✅ All command and event files are healthy!\nNo syntax errors found.`;
            } else {
                msg += `⚠️ ${errors.length} file errors found:\n\n${errors.join("\n\n")}`;
            }

            const sendData = { body: msg };
            if (fs.existsSync(imgPath)) {
                sendData.attachment = fs.createReadStream(imgPath);
            }

            api.setMessageReaction("✅", messageID, () => {}, true);

            return api.sendMessage(sendData, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);

        } catch (e) {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (err) {}
            
            api.setMessageReaction("⚠️", messageID, () => {}, true);
            
            return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
        }
    }
};