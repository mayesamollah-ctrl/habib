const { createCanvas, loadImage } = require("canvas");
const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "up",
    version: "3.5.1",
    credit: "MOHAMMAD BADOL",
    aliases: ["uptime", "status"],
    role: 0,
    cooldown: 5,
    prefix: true,
    description: "BADOL-BOT-V5 UPTIME SYSTEM",
};

module.exports.onStartBadol = async (api, event, args) => {
    const threadID = event.threadID;
    const messageID = event.messageID;

    let loadingMsg;
    try {
        loadingMsg = await api.sendMessage("🔄 [▒▒▒▒▒▒] 0%", threadID, messageID);

        const progress = [
            "⚡ [██▒▒▒▒▒▒▒▒] 20%",
            "⚡ [████▒▒▒▒▒▒] 40%",
            "⚡ [██████▒▒▒▒] 60%",
            "⚡ [████████▒▒] 80%",
            "✅ [██████████] 100%"
        ];

        for (let i = 0; i < progress.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 350));
            try {
                await api.editMessage(progress[i], loadingMsg.messageID);
            } catch (e) {}
        }
    } catch (e) {
        console.log("Loading Msg Error:", e.message);
    }

    const startPing = Date.now();
    const botPrefix = global.config?.BOT_INFO?.PREFIX || ".";
    const totalCmds = global.commands? global.commands.size : 0;
    const totalEvents = global.events? global.events.size : 0;

    const now = new Date();
    const bdTime = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka", hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const bdDate = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka", day: '2-digit', month: 'short', year: 'numeric' });

    function formatUptime() {
        let totalSeconds = Math.floor(process.uptime());
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
    const usedRam = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2);
    const cpuModel = os.cpus()[0].model.split(' ')[0] + " Core";
    const ping = Date.now() - startPing;
    const uptimeStr = formatUptime();

    let imgPath;
    try {
        const canvas = createCanvas(800, 800);
        const ctx = canvas.getContext("2d");
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        try {
            const bgUrl = "https://i.imgur.com/vH97Z77.jpeg";
            const bgResponse = await axios.get(bgUrl, { responseType: 'arraybuffer' });
            const bgImage = await loadImage(Buffer.from(bgResponse.data));
            ctx.drawImage(bgImage, 0, 0, 800, 800);
        } catch (bgErr) {
            const bgGradient = ctx.createRadialGradient(400, 400, 0, 400, 400, 600);
            bgGradient.addColorStop(0, "#0b1528");
            bgGradient.addColorStop(1, "#020610");
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, 800, 800);
        }

        const frameGradient = ctx.createLinearGradient(0, 0, 800, 800);
        frameGradient.addColorStop(0, "#00f2fe");
        frameGradient.addColorStop(0.5, "#9d4edd");
        frameGradient.addColorStop(1, "#00ffaa");
        ctx.strokeStyle = frameGradient;
        ctx.lineWidth = 6;
        ctx.strokeRect(20, 20, 760, 760);

        ctx.strokeStyle = "#00f2fe";
        ctx.lineWidth = 3;
        const cutSize = 40;
        const corners = [[20, 20, 1, 1], [780, 20, -1, 1], [20, 780, 1, -1], [780, 780, -1, -1]];
        corners.forEach(([cx, cy, dx, dy]) => {
            ctx.beginPath();
            ctx.moveTo(cx, cy + (dy * cutSize));
            ctx.lineTo(cx + (dx * cutSize), cy);
            ctx.stroke();
        });

        ctx.shadowColor = "#00f2fe";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("QUANTUM SYSTEM V5", 400, 75);
        ctx.shadowBlur = 0;

        const avX = 220, avY = 280, avR = 110;

        ctx.shadowColor = "#00f2fe"; ctx.shadowBlur = 25;
        ctx.strokeStyle = "#00f2fe"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(avX, avY, avR + 12, 0, Math.PI * 2); ctx.stroke();

        ctx.shadowColor = "#00ffaa"; ctx.shadowBlur = 10;
        ctx.strokeStyle = "#00ffaa"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(avX, avY, avR, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;

        // HD Profile Picture Loader Fix
        try {
            const botID = api.getCurrentUserID();
            let avatarBuffer = null;
            try {
                const hdUrl = `https://graph.facebook.com/${botID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                const res = await axios.get(hdUrl, { responseType: 'arraybuffer', timeout: 8000 });
                avatarBuffer = Buffer.from(res.data);
            } catch(e1) {
                const info = await api.getUserInfo(botID);
                let picUrl = info[botID]?.thumbSrc || "https://i.imgur.com/6S79p99.png";
                picUrl = picUrl.replace(/s\d+/, 's720');
                const res = await axios.get(picUrl, { responseType: 'arraybuffer', timeout: 8000 });
                avatarBuffer = Buffer.from(res.data);
            }

            const avatar = await loadImage(avatarBuffer);
            ctx.save();
            ctx.beginPath(); 
            ctx.arc(avX, avY, avR - 4, 0, Math.PI * 2); 
            ctx.clip();
            ctx.drawImage(avatar, avX - avR, avY - avR, avR * 2, avR * 2);
            ctx.restore();
        } catch (e) {
            console.log("Avatar Draw Error:", e.message);
        }

        ctx.fillStyle = "rgba(0, 242, 254, 0.15)";
        ctx.fillRect(50, 420, 340, 50);
        ctx.strokeStyle = "#00f2fe";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 420, 340, 50);
        ctx.fillStyle = "#00f2fe";
        ctx.font = "bold 18px monospace";
        ctx.fillText("BADOL-BOT-V5", 220, 452);

        const drawQuantumBox = (x, y, w, h, header, value, themeColor) => {
            ctx.fillStyle = "rgba(5, 10, 25, 0.65)";
            ctx.fillRect(x, y, w, h);

            ctx.shadowColor = themeColor;
            ctx.shadowBlur = 12;
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(x, y, w, h);
            ctx.shadowBlur = 0;

            ctx.fillStyle = themeColor + "33";
            ctx.fillRect(x + 2, y + 2, w - 4, 30);

            ctx.fillStyle = themeColor;
            ctx.font = "bold 15px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(`▶ ${header}`, x + 15, y + 22);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px monospace";
            ctx.fillText(value, x + 15, y + 62);
        };

        drawQuantumBox(420, 130, 330, 85, "BOT DEVELOPER", "MOHAMMAD BADOL", "#00f2fe");
        drawQuantumBox(420, 245, 330, 85, "SYSTEM UPTIME", uptimeStr, "#00ffaa");
        drawQuantumBox(420, 360, 330, 85, "CORE CPU STACK", cpuModel, "#ffb703");

        drawQuantumBox(50, 500, 340, 85, "RAM MEMORY USAGE", `${usedRam} / ${totalRam} GB`, "#ff4d6d");
        drawQuantumBox(410, 500, 340, 85, "LATENCY PING", `${ping} MS`, "#ff7a00");

        drawQuantumBox(50, 610, 340, 85, "TOTAL COMMANDS", `${totalCmds} Active`, "#00ffaa");
        drawQuantumBox(410, 610, 340, 85, "BOT PREFIX", `[ ${botPrefix} ] Mode`, "#9d4edd");

        ctx.fillStyle = "rgba(0, 242, 254, 0.1)";
        ctx.fillRect(50, 712, 700, 50);
        ctx.strokeStyle = "#00f2fe";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(50, 712, 700, 50);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`📡 CALIBRATION TIME: ${bdDate} | ${bdTime} (BST)`, 400, 743);

        imgPath = path.join(__dirname, `up_${Date.now()}.png`);
        fs.writeFileSync(imgPath, canvas.toBuffer());

    } catch (canvasError) {
        console.log("Canvas Engine Error:", canvasError.message);
        if (loadingMsg) await api.unsendMessage(loadingMsg.messageID).catch(() => {});
        return api.sendMessage("❌ Quantum Canvas Engine Failure!", threadID, messageID);
    }

    const captionText = `✨ 𝐁𝐀𝐃𝐎𝐋 𝐁𝐎𝐓 𝐔𝐏 𝐒𝐘𝐒𝐓𝐄𝐌 ✨\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👑 𝗗𝗲𝘃𝗲լ𝗼𝗽𝗲𝗿: MOHAMMAD BADOL\n` +
        `⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptimeStr}\n` +
        `⚡ 𝗟𝗮𝘁𝗲𝗻𝗰𝘆: ${ping} MS\n` +
        `📊 𝗥𝗔𝗠: ${usedRam} / ${totalRam} GB\n` +
        `⚙️ 𝗖𝗠𝗗𝘀: ${totalCmds} | 𝗘𝘃𝗲𝗻𝘁𝘀: ${totalEvents}\n` +
        `🛠️ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${botPrefix} ]\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🟢 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐌𝐀𝐈𝐍𝐅𝐑𝐀𝐌𝐄: 𝐎𝐍𝐋𝐈𝐍𝐄`;

    try {
        if (loadingMsg) await api.unsendMessage(loadingMsg.messageID).catch(() => {});
        await api.sendMessage({
            body: captionText,
            attachment: fs.createReadStream(imgPath)
        }, threadID, messageID);
    } catch (err) {
        console.log("Send Error:", err.message);
        await api.sendMessage("❌ Error outputting quantum panel!", threadID, messageID);
    } finally {
        if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
};
