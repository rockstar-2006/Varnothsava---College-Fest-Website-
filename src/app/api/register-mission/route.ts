import { registrationsCollection, usersCollection, verifyAuthToken, adminDb, fieldValue } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";
import { missions } from "@/data/missions";

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request);
        const rateLimitResult = await checkApiRateLimit(clientId);
        if (!rateLimitResult.success) {
            return NextResponse.json({ message: "Too many requests" }, { status: 429 });
        }

        const authHeader = request.headers.get('Authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: "Unauthorized: Missing token." }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized: Invalid token." }, { status: 401 });
        }

        const { eventId, teamName, members } = await request.json();

        if (!eventId || !teamName) {
            return NextResponse.json({ message: "Missing registration details." }, { status: 400 });
        }

        if (!teamName.trim() || teamName.trim().length < 2 || teamName.trim().length > 50) {
            return NextResponse.json({ message: "Team name must be 2-50 characters" }, { status: 400 });
        }

        if (!usersCollection) {
            return NextResponse.json({ message: "Database Error." }, { status: 500 });
        }

        const mission = missions.find(m => m.id === eventId);
        if (!mission) {
            return NextResponse.json({ message: "Invalid mission ID." }, { status: 400 });
        }

        // Time-based registration window for TECH-002 (Prompt to Product): 7 PM - 8 PM today (IST)
        if (eventId === "TECH-002") {
            // Get current time in IST (UTC+5:30)
            const now = new Date();
            const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const hours = istTime.getHours();
            const minutes = istTime.getMinutes();
            const currentTimeInMinutes = hours * 60 + minutes;
            const openTime = 19 * 60; // 7 PM (1140 minutes)
            const closeTime = 20 * 60; // 8 PM (1200 minutes)

            // Check if current time is within 7 PM - 8 PM
            if (currentTimeInMinutes < openTime || currentTimeInMinutes >= closeTime) {
                return NextResponse.json({ message: "Registration for this event has closed. Registration opens at 7:00 PM IST." }, { status: 400 });
            }

            // Email domain filtering: Only allow external users (non-sode-edu.in)
            const userEmail = (verified.email || '').toLowerCase();
            if (userEmail.endsWith('@sode-edu.in')) {
                return NextResponse.json({ message: "Only external participants (non-SODE) can register for this event." }, { status: 400 });
            }
        }

        const isTeamEvent = (mission.maxTeamSize ?? 1) > 1;
        const minSize = mission.minTeamSize ?? 1;
        const maxSize = mission.maxTeamSize ?? 1;

        if (!members || !Array.isArray(members) || members.length < minSize || members.length > maxSize) {
            return NextResponse.json({ message: `Invalid number of members for this event. Required: ${minSize} - ${maxSize}.` }, { status: 400 });
        }

        let memberIds: string[] = [];
        for (const memberCode of members) {
            const memberDoc = await usersCollection.where('profileCode', '==', memberCode).get();
            if (memberDoc.empty) {
                return NextResponse.json({ message: `Member with profile code ${memberCode} not found.` }, { status: 400 });
            }
            const memberData = memberDoc.docs[0].data();
            if (memberData.hasPaid !== true) {
                return NextResponse.json({ message: `Member with profile code ${memberCode} has not completed payment.` }, { status: 400 });
            }
            
            // Email domain filtering for TECH-002: Only external users
            if (eventId === "TECH-002") {
                const memberEmail = (memberData?.email || '').toLowerCase();
                if (memberEmail.endsWith('@sode-edu.in')) {
                    return NextResponse.json({ message: `Member with profile code ${memberCode} has an internal email. Only external participants can register for this event.` }, { status: 400 });
                }
            }
            
            if (memberData.id === verified.uid) {
                if (eventId === "TECH-008" && memberData.hasRoboSoccer !== true) {
                    return NextResponse.json({ message: `Team leader with profile code ${memberCode} has not paid for Robo Soccer registration.` }, { status: 400 });
                }
            }
            let existingRegistration = await registrationsCollection.where('eventId', '==', eventId).where('members', 'array-contains', memberData.id).get();
            if (!existingRegistration.empty) {
                return NextResponse.json({ message: `Member with profile code ${memberCode} is already registered for this event.` }, { status: 400 });
            }
            memberIds.push(memberData.id);
        }

        // Verify team leader is in the members list
        if (!memberIds.includes(verified.uid)) {
            return NextResponse.json({ message: "Team leader must be included in the members list." }, { status: 400 });
        }

        // Find team leader's student type for stats (compute from source data, not just stored field)
        const leaderDoc = await usersCollection.doc(verified.uid).get();
        const leaderData = leaderDoc.data();

        // Compute leaderType from actual source data for accuracy
        const leaderCollege = (leaderData?.collegeName || leaderData?.college || leaderData?.institution || '').toUpperCase();
        const leaderEmail = (leaderData?.email || verified.email || '').toLowerCase();
        const leaderIsInternal =
            leaderCollege.includes('SMVITM') ||
            leaderCollege.includes('SODE') ||
            leaderCollege.includes('SHRI MADHWA VADIRAJA') ||
            leaderCollege.includes('SHRI MADHWA') ||
            leaderCollege.includes('VADIRAJA') ||
            leaderEmail.endsWith('@sode-edu.in');
        const leaderType = leaderIsInternal ? 'internal' : 'external';

        // Auto-correct stored studentType if it doesn't match computed value
        if (leaderData?.studentType !== leaderType) {
            usersCollection.doc(verified.uid).update({ studentType: leaderType }).catch(console.error);
        }

        const registrationData = {
            eventId,
            teamName,
            teamLeader: verified.uid,
            leaderType,
            members: memberIds,
            eventType: isTeamEvent ? "GROUP" : "SOLO",
            registeredAt: new Date().toISOString()
        };

        const registrationRef = registrationsCollection.doc();
        const statsRef = adminDb.collection('system').doc('stats');

        const batch = adminDb.batch();
        batch.set(registrationRef, registrationData);
        batch.set(statsRef, {
            totalRegistrations: fieldValue.increment(1),
            [`reg_${eventId}_total`]: fieldValue.increment(1),
            [`reg_${eventId}_${leaderType}`]: fieldValue.increment(1)
        }, { merge: true });

        await batch.commit();

        console.log(`Mission registered: ${eventId} for ${verified.uid} type ${leaderType}`);

        // Phase 2: Post-Registration Communication (Email)
        const emailHtmlBody = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        .email-container { background-color: #050905; color: #ffffff; font-family: 'sans-serif'; padding: 40px; border: 1px solid #10b98133; border-radius: 24px; max-width: 600px; margin: auto; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .emerald { color: #10b981; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
                        .details-box { background: rgba(16, 185, 129, 0.05); border: 1px solid #10b98122; border-radius: 16px; padding: 20px; margin: 20px 0; }
                        .cta-button { background: #10b981; color: #000000; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 900; display: inline-block; margin: 20px 0; text-transform: uppercase; }
                        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 40px; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <div class="emerald">Mission_Initialized</div>
                            <h1 style="font-size: 32px; margin-top: 10px; color: #ffffff;">REGISTRATION CONFIRMED</h1>
                        </div>
                        <p>Greetings, <strong>${verified.name || 'Participant'}</strong>,</p>
                        <p>Your deployment for <strong>${mission.title}</strong> has been successfully initialized. You are now part of the Varnothsava 2k26 elite squad.</p>
                        <div class="details-box">
                            <h3 class="emerald" style="font-size: 14px; margin-bottom: 15px;">EVENT_DATA_STREAM</h3>
                            <p>📅 <strong>Date:</strong> ${mission.date || 'To be announced'}</p>
                            <p>⏰ <strong>Time:</strong> ${mission.time || 'Check schedule'}</p>
                            <p>📍 <strong>Location:</strong> ${mission.location || 'College Campus'}</p>
                            <p>📂 <strong>Team Name:</strong> ${teamName}</p>
                        </div>
                        <center>
                            <a href="https://chat.whatsapp.com/GExfV7X6Uv6H6b2vR8QWpB" class="cta-button">JOIN EVENT COMMUNITY</a>
                        </center>
                        <div class="footer">
                            <p>© 2026 Varnothsava. All signals authenticated.<br>Shri Madhwa Vadiraja Institute of Technology and Management.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        // Queue email for sending
        try {
            await adminDb.collection("mail").add({
                to: [verified.email],
                message: {
                    subject: `[Varnothsava 2026] Registration Confirmed: ${mission.title}`,
                    html: emailHtmlBody,
                },
                createdAt: new Date().toISOString()
            });
        } catch (emailError) {
            console.error("Failed to queue confirmation email:", emailError);
        }

        return NextResponse.json({
            message: "Mission registration successful.",
            registrationId: registrationRef.id
        }, { status: 200 });

    } catch (error: any) {
        console.error("Mission Registration Error:", error);
        return NextResponse.json({
            message: "Registration failed",
            detail: error.message
        }, { status: 500 });
    }
}
