import { handleReturnError, type ApiResult } from "./utils";
import { type Database, type Json } from "@/database.types";

export type ReportScoreData = {
  dot_matching: Json | null;
  number_comparison: Json | null;
  number_series: Json | null;
  single_addition: Json | null;
  single_subtraction: Json | null;
  complex_arithmetic: Json | null;
};

export type EducatorReportRow = {
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
  scores: ReportScoreData;
};

// Extracted from student page for general re-use
export function normalizePercent(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (value < 0) return null;
  if (value <= 1) return Number((value * 100).toFixed(1));
  if (value <= 100) return Number(value.toFixed(1));
  return null;
}

export function scoreFromJson(value: Json | null): number | null {
  if (value === null) return null;
  
  if (typeof value === "number") {
    return normalizePercent(value);
  }

  if (Array.isArray(value)) {
    const scores = value
      .map((item) => scoreFromJson(item))
      .filter((item): item is number => item !== null);

    if (!scores.length) return null;
    const average = scores.reduce((sum, current) => sum + current, 0) / scores.length;
    return Number(average.toFixed(1));
  }

  if (value && typeof value === "object") {
    const item = value as Record<string, Json | undefined>;
    const directKeys = ["score", "percentage", "percent", "accuracy", "value", "result"];

    for (const key of directKeys) {
      const candidate = item[key];
      if (typeof candidate === "number") {
        const normalized = normalizePercent(candidate);
        if (normalized !== null) return normalized;
      }
    }

    if (typeof item.correct === "number" && typeof item.total === "number" && item.total > 0) {
      return Number(((item.correct / item.total) * 100).toFixed(1));
    }

    const nested = Object.values(item)
      .map((nestedValue) => (nestedValue === undefined ? null : scoreFromJson(nestedValue)))
      .filter((nestedValue): nestedValue is number => nestedValue !== null);

    if (!nested.length) return null;
    const average = nested.reduce((sum, current) => sum + current, 0) / nested.length;
    return Number(average.toFixed(1));
  }

  return null;
}

export function createEducatorReportsAPI() {
  return {
    async getReportsData(educatorId: string): Promise<ApiResult<EducatorReportRow[]>> {
      try {
        const response = await fetch(`/api/educators/${educatorId}/reports`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          return handleReturnError(result.error || "Failed to fetch reports data");
        }

        return { success: true, data: result.data };
      } catch (err: any) {
        return handleReturnError(err.message || "An unexpected error occurred");
      }
    },
  };
}
