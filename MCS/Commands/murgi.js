const path = require("path");
const fs = require("fs-extra");
const axios = require("axios");

function box(content) {
  return `╔═ 𝄞⋆⃝🧚‍𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-𝐕𝟓🧚‍⋆⃝𝄞 ═╗\n${content}\n╚═══════════════════╝`;
}

async function sendWithImage(api, threadID, content) {
  try {
    const imgURL = "https://drive.google.com/uc?export=download&id=1qcXgfUvEqTG22pIfGUonv8L_OczmUy-J";
    const response = await axios.get(imgURL, { responseType: "stream" });
    return api.sendMessage({
      body: content,
      attachment: response.data
    }, threadID);
  } catch (e) {
    return api.sendMessage(content, threadID);
  }
}

function loadMessages() {
  try {
    const jsonPath = path.join(__dirname, "B4D9L", "murgi.json");
    if (!fs.existsSync(jsonPath)) {
      return ["ERROR: B4D9L/murgi.json not found"];
    }
    const data = fs.readFileSync(jsonPath, "utf-8");
    const msgs = JSON.parse(data);
    return Array.isArray(msgs) && msgs.length > 0? msgs : ["ERROR: JSON file is empty"];
  } catch (e) {
    return [`ERROR: ${e.message}`];
  }
}

module.exports = {
  config: {
    name: "murgi",
    aliases: ["cudi"],
    credit: "MOHAMMAD BADOL",
    prefix: true,
    role: 1,
    cooldown: 3,
    description: "Loop messages from B4D9L/murgi.json"
  },

  onStartBadol: async function(api, event, args) {
    const { threadID, senderID, messageID, mentions, messageReply } = event;
    const action = args[0]?.toLowerCase();

    const MURGI_MESSAGES = loadMessages();

    if (action === "reload") {
      const newMsgs = loadMessages();
      return sendWithImage(api, threadID, box(`┃ RELOADED\n┃ Total: ${newMsgs.length} msgs`));
    }

    if (action === "off" || action === "stop") {
      const targetKey = `murgi_${threadID}`;
      if (global.murgiLoop && global.murgiLoop[targetKey]) {
        clearInterval(global.murgiLoop[targetKey].interval);
        delete global.murgiLoop[targetKey];
        return sendWithImage(api, threadID, box("┃ STOPPED\n┃ Loop deactivated"));
      } else {
        return sendWithImage(api, threadID, box("┃ ERROR\n┃ No active loop found"));
      }
    }

    let targetID, targetName;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      targetName = mentions[targetID].replace("@", "");
    } else if (messageReply) {
      targetID = messageReply.senderID;
      const info = await api.getUserInfo(targetID);
      targetName = info[targetID].name;
    } else {
      return sendWithImage(api, threadID, box(`┃ SYNTAX\n┃ /murgi @mention\n┃ /murgi [reply]\n┃ /murgi off\n┃ /murgi reload\n┃ Total: ${MURGI_MESSAGES.length} msgs`));
    }

    if (targetID === api.getCurrentUserID()) {
      return sendWithImage(api, threadID, box("┃ ERROR\n┃ Invalid target"));
    }

    const targetKey = `murgi_${threadID}`;

    if (global.murgiLoop && global.murgiLoop[targetKey]) {
      return sendWithImage(api, threadID, box("┃ RUNNING\n┃ Use /murgi off first"));
    }

    if (!global.murgiLoop) global.murgiLoop = {};

    await sendWithImage(api, threadID, box(`┃ STARTED\n┃ Target: ${targetName}\n┃ Total: ${MURGI_MESSAGES.length} msgs\n┃ Stop: /murgi off`));

    let index = 0;

    const interval = setInterval(() => {
      const msg = MURGI_MESSAGES[index];
      api.sendMessage({
        body: `@${targetName} ${msg}`,
        mentions: [{ tag: `@${targetName}`, id: targetID }]
      }, threadID);

      index++;
      if (index >= MURGI_MESSAGES.length) {
        index = 0;
      }
    }, 1000);

    global.murgiLoop[targetKey] = {
      interval,
      targetID,
      targetName,
      adminID: senderID,
      index
    };
  }
};