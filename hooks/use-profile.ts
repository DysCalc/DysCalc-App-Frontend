import { User } from "@supabase/supabase-js";
import { toProperCase } from "./use-text";
import { createClient } from "@/lib/supabase-client";
import { Profile } from "@/types";

export function formatProfile(user: User, profile?: Profile | null) {
    return {
        id: user?.id ?? "",
        name: toProperCase(user?.user_metadata?.full_name || profile?.nickname || user?.email?.split('@')[0] || "User"),
        avatar_url: user?.user_metadata?.avatar_url,
        role: toProperCase(user?.user_metadata?.role ?? ""),
        nickname: toProperCase(profile?.nickname ?? ""),
        date_of_birth: profile?.date_of_birth ?? "",
        sex: toProperCase(profile?.sex ?? ""),
        created_at: profile?.created_at ?? ""
    }
}

export async function getUserProfile(userId: Profile['id']): Promise<Profile | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from('profiles')
        .select("id,created_at,date_of_birth,nickname,sex")
        .eq('id', userId).single();
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('profiles')
            .update({
                nickname: updates.nickname,
                date_of_birth: updates.date_of_birth,
                sex: updates.sex
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to update profile" };
    }
}

export async function deleteUserProfile(userId: string) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: "DELETE",
        });
        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error || "Failed to delete user account" };
        }
        return { success: true, data: null };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to delete user account" };
    }
}