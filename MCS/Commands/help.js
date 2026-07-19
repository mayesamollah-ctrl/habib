const fs = require("fs");
const path = require("path");
const axios = require("axios");

function toBoldItalic(text) {
    const map = {
        "a": "𝚊", "b": "𝚋", "c": "𝚌", "d": "𝚍", "e": "𝚎", "f": "𝚏", "g": "𝚐", "h": "𝚑", "i": "𝚒", "j": "𝚓", "k": "𝚔", "l": "𝚕", "m": "𝚖", "n": "𝚗", "o": "𝚘", "p": "𝚙", "q": "𝚚", "r": "𝚛", "s": "𝚜", "t": "𝚝", "u": "𝚞", "v": "𝚟", "w": "𝚠", "x": "𝚡", "y": "𝚢", "z": "𝚣",
        "A": "𝙰", "B": "𝙱", "C": "𝙲", "D": "𝙳", "E": "𝙴", "F": "𝙵", "G": "𝙶", "H": "𝙷", "I": "𝙸", "J": "𝙹", "K": "𝙺", "L": "𝙻", "M": "𝙼", "N": "𝙽", "O": "𝙾", "P": "𝙿", "Q": "𝚀", "R": "𝚁", "S": "𝚂", "T": "𝚃", "U": "𝚄", "V": "𝚅", "W": "𝚆", "X": "𝚇", "Y": "𝚈", "Z": "𝚉",
        "0": "𝟶", "1": "𝟷", "2": "𝟸", "3": "𝟹", "4": "𝟺", "5": "𝟻", "6": "𝟼", "7": "𝟽", "8": "𝟾", "9": "𝟿"
    };
    return String(text).split('').map(function(char) { return map[char] || char; }).join('');
}

module.exports = {
    config: {
        name: "help",
        aliases: ["menu"],
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 0,
        cooldown: 5,
        description: "Custom template style help menu with alphabetical grouping and numbering"
    },

    onStartBadol: async (api, event, args) => {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf-8"));
        const prefix = config.BOT_INFO.PREFIX;
        const botName = config.BOT_INFO.BOT_NAME || "BADOL-BOT-V5";
        const commands = global.commands;
        const ownerName = "MOHAMMAD BADOL";
        const imgURL = "https://drive.google.com/uc?export=download&id=1detiUoL9Xqlaf9pdAclNWG32t2W78oDX";

        const getStream = async (url) => {
            const res = await axios.get(url, { responseType: "stream" });
            return res.data;
        };

        if (!args[0]) {
            const sortedCmdNames = Array.from(commands.keys()).sort();
            
            const grouped = {};
            for (const name of sortedCmdNames) {
                const firstLetter = name.charAt(0).toUpperCase();
                if (!grouped[firstLetter]) {
                    grouped[firstLetter] = [];
                }
                grouped[firstLetter].push(name);
            }

            let totalCommands = sortedCmdNames.length;
            let msg = `╭───❍ ${toBoldItalic("Help-Menu")} ❍───╮\n`;
            let cmdIndex = 0;

            for (const letter of Object.keys(grouped).sort()) {
                msg += `┏━━━ [ ${toBoldItalic(letter)} ] ━━━❥\n`;
                for (const name of grouped[letter]) {
                    cmdIndex++;
                    msg += `├‣ ${toBoldItalic(String(cmdIndex))} ✿ ${prefix}${toBoldItalic(name)}\n`;
                }
                msg += `┗━━━━━━━━━━━━━━━❥\n\n`;
            }

            msg += `𝄞⋆⃝🧚‍${toBoldItalic(botName)}🧚‍⋆⃝𝄞\n`;
            msg += `┊│╭──────────────────◈\n`;
            msg += `┊││▸ ✿ ${toBoldItalic("Bot Prefix")}: ${prefix}\n`;
            msg += `┊││▸ ✿ ${toBoldItalic("Bot Name")}: ${toBoldItalic(botName)}\n`;
            msg += `┊││▸ ✿ ${toBoldItalic("Total Commands")}: ${toBoldItalic(String(totalCommands))}\n`;
            msg += `┊││▸ ✿ ${toBoldItalic("Dev")}: ${toBoldItalic(ownerName)}\n`;
            msg += `┊│╰──────────────────◈\n`;
            msg += `╰────────────────────⟡\n\n`;
            msg += `✨ ${toBoldItalic("Use")}: ${prefix}${toBoldItalic("help")} [${toBoldItalic("command name")}] ✨`;

            return api.sendMessage({
                body: msg.trim(),
                attachment: await getStream(imgURL)
            }, event.threadID, event.messageID);
        }

        const cmdName = args[0].toLowerCase();
        const command = Array.from(commands.values()).find(c => c.config.name === cmdName || c.config.aliases?.includes(cmdName));

        if (!command)
            return api.sendMessage(`❌ ${toBoldItalic("Command not found")}. ${toBoldItalic("Use")} ${prefix}${toBoldItalic("help")} ${toBoldItalic("to see all commands")}.`, event.threadID, event.messageID);

        const configCmd = command.config;
        let details = `╭──────────────────────╮\n│ 『 ${toBoldItalic("COMMAND DETAILS")} 』\n├──────────────────────┤\n`;

        for (const key in configCmd) {
            if (configCmd[key] !== undefined && configCmd[key] !== null) {
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                let value = configCmd[key];

                if (Array.isArray(value)) value = value.join(", ");
                if (typeof value === "boolean") value = value ? "Yes" : "No";

                const strVal = String(value);
                
                // ডিসক্রিপশন বা লম্বা লেখা সুন্দরভাবে ফ্রেমে বাঁধার লজিক
                if (strVal.length > 20 || key === "description") {
                    details += `│ ✦ ${toBoldItalic(formattedKey)}:\n`;
                    const words = strVal.split(" ");
                    let line = "│   ";
                    for (const word of words) {
                        if ((line + " " + word).length > 28) {
                            details += `${toBoldItalic(line)}\n`;
                            line = "│   " + word;
                        } else {
                            line += (line === "│   " ? "" : " ") + word;
                        }
                    }
                    if (line.trim() !== "│") {
                        details += `${toBoldItalic(line)}\n`;
                    }
                } else {
                    details += `│ ✦ ${toBoldItalic(formattedKey)}: ${toBoldItalic(strVal)}\n`;
                }
            }
        }
        details += `╰──────────────────────╯`;

        return api.sendMessage({
            body: details,
            attachment: await getStream(imgURL)
        }, event.threadID, event.messageID);
    }
};
