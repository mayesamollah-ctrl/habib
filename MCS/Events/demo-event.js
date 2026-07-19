// ════════════════════════════════════════════════════════════
//  BADOL-BOT-V5 — DEMO EVENT TEMPLATE
//  Developer: MOHAMMAD BADOL
//  এই ফাইলটা দেখে যেকোনো developer নতুন event বানাতে পারবে
// ════════════════════════════════════════════════════════════

// ─── config section ─────────────────────────────────────────
module.exports.config = {
    name:        "demo-event",
    version:     "1.0.0",
    credit:      "MOHAMMAD BADOL",
    description: "BADOL-BOT-V5 demo event — সব function দেখানো হয়েছে"
};

// ─── onEventsBadol ───────────────────────────────────────────
// Group এর system events — join, leave, name change ইত্যাদি
// পুরনো নাম ছিল: onEvent
module.exports.onEventsBadol = async function (api, event) {
    const { logMessageType, threadID, logMessageData } = event;

    // ── Member Join ──
    if (logMessageType === "log:subscribe") {
        const added = logMessageData?.addedParticipants || [];
        for (const user of added) {
            // নিজে join করলে skip
            if (user.userFbId === api.getCurrentUserID()) continue;
            // উদাহরণ:
            // await api.sendMessage(`👋 স্বাগতম ${user.fullName}!`, threadID);
        }
    }

    // ── Member Leave ──
    if (logMessageType === "log:unsubscribe") {
        const leftUser = logMessageData?.leftParticipantFbId;
        if (leftUser && leftUser !== api.getCurrentUserID()) {
            // উদাহরণ:
            // await api.sendMessage(`😢 বিদায় নিয়েছেন।`, threadID);
        }
    }

    // ── Group Name Change ──
    if (logMessageType === "log:thread-name") {
        const newName = logMessageData?.name;
        // উদাহরণ:
        // await api.sendMessage(`📝 Group নাম পরিবর্তন হয়েছে: ${newName}`, threadID);
    }

    // ── Admin Change ──
    if (logMessageType === "log:user-nickname") {
        // nickname change event
    }
};

// ─── onChatBadol ────────────────────────────────────────────
// সব message এ run হয় — keyword detect করতে পারো এখানে
// পুরনো নাম ছিল: onChat
module.exports.onChatBadol = async function (api, event) {
    const { body, threadID, messageID, senderID } = event;
    if (!body) return;

    // উদাহরণ: কেউ "badol" লিখলে react করবে
    // if (body.toLowerCase().includes("badol")) {
    //     await api.setMessageReaction("❤️", messageID, () => {}, true);
    // }
};

// ─── onReplyBadol ───────────────────────────────────────────
// bot এর message এ reply করলে run হয়
// পুরনো নাম ছিল: onReply
module.exports.onReplyBadol = async function (api, event, cache) {
    const { body, threadID, messageID } = event;
    // events এ সাধারণত onReplyBadol কম ব্যবহার হয়
};

// ─── onReactionBadol ────────────────────────────────────────
// bot এর message এ reaction দিলে run হয়
// পুরনো নাম ছিল: onReaction
module.exports.onReactionBadol = async function (api, event) {
    const { reaction, userID, threadID, messageID } = event;
    // উদাহরণ:
    // if (reaction === "❤️") { ... }
};

// ─── onLoadBadol ────────────────────────────────────────────
// বট start হলে একবার run হয়
// পুরনো নাম ছিল: onLoad
module.exports.onLoadBadol = async function ({ api }) {
    console.log("✅ [DEMO-EVENT] Event loaded successfully");
};

// ════════════════════════════════════════════════════════════
//  ⚠️ EVENT vs COMMAND পার্থক্য:
//
//  COMMAND:
//  - user নির্দিষ্ট command দিলে run হয় (যেমন: /help)
//  - MCS/Commands/ ফোল্ডারে রাখো
//  - config.name, config.credit আবশ্যক
//
//  EVENT:
//  - সব message বা system event এ run হয়
//  - MCS/Events/ ফোল্ডারে রাখো
//  - onEventsBadol, onChatBadol ইত্যাদি function এ কাজ করে
//
//  FUNCTION NAMES (BADOL-BOT-V5):
//  ┌─────────────────────────────────────────────┐
//  │ নতুন নাম          │ পুরনো নাম              │
//  ├────────────────────┼────────────────────────┤
//  │ onStartBadol       │ onStart                │
//  │ onChatBadol        │ onChat                 │
//  │ onReplyBadol       │ onReply                │
//  │ onReactionBadol    │ onReaction             │
//  │ onEventsBadol      │ onEvent                │
//  │ onLoadBadol        │ onLoad                 │
//  └─────────────────────────────────────────────┘
//  দুটো নামই কাজ করে — পুরনো command ভাঙবে না
// ════════════════════════════════════════════════════════════
