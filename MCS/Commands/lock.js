const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CACHE_FILE = path.join(__dirname, "../../cache/lock_data.json");
const IMAGE_URL = "https://drive.google.com/uc?export=view&id=1gXdSOArViXt_cRCHDgaAuo_sifAGk_Nt";

const loadLocks = () => (fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) : {});
const saveLocks = (data) => fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 4), "utf-8");

async function getStreamFromURL(url) {
    const response = await axios.get(url, { responseType: 'stream' });
    return response.data;
}

module.exports = {
    config: {
        name: "lock",
        aliases: ["lockgroup"],
        version: "2.1.0",
        credit: "MOHAMMAD BADOL",
        role: 1,
        cooldown: 5,
        prefix: true,
        description: "Group lock system with auto-kick"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID } = event;
        let data = loadLocks();
        const action = args[0]?.toLowerCase();
        const imageStream = await getStreamFromURL(IMAGE_URL);

        if (action === "on") {
            data[threadID] = { status: true, warnedUsers: {} };
            saveLocks(data);
            return api.sendMessage({ body: "╭─── [ BADOL-BOT-V5 ] ───❍\n│ ✅ Lock status: ENABLED\n╰──────────────────────❍", attachment: imageStream }, threadID, messageID);
        } else if (action === "off") {
            delete data[threadID];
            saveLocks(data);
            return api.sendMessage({ body: "╭─── [ BADOL-BOT-V5 ] ───❍\n│ 🔓 Lock status: DISABLED\n╰──────────────────────❍", attachment: imageStream }, threadID, messageID);
        } else if (action === "help") {
            const status = data[threadID]?.status ? "ON" : "OFF";
            return api.sendMessage({ body: `╭─── [ BADOL-BOT-V5 ] ───❍\n│ 📌 Lock Status: ${status}\n│ 🛠️ Use: /lock on | off\n│ ⚠️ Rules: 3 warnings = KICK\n╰──────────────────────❍`, attachment: imageStream }, threadID, messageID);
        } else {
            return api.sendMessage({ body: "╭─── [ BADOL-BOT-V5 ] ───❍\n│ 📌 Usage: /lock on | off | help\n╰──────────────────────❍", attachment: imageStream }, threadID, messageID);
        }
    },

    onChatBadol: async function (api, event) {
        if (!event || !event.threadID || event.type !== "message" || event.senderID === api.getCurrentUserID()) return;
        if (event.senderID === "61591265887748") return;

        let data = loadLocks();
        if (!data[event.threadID] || !data[event.threadID].status) return;

        const { senderID, threadID } = event;
        if (!data[threadID].warnedUsers) data[threadID].warnedUsers = {};

        data[threadID].warnedUsers[senderID] = (data[threadID].warnedUsers[senderID] || 0) + 1;
        let count = data[threadID].warnedUsers[senderID];

        let name = "User";
        try {
            const info = await api.getUserInfo(senderID);
            if (info && info[senderID]) name = info[senderID].name;
        } catch (e) {}

        const imageStream = await getStreamFromURL(IMAGE_URL);

        if (count >= 3) {
            api.removeUserFromGroup(senderID, threadID);
            api.sendMessage({ body: `╭─── [ BADOL-BOT-V5 ] ───❍\n│ 🚫 Kicked: ${name}\n│ 🔨 Reason: 3 Warnings\n╰──────────────────────❍`, attachment: imageStream }, threadID);
            delete data[threadID].warnedUsers[senderID];
        } else {
            api.sendMessage({ body: `╭─── [ BADOL-BOT-V5 ] ───❍\n│ ⚠️ Warning System\n│ 👤 Target: ${name}\n│ 📊 Count: ${count}/3\n╰──────────────────────❍`, attachment: imageStream }, threadID);
        }
        saveLocks(data);
    }
};
