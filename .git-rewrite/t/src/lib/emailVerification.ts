import { sendEmailVerification } from 'firebase/auth';
import { auth } from './firebaseClient';

/**
 * Send email verification to current user
 */
export async function sendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    try {
        const user = auth.currentUser;

        if (!user) {
            return { success: false, message: 'No user is currently signed in' };
        }

        if (user.emailVerified) {
            return { success: false, message: 'Email is already verified' };
        }

        await sendEmailVerification(user, {
            url: `${window.location.origin}/profile`,
            handleCodeInApp: false,
        });

        return { success: true, message: 'Verification email sent successfully' };
    } catch (error: any) {
        console.error('Email verification error:', error);

        // Handle specific Firebase errors
        if (error.code === 'auth/too-many-requests') {
            return { success: false, message: 'Too many requests. Please try again later.' };
        }

        return { success: false, message: 'Failed to send verification email' };
    }
}

/**
 * Check if current user's email is verified
 */
export function isEmailVerified(): boolean {
    return auth.currentUser?.emailVerified || false;
}

/**
 * Reload user to get latest email verification status
 */
export async function reloadUserVerificationStatus(): Promise<boolean> {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        await user.reload();
        return user.emailVerified;
    } catch (error) {
        console.error('Failed to reload user:', error);
        return false;
    }
}
