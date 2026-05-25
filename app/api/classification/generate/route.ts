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
      console.warn("Model API unavailable, falling back to mock data", error);
      // Mocked output as requested in the example
      classificationData = {
        confidence: 0.9642857142857143,
        decision_path: [["NC", 1508.9295343137246, ">"]],
        decision_path_readable: "NC > 1508.9295",
        domain_severity_scores: {
          "Addition vs. Subtraction Asymmetry": 0.06699292094681254,
          "Basic vs. Complex Arithmetic Contrast": 0.15652395203395456,
          "Digit-Dot Matching": 0.0,
          "Multi-Digit Addition and Subtraction": 0.0,
          "Number Comparison": 0.03614864514513576,
          "Number Series": 0.0,
          "Overall Arithmetic Fluency": 0.2553815450184989,
          "Overall Processing Efficiency": 0.175167350024406,
          "Processing-Fluency Integration": 0.19878161876668884,
          "Single-Digit Addition": 0.0,
          "Single-Digit Subtraction": 0.0,
          "Symbolic vs. Non-Symbolic Processing Difference": 0.11100396806450342,
        },
        leaf_distribution: { "1": 26 },
        predicted_class: "1",
        task_importance_scores: {
          ADD: 0.0,
          AF: 0.24312220312171876,
          AS: 0.06377699114072007,
          BC: 0.14901017243456938,
          CA: 0.0,
          DM: 0.0,
          NC: 0.08241738902004887,
          NP: 0.16675861229456496,
          NS: 0.0,
          PF: 0.18923930110595213,
          SN: 0.10567533088242577,
          SUB: 0.0,
        },
      };
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
