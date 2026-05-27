"use client";

import { useState, useEffect } from "react";
import { SparklesIcon, CheckCircleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useSearchParams, useRouter } from "next/navigation";
import type { UnifiedAssessment } from "@/hooks/use-test";
import { createLearningPathAPI, type LearningModuleResponse } from "@/hooks/use-learning-path";
import { toast } from "sonner";
import AlertModal from "@/components/shared/AlertModal";

// removed global generatingTests set

type Props = {
  student: { id: string; name: string };
  classroom: { id: string; name: string; student_count: number; variant: string };
  classId: string;
  studentId: string;
  screening: any;
  assessments?: UnifiedAssessment[];
};

export default function LearningPath({ student, classId, studentId, assessments = [] }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentIdFromUrl = searchParams.get("assessmentId");

  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(() => {
    if (assessmentIdFromUrl && assessments.some(a => a.id === assessmentIdFromUrl)) {
      return assessmentIdFromUrl;
    }
    return assessments.length > 0 ? assessments[0].id : null;
  });

  // Also update if URL changes after mount
  useEffect(() => {
    if (assessmentIdFromUrl && assessments.some(a => a.id === assessmentIdFromUrl)) {
      setActiveAssessmentId(assessmentIdFromUrl);
    }
  }, [assessmentIdFromUrl, assessments]);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Local state for the module to support instant UI updates and editing
  const [localModules, setLocalModules] = useState<Record<string, LearningModuleResponse | null>>({});

  const studentName = student?.name ?? "Student";
  const activeAssessment = assessments.find((a) => a.id === activeAssessmentId);
  const results = activeAssessment?.results || {};

  const TEST_FIELDS = [
    { key: "dot_matching", label: "Dot Matching" },
    { key: "number_comparison", label: "Number Comparison" },
    { key: "number_series", label: "Number Series" },
    { key: "single_addition", label: "Single Digit Addition" },
    { key: "single_subtraction", label: "Single Digit Subtraction" },
    { key: "complex_arithmetic", label: "Multi-Digit Addition and Subtraction" },
  ];



  // Fetch the module either from our local state (if just generated/edited) or from the DB props
  const dbModules = Array.isArray(results.learning_modules)
    ? results.learning_modules[0]?.modules
    : results.learning_modules?.modules;

  const isGeneratingDb = Array.isArray(results.learning_modules)
    ? results.learning_modules[0]?.is_generating
    : results.learning_modules?.is_generating;

  const currentModule = activeAssessmentId && localModules[activeAssessmentId] !== undefined
    ? localModules[activeAssessmentId]
    : dbModules as LearningModuleResponse | null;

  // We can only generate a learning path if there's an existing classification/diagnostic path
  const hasClassificationData = Array.isArray(results.learning_modules)
    ? !!results.learning_modules[0]?.paths
    : !!results.learning_modules?.paths;

  const handleGenerate = async () => {
    if (!activeAssessment || !activeAssessment.testResultId) return;

    const learningPathAPI = createLearningPathAPI();

    const res = await learningPathAPI.generateLearningPath(activeAssessment.testResultId);

    if (!res.success) {
      toast.error("Failed to generate learning path. " + res.error);
    } else {
      if (res.data) {
        toast.success("Learning Path generated successfully!");
        setLocalModules(prev => ({ ...prev, [activeAssessment.id]: res.data! }));
      } else {
        toast.success("Learning Path generation started in the background! Please check back later.");
        window.location.reload();
      }
    }
  };

  const handleSaveEdits = async () => {
    if (!activeAssessment || !activeAssessment.testResultId || !currentModule) return;

    setIsSaving(true);
    const learningPathAPI = createLearningPathAPI();

    const res = await learningPathAPI.updateLearningPath(activeAssessment.testResultId, currentModule);

    if (!res.success) {
      toast.error("Failed to save learning path. " + res.error);
    } else {
      toast.success("Learning Path updated successfully!");
      setIsEditing(false);
    }

    setIsSaving(false);
  };

  const handleModuleEdit = (field: keyof LearningModuleResponse, value: any) => {
    if (!currentModule || !activeAssessmentId) return;
    setLocalModules(prev => ({
      ...prev,
      [activeAssessmentId]: {
        ...currentModule,
        [field]: value
      }
    }));
  };

  return (
    <section className="flex min-h-full w-full flex-col bg-[#F7F7F7] px-8 py-4">
      {/* Header */}
      <div className="shrink-0 border-t border-l border-r border-[#E7E7E7] bg-white px-8 py-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#29A177]">
            Personalized Learning Path
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-none text-[#5C5E64]">
            {studentName}&apos;s Plan
          </h1>
        </div>
      </div>

      <div className="flex w-full flex-1 gap-4 border border-[#E7E7E7] bg-white p-6 overflow-hidden">
        {/* COLUMN 1: All Assessments */}
        <div className="flex w-1/4 min-w-[250px] flex-col border border-[#EDEDED] bg-[#F9F9F9] overflow-y-auto">
          <div className="bg-[#ECECEC] px-6 py-4 flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Assessments</h2>
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
                      setIsEditing(false);
                      router.replace(window.location.pathname, { scroll: false });
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

        {/* COLUMN 2: Module Content */}
        <div className="flex flex-1 flex-col border border-[#EDEDED] bg-[#F9F9F9] overflow-y-auto">
          <div className="bg-[#ECECEC] px-6 py-4 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">Generated Module</h2>
            {currentModule && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded bg-zinc-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-zinc-700"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit Plan
              </button>
            )}
            {currentModule && isEditing && (
              <button
                onClick={() => setShowSaveConfirm(true)}
                disabled={isSaving}
                className="flex items-center gap-2 rounded bg-[#29A177] px-4 py-1 text-xs font-semibold text-white transition hover:bg-[#20825f] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Edits"}
              </button>
            )}
          </div>

          <div className="flex flex-col p-6 h-full relative">
            {isGeneratingDb && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#F9F9F9]/90 backdrop-blur-sm">
                <SparklesIcon className="h-12 w-12 text-[#29A177] animate-pulse mb-4" />
                <h3 className="text-lg font-bold text-zinc-700">Generating Learning Path...</h3>
                <p className="text-sm text-zinc-500 mt-2 max-w-sm text-center">
                  Our AI is analyzing the classification report to create a personalized learning module. This runs in the background and is safe to leave. You can refresh the page later to see if it's done.
                </p>
              </div>
            )}

            {!activeAssessment ? (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Select a test to view the learning path.
              </div>
            ) : !currentModule && !isGeneratingDb ? (
              <div className="flex h-full flex-col items-center justify-center text-center gap-4">
                <p className="text-zinc-500">No learning path generated for this assessment yet.</p>
                {hasClassificationData ? (
                  <button
                    onClick={handleGenerate}
                    disabled={isGeneratingDb}
                    className="flex items-center justify-center gap-2 rounded-md bg-[#29A177] px-6 py-3 font-bold text-white transition hover:bg-[#20825f] disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isGeneratingDb ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Module...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        Generate Learning Path
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded border border-amber-200">
                    You must generate a Classification Report first before creating a learning path.
                  </p>
                )}
              </div>
            ) : currentModule ? (
              <div className="flex flex-col gap-6 pb-10">
                {/* Overall Summary & Status */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-zinc-700">Module Overview</h3>
                    <span className="rounded-full bg-[#ECF9F4] px-3 py-1 text-xs font-bold text-[#29A177] border border-[#29A177]/20">
                      Status: {currentModule.status}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-bold text-zinc-600">Overall Summary</span>
                        <textarea
                          className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm text-zinc-700"
                          rows={3}
                          value={currentModule.overall_summary}
                          onChange={(e) => handleModuleEdit("overall_summary", e.target.value)}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-bold text-zinc-600">Decision Path Rationale</span>
                        <textarea
                          className="mt-1 w-full rounded-md border border-zinc-300 p-2 text-sm text-zinc-700"
                          rows={2}
                          value={currentModule.decision_path_rationale}
                          onChange={(e) => handleModuleEdit("decision_path_rationale", e.target.value)}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm text-zinc-600">
                      <p><strong className="text-zinc-700">Summary:</strong> {currentModule.overall_summary}</p>
                      <p><strong className="text-zinc-700">Rationale:</strong> {currentModule.decision_path_rationale}</p>
                    </div>
                  )}
                </div>

                {/* Diagnostic Modules List */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-zinc-700 border-b border-zinc-200 pb-2">Targeted Domains (Top 3)</h3>

                  {currentModule.diagnostic_modules?.map((mod, index) => (
                    <div key={index} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <h4 className="text-md font-bold text-[#29A177] mb-2">{mod.domain_name}</h4>

                      <div className="space-y-4 text-sm mt-4">
                        <div className="bg-zinc-50 p-3 rounded-md border border-zinc-100">
                          <p className="font-bold text-zinc-700 mb-1">Clinical Explanation</p>
                          <p className="text-zinc-600">{mod.clinical_explanation}</p>
                        </div>

                        <div>
                          <p className="font-bold text-zinc-700 mb-1">Learning Objectives</p>
                          <ul className="list-disc pl-5 text-zinc-600">
                            {mod.learning_objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                          </ul>
                        </div>

                        <div>
                          <p className="font-bold text-zinc-700 mb-1">Teaching Strategy</p>
                          <p className="text-zinc-600">{mod.teaching_strategy}</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                          <p className="font-bold text-blue-900 mb-2">Worked Example</p>
                          <p className="font-medium text-blue-800 mb-2">Problem: {mod.worked_example.problem}</p>
                          <ol className="list-decimal pl-5 text-blue-800/80 space-y-1 mb-2">
                            {mod.worked_example.reasoning_steps.map((step, i) => <li key={i}>{step}</li>)}
                          </ol>
                          <p className="font-bold text-blue-900">Answer: {mod.worked_example.final_answer}</p>
                        </div>

                        <div>
                          <p className="font-bold text-zinc-700 mb-2">Practice Set</p>
                          <div className="space-y-2">
                            {mod.practice_set.map((practice, pIndex) => (
                              <div key={pIndex} className="flex flex-col gap-1 rounded border border-zinc-200 p-3 bg-white">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-zinc-700">{practice.problem}</span>
                                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Ans: {practice.expected_answer}</span>
                                </div>
                                <span className="text-xs text-zinc-500 italic">Hint: {practice.hint}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Formative Assessment */}
                {currentModule.formative_assessment && currentModule.formative_assessment.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm mt-4">
                    <h3 className="text-md font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      Formative Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentModule.formative_assessment.map((fa, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-amber-100 shadow-sm flex justify-between items-center">
                          <span className="text-sm font-medium text-zinc-700">{fa.question}</span>
                          <span className="text-sm font-bold text-amber-700">{fa.expected_answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        title="Save Learning Path"
        description="Are you sure you want to save these changes to the personalized learning path?"
        primaryAction={{
          label: "Save Edits",
          onClick: () => {
            setShowSaveConfirm(false);
            handleSaveEdits();
          }
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowSaveConfirm(false)
        }}
      />
    </section>
  );
}