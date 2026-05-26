import { handleReturnError, type ApiResult } from "./utils";

export type LearningModuleResponse = {
  status: string;
  decision_path_rationale: string;
  overall_summary: string;
  decision_path_interpretation: string;
  diagnostic_modules: Array<{
    domain_name: string;
    clinical_explanation: string;
    learning_objectives: string[];
    conceptual_explanation: string;
    worked_example: {
      problem: string;
      reasoning_steps: string[];
      final_answer: string | number;
    };
    teaching_strategy: string;
    practice_set: Array<{
      problem: string;
      expected_answer: string | number;
      hint: string;
    }>;
  }>;
  formative_assessment: Array<{
    question: string;
    expected_answer: string | number;
  }>;
  _meta_validation_report?: any;
  error?: string;
  best_validation_report?: any;
  best_candidate?: any;
};

export function createLearningPathAPI() {
  return {
    async generateLearningPath(
      test_id: string
    ): Promise<ApiResult<LearningModuleResponse>> {
      try {
        const response = await fetch("/api/learning-path/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ test_id }),
        });

        const result = await response.json();

        if (!response.ok) {
          return handleReturnError(result.error || "Failed to generate learning path module");
        }

        return { success: true, data: result.data };
      } catch (error) {
        return handleReturnError(error);
      }
    },

    async updateLearningPath(
      test_id: string,
      module_data: LearningModuleResponse
    ): Promise<ApiResult<LearningModuleResponse>> {
      try {
        const response = await fetch("/api/learning-path/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ test_id, module_data }),
        });

        const result = await response.json();

        if (!response.ok) {
          return handleReturnError(result.error || "Failed to update learning path module");
        }

        return { success: true, data: result.data };
      } catch (error) {
        return handleReturnError(error);
      }
    }
  };
}
