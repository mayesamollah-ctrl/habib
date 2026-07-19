const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");

module.exports.config = {
    name: "spy",
    version: "5.1.0",
    credit: "MOHAMMAD BADOL",
    prefix: true,
    role: 0,
    cooldown: 5,
    description: "Get Facebook user information - Full Display",
    aliases: ["uidinfo", "whois", "userinfo", "stalk"]
};

module.exports.onStartBadol = async (api, event, args) => {
    const cachePath = __dirname + "/cache/";
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

    let uid;
    try {
        if (event.type === "message_reply") uid = event.messageReply.senderID;
        else if (Object.keys(event.mentions).length > 0) uid = Object.keys(event.mentions)[0];
        else if (args[0] && args[0].includes(".com/")) uid = await api.getUID(args[0]);
        else if (args[0] &&!isNaN(args[0])) uid = args[0];
        else uid = event.senderID;

        const userInfo = await api.getUserInfo(uid);
        const info = userInfo[uid];
        if (!info) return api.sendMessage("❌ User not found!", event.threadID, event.messageID);

        const name = info.name || "Unknown";
        const firstName = info.firstName || name.split(" ")[0];
        const friend = info.isFriend? "Yes ✅" : "No ❌";
        const profileUrl = info.profileUrl || `https://facebook.com/${uid}`;
        const username = info.vanity? `@${info.vanity}` : "Not Set";

        // ═══════════ ✅ GENDER FIXED - 100% WORKING ═══════════
        let gender = "Hidden 🔒";
        if (info.gender === 2) gender = "Male ♂️";
        else if (info.gender === 1) gender = "Female ♀️";
        else if (info.gender === 0) gender = "Custom 🌈";
        // ════════════════════════════════════════════════════════

        let isVerified = "No ❌";
        let birthday = "Hidden 🔒";
        let hometown = "Hidden 🔒";
        let location = "Hidden 🔒";
        let relationship = "Hidden 🔒";
        let followers = "Hidden 🔒";
        let work = "Hidden 🔒";
        let education = "Hidden 🔒";
        let bio = "Hidden 🔒";
        let about = "Hidden 🔒";
        let quotes = "Hidden 🔒";
        let website = "Hidden 🔒";
        let languages = "Hidden 🔒";

        try {
            const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
            const fields = "is_verified,birthday,hometown,location,relationship_status,subscribers,work,education,bio,about,quotes,website,languages";
            const res = await axios.get(`https://graph.facebook.com/${uid}?fields=${fields}&access_token=${token}`, { timeout: 5000 });

            if (res.data.is_verified) isVerified = "Yes ✅";
            if (res.data.birthday) birthday = res.data.birthday;
            if (res.data.hometown?.name) hometown = res.data.hometown.name;
            if (res.data.location?.name) location = res.data.location.name;
            if (res.data.relationship_status) relationship = res.data.relationship_status;
            if (res.data.subscribers?.summary?.total_count) followers = res.data.subscribers.summary.total_count.toLocaleString();

            if (res.data.work && res.data.work.length > 0) {
                const workData = res.data.work[0];
                if (workData.employer?.name && workData.position?.name) {
                    work = `${workData.position.name} at ${workData.employer.name}`;
                } else {
                    work = workData.employer?.name || workData.position?.name || "Hidden 🔒";
                }
            }
            if (res.data.education && res.data.education.length > 0) {
                const eduData = res.data.education[0];
                education = eduData.school?.name || "Hidden 🔒";
                if (eduData.type) education += ` (${eduData.type})`;
            }
            if (res.data.bio) bio = res.data.bio.length > 60? res.data.bio.substring(0, 60) + "..." : res.data.bio;
            if (res.data.about) about = res.data.about.length > 60? res.data.about.substring(0, 60) + "..." : res.data.about;
            if (res.data.quotes) quotes = res.data.quotes.length > 60? res.data.quotes.substring(0, 60) + "..." : res.data.quotes;
            if (res.data.website) website = res.data.website;
            if (res.data.languages && res.data.languages.length > 0) {
                languages = res.data.languages.slice(0, 3).map(l => l.name).join(", ");
            }
        } catch (e) {}

        const body = `╭─⊰ BADOL-BOT-V5 ⊱─╮\n` +
                    `│ 👤 USER INFORMATION\n│\n` +
                    `│ 🆔 UID: ${uid}\n` +
                    `│ 📛 Name: ${name}\n` +
                    `│ 🧑 First Name: ${firstName}\n` +
                    `│ 👤 Username: ${username}\n` +
                    `│ ⚧ Gender: ${gender}\n` +
                    `│ ✓ Verified: ${isVerified}\n` +
                    `│ 🤝 Friend: ${friend}\n` +
                    `│ 👥 Followers: ${followers}\n│\n` +
                    `│ 🎂 Birthday: ${birthday}\n` +
                    `│ 🏠 Hometown: ${hometown}\n` +
                    `│ 📍 Location: ${location}\n` +
                    `│ 💕 Relationship: ${relationship}\n` +
                    `│ 🌐 Languages: ${languages}\n│\n` +
                    `│ 💼 Work: ${work}\n` +
                    `│ 🎓 Education: ${education}\n│\n` +
                    `│ 📝 Bio: ${bio}\n` +
                    `│ ℹ️ About: ${about}\n` +
                    `│ 💬 Quotes: ${quotes}\n` +
                    `│ 🌍 Website: ${website}\n│\n` +
                    `│ 🔗 Profile: ${profileUrl}\n` +
                    `╰──────────────────────╯`;

        const callback = () => {
            api.sendMessage(
                {
                    body: body,
                    attachment: fs.createReadStream(cachePath + `${uid}.png`)
                },
                event.threadID,
                () => { try { fs.unlinkSync(cachePath + `${uid}.png`); } catch {} },
                event.messageID
            );
        };

        // ✅ HD FIX - আগের মতোই 1500x1500 কিন্তু এখন 2000x2000 দিলাম আরো ক্লিয়ার এর জন্য
        const picUrl = `https://graph.facebook.com/${uid}/picture?height=2000&width=2000&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        request(encodeURI(picUrl))
           .pipe(fs.createWriteStream(cachePath + `${uid}.png`))
           .on("close", () => callback())
           .on("error", () => api.sendMessage(body, event.threadID, event.messageID));

    } catch (err) {
        return api.sendMessage("❌ User not found! Use mention/reply/link/UID.", event.threadID, event.messageID);
    }
};