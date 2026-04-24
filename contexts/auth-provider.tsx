"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-client";
import { Profile } from '@/types';
import { getUserProfile } from "@/hooks/use-profile";

export interface AuthContextType {
    user: User | null,
    profile: Profile | null,
    loading: boolean,
    loadingMessage: string,
    setLoadingMessage: (msg: string) => void,
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
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>("Loading...");
    const supabase = createClient();

    useEffect(() => {
        const getSession = async () => {
            try {
                setLoadingMessage("Checking user...");
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
                if (user?.id) {
                    setLoadingMessage("Loading profile...");
                    const profile = await getUserProfile(user.id);
                    setProfile(profile);
                }
            } catch (err) {
                console.error("Session fetch error:", err);
            } finally {
                setLoadingMessage("Loading...");
                setLoading(false);
            }
        }

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setLoadingMessage("Checking user...");
                setLoading(true);
                setUser(session?.user ?? null)
                if (session?.user?.id) {
                    setLoadingMessage("Loading profile...");
                    const profile = await getUserProfile(session.user.id);
                    setProfile(profile);
                } else {
                    setProfile(null);
                }
                setLoadingMessage("Loading...");
                setLoading(false);
            }
        );

        return () => {
            listener.subscription.unsubscribe()
        }
    }, []);

    const loginWithGoogle = async (): Promise<void> => {
        setLoadingMessage("Signing in...");
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        setLoadingMessage("Loading...");
        setLoading(false);

        if (error) {
            console.error(error.message)
        }
    };

    const logout = async (): Promise<void> => {
        setLoadingMessage("Signing out...");
        setLoading(true);
        await supabase.auth.signOut({ scope: 'local' })
        window.location.href = "/";
        setLoadingMessage("Loading...");
        setLoading(false);
    };

    const value: AuthContextType = {
        user,
        profile,
        loading,
        loadingMessage,
        setLoadingMessage,
        loginWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#f5f5f0]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#29A177] border-t-transparent"></div>
                    {loadingMessage && (
                        <div className="text-lg font-semibold text-[#6C6C6C] animate-pulse">
                            {loadingMessage}
                        </div>
                    )}
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}