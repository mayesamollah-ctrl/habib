const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "gf",
    version: "1.5.0",
    role: 0,
    credit: "MOHAMMAD BADOL",
    description: "new item gc",
    cooldown: 5,
    prefix: true,
    aliases: ["ex", "girlfriend", "fbex"]
};

function generatePhone() {
    const operators = ["017", "018", "019", "016", "015", "013", "014"];
    const op = operators[Math.floor(Math.random() * operators.length)];
    const num = Math.floor(10000000 + Math.random() * 90000000);
    return op + num;
}

module.exports.onStartBadol = async function(api, event, args) {
    const { threadID, messageID } = event;

    const gfList = [
        { name: "সারা", age: "১৯", height: "৫'৩\"", weight: "৪৮", blood: "A+", address: "ঢাকা", fb: "sara.queen", hobby: "গান শোনা", color: "গোলাপি", food: "বিরিয়ানি", dream: "ডাক্তার", status: "সিঙ্গেল", edu: "HSC", insta: "@sara_queen", birth: "১৫ মার্চ", zodiac: "মীন", movie: "রোমান্টিক", sport: "ব্যাডমিন্টন", pet: "বিড়াল", quote: "হাসি দিয়েই জীবন জয়" },
        { name: "মিমি", age: "২০", height: "৫'২\"", weight: "৪৫", blood: "B+", address: "চট্টগ্রাম", fb: "mimi.angel", hobby: "নাচ", color: "নীল", food: "ফুচকা", dream: "শিক্ষিকা", status: "সিঙ্গেল", edu: "অনার্স ১ম", insta: "@mimi_angel", birth: "২২ জুলাই", zodiac: "কর্কট", movie: "কমেডি", sport: "ক্রিকেট", pet: "খরগোশ", quote: "স্বপ্ন দেখো, বাস্তব করো" },
        { name: "নিহা", age: "২১", height: "৫'৪\"", weight: "৫০", blood: "O+", address: "সিলেট", fb: "niha.art", hobby: "ছবি আঁকা", color: "বেগুনি", food: "পিজ্জা", dream: "আর্টিস্ট", status: "সিঙ্গেল", edu: "অনার্স ২য়", insta: "@niha.art", birth: "৫ সেপ্টেম্বর", zodiac: "কন্যা", movie: "থ্রিলার", sport: "সাঁতার", pet: "মাছ", quote: "রঙেই আমার জীবন" },
        { name: "জেরিন", age: "১৮", height: "৫'১\"", weight: "৪২", blood: "AB+", address: "রাজশাহী", fb: "jerin.book", hobby: "বই পড়া", color: "সাদা", food: "চকলেট", dream: "লেখিকা", status: "সিঙ্গেল", edu: "HSC", insta: "@jerin.book", birth: "১০ জানুয়ারি", zodiac: "মকর", movie: "ড্রামা", sport: "দাবা", pet: "পাখি", quote: "বই আমার বন্ধু" },
        { name: "তিথি", age: "২২", height: "৫'৫\"", weight: "৫২", blood: "A-", address: "খুলনা", fb: "tithi.cook", hobby: "রান্না", color: "লাল", food: "পাস্তা", dream: "শেফ", status: "সিঙ্গেল", edu: "মাস্টার্স", insta: "@tithi.cook", birth: "১৮ এপ্রিল", zodiac: "মেষ", movie: "অ্যাকশন", sport: "ভলিবল", pet: "কুকুর", quote: "ভালোবাসা রান্নায়" },
        { name: "মাধবী", age: "২০", height: "৫'৩\"", weight: "৪৭", blood: "B-", address: "বরিশাল", fb: "madhobi.green", hobby: "গার্ডেনিং", color: "সবুজ", food: "ভর্তা", dream: "কৃষিবিদ", status: "সিঙ্গেল", edu: "অনার্স ১ম", insta: "@madhobi.green", birth: "২৯ ফেব্রুয়ারি", zodiac: "মীন", movie: "ডকুমেন্টারি", sport: "যোগব্যায়াম", pet: "কচ্ছপ", quote: "প্রকৃতিই জীবন" },
        { name: "অনামিকা", age: "১৯", height: "৫'২\"", weight: "৪৪", blood: "O-", address: "রংপুর", fb: "anamika.travel", hobby: "ট্রাভেল", color: "কমলা", food: "বার্গার", dream: "এয়ার হোস্টেস", status: "সিঙ্গেল", edu: "HSC", insta: "@anamika.travel", birth: "৭ ডিসেম্বর", zodiac: "ধনু", movie: "অ্যাডভেঞ্চার", sport: "সাইক্লিং", pet: "ঘোড়া", quote: "পৃথিবী ঘুরবো" },
        { name: "ঐশী", age: "২১", height: "৫'৪\"", weight: "৪৯", blood: "A+", address: "ময়মনসিংহ", fb: "oishee.click", hobby: "ফটোগ্রাফি", color: "কালো", food: "কাচ্চি", dream: "ফটোগ্রাফার", status: "সিঙ্গেল", edu: "অনার্স ৩য়", insta: "@oishee.click", birth: "১৪ ফেব্রুয়ারি", zodiac: "কুম্ভ", movie: "সাই-ফাই", sport: "টেবিল টেনিস", pet: "হ্যামস্টার", quote: "মুহূর্ত ধরে রাখি" },
        { name: "দিয়া", age: "২০", height: "৫'৩\"", weight: "৪৬", blood: "B+", address: "কুমিল্লা", fb: "diya.glam", hobby: "মেকআপ", color: "সোনালি", food: "আইসক্রিম", dream: "মেকআপ আর্টিস্ট", status: "সিঙ্গেল", edu: "অনার্স ২য়", insta: "@diya.glam", birth: "২৫ অক্টোবর", zodiac: "বৃশ্চিক", movie: "হরর", sport: "জিম", pet: "তোতা", quote: "সৌন্দর্যই শক্তি" },
        { name: "রিমি", age: "১৯", height: "৫'১\"", weight: "৪৩", blood: "AB-", address: "গাজীপুর", fb: "rimi.game", hobby: "গেমিং", color: "ধূসর", food: "নুডলস", dream: "গেম ডেভেলপার", status: "সিঙ্গেল", edu: "HSC", insta: "@rimi.game", birth: "৩ জুন", zodiac: "মিথুন", movie: "অ্যানিমে", sport: "ই-স্পোর্টস", pet: "ইঁদুর", quote: "গেম ইজ লাইফ" },
        { name: "সায়মা", age: "২২", height: "৫'২\"", weight: "৫১", blood: "O+", address: "নারায়ণগঞ্জ", fb: "sayma.design", hobby: "সেলাই", color: "মেরুন", food: "পিঠা", dream: "ফ্যাশন ডিজাইনার", status: "সিঙ্গেল", edu: "মাস্টার্স", insta: "@sayma.design", birth: "৯ নভেম্বর", zodiac: "বৃশ্চিক", movie: "রোমান্টিক কমেডি", sport: "ক্যারাম", pet: "ছাগল", quote: "স্টাইল আমার পরিচয়" },
        { name: "তানিয়া", age: "২০", height: "৫'৪\"", weight: "৪৮", blood: "A+", address: "ফরিদপুর", fb: "tania.vlog", hobby: "ইউটিউবিং", color: "আকাশি", food: "মোমো", dream: "ইউটিউবার", status: "সিঙ্গেল", edu: "অনার্স ১ম", insta: "@tania.vlog", birth: "১৭ আগস্ট", zodiac: "সিংহ", movie: "ওয়েব সিরিজ", sport: "বাস্কেটবল", pet: "শেয়াল", quote: "লাইফ ইজ কন্টেন্ট" },
        { name: "ঝিলিক", age: "১৮", height: "৫'০\"", weight: "৪১", blood: "B+", address: "পাবনা", fb: "jhilik.act", hobby: "নাটক", color: "গোল্ডেন", food: "সন্দেশ", dream: "অভিনেত্রী", status: "সিঙ্গেল", edu: "HSC", insta: "@jhilik.act", birth: "২৬ মে", zodiac: "মিথুন", movie: "নাটক", sport: "কাবাডি", pet: "ময়ূর", quote: "অভিনয় আমার নেশা" },
        { name: "মেঘলা", age: "২১", height: "৫'৩\"", weight: "৪৬", blood: "O-", address: "বগুড়া", fb: "meghla.poem", hobby: "কবিতা", color: "আসমानी", food: "ঝালমুড়ি", dream: "কবি", status: "সিঙ্গেল", edu: "অনার্স ৩য়", insta: "@meghla.poem", birth: "১২ জুলাই", zodiac: "কর্কট", movie: "আর্ট ফিল্ম", sport: "দৌড়", pet: "প্রজাপতি", quote: "কবিতায় বাঁচি" },
        { name: "নোভা", age: "২০", height: "৫'২\"", weight: "৪৫", blood: "AB+", address: "যশোর", fb: "nova.dance", hobby: "ডান্স", color: "রুপালি", food: "চাওমিন", dream: "কোরিওগ্রাফার", status: "সিঙ্গেল", edu: "অনার্স ২য়", insta: "@nova.dance", birth: "৮ জানুয়ারি", zodiac: "মকর", movie: "মিউজিক্যাল", sport: "জুম্বা", pet: "হরিণ", quote: "নাচই আমার ভাষা" },
        { name: "আফরিন", age: "১৯", height: "৫'৩\"", weight: "৪৪", blood: "A-", address: "কক্সবাজার", fb: "afrin.sea", hobby: "সার্ফিং", color: "ফিরোজা", food: "সি-ফুড", dream: "মেরিন বায়োলজিস্ট", status: "সিঙ্গেল", edu: "HSC", insta: "@afrin.sea", birth: "২০ জুন", zodiac: "মিথুন", movie: "অ্যাডভেঞ্চার", sport: "সার্ফিং", pet: "ডলফিন", quote: "সমুদ্র আমার ঘর" },
        { name: "ইভা", age: "২২", height: "৫'৪\"", weight: "৫০", blood: "B-", address: "নরসিংদী", fb: "eva.code", hobby: "কোডিং", color: "নেভি ব্লু", food: "কফি", dream: "সফটওয়্যার ইঞ্জিনিয়ার", status: "সিঙ্গেল", edu: "CSE ফাইনাল", insta: "@eva.code", birth: "৪ এপ্রিল", zodiac: "মেষ", movie: "সাই-ফাই", sport: "চেস", pet: "রোবট", quote: "কোড ইজ পোয়েট্রি" },
        { name: "পিউ", age: "২০", height: "৫'১\"", weight: "৪২", blood: "O+", address: "টাঙ্গাইল", fb: "piu.craft", hobby: "হস্তশিল্প", color: "ম্যাজেন্টা", food: "রসমালাই", dream: "উদ্যোক্তা", status: "সিঙ্গেল", edu: "অনার্স ১ম", insta: "@piu.craft", birth: "১১ সেপ্টেম্বর", zodiac: "কন্যা", movie: "ইনস্পিরেশনাল", sport: "ব্যাডমিন্টন", pet: "ময়না", quote: "হাতে গড়ি স্বপ্ন" },
        { name: "মাহি", age: "২১", height: "৫'৫\"", weight: "৫৩", blood: "A+", address: "চাঁদপুর", fb: "mahi.vlog", hobby: "ভ্লগিং", color: "পিচ", food: "ইলিশ", dream: "ট্রাভেল ব্লগার", status: "সিঙ্গেল", edu: "অনার্স ৪র্থ", insta: "@mahi.vlog", birth: "৩০ ডিসেম্বর", zodiac: "মকর", movie: "ট্রাভেল শো", sport: "হাইকিং", pet: "বানর", quote: "ঘুরে দেখি বাংলাদেশ" },
        { name: "রিতু", age: "১৯", height: "৫'২\"", weight: "৪৫", blood: "B+", address: "কুষ্টিয়া", fb: "ritu.voice", hobby: "গান গাওয়া", color: "ল্যাভেন্ডার", food: "দই", dream: "গায়িকা", status: "সিঙ্গেল", edu: "HSC", insta: "@ritu.voice", birth: "২৩ মার্চ", zodiac: "মেষ", movie: "মিউজিক্যাল", sport: "দৌড়", pet: "কোকিল", quote: "সুরে সুরে জীবন" },
        { name: "সুমাইয়া", age: "২০", height: "৫'৩\"", weight: "৪৭", blood: "O+", address: "নোয়াখালী", fb: "sumaiya.law", hobby: "ডিবেট", color: "ব্রাউন", food: "হালিম", dream: "ব্যারিস্টার", status: "সিঙ্গেল", edu: "LLB ২য়", insta: "@sumaiya.law", birth: "১৬ অক্টোবর", zodiac: "তুলা", movie: "কোর্টরুম ড্রামা", sport: "তায়কোয়ান্দো", pet: "ঈগল", quote: "ন্যায় আমার অস্ত্র" }
    ];

    const imageUrls = [
        "https://drive.google.com/uc?export=view&id=1h32iZI1e8hLy2dakGnsNJCyxJCdtHheu",
        "https://drive.google.com/uc?export=view&id=1pCBbbWhLYoDgfPaglz6dupo2zS4bem0F",
        "https://drive.google.com/uc?export=view&id=1J-l_QfHRMy0_Yjs3O1I4ZN2H5AT7lyl-",
        "https://drive.google.com/uc?export=view&id=1WvjeNj6ViRGWVFkqabGiEMK3zR0BPf1k",
        "https://drive.google.com/uc?export=view&id=1dB3IhKSPx2I4Eb_90_6l3dQJS3u1nidF",
        "https://drive.google.com/uc?export=view&id=13Lr7EPaEtzV66GUSK9nezMc6rQ1mMAEC",
        "https://drive.google.com/uc?export=view&id=18-5mSQr9u3MdBKLEsU6tOeBS_uwqyfQx",
        "https://drive.google.com/uc?export=view&id=14f2scKE7dq-ySbLQDA1wJYWRafpu7mH1",
        "https://drive.google.com/uc?export=view&id=1xShwb9YYRGv5aUUMipGQbF0FSXhQSVao",
        "https://drive.google.com/uc?export=view&id=13pGybQ_2HOzlc8sEfyzo6cPANdmQdTPL",
        "https://drive.google.com/uc?export=view&id=1I-lERi0y3W202CXKXnNapi1SQBEur8x6",
        "https://drive.google.com/uc?export=view&id=1g4P6vO-VGI8XCjUw-g7E0WJe1ivW_Kz7",
        "https://drive.google.com/uc?export=view&id=1vFlZ73AWcDpG5Nv05xL0ChL-098JloLi",
        "https://drive.google.com/uc?export=view&id=1yF21BfyHToteolSZ6ICKV0qfFfMR8zdZ",
        "https://drive.google.com/uc?export=view&id=1NCBi3ErXm4K98VOUc-ksX1t8tw8RZfsj",
        "https://drive.google.com/uc?export=view&id=1BfsskxiDWU5-Aa2hEJKCiASHJc7YQPoD",
        "https://drive.google.com/uc?export=view&id=1sbGqjTVguuWQGYXI6hOCa48AQoGM5kPA",
        "https://drive.google.com/uc?export=view&id=1ObBMNWy8-xIiPsTMeJ8Dz7BqdEg7YMDr",
        "https://drive.google.com/uc?export=view&id=1F_tMiVPuNyKRNiWL6fv6BZyvZ1PMTYFH",
        "https://drive.google.com/uc?export=view&id=1Bbvk9_sRJIR_ZpAYusPBW-_L1R_wo2_S",
        "https://drive.google.com/uc?export=view&id=1AHGqYjB72t9yoY3K5kXm9C-Vy-zueBQm"
    ];

    const gf = gfList[Math.floor(Math.random() * gfList.length)];
    const img = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    const phone = generatePhone();
    
    const CACHE_DIR = path.join(__dirname, "../../cache");
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const pathSave = path.join(CACHE_DIR, `gf_${Date.now()}.jpg`);
    
    try {
        const res = await axios.get(img, { responseType: 'arraybuffer', timeout: 10000 });
        fs.writeFileSync(pathSave, Buffer.from(res.data));

        const msg = `╭─❏ BADOL-BOT-V5 ❏─╮\n` +
                    `│ 💖 YOUR PARTNER\n` +
                    `├─────────────────\n` +
                    `│ 👤 ${gf.name} | ${gf.age}বছর\n` +
                    `│ 📏 ${gf.height} | ${gf.weight}kg | ${gf.blood}\n` +
                    `│ 🎂 ${gf.birth} | ${gf.zodiac}\n` +
                    `│ 🏠 ${gf.address}\n` +
                    `│ 🎓 ${gf.edu} | ${gf.dream}\n` +
                    `│ 💚 ${gf.status}\n` +
                    `├─────────────────\n` +
                    `│ 🎨 ${gf.hobby} | ${gf.color}\n` +
                    `│ 🍕 ${gf.food} | 🎬 ${gf.movie}\n` +
                    `│ ⚽ ${gf.sport} | 🐾 ${gf.pet}\n` +
                    `├─────────────────\n` +
                    `│ 📱 ${phone}\n` +
                    `│ 📘 fb.com/${gf.fb}\n` +
                    `│ 📷 ${gf.insta}\n` +
                    `├─────────────────\n` +
                    `│ 💬 "${gf.quote}"\n` +
                    `╰─❏ BADOL-BOT-V5 ❏─╯`;
        
        api.sendMessage({ body: msg, attachment: fs.createReadStream(pathSave) }, threadID, () => {
            if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
        }, messageID);
        
    } catch (e) {
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
        api.sendMessage("╭─❏ ERROR ❏─╮\n│ ❌ ছবি লোড হচ্ছে না!\n╰────────────╯", threadID, messageID);
    }
};