const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "leve",
        version: "5.1.0",
        credit: "MOHAMMAD BADOL",
        description: "Leave Info + Footer"
    },

    onEventsBadol: async (api, event) => {
        try {
            if (event.logMessageType!== "log:unsubscribe") return;
            if (!event.logMessageData) return;

            const dbDir = path.join(__dirname, "../../Database");
            const statusPath = path.join(dbDir, 'autoinfo_global_status.json'); // তোমার autoinfo এর status ফাইলটাই ব্যবহার করবে
            let globalStatus = true; // Default ON রাখলাম
            try {
                if (fs.existsSync(statusPath)) {
                    globalStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
                }
            } catch (e) { globalStatus = true; }
            if (globalStatus === false) return;

            const cacheDir = path.join(__dirname, "../../cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            let leftID = event.logMessageData.leftParticipantFbId;
            if (!leftID) return;
            if (leftID === api.getCurrentUserID()) return; // বট নিজে লিভ নিলে মেসেজ দেবে না

            let threadInfo = await api.getThreadInfo(event.threadID);
            let groupName = threadInfo.threadName || "Unknown Group";
            let memberCount = threadInfo.participantIDs.length;

            // কে লিভ নিলো তার নাম বের করা
            let leftName = "Unknown";
            try {
                const userInfo = await api.getUserInfo(leftID);
                leftName = userInfo[leftID]?.name || "Unknown";
            } catch (e) {}

            let time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

            const imgPath = path.join(cacheDir, `leave_${leftID}.png`);
            const fbPicUrl = `https://graph.facebook.com/${leftID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            let msgBody = `━━━━━━━━━━━━━━━━━━━
💔 MEMBER LEAVE INFO 💔
━━━━━━━━━━━━━━━━━━━

Goodbye 🥀, ${leftName}!

┣━━━━━━━━━━━━━━━┫
┃ 👤 Name: ${leftName}
┃ 🆔 UID: ${leftID}
┃ 🏠 Group: ${groupName}
┃ 👥 Remaining: ${memberCount}
┃ ⏰ Leave Time: ${time}
┣━━━━━━━━━━━━━━━┫
┃ 😔 Left the group
┃ 💬 We will miss you!
┣━━━━━━━━━━━━━━━┫
┃ 🤖 BADOL-BOT-V5
┃ 👑 DEV: MOHAMMAD BADOL
┗━━━━━━━━━━━━━━━━━━━`;

            try {
                const response = await axios({
                    url: fbPicUrl,
                    method: 'GET',
                    responseType: 'arraybuffer',
                    timeout: 10000
                });
                fs.writeFileSync(imgPath, Buffer.from(response.data));
                api.sendMessage({
                    body: msgBody,
                    mentions: [{ id: leftID, tag: leftName }],
                    attachment: fs.createReadStream(imgPath)
                }, event.threadID, () => {
                    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
                });
            } catch (err) {
                api.sendMessage({
                    body: msgBody,
                    mentions: [{ id: leftID, tag: leftName }]
                }, event.threadID);
            }

        } catch (e) {
            console.log("Leve Error:", e.message);
        }
    }
};