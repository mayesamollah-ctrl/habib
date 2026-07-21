const fs = require("fs-extra");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../..", "group_names_data.json");
const NOTICE_GROUP_ID = "30474906395489332"; 
const OWNER_NAME = "SK HABIB"; 

function getDatabase() {
    try {
        if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify({}), "utf-8");
        return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    } catch (e) { return {}; }
}

function saveDatabase(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 4), "utf-8");
}

module.exports.config = {
    name: "antibotkick",
    version: "6.0.0",
    credit: "MOHAMMAD BADOL"
};

module.exports.onEventsBadol = async function (api, event) {
    if (!event.logMessageType) return;
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();

    if (threadID && logMessageType !== "log:thread-name") {
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            if (threadInfo.threadName) {
                let db = getDatabase();
                if (db[threadID] !== threadInfo.threadName) {
                    db[threadID] = threadInfo.threadName;
                    saveDatabase(db);
                }
            }
        } catch (e) {}
    }

    if (logMessageType === "log:thread-name") {
        let db = getDatabase();
        const oldName = db[threadID] || "পূর্বের নাম রেকর্ড নেই";

        setTimeout(async () => {
            try {
                const threadInfo = await api.getThreadInfo(threadID);
                const userInfo = await api.getUserInfo(author);
                const newName = threadInfo.threadName || "No Name (Blank)";
                
                db[threadID] = newName;
                saveDatabase(db);

                const msg = `╭━━━━━━━━━━━━━━━━━━━━╮
┃ 📝 𝐆𝐑𝐎𝐔𝐏 𝐍𝐀𝐌𝐄 𝐂𝐇𝐀𝐍𝐆𝐄𝐃 ┃
╰━━━━━━━━━━━━━━━━━━━━╯

📢 ${OWNER_NAME} ভাই, গ্রুপের নাম পরিবর্তন করা হয়েছে!

╔════════════════════╗
║ 📋 𝐍𝐀𝐌𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
╚════════════════════╝
❌ পুরাতন: ${oldName}
✅ নতুন: ${newName}
🆔 TID: ${threadID}

╔════════════════════╗
║ 👤 𝐂𝐇𝐀𝐍𝐆𝐄𝐃 𝐁𝐘
╚════════════════════╝
📛 নাম: ${userInfo[author]?.name || "Unknown User"}
🔗 প্রোফাইল: fb.com/${author}

⏰ সময়: ${new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" })}`;
                api.sendMessage(msg, NOTICE_GROUP_ID);
            } catch (e) {}
        }, 500);
    }

    if (logMessageType === "log:subscribe" && logMessageData.addedParticipants?.some(u => u.userFbId == botID)) {
        setTimeout(async () => {
            try {
                const threadInfo = await api.getThreadInfo(threadID);
                const userInfo = await api.getUserInfo(author);
                const msg = `╭✅ 𝐁𝐎𝐓 𝐀𝐃𝐃𝐄𝐃 𝐍𝐎𝐓𝐈𝐂𝐄 ✅╮
📢 ${OWNER_NAME} ভাই, আমাকে নতুন গ্রুপে অ্যাড করা হইছে!
🏷️ নাম: ${threadInfo.threadName || "Unnamed Group"}
👤 অ্যাড বাই: ${userInfo[author]?.name || "Unknown"}
⏰ সময়: ${new Date().toLocaleString("bn-in", { timeZone: "Asia/kolkata" })}`;
                api.sendMessage(msg, NOTICE_GROUP_ID);
            } catch (e) {}
        }, 1000);
    }

    if (logMessageType === "log:unsubscribe" && logMessageData.leftParticipantFbId == botID) {
        setTimeout(async () => {
            try {
                const threadInfo = await api.getThreadInfo(threadID).catch(() => ({}));
                const userInfo = await api.getUserInfo(author).catch(() => ({}));
                const msg = `╭⚠️ 𝐁𝐎𝐓 𝐊𝐈𝐂𝐊𝐄𝐃 𝐀𝐋𝐄𝐑𝐓 ⚠️╮
🚨 ${OWNER_NAME} ভাই, আমাকে কিক করা হইছে!
🏷️ গ্রুপ: ${threadInfo.threadName || "Unknown Group"}
🔨 কিক বাই: ${userInfo[author]?.name || "Unknown"}
⏰ সময়: ${new Date().toLocaleString("bn-in", { timeZone: "Asia/kolkata" })}`;
                api.sendMessage(msg, NOTICE_GROUP_ID);
            } catch (e) {}
        }, 1000);bnbd
    }
};
