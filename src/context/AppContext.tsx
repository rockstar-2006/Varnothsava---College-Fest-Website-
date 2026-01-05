'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface UserData {
    id: string
    name: string
    email: string
    usn: string
    collegeName: string
    age: string
    phone: string
    idCardUrl?: string
    profileCode: string
    hasPaid: boolean
    registeredEvents: { id: string, teamName: string }[]
    avatar: string
    studentType: 'internal' | 'external'
    password?: string
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
    userData: UserData | null
    login: (email: string, password?: string) => void
    logout: () => void
    registerUser: (data: Omit<UserData, 'id' | 'profileCode' | 'hasPaid' | 'registeredEvents' | 'avatar' | 'studentType'>) => void
    markAsPaid: () => void
    updateRegisteredEvents: (events: { id: string, teamName: string }[]) => void
    updateAvatar: (avatarUrl: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Event[]>([])
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState<UserData | null>(null)

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('v_user_data')
        const savedIsLoggedIn = localStorage.getItem('v_is_logged_in')
        if (savedUser && savedIsLoggedIn === 'true') {
            setUserData(JSON.parse(savedUser))
            setIsLoggedIn(true)
        }
    }, [])

    // Sync with LocalStorage
    useEffect(() => {
        if (userData) {
            localStorage.setItem('v_user_data', JSON.stringify(userData))
        } else {
            localStorage.removeItem('v_user_data')
        }
    }, [userData])

    useEffect(() => {
        localStorage.setItem('v_is_logged_in', isLoggedIn.toString())
    }, [isLoggedIn])

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

    const login = (email: string, password?: string) => {
        // Dummy login check against stored users
        const users = JSON.parse(localStorage.getItem('v_all_users') || '[]')
        const foundUser = users.find((u: UserData) => u.email === email && (!password || u.password === password))
        if (foundUser) {
            setUserData(foundUser)
            setIsLoggedIn(true)
        } else {
            alert("Invalid credentials or user not found. Please register.")
        }
    }

    const logout = () => {
        setIsLoggedIn(false)
        setUserData(null)
    }

    const registerUser = (data: Omit<UserData, 'id' | 'profileCode' | 'hasPaid' | 'registeredEvents' | 'avatar' | 'studentType'>) => {
        const profileCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const id = Math.random().toString(36).substring(2, 11)
        const studentType = data.email.endsWith('@sode-edu.in') ? 'internal' : 'external'

        const newUser: UserData = {
            ...data,
            id,
            profileCode,
            hasPaid: false,
            registeredEvents: [],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
            studentType
        }

        const users = JSON.parse(localStorage.getItem('v_all_users') || '[]')
        users.push(newUser)
        localStorage.setItem('v_all_users', JSON.stringify(users))

        setUserData(newUser)
        setIsLoggedIn(true)
    }

    const markAsPaid = () => {
        if (userData) {
            const updatedUser = { ...userData, hasPaid: true }
            setUserData(updatedUser)

            // Update in all users list too
            const users = JSON.parse(localStorage.getItem('v_all_users') || '[]')
            const index = users.findIndex((u: UserData) => u.email === userData.email)
            if (index !== -1) {
                users[index] = updatedUser
                localStorage.setItem('v_all_users', JSON.stringify(users))
            }
        }
    }

    const updateRegisteredEvents = (events: { id: string, teamName: string }[]) => {
        if (userData) {
            // Merge existing with new, avoiding duplicates by event ID
            const existing = userData.registeredEvents || []
            const newEvents = events.filter(ne => !existing.find(ee => ee.id === ne.id))

            const updatedUser = {
                ...userData,
                registeredEvents: [...existing, ...newEvents]
            }
            setUserData(updatedUser)

            const users = JSON.parse(localStorage.getItem('v_all_users') || '[]')
            const index = users.findIndex((u: UserData) => u.email === userData.email)
            if (index !== -1) {
                users[index] = updatedUser
                localStorage.setItem('v_all_users', JSON.stringify(users))
            }
        }
    }

    const updateAvatar = (avatarUrl: string) => {
        if (userData) {
            const updatedUser = { ...userData, avatar: avatarUrl }
            setUserData(updatedUser)

            const users = JSON.parse(localStorage.getItem('v_all_users') || '[]')
            const index = users.findIndex((u: UserData) => u.email === userData.email)
            if (index !== -1) {
                users[index] = updatedUser
                localStorage.setItem('v_all_users', JSON.stringify(users))
            }
        }
    }

    return (
        <AppContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            totalAmount,
            isLoggedIn,
            userData,
            login,
            logout,
            registerUser,
            markAsPaid,
            updateRegisteredEvents,
            updateAvatar
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
