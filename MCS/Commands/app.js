module.exports = {
    config: {
        name: "app",
        aliases: ["apps", "apk"],
        version: "1.0.0",
        author: "MOHAMMAD BADOL",
        role: 0,
        cooldown: 10,
        prefix: true,
        credit: "MOHAMMAD BADOL",
        description: "প্রিমিয়াম APK লিস্ট এবং ডাউনলোড লিঙ্ক দেখায়।"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID } = event;

        try {
            // 🔄 লোডিং মেসেজ
            const loadingMsg = await api.sendMessage("🔄 [▒▒▒▒▒▒▒▒▒▒] 0%", threadID, messageID);

            const progress = [
                "⚡ [██▒▒▒▒▒▒▒▒] 20%",
                "⚡ [████▒▒▒▒▒▒] 40%",
                "⚡ [██████▒▒▒▒] 60%",
                "⚡ [████████▒▒] 80%",
                "✅ [██████████] 100%"
            ];

            // লোডিং এনিমেশন
            for (let i = 0; i < progress.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 350));
                try {
                    await api.editMessage(progress[i], loadingMsg.messageID);
                } catch (e) {}
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            try { await api.unsendMessage(loadingMsg.messageID); } catch (e) {}

            // 📱 APK লিস্ট
            const apkList = [
                { name: "🛠️ Apk Editor Pro", url: "https://t.me/SB_MODS_APK/115" },
                { name: "🤖 BADOL_TG_BOT", url: "https://t.me/SB_MODS_APK/116" },
                { name: "📘 MCS Fb Lite", url: "https://t.me/SB_MODS_APK/117" },
                { name: "💳 HD Card Maker", url: "https://t.me/SB_MODS_APK/118" },
                { name: "⌨️ Redmik Keyboard", url: "https://t.me/SB_MODS_APK/119" },
                { name: "🎵 Audio Player Pro", url: "https://t.me/SB_MODS_APK/120" },
                { name: "🎬 Inshot Premium", url: "https://t.me/SB_MODS_APK/121" },
                { name: "📨 Telegram Puls Mod", url: "https://t.me/SB_MODS_APK/122" },
                { name: "📹 Xrecorder Pro", url: "https://t.me/SB_MODS_APK/123" },
                { name: "🌐 TouchVPN Mod", url: "https://t.me/SB_MODS_APK/124" },
                { name: "🖼️ PixelLab MB", url: "https://t.me/SB_MODS_APK/125" },
                { name: "🖼️ PixelLab MB 2", url: "https://t.me/SB_MODS_APK/126" },
                { name: "🛠️ Apk Editor MB", url: "https://t.me/SB_MODS_APK/127" },
                { name: "📘 Old FB Lite", url: "https://t.me/SB_MODS_APK/31" },
                { name: "🆔 Fb Name Change Capital", url: "https://t.me/SB_MODS_APK/136" },
                { name: "💹 Mt Maneger💰", url: "https://t.me/SB_MODS_APK/150" },
                { name: "📧 Temp Mail✉️", url: "https://t.me/SB_MODS_APK/151" },
                { name: "⌛ Fb Cookies ⏳", url: "https://t.me/SB_MODS_APK/184" }
            ];

            let text = `╭━❮BADOL-BOT-V5❯━╮\n`;
            text += `├‣ ✨ **SB MODS PREMIUM APK LIST**\n`;
            text += `├━─━─━━──━─━─━\n`;
            text += `├‣ 📂 নিচের লিস্ট থেকে লিংক কপি করুন:\n`;
            text += `├━─━─━━──━─━─━\n\n`;

            apkList.forEach((apk, i) => {
                text += `${i + 1}. ${apk.name}\n${apk.url}\n\n`;
            });

            text += `├━─━─━━──━─━─━\n`;
            text += `├‣ 🛡️ **Credit:** ${this.config.credit}\n`;
            text += `╰━──━─━─━━─━─━❍`;

            return api.sendMessage(text, threadID, messageID);

        } catch (error) {
            console.error("APK CMD ERROR:", error.message);
            api.sendMessage("⚠️ APK লিস্ট লোড করতে সমস্যা হয়েছে।", threadID, messageID);
        }
    }
};