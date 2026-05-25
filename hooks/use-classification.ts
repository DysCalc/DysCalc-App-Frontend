import { handleReturnError, type ApiResult } from "./utils";

export type ClassificationPayload = {
  test_id: string;
};

export type ClassificationResponse = {
  confidence: number;
  decision_path: any[];
  decision_path_readable: string;
  domain_severity_scores: Record<string, number>;
  leaf_distribution: Record<string, number>;
  predicted_class: string;
  task_importance_scores: Record<string, number>;
};

export function createClassificationAPI() {
  return {
    async generateClassification(
      payload: ClassificationPayload
    ): Promise<ApiResult<ClassificationResponse>> {
      try {
        const response = await fetch("/api/classification/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          return handleReturnError(result.error || "Failed to generate classification");
        }

        return { success: true, data: result.data };
      } catch (error) {
        return handleReturnError(error);
      }
    },
  };
}
