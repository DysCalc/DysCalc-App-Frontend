import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

type StudentRow = {
  id: string;
  profiles: {
    nickname: string | null;
  }[] | null;
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { classId } = (await req.json()) as { classId?: string };

    if (!classId) {
      return new Response(
        JSON.stringify({ success: false, error: "classId is required" }),
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

    const { data, error } = await supabase
      .from("students")
      .select("id,profiles!students_id_fkey(nickname)")
      .eq("classroom_id", classId)
      .order("joined_at", { ascending: true });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const students = (data ?? []) as StudentRow[];

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const mappedStudents = await Promise.all(
      students.map(async (student) => {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(student.id);
        const fullName = authData.user?.user_metadata?.full_name;

        return {
          id: student.id,
          name:
            (typeof fullName === "string" ? fullName.trim() : "") ||
            student.profiles?.[0]?.nickname?.trim() ||
            `Student ${student.id.slice(0, 6)}`,
        };
      })
    );

    return new Response(JSON.stringify({ success: true, data: mappedStudents }), {
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
