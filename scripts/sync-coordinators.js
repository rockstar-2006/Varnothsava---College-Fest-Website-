const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local for Firebase Service Account
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Use the local service-account.json if available, otherwise from env
let serviceAccount;
const saPath = path.resolve(__dirname, '../service-account.json.json'); // Note the double .json in root
if (fs.existsSync(saPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
} else {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const auth = admin.auth();
const db = admin.firestore();

// 1. Get Coordinator Map from Admin Utility
const adminLibPath = path.resolve(__dirname, '../src/lib/admin.ts');
const adminLibContent = fs.readFileSync(adminLibPath, 'utf8');
const coordMapMatch = adminLibContent.match(/export const COORDINATOR_MAP: Record<string, string> = (\{[\s\S]+?\});/);
const COORDINATOR_MAP = eval('(' + coordMapMatch[1] + ')');

// 2. Get missions (IDs to titles)
const missionsPath = path.resolve(__dirname, '../src/data/missions.ts');
const missionsContent = fs.readFileSync(missionsPath, 'utf8');
const eventMap = {};
const eventRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"]/g;
let match;
while ((match = eventRegex.exec(missionsContent)) !== null) {
    eventMap[match[1]] = match[2].trim();
}

// Special case for all or combined
eventMap['all'] = 'coordinator@2026'; // Default for master coordinator

async function sync() {
    console.log(`Syncing ${Object.keys(COORDINATOR_MAP).length} coordinators...`);

    for (const [email, eventId] of Object.entries(COORDINATOR_MAP)) {
        if (email.includes('admin@') || email.includes('rockstarsouza')) continue;

        // Determine password
        let password = 'Varnothsava2026'; // Default password for all coordinators
        if (eventId === 'all') {
            password = 'coord@2026'; // Hardcoded for master
        }


        // Firebase requires passwords to be at least 6 characters
        if (password.length < 6) {
            password = password + "@2026";
        }

        console.log(`Processing: ${email} (Password: ${password})`);

        try {
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(email);
                await auth.updateUser(userRecord.uid, {
                    password: password
                });
                console.log(`  Updated Auth for ${email}`);
            } catch (e) {
                userRecord = await auth.createUser({
                    email: email,
                    password: password,
                    displayName: email.split('.')[0]
                });
                console.log(`  Created Auth for ${email}`);
            }

            // Update Firestore role
            await db.collection('users').doc(userRecord.uid).set({
                email: email,
                role: 'COORDINATOR',
                eventId: eventId,
                hasPaid: true,
                studentType: 'internal'
            }, { merge: true });
            console.log(`  Updated Firestore for ${email}`);

        } catch (err) {
            console.error(`  Failed for ${email}: ${err.message}`);
        }
    }

    console.log('--- SYNC COMPLETE ---');
    process.exit();
}

sync();
