const fs = require("fs-extra");
const path = require("path");

// ফোল্ডারের নাম B4D9L রাখা হয়েছে
const baseDir = path.join(__dirname, "B4D9L");

function box(title, content) {
    return `╭─[ ${title} ]─╮\n${content}\n╰───────────────╯`;
}

module.exports = {
    config: {
        name: "json",
        aliases: ["file", "data"],
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1,
        cooldown: 0,
        description: "JSON Management System (B4D9L Folder)"
    },

    onReactionBadol: async function (api, event) {
        if (event.reaction !== "💚") return;
        const data = global.msgCache.get(`json_confirm_${event.messageID}`);
        if (!data || event.userID !== data.senderID) return;

        try {
            await api.unsendMessage(event.messageID);
            // B4D9L ফোল্ডার নিশ্চিত করা
            if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
            
            await fs.writeFileSync(data.filePath, data.content);
            api.sendMessage(box("✅ SUCCESS", `│ File: ${data.fileName}\n│ Status: Saved in B4D9L folder`), event.threadID);
            global.msgCache.delete(`json_confirm_${event.messageID}`);
        } catch (e) {
            api.sendMessage(box("❌ ERROR", `│ ${e.message}`), event.threadID);
        }
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, senderID } = event;
        const action = args[0]?.toLowerCase();

        if (!action) {
            return api.sendMessage(box("⚙️ JSON MANAGER",
                "│ /json add <name.json> <code>\n" +
                "│ /json del <name.json>\n" +
                "│ /json list\n" +
                "│ /json read <name.json>"
            ), threadID);
        }

        switch (action) {
            case "add": {
                if (args.length < 3) return api.sendMessage(box("❌ ERROR", "│ Usage: /json add <name.json> <code>"), threadID);
                const fileName = args[1].endsWith(".json") ? args[1] : args[1] + ".json";
                const content = args.slice(2).join(" ");
                const fp = path.join(baseDir, fileName);

                try {
                    JSON.parse(content);
                    const msg = await api.sendMessage(box("⚠️ CONFIRM", `│ Add/Overwrite ${fileName} in B4D9L?\n│ React 💚 to confirm.`), threadID);
                    global.msgCache.set(`json_confirm_${msg.messageID}`, { senderID, filePath: fp, content, fileName });
                } catch (e) {
                    return api.sendMessage(box("❌ INVALID JSON", `│ ${e.message}`), event.threadID);
                }
                break;
            }

            case "del": {
                if (!args[1]) return api.sendMessage(box("❌ ERROR", "│ Usage: /json del <name.json>"), threadID);
                const fileName = args[1].endsWith(".json") ? args[1] : args[1] + ".json";
                const fp = path.join(baseDir, fileName);
                
                if (!fs.existsSync(fp)) return api.sendMessage(box("❌ ERROR", "│ File not found"), threadID);
                fs.unlinkSync(fp);
                return api.sendMessage(box("🗑️ DELETED", `│ ${fileName} removed from B4D9L folder`), threadID);
            }

            case "list": {
                if (!fs.existsSync(baseDir)) return api.sendMessage(box("📂 FILES", "│ B4D9L folder is empty"), threadID);
                const files = fs.readdirSync(baseDir).filter(f => f.endsWith(".json"));
                return api.sendMessage(box("📂 JSON FILES", files.length > 0 ? files.map(f => `│ • ${f}`).join("\n") : "│ Folder is empty"), threadID);
            }

            case "read": {
                if (!args[1]) return api.sendMessage(box("❌ ERROR", "│ Usage: /json read <name.json>"), threadID);
                const fp = path.join(baseDir, args[1]);
                if (!fs.existsSync(fp)) return api.sendMessage(box("❌ ERROR", "│ File not found"), threadID);
                return api.sendMessage(fs.readFileSync(fp, "utf-8"), threadID);
            }
        }
    }
};
