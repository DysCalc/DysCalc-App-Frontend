"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-client";
import { Profiles } from '@/types';
import { getUserProfile } from "@/hooks/use-profile";

export interface AuthContextType {
    user: User | null,
    profile: Profiles | null,
    loading: boolean,
    loginWithGoogle: () => Promise<void>,
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profiles | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user?.id) {
                const profile = await getUserProfile(user.id);
                setProfile(profile);
            }
            setLoading(false);
        }

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user?.id) {
                    const profile = await getUserProfile(session.user.id);
                    setProfile(profile);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe()
        }
    }, []);

    const loginWithGoogle = async (): Promise<void> => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            console.error(error.message)
        }
    };

    const logout = async (): Promise<void> => {
        await supabase.auth.signOut({ scope: 'local' })
        window.location.href = "/";
    };

    const value: AuthContextType = {
        user,
        profile,
        loading,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}