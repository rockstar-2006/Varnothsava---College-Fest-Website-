import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, User, getIdToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';

// SECURITY: Load Firebase config from environment variables
// Never hardcode credentials in source code
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
        'Missing required Firebase environment variables. ' +
        'Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.'
    );
}

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);

let userCallback: ((user: User) => void) | null = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log("User is signed in:", user.email);
        }
        if (typeof userCallback === "function") {
            userCallback(user);
        }
    } else {
        if (process.env.NODE_ENV === 'development') {
            console.log("No user is signed in.");
        }
    }
});

export function onUserSignedIn(callback: (user: User) => void) {
    userCallback = callback;
}

export function loginRequired() {
    return auth.currentUser !== null;
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}

export function getAuthToken(): Promise<string | null> {
    if (!auth.currentUser) {
        return Promise.resolve(null);
    }
    return getIdToken(auth.currentUser) || Promise.resolve(null);
}

export function createUserWithEmail(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                resolve(userCredential.user);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

export function loginWithEmail(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                resolve(userCredential.user);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

export function loginWithGoogle(): Promise<User> {
    return new Promise((resolve, reject) => {
        const provider = new GoogleAuthProvider();
        // Try popup first; fall back to redirect if the browser blocks it
        signInWithPopup(auth, provider)
            .then((result) => {
                resolve(result.user);
            })
            .catch((error) => {
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                    // Fall back to redirect flow
                    signInWithRedirect(auth, provider).catch(reject);
                    // The result will be picked up on the next page load via getRedirectResult
                    // We reject with a special signal so callers can show a loading state
                    reject({ code: 'auth/redirect-started', message: 'Redirecting to Google Sign-In...' });
                } else {
                    reject(error);
                }
            });
    });
}

// Call this once on app load to capture the redirect sign-in result
export async function handleGoogleRedirectResult(): Promise<User | null> {
    try {
        const result = await getRedirectResult(auth);
        return result?.user ?? null;
    } catch (error) {
        console.error('Redirect result error:', error);
        return null;
    }
}

export function signOut() {
    auth.signOut().then(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("User signed out.");
        }
    }).catch((error) => {
        console.error("Sign out error:", error.code);
    });
}