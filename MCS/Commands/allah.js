.cmd add allah.js const axios = require("axios");
const fs = require("fs");
const path = require("path");

const IMAGE_URL = "https://drive.google.com/uc?export=download&id=1O-vNrJcdxSzFmxaPbTom9TkSfIYBlCm6";

function box(data) {
    return `╭─❖ 𝐀𝐋𝐋𝐀𝐇'𝐒 𝟗𝟗 𝐍𝐀𝐌𝐄𝐒 ❖─╮
│
├─ 🕋 নাম: ${data.arabic}
├─ 🌿 অর্থ: ${data.english}
├─ 📖 বাংলা: ${data.meaning}
│
├─ ✨ ফজিলত: ${data.virtue}
│
├─ 🔢 সিরিয়াল: ${data.id}/99
╰─❖ 𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-V5 ❖─╯`;
}

module.exports = {
    config: {
        name: "allah",
        aliases: ["asmaulhusna", "99names"],
        version: "2.1.0",
        credit: "MOHAMMAD BADOL",
        role: 0,
        prefix: true,
        cooldown: 5,
        description: "99 Beautiful Names of Allah"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID } = event;
        const jsonPath = path.join(__dirname, "B4D9L", "allah.json");
        const cacheDir = path.join(__dirname, "cache");
        const imgPath = path.join(cacheDir, "allah.jpg");

        if (!fs.existsSync(jsonPath)) return api.sendMessage("❌ ফাইল পাওয়া যায়নি!", threadID, messageID);

        const names = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        const id = parseInt(args[0]);
        const data = (!isNaN(id) && id >= 1 && id <= 99) 
            ? names.find(item => item.id === id) 
            : names[Math.floor(Math.random() * names.length)];

        try {
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            const res = await axios.get(IMAGE_URL, { responseType: "arraybuffer" });
            fs.writeFileSync(imgPath, Buffer.from(res.data));
            
            return api.sendMessage(
                { body: box(data), attachment: fs.createReadStream(imgPath) },
                threadID,
                messageID
            );
        } catch (e) {
            return api.sendMessage(box(data), threadID, messageID);
        }
    }
};