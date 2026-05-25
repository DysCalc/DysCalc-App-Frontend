import { createServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const maxDuration = 300;

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

    // Call Python backend
    const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    const modelUrl = `${baseUrl}/generate_retest`;
    
    let generatedRetest: any;

    try {
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_history }),
      });

      const text = await response.text();

      if (!response.ok) {
        let errorMsg = "Backend error";
        try {
          const parsed = JSON.parse(text);
          errorMsg = parsed.error || errorMsg;
        } catch (e) {
          errorMsg = text;
        }
        throw new Error(`Failed to generate retest: ${errorMsg}`);
      }

      generatedRetest = JSON.parse(text);
    } catch (e: any) {
      console.error("[generate-retest] Python API Error:", e);
      return NextResponse.json(
        { success: false, error: e.message || "Failed to generate retest" },
        { status: 500 }
      );
    }

    if (!generatedRetest.retest_data) {
      return NextResponse.json(
        { success: false, error: "Backend returned empty retest data" },
        { status: 500 }
      );
    }

    // Combine generated tests with missing fallback tests
    // Give all newly generated questions an ID following the initial assessment convention
    const combinedQuestions: Record<string, any> = { ...missing_tests_fallback };
    
    const prefixMap: Record<string, string> = {
      number_comparison: "nc",
      dot_matching: "dm",
      number_series: "ns",
      single_addition: "sa",
      single_subtraction: "ss",
      complex_arithmetic: "ca"
    };
    
    for (const [key, value] of Object.entries(generatedRetest.retest_data)) {
      const typedValue = value as { rationale?: string; tests?: any[] };
      const prefix = prefixMap[key] || "rt";
      
      const processedTests = (typedValue.tests || []).map((t: any, index: number) => ({
        ...t,
        id: t.id || `${prefix}_${String(index + 1).padStart(2, '0')}`
      }));
      
      combinedQuestions[key] = {
        ...typedValue,
        tests: processedTests
      };
    }

    // 1. Create a new test_result
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

    // 2. Create the assessment_questions row
    const metadata = {
      based_on_session: generatedRetest.based_on_session,
      based_on_session_date: generatedRetest.based_on_session_date,
      total_sessions_in_history: generatedRetest.total_sessions_in_history,
      _meta_validation_report: generatedRetest._meta_validation_report,
      warning: generatedRetest.warning
    };

    const { data: aqRow, error: aqError } = await supabase
      .from("assessment_questions")
      .insert({
        test_result_id: testResult.id,
        title: title || `Targeted Retest - ${new Date().toLocaleDateString()}`,
        description: "Dynamically generated retest based on student's historical deficit areas.",
        complex_arithmetic: combinedQuestions.complex_arithmetic || null,
        dot_matching: combinedQuestions.dot_matching || null,
        number_comparison: combinedQuestions.number_comparison || null,
        number_series: combinedQuestions.number_series || null,
        single_addition: combinedQuestions.single_addition || null,
        single_subtraction: combinedQuestions.single_subtraction || null,
        metadata
      })
      .select()
      .single();

    if (aqError) {
      return NextResponse.json({ success: false, error: "Failed to save assessment questions" }, { status: 500 });
    }

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
