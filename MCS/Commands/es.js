const fs = require("fs");
const path = require("path");

// badol.js অনুযায়ী সঠিক রিলেটিভ পাথ ডিটেকশন
const logger = require("../../BADOL-Main/logger"); 

module.exports = {
    config: {
        name: "es",
        aliases: ["event", "etmanage"],
        version: "1.0.0",
        role: 1, // শুধুমাত্র এডমিন/ওনার ব্যবহার করতে পারবেন
        cooldown: 2,
        prefix: true,
        credit: "MOHAMMAD BADOL", // আপনার বটের ক্রেডিট লকিং ম্যাচ করার জন্য
        description: "রানটাইমে ইভেন্ট লোড বা আনলোড করার কমান্ড"
    },

    onStartBadol: async function (api, event, args) {
        const { threadID, messageID } = event;
        const action = args[0]?.toLowerCase();
        const fileName = args[1];

        if (!action || !fileName) {
            return api.sendMessage("❌ সঠিক নিয়ম: \n1. /et unload <ফাইল_নাম.js>\n2. /et load <ফাইল_নাম.js>", threadID, messageID);
        }

        const evtPath = path.join(__dirname, "../Events", fileName);

        // ═══════════════════ UNLOAD SYSTEM ═══════════════════
        if (action === "unload") {
            // ইভেন্টের নাম বের করার চেষ্টা (ম্যাপের কি থেকে)
            let eventName = null;
            for (const [key, value] of global.events.entries()) {
                if (key === fileName || key === fileName.replace(".js", "")) {
                    eventName = key;
                    break;
                }
            }

            if (!eventName || !global.events.has(eventName)) {
                return api.sendMessage(`❌ '${fileName}' নামে কোনো ইভেন্ট বর্তমানে একটিভ নেই।`, threadID, messageID);
            }

            // ম্যাপ থেকে রিমুভ করা
            global.events.delete(eventName);
            
            // নোড ক্যাশ থেকে ডিলিট করা যাতে পরে ফ্রেশ ফাইল লোড হয়
            try {
                const resolvedPath = require.resolve(evtPath);
                delete require.cache[resolvedPath];
            } catch (e) {}

            return api.sendMessage(`✅ Event '${fileName}' সফলভাবে Unload (অফ) করা হয়েছে!`, threadID, messageID);
        }

        // ═══════════════════ LOAD SYSTEM ═══════════════════
        else if (action === "load") {
            if (!fs.existsSync(evtPath)) {
                return api.sendMessage(`❌ 'MCS/Events' ফোল্ডারে '${fileName}' নামে কোনো ফাইল পাওয়া যায়নি!`, threadID, messageID);
            }

            try {
                // আগের ক্যাশ থাকলে ক্লিয়ার করা
                try {
                    delete require.cache[require.resolve(evtPath)];
                } catch (e) {}

                const evt = require(evtPath);

                // নতুন Badol নাম অথবা পুরনো নাম — দুটোই চেক করো
                const hasHook = evt.onEventsBadol || evt.onEvent ||
                                evt.onReactionBadol || evt.onReaction ||
                                evt.onChatBadol || evt.onChat ||
                                evt.onReplyBadol || evt.onReply;

                if (hasHook) {
                    const nameToSet = evt.config?.name || fileName.replace(".js", "");
                    global.events.set(nameToSet, evt);

                    // onLoadBadol অথবা onLoad — যেটা আছে সেটা call করো
                    const loadFn = evt.onLoadBadol || evt.onLoad;
                    if (loadFn) {
                        try {
                            await loadFn({ api });
                        } catch (loadErr) {
                            console.error(`onLoadBadol error in ${fileName}:`, loadErr);
                        }
                    }

                    return api.sendMessage(`✅ Event '${fileName}' সফলভাবে Load (অন) করা হয়েছে!`, threadID, messageID);
                } else {
                    return api.sendMessage(`❌ '${fileName}' ফাইলে প্রয়োজনীয় ইভেন্ট ফাংশন (onEventsBadol/onReactionBadol ইত্যাদি) নেই।`, threadID, messageID);
                }
            } catch (error) {
                return api.sendMessage(`❌ ফাইল লোড করতে এরর হয়েছে: ${error.message}`, threadID, messageID);
            }
        } 
        
        else {
            return api.sendMessage("❌ ভুল অ্যাকশন! শুধুমাত্র 'load' অথবা 'unload' ব্যবহার করুন।", threadID, messageID);
        }
    }
};
