// For students operation


import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { EducatorRow } from "@/types";

export async function GET(req: NextRequest) {
    try {
        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        // AUTH CHECK
        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: students, error: studentsError } =
            await supabaseAdmin
                .from("student_details")
                .select(
                    "id, email, full_name, avatar_url, nickname"
                );

        if (studentsError) return NextResponse.json({ error: studentsError.message }, { status: 400 });

        const mappedStudents = (students ?? []).map(
            (row) => ({
                id: row.id,
                email: row.email ?? "",
                full_name: row.full_name ?? "",
                avatar_url: row.avatar_url ?? "",
                nickname: row.nickname ?? null,
            })
        );

        return NextResponse.json({ success: true, data: mappedStudents }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}