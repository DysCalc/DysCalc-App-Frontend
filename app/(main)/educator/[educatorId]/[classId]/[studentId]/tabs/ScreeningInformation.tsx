"use client";

import { useState } from "react";
import { ArrowDownTrayIcon, DocumentPlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
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
  assessments = [],
  onGenerateLearningPath,
}: Props) {
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(
    assessments.length > 0 ? assessments[0].id : null
  );

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
          <div className="bg-[#ECECEC] px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Tests Taken</h2>
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
                    const questionObj = selectedFieldModal.questionsList[index];
                    const questionText = questionObj?.question || questionObj?.prompt || `Item ${index + 1}`;
                    const correctAnswer = questionObj?.correct || questionObj?.correctAnswer || questionObj?.expected_answer;
                    
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