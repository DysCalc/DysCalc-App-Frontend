"use client";

import { useState, useEffect } from "react";
import { ArrowDownTrayIcon, DocumentPlusIcon, SparklesIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdFromUrl = searchParams.get("assessmentId");

  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(() => {
    if (assessmentIdFromUrl && assessments.some(a => a.id === assessmentIdFromUrl)) {
      return assessmentIdFromUrl;
    }
    return assessments.length > 0 ? assessments[0].id : null;
  });

  // Update if URL changes
  useEffect(() => {
    if (assessmentIdFromUrl && assessments.some(a => a.id === assessmentIdFromUrl)) {
      setActiveAssessmentId(assessmentIdFromUrl);
    }
  }, [assessmentIdFromUrl, assessments]);

  const isGeneratingDb = assessments.some(a => a.isGenerating);

  const [isGenerating, setIsGenerating] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null); // To store freshly generated class
  const [selectedFieldModal, setSelectedFieldModal] = useState<{
    fieldKey: string,
    fieldLabel: string,
    rawData: any,
    questionsList: any[]
  } | null>(null);

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [showSaveMetadataConfirm, setShowSaveMetadataConfirm] = useState(false);

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

  const handleGenerateRetest = async (isRegenerating = false) => {
    if (isRegenerating && activeAssessment) {
      const retestAPI = createRetestAPI();
      const res = await retestAPI.deleteRetest(activeAssessment.id);
      if (!res.success) {
        toast.error("Failed to clean up old retest: " + res.error);
        return;
      }
    }

    const validAssessments = isRegenerating ? assessments.filter(a => a.id !== activeAssessment?.id) : assessments;

    const sortedAssessments = [...validAssessments].sort((a, b) => {
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
  };

  const handleApproveRetest = async (updatedQuestions: any, newTitle: string, newDescription: string) => {
    if (!activeAssessment) return;
    const retestAPI = createRetestAPI();

    const res1 = await retestAPI.updateAssessmentQuestions(activeAssessment.id, {
      title: newTitle,
      description: newDescription,
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

  const startEditingMetadata = () => {
    if (!activeAssessment) return;
    setEditedTitle(activeAssessment.title || "");
    setEditedDescription(activeAssessment.description || "");
    setIsEditingMetadata(true);
  };

  const handleSaveMetadata = async () => {
    if (!activeAssessment) return;
    setIsSavingMetadata(true);
    const retestAPI = createRetestAPI();
    const res = await retestAPI.updateAssessmentQuestions(activeAssessment.id, {
      title: editedTitle,
      description: editedDescription,
    });

    if (res.success) {
      toast.success("Metadata updated successfully!");
      setIsEditingMetadata(false);
      window.location.reload();
    } else {
      toast.error("Failed to update: " + res.error);
    }
    setIsSavingMetadata(false);
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
                  onClick={() => handleGenerateRetest(false)}
                  disabled={isGeneratingDb}
                  className="w-full flex items-center justify-center gap-2 rounded bg-[#29A177] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#20825f] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isGeneratingDb ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate Retest"
                  )}
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
                      // Clear query param so it doesn't force the old assessment on reload
                      router.replace(window.location.pathname, { scroll: false });
                    }}
                    className={`flex flex-col items-start rounded-md border p-3 text-left transition-all ${isActive
                      ? "border-[#29A177] bg-[#ECF9F4]"
                      : "border-[#ECECEC] bg-white hover:border-[#29A177]/50"
                      }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className={`text-sm font-bold truncate ${isActive ? "text-[#29A177]" : "text-zinc-700"}`}>
                        {assessment.title}
                      </span>
                      {(() => {
                        if (assessment.isGenerating) {
                          return <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200"><SparklesIcon className="h-2 w-2" /> Gen</span>;
                        } else if (!assessment.isInitial && assessment.results?.is_approved === false) {
                          return <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">Needs Approval</span>;
                        }
                        return <span className="shrink-0 inline-flex items-center rounded-full bg-[#ECF9F4] px-1.5 py-0.5 text-[10px] font-bold text-[#29A177] border border-[#29A177]/20">Ready</span>;
                      })()}
                    </div>
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
            onRegenerate={() => handleGenerateRetest(true)}
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
                    {!isEditingMetadata ? (
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xl font-extrabold text-[#5C5E64]">{activeAssessment.title}</p>
                          {activeAssessment.description && (
                            <p className="text-sm text-zinc-500 mt-1">{activeAssessment.description}</p>
                          )}
                        </div>
                        {!activeAssessment.isInitial && (
                          <button
                            onClick={startEditingMetadata}
                            className="text-xs font-semibold text-[#29A177] hover:text-[#20825f] underline underline-offset-2"
                          >
                            Edit Details
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 rounded-lg border border-[#29A177] p-4 bg-white shadow-sm">
                        <div>
                          <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Retest Title</label>
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="mt-1 w-full rounded border border-zinc-300 p-2 text-sm text-zinc-900 font-medium focus:border-[#29A177] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Description</label>
                          <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            className="mt-1 w-full rounded border border-zinc-300 p-2 text-sm text-zinc-900 focus:border-[#29A177] focus:outline-none"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setIsEditingMetadata(false)}
                            disabled={isSavingMetadata}
                            className="rounded px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setShowSaveMetadataConfirm(true)}
                            disabled={isSavingMetadata}
                            className="rounded bg-[#29A177] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#20825f] disabled:opacity-50 transition flex items-center gap-2"
                          >
                            {isSavingMetadata ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    )}
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
                      className="mt-6 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#29A177] px-6 text-sm font-bold text-white transition hover:bg-[#17815C] disabled:cursor-not-allowed disabled:opacity-75"
                      title={!isAllTestsCompleted ? "All test types must be completed before generating a classification" : undefined}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        "Generate Classification"
                      )}
                    </button>
                    {isGenerating && (
                      <p className="mt-4 max-w-sm text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-4 py-3 rounded-md">
                        Please wait. The AI is warming up and this may take up to 50 seconds if the backend server was idle.
                      </p>
                    )}
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
                      {isAtRisk && (
                        <p className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-100 font-medium">
                          This student shows patterns associated with dyscalculia. Consider scheduling a targeted intervention. Always apply your own professional judgment.
                        </p>
                      )}
                      {effectiveClassification?.confidence && (
                        <div className="mt-4 flex flex-col items-center">
                          <p className="text-sm font-bold text-zinc-700">
                            Model Confidence: {(effectiveClassification.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-zinc-500 max-w-xs mt-1">
                            Confidence means how certain the AI model is in its classification, not the student's test score.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Additional Generated Metrics (Show if available) */}
                    {effectiveClassification && (
                      <>
                        <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm">
                          <h3 className="text-sm font-bold uppercase text-zinc-600 border-b pb-2 mb-3">Decision Path</h3>
                          <p className="text-sm text-zinc-700 mb-3 font-medium">
                            Flagged because scores in key areas fell below typical thresholds for this age group.
                          </p>
                          <details className="group">
                            <summary className="text-xs font-semibold text-[#29A177] cursor-pointer hover:underline outline-none">
                              Show technical details
                            </summary>
                            <p className="mt-2 text-xs text-zinc-700 font-mono bg-zinc-50 p-3 rounded border border-zinc-100 overflow-x-auto whitespace-pre-wrap">
                              {effectiveClassification.decision_path_readable}
                            </p>
                          </details>
                        </div>

                        <div className="bg-white rounded-xl border border-[#ECECEC] p-5 shadow-sm">
                          <h3 className="text-sm font-bold uppercase text-zinc-600 border-b pb-2 mb-2">Domain Severity Scores</h3>
                          <p className="text-xs text-zinc-500 mb-4">Higher score = greater area of concern. Scores above 0.15 are recommended for intervention.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                            {Object.entries(effectiveClassification.domain_severity_scores || {}).map(([domain, score]) => {
                              const numScore = score as number;
                              if (numScore === 0) return null;
                              const isCritical = numScore > 0.15;
                              const barColor = isCritical ? "bg-amber-500" : "bg-blue-500";
                              return (
                                <div key={domain} className="flex flex-col gap-1">
                                  <div className="flex justify-between items-end">
                                    <span className="text-xs font-semibold text-zinc-600 truncate">{domain}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isCritical ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                      {isCritical ? "Monitor" : "Typical"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                                      <div className={`h-full ${barColor}`} style={{ width: `${Math.min(numScore * 100, 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-700 w-8 text-right">{numScore.toFixed(3)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="mt-auto pt-6 flex flex-col items-center">
                      <p className="text-xs text-zinc-500 mb-3 text-center max-w-sm">
                        Based on this student's results, a personalized learning path has been suggested. Click below to review and activate it.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeAssessmentId) {
                            const newUrl = new URL(window.location.href);
                            newUrl.searchParams.set("assessmentId", activeAssessmentId);
                            router.push(`${newUrl.pathname}?${newUrl.searchParams.toString()}`);
                          }
                          if (onGenerateLearningPath) onGenerateLearningPath();
                        }}
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

      <AlertModal
        isOpen={showSaveMetadataConfirm}
        onClose={() => setShowSaveMetadataConfirm(false)}
        title="Save Changes"
        description="Are you sure you want to save the updated test title and description?"
        primaryAction={{
          label: "Save Changes",
          onClick: () => {
            setShowSaveMetadataConfirm(false);
            handleSaveMetadata();
          }
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowSaveMetadataConfirm(false)
        }}
      />
    </section>
  );
}

function RetestEditor({
  assessment,
  TEST_FIELDS,
  onApprove,
  onDelete,
  onRegenerate
}: {
  assessment: any,
  TEST_FIELDS: any[],
  onApprove: (updatedQuestions: any, newTitle: string, newDescription: string) => Promise<void>,
  onDelete: () => Promise<void>,
  onRegenerate: () => Promise<void>
}) {
  const [editedQuestions, setEditedQuestions] = useState(assessment.questions || {});
  const [editedTitle, setEditedTitle] = useState(assessment.title || "");
  const [editedDescription, setEditedDescription] = useState(assessment.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const hasFailed = assessment.description === "Generation failed.";

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
    await onApprove(editedQuestions, editedTitle, editedDescription);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerate();
    setIsRegenerating(false);
  };

  return (
    <div className="flex flex-1 flex-col border border-[#EDEDED] bg-[#F9F9F9] relative overflow-hidden">
      {assessment.isGenerating && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <SparklesIcon className="h-12 w-12 text-[#29A177] animate-pulse mb-4" />
          <h3 className="text-lg font-bold text-zinc-700">Generating Retest Questions...</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm text-center">
            Our AI is analyzing the student's history to create a targeted retest. This runs in the background and is safe to leave. You can refresh the page later to see if it's done.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="bg-[#ECECEC] px-6 py-4 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Retest Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting || isSaving}
              className="flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            {hasFailed ? (
              <button
                onClick={handleRegenerate}
                disabled={isDeleting || isRegenerating}
                className="flex items-center gap-2 rounded bg-blue-600 px-4 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <SparklesIcon className="h-4 w-4" />
                {isRegenerating ? "Regenerating..." : "Regenerate Retest"}
              </button>
            ) : (
              <button
                onClick={() => setShowSaveConfirm(true)}
                disabled={isSaving || isDeleting}
                className="flex items-center gap-2 rounded bg-[#29A177] px-4 py-1 text-xs font-semibold text-white transition hover:bg-[#20825f] disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
                {isSaving ? "Approving..." : "Save & Approve Retest"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col p-6 h-full space-y-6">
          {hasFailed ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-500">
              <SparklesIcon className="h-12 w-12 text-zinc-300 mb-4" />
              <h3 className="text-xl font-bold text-zinc-700">Generation Failed</h3>
              <p className="mt-2 text-sm max-w-sm">
                We encountered an issue while generating the questions for this retest. Please try regenerating it.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 mb-4">
                <label className="block">
                  <span className="text-sm font-bold text-zinc-600">Retest Title</span>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm text-zinc-700 font-bold"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-zinc-600">Description / Rationale</span>
                  <textarea
                    className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm text-zinc-700"
                    rows={2}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                </label>
              </div>

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
            </>
          )}
        </div>
      </div>

      <AlertModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Retest"
        description="Are you sure you want to delete this targeted retest? This action cannot be undone."
        primaryAction={{
          label: "Delete",
          variant: "danger",
          onClick: () => {
            setShowDeleteConfirm(false);
            handleDelete();
          }
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowDeleteConfirm(false)
        }}
      />

      <AlertModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        title="Approve Retest"
        description="Are you sure you want to save and approve these retest questions? Once approved, the student will be able to take this test."
        primaryAction={{
          label: "Approve",
          onClick: () => {
            setShowSaveConfirm(false);
            handleSave();
          }
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowSaveConfirm(false)
        }}
      />
    </div>
  );
}