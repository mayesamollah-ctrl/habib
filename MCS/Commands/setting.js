const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "setting",
        aliases: ["set"],
        prefix: true,
        role: 1,
        cooldown: 3,
        credit: "MOHAMMAD BADOL"
    },

    onStartBadol: async (api, event, args) => {
        const { threadID, messageID } = event;
        const db = require("../../Database");

        const CACHE_DIR = path.join(__dirname, "../../cache");
        if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
        const imgPath = path.join(CACHE_DIR, `set_${Date.now()}.png`);

        const IMG_URL = "https://drive.google.com/uc?export=download&id=1Vecw5_RcDvq2_tFovtA7PiFOb2zeKG9G";

        const downloadImg = async () => {
            try {
                const res = await axios.get(IMG_URL, { responseType: "arraybuffer", timeout: 10000 });
                fs.writeFileSync(imgPath, res.data);
                return fs.createReadStream(imgPath);
            } catch (e) {
                return null;
            }
        };

        const box = (title, content) => {
            return `╭━❮ ✨ ${title} ✨ ❯━╮\n${content}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5\n╰━──━─━─━━─━─━❍`;
        };

        let threadData = await db.getData(threadID, 'threads');
        if (!threadData.data) threadData.data = { resend: true, anti: true, calllog: true };

        const option = args[0];
        const status = args[1];
        const img = await downloadImg();

        if (!option || option === 'help') {
            const msg = box("SETTINGS",
                `├‣ Command Usage Guide\n├‣ \n` +
                `├‣ /set [option] [on/off]\n├‣ \n` +
                `├‣ 📦 resend - Anti Unsend Message\n` +
                `├‣ ON: Deleted msgs will resend\n` +
                `├‣ OFF: Normal delete\n├‣ \n` +
                `├‣ 🛡️ anti - Anti Group Change\n` +
                `├‣ ON: Name/Photo change blocked\n` +
                `├‣ OFF: Anyone can change\n├‣ \n` +
                `├‣ 📞 calllog - Call Notification\n` +
                `├‣ ON: Call info will send\n` +
                `├‣ OFF: No call alerts\n├‣ \n` +
                `├‣ 🌐 all - Control All Features\n` +
                `├‣ /set all on - Enable all\n` +
                `├‣ /set all off - Disable all\n├‣ \n` +
                `├‣ 📋 list - View Current Status\n├‣ \n` +
                `├‣ Example: /set resend on`
            );
            return api.sendMessage({ body: msg, attachment: img }, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);
        }

        if (option === 'list') {
            const msg = box("STATUS",
                `├‣ Current Configuration\n├‣ \n` +
                `├‣ 📦 Resend ${threadData.data.resend? "🟢 ON" : "🔴 OFF"}\n` +
                `├‣ 🛡️ Anti ${threadData.data.anti? "🟢 ON" : "🔴 OFF"}\n` +
                `├‣ 📞 CallLog ${threadData.data.calllog? "🟢 ON" : "🔴 OFF"}`
            );
            return api.sendMessage({ body: msg, attachment: img }, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);
        }

        if (option === 'on' || option === 'off') {
            const val = (option === 'on');
            threadData.data = { resend: val, anti: val, calllog: val };
            await db.saveData(threadID, threadData, 'threads');
            const msg = box("SUCCESS",
                `├‣ All Features Updated\n├‣ \n` +
                `├‣ ${val? "🟢 ENABLED" : "🔴 DISABLED"}\n├‣ \n` +
                `├‣ Resend: ${val? "ON" : "OFF"}\n` +
                `├‣ Anti: ${val? "ON" : "OFF"}\n` +
                `├‣ CallLog: ${val? "ON" : "OFF"}`
            );
            return api.sendMessage({ body: msg, attachment: img }, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);
        }

        if (option === 'all') {
            if (!status) {
                const msg = box("ERROR",
                    `├‣ ❌ Missing Parameter\n├‣ \n` +
                    `├‣ Usage: /set all on/off\n├‣ \n` +
                    `├‣ Example: /set all on`
                );
                return api.sendMessage({ body: msg, attachment: img }, threadID, () => {
                    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
                }, messageID);
            }
            const val = (status === 'on');
            threadData.data = { resend: val, anti: val, calllog: val };
            await db.saveData(threadID, threadData, 'threads');
            const msg = box("SUCCESS",
                `├‣ All Features Updated\n├‣ \n` +
                `├‣ ${val? "🟢 ENABLED" : "🔴 DISABLED"}\n├‣ \n` +
                `├‣ Resend: ${val? "ON" : "OFF"}\n` +
                `├‣ Anti: ${val? "ON" : "OFF"}\n` +
                `├‣ CallLog: ${val? "ON" : "OFF"}`
            );
            return api.sendMessage({ body: msg, attachment: img }, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);
        }

        if (['resend', 'anti', 'calllog'].includes(option)) {
            if (status === 'on' || status === 'off') {
                threadData.data[option] = (status === 'on');

                // anti ON দিলে এখনই গ্রুপের আসল নাম ও ছবি DB তে সেভ করো
                if (option === 'anti' && status === 'on' && !threadData.originalName) {
                    try {
                        const info = await api.getThreadInfo(threadID);
                        const name = info.threadName || info.name || "";
                        const photoUrl = info.imageSrc || info.threadImageUrl || "";
                        if (name) {
                            threadData.originalName = name;
                            threadData.originalPhotoUrl = photoUrl;
                        }
                    } catch (e) {}
                }

                await db.saveData(threadID, threadData, 'threads');

                const icons = { resend: "📦", anti: "🛡️", calllog: "📞" };
                const names = { resend: "Resend", anti: "Anti", calllog: "CallLog" };
                const desc = {
                    resend: "Anti Unsend Message",
                    anti: "Anti Group Change",
                    calllog: "Call Notification"
                };

                const msg = box("UPDATED",
                    `├‣ ${icons[option]} ${names[option]}\n` +
                    `├‣ ${desc[option]}\n├‣ \n` +
                    `├‣ Status: ${status === 'on'? "🟢 ENABLED" : "🔴 DISABLED"}`
                );
                return api.sendMessage({ body: msg, attachment: img }, threadID, () => {
                    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
                }, messageID);
            }
        }

        const msg = box("ERROR",
            `├‣ ❌ Invalid Option\n├‣ \n` +
            `├‣ Use /set help for guide\n├‣ Use /set list for status`
        );
        return api.sendMessage({ body: msg, attachment: img }, threadID, () => {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
        }, messageID);
    }
};