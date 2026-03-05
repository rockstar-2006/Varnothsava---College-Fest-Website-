
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/lib/service-account.json'), 'utf8'));

if (require('firebase-admin/app').getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

async function checkIds() {
    const regsSnap = await db.collection('registrations').get();
    const ids = new Set();
    regsSnap.forEach(doc => {
        ids.add(doc.data().eventId || doc.data().EventID);
    });
    console.log("All Unique Event IDs in Registrations:", Array.from(ids));
}

checkIds();
