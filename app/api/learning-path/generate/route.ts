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

    // 3. Call the Python backend in the background to avoid timeouts
    const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    const modelUrl = `${baseUrl}/generate_module`;
    
    // We import http dynamically to keep edge compatibility if needed, though this is a node route
    const http = require("http");
    const https = require("https");
    const client = modelUrl.startsWith("https") ? https : http;

    const postData = JSON.stringify(payload);
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
      timeout: 0 // Disable socket timeout completely
    }, (res: any) => {
      let responseBody = "";
      res.on("data", (chunk: any) => { responseBody += chunk; });
      res.on("end", async () => {
        if (res.statusCode !== 200) {
          console.error("[generate-module] Background generation failed:", responseBody);
          return;
        }
        
        try {
          const generatedModule = JSON.parse(responseBody);
          // 4. Save the generated module back into learning_modules (upsert)
          const { error: updateError } = await supabase
            .from("learning_modules")
            .update({ modules: generatedModule })
            .eq("result_id", testId);

          if (updateError) {
            console.error("[generate-module] Failed to save background generated module:", updateError);
          } else {
            console.log("[generate-module] Successfully generated and saved module in background for test_id:", testId);
          }
        } catch (err) {
          console.error("[generate-module] Failed to parse backend response:", err);
        }
      });
    });

    req.on("error", (e: any) => {
      console.error("[generate-module] Request error in background:", e);
    });

    req.write(postData);
    req.end();

    // 5. Return immediately so the client doesn't time out
    return NextResponse.json({ success: true, message: "Module generation started in the background." });

  } catch (error) {
    console.error("Generate module error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
