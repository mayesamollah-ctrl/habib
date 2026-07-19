const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
 name: "adminmention",
 version: "4.2.0",
 role: 0,
 credit: "MOHAMMAD BADOL",
 description: "Admin Mention",
 category: "system",
 prefix: false,
 cooldown: 5
};

const adminIDs = [
 "61591265887748",
 "61590785637035"
];

const IMG_URL = "https://drive.google.com/uc?export=download&id=1Yq4UpAPvdN4s1RFWZrl3x-HMm6u7idyV";

module.exports.onChatBadol = async function (api, event) {
 const { threadID, messageID, senderID, mentions } = event;
 
 if (senderID == api.getCurrentUserID()) return;
 if (!mentions || Object.keys(mentions).length === 0) return;

 const mentionedAdmin = Object.keys(mentions).find(id => adminIDs.includes(id));
 if (!mentionedAdmin) return;

 const funnyReplies = [
 "┌───────────────┐\n│ 🤫 BUSY 🤫 │\n└───────────────┘\nওনি এখন বিজি আছেন\nঅপ্রয়োজনে ডাকবেন না",
 "┌───────────────┐\n│ 😴 SLEEP 😴 │\n└───────────────┘\nবস এখন ঘুমোচ্ছেন\nপরে ট্রাই করেন",
 "┌───────────────┐\n│ 🍔 EATING 🍔 │\n└───────────────┘\nবস এখন নাস্তায় বিজি\nডিস্টার্ব করবেন না",
 "┌───────────────┐\n│ 🚀 SPACE 🚀 │\n└───────────────┘\nবস মঙ্গল গ্রহে গেছেন\nঅভিযানে বিজি",
 "┌───────────────┐\n│ 💸 BKASH 💸 │\n└───────────────┘\nবসকে ডাকতে ১ টাকা\nবিকাশ করুন আগে",
 "┌───────────────┐\n│ 🚫 BLOCK 🚫 │\n└───────────────┘\nবেশি ডাকলে ব্লক\nসাবধান হয়ে যান",
 "┌───────────────┐\n│ 💕 LOVE 💕 │\n└───────────────┘\nবস GF এর সাথে বিজি\nডিস্টার্ব করবেন না",
 "┌───────────────┐\n│ 🛁 BATH 🛁 │\n└───────────────┘\nবস বাথরুমে গান গায়\nবের হলে বলবোনি",
 "┌───────────────┐\n│ 😘 KISS 😘 │\n└───────────────┘\nঅ্যাডমিন ছুটিতে\nআমাকে একটা কিস দেন",
 "┌───────────────┐\n│ 😎 CUTE 😎 │\n└───────────────┘\nবস কিউটদের সাথে\nচ্যাট করছেন এখন",
 "┌───────────────┐\n│ 📄 QUEUE 📄 │\n└───────────────┘\nআপনার মেনশন জমা\nসিরিয়াল আসলে পাবেন",
 "┌───────────────┐\n│ 🧐 POWER 🧐 │\n└───────────────┘\nআইডি যার পাওয়ার তার\nমেনশন দিলেই কি হয়?",
 "┌───────────────┐\n│ 🎮 GAME 🎮 │\n└───────────────┘\nবস র‍্যাঙ্ক ম্যাচ খেলছে\nএখন ডাকবেন না",
 "┌───────────────┐\n│ 💼 WORK 💼 │\n└───────────────┘\nবস অফিস মিটিং এ\nখুব ইম্পর্ট্যান্ট কাজ",
 "┌───────────────┐\n│ 🛒 SHOP 🛒 │\n└───────────────┘\nবস বাজারে গেছেন\n১ ঘন্টা পর ডাকুন",
 "┌───────────────┐\n│ 📱 NET 📱 │\n└───────────────┘\nবসের নেট স্লো\nমেসেজ যাচ্ছে না",
 "┌───────────────┐\n│ 🔋 DEAD 🔋 │\n└───────────────┘\nবসের ফোন বন্ধ\nচার্জ শেষ",
 "┌───────────────┐\n│ 🎬 MOVIE 🎬 │\n└───────────────┘\nবস মুভি দেখতেছে\nস্পয়েল করবেন না",
 "┌───────────────┐\n│ 🏆 PUBG 🏆 │\n└───────────────┘\nবস পাবজি লবিতে\nর‍্যাঙ্ক পুশ করছে",
 "┌───────────────┐\n│ 💤 AFK 💤 │\n└───────────────┘\nবস এখন AFK\nমেসেজ রেখে যান",
 "┌───────────────┐\n│ 👻 GHOST 👻 │\n└───────────────┘\nবস ভূত হয়ে গেছে\nইনভিজিবল মোড অন",
 "┌───────────────┐\n│ 🎓 STUDY 🎓 │\n└───────────────┘\nবস পড়াশোনা করছে\nকাল পরীক্ষা",
 "┌───────────────┐\n│ 🛠️ FIX 🛠️ │\n└───────────────┘\nবস বাগ ফিক্স করছে\nকোডিং চলতেছে",
 "┌───────────────┐\n│ 🌙 PRAY 🌙 │\n└───────────────┘\nবস নামাজ পড়তেছে\nএখন ডিস্টার্ব না",
 "┌───────────────┐\n│ 🤡 JOKE 🤡 │\n└───────────────┘\nফালতু মেনশন দিয়া\nসময় নষ্ট করবেন না",
 "┌───────────────┐\n│ 💀 OFFLINE 💀 │\n└───────────────┘\nবস বর্তমানে কবরে\nশান্তিতে ঘুমাচ্ছে",
 "┌───────────────┐\n│ 💸 BROKE 💸 │\n└───────────────┘\nবসের পকেটে টাকা নাই\nতাই কথা বলছে না",
 "┌───────────────┐\n│ 📵 DO NOT DISTURB 📵 │\n└───────────────┘\nডিএনডি মোড অন\nপরের বছর কথা হবে",
 "┌───────────────┐\n│ ✈️ TOUR ✈️ │\n└───────────────┘\nবস কক্সবাজার গেছে\nঘুরে এসে রিপ্লাই দিব",
 "┌───────────────┐\n│ 🤫 SHH 🤫 │\n└───────────────┘\nবস সিক্রেট মিশনে\nপ্লিজ ডিস্টার্ব করবেন না"
 ];

 const selectedMsg = funnyReplies[Math.floor(Math.random() * funnyReplies.length)];
 const randomMsg = `${selectedMsg}\n\n[ BADOL-BOT-V5 ]`;
 
 const cacheDir = path.join(__dirname, "../../cache");
 if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
 
 const imgPath = path.join(cacheDir, `admin_mention_${Date.now()}.jpg`);
 
 try {
 const imgData = await axios.get(IMG_URL, { 
 responseType: 'arraybuffer',
 timeout: 5000,
 headers: { 'User-Agent': 'Mozilla/5.0' }
 }).then(res => res.data);
 
 fs.writeFileSync(imgPath, imgData);
 
 await api.sendMessage({
 body: randomMsg,
 attachment: fs.createReadStream(imgPath)
 }, threadID, messageID);
 
 setTimeout(() => {
 if (fs.existsSync(imgPath)) {
 try { fs.unlinkSync(imgPath); } catch (e) {}
 }
 }, 5000);
 
 } catch (e) {
 await api.sendMessage(randomMsg, threadID, messageID);
 }
};

module.exports.onStartBadol = async function () {};