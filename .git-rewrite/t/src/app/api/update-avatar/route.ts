import { usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";

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
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const verified = await verifyAuthToken(token);
        if (!verified) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        if (!data || !data.avatar) {
            return NextResponse.json({ message: "Missing avatar data" }, { status: 400 });
        }

        if (!usersCollection) {
            throw new Error("Database not initialized");
        }

        await usersCollection.doc(verified.uid).update({
            avatar: data.avatar,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ message: "Avatar updated" }, { status: 200 });

    } catch (error: any) {
        console.error("Avatar Update Error:", error);
        return NextResponse.json({ message: "Error", detail: error.message }, { status: 500 });
    }
}
