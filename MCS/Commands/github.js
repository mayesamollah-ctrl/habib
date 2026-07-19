const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "github",
    version: "4.2.0",
    credit: "MOHAMMAD BADOL",
    cooldown: 5,
    role: 0,
    prefix: true,
    category: "Information",
    description: "Display detailed GitHub profile information",
    usages: "[username]",
    aliases: ["gh", "git"]
};

module.exports.onStartBadol = async function (api, event, args) {
    const { threadID, messageID } = event;

    // Username input check
    if (!args[0]) {
        return api.sendMessage(
            `╭─[ 🐙 GITHUB SYSTEM ]─╮\n` +
            `│ ❌ Please provide GitHub username!\n` +
            `│\n` +
            `│ 💡 Example:\n` +
            `│ /github torvalds\n` +
            `│ /github mohammadbadol\n` +
            `╰───────────────╯`,
            threadID,
            messageID
        );
    }

    const username = args[0];
    const waitMsg = await api.sendMessage("⏳ Fetching GitHub data...", threadID, messageID);

    try {
        // API call
        const url = `https://api.github.com/users/${username}`;
        const res = await axios.get(url, {
            headers: { "User-Agent": "BADOL-BOT-V5" },
            timeout: 15000
        });

        const u = res.data;

        // Custom box design - Full English
        const box = `
╭─────────────────╮
│ 🤖 BADOL-BOT V5 │
├─────────────────┤
│ 🐙 *Username:* ${u.login}
│ 🆔 *ID:* ${u.id}
│ 🔖 *Type:* ${u.type}
│ 📝 *Bio:* ${u.bio || "N/A"}
│ 🏢 *Company:* ${u.company || "N/A"}
│ 📍 *Location:* ${u.location || "N/A"}
│ 🌐 *Blog:* ${u.blog || "N/A"}
│ 📧 *Email:* ${u.email || "Hidden"}
├─────────────────┤
│ 📦 *Public Repos:* ${u.public_repos}
│ ⭐ *Public Gists:* ${u.public_gists}
│ 👥 *Followers:* ${u.followers}
│ ➡️ *Following:* ${u.following}
│ 🟢 *Hireable:* ${u.hireable? "Yes" : "No"}
├─────────────────┤
│ 📅 *Created:* ${new Date(u.created_at).toDateString()}
│ 🕒 *Updated:* ${new Date(u.updated_at).toDateString()}
╰─────────────────╯

🔗 *Profile:* ${u.html_url}
`;

        await api.unsendMessage(waitMsg.messageID).catch(() => {});

        // Send with profile photo
        if (u.avatar_url) {
            try {
                const imgRes = await axios.get(u.avatar_url, {
                    responseType: 'stream',
                    timeout: 20000
                });
                await api.sendMessage({
                    body: box,
                    attachment: imgRes.data
                }, threadID, messageID);
            } catch (e) {
                // If image fails, send text only
                await api.sendMessage(box, threadID, messageID);
            }
        } else {
            await api.sendMessage(box, threadID, messageID);
        }

    } catch (e) {
        await api.unsendMessage(waitMsg.messageID).catch(() => {});

        if (e.response && e.response.status === 404) {
            return api.sendMessage(
                `╭─[ ❌ ERROR ]─╮\n` +
                `│ GitHub user not found!\n` +
                `│ 💡 Please check username\n` +
                `╰───────────────╯`,
                threadID,
                messageID
            );
        }

        console.log("GitHub Error:", e.message);
        return api.sendMessage(
            `╭─[ ⚠️ ERROR ]─╮\n` +
            `│ GitHub API connection failed!\n` +
            `│ 💡 Please try again later\n` +
            `╰───────────────╯`,
            threadID,
            messageID
        );
    }
};
