import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, User, getIdToken } from 'firebase/auth';
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
        signInWithPopup(auth, provider)
            .then((result) => {
                resolve(result.user);
            })
            .catch((error) => {
                reject(error);
            });
    });
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