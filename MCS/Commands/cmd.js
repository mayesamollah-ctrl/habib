const fs = require("fs-extra");
const path = require("path");

function box(title, content) {
    const formattedContent = content.split('\n')
       .map(line => `├‣ ${line}`)
       .join('\n');

    return `╭━❮ ${title} ❯━╮\n` +
           `${formattedContent}\n` +
           `├━─━─━━──━─━─━\n` +
           `├‣ BADOL-BOT-V5\n` +
           `╰━──━─━─━━─━─━❍`;
}

function validateAndLoadCommand(filePath, fileName) {
 try {
 if (require.cache[require.resolve(filePath)]) {
 delete require.cache[require.resolve(filePath)];
 }
 
 const cmd = require(filePath);

 if (!cmd.config || typeof cmd.config !== "object") {
 throw new Error("Config missing or not an object");
 }
 if (!cmd.config.name) {
 throw new Error("Config name missing");
 }
 // onStartBadol অথবা onStart — যেকোনো একটা থাকলেই চলবে
 const startFn = cmd.onStartBadol || cmd.onStart;
 if (!startFn || typeof startFn !== "function") {
 throw new Error("onStartBadol (বা onStart) function missing");
 }
 if (cmd.config.credit !== "MOHAMMAD BADOL") {
 throw new Error(`Credit lock violation: ${cmd.config.credit || "Unknown"}`);
 }

 global.commands.set(cmd.config.name, cmd);
 return { success: true, name: cmd.config.name };

 } catch (error) {
 if (fs.existsSync(filePath)) {
 fs.unlinkSync(filePath);
 }
 return { success: false, error: error.message };
 }
}

module.exports = {
 config: {
 name: "cmd",
 aliases: ["command"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 1,
 cooldown: 0,
 description: "Command Management System"
 },

 onReactionBadol: async function (api, event) {
 if (event.reaction !== "💚") return;
 const confirmKey = `cmd_confirm_${event.messageID}`;
 const data = global.msgCache.get(confirmKey);
 if (!data || event.userID !== data.senderID) return;

 try {
 await api.unsendMessage(event.messageID);
 await fs.writeFileSync(data.filePath, data.code);
 
 const result = validateAndLoadCommand(data.filePath, data.fileName);
 
 if (result.success) {
 api.sendMessage(box("✅ OVERWRITE DONE", `File: ${data.fileName}\nStatus: Updated & Loaded`), event.threadID);
 } else {
 api.sendMessage(box("❌ ERROR", `${result.error}`), event.threadID);
 }
 
 global.msgCache.delete(confirmKey);
 } catch (e) {
 api.sendMessage(box("❌ ERROR", `${e.message}`), event.threadID);
 }
 },

 onStartBadol: async function (api, event, args) {
 const { threadID, senderID, messageID } = event;
 const cmdPath = __dirname;
 const action = args[0]?.toLowerCase();

 if (!action) {
 return api.sendMessage(box("⚙️ CMD MANAGER",
 "Available Actions:\n" +
 "load <name>\n" +
 "unload <name>\n" +
 "loadall\n" +
 "del <name>\n" +
 "add <name.js> <code>\n" +
 "list"
 ), threadID);
 }

 try {
 switch (action) {
 case "load": {
 if (!args[1]) return api.sendMessage(box("❌ ERROR", "Syntax: /cmd load <name>"), threadID);
 const name = args[1].replace(".js", "");
 const p = path.join(cmdPath, name + ".js");
 if (!fs.existsSync(p)) return api.sendMessage(box("❌ ERROR", `File not found: ${name}.js`), threadID);
 
 const result = validateAndLoadCommand(p, name + ".js");
 if (result.success) {
 return api.sendMessage(box("✅ LOAD SUCCESS", `Loaded: ${result.name}`), threadID);
 } else {
 return api.sendMessage(box("❌ ERROR", `${result.error}`), threadID);
 }
 }

 case "unload": {
 if (!args[1]) return api.sendMessage(box("❌ ERROR", "Syntax: /cmd unload <name>"), threadID);
 const name = args[1].replace(".js", "");
 if (!global.commands.has(name)) return api.sendMessage(box("❌ ERROR", `Command not loaded: ${name}`), threadID);
 global.commands.delete(name);
 return api.sendMessage(box("⚠️ UNLOAD SUCCESS", `Inactive: ${name}`), threadID);
 }

 case "loadall": {
 global.loadCommands();
 return api.sendMessage(box("🚀 LOAD ALL", `Total: ${global.commands.size} commands`), threadID);
 }

 case "del": {
 if (!args[1]) return api.sendMessage(box("❌ ERROR", "Syntax: /cmd del <name>"), threadID);
 const name = args[1].replace(".js", "");
 const fp = path.join(cmdPath, name + ".js");

 if (!fs.existsSync(fp)) {
 return api.sendMessage(box("❌ ERROR", `File not found: ${name}.js`), threadID);
 }

 global.commands.delete(name);
 if (require.cache[require.resolve(fp)]) delete require.cache[require.resolve(fp)];
 fs.unlinkSync(fp);
 return api.sendMessage(box("🗑️ DELETE SUCCESS", `Deleted: ${name}.js\nStatus: Removed`), threadID);
 }

 case "list": {
 const cmds = Array.from(global.commands.keys());
 if (cmds.length === 0) return api.sendMessage(box("📋 CMD LIST", "No commands loaded"), threadID);
 return api.sendMessage(box("📋 CMD LIST", `Total: ${cmds.length}\nNames: ${cmds.join(", ")}`), threadID);
 }

 case "add": {
 const [fn, ...codeArr] = args.slice(1);
 const code = codeArr.join(" ");
 if (!fn || !code) return api.sendMessage(box("❌ ERROR", "Syntax: /cmd add name.js <code>"), threadID);

 const fp = path.join(cmdPath, fn);
 if (fs.existsSync(fp)) {
 return api.sendMessage(box("⚠️ WARNING", "File exists! React 💚 to overwrite."), threadID, (err, info) => {
 global.msgCache.set(`cmd_confirm_${info.messageID}`, { fileName: fn, code, filePath: fp, senderID });
 }, messageID);
 }

 await fs.writeFileSync(fp, code);
 const result = validateAndLoadCommand(fp, fn);

 if (result.success) {
 return api.sendMessage(box("✅ INSTALLED", `${fn} loaded & active`), threadID);
 } else {
 return api.sendMessage(box("❌ ERROR", `${result.error}`), threadID);
 }
 }

 default:
 return api.sendMessage(box("❌ ERROR", "Unknown action!"), threadID);
 }
 } catch (e) {
 api.sendMessage(box("❌ ERROR", `${e.message}`), threadID);
 }
 }
};
