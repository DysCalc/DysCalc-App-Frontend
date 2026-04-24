import { User } from "@supabase/supabase-js";
import { toProperCase } from "./use-text";
import { createClient } from "@/lib/supabase-client";
import { Profile } from "@/types";

export function formatProfile(user: User, profile?: Profile | null) {
    return {
        id: user?.id ?? "",
        name: toProperCase(user?.user_metadata?.full_name ?? ""),
        avatar_url: user?.user_metadata?.avatar_url,
        role: toProperCase(user?.user_metadata?.role ?? ""),
        nickname: toProperCase(profile?.nickname ?? ""),
        date_of_birth: profile?.date_of_birth ?? "",
        sex: toProperCase(profile?.sex ?? ""),
        created_at: profile?.created_at ?? ""
    }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
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