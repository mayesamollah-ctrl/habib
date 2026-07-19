const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const BG_URL = "https://drive.google.com/uc?export=view&id=1eGp9HgMYVrwhwXltOirZAEk5xQiqRoE4";

module.exports.config = {
    name: "hijla",
    version: "4.7",
    credit: "MOHAMMAD BADOL",
    cooldown: 10,
    role: 0,
    prefix: true,
    description: "Hijla banner with elegant box design",
    category: "fun",
    usages: "[reply/mention to message]",
    aliases: []
};

module.exports.onStartBadol = async function (api, event, args) {
    const { threadID, messageID } = event;
    const restrictedId = 61591265887748;

    // মজার মেসেজের লিস্ট
    const hijlaMessages = [
        "এই যে দেখুন নতুন হিজলা! 😂",
        "সাবধান! এলাকা কাঁপানো হিজলা হাজির! 💃",
        "হিজলা হওয়ার শখ মিটলো তো? 😈",
        "সবাই হাততালি দেন, নতুন হিজলা পাওয়া গেছে! 👏",
        "ওর আসল রূপটা দেখুন, একদম অরিজিনাল হিজলা! 🤡",
        "আজ থেকে তুই হিজলা বাহিনীর সদস্য! 🤣",
        "ইশ! হিজলাটা তো দেখি খুব কিউট! 💅",
        "গোপন খবর ফাঁস! হিজলা ধরা পড়লো! 🔥"
    ];
    const randomMsg = hijlaMessages[Math.floor(Math.random() * hijlaMessages.length)];

    let targetId;
    if (Object.keys(event.mentions).length > 0) targetId = Object.keys(event.mentions)[0];
    else if (event.messageReply) targetId = event.messageReply.senderID;

    if (!targetId) return api.sendMessage("⚠️ Please reply or mention to someone.", threadID, messageID);

    let targetName = "Target";
    try {
        const t = await api.getUserInfo(targetId);
        targetName = t[targetId]?.name || "Target";
    } catch (e) {}

    if (targetId == restrictedId) return api.sendMessage("❌ You don't have permission to use this frame on this user!", threadID, messageID);

    const waitMsg = await api.sendMessage("⏳ Processing your request...", threadID, messageID);

    try {
        const bgResponse = await axios.get(BG_URL, { responseType: 'arraybuffer' });
        const bgImg = await loadImage(Buffer.from(bgResponse.data));
        
        const canvas = createCanvas(360, 360);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImg, 0, 0, 360, 360);

        const getProfilePic = async (userId) => {
            return `https://graph.facebook.com/${userId}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        };

        // পজিশন এবং সাইজ কন্ট্রোল গাইডলাইন
        const posX = 180; // ডানে-বামে (বড় করলে ডানে, ছোট করলে বামে)
        const posY = 80;  // উপরে-নিচে (বড় করলে নিচে, ছোট করলে উপরে)
        const sizeR = 40; // সাইজ (বড় করলে বড়, ছোট করলে ছোট)

        const drawProfile = async (url, x, y, r, borderColor) => {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const img = await loadImage(Buffer.from(response.data));
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
            ctx.restore();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, true);
            ctx.stroke();
        };

        await drawProfile(await getProfilePic(targetId), posX, posY, sizeR, "#FF0000");

        const outPath = path.join(__dirname, `hijla_${targetId}.png`);
        fs.writeFileSync(outPath, canvas.toBuffer('image/png'));

        await api.unsendMessage(waitMsg.messageID).catch(() => {});
        
        // সুন্দর ডিজাইন বক্স আউটপুট
        const outputMessage = `┌───────────────┐\n` +
                              `   ✨ HIJLA SYSTEM ✨\n` +
                              `└───────────────┘\n` +
                              `👤 Victim: ${targetName}\n` +
                              `💬 Result: ${randomMsg}\n` +
                              `━━━━━━━━━━━━━━━━━\n` +
                              `Powered by: BADOL-BOT-V5`;

        await api.sendMessage({
            body: outputMessage,
            attachment: fs.createReadStream(outPath)
        }, threadID, messageID);

        fs.unlinkSync(outPath);
    } catch (e) {
        console.error(e);
        await api.unsendMessage(waitMsg.messageID).catch(() => {});
        return api.sendMessage("❌ Error: Unable to load profile picture.", threadID, messageID);
    }
};
