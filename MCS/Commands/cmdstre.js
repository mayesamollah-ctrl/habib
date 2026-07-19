const fs = require("fs");
const path = require("path");
const axios = require("axios");

const FOLDER_PATH = path.join(__dirname, "B4D9L");
const LIST_PATH = path.join(FOLDER_PATH, "cmdlist.json");

if (!fs.existsSync(FOLDER_PATH)) fs.mkdirSync(FOLDER_PATH, { recursive: true });

const getList = () => {
    try {
        if (!fs.existsSync(LIST_PATH)) {
            fs.writeFileSync(LIST_PATH, JSON.stringify([], null, 4));
            return [];
        }
        return JSON.parse(fs.readFileSync(LIST_PATH, "utf-8")).sort();
    } catch (e) { return []; }
};

module.exports.config = {
    name: "cmdstore",
    aliases: ["store", "cmdstre"],
    version: "1.1.1",
    role: 0,
    credit: "MOHAMMAD BADOL",
    cooldown: 5,
    prefix: true,
    description: "Command list management system"
};

module.exports.onStartBadol = async function(api, event, args) {
    const isAdmin = event.senderID === "61591265887748";
    const list = getList();
    const imageUrl = "https://drive.google.com/uc?export=view&id=1x79vQ0lVWicMGnHx52u6JkzDmfyTulE7";

    const help = "┏━『 BADOL-BOT-V5 』━┓\n 〉/cmdstore : View list\n 〉/cmdstore add [name]\n 〉/cmdstore del [name]\n┗━━━━━━━━━━━━━━━━━┛";

    // ১. যদি কোনো আর্গুমেন্ট না থাকে (শুধু /cmdstore) -> লিস্ট দেখাবে
    if (args.length === 0) {
        if (list.length === 0) return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Info: List is empty!\n┗━━━━━━━━━━━━━━━━━┛", event.threadID);

        let msg = "┏━『 BADOL-BOT-V5 』━┓\n";
        list.forEach((cmd, index) => {
            msg += ` 〉${index + 1} ‣ ${cmd}\n`;
        });
        msg += "┗━━━━━━━━━━━━━━━━━┛\n👉 Reply serial to download.";

        const image = (await axios.get(imageUrl, { responseType: "stream" })).data;
        api.sendMessage({ body: msg, attachment: image }, event.threadID, (err, info) => {
            global.msgCache.set(info.messageID, { commandName: "cmdstore" });
        }, event.messageID);
        return;
    }

    // ২. যদি add বা del হয়
    if (args[0] === "add") {
        if (!isAdmin) return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Error: Access denied!\n┗━━━━━━━━━━━━━━━━━┛", event.threadID);
        if (!args[1]) return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Error: Provide filename!\n┗━━━━━━━━━━━━━━━━━┛", event.threadID);
        if (!list.includes(args[1])) {
            list.push(args[1]);
            fs.writeFileSync(LIST_PATH, JSON.stringify(list, null, 4));
            return api.sendMessage(`┏━『 BADOL-BOT-V5 』━┓\n 〉Success: [ ${args[1]} ] added.\n┗━━━━━━━━━━━━━━━━━┛`, event.threadID);
        }
        return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Info: Already in list!\n┗━━━━━━━━━━━━━━━━━┛", event.threadID);
    }

    if (args[0] === "del") {
        if (!isAdmin) return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Error: Access denied!\n┗━━━━━━━━━━━━━━━━━┛", event.threadID);
        if (!args[1]) return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Error: Provide filename!\n┗━━━━━━━━━━━━━━━━━┛", event.threadID);
        const newList = list.filter(item => item !== args[1]);
        if (list.length === newList.length) return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Error: File not found!\n┗━━━━━━━━━━━━━━━━━┛", event.threadID);
        fs.writeFileSync(LIST_PATH, JSON.stringify(newList, null, 4));
        return api.sendMessage(`┏━『 BADOL-BOT-V5 』━┓\n 〉Success: [ ${args[1]} ] removed.\n┗━━━━━━━━━━━━━━━━━┛`, event.threadID);
    }

    // ৩. যদি ভুল আর্গুমেন্ট দেয় (যেমন /cmdstore jcux) -> হেল্প মেনু দেখাবে
    return api.sendMessage(help, event.threadID, event.messageID);
};

module.exports.onReplyBadol = async function(api, event, cache) {
    const list = getList();
    const { body, threadID, messageID } = event;
    const index = parseInt(body) - 1;

    if (isNaN(index) || index < 0 || index >= list.length) {
        return api.sendMessage("┏━『 BADOL-BOT-V5 』━┓\n 〉Error: Invalid serial number!\n┗━━━━━━━━━━━━━━━━━┛", threadID, messageID);
    }

    const fileName = list[index];
    const sourcePath = path.join(__dirname, fileName);
    const txtPath = path.join(__dirname, fileName + ".txt");

    if (fs.existsSync(sourcePath)) {
        const fileContent = fs.readFileSync(sourcePath, "utf-8");
        fs.writeFileSync(txtPath, fileContent);
        
        api.sendMessage({
            body: `┏━『 BADOL-BOT-V5 』━┓\n 〉File: ${fileName}\n 〉Status: Download success!\n┗━━━━━━━━━━━━━━━━━┛`,
            attachment: fs.createReadStream(txtPath)
        }, threadID, () => {
            if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
        }, messageID);
    } else {
        api.sendMessage(`┏━『 BADOL-BOT-V5 』━┓\n 〉Error: File not found!\n┗━━━━━━━━━━━━━━━━━┛`, threadID, messageID);
    }
};
