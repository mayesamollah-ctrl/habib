const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "lofivideo",
    version: "1.0.4",
    role: 0,
    credit: "MOHAMMAD BADOL", // credit ফিল্ড ফিক্সড
    prefix: true,
    description: "Send a random lofi video",
    category: "media",
    aliases: ["lofi", "lofi_vid", "lofi4k", "lv"],
    usages: "",
    cooldown: 5
};

const VIDEO_LINKS = [
    "https://drive.google.com/uc?id=16KeE4J7L2Pd8cCKIBvlwEPP07A92b-eb",
    "https://drive.google.com/uc?id=16MhNPi_H0-tEe5PQrrqkx_l7SrC_l0kd",
    "https://drive.google.com/uc?id=15w4cvYmKrCW2Hul2AcvPEk5S4b-CH3EE",
    "https://drive.google.com/uc?id=16Xa6thSHdEGCiypaetbAEqVCwEAzFnKX",
    "https://drive.google.com/uc?id=16BnRPvKQd7gd3YLR_rB9QNZymotMqHu7",
    "https://drive.google.com/uc?id=15fDe2735O50z-3G4yQ5tDT9J873x5izm",
    "https://drive.google.com/uc?id=16HgiGU7_Cdh8NtpsKi92dTJmALJCV8jD",
    "https://drive.google.com/uc?id=16KTSrInqvioGnT7RrAskjHYqz8R6RgNY",
    "https://drive.google.com/uc?id=162yWrNRRTeN4tFEjQEtsR4p-4gWbTFaS",
    "https://drive.google.com/uc?id=16-q768c6nXstZEjQhWa1pZUPL2Xpjwo9",
    "https://drive.google.com/uc?id=15bfkP01mTzXutgP_0Z1iyud7SXqq-jOt",
    "https://drive.google.com/uc?id=15WnvdFOQIhKQ1nlZgsABXaf6Q2nQexGW",
    "https://drive.google.com/uc?id=16GTgYVSIDduUs4VTxadIzPPyp9KA_102",
    "https://drive.google.com/uc?id=15Y2GnA-Kcox8Mw6jioxHc1G1yP4pihnC",
    "https://drive.google.com/uc?id=16-qsG6oldtJiGq11Q3bFxKzuZJRFnoPT",
    "https://drive.google.com/uc?id=15W8ETDBXrn_JvealPwPFQ2CjvZp437-g",
    "https://drive.google.com/uc?id=15StZMKfsTdAhhECdKjS6FUFwG_OIHa7W",
    "https://drive.google.com/uc?id=16lOXxs-Z9u-mxttFnwWzdUHvrP55aHnZ",
    "https://drive.google.com/uc?id=162Qn-pcnc9iijg5dv59S9DTTQOofL4Fy",
    "https://drive.google.com/uc?id=1680rf1wQ2TrRuSLHtTwFC7GYctJAnHaX",
    "https://drive.google.com/uc?id=16-XtMXpa4r1iFJTBS2N68ARMuDH2IWpG",
    "https://drive.google.com/uc?id=15bO3lguAxsMZPvKkcvlsM6ObXOfJMz79"
];

module.exports.onStartBadol = async (api, event) => {
    const { threadID, messageID } = event;
    const CACHE_DIR = path.join(__dirname, "../../cache");
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

    const randomLink = VIDEO_LINKS[Math.floor(Math.random() * VIDEO_LINKS.length)];
    const filePath = path.join(CACHE_DIR, `${Date.now()}_lofi.mp4`);

    try {
        const { data } = await axios.get(randomLink, { responseType: "arraybuffer", timeout: 30000 });
        fs.writeFileSync(filePath, Buffer.from(data));

        const boxMsg = 
            `┌─[ LOFI VIDEO ]\n` +
            `├ 🏷️ Status: Success\n` +
            `├ 💬 Vibe: OWNER MOHAMMAD BADOL // 👑🔥\n` +
            `├ 🤖 Bot: BADOL-BOT-V5\n` +
            `└──────────────`;

        await api.sendMessage({
            body: boxMsg,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.existsSync(filePath) && fs.unlinkSync(filePath), messageID);

    } catch {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return api.sendMessage("[ ERROR ]: Failed to load lofi video!", threadID, messageID);
    }
};