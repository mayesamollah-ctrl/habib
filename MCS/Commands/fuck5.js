const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { Jimp } = require("jimp");

module.exports.config = {
  name: "fuck5",
  version: "1.0.8",
  role: 0,
  credit: "MOHAMMAD BADOL",
  description: "fuck you",
  prefix: true,
  category: "fun",
  aliases: ["fk5"],
  usages: "@mention & reply",
  cooldown: 5
};

async function circle(image) {
  const img = await Jimp.read(image);
  img.circle();
  return await img.getBuffer("image/png");
}

async function makeImage({ one, two }) {
  const bgUrl = "https://drive.google.com/uc?id=1LOAwoOE110QtWQF8k8iFJpaeBiDEs5p7";
  const pathImg = path.join(__dirname, `fuck_${one}_${two}_${Date.now()}.png`);
  const avatarOnePath = path.join(__dirname, `avt_${one}.png`);
  const avatarTwoPath = path.join(__dirname, `avt_${two}.png`);

  const getAvatar = async (uid, savePath) => {
    try {
      const res = await axios.get(`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer", timeout: 10000 });
      await fs.writeFile(savePath, res.data);
    } catch {
      const res = await axios.get(`https://graph.facebook.com/${uid}/picture?type=large`, { responseType: "arraybuffer" });
      await fs.writeFile(savePath, res.data);
    }
  };

  await Promise.all([getAvatar(one, avatarOnePath), getAvatar(two, avatarTwoPath)]);

  const bgRes = await axios.get(bgUrl, { responseType: 'arraybuffer' });
  const bg = await Jimp.read(bgRes.data);
  const circOne = await Jimp.read(await circle(avatarOnePath));
  const circTwo = await Jimp.read(await circle(avatarTwoPath));

  bg.composite(circOne.resize({ w: 180, h: 180 }), 330, 150);
  bg.composite(circTwo.resize({ w: 180, h: 180 }), 585, 420);

  const finalImg = await bg.getBuffer("image/png");
  await fs.writeFile(pathImg, finalImg);
  fs.unlink(avatarOnePath).catch(() => {});
  fs.unlink(avatarTwoPath).catch(() => {});
  return pathImg;
}

module.exports.onStartBadol = async function (api, event, args) {
  const { threadID, messageID, senderID, messageReply } = event;
  
  api.setMessageReaction("⏳", messageID, () => {}, true);

  const targetID = Object.keys(event.mentions)[0] || (messageReply ? messageReply.senderID : null);
  
  if (targetID === "61591265887748") {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("『 ❌ 』এই আইডির ওপর এই কমান্ডটি চালানো নিষেধ!", threadID, messageID);
  }

  if (!targetID) {
    api.setMessageReaction("⚠️", messageID, () => {}, true);
    return api.sendMessage("『 ⚠️ 』কাকে ফাক করবা মেনশন দাও!", threadID, messageID);
  }

  if (senderID === targetID) {
    api.setMessageReaction("😏", messageID, () => {}, true);
    return api.sendMessage("『 😏 』নিজের সাথে এই কাজ করা কি ঠিক? অন্য কাউকে খুঁজুন!", threadID, messageID);
  }

  const messages = [
    "তোমাকে এই সিস্টেমে লাগাতে চাই প্রিও😁",
    "তোমাকে এই ভাবে করতে চাই 🤧",
    "তোমাকে ঠিক এভাবে চু*দ*বো😈",
    "তোমার জন্য বিশেষ আয়োজন করা হয়েছে 🔥",
    "একে তো আজ ছাড়ছি না 💦"
  ];
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];

  try {
    const imgPath = await makeImage({ one: senderID, two: targetID });
    api.setMessageReaction("✅", messageID, () => {}, true);
    
    return api.sendMessage(
      {
        body: `┌───────────────┐\n   ${randomMsg}\n└───────────────┘\n✨ BADOL-BOT-V5`,
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlink(imgPath).catch(() => {}),
      messageID
    );
  } catch (err) {
    api.setMessageReaction("⚠️", messageID, () => {}, true);
    return api.sendMessage(`『 ❌ 』এরর: ${err.message}`, threadID, messageID);
  }
};
