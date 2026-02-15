import { usersCollection, verifyAuthToken } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit, getClientIdentifier } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ message: "Code parameter is required." }, { status: 400 });
        }

        // Optional: Check if the requester is logged in (authorized)
        // const authHeader = request.headers.get('Authorization') || '';
        // if (!authHeader.startsWith('Bearer ')) {
        //     return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        // }

        if (!usersCollection) {
            return NextResponse.json({ message: "Database error." }, { status: 500 });
        }

        // Query by profileCode
        const snapshot = await usersCollection.where('profileCode', '==', code.toUpperCase()).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Selective data return (privacy)
        const publicUser = {
            name: userData.name,
            collegeName: userData.collegeName,
            phone: userData.phone,
            usn: userData.usn,
            hasPaid: userData.hasPaid,
            avatar: userData.avatar,
            profileCode: userData.profileCode,
            studentType: userData.studentType
        };

        return NextResponse.json({ user: publicUser }, { status: 200 });

    } catch (error: any) {
        console.error("UserByCode API Error:", error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}
