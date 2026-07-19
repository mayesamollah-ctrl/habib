const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require("../../Database");

module.exports.config = {
    name: "monitor",
    credit: "MOHAMMAD BADOL"
};

// ===================================================================
// গ্রুপ নাম/ছবি মেমোরি ক্যাশ (restart হলে DB থেকে ফিরে আসবে)
// ===================================================================
const threadCache = new Map();

async function ensureThreadInfoSaved(api, threadID) {
    if (threadCache.has(threadID)) return;
    try {
        const threadData = await db.getData(threadID, 'threads');

        // DB তে আগে থেকে save করা থাকলে শুধু মেমোরিতে নাও
        if (threadData.originalName) {
            threadCache.set(threadID, {
                name: threadData.originalName,
                photoUrl: threadData.originalPhotoUrl || ""
            });
            return;
        }

        // নতুন থ্রেড — Facebook API থেকে নাম/ছবি নিয়ে সেভ করো
        const info = await api.getThreadInfo(threadID);
        const name = info.threadName || info.name || "";
        const photoUrl = info.imageSrc || info.threadImageUrl || info.emoji || "";

        threadCache.set(threadID, { name, photoUrl });

        if (name) {
            threadData.originalName = name;
            threadData.originalPhotoUrl = photoUrl;
            if (!threadData.data) threadData.data = { resend: true, anti: true, calllog: true };
            await db.saveData(threadID, threadData, 'threads');
        }
    } catch (e) {
        // silent fail
    }
}

// ===================================================================
// onChatBadol — প্রতিটা নরমাল মেসেজে thread info সেভ হবে (background)
// ===================================================================
module.exports.onChatBadol = (api, event) => {
    if (event.threadID) {
        ensureThreadInfoSaved(api, event.threadID).catch(() => {});
    }
};

// ===================================================================
// onEventsBadol — সব ইভেন্ট হ্যান্ডল করা
// ===================================================================
module.exports.onEventsBadol = async (api, event) => {
    // সেটিংস লোড
    let settings = { resend: true, anti: true, calllog: true };
    try {
        const threadData = await db.getData(event.threadID, 'threads');
        if (threadData && threadData.data) settings = threadData.data;
    } catch (e) {}

    // ─────────────────────────────────────────────────────
    // ১. নিকনেম চেঞ্জ নোটিফিকেশন
    // ─────────────────────────────────────────────────────
    if (event.logMessageType === "log:user-nickname") {
        if (!settings.anti) return;
        try {
            const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
            const pid = event.logMessageData?.participant_id;
            const target = pid
                ? (await api.getUserInfo(pid))[pid]?.name || "কেউ"
                : "কেউ";
            const newNick = event.logMessageData?.nickname || "(খালি করা হয়েছে)";
            api.sendMessage(
                `📝 ${actor} → ${target}-এর নিকনেম পরিবর্তন করেছেন।\n🔤 নতুন নাম: ${newNick}`,
                event.threadID
            );
        } catch (e) {}
    }

    // ─────────────────────────────────────────────────────
    // ২. গ্রুপ নাম চেঞ্জ — DB থেকে আসল নাম রিস্টোর
    // ─────────────────────────────────────────────────────
    if (event.logMessageType === "log:thread-name") {
        if (!settings.anti) return;
        try {
            const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
            const newName = event.logMessageData?.name || "";

            // DB থেকে সংরক্ষিত আসল নাম আনো
            const threadData = await db.getData(event.threadID, 'threads');
            const originalName = threadData.originalName || "";

            // যদি আসল নামই না জানা থাকে
            if (!originalName) {
                api.sendMessage(
                    `⚠️ ${actor} গ্রুপের নাম পরিবর্তন করে "${newName}" করেছেন।\n` +
                    `📌 আসল নাম DB তে সংরক্ষিত নেই, রিস্টোর করা সম্ভব হয়নি।\n` +
                    `💡 টিপস: /set anti on করার আগে একটি মেসেজ পাঠালে নাম সেভ হয়ে যায়।`,
                    event.threadID
                );
                return;
            }

            // লুপ প্রোটেকশন — বট নিজে যদি নাম ঠিক করে দেয়
            if (newName === originalName) return;

            api.setTitle(originalName, event.threadID, (err) => {
                if (!err) {
                    api.sendMessage(
                        `🛡️ ${actor} গ্রুপের নাম পরিবর্তন করে "${newName}" করেছিলেন!\n` +
                        `✅ আমি আবার আসল নাম "${originalName}" রিস্টোর করে দিয়েছি।`,
                        event.threadID
                    );
                    // মেমোরি ক্যাশ আপডেট
                    if (threadCache.has(event.threadID)) {
                        threadCache.get(event.threadID).name = originalName;
                    }
                }
            });
        } catch (e) {}
    }

    // ─────────────────────────────────────────────────────
    // ৩. গ্রুপ প্রোফাইল ছবি চেঞ্জ — আসল ছবি রিস্টোর
    // ─────────────────────────────────────────────────────
    if (event.logMessageType === "log:thread-icon") {
        if (!settings.anti) return;
        try {
            const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
            const threadData = await db.getData(event.threadID, 'threads');
            const originalPhotoUrl = threadData.originalPhotoUrl || "";

            if (!originalPhotoUrl) {
                return api.sendMessage(
                    `📸 ${actor} গ্রুপের প্রোফাইল ছবি পরিবর্তন করেছেন।\n` +
                    `⚠️ আসল ছবি DB তে সংরক্ষিত নেই, রিস্টোর সম্ভব হয়নি।\n` +
                    `💡 টিপস: /set anti on করার আগে একটি মেসেজ পাঠালে ছবি সেভ হয়।`,
                    event.threadID
                );
            }

            // আসল ছবি ডাউনলোড করে re-upload করো
            const CACHE_DIR = path.join(__dirname, "../../cache");
            if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
            const imgPath = path.join(CACHE_DIR, `restore_${event.threadID}_${Date.now()}.jpg`);

            const res = await axios.get(originalPhotoUrl, {
                responseType: "arraybuffer",
                timeout: 15000
            });
            fs.writeFileSync(imgPath, Buffer.from(res.data));

            api.changeGroupImage(fs.createReadStream(imgPath), event.threadID, (err) => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e2) {}
                if (!err) {
                    api.sendMessage(
                        `🛡️ ${actor} গ্রুপের প্রোফাইল ছবি পরিবর্তন করেছিলেন!\n` +
                        `✅ আমি আবার আসল ছবি রিস্টোর করে দিয়েছি।`,
                        event.threadID
                    );
                } else {
                    api.sendMessage(
                        `📸 ${actor} গ্রুপের প্রোফাইল ছবি পরিবর্তন করেছেন।\n` +
                        `⚠️ আসল ছবি রিস্টোর করতে পারিনি (API error)।`,
                        event.threadID
                    );
                }
            });
        } catch (e) {
            api.sendMessage(
                `📸 গ্রুপ ছবি পরিবর্তন হয়েছে কিন্তু রিস্টোর করতে সমস্যা হয়েছেঃ ${e.message}`,
                event.threadID
            );
        }
    }

    // ─────────────────────────────────────────────────────
    // ৪. গ্রুপ কল — বিস্তারিত (join/leave/start/end)
    // ─────────────────────────────────────────────────────
    if (event.logMessageType === "log:thread-call") {
        if (!settings.calllog) return;
        try {
            const log = event.logMessageData || {};
            const callEvent = (
                log.event ||
                log.call_status ||
                log.action ||
                ""
            ).toLowerCase();

            let userName = "কেউ";
            if (event.author) {
                try {
                    userName = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
                } catch (e) {}
            }

            // কল শুরু হয়েছে
            if (callEvent.includes("start") || callEvent === "started") {
                return api.sendMessage(
                    `📞 ══════════════════\n` +
                    `   গ্রুপ কল শুরু হয়েছে!\n` +
                    `══════════════════\n` +
                    `👤 শুরু করেছেনঃ ${userName}\n` +
                    `⏰ সময়ঃ ${new Date().toLocaleTimeString('bn-BD')}`,
                    event.threadID
                );
            }

            // কল শেষ হয়েছে
            if (callEvent.includes("end") || callEvent === "ended") {
                const secs = log.call_duration || 0;
                const durStr = secs > 0
                    ? `\n⏱️ সময়কালঃ ${Math.floor(secs / 60)} মিনিট ${secs % 60} সেকেন্ড`
                    : "";
                return api.sendMessage(
                    `📵 ══════════════════\n` +
                    `    গ্রুপ কল শেষ হয়েছে\n` +
                    `══════════════════${durStr}`,
                    event.threadID
                );
            }

            // কেউ কলে যোগ দিয়েছে
            if (callEvent.includes("join")) {
                return api.sendMessage(
                    `📲 ${userName} কলে যোগ দিয়েছেন ✅`,
                    event.threadID
                );
            }

            // কেউ কল থেকে বের হয়ে গেছে
            if (callEvent.includes("left") || callEvent.includes("leave")) {
                return api.sendMessage(
                    `📴 ${userName} কল থেকে বের হয়ে গেছেন।`,
                    event.threadID
                );
            }

            // অন্য যেকোনো call event — debug এর জন্য
            if (callEvent) {
                api.sendMessage(
                    `📞 কল ইভেন্ট: ${callEvent}\n👤 ${userName}`,
                    event.threadID
                );
            }
        } catch (e) {}
    }

    // ─────────────────────────────────────────────────────
    // ৫. অ্যাডমিন চেঞ্জ নোটিফিকেশন
    // ─────────────────────────────────────────────────────
    if (event.logMessageType === "log:thread-admins") {
        if (!settings.anti) return;
        try {
            const actor = (await api.getUserInfo(event.author))[event.author]?.name || "কেউ";
            const targetID =
                event.logMessageData?.target_id ||
                event.logMessageData?.TARGET_ID ||
                event.logMessageData?.participant_id ||
                event.logMessageData?.participantId;

            if (!targetID) return;
            const target = (await api.getUserInfo(targetID))[targetID]?.name || "একজন";

            const adminEvent = (
                event.logMessageData?.admin_event ||
                event.logMessageData?.ADMIN_EVENT ||
                event.logMessageData?.event ||
                event.logMessageData?.type || ""
            ).toLowerCase();

            const isAdd =
                adminEvent.includes("add") || adminEvent.includes("promote");
            const action = isAdd
                ? "অ্যাডমিন বানিয়েছেন 👑"
                : "অ্যাডমিন থেকে সরিয়ে দিয়েছেন ❌";

            api.sendMessage(
                `👑 ${actor}, ${target}-কে গ্রুপে ${action}`,
                event.threadID
            );
        } catch (e) {}
    }
};
