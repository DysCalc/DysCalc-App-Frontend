import type { TestOutput, TestType } from "@/types/test";
import type { Classroom, Student } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";

export function createTestAPI() {
	return {
		async recordTest(
			classroomId: Classroom['id'],
			studentId: Student['id'],
			testType: TestType,
			output: TestOutput
		): Promise<ApiResult<{ id: string; created_at: string }>> {
			try {
				const response = await fetch(
					`/api/test/classroom/${classroomId}/student/${studentId}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							test_type: testType,
							payload: output,
						}),
					}
				);

				const result = await response.json();

				if (!response.ok) {
					return handleReturnError(result.error || "Failed to save test results");
				}

				return { success: true, data: result.data };
			} catch (error) {
				return handleReturnError(error);
			}
		},
	};
}

// type TestResult = {
//     classification: "TYPICAL" | "AT-RISK" | null;
//     classroom_id: string | null;
//     complex_arithmetic: Json;
//     created_at: string;
//     dot_matching: Json | null;
//     id: string;
//     is_approved: boolean;
//     number_comparison: Json | null;
//     number_series: Json | null;
//     single_addition: Json | null;
//     single_subtraction: Json | null;
//     student_id: string | null;
// }