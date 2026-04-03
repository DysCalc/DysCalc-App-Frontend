"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AuthContextType {
    session: Session | null,
    user: User | null,
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

export function AuthProvider({ children } : { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        }

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
            }
        );

        return () => {
            listener.subscription.unsubscribe()
        }
    }, []);

    const loginWithGoogle = async (): Promise<void> => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        })

        if (error) {
            console.error(error.message)
        }
    };

    const logout = async (): Promise<void> => {
        await supabase.auth.signOut({ scope: 'local' })
        window.location.href = "/login";
    };

    const value: AuthContextType = {
        session,
        user,
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