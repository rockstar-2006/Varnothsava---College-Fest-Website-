import { Firestore } from '@google-cloud/firestore';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

/**
 * REAL PRODUCTION-GRADE ADMINISTRATIVE ACCESS
 * This implementation uses the Google Cloud SDKs directly.
 * It provides full administrative privileges (bypassing Firestore rules)
 * and uses your service-account.json for authentication.
 */

let serviceAccount: any = null;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
        const fullPath = path.join(process.cwd(), 'src/lib/service-account.json');
        if (fs.existsSync(fullPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        }
    }
} catch (err) {
    console.error("FATAL: Failed to load service account:", err);
}

// 1. Initialize Real Admin Firestore
export const adminDb = new Firestore({
    projectId: serviceAccount?.project_id,
    credentials: {
        client_email: serviceAccount?.client_email,
        private_key: serviceAccount?.private_key,
    },
});

// 2. Real Token Verification using Google Auth Library
export async function verifyAuthToken(token: string) {
    if (!token) throw new Error("No token provided");

    try {
        // Verify token via Google's Identity Toolkit REST API (The real production method)
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token }),
            }
        );

        const data = await response.json();
        if (!response.ok || !data.users || data.users.length === 0) {
            throw new Error(data.error?.message || "Invalid or expired token");
        }

        const user = data.users[0];
        return {
            uid: user.localId,
            email: user.email,
            email_verified: user.emailVerified,
            name: user.displayName,
        };
    } catch (error) {
        console.error("Auth Verification Error:", error);
        throw error;
    }
}

// 3. Compatibility Exports
export const adminAuth = {
    verifyIdToken: async (token: string) => verifyAuthToken(token),
};

export const usersCollection = adminDb.collection('users');
export const db = adminDb;