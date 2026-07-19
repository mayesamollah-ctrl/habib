module.exports.config = {
    name: "golbalbadolprefix2",
    version: "1.0.0",
    role: 0,
    credit: "MOHAMMAD BADOL"
};

module.exports.onChatBadol = async function (api, event) {
    if (event.body && event.body.trim() === ".") {
        const hadisCommand = global.commands.get("golbalbadolprefix");
        if (hadisCommand) {
            try {
                // নতুন নাম অথবা পুরনো নাম — দুটোই সাপোর্ট
                const startFn = hadisCommand.onStartBadol || hadisCommand.onStart;
                if (startFn) await startFn(api, event, []);
            } catch (e) {
                console.error("golbalbadolprefix Error:", e);
            }
        }
    }
};
