import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, registrationsCollection } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        if (!adminAuth || !adminDb) {
            return NextResponse.json({ message: 'Firebase Admin not initialized' }, { status: 500 });
        }
        const decodedToken = await adminAuth.verifyIdToken(token);
        if(!decodedToken) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const uid = decodedToken.uid;

        const { name, usn, phone, collegeName } = await req.json();

        if (!name || !usn || !phone || !collegeName) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const userRef = adminDb.collection('users').doc(uid);
        await userRef.update({
            name,
            usn,
            phone,
            collegeName,
            updatedAt: new Date().toISOString()
        });

        const updatedDoc = await userRef.get();
        let userData = updatedDoc.data();

        const registrations = await registrationsCollection.where('members', 'array-contains', uid).get();
        const registeredEvents = registrations.docs.map(doc => ({id: doc.id, data: doc.data()})).map(reg => ({ id: reg.id, eventId: reg.data.eventId, teamName: reg.data.teamName }));
        userData = {
            ...userData,
            hasPaid: userData?.hasPaid === true,
            hasRoboSoccer: userData?.hasRoboSoccer === true,
            registeredEvents: registeredEvents
        };

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: uid,
                ...userData
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}
