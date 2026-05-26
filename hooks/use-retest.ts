import type { Classroom, Student } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";
import { createClient } from "@/lib/supabase-client";

export function createRetestAPI() {
  return {
    async generateRetest(
      classroomId: Classroom["id"],
      studentId: Student["id"],
      studentHistory: any[],
      missingTestsFallback: Record<string, any>,
      title?: string
    ): Promise<ApiResult<any>> {
      try {
        const response = await fetch(`/api/retest/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: studentId,
            classroom_id: classroomId,
            student_history: studentHistory,
            missing_tests_fallback: missingTestsFallback,
            title,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          return handleReturnError(result.error || "Failed to generate retest");
        }

        return { success: true, data: result.data };
      } catch (err: any) {
        return handleReturnError(err.message || "An unexpected error occurred");
      }
    },

    async updateAssessmentQuestions(
      assessmentId: string,
      updates: Record<string, any>
    ): Promise<ApiResult<any>> {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("assessment_questions")
          .update(updates)
          .eq("test_result_id", assessmentId)
          .select()
          .single();

        if (error) {
          return handleReturnError(error.message);
        }
        return { success: true, data };
      } catch (err: any) {
        return handleReturnError(err.message || "An unexpected error occurred");
      }
    },

    async approveRetest(testResultId: string): Promise<ApiResult<any>> {
      try {
        const supabase = createClient();
        const { error: error1 } = await supabase
          .from("test_results")
          .update({ is_approved: true })
          .eq("id", testResultId);

        if (error1) {
          return handleReturnError(error1.message);
        }

        const { data, error: error2 } = await supabase
          .from("assessment_questions")
          .update({ is_given: true })
          .eq("test_result_id", testResultId)
          .select()
          .single();

        if (error2) {
          return handleReturnError(error2.message);
        }
        
        return { success: true, data };
      } catch (err: any) {
        return handleReturnError(err.message || "An unexpected error occurred");
      }
    },

    async deleteRetest(testResultId: string): Promise<ApiResult<any>> {
      try {
        const supabase = createClient();
        // Deleting test_result will cascade delete assessment_questions
        const { data, error } = await supabase
          .from("test_results")
          .delete()
          .eq("id", testResultId);

        if (error) {
          return handleReturnError(error.message);
        }
        return { success: true, data: true };
      } catch (err: any) {
        return handleReturnError(err.message || "An unexpected error occurred");
      }
    },
  };
}
