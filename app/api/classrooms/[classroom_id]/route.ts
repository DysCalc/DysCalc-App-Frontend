// For students operation


import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { ClassroomWithStudentCount } from "@/types";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ classroom_id: string }> }): Promise<NextResponse> {
    try {
        const classroom_id = (await params).classroom_id;

        if (!classroom_id) return NextResponse.json({ error: "Missing classroom_id" }, { status: 400 });

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

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
            .eq('id', classroom_id)
            .eq('is_archived', false)
            .single();

        if (classroomsError) return NextResponse.json({ error: classroomsError.message }, { status: 400 });

        const transformedData = { ...classrooms, student_count: classrooms.student_count?.[0]?.count ?? 0 } as ClassroomWithStudentCount;
        return NextResponse.json({ success: true, data: transformedData }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest,
    { params }: { params: Promise<{ classroom_id: string }> }): Promise<NextResponse> {
    try {
        const classroom_id = (await params).classroom_id;

        if (!classroom_id) return NextResponse.json({ error: "Missing classroom_id" }, { status: 400 });

        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== "string") return NextResponse.json({ error: "Invalid classroom name" }, { status: 400 });

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabaseAdmin
            .from("classrooms")
            .update({ name })
            .eq("id", classroom_id)
            .eq("is_archived", false)
            .select(`
                id,
                name,
                created_at,
                educator_id,
                is_archived,
                student_count:students(count)
            `)
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        const transformedData = {
            ...data,
            student_count: data.student_count?.[0]?.count ?? 0
        } as ClassroomWithStudentCount;

        return NextResponse.json({ success: true, data: transformedData }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// ARCHIVE classroom
export async function DELETE(req: NextRequest,
    { params }: { params: Promise<{ classroom_id: string }> }
): Promise<NextResponse> {
    try {
        const classroom_id = (await params).classroom_id;

        if (!classroom_id) return NextResponse.json({ error: "Missing classroom_id" }, { status: 400 });

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabaseAdmin
            .from("classrooms")
            .update({ is_archived: true })
            .eq("id", classroom_id)
            .select(`
                id,
                name,
                created_at,
                educator_id,
                is_archived,
                student_count:students(count)
            `)
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        const transformedData = {
            ...data,
            student_count: data.student_count?.[0]?.count ?? 0
        } as ClassroomWithStudentCount;

        return NextResponse.json({ success: true, data: transformedData }, { status: 200 });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Internal server error";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}