module.exports = {
    config: { 
        name: "reactionHandler",
        credit: "MOHAMMAD BADOL" 
    },

    onReactionBadol: async (api, event) => {
        const { reaction, messageID, threadID, userID } = event;
        const config = JSON.parse(require("fs").readFileSync("./config.json", "utf-8"));
        const isAdmin = config.ADMIN_SYSTEM.ADMINS.includes(userID);

        const unsendEmojis = ["😠", "😾", "🤬", "😡", "😈", "👿"];
        if (unsendEmojis.includes(reaction)) {
            if (!isAdmin) return;
            
            const message = await api.getMessage(threadID, messageID);
            if (message && message.senderID === api.getCurrentUserID()) {
                return api.unsendMessage(messageID);
            }
        }

        const kickEmojis = ["🦵", "🦶", "🦿", "🖕"]; 
        if (kickEmojis.includes(reaction)) {
            if (!isAdmin) return;

            const message = await api.getMessage(threadID, messageID);
            const targetID = message.senderID;
            const botID = api.getCurrentUserID();

            if (targetID !== botID) {
                api.removeUserFromGroup(targetID, threadID, (err) => {
                    if (err) {
                        api.sendMessage("⚠️ আমি অ্যাডমিন না হওয়ায় কাজটা করতে পারলাম না, ইজ্জত গেল!", threadID);
                    } else {
                        const msg = `╭───────────────╮\n` +
                                    `│  🚫 কিক আউট!!  │\n` +
                                    `╰───────────────╯\n\n` +
                                    `অতিরিক্ত বাল-পাকনামি করার কারণে আপনার পুক্কিতে লাথি 🦵 মেরে গ্রুপ থেকে বিদায় জানানো হলো। বিদায়! 🤢\n\n` +
                                    `Powered by: BADOL-BOT-V5`;
                        api.sendMessage(msg, threadID);
                    }
                });
            }
        }
    }
};
