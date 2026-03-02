const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const auth = admin.auth();
const db = admin.firestore();

async function setupAdmins() {
    const adminEmail = 'admin@varnothsava.in';
    const adminPass = 'admin@2026';

    const coordEmail = 'coordinator@varnothsava.in';
    const coordPass = 'coord@2026';

    console.log('--- SETTING UP ADMINS ---');

    try {
        // 1. Setup SUPER_ADMIN
        let adminUser;
        try {
            adminUser = await auth.getUserByEmail(adminEmail);
            console.log('Admin user already exists in Auth.');
        } catch (e) {
            adminUser = await auth.createUser({
                email: adminEmail,
                password: adminPass,
                displayName: 'System Admin'
            });
            console.log('Admin user created in Auth.');
        }

        await db.collection('users').doc(adminUser.uid).set({
            id: adminUser.uid,
            name: 'System Admin',
            email: adminEmail,
            role: 'SUPER_ADMIN',
            hasPaid: true,
            studentType: 'internal',
            createdAt: new Date().toISOString()
        }, { merge: true });
        console.log('Admin profile updated in Firestore.');

        // 2. Setup COORDINATOR
        let coordUser;
        try {
            coordUser = await auth.getUserByEmail(coordEmail);
            console.log('Coordinator user already exists in Auth.');
        } catch (e) {
            coordUser = await auth.createUser({
                email: coordEmail,
                password: coordPass,
                displayName: 'Event Coordinator'
            });
            console.log('Coordinator user created in Auth.');
        }

        await db.collection('users').doc(coordUser.uid).set({
            id: coordUser.uid,
            name: 'Event Coordinator',
            email: coordEmail,
            role: 'COORDINATOR',
            hasPaid: true,
            studentType: 'internal',
            createdAt: new Date().toISOString()
        }, { merge: true });
        console.log('Coordinator profile updated in Firestore.');

        console.log('--- SETUP COMPLETE ---');
        console.log(`Admin Login: ${adminEmail} / ${adminPass}`);
        console.log(`Coord Login: ${coordEmail} / ${coordPass}`);

    } catch (error) {
        console.error('Setup failed:', error);
    } finally {
        process.exit();
    }
}

setupAdmins();
