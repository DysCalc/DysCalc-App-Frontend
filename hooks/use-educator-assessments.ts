import { handleReturnError, type ApiResult } from "./utils";
import { type Database } from "@/database.types";

export type EducatorAssessmentRow = {
  id: string;
  created_at: string;
  is_approved: boolean;
  classification: Database["public"]["Enums"]["CLASSIFICATION"] | null;
  classroom_id: string;
  classroom_name: string;
  student_id: string;
  student_name: string;
  student_avatar: string | null;
  test_title: string;
  is_generating: boolean;
  is_given: boolean;
  is_initial: boolean;
};

export function createEducatorAssessmentsAPI() {
  return {
    async getAllAssessments(educatorId: string): Promise<ApiResult<EducatorAssessmentRow[]>> {
      try {
        const response = await fetch(`/api/educators/${educatorId}/assessments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          return handleReturnError(result.error || "Failed to fetch aggregated assessments");
        }

        return { success: true, data: result.data };
      } catch (err: any) {
        return handleReturnError(err.message || "An unexpected error occurred");
      }
    },
  };
}
