import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

type EducatorRow = {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string | null;
    nickname?: string | null;
    classroom_count: number;
};

Deno.serve(async (req) => {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

        if (!supabaseUrl || !anonKey) {
            return new Response(
                JSON.stringify({ success: false, error: "Server config error" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const authHeader = req.headers.get("Authorization") ?? "";

        const supabase = createClient(supabaseUrl, anonKey, {
            global: {
                headers: {
                    Authorization: authHeader,
                },
            },
        });

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return new Response(
                JSON.stringify({ success: false, error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { data: educators, error: educatorsError } = await supabase
            .from("educator_details")
            .select("id, email, full_name, avatar_url, nickname, classroom_count");

        if (educatorsError) {
            return new Response(
                JSON.stringify({ success: false, error: educatorsError.message }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const mappedEducators: EducatorRow[] = (educators ?? []).map((row) => ({
            id: row.id,
            email: row.email ?? "",
            full_name: row.full_name ?? "",
            avatar_url: row.avatar_url ?? "",
            nickname: row.nickname ?? null,
            classroom_count: Number(row.classroom_count ?? 0),
        }));

        return new Response(JSON.stringify(mappedEducators), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return new Response(JSON.stringify({ success: false, error: message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});