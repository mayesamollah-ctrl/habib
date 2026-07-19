const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// পাথ কনফিগারেশন
const CACHE_DIR = path.join(__dirname, "../cache"); 
const dataDir = path.join(__dirname, "B4D9L");
const bdPointerPath = path.join(dataDir, "pompom.json");

const photos = [
    "https://i.postimg.cc/wTZJ1Yvb/images-1-29.jpg", "https://i.postimg.cc/ZRN79xP1/97420.jpg", "https://i.postimg.cc/tCB54cQs/27712360-320x180.jpg", "https://i.postimg.cc/Mp4myjGx/556-contact-01749889097.jpg", "https://i.postimg.cc/rm2GHXWP/images-2022-08-16-T112453-202.jpg", "https://i.postimg.cc/ZYcPwQqw/www-bangla-xxx-com.jpg", "https://i.postimg.cc/SQvRQL1y/990-young.jpg", "https://i.postimg.cc/FHQSb5tW/horny-booby-girl-moaning-hard-fingering-pussy.jpg", "https://i.postimg.cc/0NzwGp5n/Hot-Indian-lovers-standing-sex-MMS.jpg", "https://i.postimg.cc/02H5Yh6g/Hot-Desi-girl-striptease-nude-dance.jpg", "https://i.postimg.cc/CMQ9m044/naughty-Bhabhi-licking-own-nipples.jpg", "https://i.postimg.cc/RFjyCQhD/cute-girl-showing-her-big-round-boobs.jpg", "https://i.postimg.cc/VsqDbcV6/beautiful-Pakistani-girl-salwar-striptease-show.jpg", "https://i.postimg.cc/kXZ6J2vt/sexy-Girl-shows-boobs-and-pussy-many-clips-merged.jpg", "https://i.postimg.cc/XYkrws09/sexy-horny-girl-fingering-masturbating-with-bottle.jpg", "https://i.postimg.cc/g03mvQWD/10-272.jpg", "https://i.postimg.cc/7L1jPT0H/young-lovers-enjoying-nude-sex-on-selfie-cam.jpg", "https://i.postimg.cc/fRnH3RwJ/foreplay-sex-with-beautiful-Bhabhi-before-fucking.jpg", "https://i.postimg.cc/Hkgfq28Z/NRI-Punjabi-girl-showing-her-big-boobies.jpg", "https://i.postimg.cc/yNWntgjp/unsatisfied-Desi-Milf-showing-her-big-clit.jpg", "https://i.postimg.cc/NjCk6Gt6/Desi-girl-showing-her-cute-small-boobies-on-VC.jpg", "https://i.postimg.cc/7YW5X5CZ/Desi-couple-hot-romance-in-shower.jpg", "https://i.postimg.cc/xTCkKv1Z/Bangladeshi-cute-village-girl-showing-boobs-on-video-call.jpg", "https://i.postimg.cc/V6kw3FpQ/Indian-girl-shows-her-boobs-and-pussy.jpg", "https://i.postimg.cc/hjQnDGDp/sexy-ass-Bhabhi-fucked-doggy-style-with-moanings-1.jpg", "https://i.postimg.cc/13W1DF4v/cute-college-girl-showing-her-shaved-pussy-on-VC.jpg", "https://i.postimg.cc/Hn0fncf4/beautiful-college-girl-showing-her-tiny-tits.jpg", "https://i.postimg.cc/8PKZHmBf/Pakistani-mature-girl-paid-to-expose-her-assets.jpg", "https://i.postimg.cc/QMLk44BC/skinny-Desi-girl-masturbating-pussy-with-brinjal.jpg", "https://i.postimg.cc/tJ7xCW18/Indian-lovers-hot-foreplay-sex-in-front-of-mirror.jpg", "https://i.postimg.cc/RC31mxch/sweet-looking-Desi-girl-boobs-show-for-lover.jpg", "https://i.postimg.cc/d0HdM53G/beautiful-Pakistani-bitch-showing-her-naked-beauty.jpg", "https://i.postimg.cc/9fn4gzgp/Bangladeshi-chubby-girl-fingering-her-fat-pussy.jpg", "https://i.postimg.cc/TYdRmfCY/shaggy-tits-Bangladeshi-girl-showing-her-boobies.jpg", "https://i.postimg.cc/8C89RbNB/sexy-Bangladeshi-girl-playing-with-her-boobs.jpg", "https://i.postimg.cc/SsxrCX2f/beautiful-Pakistani-girl-showing-her-big-melons.jpg", "https://i.postimg.cc/kM6nvTdL/Desi-girl-pumping-her-own-boobs-on-selfie-cam.jpg", "https://i.postimg.cc/gkWfLscV/Beautiful-Bangladeshi-sexy-girl-leaked-video.jpg", "https://i.postimg.cc/fb9KK4BJ/beautiful-Bangladeshi-girl-toying-with-her-big-boobs.jpg", "https://i.postimg.cc/zvXK44Sw/cute-BD-girl-full-nude-show-for-lover.jpg", "https://i.postimg.cc/15XDBhzs/busty-sexy-escort-Bhabhi-captured-nude-after-sex.jpg", "https://i.postimg.cc/k4wtNf32/Sexy-Desi-eunuch-shows-her-boobs.jpg", "https://i.postimg.cc/90K01kxQ/mature-Indian-girl-Shows-boobs-and-pussy.jpg", "https://i.postimg.cc/3wtKn6NQ/mature-village-girl-showing-her-hunger-for-dick.jpg", "https://i.postimg.cc/qR9gxYDM/beautiful-sexy-girl-showing-her-cute-titties.jpg", "https://i.postimg.cc/NfxfK5t0/cute-skinny-girl-fingering-her-small-pussy-on-VC.jpg", "https://i.postimg.cc/h41qr65y/beautiful-girl-fingering-pussy-with-horny-expressions.jpg", "https://i.postimg.cc/9f5xsF4G/beautiful-Bangladeshi-wife-showing-her-topless-beauty.jpg", "https://i.postimg.cc/0jTmrr1n/Dehati-wife-showing-her-white-pussy-on-video-call.jpg", "https://i.postimg.cc/T2FsvX4Y/Dehati-cute-wife-showing-her-sexy-white-boobs.jpg", "https://i.postimg.cc/x14Jttd7/beautiful-Bengali-girl-saree-striptease-show.jpg", "https://i.postimg.cc/Y0RjgxVd/Indian-girl-showing-boobs-while-bathing-nude.jpg", "https://i.postimg.cc/g2nrX8KK/cute-Desi-girl-showing-pussy-for-BF.jpg", "https://i.postimg.cc/FsbwyBTr/received-834398520401522.jpg", "https://i.postimg.cc/K8mYBwJ1/beautiful-big-boob-Bangladeshi-sexy-girl-showing.jpg", "https://i.postimg.cc/gkNCt7GX/Bengali-tall-girl-riding-dick-of-lover-MMS.jpg", "https://i.postimg.cc/63rSrjHQ/Bangladeshi-cute-girl-showing-her-topless-beauty.jpg", "https://i.postimg.cc/ydyQgJdg/big-boobs-wife-screaming-in-pain-and-pleasure.jpg", "https://i.postimg.cc/43q76wYj/Beautiful-sweet-GF-showing-her-naked-pussy-on-VC.jpg", "https://i.postimg.cc/gJ7D6vp0/hot-super-sexy-maal-showing-her-cute-boobies.jpg", "https://i.postimg.cc/65x9dgYd/big-boobs-sexy-girl-teasing-with-her-huge-melons.jpg", "https://i.postimg.cc/76cL8L3c/horny-Bangla-girl-fingering-pussy-thinking-of-BF.jpg"
];

module.exports = {
    config: {
        name: "bdsex",
        aliases: ["pompom", "sex"],
        role: 1,
        cooldown: 5,
        prefix: true,
        credit: "MOHAMMAD BADOL",
        description: "Serial based Desi Hot images"
    },

    onStartBadol: async (api, event, args) => {
        const { threadID } = event;

        try {
            // ফোল্ডার ও জেসন ফাইল অটো চেক ও তৈরি
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            if (!fs.existsSync(bdPointerPath)) fs.writeJsonSync(bdPointerPath, { lastIndex: -1 });

            let pointer = fs.readJsonSync(bdPointerPath);
            let nextIndex = pointer.lastIndex + 1;
            if (nextIndex >= photos.length) nextIndex = 0;

            pointer.lastIndex = nextIndex;
            fs.writeJsonSync(bdPointerPath, pointer);

            const selectedPhoto = photos[nextIndex];
            const cachePath = path.join(CACHE_DIR, `bd_${Date.now()}.jpg`);

            const response = await axios.get(selectedPhoto, { responseType: 'arraybuffer' });
            fs.writeFileSync(cachePath, Buffer.from(response.data));

            await api.sendMessage({
                body: `┏━━━━━━━◥◣◆◢◤━━━━━━━┓\n        🔥 𝐁𝐃 𝐒𝐄𝐗 𝐙𝐎𝐍𝐄 🔥\n┗━━━━━━━◢◤◆◥◣━━━━━━━┛\n\n🔢 Serial: ${nextIndex + 1} / ${photos.length}\n👤 Dev: MOHAMMAD BADOL\n✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐁𝐀𝐃𝐎𝐋-𝐁𝐎𝐓-V5`,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            });

        } catch (error) {
            api.sendMessage("❌ ইমেজ লোড করতে সমস্যা হয়েছে।", threadID);
        }
    }
};
