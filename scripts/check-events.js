
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

async function checkEventFields() {
    const doc = await db.collection('events').doc('TECH-002').get();
    console.log("TECH-002 Data:", doc.data());
}

checkEventFields().catch(console.error);
