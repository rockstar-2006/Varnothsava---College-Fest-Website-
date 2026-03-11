'use client'

import { auth, getAuthToken, getCurrentUser, loginRequired, loginWithEmail, signOut } from '@/lib/firebaseClient'
import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useState, useEffect } from 'react'

export interface UserData {
    id: string
    name: string
    email: string
    usn: string
    collegeName: string
    phone: string
    profileCode: string
    hasPaid: boolean
    registeredEvents: { id: string, teamName: string }[]
    avatar: string
    studentType: 'internal' | 'external'
    // Optional fields
    age?: string
    idCardUrl?: string
}

interface Event {
    id: string
    title: string
    type: 'Technical' | 'Cultural' | 'Gaming'
    fee: number
    visual: string
}

interface AppContextType {
    cart: Event[]
    addToCart: (event: Event) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    totalAmount: number
    isLoggedIn: boolean
    isInitializing: boolean
    needsOnboarding: boolean
    userData: UserData | null
    login: (email: string, password: string) => void
    logout: () => void
    registerUser: (data: Omit<UserData, 'id' | 'email' | 'profileCode' | 'hasPaid' | 'registeredEvents' | 'avatar' | 'studentType'>) => void
    markAsPaid: () => void
    registerMission: (eventId: string, teamName: string, members: string[]) => Promise<boolean>
    updateAvatar: (avatarUrl: string) => void,
    updateProfile: (data: { name: string, usn: string, phone: string, collegeName: string }) => Promise<boolean>,
    mountUser: () => Promise<void>,
    isSiteLoaded: boolean,
    setIsSiteLoaded: (val: boolean) => void,
    pageTheme: PageTheme,
    setPageTheme: (theme: PageTheme) => void
}

export type PageTheme = {
    name: string;
    rgb: string;
    primary: string;
}

const DEFAULT_THEME: PageTheme = {
    name: 'DEFAULT',
    rgb: '16, 185, 129', // Emerald
    primary: '#10b981'
}

const AppContext = createContext<AppContextType | undefined>(undefined)

async function getUserData(currentUser?: any) {
    let token = null;
    if (currentUser) {
        token = await currentUser.getIdToken();
    } else {
        token = await getAuthToken();
    }

    if (!token) {
        return null;
    }

    try {
        const response = await fetch('/api/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            return null; // Gracefully handle new users
        }

        if (!response.ok) {
            console.error("Profile Fetch Error:", response.status, response.statusText);
            return null;
        }
        const data = await response.json();
        return data.user;
    } catch (err) {
        console.error("Network error fetching user data:", err);
        return null;
    }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Event[]>([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isInitializing, setIsInitializing] = useState(true)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [needsOnboarding, setNeedsOnboarding] = useState(false)
    const [isSiteLoaded, setIsSiteLoaded] = useState(false)
    const [pageTheme, setPageTheme] = useState<PageTheme>(DEFAULT_THEME)
    const router = useRouter();

    // Sync state with CSS Variable for global access
    useEffect(() => {
        document.documentElement.style.setProperty('--nav-current-theme', pageTheme.rgb);
    }, [pageTheme]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (process.env.NODE_ENV === 'development') {
                console.log("Auth state changed:", user?.email || 'No user');
            }
            if (user) {
                mountUser(user);
            } else {
                // User logged out - reset all state
                setIsLoggedIn(false);
                setUserData(null);
                setNeedsOnboarding(false);
                setIsInitializing(false);
                setCart([]); // Clear cart on logout
            }
        });
        return () => unsubscribe();
    }, []);

    // On mount, check auth and user profile
    const mountUser = async (passedUser?: any) => {
        const currentUser = passedUser || auth.currentUser;
        if (currentUser) {
            setIsInitializing(true);
            try {
                const data = await getUserData(currentUser);
                if (data) {
                    // User has complete profile
                    setUserData(data);
                    setIsLoggedIn(true);
                    setNeedsOnboarding(false);
                } else {
                    // User is authenticated but no profile in database
                    // This means they need to complete registration
                    setUserData(null);
                    setIsLoggedIn(true);
                    setNeedsOnboarding(true);

                    // If they're on profile page, redirect to login to complete registration
                    if (window.location.pathname === '/profile') {
                        router.push('/login');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // On error, assume they need to register
                setUserData(null);
                setIsLoggedIn(true);
                setNeedsOnboarding(true);
            } finally {
                setIsInitializing(false);
            }
        } else {
            // No user logged in
            setIsLoggedIn(false);
            setUserData(null);
            setNeedsOnboarding(false);
            setIsInitializing(false);
        }
    }

    const addToCart = (event: Event) => {
        if (!cart.find(item => item.id === event.id)) {
            setCart([...cart, event])
        }
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const clearCart = () => setCart([])

    const totalAmount = cart.reduce((total, item) => total + item.fee, 0)

    const login = async (email: string, password: string) => {
        if (email === '' || password === '') {
            alert("Please enter both email and password.")
            return;
        }

        try {
            const user = await loginWithEmail(email, password);
            if (user) {
                const data = await getUserData(user);
                if (data) {
                    setUserData(data);
                    setIsLoggedIn(true);
                    setNeedsOnboarding(false);
                } else {
                    // Authenticated but no user profile in DB
                    setUserData(null);
                    setIsLoggedIn(true);
                    setNeedsOnboarding(true);
                }
            } else {
                alert("Invalid credentials or user not found. Please register.")
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please check your credentials and try again.")
        }
    }

    const logout = () => {
        signOut();
        setIsLoggedIn(false);
        setUserData(null);
        setNeedsOnboarding(false);
        setCart([]); // Clear cart
        setIsInitializing(false); // Ensure not stuck in loading

        // Redirect to login page
        router.push('/login');
    }

    const registerUser = async (data: Omit<UserData, 'id' | 'email' | 'profileCode' | 'hasPaid' | 'registeredEvents' | 'avatar' | 'studentType'>) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert("No authenticated session found.");
            return;
        }

        try {
            const token = await getAuthToken();
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user: data }),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    const errMsg = errorData.detail
                        ? `${errorData.message}: ${errorData.detail}`
                        : (errorData.message || 'Failed to register user');
                    throw new Error(errMsg);
                } else {
                    const errorText = await response.text();
                    console.error("Server Error (HTML):", errorText);
                    throw new Error("Server returned an error. Please check the logs.");
                }
            }

            const resData = await response.json();
            console.log('Registration complete:', resData);

            // Update local state with server-confirmed data
            setUserData(resData.user);
            setIsLoggedIn(true);
            setNeedsOnboarding(false);

            return resData.user;
        } catch (error: any) {
            console.error('Error registering user:', error);
            alert(`Registration failed: ${error.message}`);
        }
    }

    const markAsPaid = () => {
        if (userData) {
            setUserData({ ...userData, hasPaid: true })
        }
    }

    const registerMission = async (eventId: string, teamName: string, members: string[]) => {
        if (!userData) return false;
        try {
            const token = await getAuthToken();
            const response = await fetch('/api/register-mission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ eventId, teamName, members }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Mission registration failed');
            }
            const data = await response.json();
            setUserData({
                ...userData,
                registeredEvents: data.registeredEvents
            });
            return true;
        } catch (error: any) {
            console.error('Mission Registration Error:', error);
            throw error;
        }
    }

    const updateAvatar = async (avatarUrl: string) => {
        if (userData) {
            try {
                const token = await getAuthToken();
                const response = await fetch('/api/update-avatar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ avatar: avatarUrl }),
                });

                if (response.ok) {
                    setUserData({ ...userData, avatar: avatarUrl })
                    return true;
                }
            } catch (error) {
                console.error('Failed to update avatar in DB:', error);
            }
        }
        return false;
    }

    const updateProfile = async (data: { name: string, usn: string, phone: string, collegeName: string }) => {
        if (userData) {
            try {
                const token = await getAuthToken();
                const response = await fetch('/api/update-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const resData = await response.json();
                    setUserData(resData.user);
                    return true;
                } else {
                    const err = await response.json();
                    throw new Error(err.message || 'Profile update failed');
                }
            } catch (error: any) {
                console.error('Failed to update profile:', error);
                alert(error.message);
            }
        }
        return false;
    }

    return (
        <AppContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            totalAmount,
            isLoggedIn,
            isInitializing,
            userData,
            needsOnboarding,
            login,
            logout,
            registerUser,
            registerMission,
            markAsPaid,
            updateAvatar,
            updateProfile,
            mountUser,
            isSiteLoaded,
            setIsSiteLoaded,
            pageTheme,
            setPageTheme
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
