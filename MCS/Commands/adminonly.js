const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
    config: {
        name: "adminonly",
        aliases: ["wl"],
        credit: "MOHAMMAD BADOL",
        prefix: true,
        role: 1,
        cooldown: 3,
        description: "Toggle admin only mode"
    },
    onStartBadol: async (api, event, args) => {
        const configPath = path.join(__dirname, "../../config.json");
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        const LINKS = {
            on: "https://drive.google.com/uc?export=view&id=1uFy5ZEz33kiMeWGC_aYeBSNEHQSObSm3",
            off: "https://drive.google.com/uc?export=view&id=1YCVJr8G6BasPxr-9fP5yVD8nODUFkfEs"
        };
        
        let mode = args[0] === "on" ? true : (args[0] === "off" ? false : !config.ADMIN_SYSTEM.ADMIN_ONLY_MODE);

        config.ADMIN_SYSTEM.ADMIN_ONLY_MODE = mode;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        const status = mode ? "ON" : "OFF";
        const imageUrl = mode ? LINKS.on : LINKS.off;

        const msgBody = `┌─[ BADOL-BOT-V5 ]─┐
│ 
│ ADMIN ONLY MODE: ${status}
│ SUCCESSFULLY ✅
│ 
└───────────⭔`;

        try {
            const response = await axios.get(imageUrl, { responseType: 'stream' });
            
            return api.sendMessage({
                body: msgBody,
                attachment: response.data
            }, event.threadID);
        } catch (error) {
            return api.sendMessage(msgBody, event.threadID);
        }
    }
};
