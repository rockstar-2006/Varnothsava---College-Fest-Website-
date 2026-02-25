import * as admin from 'firebase-admin';

/**
 * REAL PRODUCTION-GRADE ADMINISTRATIVE ACCESS
 * This implementation uses the official firebase-admin SDK.
 */

let serviceAccount: any = null;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        if (serviceAccount && serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    }
} catch (err) {
    console.error("FATAL: Failed to load service account:", err);
}

if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// 1. Admin Firestore
export const adminDb = admin.firestore();

// 2. Auth Utilities
export const adminAuth = admin.auth();

export async function verifyAuthToken(token: string) {
    if (!token) return null;
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            name: (decodedToken as any).name,
            role: decodedToken.role // Extract role claim if present
        };
    } catch (error) {
        console.error("Auth Verification Error:", error);
        return null;
    }
}

// 3. Custom Claims Helper
export async function setAdminRole(uid: string, role: string) {
    try {
        await adminAuth.setCustomUserClaims(uid, { role });
        return true;
    } catch (error) {
        console.error("Error setting custom claims:", error);
        return false;
    }
}

// 4. Compatibility Exports
export const usersCollection = adminDb.collection('users');
export const registrationsCollection = adminDb.collection('registrations');
export const db = adminDb;
export const fieldValue = admin.firestore.FieldValue;
