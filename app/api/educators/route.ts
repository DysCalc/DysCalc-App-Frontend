// For all educators operation


import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { EducatorRow } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        // AUTH CHECK
        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // GET ALL EDUCATORS
        const { data: educators, error: educatorsError } =
            await supabaseAdmin
                .from("educator_details")
                .select(
                    "id, email, full_name, avatar_url, nickname, classroom_count"
                );

        if (educatorsError) return NextResponse.json({ error: educatorsError.message }, { status: 400 });

        const mappedEducators: EducatorRow[] = (educators ?? []).map(
            (row) => ({
                id: row.id,
                email: row.email ?? "",
                full_name: row.full_name ?? "",
                avatar_url: row.avatar_url ?? "",
                nickname: row.nickname ?? null,
                classroom_count: Number(row.classroom_count ?? 0),
            })
        );

        return NextResponse.json({ success: true, data: mappedEducators }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}