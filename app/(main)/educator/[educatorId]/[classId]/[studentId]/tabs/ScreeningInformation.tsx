"use client";

import { useState } from "react";
import { ArrowDownTrayIcon, DocumentPlusIcon, SparklesIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { createRetestAPI } from "@/hooks/use-retest";
import type { Classification } from "@/types";
import type { UnifiedAssessment } from "@/hooks/use-test";
import { createClassificationAPI } from "@/hooks/use-classification";
import { toast } from "sonner";
import { generateClassificationPDF } from "@/utils/pdf-generator";
import type { Json } from "@/database.types";
import AlertModal from "@/components/shared/AlertModal";

const TEST_FIELDS = [
  { key: "dot_matching", label: "Dot Matching" },
  { key: "number_comparison", label: "Number Comparison" },
  { key: "number_series", label: "Number Series" },
  { key: "single_addition", label: "Single Digit Addition" },
  { key: "single_subtraction", label: "Single Digit Subtraction" },
  { key: "complex_arithmetic", label: "Multi-Digit Addition and Subtraction" },
];

type Props = {
  student?: {
    id: string;
    name: string;
  } | null;

  classroom?: {
    id: string;
    name: string;
    student_count: number;
    variant: "yellow" | "green" | "blue" | "gray";
  } | null;

  classId?: string;
  studentId?: string;

  screening: any; // Keep for backward compatibility if needed
  assessments?: UnifiedAssessment[];

  onGenerateLearningPath?: () => void;
};

function extractScoreOrCount(value: Json | undefined, key: string): { display: string; efficiency?: number; correct?: number } {
  if (!value) return { display: "N/A" };

  if (typeof value === "object" && value !== null) {
    const item = value as Record<string, any>;

    let display = "0";
    if (item.correct !== undefined && item.total !== undefined) {
      display = `${item.correct} / ${item.total}`;
    } else if (item.score !== undefined) {
      display = `${item.score}%`;
    }

    return {
      display,
      efficiency: typeof item.efficiency_score === "number" ? item.efficiency_score : undefined,
      correct: typeof item.correct === "number" ? item.correct : undefined,
    };
  }
  return { display: "N/A" };
}

export default function ScreeningInformation({
  student,
  classId,
  studentId,
  assessments = [],
  onGenerateLearningPath,
}: Props) {
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(
    assessments.length > 0 ? assessments[0].id : null
  );

  const [isGeneratingRetest, setIsGeneratingRetest] = useState(false);
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null); // To store freshly generated class
  const [selectedFieldModal, setSelectedFieldModal] = useState<{
    fieldKey: string,
    fieldLabel: string,
    rawData: any,
    questionsList: any[]
  } | null>(null);

  const studentName = student?.name ?? "Student";
  const activeAssessment = assessments.find((a) => a.id === activeAssessmentId);
  const results = activeAssessment?.results || {};

  const fetchedPaths = Array.isArray(results.learning_modules)
    ? results.learning_modules[0]?.paths
    : results.learning_modules?.paths;

  const effectiveClassification = classificationResult || fetchedPaths;

  const isAtRisk =
    (effectiveClassification?.predicted_class === "1" || effectiveClassification?.predicted_class === "AT-RISK") ||
    results.classification === "AT-RISK";

  const hasClassification = results.classification || effectiveClassification;

  const isAllTestsCompleted = activeAssessment
    ? TEST_FIELDS.every((field) => extractScoreOrCount(results[field.key], field.key).display !== "N/A")
    : false;

  const hasUnapprovedRetest = assessments.some(a => !a.isInitial && a.results?.is_approved === false);
  const isUnapprovedRetest = !activeAssessment?.isInitial && activeAssessment?.results?.is_approved === false;

  const latestAssessment = assessments[assessments.length - 1];
  const hasLearningPath = Array.isArray(latestAssessment?.results?.learning_modules)
    ? !!latestAssessment?.results?.learning_modules[0]?.modules
    : !!latestAssessment?.results?.learning_modules?.modules;

  const handleGenerateRetest = async () => {
    setIsGeneratingRetest(true);

    const sortedAssessments = [...assessments].sort((a, b) => {
      return new Date(a.results?.created_at).getTime() - new Date(b.results?.created_at).getTime();
    });

    const studentHistory = sortedAssessments.map((assessment, index) => {
      const paths = Array.isArray(assessment.results?.learning_modules)
        ? assessment.results.learning_modules[0]?.paths
        : assessment.results?.learning_modules?.paths;

      const questionsAsked: any[] = [];
      const records = assessment.results?.records || [];

      TEST_FIELDS.forEach(field => {
        const fieldQuestions = assessment.questions?.[field.key];
        const testsList = Array.isArray(fieldQuestions) ? fieldQuestions : (fieldQuestions?.tests || []);

        records.forEach((rec: any, idx: number) => {
          const questionObj = rec.id
            ? testsList.find((q: any) => q.id === rec.id)
            : testsList[idx];

          if (questionObj) {
            questionsAsked.push({
              question: questionObj.question || questionObj.display || questionObj.sequence || questionObj.prompt,
              correct: questionObj.correct !== undefined ? questionObj.correct : (questionObj.correctAnswer || questionObj.expected_answer)
            });
          }
        });
      });

      return {
        session_id: index + 1,
        date: assessment.results?.created_at,
        diagnostic_data: {
          predicted_class: paths?.predicted_class || "Unknown",
          domain_severity_scores: paths?.domain_severity_scores || {},
          task_importance_scores: paths?.task_importance_scores || {}
        },
        questions_asked: questionsAsked
      };
    });

    const mostRecentAssessment = sortedAssessments[sortedAssessments.length - 1];
    const missingTestsFallback = mostRecentAssessment?.questions || {};

    const retestAPI = createRetestAPI();
    const res = await retestAPI.generateRetest(classId as string, studentId as string, studentHistory, missingTestsFallback, `Targeted Retest - ${new Date().toLocaleDateString()}`);

    if (!res.success) {
      toast.error("Failed to generate retest: " + res.error);
    } else {
      toast.success("Retest generated successfully!");
      window.location.reload();
    }

    setIsGeneratingRetest(false);
  };

  const handleApproveRetest = async (updatedQuestions: any) => {
    if (!activeAssessment) return;
    const retestAPI = createRetestAPI();

    const res1 = await retestAPI.updateAssessmentQuestions(activeAssessment.id, {
      dot_matching: updatedQuestions.dot_matching,
      number_comparison: updatedQuestions.number_comparison,
      number_series: updatedQuestions.number_series,
      single_addition: updatedQuestions.single_addition,
      single_subtraction: updatedQuestions.single_subtraction,
      complex_arithmetic: updatedQuestions.complex_arithmetic,
    });

    if (!res1.success) {
      toast.error("Failed to update questions: " + res1.error);
      return;
    }

    const res2 = await retestAPI.approveRetest(activeAssessment.id);

    if (!res2.success) {
      toast.error("Failed to approve retest: " + res2.error);
    } else {
      toast.success("Retest approved and ready for the student!");
      window.location.reload();
    }
  };

  const handleDeleteRetest = async () => {
    if (!activeAssessment) return;
    const retestAPI = createRetestAPI();
    const res = await retestAPI.deleteRetest(activeAssessment.id);

    if (!res.success) {
      toast.error("Failed to delete retest: " + res.error);
    } else {
      toast.success("Retest deleted successfully.");
      setActiveAssessmentId(assessments[0]?.id || null);
      window.location.reload();
    }
  };

  const handleGenerateClassification = async () => {
    if (!activeAssessment || !activeAssessment.testResultId) return;

    setIsGenerating(true);
    const classificationAPI = createClassificationAPI();

    // Prepare payload
    const payload = {
      test_id: activeAssessment.testResultId,
    };

    const res = await classificationAPI.generateClassification(payload);
    setIsGenerating(false);

    if (res.success) {
      toast.success("Classification generated successfully!");
      setClassificationResult(res.data);
      // In a real app, you might want to re-fetch or optimistically update assessments array here
      // Mutating the active assessment results for optimistic UI
      results.classification = res.data.predicted_class === "1" ? "AT-RISK" : "TYPICAL";
    } else {
      toast.error("Failed to generate classification. " + res.error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!activeAssessment) return;

    try {
      const testPerformance = TEST_FIELDS.map((field) => {
        const data = extractScoreOrCount(results[field.key], field.key);
        return {
          label: field.label,
          display: data.display,
          efficiency: data.efficiency,
        };
      });

      generateClassificationPDF({
        studentName,
        assessmentTitle: activeAssessment.title,
        isAtRisk,
        confidence: effectiveClassification?.confidence,
        decisionPathReadable: effectiveClassification?.decision_path_readable,
        domainSeverityScores: effectiveClassification?.domain_severity_scores,
        testPerformance,
      });

      toast.success("PDF downloaded successfully!");
    } catch (e) {
      console.error("PDF Generation Error:", e);
      toast.error("Failed to generate PDF. See console for details.");
    }
  };

  return (
    <section id="classification-report" className="flex min-h-full w-full flex-col bg-[#F7F7F7] px-8 py-4">
      {/* Header */}
      <div className="shrink-0 border-t border-l border-r border-[#E7E7E7] bg-white px-8 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#29A177]">
            Screening &amp; Assessment Information
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-none text-[#5C5E64]">
            {studentName}&apos;s Profile
          </h1>
        </div>
      </div>

      {/* 3-Column Content */}
      <div className="flex w-full flex-1 gap-4 border border-[#E7E7E7] bg-white p-6 overflow-hidden">

        {/* COLUMN 1: All Assessments */}
        <div className="flex w-1/4 min-w-[250px] flex-col border border-[#EDEDED] bg-[#F9F9F9] overflow-y-auto">
          <div className="bg-[#ECECEC] px-6 py-4 flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Assessments</h2>
            {hasLearningPath && (
              !hasUnapprovedRetest ? (
                <button
                  onClick={handleGenerateRetest}
                  disabled={isGeneratingRetest}
                  className="w-full rounded bg-[#29A177] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#20825f] disabled:opacity-50"
                >
                  {isGeneratingRetest ? "Generating..." : "Generate Retest"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    const unapproved = assessments.find(a => !a.isInitial && a.results?.is_approved === false);
                    if (unapproved) setActiveAssessmentId(unapproved.id);
                  }}
                  className="w-full rounded bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  View Retest
                </button>
              )
            )}
          </div>
          <div className="flex flex-col gap-2 p-4">
            {assessments.length === 0 ? (
              <p className="text-sm text-zinc-500">No tests available.</p>
            ) : (
              assessments.map((assessment) => {
                const isActive = activeAssessmentId === assessment.id;
                return (
                  <button
                    key={assessment.id}
                    onClick={() => {
                      setActiveAssessmentId(assessment.id);
                      setClassificationResult(null); // Reset local generated result on switch
                    }}
                    className={`flex flex-col items-start rounded-md border p-3 text-left transition-all ${isActive
                      ? "border-[#29A177] bg-[#ECF9F4]"
                      : "border-[#ECECEC] bg-white hover:border-[#29A177]/50"
                      }`}
                  >
                    <span className={`text-sm font-bold ${isActive ? "text-[#29A177]" : "text-zinc-700"}`}>
                      {assessment.title}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 mt-1">
                      {assessment.isInitial ? "Initial Assessment" : "Custom Test"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {isUnapprovedRetest ? (
          <RetestEditor
            assessment={activeAssessment!}
            TEST_FIELDS={TEST_FIELDS}
            onApprove={handleApproveRetest}
            onDelete={handleDeleteRetest}
          />
        ) : (
          <>
            {/* COLUMN 2: Selected Test Performance */}
            <div className="flex w-1/3 min-w-[300px] flex-col border border-[#EDEDED] bg-[#F9F9F9] overflow-y-auto">
              <div className="bg-[#ECECEC] px-6 py-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Test Performance</h2>
              </div>
              <div className="flex flex-col p-6 gap-4">
                {activeAssessment ? (
                  <>
                    <p className="text-xl font-extrabold text-[#5C5E64]">{activeAssessment.title}</p>
                    <div className="space-y-3 mt-4">
                      {TEST_FIELDS.map((field) => {
                        const data = extractScoreOrCount(results[field.key], field.key);
                        return (
                          <div
                            key={field.key}
                            onClick={() => {
                              const subTestData = activeAssessment?.questions?.[field.key];
                              const questionsList = Array.isArray(subTestData) ? subTestData : (subTestData?.tests || []);

                              setSelectedFieldModal({
                                fieldKey: field.key,
                                fieldLabel: field.label,
                                rawData: results[field.key],
                                questionsList
                              });
                            }}
                            className="flex flex-col rounded-md border border-[#ECECEC] bg-white px-4 py-3 shadow-sm cursor-pointer hover:border-[#29A177]/50 hover:shadow-md transition-all"
                          >
                            <span className="text-sm font-semibold text-[#5C5E64] mb-1">{field.label}</span>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500">Score / Correct:</span>
                              <span className="font-bold text-[#29A177]">{data.display}</span>
                            </div>
                            {data.efficiency !== undefined && (
                              <div className="flex justify-between items-center text-xs mt-1">
                                <span className="text-zinc-400">Efficiency Score:</span>
                                <span className="font-medium text-zinc-600">{data.efficiency.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-zinc-500">Select a test to view details.</p>
                )}
              </div>
            </div>

            {/* COLUMN 3: Classification Info */}
            <div className="flex flex-1 flex-col border border-[#EDEDED] bg-[#F9F9F9] overflow-y-auto">
              <div className="bg-[#ECECEC] px-6 py-4 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Classification Report</h2>
                {hasClassification && (
                  <button
                    onClick={handleDownloadPDF}
                    className="group flex items-center gap-2 rounded bg-zinc-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-zinc-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download PDF
                  </button>
                )}
              </div>

              <div className="flex flex-col p-6 h-full">
                {!hasClassification ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <SparklesIcon className="h-16 w-16 text-[#D4D4D4] mb-4" />
                    <h3 className="text-xl font-bold text-[#5C5E64]">No Classification Yet</h3>
                    <p className="mt-2 max-w-sm text-sm text-zinc-500">
                      Generate a diagnostic classification based on the student's performance metrics for this test.
                    </p>
                    <button
                      onClick={handleGenerateClassification}
                      disabled={isGenerating || !activeAssessment || !isAllTestsCompleted}
                      className="mt-6 flex h-12 items-center gap-2 rounded-lg bg-[#29A177] px-6 text-sm font-bold text-white transition hover:bg-[#17815C] disabled:cursor-not-allowed disabled:opacity-50"
                      title={!isAllTestsCompleted ? "All test types must be completed before generating a classification" : undefined}
                    >
                      {isGenerating ? "Analyzing..." : "Generate Classification"}
                    </button>
                    {!isAllTestsCompleted && (
                      <p className="mt-4 text-xs font-semibold text-red-500">
                        Cannot generate classification: Not all tests are completed.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Result Header */}
                    <div className={`flex flex-col items-center justify-center rounded-xl p-8 text-center ${isAtRisk ? "bg-[#FFF0F0] border border-red-100" : "bg-[#ECF9F4] border border-green-100"}`}>
                      <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Status</p>
                      <h2 className={`mt-2 text-4xl font-black ${isAtRisk ? "text-red-500" : "text-[#29A177]"}`}>
                        {isAtRisk ? "AT-RISK" : "TYPICAL"}
                      </h2>
                      {effectiveClassification?.confidence && (
                        <p className="mt-3 text-sm font-medium text-zinc-600">
                          Confidence: {(effectiveClassification.confidence * 100).toFixed(1)}%
                        </p>
                      )}
                    </div>

                    {/* Additional Generated Metrics (Show if available) */}
                    {effectiveClassification && (
                      <>
                        <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm">
                          <h3 className="text-sm font-bold uppercase text-zinc-600 border-b pb-2 mb-3">Decision Path</h3>
                          <p className="text-sm text-zinc-700 font-mono bg-zinc-50 p-3 rounded">
                            {effectiveClassification.decision_path_readable}
                          </p>
                        </div>

                        <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm">
                          <h3 className="text-sm font-bold uppercase text-zinc-600 border-b pb-2 mb-3">Domain Severity Scores</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            {Object.entries(effectiveClassification.domain_severity_scores || {}).map(([domain, score]) => {
                              const numScore = score as number;
                              if (numScore === 0) return null; // Hide 0 scores to keep it clean
                              return (
                                <div key={domain} className="flex flex-col gap-1">
                                  <span className="text-xs font-semibold text-zinc-500 truncate">{domain}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(numScore * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-700">{numScore.toFixed(3)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-auto pt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={onGenerateLearningPath}
                        className="group flex h-12 w-full max-w-sm items-center justify-center gap-3 rounded-lg bg-[#29A177] text-white shadow-sm transition-all duration-200 hover:bg-[#17815C] active:scale-[0.98]"
                      >
                        <DocumentPlusIcon className="h-5 w-5" />
                        <span className="text-sm font-bold">Action Learning Path</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedFieldModal && (
        <AlertModal
          isOpen={true}
          title={`${selectedFieldModal.fieldLabel} Details`}
          onClose={() => setSelectedFieldModal(null)}
          maxWidth="md"
        >
          {(() => {
            const data = selectedFieldModal.rawData;
            if (!data || !data.records || !Array.isArray(data.records)) {
              return <p className="text-sm text-zinc-500">No detailed records available for this test.</p>;
            }
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-3 rounded border border-zinc-100">
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Total Time</p>
                    <p className="font-bold text-zinc-700">{data.elapsed_seconds ?? 0}s</p>
                  </div>
                  <div className="bg-zinc-50 p-3 rounded border border-zinc-100">
                    <p className="text-xs text-zinc-500 font-semibold uppercase">Accuracy</p>
                    <p className="font-bold text-zinc-700">{Math.round(data.accuracy ?? 0)}%</p>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-zinc-700 border-b pb-2">Item Breakdown</h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {data.records.map((record: any, index: number) => {
                    const questionObj = record.id
                      ? selectedFieldModal.questionsList.find((q: any) => q.id === record.id)
                      : selectedFieldModal.questionsList[index];

                    const questionText = questionObj?.question || questionObj?.display || questionObj?.sequence || questionObj?.prompt || `Item ${index + 1}`;
                    const correctAnswer = questionObj?.correct !== undefined ? questionObj?.correct : (questionObj?.correctAnswer || questionObj?.expected_answer);

                    return (
                      <div key={index} className="flex flex-col p-3 rounded border border-zinc-100 bg-white shadow-sm gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-zinc-700">{questionText}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono text-zinc-500 bg-zinc-50 px-2 py-1 rounded border border-zinc-100">
                              {record.response_time} ms
                            </span>
                            {record.number ? (
                              <span className="text-xs font-bold bg-[#ECF9F4] text-[#29A177] px-2 py-1 rounded w-16 text-center">Correct</span>
                            ) : (
                              <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded w-16 text-center">Wrong</span>
                            )}
                          </div>
                        </div>
                        {correctAnswer !== undefined && (
                          <div className="text-xs text-zinc-500 bg-zinc-50/50 rounded px-2 py-1 inline-block self-start border border-zinc-50">
                            Correct Answer: <span className="font-semibold text-zinc-700">{String(correctAnswer)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </AlertModal>
      )}
    </section>
  );
}

function RetestEditor({
  assessment,
  TEST_FIELDS,
  onApprove,
  onDelete
}: {
  assessment: any,
  TEST_FIELDS: any[],
  onApprove: (updatedQuestions: any) => Promise<void>,
  onDelete: () => Promise<void>
}) {
  const [editedQuestions, setEditedQuestions] = useState(assessment.questions || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFieldChange = (fieldKey: string, newTests: any[]) => {
    setEditedQuestions((prev: any) => ({
      ...prev,
      [fieldKey]: {
        ...(prev[fieldKey] || {}),
        tests: newTests
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onApprove(editedQuestions);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  return (
    <div className="flex flex-1 flex-col border border-[#EDEDED] bg-[#F9F9F9] overflow-y-auto">
      <div className="bg-[#ECECEC] px-6 py-4 flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Retest Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="flex items-center gap-2 rounded bg-[#29A177] px-4 py-1 text-xs font-semibold text-white transition hover:bg-[#20825f] disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4" />
            {isSaving ? "Approving..." : "Save & Approve Retest"}
          </button>
        </div>
      </div>

      <div className="flex flex-col p-6 h-full space-y-6">
        <p className="text-sm text-zinc-600 mb-4">
          Review the dynamically generated retest below. You can edit the questions and correct answers.
          When satisfied, click <strong>Save & Approve Retest</strong>.
        </p>

        {TEST_FIELDS.map((field) => {
          const fieldData = editedQuestions[field.key];
          const tests = Array.isArray(fieldData) ? fieldData : (fieldData?.tests || []);
          const rationale = fieldData?.rationale;

          return (
            <div key={field.key} className="border border-zinc-200 bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-md font-bold text-zinc-800 mb-2">{field.label}</h3>
              {rationale && (
                <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded mb-4">
                  <strong>Rationale:</strong> {rationale}
                </p>
              )}

              <div className="space-y-2">
                {tests.map((testItem: any, index: number) => {
                  const qValue = testItem.question || testItem.display || testItem.sequence || testItem.prompt || "";
                  const aValue = testItem.correct !== undefined ? testItem.correct
                    : testItem.correctAnswer !== undefined ? testItem.correctAnswer
                      : testItem.expected_answer !== undefined ? testItem.expected_answer
                        : testItem.match !== undefined ? String(testItem.match)
                          : "";

                  const handleQuestionChange = (newQValue: string) => {
                    const newTests = [...tests];
                    if (testItem.display !== undefined) newTests[index] = { ...testItem, display: newQValue };
                    else if (testItem.sequence !== undefined) newTests[index] = { ...testItem, sequence: newQValue };
                    else if (testItem.prompt !== undefined) newTests[index] = { ...testItem, prompt: newQValue };
                    else newTests[index] = { ...testItem, question: newQValue };
                    handleFieldChange(field.key, newTests);
                  };

                  let questionEditor;
                  if (field.key === "dot_matching" || field.key === "number_comparison") {
                    const parts = qValue.split("vs").map((s: string) => s.trim());
                    questionEditor = (
                      <div className="flex-1 flex items-center gap-2">
                        <input type="text" value={parts[0] || ""} onChange={e => handleQuestionChange(`${e.target.value} vs ${parts[1] || ""}`)} className="w-16 text-center rounded border border-zinc-300 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300" />
                        <span className="text-zinc-500 font-medium text-sm">vs</span>
                        <input type="text" value={parts[1] || ""} onChange={e => handleQuestionChange(`${parts[0] || ""} vs ${e.target.value}`)} className="w-16 text-center rounded border border-zinc-300 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300" />
                      </div>
                    );
                  } else if (field.key === "number_series") {
                    const allParts = qValue.split(",").map((s: string) => s.trim());
                    // Disregard the last element since it is always the blank '_'
                    const editableParts = allParts.length > 1 ? allParts.slice(0, -1) : allParts;

                    questionEditor = (
                      <div className="flex-1 flex items-center gap-1 flex-wrap">
                        {editableParts.map((p: string, pIdx: number) => (
                          <div key={pIdx} className="flex items-center gap-1">
                            <input type="text" value={p} onChange={e => {
                              const newParts = [...editableParts];
                              newParts[pIdx] = e.target.value;
                              handleQuestionChange([...newParts, "_"].join(", "));
                            }} className="w-12 text-center rounded border border-zinc-300 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300" />
                            <span className="text-zinc-500 font-bold text-lg">,</span>
                          </div>
                        ))}
                        <span className="text-zinc-500 font-bold px-2">_</span>
                      </div>
                    );
                  } else if (field.key === "single_addition" || field.key === "single_subtraction" || field.key === "complex_arithmetic") {
                    const operator = qValue.includes("+") ? "+" : qValue.includes("-") ? "-" : "";
                    if (operator) {
                      const parts = qValue.split(operator).map((s: string) => s.trim());
                      questionEditor = (
                        <div className="flex-1 flex items-center gap-2">
                          <input type="text" value={parts[0] || ""} onChange={e => handleQuestionChange(`${e.target.value} ${operator} ${parts[1] || ""}`)} className="w-16 text-center rounded border border-zinc-300 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300" />
                          <span className="text-zinc-500 font-bold text-lg">{operator}</span>
                          <input type="text" value={parts[1] || ""} onChange={e => handleQuestionChange(`${parts[0] || ""} ${operator} ${e.target.value}`)} className="w-16 text-center rounded border border-zinc-300 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300" />
                        </div>
                      );
                    } else {
                      questionEditor = <input type="text" className="flex-1 rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300" value={qValue} onChange={e => handleQuestionChange(e.target.value)} placeholder="Question" />;
                    }
                  } else {
                    questionEditor = <input type="text" className="flex-1 rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300" value={qValue} onChange={e => handleQuestionChange(e.target.value)} placeholder="Question" />;
                  }

                  let answerEditor;
                  if (testItem.match !== undefined || field.key === "dot_matching") {
                    answerEditor = (
                      <select
                        className="w-32 rounded border border-zinc-300 px-2 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none bg-white cursor-pointer"
                        value={String(aValue)}
                        onChange={(e) => {
                          const newTests = [...tests];
                          newTests[index] = { ...testItem, match: e.target.value === "true" };
                          handleFieldChange(field.key, newTests);
                        }}
                      >
                        <option value="" disabled>Select...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    );
                  } else {
                    answerEditor = (
                      <input
                        type="text"
                        className="w-32 rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none placeholder-zinc-300"
                        value={aValue}
                        onChange={(e) => {
                          const newTests = [...tests];
                          const val = e.target.value;
                          const numVal = isNaN(Number(val)) || val === "" ? val : Number(val);

                          if (testItem.correctAnswer !== undefined) {
                            newTests[index] = { ...testItem, correctAnswer: numVal };
                          } else if (testItem.expected_answer !== undefined) {
                            newTests[index] = { ...testItem, expected_answer: numVal };
                          } else {
                            newTests[index] = { ...testItem, correct: numVal };
                          }

                          handleFieldChange(field.key, newTests);
                        }}
                        placeholder="Answer"
                      />
                    );
                  }

                  return (
                    <div key={testItem.id || index} className="flex gap-3 items-center">
                      <span className="text-xs font-medium text-zinc-400 w-6">{index + 1}.</span>
                      {questionEditor}
                      {answerEditor}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}