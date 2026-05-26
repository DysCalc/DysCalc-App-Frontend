import { createServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, classroom_id, student_history, missing_tests_fallback, title } = body;

    if (!student_id || !classroom_id || !student_history) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Instantly create a new test_result
    const { data: testResult, error: testResultError } = await supabase
      .from("test_results")
      .insert({
        student_id,
        classroom_id,
        is_approved: false
      })
      .select()
      .single();

    if (testResultError || !testResult) {
      return NextResponse.json({ success: false, error: "Failed to create test result row" }, { status: 500 });
    }

    // 2. Instantly create the assessment_questions row with is_generating = true
    const { data: aqRow, error: aqError } = await supabase
      .from("assessment_questions")
      .insert({
        test_result_id: testResult.id,
        title: title || `Targeted Retest - ${new Date().toLocaleDateString()}`,
        description: "Generating questions...",
        is_generating: true
      })
      .select()
      .single();

    if (aqError) {
      return NextResponse.json({ success: false, error: "Failed to save assessment questions" }, { status: 500 });
    }

    // 3. Call Python backend (which handles generation and DB update asynchronously)
    const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    const modelUrl = `${baseUrl}/generate_retest`;
    
    const postData = JSON.stringify({ 
      student_history,
      test_result_id: testResult.id,
      missing_tests_fallback 
    });

    try {
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: postData
      });

      if (!response.ok) {
        console.error("[generate-retest] Backend request failed with status:", response.status);
        await supabase.from("assessment_questions").update({ is_generating: false, description: "Generation failed." }).eq("test_result_id", testResult.id);
        return NextResponse.json({ success: false, error: "Backend failed to start generation" }, { status: 500 });
      }
    } catch (err) {
      console.error("[generate-retest] Request error to backend:", err);
      await supabase.from("assessment_questions").update({ is_generating: false, description: "Generation failed." }).eq("test_result_id", testResult.id);
      return NextResponse.json({ success: false, error: "Failed to connect to backend" }, { status: 500 });
    }

    // 4. Return immediately with the placeholder row so the UI can navigate to it
    return NextResponse.json({
      success: true,
      data: {
        testResult,
        assessmentQuestions: aqRow
      }
    });

  } catch (err: any) {
    console.error("[generate-retest] Unexpected Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
