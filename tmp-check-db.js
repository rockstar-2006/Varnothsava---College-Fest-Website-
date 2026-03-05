
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Path to your service account or env loading logic
// I'll try to use the existing .env file if available
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

let serviceAccount = null;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (serviceAccount && serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    }
} catch (err) {
    console.error("FATAL: Failed to load service account:", err);
}

if (!serviceAccount) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY not found or invalid JSON");
    process.exit(1);
}

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function check() {
    const events = await db.collection('events').get();
    console.log(`Events count: ${events.size}`);
    events.docs.forEach(doc => {
        console.log(`- ${doc.id}: ${doc.data().title} (${doc.data().type})`);
    });

    const regs = await db.collection('registrations').get();
    console.log(`Registrations count: ${regs.size}`);

    const uniqueEventIds = new Set();
    regs.docs.forEach(doc => {
        uniqueEventIds.add(doc.data().eventId);
    });

    console.log("Unique eventIds in registrations:", Array.from(uniqueEventIds));

    // 1. Peek into varnothsava-2026
    const v26 = await db.collection('varnothsava-2026').get();
    v26.docs.forEach(doc => {
        console.log(`varnothsava-2026 doc: ${doc.id}`);
        console.log(JSON.stringify(doc.data(), null, 2).substring(0, 500));
    });

    const collections = await db.listCollections();
    const colNames = collections.map(c => c.id);
    console.log("All root collections:", colNames);

    // 2. Brute force search for 'Solo-Singing' in all collections
    const targetId = 'Solo-Singing';
    for (const colName of colNames) {
        const snap = await db.collection(colName).doc(targetId).get();
        if (snap.exists) {
            console.log(`Bingo! Document ${targetId} exists in collection: ${colName}`);
        }
    }

    // 4. Check users for studentType
    const users = await db.collection('users').limit(5).get();
    console.log(`Users count: ${users.size}`);
    users.docs.forEach(doc => {
        console.log(`User ${doc.id}: type=${doc.data().studentType}`);
    });
}

check().catch(console.error);
