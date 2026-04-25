import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type StudentDetailRow = {
  id: string;
  classroom_id: string;
  accepted: boolean | null;
  joined_at: string;
  invited_at: string;
  profiles: {
    nickname: string | null;
    date_of_birth: string;
    sex: "MALE" | "FEMALE";
    created_at: string;
  }[] | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { classId, studentId } = (await req.json()) as {
      classId?: string;
      studentId?: string;
    };

    if (!classId) {
      return new Response(
        JSON.stringify({ success: false, error: "classId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!studentId) {
      return new Response(
        JSON.stringify({ success: false, error: "studentId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
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

    const { data: classroom, error: classroomError } = await supabase
      .from("classrooms")
      .select("id")
      .eq("id", classId)
      .eq("educator_id", user.id)
      .maybeSingle();

    if (classroomError) {
      return new Response(
        JSON.stringify({ success: false, error: classroomError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!classroom) {
      return new Response(
        JSON.stringify({ success: false, error: "Classroom not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select(
        "id,classroom_id,accepted,joined_at,invited_at,profiles!students_id_fkey(nickname,date_of_birth,sex,created_at)"
      )
      .eq("id", studentId)
      .eq("classroom_id", classId)
      .maybeSingle();

    if (studentError) {
      return new Response(
        JSON.stringify({ success: false, error: studentError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!studentData) {
      return new Response(
        JSON.stringify({ success: false, error: "Student not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const student = studentData as StudentDetailRow;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(student.id);
    const fullName = authData.user?.user_metadata?.full_name;
    const email = authData.user?.email ?? null;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: student.id,
          classroom_id: student.classroom_id,
          accepted: student.accepted,
          invited_at: student.invited_at,
          joined_at: student.joined_at,
          name:
            (typeof fullName === "string" ? fullName.trim() : "") ||
            student.profiles?.[0]?.nickname?.trim() ||
            `Student ${student.id.slice(0, 6)}`,
          email,
          profile: {
            nickname: student.profiles?.[0]?.nickname ?? null,
            date_of_birth: student.profiles?.[0]?.date_of_birth ?? null,
            sex: student.profiles?.[0]?.sex ?? null,
            created_at: student.profiles?.[0]?.created_at ?? null,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
