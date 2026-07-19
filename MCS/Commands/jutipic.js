const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "jutipic",
        aliases: ["juti", "jpic"],
        version: "1.3.0",
        credit: "MOHAMMAD BADOL",
        role: 0,
        cooldown: 5,
        prefix: true,
        description: "Send random juti pic with unique quote",
        category: "fun"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID } = event;
        
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        const CACHE_DIR = path.join(__dirname, "../../cache");
        if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
        const imgPath = path.join(CACHE_DIR, `juti_${Date.now()}.jpg`);

        const data = [
            { img: "https://i.postimg.cc/BnhsHvyZ/received-1191220331561614.jpg", msg: "🖤🦋 ভালোবাসা মানে কারো প্রতি আকর্ষন নয়°\nভালোবাসা মানে শ্রদ্ধা°সম্মান°\nআর এক আকাশ পরিমান ভরসা__!! 🌸🫰" },
            { img: "https://i.postimg.cc/ZRX53qWv/received-1202819107059319.jpg", msg: "💫 কিছু অনুভূতি ভাষায় প্রকাশ করা যায় না\nশুধু হৃদয় দিয়ে অনুভব করতে হয় 🌙✨" },
            { img: "https://i.postimg.cc/yNd1bR9S/received-1277919869496358.jpg", msg: "🌸 জীবন সুন্দর যখন তুমি হাসো\nতোমার হাসিতেই আমার পৃথিবী 💝" },
            { img: "https://i.postimg.cc/VNp8ZVm3/received-1370966393798998.jpg", msg: "🦋 প্রজাপতির মতো রঙিন হোক\nতোমার প্রতিটা দিন 🍃💚" },
            { img: "https://i.postimg.cc/YC2MvFdy/received-1410207299549627.jpg", msg: "🌹 ভালোবাসা মানে দুজন মিলে\nএকটা স্বপ্ন দেখা 💑✨" },
            { img: "https://i.postimg.cc/s2DxCqFx/received-1575640496421558.jpg", msg: "💖 তুমি আছো বলেই\nআমার পৃথিবীটা এতো সুন্দর 🌈" },
            { img: "https://i.postimg.cc/hvFKv3Y9/received-189991853831346.jpg", msg: "🌟 তোমার চোখের তারায়\nআমি আমার ভবিষ্যৎ দেখি 💫" },
            { img: "https://i.postimg.cc/1RNtSDdG/received-201915739517704.jpg", msg: "💝 কিছু সম্পর্কের নাম হয় না\nশুধু অনুভব করতে হয় 🫶" },
            { img: "https://i.postimg.cc/HsgpCRXm/received-2104226693113547.jpg", msg: "🌺 তুমি আমার জীবনের\nসবচেয়ে সুন্দর অধ্যায় 📖💕" },
            { img: "https://i.postimg.cc/j5frp4jC/received-235206272677545.jpg", msg: "🦋 মনের মতো কাউকে পেলে\nজীবনটা রঙিন হয়ে যায় 🌈" },
            { img: "https://i.postimg.cc/WbG1FTTt/received-235360602731729.jpg", msg: "💞 তোমার সাথে কাটানো\nপ্রতিটা মুহূর্ত স্পেশাল ⏰💖" },
            { img: "https://i.postimg.cc/xjH0hnkg/received-255099287260206.jpg", msg: "🌙 রাতের আকাশে তারার মতো\nতুমি জ্বলো আমার মনে ✨" },
            { img: "https://i.postimg.cc/m2yTZjyH/received-3505135599701479.jpg", msg: "💘 ভালোবাসা মানে\nএকসাথে বুড়ো হওয়া 👴👵💕" },
            { img: "https://i.postimg.cc/qvpM2Svw/received-605119934945053.jpg", msg: "🌸 ফুলের মতো সুন্দর\nতোমার মনটা 💐✨" },
            { img: "https://i.postimg.cc/pT522tsW/received-607001748245024.jpg", msg: "💝 তুমি আমার\nশান্তির ঠিকানা 🏡💖" },
            { img: "https://i.postimg.cc/5ywbCScD/received-642702237806079.jpg", msg: "🦋 তোমার হাসি\nআমার সবচেয়ে প্রিয় 😊💕" },
            { img: "https://i.postimg.cc/tJPCzH6S/received-6447490728654057.jpg", msg: "🌹 তুমি ছাড়া\nজীবনটা অসম্পূর্ণ 💔➡️💖" },
            { img: "https://i.postimg.cc/mkGGB1cj/received-667269661468341.jpg", msg: "💫 তোমার সাথে\nস্বপ্ন দেখতে ভালো লাগে 💭💕" },
            { img: "https://i.postimg.cc/nrYfzVBJ/received-712080477598648.jpg", msg: "🌺 তুমি আমার\nভালোবাসার কবিতা 📝💖" },
            { img: "https://i.postimg.cc/7Ls6H9DV/received-778471177337750.jpg", msg: "💞 তোমার স্পর্শে\nমনটা শান্ত হয়ে যায় 🤗💝" },
            { img: "https://i.postimg.cc/J4VhzGw9/received-822897445855051.jpg", msg: "🌟 তুমি আমার\nজীবনের আলো 💡💕" },
            { img: "https://i.postimg.cc/g0TzF0qt/received-836313448160197.jpg", msg: "💘 ভালোবাসা মানে\nতোমাকে আগলে রাখা 🫂💖" },
            { img: "https://i.postimg.cc/g24csswW/received-950979049537517.jpg", msg: "🌙 তোমার কথা ভেবে\nরাত জাগি আমি 😴💕" },
            { img: "https://i.postimg.cc/Kz1YRT8y/received-990740405680183.jpg", msg: "💝 তুমি আমার\nসবচেয়ে বড় পাওয়া 🏆💖" }
        ];

        try {
            const randomData = data[Math.floor(Math.random() * data.length)];
            const imgRes = await axios.get(randomData.img, {
                responseType: "arraybuffer",
                timeout: 15000
            });
            fs.writeFileSync(imgPath, imgRes.data);

            api.setMessageReaction("✅", messageID, () => {}, true);
            
            const boxMsg = `╭━❮ ✨ JUTI PIC ✨ ❯━╮\n├‣ ${randomData.msg}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5\n╰━──━─━─━━─━─━❍`;
            
            return api.sendMessage({
                body: boxMsg,
                attachment: fs.createReadStream(imgPath)
            }, threadID, () => {
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }, messageID);

        } catch (e) {
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (err) {}
            api.setMessageReaction("⚠️", messageID, () => {}, true);
            
            const errorBox = `╭━❮ ❌ ERROR ❯━╮\n├‣ ${e.message}\n├━─━─━━──━─━─━\n├‣ BADOL-BOT-V5\n╰━──━─━─━━─━─━❍`;
            
            return api.sendMessage(errorBox, threadID, messageID);
        }
    }
};