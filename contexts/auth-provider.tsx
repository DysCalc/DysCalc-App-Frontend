"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-client";
import { Profile } from '@/types';
import { getUserProfile } from "@/hooks/use-profile";
import { toast } from "sonner";

export interface AuthContextType {
    user: User | null,
    profile: Profile | null,
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
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = createClient();

    const userRef = useRef<string | null>(null);

    // Keep ref in sync
    useEffect(() => {
        userRef.current = user?.id ?? null;
    }, [user]);

    useEffect(() => {
        const getSession = async () => {
            const toastId = toast.loading("Checking user...");
            try {
                // getSession() reads the cached session from local storage — no network request.
                // The JWT is still cryptographically signed; onAuthStateChange handles refreshes.
                const { data: { session } } = await supabase.auth.getSession();
                const resolvedUser = session?.user ?? null;

                setUser(resolvedUser);
                if (resolvedUser?.id) {
                    toast.loading("Loading profile...", { id: toastId });
                    const profile = await getUserProfile(resolvedUser.id);
                    setProfile(profile);
                    toast.dismiss(toastId);
                } else {
                    toast.dismiss(toastId);
                }
            } catch (err) {
                console.error("Session fetch error:", err);
                toast.dismiss(toastId);
            } finally {
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

                const toastId = toast.loading("Updating session...");
                setLoading(true);

                setUser(nextUser);
                userRef.current = nextUser?.id ?? null;

                if (!nextUser) {
                    setProfile(null);
                    toast.dismiss(toastId);
                } else {
                    toast.loading("Loading profile...", { id: toastId });
                    const profile = await getUserProfile(nextUser.id);
                    setProfile(profile);
                    toast.dismiss(toastId);
                }

                setLoading(false);
            }
        );

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [supabase.auth]);

    const loginWithGoogle = async (): Promise<void> => {
        const toastId = toast.loading("Signing in...");
        setLoading(true);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
            },
        })

        if (error) {
            console.error(error.message)
            toast.error(error.message, { id: toastId });
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        const toastId = toast.loading("Signing out...");
        setLoading(true);
        await supabase.auth.signOut({ scope: 'local' })
        setUser(null);
        setProfile(null);
        toast.dismiss(toastId);
        window.location.href = "/";
        setLoading(false);
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
            {children}
        </AuthContext.Provider>
    )
}