const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BOT_NAME = "BADOL-BOT-V5";
const DRIVE_LINK = "https://drive.google.com/uc?export=download&id=1ITONZqIZdgshuwVC1Sgk1KservMD9lMT";
const NEW_IMAGE_ID = "1n60vlteNvhq5neJv0iiLbbMDRQbZurhE";
const NEW_IMAGE_URL = `https://drive.google.com/uc?export=view&id=${NEW_IMAGE_ID}`;
const NEW_IMAGE_PATH = path.join(__dirname, "../../cache/approve_menu.jpg");

function box(title, content) {
    return `╔═[ ${BOT_NAME} ]═╗\n║ ❯ ${title}\n╚════════════════╝\n${content}\n╚════════════════╝`;
}

async function getMenuImage() {
    try {
        if (fs.existsSync(NEW_IMAGE_PATH)) {
            return fs.createReadStream(NEW_IMAGE_PATH);
        }
        const dir = path.dirname(NEW_IMAGE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const res = await axios.get(NEW_IMAGE_URL, { responseType: "arraybuffer", timeout: 15000 });
        fs.writeFileSync(NEW_IMAGE_PATH, Buffer.from(res.data, "binary"));
        return fs.createReadStream(NEW_IMAGE_PATH);
    } catch {
        return null;
    }
}

const saveConfigAndSync = (configPath, config) => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
    if (typeof global.reloadConfig === "function") global.reloadConfig();
};

module.exports = {
    config: {
        name: "approve",
        version: "5.3.0",
        credit: "MOHAMMAD BADOL",
        role: 1,
        prefix: true,
        aliases: ["apv"],
        cooldown: 3
    },

    onStartBadol: async (api, event, args) => {
        const configPath = path.resolve(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        if (!config.APPROVAL_SYSTEM.APPROVED_THREADS) config.APPROVAL_SYSTEM.APPROVED_THREADS = [];
        if (!config.APPROVAL_SYSTEM.PENDING_THREADS) config.APPROVAL_SYSTEM.PENDING_THREADS = [];

        const action = args[0]?.toLowerCase();

        if (action === "help") {
            const helpMsg = `• /apv start : Status\n• /apv list : Approved\n• /apv scan : Sync Threads\n• /apv clean : Remove Dead Groups\n• /apv remove <id> : Remove\n• /apv <id> : Direct Approve`;
            const attachment = await getMenuImage();
            return api.sendMessage({ body: box("HELP MENU", helpMsg), attachment }, event.threadID);
        }

        if (action === "start") {
            const content = `• Bot: ${BOT_NAME}\n• Approved: ${config.APPROVAL_SYSTEM.APPROVED_THREADS.length}\n• Pending: ${config.APPROVAL_SYSTEM.PENDING_THREADS.length}`;
            const attachment = await getMenuImage();
            return api.sendMessage({ body: box("LIVE DASHBOARD", content), attachment }, event.threadID);
        }

        if (action === "clean") {
            let removed = 0;
            let validApproved = [];

            for (let id of config.APPROVAL_SYSTEM.APPROVED_THREADS) {
                let info = await api.getThreadInfo(id).catch(() => null);
                if (info) {
                    validApproved.push(id);
                } else {
                    removed++;
                }
            }

            config.APPROVAL_SYSTEM.APPROVED_THREADS = validApproved;

            let validPending = [];
            for (let g of config.APPROVAL_SYSTEM.PENDING_THREADS) {
                let info = await api.getThreadInfo(g.id).catch(() => null);
                if (info) {
                    validPending.push(g);
                } else {
                    removed++;
                }
            }
            config.APPROVAL_SYSTEM.PENDING_THREADS = validPending;

            saveConfigAndSync(configPath, config);
            const attachment = await getMenuImage();
            return api.sendMessage({ body: box("CLEAN SUCCESS", `Removed ${removed} dead groups.\nActive: ${validApproved.length}`), attachment }, event.threadID);
        }

        if (action === "list") {
            const list = config.APPROVAL_SYSTEM.APPROVED_THREADS;
            if (list.length === 0) {
                const attachment = await getMenuImage();
                return api.sendMessage({ body: box("LIST", "No groups found."), attachment }, event.threadID);
            }

            let msg = "";
            let validList = [];

            for (let i = 0; i < list.length; i++) {
                let info = await api.getThreadInfo(list[i]).catch(() => null);
                if (info) {
                    validList.push(list[i]);
                    msg += `${validList.length}. ${info?.threadName || info?.name || "Unnamed Group"}\n`;
                }
            }

            if (validList.length!== list.length) {
                config.APPROVAL_SYSTEM.APPROVED_THREADS = validList;
                saveConfigAndSync(configPath, config);
            }

            if (validList.length === 0) {
                const attachment = await getMenuImage();
                return api.sendMessage({ body: box("LIST", "No active groups found."), attachment }, event.threadID);
            }
            const attachment = await getMenuImage();
            return api.sendMessage({ body: box("APPROVED LIST", msg.trim()), attachment }, event.threadID);
        }

        if (action === "remove") {
            const id = args[1];
            if (!id) return api.sendMessage("Provide ID", event.threadID);
            config.APPROVAL_SYSTEM.APPROVED_THREADS = config.APPROVAL_SYSTEM.APPROVED_THREADS.filter(i => i!== id);
            saveConfigAndSync(configPath, config);
            const attachment = await getMenuImage();
            return api.sendMessage({ body: box("SUCCESS", "Removed successfully."), attachment }, event.threadID);
        }

        if (action === "scan") {
            const threads = await api.getThreadList(50, null, ["INBOX"]);
            let count = 0;
            for (const t of threads.filter(t => t.isGroup)) {
                if (!config.APPROVAL_SYSTEM.APPROVED_THREADS.includes(t.threadID) &&!config.APPROVAL_SYSTEM.PENDING_THREADS.some(p => p.id === t.threadID)) {
                    config.APPROVAL_SYSTEM.PENDING_THREADS.push({ id: t.threadID, name: t.threadName || t.name || "Unnamed Group" });
                    count++;
                }
            }
            saveConfigAndSync(configPath, config);
            const attachment = await getMenuImage();
            return api.sendMessage({ body: box("SCAN COMPLETE", `Found ${count} new groups.`), attachment }, event.threadID);
        }

        if (!action) {
            let validPending = [];
            for (let g of config.APPROVAL_SYSTEM.PENDING_THREADS) {
                let info = await api.getThreadInfo(g.id).catch(() => null);
                if (info) validPending.push(g);
            }

            if (validPending.length!== config.APPROVAL_SYSTEM.PENDING_THREADS.length) {
                config.APPROVAL_SYSTEM.PENDING_THREADS = validPending;
                saveConfigAndSync(configPath, config);
            }

            if (!validPending.length) {
                const attachment = await getMenuImage();
                return api.sendMessage({ body: box("PENDING", "No requests."), attachment }, event.threadID);
            }

            let list = "";
            for (let i = 0; i < validPending.length; i++) {
                let g = validPending[i];
                let info = await api.getThreadInfo(g.id).catch(() => null);
                g.name = info?.threadName || info?.name || g.name || "Unnamed Group";
                list += `${i + 1}. ${g.name}\n`;
            }
            saveConfigAndSync(configPath, config);

            const attachment = await getMenuImage();
            const info = await api.sendMessage({ body: box("PENDING LIST", list + "\nReply number to approve."), attachment }, event.threadID);
            global.msgCache.set(info.messageID, { commandName: "approve" });
        }
    },

    onReplyBadol: async (api, event, cache) => {
        if (!cache || cache.commandName!== "approve") return;
        const configPath = path.resolve(__dirname, "../../config.json");
        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        const index = parseInt(event.body) - 1;

        if (isNaN(index) ||!config.APPROVAL_SYSTEM.PENDING_THREADS[index]) {
            const attachment = await getMenuImage();
            return api.sendMessage({ body: "Invalid index.", attachment }, event.threadID);
        }

        let group = config.APPROVAL_SYSTEM.PENDING_THREADS[index];
        let info = await api.getThreadInfo(group.id).catch(() => null);
        if (!info) {
            const attachment = await getMenuImage();
            return api.sendMessage({ body: box("ERROR", "Bot not in this group anymore!"), attachment }, event.threadID);
        }

        group.name = info?.threadName || info?.name || group.name || "Unnamed Group";

        config.APPROVAL_SYSTEM.APPROVED_THREADS.push(group.id);
        config.APPROVAL_SYSTEM.PENDING_THREADS.splice(index, 1);
        saveConfigAndSync(configPath, config);

        const attachment = await getMenuImage();
        api.sendMessage({ body: box("SUCCESS", `Approved: ${group.name}`), attachment }, event.threadID);

        const approvalMsg = `✅ Congratulations!\n\nGroup '${group.name}' has been approved by MOHAMMAD BADOL\n\nBot: ${BOT_NAME}`;
        try {
            const imgPath = path.resolve(__dirname, `../../temp_${Date.now()}.jpg`);
            const res = await axios.get(DRIVE_LINK, { responseType: "arraybuffer", timeout: 15000 });
            fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));
            await api.sendMessage({ body: approvalMsg, attachment: fs.createReadStream(imgPath) }, group.id, () => fs.unlinkSync(imgPath));
        } catch (e) {
            api.sendMessage(approvalMsg, group.id);
        }
    }
};