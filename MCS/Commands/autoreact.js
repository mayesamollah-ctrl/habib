const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../cache/autoreact_db.json");
const BOT_NAME = "BADOL-BOT-V5";

module.exports.config = {
    name: "autoreact",
    aliases: ["react", "autoreact"],
    version: "1.0.2",
    role: 1,
    credit: "MOHAMMAD BADOL",
    cooldown: 5,
    prefix: true,
    description: "Auto reaction toggle with 100+ emojis"
};

const loadData = () => {
    if (!fs.existsSync(DB_PATH)) return { enabledThreads: [] };
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
};

const saveData = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4));
};

module.exports.onStartBadol = async (api, event, args) => {
    const data = loadData();
    const threadID = event.threadID;
    let msg = "";

    if (args[0] === "on") {
        if (!data.enabledThreads.includes(threadID)) {
            data.enabledThreads.push(threadID);
            saveData(data);
            msg = `╭───❏ ${BOT_NAME} ❏\n│ ✅ অটো-রিঅ্যাক্ট সক্রিয় হয়েছে!\n╰──────────────`;
        } else {
            msg = `╭───❏ ${BOT_NAME} ❏\n│ ⚠️ অটো-রিঅ্যাক্ট অলরেডি চালু আছে!\n╰──────────────`;
        }
    } else if (args[0] === "off") {
        data.enabledThreads = data.enabledThreads.filter(id => id !== threadID);
        saveData(data);
        msg = `╭───❏ ${BOT_NAME} ❏\n│ ❌ অটো-রিঅ্যাক্ট বন্ধ করা হয়েছে!\n╰──────────────`;
    } else {
        msg = `╭───❏ ${BOT_NAME} ❏\n│ 🛠️ ব্যবহারবিধি:\n│ /autoreact on\n│ /autoreact off\n╰──────────────`;
    }

    return api.sendMessage(msg, threadID, event.messageID);
};

module.exports.onChatBadol = async (api, event) => {
    const data = loadData();
    
    // ইমোজি লিস্ট এখানে নিচের দিকে
    const emojis = [
        "👍", "❤️", "😆", "😮", "😢", "😡", "🔥", "✨", "🎉", "💖", "🥰", "😍", "🤩", "😎", "🥳", "👻", "🤖", "👽", "👾", "💀",
        "😊", "😂", "🤣", "😅", "😉", "😋", "😎", "😍", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶",
        "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃",
        "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶",
        "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🥳", "🥺", "🤠", "🤡", "🤥", "🤫", "🤭",
        "🧐", "😈", "👿", "👹", "👺", "💀", "☠️", "💩", "🤡", "👻", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽"
    ];

    if (data.enabledThreads.includes(event.threadID)) {
        try {
            const randomReact = emojis[Math.floor(Math.random() * emojis.length)];
            await api.setMessageReaction(randomReact, event.messageID, () => {}, true);
        } catch (e) {}
    }
};