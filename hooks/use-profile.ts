import { User } from "@supabase/supabase-js";
import { toProperCase } from "./use-text";
import { createClient } from "@/lib/supabase-client";
import { Profiles } from "@/types";

export function formatProfile(user: User, profile?: Profiles | null) {
    const userInfo = {
        id: user?.id ?? "",
        name: toProperCase(user?.user_metadata?.full_name ?? ""),
        avatar_url: user?.user_metadata?.avatar_url,
        role: toProperCase(user?.user_metadata?.role ?? ""),
        nickname: toProperCase(profile?.nickname ?? ""),
        date_of_birth: profile?.date_of_birth ?? "",
        sex: toProperCase(profile?.sex ?? ""),
        created_at: profile?.created_at ?? ""
    }
    console.log("User Info: ", userInfo);
    return userInfo
}


export async function getUserProfile(userId: string): Promise<Profiles | null> {
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