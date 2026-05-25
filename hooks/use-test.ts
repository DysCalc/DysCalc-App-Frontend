import type { TestOutput, TestType } from "@/types/test";
import type { Classroom, Student } from "@/types";
import { handleReturnError, type ApiResult } from "./utils";
import initialAssessmentData from "@/data/initial-assessment-questions.json";

function getMedian(values: number[]) {
	if (!values.length) return 0;

	const sorted = [...values].sort((a, b) => a - b);
	const midpoint = Math.floor(sorted.length / 2);

	if (sorted.length % 2 === 0) {
		return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
	}

	return sorted[midpoint];
}

export type CalcQuestion = {
	id: string;
	correctAnswer: string;
};

export type UnifiedAssessment = {
	id: string;
	testResultId?: string;
	title: string;
	description: string;
	isInitial: boolean;
	questions: Record<string, any>;
	results: any;
};

export function createTestAPI() {
	return {
		async getAllTest(classroomId: Classroom['id'], studentId: Student['id']): Promise<ApiResult<UnifiedAssessment[]>> {
			try {
				const response = await fetch(
					`/api/test/classroom/${classroomId}/student/${studentId}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				const result = await response.json();

				if (!response.ok) {
					return handleReturnError(result.error || "Failed to get all tests");
				}

				const dbResults = result.data || [];

				let foundInitial = false;
				const unifiedAssessments: UnifiedAssessment[] = [];

				for (const row of dbResults) {
					const isMissingQuestions = !row.assessment_questions || (Array.isArray(row.assessment_questions) && row.assessment_questions.length === 0) || Object.keys(row.assessment_questions).length === 0;

					if (isMissingQuestions) {
						if (!foundInitial) {
							foundInitial = true;
							unifiedAssessments.push({
								id: row.id, // Use row.id for absolute uniqueness
								testResultId: row.id,
								title: "Initial Assessment",
								description: "Standard initial assessment questions",
								isInitial: true,
								questions: initialAssessmentData,
								results: row
							});
						}
						// Otherwise, it's an orphaned retest where assessment_questions was deleted manually. Skip it.
					} else {
						const aq = Array.isArray(row.assessment_questions) ? row.assessment_questions[0] : row.assessment_questions;
						unifiedAssessments.push({
							id: row.id, // Use row.id for consistency and uniqueness
							testResultId: row.id,
							title: aq.title,
							description: aq.description || "",
							isInitial: false,
							questions: {
								number_comparison: aq.number_comparison,
								dot_matching: aq.dot_matching,
								number_series: aq.number_series,
								single_addition: aq.single_addition,
								single_subtraction: aq.single_subtraction,
								complex_arithmetic: aq.complex_arithmetic
							},
							results: row
						});
					}
				}

				if (!foundInitial) {
					unifiedAssessments.unshift({
						id: "initial-assessment",
						testResultId: "initial-assessment",
						title: "Initial Assessment",
						description: "Standard initial assessment questions",
						isInitial: true,
						questions: initialAssessmentData,
						results: null
					});
				}

				return { success: true, data: unifiedAssessments };
			} catch (error) {
				return handleReturnError(error);
			}
		},
		async recordTest(
			classroomId: Classroom['id'],
			studentId: Student['id'],
			testType: TestType,
			testResultId: string,
			answers: Record<string, string>,
			reactionTimes: Record<string, number>,
			questions: CalcQuestion[],
			elapsedSeconds: number
		): Promise<ApiResult<{ id: string; created_at: string; result: any }>> {
			try {
				const totalCount = questions.length;
				const correctItems = questions.filter(
					(item) => answers[item.id] === item.correctAnswer
				);
				const correctCount = correctItems.length;
				const percentCorrect = totalCount ? (correctCount / totalCount) * 100 : 0;
				const answeredCount = Object.keys(answers).length;

				const records = questions.map((item) => ({
					id: item.id,
					number: answers[item.id] === item.correctAnswer,
					response_time: reactionTimes[item.id],
				}));

				const output: TestOutput = {
					answered: answeredCount,
					correct: correctCount,
					total: totalCount,
					accuracy: percentCorrect,
					elapsed_seconds: elapsedSeconds,
					records,
				};

				const isEfficiencyTest = testType === "number_comparison" || testType === "dot_matching";

				if (isEfficiencyTest) {
					const correctReactionTimes = correctItems.map((item) => reactionTimes[item.id])
						.filter((value): value is number => Number.isFinite(value));

					const medianReactionTime = getMedian(correctReactionTimes);
					const accuracyScore = totalCount > 0 ? correctCount / totalCount : 0;

					const efficiencyScore = accuracyScore > 0 && Number.isFinite(medianReactionTime)
						? medianReactionTime / accuracyScore
						: undefined;

					output.efficiency_score = efficiencyScore;
				}

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
							test_result_id: testResultId
						}),
					}
				);

				const result = await response.json();

				if (!response.ok) {
					return handleReturnError(result.error || "Failed to save test results");
				}

				return { success: true, data: { ...result.data, result: output } };
			} catch (error) {
				return handleReturnError(error);
			}
		},
	};
}