const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "userck",
    aliases: ["ghosts", "inactive"],
    description: "List inactive members who haven't messaged in 7 days.",
    usage: "",
    credit: "MOHAMMAD BADOL",
    role: 1,
    prefix: true,
    cooldown: 10
  },
  
  onLoadBadol: async function() {
    const DATA_DIR = path.join(__dirname, "B4D9L");
    const DATA_PATH = path.join(DATA_DIR, "userActivity.json");
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    try {
      if (fs.existsSync(DATA_PATH)) {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
        global.userLastActive = new Map(Object.entries(data));
      } else {
        global.userLastActive = new Map();
        fs.writeFileSync(DATA_PATH, "{}", "utf8");
      }
    } catch (e) {
      global.userLastActive = new Map();
    }
  },
  
  onStartBadol: async function(api, event, args) {
    const { threadID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const { participantIDs } = threadInfo;
    const botID = api.getCurrentUserID();
    
    const userMap = new Map();
    threadInfo.userInfo.forEach(user => {
      userMap.set(user.id, user.name || "Facebook User");
    });
    
    if (!global.userLastActive) global.userLastActive = new Map();
    
    const now = Date.now();
    const dayLimit = 7 * 24 * 60 * 60 * 1000;
    let inactiveUsers = [];
    let ghostUsers = [];
    
    for (const [id] of global.userLastActive) {
      if (!participantIDs.includes(id)) {
        global.userLastActive.delete(id);
      }
    }
    
    for (const id of participantIDs) {
      if (id == botID) continue;
      
      const lastActive = global.userLastActive.get(id);
      const name = userMap.get(id) || "Unknown User";
      
      if (!lastActive) {
        ghostUsers.push(name);
      }
      else if (now - lastActive > dayLimit) {
        inactiveUsers.push({
          name,
          days: Math.floor((now - lastActive) / (24 * 60 * 60 * 1000))
        });
      }
    }
    
    let msg = `╭───❖ BADOL-BOT-V5 ❖───╮\n\n`;
    
    if (ghostUsers.length === 0 && inactiveUsers.length === 0) {
      msg += `✅ Everyone is active!`;
    } else {
      msg += `📊 **Group Activity Report**\n`;
      msg += `👥 Total Members: ${participantIDs.length - 1}\n\n`;
      
      if (ghostUsers.length > 0) {
        msg += `👻 **Ghost Members** [Never messaged]:\n\n`;
        ghostUsers.slice(0, 250).forEach((name, i) => msg += `➤ ${i + 1}. ${name}\n`);
        if (ghostUsers.length > 250) msg += `... and ${ghostUsers.length - 250} more\n`;
        msg += `\n`;
      }
      
      if (inactiveUsers.length > 0) {
        msg += `💤 **Inactive 7+ Days**:\n`;
        inactiveUsers.slice(0, 250).forEach((u, i) => msg += `➤ ${i + 1}. ${u.name} - ${u.days} days ago\n`);
        if (inactiveUsers.length > 250) msg += `... and ${inactiveUsers.length - 250} more\n`;
        msg += `\n`;
      }
      
      msg += `📉 Total Inactive: ${ghostUsers.length + inactiveUsers.length}`;
    }
    
    msg += `\n\n╰───────────────╯`;
    
    const imgURL = "https://drive.google.com/uc?export=download&id=1KW4OXWnSt8SifPXaOP6nGQ2BwJaOi2g0";
    let attachment = null;
    
    try {
      const res = await axios.get(imgURL, { responseType: "stream", timeout: 10000 });
      attachment = res.data;
    } catch (e) {
      console.log("Image load failed:", e.message);
    }
    
    const sendMsg = { body: msg };
    if (attachment) sendMsg.attachment = attachment;
    
    if (msg.length > 19000) {
      const chunks = msg.match(/.{1,19000}/gs);
      for (let i = 0; i < chunks.length; i++) {
        const chunkMsg = i === 0 ? { body: chunks[i], attachment } : { body: chunks[i] };
        await api.sendMessage(chunkMsg, threadID);
        await new Promise(r => setTimeout(r, 1000));
      }
    } else {
      api.sendMessage(sendMsg, threadID);
    }
    
    this.saveData();
  },
  
  onChatBadol: async function(api, event) {
    if (!global.userLastActive) global.userLastActive = new Map();
    if (event.type === "message" && event.senderID !== api.getCurrentUserID()) {
      global.userLastActive.set(event.senderID, Date.now());
      this.saveData();
    }
  },
  
  saveData: function() {
    const DATA_DIR = path.join(__dirname, "B4D9L");
    const DATA_PATH = path.join(DATA_DIR, "userActivity.json");
    
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    try {
      const obj = Object.fromEntries(global.userLastActive);
      fs.writeFileSync(DATA_PATH, JSON.stringify(obj), "utf8");
    } catch (e) {}
  }
};