const axios = require("axios");
const fs = require("fs");
const path = require("path");

function box(content) {
  return `╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n${content}\n╚═══════════════════╝`;
}

const OWNER_UID = "61591265887748";
const IMAGE_ID = "1eIphzyc0_wpv9UYldmMp0t_nDX_CJB8w";
const IMAGE_URL = `https://drive.google.com/uc?export=view&id=${IMAGE_ID}`;
const IMAGE_PATH = path.join(__dirname, "../../cache/kick_image.jpg");

async function getImage() {
  try {
    if (fs.existsSync(IMAGE_PATH)) {
      return fs.createReadStream(IMAGE_PATH);
    }
    const dir = path.dirname(IMAGE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const res = await axios.get(IMAGE_URL, { responseType: "arraybuffer", timeout: 15000 });
    fs.writeFileSync(IMAGE_PATH, Buffer.from(res.data, "binary"));
    return fs.createReadStream(IMAGE_PATH);
  } catch {
    return null;
  }
}

module.exports = {
 config: {
 name: "kick",
 aliases: ["remove", "band"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 0,
 cooldown: 5,
 description: "Remove members from group with custom notice",
 commandCategory: "group",
 usages: "[@mention reason | reply reason | all reason]",
 },

 onStartBadol: async function (api, event, args) {
 const { threadID, messageID, senderID, mentions, messageReply } = event;

 if (senderID!== OWNER_UID) {
 const attachment = await getImage();
 return api.sendMessage({ body: box("┃ ERROR\n┃ Only owner can use this"), attachment }, threadID, messageID);
 }

 try {
 const threadInfo = await api.getThreadInfo(threadID);

 if (!threadInfo.isGroup) {
 const attachment = await getImage();
 return api.sendMessage({ body: box("┃ ERROR\n┃ This command only works in groups"), attachment }, threadID, messageID);
 }

 const botID = api.getCurrentUserID();
 const groupName = threadInfo.threadName || "this group";

 let customReason = args.filter(arg =>!arg.includes("@")).join(" ").trim();
 if (!customReason) customReason = "You have been removed from the group by admin";

 if (args[0] && args[0].toLowerCase() === "all") {
 const membersToKick = threadInfo.participantIDs.filter(uid => {
 const isAdminMember = threadInfo.adminIDs.some(admin => admin.id == uid);
 return uid!= botID &&!isAdminMember;
 });

 if (membersToKick.length === 0) {
 const attachment = await getImage();
 return api.sendMessage({ body: box("┃ ERROR\n┃ No non-admin members to kick"), attachment }, threadID, messageID);
 }

 let success = 0;
 let failed = 0;
 let dmSent = 0;

 for (const uid of membersToKick) {
 try {
 try {
 await api.sendMessage(box(`┃ KICKED NOTICE\n┃ Group: ${groupName}\n┃ Reason: ${customReason}\n┃ \n┃ You have been removed from the group`), uid);
 dmSent++;
 } catch {}

 await new Promise(resolve => setTimeout(resolve, 500));
 await api.removeUserFromGroup(uid, threadID);
 success++;
 await new Promise(resolve => setTimeout(resolve, 1000));
 } catch {
 failed++;
 }
 }

 const attachment = await getImage();
 return api.sendMessage({ body: box(`┃ COMPLETE\n┃ Success: ${success}\n┃ DM Sent: ${dmSent}\n┃ Failed: ${failed}`), attachment }, threadID, messageID);
 }

 let targetIDs = [];

 if (messageReply) {
 targetIDs.push(messageReply.senderID);
 } else if (Object.keys(mentions).length > 0) {
 targetIDs = Object.keys(mentions);
 } else {
 const attachment = await getImage();
 return api.sendMessage({ body: box(`┃ SYNTAX\n┃.kick @user reason\n┃.kick @user1 @user2 reason\n┃.kick (reply) reason\n┃.kick all reason`), attachment }, threadID, messageID);
 }

 const validTargets = [];
 const invalidTargets = [];

 for (const uid of targetIDs) {
 const userName = mentions[uid]? mentions[uid].replace("@", "") : await api.getUserInfo(uid).then(res => res[uid].name).catch(() => uid);

 if (uid == botID) {
 invalidTargets.push(`${userName} (Bot)`);
 continue;
 }
 if (uid == senderID) {
 invalidTargets.push(`${userName} (Self)`);
 continue;
 }
 const isTargetAdmin = threadInfo.adminIDs.some(admin => admin.id == uid);
 if (isTargetAdmin) {
 invalidTargets.push(`${userName} (Admin)`);
 continue;
 }
 validTargets.push({ id: uid, name: userName });
 }

 if (validTargets.length === 0) {
 const attachment = await getImage();
 return api.sendMessage({ body: box(`┃ ERROR\n┃ No valid targets to kick\n┃ Skip: ${invalidTargets.join(", ")}`), attachment }, threadID, messageID);
 }

 let success = 0;
 let failed = 0;
 let dmSent = 0;
 const successNames = [];
 const failedNames = [];

 for (const target of validTargets) {
 try {
 try {
 await api.sendMessage(box(`┃ KICKED NOTICE\n┃ Group: ${groupName}\n┃ Reason: ${customReason}\n┃ \n┃ You have been removed from the group`), target.id);
 dmSent++;
 } catch {}

 await new Promise(resolve => setTimeout(resolve, 500));
 await api.removeUserFromGroup(target.id, threadID);
 success++;
 successNames.push(target.name);
 await new Promise(resolve => setTimeout(resolve, 1000));
 } catch {
 failed++;
 failedNames.push(target.name);
 }
 }

 let resultMsg = `┃ COMPLETE\n┃ Success: ${success}\n┃ DM Sent: ${dmSent}`;
 if (successNames.length > 0) resultMsg += `\n┃ Kicked: ${successNames.slice(0, 5).join(", ")}${successNames.length > 5? '...' : ''}`;
 if (failed > 0) resultMsg += `\n┃ Failed: ${failed}`;
 if (invalidTargets.length > 0) resultMsg += `\n┃ Skipped: ${invalidTargets.length}`;

 const attachment = await getImage();
 return api.sendMessage({ body: box(resultMsg), attachment }, threadID, messageID);

 } catch (error) {
 console.log(" Error:", error.message);
 const attachment = await getImage();
 return api.sendMessage({ body: box("┃ ERROR\n┃ Command execution failed"), attachment }, threadID, messageID);
 }
 }
};