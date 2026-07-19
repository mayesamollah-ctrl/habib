const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "prefixmode",
        aliases: ["pfxmode", "globalprefix", "gprefix"],
        version: "1.2.0",
        role: 1,
        cooldown: 3,
        prefix: true,
        credit: "MOHAMMAD BADOL",
        description: "Enable/Disable Global No-Prefix Mode for all commands",
        commandCategory: "admin",
        usages: "/prefixmode [on/off/help]"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID } = event;
        const CONFIG_PATH = path.join(__dirname, "../../config.json");
        const CACHE_DIR = path.join(__dirname, "../../cache");

        // 🔥 ছবির ডাইরেক্ট লিংক
        const IMAGE_URL = "https://drive.google.com/uc?export=download&id=1wnuxg_jXyhO14r8VExQBcchyGEIYMixc";
        
        const sendWithImage = async (body) => {
            if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
            const imgPath = path.join(CACHE_DIR, `prefixmode_${Date.now()}.jpg`);
            
            try {
                const res = await axios.get(IMAGE_URL, { responseType: "arraybuffer", timeout: 10000 });
                fs.writeFileSync(imgPath, Buffer.from(res.data));
                
                return api.sendMessage({
                    body: body,
                    attachment: fs.createReadStream(imgPath)
                }, threadID, () => {
                    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                }, messageID);
            } catch (e) {
                // ছবি লোড না হলে শুধু টেক্সট
                return api.sendMessage(body, threadID, messageID);
            }
        };

        let config;
        try {
            config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        } catch (e) {
            return sendWithImage(`╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n┃ ❌ ERROR\n┃ Config file load failed\n╚═══════════════════╝`);
        }

        const action = args[0]?.toLowerCase();

        if (!config.BOT_INFO) config.BOT_INFO = {};
        const currentMode = config.BOT_INFO.GLOBAL_PREFIX_MODE || "off";

        if (action === "help" ||!action) {
            const modeStatus = currentMode === "on"? "🟢 ON - All No-Prefix" : "🔴 OFF - Config Based";
            return sendWithImage(`╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n┃ ⚙️ PREFIX MODE\n┃\n┃ Current: ${modeStatus}\n┃\n┃ Commands:\n┃ • on - Enable No-Prefix\n┃ • off - Disable No-Prefix\n┃ • help - Show this menu\n╚═══════════════════╝`);
        }

        if (action === "on") {
            config.BOT_INFO.GLOBAL_PREFIX_MODE = "on";
            try {
                fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf-8");
                if (typeof global.reloadConfig === "function") global.reloadConfig();

                return sendWithImage(`╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n┃ ✅ MODE ACTIVATED\n┃\n┃ Global Prefix: ON\n┃ All commands work\n┃ without prefix now\n┃\n┃ Example: help, admin\n╚═══════════════════╝`);
            } catch (e) {
                return sendWithImage(`╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n┃ ❌ ERROR\n┃ Failed to save config\n╚═══════════════════╝`);
            }
        }

        if (action === "off") {
            config.BOT_INFO.GLOBAL_PREFIX_MODE = "off";
            try {
                fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf-8");
                if (typeof global.reloadConfig === "function") global.reloadConfig();

                return sendWithImage(`╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n┃ ✅ MODE DEACTIVATED\n┃\n┃ Global Prefix: OFF\n┃ Commands work as per\n┃ individual config\n┃\n┃ prefix: true → /help\n┃ prefix: false → help\n╚═══════════════════╝`);
            } catch (e) {
                return sendWithImage(`╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n┃ ❌ ERROR\n┃ Failed to save config\n╚═══════════════════╝`);
            }
        }

        return sendWithImage(`╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n┃ ⚠️ INVALID\n┃ Use: /prefixmode\n┃ [on/off/help]\n╚═══════════════════╝`);
    }
};