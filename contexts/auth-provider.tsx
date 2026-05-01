"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
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
    const [showInternetHint, setShowInternetHint] = useState(false);

    useEffect(() => {
        if (!loading) {
            setShowInternetHint(false);
            return;
        }

        const timeout = setTimeout(() => {
            setShowInternetHint(true);
        }, 10000); // 10 seconds

        return () => clearTimeout(timeout);
    }, [loading]);

    const userRef = useRef<string | null>(null);

    // Keep ref in sync
    useEffect(() => {
        userRef.current = user?.id ?? null;
    }, [user]);

    useEffect(() => {
        const getSession = async () => {
            try {
                setLoadingMessage("Checking user...");
                setLoading(true);

                // getUser() validates the JWT via a network request.
                // If offline, fall back to the cached session from local storage.
                let resolvedUser: User | null = null;

                const { data: { user: verifiedUser }, error: getUserError } = await supabase.auth.getUser();

                if (verifiedUser) {
                    resolvedUser = verifiedUser;
                } else if (getUserError) {
                    // Network error — fall back to cached session
                    console.warn("getUser() failed (possibly offline), falling back to cached session:", getUserError.message);
                    const { data: { session } } = await supabase.auth.getSession();
                    resolvedUser = session?.user ?? null;
                }

                setUser(resolvedUser);
                if (resolvedUser?.id) {
                    setLoadingMessage("Loading profile...");
                    const profile = await getUserProfile(resolvedUser.id);
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
            async (event: AuthChangeEvent, session: Session | null) => {
                if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;

                const nextUser = session?.user ?? null;

                // Same user, nothing actually changed — skip
                if (nextUser?.id === userRef.current) return;

                setLoadingMessage("Checking user...");
                setLoading(true);

                setUser(nextUser);
                userRef.current = nextUser?.id ?? null;

                if (!nextUser) {
                    setProfile(null);
                } else {
                    setLoadingMessage("Loading profile...");
                    const profile = await getUserProfile(nextUser.id);
                    setProfile(profile);
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
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
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
        setUser(null);
        setProfile(null);
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
                        <div className="animate-pulse text-lg font-semibold text-[#6C6C6C]">
                            {loadingMessage}
                        </div>
                    )}

                    {showInternetHint && (
                        <div className="max-w-sm animate-pulse text-center text-sm text-[#8A8A8A]">
                            This is taking longer than expected. Please check your
                            internet connection and try refreshing the page.
                        </div>
                    )}
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}