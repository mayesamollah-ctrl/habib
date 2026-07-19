const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "avt",
        aliases: ["avatar", "dp"],
        version: "2.0.0",
        credit: "MOHAMMAD BADOL",
        role: 0,
        cooldown: 5,
        prefix: true,
        description: "Get Facebook avatar",
        category: "user"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID, senderID, mentions, messageReply } = event;

        api.setMessageReaction("⏳", messageID, () => {}, true);

        const CACHE_DIR = path.join(__dirname, "../../cache");
        if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
        const imgPath = path.join(CACHE_DIR, `avt_${Date.now()}.png`);

        const box = (msg) => `╭━❮ ✨ AVATAR ✨ ❯━╮\n${msg}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5\n╰━──━─━─━━─━─━❍`;

        const prefix = global.config?.BOT_INFO?.PREFIX || global.config?.PREFIX || "/";

        if (!args[0]) {
            api.setMessageReaction("✅", messageID, () => {}, true);
            const helpMsg = box(`├‣ FB-AVATAR\n├‣ \n├‣ ${prefix}avt box - Get group avatar\n├‣ ${prefix}avt id [uid] - Get by user ID\n├‣ ${prefix}avt user - Get your avatar\n├‣ ${prefix}avt user @mention - Get tagged user\n├‣ Reply + ${prefix}avt user - Get reply user\n├‣ \n├‣ 💡 Link not supported by Facebook`);
            return api.sendMessage(helpMsg, threadID, messageID);
        }

        const action = args[0].toLowerCase();

        try {
            if (action === "box") {
                let targetID = args[1] || threadID;
                let threadInfo = await api.getThreadInfo(targetID);
                let img = threadInfo.imageSrc;

                if (!img) {
                    api.setMessageReaction("⚠️", messageID, () => {}, true);
                    return api.sendMessage(box(`├‣ ❌ No avatar for ${threadInfo.threadName}`), threadID, messageID);
                }

                const imgRes = await axios.get(img, { responseType: "arraybuffer", timeout: 15000 });
                fs.writeFileSync(imgPath, imgRes.data);

                api.setMessageReaction("✅", messageID, () => {}, true);
                return api.sendMessage({
                    body: box(`├‣ Group: ${threadInfo.threadName}`),
                    attachment: fs.createReadStream(imgPath)
                }, threadID, () => {
                    try { fs.unlinkSync(imgPath); } catch (e) {}
                }, messageID);
            }

            else if (action === "id") {
                const id = args[1];
                if (!id ||!/^\d+$/.test(id)) {
                    api.setMessageReaction("⚠️", messageID, () => {}, true);
                    return api.sendMessage(box(`├‣ ❌ Please enter valid UID\n├‣ Example: ${prefix}avt id 4`), threadID, messageID);
                }

                const imgUrl = `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 15000 });
                fs.writeFileSync(imgPath, imgRes.data);

                api.setMessageReaction("✅", messageID, () => {}, true);
                return api.sendMessage({
                    body: box(`├‣ UID: ${id}`),
                    attachment: fs.createReadStream(imgPath)
                }, threadID, () => {
                    try { fs.unlinkSync(imgPath); } catch (e) {}
                }, messageID);
            }

            else if (action === "user") {
                let id = senderID;
                let name = "Your";

                if (messageReply) {
                    id = messageReply.senderID;
                    try {
                        const uInfo = await api.getUserInfo(id);
                        name = uInfo[id]?.name || "User";
                    } catch (e) {
                        name = "User";
                    }
                }
                else if (Object.keys(mentions).length > 0) {
                    id = Object.keys(mentions)[0];
                    name = mentions[id].replace("@", "");
                }

                const imgUrl = `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 15000 });
                fs.writeFileSync(imgPath, imgRes.data);

                api.setMessageReaction("✅", messageID, () => {}, true);
                return api.sendMessage({
                    body: box(`├‣ ${name} Avatar\n├‣ UID: ${id}`),
                    attachment: fs.createReadStream(imgPath)
                }, threadID, () => {
                    try { fs.unlinkSync(imgPath); } catch (e) {}
                }, messageID);
            }

            else {
                api.setMessageReaction("⚠️", messageID, () => {}, true);
                return api.sendMessage(box(`├‣ ❌ Wrong command\n├‣ Use ${prefix}avt for help`), threadID, messageID);
            }

        } catch (e) {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (err) {}
            api.setMessageReaction("⚠️", messageID, () => {}, true);
            return api.sendMessage(box(`├‣ ❌ Error: ${e.message}`), threadID, messageID);
        }
    }
};