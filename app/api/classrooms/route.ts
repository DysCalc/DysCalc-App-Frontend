// For students operation


import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { ClassroomWithStudentCount } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const educator_id = req.nextUrl.searchParams.get('educator_id');

        if (!educator_id) return NextResponse.json({ error: "Missing educator_id" }, { status: 400 });

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        // AUTH CHECK
        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: classrooms, error: classroomsError } = await supabaseAdmin
            .from("classrooms")
            .select(`
                    id,
                    name,
                    created_at,
                    educator_id,
                    is_archived,
                    student_count:students(count)
                `)
            .eq('educator_id', educator_id)
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (classroomsError) return NextResponse.json({ error: classroomsError.message }, { status: 400 });

        const transformedData = classrooms.map((row: any) => {
            return {
                ...row,
                student_count: row.student_count?.[0]?.count ?? 0
            }
        }) as ClassroomWithStudentCount[];
        return NextResponse.json({ success: true, data: transformedData }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { name, educator_id } = await req.json();

        if (!name || !educator_id) return NextResponse.json({ error: "Missing name or educator_id" }, { status: 400 });

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabaseAdmin.from('classrooms')
            .insert({
                educator_id: educator_id,
                name: name
            })
            .select("id,name,created_at,educator_id,is_archived")
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        return NextResponse.json({ success: true, data: data }, { status: 200 });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}