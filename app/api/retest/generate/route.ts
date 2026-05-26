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

    // 3. Call Python backend in background
    const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    const modelUrl = `${baseUrl}/generate_retest`;
    
    const http = require("http");
    const https = require("https");
    const client = modelUrl.startsWith("https") ? https : http;

    const postData = JSON.stringify({ student_history });
    const parsedUrl = new URL(modelUrl);

    const req = client.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      },
      timeout: 0
    }, (res: any) => {
      let responseBody = "";
      res.on("data", (chunk: any) => { responseBody += chunk; });
      res.on("end", async () => {
        if (res.statusCode !== 200) {
          console.error("[generate-retest] Background generation failed:", responseBody);
          await supabase.from("assessment_questions").update({ is_generating: false, description: "Generation failed." }).eq("test_result_id", testResult.id);
          return;
        }
        
        try {
          const generatedRetest = JSON.parse(responseBody);
          
          if (!generatedRetest.retest_data) {
             console.error("[generate-retest] Backend returned empty retest data");
             await supabase.from("assessment_questions").update({ is_generating: false, description: "Generation failed." }).eq("test_result_id", testResult.id);
             return;
          }

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

          const metadata = {
            based_on_session: generatedRetest.based_on_session,
            based_on_session_date: generatedRetest.based_on_session_date,
            total_sessions_in_history: generatedRetest.total_sessions_in_history,
            _meta_validation_report: generatedRetest._meta_validation_report,
            warning: generatedRetest.warning
          };

          const { error: updateError } = await supabase
            .from("assessment_questions")
            .update({
              is_generating: false,
              description: "Dynamically generated retest based on student's historical deficit areas.",
              complex_arithmetic: combinedQuestions.complex_arithmetic || null,
              dot_matching: combinedQuestions.dot_matching || null,
              number_comparison: combinedQuestions.number_comparison || null,
              number_series: combinedQuestions.number_series || null,
              single_addition: combinedQuestions.single_addition || null,
              single_subtraction: combinedQuestions.single_subtraction || null,
              metadata
            })
            .eq("test_result_id", testResult.id);

          if (updateError) {
            console.error("[generate-retest] Failed to update assessment questions:", updateError);
          } else {
            console.log("[generate-retest] Successfully generated and saved retest in background for test_id:", testResult.id);
          }

        } catch (err) {
          console.error("[generate-retest] Failed to parse backend response:", err);
          await supabase.from("assessment_questions").update({ is_generating: false, description: "Generation failed." }).eq("test_result_id", testResult.id);
        }
      });
    });

    req.on("error", async (e: any) => {
      console.error("[generate-retest] Request error in background:", e);
      await supabase.from("assessment_questions").update({ is_generating: false, description: "Generation failed." }).eq("test_result_id", testResult.id);
    });

    req.write(postData);
    req.end();

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
