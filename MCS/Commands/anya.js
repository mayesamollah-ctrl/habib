const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "anya",
        version: "2.0",
        credit: "MOHAMMAD BADOL",
        role: 0,
        prefix: true,
        cooldown: 5,
        aliases: []
    },

    onStartBadol: async function(api, event, args) {
        const { threadID, messageID, senderID } = event;
        const chat = args.join(" ");

        if (!chat) return api.sendMessage("Konichiwa! আপনি কিছু লিখুন।", threadID, messageID);

        try {
            const info = await api.sendMessage("⏳ Anya কথা বলছে, অপেক্ষা করুন...", threadID);

            const text = encodeURIComponent(chat);
            const audioApi = await axios.get(`https://api.tts.quest/v3/voicevox/synthesis?text=${text}&speaker=3`);
            
            const audioUrl = audioApi.data.mp3StreamingUrl;
            if (!audioUrl) {
                return api.editMessage("❌ Anya এর উত্তর পাওয়া যায়নি।", info.messageID);
            }

            const cacheDir = path.join(__dirname, "../../cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            
            const audioPath = path.join(cacheDir, `${threadID}_${senderID}_${Date.now()}.mp3`);

            const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(audioPath, Buffer.from(response.data));

            await api.sendMessage({
                body: "✨ Anya says:",
                attachment: fs.createReadStream(audioPath)
            }, threadID, () => {
                if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            }, messageID);

            api.unsendMessage(info.messageID);

        } catch (error) {
            api.sendMessage("❌ Error: " + error.message, threadID, messageID);
        }
    }
};