const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "owner",
        aliases: ["dev", "info"],
        version: "6.1.0",
        role: 0,
        credit: "MOHAMMAD BADOL",
        description: "bot developer information",
        cooldown: 3,
        prefix: true
    },
    
    onStartBadol: async (api, event) => {
        const OWNER_ID = "61591265887748";
        const cacheDir = path.join(__dirname, "../../cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const imgPath = path.join(cacheDir, `owner_${OWNER_ID}.png`);
        const fbPicUrl = `https://graph.facebook.com/${OWNER_ID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        
        let attachment = null;
        try {
            const res = await axios.get(fbPicUrl, { responseType: 'arraybuffer', timeout: 15000 });
            fs.writeFileSync(imgPath, Buffer.from(res.data));
            attachment = fs.createReadStream(imgPath);
        } catch (e) {}
        
        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        
        let totalGroups = 0;
        try {
            const list = await api.getThreadList(100, null, ["INBOX"]);
            totalGroups = list.filter(t => t.isGroup).length;
        } catch (e) {}
        
        const msg = `👑 MOHAMMAD BADOL - DEV 👑
━━━━━━━━━━━━━━━━━━━━

╭─ PROFILE ─╮
│ Name: MOHAMMAD BADOL
│ Nick: B4D9L | 29+ Y
│ User: B4D9L999
│ Islam | B+ | Single
│ UID: ${OWNER_ID}
╰───────────╯

╭─ LOCATION ─╮
│ Paikgacha, Khulna
│ Dhaka, BD 🇧🇩
│ Bangla, English
╰───────────╯

╭─ CODING ─╮
│ JS, Node.js, Python
│ BJS, Express, Goat
│ 5+ Y | 100+ Project
│ Full Stack Dev
╰──────────╯

╭─ BOT EXPERT ─╮
│ Messenger Bot ✅
│ Telegram Bot ✅
│ AI, Tools, Manager
│ Custom Bot Order ✅
╰─────────────╯

╭─ SERVICES ─╮
│ • Messenger Bot
│ • Telegram Bot
│ • Bug Fix & Host
│ • API & Custom Cmd
│ • Bot Sell V5
╰───────────╯

╭─ CONTACT ─╮
│ FB: m.me/B4D9L999
│ TG: t.me/B4D9L_007
│ WA: +8801782721761
│ Mail: badolbot17@gmail.com
│ Git: BADOL-VAI
╰──────────╯

╭─ ACHIEVEMENT ─╮
│ Top Dev 2024
│ BADOL-BOT V1-V5
│ 10K+ Followers
│ ⭐⭐⭐⭐⭐ 5.0
╰──────────────╯

╭─ SUPPORT LINKS ─╮
│ 1. Help Bot Page
│ fb.com/mcs.help.bot
│ 2. Official Page
│ fb.com/ITZ.BADOL.VAI
│ 3. Technical Group
│ fb.com/groups/technical.
│ badol.vai.muslim.cyber
│ 4. Help Group
│ fb.com/groups/mcs.help.bot
│ 5. Badol Vai Group
│ fb.com/groups/badolvai
╰────────────────╯

╭─ BOT INFO ─╮
│ BADOL-BOT-V5
│ V6.1.0 | Node.js
│ Up: ${h}h ${m}m
│ Groups: ${totalGroups}+
│ 🟢 Online Active
╰──────────╯

━━━━━━━━━━━━━━━━━━━━
⚡ Need Bot? Inbox Me!
🤖 BADOL-BOT-V5
👑 MOHAMMAD BADOL`;
        
        api.sendMessage({ body: msg, attachment: attachment }, event.threadID, () => {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
        }, event.messageID);
    }
};