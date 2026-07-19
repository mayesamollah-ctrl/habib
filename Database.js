const fs = require('fs-extra');
const path = require('path');

// পাথ পরিবর্তন করা হলো: '../database.json' থেকে './database.json'
// এখন এটি ফাইলটিকে রুট ফোল্ডারেই খুঁজবে এবং তৈরি করবে
const dataPath = path.join(__dirname, 'database.json');

// ডিফল্ট ডেটা ফাইল তৈরি
if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, { threads: {}, users: {} });
}

module.exports = {
    getData: async (id, type = 'threads') => {
        const db = await fs.readJson(dataPath);
        return db[type][id] || { status: false, name: "BADOL GROUP" }; 
    },
    saveData: async (id, newData, type = 'threads') => {
        const db = await fs.readJson(dataPath);
        if (!db[type]) db[type] = {};
        db[type][id] = newData;
        await fs.writeJson(dataPath, db, { spaces: 4 });
    }
};
