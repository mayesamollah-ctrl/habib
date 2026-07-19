const fs = require("fs");
const path = require("path");
const axios = require("axios");

function box(content) {
  return `╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n${content}\n╚═══════════════════╝`;
}

const IMAGE_ID = "15fqq-rqlcPAa--fZaCDLA2hj_OlIV0MJ";
const IMAGE_URL = `https://drive.google.com/uc?export=view&id=${IMAGE_ID}`;
const IMAGE_PATH = path.join(__dirname, "../../cache/user_image.jpg");

async function getImage() {
    try {
        if (fs.existsSync(IMAGE_PATH)) {
            return fs.createReadStream(IMAGE_PATH);
        }
        const dir = path.dirname(IMAGE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const res = await axios.get(IMAGE_URL, { responseType: "arraybuffer", timeout: 15000 });
        fs.writeFileSync(IMAGE_PATH, Buffer.from(res.data, "binary"));
        return fs.createReadStream(IMAGE_PATH);
    } catch {
        return null;
    }
}

module.exports = {
    config: {
        name: "user",
        version: "1.0.0",
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1,
        cooldown: 3,
        description: "Manage banned users"
    },

    onStartBadol: async (api, event, args) => {
        const configPath = path.join(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        const action = args[0]?.toLowerCase();
        const subAction = args[1]?.toLowerCase();
        const targetID = event.messageReply? event.messageReply.senderID : (Object.keys(event.mentions).length > 0? Object.keys(event.mentions)[0] : args[1]);

        let name = "Unknown User";
        try {
            const info = await api.getUserInfo(targetID);
            if (info && info[targetID]) name = info[targetID].name;
        } catch (e) {}

        if (!config.ACCESS_CONTROL) config.ACCESS_CONTROL = { BANNED_USERS: [] };

        if (action === "ban" && subAction === "list") {
            const banned = config.ACCESS_CONTROL.BANNED_USERS || [];
            if (banned.length === 0) {
                const attachment = await getImage();
                return api.sendMessage({ body: box("┃ BAN LIST\n┃ No users found."), attachment }, event.threadID);
            }

            let msg = `┃ BAN LIST\n┃ Total: ${banned.length}\n┃\n`;
            for (let i = 0; i < banned.length; i++) {
                let bName = "Unknown User";
                try {
                    const info = await api.getUserInfo(banned[i]);
                    if (info && info[banned[i]]) bName = info[banned[i]].name;
                } catch (e) {}
                msg += `┃ ${i + 1}. ${bName}\n┃ ID: ${banned[i]}\n`;
            }
            const attachment = await getImage();
            return api.sendMessage({ body: box(msg.trim()), attachment }, event.threadID);
        }

        if (action === "ban") {
            if (!targetID || isNaN(targetID)) {
                const attachment = await getImage();
                return api.sendMessage({ body: box("┃ INVALID FORMAT\n┃ Use: /user ban [Reply/Mention/UID]"), attachment }, event.threadID);
            }
            if (config.ACCESS_CONTROL.BANNED_USERS.includes(targetID)) {
                const attachment = await getImage();
                return api.sendMessage({ body: box("┃ WARNING\n┃ User already banned."), attachment }, event.threadID);
            }

            config.ACCESS_CONTROL.BANNED_USERS.push(targetID);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            if (typeof global.reloadConfig === "function") global.reloadConfig();

            const attachment = await getImage();
            return api.sendMessage({ body: box(`┃ SUCCESS\n┃ Name: ${name}\n┃ ID: ${targetID}\n┃ Status: Banned.`), attachment }, event.threadID);
        }

        if (action === "unban") {
            if (!targetID || isNaN(targetID)) {
                const attachment = await getImage();
                return api.sendMessage({ body: box("┃ INVALID FORMAT\n┃ Use: /user unban [Reply/Mention/UID]"), attachment }, event.threadID);
            }
            if (!config.ACCESS_CONTROL.BANNED_USERS.includes(targetID)) {
                const attachment = await getImage();
                return api.sendMessage({ body: box("┃ WARNING\n┃ User not in list."), attachment }, event.threadID);
            }

            config.ACCESS_CONTROL.BANNED_USERS = config.ACCESS_CONTROL.BANNED_USERS.filter(id => id!== targetID);
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            if (typeof global.reloadConfig === "function") global.reloadConfig();

            const attachment = await getImage();
            return api.sendMessage({ body: box(`┃ SUCCESS\n┃ Name: ${name}\n┃ ID: ${targetID}\n┃ Status: Unbanned.`), attachment }, event.threadID);
        }

        const attachment = await getImage();
        return api.sendMessage({ body: box("┃ COMMANDS\n┃ /user ban [Reply/Mention/UID]\n┃ /user unban [Reply/Mention/UID]\n┃ /user ban list"), attachment }, event.threadID);
    }
};