const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "autoinfo",
        aliases: ["wlc"],
        version: "6.1.0",
        role: 1,
        credit: "MOHAMMAD BADOL",
        description: "Welcome & Leave separate control",
        cooldown: 3,
        prefix: true
    },

    onStartBadol: async (api, event, args) => {
        const dbDir = path.join(__dirname, "../../Database");
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
        const welcomePath = path.join(dbDir, 'autoinfo_global_status.json');
        const leavePath = path.join(dbDir, 'leve_global_status.json');
        const cacheDir = path.join(__dirname, "../../cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const imgPath = path.join(cacheDir, 'autoinfo_banner.jpg');

        const getBanner = async () => {
            try {
                if (fs.existsSync(imgPath)) return fs.createReadStream(imgPath);
                const DRIVE_ID = "1U49pI9xxuLPzVWbx4aosCzp0r4xCzwK7";
                const url = `https://drive.google.com/uc?export=view&id=${DRIVE_ID}`;
                const res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
                fs.writeFileSync(imgPath, Buffer.from(res.data));
                return fs.createReadStream(imgPath);
            } catch (e) { return null; }
        };

        const getStatus = (p) => {
            try { if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) {}
            return false;
        };

        let welcomeStatus = getStatus(welcomePath);
        let leaveStatus = getStatus(leavePath);
        const attachment = await getBanner();

        let type = args[0]?.toLowerCase(); // welcome / leave / all
        let action = args[1]?.toLowerCase(); // on / off

        // যদি /autoinfo on লেখে -> all on ধরে নিবে
        if (type === "on" || type === "off") {
            action = type;
            type = "all";
        }

        // HELP
        if (!type || type === "help" || type === "status") {
            return api.sendMessage({
                body: `╭─[ AUTOINFO CONTROL ]─╮\n│ 📊 Welcome: ${welcomeStatus? "🟢 ON" : "🔴 OFF"}\n│ 📊 Leave: ${leaveStatus? "🟢 ON" : "🔴 OFF"}\n│\n│ 📝 Commands:\n│ • /autoinfo welcome on/off\n│ • /autoinfo leave on/off\n│ • /autoinfo all on/off\n│ • /autoinfo on/off (all)\n│\n│ 🤖 BADOL-BOT-V5\n│ 👑 DEV: MOHAMMAD BADOL\n╰──────────────────╯`,
                attachment: attachment
            }, event.threadID, event.messageID);
        }

        if (type === "welcome" || type === "wlc" || type === "join") {
            if (action === "on") fs.writeFileSync(welcomePath, JSON.stringify(true, null, 2));
            if (action === "off") fs.writeFileSync(welcomePath, JSON.stringify(false, null, 2));
            return api.sendMessage({
                body: `╭─[ WELCOME ]─╮\n│ ${action === "on"? "✅ ENABLED" : "❌ DISABLED"}\n│ Welcome is now ${action?.toUpperCase()}\n│ 🤖 BADOL-BOT-V5\n╰─────────────╯`,
                attachment: attachment
            }, event.threadID, event.messageID);
        }

        if (type === "leave" || type === "leve" || type === "goodbye") {
            if (action === "on") fs.writeFileSync(leavePath, JSON.stringify(true, null, 2));
            if (action === "off") fs.writeFileSync(leavePath, JSON.stringify(false, null, 2));
            return api.sendMessage({
                body: `╭─[ LEAVE ]─╮\n│ ${action === "on"? "✅ ENABLED" : "❌ DISABLED"}\n│ Leave is now ${action?.toUpperCase()}\n│ 🤖 BADOL-BOT-V5\n╰───────────╯`,
                attachment: attachment
            }, event.threadID, event.messageID);
        }

        if (type === "all") {
            if (action === "on") {
                fs.writeFileSync(welcomePath, JSON.stringify(true, null, 2));
                fs.writeFileSync(leavePath, JSON.stringify(true, null, 2));
            }
            if (action === "off") {
                fs.writeFileSync(welcomePath, JSON.stringify(false, null, 2));
                fs.writeFileSync(leavePath, JSON.stringify(false, null, 2));
            }
            return api.sendMessage({
                body: `╭─[ ALL SYSTEM ]─╮\n│ ${action === "on"? "✅ BOTH ENABLED" : "❌ BOTH DISABLED"}\n│ • Welcome: ${action}\n│ • Leave: ${action}\n│ 🤖 BADOL-BOT-V5\n╰────────────────╯`,
                attachment: attachment
            }, event.threadID, event.messageID);
        }
    },

    onEventsBadol: async (api, event) => {
        try {
            const dbDir = path.join(__dirname, "../../Database");
            const cacheDir = path.join(__dirname, "../../cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            if (event.logMessageType === "log:subscribe") {
                const welcomePath = path.join(dbDir, 'autoinfo_global_status.json');
                let s = false; try { if (fs.existsSync(welcomePath)) s = JSON.parse(fs.readFileSync(welcomePath, 'utf8')); } catch (e) {}
                if (s === false) return;
                if (!event.logMessageData?.addedParticipants) return;
                let threadInfo = await api.getThreadInfo(event.threadID);
                let groupName = threadInfo.threadName || "Unknown";
                let memberCount = threadInfo.participantIDs.length;
                let adderID = event.author;
                let adderName = "Unknown";
                try { const a = await api.getUserInfo(adderID); adderName = a[adderID]?.name || "Unknown"; } catch (e) {}
                for (let user of event.logMessageData.addedParticipants) {
                    let id = user.userFbId; if (id === api.getCurrentUserID()) continue;
                    let name = user.fullName || "Unknown";
                    let time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
                    let role = threadInfo.adminIDs.some(e => e.id == id)? "Admin 👑" : "Member 👤";
                    const imgPath = path.join(cacheDir, `welcome_${id}.png`);
                    const fbPicUrl = `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                    let msgBody = `━━━━━━━━━━━━━━━━━━━\n🎀 NEW MEMBER INFO 🎀\n━━━━━━━━━━━━━━━━━━━\n\nWelcome 🌸, ${name}!\n\n┣━━━━━━━━━━━━━━━┫\n┃ 👤 Name: ${name}\n┃ 🆔 UID: ${id}\n┃ 🏠 Group: ${groupName}\n┃ 👥 Total Members: ${memberCount}\n┃ 🔰 Role: ${role}\n┃ ⏰ Join Time: ${time}\n┣━━━━━━━━━━━━━━━┫\n┃ ➕ Added By: ${adderName}\n┃ 🆔 Adder UID: ${adderID}\n┣━━━━━━━━━━━━━━━┫\n┃ 🤖 BADOL-BOT-V5\n┃ 👑 DEV: MOHAMMAD BADOL\n┗━━━━━━━━━━━━━━━━━━━`;
                    try {
                        const res = await axios({ url: fbPicUrl, method: 'GET', responseType: 'arraybuffer', timeout: 10000 });
                        fs.writeFileSync(imgPath, Buffer.from(res.data));
                        api.sendMessage({ body: msgBody, mentions: [{ id, tag: name }, { id: adderID, tag: adderName }], attachment: fs.createReadStream(imgPath) }, event.threadID, () => { try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {} });
                    } catch (err) { api.sendMessage({ body: msgBody, mentions: [{ id, tag: name }, { id: adderID, tag: adderName }] }, event.threadID); }
                }
            }

            if (event.logMessageType === "log:unsubscribe") {
                const leavePath = path.join(dbDir, 'leve_global_status.json');
                let s = true; try { if (fs.existsSync(leavePath)) s = JSON.parse(fs.readFileSync(leavePath, 'utf8')); } catch (e) {}
                if (s === false) return;
                let leftID = event.logMessageData.leftParticipantFbId;
                if (!leftID || leftID === api.getCurrentUserID()) return;
                let threadInfo = await api.getThreadInfo(event.threadID);
                let groupName = threadInfo.threadName || "Unknown";
                let memberCount = threadInfo.participantIDs.length;
                let leftName = "Unknown";
                try { const u = await api.getUserInfo(leftID); leftName = u[leftID]?.name || "Unknown"; } catch (e) {}
                let time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
                const imgPath = path.join(cacheDir, `leave_${leftID}.png`);
                const fbPicUrl = `https://graph.facebook.com/${leftID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                let msgBody = `━━━━━━━━━━━━━━━━━━━\n💔 MEMBER LEAVE INFO 💔\n━━━━━━━━━━━━━━━━━━━\n\nGoodbye 🥀, ${leftName}!\n\n┣━━━━━━━━━━━━━━━┫\n┃ 👤 Name: ${leftName}\n┃ 🆔 UID: ${leftID}\n┃ 🏠 Group: ${groupName}\n┃ 👥 Remaining: ${memberCount}\n┃ ⏰ Leave Time: ${time}\n┣━━━━━━━━━━━━━━━┫\n┃ 🤖 BADOL-BOT-V5\n┃ 👑 DEV: MOHAMMAD BADOL\n┗━━━━━━━━━━━━━━━━━━━`;
                try {
                    const res = await axios({ url: fbPicUrl, method: 'GET', responseType: 'arraybuffer', timeout: 10000 });
                    fs.writeFileSync(imgPath, Buffer.from(res.data));
                    api.sendMessage({ body: msgBody, mentions: [{ id: leftID, tag: leftName }], attachment: fs.createReadStream(imgPath) }, event.threadID, () => { try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {} });
                } catch (err) { api.sendMessage({ body: msgBody, mentions: [{ id: leftID, tag: leftName }] }, event.threadID); }
            }
        } catch (e) { console.log(e.message); }
    }
};