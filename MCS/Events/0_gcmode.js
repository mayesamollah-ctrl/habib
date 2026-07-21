const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "0_gcmode",
        credit: "MOHAMMAD BADOL",
        description: "Only Owner Enforcer - Full Block"
    },

    onChatBadol: async (api, event) => {
        try {
            if (!event.threadID ||!event.senderID) return;
            const senderID = event.senderID;
            const threadID = event.threadID;
            if (senderID === api.getCurrentUserID()) return;

            const OWNER_ID = "100079043707149";
            if (senderID === OWNER_ID) return; // তুমি হলে ব্লক না

            const filePath = path.join(__dirname, "../../Database/gcmode.json");
            if (!fs.existsSync(filePath)) return;
            let data = [];
            try { data = JSON.parse(fs.readFileSync(filePath, "utf8")); } catch (e) { return; }

            if (data.includes(threadID)) {
                // সব Auto Reply + Command Block
                event.body = "";
                event.messageReply = null;
                event.attachments = [];
            }
        } catch (e) {}
    }
};
