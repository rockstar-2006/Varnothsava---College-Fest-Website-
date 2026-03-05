const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || fs.readFileSync(path.join(__dirname, '../service-account.json'), 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function listEvents() {
    const eventsSnap = await db.collection('events').get();
    console.log(`Total events in Firestore: ${eventsSnap.size}`);
    eventsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id} | Title: ${data.title} | Type: ${data.type}`);
    });
}

listEvents().catch(console.error);
