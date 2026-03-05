
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

async function countUsers() {
    const snapshot = await db.collection('users').get();
    console.log(`Total users in collection: ${snapshot.size}`);

    const roles = {};
    snapshot.docs.forEach(doc => {
        const r = doc.data().role || 'USER';
        roles[r] = (roles[r] || 0) + 1;
    });
    console.log("Roles split:", roles);
}

countUsers().catch(console.error);
