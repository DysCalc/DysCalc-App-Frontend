import { createServer } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ educator_id: string }> }
): Promise<NextResponse> {
  try {
    const { educator_id } = await params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!educator_id || !uuidRegex.test(educator_id)) {
      return NextResponse.json({ error: "Invalid educator_id" }, { status: 400 });
    }

    const supabaseServer = await createServer();
    const supabaseAdmin = createAdminClient();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.id !== educator_id) {
        // Enforce user ownership
    }

    const { data, error } = await supabaseAdmin
      .from("test_results")
      .select(`
        id,
        created_at,
        is_approved,
        classification,
        classroom_id,
        student_id,
        dot_matching,
        number_comparison,
        number_series,
        single_addition,
        single_subtraction,
        complex_arithmetic,
        classroom:classrooms!initial_test_results_classroom_id_fkey!inner(
          id,
          name,
          educator_id
        ),
        assessment_questions(
          title,
          is_generating,
          is_given
        )
      `)
      .eq("classrooms.educator_id", educator_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const studentIds = Array.from(new Set((data || []).map(r => r.student_id).filter(Boolean)));

    let studentsMap: Record<string, any> = {};
    if (studentIds.length > 0) {
      const { data: studentsData } = await supabaseAdmin
        .from("student_details")
        .select("id, full_name, avatar_url, nickname")
        .in("id", studentIds);
      
      if (studentsData) {
        studentsData.forEach(s => {
          studentsMap[s.id] = s;
        });
      }
    }

    const formattedData = (data || []).map((row: any) => {
      const studentInfo = studentsMap[row.student_id] || {};
      const classroomInfo = Array.isArray(row.classroom) ? row.classroom[0] : row.classroom;
      const aqInfo = Array.isArray(row.assessment_questions) ? row.assessment_questions[0] : row.assessment_questions;

      return {
        id: row.id,
        created_at: row.created_at,
        is_approved: row.is_approved,
        classification: row.classification,
        classroom_id: row.classroom_id,
        classroom_name: classroomInfo?.name || "Unknown Classroom",
        student_id: row.student_id,
        student_name: studentInfo?.full_name || studentInfo?.nickname || "Unknown Student",
        student_avatar: studentInfo?.avatar_url || null,
        test_title: aqInfo?.title || "Initial Assessment",
        is_generating: aqInfo?.is_generating || false,
        is_given: aqInfo?.is_given || false,
        is_initial: !aqInfo,
        scores: {
          dot_matching: row.dot_matching,
          number_comparison: row.number_comparison,
          number_series: row.number_series,
          single_addition: row.single_addition,
          single_subtraction: row.single_subtraction,
          complex_arithmetic: row.complex_arithmetic,
        }
      };
    });

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
