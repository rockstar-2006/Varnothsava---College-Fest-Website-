import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const {
            name,
            companyName,
            designation,
            contact,
            eventExperience,
            institutionImpression,
        } = data;

        // Basic validation
        if (!name || !companyName || !eventExperience || !institutionImpression) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Save to Firestore
        const feedbackRef = adminDb.collection('company_feedback').doc();
        await feedbackRef.set({
            name,
            companyName,
            designation: designation || 'Not Specified',
            contact: contact || 'Not Specified',
            eventExperience: Number(eventExperience),
            institutionImpression: Number(institutionImpression),
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, id: feedbackRef.id }, { status: 201 });
    } catch (error: any) {
        console.error('Error saving feedback:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
