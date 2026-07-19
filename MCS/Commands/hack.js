const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports.config = {
  name: "hack",
  version: "1.0.9",
  role: 0,
  credit: "MOHAMMAD BADOL",
  description: "Advanced ID hack",
  prefix: true,
  category: "Fun",
  aliases: ["heck"],
  usages: "[@tag | reply]",
  cooldown: 10
};

try {
  registerFont(path.join(__dirname, "B4D9L", "BeVietnamPro.ttf"), { family: "BeVietnamPro" });
} catch (e) {}

module.exports.onStartBadol = async function (api, event, args) {
  const { threadID, messageID, senderID, messageReply, type, mentions } = event;
  const id = type == "message_reply" ? messageReply.senderID : Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;

  const userInfo = await api.getUserInfo(id);
  const name = userInfo[id].name;

  // ১. লোডিং মেসেজ পাঠানো
  const loadingMsg = await api.sendMessage("🔄 [▒▒▒▒▒▒▒▒▒▒] 0%", threadID, messageID);
  
  const progress = [
    "⚡ [██▒▒▒▒▒▒▒▒] 20%",
    "⚡ [████▒▒▒▒▒▒] 40%",
    "⚡ [██████▒▒▒▒] 60%",
    "⚡ [████████▒▒] 80%",
    "✅ [██████████] 100%"
  ];

  // ২. লোডিং এনিমেশন চালানো
  for (let i = 0; i < progress.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 350));
    try { await api.editMessage(progress[i], loadingMsg.messageID); } catch (e) {}
  }

  const fakeLogs = `
🚀 SYSTEM HACKING INITIALIZED
-------------------------------
👤 Name     : ${name.substring(0, 10)}
🆔 UID      : ${id.substring(0, 8)}...
🌐 IP       : 192.168.x.x
📱 Device   : ${['iPh16', 'S24U', 'Pix9', 'Mi14'][Math.floor(Math.random()*4)]}
🔑 Password : ****${Math.random().toString(36).substring(2, 6).toUpperCase()}
📧 Email    : ${name.split(' ')[0].toLowerCase()}@gmail.com
📍 Location : Dhaka, BD
🔋 Battery  : ${Math.floor(Math.random()*100)}%
📶 Signal   : ${Math.floor(Math.random()*100)} dBm
🛡️ Security : [CRITICAL_BYPASS]
🔓 Access   : ROOT_ADMIN_LEVEL
🧬 Acc Age  : ${2010 + Math.floor(Math.random()*15)} Years
📅 Active   : Just Now
📂 Media    : ${Math.floor(Math.random()*5000)}+ Files
💬 Chats    : 142 Active
📡 Network  : 5G-LTE
💾 Storage  : ${Math.floor(Math.random()*512)} GB
⏳ Session  : ${Math.random().toString(16).substring(2, 8).toUpperCase()}
⚙️ Status   : SYSTEM COMPROMISED
🚀 Progress : 100%
✅ Result   : ACCESS GRANTED
-------------------------------`;

  const cacheDir = path.join(__dirname, "B4D9L");
  const pathImg = path.join(cacheDir, `hack_${Date.now()}.png`);
  await fs.ensureDir(cacheDir);

  try {
    const bgURL = "https://drive.google.com/uc?export=download&id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ";
    const [avatarRes, bgRes] = await Promise.all([
      axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" }).catch(() => axios.get(`https://graph.facebook.com/${id}/picture?type=large`, { responseType: "arraybuffer" })),
      axios.get(bgURL, { responseType: "arraybuffer" })
    ]);

    const baseImage = await loadImage(bgRes.data);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0);

    ctx.font = "400 23px BeVietnamPro, Arial";
    ctx.fillStyle = "#1878F3";
    ctx.fillText(name, 200, 497);

    ctx.save();
    ctx.beginPath();
    ctx.arc(133, 487, 50, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const avatar = await loadImage(avatarRes.data);
    ctx.drawImage(avatar, 83, 437, 100, 100);
    ctx.restore();

    await fs.writeFile(pathImg, canvas.toBuffer("image/png"));

    // ৩. লোডিং মেসেজটি সরিয়ে রেজাল্ট পাঠানো
    await api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage({
      body: `✅ হ্যাকিং সাকসেসফুল!\n\n${fakeLogs}\n\n⚠️ [ সতর্কতা ]\nএই আইডিটার সব ইনফরমেশন বাদল ভাইয়ের ইনবক্সে অলরেডি পাঠিয়ে দেওয়া হয়েছে। এখন আইডিটা ফেরত পেতে চাইলে আপনার গার্লফ্রেন্ডকে বাদল ভাইয়ের হাতে তুলে দিন, নাহলে আপনার পার্সোনাল মেসেজ এবং স্ক্রিনশট সব ভাইরাল করে দেওয়া হবে। ধন্যবাদ!\n\nBADOL-BOT-V5`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => {
      fs.unlink(pathImg).catch(() => {});
    }, messageID);

  } catch (err) {
    console.log("[HACK CMD ERROR]", err);
    await api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage("❌ হ্যাক করতে গিয়ে এরর খাইছি, আবার ট্রাই কর।", threadID, messageID);
  }
};
