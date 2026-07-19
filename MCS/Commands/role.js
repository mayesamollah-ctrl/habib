const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "role",
    aliases: ["setrole", "permission"],
    version: "1.1.0",
    role: 1,
    credit: "MOHAMMAD BADOL",
    description: "Update command role permission",
    category: "system",
    prefix: true,
    cooldown: 5
};

module.exports.onStartBadol = async function (api, event, args) {
    const { threadID, messageID } = event;
    const [commandName, newRole] = args;
    
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    const CACHE_DIR = path.join(__dirname, "../../cache");
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const imgPath = path.join(CACHE_DIR, `role_${Date.now()}.jpg`);
    
    const driveFileId = "1ZS739QBJU3lw9az6Vk-aiNctEFLJ-tZ8";
    const imgUrl = `https://drive.google.com/uc?export=view&id=${driveFileId}`;
    
    try {
        const imgRes = await axios.get(imgUrl, {
            responseType: "arraybuffer",
            timeout: 10000
        });
        fs.writeFileSync(imgPath, imgRes.data);
    } catch (e) {
        console.log("[ ROLE ] Image download failed:", e.message);
    }
    
    const box = "┌───────────────┐\n│   ROLE SYSTEM   │\n└───────────────┘";

    if (!commandName || newRole === undefined) {
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        const sendData = { 
            body: `${box}\nUsage: /role [cmd] [role]\nExample: /role help 1\n\n[ BADOL-BOT-V5 ]`
        };
        if (fs.existsSync(imgPath)) sendData.attachment = fs.createReadStream(imgPath);
        return api.sendMessage(sendData, threadID, () => {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
        }, messageID);
    }

    const command = global.commands.get(commandName.toLowerCase());
    if (!command) {
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        const sendData = { 
            body: `${box}\n❌ Command not found!\n\n[ BADOL-BOT-V5 ]`
        };
        if (fs.existsSync(imgPath)) sendData.attachment = fs.createReadStream(imgPath);
        return api.sendMessage(sendData, threadID, () => {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
        }, messageID);
    }

    const cmdPath = path.join(__dirname, "../Commands", `${command.config.name}.js`);
    
    try {
        if (!fs.existsSync(cmdPath)) {
            api.setMessageReaction("⚠️", messageID, () => {}, true);
            const sendData = { 
                body: `${box}\n❌ Path Error: File not found\n\n[ BADOL-BOT-V5 ]`
            };
            if (fs.existsSync(imgPath)) sendData.attachment = fs.createReadStream(imgPath);
            return api.sendMessage(sendData, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);
        }

        let content = fs.readFileSync(cmdPath, "utf-8");
        const roleRegex = /role:\s*\d+/;
        
        if (!roleRegex.test(content)) {
            api.setMessageReaction("⚠️", messageID, () => {}, true);
            const sendData = { 
                body: `${box}\n❌ Format not found in file!\n\n[ BADOL-BOT-V5 ]`
            };
            if (fs.existsSync(imgPath)) sendData.attachment = fs.createReadStream(imgPath);
            return api.sendMessage(sendData, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);
        }

        fs.writeFileSync(cmdPath, content.replace(roleRegex, `role: ${newRole}`), "utf-8");
        await global.loadCommands();

        api.setMessageReaction("✅", messageID, () => {}, true);
        const sendData = { 
            body: `${box}\n✅ Success!\nCommand: ${command.config.name}\nNew Role: ${newRole}\n\n[ BADOL-BOT-V5 ]`
        };
        if (fs.existsSync(imgPath)) sendData.attachment = fs.createReadStream(imgPath);
        return api.sendMessage(sendData, threadID, () => {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
        }, messageID);
        
    } catch (e) {
        api.setMessageReaction("⚠️", messageID, () => {}, true);
        const sendData = { 
            body: `${box}\n❌ Error: ${e.message}\n\n[ BADOL-BOT-V5 ]`
        };
        if (fs.existsSync(imgPath)) sendData.attachment = fs.createReadStream(imgPath);
        return api.sendMessage(sendData, threadID, () => {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
        }, messageID);
    }
};