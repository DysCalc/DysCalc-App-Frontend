// For classroom operations

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { ClassroomWithStudentCount } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const educator_id = req.nextUrl.searchParams.get("educator_id");

    if (!educator_id) {
      return NextResponse.json(
        { error: "Missing educator_id" },
        { status: 400 }
      );
    }

    const supabaseServer = await createServer();
    const supabaseAdmin = createAdminClient();

    if (!supabaseAdmin) {
      console.error("GET /api/classrooms ERROR: Supabase admin client failed.");
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
      console.error("GET /api/classrooms AUTH ERROR:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: classrooms, error: classroomsError } = await supabaseAdmin
      .from("classrooms")
      .select(
        `
        id,
        name,
        created_at,
        educator_id,
        is_archived,
        student_count:students(count)
      `
      )
      .eq("educator_id", educator_id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (classroomsError) {
      console.error("GET /api/classrooms DB ERROR:", classroomsError);
      return NextResponse.json(
        { error: classroomsError.message },
        { status: 400 }
      );
    }

    const transformedData = (classrooms ?? []).map((row: any) => ({
      ...row,
      student_count: row.student_count?.[0]?.count ?? 0,
    })) as ClassroomWithStudentCount[];

    return NextResponse.json(
      { success: true, data: transformedData },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/classrooms ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    console.log("POST /api/classrooms BODY:", body);

    const { name, educator_id } = body;

    if (!name || !educator_id) {
      return NextResponse.json(
        { error: "Missing name or educator_id" },
        { status: 400 }
      );
    }

    const supabaseServer = await createServer();
    const supabaseAdmin = createAdminClient();

    if (!supabaseAdmin) {
      console.error("POST /api/classrooms ERROR: Supabase admin client failed.");
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
      console.error("POST /api/classrooms AUTH ERROR:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("classrooms")
      .insert({
        educator_id,
        name,
      })
      .select("id,name,created_at,educator_id,is_archived")
      .single();

    if (error) {
      console.error("POST /api/classrooms DB ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/classrooms ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}