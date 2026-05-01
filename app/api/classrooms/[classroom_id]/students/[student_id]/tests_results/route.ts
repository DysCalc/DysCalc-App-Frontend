// For specific student operation

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { createServer } from "@/lib/supabase-server";
import type { TestResult } from "@/types";

export async function GET(req: NextRequest,
    { params }: { params: Promise<{ classroom_id: string, student_id: string }> }): Promise<NextResponse> {
    try {
        const { classroom_id, student_id } = await params;
        if (!student_id || !classroom_id) return NextResponse.json({ error: "Missing student_id or classroom_id" }, { status: 400 });

        const supabaseServer = await createServer();
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) return NextResponse.json({ error: "Server config error" }, { status: 500 });

        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: testResults, error } = await supabaseAdmin
            .from("test_results")
            .select(`
                id,
                created_at,
                dot_matching,
                number_comparison,
                number_series,
                single_addition,
                single_subtraction,
                complex_arithmetic,
                is_approved,
                classification    
            `)
            .eq("classroom_id", classroom_id)
            .eq("student_id", student_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        return NextResponse.json({
            success: true,
            data: testResults as TestResult | null
        }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}