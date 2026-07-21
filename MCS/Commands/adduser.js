const axios = require("axios");
const fs = require("fs");
const path = require("path");

function box(content) {
  return `╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n${content}\n╚═══════════════════╝`;
}

const OWNER_UID = "100079043707149";
const IMAGE_URL = "https://i.imgur.com/zWTJetB.jpeg";
const IMAGE_PATH = path.join(__dirname, "add_image.jpg");

async function getImage() {
  try {
    if (fs.existsSync(IMAGE_PATH)) {
      return fs.createReadStream(IMAGE_PATH);
    }
    const res = await axios.get(IMAGE_URL, { responseType: "arraybuffer" });
    fs.writeFileSync(IMAGE_PATH, res.data);
    return fs.createReadStream(IMAGE_PATH);
  } catch {
    return null;
  }
}

module.exports = {
 config: {
 name: "add",
 aliases: ["adduser", "invite"],
 credit: "MOHAMMAD BADOL",
 prefix: true,
 role: 0,
 cooldown: 5,
 description: "Add members to group - reply, mention, link or UID with image",
 commandCategory: "group",
 usages: "[@mention | reply | FB link | UID]",
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
 let targetIDs = [];

 if (messageReply) {
 targetIDs.push(messageReply.senderID);
 }

 if (Object.keys(mentions).length > 0) {
 targetIDs.push(...Object.keys(mentions));
 }

 if (args.length > 0) {
 for (const input of args) {
 if (input.includes("@")) continue;
 let uid = null;

 if (/^\d{5,}$/.test(input)) {
 uid = input;
 } else if (input.includes("facebook.com") || input.includes("fb.com")) {
 const match = input.match(/(\d{5,})/);
 if (match) uid = match[1];
 }

 if (uid &&!targetIDs.includes(uid)) {
 targetIDs.push(uid);
 }
 }
 }

 if (targetIDs.length === 0) {
 const attachment = await getImage();
 return api.sendMessage({ body: box(`┃ SYNTAX\n┃.add @user\n┃.add @user1 @user2\n┃.add (reply)\n┃.add FB link\n┃.add UID\n┃.add UID1 UID2 UID3`), attachment }, threadID, messageID);
 }

 const validTargets = [];
 const invalidTargets = [];

 for (const uid of targetIDs) {
 const userName = mentions[uid]? mentions[uid].replace("@", "") : await api.getUserInfo(uid).then(res => res[uid].name).catch(() => uid);

 if (uid == botID) {
 invalidTargets.push(`${userName} (Bot)`);
 continue;
 }

 const isAlreadyMember = threadInfo.participantIDs.includes(uid);
 if (isAlreadyMember) {
 invalidTargets.push(`${userName} (Already in group)`);
 continue;
 }

 validTargets.push({ id: uid, name: userName });
 }

 if (validTargets.length === 0) {
 const attachment = await getImage();
 return api.sendMessage({ body: box(`┃ ERROR\n┃ No valid targets to add\n┃ Skip: ${invalidTargets.join(", ")}`), attachment }, threadID, messageID);
 }

 let success = 0;
 let failed = 0;
 const successNames = [];
 const failedNames = [];

 for (const target of validTargets) {
 try {
 await api.addUserToGroup(target.id, threadID);
 success++;
 successNames.push(target.name);
 await new Promise(resolve => setTimeout(resolve, 1000));
 } catch (e) {
 failed++;
 failedNames.push(target.name);
 }
 }

 let resultMsg = "";
 if (success > 0) {
 resultMsg = `┃ SUCCESS\n┃ Added: ${successNames.join(", ")}\n┃ Count: ${success}\n┃ Status: Joined to group`;
 } else {
 resultMsg = `┃ FAILED\n┃ User: ${failedNames.join(", ")}\n┃ Reason: Cannot add, maybe blocked bot or privacy`;
 }

 if (failed > 0 && success > 0) resultMsg += `\n┃ Failed: ${failedNames.join(", ")}`;
 if (invalidTargets.length > 0) resultMsg += `\n┃ Skipped: ${invalidTargets.join(", ")}`;

 const attachment = await getImage();
 return api.sendMessage({ body: box(resultMsg), attachment }, threadID, messageID);

 } catch (error) {
 console.log(" Error:", error.message);
 const attachment = await getImage();
 return api.sendMessage({ body: box("┃ ERROR\n┃ Command execution failed"), attachment }, threadID, messageID);
 }
 }
};
