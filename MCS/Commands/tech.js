module.exports = {
    config: {
        name: "tech",
        aliases: ["teach"],
        version: "0.0.2",
        credit: "MOHAMMAD BADOL",
        role: 0,
        prefix: true,
        cooldown: 5,
        description: "Teach sim"
    },

    onStartBadol: async (api, event, args) => {
        const axios = require('axios');
        const { threadID, messageID } = event;
        const info = args.join(" ");

        if (!info || !info.includes("-")) {
            return api.sendMessage(`╭─❏ BADOL-BOT V5\n│ ⚠️ Wrong Format!\n│ 🛠 Usage:\n│ /tech question - answer\n╰──────────────`, threadID, messageID);
        }

        const msg = info.split("-");
        const ask = msg[0].trim();
        const ans = msg[1].trim();

        try {
            const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/api.json');
            const teach = apis.data.sim;
            
            await axios.get(`${teach}/sim?type=teach&ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);

            return api.sendMessage(
                `╭─❏ DATA SAVED!\n│ 📝 Question: ${ask}\n│ 💬 Answer: ${ans}\n╰──────────────`, 
                threadID, 
                messageID
            );
        } catch (error) {
            return api.sendMessage(`╭─❏ ERROR!\n│ ❌ Failed to save data.\n╰──────────────`, threadID, messageID);
        }
    }
};
