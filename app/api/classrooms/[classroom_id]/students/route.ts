// For specific student operation

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { StudentClassroomProfile } from "@/types";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ classroom_id: string }> }): Promise<NextResponse> {
    try {
        const { classroom_id } = await params;
        if (!classroom_id) return NextResponse.json({ error: "Missing classroom_id" }, { status: 400 });

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: studentData, error: studentError } = await supabaseAdmin
            .from("students")
            .select(`
                    id,
                    accepted,
                    joined_at,
                    invited_at,
                    profiles!students_id_fkey(
                        nickname,
                        date_of_birth,
                        sex,
                        created_at
                    )
                `)
            .eq("classroom_id", classroom_id);

        if (studentError) return NextResponse.json({ error: studentError.message }, { status: 400 });

        // Get all users using Map for better performance
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if (usersError) return NextResponse.json({ error: usersError.message }, { status: 400 });

        const usersMap = new Map(users.map((u) => [u.id, u]));

        const students: StudentClassroomProfile[] = studentData.map((studentData) => {
            const user = usersMap.get(studentData.id);
            const fullName = user?.user_metadata?.full_name;
            const email = user?.email ?? undefined;
            return {
                id: studentData.id,
                classroom_id: classroom_id,
                accepted: studentData.accepted,
                invited_at: studentData.invited_at,
                joined_at: studentData.joined_at,
                name: (typeof fullName === "string" ? fullName.trim() : "") || studentData.profiles?.[0]?.nickname?.trim() || `Student ${studentData.id.slice(0, 6)}`,
                email: email,
                profile: {
                    nickname: studentData.profiles?.[0]?.nickname ?? "",
                    date_of_birth: studentData.profiles?.[0]?.date_of_birth ?? "",
                    sex: studentData.profiles?.[0]?.sex ?? "MALE",
                    created_at: studentData.profiles?.[0]?.created_at ?? "",
                },
            };
        });

        return NextResponse.json({ success: true, data: students }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}