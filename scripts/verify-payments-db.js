const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const sa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!sa) { console.error('No key'); process.exit(1); }
const serviceAccount = JSON.parse(sa);

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function run() {
    try {
        console.log('Fetching payments...');
        const pSnap = await db.collection('payments').where('status', '==', 'captured').get();
        const payments = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log(`Found ${payments.length} captured payments.`);

        const userIds = [...new Set(payments.map(p => p.user_id).filter(id => !!id))];
        console.log(`Found ${userIds.length} unique user IDs.`);

        const userMap = {};
        for (let i = 0; i < userIds.length; i += 10) {
            const chunk = userIds.slice(i, i + 10);
            const uSnap = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', chunk).get();
            uSnap.docs.forEach(d => userMap[d.id] = d.data());
        }

        let internalRev = 0, externalRev = 0, internalCount = 0, externalCount = 0;

        payments.forEach(p => {
            const amt = (p.amount || 0) / 100;
            const user = userMap[p.user_id];
            const college = (user?.collegeName || '').toUpperCase();

            if (college.includes('SMVITM') || user?.studentType === 'internal') {
                internalCount++;
                internalRev += amt;
            } else {
                externalCount++;
                externalRev += amt;
            }
        });

        console.log('\n--- VERIFIED TOTALS ---');
        console.log(`Total: ₹${(internalRev + externalRev).toLocaleString()}`);
        console.log(`Internal: ${internalCount} (₹${internalRev.toLocaleString()})`);
        console.log(`External: ${externalCount} (₹${externalRev.toLocaleString()})`);
        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e.stack);
        process.exit(1);
    }
}
run();
