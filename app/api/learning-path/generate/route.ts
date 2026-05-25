import { createServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes

export async function POST(request: Request) {
  try {
    const supabase = await createServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const testId = body.test_id;

    if (!testId) {
      return NextResponse.json({ success: false, error: "Missing test_id" }, { status: 400 });
    }

    // 1. Fetch the diagnostic data from learning_modules
    const { data: moduleRecord, error: fetchError } = await supabase
      .from("learning_modules")
      .select("paths")
      .eq("result_id", testId)
      .single();

    if (fetchError || !moduleRecord || !moduleRecord.paths) {
      return NextResponse.json({ success: false, error: "No diagnostic data found for this test." }, { status: 404 });
    }

    const paths = moduleRecord.paths as Record<string, any>;

    // 2. Format the payload for the backend
    const payload = {
      test_id: testId,
      diagnostic_data: {
        predicted_class: String(paths.predicted_class || ""),
        confidence: Number(paths.confidence || 0),
        decision_path: Array.isArray(paths.decision_path) ? paths.decision_path : [],
        domain_severity_scores: typeof paths.domain_severity_scores === 'object' ? paths.domain_severity_scores : {},
        task_importance_scores: typeof paths.task_importance_scores === 'object' ? paths.task_importance_scores : {}
      }
    };

    // 3. Call the Python backend
    const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    const modelUrl = `${baseUrl}/generate_module`;
    let generatedModule: any;

    try {
      // AbortController is not needed here as Node fetch will wait for the server response by default.
      // maxDuration is set to 300s to ensure Next.js doesn't drop the connection.
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch from module API";
        try {
          const errData = await response.json();
          if (errData.error) errorMessage = errData.error;
        } catch (e) {
          // Ignore json parse error if the response isn't JSON
        }
        throw new Error(errorMessage);
      }
      generatedModule = await response.json();
    } catch (error: any) {
      console.error("Module generation API failed", error);
      return NextResponse.json({ success: false, error: error.message || "Failed to generate module." }, { status: 500 });
    }

    // 4. Save the generated module back into learning_modules (upsert)
    const { error: updateError } = await supabase
      .from("learning_modules")
      .update({ modules: generatedModule })
      .eq("result_id", testId);

    if (updateError) {
      return NextResponse.json({ success: false, error: "Failed to save the generated module." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: generatedModule });

  } catch (error) {
    console.error("Generate module error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
