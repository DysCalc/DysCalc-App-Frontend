import { createServer } from "@/lib/supabase-server"
import { NextResponse } from "next/server";
import type { Database } from "@/database.types";

type ClassificationResponse = {
  confidence: number;
  decision_path: any[];
  decision_path_readable: string;
  domain_severity_scores: Record<string, number>;
  leaf_distribution: Record<string, number>;
  predicted_class: string;
  task_importance_scores: Record<string, number>;
};

export async function POST(request: Request) {
  try {
    const supabase = await createServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const testId = body.test_id;

    if (!testId) {
      return NextResponse.json(
        { success: false, error: "Missing test_id" },
        { status: 400 }
      );
    }

    // Fetch the test_results record
    const { data: testRecord, error: testError } = await supabase
      .from("test_results")
      .select("*")
      .eq("id", testId)
      .single();

    if (testError || !testRecord) {
      return NextResponse.json(
        { success: false, error: "Test result not found" },
        { status: 404 }
      );
    }

    // Safely extract values for the payload
    const getEfficiency = (field: any) => {
      if (field && typeof field === "object" && typeof (field as any).efficiency_score === "number") {
        return (field as any).efficiency_score;
      }
      return 0;
    };

    const getCorrect = (field: any) => {
      if (field && typeof field === "object" && typeof (field as any).correct === "number") {
        return (field as any).correct;
      }
      return 0;
    };

    const payload = {
      test_id: testId,
      number_comparison: getEfficiency(testRecord.number_comparison),
      dot_matching: getEfficiency(testRecord.dot_matching),
      number_series: getCorrect(testRecord.number_series),
      single_addition: getCorrect(testRecord.single_addition),
      single_subtraction: getCorrect(testRecord.single_subtraction),
      complex_arithmetic: getCorrect(testRecord.complex_arithmetic),
    };

    // Call the external API for classification
    const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5000";
    const modelUrl = `${baseUrl}/generate-diagnostic`;
    let classificationData: ClassificationResponse;

    try {
      const response = await fetch(modelUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from model API");
      }

      classificationData = await response.json();
    } catch (error) {
      console.error("Model API unavailable:", error);
      return NextResponse.json(
        { success: false, error: "Model API unavailable. Please ensure the backend is running." },
        { status: 503 }
      );
    }

    // predicted_class: "1" for AT-RISK, "0" for TYPICAL
    const finalClassification =
      String(classificationData.predicted_class) === "1" ? "AT-RISK" : "TYPICAL";

    // Update Supabase test_results
    const { error: updateError } = await supabase
      .from("test_results")
      .update({ classification: finalClassification })
      .eq("id", testId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Failed to update test result classification" },
        { status: 500 }
      );
    }

    // Save paths to learning_modules
    const { error: learningModulesError } = await supabase
      .from("learning_modules")
      .upsert(
        {
          result_id: testId,
          paths: classificationData as unknown as Database["public"]["Tables"]["learning_modules"]["Row"]["paths"],
        },
        { onConflict: "result_id" }
      );

    if (learningModulesError) {
      console.error("Failed to save learning modules", learningModulesError);
    }

    return NextResponse.json({
      success: true,
      data: classificationData,
    });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
