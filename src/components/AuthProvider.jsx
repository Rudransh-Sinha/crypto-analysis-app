"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
    session: null,
    signIn: () => { },
    signOut: () => { },
});

export default function AuthProvider({ children }) {
    const [session, setSession] = useState(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (provider) => {
        // Supabase OAuth Sign In
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider || 'google',
            });
            if (error) console.error("Login error:", error.message);
        } catch (err) {
            console.error("Auth error:", err);
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Signout error:", err);
        }
    };

    // Mimic NextAuth's useSession structure: { data: session, status: ... }
    const sessionContextValue = {
        data: session ? { user: { name: session.user.user_metadata?.full_name || session.user.email, email: session.user.email, image: session.user.user_metadata?.avatar_url } } : null,
        status: session ? "authenticated" : "unauthenticated",
    };

    return (
        <AuthContext.Provider value={{ ...sessionContextValue, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use the auth context
export const useSession = () => useContext(AuthContext);

// Backwards compatibility helpers used in components
export const signIn = async (provider) => {
    // This is a static helper, but ideally we use the hook. 
    // However, for compatibility with direct imports, we'll try to use the instance if possible, 
    // but without React Context, we can't share state easily.
    // For now, we'll just wrap the Supabase call directly.
    return await supabase.auth.signInWithOAuth({ provider: provider || 'google' });
};

export const signOut = async () => {
    return await supabase.auth.signOut();
};
