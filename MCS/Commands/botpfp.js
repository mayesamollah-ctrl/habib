const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "setavatar",
        aliases: ["botpfp", "setpfp"],
        version: "1.5.0",
        role: 1,
        cooldown: 5,
        prefix: true,
        credit: "MOHAMMAD BADOL"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID, messageReply } = event;
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
            return api.sendMessage("╭━─━─━❮ ⚠️ ❯━─━─━╮\n├‣ দয়া করে একটি ছবির ওপর\n├‣ রিপ্লাই দিয়ে কমান্ডটি দিন!\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍", threadID, messageID);
        }

        const attachment = messageReply.attachments[0];
        if (attachment.type !== "photo") {
            return api.sendMessage("╭━─━─━❮ ❌ ❯━─━─━╮\n├‣ এটি কোনো ছবি নয়!\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍", threadID, messageID);
        }

        const imgUrl = attachment.url;
        const cacheDir = path.join(__dirname, "../../cache"); 
        const imgPath = path.join(cacheDir, `avatar_${Date.now()}.png`);

        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const processingMsg = await api.sendMessage("╭━─━─━❮ ⏳ ❯━─━─━╮\n├‣ ছবি প্রসেস করা হচ্ছে...\n├‣ প্রোগ্রেস: [░░░░░░░░░░] 0%\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍", threadID);

        const updateLoading = async (percent, text) => {
            try {
                const filled = '▓'.repeat(Math.floor(percent / 10));
                const empty = '░'.repeat(10 - Math.floor(percent / 10));
                const bar = `╭━─━─━❮ ⏳ ❯━─━─━╮\n├‣ ${text}\n├‣ প্রোগ্রেস: [${filled}${empty}] ${percent}%\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍`;
                await api.editMessage(bar, processingMsg.messageID);
                await delay(800);
            } catch (e) {}
        };

        try {
            await updateLoading(20, "ইমেজ ডাউনলোড করা হচ্ছে...");
            const response = await axios({ method: "GET", url: imgUrl, responseType: "stream" });
            const writer = fs.createWriteStream(imgPath);
            response.data.pipe(writer);

            writer.on("finish", async () => {
                await updateLoading(50, "ফাইল কনভার্ট হচ্ছে...");
                await updateLoading(80, "প্রোফাইল পিকচার আপডেট হচ্ছে...");
                await updateLoading(100, "প্রায় শেষ..."); // ১০০% ধাপ যোগ করা হলো

                api.changeAvatar(fs.createReadStream(imgPath), async (err) => {
                    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
                    
                    if (err) {
                        return await api.editMessage(`╭━─━─━❮ ❌ ❯━─━─━╮\n├‣ [ ERROR ]: ${err.message}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍`, processingMsg.messageID);
                    }

                    // শেষ ধাপ: এডিট করে সাকসেস মেসেজ দেখানো
                    await api.editMessage("╭━─━─━❮ ✅ ❯━─━─━╮\n├‣ বটের প্রোফাইল পিকচার\n├‣ সফলভাবে পরিবর্তন করা হয়েছে!\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍", processingMsg.messageID);
                });
            });

            writer.on("error", async (err) => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
                await api.editMessage(`╭━─━─━❮ ❌ ❯━─━─━╮\n├‣ [ ERROR ]: ${err.message}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍`, processingMsg.messageID);
            });

        } catch (error) {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            await api.editMessage(`╭━─━─━❮ ❌ ❯━─━─━╮\n├‣ [ ERROR ]: ${error.message}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5  \n╰━──━─━─━━─━─━❍`, processingMsg.messageID);
        }
    }
};
