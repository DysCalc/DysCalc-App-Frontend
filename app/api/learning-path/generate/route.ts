import { createServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

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

    // 2.5. Set is_generating to true immediately
    await supabase.from("learning_modules").update({ is_generating: true }).eq("result_id", testId);

    // 3. Call the Python backend (which now returns 202 immediately and runs in background)
    const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    const modelUrl = `${baseUrl}/generate_module`;
    
    try {
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error("[generate-module] Backend request failed with status:", response.status);
        await supabase.from("learning_modules").update({ is_generating: false }).eq("result_id", testId);
        return NextResponse.json({ success: false, error: "Backend failed to start generation" }, { status: 500 });
      }
    } catch (err) {
      console.error("[generate-module] Request error to backend:", err);
      await supabase.from("learning_modules").update({ is_generating: false }).eq("result_id", testId);
      return NextResponse.json({ success: false, error: "Failed to connect to backend" }, { status: 500 });
    }

    // 5. Return immediately (backend handles the DB update asynchronously)
    return NextResponse.json({ success: true, message: "Module generation started in the background." });

  } catch (error) {
    console.error("Generate module error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
