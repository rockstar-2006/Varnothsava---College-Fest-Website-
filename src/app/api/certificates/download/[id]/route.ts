import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { generateCertificate } from '@/lib/certificateGenerator';
import path from 'path';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const startTime = Date.now();
        console.log(`[CERT] Request for ID: ${id}`);
        
        if (!id || id === 'undefined' || id === '[id]') {
            console.error('[CERT] Invalid ID provided');
            return NextResponse.json({ error: 'Invalid certificate ID' }, { status: 400 });
        }

        const tempDir = path.resolve('tmp/certificates');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const outputPath = path.join(tempDir, `${id}.png`);

        // Force a regeneration once to ensure fixes are applied
        // if (fs.existsSync(outputPath)) { ... }

        let userSnap = await adminDb.collection('users').where('profileCode', '==', id).limit(1).get();
        if (userSnap.empty) {
            console.log(`[CERT] Not found by profileCode, checking docId for ${id}`);
            const userDoc = await adminDb.collection('users').doc(id).get();
            if (!userDoc.exists) {
                console.error(`[CERT] Critical: User not found in DB for ID: ${id}`);
                return NextResponse.json({ error: 'User record not found' }, { status: 404 });
            }
            userSnap = { docs: [userDoc] } as any;
        }

        const userData = userSnap.docs[0].data();
        console.log(`[CERT] Found user: ${userData.name}, Paid: ${userData.hasPaid}`);

        if (!userData.hasPaid) {
            console.warn(`[CERT] Blocked: User ${id} has not paid`);
            return NextResponse.json({ error: 'Certificate only available for paid participants' }, { status: 403 });
        }

        const rawName = userData.name || 'PARTICIPANT';
        const rawCollege = userData.collegeName || userData.college || 'INSTITUTION';
        
        console.log(`[CERT] Generating for Name: "${rawName}", College: "${rawCollege}"`);
        
        try {
            await generateCertificate(rawName, rawCollege, outputPath);
            console.log(`[CERT] OK: Generated in ${Date.now() - startTime}ms`);
        } catch (genError: any) {
            console.error('[CERT] Generation Failed:', genError.message);
            throw genError;
        }

        const imageBuffer = fs.readFileSync(outputPath);
        
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="Certificate_${rawName.replace(/\s+/g, '_')}.png"`,
            },
        });

    } catch (err: any) {
        console.error('[CERT] CRASH:', err.stack);
        return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
    }
}
