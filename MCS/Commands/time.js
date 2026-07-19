const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "time",
        aliases: ["clock", "date"],
        version: "1.0.6",
        author: "MOHAMMAD BADOL",
        role: 0,
        cooldown: 10,
        prefix: true,
        credit: "MOHAMMAD BADOL",
        description: "বর্তমান সময়, বাংলা-ইংরেজি-হিজরি তারিখ এবং ১২ মাসের তালিকা দেখুন।"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID } = event;

        // ✅ বাংলা ডিজিট রূপান্তর ফাংশন
        const engToBn = num => {
            const bnDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
            return num.toString().replace(/\d/g, d => bnDigits[d]);
        };

        try {
            // 🕒 Dhaka Time
            const now = new Date(new Date().toLocaleString("en-US", {
                timeZone: "Asia/Dhaka"
            }));

            const currentDay = now.getDate();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const hour = now.getHours();

            // ⏰ সময়ের পর্ব
            function getTimePeriodWithEmoji(h) {
                if (h >= 5 && h < 12) return { emoji: "🌅", label: "সকাল" };
                if (h >= 12 && h < 15) return { emoji: "🌞", label: "দুপুর" };
                if (h >= 15 && h < 18) return { emoji: "🌇", label: "বিকাল" };
                if (h >= 18 && h < 20) return { emoji: "🌆", label: "সন্ধ্যা" };
                return { emoji: "🌃", label: "রাত" };
            }
            const timeInfo = getTimePeriodWithEmoji(hour);

            // 🎨 Canvas Setup
            const width = 600;
            const height = 740;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");

            // 🌌 Background Gradient
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, "#020111");
            grad.addColorStop(1, "#191970");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // 🟡 Border
            ctx.strokeStyle = "rgba(255,215,0,0.3)";
            ctx.lineWidth = 15;
            ctx.strokeRect(10, 10, width - 20, height - 20);

            // 📅 Month & Year
            const monthNamesEng = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
            ctx.fillStyle = "#FFD700";
            ctx.font = "bold 50px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(monthNamesEng[currentMonth], width / 2, 90);
            ctx.font = "30px sans-serif";
            ctx.fillText(currentYear, width / 2, 130);

            // 📆 Week Days Header
            const daysNameShort = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
            ctx.fillStyle = "#00FFFF";
            ctx.font = "bold 20px sans-serif";
            daysNameShort.forEach((day, index) => { ctx.fillText(day, 65 + index * 78, 200); });

            // 🗓 Calendar Grid
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            let x = 65 + (firstDay * 78), y = 270;

            for (let d = 1; d <= daysInMonth; d++) {
                if (d === currentDay) {
                    ctx.fillStyle = "red";
                    ctx.beginPath();
                    ctx.arc(x, y - 10, 30, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#FFFFFF";
                } else {
                    ctx.fillStyle = "#FFFFFF";
                }
                ctx.font = "bold 28px sans-serif";
                ctx.fillText(d.toString(), x, y);

                x += 78;
                if (x > 550) {
                    x = 65;
                    y += 80;
                }
            }

            // 🆕 Bot Info
            ctx.textAlign = "center";
            ctx.fillStyle = "#00FFCC"; ctx.font = "bold 22px sans-serif";
            ctx.fillText("Bot Name: BADOL-BOT", width / 2, height - 70);
            ctx.fillStyle = "#FFD700"; ctx.font = "bold 20px sans-serif";
            ctx.fillText(`Bot Developer: ${this.config.credit}`, width / 2, height - 40);

            // 📌 বাংলা তারিখ
            const bnMonths = ["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];
            const daysBn = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];

            let bsYear = currentYear - 593;
            let bsStart = new Date(currentYear, 3, 14);
            if (now < bsStart) { bsYear--; bsStart.setFullYear(bsStart.getFullYear() - 1); }
            let diff = Math.floor((now - bsStart) / 86400000);
            const isLeapYear = (currentYear % 4 === 0 && currentYear % 100!== 0) || (currentYear % 400 === 0);
            const monthLengths = [31,31,31,31,31,31,30,30,30,30,(isLeapYear? 31 : 30), 30];
            let bDay = 0, bMonth = 0;
            for (let i = 0; i < 12; i++) {
                if (diff < monthLengths[i]) { bDay = diff + 1; bMonth = i; break; }
                diff -= monthLengths[i];
            }

            // 🕌 হিজরি তারিখ
            function hijriDate(gDate) {
                let adjustedDate = new Date(gDate.getTime());
                let jd = Math.floor((adjustedDate / 86400000) - (adjustedDate.getTimezoneOffset() / 1440) + 2440587.5);
                let l = jd - 1948440 + 10632;
                let n = Math.floor((l - 1) / 10631);
                l = l - 10631 * n + 354;
                let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
                l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
                let m = Math.floor((24 * l) / 709);
                let d = l - Math.floor((709 * m) / 24);
                let y = 30 * n + j - 30;
                return { year: y, month: m - 1, day: d };
            }
            const hDate = hijriDate(now);
            const arMonths = ["মুহররম","সফর","রবিউল আওয়াল","রবিউস সানি","জুমাদিউল আউয়াল","জুমাদিউস সানি","রজব","শাবান","রমজান","শাওয়াল","জিলক্বদ","জিলহজ"];

            // 🕋 নামাজের সময়
            const prayer = { t: "০৩:৩০", f: "০৫:২৫", d: "১২:১০", a: "০৩:৫০", m: "০৫:৩০", i: "০৬:৫০", j: "১২:৪৫" };
            const separator = "▬▬▬▬▬▬▬▬▬▬";

            // 📅 ইংরেজি ১২ মাস
            const monthsList = [
                "১ জানুয়ারি (January)", "২ ফেব্রুয়ারি (February)", "৩ মার্চ (March)",
                "৪ এপ্রিল (April)", "৫ মে (May)", "৬ জুন (June)",
                "৭ জুলাই (July)", "৮ আগস্ট (August)", "৯ সেপ্টেম্বর (September)",
                "১০ অক্টোবর (October)", "১১ নভেম্বর (November)", "১২ ডিসেম্বর (December)"
            ].join("\n");

            const finalMsg =
                `**🕒 এখন সময়:** ${timeInfo.emoji} *${timeInfo.label}* ${now.toLocaleTimeString("bn-BD")}\n` +
                `${separator}\n\n` +
                `🗓️ **বার:** ${daysBn[now.getDay()]}\n` +
                `📆 **বাংলা তারিখ:** ${engToBn(bDay)} ${bnMonths[bMonth]} ${engToBn(bsYear)} বঙ্গাব্দ\n` +
                `📅 **ইংরেজি তারিখ:** ${engToBn(currentDay)} ${now.toLocaleString("en-US",{month:"long"})} ${engToBn(currentYear)}\n` +
                `🕌 **হিজরি তারিখ:** ${engToBn(hDate.day)} ${arMonths[hDate.month]} ${engToBn(hDate.year)} হিজরি\n\n` +
                `🕋 **তাহাজ্জুদ:** ${prayer.t} AM | 🕌 **ফজর:** ${prayer.f} AM\n` +
                `☀️ **জোহর:** ${prayer.d} PM | ⛅ **আসর:** ${prayer.a} PM\n` +
                `🌅 **মাগরিব:** ${prayer.m} PM | 🌙 **এশা:** ${prayer.i} PM\n` +
                `⛪ **জুম্মা:** ${prayer.j} PM\n\n` +
                `${separator}\n` +
                `📅 **ইংরেজি ১২ মাস:**\n${monthsList}\n` +
                `${separator}\n` +
                `*Credit By ${this.config.credit}*`;

            // টেম্প ফোল্ডার
            const CACHE_DIR = path.join(__dirname, "../../cache");
            if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

            const imgPath = path.join(CACHE_DIR, `cal_${Date.now()}.png`);
            fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

            await api.sendMessage({
                body: finalMsg,
                attachment: fs.createReadStream(imgPath)
            }, threadID, messageID);

            // ফাইল ডিলিট
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

        } catch (err) {
            console.error(err);
            api.sendMessage("❌ ক্যালেন্ডার তৈরি করতে সমস্যা হয়েছে।", threadID, messageID);
        }
    }
};