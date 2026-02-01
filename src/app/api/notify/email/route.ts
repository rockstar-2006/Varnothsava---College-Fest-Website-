import { NextRequest, NextResponse } from 'next/server';
import { fieldValue, adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const notifRef = adminDb.collection('varnothsava-2026').doc("notifications");
        await notifRef.update({
            emails: fieldValue.arrayUnion(email)
        });

        return NextResponse.json({
            message: 'Notification email added successfully',
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}