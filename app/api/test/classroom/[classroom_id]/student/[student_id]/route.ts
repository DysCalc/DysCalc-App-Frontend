import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { TestType } from "@/types/test";

const ALLOWED_TEST_TYPES: TestType[] = [
    "number_comparison",
    "dot_matching",
    "number_series",
    "single_addition",
    "single_subtraction",
    "complex_arithmetic",
];

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ classroom_id: string; student_id: string }> }
): Promise<NextResponse> {
    try {
        const { classroom_id, student_id } = await params;
        if (!classroom_id || !student_id) {
            return NextResponse.json(
                { error: "Missing classroom_id or student_id" },
                { status: 400 }
            );
        }

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server config error" }, { status: 500 });
        }

        const {
            data: { user },
            error: userError,
        } = await supabaseServer.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const testType = req.nextUrl.searchParams.get("test_type") as TestType | null;
        const selectFields = testType && ALLOWED_TEST_TYPES.includes(testType)
            ? `id, created_at, ${testType}`
            : `id, created_at, number_comparison, dot_matching, number_series, single_addition, single_subtraction, complex_arithmetic`;

        const { data, error } = await supabaseAdmin
            .from("test_results")
            .select(selectFields)
            .eq("classroom_id", classroom_id)
            .eq("student_id", student_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ classroom_id: string; student_id: string }> }
): Promise<NextResponse> {
    try {
        const { classroom_id, student_id } = await params;
        if (!classroom_id || !student_id) {
            return NextResponse.json(
                { error: "Missing classroom_id or student_id" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const testType = body?.test_type as TestType | undefined;
        const payload = body?.payload;

        if (!testType || !ALLOWED_TEST_TYPES.includes(testType)) {
            return NextResponse.json({ error: "Invalid test_type" }, { status: 400 });
        }

        if (!payload) {
            return NextResponse.json({ error: "Missing payload" }, { status: 400 });
        }

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            return NextResponse.json({ error: "Server config error" }, { status: 500 });
        }

        const {
            data: { user },
            error: userError,
        } = await supabaseServer.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insertData = {
            classroom_id,
            student_id,
            [testType]: payload,
        } as Record<string, unknown>;

        const { data, error } = await supabaseAdmin
            .from("test_results")
            .insert(insertData)
            .select("id, created_at")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}