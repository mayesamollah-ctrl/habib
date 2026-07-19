const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "autoinfo",
        version: "5.1.0",
        credit: "MOHAMMAD BADOL",
        description: "Welcome + Add By + Footer"
    },

    onEventsBadol: async (api, event) => {
        try {
            if (event.logMessageType!== "log:subscribe") return;
            if (!event.logMessageData?.addedParticipants) return;

            const dbDir = path.join(__dirname, "../../Database");
            const statusPath = path.join(dbDir, 'autoinfo_global_status.json');
            let globalStatus = false;
            try {
                if (fs.existsSync(statusPath)) {
                    globalStatus = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
                }
            } catch (e) { globalStatus = false; }
            if (globalStatus === false) return;

            const cacheDir = path.join(__dirname, "../../cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            let newUsers = event.logMessageData.addedParticipants;
            let threadInfo = await api.getThreadInfo(event.threadID);
            let groupName = threadInfo.threadName || "Unknown Group";
            let memberCount = threadInfo.participantIDs.length;

            // 🔥 কে এড করলো সেটা বের করা
            let adderID = event.author;
            let adderName = "Unknown";
            try {
                const adderInfo = await api.getUserInfo(adderID);
                adderName = adderInfo[adderID]?.name || "Unknown";
            } catch (e) {}

            for (let user of newUsers) {
                let id = user.userFbId;
                if (id === api.getCurrentUserID()) continue;

                let name = user.fullName || "Unknown";
                let time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
                let role = threadInfo.adminIDs.some(e => e.id == id)? "Admin 👑" : "Member 👤";

                const imgPath = path.join(cacheDir, `welcome_${id}.png`);
                const fbPicUrl = `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

                let msgBody = `━━━━━━━━━━━━━━━━━━━
🎀 NEW MEMBER INFO 🎀
━━━━━━━━━━━━━━━━━━━

Welcome 🌸, ${name}!

┣━━━━━━━━━━━━━━━┫
┃ 👤 Name: ${name}
┃ 🆔 UID: ${id}
┃ 🏠 Group: ${groupName}
┃ 👥 Total Members: ${memberCount}
┃ 🔰 Role: ${role}
┃ ⏰ Join Time: ${time}
┣━━━━━━━━━━━━━━━┫
┃ ➕ Added By: ${adderName}
┃ 🆔 Adder UID: ${adderID}
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
                        mentions: [{ id, tag: name }, { id: adderID, tag: adderName }],
                        attachment: fs.createReadStream(imgPath)
                    }, event.threadID, () => {
                        try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
                    });
                } catch (err) {
                    api.sendMessage({
                        body: msgBody,
                        mentions: [{ id, tag: name }, { id: adderID, tag: adderName }]
                    }, event.threadID);
                }
            }
        } catch (e) {
            console.log("Autoinfo Error:", e.message);
        }
    }
};