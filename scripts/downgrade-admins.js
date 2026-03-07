const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || fs.readFileSync(path.join(__dirname, '../service-account.json.json'), 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const emailsToDowngrade = [
    'tejas.23cs173@sode-edu.in',
    'chitkala.22cs043@sode-edu.in',
    'bhagyashree.22cs038@sode-edu.in',
    'shreya.22cs146@sode-edu.in',
    'chirashree.23cs031@sode-edu.in',
    'dheeraj.23ec020@sode-edu.in',
    'sadhana.23ec058@sode-edu.in',
    'sathwik.23ad039@sode-edu.in',
    'advaith.23cs005@sode-edu.in',
    'kaushik.23ec030@sode-edu.in',
    'fathimath.23cs038@sode-edu.in',
    'afeefa.23cs006@sode-edu.in',
    'pratiksha.23ec038@sode-edu.in',
    'maansi.23ec034@sode-edu.in',
    'abhishek.23cs001@sode-edu.in',
    'suraj.23ad055@sode-edu.in',
    'ananya.23ai006@sode-edu.in',
    'yathika.23ad062@sode-edu.in',
    'sneha.23cs161@sode-edu.in',
    'amrutha.23ad002@sode-edu.in',
    'chethan.23ai016@sode-edu.in',
    'avani.22cs107@sode-edu.in',
    'bhushan.23ad026@sode-edu.in',
    'deepa.23cs034@sode-edu.in',
    'sanjana.23ec063@sode-edu.in',
    'shreekiran.23ad044@sode-edu.in',
    'riston.23ad035@sode-edu.in',
    'samarth.22cs133@sode-edu.in',
    'nishanth.22ai027@sode-edu.in',
    'akash.23ai002@sode-edu.in',
    'vaishnavi.22ai054@sode-edu.in',
    'roylene.22cs131@sode-edu.in',
    'reynol.23cs119@sode-edu.in',
    'srinidhisrinibhat@gmail.com',
    'prerana.23ec051@sode-edu.in',
    'nishmitha.23ec039@sode-edu.in',
    'arwin.24ba007@sode-edu.in',
    'shravya.24ba044@sode-edu.in',
    'sannidhi.24ba040@sode-edu.in',
    'shruthi.24ba047@sode-edu.in',
    'krithika.24ba022@sode-edu.in',
    'rashmitha.24ba038@sode-edu.in',
    'kamath.23cs054@sode-edu.in',
    'shivaprasad.23ad043@sode-edu.in',
    'pragathi.23ad028@sode-edu.in',
    'viraj.23ai059@sode-edu.in'
];

async function downgradeAndUnblockUsers() {
    console.log(`Starting to downgrade and unblock ${emailsToDowngrade.length} users in Firestore...`);

    let updatedCount = 0;

    for (const email of emailsToDowngrade) {
        try {
            const userSnap = await db.collection('users')
                .where('email', '==', email)
                .get();

            if (userSnap.empty) {
                continue;
            }

            const batch = db.batch();
            userSnap.docs.forEach(doc => {
                batch.update(doc.ref, {
                    role: admin.firestore.FieldValue.delete(),
                    eventId: admin.firestore.FieldValue.delete(),
                    isBlocked: false // Ensure they are unblocked
                });
            });

            await batch.commit();
            updatedCount++;
        } catch (error) {
            console.error(`[!] Error updating ${email}:`, error.message);
        }
    }

    console.log(`Successfully Downgraded and Unblocked: ${updatedCount} users.`);
    process.exit(0);
}

downgradeAndUnblockUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
