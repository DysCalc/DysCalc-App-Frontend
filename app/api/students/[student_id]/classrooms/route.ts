import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ student_id: string }> }
): Promise<NextResponse> {
    try {
        const { student_id } = await params;

        if (!student_id) {
            return NextResponse.json(
                { error: "Missing student_id" },
                { status: 400 }
            );
        }

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            console.error("GET /api/students/[student_id]/classrooms ERROR: Supabase admin client failed.");
            return NextResponse.json(
                { error: "Server config error" },
                { status: 500 }
            );
        }

        const {
            data: { user },
            error: userError,
        } = await supabaseServer.auth.getUser();

        if (userError || !user) {
            console.error("GET /api/students/[student_id]/classrooms AUTH ERROR:", userError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: classrooms, error: classroomsError } = await supabaseAdmin
            .from("students")
            .select(
                `
                classroom_id,
                joined_at,
                classrooms (
                    name,
                    created_at,
                    educator_id
                )
              `
            )
            .eq("id", student_id)
            .eq("classrooms.is_archived", false)
            .order("joined_at", { ascending: false });

        if (classroomsError) {
            console.error("GET /api/students/[student_id]/classrooms DB ERROR:", classroomsError);
            return NextResponse.json(
                { error: classroomsError.message },
                { status: 400 }
            );
        }

        const transformedData = (classrooms ?? []).map((row: any) => ({
            classroom_id: row.classroom_id,
            joined_at: row.joined_at,
            classrooms: row.classrooms
        }));

        return NextResponse.json(
            { success: true, data: transformedData },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/students/[student_id]/classrooms ERROR:", error);

        const message =
            error instanceof Error ? error.message : "Internal server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}