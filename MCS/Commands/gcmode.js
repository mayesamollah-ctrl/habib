const fs = require("fs");
const path = require("path");
const axios = require("axios");

const GDRIVE_ID = "1PZB5R25jhT8YP-O4farAd3DXhKVbQ9Sm";
const IMG_URL = `https://drive.google.com/uc?export=view&id=${GDRIVE_ID}`;

async function getImage() {
    const cacheDir = path.join(__dirname, "../../cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const imgPath = path.join(cacheDir, `gcmode_${GDRIVE_ID}.jpg`);
    if (fs.existsSync(imgPath)) return fs.createReadStream(imgPath);
    try {
        const res = await axios.get(IMG_URL, { responseType: "arraybuffer", timeout: 15000 });
        fs.writeFileSync(imgPath, Buffer.from(res.data));
        return fs.createReadStream(imgPath);
    } catch (e) {
        return null;
    }
}

module.exports = {
    config: {
        name: "gcmode",
        aliases: ["gcm", "gm", "groupmode"],
        version: "1.3.0",
        role: 1,
        credit: "MOHAMMAD BADOL",
        description: "Only Owner mode with image",
        cooldown: 2,
        prefix: true
    },

    onStartBadol: async (api, event, args) => {
        const dbDir = path.join(__dirname, "../../Database");
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
        const filePath = path.join(dbDir, "gcmode.json");

        let data = [];
        try {
            if (fs.existsSync(filePath)) data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        } catch (e) { data = []; }

        const threadID = event.threadID;
        const action = args[0]?.toLowerCase();
        const attachment = await getImage();

        if (action === "on") {
            if (data.includes(threadID)) {
                return api.sendMessage({
                    body: `╭─[ GCMODE ]─╮\n│ ⚠️ Already ON\n│ Only Owner Mode\n│ 🤖 BADOL-BOT-V5\n│ 👑 DEV: MOHAMMAD BADOL\n╰────────────╯`,
                    attachment: attachment
                }, threadID, event.messageID);
            }
            data.push(threadID);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return api.sendMessage({
                body: `╭─[ GCMODE ]─╮\n│ ✅ ENABLED\n│ Only Owner (YOU)\n│ can use bot here\n│ 🤖 BADOL-BOT-V5\n│ 👑 DEV: MOHAMMAD BADOL\n╰────────────╯`,
                attachment: attachment
            }, threadID, event.messageID);
        }

        if (action === "off") {
            data = data.filter(id => id!= threadID);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return api.sendMessage({
                body: `╭─[ GCMODE ]─╮\n│ ✅ DISABLED\n│ Public Mode ON\n│ 🤖 BADOL-BOT-V5\n│ 👑 DEV: MOHAMMAD BADOL\n╰────────────╯`,
                attachment: attachment
            }, threadID, event.messageID);
        }

        if (action === "list") {
            if (data.length === 0) {
                return api.sendMessage({
                    body: `╭─[ GCMODE LIST ]─╮\n│ 📭 No Group ON\n│ 🤖 BADOL-BOT-V5\n│ 👑 DEV: MOHAMMAD BADOL\n╰─────────────────╯`,
                    attachment: attachment
                }, threadID, event.messageID);
            }
            let listMsg = `╭─[ GCMODE LIST ]─╮\n│ 📋 Total ON: ${data.length}\n│\n`;
            for (let i = 0; i < data.length; i++) {
                let tid = data[i];
                let name = "Unknown";
                try {
                    let info = await api.getThreadInfo(tid);
                    name = info.threadName || "Unnamed";
                    if (name.length > 18) name = name.substring(0, 18) + "...";
                } catch (e) {}
                listMsg += `│ ${i + 1}. ${name}\n│ ID: ${tid}\n│\n`;
            }
            listMsg += `│ 🤖 BADOL-BOT-V5\n╰─────────────────╯`;
            return api.sendMessage({ body: listMsg, attachment: attachment }, threadID, event.messageID);
        }

        if (action === "help") {
            return api.sendMessage({
                body: `╭─[ GCMODE HELP ]─╮\n│ • /gcmode on - Only YOU\n│ • /gcmode off - Public\n│ • /gcmode list - ON groups\n│ • /gcmode help - Guide\n│ 🤖 BADOL-BOT-V5\n│ 👑 DEV: MOHAMMAD BADOL\n╰─────────────────╯`,
                attachment: attachment
            }, threadID, event.messageID);
        }

        const isOn = data.includes(threadID);
        return api.sendMessage({
            body: `╭─[ GCMODE STATUS ]─╮\n│ Status: ${isOn? "🟢 ON (Only You)" : "🔴 OFF"}\n│ 🤖 BADOL-BOT-V5\n│ 👑 DEV: MOHAMMAD BADOL\n╰─────────────────╯`,
            attachment: attachment
        }, threadID, event.messageID);
    }
};